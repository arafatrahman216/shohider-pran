import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

const statuses = ["SUBMITTED", "VERIFIED", "FORWARDED", "IN_PROGRESS", "RESOLVED", "REJECTED"] as const;
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json() as { status?: typeof statuses[number]; note?: string; updatedBy?: string };
  if (!body.status || !statuses.includes(body.status) || !body.note?.trim()) {
    return NextResponse.json({ error: "Valid status and note are required" }, { status: 400 });
  }
  const issue = await prisma.$transaction(async (tx) => {
    const updated = await tx.authorityIssue.update({ where: { id }, data: { status: body.status } });
    await tx.authorityIssueUpdate.create({
      data: { issueId: id, status: body.status!, note: body.note!.trim(), updatedBy: body.updatedBy?.trim() || null },
    });
    return updated;
  });
  return NextResponse.json({ issue });
}
