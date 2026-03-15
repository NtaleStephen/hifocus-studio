import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          await prisma.user.update({
            where: { id: userId },
            data: { 
              plan: plan === "FLOW" ? "FLOW" : plan === "DEEP_WORK" ? "DEEP_WORK" : plan === "STUDIO" ? "STUDIO" : "SEEDLING" 
            },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        // In a real app, you'd look up the user by stripeCustomerId
        // and check the subscription status or price ID to determine the plan.
        const customerId = subscription.customer as string;
        
        // This is a simplified version. You should map subscription.items.data[0].price.id back to a Plan.
        // For cancellation, if status is 'canceled' or 'past_due', you might want to downgrade to SEEDLING.
        
        if (event.type === "customer.subscription.deleted") {
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { plan: "SEEDLING" },
          });
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
