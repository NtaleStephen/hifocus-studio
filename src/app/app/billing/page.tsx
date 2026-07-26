"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import SettingsPanel from "@/components/SettingsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Sparkles, Building2, Zap } from "lucide-react";
import { slugToStripeKey } from "@/lib/stripe-plans";
import { useFullscreen } from "@/hooks/useFullscreen";

export default function BillingPage() {
  const { session, signOut } = useAuth();
  const toggleFullscreen = useFullscreen();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("seedling");
  const [loading, setLoading] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const handleDeactivate = async () => {
    if (!session) return;
    if (
      !confirm(
        "Deactivate your account? You'll be signed out and your workspace will be hidden until you sign back in and reactivate. Your data is kept.",
      )
    ) {
      return;
    }
    setDeactivating(true);
    try {
      const res = await fetch("/api/account/deactivate", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        await signOut();
        window.location.href = "/";
      } else {
        setDeactivating(false);
      }
    } catch {
      setDeactivating(false);
    }
  };

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

  const handleSubscribe = async (planKey: string) => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: planKey }),
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      } else {
        setLoading(false);
      }
    } catch {
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

  // `slug` matches the plan format returned by GET /api/subscription
  // ("seedling" | "flow" | "deep-work" | "studio").
  const plans = [
    {
      name: "Seedling",
      price: "Free",
      slug: "seedling",
      icon: Sparkles,
      features: ["Fixed Pomodoro", "5 active tasks", "3 default themes", "7-day history"],
      label: "Current Plan",
      variant: "outline" as const,
    },
    {
      name: "Flow",
      price: "$6",
      slug: "flow",
      icon: Zap,
      features: ["Custom intervals", "Unlimited tasks", "Dark mode + 10 themes", "30-day history", "Ambient sounds"],
      label: "Upgrade to Flow",
      variant: "default" as const,
    },
    {
      name: "Deep Work",
      price: "$14",
      slug: "deep-work",
      icon: Sparkles,
      features: ["AI focus coach", "Unlimited history", "Custom themes", "Calendar + Slack sync", "Floating widget"],
      label: "Upgrade to Deep Work",
      variant: "default" as const,
    },
    {
      name: "Studio",
      price: "$10/user",
      slug: "studio",
      icon: Building2,
      features: ["Shared workspaces", "Group sessions", "Team analytics", "SSO + Custom branding", "Priority support"],
      label: "Upgrade to Studio",
      variant: "default" as const,
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <NavBar onSettingsClick={() => setSettingsOpen(true)} onFullscreen={toggleFullscreen} />
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
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.slug;
            return (
            <div
              key={plan.name}
              className={`relative flex flex-col p-6 rounded-2xl border bg-card/50 backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1 ${
                isCurrent ? "border-primary ring-1 ring-primary" : "border-border"
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
                disabled={isCurrent || loading}
                onClick={() => {
                  const key = slugToStripeKey(plan.slug);
                  if (key) handleSubscribe(key);
                }}
              >
                {loading ? "Processing..." : isCurrent ? "Current Plan" : plan.label}
              </Button>
            </div>
            );
          })}
        </section>

        {/* Danger zone */}
        <section className="rounded-2xl border border-destructive/30 bg-destructive/[0.03] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-destructive">Deactivate account</h2>
              <p className="text-sm text-muted-foreground">
                Hide your account and sign out. Your data is kept — reactivate any time by signing back in.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDeactivate}
              disabled={deactivating}
            >
              {deactivating ? "Deactivating…" : "Deactivate account"}
            </Button>
          </div>
        </section>
      </main>
      <Footer />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
