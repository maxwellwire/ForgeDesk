"use client";

import { useState } from "react";

export default function RequestCampaignPage() {
  const [form, setForm] = useState({
    projectName: "",
    contactName: "",
    email: "",
    website: "",
    twitter: "",
    telegram: "",
    details: "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const subject = encodeURIComponent(`Campaign request: ${form.projectName}`);
    const body = encodeURIComponent(
      [
        `Project: ${form.projectName}`,
        `Contact: ${form.contactName}`,
        `Email: ${form.email}`,
        `Website: ${form.website}`,
        `X/Twitter: ${form.twitter}`,
        `Telegram: ${form.telegram}`,
        "",
        "Details:",
        form.details,
      ].join("\n")
    );
    try {
      window.location.href = `mailto:hello@forgedesk.dev?subject=${subject}&body=${body}`;
      setSent(true);
    } catch {
      setError("Could not open email client. Email us directly.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0D0D0D",
        padding: "48px 24px 56px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <a href="/" style={{ color: "#9A9A93", fontSize: 13, textDecoration: "none" }}>
          ← Back to home
        </a>

        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 26,
            color: "#F5F5F0",
            margin: "20px 0 10px",
          }}
        >
          Request a campaign
        </h1>
        <p style={{ color: "#9A9A93", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          Tell us about your project and campaign idea. We&apos;ll follow up to discuss tasks,
          rewards, and timing before anything goes live.
        </p>

        {sent && (
          <p style={{ color: "#C8FF4D", fontSize: 13.5, marginBottom: 16 }}>
            Your email client should open with the request details. If it doesn&apos;t, contact us
            directly.
          </p>
        )}
        {error && (
          <p style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 16 }}>{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Project name</label>
          <input
            required
            value={form.projectName}
            onChange={(e) => update("projectName", e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Contact person</label>
          <input
            required
            value={form.contactName}
            onChange={(e) => update("contactName", e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Website</label>
          <input
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            style={inputStyle}
            placeholder="https://"
          />

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>X / Twitter</label>
              <input
                value={form.twitter}
                onChange={(e) => update("twitter", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Telegram</label>
              <input
                value={form.telegram}
                onChange={(e) => update("telegram", e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <label style={labelStyle}>Campaign details</label>
          <textarea
            required
            rows={5}
            value={form.details}
            onChange={(e) => update("details", e.target.value)}
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Goals, task ideas, budget range, timeline…"
          />

          <button type="submit" style={primaryBtn}>
            Send request
          </button>
        </form>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#9A9A93",
  fontSize: 12,
  marginBottom: 6,
  marginTop: 14,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 7,
  color: "#F5F5F0",
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  marginTop: 22,
  padding: "12px",
  background: "#C8FF4D",
  color: "#0D0D0D",
  border: "none",
  borderRadius: 7,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};