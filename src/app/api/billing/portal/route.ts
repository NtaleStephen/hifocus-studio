import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getUserAndSync } from "@/lib/auth-server";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customers";

export async function POST(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const customerId = await getOrCreateStripeCustomer(user.id, user.email);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/app/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[POST /api/billing/portal] error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
