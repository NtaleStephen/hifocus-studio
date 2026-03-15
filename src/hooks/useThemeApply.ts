import { useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { getTheme } from "@/lib/themes";
import { useTheme } from "next-themes";

/** Applies the active theme's CSS custom properties to :root */
export const useThemeApply = () => {
  const { settings } = useSettings();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const theme = getTheme(settings.theme);
    const root = document.documentElement;
    
    const isDark = resolvedTheme === "dark";
    // Default to dark vars if theme cannot be resolved instantly during SSR
    const vars = isDark ? theme.darkVars : theme.lightVars;

    // Remove old properties to prevent conflicts when switching themes or modes
    Object.keys(theme.lightVars).forEach((key) => {
      root.style.removeProperty(key);
    });

    Object.keys(theme.darkVars).forEach((key) => {
      root.style.removeProperty(key);
    });

    // Apply the correct palette for the current mode
    if (vars) {
      Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [settings.theme, resolvedTheme]);
};
