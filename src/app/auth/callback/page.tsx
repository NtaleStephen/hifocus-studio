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

      console.log("[AuthCallback] Exchanging code for session...");
      const { error, data } = await supabase.auth.exchangeCodeForSession(code);
      console.log("[AuthCallback] exchangeCodeForSession error:", error);
      console.log("[AuthCallback] exchangeCodeForSession data:", data);

      if (error) {
        console.error("[AuthCallback] Auth callback error:", error);
        router.replace("/auth");
        return;
      }

      // Give Supabase a moment to establish the session
      await new Promise((res) => setTimeout(res, 500));

      // Verify session before redirecting
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
