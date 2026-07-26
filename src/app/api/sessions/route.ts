import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserAndSync } from "@/lib/auth-server";
import { createSessionSchema } from "@/lib/validations";
import { isWorkspaceMember, ownsProject, ownsTask } from "@/lib/ownership";

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

    const { durationMinutes, type, projectId, taskId, workspaceId, startedAt } = parsed.data;

    // Ensure the caller may reference each provided foreign key (prevents IDOR).
    if (workspaceId && !(await isWorkspaceMember(user.id, workspaceId))) {
      return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
    }
    if (projectId && !(await ownsProject(user.id, projectId))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (taskId && !(await ownsTask(user.id, taskId))) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const focusSession = await prisma.focusSession.create({
      data: {
        userId: user.id,
        duration: durationMinutes,
        type,
        projectId: projectId ?? null,
        taskId: taskId ?? null,
        workspaceId: workspaceId ?? null,
        startedAt: startedAt ? new Date(startedAt) : null,
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
