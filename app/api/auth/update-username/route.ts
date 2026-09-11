import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

const schema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only"),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHENTICATED" } },
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }

  const { username } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing && existing.id !== user.id) {
    return NextResponse.json(
      { success: false, error: { code: "USERNAME_TAKEN" } },
      { status: 409 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { username },
  });

  return NextResponse.json({ success: true, data: { username: updated.username } });
}
