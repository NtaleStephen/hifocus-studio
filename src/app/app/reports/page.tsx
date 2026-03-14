"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import SettingsPanel from "@/components/SettingsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";

interface DailyPoint {
  date: string;
  minutes: number;
  hours: number;
}

interface ProjectPoint {
  name: string;
  minutes: number;
  hours: number;
}

interface MemberPoint {
  email: string;
  minutes: number;
  hours: number;
}

interface SummaryResponse {
  totalMinutes: number;
  totalHours: number;
  daily: DailyPoint[];
  projects: ProjectPoint[];
  members?: MemberPoint[];
}

const COLORS = [
  "#6366f1",
  "#ec4899",
  "#22c55e",
  "#f97316",
  "#eab308",
  "#06b6d4",
  "#0ea5e9",
];

export default function ReportsPage() {
  const { session } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    const load = async () => {
      setLoading(true);
      try {
        const query = activeWorkspace ? `?workspaceId=${activeWorkspace.id}` : "";
        const res = await fetch(`/api/reports/summary${query}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (res.ok) {
          const data = (await res.json()) as SummaryResponse;
          setSummary(data);
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [session, activeWorkspace]);

  const exportCsv = async () => {
    if (!session) return;
    const res = await fetch("/api/reports/export?days=90", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hifocus-sessions-export.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <NavBar
        onSettingsClick={() => setSettingsOpen(true)}
        onFullscreen={() => {
          if (typeof document !== "undefined") {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }
        }}
      />
      <main className="flex flex-1 w-full max-w-5xl flex-col gap-8 px-4 py-10">
        <section className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Focus reports
            </h1>
            <p className="text-sm text-muted-foreground">
              See how your time is distributed across days and projects.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            Export CSV
          </Button>
        </section>

        {loading && (
          <p className="text-sm text-muted-foreground">Loading reports…</p>
        )}

        {summary && !loading && (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total focus (last 30 days)
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {summary.totalHours.toFixed(1)}h
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Average per day
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {summary.daily.length
                    ? (summary.totalHours / summary.daily.length).toFixed(1)
                    : "0.0"}
                  h
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Active days
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {summary.daily.length}
                </p>
              </div>
            </section>

            <section className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2 rounded-lg border bg-card p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Time by day (hours)
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.daily}>
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(5)}
                      />
                      <YAxis
                        tickLine={false}
                        tickMargin={8}
                        width={32}
                        tickFormatter={(value) => `${value}h`}
                      />
                      <Tooltip
                        formatter={(value: number) =>
                          `${value.toFixed(2)} hours`
                        }
                      />
                      <Bar dataKey="hours" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Time by project
                </p>
                <div className="h-64">
                  {summary.projects.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No project-linked sessions yet.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary.projects}
                          dataKey="hours"
                          nameKey="name"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={1}
                        >
                          {summary.projects.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={
                                COLORS[index % COLORS.length] ?? COLORS[0]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, _name, payload) => [
                            `${value.toFixed(2)} hours`,
                            (payload?.payload as ProjectPoint | undefined)
                              ?.name ?? "",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

