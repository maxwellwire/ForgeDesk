"use client";

import { useEffect, useState } from "react";

type Project = { id: string; name: string };
type Campaign = {
  id: string;
  title: string;
  slug: string;
  status: string;
  rewardDescription: string;
  startAt: string;
  endAt: string;
  winnerCount: number;
  project: { id: string; name: string };
  _count: {
    participations: number;
    submissions: number;
    winners: number;
    tasks: number;
  };
};

const STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "LIVE",
  "PAUSED",
  "ENDED",
  "WINNERS_SELECTED",
  "COMPLETED",
  "ARCHIVED",
] as const;

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [winnerCount, setWinnerCount] = useState("1");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [status, setStatus] = useState<string>("DRAFT");

  function load() {
    Promise.all([
      fetch("/api/admin/campaigns").then((r) => r.json()),
      fetch("/api/admin/projects").then((r) => r.json()),
    ]).then(([cJson, pJson]) => {
      if (cJson.success) setCampaigns(cJson.data);
      if (pJson.success) {
        setProjects(pJson.data);
        if (pJson.data[0] && !projectId) setProjectId(pJson.data[0].id);
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
  }, []);

  function autoSlug(t: string) {
    return t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 120);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    const res = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        title,
        slug: slug || autoSlug(title),
        description,
        rewardDescription,
        winnerCount: Number(winnerCount),
        status,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) {
      setMsg(json.error?.message || json.error?.code || "Failed");
      return;
    }
    setShowForm(false);
    setTitle("");
    setSlug("");
    setDescription("");
    setRewardDescription("");
    load();
  }

  async function updateStatus(id: string, newStatus: string) {
    const res = await fetch(`/api/admin/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const json = await res.json();
    if (json.success) load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={heading}>Campaigns</h1>
        <button onClick={() => setShowForm(!showForm)} style={primaryBtn} disabled={projects.length === 0}>
          {showForm ? "Cancel" : "New campaign"}
        </button>
      </div>

      {projects.length === 0 && (
        <p style={{ color: "#9A9A93", marginBottom: 16 }}>
          Create a <a href="/admin/projects" style={{ color: "#C8FF4D" }}>project</a> first.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleCreate} style={card}>
          <label style={labelStyle}>
            Project
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={inputStyle} required>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            Title
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug) setSlug(autoSlug(e.target.value));
              }}
              style={inputStyle}
              required
            />
          </label>
          <label style={labelStyle}>
            Slug
            <input value={slug} onChange={(e) => setSlug(e.target.value)} style={inputStyle} required />
          </label>
          <label style={labelStyle}>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} required />
          </label>
          <label style={labelStyle}>
            Reward description
            <input value={rewardDescription} onChange={(e) => setRewardDescription(e.target.value)} style={inputStyle} required placeholder="e.g. 100 USDC" />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <label style={labelStyle}>
              Winner count
              <input type="number" min={1} value={winnerCount} onChange={(e) => setWinnerCount(e.target.value)} style={inputStyle} required />
            </label>
            <label style={labelStyle}>
              Start
              <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} style={inputStyle} required />
            </label>
            <label style={labelStyle}>
              End
              <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} style={inputStyle} required />
            </label>
          </div>
          <label style={labelStyle}>
            Initial status
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          {msg && <p style={{ color: "#ff6b6b", fontSize: 13 }}>{msg}</p>}
          <button type="submit" disabled={saving} style={primaryBtn}>
            {saving ? "Creating…" : "Create campaign"}
          </button>
        </form>
      )}

      {loading && <p style={{ color: "#9A9A93" }}>Loading…</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {campaigns.map((c) => (
          <div key={c.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#9A9A93", margin: "0 0 4px" }}>
                  {c.project.name} · /{c.slug}
                </p>
                <p style={{ color: "#F5F5F0", fontWeight: 600, margin: "0 0 6px", fontSize: 16 }}>{c.title}</p>
                <p style={{ color: "#9A9A93", fontSize: 12, margin: 0 }}>
                  {c._count.tasks} tasks · {c._count.participations} participants · {c._count.submissions} submissions ·{" "}
                  {c._count.winners} winners · {c.rewardDescription}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                <select
                  value={c.status}
                  onChange={(e) => updateStatus(c.id, e.target.value)}
                  style={{
                    ...inputStyle,
                    width: "auto",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    color: c.status === "LIVE" ? "#C8FF4D" : "#F5F5F0",
                  }}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <a href={`/admin/campaigns/${c.id}`} style={{ color: "#C8FF4D", fontSize: 13, textDecoration: "none" }}>
                  Manage tasks →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const heading: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  fontSize: 24,
  color: "#F5F5F0",
  margin: 0,
};

const card: React.CSSProperties = {
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: 18,
  marginBottom: 4,
  display: "flex",
  flexDirection: "column",
  gap: 12,
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