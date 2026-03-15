import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserAndSync } from "@/lib/auth-server";
import { createWorkspaceSchema } from "@/lib/validations";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET /api/workspaces — list all workspaces the user belongs to
export async function GET(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      include: {
        workspace: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    const workspaces = memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      logoUrl: m.workspace.logoUrl,
      role: m.role,
      memberCount: m.workspace._count.members,
      createdAt: m.workspace.createdAt,
    }));

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("[GET /api/workspaces] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/workspaces — create a new workspace
export async function POST(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;

    // Only Studio plan can create workspaces
    if (user.plan !== "STUDIO") {
      return NextResponse.json(
        { error: "Workspace creation requires a Studio plan." },
        { status: 402 }
      );
    }

    const body = await req.json();
    const parsed = createWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { name } = parsed.data;

    // Generate a unique slug
    let slug = slugify(name);
    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json(
      {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          logoUrl: workspace.logoUrl,
          role: "OWNER",
          memberCount: workspace._count.members,
          createdAt: workspace.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/workspaces] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
