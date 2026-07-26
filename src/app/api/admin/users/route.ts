import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const subscribersOnly = searchParams.get("subscribers") === "true";
    const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50, 1), 100);
    const offset = Math.max(Number.parseInt(searchParams.get("offset") ?? "0", 10) || 0, 0);

    const where = {
      ...(q ? { email: { contains: q, mode: "insensitive" as const } } : {}),
      ...(subscribersOnly ? { plan: { not: "SEEDLING" as const } } : {}),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        select: {
          id: true,
          email: true,
          plan: true,
          createdAt: true,
          disabledAt: true,
          subscriptionStatus: true,
          subscribedAt: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
          stripeCustomerId: true,
        },
      }),
    ]);

    // Per-user session stats for the returned page.
    const ids = users.map((u) => u.id);
    const stats = ids.length
      ? await prisma.focusSession.groupBy({
          by: ["userId"],
          where: { userId: { in: ids } },
          _count: { _all: true },
          _sum: { duration: true },
          _max: { completedAt: true },
        })
      : [];
    const statById = new Map(stats.map((s) => [s.userId, s]));

    const rows = users.map((u) => {
      const s = statById.get(u.id);
      return {
        ...u,
        sessionCount: s?._count._all ?? 0,
        totalMinutes: s?._sum.duration ?? 0,
        lastActiveAt: s?._max.completedAt ?? null,
      };
    });

    return NextResponse.json({ total, users: rows, limit, offset });
  } catch (error) {
    console.error("[GET /api/admin/users] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
