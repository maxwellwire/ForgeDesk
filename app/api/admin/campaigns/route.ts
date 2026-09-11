import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const createCampaignSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens"),
  description: z.string().min(1).max(5000),
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
    .optional()
    .default("DRAFT"),
  participantLimit: z.number().int().positive().optional().nullable(),
  winnerCount: z.number().int().positive(),
  rewardDescription: z.string().min(1).max(500),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const campaigns = await prisma.campaign.findMany({
    include: {
      project: true,
      _count: {
        select: {
          participations: true,
          submissions: true,
          winners: true,
          tasks: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: campaigns });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const parsed = createCampaignSchema.safeParse(body);
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

  const data = parsed.data;
  if (new Date(data.endAt) <= new Date(data.startAt)) {
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

  const project = await prisma.project.findUnique({
    where: { id: data.projectId },
  });
  if (!project) {
    return NextResponse.json(
      { success: false, error: { code: "PROJECT_NOT_FOUND" } },
      { status: 404 }
    );
  }

  try {
    const campaign = await prisma.campaign.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        slug: data.slug,
        description: data.description,
        rules: data.rules ?? null,
        coverImageUrl: data.coverImageUrl ?? null,
        status: data.status,
        participantLimit: data.participantLimit ?? null,
        winnerCount: data.winnerCount,
        rewardDescription: data.rewardDescription,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
      },
      include: { project: true },
    });
    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === "P2002") {
      return NextResponse.json(
        { success: false, error: { code: "SLUG_ALREADY_EXISTS" } },
        { status: 409 }
      );
    }
    throw err;
  }
}