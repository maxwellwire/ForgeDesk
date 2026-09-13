import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

const schema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(200),
});

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
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input" } },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.consumedAt || record.expiresAt < new Date()) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_TOKEN", message: "This reset link is invalid or expired." },
      },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true, data: { reset: true } });
}