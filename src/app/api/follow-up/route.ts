import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const drafts = await prisma.escalationDraft.findMany({
    where: { status: "DRAFT" },
    include: { registrant: true },
    orderBy: { createdAt: "asc" },
  });

  const now = Date.now();
  const withDaysOpen = drafts.map((d) => ({
    ...d,
    daysOpen: Math.floor((now - d.registrant.createdAt.getTime()) / (24 * 60 * 60 * 1000)),
  }));

  return NextResponse.json({ drafts: withDaysOpen });
}
