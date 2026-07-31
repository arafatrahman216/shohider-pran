import { NextResponse } from "next/server";
import { scrapeDghs } from "@/lib/scraper/dghs";
import { scrapeJssfbd } from "@/lib/scraper/jssfbd";
import { reverifyAllPending } from "@/lib/matching";

// Section 5 point 6: "Re-run on a schedule, powering auto-re-verification."
// Wired for Vercel Cron (see vercel.json) — Vercel calls this with
// `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set on the
// project; that header is how we know the request is really the scheduler
// and not a public caller (this route sits outside the admin-cookie gate
// in proxy.ts on purpose, since the scheduler has no browser session).
// If CRON_SECRET isn't set, this route refuses every request rather than
// running unauthenticated.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dghs = await scrapeDghs();

  let jssfbd: { extracted: number; upserted: number } | { error: string };
  try {
    jssfbd = await scrapeJssfbd();
  } catch (err) {
    // Playwright-dependent and unverified in some environments (see
    // src/lib/scraper/jssfbd.ts) — never let its failure block the DGHS
    // scrape or re-verification pass that already succeeded above.
    jssfbd = { error: err instanceof Error ? err.message : "jssfbd scrape failed" };
  }

  const reverify = await reverifyAllPending();

  return NextResponse.json({ dghs, jssfbd, reverify });
}
