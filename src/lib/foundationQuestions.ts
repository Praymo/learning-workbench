export type FoundationQuestion = {
  id: string;
  questionType: "single_choice" | "fill_blank";
  stem: string;
  options?: string[];
  answer: string;
  solution: string;
  primaryKnowledgePoint: string;
  relatedKnowledgePoints?: string[];
  methodTags: string[];
  difficultyScore: number;
  estimatedMinutes: number;
};

export const foundationQuestions: FoundationQuestion[] = [
  {
    id: "set-intersection-01", questionType: "single_choice", primaryKnowledgePoint: "集合与常用逻辑用语",
    stem: "已知集合 $A=\\{1,2,3\\}$，$B=\\{2,3,4\\}$，则 $A\\cap B=$（　）",
    options: ["A. $\\{1,4\\}$", "B. $\\{2,3\\}$", "C. $\\{1,2,3,4\\}$", "D. $\\varnothing$"], answer: "B",
    solution: "交集由同时属于 $A$ 和 $B$ 的元素组成，因此 $A\\cap B=\\{2,3\\}$。", methodTags: ["交集定义"], difficultyScore: 1.2, estimatedMinutes: 2,
  },
  {
    id: "set-union-01", questionType: "fill_blank", primaryKnowledgePoint: "集合与常用逻辑用语",
    stem: "已知 $A=\\{1,2\\}$，$B=\\{2,3\\}$，则 $A\\cup B=$______。", answer: "\\{1,2,3\\}",
    solution: "并集包含至少属于两个集合之一的元素，重复元素只写一次，所以为 $\\{1,2,3\\}$。", methodTags: ["并集定义", "去重"], difficultyScore: 1.3, estimatedMinutes: 2,
  },
  {
    id: "set-complement-01", questionType: "single_choice", primaryKnowledgePoint: "集合与常用逻辑用语",
    stem: "全集 $U=\\{1,2,3,4,5\\}$，$A=\\{1,3,5\\}$，则 $\\complement_U A=$（　）",
    options: ["A. $\\{1,3,5\\}$", "B. $\\{2,4\\}$", "C. $\\{1,2,3,4,5\\}$", "D. $\\varnothing$"], answer: "B",
    solution: "$U$ 中不属于 $A$ 的元素是 $2,4$，所以补集为 $\\{2,4\\}$。", methodTags: ["补集定义"], difficultyScore: 1.4, estimatedMinutes: 2,
  },
  {
    id: "set-subset-count-01", questionType: "fill_blank", primaryKnowledgePoint: "集合与常用逻辑用语",
    stem: "集合 $\\{a,b,c\\}$ 的子集个数为______。", answer: "8",
    solution: "含 $3$ 个元素的集合有 $2^3=8$ 个子集。", methodTags: ["子集计数"], difficultyScore: 1.7, estimatedMinutes: 2,
  },
  {
    id: "function-value-01", questionType: "fill_blank", primaryKnowledgePoint: "函数概念与性质",
    stem: "已知 $f(x)=2x^2-1$，则 $f(2)=$______。", answer: "7",
    solution: "直接代入：$f(2)=2\\times2^2-1=7$。", methodTags: ["函数值代入"], difficultyScore: 1.2, estimatedMinutes: 2,
  },
  {
    id: "function-domain-root-01", questionType: "single_choice", primaryKnowledgePoint: "函数概念与性质",
    stem: "函数 $f(x)=\\sqrt{x-2}$ 的定义域为（　）",
    options: ["A. $(-\\infty,2)$", "B. $(-\\infty,2]$", "C. $[2,+\\infty)$", "D. $(2,+\\infty)$"], answer: "C",
    solution: "根式有意义需要 $x-2\\ge0$，即 $x\\ge2$。", methodTags: ["根式定义域"], difficultyScore: 1.5, estimatedMinutes: 3,
  },
  {
    id: "function-domain-fraction-01", questionType: "fill_blank", primaryKnowledgePoint: "函数概念与性质",
    stem: "函数 $f(x)=\\dfrac{1}{x+3}$ 的定义域为______。", answer: "(-\\infty,-3)\\cup(-3,+\\infty)",
    solution: "分母不能为零，所以 $x\\ne-3$，定义域为 $(-\\infty,-3)\\cup(-3,+\\infty)$。", methodTags: ["分式定义域"], difficultyScore: 1.6, estimatedMinutes: 3,
  },
  {
    id: "function-parity-01", questionType: "single_choice", primaryKnowledgePoint: "函数概念与性质",
    stem: "下列函数中为偶函数的是（　）",
    options: ["A. $f(x)=x^3$", "B. $f(x)=x^2+1$", "C. $f(x)=x+1$", "D. $f(x)=2^x$"], answer: "B",
    solution: "对 $f(x)=x^2+1$，有 $f(-x)=(-x)^2+1=f(x)$，所以它是偶函数。", methodTags: ["奇偶性定义"], difficultyScore: 1.8, estimatedMinutes: 3,
  },
  {
    id: "function-linear-monotonic-01", questionType: "single_choice", primaryKnowledgePoint: "函数概念与性质",
    stem: "函数 $f(x)=-2x+3$ 在 $\\mathbb R$ 上（　）",
    options: ["A. 单调递增", "B. 单调递减", "C. 先增后减", "D. 不是单调函数"], answer: "B",
    solution: "一次函数斜率为 $-2<0$，所以在 $\\mathbb R$ 上单调递减。", methodTags: ["一次函数单调性"], difficultyScore: 1.5, estimatedMinutes: 2,
  },
  {
    id: "exponent-value-01", questionType: "fill_blank", primaryKnowledgePoint: "指数函数与对数函数",
    stem: "$2^{-3}=$______。", answer: "\\frac{1}{8}",
    solution: "$2^{-3}=\\dfrac{1}{2^3}=\\dfrac18$。", methodTags: ["负整数指数"], difficultyScore: 1.2, estimatedMinutes: 2,
  },
  {
    id: "log-value-01", questionType: "fill_blank", primaryKnowledgePoint: "指数函数与对数函数",
    stem: "$\\log_2 8=$______。", answer: "3",
    solution: "因为 $2^3=8$，所以 $\\log_2 8=3$。", methodTags: ["对数定义"], difficultyScore: 1.2, estimatedMinutes: 2,
  },
  {
    id: "exponent-equation-01", questionType: "single_choice", primaryKnowledgePoint: "指数函数与对数函数",
    stem: "若 $3^x=27$，则 $x=$（　）", options: ["A. $2$", "B. $3$", "C. $6$", "D. $9$"], answer: "B",
    solution: "$27=3^3$，由 $3^x=3^3$ 得 $x=3$。", methodTags: ["同底指数方程"], difficultyScore: 1.4, estimatedMinutes: 2,
  },
  {
    id: "log-equation-01", questionType: "fill_blank", primaryKnowledgePoint: "指数函数与对数函数",
    stem: "若 $\\log_3 x=2$，则 $x=$______。", answer: "9",
    solution: "由对数定义得 $x=3^2=9$。", methodTags: ["对数方程", "指数对数互化"], difficultyScore: 1.5, estimatedMinutes: 2,
  },
  {
    id: "trig-identity-01", questionType: "fill_blank", primaryKnowledgePoint: "三角函数",
    stem: "已知角 $\\alpha$ 为第一象限角，且 $\\sin\\alpha=\\frac35$，则 $\\cos\\alpha=$______。", answer: "\\frac{4}{5}",
    solution: "由 $\\sin^2\\alpha+\\cos^2\\alpha=1$ 得 $|\\cos\\alpha|=\\frac45$；第一象限余弦为正，所以为 $\\frac45$。", methodTags: ["同角三角函数关系", "象限符号"], difficultyScore: 1.9, estimatedMinutes: 3,
  },
  {
    id: "trig-quadrant-sign-01", questionType: "single_choice", primaryKnowledgePoint: "三角函数",
    stem: "若 $\\alpha$ 是第二象限角，则下列结论正确的是（　）",
    options: ["A. $\\sin\\alpha<0$", "B. $\\cos\\alpha>0$", "C. $\\tan\\alpha<0$", "D. $\\sin\\alpha\\cos\\alpha>0$"], answer: "C",
    solution: "第二象限正弦为正、余弦为负，因此正切为负。", methodTags: ["象限符号"], difficultyScore: 1.6, estimatedMinutes: 2,
  },
  {
    id: "vector-add-01", questionType: "fill_blank", primaryKnowledgePoint: "平面向量",
    stem: "已知 $\\vec a=(1,2)$，$\\vec b=(3,-1)$，则 $\\vec a+\\vec b=$______。", answer: "(4,1)",
    solution: "向量坐标对应相加：$(1+3,2-1)=(4,1)$。", methodTags: ["向量坐标运算"], difficultyScore: 1.2, estimatedMinutes: 2,
  },
  {
    id: "vector-dot-01", questionType: "fill_blank", primaryKnowledgePoint: "平面向量",
    stem: "已知 $\\vec a=(2,1)$，$\\vec b=(1,3)$，则 $\\vec a\\cdot\\vec b=$______。", answer: "5",
    solution: "$\\vec a\\cdot\\vec b=2\\times1+1\\times3=5$。", methodTags: ["向量数量积"], difficultyScore: 1.4, estimatedMinutes: 2,
  },
  {
    id: "vector-length-01", questionType: "single_choice", primaryKnowledgePoint: "平面向量",
    stem: "向量 $\\vec a=(3,4)$ 的模为（　）", options: ["A. $3$", "B. $4$", "C. $5$", "D. $7$"], answer: "C",
    solution: "$|\\vec a|=\\sqrt{3^2+4^2}=5$。", methodTags: ["向量模"], difficultyScore: 1.3, estimatedMinutes: 2,
  },
  {
    id: "vector-perpendicular-01", questionType: "single_choice", primaryKnowledgePoint: "平面向量",
    stem: "若非零向量 $\\vec a,\\vec b$ 满足 $\\vec a\\cdot\\vec b=0$，则（　）",
    options: ["A. $\\vec a\\parallel\\vec b$", "B. $\\vec a\\perp\\vec b$", "C. $|\\vec a|=|\\vec b|$", "D. $\\vec a=\\vec b$"], answer: "B",
    solution: "两个非零向量数量积为零是它们垂直的充要条件。", methodTags: ["向量垂直判定"], difficultyScore: 1.5, estimatedMinutes: 2,
  },
  {
    id: "complex-add-01", questionType: "fill_blank", primaryKnowledgePoint: "复数",
    stem: "$(2+3i)+(1-2i)=$______。", answer: "3+i",
    solution: "实部与虚部分别相加，得 $(2+1)+(3-2)i=3+i$。", methodTags: ["复数加法"], difficultyScore: 1.2, estimatedMinutes: 2,
  },
  {
    id: "complex-multiply-01", questionType: "single_choice", primaryKnowledgePoint: "复数",
    stem: "$(1+i)^2=$（　）", options: ["A. $2$", "B. $2i$", "C. $1+i$", "D. $-2$"], answer: "B",
    solution: "$(1+i)^2=1+2i+i^2=2i$。", methodTags: ["复数乘法", "$i^2=-1$"], difficultyScore: 1.5, estimatedMinutes: 2,
  },
  {
    id: "complex-modulus-01", questionType: "fill_blank", primaryKnowledgePoint: "复数",
    stem: "复数 $z=3-4i$ 的模 $|z|=$______。", answer: "5",
    solution: "$|z|=\\sqrt{3^2+(-4)^2}=5$。", methodTags: ["复数的模"], difficultyScore: 1.4, estimatedMinutes: 2,
  },
  {
    id: "complex-conjugate-01", questionType: "single_choice", primaryKnowledgePoint: "复数",
    stem: "复数 $2-3i$ 的共轭复数为（　）", options: ["A. $-2+3i$", "B. $2+3i$", "C. $-2-3i$", "D. $3+2i$"], answer: "B",
    solution: "共轭复数保持实部不变，虚部变号，所以为 $2+3i$。", methodTags: ["共轭复数"], difficultyScore: 1.3, estimatedMinutes: 2,
  },
  {
    id: "statistics-mean-01", questionType: "fill_blank", primaryKnowledgePoint: "统计",
    stem: "数据 $2,4,6,8$ 的平均数为______。", answer: "5",
    solution: "平均数为 $\\dfrac{2+4+6+8}{4}=5$。", methodTags: ["平均数"], difficultyScore: 1.2, estimatedMinutes: 2,
  },
  {
    id: "statistics-median-01", questionType: "single_choice", primaryKnowledgePoint: "统计",
    stem: "数据 $1,3,4,7,9$ 的中位数为（　）", options: ["A. $3$", "B. $4$", "C. $4.8$", "D. $7$"], answer: "B",
    solution: "数据已经按从小到大排列，共5个数，中间第3个数是4。", methodTags: ["中位数"], difficultyScore: 1.2, estimatedMinutes: 2,
  },
  {
    id: "statistics-range-01", questionType: "fill_blank", primaryKnowledgePoint: "统计",
    stem: "数据 $3,5,8,10$ 的极差为______。", answer: "7",
    solution: "极差等于最大值减最小值，即 $10-3=7$。", methodTags: ["极差"], difficultyScore: 1.1, estimatedMinutes: 1,
  },
  {
    id: "statistics-frequency-01", questionType: "single_choice", primaryKnowledgePoint: "统计",
    stem: "在100次试验中某事件发生了32次，该事件的频率为（　）", options: ["A. $0.032$", "B. $0.32$", "C. $3.2$", "D. $32$"], answer: "B",
    solution: "频率等于发生次数除以试验次数，即 $32/100=0.32$。", methodTags: ["频率计算"], difficultyScore: 1.3, estimatedMinutes: 2,
  },
  {
    id: "probability-die-even-01", questionType: "single_choice", primaryKnowledgePoint: "概率",
    stem: "掷一枚质地均匀的六面骰子一次，出现偶数点的概率为（　）",
    options: ["A. $\\frac16$", "B. $\\frac13$", "C. $\\frac12$", "D. $\\frac23$"], answer: "C",
    solution: "样本点为 $1,2,3,4,5,6$，偶数点有 $2,4,6$ 共3个，所以概率为 $3/6=1/2$。", methodTags: ["古典概型", "样本空间"], difficultyScore: 1.4, estimatedMinutes: 2,
  },
  {
    id: "probability-complement-01", questionType: "fill_blank", primaryKnowledgePoint: "概率",
    stem: "若事件 $A$ 的概率为 $0.28$，则其对立事件的概率为______。", answer: "0.72",
    solution: "对立事件概率为 $1-P(A)=1-0.28=0.72$。", methodTags: ["对立事件", "补集"], difficultyScore: 1.3, estimatedMinutes: 2,
  },
  {
    id: "probability-ball-01", questionType: "fill_blank", primaryKnowledgePoint: "概率",
    stem: "袋中有3个红球、2个白球，随机取出1个球，取到红球的概率为______。", answer: "\\frac{3}{5}",
    solution: "5个球被取到的机会相同，其中红球有3个，所以概率为 $3/5$。", methodTags: ["古典概型", "有利数比总数"], difficultyScore: 1.4, estimatedMinutes: 2,
  },
  {
    id: "probability-coin-space-01", questionType: "single_choice", primaryKnowledgePoint: "概率",
    stem: "连续抛两次质地均匀的硬币，样本空间中的基本结果个数为（　）", options: ["A. $2$", "B. $3$", "C. $4$", "D. $8$"], answer: "C",
    solution: "基本结果为正正、正反、反正、反反，共4个。", methodTags: ["样本空间", "有序结果"], difficultyScore: 1.5, estimatedMinutes: 2,
  },
];

export function validateFoundationQuestion(question: FoundationQuestion) {
  const errors: string[] = [];
  if (!question.stem.trim() || !question.answer.trim() || !question.solution.trim()) errors.push("题干、答案或解析为空");
  if (question.difficultyScore < 1 || question.difficultyScore > 2.2) errors.push("基础题难度必须在1到2.2之间");
  if (question.questionType === "single_choice") {
    if (question.options?.length !== 4) errors.push("单选题必须有4个选项");
    if (!/^[A-D]$/.test(question.answer)) errors.push("单选题答案必须为A-D");
  }
  return errors;
}
