import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      project: true,
      tasks: { orderBy: { sortOrder: "asc" } },
      _count: { select: { participations: true } },
    },
  });

  if (!campaign) {
    return NextResponse.json(
      { success: false, error: { code: "CAMPAIGN_NOT_FOUND" } },
      { status: 404 }
    );
  }

  const user = await getSessionUser();
  let isParticipating = false;
  if (user) {
    const participation = await prisma.participation.findUnique({
      where: { campaignId_userId: { campaignId: id, userId: user.id } },
    });
    isParticipating = !!participation;
  }

  return NextResponse.json({
    success: true,
    data: { ...campaign, isParticipating },
  });
}
