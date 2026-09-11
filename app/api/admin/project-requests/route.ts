import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET() {
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

  const requests = await prisma.projectRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: requests });
}
