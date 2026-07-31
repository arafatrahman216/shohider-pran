import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/dictionaries";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language")?.toLowerCase() ?? "";
  for (const locale of locales) {
    if (acceptLanguage.includes(locale)) return locale;
  }
  return defaultLocale;
}

// Internal review tools (Section 6/8: AI drafts stories/petitions/escalations,
// a human must approve before anything goes out) — never public.
const ADMIN_PAGE_PATHS = [
  "/admin",
  "/stories/review",
  "/petitions/review",
  "/follow-up",
  "/registrants/review",
];

function hasAdminSession(request: NextRequest): boolean {
  return verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (!hasAdminSession(request)) {
      return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
    }
    return;
  }

  const matchedLocale = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (!matchedLocale) {
    const locale = getLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  const pathWithoutLocale = pathname.slice(`/${matchedLocale}`.length) || "/";
  // /admin/login must stay reachable without a session — it's how you get one.
  const isAdminPage =
    pathWithoutLocale !== "/admin/login" &&
    ADMIN_PAGE_PATHS.some((p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`));

  if (isAdminPage && !hasAdminSession(request)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${matchedLocale}/admin/login`;
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/((?!_next|api|.*\\..*).*)",
    "/api/stories/review",
    "/api/stories/:id/approve",
    "/api/petitions/review",
    "/api/petitions/:id/approve",
    "/api/follow-up",
    "/api/follow-up/scan",
    "/api/follow-up/:id/send",
    "/api/scrape/:path*",
    "/api/admin/registrants/:path*",
    "/api/registrants/:id/admin-verify",
    "/api/registrants/:id/admin-reject",
  ],
};
