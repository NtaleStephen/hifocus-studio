"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useTaskSelection } from "@/contexts/TaskContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { playSound } from "@/lib/sounds";

export type TimerMode = "pomodoro" | "countdown";
export type TimerStatus = "idle" | "running" | "paused" | "complete";

export interface TimerState {
  status: TimerStatus;
  durationSeconds: number; // configured total
  remainingSeconds: number; // current remaining (derived from endsAt while running)
  endsAt: number | null; // ms epoch when it reaches 0 (running only)
  startedAt: number | null; // ms epoch of first start (for session recording)
  projectId?: string;
  taskId?: string;
  workspaceId?: string | null;
}

type TimersState = Record<TimerMode, TimerState>;

const DEFAULT_DURATIONS: Record<TimerMode, number> = {
  pomodoro: 25 * 60,
  countdown: 0,
};

function makeIdle(mode: TimerMode): TimerState {
  return {
    status: "idle",
    durationSeconds: DEFAULT_DURATIONS[mode],
    remainingSeconds: DEFAULT_DURATIONS[mode],
    endsAt: null,
    startedAt: null,
  };
}

const INITIAL: TimersState = {
  pomodoro: makeIdle("pomodoro"),
  countdown: makeIdle("countdown"),
};

interface PendingSession {
  type: TimerMode;
  durationMinutes: number;
  startedAt: string | null;
  projectId?: string;
  taskId?: string;
  workspaceId?: string | null;
}

interface TimersContextValue {
  pomodoro: TimerState;
  countdown: TimerState;
  /** Set the total duration (seconds). Ignored while the timer is running. */
  setDuration: (mode: TimerMode, seconds: number) => void;
  start: (mode: TimerMode) => void;
  pause: (mode: TimerMode) => void;
  reset: (mode: TimerMode) => void;
}

const TimersContext = createContext<TimersContextValue | null>(null);

export const useTimers = () => {
  const ctx = useContext(TimersContext);
  if (!ctx) throw new Error("useTimers must be used within TimersProvider");
  return ctx;
};

const STORAGE_KEY = "hifocus-timers";

