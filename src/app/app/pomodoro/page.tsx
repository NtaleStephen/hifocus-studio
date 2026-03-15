"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import SettingsPanel from "@/components/SettingsPanel";
import { useSettings } from "@/contexts/SettingsContext";
import { playSound } from "@/lib/sounds";
import FlipCard from "@/components/FlipCard";
import { Play, Pause, RotateCcw, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTaskSelection } from "@/contexts/TaskContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const PomodoroContent = () => {
  const { user, session } = useAuth();
  const { settings } = useSettings();
  const { selection } = useTaskSelection();
  const { activeWorkspace } = useWorkspace();
  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const persistSession = useCallback(
    async (completedMinutes: number) => {
      if (!user || !session) return;
      try {
        await fetch("/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            durationMinutes: completedMinutes,
            type: "pomodoro",
            projectId: selection.projectId,
            taskId: selection.taskId,
            workspaceId: activeWorkspace?.id ?? null,
          }),
        });
      } catch (error) {
        console.error("Failed to persist pomodoro session", error);
      }
    },
    [user, session, selection.projectId, selection.taskId, activeWorkspace],
  );

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            playSound(settings.alertSound);
            void persistSession(duration);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, remaining, settings.alertSound, duration, persistSession]);

  const m = Math.floor(remaining / 60).toString().padStart(2, "0");
  const s = (remaining % 60).toString().padStart(2, "0");

  const handleStart = () => {
    if (remaining > 0) setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setRemaining(duration * 60);
    setIsComplete(false);
  };

  const adjustDuration = (delta: number) => {
    const next = Math.max(1, Math.min(120, duration + delta));
    setDuration(next);
    if (!isRunning) setRemaining(next * 60);
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
          <span className="font-mono text-sm font-medium w-16 text-center">{duration} min</span>
          <Button variant="ghost" size="icon" onClick={() => adjustDuration(5)} disabled={isRunning}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-4">
          {!isRunning ? (
            <Button onClick={handleStart} size="lg" className="h-14 w-14 rounded-full p-0">
              <Play className="h-6 w-6 fill-current" />
            </Button>
          ) : (
            <Button onClick={handlePause} size="lg" variant="outline" className="h-14 w-14 rounded-full p-0">
              <Pause className="h-6 w-6" />
            </Button>
          )}
          <Button onClick={handleReset} size="lg" variant="ghost" className="h-14 w-14 rounded-full p-0">
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function PomodoroPage() {
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
      <main className="flex flex-1 items-center justify-center px-4 w-full">
        <PomodoroContent />
      </main>
      <Footer />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
