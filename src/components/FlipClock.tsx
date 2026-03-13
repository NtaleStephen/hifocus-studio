"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import FlipCard from "./FlipCard";
import { useSettings } from "@/contexts/SettingsContext";
import { playSound } from "@/lib/sounds";

const FlipClock = () => {
  const { settings } = useSettings();
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const prevMinuteRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now);
      // Hourly chime: trigger when minutes go from 59 to 0
      if (settings.hourlyChime && prevMinuteRef.current === 59 && now.getMinutes() === 0) {
        playSound(settings.alertSound);
      }
      prevMinuteRef.current = now.getMinutes();
    }, 1000);
    return () => clearInterval(interval);
  }, [settings.hourlyChime, settings.alertSound]);

  // Auto-scale to fit viewport width
  useLayoutEffect(() => {
    if (!mounted) return;
    const calc = () => {
      if (!wrapperRef.current) return;
      const vw = window.innerWidth;
      // Temporarily reset scale to measure natural width
      wrapperRef.current.style.transform = "scale(1)";
      const natural = wrapperRef.current.getBoundingClientRect().width;
      const s = Math.min(1, (vw - 48) / natural);
      setScale(s);
      wrapperRef.current.style.transform = `scale(${s})`;
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [mounted, settings.showSeconds, settings.is24Hour]);

  if (!mounted || !time) {
    return <div className="h-64 w-full flex items-center justify-center bg-card bg-opacity-20 animate-pulse rounded-2xl" />;
  }

  let hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const isPM = hours >= 12;

  if (!settings.is24Hour) {
    hours = hours % 12 || 12;
  }

  const pad = (n: number) => n.toString().padStart(2, "0");
  const h = pad(hours);
  const m = pad(minutes);
  const s = pad(seconds);

  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex w-full flex-col items-center gap-6 animate-fade-in">
      <div
        ref={wrapperRef}
        className="flex items-center gap-2 sm:gap-3 md:gap-5"
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
      >
        <FlipCard value={h[0]} />
        <FlipCard value={h[1]} />

        <div className="flex flex-col gap-4 px-1 sm:gap-5 sm:px-3">
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse-glow sm:h-4 sm:w-4 md:h-5 md:w-5" />
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse-glow sm:h-4 sm:w-4 md:h-5 md:w-5" />
        </div>

        <FlipCard value={m[0]} />
        <FlipCard value={m[1]} />

        {settings.showSeconds && (
          <>
            <div className="flex flex-col gap-3 px-1 sm:gap-4 sm:px-2">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-glow sm:h-3 sm:w-3" />
              <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-glow sm:h-3 sm:w-3" />
            </div>
            <FlipCard value={s[0]} size="md" />
            <FlipCard value={s[1]} size="md" />
          </>
        )}

        {!settings.is24Hour && (
          <span className="ml-3 self-end pb-4 font-mono text-xl text-muted-foreground sm:text-2xl md:text-3xl">
            {isPM ? "PM" : "AM"}
          </span>
        )}
      </div>

      {settings.showDate && (
        <p className="text-sm tracking-widest text-muted-foreground sm:text-base md:text-lg">
          {dateStr}
        </p>
      )}
    </div>
  );
};

export default FlipClock;
