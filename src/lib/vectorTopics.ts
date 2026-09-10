import type { TrigonometryTopic } from "@/lib/trigonometryTopics";

export const vectorTopics: TrigonometryTopic[] = [
  {
    slug: "operations-basis",
    title: "向量运算、基底与线性表示",
    subtitle: "先看方向和结构，再决定保留几何语言还是展开坐标。",
    estimatedMinutes: 100,
    goals: ["理解向量相等与共线", "熟练线性运算和基底表示", "用向量证明中点与平行关系", "识别系数和为一的仿射结构"],
    sections: [
      { title: "向量同时包含大小和方向", paragraphs: [
        "向量相等要求长度相等且方向相同，与起点位置无关。零向量长度为零、方向不确定，不能参与‘同向’或单位化讨论。向量加法可用三角形法则或平行四边形法则，减法 $\\vec a-\\vec b$ 可理解为从 $\\vec b$ 的终点指向 $\\vec a$ 的终点。",
        "数乘 $\\lambda\\vec a$ 改变长度和方向：$\\lambda>0$ 同向，$\\lambda<0$ 反向，$\\lambda=0$ 得零向量。两个非零向量共线等价于存在实数 $\\lambda$ 使 $\\vec a=\\lambda\\vec b$；但若涉及零向量，要回到定义单独判断。"
      ]},
      { title: "基底把平面几何转成唯一系数", paragraphs: [
        "平面内两个不共线向量 $\\vec e_1,\\vec e_2$ 构成一组基底，任意向量都能唯一写成 $x\\vec e_1+y\\vec e_2$。唯一性是比较系数的依据：若 $x\\vec e_1+y\\vec e_2=x'\\vec e_1+y'\\vec e_2$，则 $x=x'$、$y=y'$。",
        "选择基底应服从图形结构。三角形中常选 $\\overrightarrow{AB},\\overrightarrow{AC}$；平行四边形中选相邻两边。基底选得自然，中点、重心和分点的系数会很简洁；随意建坐标反而可能增加变量。"
      ]},
      { title: "系数和为一对应点的仿射组合", paragraphs: [
        "若以固定原点 $O$ 表示点，$\\overrightarrow{OP}=\\lambda\\overrightarrow{OA}+\\mu\\overrightarrow{OB}$ 且 $\\lambda+\\mu=1$，则 $P$ 在直线 $AB$ 上。若 $\\lambda,\\mu\\ge0$，点还在线段 $AB$ 上。中点对应 $\\lambda=\\mu=\\frac12$。",
        "三角形重心 $G$ 满足 $\\overrightarrow{OG}=\\frac13(\\overrightarrow{OA}+\\overrightarrow{OB}+\\overrightarrow{OC})$。这不是需要孤立背诵的公式，而是三条中线分点关系的统一表达。遇到共点、共线证明时，先寻找系数和结构。"
      ]}
    ],
    framework: ["图形边关系清楚：用首尾相接和闭合向量和", "出现两个不共线方向：选作基底并比较唯一系数", "点在线段或直线上：寻找系数和为一的表示", "中点、重心、分点：直接写位置向量的加权平均", "零向量出现：回到定义，不套非零向量共线公式"],
    errors: ["把向量相等误认为起点终点都相同", "减法方向写反", "用共线比例时分母向量可能为零", "基底本身共线却仍比较系数", "系数和为一只证明直线关系却误报在线段内"],
    examples: [
      { title: "闭合向量化简", stem: "在四边形 $ABCD$ 中，化简 $\\overrightarrow{AB}+\\overrightarrow{BC}-\\overrightarrow{DC}$。", answer: "$\\overrightarrow{AD}$。", solution: ["$-\\overrightarrow{DC}=\\overrightarrow{CD}$。", "按首尾相接，$\\overrightarrow{AB}+\\overrightarrow{BC}+\\overrightarrow{CD}=\\overrightarrow{AD}$。"], takeaway: "先把减法改成反向向量，再寻找连续路径。" },
      { title: "基底系数比较", stem: "不共线向量 $\\vec a,\\vec b$ 满足 $(m-1)\\vec a+(2m+n)\\vec b=2\\vec a+5\\vec b$，求 $m,n$。", answer: "$m=3,n=-1$。", solution: ["由基底表示唯一性，$m-1=2$，所以 $m=3$。", "$2m+n=5$，代入 $m=3$ 得 $n=-1$。"], takeaway: "只有基底不共线时，才能逐项比较系数。" },
      { title: "分点的位置向量", stem: "点 $P$ 在线段 $AB$ 上且 $AP:PB=2:1$。用 $\\overrightarrow{OA},\\overrightarrow{OB}$ 表示 $\\overrightarrow{OP}$。", answer: "$\\overrightarrow{OP}=\\frac13\\overrightarrow{OA}+\\frac23\\overrightarrow{OB}$。", solution: ["$P$ 从 $A$ 向 $B$ 走了全程的 $\\frac23$，所以 $\\overrightarrow{AP}=\\frac23\\overrightarrow{AB}$。", "$\\overrightarrow{OP}=\\overrightarrow{OA}+\\frac23(\\overrightarrow{OB}-\\overrightarrow{OA})=\\frac13\\overrightarrow{OA}+\\frac23\\overrightarrow{OB}$。"], takeaway: "靠近哪一端，该端位置向量的权重反而更大。" },
      { title: "重心与中线", stem: "三角形 $ABC$ 中，$M$ 是 $BC$ 中点，$G$ 在中线 $AM$ 上且 $AG:GM=2:1$。证明 $\\overrightarrow{OG}=\\frac13(\\overrightarrow{OA}+\\overrightarrow{OB}+\\overrightarrow{OC})$。", answer: "结论成立。", solution: ["中点公式给 $\\overrightarrow{OM}=\\frac12(\\overrightarrow{OB}+\\overrightarrow{OC})$。", "$G$ 将 $AM$ 按 $2:1$ 内分，所以 $\\overrightarrow{OG}=\\frac13\\overrightarrow{OA}+\\frac23\\overrightarrow{OM}$。", "代入并化简，得 $\\overrightarrow{OG}=\\frac13(\\overrightarrow{OA}+\\overrightarrow{OB}+\\overrightarrow{OC})$。"], takeaway: "重心公式可以由两次分点公式推导，不必孤立记忆。" },
      { title: "共线参数", stem: "已知不共线向量 $\\vec a,\\vec b$，$\\overrightarrow{OP}=2\\vec a+\\vec b$，$\\overrightarrow{OQ}=\\vec a+3\\vec b$。若 $\\overrightarrow{OR}=t\\vec a+(5-2t)\\vec b$，证明点 $R$ 在直线 $PQ$ 上，并求 $R$ 在线段 $PQ$ 上时 $t$ 的范围。", answer: "$R$ 始终在直线 $PQ$ 上；在线段上时 $1\\le t\\le2$。", solution: ["设 $\\lambda=t-1$，则 $1+\\lambda=t$，$3-2\\lambda=5-2t$。", "于是 $\\overrightarrow{OR}=\\lambda\\overrightarrow{OP}+(1-\\lambda)\\overrightarrow{OQ}$，两个系数和为 $1$，故 $R$ 在直线 $PQ$ 上。", "$R$ 在线段 $PQ$ 上等价于 $0\\le\\lambda\\le1$，即 $1\\le t\\le2$。"], takeaway: "先把位置向量配成 P、Q 的仿射组合，再由权重范围判断线段。", advancedNote: "参数式中的两个基底系数沿一条直线变化；将它们与 P、Q 系数做线性插值，可直接读出点的轨迹。" }
    ],
    summary: "向量线性运算的核心不是展开，而是选择自然基底并识别系数结构。首尾路径处理加减，唯一表示处理系数，系数和为一处理共线和分点。"
  },
  {
    slug: "coordinates-collinearity",
    title: "向量坐标、平行与面积",
    subtitle: "坐标法把几何关系压缩成两行稳定运算。",
    estimatedMinutes: 105,
    goals: ["熟练计算向量坐标", "判断平行、共线和分点", "用行列式思想计算面积", "在参数坐标题中避免比例除零"],
    sections: [
      { title: "向量坐标是终点减起点", paragraphs: [
        "若 $A(x_1,y_1)$、$B(x_2,y_2)$，则 $\\overrightarrow{AB}=(x_2-x_1,y_2-y_1)$。方向顺序决定符号，$\\overrightarrow{BA}=-\\overrightarrow{AB}$。向量的加减和数乘按对应坐标进行，长度为 $\\sqrt{x^2+y^2}$。",
        "点的坐标与向量坐标要区分。点表示位置，向量表示位移。选择原点后位置向量 $\\overrightarrow{OP}$ 的坐标恰好等于点 $P$ 的坐标，但这只是特定起点带来的简化。"
      ]},
      { title: "平行判断优先交叉相乘", paragraphs: [
        "非零向量 $(x_1,y_1)$ 与 $(x_2,y_2)$ 平行等价于 $x_1y_2-x_2y_1=0$。相比写 $\\frac{x_1}{x_2}=\\frac{y_1}{y_2}$，交叉相乘不会因某个坐标为零而失效。若需要同向或反向，还要判断比例系数正负。",
        "三点 $A,B,C$ 共线可判断 $\\overrightarrow{AB}$ 与 $\\overrightarrow{AC}$ 平行。参数题中，先写出两个向量坐标，再列行列式为零；求出参数后代回检查点是否重合以及题目是否允许。"
      ]},
      { title: "二维行列式同时描述面积与方向", paragraphs: [
        "向量 $\\vec a=(x_1,y_1)$、$\\vec b=(x_2,y_2)$ 张成的平行四边形面积是 $|x_1y_2-x_2y_1|$，三角形面积是其一半。绝对值负责去掉方向，未取绝对值的符号可表示从 $\\vec a$ 转到 $\\vec b$ 的方向。",
        "面积为零等价于两个向量共线，因此面积条件和共线条件可以互换。涉及三角形面积比时，若共享同一底边或同一高，几何法更短；坐标复杂但结构规则时，行列式法更稳定。"
      ]}
    ],
    framework: ["点到向量：严格按终点减起点", "平行或共线：用 $x_1y_2-x_2y_1=0$", "同向反向：在平行基础上再看比例系数符号", "三角形面积：取两个边向量行列式绝对值的一半", "参数结果：代回检查重合、零向量和题意限制"],
    errors: ["把终点减起点顺序写反", "用坐标比值判断平行时出现除零", "只证明平行却直接说同向", "面积公式漏掉绝对值或二分之一", "参数点重合后仍声称构成三角形"],
    examples: [
      { title: "坐标与长度", stem: "已知 $A(-1,2)$，$B(3,-1)$，求 $\\overrightarrow{AB}$ 及 $|\\overrightarrow{AB}|$。", answer: "$(4,-3)$，长度 $5$。", solution: ["终点减起点：$\\overrightarrow{AB}=(3-(-1),-1-2)=(4,-3)$。", "长度为 $\\sqrt{4^2+(-3)^2}=5$。"], takeaway: "坐标顺序确定后，长度用勾股结构复核。" },
      { title: "平行参数", stem: "若向量 $(2,m)$ 与 $(m,8)$ 平行，求 $m$。", answer: "$m=\\pm4$。", solution: ["平行条件为 $2\\cdot8-m^2=0$。", "$m^2=16$，所以 $m=4$ 或 $m=-4$；两组向量都非零。"], takeaway: "交叉相乘能一次保留正、负比例两种方向。" },
      { title: "三点共线", stem: "已知 $A(1,2)$，$B(3,5)$，$C(t,8)$，若三点共线，求 $t$。", answer: "$t=5$。", solution: ["$\\overrightarrow{AB}=(2,3)$，$\\overrightarrow{AC}=(t-1,6)$。", "共线要求 $2\\cdot6-3(t-1)=0$，解得 $t=5$。"], takeaway: "从同一起点写两个向量，避免额外变量。" },
      { title: "三角形面积", stem: "已知 $A(1,1)$，$B(4,2)$，$C(2,5)$，求 $\\triangle ABC$ 面积。", answer: "$\\frac{11}{2}$。", solution: ["$\\overrightarrow{AB}=(3,1)$，$\\overrightarrow{AC}=(1,4)$。", "行列式为 $3\\cdot4-1\\cdot1=11$，故三角形面积为 $\\frac12|11|=\\frac{11}{2}$。"], takeaway: "任取同一顶点的两条边向量，行列式绝对值再除以二。" },
      { title: "面积比确定分点", stem: "点 $P$ 在线段 $BC$ 上，且 $[\\triangle ABP]:[\\triangle APC]=2:3$。求 $BP:PC$，并写出 $\\overrightarrow{AP}$ 关于 $\\overrightarrow{AB},\\overrightarrow{AC}$ 的表示。", answer: "$BP:PC=2:3$；$\\overrightarrow{AP}=\\frac35\\overrightarrow{AB}+\\frac25\\overrightarrow{AC}$。", solution: ["两三角形以 $BP,PC$ 为底，且从 $A$ 到直线 $BC$ 的高相同，所以面积比等于底边比，得 $BP:PC=2:3$。", "内分公式给 $\\overrightarrow{AP}=\\frac{PC}{BC}\\overrightarrow{AB}+\\frac{BP}{BC}\\overrightarrow{AC}$。", "代入 $BP:PC=2:3$，得 $\\overrightarrow{AP}=\\frac35\\overrightarrow{AB}+\\frac25\\overrightarrow{AC}$。"], takeaway: "共享高的面积比先转成边长比，再使用分点向量。" }
    ],
    summary: "坐标法的优势是稳定：终点减起点得到向量，交叉相乘判断平行，二维行列式计算面积。真正需要检查的是零向量、比例方向和三角形是否退化。"
  },
  {
    slug: "dot-product-geometry",
    title: "数量积、夹角与几何综合",
    subtitle: "数量积负责把长度、角度和垂直关系放进同一个公式。",
    estimatedMinutes: 115,
    goals: ["使用数量积求长度和夹角", "判断垂直与投影", "建立向量模的二次结构", "比较几何法与坐标法的成本"],
    sections: [
      { title: "数量积是带方向信息的长度乘积", paragraphs: [
        "$\\vec a\\cdot\\vec b=|\\vec a||\\vec b|\\cos\\theta$，其中 $\\theta\\in[0,\\pi]$ 是两非零向量夹角。夹角锐时数量积为正，钝时为负，垂直时为零。坐标形式 $(x_1,y_1)\\cdot(x_2,y_2)=x_1x_2+y_1y_2$ 把几何关系转为代数。",
        "零向量与任何向量数量积为零，但不能由此说它与任何向量垂直，因为零向量没有方向。使用夹角公式前必须确认两个向量都非零，并检查计算出的余弦在 $[-1,1]$ 内。"
      ]},
      { title: "模长公式把向量问题化成二次式", paragraphs: [
        "$|\\vec a+\\vec b|^2=|\\vec a|^2+|\\vec b|^2+2\\vec a\\cdot\\vec b$，$|\\vec a-\\vec b|^2=|\\vec a|^2+|\\vec b|^2-2\\vec a\\cdot\\vec b$。求长度时先平方，常能避免根式；比较两个长度也可比较平方。",
        "若 $\\vec x=\\vec a+t\\vec b$，则 $|\\vec x|^2$ 是关于 $t$ 的二次函数。配方可求最小值，其几何意义是从一点到直线的最短距离对应垂足。学过投影后，这个参数可直接由垂直条件确定。"
      ]},
      { title: "投影和最值统一为垂直分解", paragraphs: [
        "$\\vec a$ 在 $\\vec b$ 方向上的数量投影为 $\\frac{\\vec a\\cdot\\vec b}{|\\vec b|}$，可能为负；投影向量为 $\\frac{\\vec a\\cdot\\vec b}{|\\vec b|^2}\\vec b$。把向量分解成平行和垂直于 $\\vec b$ 的两部分，是最短距离、最佳逼近和正交分解的共同结构。",
        "几何图形中，等腰、直角、中线等条件都可转成数量积。若图形关系一眼清楚，几何法更短；若参数多、角度隐藏，建坐标或选基底通常更稳定。方法选择应看未知量数量，而不是固定偏爱某一种。"
      ]}
    ],
    framework: ["垂直：验证两向量非零后令数量积为零", "夹角：先求数量积和两个模，再检查余弦范围", "比较长度：优先比较模的平方", "形如 $|\\vec a+t\\vec b|$：展开为 t 的二次式或使用正交投影", "几何综合：未知量少保留几何，参数多则建坐标"],
    errors: ["由数量积为零误判零向量也有垂直方向", "夹角公式漏掉模长分母", "把向量夹角当作直线锐角", "展开模平方时交叉项符号错误", "投影长度与投影向量混淆"],
    examples: [
      { title: "夹角计算", stem: "已知 $\\vec a=(1,2)$，$\\vec b=(2,-1)$，求夹角。", answer: "$\\frac\\pi2$。", solution: ["$\\vec a\\cdot\\vec b=1\\cdot2+2\\cdot(-1)=0$。", "两向量均非零，因此夹角为 $\\frac\\pi2$。"], takeaway: "数量积为零前先排除零向量。" },
      { title: "模长恒等式", stem: "已知 $|\\vec a|=3$，$|\\vec b|=4$，$\\vec a\\cdot\\vec b=6$，求 $|\\vec a-\\vec b|$。", answer: "$\\sqrt{13}$。", solution: ["$|\\vec a-\\vec b|^2=9+16-2\\cdot6=13$。", "模长非负，所以 $|\\vec a-\\vec b|=\\sqrt{13}$。"], takeaway: "向量差的交叉项带负号。" },
      { title: "垂直参数", stem: "若 $(\\vec a+2\\vec b)\\perp(2\\vec a-\\vec b)$，且 $|\\vec a|=|\\vec b|=1$，求 $\\vec a\\cdot\\vec b$。", answer: "$0$。", solution: ["垂直给 $(\\vec a+2\\vec b)\\cdot(2\\vec a-\\vec b)=0$。", "展开得 $2|\\vec a|^2+3\\vec a\\cdot\\vec b-2|\\vec b|^2=0$。", "代入两个模均为 $1$，得到 $3\\vec a\\cdot\\vec b=0$，所以数量积为 $0$。"], takeaway: "展开时先合并两个交叉项，再代入模长条件。" },
      { title: "参数向量最小模", stem: "设 $\\vec a=(1,2)$，$\\vec b=(2,-1)$，求 $|\\vec a+t\\vec b|$ 的最小值及对应 $t$。", answer: "最小值 $\\sqrt5$，在 $t=0$ 取得。", solution: ["$\\vec a\\cdot\\vec b=0$，两向量垂直。", "$|\\vec a+t\\vec b|^2=|\\vec a|^2+t^2|\\vec b|^2=5+5t^2\\ge5$。", "当 $t=0$ 时取等，故最小值为 $\\sqrt5$。"], takeaway: "若两方向正交，平方模直接分离成两个非负部分。" },
      { title: "中线长度与向量法", stem: "三角形 $ABC$ 中，$AB=5$，$AC=7$，$\\angle BAC=60^\\circ$。$M$ 为 $BC$ 中点，求 $AM$。", answer: "$\\frac{\\sqrt{109}}2$。", solution: ["设 $\\vec b=\\overrightarrow{AB}$，$\\vec c=\\overrightarrow{AC}$，则 $\\overrightarrow{AM}=\\frac12(\\vec b+\\vec c)$。", "$\\vec b\\cdot\\vec c=5\\cdot7\\cdot\\cos60^\\circ=\\frac{35}{2}$。", "$AM^2=\\frac14(25+49+35)=\\frac{109}{4}$，故 $AM=\\frac{\\sqrt{109}}2$。"], takeaway: "中点给向量平均，模平方再调用数量积。", advancedNote: "这就是阿波罗尼斯中线公式的向量推导；也可先用余弦定理求 BC，再套中线公式。" }
    ],
    summary: "数量积把角度信息代数化，模平方把长度问题二次化，正交投影把最值问题几何化。面对综合题时，先判断需要的是垂直、夹角、长度还是最短距离，再选对应表达。"
  }
];
