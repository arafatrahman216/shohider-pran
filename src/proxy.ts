import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/dictionaries";

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language")?.toLowerCase() ?? "";
  for (const locale of locales) {
    if (acceptLanguage.includes(locale)) return locale;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (pathnameHasLocale) return;

  const locale = getLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
