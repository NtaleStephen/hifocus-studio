"use client";

import { useState, useCallback } from "react";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import SettingsPanel from "@/components/SettingsPanel";
import { Clock, Palette, Timer, Maximize, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AboutContent = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 animate-fade-in space-y-12">
      <section className="text-center space-y-4">
        <h1 className="font-mono text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">HIFOCUS</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A beautiful, distraction-free flip clock designed to help you stay focused and productive.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono">
              <Clock className="h-5 w-5 text-primary" />
              Minimalist Design
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Hifocus strips away the clutter, giving you only what you need to track time. No notifications, no distractions, just time.
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono">
              <Palette className="h-5 w-5 text-primary" />
              Customizable Themes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Choose from a variety of carefully crafted themes to match your aesthetic and environment, from deep midnight to warm espresso.
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono">
              <Timer className="h-5 w-5 text-primary" />
              Productivity Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Built-in Pomodoro timer and countdown tools help you manage your focus sessions and deadlines effectively.
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono">
              <Maximize className="h-5 w-5 text-primary" />
              Full Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Full-screen support turns any device into a dedicated focus clock. Perfect for placing on your desk while you work.
          </CardContent>
        </Card>
      </div>

      <section className="bg-primary/5 rounded-3xl p-8 border border-primary/10 text-center space-y-6">
        <h2 className="text-2xl font-bold font-mono">Stay in the Loop</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          We're constantly improving Hifocus. Join our newsletter to get updates on new features and themes.
        </p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <Input 
            type="email" 
            placeholder="Enter your email" 
            className="bg-background border-border"
          />
          <Button type="submit" className="gap-2">
            Subscribe
            <Check className="h-4 w-4" />
          </Button>
        </form>
      </section>
    </div>
  );
};

export default function AboutPage() {
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
        <AboutContent />
      </main>
      <Footer />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
