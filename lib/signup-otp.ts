import crypto from "crypto";
import { prisma } from "./db";

const OTP_TTL_MINUTES = 10;
const VERIFY_WINDOW_MINUTES = 30;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

function getOtpSecret(): string {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error("OTP_SECRET is not set");
  return secret;
}

function hashCode(code: string): string {
  return crypto.createHmac("sha256", getOtpSecret()).update(code).digest("hex");
}

function generateSixDigitCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export class SignupOtpCooldownError extends Error {}
export class SignupOtpInvalidError extends Error {}
export class SignupOtpExpiredError extends Error {}
export class SignupOtpTooManyAttemptsError extends Error {}
export class SignupEmailNotVerifiedError extends Error {}

export async function issueSignupOtp(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();

  const recent = await prisma.signupOtp.findFirst({
    where: { email: normalized, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (recent) {
    const secondsSince = (Date.now() - recent.createdAt.getTime()) / 1000;
    if (secondsSince < RESEND_COOLDOWN_SECONDS) {
      throw new SignupOtpCooldownError(
        `Wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSince)}s before requesting another code`
      );
    }
    await prisma.signupOtp.update({
      where: { id: recent.id },
      data: { consumedAt: new Date() },
    });
  }

  const code = generateSixDigitCode();
  await prisma.signupOtp.create({
    data: {
      email: normalized,
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });

  return code;
}

export async function verifySignupOtp(email: string, code: string): Promise<void> {
  const normalized = email.trim().toLowerCase();

  const otp = await prisma.signupOtp.findFirst({
    where: { email: normalized, consumedAt: null, verifiedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) throw new SignupOtpInvalidError("No active code for this email");
  if (otp.expiresAt < new Date()) throw new SignupOtpExpiredError("Code has expired");
  if (otp.attempts >= MAX_ATTEMPTS) {
    throw new SignupOtpTooManyAttemptsError("Too many incorrect attempts");
  }

  const matches = crypto.timingSafeEqual(
    Buffer.from(hashCode(code), "hex"),
    Buffer.from(otp.codeHash, "hex")
  );

  if (!matches) {
    await prisma.signupOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    throw new SignupOtpInvalidError("Incorrect code");
  }

  await prisma.signupOtp.update({
    where: { id: otp.id },
    data: { verifiedAt: new Date() },
  });
}

/** Ensures this email completed OTP verify recently and hasn't been used to sign up yet. */
export async function assertSignupEmailVerified(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();

  const otp = await prisma.signupOtp.findFirst({
    where: {
      email: normalized,
      verifiedAt: { not: null },
      consumedAt: null,
    },
    orderBy: { verifiedAt: "desc" },
  });

  if (!otp || !otp.verifiedAt) {
    throw new SignupEmailNotVerifiedError("Verify your email with the OTP before creating an account");
  }

  const ageMs = Date.now() - otp.verifiedAt.getTime();
  if (ageMs > VERIFY_WINDOW_MINUTES * 60 * 1000) {
    throw new SignupEmailNotVerifiedError("Email verification expired — request a new code");
  }

  return otp.id;
}

export async function consumeSignupOtp(otpId: string): Promise<void> {
  await prisma.signupOtp.update({
    where: { id: otpId },
    data: { consumedAt: new Date() },
  });
}