import test from "node:test";
import assert from "node:assert/strict";
import { selectBalancedQuestions } from "../src/lib/practiceSelection.ts";

function candidate(id, overrides = {}) {
  return {
    id,
    stem: `题目${id}`,
    questionType: "single_choice",
    primaryKnowledgePoint: "函数",
    relatedKnowledgePointsJson: JSON.stringify([id]),
    methodTagsJson: JSON.stringify(["定义法"]),
    contentHash: `content-${id}`,
    similarityKey: `similar-${id}`,
    modelKey: "函数|定义法",
    difficultyScore: 2.6,
    positionDifficulty: 0.5,
    positionInSection: 4,
    sectionSize: 8,
    estimatedMinutes: 3,
    score: 5,
    createdAt: new Date(`2026-01-${String(Number(id.replace(/\D/g, "")) || 1).padStart(2, "0")}`),
    usageCount: 0,
    ...overrides,
  };
}

test("selection excludes recent and duplicate questions", () => {
  const result = selectBalancedQuestions([
    candidate("1"),
    candidate("2", { similarityKey: "similar-1" }),
    candidate("3"),
    candidate("4"),
  ], { limit: 3, targetMinutes: 30, mode: "stability", recentQuestionIds: new Set(["3"]) });
  assert.equal(result.summary.excludedRecent, 1);
  assert.equal(new Set(result.selected.map((item) => item.question.similarityKey)).size, result.selected.length);
});

test("stability selection limits late-position questions", () => {
  const candidates = Array.from({ length: 10 }, (_, index) => candidate(String(index + 1), {
    modelKey: `model-${index}`,
    difficultyScore: index < 3 ? 1.8 : index < 8 ? 2.6 : 3.6,
    positionDifficulty: index >= 6 ? 0.9 : 0.5,
  }));
  const result = selectBalancedQuestions(candidates, { limit: 8, targetMinutes: 40, mode: "stability", recentQuestionIds: new Set() });
  const late = result.selected.filter((item) => item.question.positionDifficulty >= 0.8);
  assert.ok(late.length <= 1);
  assert.ok(result.summary.bandSelected.foundation > 0);
  assert.ok(result.summary.bandSelected.core > 0);
});

test("foundation transition makes half of a stability set foundational", () => {
  const candidates = Array.from({ length: 20 }, (_, index) => candidate(String(index + 20), {
    modelKey: `foundation-model-${index}`,
    difficultyScore: index < 8 ? 1.6 : index < 16 ? 2.6 : 3.6,
  }));
  const result = selectBalancedQuestions(candidates, {
    limit: 10,
    targetMinutes: 50,
    mode: "stability",
    difficultyProfile: "foundation_transition",
    recentQuestionIds: new Set(),
  });
  assert.equal(result.summary.bandTargets.foundation, 5);
  assert.equal(result.summary.bandSelected.foundation, 5);
  assert.equal(result.summary.bandTargets.advanced, 1);
});

test("standard and advancing profiles skip pure recall difficulty", () => {
  const candidates = [
    candidate("90", { modelKey: "recall", difficultyScore: 1.1 }),
    candidate("91", { modelKey: "basic", difficultyScore: 1.6 }),
    candidate("92", { modelKey: "core", difficultyScore: 2.5 }),
  ];
  const balanced = selectBalancedQuestions(candidates, { limit: 2, targetMinutes: 20, mode: "stability", difficultyProfile: "balanced", recentQuestionIds: new Set() });
  assert.equal(balanced.selected.some((item) => item.question.id === "90"), false);
  const advancing = selectBalancedQuestions(candidates, { limit: 2, targetMinutes: 20, mode: "stability", difficultyProfile: "advancing", recentQuestionIds: new Set() });
  assert.equal(advancing.selected.some((item) => item.question.id === "91"), false);
});
