import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import {
  verifyOtp,
  OtpExpiredError,
  OtpInvalidError,
  OtpTooManyAttemptsError,
} from "@/lib/otp";

const verifySchema = z.object({
  code: z.string().length(6).regex(/^\d+$/),
});

export async function POST(req: NextRequest) {
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
      data: { emailVerified: true, alreadyVerified: true },
    });
  }

  const body = await req.json();
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  try {
    await verifyOtp(user.id, "VERIFY_EMAIL", parsed.data.code);
  } catch (err) {
    if (err instanceof OtpExpiredError) {
      return NextResponse.json(
        { success: false, error: { code: "OTP_EXPIRED" } },
        { status: 400 }
      );
    }
    if (err instanceof OtpTooManyAttemptsError) {
      return NextResponse.json(
        { success: false, error: { code: "OTP_TOO_MANY_ATTEMPTS" } },
        { status: 429 }
      );
    }
    if (err instanceof OtpInvalidError) {
      return NextResponse.json(
        { success: false, error: { code: "OTP_INVALID" } },
        { status: 400 }
      );
    }
    throw err;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  });

  return NextResponse.json({ success: true, data: { emailVerified: true } });
}