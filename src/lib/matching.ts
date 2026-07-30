import "server-only";
import { prisma } from "@/lib/db";

// Track A/B matching (Section 2 & 4 of the build plan). This is the ONLY
// place verificationStatus is written by code — never by an AI agent, and
// UNVERIFIED_SELF_REPORTED -> REJECTED transitions happen only via explicit
// human reviewer action elsewhere, not here.

export const HIGH_CONFIDENCE_THRESHOLD = 0.85;
export const MEDIUM_CONFIDENCE_THRESHOLD = 0.55;
const MAX_CANDIDATES = 3;

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

// Levenshtein distance -> normalized similarity in [0, 1].
function similarity(a: string, b: string): number {
  const s1 = normalize(a);
  const s2 = normalize(b);
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;

  const rows = s1.length + 1;
  const cols = s2.length + 1;
  const dist = Array.from({ length: rows }, (_, i) => {
    const row = new Array<number>(cols).fill(0);
    row[0] = i;
    return row;
  });
  for (let j = 0; j < cols; j++) dist[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dist[i][j] = Math.min(
        dist[i - 1][j] + 1,
        dist[i][j - 1] + 1,
        dist[i - 1][j - 1] + cost
      );
    }
  }

  const maxLen = Math.max(s1.length, s2.length);
  return 1 - dist[rows - 1][cols - 1] / maxLen;
}

type CandidateInput = {
  fullName: string;
  district: string;
  fatherOrSpouseName: string | null;
  nidOrBirthReg: string | null;
};

type RecordInput = {
  id: string;
  name: string;
  district: string | null;
  fatherName: string | null;
  spouseName: string | null;
  nid: string | null;
};

export function scoreMatch(registrant: CandidateInput, record: RecordInput): number {
  if (
    registrant.nidOrBirthReg &&
    record.nid &&
    normalize(registrant.nidOrBirthReg) === normalize(record.nid)
  ) {
    return 1;
  }

  const nameScore = similarity(registrant.fullName, record.name);
  const districtScore = normalize(registrant.district) === normalize(record.district) ? 1 : 0;
  const guardianName = record.fatherName ?? record.spouseName ?? null;
  const guardianScore =
    registrant.fatherOrSpouseName && guardianName
      ? similarity(registrant.fatherOrSpouseName, guardianName)
      : null;

  if (guardianScore === null) {
    return nameScore * 0.75 + districtScore * 0.25;
  }
  return nameScore * 0.55 + districtScore * 0.2 + guardianScore * 0.25;
}

export type MatchOutcome =
  | { status: "VERIFIED"; recordId: string; score: number }
  | { status: "MATCH_PENDING_CONFIRMATION"; candidateIds: string[] }
  | { status: "UNVERIFIED_SELF_REPORTED" };

export async function runMatching(registrantId: string): Promise<MatchOutcome> {
  const registrant = await prisma.registrant.findUniqueOrThrow({
    where: { id: registrantId },
  });

  const records = await prisma.gazetteRecord.findMany({
    where: { category: registrant.category },
  });

  const scored = records
    .map((record) => ({ record, score: scoreMatch(registrant, record) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  await prisma.matchCandidate.deleteMany({ where: { registrantId } });

  if (best && best.score >= HIGH_CONFIDENCE_THRESHOLD) {
    await prisma.registrant.update({
      where: { id: registrantId },
      data: { verificationStatus: "VERIFIED", matchedRecordId: best.record.id },
    });
    return { status: "VERIFIED", recordId: best.record.id, score: best.score };
  }

  const candidates = scored.filter((s) => s.score >= MEDIUM_CONFIDENCE_THRESHOLD).slice(0, MAX_CANDIDATES);

  if (candidates.length > 0) {
    const created = await prisma.$transaction(
      candidates.map((c) =>
        prisma.matchCandidate.create({
          data: {
            registrantId,
            gazetteRecordId: c.record.id,
            confidence: c.score,
          },
        })
      )
    );
    await prisma.registrant.update({
      where: { id: registrantId },
      data: { verificationStatus: "MATCH_PENDING_CONFIRMATION", matchedRecordId: null },
    });
    return { status: "MATCH_PENDING_CONFIRMATION", candidateIds: created.map((c) => c.id) };
  }

  await prisma.registrant.update({
    where: { id: registrantId },
    data: { verificationStatus: "UNVERIFIED_SELF_REPORTED", matchedRecordId: null },
  });
  return { status: "UNVERIFIED_SELF_REPORTED" };
}

// Confirms a medium-confidence candidate the registrant picked themselves
// (Section 4: "medium confidence shows candidate(s) to confirm"). This is a
// human (the registrant) confirming their own identity, not an AI decision.
export async function confirmCandidate(registrantId: string, gazetteRecordId: string) {
  const candidate = await prisma.matchCandidate.findFirst({
    where: { registrantId, gazetteRecordId },
  });
  if (!candidate) {
    throw new Error("Candidate not found for this registrant");
  }
  await prisma.registrant.update({
    where: { id: registrantId },
    data: { verificationStatus: "VERIFIED", matchedRecordId: gazetteRecordId },
  });
  await prisma.matchCandidate.deleteMany({ where: { registrantId } });
}

// The registrant says none of the surfaced candidates are them — falls back
// to Track B, still registered, still eligible for auto-re-verification.
export async function rejectAllCandidates(registrantId: string) {
  await prisma.matchCandidate.deleteMany({ where: { registrantId } });
  await prisma.registrant.update({
    where: { id: registrantId },
    data: { verificationStatus: "UNVERIFIED_SELF_REPORTED", matchedRecordId: null },
  });
}

// Re-run matching for every registrant not yet verified — Section 2's
// "auto-re-verification whenever the gazette updates."
export async function reverifyAllPending(): Promise<{ upgraded: number; total: number }> {
  const pending = await prisma.registrant.findMany({
    where: {
      verificationStatus: { in: ["UNVERIFIED_SELF_REPORTED", "MATCH_PENDING_CONFIRMATION"] },
    },
    select: { id: true },
  });

  let upgraded = 0;
  for (const r of pending) {
    const outcome = await runMatching(r.id);
    if (outcome.status === "VERIFIED") upgraded += 1;
  }
  return { upgraded, total: pending.length };
}
