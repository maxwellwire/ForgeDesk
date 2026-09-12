import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

const submissionSchema = z.object({
  campaignId: z.string(),
  taskId: z.string(),
  proofUrl: z.string().url().optional(),
  proofText: z.string().max(5000).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHENTICATED" } },
      { status: 401 }
    );
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { success: false, error: { code: "EMAIL_VERIFICATION_REQUIRED" } },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  const { campaignId, taskId, proofUrl, proofText } = parsed.data;

  if (!proofUrl && !proofText) {
    return NextResponse.json(
      { success: false, error: { code: "PROOF_REQUIRED" } },
      { status: 400 }
    );
  }

  const participation = await prisma.participation.findUnique({
    where: { campaignId_userId: { campaignId, userId: user.id } },
  });
  if (!participation) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_PARTICIPATING" } },
      { status: 403 }
    );
  }

  const task = await prisma.campaignTask.findUnique({ where: { id: taskId } });
  if (!task || task.campaignId !== campaignId) {
    return NextResponse.json(
      { success: false, error: { code: "TASK_NOT_FOUND" } },
      { status: 404 }
    );
  }

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.status !== "LIVE" || campaign.endAt < new Date()) {
    return NextResponse.json(
      { success: false, error: { code: "CAMPAIGN_NOT_ACCEPTING_SUBMISSIONS" } },
      { status: 400 }
    );
  }

  // One submission per user per task (unless rejected / more proof required)
  const existing = await prisma.submission.findFirst({
    where: { userId: user.id, taskId },
    orderBy: { createdAt: "desc" },
  });
  if (
    existing &&
    existing.status !== "REJECTED" &&
    existing.status !== "MORE_PROOF_REQUIRED"
  ) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SUBMISSION_ALREADY_EXISTS",
          message:
            existing.status === "APPROVED"
              ? "This task is already approved. You cannot submit again."
              : "You already submitted proof for this task. Wait for review.",
        },
      },
      { status: 409 }
    );
  }

  const submission = await prisma.submission.create({
    data: {
      userId: user.id,
      campaignId,
      taskId,
      proofUrl,
      proofText,
      status: "PENDING",
    },
  });

  await prisma.submissionHistory.create({
    data: {
      submissionId: submission.id,
      status: "PENDING",
      actedBy: user.id,
      note: "Submission created by participant",
    },
  });

  return NextResponse.json({ success: true, data: submission });
}