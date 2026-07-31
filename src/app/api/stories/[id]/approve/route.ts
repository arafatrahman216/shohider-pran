import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = (await request.json()) as {
    status?: "VALIDATED" | "UNVALIDATED";
    validatedBy?: string;
    validationEvidence?: string;
    validationNote?: string;
  };
  if (body.status !== "VALIDATED" && body.status !== "UNVALIDATED") {
    return NextResponse.json({ error: "status must be VALIDATED or UNVALIDATED" }, { status: 400 });
  }
  const story = await prisma.story.update({
    where: { id },
    data: {
      validationStatus: body.status,
      validatedBy: body.validatedBy?.trim() || null,
      validationEvidence: body.validationEvidence?.trim() || null,
      validationNote: body.validationNote?.trim() || null,
      validatedAt: new Date(),
      // Original and available translated text become public after review.
      bnReviewed: true,
      enReviewed: true,
    },
  });
  return NextResponse.json({ story });
}
