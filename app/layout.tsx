import type { Metadata } from "next";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: {
    default: "ForgeDesk",
    template: "%s · ForgeDesk",
  },
  description:
    "Proof-of-completion campaigns for Web3. Post the task, collect the proof, review every submission before rewards go out.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          background: "#0D0D0D",
          color: "#F5F5F0",
          margin: 0,
          fontFamily: "Inter, system-ui, sans-serif",
          minHeight: "100vh",
        }}
      >
        <Nav />
        {children}
      </body>
    </html>
  );
}