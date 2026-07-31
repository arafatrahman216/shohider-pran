import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminAuthGuard } from "@/lib/admin-auth";

// Section 2's "optional document upload for later manual review" — every
// Track B registrant still awaiting a decision, documents and the AI
// pre-screening agent's advisory note included so a reviewer has what they
// need on one screen.
export async function GET() {
  const unauthorized = await adminAuthGuard();
  if (unauthorized) return unauthorized;

  const registrants = await prisma.registrant.findMany({
    where: { verificationStatus: "UNVERIFIED_SELF_REPORTED" },
    include: { documents: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ registrants });
}
