import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, PLAN_PRICE_USD } from "@/lib/admin";

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = Date.now();
    const since24h = new Date(now - DAY_MS);
    const since7d = new Date(now - 7 * DAY_MS);
    const since30d = new Date(now - 30 * DAY_MS);

    const [
      totalUsers,
      new24h,
      new7d,
      new30d,
      planGroups,
      totalSessions,
      durationAgg,
      active7,
      active30,
      recentUsers,
      recentSessions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: since24h } } }),
      prisma.user.count({ where: { createdAt: { gte: since7d } } }),
      prisma.user.count({ where: { createdAt: { gte: since30d } } }),
      prisma.user.groupBy({ by: ["plan"], _count: { _all: true } }),
      prisma.focusSession.count(),
      prisma.focusSession.aggregate({ _sum: { duration: true } }),
      prisma.focusSession.findMany({
        where: { completedAt: { gte: since7d } },
        select: { userId: true },
        distinct: ["userId"],
      }),
      prisma.focusSession.findMany({
        where: { completedAt: { gte: since30d } },
        select: { userId: true },
        distinct: ["userId"],
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: since30d } },
        select: { createdAt: true },
      }),
      prisma.focusSession.findMany({
        where: { completedAt: { gte: since30d } },
        select: { completedAt: true, duration: true },
      }),
    ]);

    // Plan distribution + MRR
    const plans: Record<string, number> = { SEEDLING: 0, FLOW: 0, DEEP_WORK: 0, STUDIO: 0 };
    for (const g of planGroups) {
      plans[g.plan] = g._count._all;
    }
    const subscribers = plans.FLOW + plans.DEEP_WORK + plans.STUDIO;
    const mrr =
      plans.FLOW * PLAN_PRICE_USD.FLOW +
      plans.DEEP_WORK * PLAN_PRICE_USD.DEEP_WORK +
      plans.STUDIO * PLAN_PRICE_USD.STUDIO;

    // Daily series over the last 30 days (zero-filled)
    const signupsByDay: Record<string, number> = {};
    const focusByDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const key = dayKey(new Date(now - i * DAY_MS));
      signupsByDay[key] = 0;
      focusByDay[key] = 0;
    }
    for (const u of recentUsers) {
      const key = dayKey(u.createdAt);
      if (key in signupsByDay) signupsByDay[key] += 1;
    }
    for (const s of recentSessions) {
      const key = dayKey(s.completedAt);
      if (key in focusByDay) focusByDay[key] += s.duration;
    }

    const totalMinutes = durationAgg._sum.duration ?? 0;

    return NextResponse.json({
      users: { total: totalUsers, new24h, new7d, new30d },
      plans,
      subscribers,
      mrr,
      focus: {
        totalSessions,
        totalHours: Math.round((totalMinutes / 60) * 10) / 10,
        activeUsers7d: active7.length,
        activeUsers30d: active30.length,
      },
      signupsDaily: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
      focusDaily: Object.entries(focusByDay).map(([date, minutes]) => ({
        date,
        hours: Math.round((minutes / 60) * 10) / 10,
      })),
    });
  } catch (error) {
    console.error("[GET /api/admin/overview] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
