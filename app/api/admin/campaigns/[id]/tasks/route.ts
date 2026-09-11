import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const createTaskSchema = z.object({
  type: z.enum([
    "FOLLOW",
    "LIKE",
    "REPOST",
    "POST",
    "COMMENT",
    "JOIN_COMMUNITY",
    "REFERRAL",
    "MEME",
    "VIDEO",
    "IMAGE",
    "CUSTOM",
  ]),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  instructions: z.string().min(1).max(5000),
  required: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id: campaignId } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    return NextResponse.json(
      { success: false, error: { code: "CAMPAIGN_NOT_FOUND" } },
      { status: 404 }
    );
  }

  const tasks = await prisma.campaignTask.findMany({
    where: { campaignId },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ success: true, data: tasks });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id: campaignId } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    return NextResponse.json(
      { success: false, error: { code: "CAMPAIGN_NOT_FOUND" } },
      { status: 404 }
    );
  }

  const body = await req.json();
  const parsed = createTaskSchema.safeParse(body);
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

  const task = await prisma.campaignTask.create({
    data: {
      campaignId,
      ...parsed.data,
    },
  });

  return NextResponse.json({ success: true, data: task }, { status: 201 });
}