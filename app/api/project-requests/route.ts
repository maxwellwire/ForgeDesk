import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  projectName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  website: z.string().optional(),
  twitter: z.string().optional(),
  telegram: z.string().optional(),
  discord: z.string().optional(),
  description: z.string().min(1),
  campaignIdea: z.string().min(1),
  campaignType: z.string().optional(),
  estimatedParticipants: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }

  const request = await prisma.projectRequest.create({
    data: { ...parsed.data, status: "NEW" },
  });

  return NextResponse.json({ success: true, data: { id: request.id } });
}
