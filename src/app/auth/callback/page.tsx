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
      console.log("[AuthCallback] code:", !!code, "next:", next);

      if (!code) {
        console.error("[AuthCallback] No code in URL");
        router.replace("/auth");
        return;
      }

      // Let Supabase handle the session from URL automatically
      console.log("[AuthCallback] Waiting for session detection...");
      // Wait a bit for Supabase to detect and set the session from URL
      await new Promise((res) => setTimeout(res, 1000));

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("[AuthCallback] getSession error:", sessionError);
      console.log("[AuthCallback] getSession session:", !!session);

      if (!session) {
        console.error("[AuthCallback] No session after callback");
        router.replace("/auth");
        return;
      }

      console.log("[AuthCallback] Redirecting to:", next);
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
