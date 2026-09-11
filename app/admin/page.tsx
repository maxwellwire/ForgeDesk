"use client";

import { useEffect, useState } from "react";

type Counts = {
  campaigns: number;
  live: number;
  pendingSubmissions: number;
  winners: number;
  projects: number;
};

export default function AdminOverviewPage() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/campaigns").then((r) => r.json()),
      fetch("/api/admin/submissions?status=PENDING&limit=1").then((r) => r.json()),
      fetch("/api/admin/winners/list").then((r) => r.json()),
      fetch("/api/admin/projects").then((r) => r.json()),
    ]).then(([campaigns, submissions, winners, projects]) => {
      const list = campaigns.success ? campaigns.data : [];
      setCounts({
        campaigns: list.length,
        live: list.filter((c: { status: string }) => c.status === "LIVE").length,
        pendingSubmissions: submissions.success ? submissions.data.length : 0,
        winners: winners.success ? winners.data.length : 0,
        projects: projects.success ? projects.data.length : 0,
      });
    });

    fetch("/api/admin/submissions?status=PENDING&limit=200")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setCounts((prev) =>
            prev ? { ...prev, pendingSubmissions: json.data.length } : prev
          );
        }
      });
  }, []);

  return (
    <div>
      <h1 style={heading}>Admin overview</h1>
      <p style={{ color: "#9A9A93", fontSize: 14, marginBottom: 28 }}>
        Manage campaigns, review submissions, select winners, and track rewards.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: 32,
        }}
      >
        <StatCard label="Projects" value={counts?.projects ?? "—"} href="/admin/projects" />
        <StatCard label="Campaigns" value={counts?.campaigns ?? "—"} href="/admin/campaigns" />
        <StatCard label="Live" value={counts?.live ?? "—"} href="/admin/campaigns" />
        <StatCard
          label="Pending reviews"
          value={counts?.pendingSubmissions ?? "—"}
          href="/admin/submissions"
          highlight
        />
        <StatCard label="Winners" value={counts?.winners ?? "—"} href="/admin/winners" />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <a href="/admin/campaigns" style={primaryBtn}>
          Manage campaigns
        </a>
        <a href="/admin/submissions" style={secondaryBtn}>
          Review submissions
        </a>
        <a href="/admin/winners" style={secondaryBtn}>
          Winners & rewards
        </a>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: string | number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <a
      href={href}
      style={{
        display: "block",
        background: "#161616",
        border: highlight
          ? "1px solid rgba(200,255,77,0.35)"
          : "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: 18,
        textDecoration: "none",
      }}
    >
      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          color: "#9A9A93",
          margin: "0 0 8px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 28,
          fontWeight: 600,
          color: highlight ? "#C8FF4D" : "#F5F5F0",
          margin: 0,
        }}
      >
        {value}
      </p>
    </a>
  );
}

const heading: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  fontSize: 24,
  color: "#F5F5F0",
  margin: "0 0 8px",
};

const primaryBtn: React.CSSProperties = {
  padding: "10px 18px",
  background: "#C8FF4D",
  color: "#0D0D0D",
  borderRadius: 7,
  fontWeight: 600,
  fontSize: 13.5,
  textDecoration: "none",
};

const secondaryBtn: React.CSSProperties = {
  padding: "10px 18px",
  background: "#161616",
  color: "#F5F5F0",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 7,
  fontWeight: 600,
  fontSize: 13.5,
  textDecoration: "none",
};