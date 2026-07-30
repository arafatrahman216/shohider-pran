import "server-only";
import { prisma } from "@/lib/db";

// Section 1 extra feature (3b): skill-to-job matching. Plain overlap
// matching on district + skills — not an AI agent, no Gemini involved.

export function parseSkills(csv: string): string[] {
  return csv
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function findMatchesForSeeker(profileId: string) {
  const profile = await prisma.jobSeekerProfile.findUniqueOrThrow({ where: { id: profileId } });
  const seekerSkills = new Set(parseSkills(profile.skillsCsv));

  const postings = await prisma.jobPosting.findMany({
    where: { district: profile.district },
    orderBy: { createdAt: "desc" },
  });

  return postings
    .map((posting) => {
      const postingSkills = parseSkills(posting.skillsCsv);
      const overlap = postingSkills.filter((s) => seekerSkills.has(s));
      return { posting, overlapCount: overlap.length, overlapSkills: overlap };
    })
    .filter((m) => m.overlapCount > 0)
    .sort((a, b) => b.overlapCount - a.overlapCount);
}