export function TimersProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const { settings } = useSettings();
  const { selection } = useTaskSelection();
  const { activeWorkspace } = useWorkspace();

  const [timers, setTimers] = useState<TimersState>(INITIAL);

  // Refs mirror the latest values so the 500ms tick and stable callbacks don't
  // need to be re-created (and don't capture stale closures).
  const timersRef = useRef(timers);
  const settingsRef = useRef(settings);
  const selectionRef = useRef(selection);
  const workspaceRef = useRef(activeWorkspace);
  const sessionRef = useRef(session);
  const pendingRef = useRef<PendingSession[]>([]);
  const hydratedRef = useRef(false);

  useEffect(() => { timersRef.current = timers; }, [timers]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { selectionRef.current = selection; }, [selection]);
  useEffect(() => { workspaceRef.current = activeWorkspace; }, [activeWorkspace]);

  // Post any queued completed sessions to the API (retries on next flush if the
  // session isn't ready or the request fails).
  const flushPending = useCallback(async () => {
    const s = sessionRef.current;
    if (!s || pendingRef.current.length === 0) return;
    const items = pendingRef.current;
    pendingRef.current = [];
    for (const item of items) {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${s.access_token}`,
          },
          body: JSON.stringify(item),
        });
        if (!res.ok) pendingRef.current.push(item);
      } catch {
        pendingRef.current.push(item);
      }
    }
  }, []);

  // Flush whenever the auth session becomes available/changes.
  useEffect(() => {
    sessionRef.current = session;
    void flushPending();
  }, [session, flushPending]);

  const queueSession = useCallback(
    (mode: TimerMode, t: TimerState) => {
      pendingRef.current.push({
        type: mode,
        durationMinutes: Math.max(1, Math.round(t.durationSeconds / 60)),
        startedAt: t.startedAt ? new Date(t.startedAt).toISOString() : null,
        projectId: t.projectId,
        taskId: t.taskId,
        workspaceId: t.workspaceId ?? null,
      });
      void flushPending();
    },
    [flushPending],
  );

  // ---- Hydrate from localStorage on mount ----
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<TimersState>;
        const now = Date.now();
        const restored: TimersState = {
          pomodoro: saved.pomodoro ?? makeIdle("pomodoro"),
          countdown: saved.countdown ?? makeIdle("countdown"),
        };
        (["pomodoro", "countdown"] as const).forEach((mode) => {
          const t = restored[mode];
          if (t.status === "running" && t.endsAt) {
            const rem = Math.round((t.endsAt - now) / 1000);
            if (rem <= 0) {
              // Completed while the app was closed — record it.
              queueSession(mode, t);
              restored[mode] = { ...t, status: "complete", remainingSeconds: 0, endsAt: null };
            } else {
              restored[mode] = { ...t, remainingSeconds: rem };
            }
          }
        });
        setTimers(restored);
      }
    } catch {
      // ignore malformed storage
    }
    hydratedRef.current = true;
  }, [queueSession]);

  // ---- Persist to localStorage (after hydration) ----
  useEffect(() => {
    if (typeof window === "undefined" || !hydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch {
      // ignore quota / serialization errors
    }
  }, [timers]);

  // ---- The single tick that drives both timers from wall-clock time ----
  useEffect(() => {
    const id = setInterval(() => {
      const t = timersRef.current;
      let changed = false;
      const next: TimersState = { pomodoro: t.pomodoro, countdown: t.countdown };

      (["pomodoro", "countdown"] as const).forEach((mode) => {
        const tm = t[mode];
        if (tm.status !== "running" || tm.endsAt == null) return;
        const rem = Math.max(0, Math.round((tm.endsAt - Date.now()) / 1000));
        if (rem <= 0) {
          next[mode] = { ...tm, status: "complete", remainingSeconds: 0, endsAt: null };
          changed = true;
          playSound(settingsRef.current.alertSound);
          queueSession(mode, tm);
        } else if (rem !== tm.remainingSeconds) {
          next[mode] = { ...tm, remainingSeconds: rem };
          changed = true;
        }
      });

      if (changed) setTimers(next);
    }, 500);

    return () => clearInterval(id);
  }, [queueSession]);

  // ---- Actions ----
  const setDuration = useCallback((mode: TimerMode, seconds: number) => {
    setTimers((prev) => {
      const tm = prev[mode];
      if (tm.status === "running") return prev; // can't change a running timer
      const clamped = Math.max(0, Math.round(seconds));
      return {
        ...prev,
        [mode]: {
          ...tm,
          status: "idle",
          durationSeconds: clamped,
          remainingSeconds: clamped,
          endsAt: null,
          startedAt: null,
        },
      };
    });
  }, []);

  const start = useCallback((mode: TimerMode) => {
    setTimers((prev) => {
      const tm = prev[mode];
      if (tm.status === "running" || tm.remainingSeconds <= 0) return prev;
      return {
        ...prev,
        [mode]: {
          ...tm,
          status: "running",
          endsAt: Date.now() + tm.remainingSeconds * 1000,
          startedAt: tm.startedAt ?? Date.now(),
          // Capture attribution at start time.
          projectId: selectionRef.current.projectId,
          taskId: selectionRef.current.taskId,
          workspaceId: workspaceRef.current?.id ?? null,
        },
      };
    });
  }, []);

  const pause = useCallback((mode: TimerMode) => {
    setTimers((prev) => {
      const tm = prev[mode];
      if (tm.status !== "running") return prev;
      const rem = tm.endsAt
        ? Math.max(0, Math.round((tm.endsAt - Date.now()) / 1000))
        : tm.remainingSeconds;
      return { ...prev, [mode]: { ...tm, status: "paused", remainingSeconds: rem, endsAt: null } };
    });
  }, []);

  const reset = useCallback((mode: TimerMode) => {
    setTimers((prev) => {
      const tm = prev[mode];
      return {
        ...prev,
        [mode]: {
          ...tm,
          status: "idle",
          remainingSeconds: tm.durationSeconds,
          endsAt: null,
          startedAt: null,
        },
      };
    });
  }, []);

  return (
    <TimersContext.Provider
      value={{
        pomodoro: timers.pomodoro,
        countdown: timers.countdown,
        setDuration,
        start,
        pause,
        reset,
      }}
    >
      {children}
    </TimersContext.Provider>
  );
}
