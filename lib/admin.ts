import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import type { User } from "@prisma/client";

/**
 * Require an authenticated admin session.
 * Returns the admin user on success, or a NextResponse error to return early.
 */
export async function requireAdmin(): Promise<
  { ok: true; user: User } | { ok: false; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: { code: "UNAUTHENTICATED" } },
        { status: 401 }
      ),
    };
  }
  if (!user.isAdmin) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: { code: "FORBIDDEN" } },
        { status: 403 }
      ),
    };
  }
  return { ok: true, user };
}