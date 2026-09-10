import { difficultyBand, variationKey } from "./questionQuality.ts";

export type SelectionCandidate = {
  id: string;
  stem: string;
  questionType: string;
  primaryKnowledgePoint: string | null;
  relatedKnowledgePointsJson: string | null;
  methodTagsJson: string | null;
  contentHash: string | null;
  similarityKey: string | null;
  modelKey: string | null;
  difficultyScore: number | null;
  positionDifficulty: number | null;
  positionInSection: number | null;
  sectionSize: number | null;
  estimatedMinutes: number | null;
  score: number | null;
  createdAt: Date;
  usageCount: number;
};

export type SelectionResult = {
  selected: Array<{ question: SelectionCandidate; reason: string }>;
  summary: {
    requested: number;
    selected: number;
    excludedRecent: number;
    excludedDuplicate: number;
    excludedModel: number;
    excludedLatePosition: number;
    bandTargets: Record<string, number>;
    bandSelected: Record<string, number>;
    shortages: string[];
  };
};

function parseArray(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function qualityInput(question: SelectionCandidate) {
  return {
    stem: question.stem,
    questionType: question.questionType,
    primaryKnowledgePoint: question.primaryKnowledgePoint,
    relatedKnowledgePoints: parseArray(question.relatedKnowledgePointsJson),
    methodTags: parseArray(question.methodTagsJson),
  };
}

export type DifficultyProfile = "foundation_transition" | "balanced" | "advancing";

function targetsFor(limit: number, stability: boolean, profile: DifficultyProfile) {
  if (!stability) return { foundation: 0, core: 0, advanced: limit };
  const ratios = profile === "foundation_transition"
    ? { foundation: 0.5, advanced: 0.1 }
    : profile === "advancing"
      ? { foundation: 0.2, advanced: 0.35 }
      : { foundation: 0.3, advanced: 0.2 };
  const foundation = Math.round(limit * ratios.foundation);
  const advanced = Math.round(limit * ratios.advanced);
  return { foundation, core: Math.max(0, limit - foundation - advanced), advanced };
}

export function selectBalancedQuestions(
  candidates: SelectionCandidate[],
  input: { limit: number; targetMinutes: number; mode: string; recentQuestionIds: Set<string>; difficultyProfile?: DifficultyProfile },
): SelectionResult {
  const isStability = input.mode === "stability";
  const profile = input.difficultyProfile ?? "balanced";
  const minimumDifficulty = profile === "advancing" ? 1.8 : profile === "balanced" ? 1.5 : 0;
  const bandTargets = targetsFor(input.limit, isStability, profile);
  const bandSelected = { foundation: 0, core: 0, advanced: 0 };
  const selected: SelectionResult["selected"] = [];
  const recentFiltered = candidates.filter((question) => !input.recentQuestionIds.has(question.id));
  const excludedRecent = candidates.length - recentFiltered.length;
  const sorted = [...recentFiltered].sort((left, right) =>
    left.usageCount - right.usageCount ||
    (left.difficultyScore ?? 2.7) - (right.difficultyScore ?? 2.7) ||
    left.createdAt.getTime() - right.createdAt.getTime()
  );
  const usedContent = new Set<string>();
  const usedSimilarity = new Set<string>();
  const modelVariations = new Map<string, Set<string>>();
  const lateByType = new Map<string, number>();
  let totalMinutes = 0;
  let excludedDuplicate = 0;
  let excludedModel = 0;
  let excludedLatePosition = 0;

  function trySelect(question: SelectionCandidate, expectedBand?: string) {
    if ((question.difficultyScore ?? 2.7) < minimumDifficulty) return false;
    const band = difficultyBand(question.difficultyScore);
    if (band === "challenge") return false;
    if (expectedBand && band !== expectedBand) return false;
    const contentKey = question.contentHash || question.id;
    const similarityKey = question.similarityKey || contentKey;
    if (usedContent.has(contentKey) || usedSimilarity.has(similarityKey)) {
      excludedDuplicate += 1;
      return false;
    }

    const modelKey = question.modelKey || `${question.primaryKnowledgePoint ?? "待分类"}|常规方法`;
    const variations = modelVariations.get(modelKey) ?? new Set<string>();
    const variation = variationKey(qualityInput(question));
    if (variations.size >= 2 || (variations.size === 1 && variations.has(variation))) {
      excludedModel += 1;
      return false;
    }

    const isLate = (question.positionDifficulty ?? 0) >= 0.8;
    const lateOverall = selected.filter((item) => (item.question.positionDifficulty ?? 0) >= 0.8).length;
    const lateLimit = Math.max(1, Math.floor(input.limit * 0.25));
    if (isStability && isLate && (lateOverall >= lateLimit || (lateByType.get(question.questionType) ?? 0) >= 1)) {
      excludedLatePosition += 1;
      return false;
    }

    const minutes = question.estimatedMinutes ?? (question.questionType === "solution" ? 15 : 4);
    if (selected.length > 0 && totalMinutes + minutes > input.targetMinutes + 5) return false;

    usedContent.add(contentKey);
    usedSimilarity.add(similarityKey);
    variations.add(variation);
    modelVariations.set(modelKey, variations);
    if (isLate) lateByType.set(question.questionType, (lateByType.get(question.questionType) ?? 0) + 1);
    totalMinutes += minutes;
    const typedBand = band as keyof typeof bandSelected;
    bandSelected[typedBand] += 1;
    const position = question.positionInSection && question.sectionSize
      ? `原卷${question.questionType}第${question.positionInSection}/${question.sectionSize}位`
      : "原卷位置待核验";
    selected.push({
      question,
      reason: `${position}；难度${(question.difficultyScore ?? 2.7).toFixed(1)}；${band === "foundation" ? "基础稳定" : band === "core" ? "核心巩固" : "综合提升"}`,
    });
    return true;
  }

  for (const band of ["foundation", "core", "advanced"] as const) {
    for (const question of sorted) {
      if (selected.length >= input.limit || bandSelected[band] >= bandTargets[band]) break;
      if (selected.some((item) => item.question.id === question.id)) continue;
      trySelect(question, band);
    }
  }

  for (const question of sorted) {
    if (selected.length >= input.limit) break;
    if (selected.some((item) => item.question.id === question.id)) continue;
    trySelect(question);
  }

  const shortages = [];
  for (const band of ["foundation", "core", "advanced"] as const) {
    if (bandSelected[band] < bandTargets[band]) shortages.push(`${band}缺${bandTargets[band] - bandSelected[band]}题`);
  }
  if (selected.length < input.limit) shortages.push(`总题量缺${input.limit - selected.length}题`);

  return {
    selected,
    summary: {
      requested: input.limit,
      selected: selected.length,
      excludedRecent,
      excludedDuplicate,
      excludedModel,
      excludedLatePosition,
      bandTargets,
      bandSelected,
      shortages,
    },
  };
}
