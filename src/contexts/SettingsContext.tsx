"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { SoundId } from "@/lib/sounds";
import { useAuth } from "@/contexts/AuthContext";

export interface Settings {
  is24Hour: boolean;
  showSeconds: boolean;
  showDate: boolean;
  theme: "midnight" | "espresso" | "denim" | "coral" | "vintage" | "emerald" | "industrial";
  alertSound: SoundId;
  hourlyChime: boolean;
}

const defaultSettings: Settings = {
  is24Hour: true,
  showSeconds: true,
  showDate: true,
  theme: "midnight",
  alertSound: "chime",
  hourlyChime: true,
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hifocus-settings");
      if (stored) {
        try {
          return { ...defaultSettings, ...JSON.parse(stored) };
        } catch (e) {}
      }
    }
    return defaultSettings;
  });
  
  const { session } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hifocus-settings", JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    const load = async () => {
      if (!session) return;
      try {
        const res = await fetch("/api/settings", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!res.ok) return;
        const data = (await res.json()) as { settings?: Partial<Settings> };
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      } catch (e) {
        console.warn("Failed to load settings from API", e);
      }
    };
    void load();
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(settings),
        signal: controller.signal,
      }).catch((e) => {
        console.warn("Failed to persist settings", e);
      });
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [settings, session]);

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
