"use client";

import { useState, useCallback } from "react";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import SettingsPanel from "@/components/SettingsPanel";
import { useSettings } from "@/contexts/SettingsContext";
import { themes } from "@/lib/themes";
import type { ThemeConfig } from "@/lib/themes";

const ThemesContent = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <h1 className="font-mono text-2xl font-bold text-foreground mb-2">Themes</h1>
      <p className="text-sm text-muted-foreground mb-8">Click any theme to activate it instantly.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {themes.map((t) => (
          <ThemeCard
            key={t.id}
            theme={t}
            active={settings.theme === t.id}
            onSelect={() => updateSettings({ theme: t.id })}
          />
        ))}
      </div>
    </div>
  );
};

const ThemeCard = ({
  theme,
  active,
  onSelect,
}: {
  theme: ThemeConfig;
  active: boolean;
  onSelect: () => void;
}) => {
  const bg = theme.swatches[0];
  const digitBg = theme.swatches[1];
  const accent = theme.swatches[2];

  return (
    <button
      onClick={onSelect}
      className={`group relative rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:scale-[1.02] ${
        active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-muted-foreground/30"
      }`}
    >
      <div
        className="relative mb-3 flex items-center justify-center gap-2 rounded-xl p-6 overflow-hidden"
        style={{ backgroundColor: bg }}
      >
        {["1", "2", ":", "4", "5"].map((ch, i) =>
          ch === ":" ? (
            <div key={i} className="flex flex-col gap-1">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
            </div>
          ) : (
            <div
              key={i}
              className="relative flex h-10 w-8 items-center justify-center rounded-md font-mono text-lg font-bold overflow-hidden"
              style={{ backgroundColor: digitBg, color: accent }}
            >
              {theme.cardEffect === "stripes" && (
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)",
                  }}
                />
              )}
              {theme.cardEffect === "texture" && (
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage: "radial-gradient(circle, currentColor 0.5px, transparent 0.5px)",
                    backgroundSize: "3px 3px",
                  }}
                />
              )}
              {theme.cardEffect === "glossy" && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: "linear-gradient(to bottom, hsla(0,0%,100%,0.12) 0%, transparent 50%, hsla(0,0%,0%,0.08) 100%)",
                  }}
                />
              )}
              <span className="relative z-10">{ch}</span>
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-px" style={{ backgroundColor: `${bg}66` }} />
            </div>
          )
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-mono text-sm font-semibold text-foreground">{theme.label}</h3>
          <p className="text-xs text-muted-foreground">{theme.description}</p>
        </div>
        {active && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
            Active
          </span>
        )}
      </div>
    </button>
  );
};

export default function ThemesPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (typeof document !== "undefined") {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <NavBar 
        onSettingsClick={() => setSettingsOpen(true)} 
        onFullscreen={toggleFullscreen}
      />
      <main className="flex flex-1 items-center justify-center px-4 w-full pt-20">
        <ThemesContent />
      </main>
      <Footer />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
