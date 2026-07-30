import "server-only";
import { prisma } from "@/lib/db";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini";

// Section 1 extra feature (3d): collective letter/petition generator. The AI
// only ever drafts letter text from what the proposer stated — it never
// approves, publishes, or lets a petition be signed. An admin must
// explicitly approve before src/app/api/petitions/[id]/sign accepts any
// signature (enforced in the route, not here).

export async function draftPetitionLetter(petitionId: string): Promise<void> {
  const petition = await prisma.petition.findUnique({ where: { id: petitionId } });
  if (!petition) return;

  if (!isGeminiConfigured()) return;

  const prompt = `Write a formal, respectful open letter/petition (under 250 words) addressed to the relevant Bangladesh government office, based only on the cause described below. Do not invent statistics, named individuals, or claims of support beyond what is stated. Do not claim a specific number of signatories — this letter is a template that people will separately co-sign.

Title: ${petition.title}
The cause / ask: ${petition.ask}

Write in a plain, professional register suitable for an official letter.`;

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: prompt });
    const draftText = response.text?.trim();
    if (draftText) {
      await prisma.petition.update({ where: { id: petitionId }, data: { draftText } });
    }
  } catch {
    // best-effort — the petition still exists as a DRAFT with no letter text
    // yet; an admin can see it has no draft and the next attempt can retry.
  }
}

export async function approvePetition(petitionId: string): Promise<void> {
  await prisma.petition.update({
    where: { id: petitionId },
    data: { status: "APPROVED", approvedAt: new Date() },
  });
}
