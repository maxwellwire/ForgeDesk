import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { issueOtp } from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/email";
import { createSession } from "@/lib/session";

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
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }

  const { firstName, lastName, username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
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
    data: { firstName, lastName, username, email, passwordHash },
  });

  const code = await issueOtp(user.id, "VERIFY_EMAIL");

  try {
    await sendVerificationEmail(user.email, code);
  } catch (err) {
    console.error("Failed to send verification email", err);
  }

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