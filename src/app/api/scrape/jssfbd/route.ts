import { NextResponse } from "next/server";
import { scrapeJssfbd } from "@/lib/scraper/jssfbd";
import { reverifyAllPending } from "@/lib/matching";
import { adminAuthGuard } from "@/lib/admin-auth";

export async function POST() {
  const unauthorized = await adminAuthGuard();
  if (unauthorized) return unauthorized;

  try {
    const result = await scrapeJssfbd();
    const reverify = await reverifyAllPending();
    return NextResponse.json({ ...result, reverify });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scrape failed" },
      { status: 502 }
    );
  }
}
