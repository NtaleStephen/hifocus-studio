import prisma from "./prisma";

// ─── Ownership / membership guards ───────────────────────────────────────────
// Small, composable checks used by write endpoints to ensure a caller may only
// reference resources (projects, tasks, workspaces) they actually own or belong
// to — preventing IDOR via forged foreign-key IDs in request bodies.

/** Is `userId` a member of `workspaceId`? */
export async function isWorkspaceMember(
  userId: string,
  workspaceId: string,
): Promise<boolean> {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    select: { id: true },
  });
  return membership !== null;
}

/** Does `userId` own project `projectId`? */
export async function ownsProject(
  userId: string,
  projectId: string,
): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  return project !== null;
}

/** Does `userId` own task `taskId`? */
export async function ownsTask(
  userId: string,
  taskId: string,
): Promise<boolean> {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    select: { id: true },
  });
  return task !== null;
}
