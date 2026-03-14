"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER";
  memberCount: number;
  createdAt: string;
}

interface WorkspaceContextType {
  workspaces: WorkspaceInfo[];
  activeWorkspace: WorkspaceInfo | null;
  setActiveWorkspace: (ws: WorkspaceInfo | null) => void;
  loading: boolean;
  refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be inside WorkspaceProvider");
  return ctx;
};

const STORAGE_KEY = "hifocus-active-workspace";

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<WorkspaceInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    if (!session) {
      setWorkspaces([]);
      setActiveWorkspaceState(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/workspaces", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) return;

      const data = (await res.json()) as { workspaces: WorkspaceInfo[] };
      setWorkspaces(data.workspaces);

      // Restore previously active workspace from localStorage
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId) {
        const saved = data.workspaces.find((w) => w.id === savedId);
        if (saved) {
          setActiveWorkspaceState(saved);
        } else {
          setActiveWorkspaceState(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn("[WorkspaceContext] fetch error", e);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void fetchWorkspaces();
  }, [fetchWorkspaces]);

  const setActiveWorkspace = (ws: WorkspaceInfo | null) => {
    setActiveWorkspaceState(ws);
    if (ws) {
      localStorage.setItem(STORAGE_KEY, ws.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        loading,
        refresh: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
