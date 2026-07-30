import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const petitions = await prisma.petition.findMany({
    where: { status: "DRAFT" },
    include: { proposedBy: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ petitions });
}
