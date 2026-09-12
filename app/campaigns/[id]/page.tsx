"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Task = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  type?: string;
  required?: boolean;
};
type Campaign = {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  rewardDescription: string;
  startAt: string;
  endAt: string;
  winnerCount?: number;
  project: { name: string; website?: string | null; twitter?: string | null };
  tasks: Task[];
  _count: { participations: number };
  isParticipating: boolean;
};
type Me = { id: string; emailVerified: boolean } | null;

function formatParticipants(n: number) {
  return n === 1 ? "1 participant" : `${n} participants`;
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [me, setMe] = useState<Me>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [proofText, setProofText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<Record<string, string>>({});
  const [myTaskStatus, setMyTaskStatus] = useState<Record<string, string>>({});

  function loadMySubmissions(campaignId?: string) {
    fetch("/api/my-submissions")
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) return;
        const map: Record<string, string> = {};
        for (const s of json.data as {
          status: string;
          taskId?: string;
          campaignId?: string;
          campaign?: { id: string };
          task?: { id: string };
        }[]) {
          const tid = s.taskId || s.task?.id;
          if (!tid) continue;
          if (campaignId) {
            const cid = s.campaignId || s.campaign?.id;
            if (cid && cid !== campaignId) continue;
          }
          map[tid] = s.status;
        }
        setMyTaskStatus(map);
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadCampaign();
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setMe(json.data);
      });
  }, [id]);

  function loadCampaign() {
    fetch(`/api/campaigns/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setCampaign(json.data);
          loadMySubmissions(json.data.id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  async function handleParticipate() {
    if (!campaign) return;
    setActionMsg(null);
    const res = await fetch(`/api/participations/${campaign.id}`, { method: "POST" });
    const json = await res.json();

    if (!json.success) {
      setActionMsg(json.error?.message || `Error: ${json.error?.code}`);
      return;
    }

    setCampaign((prev) => (prev ? { ...prev, isParticipating: true } : prev));
    setActionMsg("You're in. Complete each task below and submit proof.");
  }

  async function handleSubmitProof(taskId: string) {
    if (!campaign) return;
    if (!proofUrl && !proofText) {
      setSubmitMsg((prev) => ({
        ...prev,
        [taskId]: "Add a link or a short description of your proof.",
      }));
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: campaign.id,
        taskId,
        proofUrl: proofUrl || undefined,
        proofText: proofText || undefined,
      }),
    });
    const json = await res.json();
    setSubmitting(false);

    if (!json.success) {
      setSubmitMsg((prev) => ({
        ...prev,
        [taskId]: json.error?.message || `Error: ${json.error?.code}`,
      }));
      return;
    }

    setSubmitMsg((prev) => ({ ...prev, [taskId]: "Submitted — pending review." }));
    setMyTaskStatus((prev) => ({ ...prev, [taskId]: "PENDING" }));
    setOpenTaskId(null);
    setProofUrl("");
    setProofText("");
    loadMySubmissions(campaign.id);
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#9A9A93" }}>Loading campaign…</p>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#F5F5F0", marginBottom: 12 }}>Campaign not found.</p>
        <a href="/campaigns" style={{ color: "#C8FF4D", fontSize: 14 }}>
          ← Back to campaigns
        </a>
      </main>
    );
  }

  let cta: React.ReactNode;
  if (!me) {
    cta = (
      <a href={`/login?next=/campaigns/${campaign.slug || campaign.id}`} style={buttonStyle}>
        Log in to participate
      </a>
    );
  } else if (!me.emailVerified) {
    cta = (
      <a
        href="/dashboard"
        style={{
          ...buttonStyle,
          background: "#161616",
          color: "#F5F5F0",
          border: "1px solid rgba(255,107,107,0.35)",
        }}
      >
        Verify your email to participate
      </a>
    );
  } else if (campaign.isParticipating) {
    cta = (
      <span
        style={{
          ...buttonStyle,
          background: "#161616",
          color: "#C8FF4D",
          border: "1px solid rgba(200,255,77,0.3)",
        }}
      >
        Participating
      </span>
    );
  } else if (campaign.status !== "LIVE") {
    cta = (
      <span
        style={{
          ...buttonStyle,
          background: "#161616",
          color: "#9A9A93",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        Not open for new participants
      </span>
    );
  } else {
    cta = (
      <button onClick={handleParticipate} style={{ ...buttonStyle, border: "none", cursor: "pointer" }}>
        Participate
      </button>
    );
  }

  function canResubmit(status: string | undefined) {
    // Locked after submit / approve. Only these allow another try.
    if (!status) return true;
    return status === "MORE_PROOF_REQUIRED" || status === "REJECTED";
  }

  const canSubmit = !!(
    me &&
    me.emailVerified &&
    campaign.isParticipating &&
    campaign.status === "LIVE"
  );

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <a href="/campaigns" style={{ color: "#9A9A93", fontSize: 13, textDecoration: "none" }}>
          ← Campaigns
        </a>

        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: "#9A9A93",
            margin: "16px 0 8px",
          }}
        >
          {campaign.project.name}
          {campaign.status ? ` · ${campaign.status.replace(/_/g, " ")}` : ""}
        </p>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 28,
            color: "#F5F5F0",
            margin: "0 0 12px",
          }}
        >
          {campaign.title}
        </h1>
        <p style={{ color: "#9A9A93", fontSize: 15, lineHeight: 1.65, marginBottom: 20 }}>
          {campaign.description}
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: "#9A9A93",
            marginBottom: 20,
          }}
        >
          <span>{formatParticipants(campaign._count.participations)}</span>
          <span style={{ color: "#C8FF4D" }}>{campaign.rewardDescription}</span>
          {campaign.winnerCount ? (
            <span>
              {campaign.winnerCount} winner slot{campaign.winnerCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        <div
          style={{
            background: "#161616",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: 14,
            marginBottom: 24,
            fontSize: 13,
            color: "#9A9A93",
            lineHeight: 1.6,
          }}
        >
          <p style={{ margin: "0 0 6px", color: "#F5F5F0", fontWeight: 600, fontSize: 13 }}>
            Schedule
          </p>
          <p style={{ margin: 0 }}>
            Starts {formatDateTime(campaign.startAt)}
            <br />
            Ends {formatDateTime(campaign.endAt)}
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>{cta}</div>
        {actionMsg && (
          <p style={{ color: "#C8FF4D", fontSize: 13.5, marginBottom: 20 }}>{actionMsg}</p>
        )}

        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 18,
            color: "#F5F5F0",
            margin: "0 0 14px",
          }}
        >
          Tasks
        </h2>

        {campaign.tasks.length === 0 && (
          <p style={{ color: "#9A9A93", fontSize: 13.5 }}>
            Tasks will appear here once the campaign is fully set up.
          </p>
        )}

        {campaign.tasks.map((task, index) => (
          <div
            key={task.id}
            style={{
              background: "#161616",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: "#6B6B66",
                margin: "0 0 6px",
              }}
            >
              Task {String(index + 1).padStart(2, "0")}
              {task.type ? ` · ${task.type}` : ""}
            </p>
            <h3 style={{ color: "#F5F5F0", fontSize: 15, margin: "0 0 8px", fontWeight: 600 }}>
              {task.title}
            </h3>
            {task.description && task.description !== task.title && (
              <p style={{ color: "#9A9A93", fontSize: 13, margin: "0 0 8px", lineHeight: 1.5 }}>
                {task.description}
              </p>
            )}
            <p style={{ color: "#C8C8C0", fontSize: 13.5, margin: "0 0 12px", lineHeight: 1.55 }}>
              {task.instructions}
            </p>

            {myTaskStatus[task.id] && (
              <p style={{ color: "#C8FF4D", fontSize: 12.5, margin: "0 0 8px" }}>
                Status: {myTaskStatus[task.id].replace(/_/g, " ").toLowerCase()}
                {myTaskStatus[task.id] === "MORE_PROOF_REQUIRED"
                  ? " — you can submit again."
                  : myTaskStatus[task.id] === "REJECTED"
                    ? " — you can submit again."
                    : myTaskStatus[task.id] === "APPROVED"
                      ? " — approved. You cannot submit again."
                      : " — already submitted. Wait for review."}
              </p>
            )}

            {canSubmit && openTaskId !== task.id && canResubmit(myTaskStatus[task.id]) && (
              <button
                onClick={() => setOpenTaskId(task.id)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(200,255,77,0.35)",
                  color: "#C8FF4D",
                  borderRadius: 6,
                  padding: "7px 12px",
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                {myTaskStatus[task.id] ? "Submit again" : "Submit proof"}
              </button>
            )}

            {canSubmit && openTaskId === task.id && canResubmit(myTaskStatus[task.id]) && (
              <div style={{ marginTop: 10 }}>
                <input
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="Link to your post or proof (optional)"
                  style={miniInputStyle}
                />
                <textarea
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Describe your proof"
                  rows={3}
                  style={{ ...miniInputStyle, resize: "vertical", marginTop: 8 }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => handleSubmitProof(task.id)}
                    disabled={submitting}
                    style={{
                      background: "#C8FF4D",
                      color: "#0D0D0D",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 14px",
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {submitting ? "Submitting…" : "Submit"}
                  </button>
                  <button
                    onClick={() => setOpenTaskId(null)}
                    style={{
                      background: "transparent",
                      color: "#9A9A93",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 6,
                      padding: "8px 14px",
                      fontSize: 12.5,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {submitMsg[task.id] && (
              <p style={{ color: "#C8FF4D", fontSize: 12.5, marginTop: 8 }}>{submitMsg[task.id]}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "calc(100vh - 60px)",
  background: "#0D0D0D",
  padding: "28px 20px 48px",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 18px",
  background: "#C8FF4D",
  color: "#0D0D0D",
  borderRadius: 7,
  fontWeight: 600,
  fontSize: 14,
  textDecoration: "none",
};

const miniInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  background: "#0D0D0D",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6,
  color: "#F5F5F0",
  fontSize: 13,
  fontFamily: "Inter, sans-serif",
  outline: "none",
  boxSizing: "border-box",
};