import { NextResponse } from "next/server";
import { scrapeDghs } from "@/lib/scraper/dghs";
import { reverifyAllPending } from "@/lib/matching";
import { adminAuthGuard } from "@/lib/admin-auth";

// Admin-triggered re-scrape of medical-info.dghs.gov.bd, followed by
// Section 2's auto-re-verification pass. This can take a while (tens of
// thousands of records) — expect a slow response, this is meant for an
// admin action, not a user-facing route.
export async function POST() {
  const unauthorized = await adminAuthGuard();
  if (unauthorized) return unauthorized;

  try {
    const result = await scrapeDghs();
    const reverify = await reverifyAllPending();
    return NextResponse.json({ ...result, reverify });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scrape failed" },
      { status: 502 }
    );
  }
}
