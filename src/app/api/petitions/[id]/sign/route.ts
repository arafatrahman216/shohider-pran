import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as { registrantId?: string };

  if (!body.registrantId) {
    return NextResponse.json({ error: "registrantId is required" }, { status: 400 });
  }

  const [petition, registrant] = await Promise.all([
    prisma.petition.findUnique({ where: { id } }),
    prisma.registrant.findUnique({ where: { id: body.registrantId } }),
  ]);

  if (!petition || petition.status !== "APPROVED") {
    return NextResponse.json({ error: "This petition isn't open for signatures" }, { status: 400 });
  }
  if (!registrant) {
    return NextResponse.json({ error: "We couldn't find that registration ID" }, { status: 404 });
  }

  try {
    await prisma.petitionSignature.create({
      data: { petitionId: id, registrantId: body.registrantId },
    });
  } catch {
    return NextResponse.json({ error: "This registration has already signed" }, { status: 409 });
  }

  const count = await prisma.petitionSignature.count({ where: { petitionId: id } });
  return NextResponse.json({ ok: true, signatureCount: count });
}
