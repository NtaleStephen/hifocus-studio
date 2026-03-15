import type { Settings } from "@/contexts/SettingsContext";

export type ThemeId = Settings["theme"];

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  description: string;
  // CSS custom properties (HSL values without hsl() wrapper)
  vars: {
    "--background": string;
    "--foreground": string;
    "--card": string;
    "--card-foreground": string;
    "--primary": string;
    "--primary-foreground": string;
    "--secondary": string;
    "--secondary-foreground": string;
    "--muted": string;
    "--muted-foreground": string;
    "--accent": string;
    "--accent-foreground": string;
    "--border": string;
    "--input": string;
    "--ring": string;
    "--digit-bg": string;
    "--digit-fg": string;
    "--digit-divider": string;
    "--nav-bg": string;
    "--glow": string;
  };
  // Optional special effects on digit cards
  cardEffect?: "none" | "stripes" | "texture" | "glossy";
  // Preview swatch colors for theme picker
  swatches: [string, string, string];
}

export const themes: ThemeConfig[] = [
  {
    id: "midnight",
    label: "Midnight",
    description: "Pure dark with amber glow",
    vars: {
      "--background": "0 0% 4%",
      "--foreground": "0 0% 95%",
      "--card": "0 0% 8%",
      "--card-foreground": "0 0% 95%",
      "--primary": "36 90% 55%",
      "--primary-foreground": "0 0% 4%",
      "--secondary": "0 0% 12%",
      "--secondary-foreground": "0 0% 85%",
      "--muted": "0 0% 14%",
      "--muted-foreground": "0 0% 55%",
      "--accent": "36 90% 55%",
      "--accent-foreground": "0 0% 4%",
      "--border": "0 0% 16%",
      "--input": "0 0% 16%",
      "--ring": "36 90% 55%",
      "--digit-bg": "0 0% 10%",
      "--digit-fg": "0 0% 96%",
      "--digit-divider": "0 0% 6%",
      "--nav-bg": "0 0% 4% / 0.9",
      "--glow": "36 90% 55% / 0.15",
    },
    cardEffect: "none",
    swatches: ["hsl(0,0%,4%)", "hsl(0,0%,10%)", "hsl(36,90%,55%)"],
  },
  {
    id: "espresso",
    label: "Espresso",
    description: "Warm cream with rich brown cards",
    vars: {
      "--background": "30 20% 88%",
      "--foreground": "20 15% 20%",
      "--card": "20 12% 30%",
      "--card-foreground": "30 20% 92%",
      "--primary": "20 50% 40%",
      "--primary-foreground": "30 20% 95%",
      "--secondary": "30 15% 80%",
      "--secondary-foreground": "20 15% 25%",
      "--muted": "30 12% 82%",
      "--muted-foreground": "20 10% 45%",
      "--accent": "20 50% 40%",
      "--accent-foreground": "30 20% 95%",
      "--border": "30 10% 75%",
      "--input": "30 10% 75%",
      "--ring": "20 50% 40%",
      "--digit-bg": "20 15% 28%",
      "--digit-fg": "30 20% 92%",
      "--digit-divider": "20 12% 22%",
      "--nav-bg": "30 20% 88% / 0.9",
      "--glow": "20 50% 40% / 0.15",
    },
    cardEffect: "glossy",
    swatches: ["hsl(30,20%,88%)", "hsl(20,12%,30%)", "hsl(20,50%,40%)"],
  },
  {
    id: "denim",
    label: "Denim",
    description: "Deep blue fabric with golden digits",
    vars: {
      "--background": "220 30% 14%",
      "--foreground": "45 60% 85%",
      "--card": "220 25% 18%",
      "--card-foreground": "45 60% 85%",
      "--primary": "45 80% 60%",
      "--primary-foreground": "220 30% 10%",
      "--secondary": "220 20% 20%",
      "--secondary-foreground": "45 40% 75%",
      "--muted": "220 20% 22%",
      "--muted-foreground": "220 15% 50%",
      "--accent": "45 80% 60%",
      "--accent-foreground": "220 30% 10%",
      "--border": "220 20% 25%",
      "--input": "220 20% 25%",
      "--ring": "45 80% 60%",
      "--digit-bg": "220 28% 16%",
      "--digit-fg": "45 60% 85%",
      "--digit-divider": "220 30% 10%",
      "--nav-bg": "220 30% 14% / 0.9",
      "--glow": "45 80% 60% / 0.15",
    },
    cardEffect: "texture",
    swatches: ["hsl(220,30%,14%)", "hsl(220,25%,18%)", "hsl(45,80%,60%)"],
  },
  {
    id: "coral",
    label: "Coral",
    description: "Bold red with striped light cards",
    vars: {
      "--background": "0 70% 60%",
      "--foreground": "0 0% 10%",
      "--card": "0 10% 88%",
      "--card-foreground": "0 0% 8%",
      "--primary": "0 0% 10%",
      "--primary-foreground": "0 70% 60%",
      "--secondary": "0 50% 52%",
      "--secondary-foreground": "0 0% 95%",
      "--muted": "0 55% 55%",
      "--muted-foreground": "0 20% 25%",
      "--accent": "0 0% 10%",
      "--accent-foreground": "0 70% 60%",
      "--border": "0 40% 50%",
      "--input": "0 40% 50%",
      "--ring": "0 0% 10%",
      "--digit-bg": "0 8% 86%",
      "--digit-fg": "0 0% 8%",
      "--digit-divider": "0 10% 78%",
      "--nav-bg": "0 70% 60% / 0.9",
      "--glow": "0 0% 10% / 0.1",
    },
    cardEffect: "stripes",
    swatches: ["hsl(0,70%,60%)", "hsl(0,10%,88%)", "hsl(0,0%,10%)"],
  },
  {
    id: "vintage",
    label: "Vintage",
    description: "Retro mauve with white cards and red text",
    vars: {
      "--background": "330 15% 30%",
      "--foreground": "0 0% 92%",
      "--card": "0 0% 92%",
      "--card-foreground": "0 80% 48%",
      "--primary": "25 100% 55%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "330 12% 25%",
      "--secondary-foreground": "0 0% 85%",
      "--muted": "330 10% 35%",
      "--muted-foreground": "330 8% 60%",
      "--accent": "25 100% 55%",
      "--accent-foreground": "0 0% 100%",
      "--border": "25 80% 50%",
      "--input": "330 12% 25%",
      "--ring": "25 100% 55%",
      "--digit-bg": "0 0% 90%",
      "--digit-fg": "0 80% 48%",
      "--digit-divider": "0 0% 80%",
      "--nav-bg": "330 15% 30% / 0.9",
      "--glow": "25 100% 55% / 0.2",
    },
    cardEffect: "glossy",
    swatches: ["hsl(330,15%,30%)", "hsl(0,0%,92%)", "hsl(0,80%,48%)"],
  },
  {
    id: "emerald",
    label: "Emerald",
    description: "Vivid green with dark floating cards",
    vars: {
      "--background": "145 65% 42%",
      "--foreground": "0 0% 100%",
      "--card": "0 0% 12%",
      "--card-foreground": "0 0% 95%",
      "--primary": "0 0% 100%",
      "--primary-foreground": "145 65% 35%",
      "--secondary": "145 50% 35%",
      "--secondary-foreground": "0 0% 95%",
      "--muted": "145 40% 38%",
      "--muted-foreground": "145 20% 85%",
      "--accent": "0 0% 100%",
      "--accent-foreground": "145 65% 35%",
      "--border": "145 40% 35%",
      "--input": "145 40% 35%",
      "--ring": "0 0% 100%",
      "--digit-bg": "0 0% 14%",
      "--digit-fg": "0 0% 96%",
      "--digit-divider": "0 0% 8%",
      "--nav-bg": "145 65% 42% / 0.9",
      "--glow": "0 0% 100% / 0.15",
    },
    cardEffect: "none",
    swatches: ["hsl(145,65%,42%)", "hsl(0,0%,12%)", "hsl(0,0%,100%)"],
  },
  {
    id: "industrial",
    label: "Industrial",
    description: "Dark metal grid with grungy white digits",
    vars: {
      "--background": "0 0% 8%",
      "--foreground": "0 0% 90%",
      "--card": "0 0% 11%",
      "--card-foreground": "0 0% 88%",
      "--primary": "0 0% 80%",
      "--primary-foreground": "0 0% 8%",
      "--secondary": "0 0% 14%",
      "--secondary-foreground": "0 0% 75%",
      "--muted": "0 0% 16%",
      "--muted-foreground": "0 0% 45%",
      "--accent": "0 0% 80%",
      "--accent-foreground": "0 0% 8%",
      "--border": "0 0% 20%",
      "--input": "0 0% 20%",
      "--ring": "0 0% 80%",
      "--digit-bg": "0 0% 10%",
      "--digit-fg": "0 0% 90%",
      "--digit-divider": "0 0% 5%",
      "--nav-bg": "0 0% 8% / 0.9",
      "--glow": "0 0% 80% / 0.08",
    },
    cardEffect: "texture",
    swatches: ["hsl(0,0%,8%)", "hsl(0,0%,11%)", "hsl(0,0%,80%)"],
  },
];

export const getTheme = (id: ThemeId): ThemeConfig =>
  themes.find((t) => t.id === id) ?? themes[0];
