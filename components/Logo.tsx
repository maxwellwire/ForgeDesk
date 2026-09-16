type LogoProps = {
  height?: number;
  href?: string;
};

export default function Logo({ height = 28, href = "/" }: LogoProps) {
  const img = (
    <img
      src="/forgedesk-logo.jpg"
      alt="ForgeDesk"
      height={height}
      style={{
        height,
        width: "auto",
        display: "block",
        objectFit: "contain",
      }}
    />
  );

  if (!href) return img;

  return (
    <a
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        textDecoration: "none",
        lineHeight: 0,
      }}
    >
      {img}
    </a>
  );
}