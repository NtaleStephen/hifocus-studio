import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/auth", "/auth/callback", "/about"];
const PUBLIC_API_ROUTES = ["/api/billing/webhook"];

// Simple in-memory rate limiter (per-instance; for production use Redis or Upstash)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // max requests per window per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

// Periodically clean up expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((value, key) => {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  });
}, 60_000);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Rate Limiting (applied to API routes) ---
  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  // --- Allow public API routes (e.g. webhooks) ---
  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // --- Allow public page routes ---
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // --- Allow static files and Next.js internals ---
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // --- For protected routes, check if user has a Supabase session cookie ---
  // Supabase stores session tokens in cookies that follow the pattern:
  // sb-<project-ref>-auth-token
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("auth-token"));

  if (!hasAuthCookie && pathname.startsWith("/app")) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
