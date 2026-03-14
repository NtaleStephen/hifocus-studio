"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface TaskSelection {
  projectId?: string;
  taskId?: string;
}

interface TaskContextType {
  selection: TaskSelection;
  setSelection: (value: TaskSelection) => void;
}

const TaskContext = createContext<TaskContextType | null>(null);

export const useTaskSelection = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTaskSelection must be used within TaskProvider");
  }
  return ctx;
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [selection, setSelectionState] = useState<TaskSelection>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("hifocus-task-selection");
      if (raw) {
        const parsed = JSON.parse(raw) as TaskSelection;
        setSelectionState(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const setSelection = (value: TaskSelection) => {
    setSelectionState(value);
    try {
      localStorage.setItem("hifocus-task-selection", JSON.stringify(value));
    } catch {
      // ignore
    }
  };

  return (
    <TaskContext.Provider value={{ selection, setSelection }}>
      {children}
    </TaskContext.Provider>
  );
};

