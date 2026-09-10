import test from "node:test";
import assert from "node:assert/strict";
import { datasetStream, matchPdfEvidence, paperFamily } from "../src/lib/pdfEvidenceMatching.ts";

const sources = [
  { id: "i-science", year: 2019, name: "2019全国1理.pdf", paperType: "全国1理", localPath: "/普通高考/2019/2019全国1理.pdf" },
  { id: "i-arts", year: 2019, name: "2019全国1文.pdf", paperType: "全国1文", localPath: "/普通高考/2019/2019全国1文.pdf" },
  { id: "iii-science", year: 2020, name: "2020全国3理.pdf", paperType: "全国3理", localPath: "/普通高考/2020/2020全国3理.pdf" },
  { id: "new-i", year: 2020, name: "2020新高考1.pdf", paperType: "新高考1", localPath: "/普通高考/2020/2020新高考1.pdf" }
];

test("paper families normalize roman and Arabic paper labels", () => {
  assert.equal(paperFamily("新课标Ⅰ卷"), "national-1");
  assert.equal(paperFamily("全国卷Ⅲ"), "national-3");
  assert.equal(paperFamily("全国乙卷"), "national-b");
});

test("dataset stream separates arts and science papers", () => {
  assert.equal(datasetStream("GAOKAO-Bench/Objective_Questions/2010-2022_Math_I_MCQs.json"), "理");
  assert.equal(datasetStream("GAOKAO-Bench/Objective_Questions/2010-2022_Math_II_MCQs.json"), "文");
});

test("structured questions match one original PDF without guessing", () => {
  const result = matchPdfEvidence({ year: 2019, paperType: "新课标Ⅰ卷", sourceDataset: "GAOKAO-Bench/Math_I.json" }, sources);
  assert.equal(result.status, "matched");
  assert.equal(result.source.id, "i-science");

  const third = matchPdfEvidence({ year: 2020, paperType: "全国卷Ⅲ", sourceDataset: "GAOKAO-Bench/Math_I.json" }, sources);
  assert.equal(third.status, "matched");
  assert.equal(third.source.id, "iii-science");
});
