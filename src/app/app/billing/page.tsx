"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import SettingsPanel from "@/components/SettingsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Sparkles, Building2, Zap } from "lucide-react";
import { STRIPE_PLANS } from "@/lib/stripe-plans";

export default function BillingPage() {
  const { session } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("seedling");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    const loadPlan = async () => {
      try {
        const res = await fetch("/api/subscription", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentPlan(data.plan);
        }
      } catch (e) {
        console.warn("Failed to load plan", e);
      }
    };
    void loadPlan();
  }, [session]);

  const handleSubscribe = async (priceId: string) => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Seedling",
      price: "Free",
      id: "seedling",
      icon: Sparkles,
      features: ["Fixed Pomodoro", "5 active tasks", "3 default themes", "7-day history"],
      buttonText: "Current Plan",
      disabled: currentPlan === "seedling",
      variant: "outline" as const,
    },
    {
      name: "Flow",
      price: "$6",
      id: "FLOW",
      priceId: STRIPE_PLANS.FLOW.priceId,
      icon: Zap,
      features: ["Custom intervals", "Unlimited tasks", "Dark mode + 10 themes", "30-day history", "Ambient sounds"],
      buttonText: currentPlan === "flow" ? "Current Plan" : "Upgrade to Flow",
      disabled: currentPlan === "flow",
      variant: "default" as const,
    },
    {
      name: "Deep Work",
      price: "$14",
      id: "DEEP_WORK",
      priceId: STRIPE_PLANS.DEEP_WORK.priceId,
      icon: Sparkles,
      features: ["AI focus coach", "Unlimited history", "Custom themes", "Calendar + Slack sync", "Floating widget"],
      buttonText: currentPlan === "deep_work" ? "Current Plan" : "Upgrade to Deep Work",
      disabled: currentPlan === "deep_work",
      variant: "default" as const,
    },
    {
      name: "Studio",
      price: "$10/user",
      id: "STUDIO",
      priceId: STRIPE_PLANS.STUDIO.priceId,
      icon: Building2,
      features: ["Shared workspaces", "Group sessions", "Team analytics", "SSO + Custom branding", "Priority support"],
      buttonText: currentPlan === "studio" ? "Current Plan" : "Upgrade to Studio",
      disabled: currentPlan === "studio",
      variant: "default" as const,
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <NavBar onSettingsClick={() => setSettingsOpen(true)} onFullscreen={() => {}} />
      <main className="flex flex-1 w-full max-w-6xl flex-col gap-12 px-4 py-20">
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your focus needs. Start for free, upgrade as you grow.
          </p>
        </section>

        {currentPlan !== "seedling" && (
          <section className="flex items-center justify-between p-6 rounded-2xl border bg-primary/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-lg">Active Plan: {currentPlan.toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">Manage your subscription, invoices, and billing details.</p>
              </div>
            </div>
            <Button onClick={handlePortal} disabled={loading}>
              Manage Billing
            </Button>
          </section>
        )}

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-6 rounded-2xl border bg-card/50 backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1 ${
                currentPlan.toLowerCase() === plan.id.toLowerCase() ? "border-primary ring-1 ring-primary" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <plan.icon className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-lg">{plan.name}</h2>
              </div>
              
              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.price !== "Free" && <span className="text-muted-foreground ml-1">/mo</span>}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.variant}
                className="w-full rounded-xl h-11"
                disabled={plan.disabled || loading}
                onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
              >
                {loading ? "Processing..." : plan.buttonText}
              </Button>
            </div>
          ))}
        </section>
      </main>
      <Footer />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
