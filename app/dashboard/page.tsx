"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
  createdAt: string;
};

type Campaign = {
  id: string;
  title: string;
  description: string;
  status: string;
  rewardDescription: string;
  endAt: string;
  project: { name: string };
  _count: { participations: number };
};

type Submission = {
  id: string;
  status: string;
  createdAt: string;
  campaign: { id: string; title: string };
  task: { title: string };
};

type Tab = "live" | "past" | "submissions";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending review",
  UNDER_REVIEW: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  MORE_PROOF_REQUIRED: "More proof requested",
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("live");
  const [profileOpen, setProfileOpen] = useState(false);

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
        if (json.success) setCampaigns(json.data);
      });

    fetch("/api/my-submissions")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setSubmissions(json.data);
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

  const liveCampaigns = campaigns.filter((c) => c.status === "LIVE");
  const pastCampaigns = campaigns.filter((c) => c.status === "ENDED");

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "24px 20px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: "#F5F5F0", margin: 0 }}>
          Forge<span style={{ color: "#C8FF4D" }}>Desk</span>
        </p>
        <button onClick={() => setProfileOpen(true)} style={profileButtonStyle}>
          {user.username.slice(0, 1).toUpperCase()}
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 0" }}>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 22,
            color: "#F5F5F0",
            margin: "0 0 6px",
          }}
        >
          Welcome, {user.username} {user.emailVerified ? "✅" : "❌"}
        </h1>
        <p style={{ color: "#9A9A93", fontSize: 12, marginBottom: 4 }}>
          {user.emailVerified ? "✅ Email verified" : "❌ Email not verified — verify to participate"}
        </p>
        <p style={{ color: "#9A9A93", fontSize: 14, marginBottom: 28 }}>
          Find a campaign. Complete the task. Get rewarded.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {[
            { key: "live" as Tab, label: "Live campaigns" },
            { key: "past" as Tab, label: "Past campaigns" },
            { key: "submissions" as Tab, label: "My submissions" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: "transparent",
                border: "none",
                color: tab === t.key ? "#C8FF4D" : "#9A9A93",
                borderBottom: tab === t.key ? "2px solid #C8FF4D" : "2px solid transparent",
                padding: "10px 4px",
                marginBottom: -1,
                fontSize: 13.5,
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "live" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {liveCampaigns.length === 0 && (
              <p style={{ color: "#9A9A93", fontSize: 13.5 }}>No live campaigns right now — check back soon.</p>
            )}
            {liveCampaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}

        {tab === "past" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {pastCampaigns.length === 0 && (
              <p style={{ color: "#9A9A93", fontSize: 13.5 }}>No past campaigns yet.</p>
            )}
            {pastCampaigns.map((c) => (
              <div key={c.id} style={cardWrap}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#9A9A93" }}>{c.project.name}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#9A9A93", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "2px 8px" }}>
                    ENDED
                  </span>
                </div>
                <p style={{ color: "#F5F5F0", fontSize: 15.5, fontWeight: 600, margin: "0 0 6px" }}>{c.title}</p>
                <p style={{ color: "#9A9A93", fontSize: 12.5, margin: "0 0 12px" }}>
                  Ended {new Date(c.endAt).toLocaleDateString()}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ color: "#C8FF4D" }}>{c.rewardDescription}</span>
                  <a href={`/campaigns/${c.id}`} style={{ color: "#9A9A93", textDecoration: "none" }}>
                    View details →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "submissions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {submissions.length === 0 && (
              <p style={{ color: "#9A9A93", fontSize: 13.5 }}>You haven't submitted proof for any tasks yet.</p>
            )}
            {submissions.map((s) => (
              <a
                key={s.id}
                href={`/campaigns/${s.campaign.id}`}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#161616", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 14, textDecoration: "none" }}
              >
                <div>
                  <p style={{ color: "#F5F5F0", fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>{s.campaign.title}</p>
                  <p style={{ color: "#9A9A93", fontSize: 12, margin: 0 }}>{s.task.title}</p>
                </div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: statusColor(s.status), border: `1px solid ${statusColor(s.status)}55`, borderRadius: 20, padding: "3px 10px", whiteSpace: "nowrap" }}>
                  {STATUS_LABEL[s.status] || s.status}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {profileOpen && (
        <ProfilePanel user={user} onClose={() => setProfileOpen(false)} onUserUpdate={setUser} />
      )}
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <div style={cardWrap}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#9A9A93" }}>{campaign.project.name}</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#C8FF4D", border: "1px solid rgba(200,255,77,0.25)", borderRadius: 20, padding: "2px 8px" }}>
          🟢 LIVE
        </span>
      </div>
      <p style={{ color: "#F5F5F0", fontSize: 15.5, fontWeight: 600, margin: "0 0 6px" }}>{campaign.title}</p>
      <p style={{ color: "#9A9A93", fontSize: 13, margin: "0 0 14px", lineHeight: 1.5 }}>{campaign.description}</p>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)", marginBottom: 12 }}>
        <span style={{ color: "#9A9A93" }}>Participants {campaign._count.participations}</span>
        <span style={{ color: "#C8FF4D" }}>Reward {campaign.rewardDescription}</span>
      </div>
      <a href={`/campaigns/${campaign.id}`} style={{ color: "#C8FF4D", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
        View campaign →
      </a>
    </div>
  );
}

function ProfilePanel({
  user,
  onClose,
  onUserUpdate,
}: {
  user: User;
  onClose: () => void;
  onUserUpdate: (u: User) => void;
}) {
  const [username, setUsername] = useState(user.username);
  const [usernameMsg, setUsernameMsg] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleUsernameUpdate() {
    setUsernameMsg(null);
    setSaving(true);
    const res = await fetch("/api/auth/update-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) {
      setUsernameMsg(json.error?.message || `Error: ${json.error?.code}`);
      return;
    }
    setUsernameMsg("Username updated.");
    onUserUpdate({ ...user, username: json.data.username });
  }

  async function handlePasswordChange() {
    setPasswordMsg(null);
    setSaving(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) {
      setPasswordMsg(json.error?.code === "INVALID_CURRENT_PASSWORD" ? "Current password is incorrect." : `Error: ${json.error?.code}`);
      return;
    }
    setPasswordMsg("Password updated.");
    setCurrentPassword("");
    setNewPassword("");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "flex-end", zIndex: 50 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 380, background: "#0D0D0D", borderLeft: "1px solid rgba(255,255,255,0.08)", padding: 24, overflowY: "auto" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <p style={{ color: "#F5F5F0", fontWeight: 600, fontSize: 16, margin: 0 }}>Profile</p>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#9A9A93", fontSize: 18, cursor: "pointer" }}>
            ✕
          </button>
        </div>

        <div style={{ marginBottom: 28 }}>
          <ProfileRow label="Username" value={user.username} />
          <ProfileRow label="Email" value={user.email} />
          <ProfileRow label="Email status" value={user.emailVerified ? "✅ Verified" : "❌ Not verified"} />
          <ProfileRow label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
        </div>

        <p style={{ color: "#F5F5F0", fontWeight: 600, fontSize: 13.5, marginBottom: 10 }}>Update username</p>
        <input value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
        {usernameMsg && <p style={{ color: "#C8FF4D", fontSize: 12, marginTop: 6 }}>{usernameMsg}</p>}
        <button onClick={handleUsernameUpdate} disabled={saving} style={{ ...smallButton, marginTop: 8 }}>
          Save username
        </button>

        <p style={{ color: "#F5F5F0", fontWeight: 600, fontSize: 13.5, marginTop: 28, marginBottom: 10 }}>Change password</p>
        <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="New password (min 8 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ ...inputStyle, marginTop: 8 }} />
        {passwordMsg && <p style={{ color: "#C8FF4D", fontSize: 12, marginTop: 6 }}>{passwordMsg}</p>}
        <button onClick={handlePasswordChange} disabled={saving} style={{ ...smallButton, marginTop: 8 }}>
          Update password
        </button>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ color: "#6B6B66", fontSize: 12, marginBottom: 16 }}>
            Changing your email address isn't available yet — this requires a re-verification
            flow that hasn't been built. Contact support if you need this changed.
          </p>
          <button onClick={handleLogout} style={{ ...smallButton, background: "transparent", border: "1px solid rgba(255,107,107,0.3)", color: "#FF6B6B" }}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <span style={{ color: "#9A9A93", fontSize: 12.5 }}>{label}</span>
      <span style={{ color: "#F5F5F0", fontSize: 12.5 }}>{value}</span>
    </div>
  );
}

function statusColor(status: string): string {
  if (status === "APPROVED") return "#C8FF4D";
  if (status === "REJECTED") return "#FF6B6B";
  if (status === "MORE_PROOF_REQUIRED") return "#FFB84D";
  return "#9A9A93";
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

const cardWrap: React.CSSProperties = {
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: 18,
};

const profileButtonStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#C8FF4D",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 7,
  color: "#F5F5F0",
  fontSize: 13,
  fontFamily: "Inter, sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

const smallButton: React.CSSProperties = {
  background: "#C8FF4D",
  color: "#0D0D0D",
  border: "none",
  borderRadius: 7,
  padding: "8px 14px",
  fontSize: 12.5,
  fontWeight: 600,
  cursor: "pointer",
};
<div style={cardStyle("rgba(255,107,107,0.3)")}>
  <p style={{ color: "#FF6B6B", fontSize: 14, margin: "0 0 4px", fontWeight: 600 }}>
    Email verification required
  </p>
  <p style={{ color: "#9A9A93", fontSize: 13, margin: "0 0 10px" }}>
    Verify your email before participating in campaigns.
  </p>
  <a href="/verify-email" style={{ color: "#C8FF4D", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
    Enter verification code →
  </a>
</div>
