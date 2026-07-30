import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type CreatePostingBody = {
  title?: string;
  description?: string;
  district?: string;
  skills?: string;
  postedByName?: string;
  contactInfo?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CreatePostingBody;

  if (!body.title?.trim() || !body.description?.trim() || !body.district?.trim() || !body.skills?.trim() || !body.contactInfo?.trim()) {
    return NextResponse.json(
      { error: "title, description, district, skills, and contactInfo are required" },
      { status: 400 }
    );
  }

  const posting = await prisma.jobPosting.create({
    data: {
      title: body.title.trim(),
      description: body.description.trim(),
      district: body.district.trim(),
      skillsCsv: body.skills.trim(),
      postedByName: body.postedByName?.trim() || null,
      contactInfo: body.contactInfo.trim(),
    },
  });

  return NextResponse.json({ posting }, { status: 201 });
}

export async function GET() {
  const postings = await prisma.jobPosting.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ postings });
}
