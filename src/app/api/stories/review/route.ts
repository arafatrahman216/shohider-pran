import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const stories = await prisma.story.findMany({
    where: {
      OR: [
        { bodyBn: { not: null }, bnReviewed: false },
        { bodyEn: { not: null }, enReviewed: false },
      ],
    },
    include: { registrant: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ stories });
}
