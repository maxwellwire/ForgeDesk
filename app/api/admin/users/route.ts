import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const status = searchParams.get("status");
  const verified = searchParams.get("verified");

  const where: Record<string, unknown> = {};

  if (status && status !== "all") {
    where.status = status;
  }
  if (verified === "true") where.emailVerified = true;
  if (verified === "false") where.emailVerified = false;

  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { username: { contains: q, mode: "insensitive" } },
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
    ];
  }

  const [users, total, verifiedCount, bannedCount, suspendedCount, activeCount] =
    await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          emailVerified: true,
          status: true,
          isAdmin: true,
          createdAt: true,
          _count: {
            select: {
              participations: true,
              submissions: true,
            },
          },
        },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { emailVerified: true } }),
      prisma.user.count({ where: { status: "BANNED" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      prisma.user.count({ where: { status: "ACTIVE" } }),
    ]);

  return NextResponse.json({
    success: true,
    data: {
      users,
      stats: {
        total,
        verified: verifiedCount,
        unverified: total - verifiedCount,
        active: activeCount,
        suspended: suspendedCount,
        banned: bannedCount,
      },
    },
  });
}