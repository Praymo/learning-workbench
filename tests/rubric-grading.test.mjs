import test from "node:test";
import assert from "node:assert/strict";
import { normalizePointGrades, rubricIsDetailed } from "../src/lib/rubricGrading.ts";

const rubric = [
  { id: "r1", order: 1, rubricCode: "P1", points: 3, evidenceRequired: "写出公式" },
  { id: "r2", order: 2, rubricCode: "P2", points: 2, evidenceRequired: "得到结论" },
];

test("only detailed rubrics can be sent to model grading", () => {
  assert.equal(rubricIsDetailed(rubric), true);
  assert.equal(rubricIsDetailed([{ ...rubric[0], evidenceRequired: null }]), false);
});

test("point grading clamps scores and requires evidence", () => {
  const result = normalizePointGrades(rubric, [
    { rubricPointId: "r1", awardedPoints: 8, evidenceText: "第2行写出公式", confidence: 0.9 },
    { rubricPointId: "r2", awardedPoints: 2, evidenceText: "", confidence: 0.9 },
  ]);
  assert.equal(result.score, 5);
  assert.equal(result.rows[0].awardedPoints, 3);
  assert.equal(result.needsReview, true);
});
