import { useEffect, useState } from "react";
import type { Plan } from "@/lib/features";
import { useAuth } from "@/contexts/AuthContext";

export function useSubscription() {
  const { session } = useAuth();
  const [plan, setPlan] = useState<Plan>("seedling");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setPlan("seedling");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/subscription", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { plan?: Plan };
        if (data.plan) {
          setPlan(data.plan);
        }
      })
      .finally(() => setLoading(false));
  }, [session]);

  return { plan, loading };
}

