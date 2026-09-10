import { prisma } from "./db";
import { selectBalancedQuestions } from "./practiceSelection.ts";
import type { DifficultyProfile } from "./practiceSelection.ts";
import { HIGH_ONE_KNOWLEDGE_POINTS, HIGH_TWO_KNOWLEDGE_POINTS } from "./curriculum";

export type PracticeMode = "stability" | "process" | "transfer";

const modeLabels: Record<PracticeMode, string> = {
  stability: "客观题稳定训练",
  process: "解答题过程分训练",
  transfer: "迁移与综合训练"
};

function eligibleForMode(mode: PracticeMode, question: { questionType: string; difficulty: string | null }) {
  if (mode === "stability") return ["single_choice", "multiple_choice", "fill_blank"].includes(question.questionType);
  if (mode === "process") return question.questionType === "solution";
  return question.difficulty === "综合" || question.difficulty === "挑战";
}

export async function createPracticeSet(input: {
  mode: PracticeMode;
  knowledgePoint?: string;
  targetMinutes: number;
  requestedCount?: number;
  difficultyProfile?: DifficultyProfile;
  gradeScope?: "high_one" | "high_two" | "all_published";
}) {
  const [candidates, recentPracticeSets] = await Promise.all([prisma.question.findMany({
    where: {
      status: "published",
      answer: { not: null },
      solution: { not: null },
      ...(input.knowledgePoint
        ? { primaryKnowledgePoint: input.knowledgePoint }
        : input.gradeScope === "all_published"
          ? {}
          : { primaryKnowledgePoint: { in: [...(input.gradeScope === "high_one" ? HIGH_ONE_KNOWLEDGE_POINTS : HIGH_TWO_KNOWLEDGE_POINTS)] } })
    },
    include: { _count: { select: { practiceItems: true } } },
    take: 500
  }), prisma.practiceSet.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { items: { select: { questionId: true } } }
  })]);

  const eligible = candidates.filter((question) => eligibleForMode(input.mode, question));

  const defaultCount = input.mode === "stability" ? 9 : input.mode === "process" ? 2 : 2;
  const limit = Math.max(1, Math.min(input.requestedCount ?? defaultCount, input.mode === "stability" ? 12 : 4));
  const recentQuestionIds = new Set(recentPracticeSets.flatMap((set) => set.items.map((item) => item.questionId)));
  const selection = selectBalancedQuestions(eligible.map((question) => ({
    ...question,
    usageCount: question._count.practiceItems
  })), { limit, targetMinutes: input.targetMinutes, mode: input.mode, recentQuestionIds, difficultyProfile: input.difficultyProfile });
  const estimatedMinutes = selection.selected.reduce((sum, item) => sum + (item.question.estimatedMinutes ?? (item.question.questionType === "solution" ? 15 : 4)), 0);

  if (!selection.selected.length) {
    throw new Error("没有符合条件的已发布题目，请更换知识点或先完成题库审核。");
  }

  const practiceSet = await prisma.practiceSet.create({
    data: {
      title: `${modeLabels[input.mode]}${input.knowledgePoint ? ` · ${input.knowledgePoint}` : ""}`,
      mode: input.mode,
      difficultyProfile: input.difficultyProfile ?? "foundation_transition",
      gradeScope: input.gradeScope ?? "high_two",
      knowledgePoint: input.knowledgePoint || null,
      targetMinutes: input.targetMinutes,
      estimatedMinutes,
      selectionSummaryJson: JSON.stringify(selection.summary),
      items: {
        create: selection.selected.map((item, index) => ({
          questionId: item.question.id,
          order: index + 1,
          points: item.question.score ?? (item.question.questionType === "solution" ? 12 : 5),
          selectionReason: item.reason
        }))
      }
    }
  });

  return practiceSet;
}

export async function getPracticeSet(id: string) {
  return prisma.practiceSet.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: { question: { include: { source: true, rubricPoints: { orderBy: { order: "asc" } } } } }
      }
    }
  });
}
