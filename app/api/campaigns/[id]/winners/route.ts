import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: {
      id: true,
      title: true,
      slug: true,
      rewardDescription: true,
      status: true,
      project: { select: { name: true } },
    },
  });

  if (!campaign) {
    return NextResponse.json(
      { success: false, error: { code: "CAMPAIGN_NOT_FOUND" } },
      { status: 404 }
    );
  }

  const winners = await prisma.winner.findMany({
    where: {
      campaignId: campaign.id,
      status: { in: ["ANNOUNCED", "REWARDED"] },
    },
    orderBy: { selectedAt: "asc" },
    select: {
      id: true,
      status: true,
      rewardDescription: true,
      selectedAt: true,
      user: { select: { username: true } },
    },
  });

  return NextResponse.json({
    success: true,
    data: { campaign, winners },
  });
}