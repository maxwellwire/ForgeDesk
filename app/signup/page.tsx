"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "email" | "otp" | "details";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Could not send code");
        setLoading(false);
        return;
      }
      setInfo("Code sent — check your email.");
      setStep("otp");
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Invalid code");
        setLoading(false);
        return;
      }
      setInfo("Email verified. Complete your account.");
      setStep("details");
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Signup failed. Please try again.");
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
            margin: "0 0 8px",
          }}
        >
          Create your account
        </h1>
        <p style={{ color: "#9A9A93", fontSize: 13, marginBottom: 24 }}>
          {step === "email" && "Step 1 — verify your email first"}
          {step === "otp" && "Step 2 — enter the code we sent"}
          {step === "details" && "Step 3 — finish your profile"}
        </p>

        {error && (
          <p style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}
        {info && (
          <p style={{ color: "#C8FF4D", fontSize: 13, marginBottom: 12 }}>{info}</p>
        )}

        {step === "email" && (
          <form onSubmit={requestOtp}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="you@example.com"
            />
            <button type="submit" disabled={loading} style={primaryBtn}>
              {loading ? "Sending…" : "Send verification code"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOtp}>
            <p style={{ color: "#9A9A93", fontSize: 13, marginBottom: 12 }}>
              Code sent to <span style={{ color: "#F5F5F0" }}>{email}</span>
            </p>
            <label style={labelStyle}>Verification code</label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={inputStyle}
              placeholder="6-digit code"
              inputMode="numeric"
            />
            <button type="submit" disabled={loading} style={primaryBtn}>
              {loading ? "Verifying…" : "Verify email"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
                setInfo(null);
              }}
              style={linkBtn}
            >
              Change email / resend
            </button>
          </form>
        )}

        {step === "details" && (
          <form onSubmit={createAccount}>
            <p style={{ color: "#9A9A93", fontSize: 12, marginBottom: 16 }}>
              Verified: <span style={{ color: "#C8FF4D" }}>{email}</span>
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>First name</label>
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Last name</label>
                <input
                  required
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <label style={labelStyle}>Username</label>
            <input
              required
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              style={inputStyle}
              placeholder="letters, numbers, underscores"
            />

            <label style={labelStyle}>Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              style={inputStyle}
            />

            <button type="submit" disabled={loading} style={primaryBtn}>
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>
        )}

        <p style={{ color: "#9A9A93", fontSize: 13, marginTop: 24 }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#C8FF4D" }}>
            Log in
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

const linkBtn: React.CSSProperties = {
  width: "100%",
  marginTop: 10,
  padding: "10px",
  background: "transparent",
  color: "#9A9A93",
  border: "none",
  fontSize: 13,
  cursor: "pointer",
};