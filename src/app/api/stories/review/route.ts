import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminAuthGuard } from "@/lib/admin-auth";

export async function GET() {
  const unauthorized = await adminAuthGuard();
  if (unauthorized) return unauthorized;

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
