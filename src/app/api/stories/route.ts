import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncStoryTranslation } from "@/lib/translate-agent";
import { isLocale } from "@/lib/dictionaries";

type CreateStoryBody = {
  registrantId?: string;
  locale?: string;
  authorName?: string;
  body?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CreateStoryBody;

  if (!body.registrantId || !body.body?.trim() || !isLocale(body.locale ?? "")) {
    return NextResponse.json(
      { error: "registrantId, locale (bn|en), and body are required" },
      { status: 400 }
    );
  }

  const registrant = await prisma.registrant.findUnique({ where: { id: body.registrantId } });
  if (!registrant) {
    return NextResponse.json({ error: "Registrant not found" }, { status: 404 });
  }
  if (registrant.verificationStatus === "MATCH_PENDING_CONFIRMATION" || registrant.verificationStatus === "REJECTED") {
    return NextResponse.json(
      { error: "This registration isn't eligible for a story yet" },
      { status: 400 }
    );
  }

  const locale = body.locale as "bn" | "en";
  const story = await prisma.story.create({
    data: {
      registrantId: body.registrantId,
      authorName: body.authorName?.trim() || null,
      originalLocale: locale === "bn" ? "BN" : "EN",
      bodyBn: locale === "bn" ? body.body.trim() : null,
      bodyEn: locale === "en" ? body.body.trim() : null,
      // Every submitted story waits for a human validity decision.
      bnReviewed: false,
      enReviewed: false,
    },
  });

  try {
    await syncStoryTranslation(story.id);
  } catch {
    // best-effort — the story still exists in its original language
  }

  const withTranslation = await prisma.story.findUniqueOrThrow({ where: { id: story.id } });
  return NextResponse.json({ story: withTranslation }, { status: 201 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale") ?? "bn";
  const locale = isLocale(localeParam) ? localeParam : "bn";

  const stories = await prisma.story.findMany({
    where: {
      validationStatus: { in: ["VALIDATED", "UNVALIDATED"] },
      ...(locale === "bn"
        ? { bodyBn: { not: null }, bnReviewed: true }
        : { bodyEn: { not: null }, enReviewed: true }),
    },
    include: { registrant: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ stories });
}
