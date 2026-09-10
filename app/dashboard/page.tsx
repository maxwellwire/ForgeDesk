"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setUser(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#9A9A93" }}>Loading…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#F5F5F0" }}>
          You need to{" "}
          <a href="/login" style={{ color: "#C8FF4D" }}>
            log in
          </a>{" "}
          to view your dashboard.
        </p>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={{ width: "100%", maxWidth: 480 }}>
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
            fontSize: 22,
            color: "#F5F5F0",
            margin: "0 0 8px",
          }}
        >
          Welcome, {user.username}
        </h1>
        <p style={{ color: "#9A9A93", fontSize: 13, marginBottom: 24 }}>
          {user.email}
        </p>

        {!user.emailVerified && (
          <div
            style={{
              background: "#161616",
              border: "1px solid rgba(255,107,107,0.3)",
              borderRadius: 10,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <p style={{ color: "#FF6B6B", fontSize: 14, margin: "0 0 4px", fontWeight: 600 }}>
              Email verification required
            </p>
            <p style={{ color: "#9A9A93", fontSize: 13, margin: 0 }}>
              You must verify your email before participating in campaigns.
            </p>
          </div>
        )}

        {user.emailVerified && (
          <div
            style={{
              background: "#161616",
              border: "1px solid rgba(200,255,77,0.25)",
              borderRadius: 10,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <p style={{ color: "#C8FF4D", fontSize: 14, margin: 0, fontWeight: 600 }}>
              ✓ Email verified — you can participate in campaigns
            </p>
          </div>
        )}

        <a
          href="/campaigns"
          style={{
            display: "inline-block",
            padding: "10px 16px",
            background: "#C8FF4D",
            color: "#0D0D0D",
            borderRadius: 7,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Browse campaigns
        </a>
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#0D0D0D",
  padding: "24px",
  fontFamily: "Inter, sans-serif",
};
