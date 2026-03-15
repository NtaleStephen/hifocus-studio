import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserAndSync } from "@/lib/auth-server";
import { FEATURE_GATES, type Plan } from "@/lib/features";
import { createTaskSchema, patchTaskSchema, deleteTaskSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        ...(workspaceId ? { workspaceId } : { workspaceId: null }),
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("[GET /api/tasks] error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user: dbUser } = authResult;

    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { name, projectId, workspaceId } = parsed.data;

    let plan: Plan = "seedling";
    if (dbUser) {
      switch (dbUser.plan) {
        case "FLOW":      plan = "flow";      break;
        case "DEEP_WORK": plan = "deep-work"; break;
        case "STUDIO":    plan = "studio";    break;
        default:          plan = "seedling";  break;
      }
    }

    if (!FEATURE_GATES["unlimited-tasks"].includes(plan)) {
      const activeCount = await prisma.task.count({
        where: { userId: dbUser.id, completed: false },
      });
      if (activeCount >= 5) {
        return NextResponse.json(
          {
            error:
              "Task limit reached for the free plan. Upgrade to create unlimited tasks.",
          },
          { status: 402 },
        );
      }
    }

    const task = await prisma.task.create({
      data: {
        userId: dbUser.id,
        name,
        projectId: projectId ?? null,
        workspaceId: workspaceId ?? null,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tasks] error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;

    const body = await req.json();
    const parsed = patchTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { id, completed } = parsed.data;

    const task = await prisma.task.updateMany({
      where: {
        id,
        userId: user.id,
      },
      data: {
        ...(completed !== undefined && { completed }),
      },
    });

    return NextResponse.json({ updated: task.count });
  } catch (error) {
    console.error("[PATCH /api/tasks] error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;

    const body = await req.json();
    const parsed = deleteTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { id } = parsed.data;

    const result = await prisma.task.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/tasks] error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
