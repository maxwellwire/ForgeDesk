"use client";

import { useEffect, useState } from "react";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  rewardDescription: string;
  startAt: string;
  endAt: string;
  project: { name: string };
  _count: { participations: number; tasks: number };
};

function formatParticipants(n: number) {
  return n === 1 ? "1 participant" : `${n} participants`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function statusColor(status: string) {
  if (status === "LIVE") return "#C8FF4D";
  if (status === "SCHEDULED") return "#7dd3fc";
  if (status === "ENDED" || status === "COMPLETED" || status === "WINNERS_SELECTED")
    return "#9A9A93";
  return "#9A9A93";
}

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
    <main style={{ minHeight: "calc(100vh - 60px)", background: "#0D0D0D", padding: "28px 20px 48px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 26,
            color: "#F5F5F0",
            margin: "0 0 8px",
          }}
        >
          Campaigns
        </h1>
        <p style={{ color: "#9A9A93", fontSize: 14, margin: "0 0 28px", lineHeight: 1.5 }}>
          Join a live campaign, complete the tasks, and submit proof for review.
        </p>

        {loading && <p style={{ color: "#9A9A93" }}>Loading campaigns…</p>}
        {!loading && campaigns.length === 0 && (
          <div
            style={{
              background: "#161616",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: 24,
              color: "#9A9A93",
              fontSize: 14,
            }}
          >
            No public campaigns right now. Check back soon.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {campaigns.map((c) => (
            <a
              key={c.id}
              href={`/campaigns/${c.slug || c.id}`}
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
                  gap: 8,
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
                    color: statusColor(c.status),
                    border: `1px solid ${statusColor(c.status)}44`,
                    borderRadius: 20,
                    padding: "2px 10px",
                  }}
                >
                  {c.status.replace(/_/g, " ")}
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: 17,
                  color: "#F5F5F0",
                  margin: "0 0 6px",
                }}
              >
                {c.title}
              </h2>
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
                  flexWrap: "wrap",
                  gap: 8,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  paddingTop: 12,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  color: "#9A9A93",
                }}
              >
                <span>
                  {formatParticipants(c._count.participations)}
                  {c._count.tasks > 0 ? ` · ${c._count.tasks} task${c._count.tasks === 1 ? "" : "s"}` : ""}
                </span>
                <span style={{ color: "#C8FF4D" }}>{c.rewardDescription}</span>
              </div>
              {(c.startAt || c.endAt) && (
                <p
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: "#6B6B66",
                    margin: "10px 0 0",
                  }}
                >
                  {c.startAt ? formatDate(c.startAt) : "—"} → {c.endAt ? formatDate(c.endAt) : "—"}
                </p>
              )}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}