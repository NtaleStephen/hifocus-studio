"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Users, CreditCard, DollarSign, Clock } from "lucide-react";

interface Overview {
  users: { total: number; new24h: number; new7d: number; new30d: number };
  plans: Record<string, number>;
  subscribers: number;
  mrr: number;
  focus: { totalSessions: number; totalHours: number; activeUsers7d: number; activeUsers30d: number };
  signupsDaily: { date: string; count: number }[];
  focusDaily: { date: string; hours: number }[];
}

const PLAN_META: { key: string; label: string; color: string }[] = [
  { key: "SEEDLING", label: "Seedling", color: "#94a3b8" },
  { key: "FLOW", label: "Flow", color: "#6366f1" },
  { key: "DEEP_WORK", label: "Deep Work", color: "#ec4899" },
  { key: "STUDIO", label: "Studio", color: "#22c55e" },
];

function Kpi({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const { session } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    fetch("/api/admin/overview", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Overview | null) => setData(d))
      .finally(() => setLoading(false));
  }, [session]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading overview…</p>;
  }
  if (!data) {
    return <p className="text-sm text-muted-foreground">Failed to load overview.</p>;
  }

  const totalPlans = PLAN_META.reduce((sum, p) => sum + (data.plans[p.key] ?? 0), 0) || 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">Platform metrics across all users.</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Users} label="Total users" value={data.users.total.toLocaleString()} sub={`+${data.users.new7d} this week`} />
        <Kpi icon={CreditCard} label="Subscribers" value={data.subscribers.toLocaleString()} sub={`${((data.subscribers / (data.users.total || 1)) * 100).toFixed(1)}% of users`} />
        <Kpi icon={DollarSign} label="Est. MRR" value={`$${data.mrr.toLocaleString()}`} sub="from active plans" />
        <Kpi icon={Clock} label="Focus hours" value={`${data.focus.totalHours.toLocaleString()}h`} sub={`${data.focus.activeUsers7d} active (7d)`} />
      </div>

      {/* Plan distribution */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Plan distribution</h2>
        <div className="space-y-3">
          {PLAN_META.map((p) => {
            const count = data.plans[p.key] ?? 0;
            const pct = (count / totalPlans) * 100;
            return (
              <div key={p.key} className="flex items-center gap-3">
                <span className="w-20 text-sm">{p.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                </div>
                <span className="w-24 text-right text-sm tabular-nums text-muted-foreground">
                  {count.toLocaleString()} ({pct.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">Signups (30 days)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.signupsDaily}>
                <XAxis dataKey="date" tickLine={false} tickMargin={8} tickFormatter={(v) => v.slice(5)} minTickGap={24} />
                <YAxis tickLine={false} width={28} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">Focus hours (30 days)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.focusDaily}>
                <XAxis dataKey="date" tickLine={false} tickMargin={8} tickFormatter={(v) => v.slice(5)} minTickGap={24} />
                <YAxis tickLine={false} width={28} tickFormatter={(v) => `${v}h`} />
                <Tooltip formatter={(v: number) => `${v} hours`} />
                <Line type="monotone" dataKey="hours" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
