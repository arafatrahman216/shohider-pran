import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Minimal admin session scheme: no user table, a single shared admin
// password (Section 7's screens for story/petition/follow-up review and
// scraper triggers are internal tools, not multi-user accounts). The
// session cookie is a signed, expiring token — HMAC-SHA256 over
// `expiresAt`, verified with a timing-safe comparison. No new dependency:
// Proxy in this Next.js version defaults to the Node.js runtime, so the
// built-in `crypto` module works there as well as in route handlers.

export const ADMIN_SESSION_COOKIE = "sp_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set. Add it to .env.local (any long random string)."
    );
  }
  return secret;
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function sign(expiresAt: number): string {
  return createHmac("sha256", getSecret()).update(String(expiresAt)).digest("hex");
}

export function createAdminSessionToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [expiresAtRaw, signature] = token.split(".");
  if (!expiresAtRaw || !signature) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = sign(expiresAt);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Second check inside each admin route handler, on top of proxy.ts —
// per Next's own guidance, a proxy matcher change should never be the
// only thing standing between an admin action and the public internet.
export async function requireAdminSession(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

// Call at the top of every admin-only route handler and return its result
// immediately if non-null. proxy.ts already blocks these paths, but each
// handler checks again rather than depending solely on the matcher list
// staying correct.
export async function adminAuthGuard(): Promise<NextResponse | null> {
  if (await requireAdminSession()) return null;
  return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
}
