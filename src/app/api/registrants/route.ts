import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runMatching } from "@/lib/matching";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

type RegisterBody = {
  fullName?: string;
  district?: string;
  category?: "SHOHID" | "AHOTO";
  nidOrBirthReg?: string;
  fatherOrSpouseName?: string;
  proxyName?: string;
  proxyRelationship?: string;
};

// Generous enough for a family or a volunteer filing several relatives'
// registrations from the same connection, tight enough to blunt scripted
// spam of this public, unauthenticated endpoint.
const SUBMIT_LIMIT = 20;
const SUBMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`register:${ip}`, SUBMIT_LIMIT, SUBMIT_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many registrations from this connection. Please try again later." },
      { status: 429 }
    );
  }

  const body = (await request.json()) as RegisterBody;

  if (!body.fullName?.trim() || !body.district?.trim() || !body.category) {
    return NextResponse.json(
      { error: "fullName, district, and category are required" },
      { status: 400 }
    );
  }
  if (body.category !== "SHOHID" && body.category !== "AHOTO") {
    return NextResponse.json({ error: "category must be SHOHID or AHOTO" }, { status: 400 });
  }

  const proxyName = body.proxyName?.trim() || null;
  const proxyRelationship = body.proxyRelationship?.trim() || null;

  const registrant = await prisma.registrant.create({
    data: {
      fullName: body.fullName.trim(),
      district: body.district.trim(),
      category: body.category,
      nidOrBirthReg: body.nidOrBirthReg?.trim() || null,
      fatherOrSpouseName: body.fatherOrSpouseName?.trim() || null,
      filedByProxy: Boolean(proxyName),
      proxyName,
      proxyRelationship,
    },
  });

  const outcome = await runMatching(registrant.id);

  const updated = await prisma.registrant.findUniqueOrThrow({
    where: { id: registrant.id },
    include: { candidates: { include: { gazetteRecord: true } }, matchedRecord: true },
  });

  return NextResponse.json({ registrant: updated, outcome }, { status: 201 });
}
