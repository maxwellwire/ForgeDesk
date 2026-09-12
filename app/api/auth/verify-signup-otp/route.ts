import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  verifySignupOtp,
  SignupOtpInvalidError,
  SignupOtpExpiredError,
  SignupOtpTooManyAttemptsError,
} from "@/lib/signup-otp";

const schema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(10),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Email and code required" } },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const code = parsed.data.code.trim();

  try {
    await verifySignupOtp(email, code);
    return NextResponse.json({ success: true, data: { email, verified: true } });
  } catch (err) {
    if (err instanceof SignupOtpExpiredError) {
      return NextResponse.json(
        { success: false, error: { code: "OTP_EXPIRED", message: err.message } },
        { status: 400 }
      );
    }
    if (err instanceof SignupOtpTooManyAttemptsError) {
      return NextResponse.json(
        { success: false, error: { code: "OTP_LOCKED", message: err.message } },
        { status: 400 }
      );
    }
    if (err instanceof SignupOtpInvalidError) {
      return NextResponse.json(
        { success: false, error: { code: "OTP_INVALID", message: err.message } },
        { status: 400 }
      );
    }
    throw err;
  }
}