import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "ForgeDesk <no-reply@forgedesk.dev>";

export async function sendVerificationEmail(
  to: string,
  code: string
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your ForgeDesk email",
    html: verificationEmailHtml(code),
  });
}

function verificationEmailHtml(code: string): string {
  return `
  <div style="background:#0D0D0D;padding:40px 20px;font-family:sans-serif;">
    <div style="max-width:420px;margin:0 auto;background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:32px;">
      <p style="color:#F5F5F0;font-weight:700;font-size:18px;margin:0 0 24px;">
        Forge<span style="color:#C8FF4D;">Desk</span>
      </p>
      <p style="color:#F5F5F0;font-size:16px;margin:0 0 8px;">Verify your email</p>
      <p style="color:#9A9A93;font-size:13px;margin:0 0 24px;">
        Your ForgeDesk verification code is:
      </p>
      <p style="color:#C8FF4D;font-size:32px;font-weight:700;letter-spacing:4px;margin:0 0 24px;font-family:monospace;">
        ${code}
      </p>
      <p style="color:#9A9A93;font-size:12px;margin:0;">
        This code expires in 10 minutes. If you didn't create this account,
        you can ignore this email.
      </p>
    </div>
  </div>`;
}