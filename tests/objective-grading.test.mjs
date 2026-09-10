import test from "node:test";
import assert from "node:assert/strict";
import { compareFillBlank, gradeObjective } from "../src/lib/objectiveGrading.ts";

test("single choice requires exactly one matching option", () => {
  assert.deepEqual(
    gradeObjective({ questionType: "single_choice", answer: "C", score: 5 }, "c"),
    { score: 5, maxScore: 5, correct: true, status: "correct" }
  );
  assert.equal(gradeObjective({ questionType: "single_choice", answer: "C", score: 5 }, "AC").score, 0);
});

test("multiple choice gives proportional partial credit only without wrong options", () => {
  const question = { questionType: "multiple_choice", answer: "A,C,D", score: 6 };
  assert.equal(gradeObjective(question, "ACD").score, 6);
  assert.equal(gradeObjective(question, "A").score, 2);
  assert.equal(gradeObjective(question, "AC").score, 4);
  assert.equal(gradeObjective(question, "AB").score, 0);
});

test("fill blank accepts equivalent decimal and fraction forms", () => {
  const question = { questionType: "fill_blank", answer: "\\frac{1}{2}", score: 5 };
  assert.equal(gradeObjective(question, "0.5").score, 5);
  assert.equal(gradeObjective(question, "2/3").score, 0);
});

test("fill blank compares roots and algebraic expressions locally", () => {
  assert.equal(compareFillBlank("\\sqrt{8}", "2\\sqrt{2}").equal, true);
  assert.equal(compareFillBlank("(x+1)^2", "x^2+2x+1").equal, true);
});

test("fill blank compares sets, intervals and ordered multi blanks", () => {
  assert.equal(compareFillBlank("\\{1,2,3\\}", "{3,1,2}").equal, true);
  assert.equal(compareFillBlank("(-\\infty,2]\\cup(3,+\\infty)", "(3,+∞)∪(-∞,2]").equal, true);
  assert.equal(compareFillBlank("2;;3", "2；3").equal, true);
  assert.equal(compareFillBlank("2;;3", "3；2").equal, false);
});

test("unsupported fill answers request review instead of being marked wrong", () => {
  const result = gradeObjective({ questionType: "fill_blank", answer: "所有满足条件的函数", score: 5 }, "另一种文字描述");
  assert.equal(result.status, "needs_review");
  assert.equal(result.score, null);
});
