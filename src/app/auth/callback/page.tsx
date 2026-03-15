"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const run = async () => {
      const code = searchParams.get("code");
      const next = searchParams.get("next") ?? "/";

      if (!code) {
        router.replace("/auth");
        return;
      }

      // Wait for Supabase to detect and set the session from URL
      await new Promise((res) => setTimeout(res, 1000));

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth");
        return;
      }

      router.replace(next);
    };

    void run();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-sm text-muted-foreground">Signing you in…</div>
    </div>
  );
}
