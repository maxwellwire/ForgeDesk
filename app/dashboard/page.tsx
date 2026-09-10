"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
};

type Campaign = {
  id: string;
  title: string;
  description: string;
  status: string;
  rewardDescription: string;
  project: { name: string };
  _count: { participations: number };
};

// TODO: replace with ForgeDesk's real official handles/links.
const SOCIAL_LINKS = {
  twitter: "https://x.com/REPLACE_ME",
  discord: "https://discord.gg/REPLACE_ME",
  telegram: "https://t.me/REPLACE_ME",
  website: "https://REPLACE_ME.example",
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setUser(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCampaigns(json.data.slice(0, 3));
      });
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
    <div style={{ background: "#0D0D0D", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* Top bar */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 0" }}>
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
            margin: "0 0 6px",
          }}
        >
          Welcome, {user.username}
        </h1>
        <p style={{ color: "#9A9A93", fontSize: 13, marginBottom: 24 }}>{user.email}</p>

        {!user.emailVerified ? (
          <div style={cardStyle("rgba(255,107,107,0.3)")}>
            <p style={{ color: "#FF6B6B", fontSize: 14, margin: "0 0 4px", fontWeight: 600 }}>
              Email verification required
            </p>
            <p style={{ color: "#9A9A93", fontSize: 13, margin: 0 }}>
              Verify your email before participating in campaigns.
            </p>
          </div>
        ) : (
          <div style={cardStyle("rgba(200,255,77,0.25)")}>
            <p style={{ color: "#C8FF4D", fontSize: 14, margin: 0, fontWeight: 600 }}>
              ✓ Email verified — you can participate in campaigns
            </p>
          </div>
        )}

        <a href="/campaigns" style={primaryButtonStyle}>
          Browse campaigns
        </a>
      </div>

      {/* About section */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "64px 20px 0" }}>
        <p style={eyebrowStyle}>About ForgeDesk</p>
        <h2 style={sectionHeadingStyle}>The control desk for Web3 campaigns</h2>
        <p style={bodyTextStyle}>
          ForgeDesk connects Web3 projects with participants who complete real promotional
          tasks — posts, videos, memes, referrals — in exchange for rewards. Every submission
          is reviewed by hand before a single reward goes out, so campaigns stay honest and
          participants get credit for real work.
        </p>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "56px 20px 0" }}>
        <p style={eyebrowStyle}>How it works</p>
        <h2 style={sectionHeadingStyle}>Four steps, start to finish</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 24 }}>
          {[
            { n: "01", t: "Discover campaigns", d: "Browse live campaigns from real Web3 projects." },
            { n: "02", t: "Join campaigns", d: "Sign up, verify your email, and join with one click." },
            { n: "03", t: "Complete tasks", d: "Follow the instructions and submit your proof." },
            { n: "04", t: "Earn rewards", d: "Get reviewed, get approved, get paid." },
          ].map((step) => (
            <div key={step.n} style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 18 }}>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#C8FF4D", margin: "0 0 10px" }}>
                {step.n}
              </p>
              <p style={{ color: "#F5F5F0", fontSize: 14.5, fontWeight: 600, margin: "0 0 6px" }}>{step.t}</p>
              <p style={{ color: "#9A9A93", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Active campaigns */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "56px 20px 0" }}>
        <p style={eyebrowStyle}>Live now</p>
        <h2 style={sectionHeadingStyle}>Active campaigns</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
          {campaigns.length === 0 && (
            <p style={{ color: "#9A9A93", fontSize: 13.5 }}>No active campaigns right now — check back soon.</p>
          )}
          {campaigns.map((c) => (
            <a
              key={c.id}
              href={`/campaigns/${c.id}`}
              style={{ display: "block", background: "#161616", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 18, textDecoration: "none" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#9A9A93" }}>{c.project.name}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#C8FF4D", border: "1px solid rgba(200,255,77,0.25)", borderRadius: 20, padding: "2px 8px" }}>{c.status}</span>
              </div>
              <p style={{ color: "#F5F5F0", fontSize: 15.5, fontWeight: 600, margin: "0 0 6px" }}>{c.title}</p>
              <p style={{ color: "#9A9A93", fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>{c.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ color: "#9A9A93" }}>{c._count.participations} participants</span>
                <span style={{ color: "#C8FF4D" }}>{c.rewardDescription}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Why ForgeDesk */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "56px 20px 0" }}>
        <p style={eyebrowStyle}>Why ForgeDesk</p>
        <h2 style={sectionHeadingStyle}>Built for real participation</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 24 }}>
          {[
            { t: "Manual review, every time", d: "No bots gaming submissions — a real person checks every proof." },
            { t: "No wallet required", d: "Sign up with email. Rewards are tracked and handled directly." },
            { t: "Clear task instructions", d: "Every campaign spells out exactly what's expected before you join." },
          ].map((item) => (
            <div key={item.t} style={{ padding: 18, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
              <p style={{ color: "#F5F5F0", fontSize: 14.5, fontWeight: 600, margin: "0 0 6px" }}>{item.t}</p>
              <p style={{ color: "#9A9A93", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 72, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "32px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: "#F5F5F0", marginBottom: 16 }}>
            Forge<span style={{ color: "#C8FF4D" }}>Desk</span>
          </p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
            <a href={SOCIAL_LINKS.twitter} style={footerLinkStyle}>X / Twitter</a>
            <a href={SOCIAL_LINKS.discord} style={footerLinkStyle}>Discord</a>
            <a href={SOCIAL_LINKS.telegram} style={footerLinkStyle}>Telegram</a>
            <a href={SOCIAL_LINKS.website} style={footerLinkStyle}>Website</a>
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20, fontSize: 12.5 }}>
            <a href="/campaigns" style={footerLinkStyle}>Campaigns</a>
            <a href="/dashboard" style={footerLinkStyle}>Dashboard</a>
            <a href="/login" style={footerLinkStyle}>Log in</a>
          </div>
          <p style={{ color: "#6B6B66", fontSize: 12 }}>
            © {new Date().getFullYear()} ForgeDesk. All rights reserved.
          </p>
          <p style={{ color: "#6B6B66", fontSize: 11, marginTop: 6 }}>
            Social links above are placeholders — replace with ForgeDesk's official handles.
          </p>
        </div>
      </footer>
    </div>
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

function cardStyle(borderColor: string): React.CSSProperties {
  return {
    background: "#161616",
    border: `1px solid ${borderColor}`,
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  };
}

const primaryButtonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 16px",
  background: "#C8FF4D",
  color: "#0D0D0D",
  borderRadius: 7,
  fontWeight: 600,
  fontSize: 14,
  textDecoration: "none",
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 12,
  color: "#C8FF4D",
  margin: "0 0 8px",
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  fontSize: 21,
  color: "#F5F5F0",
  margin: 0,
};

const bodyTextStyle: React.CSSProperties = {
  color: "#9A9A93",
  fontSize: 14,
  lineHeight: 1.7,
  marginTop: 14,
  maxWidth: 640,
};

const footerLinkStyle: React.CSSProperties = {
  color: "#9A9A93",
  fontSize: 13,
  textDecoration: "none",
};
