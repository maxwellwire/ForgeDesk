"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Winner = {
  id: string;
  status: string;
  rewardDescription: string;
  selectedAt: string;
  user: { username: string };
};

type Campaign = {
  id: string;
  title: string;
  slug: string;
  rewardDescription: string;
  project: { name: string };
};

export default function CampaignWinnersPage() {
  const params = useParams();
  const id = params.id as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/campaigns/${id}/winners`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setCampaign(json.data.campaign);
          setWinners(json.data.winners);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  return (
    <main
      style={{
        minHeight: "calc(100vh - 60px)",
        background: "#0D0D0D",
        padding: "28px 20px 48px",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <a
          href={`/campaigns/${id}`}
          style={{ color: "#9A9A93", fontSize: 13, textDecoration: "none" }}
        >
          ← Campaign
        </a>

        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 26,
            color: "#F5F5F0",
            margin: "16px 0 8px",
          }}
        >
          Winners
        </h1>

        {loading && <p style={{ color: "#9A9A93" }}>Loading…</p>}

        {!loading && campaign && (
          <p style={{ color: "#9A9A93", fontSize: 14, marginBottom: 24 }}>
            {campaign.project.name} · {campaign.title}
          </p>
        )}

        {!loading && winners.length === 0 && (
          <div
            style={{
              background: "#161616",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: 20,
              color: "#9A9A93",
              fontSize: 14,
            }}
          >
            Winners have not been announced yet.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {winners.map((w, i) => (
            <div
              key={w.id}
              style={{
                background: "#161616",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: "#6B6B66",
                    margin: "0 0 4px",
                  }}
                >
                  #{String(i + 1).padStart(2, "0")}
                </p>
                <p
                  style={{
                    color: "#F5F5F0",
                    fontWeight: 600,
                    margin: 0,
                    fontSize: 15,
                  }}
                >
                  @{w.user.username}
                </p>
              </div>
              <span
                style={{
                  color: "#C8FF4D",
                  fontSize: 13,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                {w.rewardDescription}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}