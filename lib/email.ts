import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "ForgeDesk <no-reply@forgedesk.dev>";

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your ForgeDesk email",
    html: shell(`
      <p style="color:#F5F5F0;font-size:16px;margin:0 0 8px;">Verify your email</p>
      <p style="color:#9A9A93;font-size:13px;margin:0 0 24px;">Your ForgeDesk verification code is:</p>
      <p style="color:#C8FF4D;font-size:32px;font-weight:700;letter-spacing:4px;margin:0 0 24px;font-family:monospace;">${code}</p>
      <p style="color:#9A9A93;font-size:12px;margin:0;">This code expires in 10 minutes.</p>
    `),
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your ForgeDesk password",
    html: shell(`
      <p style="color:#F5F5F0;font-size:16px;margin:0 0 8px;">Password reset</p>
      <p style="color:#9A9A93;font-size:13px;margin:0 0 24px;">Click the button below to set a new password. This link expires in 30 minutes.</p>
      <a href="${resetUrl}" style="display:inline-block;background:#C8FF4D;color:#0D0D0D;padding:12px 18px;border-radius:7px;font-weight:600;text-decoration:none;font-size:14px;">Reset password</a>
      <p style="color:#6B6B66;font-size:11px;margin:24px 0 0;word-break:break-all;">Or open: ${resetUrl}</p>
    `),
  });
}

export async function sendCampaignRequestEmail(payload: {
  projectName: string;
  contactName: string;
  email: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  details: string;
}): Promise<void> {
  const raw = process.env.CAMPAIGN_REQUEST_TO || process.env.EMAIL_FROM || "hello@forgedesk.dev";
  const to =
    typeof raw === "string" && raw.includes("<")
      ? raw.match(/<([^>]+)>/)?.[1] || raw
      : raw;

  await resend.emails.send({
    from: FROM,
    to,
    replyTo: payload.email,
    subject: `Campaign request: ${payload.projectName}`,
    html: shell(`
      <p style="color:#F5F5F0;font-size:16px;margin:0 0 16px;">New campaign request</p>
      <p style="color:#9A9A93;font-size:13px;line-height:1.6;white-space:pre-wrap;">Project: ${escapeHtml(payload.projectName)}
Contact: ${escapeHtml(payload.contactName)}
Email: ${escapeHtml(payload.email)}
Website: ${escapeHtml(payload.website || "—")}
X/Twitter: ${escapeHtml(payload.twitter || "—")}
Telegram: ${escapeHtml(payload.telegram || "—")}

Details:
${escapeHtml(payload.details)}</p>
    `),
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(inner: string) {
  return `<div style="background:#0D0D0D;padding:40px 20px;font-family:sans-serif;">
    <div style="max-width:420px;margin:0 auto;background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:32px;">
      <p style="color:#F5F5F0;font-weight:700;font-size:18px;margin:0 0 24px;">Forge<span style="color:#C8FF4D;">Desk</span></p>
      ${inner}
    </div>
  </div>`;
}