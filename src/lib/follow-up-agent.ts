import "server-only";
import { prisma } from "@/lib/db";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini";

// Section 6: "Proactive follow-up agent — scans open complaints past a
// threshold (e.g. 45 days), drafts escalation; sending externally requires
// one admin click." Scoped here to registrations whose verification has
// stayed open (not yet VERIFIED or REJECTED) past the threshold — there is
// no separate complaint/ticket model in this build yet.
//
// This agent only ever creates a DRAFT. Nothing is sent anywhere
// automatically, and there is no outbound email/SMS integration in this
// app — marking a draft SENT just records that an admin has handled it.

export const FOLLOW_UP_THRESHOLD_DAYS = 45;

async function draftEscalationText(registrant: {
  id: string;
  fullName: string;
  district: string;
  category: "SHOHID" | "AHOTO";
  verificationStatus: string;
  createdAt: Date;
}): Promise<string> {
  const daysOpen = Math.floor((Date.now() - registrant.createdAt.getTime()) / (24 * 60 * 60 * 1000));
  const categoryLabel = registrant.category === "SHOHID" ? "martyr" : "injured person";

  const prompt = `Draft a short, respectful escalation note (under 150 words) from a registry platform to the relevant records office, asking them to re-check a registration that has stayed unresolved for a while.

Registration ID: ${registrant.id}
Category: ${categoryLabel}
District: ${registrant.district}
Current status: ${registrant.verificationStatus === "MATCH_PENDING_CONFIRMATION" ? "a possible match is awaiting the registrant's own confirmation" : "no match has been found yet in the official record"}
Days open: ${daysOpen}

Write it as a plain, professional note. Do not state or imply that this person has been verified, rejected, or is or isn't a legitimate ${categoryLabel} — only ask that the case be reviewed or re-checked. Do not include the person's name (referred to only by Registration ID, to protect privacy in what may be forwarded externally).`;

  const ai = getGeminiClient();
  const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: prompt });
  return response.text?.trim() || `Please re-check registration ${registrant.id} (${daysOpen} days open, no resolution yet).`;
}

export async function scanAndDraftStaleFollowUps(): Promise<{ scanned: number; drafted: number }> {
  const threshold = new Date(Date.now() - FOLLOW_UP_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

  const staleRegistrants = await prisma.registrant.findMany({
    where: {
      verificationStatus: { in: ["UNVERIFIED_SELF_REPORTED", "MATCH_PENDING_CONFIRMATION"] },
      createdAt: { lte: threshold },
      escalationDrafts: { none: {} },
    },
  });

  if (!isGeminiConfigured()) {
    return { scanned: staleRegistrants.length, drafted: 0 };
  }

  let drafted = 0;
  for (const registrant of staleRegistrants) {
    try {
      const draftText = await draftEscalationText(registrant);
      await prisma.escalationDraft.create({
        data: { registrantId: registrant.id, draftText },
      });
      drafted += 1;
    } catch {
      // Best-effort: skip this one, the next scan will retry it since it
      // still has no escalation draft.
    }
  }

  return { scanned: staleRegistrants.length, drafted };
}

export async function markEscalationSent(draftId: string): Promise<void> {
  await prisma.escalationDraft.update({
    where: { id: draftId },
    data: { status: "SENT", sentAt: new Date() },
  });
}
