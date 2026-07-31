import { NextResponse } from "next/server";
import { findMatchesForSeeker } from "@/lib/job-matching";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const matches = await findMatchesForSeeker(id);
    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
}
