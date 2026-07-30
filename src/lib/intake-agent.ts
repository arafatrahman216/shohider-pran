import "server-only";
import type { Content, FunctionDeclaration } from "@google/genai";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import type { Locale } from "@/lib/dictionaries";

// Section 6: "Conversational intake agent — natural-language registration/
// complaint interview in Bangla or English, function-calling into structured
// fields, always a confirm step before submission." This agent only drafts
// structured fields for the user to confirm — it never calls the matching
// logic itself and never claims a verification outcome. src/lib/matching.ts
// (invoked from the normal /api/registrants route, after the user submits
// the confirmed proposal) remains the only thing that sets verificationStatus.

export type IntakeMessage = { role: "user" | "model"; text: string };

export type ProposedRegistration = {
  category: "SHOHID" | "AHOTO";
  fullName: string;
  district: string;
  nidOrBirthReg?: string;
  fatherOrSpouseName?: string;
};

export type IntakeTurnResult = {
  reply: string | null;
  proposed: ProposedRegistration | null;
};

const proposeRegistrationDeclaration: FunctionDeclaration = {
  name: "proposeRegistration",
  description:
    "Call this ONLY after the user has explicitly confirmed the collected details are correct and complete. Never call it before that confirmation.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        enum: ["SHOHID", "AHOTO"],
        description: "SHOHID if registering a martyr, AHOTO if registering an injured person",
      },
      fullName: { type: "string", description: "Full name of the person being registered" },
      district: {
        type: "string",
        description: "One of Bangladesh's 64 districts, in English spelling (e.g. Dhaka, Cox's Bazar, Rangpur)",
      },
      nidOrBirthReg: { type: "string", description: "National ID or birth registration number, if given" },
      fatherOrSpouseName: { type: "string", description: "Father's or spouse's name, if given" },
    },
    required: ["category", "fullName", "district"],
  },
};

function systemInstruction(locale: Locale): string {
  const languageLine =
    locale === "bn"
      ? "Default to Bangla, but switch to English if the user writes in English."
      : "Default to English, but switch to Bangla if the user writes in Bangla.";

  return `You are an intake assistant for Shohider Pran (শহীদের প্রাণ), a registry for the martyrs and injured of Bangladesh's July 2024 uprising.

${languageLine}

Conduct a short, warm, respectful interview to collect exactly these fields:
1. category — is this a martyr (shohid) or an injured person (ahoto)?
2. fullName — the full name of the person being registered
3. district — which of Bangladesh's 64 districts they are from
4. nidOrBirthReg — their NID or birth registration number (optional, ask once, accept "skip" or "I don't have it")
5. fatherOrSpouseName — their father's or spouse's name (optional, ask once, accept "skip")

Rules:
- Ask about one field at a time. Keep messages short.
- The person you're talking to may be a grieving family member. Be gentle, never bureaucratic.
- Once you have category, fullName, and district (and the user has answered or skipped the two optional fields), summarize everything back in plain language and explicitly ask the user to confirm it is correct.
- Only after the user clearly confirms (e.g. "yes", "that's right", "হ্যাঁ", "ঠিক আছে") should you call the proposeRegistration function with the final fields. Never call it before an explicit confirmation, and never call it silently without also summarizing in your visible reply.
- You have NO ability to check official records and must never claim someone is "verified", "matched", "rejected", or "not eligible". That happens in a separate step after submission, and the result will be shown to the user automatically — just say something like "I'll submit this and you'll see the result on the next screen."
- Do not ask for anything beyond the five fields above. Do not offer legal, medical, or financial advice.`;
}

export async function runIntakeTurn(
  messages: IntakeMessage[],
  locale: Locale
): Promise<IntakeTurnResult> {
  const ai = getGeminiClient();
  const contents: Content[] = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents,
    config: {
      systemInstruction: systemInstruction(locale),
      tools: [{ functionDeclarations: [proposeRegistrationDeclaration] }],
    },
  });

  const call = response.functionCalls?.find((c) => c.name === "proposeRegistration");
  const args = call?.args as Record<string, unknown> | undefined;

  if (
    args &&
    (args.category === "SHOHID" || args.category === "AHOTO") &&
    typeof args.fullName === "string" &&
    typeof args.district === "string"
  ) {
    return {
      reply: response.text ?? null,
      proposed: {
        category: args.category,
        fullName: args.fullName,
        district: args.district,
        nidOrBirthReg: typeof args.nidOrBirthReg === "string" ? args.nidOrBirthReg : undefined,
        fatherOrSpouseName: typeof args.fatherOrSpouseName === "string" ? args.fatherOrSpouseName : undefined,
      },
    };
  }

  return { reply: response.text ?? null, proposed: null };
}
