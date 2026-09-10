import test from "node:test";
import assert from "node:assert/strict";
import { isHighOneKnowledgePoint, isHighTwoKnowledgePoint } from "../src/lib/curriculum.ts";

test("default curriculum includes high-one modules and excludes later content", () => {
  assert.equal(isHighOneKnowledgePoint("函数概念与性质"), true);
  assert.equal(isHighOneKnowledgePoint("概率"), true);
  assert.equal(isHighOneKnowledgePoint("导数及其应用"), false);
  assert.equal(isHighOneKnowledgePoint("圆锥曲线"), false);
});

test("quasi high-two scope includes later main modules", () => {
  assert.equal(isHighTwoKnowledgePoint("圆锥曲线"), true);
  assert.equal(isHighTwoKnowledgePoint("导数及其应用"), true);
  assert.equal(isHighTwoKnowledgePoint("综合与待细分"), false);
});
