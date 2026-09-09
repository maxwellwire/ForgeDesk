import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHENTICATED" } },
      { status: 401 }
    );
  }

  // This is the rule the whole platform depends on: no participation
  // until the email is verified. Checked here, server-side, against
  // the database record — never trusting anything the client claims.
  if (!user.emailVerified) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "EMAIL_VERIFICATION_REQUIRED",
          message: "Please verify your email before participating in campaigns.",
        },
      },
      { status: 403 }
    );
  }

  if (user.status !== "ACTIVE") {
    return NextResponse.json(
      { success: false, error: { code: "ACCOUNT_NOT_ACTIVE" } },
      { status: 403 }
    );
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    return NextResponse.json(
      { success: false, error: { code: "CAMPAIGN_NOT_FOUND" } },
      { status: 404 }
    );
  }

  if (campaign.status !== "LIVE") {
    return NextResponse.json(
      { success: false, error: { code: "CAMPAIGN_NOT_LIVE" } },
      { status: 400 }
    );
  }

  const now = new Date();
  if (campaign.endAt < now) {
    return NextResponse.json(
      { success: false, error: { code: "CAMPAIGN_ENDED" } },
      { status: 400 }
    );
  }

  if (campaign.participantLimit !== null) {
    const currentCount = await prisma.participation.count({
      where: { campaignId },
    });
    if (currentCount >= campaign.participantLimit) {
      return NextResponse.json(
        { success: false, error: { code: "PARTICIPANT_LIMIT_REACHED" } },
        { status: 400 }
      );
    }
  }

  try {
    const participation = await prisma.participation.create({
      data: { userId: user.id, campaignId },
    });
    return NextResponse.json({ success: true, data: participation });
  } catch (err: any) {
    // P2002 = unique constraint violation. The database-level
    // [campaignId, userId] constraint is the real defense against
    // duplicate participation — this catches the race-condition case
    // where two requests slip past the check above at the same instant.
    if (err.code === "P2002") {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_PARTICIPATING" } },
        { status: 409 }
      );
    }
    throw err;
  }
}
