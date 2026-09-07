import crypto from "crypto";
import { prisma } from "./db";
import { OtpPurpose } from "@prisma/client";

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

function getOtpSecret(): string {
  const secret = process.env.OTP_SECRET;
  if (!secret) {
    throw new Error("OTP_SECRET is not set");
  }
  return secret;
}

function hashCode(code: string): string {
  return crypto.createHmac("sha256", getOtpSecret()).update(code).digest("hex");
}

function generateSixDigitCode(): string {
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
}

export class OtpCooldownError extends Error {}
export class OtpInvalidError extends Error {}
export class OtpExpiredError extends Error {}
export class OtpTooManyAttemptsError extends Error {}

export async function issueOtp(
  userId: string,
  purpose: OtpPurpose
): Promise<string> {
  const recent = await prisma.emailOtp.findFirst({
    where: { userId, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (recent) {
    const secondsSinceIssued =
      (Date.now() - recent.createdAt.getTime()) / 1000;
    if (secondsSinceIssued < RESEND_COOLDOWN_SECONDS) {
      throw new OtpCooldownError(
        `Wait ${Math.ceil(
          RESEND_COOLDOWN_SECONDS - secondsSinceIssued
        )}s before requesting another code`
      );
    }
    await prisma.emailOtp.update({
      where: { id: recent.id },
      data: { consumedAt: new Date() },
    });
  }

  const code = generateSixDigitCode();
  await prisma.emailOtp.create({
    data: {
      userId,
      purpose,
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });

  return code;
}

export async function verifyOtp(
  userId: string,
  purpose: OtpPurpose,
  submittedCode: string
): Promise<void> {
  const otp = await prisma.emailOtp.findFirst({
    where: { userId, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new OtpInvalidError("No active code for this account");
  }

  if (otp.expiresAt < new Date()) {
    throw new OtpExpiredError("Code has expired");
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    throw new OtpTooManyAttemptsError("Too many incorrect attempts");
  }

  const submittedHash = hashCode(submittedCode);
  const matches = crypto.timingSafeEqual(
    Buffer.from(submittedHash, "hex"),
    Buffer.from(otp.codeHash, "hex")
  );

  if (!matches) {
    await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    throw new OtpInvalidError("Incorrect code");
  }

  await prisma.emailOtp.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });
}