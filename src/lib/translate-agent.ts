import { prisma } from "@/lib/db";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini";

// Section 6: "Multilingual sync agent — drafts bn<->en translations on
// content change, always flagged needs_review, never auto-published."
// Applied here to Amar Golpo stories: the submitted language is the
// family's own words and is trusted immediately; this agent only drafts
// the OTHER language, and that draft is never shown publicly until a human
// reviewer explicitly approves it (bnReviewed / enReviewed).

async function translate(text: string, targetLocale: "bn" | "en"): Promise<string> {
  const targetName = targetLocale === "bn" ? "Bangla" : "English";
  const prompt = `Translate the following memorial story into natural, respectful ${targetName}. Preserve the meaning and tone faithfully — do not add, remove, or embellish any detail, and do not add any commentary. Return ONLY the translated text, nothing else.

---
${text}
---`;

  const ai = getGeminiClient();
  const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: prompt });
  return response.text?.trim() || "";
}

export async function syncStoryTranslation(storyId: string): Promise<void> {
  if (!isGeminiConfigured()) return;

  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) return;

  if (story.originalLocale === "BN" && story.bodyBn && !story.bodyEn) {
    const translated = await translate(story.bodyBn, "en");
    if (translated) {
      await prisma.story.update({
        where: { id: storyId },
        data: { bodyEn: translated, enReviewed: false },
      });
    }
  } else if (story.originalLocale === "EN" && story.bodyEn && !story.bodyBn) {
    const translated = await translate(story.bodyEn, "bn");
    if (translated) {
      await prisma.story.update({
        where: { id: storyId },
        data: { bodyBn: translated, bnReviewed: false },
      });
    }
  }
}

export async function approveStoryTranslation(storyId: string, locale: "bn" | "en"): Promise<void> {
  await prisma.story.update({
    where: { id: storyId },
    data: locale === "bn" ? { bnReviewed: true } : { enReviewed: true },
  });
}
