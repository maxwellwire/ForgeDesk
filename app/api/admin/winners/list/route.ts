import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId") || undefined;

  const winners = await prisma.winner.findMany({
    where: campaignId ? { campaignId } : undefined,
    include: {
      user: {
        select: { id: true, username: true, email: true },
      },
      campaign: { select: { id: true, title: true } },
      reward: true,
    },
    orderBy: { selectedAt: "desc" },
  });

  return NextResponse.json({ success: true, data: winners });
}