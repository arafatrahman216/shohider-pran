import { NextResponse } from "next/server";
import { approvePetition } from "@/lib/petition-agent";
import { adminAuthGuard } from "@/lib/admin-auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await adminAuthGuard();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  try {
    await approvePetition(id);
  } catch {
    return NextResponse.json({ error: "Petition not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
