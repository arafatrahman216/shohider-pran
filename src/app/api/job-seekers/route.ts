import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type CreateProfileBody = {
  registrantId?: string;
  seekerName?: string;
  district?: string;
  skills?: string;
  contactInfo?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CreateProfileBody;

  if (!body.registrantId || !body.seekerName?.trim() || !body.district?.trim() || !body.skills?.trim() || !body.contactInfo?.trim()) {
    return NextResponse.json(
      { error: "registrantId, seekerName, district, skills, and contactInfo are required" },
      { status: 400 }
    );
  }

  const registrant = await prisma.registrant.findUnique({ where: { id: body.registrantId } });
  if (!registrant) {
    return NextResponse.json({ error: "Registrant not found" }, { status: 404 });
  }

  const profile = await prisma.jobSeekerProfile.create({
    data: {
      registrantId: body.registrantId,
      seekerName: body.seekerName.trim(),
      district: body.district.trim(),
      skillsCsv: body.skills.trim(),
      contactInfo: body.contactInfo.trim(),
    },
  });

  return NextResponse.json({ profile }, { status: 201 });
}
