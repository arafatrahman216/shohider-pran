import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function newIssueId() {
  return `JULY-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
}

export async function POST(request: Request) {
  const body = await request.json() as Record<string, string>;
  const registrantId = body.registrantId?.trim();
  if (!registrantId || !body.applicantName?.trim() || !body.recipientName?.trim() || !body.authorityName?.trim() || !body.subject?.trim() || !body.details?.trim()) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  const registrant = await prisma.registrant.findUnique({ where: { id: registrantId } });
  if (!registrant) return NextResponse.json({ error: "Registration ID not found" }, { status: 404 });
  const issue = await prisma.authorityIssue.create({
    data: {
      issueId: newIssueId(), registrantId, applicantName: body.applicantName.trim(), recipientName: body.recipientName.trim(),
      authorityName: body.authorityName.trim(), subject: body.subject.trim(), details: body.details.trim(),
      updates: { create: { status: "SUBMITTED", note: "Request submitted and awaiting review." } },
    },
  });
  return NextResponse.json({ issue }, { status: 201 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const issueId = url.searchParams.get("issueId")?.trim();
  const registrantId = url.searchParams.get("registrantId")?.trim();
  if (!issueId || !registrantId) return NextResponse.json({ error: "Issue ID and Registration ID are required" }, { status: 400 });
  const issue = await prisma.authorityIssue.findFirst({
    where: { issueId, registrantId },
    include: { updates: { orderBy: { createdAt: "asc" } } },
  });
  if (!issue) return NextResponse.json({ error: "No matching issue found" }, { status: 404 });
  return NextResponse.json({ issue });
}
