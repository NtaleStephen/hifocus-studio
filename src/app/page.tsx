"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Target, Sparkles, Brain, Zap, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";

const FlipCardAnimation = ({ value }: { value: string }) => {
  return (
    <div className="relative w-16 h-24 sm:w-24 sm:h-32 bg-secondary rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl border border-border/50">
      <div className="absolute inset-x-0 top-1/2 h-px bg-background/50 z-10" />
      <span className="font-mono text-5xl sm:text-7xl font-bold text-foreground">
        {value}
      </span>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 pointer-events-none" />
    </div>
  );
};

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax transforms
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  
  const card1Y = useTransform(scrollYProgress, [0.1, 0.4], [100, 0]);
  const card1Opacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

  const clockScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const clockY = useTransform(scrollYProgress, [0, 0.4], [0, -100]);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/20" ref={containerRef}>
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 p-6 flex items-center justify-between backdrop-blur-md bg-background/50 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Hifocus Logo" width={32} height={32} className="rounded" />
          <span className="font-mono font-bold text-xl tracking-tighter">HIFOCUS</span>
        </div>
        <Link href="/app">
          <Button className="rounded-full px-6 gap-2 font-semibold shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all">
            Enter Workspace <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-24 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="text-center z-10 max-w-4xl mx-auto space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <Sparkles className="h-4 w-4" />
            <span>The ultimate digital focus environment</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter leading-[1.1] font-mono"
          >
            Time is your most <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
              valuable asset.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto font-light"
          >
            A minimalist, radically simple flip-clock and Pomodoro suite designed exclusively to trigger deep work flow states.
          </motion.p>
        </motion.div>

        {/* Dynamic Abstract Clock Display */}
        <motion.div 
          style={{ scale: clockScale, y: clockY }}
          className="mt-20 z-20 flex gap-4 sm:gap-6 items-center"
        >
          <FlipCardAnimation value={hours[0]} />
          <FlipCardAnimation value={hours[1]} />
          <div className="flex flex-col gap-4 mx-2">
            <div className="w-3 h-3 rounded-full bg-primary/60 shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
            <div className="w-3 h-3 rounded-full bg-primary/60 shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          </div>
          <FlipCardAnimation value={minutes[0]} />
          <FlipCardAnimation value={minutes[1]} />
        </motion.div>
      </section>

      {/* Parallax Features Section */}
      <section className="relative min-h-[150vh] py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="sticky top-1/4">
            <motion.div 
              style={{ opacity: card1Opacity, y: card1Y }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-24 items-center"
            >
              <div className="space-y-6">
                <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                  <Brain className="h-7 w-7" />
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter font-mono">Beat Procrastination.</h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Our built-in Pomodoro sequencer automatically breaks your work into focused, manageable chunks. The physical feeling of the flip clock anchors you to the present moment.
                </p>
                <ul className="space-y-4 pt-4">
                  {[
                    "Scientifically proven work/rest intervals",
                    "Customizable soundscapes and chime alerts",
                    "Zero-distraction fullscreen mode"
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <Zap className="h-5 w-5 text-primary" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Graphic Representation */}
              <div className="relative aspect-square md:aspect-[4/3] rounded-3xl border border-border/50 bg-secondary/30 overflow-hidden shadow-2xl backdrop-blur-sm flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />
                <div className="w-64 h-64 border-[12px] border-primary/20 rounded-full flex items-center justify-center relative">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                    className="absolute w-2 h-32 bg-primary origin-bottom bottom-1/2 rounded-t-full shadow-[0_0_20px_rgba(234,179,8,0.6)]" 
                  />
                  <div className="w-6 h-6 bg-background rounded-full border-4 border-primary z-10" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Advanced Features Grid */}
      <section className="py-24 px-4 bg-muted/20 relative border-y border-border/50">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold font-mono tracking-tighter">Tools for Deep Work</h2>
            <p className="text-lg text-muted-foreground">Everything you need to get in the zone and stay there. Absolutely no clutter.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Goal Countdowns",
                desc: "Set exact milestone deadlines and watch the seconds tick down to your launch or exam."
              },
              {
                icon: Maximize,
                title: "Immersive Fullscreen",
                desc: "Turn your secondary monitor or iPad into a dedicated, aesthetic focus display."
              },
              {
                icon: Sparkles,
                title: "Artisan Themes",
                desc: "Carefully calibrated color palettes designed to be easy on the eyes during prolonged sessions."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 transition-colors shadow-lg"
              >
                <feature.icon className="h-10 w-10 text-primary mb-6" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <h2 className="text-5xl sm:text-7xl font-bold font-mono tracking-tighter">Ready to Focus?</h2>
          <p className="text-xl sm:text-2xl text-muted-foreground font-light">Join thousands of professionals taking back control of their time.</p>
          <div className="pt-8">
            <Link href="/app">
              <Button size="lg" className="h-16 px-10 rounded-full text-lg font-bold gap-3 shadow-[0_0_40px_rgba(234,179,8,0.4)] hover:shadow-[0_0_60px_rgba(234,179,8,0.6)] hover:scale-105 transition-all">
                Enter Hifocus Workspace <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-border/50 py-12 text-center text-muted-foreground text-sm font-mono uppercase tracking-wider">
        <p>&copy; {new Date().getFullYear()} Hifocus Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}
