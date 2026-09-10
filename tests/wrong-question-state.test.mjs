import assert from "node:assert/strict";
import test from "node:test";
import { nextWrongQuestionState } from "../src/lib/wrongQuestionState.ts";

const now = new Date("2026-07-12T00:00:00.000Z");

test("首次答错进入三天后复查", () => {
  const state = nextWrongQuestionState({ isCorrect: false, now });
  assert.equal(state.wrongCount, 1);
  assert.equal(state.correctStreak, 0);
  assert.equal(state.status, "needs_review");
  assert.equal(state.nextReviewAt.toISOString(), "2026-07-15T00:00:00.000Z");
});

test("再次答错累计错误并清空正确连续次数", () => {
  const state = nextWrongQuestionState({ isCorrect: false, previousWrongCount: 2, previousCorrectStreak: 1, now });
  assert.equal(state.wrongCount, 3);
  assert.equal(state.correctStreak, 0);
});

test("连续两次复查正确才标记稳定", () => {
  const first = nextWrongQuestionState({ isCorrect: true, previousWrongCount: 2, previousCorrectStreak: 0, now });
  assert.equal(first.status, "reviewing");
  assert.equal(first.nextReviewAt.toISOString(), "2026-07-19T00:00:00.000Z");
  const second = nextWrongQuestionState({ isCorrect: true, previousWrongCount: 2, previousCorrectStreak: first.correctStreak, now });
  assert.equal(second.status, "mastered");
  assert.equal(second.nextReviewAt.toISOString(), "2026-07-26T00:00:00.000Z");
});
