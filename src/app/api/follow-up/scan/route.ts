import { NextResponse } from "next/server";
import { scanAndDraftStaleFollowUps } from "@/lib/follow-up-agent";
import { requireAdminApi } from "@/lib/admin-auth";

export async function POST() {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await scanAndDraftStaleFollowUps();
  return NextResponse.json(result);
}
