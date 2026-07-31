import { NextResponse } from "next/server";
import { approvePetition } from "@/lib/petition-agent";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await approvePetition(id);
  } catch {
    return NextResponse.json({ error: "Petition not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
