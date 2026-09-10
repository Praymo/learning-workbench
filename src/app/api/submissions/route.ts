import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recognizeSubmission } from "@/lib/submissionProcessing";

const maxFileBytes = 20 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const practiceSetId = String(form.get("practiceSetId") ?? "");
  const recordEvidence = form.get("recordEvidence") !== "off";
  const files = form.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
  if (!practiceSetId) return NextResponse.json({ error: "请选择练习单。" }, { status: 400 });
  if (files.some((file) => !file.type.startsWith("image/"))) return NextResponse.json({ error: "答卷仅支持图片文件。" }, { status: 400 });
  if (files.some((file) => file.size > maxFileBytes)) return NextResponse.json({ error: "单张照片不能超过20MB，可压缩后重新上传。" }, { status: 400 });

  const practice = await prisma.practiceSet.findUnique({ where: { id: practiceSetId } });
  if (!practice) return NextResponse.json({ error: "练习单不存在。" }, { status: 404 });
  const submission = await prisma.submission.create({ data: { practiceSetId, recordEvidence } });
  const uploadDir = join(process.cwd(), "public", "uploads", "submissions", submission.id);
  if (files.length) await mkdir(uploadDir, { recursive: true });

  for (const [index, file] of files.entries()) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const extension = file.name.match(/\.[a-zA-Z0-9]+$/)?.[0] ?? ".jpg";
    const fileName = `${String(index + 1).padStart(3, "0")}${extension.toLowerCase()}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, bytes);
    await prisma.submissionPage.create({
      data: {
        submissionId: submission.id,
        pageOrder: index + 1,
        filePath,
        fileHash: createHash("sha256").update(bytes).digest("hex")
      }
    });
  }

  await recognizeSubmission(submission.id);
  return NextResponse.json({ submissionId: submission.id });
}
