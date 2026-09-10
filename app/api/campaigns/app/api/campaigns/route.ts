import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    where: { status: { in: ["LIVE", "SCHEDULED", "ENDED"] } },
    include: {
      project: true,
      _count: { select: { participations: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: campaigns });
}
