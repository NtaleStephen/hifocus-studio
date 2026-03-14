import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key_for_build";

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});
