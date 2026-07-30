// Shared client-side shapes for the JSON the registrant API routes return.
// Kept separate from the Prisma models so client components never import
// server-only generated client code.

export type GazetteRecordDTO = {
  id: string;
  name: string;
  district: string | null;
  sourceName: string;
};

export type CandidateDTO = {
  id: string;
  confidence: number;
  gazetteRecord: GazetteRecordDTO;
};

export type RegistrantDTO = {
  id: string;
  verificationStatus: "VERIFIED" | "MATCH_PENDING_CONFIRMATION" | "UNVERIFIED_SELF_REPORTED" | "REJECTED";
  matchedRecord: GazetteRecordDTO | null;
  candidates: CandidateDTO[];
};
