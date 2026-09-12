import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import {
  assertSignupEmailVerified,
  consumeSignupOtp,
  SignupEmailNotVerifiedError,
} from "@/lib/signup-otp";

const signupSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only"),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message,
        },
      },
      { status: 400 }
    );
  }

  const { firstName, lastName, username, email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  let otpId: string;
  try {
    otpId = await assertSignupEmailVerified(normalizedEmail);
  } catch (err) {
    if (err instanceof SignupEmailNotVerifiedError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EMAIL_VERIFICATION_REQUIRED", message: err.message },
        },
        { status: 403 }
      );
    }
    throw err;
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: normalizedEmail }, { username }] },
  });
  if (existing) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ACCOUNT_EXISTS",
          message: "An account with these details already exists",
        },
      },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      username,
      email: normalizedEmail,
      passwordHash,
      emailVerified: true,
    },
  });

  await consumeSignupOtp(otpId);
  await createSession(user.id);

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      emailVerified: user.emailVerified,
    },
  });
}