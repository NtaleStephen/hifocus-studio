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
