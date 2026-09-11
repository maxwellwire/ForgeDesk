"use client";

import { useEffect, useState } from "react";

type Project = {
  id: string;
  name: string;
  website: string | null;
  twitter: string | null;
  description: string | null;
  createdAt: string;
  _count: { campaigns: number };
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setProjects(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        website: website || null,
        twitter: twitter || null,
        description: description || null,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) {
      setMsg(json.error?.message || json.error?.code || "Failed");
      return;
    }
    setName("");
    setWebsite("");
    setTwitter("");
    setDescription("");
    setShowForm(false);
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={heading}>Projects</h1>
        <button onClick={() => setShowForm(!showForm)} style={primaryBtn}>
          {showForm ? "Cancel" : "New project"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={card}>
          <Field label="Name" value={name} onChange={setName} required />
          <Field label="Website" value={website} onChange={setWebsite} placeholder="https://" />
          <Field label="Twitter / X" value={twitter} onChange={setTwitter} />
          <label style={labelStyle}>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </label>
          {msg && <p style={{ color: "#ff6b6b", fontSize: 13 }}>{msg}</p>}
          <button type="submit" disabled={saving} style={primaryBtn}>
            {saving ? "Creating…" : "Create project"}
          </button>
        </form>
      )}

      {loading && <p style={{ color: "#9A9A93" }}>Loading…</p>}
      {!loading && projects.length === 0 && (
        <p style={{ color: "#9A9A93" }}>No projects yet. Create one to attach campaigns.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {projects.map((p) => (
          <div key={p.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <p style={{ color: "#F5F5F0", fontWeight: 600, margin: "0 0 4px", fontSize: 15 }}>
                  {p.name}
                </p>
                <p style={{ color: "#9A9A93", fontSize: 12, margin: 0 }}>
                  {p._count.campaigns} campaign{p._count.campaigns === 1 ? "" : "s"}
                  {p.website ? ` · ${p.website}` : ""}
                </p>
              </div>
              <span style={mono}>{p.id.slice(0, 8)}…</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label style={labelStyle}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        style={inputStyle}
      />
    </label>
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
  marginBottom: 16,
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

const mono: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11,
  color: "#6B6B66",
};