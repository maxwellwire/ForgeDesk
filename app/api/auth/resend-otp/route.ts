import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { issueOtp, OtpCooldownError } from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/email";

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHENTICATED" } },
      { status: 401 }
    );
  }

  if (user.emailVerified) {
    return NextResponse.json({
      success: true,
      data: { alreadyVerified: true },
    });
  }

  try {
    const code = await issueOtp(user.id, "VERIFY_EMAIL");
    await sendVerificationEmail(user.email, code);
  } catch (err) {
    if (err instanceof OtpCooldownError) {
      return NextResponse.json(
        { success: false, error: { code: "OTP_COOLDOWN", message: err.message } },
        { status: 429 }
      );
    }
    throw err;
  }

  return NextResponse.json({ success: true, data: { sent: true } });
}