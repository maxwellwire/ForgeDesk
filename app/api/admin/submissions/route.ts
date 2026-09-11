import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import type { SubmissionStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId") || undefined;
  const status = searchParams.get("status") as SubmissionStatus | null;
  const limit = Math.min(Number(searchParams.get("limit") || 50), 200);

  const where: {
    campaignId?: string;
    status?: SubmissionStatus;
  } = {};
  if (campaignId) where.campaignId = campaignId;
  if (
    status &&
    [
      "PENDING",
      "UNDER_REVIEW",
      "APPROVED",
      "REJECTED",
      "MORE_PROOF_REQUIRED",
    ].includes(status)
  ) {
    where.status = status;
  }

  const submissions = await prisma.submission.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          emailVerified: true,
        },
      },
      campaign: { select: { id: true, title: true, status: true } },
      task: { select: { id: true, title: true, type: true } },
      history: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ success: true, data: submissions });
}