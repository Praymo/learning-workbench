import { PrismaClient } from "@prisma/client";
import { getMathOcrProvider } from "../src/lib/mathOcr.ts";
import { modelConfiguration } from "../src/lib/modelClient.ts";

const prisma = new PrismaClient();
const sourceIdIndex = process.argv.indexOf("--source-id");
const sourceId = sourceIdIndex >= 0 ? process.argv[sourceIdIndex + 1] : undefined;
if (!sourceId || sourceId.startsWith("--")) throw new Error("请提供 --source-id");

const config = modelConfiguration();
if (!config.configured || !config.visionModel) {
  throw new Error("尚未配置 LLM_API_KEY 或 MODEL_VISION；页面已保留，但不会生成假 OCR 草稿。");
}

const pages = await prisma.sourcePage.findMany({ where: { sourceId }, orderBy: { pageNumber: "asc" } });
if (!pages.length) throw new Error("尚未渲染原卷页面，请先运行 questions:render-pages");

const provider = getMathOcrProvider();
let drafts = 0;
for (const page of pages) {
  const result = await provider.recognize({ filePath: page.imagePath, pageNumber: page.pageNumber, mode: "question_page" });
  await prisma.questionExtractionDraft.deleteMany({ where: { sourcePageId: page.id, status: "pending_review" } });
  for (const question of result.detectedQuestions) {
    await prisma.questionExtractionDraft.create({
      data: {
        sourceId,
        sourcePageId: page.id,
        sourceQuestionNumber: question.questionNumber ?? null,
        stem: question.stem,
        stemLatex: question.stemLatex ?? null,
        optionsJson: question.options ? JSON.stringify(question.options) : null,
        answer: question.answer ?? null,
        solution: question.solution ?? null,
        sourceRegionJson: question.imageRegions ? JSON.stringify(question.imageRegions) : null,
        provider: result.provider,
        promptVersion: "math-ocr-v2",
        confidence: result.confidence,
        status: "pending_review"
      }
    });
    drafts += 1;
  }
  await prisma.sourcePage.update({ where: { id: page.id }, data: { status: "extracted_pending_review" } });
}

console.log(JSON.stringify({ sourceId, pages: pages.length, drafts }, null, 2));
await prisma.$disconnect();
