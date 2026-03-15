import { z } from "zod";

// ─── Shared Validation Schemas ──────────────────────────────────────────────

/** Sanitize a string for use in CSV exports — prevents formula injection. */
export function sanitizeForCsv(value: string): string {
  const dangerChars = ["=", "+", "-", "@", "\t", "\r", "\n"];
  if (dangerChars.some((ch) => value.startsWith(ch))) {
    return `'${value}`;
  }
  return value;
}

// ─── Tasks ──────────────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(500, "Name too long")
    .transform((v) => v.trim()),
  projectId: z.string().uuid().optional().nullable(),
  workspaceId: z.string().uuid().optional().nullable(),
});

export const patchTaskSchema = z.object({
  id: z.string().uuid("Task ID must be a valid UUID"),
  completed: z.boolean().optional(),
});

export const deleteTaskSchema = z.object({
  id: z.string().uuid("Task ID must be a valid UUID"),
});

// ─── Projects ───────────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name too long")
    .transform((v) => v.trim()),
  color: z.string().max(50).optional().nullable(),
  workspaceId: z.string().uuid().optional().nullable(),
});

export const deleteProjectSchema = z.object({
  id: z.string().uuid("Project ID must be a valid UUID"),
});

// ─── Sessions ───────────────────────────────────────────────────────────────

export const createSessionSchema = z.object({
  durationMinutes: z
    .number()
    .int()
    .positive("Duration must be positive")
    .max(1440, "Duration cannot exceed 24 hours"),
  type: z.enum(["pomodoro", "countdown"]).default("pomodoro"),
  projectId: z.string().uuid().optional().nullable(),
  taskId: z.string().uuid().optional().nullable(),
  workspaceId: z.string().uuid().optional().nullable(),
});

// ─── Settings ───────────────────────────────────────────────────────────────

const validThemes = [
  "midnight",
  "espresso",
  "denim",
  "coral",
  "vintage",
  "emerald",
  "industrial",
] as const;

const validSounds = [
  "chime",
  "bell",
  "digital",
  "nature",
  "subtle",
  "none",
] as const;

export const updateSettingsSchema = z.object({
  is24Hour: z.boolean().optional(),
  showSeconds: z.boolean().optional(),
  showDate: z.boolean().optional(),
  theme: z.enum(validThemes).optional(),
  alertSound: z.string().max(50).optional(),
  hourlyChime: z.boolean().optional(),
});

// ─── Workspaces ─────────────────────────────────────────────────────────────

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Workspace name is required")
    .max(100, "Workspace name too long")
    .transform((v) => v.trim()),
});

export const patchWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .transform((v) => v.trim())
    .optional(),
  logoUrl: z.string().url().max(2000).optional().nullable(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email").transform((v) => v.trim().toLowerCase()),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export const changeRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"], {
    errorMap: () => ({ message: "Invalid role. Must be ADMIN or MEMBER." }),
  }),
});

// ─── Billing ────────────────────────────────────────────────────────────────

export const checkoutSchema = z.object({
  priceId: z.string().min(1, "Price ID is required"),
});
