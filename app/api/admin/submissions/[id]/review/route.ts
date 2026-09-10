import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

const reviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "MORE_PROOF_REQUIRED"]),
  note: z.string().max(2000).optional(),
});

const actionToStatus = {
  APPROVE: "APPROVED",
  REJECT: "REJECTED",
  MORE_PROOF_REQUIRED: "MORE_PROOF_REQUIRED",
} as const;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await params;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHENTICATED" } },
      { status: 401 }
    );
  }

  // Admin check happens here, independently, against the database record —
  // never trusting a client-supplied role or a header.
  if (!user.isAdmin) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN" } },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  const { action, note } = parsed.data;
  const newStatus = actionToStatus[action];

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });
  if (!submission) {
    return NextResponse.json(
      { success: false, error: { code: "SUBMISSION_NOT_FOUND" } },
      { status: 404 }
    );
  }

  // Transaction: the status update and its history record must succeed
  // together, or not at all — never leave the audit trail out of sync
  // with the actual state.
  const [updated] = await prisma.$transaction([
    prisma.submission.update({
      where: { id: submissionId },
      data: { status: newStatus },
    }),
    prisma.submissionHistory.create({
      data: {
        submissionId,
        status: newStatus,
        actedBy: user.id,
        note,
      },
    }),
  ]);

  return NextResponse.json({ success: true, data: updated });
}
