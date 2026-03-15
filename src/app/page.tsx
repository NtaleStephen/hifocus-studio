"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { 
  ArrowRight, Target, Sparkles, Brain, Zap, Maximize, Moon, Sun, 
  CheckCircle2, Star, Quote 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FlipCardAnimation = ({ value }: { value: string }) => {
  return (
    <div className="relative w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 bg-secondary rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl border border-border/50">
      <div className="absolute inset-x-0 top-1/2 h-px bg-background/50 z-10" />
      <span className="font-mono text-5xl sm:text-6xl md:text-7xl font-bold text-foreground">
        {value}
      </span>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 pointer-events-none" />
    </div>
  );
};

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll over the entire container for the revolving clock
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax Hero
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Revolving Clock Parallax
  const clockRotation = useTransform(scrollYProgress, [0, 1], [0, 1080]); // 3 full rotations
  const clockScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.9]);

  // Floating flip cards for the left side
  const flipLeftY1 = useTransform(scrollYProgress, [0, 1], [0, 800]);
  const flipLeftY2 = useTransform(scrollYProgress, [0, 1], [800, -200]);

  // Current Time for Hero 
  const [time, setTime] = useState<Date | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time ? time.getHours().toString().padStart(2, "0") : "00";
  const minutes = time ? time.getMinutes().toString().padStart(2, "0") : "00";

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/20 overflow-hidden" ref={containerRef}>
      
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 p-6 flex items-center justify-between backdrop-blur-md bg-background/50 border-b border-border/50 transition-all">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Hifocus Logo" width={32} height={32} className="rounded" />
          <span className="font-mono font-bold text-xl tracking-tighter">HIFOCUS</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground mr-4">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#testimonials" className="hover:text-primary transition-colors">Testimonials</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </div>
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-muted-foreground" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
            </button>
          )}
          <Link href="/app">
            <Button className="rounded-full px-6 font-semibold shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all">
              Enter UI <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-24 px-4 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="text-center z-10 max-w-5xl mx-auto space-y-8 flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <Sparkles className="h-4 w-4" />
            <span>Redefining deep work architecture.</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-5xl sm:text-7xl md:text-[5.5rem] font-bold tracking-tighter leading-[1.05] font-mono"
          >
            Own your time. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
              Master your focus.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light"
          >
            A powerfully simple, beautifully aesthetic digital workspace combining Pomodoro intervals, countdowns, and distraction-free tracking.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center gap-6 mt-12 bg-card/50 p-6 sm:p-8 rounded-[2.5rem] border border-border/50 shadow-2xl backdrop-blur-sm"
          >
            {mounted && time ? (
              <>
                <FlipCardAnimation value={hours[0]} />
                <FlipCardAnimation value={hours[1]} />
                <div className="flex flex-col gap-3 md:gap-4 mx-1 sm:mx-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary/60 shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-pulse-glow" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary/60 shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-pulse-glow" />
                </div>
                <FlipCardAnimation value={minutes[0]} />
                <FlipCardAnimation value={minutes[1]} />
              </>
            ) : (
               <div className="h-24 sm:h-28 md:h-32 w-64 animate-pulse bg-muted rounded-[2rem]" />
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Parallax Revolving Clock & Features Section */}
      <section id="features" className="relative border-t border-border/50 bg-secondary/10">
        
        {/* Sticky Background Clocks */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="sticky top-0 h-screen w-full flex flex-col justify-center">
            {/* Left Parallax Flip Cards */}
            <motion.div style={{ y: flipLeftY1 }} className="absolute left-[5%] md:left-[10%] top-[-10%] md:top-[10%] opacity-30 transform -rotate-12 scale-75 md:scale-100 hidden sm:block">
              <FlipCardAnimation value="25" />
            </motion.div>
            <motion.div style={{ y: flipLeftY2 }} className="absolute left-[15%] md:left-[20%] bottom-[-10%] md:bottom-[10%] opacity-20 transform rotate-12 scale-50 md:scale-75 hidden sm:block">
              <FlipCardAnimation value="05" />
            </motion.div>

            {/* Revolving Background Clock */}
            <motion.div 
              style={{ 
                rotate: clockRotation, 
                scale: clockScale,
                opacity: 0.8
              }}
              className="absolute right-[-20%] md:right-10 top-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] border-[4px] border-primary rounded-full flex items-center justify-center"
            >
              {/* Clock Markers */}
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute top-1/2 left-1/2 -mt-5 -ml-[3px]"
                  style={{ transform: `rotate(${i * 30}deg)` }}
                >
                  <div className="w-1.5 h-10 bg-primary opacity-60 -translate-y-[280px] md:-translate-y-[380px]"></div>
                </div>
              ))}
              {/* Concentric rings */}
              <div className="absolute w-[450px] h-[450px] md:w-[600px] md:h-[600px] border-[2px] border-primary/40 rounded-full" />
              <div className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] border-[3px] border-primary/20 rounded-full border-dashed" />
              
              {/* Rotating hand */}
              <div className="absolute w-2 h-56 md:h-72 bg-gradient-to-t from-primary to-transparent rounded-full origin-bottom bottom-1/2 transform rotate-45 pointer-events-none" />
              <div className="absolute w-8 h-8 bg-background border-4 border-primary rounded-full" />
            </motion.div>
          </div>
        </div>

        {/* Scrolling Content over the clock */}
        <div className="relative z-10 py-32">
          <div className="max-w-7xl mx-auto px-4 space-y-48 md:space-y-64">
            
            {/* Feature 1 */}
            <div className="max-w-xl bg-background/50 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 dark:border-white/5 shadow-2xl">
              <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 text-primary mb-6">
                <Brain className="h-7 w-7" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter font-mono mb-6">Beat Procrastination.</h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                Our built-in Pomodoro sequencer automatically breaks your work into focused, manageable chunks. The physical feeling of the flip clock anchors you to the present moment.
              </p>
              <ul className="space-y-4">
                {["Scientifically proven 25m/5m intervals", "Customizable ambient soundscapes", "Zero-distraction fullscreen engine"].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground font-medium">
                    <CheckCircle2 className="h-5 w-5 text-primary" /> {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="max-w-xl bg-background/50 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 dark:border-white/5 shadow-2xl md:mr-auto">
              <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 text-primary mb-6">
                <Target className="h-7 w-7" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter font-mono mb-6">Countdown to Launch.</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Whether it's a final exam, a product drop, or a 1-hour sprint, dial in exact deadlines. Watch the seconds tick away as urgency translates into flow.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="max-w-xl bg-background/50 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 dark:border-white/5 shadow-2xl">
              <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 text-primary mb-6">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter font-mono mb-6">Absolute Aesthetics.</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We painstakingly designed 7 gorgeous themes like <span className="text-red-500 font-bold">Coral</span>, <span className="text-emerald-500 font-bold">Emerald</span>, and <span className="text-slate-500 font-bold">Industrial</span>. Seamlessly integrated with Light and Dark modes.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 px-4 bg-muted/30 border-t border-border/50 relative">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-5xl font-bold font-mono tracking-tighter">Loved by creators.</h2>
            <p className="text-xl text-muted-foreground">See how professionals are taking back their time using Hifocus.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                text: "The sheer aesthetic of the flip clock creates a tactile boundary between my breaks and my deep work. Utterly fantastic app.",
                author: "Sarah J.",
                role: "Software Engineer",
                stars: 5,
              },
              {
                text: "I set my Pomodoro target, hit F11 for fullscreen, and the world melts away. I easily doubled my writing output this week.",
                author: "Michael T.",
                role: "Author",
                stars: 5,
              },
              {
                text: "The idle tracker that fades the UI away when you stop moving your mouse is the coolest feature I've seen in a productivity tool.",
                author: "Lena K.",
                role: "UI/UX Designer",
                stars: 5,
              }
            ].map((test, i) => (
              <div key={i} className="bg-card border border-border p-8 rounded-[2rem] shadow-sm relative hover:border-primary/50 transition-colors">
                <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/10" />
                <div className="flex gap-1 mb-6">
                  {[...Array(test.stars)].map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-lg text-foreground italic mb-6 leading-relaxed">"{test.text}"</p>
                <div>
                  <h4 className="font-bold text-foreground font-mono">{test.author}</h4>
                  <p className="text-sm text-muted-foreground">{test.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto space-y-16 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-5xl font-bold font-mono tracking-tighter">Simple Pricing.</h2>
            <p className="text-xl text-muted-foreground">Pick the plan that fits your work style. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-card border border-border p-10 rounded-[2.5rem] shadow-lg flex flex-col">
              <h3 className="text-2xl font-bold font-mono text-foreground mb-2">Essential</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-muted-foreground">forever</span>
              </div>
              <p className="text-muted-foreground mb-8">Everything you need to dive into basic deep work sessions.</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                {["Classic Midnight Theme", "Standard Pomodoro logic", "Countdown timer", "Basic Session Tracking"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" /> {f}
                  </li>
                ))}
              </ul>
              
              <Link href="/auth">
                <Button variant="outline" className="w-full h-14 rounded-full text-lg font-bold border-border hover:bg-secondary">
                  Start Free
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-primary/5 border-2 border-primary/50 relative p-10 rounded-[2.5rem] shadow-2xl flex flex-col scale-100 md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold font-mono text-foreground mb-2">Pro Focus</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold">$9</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-8">Unleash advanced mechanics, artisan themes, and deep analytical reports.</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "All 7 Artisan Themes (Coral, Emerald, etc.)", 
                  "Cinematic Idle Fading",
                  "Advanced Task Workspaces",
                  "Detailed Analytics & Exports",
                  "Custom Soundscapes"
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 className="h-5 w-5 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              
              <Link href="/auth">
                <Button className="w-full h-14 rounded-full text-lg font-bold shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Layer */}
      <section className="py-24 px-4 relative">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-primary text-primary-foreground text-center p-12 sm:p-24 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-5xl sm:text-7xl font-bold font-mono tracking-tighter">Your time is yours again.</h2>
            <p className="text-xl sm:text-2xl font-light opacity-90">Jump right into the workspace. No installations required.</p>
            <div className="pt-8">
              <Link href="/app">
                <Button size="lg" variant="secondary" className="h-16 px-12 rounded-full text-lg font-bold text-primary hover:scale-105 transition-transform shadow-2xl">
                  Enter Workspace <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background py-16 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Hifocus Logo" width={24} height={24} className="rounded" />
            <span className="font-mono font-bold tracking-tighter">HIFOCUS</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground font-medium">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="https://github.com/CodeCrafter19programmer/hifocus-studio" className="hover:text-foreground transition-colors">GitHub</Link>
          </div>
          <p className="text-muted-foreground text-sm font-mono">&copy; {new Date().getFullYear()} Hifocus Studio</p>
        </div>
      </footer>
    </div>
  );
}
