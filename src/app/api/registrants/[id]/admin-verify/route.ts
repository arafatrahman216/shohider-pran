import { NextResponse } from "next/server";
import { adminVerifyRegistrant } from "@/lib/matching";
import { adminAuthGuard } from "@/lib/admin-auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await adminAuthGuard();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  try {
    await adminVerifyRegistrant(id);
  } catch {
    return NextResponse.json({ error: "Registrant not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
