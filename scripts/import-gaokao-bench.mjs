import { PrismaClient } from "@prisma/client";
import { calculateDifficulty, modelFingerprint, similarityFingerprint } from "../src/lib/questionQuality.ts";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { classifyKnowledge } from "../src/lib/knowledge.ts";
import { examProfiles, questionTypeForPaper } from "../src/lib/examProfiles.ts";

const prisma = new PrismaClient();
const root = join(process.cwd(), "data", "sources", "GAOKAO-Bench");
const dataRoot = join(root, "Data");
const repoUrl = "https://github.com/OpenLMLab/GAOKAO-Bench";

const files = [
  ["Objective_Questions/2010-2022_Math_I_MCQs.json", "choice", "Math-I"],
  ["Subjective_Questions/2010-2022_Math_I_Fill-in-the-Blank.json", "fill_blank", "Math-I"],
  ["Subjective_Questions/2010-2022_Math_I_Open-ended_Questions.json", "solution", "Math-I"],
  ["Objective_Questions/2010-2022_Math_II_MCQs.json", "choice", "Math-II"],
  ["Subjective_Questions/2010-2022_Math_II_Fill-in-the-Blank.json", "fill_blank", "Math-II"],
  ["Subjective_Questions/2010-2022_Math_II_Open-ended_Questions.json", "solution", "Math-II"]
];

function normalizeCategory(category) {
  return String(category ?? "未知卷型")
    .replace(/[（）()]/g, "")
    .replace(/ⅰ/g, "Ⅰ")
    .replace(/ⅱ/g, "Ⅱ")
    .replace(/ⅲ/g, "Ⅲ")
    .replace("新课标Ⅰ", "新课标Ⅰ卷")
    .replace("新课标Ⅱ", "新课标Ⅱ卷")
    .trim();
}

function allowedCategory(category) {
  return !/(春季|职教|高职|单招|成人)/.test(category);
}

function normalizeForHash(value) {
  return value
    .replace(/^\s*\d+\s*[.．、]?\s*/, "")
    .replace(/[（(]\s*\d+\s*分\s*[)）]/, "")
    .replace(/\s+/g, "")
    .replace(/[（）]/g, (character) => character === "（" ? "(" : ")")
    .toLowerCase();
}

function contentHash(value) {
  return createHash("sha256").update(normalizeForHash(value)).digest("hex");
}

function parseQuestionNumber(question) {
  const match = question.match(/^\s*(\d+)\s*[.．、]/);
  return match ? Number(match[1]) : undefined;
}

function stripQuestionPrefix(question) {
  return question
    .replace(/^\s*\d+\s*[.．、]\s*/, "")
    .replace(/^\s*[（(]\s*\d+\s*分\s*[)）]\s*/, "")
    .trim();
}

function splitOptions(question) {
  const matches = [...question.matchAll(/(?:^|\n)\s*([A-D])\s*[.．、:]\s*/g)];
  if (matches.length < 2) return { stem: stripQuestionPrefix(question), options: [] };
  const firstIndex = matches[0].index ?? question.length;
  const stem = stripQuestionPrefix(question.slice(0, firstIndex));
  const options = matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? question.length;
    return `${match[1]}. ${question.slice(start, end).trim()}`;
  });
  return { stem, options };
}

function qualityFlags(stem, answer, solution) {
  const flags = [];
  if (!stem.trim()) flags.push("missing_stem");
  if (!answer.trim()) flags.push("missing_answer");
  if (!solution.trim()) flags.push("missing_solution");
  if (/cid:|�|㝍/.test(stem)) flags.push("malformed_text");
  if (/如图|下图|图中|图\s*\d/.test(stem)) flags.push("needs_original_image");
  if (/\\begin\{tabular\}|\\includegraphics/.test(stem)) flags.push("unsupported_layout");
  return flags;
}

function difficultyFor(type, questionNumber) {
  if (type === "solution") return questionNumber && questionNumber >= 20 ? "挑战" : questionNumber && questionNumber >= 18 ? "综合" : "中档";
  if (type === "multiple_choice") return "综合";
  if (questionNumber && questionNumber <= 5) return "基础";
  if (questionNumber && questionNumber >= 11) return "综合";
  return "中档";
}

function estimatedMinutes(type, difficulty) {
  if (type === "solution") return difficulty === "挑战" ? 22 : difficulty === "综合" ? 18 : 14;
  if (type === "multiple_choice") return 5;
  if (type === "fill_blank") return 5;
  return difficulty === "基础" ? 3 : 4;
}

function buildRubricDraft(question, score) {
  const parts = [...question.matchAll(/[（(]([1-9])[s）)]/g)].map((match) => Number(match[1]));
  const count = Math.max(1, new Set(parts).size);
  const base = Math.floor(score / count);
  return Array.from({ length: count }, (_, index) => ({
    order: index + 1,
    label: count === 1 ? "主要过程" : `第${index + 1}问（参考）`,
    description: count === 1 ? "写出主要推导并得到正确结论。" : `完成第${index + 1}问的主要推导并得到结论。`,
    points: index === count - 1 ? score - base * (count - 1) : base,
    isRequired: false,
    alternativesJson: JSON.stringify(["评分点草案，正式过程评分前需人工核对"])
  }));
}

