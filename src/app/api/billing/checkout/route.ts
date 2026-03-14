import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getUserAndSync } from "@/lib/auth-server";
import { STRIPE_PLANS } from "@/lib/stripe-plans";

export async function POST(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }

    // Identify which plan this is
    const planKey = Object.keys(STRIPE_PLANS).find(
      (key) => STRIPE_PLANS[key as keyof typeof STRIPE_PLANS].priceId === priceId
    );

    if (!planKey) {
      return NextResponse.json({ error: "Invalid Price ID" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
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
