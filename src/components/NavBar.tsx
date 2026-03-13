"use client";

import { Clock, Timer, Settings, Maximize, Info, Palette, Brain, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface NavBarProps {
  onSettingsClick: () => void;
  onFullscreen: () => void;
}

const NavBar = ({ onSettingsClick, onFullscreen }: NavBarProps) => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const links = [
    { path: "/", icon: Clock, label: "Clock" },
    { path: "/countdown", icon: Timer, label: "Countdown" },
    { path: "/pomodoro", icon: Brain, label: "Pomodoro" },
    { path: "/themes", icon: Palette, label: "Themes" },
    { path: "/about", icon: Info, label: "About" },
  ];

  if (pathname === "/auth") return null;

  return (
    <nav className="fixed left-0 right-0 top-0 z-40 flex items-center justify-center gap-1 p-4" style={{ backgroundColor: "hsl(var(--nav-bg))" }}>
      <div className="flex items-center gap-1 rounded-full border border-border bg-card/60 px-2 py-1 backdrop-blur-md shadow-lg">
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
            <span className="hidden sm:inline font-medium">{label}</span>
          </Link>
        ))}

        <div className="mx-1 h-5 w-px bg-border" />

        <button
          onClick={onSettingsClick}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/10"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          onClick={onFullscreen}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/10"
          title="Fullscreen"
        >
          <Maximize className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <User className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-border bg-card/95 backdrop-blur-md">
              <DropdownMenuLabel className="font-mono text-xs font-medium text-muted-foreground">Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm font-medium truncate">
                {user.email}
              </div>
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
      </div>
    </nav>
  );
};

export default NavBar;
