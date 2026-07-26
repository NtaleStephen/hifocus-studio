"use client";

import { useState } from "react";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import SettingsPanel from "@/components/SettingsPanel";
import FlipCard from "@/components/FlipCard";
import { Play, Pause, RotateCcw, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimers } from "@/contexts/TimersContext";
import { useUpgrade } from "@/contexts/UpgradeContext";
import { useFullscreen } from "@/hooks/useFullscreen";

const PomodoroContent = () => {
  const { pomodoro, setDuration, start, pause, reset } = useTimers();
  const { requireFeature } = useUpgrade();

  const durationMin = Math.round(pomodoro.durationSeconds / 60);
  const remaining = pomodoro.remainingSeconds;
  const isRunning = pomodoro.status === "running";

  const m = Math.floor(remaining / 60).toString().padStart(2, "0");
  const s = (remaining % 60).toString().padStart(2, "0");

  const adjustDuration = (deltaMin: number) => {
    // Custom intervals are a Flow feature; free users stay on the fixed 25 min.
    if (!requireFeature("custom-intervals")) return;
    const next = Math.max(60, Math.min(120 * 60, pomodoro.durationSeconds + deltaMin * 60));
    setDuration("pomodoro", next);
  };

  return (
    <div className="flex flex-col items-center gap-12 animate-fade-in">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
        <FlipCard value={m[0]} />
        <FlipCard value={m[1]} />
        <div className="flex flex-col gap-4 px-1 sm:gap-5">
          <div className="h-3 w-3 rounded-full bg-primary/40" />
          <div className="h-3 w-3 rounded-full bg-primary/40" />
        </div>
        <FlipCard value={s[0]} />
        <FlipCard value={s[1]} />
      </div>

      <div className="flex flex-col items-center gap-6 idle-fade">
        <div className="flex items-center gap-4 bg-secondary/50 rounded-full px-4 py-2 border border-border">
          <Button variant="ghost" size="icon" onClick={() => adjustDuration(-5)} disabled={isRunning}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="font-mono text-sm font-medium w-16 text-center">{durationMin} min</span>
          <Button variant="ghost" size="icon" onClick={() => adjustDuration(5)} disabled={isRunning}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-4">
          {!isRunning ? (
            <Button onClick={() => start("pomodoro")} size="lg" className="h-14 w-14 rounded-full p-0">
              <Play className="h-6 w-6 fill-current" />
            </Button>
          ) : (
            <Button onClick={() => pause("pomodoro")} size="lg" variant="outline" className="h-14 w-14 rounded-full p-0">
              <Pause className="h-6 w-6" />
            </Button>
          )}
          <Button onClick={() => reset("pomodoro")} size="lg" variant="ghost" className="h-14 w-14 rounded-full p-0">
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function PomodoroPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const toggleFullscreen = useFullscreen();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <NavBar
        onSettingsClick={() => setSettingsOpen(true)}
        onFullscreen={toggleFullscreen}
      />
      <main className="flex flex-1 items-center justify-center px-4 w-full">
        <PomodoroContent />
      </main>
      <Footer />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
