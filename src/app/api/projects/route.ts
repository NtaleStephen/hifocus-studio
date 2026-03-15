import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserAndSync } from "@/lib/auth-server";
import { createProjectSchema, deleteProjectSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    const projects = await prisma.project.findMany({
      where: {
        userId: user.id,
        ...(workspaceId ? { workspaceId } : { workspaceId: null }),
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("[GET /api/projects] error", error);
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

    const { user } = authResult;

    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { name, color, workspaceId } = parsed.data;

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name,
        color: color ?? null,
        workspaceId: workspaceId ?? null,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects] error", error);
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
    const parsed = deleteProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { id } = parsed.data;

    const result = await prisma.project.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/projects] error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
