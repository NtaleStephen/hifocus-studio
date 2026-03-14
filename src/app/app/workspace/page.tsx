"use client";

import { useEffect, useState, useCallback } from "react";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import SettingsPanel from "@/components/SettingsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace, type WorkspaceInfo } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Plus,
  Users,
  Crown,
  Shield,
  User,
  Trash2,
  UserPlus,
  ChevronRight,
  ArrowLeft,
  Settings2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkspaceMember {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
  user: { id: string; email: string };
}

interface WorkspaceDetail extends WorkspaceInfo {
  members: WorkspaceMember[];
}

const ROLE_ICONS = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
};

const ROLE_LABELS = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

const ROLE_COLORS = {
  OWNER: "text-amber-400",
  ADMIN: "text-indigo-400",
  MEMBER: "text-muted-foreground",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: "OWNER" | "ADMIN" | "MEMBER" }) {
  const Icon = ROLE_ICONS[role];
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${ROLE_COLORS[role]}`}>
      <Icon className="h-3 w-3" />
      {ROLE_LABELS[role]}
    </span>
  );
}

// ─── Workspace Detail Panel ───────────────────────────────────────────────────

function WorkspaceDetailPanel({
  workspaceId,
  onBack,
}: {
  workspaceId: string;
  onBack: () => void;
}) {
  const { session } = useAuth();
  const { refresh } = useWorkspace();
  const [detail, setDetail] = useState<WorkspaceDetail | null>(null);
  const [userRole, setUserRole] = useState<"OWNER" | "ADMIN" | "MEMBER">("MEMBER");
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [inviting, setInviting] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { workspace: WorkspaceDetail; userRole: "OWNER" | "ADMIN" | "MEMBER" };
        setDetail(data.workspace);
        setUserRole(data.userRole);
      }
    } finally {
      setLoading(false);
    }
  }, [session, workspaceId]);

  useEffect(() => { void load(); }, [load]);

  const handleInvite = async () => {
    if (!session || !inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${inviteEmail} added to workspace.`);
        setInviteEmail("");
        void load();
        void refresh();
      } else {
        toast.error(data.error ?? "Failed to invite member.");
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, email: string) => {
    if (!session) return;
    if (!confirm(`Remove ${email} from this workspace?`)) return;
    const res = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      toast.success(`${email} removed.`);
      void load();
      void refresh();
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to remove member.");
    }
  };

  const handleChangeRole = async (memberId: string, newRole: "ADMIN" | "MEMBER") => {
    if (!session) return;
    const res = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      toast.success("Role updated.");
      void load();
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to update role.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!detail) return null;

  const canManage = userRole === "OWNER" || userRole === "ADMIN";

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{detail.name}</h2>
            <p className="text-xs text-muted-foreground font-mono">{detail.slug}</p>
          </div>
        </div>
        <div className="ml-auto">
          <RoleBadge role={userRole} />
        </div>
      </div>

      {/* Members list */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" />
          Members ({detail.members.length})
        </h3>
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur divide-y divide-border">
          {detail.members.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground">
                  {m.user.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{m.user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(m.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {userRole === "OWNER" && m.role !== "OWNER" ? (
                  <select
                    value={m.role}
                    onChange={(e) => handleChangeRole(m.id, e.target.value as "ADMIN" | "MEMBER")}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                  </select>
                ) : (
                  <RoleBadge role={m.role} />
                )}
                {canManage && m.role !== "OWNER" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveMember(m.id, m.user.email)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Invite */}
      {canManage && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </h3>
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              The invited user must already have a Hifocus account.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                className="flex-1"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "MEMBER")}
                className="rounded-md border border-border bg-background px-2 py-1 text-sm"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                {inviting ? "Adding…" : "Add"}
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  const { session } = useAuth();
  const { workspaces, activeWorkspace, setActiveWorkspace, loading, refresh } = useWorkspace();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleCreate = async () => {
    if (!session || !newName.trim()) return;
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Workspace "${newName.trim()}" created!`);
        setNewName("");
        setCreating(false);
        await refresh();
        setActiveWorkspace(data.workspace);
        setSelectedId(data.workspace.id);
      } else {
        toast.error(data.error ?? "Failed to create workspace.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (selectedId) {
    return (
      <div className="relative flex min-h-screen flex-col bg-background">
        <NavBar
          onSettingsClick={() => setSettingsOpen(true)}
          onFullscreen={() => {}}
        />
        <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col gap-8 px-4 py-20">
          <WorkspaceDetailPanel
            workspaceId={selectedId}
            onBack={() => setSelectedId(null)}
          />
        </main>
        <Footer />
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <NavBar
        onSettingsClick={() => setSettingsOpen(true)}
        onFullscreen={() => {}}
      />
      <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col gap-8 px-4 py-20">
        {/* Header */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
              <p className="text-muted-foreground">
                Collaborate with your team using shared workspaces.
              </p>
            </div>
            <Button
              onClick={() => setCreating(true)}
              className="gap-2 rounded-xl"
            >
              <Plus className="h-4 w-4" />
              New Workspace
            </Button>
          </div>
        </section>

        {/* Create form */}
        {creating && (
          <section className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-3 animate-fade-in">
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <Settings2 className="h-4 w-4 text-primary" />
              Create a new workspace
            </h2>
            <p className="text-xs text-muted-foreground">
              Requires a Studio plan. Workspaces let you share projects, sessions,
              and analytics across your whole team.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Acme Design Team"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <Button onClick={handleCreate} disabled={submitLoading || !newName.trim()}>
                {submitLoading ? "Creating…" : "Create"}
              </Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </div>
          </section>
        )}

        {/* Workspace list */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : workspaces.length === 0 ? (
          <section className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">No workspaces yet</p>
              <p className="text-sm text-muted-foreground">
                Create a workspace to start collaborating with your team.
              </p>
            </div>
            <Button onClick={() => setCreating(true)} className="gap-2 mt-2">
              <Plus className="h-4 w-4" />
              Create Workspace
            </Button>
          </section>
        ) : (
          <section className="space-y-3">
            <div className="rounded-xl border border-border bg-card/50 backdrop-blur divide-y divide-border">
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="flex items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{ws.name}</p>
                      {activeWorkspace?.id === ws.id && (
                        <span className="flex items-center gap-1 text-xs text-primary font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ws.memberCount} member{ws.memberCount !== 1 ? "s" : ""} · <RoleBadge role={ws.role} />
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {activeWorkspace?.id !== ws.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveWorkspace(ws);
                          toast.success(`Switched to "${ws.name}"`);
                        }}
                      >
                        Switch
                      </Button>
                    )}
                    {activeWorkspace?.id === ws.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg text-xs text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveWorkspace(null);
                          toast.info("Switched to personal workspace");
                        }}
                      >
                        Deactivate
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => setSelectedId(ws.id)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {activeWorkspace && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                New projects and sessions will be associated with{" "}
                <span className="font-medium text-foreground">{activeWorkspace.name}</span>.
              </p>
            )}
          </section>
        )}
      </main>
      <Footer />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
