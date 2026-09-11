"use client";

import { useEffect, useState } from "react";

type Request = {
  id: string;
  projectName: string;
  contactName: string;
  email: string;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
  discord: string | null;
  description: string;
  campaignIdea: string;
  campaignType: string | null;
  estimatedParticipants: string | null;
  budget: string | null;
  message: string | null;
  status: string;
  createdAt: string;
};

const STATUSES = ["NEW", "CONTACTED", "APPROVED", "REJECTED", "ARCHIVED"];

export default function AdminProjectRequestsPage() {
  const [me, setMe] = useState<{ isAdmin: boolean } | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setMe(json.data);
        loadRequests();
      });
  }, []);

  function loadRequests() {
    fetch("/api/admin/project-requests")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setRequests(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/project-requests/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (json.success) {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#9A9A93" }}>Loading…</p>
      </main>
    );
  }

  if (!me?.isAdmin) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#F5F5F0" }}>You must be an admin to view this page.</p>
      </main>
    );
  }

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh", fontFamily: "Inter, sans-serif", padding: "32px 20px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: "#F5F5F0", marginBottom: 8 }}>
          Forge<span style={{ color: "#C8FF4D" }}>Desk</span> — Admin
        </p>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 22, color: "#F5F5F0", margin: "0 0 24px" }}>
          Project requests
        </h1>

        {requests.length === 0 && <p style={{ color: "#9A9A93" }}>No requests yet.</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {requests.map((r) => (
            <div key={r.id} style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 16 }}>
              <div
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              >
                <div>
                  <p style={{ color: "#F5F5F0", fontWeight: 600, fontSize: 14.5, margin: "0 0 4px" }}>{r.projectName}</p>
                  <p style={{ color: "#9A9A93", fontSize: 12, margin: 0 }}>{r.contactName} · {r.email}</p>
                </div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#C8FF4D", border: "1px solid rgba(200,255,77,0.25)", borderRadius: 20, padding: "2px 8px" }}>
                  {r.status}
                </span>
              </div>

              {expanded === r.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <Row label="Website" value={r.website} />
                  <Row label="X / Twitter" value={r.twitter} />
                  <Row label="Telegram" value={r.telegram} />
                  <Row label="Discord" value={r.discord} />
                  <Row label="Description" value={r.description} />
                  <Row label="Campaign idea" value={r.campaignIdea} />
                  <Row label="Campaign type" value={r.campaignType} />
                  <Row label="Est. participants" value={r.estimatedParticipants} />
                  <Row label="Budget" value={r.budget} />
                  <Row label="Message" value={r.message} />
                  <Row label="Submitted" value={new Date(r.createdAt).toLocaleString()} />

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(r.id, s)}
                        style={{
                          background: r.status === s ? "#C8FF4D" : "transparent",
                          color: r.status === s ? "#0D0D0D" : "#9A9A93",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 6,
                          padding: "6px 12px",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={{ color: "#9A9A93", fontSize: 11.5, margin: "0 0 2px" }}>{label}</p>
      <p style={{ color: "#F5F5F0", fontSize: 13, margin: 0 }}>{value}</p>
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
