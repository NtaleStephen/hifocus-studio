import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserAndSync } from "@/lib/auth-server";

// POST /api/sessions
// Persist a completed focus session for the authenticated user.
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { durationMinutes, type, projectId, taskId, workspaceId } = json as {
      durationMinutes?: number;
      type?: string;
      projectId?: string;
      taskId?: string;
      workspaceId?: string;
    };

    if (!durationMinutes || durationMinutes <= 0) {
      return NextResponse.json(
        { error: "Invalid durationMinutes" },
        { status: 400 },
      );
    }

    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;

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
        type: type ?? "pomodoro",
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
