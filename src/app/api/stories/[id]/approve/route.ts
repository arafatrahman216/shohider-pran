import { NextResponse } from "next/server";
import { approveStoryTranslation } from "@/lib/translate-agent";
import { isLocale } from "@/lib/dictionaries";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as { locale?: string };

  if (!isLocale(body.locale ?? "")) {
    return NextResponse.json({ error: "locale (bn|en) is required" }, { status: 400 });
  }

  await approveStoryTranslation(id, body.locale as "bn" | "en");
  return NextResponse.json({ ok: true });
}
