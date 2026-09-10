import { PrismaClient } from "@prisma/client";
import { topicSummarySeeds } from "../src/lib/topicSummarySeed.ts";

const prisma = new PrismaClient();
let published = 0;

for (const seed of topicSummarySeeds) {
  const topic = await prisma.topicSummary.upsert({
    where: { knowledgePoint: seed.knowledgePoint },
    update: {
      title: seed.title, summary: seed.summary,
      coreFrameworkJson: JSON.stringify(seed.framework), recognitionSignalsJson: JSON.stringify(seed.signals),
      commonErrorsJson: JSON.stringify(seed.errors), transferTargetsJson: JSON.stringify(seed.transfers), status: "published",
    },
    create: {
      knowledgePoint: seed.knowledgePoint, title: seed.title, summary: seed.summary,
      coreFrameworkJson: JSON.stringify(seed.framework), recognitionSignalsJson: JSON.stringify(seed.signals),
      commonErrorsJson: JSON.stringify(seed.errors), transferTargetsJson: JSON.stringify(seed.transfers), status: "published",
    },
  });
  const candidates = await prisma.question.findMany({
    where: { status: "published", primaryKnowledgePoint: seed.knowledgePoint, answer: { not: null }, solution: { not: null } },
    orderBy: [{ questionType: "desc" }, { difficultyScore: "asc" }], take: 12,
  });
  const chosen = [];
  const models = new Set();
  for (const question of candidates) {
    if (/选修|极坐标|参数方程|导数/.test(question.stem)) continue;
    const key = question.modelKey ?? question.id;
    if (models.has(key)) continue;
    chosen.push(question);
    models.add(key);
    if (chosen.length === 2) break;
  }
  await prisma.topicExample.deleteMany({ where: { topicSummaryId: topic.id } });
  if (chosen.length) {
    await prisma.topicExample.createMany({ data: chosen.map((question, index) => ({
      topicSummaryId: topic.id, questionId: question.id, order: index + 1,
      teachingNote: index === 0 ? "先完成基础识别，再比较可替代的方法。" : "用于检查同一框架在不同设问中的迁移。",
    })) });
  }
  published += 1;
}

console.log(JSON.stringify({ published, examples: await prisma.topicExample.count() }, null, 2));
await prisma.$disconnect();
