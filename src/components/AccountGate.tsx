"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";

/**
 * Gates the app for deactivated accounts: if the signed-in user is disabled,
 * shows a reactivation screen instead of the app.
 */
export function AccountGate({ children }: { children: React.ReactNode }) {
  const { session, signOut } = useAuth();
  const [disabled, setDisabled] = useState<boolean | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!session) {
      setDisabled(null);
      return;
    }
    let cancelled = false;
    fetch("/api/account/status", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => (r.ok ? r.json() : { disabled: false }))
      .then((d: { disabled?: boolean }) => {
        if (!cancelled) setDisabled(Boolean(d.disabled));
      })
      .catch(() => {
        if (!cancelled) setDisabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const reactivate = async () => {
    if (!session) return;
    setWorking(true);
    try {
      const res = await fetch("/api/account/reactivate", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) setDisabled(false);
    } finally {
      setWorking(false);
    }
  };

  if (disabled) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <UserX className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Account deactivated</h1>
          <p className="max-w-md text-muted-foreground">
            Your account is currently deactivated. Reactivate to pick up right where you left off — your data is safe.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={reactivate} disabled={working}>
            {working ? "Reactivating…" : "Reactivate account"}
          </Button>
          <Button variant="ghost" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
