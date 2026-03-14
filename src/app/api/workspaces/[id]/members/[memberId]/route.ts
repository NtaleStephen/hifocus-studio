import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserAndSync } from "@/lib/auth-server";

// PATCH /api/workspaces/[id]/members/[memberId] — change a member's role
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const { id: workspaceId, memberId } = await params;

    // Only OWNER can change roles
    const requesterMembership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
    });

    if (!requesterMembership || requesterMembership.role !== "OWNER") {
      return NextResponse.json({ error: "Only the workspace owner can change roles." }, { status: 403 });
    }

    const body = await req.json();
    const { role } = body as { role?: string };

    const validRoles = ["ADMIN", "MEMBER"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be ADMIN or MEMBER." }, { status: 400 });
    }

    // Prevent downgrading the owner themselves
    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (targetMember.role === "OWNER") {
      return NextResponse.json({ error: "Cannot change the owner's role." }, { status: 400 });
    }

    const updated = await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: role as "ADMIN" | "MEMBER" },
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    return NextResponse.json({ member: updated });
  } catch (error) {
    console.error("[PATCH /api/workspaces/[id]/members/[memberId]] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/workspaces/[id]/members/[memberId] — remove a member
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const { id: workspaceId, memberId } = await params;

    const requesterMembership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
    });

    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Allow self-removal OR owner/admin removing others
    const isSelf = targetMember.userId === user.id;
    const isPrivileged = requesterMembership?.role === "OWNER" || requesterMembership?.role === "ADMIN";

    if (!isSelf && !isPrivileged) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (targetMember.role === "OWNER") {
      return NextResponse.json({ error: "The owner cannot be removed. Transfer ownership first." }, { status: 400 });
    }

    await prisma.workspaceMember.delete({ where: { id: memberId } });

    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error("[DELETE /api/workspaces/[id]/members/[memberId]] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
