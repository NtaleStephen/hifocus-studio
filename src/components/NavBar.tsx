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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
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

const NavBar = ({ onSettingsClick, onFullscreen }: NavBarProps) => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const [mobileOpen, setMobileOpen] = useState(false);

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

        {/* ── Desktop nav links (md+) ─────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              href={path}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                pathname === path
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{label}</span>
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
                  <span className="hidden lg:inline text-xs font-medium max-w-[100px] truncate">
                    {activeWorkspace ? activeWorkspace.name : "Personal"}
                  </span>
                  <ChevronDown className="h-3 w-3 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-border bg-card/95 backdrop-blur-md">
                <DropdownMenuLabel className="font-mono text-xs font-medium text-muted-foreground">
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
                  <DropdownMenuItem className="cursor-pointer text-xs text-muted-foreground">
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
              <span className="font-medium">Workspace</span>
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
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-border bg-card/95 backdrop-blur-md">
              <DropdownMenuLabel className="font-mono text-xs font-medium text-muted-foreground">
                Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm font-medium truncate">{user.email}</div>
              {activeWorkspace && (
                <div className="px-2 py-1 text-xs text-muted-foreground flex items-center gap-1">
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
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
          <SheetContent side="right" className="w-72 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-mono tracking-wider">
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
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </div>

            {/* Workspace section */}
            <div className="mt-6 border-t border-border pt-4">
              <p className="px-3 pb-2 font-mono text-xs font-medium text-muted-foreground">Workspace</p>
              <button
                onClick={() => {
                  setActiveWorkspace(null);
                  toast.info("Switched to personal workspace");
                  setMobileOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/10"
              >
                <User className="h-4 w-4" />
                <span className="flex-1 text-left">Personal</span>
                {!activeWorkspace && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
              </button>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    toast.success(`Switched to "${ws.name}"`);
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/10"
                >
                  <Building2 className="h-4 w-4" />
                  <span className="flex-1 truncate text-left">{ws.name}</span>
                  {activeWorkspace?.id === ws.id && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                </button>
              ))}
              <Link
                href="/app/workspace"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/10"
              >
                <Building2 className="h-4 w-4" />
                <span className="font-medium">Manage workspaces</span>
              </Link>
            </div>

            {/* Account section */}
            <div className="mt-6 border-t border-border pt-4">
              {user ? (
                <>
                  <p className="px-3 pb-1 text-sm font-medium truncate">{user.email}</p>
                  <Link
                    href="/app/billing"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/10"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="font-medium">Billing</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Log out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-primary transition-colors hover:bg-primary/10"
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
