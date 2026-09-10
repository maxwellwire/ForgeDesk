"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
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
            margin: "0 0 24px",
          }}
        >
          Log in
        </h1>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="you@example.com"
          />

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="••••••••"
          />

          {error && (
            <p
              style={{
                color: "#FF6B6B",
                fontSize: 13,
                marginTop: 4,
                marginBottom: 12,
              }}
            >
              {error}
            </p>
          )}

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
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p style={{ color: "#9A9A93", fontSize: 13, marginTop: 20 }}>
          Don't have an account?{" "}
          <a href="/signup" style={{ color: "#C8FF4D" }}>
            Sign up
          </a>
        </p>
      </div>
    </main>
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
