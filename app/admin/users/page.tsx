"use client";

import { useCallback, useEffect, useState } from "react";

type UserRow = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  isAdmin: boolean;
  createdAt: string;
  _count: { participations: number; submissions: number };
};

type Stats = {
  total: number;
  verified: number;
  unverified: number;
  active: number;
  suspended: number;
  banned: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [verified, setVerified] = useState("all");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status !== "all") params.set("status", status);
    if (verified !== "all") params.set("verified", verified);

    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setUsers(json.data.users);
          setStats(json.data.stats);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [q, status, verified]);

  useEffect(() => {
    load();
  }, [load]);

  async function setUserStatus(id: string, next: "ACTIVE" | "SUSPENDED" | "BANNED") {
    setMsg(null);
    const label =
      next === "BANNED" ? "ban" : next === "SUSPENDED" ? "suspend" : "reactivate";
    if (next !== "ACTIVE" && !confirm(`Are you sure you want to ${label} this user?`)) {
      return;
    }

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const json = await res.json();
    if (!json.success) {
      setMsg(json.error?.message || json.error?.code || "Failed");
      return;
    }
    setMsg(`User ${label}d.`);
    load();
  }

  return (
    <div>
      <h1 style={heading}>Users</h1>
      <p style={{ color: "#9A9A93", fontSize: 14, marginBottom: 20 }}>
        Registered accounts, verification status, and bans.
      </p>

      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Stat label="Total" value={stats.total} />
          <Stat label="Verified" value={stats.verified} accent />
          <Stat label="Unverified" value={stats.unverified} />
          <Stat label="Active" value={stats.active} />
          <Stat label="Suspended" value={stats.suspended} />
          <Stat label="Banned" value={stats.banned} danger />
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 18,
          alignItems: "center",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email, username…"
          style={inputStyle}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
          <option value="all">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="BANNED">Banned</option>
        </select>
        <select
          value={verified}
          onChange={(e) => setVerified(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All verification</option>
          <option value="true">Verified only</option>
          <option value="false">Unverified only</option>
        </select>
        <button onClick={load} style={secondaryBtn}>
          Refresh
        </button>
      </div>

      {msg && <p style={{ color: "#C8FF4D", fontSize: 13, marginBottom: 12 }}>{msg}</p>}
      {loading && <p style={{ color: "#9A9A93" }}>Loading…</p>}
      {!loading && users.length === 0 && (
        <p style={{ color: "#9A9A93" }}>No users match.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {users.map((u) => (
          <div key={u.id} style={card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <div>
                <p style={{ color: "#F5F5F0", fontWeight: 600, margin: "0 0 4px", fontSize: 15 }}>
                  @{u.username}
                  {u.isAdmin && (
                    <span style={{ color: "#C8FF4D", fontSize: 11, marginLeft: 8 }}>ADMIN</span>
                  )}
                </p>
                <p style={{ color: "#9A9A93", fontSize: 13, margin: 0 }}>
                  {u.firstName} {u.lastName} · {u.email}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                <Badge
                  text={u.emailVerified ? "Verified" : "Unverified"}
                  color={u.emailVerified ? "#C8FF4D" : "#9A9A93"}
                />
                <Badge
                  text={u.status}
                  color={
                    u.status === "ACTIVE"
                      ? "#C8FF4D"
                      : u.status === "SUSPENDED"
                        ? "#FFB84D"
                        : "#FF6B6B"
                  }
                />
              </div>
            </div>

            <p
              style={{
                color: "#6B6B66",
                fontSize: 12,
                margin: "0 0 12px",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              Joined {new Date(u.createdAt).toLocaleDateString()} ·{" "}
              {u._count.participations} participations · {u._count.submissions} submissions
            </p>

            {!u.isAdmin && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {u.status !== "ACTIVE" && (
                  <button onClick={() => setUserStatus(u.id, "ACTIVE")} style={smallBtn}>
                    Reactivate
                  </button>
                )}
                {u.status !== "SUSPENDED" && (
                  <button
                    onClick={() => setUserStatus(u.id, "SUSPENDED")}
                    style={{ ...smallBtn, background: "#FFB84D" }}
                  >
                    Suspend
                  </button>
                )}
                {u.status !== "BANNED" && (
                  <button
                    onClick={() => setUserStatus(u.id, "BANNED")}
                    style={{ ...smallBtn, background: "#FF6B6B", color: "#0D0D0D" }}
                  >
                    Ban
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  danger,
}: {
  label: string;
  value: number;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div style={statCard}>
      <p style={{ color: "#9A9A93", fontSize: 11, margin: "0 0 6px" }}>{label}</p>
      <p
        style={{
          color: danger ? "#FF6B6B" : accent ? "#C8FF4D" : "#F5F5F0",
          fontSize: 22,
          fontWeight: 700,
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        color,
        border: `1px solid ${color}55`,
        borderRadius: 20,
        padding: "3px 10px",
      }}
    >
      {text}
    </span>
  );
}

const heading: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  fontSize: 24,
  color: "#F5F5F0",
  margin: "0 0 8px",
};

const statCard: React.CSSProperties = {
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: 14,
};

const card: React.CSSProperties = {
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: 16,
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 180,
  padding: "9px 12px",
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 7,
  color: "#F5F5F0",
  fontSize: 13,
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  padding: "9px 12px",
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 7,
  color: "#F5F5F0",
  fontSize: 13,
};

const secondaryBtn: React.CSSProperties = {
  padding: "9px 14px",
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 7,
  color: "#F5F5F0",
  fontSize: 13,
  cursor: "pointer",
};

const smallBtn: React.CSSProperties = {
  background: "#C8FF4D",
  color: "#0D0D0D",
  border: "none",
  borderRadius: 6,
  padding: "7px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};