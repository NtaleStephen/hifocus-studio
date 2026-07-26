import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail, billingReminderEmail } from "@/lib/email";
import { PLAN_PRICE_USD } from "@/lib/admin";

const DAY_MS = 24 * 60 * 60 * 1000;
const REMIND_DAYS_BEFORE = 7;

const PLAN_LABEL: Record<string, string> = {
  FLOW: "Flow",
  DEEP_WORK: "Deep Work",
  STUDIO: "Studio",
};

// GET /api/cron/billing-reminders — daily job (Vercel Cron).
// Emails subscribers ~7 days before their renewal date, once per cycle.
export async function GET(req: Request) {
  // Vercel Cron injects `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + REMIND_DAYS_BEFORE * DAY_MS);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

    // Candidates: paid, active, not deactivated, renewing within the window.
    const candidates = await prisma.user.findMany({
      where: {
        currentPeriodEnd: { gte: now, lte: windowEnd },
        subscriptionStatus: { in: ["active", "trialing"] },
        disabledAt: null,
        plan: { not: "SEEDLING" },
      },
      select: {
        id: true,
        email: true,
        plan: true,
        currentPeriodEnd: true,
        lastBillingReminderAt: true,
      },
    });

    // Only those not already reminded for this billing cycle.
    const toRemind = candidates.filter((u) => {
      if (!u.currentPeriodEnd) return false;
      if (!u.lastBillingReminderAt) return true;
      const cycleThreshold = new Date(u.currentPeriodEnd.getTime() - (REMIND_DAYS_BEFORE + 1) * DAY_MS);
      return u.lastBillingReminderAt < cycleThreshold;
    });

    let sent = 0;
    for (const u of toRemind) {
      const planLabel = PLAN_LABEL[u.plan] ?? u.plan;
      const price = PLAN_PRICE_USD[u.plan] ?? 0;
      const { subject, html } = billingReminderEmail({
        planLabel,
        amount: `$${price}/mo`,
        renewalDate: u.currentPeriodEnd!.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        manageUrl: `${baseUrl}/app/billing`,
      });

      const ok = await sendEmail({ to: u.email, subject, html });
      if (ok) {
        await prisma.user.update({
          where: { id: u.id },
          data: { lastBillingReminderAt: now },
        });
        sent += 1;
      }
    }

    return NextResponse.json({ candidates: candidates.length, reminded: sent });
  } catch (error) {
    console.error("[GET /api/cron/billing-reminders] error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
