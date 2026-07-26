import { NextResponse } from "next/server";
import { getUserAndSync } from "@/lib/auth-server";

// GET /api/account/status — report whether the signed-in account is deactivated.
// Bypasses the disabled gate so the client can show a reactivation screen.
export async function GET(req: Request) {
  try {
    const authResult = await getUserAndSync(req, { allowDisabled: true });
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    return NextResponse.json({ disabled: user.disabledAt !== null });
  } catch (error) {
    console.error("[GET /api/account/status] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
