import Stripe from "stripe";

function getStripeKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY environment variable is not set. " +
      "Billing features will not work without it."
    );
  }
  return key;
}

// Lazily initialize Stripe — only fails when actually used, not at import time
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(getStripeKey(), {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

// Keep backward-compatible default export for existing imports
// This will throw on first use if the key is missing
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});
