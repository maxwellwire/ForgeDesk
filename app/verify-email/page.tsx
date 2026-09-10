"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message || `Error: ${json.error?.code}`);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    setResending(true);

    try {
      const res = await fetch("/api/auth/resend-otp", { method: "POST" });
      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message || `Error: ${json.error?.code}`);
        setResending(false);
        return;
      }

      setInfo("A new code has been sent to your email.");
      setResending(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setResending(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0D0D0D",
        padding: "24px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
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
            margin: "0 0 8px",
          }}
        >
          Verify your email
        </h1>
        <p style={{ color: "#9A9A93", fontSize: 13.5, marginBottom: 24, lineHeight: 1.5 }}>
          Enter the 6-digit code we sent to your inbox. It expires in 10 minutes.
        </p>

        <form onSubmit={handleVerify}>
          <input
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            style={{
              width: "100%",
              padding: "14px 12px",
              background: "#161616",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 7,
              color: "#F5F5F0",
              fontSize: 22,
              letterSpacing: 6,
              textAlign: "center",
              fontFamily: "'IBM Plex Mono', monospace",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p style={{ color: "#FF6B6B", fontSize: 13, marginTop: 12 }}>{error}</p>
          )}
          {info && (
            <p style={{ color: "#C8FF4D", fontSize: 13, marginTop: 12 }}>{info}</p>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            style={{
              width: "100%",
              marginTop: 16,
              padding: "12px 16px",
              background: loading || code.length !== 6 ? "#8FBF3D" : "#C8FF4D",
              color: "#0D0D0D",
              border: "none",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Verifying…" : "Verify email"}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending}
          style={{
            marginTop: 16,
            background: "transparent",
            border: "none",
            color: "#9A9A93",
            fontSize: 13,
            cursor: resending ? "default" : "pointer",
            textDecoration: "underline",
            padding: 0,
          }}
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
      </div>
    </main>
  );
}
