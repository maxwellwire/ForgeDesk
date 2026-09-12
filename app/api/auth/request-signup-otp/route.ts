import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import {
  issueSignupOtp,
  SignupOtpCooldownError,
} from "@/lib/signup-otp";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Valid email required" } },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ACCOUNT_EXISTS",
          message: "An account with this email already exists. Log in instead.",
        },
      },
      { status: 409 }
    );
  }

  try {
    const code = await issueSignupOtp(email);
    try {
      await sendVerificationEmail(email, code);
    } catch (err) {
      console.error("Failed to send signup OTP email", err);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_SEND_FAILED",
            message: "Could not send verification email. Try again later.",
          },
        },
        { status: 502 }
      );
    }
    return NextResponse.json({ success: true, data: { email, sent: true } });
  } catch (err) {
    if (err instanceof SignupOtpCooldownError) {
      return NextResponse.json(
        { success: false, error: { code: "COOLDOWN", message: err.message } },
        { status: 429 }
      );
    }
    throw err;
  }
}