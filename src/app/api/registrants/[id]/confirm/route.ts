import { NextResponse } from "next/server";
import { confirmCandidate } from "@/lib/matching";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as { gazetteRecordId?: string };

  if (!body.gazetteRecordId) {
    return NextResponse.json({ error: "gazetteRecordId is required" }, { status: 400 });
  }

  try {
    await confirmCandidate(id, body.gazetteRecordId);
  } catch {
    return NextResponse.json({ error: "Candidate not found for this registrant" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
