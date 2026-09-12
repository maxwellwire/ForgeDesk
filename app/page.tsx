export default function HomePage() {
  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
     

      <section style={{ maxWidth: 900, margin: "0 auto", padding:  "48px 20px 0" }}>
        <p style={eyebrow}>Proof-of-completion campaigns</p>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 38,
            color: "#F5F5F0",
            lineHeight: 1.2,
            margin: "0 0 20px",
            maxWidth: 640,
          }}
        >
          Post the task. Collect the proof. <span style={{ color: "#C8FF4D" }}>Review every one.</span>
        </h1>
        <p style={{ color: "#9A9A93", fontSize: 15, lineHeight: 1.7, maxWidth: 560, marginBottom: 32 }}>
          ForgeDesk is where Web3 projects hand off their promotional campaigns — X posts,
          videos, memes, referrals — and a real admin reviews every submission before a single
          reward goes out.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/campaigns" style={primaryButton}>
            Browse campaigns
          </a>
          <a href="/signup" style={secondaryButton}>
            Create an account
          </a>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 20px 0" }}>
        <p style={eyebrow}>How it works</p>
        <h2 style={sectionHeading}>For participants</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 24 }}>
          {[
            { n: "01", t: "Create an account", d: "Sign up with email — no wallet needed." },
            { n: "02", t: "Verify your email", d: "One code, sent to your inbox, confirms you're real." },
            { n: "03", t: "Complete tasks", d: "Follow the instructions and submit proof." },
            { n: "04", t: "Get reviewed and paid", d: "A real admin checks your submission and rewards get tracked." },
          ].map((s) => (
            <div key={s.n} style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 18 }}>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#C8FF4D", margin: "0 0 10px" }}>{s.n}</p>
              <p style={{ color: "#F5F5F0", fontSize: 14.5, fontWeight: 600, margin: "0 0 6px" }}>{s.t}</p>
              <p style={{ color: "#9A9A93", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "64px 20px 0" }}>
        <h2 style={sectionHeading}>For projects</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 24 }}>
          {[
            { n: "01", t: "Contact ForgeDesk", d: "Tell us about your campaign idea and goals." },
            { n: "02", t: "We build the campaign", d: "ForgeDesk sets up tasks, rules, and timing." },
            { n: "03", t: "Campaign goes live", d: "Participants join and complete real tasks." },
            { n: "04", t: "Winners get announced", d: "We review, select winners, and track rewards." },
          ].map((s) => (
            <div key={s.n} style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 18 }}>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#C8FF4D", margin: "0 0 10px" }}>{s.n}</p>
              <p style={{ color: "#F5F5F0", fontSize: 14.5, fontWeight: 600, margin: "0 0 6px" }}>{s.t}</p>
              <p style={{ color: "#9A9A93", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{s.d}</p>
            </div>
          ))}
        </div>
        <a href="/request-campaign" style={{ ...secondaryButton, display: "inline-block", marginTop: 24 }}>
          Request a campaign
        </a>
      </section>

      <footer style={{ marginTop: 80, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "32px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: "#F5F5F0", marginBottom: 12 }}>
            Forge<span style={{ color: "#C8FF4D" }}>Desk</span>
          </p>
          <p style={{ color: "#6B6B66", fontSize: 12 }}>© {new Date().getFullYear()} ForgeDesk. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const eyebrow: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 12,
  color: "#C8FF4D",
  margin: "0 0 8px",
};

const sectionHeading: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  fontSize: 22,
  color: "#F5F5F0",
  margin: 0,
};

const primaryButton: React.CSSProperties = {
  padding: "11px 20px",
  background: "#C8FF4D",
  color: "#0D0D0D",
  borderRadius: 7,
  fontWeight: 600,
  fontSize: 14,
  textDecoration: "none",
};

const secondaryButton: React.CSSProperties = {
  padding: "11px 20px",
  background: "#161616",
  color: "#F5F5F0",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 7,
  fontWeight: 600,
  fontSize: 14,
  textDecoration: "none",
};
