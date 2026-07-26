import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserAndSync } from "@/lib/auth-server";

// POST /api/account/reactivate — the user reactivates their own deactivated account.
// Uses allowDisabled so a currently-deactivated user can undo it.
export async function POST(req: Request) {
  try {
    const authResult = await getUserAndSync(req, { allowDisabled: true });
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;

    await prisma.user.update({
      where: { id: user.id },
      data: { disabledAt: null },
    });

    return NextResponse.json({ reactivated: true });
  } catch (error) {
    console.error("[POST /api/account/reactivate] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
