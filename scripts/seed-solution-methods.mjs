import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const questionId = "gb-7a1a464dc7c8e216c55a1fb6";
const question = await prisma.question.findUnique({ where: { id: questionId } });

if (!question) {
  console.log(JSON.stringify({ seeded: 0, reason: "target_question_missing" }, null, 2));
  await prisma.$disconnect();
  process.exit(0);
}

const methods = [
  {
    order: 1,
    name: "逐序列枚举",
    summary: "把每一球写成甲得分或乙得分，列出使比赛恰好在指定球数结束的互斥序列。",
    recognitionSignalsJson: JSON.stringify(["球数较少", "各球结果独立", "要求恰好在第若干球结束"]),
    applicableConditions: "结果序列不多，且每一球的得分概率可以直接写出。",
    steps: "记甲得分为 $A$，乙得分为 $B$。第1、3球甲发球，第2、4球乙发球。\n\n(1) $X=2$ 只有 $AA$ 与 $BB$：\n$$P(X=2)=0.5\\times0.4+0.5\\times0.6=0.5.$$\n\n(2) 前两球必须打平，后两球甲连续得分，对应 $ABAA$ 与 $BAAA$：\n$$P=0.5\\times0.6\\times0.5\\times0.4+0.5\\times0.4\\times0.5\\times0.4=0.1.$$",
    strengths: "过程直观，容易检查是否不重不漏。",
    risks: "球数增加后序列会迅速增多；必须按发球人写对每一球概率。",
    estimatedMinutes: 6,
    isRecommended: true,
  },
  {
    order: 2,
    name: "两球一组的条件分块",
    summary: "先把每两球看成一个状态块：同一人连得两分则结束，各得一分则回到平分状态。",
    recognitionSignalsJson: JSON.stringify(["每两球发球顺序重复", "领先两分结束", "打平后状态重置"]),
    applicableConditions: "比赛规则在每两球后回到同样的平分状态，且各球相互独立。",
    steps: "一组两球中，甲连得两分的概率为 $0.5\\times0.4=0.2$；乙连得两分的概率为 $0.5\\times0.6=0.3$；一人一分的概率为 $1-0.2-0.3=0.5$。\n\n因此\n$$P(X=2)=0.2+0.3=0.5.$$\n\n要使 $X=4$ 且甲获胜，第一组必须一人一分，第二组必须甲连得两分，所以\n$$P=0.5\\times0.2=0.1.$$",
    strengths: "结构短，能迁移到更长局数和递推问题。",
    risks: "只有确认两球后状态确实重置时才能分块，不能机械套乘法。",
    estimatedMinutes: 4,
    isRecommended: false,
  },
];

for (const method of methods) {
  await prisma.solutionMethod.upsert({
    where: { questionId_order: { questionId, order: method.order } },
    update: { ...method, verificationStatus: "human_verified" },
    create: { questionId, ...method, verificationStatus: "human_verified" },
  });
}

console.log(JSON.stringify({ seeded: methods.length, questionId }, null, 2));
await prisma.$disconnect();
