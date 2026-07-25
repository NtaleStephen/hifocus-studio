import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getUserAndSync } from "@/lib/auth-server";
import { STRIPE_PLANS } from "@/lib/stripe-plans";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customers";
import { checkoutSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { plan: planKey } = parsed.data;

    // Resolve the real Stripe price ID server-side (env vars aren't exposed to
    // the client, so the client sends a plan key rather than a price ID).
    const priceId = STRIPE_PLANS[planKey].priceId;
    if (!priceId || priceId.startsWith("price_placeholder")) {
      console.error(`[POST /api/billing/checkout] price ID not configured for plan ${planKey}`);
      return NextResponse.json(
        { error: "This plan is not available yet. Please try again later." },
        { status: 400 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      console.error("[POST /api/billing/checkout] NEXT_PUBLIC_APP_URL is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Attach a persistent Stripe customer so the subscription lifecycle
    // (renewals, downgrades, cancellations) can be reconciled by webhooks.
    const customerId = await getOrCreateStripeCustomer(user.id, user.email);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/app/billing?success=true`,
      cancel_url: `${baseUrl}/app/billing?canceled=true`,
      metadata: {
        userId: user.id,
        plan: planKey,
      },
      // Propagate identifiers to the Subscription so subscription.* webhook
      // events can be tied back to the user without a metadata round-trip.
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: planKey,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[POST /api/billing/checkout] error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
