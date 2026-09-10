import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

const rewardUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONTACTED", "PAID", "FAILED", "CANCELLED"]),
  paymentMethod: z.string().max(200).optional(),
  paymentRef: z.string().max(200).optional(),
  transactionHash: z.string().max(200).optional(),
  adminNotes: z.string().max(2000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: winnerId } = await params;

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
  const parsed = rewardUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  const reward = await prisma.rewardRecord.findUnique({ where: { winnerId } });
  if (!reward) {
    return NextResponse.json(
      { success: false, error: { code: "REWARD_RECORD_NOT_FOUND" } },
      { status: 404 }
    );
  }

  const { status, paymentMethod, paymentRef, transactionHash, adminNotes } =
    parsed.data;

  const updated = await prisma.rewardRecord.update({
    where: { winnerId },
    data: {
      status,
      paymentMethod,
      paymentRef,
      transactionHash,
      adminNotes,
      paidAt: status === "PAID" ? new Date() : reward.paidAt,
    },
  });

  // Reflect a completed payout on the winner record too, so the two
  // stay meaningfully in sync without one silently lagging the other.
  if (status === "PAID") {
    await prisma.winner.update({
      where: { id: winnerId },
      data: { status: "REWARDED" },
    });
  }

  return NextResponse.json({ success: true, data: updated });
}
