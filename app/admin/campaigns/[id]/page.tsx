"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Task = {
  id: string;
  type: string;
  title: string;
  description: string;
  instructions: string;
  required: boolean;
  sortOrder: number;
};

type Campaign = {
  id: string;
  title: string;
  status: string;
  project: { name: string };
  tasks: Task[];
};

const TASK_TYPES = [
  "FOLLOW",
  "LIKE",
  "REPOST",
  "POST",
  "COMMENT",
  "JOIN_COMMUNITY",
  "REFERRAL",
  "MEME",
  "VIDEO",
  "IMAGE",
  "CUSTOM",
] as const;

export default function AdminCampaignDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<string>("POST");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  function load() {
    fetch(`/api/admin/campaigns/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCampaign(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    const res = await fetch(`/api/admin/campaigns/${id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title,
        description,
        instructions,
        sortOrder: Number(sortOrder) || 0,
        required: true,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) {
      setMsg(json.error?.message || json.error?.code || "Failed");
      return;
    }
    setTitle("");
    setDescription("");
    setInstructions("");
    setShowForm(false);
    load();
  }

  if (loading) {
    return <p style={{ color: "#9A9A93" }}>Loading…</p>;
  }
  if (!campaign) {
    return <p style={{ color: "#F5F5F0" }}>Campaign not found.</p>;
  }

  return (
    <div>
      <a href="/admin/campaigns" style={{ color: "#9A9A93", fontSize: 13, textDecoration: "none" }}>
        ← Campaigns
      </a>
      <h1 style={{ ...heading, marginTop: 12 }}>{campaign.title}</h1>
      <p style={{ color: "#9A9A93", fontSize: 13, marginBottom: 24 }}>
        {campaign.project.name} · {campaign.status}
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: "#F5F5F0", margin: 0 }}>
          Tasks
        </h2>
        <button onClick={() => setShowForm(!showForm)} style={primaryBtn}>
          {showForm ? "Cancel" : "Add task"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddTask} style={card}>
          <label style={labelStyle}>
            Type
            <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
              {TASK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} required />
          </label>
          <label style={labelStyle}>
            Description
            <input value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle} required />
          </label>
          <label style={labelStyle}>
            Instructions (shown to participants)
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              required
            />
          </label>
          <label style={labelStyle}>
            Sort order
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={inputStyle} />
          </label>
          {msg && <p style={{ color: "#ff6b6b", fontSize: 13 }}>{msg}</p>}
          <button type="submit" disabled={saving} style={primaryBtn}>
            {saving ? "Adding…" : "Add task"}
          </button>
        </form>
      )}

      {campaign.tasks.length === 0 && (
        <p style={{ color: "#9A9A93" }}>No tasks yet. Add at least one before going live.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {campaign.tasks.map((t) => (
          <div key={t.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <p style={{ color: "#F5F5F0", fontWeight: 600, margin: 0 }}>{t.title}</p>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#C8FF4D" }}>
                {t.type}
              </span>
            </div>
            <p style={{ color: "#9A9A93", fontSize: 13, margin: 0 }}>{t.instructions}</p>
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
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  marginBottom: 8,
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