"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Task = { id: string; title: string; description: string; instructions: string };
type Campaign = {
  id: string;
  title: string;
  description: string;
  status: string;
  rewardDescription: string;
  project: { name: string };
  tasks: Task[];
  _count: { participations: number };
  isParticipating: boolean;
};
type Me = { id: string; emailVerified: boolean } | null;

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

  useEffect(() => {
    loadCampaign();
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setMe(json.data);
      });
    fetch("/api/my-submissions")
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) return;
        const map: Record<string, string> = {};
        for (const s of json.data as {
          status: string;
          taskId?: string;
          campaign?: { id: string };
          task?: { id: string };
        }[]) {
          if (s.campaign?.id === id) {
            const tid = s.taskId || s.task?.id;
            if (tid) map[tid] = s.status;
          }
        }
        setMyTaskStatus(map);
      });
  }, [id]);

  function loadCampaign() {
    fetch(`/api/campaigns/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCampaign(json.data);
        setLoading(false);
      });
  }

  async function handleParticipate() {
    setActionMsg(null);
    const res = await fetch(`/api/participations/${id}`, { method: "POST" });
    const json = await res.json();

    if (!json.success) {
      setActionMsg(json.error?.message || `Error: ${json.error?.code}`);
      return;
    }

    setCampaign((prev) => (prev ? { ...prev, isParticipating: true } : prev));
    setActionMsg("You're in! You can now submit proof for each task below.");
  }

  async function handleSubmitProof(taskId: string) {
    if (!proofUrl && !proofText) {
      setSubmitMsg((prev) => ({ ...prev, [taskId]: "Add a URL or a short description of your proof." }));
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: id,
        taskId,
        proofUrl: proofUrl || undefined,
        proofText: proofText || undefined,
      }),
    });
    const json = await res.json();
    setSubmitting(false);

    if (!json.success) {
      setSubmitMsg((prev) => ({ ...prev, [taskId]: json.error?.message || `Error: ${json.error?.code}` }));
      return;
    }

    setSubmitMsg((prev) => ({ ...prev, [taskId]: "Submitted — pending review." }));
    setMyTaskStatus((prev) => ({ ...prev, [taskId]: "PENDING" }));
    setOpenTaskId(null);
    setProofUrl("");
    setProofText("");
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#9A9A93" }}>Loading…</p>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#F5F5F0" }}>Campaign not found.</p>
      </main>
    );
  }

  let cta: React.ReactNode;
  if (!me) {
    cta = (
      <a href="/login" style={buttonStyle}>
        Sign up / Log in
      </a>
    );
  } else if (!me.emailVerified) {
    cta = (
      <a href="/dashboard" style={{ ...buttonStyle, background: "#161616", color: "#F5F5F0", border: "1px solid rgba(255,107,107,0.3)" }}>
        Verify your email to participate
      </a>
    );
  } else if (campaign.isParticipating) {
    cta = <span style={{ ...buttonStyle, background: "#161616", color: "#C8FF4D", border: "1px solid rgba(200,255,77,0.3)" }}>✓ Participating</span>;
  } else {
    cta = (
      <button onClick={handleParticipate} style={{ ...buttonStyle, border: "none", cursor: "pointer" }}>
        Participate
      </button>
    );
  }

  const canSubmit = me && me.emailVerified && campaign.isParticipating;

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: "#F5F5F0", marginBottom: 32 }}>
          Forge<span style={{ color: "#C8FF4D" }}>Desk</span>
        </p>

        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#9A9A93", marginBottom: 8 }}>
          {campaign.project.name}
        </p>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 26, color: "#F5F5F0", margin: "0 0 16px" }}>
          {campaign.title}
        </h1>
        <p style={{ color: "#9A9A93", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          {campaign.description}
        </p>

        <div style={{ marginBottom: 24 }}>{cta}</div>

        {actionMsg && (
          <p style={{ color: "#C8FF4D", fontSize: 13.5, marginBottom: 24 }}>{actionMsg}</p>
        )}

        <div style={{ display: "flex", gap: 24, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#9A9A93", marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <span>{campaign._count.participations} participants</span>
          <span style={{ color: "#C8FF4D" }}>{campaign.rewardDescription}</span>
        </div>

        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 17, color: "#F5F5F0", marginBottom: 16 }}>
          Tasks
        </h2>

        {campaign.tasks.length === 0 && (
          <p style={{ color: "#9A9A93", fontSize: 13.5 }}>No tasks have been added to this campaign yet.</p>
        )}

        {campaign.tasks.map((task) => (
          <div key={task.id} style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <h3 style={{ color: "#F5F5F0", fontSize: 15, margin: "0 0 6px" }}>{task.title}</h3>
            <p style={{ color: "#9A9A93", fontSize: 13, margin: "0 0 12px" }}>{task.instructions}</p>

            {myTaskStatus[task.id] && (
              <p style={{ color: "#C8FF4D", fontSize: 12.5, marginTop: 8 }}>
                Already submitted ({myTaskStatus[task.id].replace(/_/g, " ")})
                {myTaskStatus[task.id] === "MORE_PROOF_REQUIRED"
                  ? " — admin requested more proof; you may submit again."
                  : myTaskStatus[task.id] === "REJECTED"
                    ? " — rejected; you may submit again."
                    : " — one submission per task."}
              </p>
            )}

            {canSubmit &&
              openTaskId !== task.id &&
              !submitMsg[task.id] &&
              (!myTaskStatus[task.id] ||
                myTaskStatus[task.id] === "MORE_PROOF_REQUIRED" ||
                myTaskStatus[task.id] === "REJECTED") && (
              <button
                onClick={() => setOpenTaskId(task.id)}
                style={{ background: "transparent", border: "1px solid rgba(200,255,77,0.3)", color: "#C8FF4D", borderRadius: 6, padding: "6px 12px", fontSize: 12.5, cursor: "pointer" }}
              >
                {myTaskStatus[task.id] ? "Submit again" : "Submit proof"}
              </button>
            )}

            {canSubmit && openTaskId === task.id && (
              <div style={{ marginTop: 10 }}>
                <input
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="Link to your post (optional)"
                  style={miniInputStyle}
                />
                <textarea
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Or describe your proof"
                  rows={2}
                  style={{ ...miniInputStyle, resize: "vertical", marginTop: 8 }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => handleSubmitProof(task.id)}
                    disabled={submitting}
                    style={{ background: "#C8FF4D", color: "#0D0D0D", border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                  >
                    {submitting ? "Submitting…" : "Submit"}
                  </button>
                  <button
                    onClick={() => setOpenTaskId(null)}
                    style={{ background: "transparent", color: "#9A9A93", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "7px 14px", fontSize: 12.5, cursor: "pointer" }}
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
  minHeight: "100vh",
  background: "#0D0D0D",
  padding: "32px 20px",
  fontFamily: "Inter, sans-serif",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 20px",
  background: "#C8FF4D",
  color: "#0D0D0D",
  borderRadius: 7,
  fontWeight: 600,
  fontSize: 14,
  textDecoration: "none",
};

const miniInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  background: "#0D0D0D",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6,
  color: "#F5F5F0",
  fontSize: 13,
  fontFamily: "Inter, sans-serif",
  outline: "none",
  boxSizing: "border-box",
};