import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserAndSync } from "@/lib/auth-server";

// POST /api/account/deactivate — the signed-in user deactivates their own account.
export async function POST(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;

    await prisma.user.update({
      where: { id: user.id },
      data: { disabledAt: new Date() },
    });

    return NextResponse.json({ deactivated: true });
  } catch (error) {
    console.error("[POST /api/account/deactivate] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
