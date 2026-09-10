import { basename } from "node:path";

export const GAOKAO_SOURCE_START_YEAR = 2016;
export const GAOKAO_SOURCE_END_YEAR = 2026;

const nonAutumnExamPatterns = [
  /春季/,
  /职教/,
  /高职/,
  /分类考试/,
  /单招/,
  /成人高考/,
  /专升本/
];

export function parseGaokaoYear(value: string) {
  const match = value.match(/20\d{2}/);
  return match ? Number(match[0]) : undefined;
}

export function isAutumnGaokaoLabel(value: string) {
  return !nonAutumnExamPatterns.some((pattern) => pattern.test(value));
}

export function isTargetGaokaoMathPdf(filePath: string) {
  const name = basename(filePath);
  const year = parseGaokaoYear(name);

  if (!name.toLowerCase().endsWith(".pdf")) return false;
  if (!year || year < GAOKAO_SOURCE_START_YEAR || year > GAOKAO_SOURCE_END_YEAR) return false;
  if (!filePath.includes("普通高考")) return false;
  return isAutumnGaokaoLabel(name);
}

export function normalizeGaokaoPaperType(fileName: string) {
  return basename(fileName)
    .replace(/\.pdf$/i, "")
    .replace(/^20\d{2}/, "")
    .replace(/\([^)]*\)|（[^）]*）/g, "")
    .trim() || "普通高考数学卷";
}
