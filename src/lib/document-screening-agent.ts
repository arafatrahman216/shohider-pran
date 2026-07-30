import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini";

// Section 6: "Document pre-screening agent — cross-checks uploaded ID/records
// against claimed identity before human review." This never approves,
// rejects, or verifies anything — it only leaves a short advisory note on
// the Document row for a human reviewer to read. verificationStatus is
// untouched by this module; only src/lib/matching.ts and explicit human
// review may change it.

const MIME_TYPE_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

function mimeTypeFor(fileName: string): string | null {
  const ext = path.extname(fileName).toLowerCase();
  return MIME_TYPE_BY_EXT[ext] ?? null;
}

export async function screenDocument(documentId: string): Promise<void> {
  if (!isGeminiConfigured()) return;

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { registrant: true },
  });
  if (!document) return;

  const mimeType = mimeTypeFor(document.fileName);
  if (!mimeType) {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        screeningStatus: "SCREENING_FAILED",
        screeningNote: "Automated screening only supports JPEG/PNG/WEBP images and PDF files.",
        screenedAt: new Date(),
      },
    });
    return;
  }

  try {
    const absolutePath = path.join(process.cwd(), "public", document.fileUrl.replace(/^\//, ""));
    const bytes = await readFile(absolutePath);
    const base64 = bytes.toString("base64");

    const { registrant } = document;
    const categoryLabel = registrant.category === "SHOHID" ? "martyr" : "injured person";
    const nidLine = registrant.nidOrBirthReg
      ? ` with NID/birth registration number "${registrant.nidOrBirthReg}"`
      : "";
    const prompt = `A family member registered a claimed ${categoryLabel} named "${registrant.fullName}" from ${registrant.district} district${nidLine}. They uploaded the attached document as supporting evidence.

Write a SHORT (2-3 sentence) advisory note for a human reviewer: what type of document this looks like, what name / ID number / other identifying details (if any) are visible on it, and whether those visible details look CONSISTENT, INCONSISTENT, or UNCLEAR compared to the claim above. You are NOT deciding whether to approve, verify, or reject this registration — only describing what you observe so a human can judge. Do not use the words "verified", "approved", or "rejected".`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, { inlineData: { data: base64, mimeType } }],
        },
      ],
    });

    await prisma.document.update({
      where: { id: documentId },
      data: {
        screeningStatus: "SCREENED",
        screeningNote: response.text?.trim() || "The assistant did not return a note.",
        screenedAt: new Date(),
      },
    });
  } catch {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        screeningStatus: "SCREENING_FAILED",
        screeningNote: "Automated screening failed to run. A human reviewer should check this document directly.",
        screenedAt: new Date(),
      },
    });
  }
}
