import test from "node:test";
import assert from "node:assert/strict";
import { foundationQuestions, validateFoundationQuestion } from "../src/lib/foundationQuestions.ts";
import { highOneCoreQuestions, validateHighOneCoreQuestion } from "../src/lib/highOneCoreQuestions.ts";
import { contentFingerprint, similarityFingerprint } from "../src/lib/questionQuality.ts";

test("foundation bank contains valid, distinct high-one questions", () => {
  assert.ok(foundationQuestions.length >= 30);
  const ids = new Set();
  const exact = new Set();
  const similar = new Set();
  for (const question of foundationQuestions) {
    assert.deepEqual(validateFoundationQuestion(question), [], question.id);
    assert.ok(!ids.has(question.id), `duplicate id: ${question.id}`);
    ids.add(question.id);
    const fullText = [question.stem, ...(question.options ?? [])].join("\n");
    const content = contentFingerprint(fullText);
    const similarity = similarityFingerprint(fullText);
    assert.ok(!exact.has(content), `exact duplicate: ${question.id}`);
    assert.ok(!similar.has(similarity), `near duplicate: ${question.id}`);
    exact.add(content);
    similar.add(similarity);
  }
});

test("high-one core bank adds distinct low-mid questions with rubrics", () => {
  assert.ok(highOneCoreQuestions.length >= 24);
  const ids = new Set();
  const exact = new Set();
  const similar = new Set();
  const types = new Set();
  for (const question of highOneCoreQuestions) {
    assert.deepEqual(validateHighOneCoreQuestion(question), [], question.id);
    assert.ok(!ids.has(question.id), `duplicate id: ${question.id}`);
    ids.add(question.id);
    types.add(question.questionType);
    const fullText = [question.stem, ...(question.options ?? [])].join("\n");
    const content = contentFingerprint(fullText);
    const similarity = similarityFingerprint(fullText);
    assert.ok(!exact.has(content), `exact duplicate: ${question.id}`);
    assert.ok(!similar.has(similarity), `near duplicate: ${question.id}`);
    exact.add(content);
    similar.add(similarity);
    if (question.questionType === "solution") {
      assert.ok(question.rubric?.length >= 3, `missing rubric: ${question.id}`);
    }
  }
  assert.deepEqual([...types].sort(), ["fill_blank", "multiple_choice", "single_choice", "solution"]);
});
