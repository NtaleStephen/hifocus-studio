import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserAndSync } from "@/lib/auth-server";
import { canAccess, planFromPrisma } from "@/lib/features";
import { sanitizeForCsv } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;

    // Report export is a paid feature (Deep Work / Studio). Gate at the API
    // layer — the UI hides it, but the endpoint must enforce it too.
    if (!canAccess(planFromPrisma(user.plan), "export-reports")) {
      return NextResponse.json(
        { error: "Report export requires a Deep Work or Studio plan." },
        { status: 402 },
      );
    }

    const url = new URL(req.url);
    const daysParam = url.searchParams.get("days");
    const days = daysParam ? Number.parseInt(daysParam, 10) : 90;

    // Clamp days to a reasonable range to prevent abuse
    const clampedDays = Math.min(Math.max(Number.isNaN(days) ? 90 : days, 1), 3650);

    const since = new Date();
    since.setDate(since.getDate() - clampedDays);

    const sessions = await prisma.focusSession.findMany({
      where: {
        userId: user.id,
        completedAt: {
          gte: since,
        },
      },
      include: {
        project: true,
        task: true,
      },
      orderBy: {
        completedAt: "asc",
      },
    });

    const header = [
      "id",
      "completed_at",
      "minutes",
      "type",
      "project",
      "task",
    ];
    const rows = sessions.map((s) => [
      s.id,
      s.completedAt.toISOString(),
      s.duration.toString(),
      s.type,
      sanitizeForCsv(s.project?.name ?? ""),
      sanitizeForCsv(s.task?.name ?? ""),
    ]);

    const csv = [header, ...rows]
      .map((cols) => cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="hifocus-sessions-export.csv"',
      },
    });
  } catch (error) {
    console.error("[GET /api/reports/export] error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
