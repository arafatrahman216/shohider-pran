import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { draftPetitionLetter } from "@/lib/petition-agent";

type CreatePetitionBody = {
  proposedById?: string;
  title?: string;
  ask?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CreatePetitionBody;

  if (!body.proposedById || !body.title?.trim() || !body.ask?.trim()) {
    return NextResponse.json(
      { error: "proposedById, title, and ask are required" },
      { status: 400 }
    );
  }

  const proposer = await prisma.registrant.findUnique({ where: { id: body.proposedById } });
  if (!proposer) {
    return NextResponse.json({ error: "Registrant not found" }, { status: 404 });
  }

  const petition = await prisma.petition.create({
    data: {
      proposedById: body.proposedById,
      title: body.title.trim(),
      ask: body.ask.trim(),
    },
  });

  try {
    await draftPetitionLetter(petition.id);
  } catch {
    // best-effort
  }

  const withDraft = await prisma.petition.findUniqueOrThrow({ where: { id: petition.id } });
  return NextResponse.json({ petition: withDraft }, { status: 201 });
}

export async function GET() {
  const petitions = await prisma.petition.findMany({
    where: { status: "APPROVED" },
    include: { _count: { select: { signatures: true } } },
    orderBy: { approvedAt: "desc" },
  });
  return NextResponse.json({ petitions });
}
