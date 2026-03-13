"use client";

import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="relative mb-8">
        <h1 className="font-mono text-[12rem] font-bold leading-none tracking-tighter opacity-10">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-4xl font-bold uppercase tracking-widest text-primary">Lost in Time</p>
        </div>
      </div>
      
      <p className="mb-12 max-w-sm text-lg text-muted-foreground">
        The page you are looking for has been lost in the fourth dimension.
      </p>

      <Link href="/">
        <Button size="lg" className="h-12 gap-2 rounded-full px-8 text-sm font-semibold transition-all hover:scale-105 active:scale-95">
          <MoveLeft className="h-4 w-4" />
          Back to Clock
        </Button>
      </Link>
    </div>
  );
}
