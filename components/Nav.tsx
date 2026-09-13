"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Me = { username: string; isAdmin: boolean } | null;

const AUTH_LIKE = new Set(["/login", "/signup", "/request-campaign", "/verify-email"]);

export default function Nav() {
  const pathname = usePathname();
  // undefined = still loading (do not flash Log in / Sign up)
  const [me, setMe] = useState<Me | undefined>(undefined);

  const hideEntireNav = AUTH_LIKE.has(pathname || "");
  const isLanding = pathname === "/";
  const hideNavChrome = isLanding || hideEntireNav;

  useEffect(() => {
    if (hideNavChrome) return;

    let cancelled = false;
    setMe(undefined);

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) setMe(json.data);
        else setMe(null);
      })
      .catch(() => {
        if (!cancelled) setMe(null);
      });

    return () => {
      cancelled = true;
    };
  }, [hideNavChrome, pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (hideEntireNav) {
    return null;
  }

  return (
    <nav
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "#0D0D0D",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "#F5F5F0",
            textDecoration: "none",
          }}
        >
          Forge<span style={{ color: "#C8FF4D" }}>Desk</span>
        </a>

        {!isLanding && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 13.5,
              minHeight: 32,
            }}
          >
            <a href="/campaigns" style={linkStyle}>
              Campaigns
            </a>

            {me === undefined ? (
              <span style={{ color: "#6B6B66", fontSize: 13 }}>…</span>
            ) : me ? (
              <>
                <a href="/dashboard" style={linkStyle}>
                  Dashboard
                </a>
                {me.isAdmin && (
                  <a href="/admin" style={{ ...linkStyle, color: "#C8FF4D" }}>
                    Admin
                  </a>
                )}
                <button onClick={handleLogout} style={logoutButtonStyle}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <a href="/login" style={linkStyle}>
                  Log in
                </a>
                <a href="/signup" style={signupButtonStyle}>
                  Sign up
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#9A9A93",
  textDecoration: "none",
};

const signupButtonStyle: React.CSSProperties = {
  color: "#0D0D0D",
  background: "#C8FF4D",
  padding: "6px 14px",
  borderRadius: 7,
  fontWeight: 600,
  textDecoration: "none",
};

const logoutButtonStyle: React.CSSProperties = {
  color: "#9A9A93",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.15)",
  padding: "6px 12px",
  borderRadius: 7,
  cursor: "pointer",
  fontSize: 13.5,
  fontFamily: "Inter, sans-serif",
};