import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

function getOtpSecret() {
  const s = process.env.OTP_SECRET;
  if (!s) throw new Error("OTP_SECRET is not set");
  return s;
}

function hashToken(token: string) {
  return crypto.createHmac("sha256", getOtpSecret()).update(token).digest("hex");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ success: true, data: { sent: true } });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://forge-desk-benjamin-2fef.vercel.app";
  const resetUrl = `${base.replace(/\/$/, "")}/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    console.error("Failed to send password reset email", err);
  }

  return NextResponse.json({ success: true, data: { sent: true } });
}