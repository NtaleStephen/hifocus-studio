import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with the basics",
    features: ["Flip clock display", "Basic countdown timer", "1 theme"],
    cta: "Current Plan",
    highlighted: false,
    disabled: true,
  },
  {
    name: "Basic",
    price: "$1.50",
    period: "/month",
    yearlyPrice: "$15",
    yearlySaving: "$3",
    description: "Unlock more focus tools",
    features: [
      "Everything in Free",
      "Pomodoro timer",
      "All themes",
      "Custom alarm sounds",
    ],
    cta: "Get Basic",
    highlighted: true,
    disabled: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "/year",
    monthlyEquiv: "$1.25/mo",
    description: "Best value for power users",
    badge: "Save $3",
    features: [
      "Everything in Basic",
      "Priority support",
      "Early access to new features",
      "Cloud sync across devices",
      "Analytics & focus stats",
    ],
    cta: "Get Pro",
    highlighted: false,
    disabled: false,
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Simple, transparent pricing
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Choose the plan that fits your focus routine
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-2xl border p-6 transition-shadow ${
              plan.highlighted
                ? "border-primary bg-card shadow-lg shadow-primary/10 scale-[1.03]"
                : "border-border bg-card/60"
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                {plan.badge}
              </span>
            )}

            <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-foreground">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            </div>

            {plan.monthlyEquiv && (
              <p className="mt-1 text-xs text-muted-foreground">
                That's just {plan.monthlyEquiv}
              </p>
            )}
            {plan.yearlyPrice && (
              <p className="mt-1 text-xs text-muted-foreground">
                or {plan.yearlyPrice}/year — save {plan.yearlySaving}
              </p>
            )}

            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              className="mt-8 w-full"
              variant={plan.highlighted ? "default" : "outline"}
              disabled={plan.disabled}
              onClick={() => {
                /* placeholder – Stripe checkout will go here */
              }}
            >
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-10 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to app
      </button>
    </div>
  );
};

export default Pricing;
