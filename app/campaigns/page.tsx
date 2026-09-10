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

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCampaign(json.data);
        setLoading(false);
      });

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setMe(json.data);
      });
  }, [id]);

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
        {campaign.tasks.map((task) => (
          <div key={task.id} style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <h3 style={{ color: "#F5F5F0", fontSize: 15, margin: "0 0 6px" }}>{task.title}</h3>
            <p style={{ color: "#9A9A93", fontSize: 13, margin: 0 }}>{task.instructions}</p>
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
