import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  const genericError = () =>
    NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Incorrect email or password" },
      },
      { status: 401 }
    );

  if (!user) {
    return genericError();
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return genericError();
  }

  if (user.status !== "ACTIVE") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ACCOUNT_NOT_ACTIVE",
          message: "This account is suspended or banned",
        },
      },
      { status: 403 }
    );
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