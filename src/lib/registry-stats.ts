import { prisma } from "@/lib/db";

// Homepage registry counters must trace to a single authentic,
// government-preferred source — never a third-party site's own summary
// figure. medical-info.dghs.gov.bd (Directorate General of Health
// Services) is the only source this app has actually scraped and can
// verify a record count for, so the counters read live from our own
// ingested GazetteRecord rows rather than a hardcoded number.
const DGHS_SOURCE_NAME = "medical-info.dghs.gov.bd";

export type DghsRegistryCounts = {
  martyrs: number;
  injured: number;
};

export async function getDghsRegistryCounts(): Promise<DghsRegistryCounts> {
  const [martyrs, injured] = await Promise.all([
    prisma.gazetteRecord.count({
      where: { sourceName: DGHS_SOURCE_NAME, category: "SHOHID" },
    }),
    prisma.gazetteRecord.count({
      where: { sourceName: DGHS_SOURCE_NAME, category: "AHOTO" },
    }),
  ]);
  return { martyrs, injured };
}
