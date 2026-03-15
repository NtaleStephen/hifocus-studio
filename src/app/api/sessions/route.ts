import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserAndSync } from "@/lib/auth-server";
import { createSessionSchema } from "@/lib/validations";

// POST /api/sessions
// Persist a completed focus session for the authenticated user.
export async function POST(req: Request) {
  try {
    // Authenticate FIRST, before parsing body
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;

    const body = await req.json();
    const parsed = createSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { durationMinutes, type, projectId, taskId, workspaceId } = parsed.data;

    // Validate workspace membership if workspaceId is provided
    if (workspaceId) {
      const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: user.id } },
      });
      if (!membership) {
        return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
      }
    }

    const focusSession = await prisma.focusSession.create({
      data: {
        userId: user.id,
        duration: durationMinutes,
        type,
        projectId: projectId ?? null,
        taskId: taskId ?? null,
        workspaceId: workspaceId ?? null,
      },
    });

    return NextResponse.json({ session: focusSession });
  } catch (error) {
    console.error("[POST /api/sessions] error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
