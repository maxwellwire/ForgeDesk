"use client";

import { useEffect, useState } from "react";

type Campaign = {
  id: string;
  title: string;
  description: string;
  status: string;
  rewardDescription: string;
  endAt: string;
  project: { name: string };
  _count: { participations: number };
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCampaigns(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0D0D0D",
        padding: "32px 20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#F5F5F0",
            marginBottom: 32,
          }}
        >
          Forge<span style={{ color: "#C8FF4D" }}>Desk</span>
        </p>

        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 24,
            color: "#F5F5F0",
            margin: "0 0 24px",
          }}
        >
          Campaigns
        </h1>

        {loading && <p style={{ color: "#9A9A93" }}>Loading…</p>}

        {!loading && campaigns.length === 0 && (
          <p style={{ color: "#9A9A93" }}>No campaigns yet.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {campaigns.map((c) => (
            <a
              key={c.id}
              href={`/campaigns/${c.id}`}
              style={{
                display: "block",
                background: "#161616",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: 20,
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    color: "#9A9A93",
                  }}
                >
                  {c.project.name}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: c.status === "LIVE" ? "#C8FF4D" : "#9A9A93",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 20,
                    padding: "2px 8px",
                  }}
                >
                  {c.status}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: 17,
                  color: "#F5F5F0",
                  margin: "0 0 6px",
                }}
              >
                {c.title}
              </h3>

              <p
                style={{
                  color: "#9A9A93",
                  fontSize: 13.5,
                  margin: "0 0 14px",
                  lineHeight: 1.5,
                }}
              >
                {c.description}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  paddingTop: 12,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span style={{ color: "#9A9A93" }}>
                  {c._count.participations} participants
                </span>
                <span style={{ color: "#C8FF4D" }}>{c.rewardDescription}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
