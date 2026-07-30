import { NextResponse } from "next/server";
import { rejectAllCandidates } from "@/lib/matching";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await rejectAllCandidates(id);
  return NextResponse.json({ ok: true });
}
