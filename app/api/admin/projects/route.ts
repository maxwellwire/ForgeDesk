import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const createProjectSchema = z.object({
  name: z.string().min(1).max(120),
  logoUrl: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  twitter: z.string().max(200).optional().nullable(),
  telegram: z.string().max(200).optional().nullable(),
  discord: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const projects = await prisma.project.findMany({
    include: {
      _count: { select: { campaigns: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: projects });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const parsed = createProjectSchema.safeParse(body);
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

  const project = await prisma.project.create({ data: parsed.data });
  return NextResponse.json({ success: true, data: project }, { status: 201 });
}