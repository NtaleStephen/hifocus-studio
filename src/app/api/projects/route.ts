import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserAndSync } from "@/lib/auth-server";

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
    const { name, color, workspaceId } = body as { 
      name?: string; 
      color?: string;
      workspaceId?: string;
    };

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name: name.trim(),
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

