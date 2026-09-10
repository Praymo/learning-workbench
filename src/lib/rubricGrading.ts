export type RubricDefinition = {
  id: string;
  order: number;
  rubricCode: string | null;
  points: number;
  evidenceRequired: string | null;
};

export type ModelPointGrade = {
  rubricPointId?: string;
  rubricCode?: string;
  awardedPoints?: number;
  evidenceText?: string;
  errorType?: string;
  confidence?: number;
};

export function rubricIsDetailed(points: RubricDefinition[]) {
  return points.length > 0 && points.every((point) => Boolean(point.rubricCode && point.evidenceRequired && point.points > 0));
}

export function normalizePointGrades(rubric: RubricDefinition[], modelGrades: ModelPointGrade[]) {
  const rows = rubric.map((point) => {
    const grade = modelGrades.find((item) => item.rubricPointId === point.id || item.rubricCode === point.rubricCode);
    const rawPoints = Number(grade?.awardedPoints ?? 0);
    const awardedPoints = Math.max(0, Math.min(point.points, Math.round(rawPoints)));
    const confidence = Math.max(0, Math.min(1, Number(grade?.confidence ?? 0)));
    const evidenceText = String(grade?.evidenceText ?? "").trim();
    return {
      rubricPointId: point.id,
      rubricCode: point.rubricCode ?? `point-${point.order}`,
      awardedPoints,
      maxPoints: point.points,
      evidenceText: evidenceText || null,
      errorType: String(grade?.errorType ?? "").trim() || null,
      confidence,
      reviewStatus: !grade || confidence < 0.78 || (awardedPoints > 0 && !evidenceText) ? "needs_review" : "model_suggested",
    };
  });
  return {
    rows,
    score: rows.reduce((sum, row) => sum + row.awardedPoints, 0),
    confidence: rows.length ? Math.min(...rows.map((row) => row.confidence)) : 0,
    needsReview: rows.some((row) => row.reviewStatus === "needs_review"),
  };
}
