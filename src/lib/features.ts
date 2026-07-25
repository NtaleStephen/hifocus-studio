export type Plan = "seedling" | "flow" | "deep-work" | "studio";

export type FeatureKey =
  // Timer
  | "custom-intervals"
  | "auto-start"
  | "multiple-timer-modes"
  | "session-history-30"
  | "session-history-unlimited"
  // Tasks
  | "unlimited-tasks"
  | "projects-and-labels"
  | "subtasks-priorities"
  | "recurring-tasks"
  | "task-templates"
  // Focus environment
  | "dark-mode"
  | "premium-themes"
  | "unlimited-themes"
  | "ambient-sounds"
  | "custom-sound-upload"
  | "website-blocker"
  | "focus-mode-fullscreen"
  | "floating-widget"
  | "screensaver-mode"
  // Analytics
  | "analytics-dashboard-30"
  | "analytics-dashboard-unlimited"
  | "ai-focus-insights"
  | "export-reports"
  | "team-analytics"
  // Gamification
  | "streaks-goals"
  | "xp-badges"
  | "team-leaderboard"
  // Sync & integrations
  | "cross-device-sync-3"
  | "cross-device-sync-unlimited"
  | "calendar-integration"
  | "slack-sync"
  | "pm-integrations"
  // Team
  | "team-workspace"
  | "group-sessions"
  | "sso-saml"
  | "custom-branding"
  | "admin-controls";

export const FEATURE_GATES: Record<FeatureKey, Plan[]> = {
  // Timer
  "custom-intervals": ["flow", "deep-work", "studio"],
  "auto-start": ["flow", "deep-work", "studio"],
  "multiple-timer-modes": ["flow", "deep-work", "studio"],
  "session-history-30": ["flow", "deep-work", "studio"],
  "session-history-unlimited": ["deep-work", "studio"],
  // Tasks
  "unlimited-tasks": ["flow", "deep-work", "studio"],
  "projects-and-labels": ["flow", "deep-work", "studio"],
  "subtasks-priorities": ["deep-work", "studio"],
  "recurring-tasks": ["deep-work", "studio"],
  "task-templates": ["deep-work", "studio"],
  // Focus environment
  "dark-mode": ["flow", "deep-work", "studio"],
  "premium-themes": ["flow", "deep-work", "studio"],
  "unlimited-themes": ["deep-work", "studio"],
  "ambient-sounds": ["flow", "deep-work", "studio"],
  "custom-sound-upload": ["deep-work", "studio"],
  "website-blocker": ["flow", "deep-work", "studio"],
  "focus-mode-fullscreen": ["flow", "deep-work", "studio"],
  "floating-widget": ["deep-work", "studio"],
  "screensaver-mode": ["deep-work", "studio"],
  // Analytics
  "analytics-dashboard-30": ["flow", "deep-work", "studio"],
  "analytics-dashboard-unlimited": ["deep-work", "studio"],
  "ai-focus-insights": ["deep-work", "studio"],
  "export-reports": ["deep-work", "studio"],
  "team-analytics": ["studio"],
  // Gamification
  "streaks-goals": ["flow", "deep-work", "studio"],
  "xp-badges": ["deep-work", "studio"],
  "team-leaderboard": ["studio"],
  // Sync & integrations
  "cross-device-sync-3": ["flow", "deep-work", "studio"],
  "cross-device-sync-unlimited": ["deep-work", "studio"],
  "calendar-integration": ["deep-work", "studio"],
  "slack-sync": ["deep-work", "studio"],
  "pm-integrations": ["studio"],
  // Team
  "team-workspace": ["studio"],
  "group-sessions": ["studio"],
  "sso-saml": ["studio"],
  "custom-branding": ["studio"],
  "admin-controls": ["studio"],
};

export function canAccess(plan: Plan, feature: FeatureKey): boolean {
  const allowedPlans = FEATURE_GATES[feature];
  return allowedPlans.includes(plan);
}

/** Map a Prisma `Plan` enum value ("FLOW", "DEEP_WORK", …) to the Plan slug. */
export function planFromPrisma(prismaPlan: string): Plan {
  switch (prismaPlan) {
    case "FLOW":      return "flow";
    case "DEEP_WORK": return "deep-work";
    case "STUDIO":    return "studio";
    default:          return "seedling";
  }
}

// ─── Plan tiers (ascending) ──────────────────────────────────────────────────

export const PLAN_ORDER: Plan[] = ["seedling", "flow", "deep-work", "studio"];

export const PLAN_LABELS: Record<Plan, string> = {
  seedling: "Seedling",
  flow: "Flow",
  "deep-work": "Deep Work",
  studio: "Studio",
};

/** The lowest-tier plan that unlocks a feature. */
export function minPlanFor(feature: FeatureKey): Plan {
  const allowed = FEATURE_GATES[feature];
  for (const p of PLAN_ORDER) {
    if (allowed.includes(p)) return p;
  }
  return "studio";
}

/** Is `plan` at least as high a tier as `min`? */
export function planAtLeast(plan: Plan, min: Plan): boolean {
  return PLAN_ORDER.indexOf(plan) >= PLAN_ORDER.indexOf(min);
}

/** Human-readable names for gated features, shown in the upgrade prompt. */
export const FEATURE_LABELS: Partial<Record<FeatureKey, string>> = {
  "custom-intervals": "Custom timer intervals",
  "premium-themes": "Premium themes",
  "unlimited-themes": "Unlimited themes",
  "unlimited-tasks": "Unlimited tasks",
  "export-reports": "Report export",
  "team-workspace": "Team workspaces",
  "ambient-sounds": "Ambient sounds",
  "analytics-dashboard-unlimited": "Unlimited analytics history",
};

