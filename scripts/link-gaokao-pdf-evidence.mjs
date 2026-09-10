import { PrismaClient } from "@prisma/client";
import { matchPdfEvidence } from "../src/lib/pdfEvidenceMatching.ts";

const prisma = new PrismaClient();

const [questions, pdfSources] = await Promise.all([
  prisma.question.findMany({
    where: { sourceDataset: { startsWith: "GAOKAO-Bench/" } },
    include: { source: true }
  }),
  prisma.source.findMany({
    where: {
      sourceType: "gaokao",
      year: { gte: 2016, lte: 2026 },
      localPath: { contains: "/普通高考/" }
    }
  })
]);

let matched = 0;
let unmatched = 0;
let ambiguous = 0;
const examples = [];

for (const question of questions) {
  const result = matchPdfEvidence({
    year: question.source.year,
    paperType: question.source.paperType,
    sourceDataset: question.sourceDataset
  }, pdfSources);

  if (result.status === "matched") {
    await prisma.questionEvidence.upsert({
      where: { questionId_sourceId: { questionId: question.id, sourceId: result.source.id } },
      update: { matchMethod: result.reason, matchStatus: "paper_matched" },
      create: {
        questionId: question.id,
        sourceId: result.source.id,
        evidenceType: "original_paper",
        matchMethod: result.reason,
        matchStatus: "paper_matched"
      }
    });
    matched += 1;
    continue;
  }

  if (result.status === "ambiguous") ambiguous += 1;
  else unmatched += 1;
  if (examples.length < 20) {
    examples.push({
      questionId: question.id,
      year: question.source.year,
      paperType: question.source.paperType,
      sourceDataset: question.sourceDataset,
      status: result.status,
      reason: result.reason,
      candidates: result.candidates.map((candidate) => candidate.name)
    });
  }
}

console.log(JSON.stringify({ total: questions.length, matched, ambiguous, unmatched, examples }, null, 2));
await prisma.$disconnect();
