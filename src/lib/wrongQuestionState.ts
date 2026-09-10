export type WrongQuestionStatus = "needs_review" | "reviewing" | "mastered";

const DAY_MS = 24 * 60 * 60 * 1000;

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

export function nextWrongQuestionState(input: {
  isCorrect: boolean;
  previousWrongCount?: number;
  previousCorrectStreak?: number;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  if (!input.isCorrect) {
    return {
      wrongCount: (input.previousWrongCount ?? 0) + 1,
      correctStreak: 0,
      status: "needs_review" as const,
      nextReviewAt: addDays(now, 3),
    };
  }

  const correctStreak = (input.previousCorrectStreak ?? 0) + 1;
  const mastered = correctStreak >= 2;
  return {
    wrongCount: input.previousWrongCount ?? 1,
    correctStreak,
    status: (mastered ? "mastered" : "reviewing") as WrongQuestionStatus,
    nextReviewAt: addDays(now, mastered ? 14 : 7),
  };
}
