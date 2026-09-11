import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const updateCampaignSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  rules: z.string().max(10000).optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
  status: z
    .enum([
      "DRAFT",
      "SCHEDULED",
      "LIVE",
      "PAUSED",
      "ENDED",
      "WINNERS_SELECTED",
      "COMPLETED",
      "ARCHIVED",
    ])
    .optional(),
  participantLimit: z.number().int().positive().optional().nullable(),
  winnerCount: z.number().int().positive().optional(),
  rewardDescription: z.string().min(1).max(500).optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      project: true,
      tasks: { orderBy: { sortOrder: "asc" } },
      _count: {
        select: {
          participations: true,
          submissions: true,
          winners: true,
        },
      },
    },
  });

  if (!campaign) {
    return NextResponse.json(
      { success: false, error: { code: "CAMPAIGN_NOT_FOUND" } },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: campaign });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateCampaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message,
        },
      },
      { status: 400 }
    );
  }

  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, error: { code: "CAMPAIGN_NOT_FOUND" } },
      { status: 404 }
    );
  }

  const data = parsed.data;
  const startAt = data.startAt ? new Date(data.startAt) : existing.startAt;
  const endAt = data.endAt ? new Date(data.endAt) : existing.endAt;
  if (endAt <= startAt) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "endAt must be after startAt",
        },
      },
      { status: 400 }
    );
  }

  const campaign = await prisma.campaign.update({
    where: { id },
    data: {
      ...data,
      startAt: data.startAt ? new Date(data.startAt) : undefined,
      endAt: data.endAt ? new Date(data.endAt) : undefined,
    },
    include: { project: true, tasks: true },
  });

  return NextResponse.json({ success: true, data: campaign });
}