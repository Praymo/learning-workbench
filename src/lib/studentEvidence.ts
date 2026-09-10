import { prisma } from "./db";
import { nextWrongQuestionState } from "./wrongQuestionState";

const ALGORITHM_VERSION = "weighted-v1";

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

export async function recordSubmissionEvidence(submissionId: string) {
  const answers = await prisma.submissionAnswer.findMany({
    where: { submissionId, needsReview: false, score: { not: null } },
    include: {
      practiceItem: { include: { question: true, practiceSet: true } },
      rubricGrades: true,
    },
  });
  const touched = new Set<string>();
  for (const answer of answers) {
    const question = answer.practiceItem.question;
    const knowledgePoint = question.primaryKnowledgePoint ?? "待分类";
    const firstError = answer.rubricGrades.find((point) => point.awardedPoints < point.maxPoints)?.errorType;
    const previousEvidence = await prisma.studentEvidence.findUnique({ where: { submissionAnswerId: answer.id } });
    const score = answer.score ?? 0;
    const errorType = firstError ?? (score < answer.maxScore ? "objective_answer_error" : null);
    const evidence = await prisma.studentEvidence.upsert({
      where: { submissionAnswerId: answer.id },
      update: {
        score,
        maxScore: answer.maxScore,
        confirmed: true,
        errorType,
      },
      create: {
        submissionAnswerId: answer.id,
        questionId: question.id,
        knowledgePoint,
        modelKey: question.modelKey,
        difficultyScore: question.difficultyScore,
        evidenceType: answer.practiceItem.practiceSet.mode === "review" ? "review" : question.questionType === "solution" ? "solution" : "objective",
        score,
        maxScore: answer.maxScore,
        confirmed: true,
        errorType,
      },
    });
    const evidenceChanged = !previousEvidence || previousEvidence.score !== score || previousEvidence.maxScore !== answer.maxScore;
    if (evidenceChanged) {
      const wrong = await prisma.wrongQuestion.findUnique({ where: { questionId: question.id } });
      if (score < answer.maxScore) {
        const state = nextWrongQuestionState({
          isCorrect: false,
          previousWrongCount: wrong?.wrongCount,
          previousCorrectStreak: wrong?.correctStreak,
        });
        await prisma.wrongQuestion.upsert({
          where: { questionId: question.id },
          update: { ...state, errorType, lastWrongAt: new Date(), lastEvidenceId: evidence.id },
          create: {
            questionId: question.id,
            knowledgePoint,
            modelKey: question.modelKey,
            errorType,
            ...state,
            lastEvidenceId: evidence.id,
          },
        });
      } else if (wrong) {
        const state = nextWrongQuestionState({
          isCorrect: true,
          previousWrongCount: wrong.wrongCount,
          previousCorrectStreak: wrong.correctStreak,
        });
        await prisma.wrongQuestion.update({
          where: { id: wrong.id },
          data: { ...state, lastEvidenceId: evidence.id },
        });
      }
    }
    touched.add(knowledgePoint);
  }
  for (const knowledgePoint of touched) await recomputeKnowledgeMastery(knowledgePoint);
}

export async function recomputeKnowledgeMastery(knowledgePoint: string) {
  const evidence = await prisma.studentEvidence.findMany({
    where: { knowledgePoint, confirmed: true },
    orderBy: { occurredAt: "desc" },
  });
  if (!evidence.length) return null;
  const ratios = evidence.map((item) => item.maxScore > 0 ? item.score / item.maxScore : 0);
  const recent = average(ratios.slice(0, 5)) ?? 0;
  const historical = average(ratios) ?? 0;
  const reviewRatios = evidence.filter((item) => item.evidenceType === "review").map((item) => item.score / item.maxScore);
  const solutionRatios = evidence.filter((item) => item.evidenceType === "solution").map((item) => item.score / item.maxScore);
  const transferRatios = evidence.filter((item) => (item.difficultyScore ?? 0) >= 3).map((item) => item.score / item.maxScore);
  const weighted: Array<[number, number]> = [[recent, 0.5], [historical, 0.2]];
  if (reviewRatios.length) weighted.push([average(reviewRatios) ?? 0, 0.2]);
  if (solutionRatios.length) weighted.push([average(solutionRatios) ?? 0, 0.1]);
  const weightTotal = weighted.reduce((sum, item) => sum + item[1], 0);
  const score = Math.round((weighted.reduce((sum, [value, weight]) => sum + value * weight, 0) / weightTotal) * 1000) / 10;
  const explanation = evidence.length < 3
    ? `目前只有${evidence.length}条有效证据，暂不下稳定结论。当前得分表现约${score}分。`
    : `根据最近作答、历史表现${reviewRatios.length ? "、错题复查" : ""}${solutionRatios.length ? "和解答题表达" : ""}计算，当前掌握度为${score}分。`;

  return prisma.knowledgeMastery.upsert({
    where: { knowledgePoint },
    update: {
      score,
      evidenceCount: evidence.length,
      conceptualScore: Math.round(historical * 1000) / 10,
      computationScore: Math.round(recent * 1000) / 10,
      expressionScore: solutionRatios.length ? Math.round((average(solutionRatios) ?? 0) * 1000) / 10 : null,
      transferScore: transferRatios.length ? Math.round((average(transferRatios) ?? 0) * 1000) / 10 : null,
      explanation,
      algorithmVersion: ALGORITHM_VERSION,
    },
    create: {
      knowledgePoint,
      score,
      evidenceCount: evidence.length,
      conceptualScore: Math.round(historical * 1000) / 10,
      computationScore: Math.round(recent * 1000) / 10,
      expressionScore: solutionRatios.length ? Math.round((average(solutionRatios) ?? 0) * 1000) / 10 : null,
      transferScore: transferRatios.length ? Math.round((average(transferRatios) ?? 0) * 1000) / 10 : null,
      explanation,
      algorithmVersion: ALGORITHM_VERSION,
    },
  });
}
