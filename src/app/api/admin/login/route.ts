import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminAuthConfigured, adminCookieOptions, createAdminToken, validAdminCredentials } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json() as { username?: string; password?: string };
  if (!adminAuthConfigured()) {
    return NextResponse.json({ error: "Admin login is not configured in .env.local." }, { status: 503 });
  }
  if (!validAdminCredentials(body.username?.trim() ?? "", body.password ?? "")) {
    return NextResponse.json({ error: "Invalid admin name or password." }, { status: 401 });
  }
  (await cookies()).set(ADMIN_COOKIE, createAdminToken(body.username!.trim()), adminCookieOptions);
  return NextResponse.json({ ok: true });
}
