import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const registrant = await prisma.registrant.findUnique({
    where: { id },
    include: { candidates: { include: { gazetteRecord: true } }, matchedRecord: true },
  });

  if (!registrant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ registrant });
}
