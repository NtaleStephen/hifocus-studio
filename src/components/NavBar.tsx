"use client";

import {
  Clock,
  Timer,
  Settings,
  Maximize,
  Info,
  Palette,
  Brain,
  LogOut,
  User,
  ListOrdered,
  BarChart3,
  CreditCard,
  Building2,
  ChevronDown,
  CheckCircle2,
  Menu,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useTimers } from "@/contexts/TimersContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NavBarProps {
  onSettingsClick: () => void;
  onFullscreen: () => void;
}

// Fixed liquid-glass surface for dropdown menus — matches the modal / settings
// panel and stays legible across every theme.
const GLASS_MENU =
  "w-56 rounded-xl border border-white/15 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.1),rgba(12,12,16,0.74)_40%,rgba(12,12,16,0.82))] text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl [&_[role=menuitem]:focus]:bg-white/10 [&_[role=menuitem]:focus]:text-white [&_[role=separator]]:bg-white/15";

function formatRemaining(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

const NavBar = ({ onSettingsClick, onFullscreen }: NavBarProps) => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const { pomodoro, countdown } = useTimers();
  const isAdmin = useIsAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const runningTimers = [
    pomodoro.status === "running"
      ? { key: "pomodoro", label: "Pomodoro", href: "/app/pomodoro", icon: Brain, seconds: pomodoro.remainingSeconds }
      : null,
    countdown.status === "running"
      ? { key: "countdown", label: "Countdown", href: "/app/countdown", icon: Timer, seconds: countdown.remainingSeconds }
      : null,
  ].filter((t): t is NonNullable<typeof t> => t !== null);

  const links = [
    { path: "/app", icon: Clock, label: "Clock" },
    { path: "/app/countdown", icon: Timer, label: "Countdown" },
    { path: "/app/pomodoro", icon: Brain, label: "Pomodoro" },
    { path: "/app/themes", icon: Palette, label: "Themes" },
    { path: "/app/tasks", icon: ListOrdered, label: "Tasks" },
    { path: "/app/reports", icon: BarChart3, label: "Reports" },
    { path: "/about", icon: Info, label: "About" },
  ];

  if (pathname === "/auth") return null;

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-40 flex items-center justify-center gap-1 p-4"
      style={{ backgroundColor: "hsl(var(--nav-bg))" }}
    >
      <div className="flex items-center gap-1 rounded-full border border-border bg-card/60 px-2 pl-3 py-1 backdrop-blur-md shadow-lg">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity mr-2">
          <Image src="/logo.png" alt="Hifocus Logo" width={24} height={24} className="rounded shadow-sm" />
        </Link>

        {/* ── Running timer indicator(s) ──────────────────────────── */}
        {runningTimers.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            title={`${t.label} running — ${formatRemaining(t.seconds)} left`}
            className="mr-1 flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <t.icon className="h-3.5 w-3.5" />
            <span className="hidden font-mono tabular-nums sm:inline">{formatRemaining(t.seconds)}</span>
          </Link>
        ))}

        {/* ── Desktop nav links (md+) ─────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              href={path}
              title={label}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-all duration-200 xl:px-4 ${
                pathname === path
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden font-medium xl:inline">{label}</span>
            </Link>
          ))}

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Workspace Switcher */}
          {workspaces.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/10"
                  title="Workspace"
                >
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="hidden xl:inline text-xs font-medium max-w-[100px] truncate">
                    {activeWorkspace ? activeWorkspace.name : "Personal"}
                  </span>
                  <ChevronDown className="h-3 w-3 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={GLASS_MENU}>
                <DropdownMenuLabel className="font-mono text-xs font-medium text-white/50">
                  Switch Workspace
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    setActiveWorkspace(null);
                    toast.info("Switched to personal workspace");
                  }}
                  className="cursor-pointer gap-2"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">Personal</span>
                  {!activeWorkspace && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {workspaces.map((ws) => (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      toast.success(`Switched to "${ws.name}"`);
                    }}
                    className="cursor-pointer gap-2"
                  >
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{ws.name}</span>
                    {activeWorkspace?.id === ws.id && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <Link href="/app/workspace">
                  <DropdownMenuItem className="cursor-pointer text-xs text-white/60">
                    Manage workspaces…
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Single workspace link when no workspaces yet */}
          {workspaces.length === 0 && (
            <Link
              href="/app/workspace"
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                pathname === "/app/workspace"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden font-medium xl:inline">Workspace</span>
            </Link>
          )}
        </div>

        {/* ── Settings + Fullscreen (always visible) ──────────────── */}
        <button
          onClick={onSettingsClick}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/10"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          onClick={onFullscreen}
          className="hidden sm:flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/10"
          title="Fullscreen"
        >
          <Maximize className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* ── Account (always visible) ────────────────────────────── */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <User className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={GLASS_MENU}>
              <DropdownMenuLabel className="font-mono text-xs font-medium text-white/50">
                Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm font-medium truncate">{user.email}</div>
              {activeWorkspace && (
                <div className="px-2 py-1 text-xs text-white/60 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {activeWorkspace.name}
                </div>
              )}
              <DropdownMenuSeparator />
              <Link href="/app/workspace">
                <DropdownMenuItem className="cursor-pointer">
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>Workspaces</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/app/billing">
                <DropdownMenuItem className="cursor-pointer">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <DropdownMenuItem className="cursor-pointer">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>Admin dashboard</span>
                  </DropdownMenuItem>
                </Link>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="cursor-pointer text-red-400 focus:!bg-red-500/15 focus:!text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/auth">
            <Button size="sm" variant="ghost" className="rounded-full h-8 px-3 text-xs font-semibold">
              Sign In
            </Button>
          </Link>
        )}

        {/* ── Mobile hamburger (below md) ─────────────────────────── */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="md:hidden flex items-center justify-center rounded-full px-3 py-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/10"
              title="Menu"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 overflow-y-auto border-white/15 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.1),rgba(12,12,16,0.82)_30%,rgba(12,12,16,0.9))] text-white backdrop-blur-2xl [&>button]:text-white/70 [&>button:hover]:text-white"
          >
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-mono tracking-wider text-white">
                <Image src="/logo.png" alt="Hifocus Logo" width={24} height={24} className="rounded" />
                HIFOCUS
              </SheetTitle>
            </SheetHeader>

            {/* Nav links */}
            <div className="mt-6 flex flex-col gap-1">
              {links.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  href={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    pathname === path
                      ? "bg-amber-400 text-neutral-950"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </div>

            {/* Workspace section */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="px-3 pb-2 font-mono text-xs font-medium text-white/50">Workspace</p>
              <button
                onClick={() => {
                  setActiveWorkspace(null);
                  toast.info("Switched to personal workspace");
                  setMobileOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <User className="h-4 w-4" />
                <span className="flex-1 text-left">Personal</span>
                {!activeWorkspace && <CheckCircle2 className="h-3.5 w-3.5 text-amber-300" />}
              </button>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    toast.success(`Switched to "${ws.name}"`);
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Building2 className="h-4 w-4" />
                  <span className="flex-1 truncate text-left">{ws.name}</span>
                  {activeWorkspace?.id === ws.id && <CheckCircle2 className="h-3.5 w-3.5 text-amber-300" />}
                </button>
              ))}
              <Link
                href="/app/workspace"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Building2 className="h-4 w-4" />
                <span className="font-medium">Manage workspaces</span>
              </Link>
            </div>

            {/* Account section */}
            <div className="mt-6 border-t border-white/10 pt-4">
              {user ? (
                <>
                  <p className="truncate px-3 pb-1 text-sm font-medium text-white">{user.email}</p>
                  <Link
                    href="/app/billing"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="font-medium">Billing</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/15"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Log out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-amber-300 transition-colors hover:bg-white/10"
                >
                  <User className="h-4 w-4" />
                  <span className="font-semibold">Sign In</span>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default NavBar;
