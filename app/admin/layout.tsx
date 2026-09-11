"use client";

import { useEffect, useState } from "react";

type Me = {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
} | null;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [me, setMe] = useState<Me>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.isAdmin) {
          setMe(json.data);
        } else {
          setMe(null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={shell}>
        <p style={{ color: "#9A9A93" }}>Loading…</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div style={shell}>
        <p style={{ color: "#F5F5F0", marginBottom: 12 }}>Admin access required.</p>
        <a href="/login" style={{ color: "#C8FF4D" }}>
          Log in
        </a>
      </div>
    );
  }

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "14px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a
              href="/admin"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#F5F5F0",
                textDecoration: "none",
              }}
            >
              Forge<span style={{ color: "#C8FF4D" }}>Desk</span>{" "}
              <span style={{ color: "#9A9A93", fontWeight: 500, fontSize: 13 }}>Admin</span>
            </a>
            <nav style={{ display: "flex", gap: 14, fontSize: 13.5 }}>
              <a href="/admin" style={navLink}>
                Overview
              </a>
              <a href="/admin/campaigns" style={navLink}>
                Campaigns
              </a>
              <a href="/admin/submissions" style={navLink}>
                Submissions
              </a>
              <a href="/admin/winners" style={navLink}>
                Winners
              </a>
              <a href="/admin/projects" style={navLink}>
                Projects
              </a>
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
            <span style={{ color: "#9A9A93" }}>{me.username}</span>
            <a href="/dashboard" style={navLink}>
              Participant view
            </a>
          </div>
        </div>
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 60px" }}>
        {children}
      </main>
    </div>
  );
}

const shell: React.CSSProperties = {
  background: "#0D0D0D",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Inter, sans-serif",
};

const navLink: React.CSSProperties = {
  color: "#9A9A93",
  textDecoration: "none",
};