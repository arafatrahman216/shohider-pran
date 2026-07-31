import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "sp-admin-session";
const SESSION_SECONDS = 60 * 60 * 8;

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEqual(left: string, right: string) {
  return timingSafeEqual(digest(left), digest(right));
}

function secret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

export function adminAuthConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && secret().length >= 32);
}

export function validAdminCredentials(username: string, password: string) {
  if (!adminAuthConfigured()) return false;
  return safeEqual(username, process.env.ADMIN_USERNAME!) && safeEqual(password, process.env.ADMIN_PASSWORD!);
}

export function createAdminToken(username: string) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${username}.${expires}`;
  const signature = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

function verifyToken(token: string | undefined) {
  if (!token || !adminAuthConfigured()) return false;
  const [username, expiresRaw, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!username || !signature || !Number.isFinite(expires) || expires < Date.now() / 1000) return false;
  const expected = createHmac("sha256", secret()).update(`${username}.${expiresRaw}`).digest("hex");
  return safeEqual(signature, expected) && safeEqual(username, process.env.ADMIN_USERNAME!);
}

export async function isAdmin() {
  return verifyToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

export async function requireAdminPage(locale: string) {
  if (!(await isAdmin())) redirect(`/${locale}/admin/login`);
}

export async function requireAdminApi() {
  return isAdmin();
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_SECONDS,
};
