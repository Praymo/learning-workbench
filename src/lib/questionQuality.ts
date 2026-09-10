import { createHash } from "node:crypto";

export const DIFFICULTY_VERSION = "position-v1";

export type QuestionQualityInput = {
  stem: string;
  questionType: string;
  primaryKnowledgePoint?: string | null;
  relatedKnowledgePoints?: string[];
  methodTags?: string[];
  questionNumber?: number | null;
  year?: number | null;
  paperType?: string | null;
  sourceType?: string | null;
  parentDifficultyScore?: number | null;
};

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function normalizeQuestionText(value: string, replaceNumbers = false) {
  let normalized = value
    .normalize("NFKC")
    .replace(/^\s*(?:第\s*)?\d+\s*[.、．)]\s*/, "")
    .replace(/\\left|\\right/g, "")
    .replace(/[\s，。；：,.!?！？;:（）()【】]+/g, "")
    .toLowerCase();
  if (replaceNumbers) {
    normalized = normalized
      .replace(/\\frac\{[^{}]+\}\{[^{}]+\}/g, "#")
      .replace(/-?\d+(?:\.\d+)?/g, "#")
      .replace(/#+/g, "#");
  }
  return normalized;
}

export function contentFingerprint(stem: string) {
  return digest(normalizeQuestionText(stem));
}

export function similarityFingerprint(stem: string) {
  return digest(normalizeQuestionText(stem, true));
}

function questionIntent(stem: string) {
  const rules: Array<[RegExp, string]> = [
    [/证明|求证/, "证明"],
    [/最大值|最小值|最值/, "最值"],
    [/取值范围|范围是|范围为/, "范围"],
    [/概率|频率/, "概率"],
    [/个数|多少种|共有多少/, "计数"],
    [/面积|体积|距离|长度/, "度量"],
    [/夹角|角的大小/, "角度"],
    [/方程|解析式/, "方程"],
    [/判断|是否|正确的是/, "判断"],
  ];
  return rules.find(([pattern]) => pattern.test(stem))?.[1] ?? "常规求解";
}

export function modelFingerprint(input: QuestionQualityInput) {
  const methods = [...new Set(input.methodTags ?? [])].sort().join("+") || "常规方法";
  return [input.primaryKnowledgePoint || "待分类", methods].join("|");
}

export function variationKey(input: QuestionQualityInput) {
  const related = [...new Set(input.relatedKnowledgePoints ?? [])].sort().join("+") || "无关联";
  return [input.questionType, questionIntent(input.stem), related].join("|");
}

export function sectionBounds(year: number | null | undefined, paperType: string | null | undefined, questionType: string) {
  const isCurrent = Boolean(year && year >= 2024 && /全国.?[Ⅰ1一]|新高考/.test(paperType ?? ""));
  const isNewGaokao = Boolean(year && year >= 2020 && /新课标|新高考|全国.?[Ⅰ1一]/.test(paperType ?? ""));
  const sections: Record<string, [number, number]> = isCurrent
    ? { single_choice: [1, 8], multiple_choice: [9, 11], fill_blank: [12, 14], solution: [15, 19] }
    : isNewGaokao
      ? { single_choice: [1, 8], multiple_choice: [9, 12], fill_blank: [13, 16], solution: [17, 22] }
      : { single_choice: [1, 12], fill_blank: [13, 16], solution: [17, 22] };
  return sections[questionType];
}

function positionBaseScore(position: number) {
  if (position <= 0.3) return 1.5 + (position / 0.3) * 0.7;
  if (position <= 0.7) return 2.3 + ((position - 0.3) / 0.4) * 0.9;
  return 3.3 + ((position - 0.7) / 0.3) * 0.9;
}

export function calculateDifficulty(input: QuestionQualityInput) {
  const bounds = sectionBounds(input.year, input.paperType, input.questionType);
  const number = input.questionNumber ?? undefined;
  let positionInSection: number | null = null;
  let sectionSize: number | null = null;
  let positionDifficulty: number | null = null;
  let score = input.parentDifficultyScore ?? 2.7;

  if (bounds && number && number >= bounds[0] && number <= bounds[1]) {
    positionInSection = number - bounds[0] + 1;
    sectionSize = bounds[1] - bounds[0] + 1;
    positionDifficulty = sectionSize === 1 ? 0.5 : (positionInSection - 1) / (sectionSize - 1);
    score = positionBaseScore(positionDifficulty);
    if (positionInSection === sectionSize) score += 0.4;
  }

  const relatedCount = new Set(input.relatedKnowledgePoints ?? []).size;
  if (relatedCount >= 3) score += 0.5;
  else if (relatedCount >= 1) score += 0.3;

  return {
    originalQuestionNumber: number ?? null,
    sectionType: input.questionType,
    positionInSection,
    sectionSize,
    positionDifficulty,
    difficultyScore: Math.round(Math.max(1, Math.min(5, score)) * 10) / 10,
    difficultyVersion: DIFFICULTY_VERSION,
  };
}

export function difficultyBand(score: number | null | undefined) {
  if ((score ?? 2.7) <= 2) return "foundation";
  if ((score ?? 2.7) <= 3) return "core";
  if ((score ?? 2.7) <= 4) return "advanced";
  return "challenge";
}
