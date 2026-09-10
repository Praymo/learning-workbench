export type ExamSectionRule = {
  key: "single_choice" | "multiple_choice" | "fill_blank" | "solution";
  label: string;
  start: number;
  end: number;
  totalScore: number;
};

export type ExamProfileDefinition = {
  id: string;
  name: string;
  year: number;
  paperType: string;
  totalScore: number;
  durationMinutes: number;
  sections: ExamSectionRule[];
  scoringRules: Record<string, unknown>;
};

const legacySections: ExamSectionRule[] = [
  { key: "single_choice", label: "单项选择题", start: 1, end: 8, totalScore: 40 },
  { key: "multiple_choice", label: "多项选择题", start: 9, end: 12, totalScore: 20 },
  { key: "fill_blank", label: "填空题", start: 13, end: 16, totalScore: 20 },
  { key: "solution", label: "解答题", start: 17, end: 22, totalScore: 70 }
];

const currentSections: ExamSectionRule[] = [
  { key: "single_choice", label: "单项选择题", start: 1, end: 8, totalScore: 40 },
  { key: "multiple_choice", label: "多项选择题", start: 9, end: 11, totalScore: 18 },
  { key: "fill_blank", label: "填空题", start: 12, end: 14, totalScore: 15 },
  { key: "solution", label: "解答题", start: 15, end: 19, totalScore: 77 }
];

export const examProfiles: ExamProfileDefinition[] = [
  {
    id: "new-gaokao-1-2020-2023-v1",
    name: "2020-2023 新高考全国Ⅰ卷数学",
    year: 2023,
    paperType: "新高考Ⅰ卷数学",
    totalScore: 150,
    durationMinutes: 120,
    sections: legacySections,
    scoringRules: {
      multipleChoice: "全部选对得满分，部分选对得部分分，有选错得0分",
      source: "按具体试卷说明保存，不跨年份硬编码"
    }
  },
  {
    id: "national-1-2024-plus-v1",
    name: "2024起全国Ⅰ卷数学",
    year: 2024,
    paperType: "全国Ⅰ卷数学",
    totalScore: 150,
    durationMinutes: 120,
    sections: currentSections,
    scoringRules: {
      multipleChoice: "3题，每题6分；部分正确按正确选项数量给分，有错选得0分",
      solution: "5道解答题共77分，逐小问和评分点给分"
    }
  }
];

export function questionTypeForPaper(year: number, paperType: string, questionNumber?: number) {
  if (!questionNumber) return undefined;
  const isNewPaper = year >= 2020 && /新课标|新高考|全国Ⅰ|全国1/.test(paperType);
  if (!isNewPaper) return questionNumber <= 12 ? "single_choice" : questionNumber <= 16 ? "fill_blank" : "solution";
  const sections = year >= 2024 ? currentSections : legacySections;
  return sections.find((section) => questionNumber >= section.start && questionNumber <= section.end)?.key;
}
