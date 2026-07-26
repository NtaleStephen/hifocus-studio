import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["deactivate", "reactivate"]),
});

// PATCH /api/admin/users/[id] — admin deactivates/reactivates an account.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // An admin can't deactivate their own account (avoid self-lockout).
    if (id === admin.user.id) {
      return NextResponse.json(
        { error: "You can't change your own account status here." },
        { status: 400 },
      );
    }

    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { disabledAt: parsed.data.action === "deactivate" ? new Date() : null },
      select: { id: true, email: true, disabledAt: true },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("[PATCH /api/admin/users/[id]] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
