"use client";

import { useEffect, useState } from "react";

type Submission = {
  id: string;
  status: string;
  proofUrl: string | null;
  proofText: string | null;
  createdAt: string;
  user: { id: string; username: string; email: string };
  campaign: { id: string; title: string };
  task: { id: string; title: string; type: string };
};

const FILTERS = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "MORE_PROOF_REQUIRED", ""] as const;

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [status, setStatus] = useState<string>("PENDING");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});

  function load(s = status) {
    setLoading(true);
    const q = s ? `?status=${s}&limit=100` : "?limit=100";
    fetch(`/api/admin/submissions${q}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setSubmissions(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function review(id: string, action: "APPROVE" | "REJECT" | "MORE_PROOF_REQUIRED") {
    setActing(id);
    setMsg((prev) => ({ ...prev, [id]: "" }));
    const res = await fetch(`/api/admin/submissions/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note: note[id] || undefined }),
    });
    const json = await res.json();
    setActing(null);
    if (!json.success) {
      setMsg((prev) => ({ ...prev, [id]: json.error?.code || "Failed" }));
      return;
    }
    setMsg((prev) => ({ ...prev, [id]: `Marked ${action}` }));
    load();
  }

  return (
    <div>
      <h1 style={heading}>Submissions</h1>
      <p style={{ color: "#9A9A93", fontSize: 14, marginBottom: 20 }}>
        Review proof and approve, reject, or request more evidence.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button
            key={f || "ALL"}
            onClick={() => {
              setStatus(f);
              load(f);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              border: status === f ? "1px solid rgba(200,255,77,0.4)" : "1px solid rgba(255,255,255,0.1)",
              background: status === f ? "rgba(200,255,77,0.1)" : "transparent",
              color: status === f ? "#C8FF4D" : "#9A9A93",
              fontSize: 12,
              fontFamily: "'IBM Plex Mono', monospace",
              cursor: "pointer",
            }}
          >
            {f || "ALL"}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: "#9A9A93" }}>Loading…</p>}
      {!loading && submissions.length === 0 && (
        <p style={{ color: "#9A9A93" }}>No submissions match this filter.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {submissions.map((s) => (
          <div key={s.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <p style={{ color: "#F5F5F0", fontWeight: 600, margin: "0 0 4px" }}>
                  {s.user.username}{" "}
                  <span style={{ color: "#6B6B66", fontWeight: 400, fontSize: 12 }}>{s.user.email}</span>
                </p>
                <p style={{ color: "#9A9A93", fontSize: 13, margin: "0 0 6px" }}>
                  {s.campaign.title} · {s.task.title} ({s.task.type})
                </p>
                {s.proofUrl && (
                  <a href={s.proofUrl} target="_blank" rel="noreferrer" style={{ color: "#C8FF4D", fontSize: 13 }}>
                    {s.proofUrl}
                  </a>
                )}
                {s.proofText && (
                  <p style={{ color: "#F5F5F0", fontSize: 13, margin: "8px 0 0", whiteSpace: "pre-wrap" }}>
                    {s.proofText}
                  </p>
                )}
              </div>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  color: statusColor(s.status),
                  border: `1px solid ${statusColor(s.status)}55`,
                  borderRadius: 20,
                  padding: "3px 10px",
                  height: "fit-content",
                }}
              >
                {s.status}
              </span>
            </div>

            {(s.status === "PENDING" || s.status === "UNDER_REVIEW" || s.status === "MORE_PROOF_REQUIRED") && (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  placeholder="Optional note"
                  value={note[s.id] || ""}
                  onChange={(e) => setNote((prev) => ({ ...prev, [s.id]: e.target.value }))}
                  style={inputStyle}
                />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    disabled={acting === s.id}
                    onClick={() => review(s.id, "APPROVE")}
                    style={{ ...actionBtn, background: "#C8FF4D", color: "#0D0D0D" }}
                  >
                    Approve
                  </button>
                  <button
                    disabled={acting === s.id}
                    onClick={() => review(s.id, "MORE_PROOF_REQUIRED")}
                    style={{ ...actionBtn, background: "#161616", color: "#F5F5F0", border: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    More proof
                  </button>
                  <button
                    disabled={acting === s.id}
                    onClick={() => review(s.id, "REJECT")}
                    style={{ ...actionBtn, background: "transparent", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.35)" }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
            {msg[s.id] && <p style={{ color: "#C8FF4D", fontSize: 12, marginTop: 8 }}>{msg[s.id]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function statusColor(status: string) {
  switch (status) {
    case "APPROVED":
      return "#C8FF4D";
    case "REJECTED":
      return "#ff6b6b";
    case "MORE_PROOF_REQUIRED":
      return "#ffb84d";
    default:
      return "#9A9A93";
  }
}

const heading: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  fontSize: 24,
  color: "#F5F5F0",
  margin: "0 0 8px",
};

const card: React.CSSProperties = {
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: 16,
};

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  background: "#0D0D0D",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 7,
  color: "#F5F5F0",
  fontSize: 13,
  fontFamily: "Inter, sans-serif",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const actionBtn: React.CSSProperties = {
  padding: "7px 14px",
  borderRadius: 7,
  fontWeight: 600,
  fontSize: 12.5,
  cursor: "pointer",
  border: "none",
};