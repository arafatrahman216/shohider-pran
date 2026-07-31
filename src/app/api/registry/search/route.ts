import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const MAX_RESULTS = 30;

// Public registry search (the homepage's "Search the registry" CTA).
// Deliberately VERIFIED-only: those records are already part of the
// official gazette being made accessible, not a private Track B
// submission. Self-reported/pending registrations are never surfaced here
// — Section 8's guardrail against blending verified and pending publicly
// applies just as much to a search result list as it does to the dashboard
// counters.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const district = url.searchParams.get("district")?.trim() ?? "";

  if (!q && !district) {
    return NextResponse.json({ registrants: [] });
  }

  // SQLite's LIKE (what `contains` compiles to) is already
  // case-insensitive for ASCII. Add `mode: "insensitive"` here when this
  // moves to Postgres per Section 7 — SQLite throws on that option, so it
  // can't be added defensively ahead of time.
  const registrants = await prisma.registrant.findMany({
    where: {
      verificationStatus: "VERIFIED",
      ...(q ? { fullName: { contains: q } } : {}),
      ...(district ? { district } : {}),
    },
    select: {
      id: true,
      fullName: true,
      district: true,
      category: true,
    },
    orderBy: { fullName: "asc" },
    take: MAX_RESULTS,
  });

  return NextResponse.json({ registrants });
}
