"use client";

import FlipClock from "@/components/FlipClock";
import NavBar from "@/components/NavBar";
import SettingsPanel from "@/components/SettingsPanel";
import { Footer } from "@/components/Footer";
import { useState, useCallback } from "react";

export default function Home() {
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
        <FlipClock />
      </main>
      <Footer />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
