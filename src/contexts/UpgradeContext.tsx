"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { slugToStripeKey } from "@/lib/stripe-plans";
import {
  canAccess,
  minPlanFor,
  planAtLeast,
  PLAN_LABELS,
  FEATURE_LABELS,
  type FeatureKey,
  type Plan,
} from "@/lib/features";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, Sparkles, Building2, Lock } from "lucide-react";
import { toast } from "sonner";

interface UpgradeContextType {
  plan: Plan;
  loading: boolean;
  /**
   * Returns true if the current plan can use `feature`. If not, opens the
   * upgrade modal (highlighting the required tier) and returns false.
   * Use it to guard an action: `if (!requireFeature("x")) return;`
   */
  requireFeature: (feature: FeatureKey) => boolean;
  /** Open the upgrade modal manually, optionally spotlighting a feature. */
  showUpgrade: (feature?: FeatureKey) => void;
}

const UpgradeContext = createContext<UpgradeContextType | null>(null);

export const useUpgrade = () => {
  const ctx = useContext(UpgradeContext);
  if (!ctx) throw new Error("useUpgrade must be used within UpgradeProvider");
  return ctx;
};

const TIERS: {
  slug: Plan;
  name: string;
  price: string;
  cadence: string;
  icon: typeof Zap;
  highlights: string[];
}[] = [
  {
    slug: "flow",
    name: "Flow",
    price: "$6",
    cadence: "/mo",
    icon: Zap,
    highlights: ["Custom intervals", "Unlimited tasks", "10 themes", "Ambient sounds"],
  },
  {
    slug: "deep-work",
    name: "Deep Work",
    price: "$14",
    cadence: "/mo",
    icon: Sparkles,
    highlights: ["Everything in Flow", "AI focus coach", "Unlimited history", "CSV export"],
  },
  {
    slug: "studio",
    name: "Studio",
    price: "$10",
    cadence: "/user/mo",
    icon: Building2,
    highlights: ["Everything in Deep Work", "Team workspaces", "Group sessions", "SSO + branding"],
  },
];

export function UpgradeProvider({ children }: { children: ReactNode }) {
  const { plan, loading } = useSubscription();
  const { session } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [feature, setFeature] = useState<FeatureKey | null>(null);
  const [checkingOut, setCheckingOut] = useState<Plan | null>(null);

  const showUpgrade = useCallback((f?: FeatureKey) => {
    setFeature(f ?? null);
    setOpen(true);
  }, []);

  const requireFeature = useCallback(
    (f: FeatureKey) => {
      if (canAccess(plan, f)) return true;
      setFeature(f);
      setOpen(true);
      return false;
    },
    [plan],
  );

  const requiredPlan: Plan = feature ? minPlanFor(feature) : "flow";
  const featureLabel = feature ? FEATURE_LABELS[feature] ?? "This feature" : null;

  const startCheckout = async (slug: Plan) => {
    const key = slugToStripeKey(slug);
    if (!key) return;
    if (!session) {
      setOpen(false);
      router.push("/auth");
      return;
    }
    setCheckingOut(slug);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: key }),
      });
      if (res.ok) {
        const { url } = (await res.json()) as { url: string };
        window.location.href = url;
        return; // keep the spinner while the browser redirects
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(data.error ?? "Could not start checkout. Please try again.");
    } catch {
      toast.error("Could not start checkout. Please try again.");
    }
    setCheckingOut(null);
  };

  return (
    <UpgradeContext.Provider value={{ plan, loading, requireFeature, showUpgrade }}>
      {children}

      <Dialog open={open} onOpenChange={setOpen}>
        {/* Fixed "liquid glass" surface — identical across all themes, always legible.
            Matches the Settings panel exactly (no extra specular overlay). */}
        <DialogContent className="max-w-2xl rounded-2xl border border-white/15 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.14),rgba(12,12,16,0.6)_38%,rgba(12,12,16,0.72))] text-white shadow-[0_24px_70px_-15px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:rounded-2xl [&>button]:text-white/70 [&>button:hover]:text-white">
          <DialogHeader className="relative">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white shadow-inner sm:mx-0">
              <Lock className="h-5 w-5" />
            </div>
            <DialogTitle className="text-center text-white sm:text-left">
              {featureLabel
                ? `${featureLabel} is a ${PLAN_LABELS[requiredPlan]} feature`
                : "Upgrade your plan"}
            </DialogTitle>
            <DialogDescription className="text-center text-white/60 sm:text-left">
              {featureLabel
                ? `You're on the ${PLAN_LABELS[plan]} plan. Upgrade to ${PLAN_LABELS[requiredPlan]} or higher to unlock it.`
                : "Pick a plan to unlock more of Hifocus."}
            </DialogDescription>
          </DialogHeader>

          <div className="relative grid gap-3 sm:grid-cols-3">
            {TIERS.map((tier) => {
              const isRecommended = tier.slug === requiredPlan;
              const alreadyHave = planAtLeast(plan, tier.slug);
              return (
                <div
                  key={tier.slug}
                  className={`relative flex flex-col rounded-2xl border p-4 backdrop-blur-md transition-colors ${
                    isRecommended
                      ? "border-amber-300/50 bg-white/[0.14] ring-1 ring-amber-300/30"
                      : "border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
                  }`}
                >
                  {isRecommended && (
                    <span className="absolute -top-2 left-4 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-neutral-950 shadow">
                      Unlocks this
                    </span>
                  )}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-lg border border-white/15 bg-white/10 p-1.5 text-white">
                      <tier.icon className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-bold text-white">{tier.name}</h3>
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-white">{tier.price}</span>
                    <span className="text-xs text-white/50">{tier.cadence}</span>
                  </div>
                  <ul className="mb-4 flex-1 space-y-1.5">
                    {tier.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-1.5 text-xs text-white/70">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-amber-300" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    className={`w-full rounded-xl ${
                      isRecommended
                        ? "bg-amber-400 text-neutral-950 hover:bg-amber-300"
                        : "border border-white/20 bg-white/10 text-white hover:bg-white/20"
                    }`}
                    disabled={alreadyHave || checkingOut !== null}
                    onClick={() => startCheckout(tier.slug)}
                  >
                    {checkingOut === tier.slug
                      ? "Redirecting…"
                      : alreadyHave
                        ? "Current"
                        : `Get ${tier.name}`}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="relative flex flex-col items-center gap-1">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/app/billing");
              }}
              className="text-xs font-medium text-amber-300 transition-colors hover:underline"
            >
              See full plan comparison
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-white/50 transition-colors hover:text-white/80"
            >
              Maybe later
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </UpgradeContext.Provider>
  );
}
