"use client";

import { useState } from "react";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import SettingsPanel from "@/components/SettingsPanel";
import FlipCard from "@/components/FlipCard";
import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimers } from "@/contexts/TimersContext";
import { useFullscreen } from "@/hooks/useFullscreen";

const CountdownContent = () => {
  const { countdown, setDuration, start, pause, reset } = useTimers();

  const remaining = countdown.remainingSeconds;
  const isRunning = countdown.status === "running";

  const h = Math.floor(remaining / 3600).toString().padStart(2, "0");
  const m = Math.floor((remaining % 3600) / 60).toString().padStart(2, "0");
  const s = (remaining % 60).toString().padStart(2, "0");

  const adjustDuration = (deltaSeconds: number) => {
    setDuration("countdown", Math.max(0, countdown.durationSeconds + deltaSeconds));
  };

  return (
    <div className="flex flex-col items-center gap-12 animate-fade-in text-foreground">
      <div className="flex max-w-full items-center gap-1.5 sm:gap-2 md:gap-3">
        <FlipCard value={h[0]} size="md" />
        <FlipCard value={h[1]} size="md" />
        <div className="flex flex-col gap-3 px-0.5 sm:gap-4 sm:px-1">
          <div className="h-2.5 w-2.5 rounded-full bg-primary/40 animate-pulse-glow" />
          <div className="h-2.5 w-2.5 rounded-full bg-primary/40 animate-pulse-glow" />
        </div>
        <FlipCard value={m[0]} size="md" />
        <FlipCard value={m[1]} size="md" />
        <div className="flex flex-col gap-3 px-0.5 sm:gap-4 sm:px-1">
          <div className="h-2.5 w-2.5 rounded-full bg-primary/40 animate-pulse-glow" />
          <div className="h-2.5 w-2.5 rounded-full bg-primary/40 animate-pulse-glow" />
        </div>
        <FlipCard value={s[0]} size="md" />
        <FlipCard value={s[1]} size="md" />
      </div>

      <div className="flex flex-col items-center gap-6 idle-fade">
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-secondary/50 rounded-2xl px-4 py-2 border border-border">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => adjustDuration(-60)} disabled={isRunning}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-mono text-sm font-medium w-16 text-center">1 min</span>
            <Button variant="ghost" size="icon" onClick={() => adjustDuration(60)} disabled={isRunning}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="hidden sm:block h-6 w-px bg-border/50" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => adjustDuration(-3600)} disabled={isRunning}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-mono text-sm font-medium w-16 text-center">1 hr</span>
            <Button variant="ghost" size="icon" onClick={() => adjustDuration(3600)} disabled={isRunning}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          {!isRunning ? (
            <Button onClick={() => start("countdown")} size="lg" className="h-14 w-14 rounded-full p-0">
              <Play className="h-6 w-6 fill-current" />
            </Button>
          ) : (
            <Button onClick={() => pause("countdown")} size="lg" variant="outline" className="h-14 w-14 rounded-full p-0">
              <Pause className="h-6 w-6" />
            </Button>
          )}
          <Button onClick={() => reset("countdown")} size="lg" variant="ghost" className="h-14 w-14 rounded-full p-0">
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function CountdownPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const toggleFullscreen = useFullscreen();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <NavBar
        onSettingsClick={() => setSettingsOpen(true)}
        onFullscreen={toggleFullscreen}
      />
      <main className="flex flex-1 items-center justify-center overflow-x-auto px-4 w-full">
        <CountdownContent />
      </main>
      <Footer />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
