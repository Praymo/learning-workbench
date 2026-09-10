import { prisma } from "./db";

export async function createWrongQuestionReviewSet(limit = 6) {
  const active = await prisma.wrongQuestion.findMany({
    where: {
      status: { not: "mastered" },
      question: { status: "published", answer: { not: null }, solution: { not: null } },
    },
    include: { question: true },
    orderBy: [{ nextReviewAt: "asc" }, { wrongCount: "desc" }],
    take: Math.max(1, Math.min(limit, 10)),
  });
  if (!active.length) throw new Error("目前没有需要复查的已发布错题。");

  const selected = [] as Array<{ question: (typeof active)[number]["question"]; reason: string }>;
  const selectedIds = new Set<string>();
  const modelKeys = new Set<string>();
  for (const item of active) {
    if (selected.length >= limit) break;
    selected.push({ question: item.question, reason: "原错题复查" });
    selectedIds.add(item.questionId);
    if (item.modelKey) modelKeys.add(item.modelKey);
  }

  if (selected.length < limit && modelKeys.size) {
    const variants = await prisma.question.findMany({
      where: {
        status: "published",
        answer: { not: null },
        solution: { not: null },
        id: { notIn: [...selectedIds] },
        modelKey: { in: [...modelKeys] },
      },
      orderBy: [{ difficultyScore: "asc" }, { createdAt: "asc" }],
      take: limit * 3,
    });
    for (const question of variants) {
      if (selected.length >= limit) break;
      selected.push({ question, reason: "同模型迁移检查" });
      selectedIds.add(question.id);
    }
  }

  const estimatedMinutes = selected.reduce((sum, item) => sum + (item.question.estimatedMinutes ?? (item.question.questionType === "solution" ? 15 : 4)), 0);
  return prisma.practiceSet.create({
    data: {
      title: `错题复查 · ${new Date().toLocaleDateString("zh-CN")}`,
      mode: "review",
      difficultyProfile: "foundation_transition",
      gradeScope: "high_one",
      targetMinutes: Math.max(20, Math.min(60, estimatedMinutes)),
      estimatedMinutes,
      selectionSummaryJson: JSON.stringify({ originals: active.length, selected: selected.length, rule: "wrong-review-v1" }),
      items: { create: selected.map((item, index) => ({
        questionId: item.question.id,
        order: index + 1,
        points: item.question.score ?? (item.question.questionType === "solution" ? 12 : 5),
        selectionReason: item.reason,
      })) },
    },
  });
}
