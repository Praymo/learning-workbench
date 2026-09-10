export const sampleDemoQuestions = [
  {
    demoId: "set-intersection",
    demoNumber: "DEMO-01",
    questionType: "choice",
    stem: "已知集合 $A=\\{x\\mid x^2-x-2>0\\}$，$B=\\{x\\mid -1<x<3\\}$，则 $A\\cap B=$（  ）",
    options: ["$(-1,1)$", "$(2,3)$", "$(-1,1)\\cup(2,3)$", "$(1,2)$"],
    answer: "B",
    solution: "$A=(-\\infty,-1)\\cup(2,+\\infty)$，与 $B=(-1,3)$ 取交集得 $(2,3)$。",
    difficulty: "中档",
    primaryKnowledgePoint: "集合运算",
    relatedKnowledgePoints: ["一元二次不等式"],
    methodTags: ["解不等式", "交集"],
    targetScoreBand: "110-120 到 130+"
  },
  {
    demoId: "classical-probability",
    demoNumber: "DEMO-02",
    questionType: "choice",
    stem: "从 2 名男同学和 3 名女同学中任选 2 人参加活动，则选到的 2 人性别不同的概率为（  ）",
    options: ["$\\frac{1}{5}$", "$\\frac{2}{5}$", "$\\frac{3}{5}$", "$\\frac{4}{5}$"],
    answer: "C",
    solution: "总数为 $C_5^2=10$，性别不同有 $C_2^1C_3^1=6$，概率为 $\\frac{6}{10}=\\frac{3}{5}$。",
    difficulty: "基础",
    primaryKnowledgePoint: "古典概型",
    relatedKnowledgePoints: ["组合计数"],
    methodTags: ["样本空间", "组合计数"],
    targetScoreBand: "110-120 到 130+"
  },
  {
    demoId: "complement-event",
    demoNumber: "DEMO-03",
    questionType: "blank",
    stem: "若随机事件 $A$ 的概率为 $0.37$，则其对立事件 $\\overline A$ 的概率为______。",
    options: [],
    answer: "0.63",
    solution: "$P(\\overline A)=1-P(A)=0.63$。",
    difficulty: "基础",
    primaryKnowledgePoint: "对立事件",
    relatedKnowledgePoints: ["概率基本性质"],
    methodTags: ["补集", "范围检查"],
    targetScoreBand: "110-120 到 130+"
  },
  {
    demoId: "independent-events",
    demoNumber: "DEMO-04",
    questionType: "solution",
    stem: "甲、乙、丙三人各投篮一次，命中概率分别为 $\\frac{1}{2}$，$\\frac{2}{3}$，$\\frac{3}{4}$，且相互独立。求至少一人命中的概率。",
    options: [],
    answer: "$\\frac{23}{24}$",
    solution: "至少一人命中的对立事件是三人均未命中，概率为 $\\frac12\\cdot\\frac13\\cdot\\frac14=\\frac1{24}$，所以所求概率为 $1-\\frac1{24}=\\frac{23}{24}$。",
    difficulty: "中档",
    primaryKnowledgePoint: "补集思想",
    relatedKnowledgePoints: ["独立事件", "概率乘法"],
    methodTags: ["正难则反", "至少问题"],
    targetScoreBand: "110-120 到 130+"
  }
];
