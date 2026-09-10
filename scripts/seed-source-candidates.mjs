import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const candidates = [
  ["九省联考数学", "多省", "多省联合适应性测试", "joint_exam"],
  ["八省适应性演练数学", "多省", "多省联合适应性测试", "joint_exam"],
  ["T8联考数学", "多省", "名校联盟联考", "school_alliance"],
  ["Z20名校联盟联考数学", "多省", "名校联盟联考", "school_alliance"],
  ["G4名校联盟联考数学", "多省", "名校联盟联考", "school_alliance"],
  ["广东省普通高中毕业班综合测试数学", "广东", "省级一模/二模", "provincial_research"],
  ["山东省普通高中学业水平等级考试模拟数学", "山东", "省级适应性测试", "provincial_research"],
  ["湖北省高三联合测评数学", "湖北", "省级质量检测", "provincial_research"],
  ["湖南省高三教学质量检测数学", "湖南", "省级质量检测", "provincial_research"],
  ["江苏省高三年级调研测试数学", "江苏", "省级质量检测", "provincial_research"],
  ["广州市高三一模/二模数学", "广州", "地级市统考", "city_exam"],
  ["深圳市高三一模/二模数学", "深圳", "地级市统考", "city_exam"],
  ["武汉市高三调研考试数学", "武汉", "地级市统考", "city_exam"],
  ["南京市、盐城市高三一模/二模数学", "南京/盐城", "地级市联考", "city_exam"],
  ["福州市高三质量检测数学", "福州", "地级市统考", "city_exam"],
];

for (const [name, region, examRound, sourceTier] of candidates) {
  const existing = await prisma.sourceCandidate.findFirst({ where: { name } });
  if (existing) continue;
  await prisma.sourceCandidate.create({
    data: {
      name,
      region,
      examRound,
      sourceTier,
      reviewStatus: "research_pending",
      answerStatus: "unknown",
      watermarkStatus: "unknown",
      usageNote: "候选搜索目标；只有公开可核验、试卷与答案完整且无需绕过访问限制时才允许导入。",
    },
  });
}

console.log(JSON.stringify({ candidates: await prisma.sourceCandidate.count() }, null, 2));
await prisma.$disconnect();
