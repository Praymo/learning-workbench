import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripOcrFallback } from "@/lib/mathSanitize";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const ocrRecordId = String(form.get("ocrRecordId") ?? "");
  const record = await prisma.ocrRecord.findUnique({ where: { id: ocrRecordId } });
  if (!record) return NextResponse.json({ error: "OCR 记录不存在。" }, { status: 404 });

  const stem = stripOcrFallback(String(form.get("stem") ?? ""));
  const answer = String(form.get("answer") ?? "").trim();
  const solution = String(form.get("solution") ?? "").trim();
  if (!stem) return NextResponse.json({ error: "题干不能为空。" }, { status: 400 });

  const duplicate = await prisma.question.findFirst({ where: { stem } });
  if (duplicate) {
    await prisma.ocrRecord.update({
      where: { id: record.id },
      data: {
        correctedText: stem,
        correctedLatex: String(form.get("stemLatex") ?? "") || null,
        status: "confirmed"
      }
    });
    return NextResponse.json({ questionId: duplicate.id, duplicate: true });
  }

  const canPublish = Boolean(answer && solution);
  const question = await prisma.question.create({
    data: {
      sourceId: record.sourceId!,
      sourceQuestionNumber: String(form.get("questionNumber") ?? "") || null,
      questionType: String(form.get("questionType") ?? "solution"),
      stem,
      stemLatex: String(form.get("stemLatex") ?? "") || null,
      optionsJson: String(form.get("optionsJson") ?? "") || null,
      answer: answer || null,
      solution: solution || null,
      difficulty: String(form.get("difficulty") ?? "") || null,
      primaryKnowledgePoint: String(form.get("primaryKnowledgePoint") ?? "") || null,
      relatedKnowledgePointsJson: "[]",
      methodTagsJson: JSON.stringify(["OCR人工确认"]),
      imagePathsJson: JSON.stringify([record.originalFilePath]),
      status: canPublish ? "published" : "candidate",
      examSection: String(form.get("questionType") ?? "solution"),
      publishedAt: canPublish ? new Date() : null,
      verificationStatus: canPublish ? "human_confirmed" : "incomplete",
      reviewStatus: canPublish ? "approved" : "pending_review",
      qualityFlagsJson: canPublish ? "[]" : JSON.stringify([!answer ? "missing_answer" : null, !solution ? "missing_solution" : null].filter(Boolean))
    }
  });

  await prisma.ocrRecord.update({
    where: { id: record.id },
    data: {
      correctedText: stem,
      correctedLatex: String(form.get("stemLatex") ?? "") || null,
      status: "confirmed"
    }
  });

  return NextResponse.json({ questionId: question.id, duplicate: false });
}
