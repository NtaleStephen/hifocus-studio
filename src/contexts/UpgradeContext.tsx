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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [feature, setFeature] = useState<FeatureKey | null>(null);

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

  const goToBilling = () => {
    setOpen(false);
    router.push("/app/billing");
  };

  return (
    <UpgradeContext.Provider value={{ plan, loading, requireFeature, showUpgrade }}>
      {children}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary sm:mx-0">
              <Lock className="h-5 w-5" />
            </div>
            <DialogTitle className="text-center sm:text-left">
              {featureLabel
                ? `${featureLabel} is a ${PLAN_LABELS[requiredPlan]} feature`
                : "Upgrade your plan"}
            </DialogTitle>
            <DialogDescription className="text-center sm:text-left">
              {featureLabel
                ? `You're on the ${PLAN_LABELS[plan]} plan. Upgrade to ${PLAN_LABELS[requiredPlan]} or higher to unlock it.`
                : "Pick a plan to unlock more of Hifocus."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-3">
            {TIERS.map((tier) => {
              const isRecommended = tier.slug === requiredPlan;
              const alreadyHave = planAtLeast(plan, tier.slug);
              return (
                <div
                  key={tier.slug}
                  className={`relative flex flex-col rounded-xl border p-4 ${
                    isRecommended
                      ? "border-primary ring-1 ring-primary bg-primary/[0.03]"
                      : "border-border"
                  }`}
                >
                  {isRecommended && (
                    <span className="absolute -top-2 left-4 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      Unlocks this
                    </span>
                  )}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
                      <tier.icon className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-bold">{tier.name}</h3>
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl font-bold">{tier.price}</span>
                    <span className="text-xs text-muted-foreground">{tier.cadence}</span>
                  </div>
                  <ul className="mb-4 flex-1 space-y-1.5">
                    {tier.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant={isRecommended ? "default" : "outline"}
                    className="w-full rounded-lg"
                    disabled={alreadyHave}
                    onClick={goToBilling}
                  >
                    {alreadyHave ? "Current" : `Get ${tier.name}`}
                  </Button>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setOpen(false)}
            className="mx-auto text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Maybe later
          </button>
        </DialogContent>
      </Dialog>
    </UpgradeContext.Provider>
  );
}
