import { NextResponse } from "next/server";
import { isGeminiConfigured } from "@/lib/gemini";
import { runIntakeTurn, type IntakeMessage } from "@/lib/intake-agent";
import { isLocale } from "@/lib/dictionaries";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

type ChatBody = {
  locale?: string;
  messages?: IntakeMessage[];
};

// Every turn is a real Gemini API call — this endpoint is the most
// cost-sensitive public route in the app, so it gets the tightest limit.
const CHAT_TURN_LIMIT = 30;
const CHAT_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  if (!isGeminiConfigured()) {
    return NextResponse.json(
      { error: "The conversational intake assistant is not configured (GEMINI_API_KEY is unset)." },
      { status: 503 }
    );
  }

  const ip = getClientIp(request);
  if (!checkRateLimit(`intake-chat:${ip}`, CHAT_TURN_LIMIT, CHAT_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many messages sent recently. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  const body = (await request.json()) as ChatBody;
  const requestedLocale = body.locale ?? "";
  const locale = isLocale(requestedLocale) ? requestedLocale : "bn";

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }
  const validMessages = body.messages.every(
    (m) => (m.role === "user" || m.role === "model") && typeof m.text === "string"
  );
  if (!validMessages) {
    return NextResponse.json({ error: "each message needs a role and text" }, { status: 400 });
  }

  try {
    const result = await runIntakeTurn(body.messages, locale);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "The assistant could not respond. Please try again." }, { status: 502 });
  }
}
