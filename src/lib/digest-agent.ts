import { prisma } from "@/lib/db";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini";

// Section 6: "Pattern-detection digest agent — weekly plain-language
// summaries of clustered complaints for the dashboard/press." This only ever
// sees aggregate counts (never individual names), and it only summarizes —
// it cannot and does not touch verificationStatus.

export type DigestStats = {
  totalRegistrants: number;
  verified: number;
  pendingConfirmation: number;
  selfReported: number;
  rejected: number;
  newLast7Days: number;
  byDistrict: { district: string; count: number }[];
};

export type Digest = {
  generatedAt: string;
  stats: DigestStats;
  summary: string | null;
};

async function collectStats(): Promise<DigestStats> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, verified, pendingConfirmation, selfReported, rejected, districtGroups, newLast7Days] =
    await Promise.all([
      prisma.registrant.count(),
      prisma.registrant.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.registrant.count({ where: { verificationStatus: "MATCH_PENDING_CONFIRMATION" } }),
      prisma.registrant.count({ where: { verificationStatus: "UNVERIFIED_SELF_REPORTED" } }),
      prisma.registrant.count({ where: { verificationStatus: "REJECTED" } }),
      prisma.registrant.groupBy({
        by: ["district"],
        _count: { district: true },
        orderBy: { _count: { district: "desc" } },
        take: 5,
      }),
      prisma.registrant.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ]);

  return {
    totalRegistrants: total,
    verified,
    pendingConfirmation,
    selfReported,
    rejected,
    newLast7Days,
    byDistrict: districtGroups.map((g) => ({ district: g.district, count: g._count.district })),
  };
}

export async function generateDigest(): Promise<Digest> {
  const stats = await collectStats();
  const generatedAt = new Date().toISOString();

  if (!isGeminiConfigured() || stats.totalRegistrants === 0) {
    return { generatedAt, stats, summary: null };
  }

  const districtLine =
    stats.byDistrict.map((d) => `${d.district} (${d.count})`).join(", ") || "no registrations yet";

  const prompt = `Write a short (3-4 sentence), plain-language weekly summary for a public dashboard / press briefing, based ONLY on these aggregate registry statistics — do not invent any names, stories, or details beyond these numbers:

Total registrations: ${stats.totalRegistrants}
Verified against the official record: ${stats.verified}
Awaiting the registrant's own confirmation of a possible match: ${stats.pendingConfirmation}
Self-reported, not yet found in the official record: ${stats.selfReported}
Rejected after human review: ${stats.rejected}
New registrations in the last 7 days: ${stats.newLast7Days}
Districts with the most registrations: ${districtLine}

Stay neutral and factual — this summarizes registry activity, not a judgment about who is or isn't a legitimate martyr or injured person. Do not speculate beyond the numbers given.`;

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: prompt });
    return { generatedAt, stats, summary: response.text?.trim() || null };
  } catch {
    return { generatedAt, stats, summary: null };
  }
}
