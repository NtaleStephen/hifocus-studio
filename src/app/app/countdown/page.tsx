"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import SettingsPanel from "@/components/SettingsPanel";
import { useSettings } from "@/contexts/SettingsContext";
import FlipCard from "@/components/FlipCard";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const CountdownContent = ({ initialTime }: { initialTime?: { hours: number; minutes: number; seconds: number } }) => {
  const { settings } = useSettings();
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (initialTime) {
      const total = initialTime.hours * 3600 + initialTime.minutes * 60 + initialTime.seconds;
      setTotalSeconds(total);
      setRemaining(total);
    }
  }, [initialTime]);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, remaining]);

  const h = Math.floor(remaining / 3600).toString().padStart(2, "0");
  const m = Math.floor((remaining % 3600) / 60).toString().padStart(2, "0");
  const s = (remaining % 60).toString().padStart(2, "0");

  const handleStart = () => {
    if (remaining > 0) setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setRemaining(totalSeconds);
    setIsComplete(false);
  };

  return (
    <div className="flex flex-col items-center gap-12 animate-fade-in">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
        <FlipCard value={h[0]} />
        <FlipCard value={h[1]} />
        <div className="flex flex-col gap-4 px-1 sm:gap-5">
          <div className="h-3 w-3 rounded-full bg-primary/40" />
          <div className="h-3 w-3 rounded-full bg-primary/40" />
        </div>
        <FlipCard value={m[0]} />
        <FlipCard value={m[1]} />
        <div className="flex flex-col gap-4 px-1 sm:gap-5">
          <div className="h-3 w-3 rounded-full bg-primary/40" />
          <div className="h-3 w-3 rounded-full bg-primary/40" />
        </div>
        <FlipCard value={s[0]} />
        <FlipCard value={s[1]} />
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
  );
};

export default function CountdownPage() {
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
        <CountdownContent />
      </main>
      <Footer />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
