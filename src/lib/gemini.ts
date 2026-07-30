import "server-only";
import { GoogleGenAI } from "@google/genai";

// Foundation for Section 6's AI/agentic features (conversational intake,
// proactive follow-up, document pre-screening, pattern-detection digest,
// multilingual sync). Every one of those agents drafts/screens/summarizes
// only — none of them may ever write verificationStatus. That stays the
// sole responsibility of src/lib/matching.ts and human reviewer actions.

export const GEMINI_MODEL = "gemini-2.5-flash";

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!isGeminiConfigured()) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local to enable AI features (see .env.local.example)."
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

// Thin helper for simple text-in/text-out prompts. Agent-specific modules
// (intake, follow-up, pre-screening, digest, translation) build on this
// rather than calling the SDK directly.
export async function generateText(prompt: string): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });
  return response.text ?? "";
}
