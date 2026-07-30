import { NextResponse } from "next/server";
import { generateDigest } from "@/lib/digest-agent";

export async function GET() {
  const digest = await generateDigest();
  return NextResponse.json(digest);
}
