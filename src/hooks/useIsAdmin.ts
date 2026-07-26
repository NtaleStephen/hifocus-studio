import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Module-level cache so navigating between pages doesn't re-hit the endpoint
// for the same signed-in user.
let cache: { userId: string; isAdmin: boolean } | null = null;

export function useIsAdmin(): boolean {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [isAdmin, setIsAdmin] = useState<boolean>(
    cache && cache.userId === userId ? cache.isAdmin : false,
  );

  useEffect(() => {
    if (!session || !userId) {
      setIsAdmin(false);
      return;
    }
    if (cache && cache.userId === userId) {
      setIsAdmin(cache.isAdmin);
      return;
    }
    let cancelled = false;
    fetch("/api/admin/session", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => (r.ok ? r.json() : { isAdmin: false }))
      .then((d: { isAdmin?: boolean }) => {
        cache = { userId, isAdmin: Boolean(d.isAdmin) };
        if (!cancelled) setIsAdmin(Boolean(d.isAdmin));
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, userId]);

  return isAdmin;
}
