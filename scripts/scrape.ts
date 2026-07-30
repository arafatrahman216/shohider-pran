// Section 5 scraper entrypoint. Run with: npm run scrape
// (sets NODE_USE_ENV_PROXY=1 so Node's built-in fetch honors HTTPS_PROXY —
// needed in this sandboxed dev environment; a normal deployment's outbound
// network shouldn't need that flag, but it's harmless either way.)
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { scrapeDghs } from "../src/lib/scraper/dghs";
import { scrapeJssfbd } from "../src/lib/scraper/jssfbd";
import { reverifyAllPending } from "../src/lib/matching";

async function main() {
  console.log("Scraping medical-info.dghs.gov.bd ...");
  const dghs = await scrapeDghs();
  console.log(
    `  deaths (SHOHID):  scanned=${dghs.deaths.scanned} upserted=${dghs.deaths.upserted} skippedNoName=${dghs.deaths.skippedNoName}`
  );
  console.log(
    `  injuries (AHOTO): scanned=${dghs.injuries.scanned} upserted=${dghs.injuries.upserted} skippedNoName=${dghs.injuries.skippedNoName}`
  );

  console.log("Scraping jssfbd.com ...");
  try {
    const jssfbd = await scrapeJssfbd();
    console.log(`  extracted=${jssfbd.extracted} upserted=${jssfbd.upserted} (needsReview=true)`);
  } catch (err) {
    console.log(
      `  skipped: ${err instanceof Error ? err.message : err} (this is expected in the sandboxed dev environment — see src/lib/scraper/jssfbd.ts)`
    );
  }

  console.log("Re-running Track A/B matching for pending registrants ...");
  const reverify = await reverifyAllPending();
  console.log(`  ${reverify.upgraded} of ${reverify.total} pending registrants upgraded to VERIFIED`);

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
