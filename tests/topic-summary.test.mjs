import assert from "node:assert/strict";
import test from "node:test";
import { exponentialLogTopics } from "../src/lib/exponentialLogTopics.ts";
import { probabilityTopics } from "../src/lib/probabilityTopics.ts";
import { setsLogicTopics } from "../src/lib/setsLogicTopics.ts";
import { statisticsTopics } from "../src/lib/statisticsTopics.ts";
import { topicSummarySeeds } from "../src/lib/topicSummarySeed.ts";
import { trigonometryTopics } from "../src/lib/trigonometryTopics.ts";
import { functionTopics } from "../src/lib/functionTopics.ts";
import { vectorTopics } from "../src/lib/vectorTopics.ts";

test("专题种子具有唯一知识点和完整教学框架", () => {
  assert.equal(new Set(topicSummarySeeds.map((item) => item.knowledgePoint)).size, topicSummarySeeds.length);
  for (const item of topicSummarySeeds) {
    assert.ok(item.title.length > 4);
    assert.ok(item.summary.length > 12);
    assert.ok(item.framework.length >= 4);
    assert.ok(item.signals.length >= 4);
    assert.ok(item.errors.length >= 4);
    assert.ok(item.transfers.length >= 3);
  }
});

test("三角函数四个专题满足篇幅和例题数量要求", () => {
  assert.equal(trigonometryTopics.length, 4);
  assert.equal(new Set(trigonometryTopics.map((item) => item.slug)).size, 4);
  for (const item of trigonometryTopics) {
    const content = [
      item.subtitle,
      ...item.goals,
      ...item.sections.flatMap((section) => [section.title, ...section.paragraphs]),
      ...item.framework,
      ...item.errors,
      ...item.examples.flatMap((example) => [example.title, example.stem, example.answer, ...example.solution, example.takeaway]),
      item.summary,
    ].join("");
    assert.ok(content.length >= 1500 && content.length <= 2500, `${item.title} 当前为 ${content.length} 字符`);
    assert.ok(item.examples.length >= 3 && item.examples.length <= 5);
    assert.ok(item.examples.every((example) => example.answer && example.solution.length >= 2));
  }
});

test("函数四个专题按单知识点配置六道分层变式", () => {
  assert.equal(functionTopics.length, 4);
  for (const item of functionTopics) {
    const content = [item.subtitle, ...item.goals, ...item.sections.flatMap((section) => [section.title, ...section.paragraphs]), ...item.framework, ...item.errors, ...item.examples.flatMap((example) => [example.title, example.stem, example.answer, ...example.solution, example.takeaway, example.advancedNote ?? ""]), item.summary].join("");
    assert.ok(content.length >= 2600, `${item.title} 当前仅 ${content.length} 字符`);
    assert.equal(item.examples.length, 6);
    assert.ok(item.examples.every((example) => example.solution.length >= 2));
  }
});

test("其余五个主干模块提供十五个完整知识点页面", () => {
  const groups = [setsLogicTopics, exponentialLogTopics, vectorTopics, probabilityTopics, statisticsTopics];
  assert.equal(groups.flat().length, 15);
  assert.equal(new Set(groups.flat().map((item) => item.slug)).size, 15);
  for (const item of groups.flat()) {
    const content = [item.subtitle, ...item.goals, ...item.sections.flatMap((section) => [section.title, ...section.paragraphs]), ...item.framework, ...item.errors, ...item.examples.flatMap((example) => [example.title, example.stem, example.answer, ...example.solution, example.takeaway, example.advancedNote ?? ""]), item.summary].join("");
    assert.ok(content.length >= 1500, `${item.title} 当前仅 ${content.length} 字符`);
    assert.equal(item.examples.length, 5, `${item.title} 应有五道分层题`);
    assert.ok(item.examples.every((example) => example.answer && example.solution.length >= 2));
    const hasUnexpectedControl = [...content].some((character) => {
      const code = character.charCodeAt(0);
      return code < 32 && ![9, 10, 13].includes(code);
    });
    assert.equal(hasUnexpectedControl, false, `${item.title} 包含字符串转义控制字符`);
  }
});

test("新增专题中的关键综合题答案与已核算结论一致", () => {
  const all = [setsLogicTopics, exponentialLogTopics, vectorTopics, probabilityTopics, statisticsTopics].flat().flatMap((topic) => topic.examples);
  const answer = (title) => all.find((example) => example.title === title)?.answer;
  assert.equal(answer("子集参数与空集分支"), "$a\\in[0,3]$。");
  assert.equal(answer("指数与线性函数交点"), "有两个实根，其中整数根为 $x=2$；另一个根在 $(-2,-1)$ 内。");
  assert.equal(answer("共线参数"), "$R$ 始终在直线 $PQ$ 上；在线段上时 $1\\le t\\le2$。");
  assert.equal(answer("随机参数与方程根"), "$\\frac13$。");
  assert.equal(answer("分组均值估计"), "$18$。");
});
