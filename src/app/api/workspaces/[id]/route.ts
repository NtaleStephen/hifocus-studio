import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserAndSync } from "@/lib/auth-server";

// Helper: get the authenticated user's membership role in a workspace (or null)
async function getMembership(userId: string, workspaceId: string) {
  return prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
}

// GET /api/workspaces/[id] — fetch workspace details + members
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const { id } = await params;

    // Confirm membership
    const membership = await getMembership(user.id, id);
    if (!membership) {
      return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, email: true } },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    return NextResponse.json({ workspace, userRole: membership.role });
  } catch (error) {
    console.error("[GET /api/workspaces/[id]] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/workspaces/[id] — update workspace name / logoUrl
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const { id } = await params;

    const membership = await getMembership(user.id, id);
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, logoUrl } = body as { name?: string; logoUrl?: string };

    const workspace = await prisma.workspace.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
    });

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("[PATCH /api/workspaces/[id]] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/workspaces/[id] — delete workspace (owner only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const { id } = await params;

    const membership = await getMembership(user.id, id);
    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json({ error: "Only the owner can delete a workspace" }, { status: 403 });
    }

    await prisma.workspace.delete({ where: { id } });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/workspaces/[id]] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
