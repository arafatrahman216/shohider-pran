import { prisma } from "@/lib/db";
import { isAllowedByRobots } from "./robots";
import { sleep } from "./rate-limit";

const MAX_RETRIES = 4;

// Section 5 scraper for medical-info.dghs.gov.bd — DGHS's public medical
// case registry, the source jssfbd.com itself cites. Verified live during
// development: robots.txt allows `/` entirely, and the site's own public
// dashboard exposes a plain JSON API (no headless browser needed) backing
// its "নিহত" (deceased) and "আহত" (injured) tabs — confirmed from the
// page's own DataTables config and the visible Bangla instructions
// describing exactly the NID/birth-reg verification flow Section 2
// describes. Clean structured data straight from an official system, so
// needsReview is false here (per Section 5 point 2), unlike narrative
// sources that need the Gemini extraction fallback.

const BASE = "https://medical-info.dghs.gov.bd";
const DATATABLE_URL = `${BASE}/public/medical-cases/datatable/json`;
const SOURCE_NAME = "medical-info.dghs.gov.bd";
const PAGE_SIZE = 150;
const REQUEST_DELAY_MS = 500;

type DghsRow = {
  id: number;
  patient_name_en: string | null;
  father_name: string | null;
  present_district_name: string | null;
  permanent_district_name: string | null;
};

type DghsResponse = {
  recordsTotal: number;
  data: DghsRow[];
};

async function fetchPage(showTotalDeath: 0 | 1, start: number): Promise<DghsResponse> {
  const url = new URL(DATATABLE_URL);
  url.searchParams.set("show_total_death", String(showTotalDeath));
  url.searchParams.set("ministry_verified", "1");
  url.searchParams.set("is_locked", "1");
  url.searchParams.set("draw", "1");
  url.searchParams.set("start", String(start));
  url.searchParams.set("length", String(PAGE_SIZE));

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
      if (!res.ok) {
        throw new Error(`DGHS request failed: ${res.status} ${res.statusText}`);
      }
      return (await res.json()) as DghsResponse;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await sleep(500 * 2 ** attempt);
      }
    }
  }
  throw lastError;
}

export type DghsScrapeResult = { scanned: number; upserted: number; skippedNoName: number };

async function scrapeCategory(
  showTotalDeath: 0 | 1,
  category: "SHOHID" | "AHOTO"
): Promise<DghsScrapeResult> {
  const sourceUrl = `${BASE}/public?tab=${category === "SHOHID" ? "death-summary" : "injury-summary"}`;
  let start = 0;
  let scanned = 0;
  let upserted = 0;
  let skippedNoName = 0;
  let total = Number.POSITIVE_INFINITY;

  while (start < total) {
    const page = await fetchPage(showTotalDeath, start);
    total = page.recordsTotal;

    for (const row of page.data) {
      const name = row.patient_name_en?.trim();
      if (!name) {
        skippedNoName += 1;
        continue;
      }

      const district = row.present_district_name?.trim() || row.permanent_district_name?.trim() || null;
      const fatherName = row.father_name?.trim() || null;

      await prisma.gazetteRecord.upsert({
        where: {
          sourceName_sourceId: { sourceName: SOURCE_NAME, sourceId: String(row.id) },
        },
        create: {
          name,
          category,
          district,
          fatherName,
          sourceName: SOURCE_NAME,
          sourceUrl,
          sourceId: String(row.id),
          needsReview: false,
        },
        update: {
          name,
          district,
          fatherName,
          scrapedAt: new Date(),
        },
      });
      upserted += 1;
    }

    scanned += page.data.length;
    start += PAGE_SIZE;
    if (start < total) await sleep(REQUEST_DELAY_MS);
  }

  return { scanned, upserted, skippedNoName };
}

export async function scrapeDghs(): Promise<{ deaths: DghsScrapeResult; injuries: DghsScrapeResult }> {
  const allowed = await isAllowedByRobots(DATATABLE_URL);
  if (!allowed) {
    throw new Error("robots.txt disallows scraping this path");
  }

  const deaths = await scrapeCategory(1, "SHOHID");
  await sleep(REQUEST_DELAY_MS);
  const injuries = await scrapeCategory(0, "AHOTO");

  return { deaths, injuries };
}
