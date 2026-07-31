import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminAuthGuard } from "@/lib/admin-auth";

export async function GET() {
  const unauthorized = await adminAuthGuard();
  if (unauthorized) return unauthorized;

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
