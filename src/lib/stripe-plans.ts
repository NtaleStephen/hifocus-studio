// Prisma `Plan` enum values (kept in sync with prisma/schema.prisma)
export type PrismaPlan = "SEEDLING" | "FLOW" | "DEEP_WORK" | "STUDIO";

export const STRIPE_PLANS = {
  FLOW: {
    priceId: process.env.STRIPE_PRICE_ID_FLOW ?? "price_placeholder_flow",
    name: "Flow",
    quota: {
      tasks: "unlimited",
      projects: true,
      history: 30,
    },
  },
  DEEP_WORK: {
    priceId: process.env.STRIPE_PRICE_ID_DEEP_WORK ?? "price_placeholder_deep_work",
    name: "Deep Work",
    quota: {
      tasks: "unlimited",
      projects: true,
      history: "unlimited",
    },
  },
  STUDIO: {
    priceId: process.env.STRIPE_PRICE_ID_STUDIO ?? "price_placeholder_studio",
    name: "Studio",
    quota: {
      tasks: "unlimited",
      projects: true,
      history: "unlimited",
      team: true,
    },
  },
};

/**
 * Reverse-map a Stripe price ID back to the Prisma `Plan` enum value.
 * Returns null if the price ID doesn't correspond to any known plan.
 */
export function priceIdToPlan(priceId: string | null | undefined): PrismaPlan | null {
  if (!priceId) return null;
  for (const [key, cfg] of Object.entries(STRIPE_PLANS)) {
    if (cfg.priceId === priceId) return key as PrismaPlan;
  }
  return null;
}

/** Type guard: is the given string a valid Prisma `Plan` enum value? */
export function isPrismaPlan(value: string | null | undefined): value is PrismaPlan {
  return value === "SEEDLING" || value === "FLOW" || value === "DEEP_WORK" || value === "STUDIO";
}
