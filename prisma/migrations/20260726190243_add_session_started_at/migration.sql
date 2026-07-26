-- AlterTable
ALTER TABLE "FocusSession" ADD COLUMN     "startedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "FocusSession_userId_completedAt_idx" ON "FocusSession"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "FocusSession_workspaceId_completedAt_idx" ON "FocusSession"("workspaceId", "completedAt");

-- CreateIndex
CREATE INDEX "Project_userId_workspaceId_idx" ON "Project"("userId", "workspaceId");

-- CreateIndex
CREATE INDEX "Task_userId_workspaceId_idx" ON "Task"("userId", "workspaceId");

-- CreateIndex
CREATE INDEX "Task_userId_completed_idx" ON "Task"("userId", "completed");
