import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

const selectWinnerSchema = z.object({
  campaignId: z.string(),
  userId: z.string(),
  rewardDescription: z.string().min(1),
  adminNotes: z.string().max(2000).optional(),
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
  const parsed = selectWinnerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }
  const { campaignId, userId, rewardDescription, adminNotes } = parsed.data;

  // Winner must have an actual approved submission for this campaign —
  // an admin cannot select someone who never participated or was never
  // approved, no matter what the request claims.
  const approvedSubmission = await prisma.submission.findFirst({
    where: { campaignId, userId, status: "APPROVED" },
  });
  if (!approvedSubmission) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NO_APPROVED_SUBMISSION",
          message: "This user has no approved submission for this campaign.",
        },
      },
      { status: 400 }
    );
  }

  try {
    // Winner creation and its reward-tracking record happen together —
    // every winner should have exactly one reward record from the start.
    const winner = await prisma.$transaction(async (tx) => {
      const w = await tx.winner.create({
        data: {
          campaignId,
          userId,
          selectedBy: admin.id,
          rewardDescription,
          adminNotes,
          status: "SELECTED",
        },
      });
      await tx.rewardRecord.create({
        data: { winnerId: w.id, status: "PENDING" },
      });
      return w;
    });

    return NextResponse.json({ success: true, data: winner });
  } catch (err: any) {
    // The [campaignId, userId] unique constraint stops an admin from
    // accidentally creating the same winner twice.
    if (err.code === "P2002") {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_A_WINNER" } },
        { status: 409 }
      );
    }
    throw err;
  }
}
