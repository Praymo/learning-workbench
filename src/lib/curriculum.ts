export const HIGH_ONE_KNOWLEDGE_POINTS = [
  "集合与常用逻辑用语",
  "集合运算",
  "不等式",
  "函数概念与性质",
  "指数函数与对数函数",
  "三角函数",
  "平面向量",
  "复数",
  "立体几何",
  "统计",
  "概率",
  "古典概型",
  "对立事件",
  "补集思想",
] as const;

export const HIGH_TWO_KNOWLEDGE_POINTS = [
  ...HIGH_ONE_KNOWLEDGE_POINTS,
  "解三角形",
  "数列",
  "直线与圆",
  "圆锥曲线",
  "计数原理",
  "导数及其应用",
  "数学建模与实际应用",
] as const;

export function isHighOneKnowledgePoint(value: string | null | undefined) {
  return Boolean(value && (HIGH_ONE_KNOWLEDGE_POINTS as readonly string[]).includes(value));
}

export function isHighTwoKnowledgePoint(value: string | null | undefined) {
  return Boolean(value && (HIGH_TWO_KNOWLEDGE_POINTS as readonly string[]).includes(value));
}
