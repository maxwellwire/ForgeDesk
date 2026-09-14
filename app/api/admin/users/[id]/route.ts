import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

const schema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "BANNED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionUser();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHENTICATED" } },
      { status: 401 }
    );
  }
  if (!admin.isAdmin) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN" } },
      { status: 403 }
    );
  }

  const { id } = await params;

  if (id === admin.id) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CANNOT_SELF",
          message: "You cannot change your own status.",
        },
      },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND" } },
      { status: 404 }
    );
  }

  if (target.isAdmin && parsed.data.status !== "ACTIVE") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CANNOT_BAN_ADMIN",
          message: "Cannot suspend or ban another admin from this screen.",
        },
      },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { status: parsed.data.status },
    select: {
      id: true,
      email: true,
      username: true,
      status: true,
      emailVerified: true,
    },
  });

  if (parsed.data.status !== "ACTIVE") {
    await prisma.session.deleteMany({ where: { userId: id } });
  }

  return NextResponse.json({ success: true, data: updated });
}