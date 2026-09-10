import { PrismaClient } from "@prisma/client";
import { foundationQuestions, validateFoundationQuestion } from "../src/lib/foundationQuestions.ts";
import { contentFingerprint, modelFingerprint, similarityFingerprint } from "../src/lib/questionQuality.ts";

const prisma = new PrismaClient();
const source = await prisma.source.upsert({
  where: { id: "src-foundation-template-v1" },
  update: { sourceType: "generated_template" },
  create: {
    id: "src-foundation-template-v1",
    name: "高一基础巩固模板题 v1",
    sourceType: "generated_template",
    publisher: "本项目本地生成",
    licenseNote: "基于高中数学基础定义和公式编写的本地模板题；不冒充真题，答案由模板规则校验。",
  },
});

let published = 0;
let skippedDuplicate = 0;
const errors = [];

await prisma.question.updateMany({
  where: { id: { in: ["foundation-trig-sin30-01", "foundation-trig-tan45-01"] } },
  data: { status: "rejected", reviewStatus: "retired_too_simple", publishedAt: null },
});

for (const item of foundationQuestions) {
  const validationErrors = validateFoundationQuestion(item);
  if (validationErrors.length) {
    errors.push(`${item.id}: ${validationErrors.join("；")}`);
    continue;
  }
  const fullText = [item.stem, ...(item.options ?? [])].join("\n");
  const contentHash = contentFingerprint(fullText);
  const similarityKey = similarityFingerprint(fullText);
  const duplicate = await prisma.question.findFirst({
    where: { OR: [{ contentHash }, { similarityKey }] },
    select: { id: true },
  });
  if (duplicate) {
    skippedDuplicate += 1;
    continue;
  }
  const qualityInput = {
    stem: item.stem,
    questionType: item.questionType,
    primaryKnowledgePoint: item.primaryKnowledgePoint,
    relatedKnowledgePoints: item.relatedKnowledgePoints ?? [],
    methodTags: item.methodTags,
  };
  await prisma.question.upsert({
    where: { id: `foundation-${item.id}` },
    update: {},
    create: {
      id: `foundation-${item.id}`,
      sourceId: source.id,
      questionType: item.questionType,
      stem: item.stem,
      optionsJson: JSON.stringify(item.options ?? []),
      answer: item.answer,
      solution: item.solution,
      difficulty: "基础巩固",
      difficultyScore: item.difficultyScore,
      difficultyVersion: "foundation-template-v1",
      primaryKnowledgePoint: item.primaryKnowledgePoint,
      relatedKnowledgePointsJson: JSON.stringify(item.relatedKnowledgePoints ?? []),
      methodTagsJson: JSON.stringify(item.methodTags),
      targetScoreBand: "高一基础稳定",
      verificationStatus: "template_verified",
      reviewStatus: "approved",
      status: "published",
      score: 5,
      examSection: item.questionType,
      sourceDataset: "foundationQuestions.ts",
      contentHash,
      similarityKey,
      modelKey: modelFingerprint(qualityInput),
      qualityFlagsJson: JSON.stringify(["generated_foundation_template"]),
      estimatedMinutes: item.estimatedMinutes,
      publishedAt: new Date(),
    },
  });
  published += 1;
}

await prisma.importJob.create({
  data: {
    sourceId: source.id,
    importType: "foundation_template_v1",
    inputFile: "src/lib/foundationQuestions.ts",
    status: errors.length ? "partial_success" : "success",
    totalItems: foundationQuestions.length,
    successItems: published,
    failedItems: errors.length,
    errorLog: errors.join("\n") || null,
    finishedAt: new Date(),
  },
});

console.log(JSON.stringify({ total: foundationQuestions.length, published, skippedDuplicate, errors }, null, 2));
await prisma.$disconnect();
