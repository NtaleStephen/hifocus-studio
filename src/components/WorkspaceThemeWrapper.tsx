"use client";

import React from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { getTheme } from "@/lib/themes";

export function WorkspaceThemeWrapper({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const theme = getTheme(settings.theme);

  // Apply the theme variables as inline styles. 
  // By doing this on a wrapper instead of :root, we isolate the custom
  // workspace themes entirely from the global next-themes Light/Dark mode.
  const style = theme.vars as React.CSSProperties;

  return (
    <div style={style} className="contents workspace-theme-scope">
      {children}
    </div>
  );
}
