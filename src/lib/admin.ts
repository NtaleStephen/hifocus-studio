import { getUserAndSync } from "./auth-server";

/** Parse the ADMIN_EMAILS allowlist (comma-separated, case-insensitive). */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/**
 * Authenticate the request and require the caller be a platform admin.
 * Returns the auth result, or null if unauthenticated / not an admin.
 */
export async function requireAdmin(req: Request) {
  const authResult = await getUserAndSync(req);
  if (!authResult) return null;
  if (!isAdminEmail(authResult.user.email)) return null;
  return authResult;
}

/** Estimated monthly recurring revenue for a plan, in USD. */
export const PLAN_PRICE_USD: Record<string, number> = {
  SEEDLING: 0,
  FLOW: 6,
  DEEP_WORK: 14,
  STUDIO: 10, // per user
};
