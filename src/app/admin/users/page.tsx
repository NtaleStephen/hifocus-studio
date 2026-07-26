"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  plan: string;
  createdAt: string;
  disabledAt: string | null;
  subscriptionStatus: string | null;
  subscribedAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  sessionCount: number;
  totalMinutes: number;
  lastActiveAt: string | null;
}

const PLAN_LABEL: Record<string, string> = {
  SEEDLING: "Seedling",
  FLOW: "Flow",
  DEEP_WORK: "Deep Work",
  STUDIO: "Studio",
};

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminUsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [subscribersOnly, setSubscribersOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (subscribersOnly) params.set("subscribers", "true");
      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { users: AdminUser[]; total: number };
        setUsers(data.users);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [session, q, subscribersOnly]);

  useEffect(() => {
    void load();
  }, [subscribersOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleStatus = async (u: AdminUser) => {
    if (!session) return;
    const action = u.disabledAt ? "reactivate" : "deactivate";
    if (action === "deactivate" && !confirm(`Deactivate ${u.email}? They'll be locked out until reactivated.`)) return;
    setBusyId(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const { user } = (await res.json()) as { user: { disabledAt: string | null } };
        setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, disabledAt: user.disabledAt } : x)));
        toast.success(action === "deactivate" ? "Account deactivated." : "Account reactivated.");
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error ?? "Action failed.");
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">{total.toLocaleString()} total</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={subscribersOnly}
              onChange={(e) => setSubscribersOnly(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Subscribers only
          </label>
          <Input
            placeholder="Search email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="w-56"
          />
          <Button onClick={() => load()} disabled={loading}>
            {loading ? "…" : "Search"}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Subscribed</th>
              <th className="px-4 py-3 font-medium">Next billing</th>
              <th className="px-4 py-3 font-medium text-right">Sessions</th>
              <th className="px-4 py-3 font-medium">Last active</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/20">
                <td className="max-w-[220px] truncate px-4 py-3 font-medium" title={u.email}>{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${u.plan === "SEEDLING" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                    {PLAN_LABEL[u.plan] ?? u.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.disabledAt ? (
                    <span className="text-xs font-medium text-destructive">Deactivated</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">{u.subscriptionStatus ?? "active"}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(u.subscribedAt)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {fmtDate(u.currentPeriodEnd)}
                  {u.cancelAtPeriodEnd && <span className="ml-1 text-xs text-destructive">(cancels)</span>}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{u.sessionCount}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(u.lastActiveAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant={u.disabledAt ? "outline" : "ghost"}
                    className={u.disabledAt ? "" : "text-destructive hover:bg-destructive/10 hover:text-destructive"}
                    disabled={busyId === u.id}
                    onClick={() => toggleStatus(u)}
                  >
                    {busyId === u.id ? "…" : u.disabledAt ? "Reactivate" : "Deactivate"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
