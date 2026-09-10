import { PrismaClient } from "@prisma/client";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { sampleDemoQuestions } from "../src/lib/sampleQuestions.ts";

const prisma = new PrismaClient();
const dataDir = join(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });

const source = await prisma.source.upsert({
  where: { id: "src-demo-synthetic" },
  update: {
    name: "DEMO · 自编演示题库",
    sourceType: "generated_template",
    publisher: "本项目本地合成",
    licenseNote: "仅用于公开演示；题目为自编/改写示例，不对应任何真实考试卷。"
  },
  create: {
    id: "src-demo-synthetic",
    name: "DEMO · 自编演示题库",
    sourceType: "generated_template",
    publisher: "本项目本地合成",
    licenseNote: "仅用于公开演示；题目为自编/改写示例，不对应任何真实考试卷。"
  }
});

for (const item of sampleDemoQuestions) {
  await prisma.question.upsert({
    where: { id: `q-demo-${item.demoId}` },
    update: {
      sourceId: source.id,
      sourceQuestionNumber: item.demoNumber,
      stem: item.stem,
      optionsJson: JSON.stringify(item.options),
      answer: item.answer,
      solution: item.solution,
      difficulty: item.difficulty,
      primaryKnowledgePoint: item.primaryKnowledgePoint,
      relatedKnowledgePointsJson: JSON.stringify(item.relatedKnowledgePoints),
      methodTagsJson: JSON.stringify(item.methodTags),
      targetScoreBand: item.targetScoreBand,
      sourceDataset: "sampleDemoQuestions.ts",
      qualityFlagsJson: JSON.stringify(["synthetic_demo_question"]),
      status: "published",
      score: item.questionType === "solution" ? 12 : 5,
      examSection: item.questionType === "choice" ? "single_choice" : item.questionType === "blank" ? "fill_blank" : "solution",
      estimatedMinutes: item.questionType === "solution" ? 14 : 4,
      publishedAt: new Date(),
      verificationStatus: "verified",
      reviewStatus: "approved"
    },
    create: {
      id: `q-demo-${item.demoId}`,
      sourceId: source.id,
      sourceQuestionNumber: item.demoNumber,
      questionType: item.questionType === "choice" ? "single_choice" : item.questionType === "blank" ? "fill_blank" : "solution",
      stem: item.stem,
      optionsJson: JSON.stringify(item.options),
      answer: item.answer,
      solution: item.solution,
      difficulty: item.difficulty,
      primaryKnowledgePoint: item.primaryKnowledgePoint,
      relatedKnowledgePointsJson: JSON.stringify(item.relatedKnowledgePoints),
      methodTagsJson: JSON.stringify(item.methodTags),
      targetScoreBand: item.targetScoreBand,
      sourceDataset: "sampleDemoQuestions.ts",
      qualityFlagsJson: JSON.stringify(["synthetic_demo_question"]),
      status: "published",
      score: item.questionType === "solution" ? 12 : 5,
      examSection: item.questionType === "choice" ? "single_choice" : item.questionType === "blank" ? "fill_blank" : "solution",
      estimatedMinutes: item.questionType === "solution" ? 14 : 4,
      publishedAt: new Date(),
      verificationStatus: "demo_verified",
      reviewStatus: "approved"
    }
  });
}

await prisma.importJob.create({
  data: {
    sourceId: source.id,
    importType: "seed",
    inputFile: "scripts/seed.mjs",
    status: "success",
    totalItems: sampleDemoQuestions.length,
    successItems: sampleDemoQuestions.length,
    failedItems: 0,
    finishedAt: new Date()
  }
});

writeFileSync(join(dataDir, "seed-summary.json"), JSON.stringify({ importedQuestions: sampleDemoQuestions.length, source: "synthetic-demo" }, null, 2), "utf8");
console.log(`Seeded ${sampleDemoQuestions.length} synthetic demo questions into SQLite.`);

await prisma.$disconnect();
