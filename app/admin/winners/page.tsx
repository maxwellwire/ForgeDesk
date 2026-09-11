"use client";

import { useEffect, useState } from "react";

type Campaign = {
  id: string;
  title: string;
  status: string;
  winnerCount: number;
  rewardDescription: string;
  project: { name: string };
  _count: { winners: number; submissions: number };
};

type ApprovedRow = {
  id: string;
  userId: string;
  user: { id: string; username: string; email: string };
  campaign: { id: string; title: string };
  task: { title: string };
  proofUrl: string | null;
  proofText: string | null;
};

type Winner = {
  id: string;
  status: string;
  rewardDescription: string;
  adminNotes: string | null;
  selectedAt: string;
  user: { id: string; username: string; email: string };
  campaign: { id: string; title: string };
  reward: {
    id: string;
    status: string;
    paymentMethod: string | null;
    paymentRef: string | null;
    transactionHash: string | null;
    adminNotes: string | null;
    paidAt: string | null;
  } | null;
};

export default function AdminWinnersPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [approved, setApproved] = useState<ApprovedRow[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const [selectUserId, setSelectUserId] = useState("");
  const [selectReward, setSelectReward] = useState("");
  const [selectNotes, setSelectNotes] = useState("");

  const [rewardDraft, setRewardDraft] = useState<
    Record<
      string,
      {
        status: string;
        paymentMethod: string;
        paymentRef: string;
        transactionHash: string;
        adminNotes: string;
      }
    >
  >({});

  function loadCampaigns() {
    return fetch("/api/admin/campaigns")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setCampaigns(json.data);
          if (!campaignId && json.data[0]) {
            setCampaignId(json.data[0].id);
          }
        }
      });
  }

  function loadWinners(cid?: string) {
    const q = cid ? `?campaignId=${cid}` : "";
    return fetch(`/api/admin/winners/list${q}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setWinners(json.data);
          const drafts: typeof rewardDraft = {};
          for (const w of json.data as Winner[]) {
            drafts[w.id] = {
              status: w.reward?.status || "PENDING",
              paymentMethod: w.reward?.paymentMethod || "",
              paymentRef: w.reward?.paymentRef || "",
              transactionHash: w.reward?.transactionHash || "",
              adminNotes: w.reward?.adminNotes || "",
            };
          }
          setRewardDraft(drafts);
        }
      });
  }

  function loadApproved(cid: string) {
    if (!cid) {
      setApproved([]);
      return Promise.resolve();
    }
    return fetch(`/api/admin/submissions?status=APPROVED&campaignId=${cid}&limit=200`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const byUser = new Map<string, ApprovedRow>();
          for (const s of json.data as ApprovedRow[]) {
            if (!byUser.has(s.user.id)) {
              byUser.set(s.user.id, { ...s, userId: s.user.id });
            }
          }
          setApproved(Array.from(byUser.values()));
        }
      });
  }

  useEffect(() => {
    setLoading(true);
    loadCampaigns().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!campaignId) return;
    const c = campaigns.find((x) => x.id === campaignId);
    if (c) setSelectReward(c.rewardDescription || "");
    setLoading(true);
    Promise.all([loadWinners(campaignId), loadApproved(campaignId)]).finally(() =>
      setLoading(false)
    );
  }, [campaignId, campaigns.length]);

  async function handleSelectWinner(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!selectUserId || !campaignId) {
      setMsg("Pick a campaign and an approved participant.");
      return;
    }
    setActing("select");
    const res = await fetch("/api/admin/winners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId,
        userId: selectUserId,
        rewardDescription: selectReward || "Reward",
        adminNotes: selectNotes || undefined,
      }),
    });
    const json = await res.json();
    setActing(null);
    if (!json.success) {
      setMsg(json.error?.message || json.error?.code || "Failed to select winner");
      return;
    }
    setMsg("Winner selected.");
    setSelectUserId("");
    setSelectNotes("");
    await Promise.all([loadWinners(campaignId), loadCampaigns()]);
  }

  async function handleAnnounce(winnerIds: string[]) {
    if (winnerIds.length === 0) return;
    setActing("announce");
    setMsg(null);
    const res = await fetch("/api/admin/winners/announce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerIds }),
    });
    const json = await res.json();
    setActing(null);
    if (!json.success) {
      setMsg(json.error?.code || "Announce failed");
      return;
    }
    setMsg(`Announced ${json.data.announcedCount} winner(s).`);
    await loadWinners(campaignId);
  }

  async function handleRewardUpdate(winnerId: string) {
    const draft = rewardDraft[winnerId];
    if (!draft) return;
    setActing(winnerId);
    setMsg(null);
    const res = await fetch(`/api/admin/rewards/${winnerId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: draft.status,
        paymentMethod: draft.paymentMethod || undefined,
        paymentRef: draft.paymentRef || undefined,
        transactionHash: draft.transactionHash || undefined,
        adminNotes: draft.adminNotes || undefined,
      }),
    });
    const json = await res.json();
    setActing(null);
    if (!json.success) {
      setMsg(json.error?.code || "Reward update failed");
      return;
    }
    setMsg("Reward updated.");
    await loadWinners(campaignId);
  }

  const winnerUserIds = new Set(winners.map((w) => w.user.id));
  const candidates = approved.filter((a) => !winnerUserIds.has(a.user.id));
  const selectedToAnnounce = winners.filter((w) => w.status === "SELECTED").map((w) => w.id);
  const selectedCampaign = campaigns.find((c) => c.id === campaignId);

  return (
    <div>
      <h1 style={heading}>Winners & rewards</h1>
      <p style={{ color: "#9A9A93", fontSize: 14, marginBottom: 20 }}>
        Select winners from approved submissions, announce them, and track payouts.
      </p>

      <label style={labelStyle}>
        Campaign
        <select
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          style={inputStyle}
        >
          {campaigns.length === 0 && <option value="">No campaigns</option>}
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.project.name} — {c.title} ({c.status}) · {c._count.winners}/{c.winnerCount} winners
            </option>
          ))}
        </select>
      </label>

      {msg && (
        <p style={{ color: "#C8FF4D", fontSize: 13, margin: "12px 0" }}>{msg}</p>
      )}

      {loading && <p style={{ color: "#9A9A93" }}>Loading…</p>}

      {!loading && campaignId && (
        <>
          <section style={{ ...card, marginTop: 20 }}>
            <h2 style={subheading}>Select a winner</h2>
            <p style={{ color: "#9A9A93", fontSize: 13, margin: "0 0 12px" }}>
              Only users with at least one APPROVED submission for this campaign can be selected.
              {selectedCampaign
                ? ` Target: ${selectedCampaign.winnerCount} winner(s). Currently: ${selectedCampaign._count.winners}.`
                : ""}
            </p>
            {candidates.length === 0 ? (
              <p style={{ color: "#9A9A93", fontSize: 13, margin: 0 }}>
                No eligible approved participants left (or none yet).
              </p>
            ) : (
              <form onSubmit={handleSelectWinner} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={labelStyle}>
                  Participant
                  <select
                    value={selectUserId}
                    onChange={(e) => setSelectUserId(e.target.value)}
                    style={inputStyle}
                    required
                  >
                    <option value="">Choose…</option>
                    {candidates.map((c) => (
                      <option key={c.user.id} value={c.user.id}>
                        {c.user.username} ({c.user.email}) — {c.task.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={labelStyle}>
                  Reward description
                  <input
                    value={selectReward}
                    onChange={(e) => setSelectReward(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </label>
                <label style={labelStyle}>
                  Admin notes (optional)
                  <input
                    value={selectNotes}
                    onChange={(e) => setSelectNotes(e.target.value)}
                    style={inputStyle}
                  />
                </label>
                <button type="submit" disabled={acting === "select"} style={primaryBtn}>
                  {acting === "select" ? "Selecting…" : "Select winner"}
                </button>
              </form>
            )}
          </section>

          {selectedToAnnounce.length > 0 && (
            <section style={{ ...card, marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ ...subheading, margin: 0 }}>Announce</h2>
                  <p style={{ color: "#9A9A93", fontSize: 13, margin: "6px 0 0" }}>
                    {selectedToAnnounce.length} winner(s) in SELECTED status.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={acting === "announce"}
                  onClick={() => handleAnnounce(selectedToAnnounce)}
                  style={primaryBtn}
                >
                  {acting === "announce" ? "Announcing…" : "Announce all SELECTED"}
                </button>
              </div>
            </section>
          )}

          <section style={{ marginTop: 24 }}>
            <h2 style={subheading}>Winners</h2>
            {winners.length === 0 && (
              <p style={{ color: "#9A9A93", fontSize: 13 }}>No winners for this campaign yet.</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {winners.map((w) => (
                <div key={w.id} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <p style={{ color: "#F5F5F0", fontWeight: 600, margin: "0 0 4px" }}>
                        {w.user.username}{" "}
                        <span style={{ color: "#6B6B66", fontWeight: 400, fontSize: 12 }}>
                          {w.user.email}
                        </span>
                      </p>
                      <p style={{ color: "#9A9A93", fontSize: 12, margin: 0 }}>
                        {w.rewardDescription} · selected {new Date(w.selectedAt).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={badge(w.status)}>{w.status}</span>
                      {w.reward && <span style={badge(w.reward.status)}>reward: {w.reward.status}</span>}
                    </div>
                  </div>

                  {w.status === "SELECTED" && (
                    <button
                      type="button"
                      style={{ ...secondaryBtn, marginTop: 10, alignSelf: "flex-start" }}
                      disabled={acting === "announce"}
                      onClick={() => handleAnnounce([w.id])}
                    >
                      Announce this winner
                    </button>
                  )}

                  {w.reward && rewardDraft[w.id] && (
                    <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14 }}>
                      <p style={{ color: "#F5F5F0", fontSize: 13, fontWeight: 600, margin: "0 0 10px" }}>
                        Reward tracking
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                        <label style={labelStyle}>
                          Status
                          <select
                            value={rewardDraft[w.id].status}
                            onChange={(e) =>
                              setRewardDraft((prev) => ({
                                ...prev,
                                [w.id]: { ...prev[w.id], status: e.target.value },
                              }))
                            }
                            style={inputStyle}
                          >
                            {["PENDING", "CONTACTED", "PAID", "FAILED", "CANCELLED"].map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label style={labelStyle}>
                          Payment method
                          <input
                            value={rewardDraft[w.id].paymentMethod}
                            onChange={(e) =>
                              setRewardDraft((prev) => ({
                                ...prev,
                                [w.id]: { ...prev[w.id], paymentMethod: e.target.value },
                              }))
                            }
                            style={inputStyle}
                            placeholder="USDC / bank / …"
                          />
                        </label>
                        <label style={labelStyle}>
                          Payment ref
                          <input
                            value={rewardDraft[w.id].paymentRef}
                            onChange={(e) =>
                              setRewardDraft((prev) => ({
                                ...prev,
                                [w.id]: { ...prev[w.id], paymentRef: e.target.value },
                              }))
                            }
                            style={inputStyle}
                          />
                        </label>
                        <label style={labelStyle}>
                          Tx hash
                          <input
                            value={rewardDraft[w.id].transactionHash}
                            onChange={(e) =>
                              setRewardDraft((prev) => ({
                                ...prev,
                                [w.id]: { ...prev[w.id], transactionHash: e.target.value },
                              }))
                            }
                            style={inputStyle}
                          />
                        </label>
                      </div>
                      <label style={{ ...labelStyle, marginTop: 10 }}>
                        Notes
                        <input
                          value={rewardDraft[w.id].adminNotes}
                          onChange={(e) =>
                            setRewardDraft((prev) => ({
                              ...prev,
                              [w.id]: { ...prev[w.id], adminNotes: e.target.value },
                            }))
                          }
                          style={inputStyle}
                        />
                      </label>
                      <button
                        type="button"
                        disabled={acting === w.id}
                        onClick={() => handleRewardUpdate(w.id)}
                        style={{ ...primaryBtn, marginTop: 12 }}
                      >
                        {acting === w.id ? "Saving…" : "Save reward"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function badge(status: string): React.CSSProperties {
  const color =
    status === "PAID" || status === "REWARDED" || status === "ANNOUNCED"
      ? "#C8FF4D"
      : status === "FAILED" || status === "CANCELLED" || status === "DISQUALIFIED"
        ? "#ff6b6b"
        : "#9A9A93";
  return {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    color,
    border: `1px solid ${color}55`,
    borderRadius: 20,
    padding: "3px 10px",
    height: "fit-content",
  };
}

const heading: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  fontSize: 24,
  color: "#F5F5F0",
  margin: "0 0 8px",
};

const subheading: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  fontSize: 17,
  color: "#F5F5F0",
  margin: "0 0 8px",
};

const card: React.CSSProperties = {
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: 18,
  display: "flex",
  flexDirection: "column",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  color: "#9A9A93",
  fontSize: 12,
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  background: "#0D0D0D",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 7,
  color: "#F5F5F0",
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
  outline: "none",
};

const primaryBtn: React.CSSProperties = {
  padding: "10px 16px",
  background: "#C8FF4D",
  color: "#0D0D0D",
  border: "none",
  borderRadius: 7,
  fontWeight: 600,
  fontSize: 13.5,
  cursor: "pointer",
  alignSelf: "flex-start",
};

const secondaryBtn: React.CSSProperties = {
  padding: "8px 14px",
  background: "#161616",
  color: "#F5F5F0",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 7,
  fontWeight: 600,
  fontSize: 12.5,
  cursor: "pointer",
};