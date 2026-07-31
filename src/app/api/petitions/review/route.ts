import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

export async function GET() {
  if (!(await requireAdminApi())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const petitions = await prisma.petition.findMany({
    where: { status: "DRAFT" },
    include: { proposedBy: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ petitions });
}
