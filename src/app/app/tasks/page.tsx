"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import SettingsPanel from "@/components/SettingsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useTaskSelection } from "@/contexts/TaskContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Project {
  id: string;
  name: string;
  color: string | null;
}

interface Task {
  id: string;
  name: string;
  completed: boolean;
  projectId: string | null;
}

export default function TasksPage() {
  const { session } = useAuth();
  const { selection, setSelection } = useTaskSelection();
  const { activeWorkspace } = useWorkspace();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState("");
  const [taskName, setTaskName] = useState("");
  const [taskProjectId, setTaskProjectId] = useState<string | "">("");

  useEffect(() => {
    if (!session) return;

    const headers = {
      Authorization: `Bearer ${session.access_token}`,
    };

    const load = async () => {
      try {
        const query = activeWorkspace ? `?workspaceId=${activeWorkspace.id}` : "";
        const [pRes, tRes] = await Promise.all([
          fetch(`/api/projects${query}`, { headers }),
          fetch(`/api/tasks${query}`, { headers }),
        ]);
        if (pRes.ok) {
          const data = (await pRes.json()) as { projects: Project[] };
          setProjects(data.projects);
        }
        if (tRes.ok) {
          const data = (await tRes.json()) as { tasks: Task[] };
          setTasks(data.tasks);
        }
      } catch {
        // ignore for now
      }
    };

    void load();
  }, [session, activeWorkspace]);

  const createProject = async () => {
    if (!session || !projectName.trim()) return;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          name: projectName,
          workspaceId: activeWorkspace?.id ?? null,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { project: Project };
        setProjects((prev) => [...prev, data.project]);
        setProjectName("");
      }
    } catch {
      // ignore
    }
  };

  const createTask = async () => {
    if (!session || !taskName.trim()) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: taskName,
          projectId: taskProjectId || null,
          workspaceId: activeWorkspace?.id ?? null,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { task: Task };
        setTasks((prev) => [...prev, data.task]);
        setTaskName("");
      }
    } catch {
      // ignore
    }
  };

  const toggleTaskCompleted = async (task: Task) => {
    if (!session) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: task.id,
          completed: !task.completed,
        }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, completed: !t.completed } : t,
          ),
        );
      }
    } catch {
      // ignore
    }
  };

  const currentProject = projects.find((p) => p.id === selection.projectId);
  const currentTask = tasks.find((t) => t.id === selection.taskId);

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
      <main className="flex flex-1 w-full max-w-4xl flex-col gap-8 px-4 py-10">
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Projects & Tasks
          </h1>
          <p className="text-sm text-muted-foreground">
            Organize your focus sessions by project and task. The active
            selection will be attached to new sessions.
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Projects
            </h2>
            <div className="flex gap-2">
              <Input
                placeholder="New project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <Button onClick={createProject}>Add</Button>
            </div>
            <div className="space-y-1 rounded-lg border bg-card p-3">
              {projects.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No projects yet. Create one to get started.
                </p>
              )}
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() =>
                    setSelection({
                      projectId: project.id,
                      taskId: selection.taskId,
                    })
                  }
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-sm hover:bg-accent ${
                    selection.projectId === project.id ? "bg-accent" : ""
                  }`}
                >
                  <span>{project.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Tasks
            </h2>
            <div className="flex gap-2">
              <Input
                placeholder="New task name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
              <select
                className="min-w-[120px] rounded-md border bg-background px-2 py-1 text-sm"
                value={taskProjectId}
                onChange={(e) => setTaskProjectId(e.target.value)}
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <Button onClick={createTask}>Add</Button>
            </div>
            <div className="space-y-1 rounded-lg border bg-card p-3 max-h-72 overflow-y-auto">
              {tasks.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No tasks yet. Create tasks and attach them to projects to
                  track focused work.
                </p>
              )}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-accent/60"
                >
                  <button
                    type="button"
                    className="flex flex-1 items-center gap-2 text-left"
                    onClick={() =>
                      setSelection({
                        projectId: task.projectId ?? selection.projectId,
                        taskId: task.id,
                      })
                    }
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskCompleted(task)}
                    />
                    <span
                      className={
                        task.completed ? "line-through text-muted-foreground" : ""
                      }
                    >
                      {task.name}
                    </span>
                  </button>
                  {task.projectId && (
                    <span className="text-xs text-muted-foreground">
                      {
                        projects.find((p) => p.id === task.projectId)
                          ?.name
                      }
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Active selection</span>
            <span className="font-medium">
              {currentProject ? currentProject.name : "No project"},{" "}
              {currentTask ? currentTask.name : "No task"}
            </span>
          </div>
        </section>
      </main>
      <Footer />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

