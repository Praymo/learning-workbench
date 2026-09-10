import type { Question, Source } from "@prisma/client";
import { prisma } from "./db";
import { calculateDifficulty, contentFingerprint, modelFingerprint, similarityFingerprint } from "./questionQuality.ts";

export type QuestionWithSource = Question & { source: Source };

export function parseJsonArray(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function stringifyArray(value: string[]) {
  return JSON.stringify(value.filter(Boolean), null, 0);
}

export async function getDashboardStats() {
  const [totalQuestions, publishedQuestions, verifiedQuestions, candidateQuestions, pendingReview, gaokaoQuestions, manualOcrSources, latestImport, recentJobs] =
    await Promise.all([
      prisma.question.count(),
      prisma.question.count({ where: { status: "published" } }),
      prisma.question.count({ where: { verificationStatus: "verified" } }),
      prisma.question.count({ where: { status: "candidate" } }),
      prisma.question.count({ where: { reviewStatus: "pending_review" } }),
      prisma.question.count({ where: { source: { sourceType: "gaokao" } } }),
      prisma.source.count({ where: { sourceType: "manual_upload" } }),
      prisma.importJob.findFirst({ orderBy: { startedAt: "desc" } }),
      prisma.importJob.findMany({ orderBy: { startedAt: "desc" }, take: 6, include: { source: true } })
    ]);

  return {
    totalQuestions,
    publishedQuestions,
    verifiedQuestions,
    candidateQuestions,
    pendingReview,
    gaokaoQuestions,
    manualOcrSources,
    latestImport,
    recentJobs
  };
}

export async function searchQuestions(searchParams: Record<string, string | string[] | undefined>) {
  const keyword = asString(searchParams.q);
  const year = asString(searchParams.year);
  const paperType = asString(searchParams.paperType);
  const sourceType = asString(searchParams.sourceType);
  const knowledge = asString(searchParams.knowledge);
  const difficulty = asString(searchParams.difficulty);
  const reviewStatus = asString(searchParams.reviewStatus);
  const statusParam = asString(searchParams.status);
  const status = statusParam === undefined ? "published" : statusParam;
  const questionType = asString(searchParams.questionType);
  const page = Math.max(1, Number(asString(searchParams.page) ?? 1) || 1);
  const pageSize = 30;

  const where = {
    AND: [
      keyword
        ? {
            OR: [
              { stem: { contains: keyword } },
              { answer: { contains: keyword } },
              { solution: { contains: keyword } },
              { primaryKnowledgePoint: { contains: keyword } }
            ]
          }
        : {},
      year ? { source: { year: Number(year) } } : {},
      paperType ? { source: { paperType: { contains: paperType } } } : {},
      sourceType ? { source: { sourceType } } : {},
      knowledge ? { primaryKnowledgePoint: { contains: knowledge } } : {},
      difficulty ? { difficulty } : {},
      reviewStatus ? { reviewStatus } : {},
      status ? { status } : {},
      questionType ? { questionType } : {}
    ]
  };

  const [questions, total] = await Promise.all([prisma.question.findMany({
    where: {
      ...where
    },
    include: { source: true },
    orderBy: [{ source: { year: "desc" } }, { sourceQuestionNumber: "asc" }],
    skip: (page - 1) * pageSize,
    take: pageSize
  }), prisma.question.count({ where })]);

  return { questions, total, page, pageSize, status };
}

export function asString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function getQuestion(id: string) {
  return prisma.question.findUnique({
    where: { id },
    include: {
      source: true,
      rubricPoints: { orderBy: { order: "asc" } },
      solutionMethods: { orderBy: { order: "asc" } },
      sourceEvidence: { include: { source: true, sourcePage: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

export async function updateQuestion(
  id: string,
  data: {
    stem: string;
    stemLatex?: string;
    answer?: string;
    solution?: string;
    difficulty?: string;
    primaryKnowledgePoint?: string;
    methodTags?: string[];
    reviewStatus?: string;
    verificationStatus?: string;
    status?: string;
    questionType?: string;
    score?: number;
  }
) {
  const current = await prisma.question.findUnique({ where: { id }, include: { source: true } });
  if (!current) throw new Error("题目不存在");
  const relatedKnowledgePoints = parseJsonArray(current.relatedKnowledgePointsJson);
  const fullQuestionText = [data.stem, ...parseJsonArray(current.optionsJson)].join("\n");
  const qualityInput = {
    stem: data.stem,
    questionType: data.questionType ?? current.questionType,
    primaryKnowledgePoint: data.primaryKnowledgePoint,
    relatedKnowledgePoints,
    methodTags: data.methodTags ?? [],
    questionNumber: Number(current.sourceQuestionNumber) || null,
    year: current.source.year,
    paperType: current.source.paperType,
    sourceType: current.source.sourceType,
  };
  return prisma.question.update({
    where: { id },
    data: {
      stem: data.stem,
      stemLatex: data.stemLatex || null,
      answer: data.answer || null,
      solution: data.solution || null,
      difficulty: data.difficulty || null,
      primaryKnowledgePoint: data.primaryKnowledgePoint || null,
      methodTagsJson: stringifyArray(data.methodTags ?? []),
      reviewStatus: data.reviewStatus ?? "approved",
      verificationStatus: data.verificationStatus ?? "verified",
      status: data.status ?? "verified",
      questionType: data.questionType,
      score: data.score,
      contentHash: contentFingerprint(fullQuestionText),
      similarityKey: similarityFingerprint(fullQuestionText),
      modelKey: modelFingerprint(qualityInput),
      ...calculateDifficulty(qualityInput),
      publishedAt: data.status === "published" ? new Date() : undefined
    }
  });
}

export async function getPublishedKnowledgePoints() {
  const rows = await prisma.question.findMany({
    where: { status: "published", primaryKnowledgePoint: { not: null } },
    select: { primaryKnowledgePoint: true }
  });
  return [...new Set(rows.map((row) => row.primaryKnowledgePoint).filter((value): value is string => Boolean(value)))].sort();
}
