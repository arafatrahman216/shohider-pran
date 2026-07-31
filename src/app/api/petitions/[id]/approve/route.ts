import { NextResponse } from "next/server";
import { approvePetition } from "@/lib/petition-agent";
import { requireAdminApi } from "@/lib/admin-auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await approvePetition(id);
  } catch {
    return NextResponse.json({ error: "Petition not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
