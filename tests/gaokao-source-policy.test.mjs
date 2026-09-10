import test from "node:test";
import assert from "node:assert/strict";
import {
  isAutumnGaokaoLabel,
  isTargetGaokaoMathPdf,
  normalizeGaokaoPaperType
} from "../src/lib/gaokaoSourcePolicy.ts";

test("all autumn gaokao math papers in the ten-year window are retained", () => {
  const root = "/data/sources/gaokaomath/普通高考";
  assert.equal(isTargetGaokaoMathPdf(`${root}/2022/2022北京.pdf`), true);
  assert.equal(isTargetGaokaoMathPdf(`${root}/2022/2022上海.pdf`), true);
  assert.equal(isTargetGaokaoMathPdf(`${root}/2020/2020全国3理.pdf`), true);
  assert.equal(isTargetGaokaoMathPdf(`${root}/2016/2016新课标2文.pdf`), true);
  assert.equal(isTargetGaokaoMathPdf(`${root}/2026/2026全国1.pdf`), true);
});

test("non-autumn and out-of-window papers remain excluded", () => {
  const root = "/data/sources/gaokaomath/普通高考";
  assert.equal(isAutumnGaokaoLabel("2025春季高考数学.pdf"), false);
  assert.equal(isTargetGaokaoMathPdf(`${root}/2025/2025职教高考数学.pdf`), false);
  assert.equal(isTargetGaokaoMathPdf(`${root}/2015/2015北京理.pdf`), false);
  assert.equal(isTargetGaokaoMathPdf("/data/sources/其他/2024北京.pdf"), false);
});

test("paper type keeps the actual regional or national paper label", () => {
  assert.equal(normalizeGaokaoPaperType("2022北京.pdf"), "北京");
  assert.equal(normalizeGaokaoPaperType("2020全国3理(云南等).pdf"), "全国3理");
  assert.equal(normalizeGaokaoPaperType("2024新高考1(山东,广东).pdf"), "新高考1");
});
