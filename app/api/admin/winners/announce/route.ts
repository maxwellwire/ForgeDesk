import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

const announceSchema = z.object({
  winnerIds: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
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

  const body = await req.json();
  const parsed = announceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  const { winnerIds } = parsed.data;

  // Only winners currently in SELECTED move to ANNOUNCED — prevents
  // accidentally re-announcing someone already further along (REWARDED,
  // DISQUALIFIED, etc.) via a stale or reused request.
  const result = await prisma.winner.updateMany({
    where: { id: { in: winnerIds }, status: "SELECTED" },
    data: { status: "ANNOUNCED" },
  });

  return NextResponse.json({
    success: true,
    data: { announcedCount: result.count },
  });
}