async function seedExamProfiles() {
  for (const profile of examProfiles) {
    await prisma.examProfile.upsert({
      where: { id: profile.id },
      update: {
        name: profile.name,
        year: profile.year,
        paperType: profile.paperType,
        totalScore: profile.totalScore,
        durationMinutes: profile.durationMinutes,
        structureJson: JSON.stringify(profile.sections),
        scoringRulesJson: JSON.stringify(profile.scoringRules)
      },
      create: {
        id: profile.id,
        name: profile.name,
        year: profile.year,
        paperType: profile.paperType,
        totalScore: profile.totalScore,
        durationMinutes: profile.durationMinutes,
        structureJson: JSON.stringify(profile.sections),
        scoringRulesJson: JSON.stringify(profile.scoringRules)
      }
    });
  }
}

if (!existsSync(dataRoot)) {
  throw new Error("未找到 GAOKAO-Bench。请先将仓库 clone 到 data/sources/GAOKAO-Bench。");
}

await seedExamProfiles();
const job = await prisma.importJob.create({
  data: { importType: "gaokao_bench_structured", inputFile: repoUrl, status: "running" }
});

let discovered = 0;
let imported = 0;
let published = 0;
let skipped = 0;
const errors = [];

for (const [relativePath, baseType, partition] of files) {
  const filePath = join(dataRoot, relativePath);
  const rows = JSON.parse(readFileSync(filePath, "utf8")).example ?? [];
  for (const row of rows) {
    const year = Number(row.year);
    const category = normalizeCategory(row.category);
    if (year < 2016 || year > 2022 || !allowedCategory(category)) continue;
    discovered += 1;

    try {
      const questionNumber = parseQuestionNumber(row.question);
      const inferredType = baseType === "choice"
        ? questionTypeForPaper(year, category, questionNumber) ?? "single_choice"
        : baseType;
      const { stem, options } = baseType === "choice" ? splitOptions(row.question) : { stem: stripQuestionPrefix(row.question), options: [] };
      const answer = Array.isArray(row.answer) ? row.answer.join(",") : String(row.answer ?? "").trim();
      const solution = String(row.analysis || (baseType === "solution" ? row.answer : "") || "").trim();
      const hash = contentHash(row.question);
      const existing = await prisma.question.findUnique({ where: { contentHash: hash } });
      if (existing) {
        skipped += 1;
        continue;
      }

      const sourceId = `gaokao-bench-${year}-${category}-${partition}`.replace(/[^a-zA-Z0-9\u4e00-\u9fa5ⅠⅡ甲乙-]+/g, "-");
      const source = await prisma.source.upsert({
        where: { id: sourceId },
        update: {},
        create: {
          id: sourceId,
          name: `${year} ${category} ${partition}`,
          sourceType: "gaokao",
          sourceUrl: repoUrl,
          year,
          paperType: category,
          publisher: "OpenLMLab/GAOKAO-Bench",
          licenseNote: "Apache-2.0；结构化题目仍需按项目质量门槛复核。",
          localPath: filePath
        }
      });

      const flags = qualityFlags(stem, answer, solution);
      const canPublish = flags.length === 0;
      const knowledge = classifyKnowledge(stem, solution);
      const difficulty = difficultyFor(inferredType, questionNumber);
      const qualityInput = {
        stem,
        questionType: inferredType,
        primaryKnowledgePoint: knowledge.primary,
        relatedKnowledgePoints: knowledge.related,
        methodTags: knowledge.methods,
        questionNumber,
        year,
        paperType: category,
        sourceType: "gaokao"
      };
      const difficultyMetrics = calculateDifficulty(qualityInput);
      const examProfileId = /新课标[ⅠⅡ]/.test(category) && year >= 2020
        ? "new-gaokao-1-2020-2023-v1"
        : null;

      const question = await prisma.question.create({
        data: {
          id: `gb-${hash.slice(0, 24)}`,
          sourceId: source.id,
          sourceQuestionNumber: questionNumber ? String(questionNumber) : null,
          questionType: inferredType,
          stem,
          optionsJson: JSON.stringify(options),
          answer,
          solution,
          difficulty,
          primaryKnowledgePoint: knowledge.primary,
          relatedKnowledgePointsJson: JSON.stringify(knowledge.related),
          methodTagsJson: JSON.stringify(knowledge.methods),
          targetScoreBand: difficulty === "挑战" ? "130+" : "110-120 到 130+",
          verificationStatus: canPublish ? "verified" : "source_verified",
          reviewStatus: canPublish ? "approved" : "pending_review",
          status: canPublish ? "published" : "verified",
          score: Number(row.score) || null,
          examSection: inferredType,
          sourceDataset: `GAOKAO-Bench/${relativePath}`,
          sourceIndex: Number(row.index),
          contentHash: hash,
          similarityKey: similarityFingerprint(row.question),
          modelKey: modelFingerprint(qualityInput),
          ...difficultyMetrics,
          classificationConfidence: knowledge.confidence,
          qualityFlagsJson: JSON.stringify(flags),
          estimatedMinutes: estimatedMinutes(inferredType, difficulty),
          publishedAt: canPublish ? new Date() : null,
          examProfileId
        }
      });

      if (inferredType === "solution") {
        const rubric = buildRubricDraft(stem, Number(row.score) || 12);
        await prisma.rubricPoint.createMany({ data: rubric.map((point) => ({ ...point, questionId: question.id })) });
      }

      imported += 1;
      if (canPublish) published += 1;
    } catch (error) {
      errors.push(`${relativePath}#${row.index}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

await prisma.importJob.update({
  where: { id: job.id },
  data: {
    status: errors.length ? "partial_success" : "success",
    totalItems: discovered,
    successItems: imported,
    failedItems: errors.length,
    errorLog: errors.join("\n") || null,
    finishedAt: new Date()
  }
});

console.log(JSON.stringify({ discovered, imported, published, skipped, failed: errors.length }, null, 2));
await prisma.$disconnect();
