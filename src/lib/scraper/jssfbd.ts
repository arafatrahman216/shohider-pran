import { chromium } from "playwright";
import { prisma } from "@/lib/db";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini";
import { isAllowedByRobots } from "./robots";

// Section 5 scraper for jssfbd.com/36july-martyrs/ — confirmed by direct
// inspection (both a raw `curl` and Anthropic's own WebFetch tool) to be a
// React/WordPress page whose list content only exists after client-side JS
// runs; there is no static table to parse. Per the build plan's own
// fallback design (Section 5 point 3), this renders the page with
// Playwright, takes the fully-rendered visible text, and hands it to
// Gemini for structured extraction — every resulting row is flagged
// needsReview, never treated as confirmed the way the DGHS scraper's clean
// tabular data is.
//
// IMPORTANT — this module could not be run/validated against the live site
// during development: this sandbox's outbound network proxy does not carry
// headless-Chromium traffic (confirmed with example.com and google.com too,
// not specific to this site — every Playwright navigation in this
// environment fails with net::ERR_CONNECTION_RESET). The code below follows
// the architecture correctly and should work in a normal deployment with
// real outbound network access (run `npx playwright install chromium`
// there first), but its behavior against the real rendered DOM has not been
// observed here the way the DGHS scraper's has.

const SOURCE_URL = "https://jssfbd.com/36july-martyrs/";
const SOURCE_NAME = "jssfbd.com";

type ExtractedRow = {
  name: string;
  district: string | null;
  category: "SHOHID" | "AHOTO";
};

const extractionSchema = {
  type: "object",
  properties: {
    people: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          district: { type: ["string", "null"] },
          category: { type: "string", enum: ["SHOHID", "AHOTO"] },
        },
        required: ["name", "category"],
      },
    },
  },
  required: ["people"],
};

async function extractPeopleFromText(pageText: string): Promise<ExtractedRow[]> {
  if (!isGeminiConfigured()) return [];

  const prompt = `The following is the visible text of a memorial page listing martyrs (shohid) and injured people (ahoto) from Bangladesh's July 2024 uprising. Extract every person listed, with their name, district if shown, and whether they are listed as a martyr (SHOHID) or injured (AHOTO). Only extract actual person entries from a list — ignore navigation, menus, donation calls-to-action, and other page furniture. If you cannot confidently tell whether an entry is a martyr or injured person, skip it rather than guessing.

PAGE TEXT:
"""
${pageText.slice(0, 30000)}
"""`;

  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: extractionSchema,
    },
  });

  try {
    const parsed = JSON.parse(response.text ?? "{}") as { people?: ExtractedRow[] };
    return parsed.people ?? [];
  } catch {
    return [];
  }
}

// Stable pseudo-ID for dedup across re-scrapes, since this source has no
// natural record ID the way DGHS's database rows do.
function pseudoSourceId(row: ExtractedRow): string {
  return `${row.category}:${row.name.trim().toLowerCase()}:${(row.district ?? "").trim().toLowerCase()}`;
}

export type JssfbdScrapeResult = { extracted: number; upserted: number };

export async function scrapeJssfbd(): Promise<JssfbdScrapeResult> {
  const allowed = await isAllowedByRobots(SOURCE_URL);
  if (!allowed) {
    throw new Error("robots.txt disallows scraping this path");
  }

  const browser = await chromium.launch();
  let pageText: string;
  try {
    const page = await browser.newPage();
    await page.goto(SOURCE_URL, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(2000);
    pageText = await page.evaluate(() => document.body.innerText);
  } finally {
    await browser.close();
  }

  const rows = await extractPeopleFromText(pageText);
  let upserted = 0;

  for (const row of rows) {
    const name = row.name?.trim();
    if (!name) continue;

    const sourceId = pseudoSourceId(row);
    await prisma.gazetteRecord.upsert({
      where: { sourceName_sourceId: { sourceName: SOURCE_NAME, sourceId } },
      create: {
        name,
        category: row.category,
        district: row.district?.trim() || null,
        sourceName: SOURCE_NAME,
        sourceUrl: SOURCE_URL,
        sourceId,
        needsReview: true,
      },
      update: {
        name,
        district: row.district?.trim() || null,
        scrapedAt: new Date(),
      },
    });
    upserted += 1;
  }

  return { extracted: rows.length, upserted };
}
