import { NextResponse } from "next/server";
import { scanAndDraftStaleFollowUps } from "@/lib/follow-up-agent";

export async function POST() {
  const result = await scanAndDraftStaleFollowUps();
  return NextResponse.json(result);
}
