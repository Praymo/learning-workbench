import test from "node:test";
import assert from "node:assert/strict";
import { examProfiles, questionTypeForPaper } from "../src/lib/examProfiles.ts";

test("exam profiles preserve the 2023 and 2024 structure change", () => {
  const legacy = examProfiles.find((profile) => profile.id === "new-gaokao-1-2020-2023-v1");
  const current = examProfiles.find((profile) => profile.id === "national-1-2024-plus-v1");
  assert.equal(legacy.sections.at(-1).end, 22);
  assert.equal(current.sections.at(-1).end, 19);
  assert.equal(current.sections.reduce((sum, section) => sum + section.totalScore, 0), 150);
});

test("question type inference distinguishes single and multiple choice", () => {
  assert.equal(questionTypeForPaper(2019, "新课标Ⅰ卷", 10), "single_choice");
  assert.equal(questionTypeForPaper(2023, "新高考Ⅰ卷", 10), "multiple_choice");
  assert.equal(questionTypeForPaper(2024, "全国Ⅰ卷数学", 12), "fill_blank");
  assert.equal(questionTypeForPaper(2024, "全国Ⅰ卷数学", 19), "solution");
});
