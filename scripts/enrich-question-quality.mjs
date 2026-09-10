import { PrismaClient } from "@prisma/client";
import {
  calculateDifficulty,
  contentFingerprint,
  modelFingerprint,
  similarityFingerprint,
} from "../src/lib/questionQuality.ts";

const prisma = new PrismaClient();
const questions = await prisma.question.findMany({ include: { source: true } });
const fingerprintCounts = new Map();
for (const question of questions) {
  const fingerprint = contentFingerprint(fullQuestionText(question));
  fingerprintCounts.set(fingerprint, (fingerprintCounts.get(fingerprint) ?? 0) + 1);
}
let updated = 0;

for (const question of questions) {
  const relatedKnowledgePoints = parseArray(question.relatedKnowledgePointsJson);
  const methodTags = parseArray(question.methodTagsJson);
  const questionNumber = Number(question.sourceQuestionNumber);
  const qualityInput = {
    stem: question.stem,
    questionType: question.questionType,
    primaryKnowledgePoint: question.primaryKnowledgePoint,
    relatedKnowledgePoints,
    methodTags,
    questionNumber: Number.isFinite(questionNumber) ? questionNumber : null,
    year: question.source.year,
    paperType: question.source.paperType,
    sourceType: question.source.sourceType,
  };
  const difficulty = calculateDifficulty(qualityInput);
  const fullText = fullQuestionText(question);
  const fingerprint = contentFingerprint(fullText);

  await prisma.question.update({
    where: { id: question.id },
    data: {
      contentHash: question.contentHash ?? (fingerprintCounts.get(fingerprint) === 1 ? fingerprint : null),
      similarityKey: similarityFingerprint(fullText),
      modelKey: modelFingerprint(qualityInput),
      ...difficulty,
    },
  });
  updated += 1;
}

console.log(JSON.stringify({ scanned: questions.length, updated }, null, 2));
await prisma.$disconnect();

function parseArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function fullQuestionText(question) {
  return [question.stem, ...parseArray(question.optionsJson)].join("\n");
}
