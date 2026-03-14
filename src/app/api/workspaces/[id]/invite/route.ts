import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserAndSync } from "@/lib/auth-server";

// POST /api/workspaces/[id]/invite — invite a user by email
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const { id: workspaceId } = await params;

    // Only OWNER or ADMIN can invite
    const inviterMembership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
    });

    if (!inviterMembership || (inviterMembership.role !== "OWNER" && inviterMembership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { email, role } = body as { email?: string; role?: string };

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const validRoles = ["ADMIN", "MEMBER"];
    const memberRole = validRoles.includes(role ?? "") ? role! : "MEMBER";

    // Find the invited user in our DB
    const invitee = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!invitee) {
      return NextResponse.json(
        { error: "User not found. They must sign up for Hifocus first." },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMembership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: invitee.id } },
    });

    if (existingMembership) {
      return NextResponse.json({ error: "User is already a member of this workspace." }, { status: 409 });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: invitee.id,
        role: memberRole as "ADMIN" | "MEMBER",
      },
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/workspaces/[id]/invite] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
