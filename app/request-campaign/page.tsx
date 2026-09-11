"use client";

import { useState } from "react";
import Nav from "@/components/Nav";

const initialForm = {
  projectName: "",
  contactName: "",
  email: "",
  website: "",
  twitter: "",
  telegram: "",
  discord: "",
  description: "",
  campaignIdea: "",
  campaignType: "",
  estimatedParticipants: "",
  budget: "",
  message: "",
};

export default function RequestCampaignPage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/project-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ background: "#0D0D0D", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
        <Nav />
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "72px 20px", textAlign: "center" }}>
          <p style={{ color: "#C8FF4D", fontSize: 32, marginBottom: 16 }}>✓</p>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 22, color: "#F5F5F0", margin: "0 0 10px" }}>
            Request received
          </h1>
          <p style={{ color: "#9A9A93", fontSize: 14, lineHeight: 1.6 }}>
            Thanks for reaching out. Someone from ForgeDesk will follow up by email to discuss
            your campaign.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Nav />
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "48px 20px 80px" }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 26, color: "#F5F5F0", margin: "0 0 8px" }}>
          Request a campaign
        </h1>
        <p style={{ color: "#9A9A93", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
          Tell us about your project and campaign idea. We'll follow up to discuss tasks,
          rewards, and timing before anything goes live.
        </p>

        <form onSubmit={handleSubmit}>
          <Field label="Project name" required value={form.projectName} onChange={(v) => update("projectName", v)} />
          <Field label="Contact person" required value={form.contactName} onChange={(v) => update("contactName", v)} />
          <Field label="Email" type="email" required value={form.email} onChange={(v) => update("email", v)} />
          <Field label="Website" value={form.website} onChange={(v) => update("website", v)} placeholder="https://" />

          <div style={{ display: "flex", gap: 12 }}>
            <Field label="X / Twitter" value={form.twitter} onChange={(v) => update("twitter", v)} />
            <Field label="Telegram" value={form.telegram} onChange={(v) => update("telegram", v)} />
          </div>
          <Field label="Discord" value={form.discord} onChange={(v) => update("discord", v)} />

          <TextArea label="Project description" required value={form.description} onChange={(v) => update("description", v)} />
          <TextArea label="Campaign idea" required value={form.campaignIdea} onChange={(v) => update("campaignIdea", v)} />

          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Campaign type" value={form.campaignType} onChange={(v) => update("campaignType", v)} placeholder="e.g. X posts, referral" />
            <Field label="Est. participants" value={form.estimatedParticipants} onChange={(v) => update("estimatedParticipants", v)} placeholder="e.g. 500" />
          </div>

          <Field label="Budget / reward info" value={form.budget} onChange={(v) => update("budget", v)} placeholder="e.g. 2,000 USDC pool" />
          <TextArea label="Anything else?" value={form.message} onChange={(v) => update("message", v)} />

          {error && <p style={{ color: "#FF6B6B", fontSize: 13, marginTop: 4, marginBottom: 12 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 12,
              padding: "12px 16px",
              background: loading ? "#8FBF3D" : "#C8FF4D",
              color: "#0D0D0D",
              border: "none",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Sending…" : "Send request"}
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div style={{ flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        style={{ ...inputStyle, resize: "vertical" }}
      />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#9A9A93",
  fontSize: 12,
  fontFamily: "'IBM Plex Mono', monospace",
  marginBottom: 6,
  marginTop: 16,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 7,
  color: "#F5F5F0",
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
  outline: "none",
  boxSizing: "border-box",
};
