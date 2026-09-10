import { PrismaClient } from "@prisma/client";
import { classifyKnowledge } from "../src/lib/knowledge.ts";

const prisma = new PrismaClient();
const questions = await prisma.question.findMany({ where: { sourceDataset: { contains: "GAOKAO-Bench" } } });

for (const question of questions) {
  const knowledge = classifyKnowledge(question.stem, question.solution ?? "");
  await prisma.question.update({
    where: { id: question.id },
    data: {
      primaryKnowledgePoint: knowledge.primary,
      relatedKnowledgePointsJson: JSON.stringify(knowledge.related),
      methodTagsJson: JSON.stringify(knowledge.methods),
      classificationConfidence: knowledge.confidence
    }
  });
}

console.log(`Reclassified ${questions.length} GAOKAO-Bench questions.`);
await prisma.$disconnect();
