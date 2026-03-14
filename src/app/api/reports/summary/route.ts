import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserAndSync } from "@/lib/auth-server";
import type { Plan } from "@/lib/features";

export async function GET(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user: dbUser } = authResult;

    // Optional workspace filter
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    // Verify membership if workspace requested
    if (workspaceId) {
      const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: dbUser.id } },
      });
      if (!membership) {
        return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
      }
    }

    let plan: Plan = "seedling";
    switch (dbUser.plan) {
      case "FLOW":      plan = "flow";      break;
      case "DEEP_WORK": plan = "deep-work"; break;
      case "STUDIO":    plan = "studio";    break;
      default:          plan = "seedling";  break;
    }

    const days =
      plan === "seedling" ? 7
      : plan === "flow"   ? 30
      : 3650;

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Workspace scope returns all members' sessions; personal scope is user-only
    const whereClause = workspaceId
      ? { workspaceId, completedAt: { gte: since } }
      : { userId: dbUser.id, completedAt: { gte: since } };

    const sessions = await prisma.focusSession.findMany({
      where: whereClause,
      include: {
        project: { select: { name: true } },
        task:    { select: { name: true } },
        user:    { select: { email: true } },
      },
      orderBy: { completedAt: "asc" },
    });

    const byDay: Record<string, number>     = {};
    const byProject: Record<string, number> = {};
    const byMember: Record<string, number>  = {};

    for (const s of sessions) {
      const dayKey = s.completedAt.toISOString().slice(0, 10);
      byDay[dayKey] = (byDay[dayKey] ?? 0) + s.duration;

      if (s.projectId && s.project) {
        byProject[s.project.name] = (byProject[s.project.name] ?? 0) + s.duration;
      }

      if (workspaceId && s.user) {
        byMember[s.user.email] = (byMember[s.user.email] ?? 0) + s.duration;
      }
    }

    const daily = Object.entries(byDay)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, minutes]) => ({ date, minutes, hours: minutes / 60 }));

    const projects = Object.entries(byProject)
      .sort(([, a], [, b]) => b - a)
      .map(([name, minutes]) => ({ name, minutes, hours: minutes / 60 }));

    const members = Object.entries(byMember)
      .sort(([, a], [, b]) => b - a)
      .map(([email, minutes]) => ({ email, minutes, hours: minutes / 60 }));

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

    return NextResponse.json({
      totalMinutes,
      totalHours: totalMinutes / 60,
      daily,
      projects,
      ...(workspaceId && { members }),
    });
  } catch (error) {
    console.error("[GET /api/reports/summary] error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
