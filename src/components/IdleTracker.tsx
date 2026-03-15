"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function IdleTracker({ children }: { children: React.ReactNode }) {
  const [isIdle, setIsIdle] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only execute idle tracking for actual "clock" pages.
    // If they are on "Tasks", "Themes", or "Reports", don't hide the nav.
    const activePaths = ["/app", "/app/countdown", "/app/pomodoro"];
    if (!activePaths.includes(pathname)) {
      setIsIdle(false);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      // Wait 3.5 seconds of no mouse movement before hiding UI
      timeoutId = setTimeout(() => setIsIdle(true), 3500);
    };

    // Attach event listeners
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("mousedown", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("scroll", resetTimer);

    // Start timer immediately
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("mousedown", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [pathname]);

  return (
    <div className={`h-full w-full ${isIdle ? "idle-mode" : ""}`}>
      {children}
    </div>
  );
}
