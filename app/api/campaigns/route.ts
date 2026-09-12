import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    where: { status: { in: ["LIVE", "SCHEDULED", "ENDED", "WINNERS_SELECTED", "COMPLETED"] } },
    include: {
      project: { select: { id: true, name: true } },
      _count: { select: { participations: true, tasks: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const rank: Record<string, number> = {
    LIVE: 0,
    SCHEDULED: 1,
    ENDED: 2,
    WINNERS_SELECTED: 3,
    COMPLETED: 4,
  };
  campaigns.sort(
    (a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9) || b.createdAt.getTime() - a.createdAt.getTime()
  );

  return NextResponse.json({ success: true, data: campaigns });
}