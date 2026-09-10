import { PrismaClient } from "@prisma/client";
import { highOneCoreQuestions, validateHighOneCoreQuestion } from "../src/lib/highOneCoreQuestions.ts";
import { contentFingerprint, modelFingerprint, similarityFingerprint } from "../src/lib/questionQuality.ts";

const prisma = new PrismaClient();

const source = await prisma.source.upsert({
  where: { id: "src-high-one-core-template-v1" },
  update: {
    sourceType: "generated_template",
    licenseNote: "基于人教A版高一常见核心模型编写的本地低中档模板题；不冒充真题，答案与解析由规则和人工脚本校验。",
  },
  create: {
    id: "src-high-one-core-template-v1",
    name: "高一核心低中档模板题 v1",
    sourceType: "generated_template",
    publisher: "本项目本地生成",
    licenseNote: "基于人教A版高一常见核心模型编写的本地低中档模板题；不冒充真题，答案与解析由规则和人工脚本校验。",
  },
});

let published = 0;
let skippedDuplicate = 0;
let rubricPoints = 0;
const errors = [];

for (const item of highOneCoreQuestions) {
  const validationErrors = validateHighOneCoreQuestion(item);
  if (validationErrors.length) {
    errors.push(`${item.id}: ${validationErrors.join("；")}`);
    continue;
  }

  const fullText = [item.stem, ...(item.options ?? [])].join("\n");
  const contentHash = contentFingerprint(fullText);
  const similarityKey = similarityFingerprint(fullText);
  const existingById = await prisma.question.findUnique({ where: { id: `high-one-core-${item.id}` }, select: { id: true } });
  const duplicate = existingById ? null : await prisma.question.findFirst({
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

  const question = await prisma.question.upsert({
    where: { id: `high-one-core-${item.id}` },
    update: {
      questionType: item.questionType,
      stem: item.stem,
      optionsJson: JSON.stringify(item.options ?? []),
      answer: item.answer,
      solution: item.solution,
      difficultyScore: item.difficultyScore,
      primaryKnowledgePoint: item.primaryKnowledgePoint,
      relatedKnowledgePointsJson: JSON.stringify(item.relatedKnowledgePoints ?? []),
      methodTagsJson: JSON.stringify(item.methodTags),
      estimatedMinutes: item.estimatedMinutes,
      score: item.score,
      status: "published",
      reviewStatus: "approved",
      verificationStatus: "template_verified",
      publishedAt: new Date(),
    },
    create: {
      id: `high-one-core-${item.id}`,
      sourceId: source.id,
      questionType: item.questionType,
      stem: item.stem,
      optionsJson: JSON.stringify(item.options ?? []),
      answer: item.answer,
      solution: item.solution,
      difficulty: item.difficultyScore >= 2.6 ? "中档巩固" : "基础巩固",
      difficultyScore: item.difficultyScore,
      difficultyVersion: "high-one-core-template-v1",
      primaryKnowledgePoint: item.primaryKnowledgePoint,
      relatedKnowledgePointsJson: JSON.stringify(item.relatedKnowledgePoints ?? []),
      methodTagsJson: JSON.stringify(item.methodTags),
      targetScoreBand: "高一低中档稳定",
      verificationStatus: "template_verified",
      reviewStatus: "approved",
      status: "published",
      score: item.score,
      examSection: item.questionType,
      sourceDataset: "highOneCoreQuestions.ts",
      contentHash,
      similarityKey,
      modelKey: modelFingerprint(qualityInput),
      qualityFlagsJson: JSON.stringify(["generated_high_one_core_template"]),
      estimatedMinutes: item.estimatedMinutes,
      publishedAt: new Date(),
    },
  });

  if (item.rubric?.length) {
    await prisma.rubricPoint.deleteMany({ where: { questionId: question.id } });
    for (const [index, point] of item.rubric.entries()) {
      await prisma.rubricPoint.create({
        data: {
          questionId: question.id,
          order: index + 1,
          label: point.label,
          description: point.description,
          points: point.points,
          evidenceRequired: point.evidenceRequired,
          followThroughAllowed: Boolean(point.followThroughAllowed),
          commonErrorsJson: JSON.stringify(point.commonErrors ?? []),
        },
      });
      rubricPoints += 1;
    }
  }

  published += 1;
}

await prisma.importJob.create({
  data: {
    sourceId: source.id,
    importType: "high_one_core_template_v1",
    inputFile: "src/lib/highOneCoreQuestions.ts",
    status: errors.length ? "partial_success" : "success",
    totalItems: highOneCoreQuestions.length,
    successItems: published,
    failedItems: errors.length,
    errorLog: errors.join("\n") || null,
    finishedAt: new Date(),
  },
});

console.log(JSON.stringify({ total: highOneCoreQuestions.length, published, skippedDuplicate, rubricPoints, errors }, null, 2));
await prisma.$disconnect();
