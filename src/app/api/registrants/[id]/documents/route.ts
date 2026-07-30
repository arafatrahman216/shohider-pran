import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
  return base || "document";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const registrant = await prisma.registrant.findUnique({ where: { id } });
  if (!registrant) {
    return NextResponse.json({ error: "Registrant not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File must be between 1 byte and 10MB" }, { status: 400 });
  }

  const registrantDir = path.join(UPLOAD_ROOT, id);
  await mkdir(registrantDir, { recursive: true });

  const safeName = sanitizeFileName(file.name);
  const storedName = `${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(registrantDir, storedName), buffer);

  const document = await prisma.document.create({
    data: {
      registrantId: id,
      fileName: file.name,
      fileUrl: `/uploads/${id}/${storedName}`,
    },
  });

  return NextResponse.json({ document }, { status: 201 });
}
