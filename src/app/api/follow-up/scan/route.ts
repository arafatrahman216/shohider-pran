import { NextResponse } from "next/server";
import { scanAndDraftStaleFollowUps } from "@/lib/follow-up-agent";
import { adminAuthGuard } from "@/lib/admin-auth";

export async function POST() {
  const unauthorized = await adminAuthGuard();
  if (unauthorized) return unauthorized;

  const result = await scanAndDraftStaleFollowUps();
  return NextResponse.json(result);
}
