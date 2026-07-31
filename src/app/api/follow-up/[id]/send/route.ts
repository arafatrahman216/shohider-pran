import { NextResponse } from "next/server";
import { markEscalationSent } from "@/lib/follow-up-agent";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await markEscalationSent(id);
  } catch {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
