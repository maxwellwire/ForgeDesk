"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Could not send reset email.");
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 24px 40px",
        background: "#0D0D0D",
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <a href="/login" style={{ color: "#9A9A93", fontSize: 13, textDecoration: "none" }}>
          ← Back to log in
        </a>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 24,
            color: "#F5F5F0",
            margin: "16px 0 8px",
          }}
        >
          Forgot password
        </h1>
        <p style={{ color: "#9A9A93", fontSize: 13.5, marginBottom: 24 }}>
          Enter your email and we&apos;ll send a reset link if an account exists.
        </p>
        {done ? (
          <p style={{ color: "#C8FF4D", fontSize: 14, lineHeight: 1.5 }}>
            If that email is registered, a reset link is on the way. Check your inbox and spam
            folder.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <p style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 12 }}>{error}</p>
            )}
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              autoComplete="email"
            />
            <button type="submit" disabled={loading} style={primaryBtn}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
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
  marginTop: 20,
  padding: "12px",
  background: "#C8FF4D",
  color: "#0D0D0D",
  border: "none",
  borderRadius: 7,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};