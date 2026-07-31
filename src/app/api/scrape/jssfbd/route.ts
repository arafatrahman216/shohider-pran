import { NextResponse } from "next/server";
import { scrapeJssfbd } from "@/lib/scraper/jssfbd";
import { reverifyAllPending } from "@/lib/matching";

export async function POST() {
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
