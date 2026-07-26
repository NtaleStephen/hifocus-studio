import { NextResponse } from "next/server";
import { getUserAndSync } from "@/lib/auth-server";
import { isAdminEmail } from "@/lib/admin";

// GET /api/admin/session — lightweight admin check for the client guard.
export async function GET(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }
    return NextResponse.json({ isAdmin: isAdminEmail(authResult.user.email) });
  } catch (error) {
    console.error("[GET /api/admin/session] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
