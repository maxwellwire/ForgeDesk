export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#0D0D0D", color: "#F5F5F0", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}