import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/db";
import { getMathOcrProvider } from "@/lib/mathOcr";
import { stripOcrFallback } from "@/lib/mathSanitize";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const record = await prisma.ocrRecord.findUnique({ where: { id } });
  return NextResponse.json({ record });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");
  const mode = String(form.get("mode") ?? "single_question") as "single_question" | "question_page" | "answer_page";
  const pageNumberValue = form.get("pageNumber");
  const pageNumber = pageNumberValue ? Number(pageNumberValue) : undefined;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "请上传文件。" }, { status: 400 });
  }

  const uploadDir = join(process.cwd(), "public", "uploads", "ocr");
  await mkdir(uploadDir, { recursive: true });
  const safeName = `${Date.now()}-${file.name.replace(/[^\w.\-\u4e00-\u9fa5]/g, "_")}`;
  const diskPath = join(uploadDir, safeName);
  await writeFile(diskPath, Buffer.from(await file.arrayBuffer()));

  const provider = getMathOcrProvider();
  const result = await provider.recognize({ filePath: diskPath, pageNumber, mode });
  const first = result.detectedQuestions[0];

  const source = await prisma.source.create({
    data: {
      name: `手动上传：${file.name}`,
      sourceType: "manual_upload",
      localPath: diskPath,
      licenseNote: "用户手动上传，仅确认后生成正式题目。"
    }
  });

  const record = await prisma.ocrRecord.create({
    data: {
      sourceId: source.id,
      originalFilePath: diskPath.replace(process.cwd() + "/", ""),
      pageNumber,
      rawText: result.rawText,
      rawLatex: result.rawLatex ?? first?.stemLatex ?? null,
      correctedText: first ? stripOcrFallback(first.stem) : null,
      correctedLatex: first?.stemLatex ?? result.rawLatex ?? null,
      provider: result.provider,
      confidence: result.confidence,
      status: "pending_review"
    }
  });

  return NextResponse.json({ ocrRecordId: record.id });
}
