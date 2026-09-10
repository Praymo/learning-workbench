type KnowledgeRule = {
  name: string;
  patterns: RegExp[];
  methods?: string[];
};

const rules: KnowledgeRule[] = [
  { name: "复数", patterns: [/复数|共轭|虚部|实部|复平面|模长|\\bar\{z\}|z\s*=.*(?:i|\\mathrm\{i\})/], methods: ["代数运算"] },
  { name: "集合与常用逻辑用语", patterns: [/集合|交集|并集|补集|充分条件|必要条件|命题/], methods: ["集合运算", "逻辑判断"] },
  { name: "平面向量", patterns: [/向量|数量积|共线|垂直.*向量/], methods: ["向量运算"] },
  { name: "导数及其应用", patterns: [/导数|切线|f.?[′']|\\prime|极值点/], methods: ["导数", "单调性"] },
  { name: "指数函数与对数函数", patterns: [/指数函数|对数|\\log|\\ln|e\^|e\{|2\^x/], methods: ["函数转化"] },
  { name: "数列", patterns: [/数列|等差|等比|通项|前.*项和|S_n|a_n/], methods: ["递推", "求和"] },
  { name: "圆锥曲线", patterns: [/椭圆|双曲线|抛物线|焦点|离心率|准线/], methods: ["解析几何", "方程联立"] },
  { name: "直线与圆", patterns: [/圆的方程|圆心|半径|弦长|直线与圆|圆.*相切|相切.*圆/], methods: ["解析几何"] },
  { name: "立体几何", patterns: [/四面体|棱锥|棱柱|正方体|空间|二面角|平面.*垂直|平面.*平行|球面/], methods: ["空间关系", "空间向量"] },
  { name: "统计", patterns: [/统计|平均数|中位数|标准差|回归|相关系数|频数|列联表|独立性检验|抽样方法/], methods: ["数据分析"] },
  { name: "概率", patterns: [/概率|随机|事件|互斥|独立|分布列|数学期望|方差|正态分布|频率/], methods: ["样本空间", "概率模型"] },
  { name: "计数原理", patterns: [/排列|组合|计数原理|抽取|任选|选取.*个/], methods: ["分类计数"] },
  { name: "解三角形", patterns: [/三角形|余弦定理|正弦定理|面积.*sin|边长/], methods: ["正余弦定理"] },
  { name: "三角函数", patterns: [/三角函数|\\sin|\\cos|\\tan|正弦|余弦|周期.*角/], methods: ["三角恒等变换"] },
  { name: "函数概念与性质", patterns: [/函数|定义域|值域|单调|奇函数|偶函数|周期/], methods: ["函数性质"] },
  { name: "不等式", patterns: [/不等式|基本不等式|均值不等式|不等关系|最小值|最大值/], methods: ["范围与最值"] },
  { name: "数学建模与实际应用", patterns: [/利润|成本|产量|方案|实际|模型|估计|调查/], methods: ["数学建模"] }
];

export function classifyKnowledge(stem: string, solution = "") {
  const text = `${stem}\n${solution}`;
  const hits = rules.filter((rule) => rule.patterns.some((pattern) => pattern.test(text)));
  const primary = hits[0]?.name ?? "综合与待细分";
  const related = hits.slice(1, 4).map((hit) => hit.name);
  const methods = [...new Set(hits.flatMap((hit) => hit.methods ?? []))];
  const confidence = hits.length === 0 ? 0.25 : hits.length === 1 ? 0.72 : 0.82;
  return { primary, related, methods, confidence };
}
