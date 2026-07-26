import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { priceIdToPlan, isPrismaPlan, type PrismaPlan } from "@/lib/stripe-plans";
import Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Subscription statuses that entitle the customer to their paid plan.
// Anything else (past_due, unpaid, canceled, incomplete_expired, …) drops to SEEDLING.
const ACTIVE_STATUSES: ReadonlySet<Stripe.Subscription.Status> =
  new Set<Stripe.Subscription.Status>(["active", "trialing"]);

/** Resolve the plan a subscription currently entitles the user to. */
function planForSubscription(subscription: Stripe.Subscription): PrismaPlan {
  if (!ACTIVE_STATUSES.has(subscription.status)) {
    return "SEEDLING";
  }
  const priceId = subscription.items.data[0]?.price.id;
  return priceIdToPlan(priceId) ?? "SEEDLING";
}

function customerIdOf(subscription: Stripe.Subscription): string {
  return typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;
}

/** Read the current period end (billing date) — location varies by API version. */
function periodEndOf(subscription: Stripe.Subscription): Date | null {
  const sub = subscription as unknown as { current_period_end?: number };
  const item = subscription.items.data[0] as unknown as { current_period_end?: number } | undefined;
  const unix = sub.current_period_end ?? item?.current_period_end ?? null;
  return unix ? new Date(unix * 1000) : null;
}

/**
 * Mirror a Stripe subscription onto the user: plan + billing metadata
 * (status, subscription id, start date, next billing date, cancel flag).
 */
async function syncSubscription(subscription: Stripe.Subscription): Promise<void> {
  const customerId = customerIdOf(subscription);
  const result = await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      plan: planForSubscription(subscription),
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscribedAt: subscription.start_date
        ? new Date(subscription.start_date * 1000)
        : undefined,
      currentPeriodEnd: periodEndOf(subscription),
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    },
  });
  if (result.count === 0) {
    console.warn(`[webhook] No user found for Stripe customer ${customerId}.`);
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    if (!WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  // NOTE ON IDEMPOTENCY (C3): every handler below performs an idempotent
  // field-set (plan = X, stripeCustomerId = Y), so Stripe retries and
  // at-least-once delivery cannot double-apply an effect. If a future handler
  // introduces a non-idempotent side effect (e.g. sending an email, granting
  // one-time credits), add an event-id dedup table and guard on event.id here.
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId ?? session.client_reference_id ?? undefined;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        const metaPlan = session.metadata?.plan;

        if (!userId) {
          console.error("[webhook] checkout.session.completed missing userId; skipping.");
          break;
        }

        // Persist the Stripe customer id so subsequent subscription.* events
        // (renewals, downgrades, cancellations) can be reconciled by customer.
        // Determine the plan from the checkout metadata; only accept a valid
        // enum value — never silently fall back to a paid or free tier.
        if (!isPrismaPlan(metaPlan)) {
          console.error(
            `[webhook] checkout.session.completed has invalid plan '${metaPlan}' for user ${userId}; not changing plan.`,
          );
          if (customerId) {
            await prisma.user.update({
              where: { id: userId },
              data: { stripeCustomerId: customerId },
            });
          }
          break;
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: metaPlan,
            ...(customerId ? { stripeCustomerId: customerId } : {}),
          },
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        // Handles upgrades, downgrades, renewals, trial→active, and
        // lapses into past_due/unpaid (which drop the user to SEEDLING).
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = customerIdOf(subscription);
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: "SEEDLING",
            subscriptionStatus: subscription.status, // "canceled"
            cancelAtPeriodEnd: false,
            currentPeriodEnd: null,
          },
        });
        break;
      }

      default:
        // Unhandled event type — acknowledged so Stripe stops retrying.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
