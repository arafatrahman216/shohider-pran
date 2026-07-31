import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminAuthGuard } from "@/lib/admin-auth";

export async function GET() {
  const unauthorized = await adminAuthGuard();
  if (unauthorized) return unauthorized;

  const petitions = await prisma.petition.findMany({
    where: { status: "DRAFT" },
    include: { proposedBy: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ petitions });
}
