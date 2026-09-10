import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateDifficulty,
  contentFingerprint,
  modelFingerprint,
  similarityFingerprint,
} from "../src/lib/questionQuality.ts";

test("fingerprints ignore layout and identify parameter variants", () => {
  assert.equal(contentFingerprint("1. 已知  x = 2，求 x^2"), contentFingerprint("已知x=2,求x^2"));
  assert.equal(similarityFingerprint("已知 x=2，求 x^2"), similarityFingerprint("已知 x=5，求 x^2"));
  assert.notEqual(contentFingerprint("已知 x=2，求 x^2"), contentFingerprint("已知 x=5，求 x^2"));
});

test("choice options participate in duplicate fingerprints", () => {
  const left = similarityFingerprint("下列说法正确的是\nA.函数单调递增\nB.函数为偶函数");
  const right = similarityFingerprint("下列说法正确的是\nA.直线互相垂直\nB.直线互相平行");
  assert.notEqual(left, right);
});

test("position score makes the final objective question harder", () => {
  const first = calculateDifficulty({ stem: "", questionType: "single_choice", questionNumber: 1, year: 2024, paperType: "全国Ⅰ卷" });
  const last = calculateDifficulty({ stem: "", questionType: "single_choice", questionNumber: 8, year: 2024, paperType: "全国Ⅰ卷" });
  assert.equal(first.positionInSection, 1);
  assert.equal(last.positionInSection, 8);
  assert.ok(last.difficultyScore > first.difficultyScore);
  assert.ok(last.difficultyScore <= 5);
});

test("model fingerprint groups questions by knowledge and method", () => {
  const left = modelFingerprint({ stem: "求概率", questionType: "single_choice", primaryKnowledgePoint: "概率", methodTags: ["补集思想"] });
  const right = modelFingerprint({ stem: "至少一个发生", questionType: "solution", primaryKnowledgePoint: "概率", methodTags: ["补集思想"] });
  assert.equal(left, right);
});
