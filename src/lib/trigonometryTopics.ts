export type TrigonometryExample = {
  title: string;
  stem: string;
  answer: string;
  solution: string[];
  takeaway: string;
  advancedNote?: string;
};

export type TrigonometryTopic = {
  slug: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  goals: string[];
  sections: Array<{ title: string; paragraphs: string[] }>;
  framework: string[];
  errors: string[];
  examples: TrigonometryExample[];
  summary: string;
  reference?: { title: string; url: string; note: string };
};

export const trigonometryTopics: TrigonometryTopic[] = [
  {
    slug: "basic-formulas",
    title: "三角函数基础公式",
    subtitle: "先把角、象限和单位圆连成一个系统，再记公式。",
    estimatedMinutes: 55,
    goals: ["理解任意角、弧度制与单位圆", "熟练使用同角关系和诱导公式", "能够由一个三角值确定其余三角值", "形成先判象限、后定符号的检查习惯"],
    sections: [
      { title: "角与弧度：公式能够统一的起点", paragraphs: [
        "三角函数研究的角不只在三角形内部。角可以绕任意圈，因此先用 $\\alpha+2k\\pi\\,(k\\in\\mathbb Z)$ 表示所有终边相同的角，再研究终边与单位圆的交点。角度制适合描述熟悉的特殊角，弧度制则把角与弧长直接联系起来：半径为 $r$、圆心角为 $\\alpha$ 时，弧长 $l=|\\alpha|r$。高中阶段涉及周期、图像、导数前的变化率时，默认都使用弧度制。",
        "换算只需守住 $180^\\circ=\\pi$。例如 $150^\\circ=\\frac{5\\pi}{6}$，$-\\frac{3\\pi}{4}=-135^\\circ$。容易失分的地方不是公式本身，而是在同一道题里把角度和弧度混用，或者忘记负角按顺时针方向旋转。"
      ]},
      { title: "单位圆：符号、定义和诱导公式的共同来源", paragraphs: [
        "设角 $\\alpha$ 的终边与单位圆交于 $P(x,y)$，则 $\\cos\\alpha=x$，$\\sin\\alpha=y$；当 $x\\ne0$ 时，$\\tan\\alpha=\\frac{y}{x}$。因此正弦看纵坐标，余弦看横坐标，正切看纵横坐标之比。第一、二、三、四象限中正弦的符号依次为正、正、负、负；余弦依次为正、负、负、正。符号不是额外背诵的口诀，而是坐标正负的直接结果。",
        "诱导公式的本质是终边关于坐标轴、原点或直线 $y=x$ 的对称。处理 $\\pi\\pm\\alpha$、$2\\pi-\\alpha$ 时，先判断新角在哪个象限，再确定函数名是否改变。遇到 $\\frac\\pi2\\pm\\alpha$ 才发生正弦与余弦的互换。建议写成两步：先写绝对值对应的锐角函数，再补符号，避免只背‘奇变偶不变’却把正负号写错。"
      ]},
      { title: "同角关系：由一个量建立完整信息", paragraphs: [
        "最基本的关系是 $\\sin^2\\alpha+\\cos^2\\alpha=1$，以及 $\\tan\\alpha=\\frac{\\sin\\alpha}{\\cos\\alpha}$。已知一个三角值时，平方关系通常只能得到另一个值的绝对值，必须结合角的范围或象限决定正负。如果题目没有给出象限，答案可能本来就有两种，不能擅自取正。",
        "含齐次式时，不必分别求出正弦和余弦。例如已知 $\\tan\\alpha$，求 $\\frac{2\\sin\\alpha-\\cos\\alpha}{\\sin\\alpha+3\\cos\\alpha}$，分子分母同除以 $\\cos\\alpha$ 就能直接转为正切。这种‘齐次化’比开平方更短，也减少符号风险。检查时还应确认分母不为零、所得三角值位于 $[-1,1]$ 内。"
      ]}
    ],
    framework: ["统一为弧度并化到一个周期内", "根据终边确定象限", "用单位圆或诱导公式化为锐角函数", "选择平方关系、商数关系或齐次化", "检查符号、定义域和三角值范围"],
    errors: ["平方开方后遗漏正负", "把终边相同误认为角相等", "角度与弧度直接参与同一运算", "遇到 $\\frac\\pi2\\pm\\alpha$ 时函数名未改变", "正切分母为零时仍使用商数关系"],
    examples: [
      { title: "终边与象限", stem: "已知角 $\\alpha=-\\frac{17\\pi}{6}$，求与其终边相同且位于 $[0,2\\pi)$ 内的角，并判断 $\\sin\\alpha,\\cos\\alpha,\\tan\\alpha$ 的符号。", answer: "$\\frac{7\\pi}{6}$；正弦负、余弦负、正切正。", solution: ["加上 $4\\pi$，得 $-\\frac{17\\pi}{6}+\\frac{24\\pi}{6}=\\frac{7\\pi}{6}$。", "$\\frac{7\\pi}{6}$ 在第三象限，单位圆交点的横、纵坐标都为负，所以正弦、余弦为负，二者之比为正。"], takeaway: "先找同终边标准角，再判断象限，符号自然得到。" },
      { title: "同角关系与符号", stem: "若 $\\alpha$ 为第二象限角，且 $\\sin\\alpha=\\frac35$，求 $\\cos\\alpha$ 与 $\\tan\\alpha$。", answer: "$\\cos\\alpha=-\\frac45$，$\\tan\\alpha=-\\frac34$。", solution: ["由 $\\sin^2\\alpha+\\cos^2\\alpha=1$ 得 $|\\cos\\alpha|=\\frac45$。", "第二象限横坐标为负，所以 $\\cos\\alpha=-\\frac45$；再由商数关系得 $\\tan\\alpha=-\\frac34$。"], takeaway: "平方关系给绝对值，象限负责决定符号。" },
      { title: "诱导公式", stem: "化简 $\\sin(3\\pi-\\alpha)+\\cos\\left(\\frac{5\\pi}{2}+\\alpha\\right)$。", answer: "$0$。", solution: ["先减去整周期：$3\\pi-\\alpha=2\\pi+(\\pi-\\alpha)$，所以 $\\sin(3\\pi-\\alpha)=\\sin(\\pi-\\alpha)=\\sin\\alpha$。", "$\\cos(\\frac{5\\pi}{2}+\\alpha)=\\cos(\\frac\\pi2+\\alpha)=-\\sin\\alpha$，两项相加为 $0$。"], takeaway: "复杂角先减去整周期；不要凭公式外形直接猜符号。" },
      { title: "齐次式的快速处理", stem: "已知 $\\tan\\alpha=2$，求 $\\frac{3\\sin\\alpha-2\\cos\\alpha}{\\sin\\alpha+\\cos\\alpha}$。", answer: "$\\frac43$。", solution: ["因为 $\\tan\\alpha$ 有定义，所以 $\\cos\\alpha\\ne0$。分子分母同除以 $\\cos\\alpha$。", "原式 $=\\frac{3\\tan\\alpha-2}{\\tan\\alpha+1}=\\frac{6-2}{2+1}=\\frac43$。"], takeaway: "只给正切且式子对正余弦齐次时，优先整体除以余弦。" }
    ],
    summary: "基础公式不是一张孤立的记忆表。单位圆给出定义和符号，同角关系连接同一个角的不同函数，诱导公式处理对称与周期。稳定得分的关键顺序是：化角、判象限、定符号、再运算。"
  },
  {
    slug: "identity-transformations",
    title: "三角恒等变换",
    subtitle: "变换的目标不是越复杂越好，而是把角和函数名统一。",
    estimatedMinutes: 65,
    goals: ["掌握和差角、倍角与辅助角公式", "识别角之间的和差与倍半关系", "能根据求值、证明和最值选择不同变形方向", "避免无目标地展开"],
    sections: [
      { title: "公式网络：从和差角出发", paragraphs: [
        "核心公式是 $\\sin(\\alpha\\pm\\beta)=\\sin\\alpha\\cos\\beta\\pm\\cos\\alpha\\sin\\beta$，$\\cos(\\alpha\\pm\\beta)=\\cos\\alpha\\cos\\beta\\mp\\sin\\alpha\\sin\\beta$。正切和差公式可由二者相除得到，但使用前必须检查分母与各正切是否有定义。倍角公式只是令 $\\beta=\\alpha$ 的结果，因此记忆时应理解来源，而不是把公式越列越长。",
        "$\\cos2\\alpha=\\cos^2\\alpha-\\sin^2\\alpha=2\\cos^2\\alpha-1=1-2\\sin^2\\alpha$ 有三种形态。看到只含 $\\sin^2\\alpha$ 时选第三种，只含 $\\cos^2\\alpha$ 时选第二种，需要正余弦乘积时用 $\\sin2\\alpha=2\\sin\\alpha\\cos\\alpha$。选择合适形态能显著减少运算。"
      ]},
      { title: "先找目标：统一角、统一函数名、降低次数", paragraphs: [
        "恒等变换通常服务于三个目标。第一是统一角，例如把 $\\sin(x+\\frac\\pi3)$ 与 $\\cos(x-\\frac\\pi6)$ 识别为同一个函数；第二是统一函数名，例如把正弦与余弦都化成某个角的正弦；第三是降低次数，把平方转成倍角，或把乘积转成和差。做题前先写下目标，能避免展开后式子更乱。",
        "求值题强调‘角的拼接’。例如 $15^\\circ=45^\\circ-30^\\circ$，但不一定所有角都要拆成特殊角；如果题目同时给出 $\\alpha+\\beta$ 与某个三角值，保留整体往往更短。证明题则常从较复杂的一边出发，把它变成另一边，过程中每一步都应是恒等变形，并注明分母非零等条件。"
      ]},
      { title: "辅助角：把线性组合看成一个波", paragraphs: [
        "对于 $a\\sin x+b\\cos x$，设 $R=\\sqrt{a^2+b^2}$，可写成 $R\\sin(x+\\varphi)$，其中 $R\\cos\\varphi=a$、$R\\sin\\varphi=b$。这一变换把两个同频率函数合成一个函数，最适合处理最值、值域、零点和方程。若 $a,b$ 的符号不同，要根据 $\\cos\\varphi,\\sin\\varphi$ 的符号确定 $\\varphi$ 所在象限，不能只写一个反正切值。",
        "辅助角法并非万能。若正弦和余弦的角频率不同，或式子含平方、乘积，应先用倍角等公式统一频率。完成变换后，要把 $x+\\varphi$ 看作整体，再结合题目给定的 $x$ 范围确定整体角的范围；直接套 $[-1,1]$ 可能得到取不到的最值。"
      ]}
    ],
    framework: ["观察角之间是否存在和差、倍半关系", "明确目标是求值、证明、解方程还是求最值", "统一角、函数名或次数", "选择和差角、倍角或辅助角", "结合原变量范围检查等号能否取得"],
    errors: ["余弦和差公式中间符号写反", "辅助角只求振幅却忽略相位", "在限定区间内仍直接使用完整值域", "证明过程中约去可能为零的因子", "一看到公式就全部展开，失去原有整体结构"],
    examples: [
      { title: "特殊角求值", stem: "求 $\\sin15^\\circ$ 的精确值。", answer: "$\\frac{\\sqrt6-\\sqrt2}{4}$。", solution: ["取 $15^\\circ=45^\\circ-30^\\circ$。", "$\\sin15^\\circ=\\sin45^\\circ\\cos30^\\circ-\\cos45^\\circ\\sin30^\\circ=\\frac{\\sqrt6-\\sqrt2}{4}$。"], takeaway: "拆角应优先选两边三角值都熟悉的组合。" },
      { title: "倍角公式的选形", stem: "已知 $\\cos2\\alpha=\\frac13$，求 $\\sin^2\\alpha$。", answer: "$\\frac13$。", solution: ["目标只含 $\\sin^2\\alpha$，选 $\\cos2\\alpha=1-2\\sin^2\\alpha$。", "代入得 $\\frac13=1-2\\sin^2\\alpha$，故 $\\sin^2\\alpha=\\frac13$。"], takeaway: "同一个倍角公式有三种写法，要按目标选择。" },
      { title: "辅助角与最值", stem: "求函数 $f(x)=\\sqrt3\\sin x+\\cos x$ 的最大值，并写出取得最大值时 $x$ 的一组取值。", answer: "最大值为 $2$；例如 $x=\\frac\\pi3+2k\\pi\\,(k\\in\\mathbb Z)$。", solution: ["$f(x)=2(\\frac{\\sqrt3}{2}\\sin x+\\frac12\\cos x)=2\\sin(x+\\frac\\pi6)$。", "当 $x+\\frac\\pi6=\\frac\\pi2+2k\\pi$ 时取最大值 $2$，故 $x=\\frac\\pi3+2k\\pi$。"], takeaway: "辅助角既给出最值，也必须给出等号成立条件。" },
      { title: "限定区间内的整体范围", stem: "当 $x\\in[0,\\frac\\pi3]$ 时，求 $g(x)=\\sin x+\\sqrt3\\cos x$ 的最小值。", answer: "最小值为 $\\sqrt3$。", solution: ["$g(x)=2\\sin(x+\\frac\\pi3)$，且 $x+\\frac\\pi3\\in[\\frac\\pi3,\\frac{2\\pi}{3}]$。", "正弦在该区间先增后减，端点处均为 $\\frac{\\sqrt3}{2}$，所以最小值为 $\\sqrt3$，不是由完整周期直接得到的 $-2$。"], takeaway: "变量有限制时，先平移区间，再讨论整体角。" }
    ],
    summary: "恒等变换是一种目标驱动的整理。先观察角的结构，再决定统一什么；求最值常用辅助角，处理平方常用倍角，证明则从复杂一侧逐步靠近目标。最后一定把原变量范围带回来。"
  },
  {
    slug: "graphs-properties",
    title: "三角函数图像与性质",
    subtitle: "把解析式中的每个参数，翻译成图像上的一个动作。",
    estimatedMinutes: 65,
    goals: ["掌握正弦、余弦、正切的基本图像与性质", "理解 $A,\\omega,\\varphi,B$ 的几何意义", "会用五点法作图和由图求式", "能用整体代换求周期、单调区间与最值"],
    sections: [
      { title: "母函数：先熟悉一个周期", paragraphs: [
        "$y=\\sin x$ 与 $y=\\cos x$ 的定义域都是 $\\mathbb R$，值域为 $[-1,1]$，最小正周期为 $2\\pi$。正弦是奇函数，余弦是偶函数。正切函数定义域排除 $\\frac\\pi2+k\\pi$，值域为 $\\mathbb R$，最小正周期为 $\\pi$，并在每个连续区间上单调递增。图像题中，先画出关键点和渐近线，比凭印象判断更可靠。",
        "五点法针对正弦型函数的一个周期，核心整体角依次取 $0,\\frac\\pi2,\\pi,\\frac{3\\pi}{2},2\\pi$，对应函数值 $0,1,0,-1,0$。它不是固定取五个 $x$，而是先让 $\\omega x+\\varphi$ 取五个关键角，再反解 $x$。"
      ]},
      { title: "参数翻译：振幅、周期、相位和中线", paragraphs: [
        "对 $y=A\\sin(\\omega x+\\varphi)+B$，振幅是 $|A|$，中线是 $y=B$，值域为 $[B-|A|,B+|A|]$；当 $\\omega\\ne0$ 时，最小正周期 $T=\\frac{2\\pi}{|\\omega|}$。$A<0$ 表示关于中线翻转，不能把振幅写成负数。相位移动最好先提出 $\\omega$：$\\omega x+\\varphi=\\omega(x+\\frac\\varphi\\omega)$，从而看出水平移动量。",
        "由图求解析式时，先读最高值、最低值确定 $A,B$，再由相邻同类关键点的横向距离确定周期和 $\\omega$，最后用一个上升零点、最高点等可靠关键点求 $\\varphi$。相位并不唯一，应结合题目限定范围或选择最简表达；不同相位写法只要表示同一函数都应接受。"
      ]},
      { title: "性质问题：把内层角当作一个整体", paragraphs: [
        "求单调区间时，先设 $u=\\omega x+\\varphi$，把 $u$ 放入母函数的单调区间，再解关于 $x$ 的不等式。若 $\\omega<0$，解不等式时方向会改变，或者先把负号移到振幅中。求对称轴、对称中心也用同样思路：正弦型函数在最高、最低点处有对称轴，在零点与中线交点处有对称中心。",
        "图像平移要区分‘自变量替换’和‘整张图移动’。把 $y=f(x)$ 向右平移 $a$ 个单位得到 $y=f(x-a)$，式内符号与移动方向相反。若先伸缩后平移，顺序不同可能得到不同解析式。因此最好每一步都写出新的函数，而不是一次性心算。"
      ]}
    ],
    framework: ["化为 $A\\sin(\\omega x+\\varphi)+B$ 或余弦型", "读出振幅、中线、周期和值域", "令整体角进入母函数的关键区间", "需要作图时反解五个关键横坐标", "检查平移顺序、端点和周期表达"],
    errors: ["把 $A$ 当振幅而忘记绝对值", "周期公式漏掉 $|\\omega|$", "向右平移却写成 $f(x+a)$", "直接把母函数单调区间当作 $x$ 的区间", "由图求相位只代一个模糊点，未检查走势"],
    examples: [
      { title: "参数读取", stem: "求 $f(x)=2\\sin(3x-\\frac\\pi2)-1$ 的振幅、最小正周期和值域。", answer: "振幅 $2$，周期 $\\frac{2\\pi}{3}$，值域 $[-3,1]$。", solution: ["$A=2,\\omega=3,B=-1$。", "振幅 $|A|=2$，周期 $\\frac{2\\pi}{|3|}=\\frac{2\\pi}{3}$，值域为 $[-1-2,-1+2]=[-3,1]$。"], takeaway: "先化标准式，再逐项翻译参数。" },
      { title: "整体代换求单调区间", stem: "求 $f(x)=\\sin(2x+\\frac\\pi6)$ 的一个单调递增区间。", answer: "例如 $[-\\frac\\pi3,\\frac\\pi6]$。", solution: ["正弦在 $[-\\frac\\pi2,\\frac\\pi2]$ 上递增。令 $-\\frac\\pi2\\le2x+\\frac\\pi6\\le\\frac\\pi2$。", "解得 $-\\frac\\pi3\\le x\\le\\frac\\pi6$。加上周期平移还可得到全部区间。"], takeaway: "不是背新结论，而是让整体角落入母函数区间。" },
      { title: "由关键点求解析式", stem: "某正弦型函数最大值为 $3$，最小值为 $-1$，最小正周期为 $\\pi$，且图像在 $x=0$ 处从中线向上穿过。写出一个解析式。", answer: "$y=2\\sin2x+1$。", solution: ["中线 $B=\\frac{3+(-1)}2=1$，振幅 $A=\\frac{3-(-1)}2=2$。", "$T=\\pi$，故 $|\\omega|=2$。在 $x=0$ 从中线向上穿过，可取相位 $0$ 且 $A>0$，得到 $y=2\\sin2x+1$。"], takeaway: "先定纵向参数，再定周期，最后用走势确定相位。" },
      { title: "图像变换顺序", stem: "将 $y=\\sin x$ 的图像横坐标缩短为原来的 $\\frac12$，再向右平移 $\\frac\\pi4$，所得函数是什么？", answer: "$y=\\sin(2x-\\frac\\pi2)$。", solution: ["横坐标缩短为原来的 $\\frac12$ 后得到 $y=\\sin2x$。", "再向右平移 $\\frac\\pi4$，用 $x-\\frac\\pi4$ 替换 $x$：$y=\\sin[2(x-\\frac\\pi4)]=\\sin(2x-\\frac\\pi2)$。"], takeaway: "逐步写函数，尤其注意平移量会被内层频率放大。" }
    ],
    summary: "图像与性质题的稳定方法是‘标准化 + 参数翻译 + 整体代换’。母函数只需真正理解一次，复杂函数不过是伸缩、翻转和平移；任何性质最终都应回到整体角的范围。"
  },
  {
    slug: "solving-triangles",
    title: "解三角形",
    subtitle: "根据已知信息选择正弦定理、余弦定理或面积公式。",
    estimatedMinutes: 70,
    goals: ["掌握正弦定理、余弦定理和面积公式", "能根据边角结构选择更短的方法", "会处理三角形形状判断与实际测量", "知道 SSA 情形可能出现两解"],
    sections: [
      { title: "三件工具各自解决什么", paragraphs: [
        "在 $\\triangle ABC$ 中，角 $A,B,C$ 的对边分别为 $a,b,c$。正弦定理 $\\frac a{\\sin A}=\\frac b{\\sin B}=\\frac c{\\sin C}=2R$ 适合已知一组对边与对角，或已知两角一边；它擅长在边与对应角的正弦之间转换。余弦定理 $a^2=b^2+c^2-2bc\\cos A$ 适合已知两边及夹角求第三边，或已知三边求角，也是勾股定理在一般三角形中的推广。",
        "面积公式 $S=\\frac12bc\\sin A=\\frac12ca\\sin B=\\frac12ab\\sin C$ 把两边及夹角直接联系起来。遇到面积、内切圆半径、高等信息时，它经常成为中间桥梁。参考资料把常见题型概括为基本元素求解、形状判断、面积、求值和实际应用；真正做题时，应继续把这些题型还原成‘现在有哪些边角对应关系’。"
      ]},
      { title: "选公式：看条件结构，不看题目长短", paragraphs: [
        "若条件中同时出现某边和其对角，优先检查正弦定理；若出现三边平方、两边乘积或夹角余弦，优先检查余弦定理；若目标是面积，先看能否直接找到两边及夹角。含三角恒等式的条件，常先化简出某个角或角之间的关系，再进入解三角形。边角混合等式可用正弦定理把边化角，也可把角化边，选择未知量更少的一边。",
        "已知两边和其中一边的对角，即 SSA 情形，三角形可能有两解、一解或无解。由正弦定理求出 $\\sin B$ 后，$B$ 与 $\\pi-B$ 的正弦相同，必须结合 $A+B<\\pi$ 和‘大边对大角’检查。直接使用计算器的反正弦只返回一个主值，不能代替分类讨论。"
      ]},
      { title: "从计算走向建模与表达", paragraphs: [
        "形状判断题常把边的关系通过余弦定理转成角的关系。例如 $a^2=b^2+c^2$ 可推出 $A=90^\\circ$；$a^2>b^2+c^2$ 则说明最大边 $a$ 所对角 $A$ 为钝角。实际测量题要先画示意图，标清方位角、仰角、已知距离，再选定三角形，不能急着套公式。最后答案应包含单位，并检查边长为正、角在 $(0,\\pi)$ 内。",
        "新高考风格的解答题往往不是单纯代数计算，而是先用恒等变换得到角关系，再用正余弦定理求边或面积。规范过程应写明使用哪个定理、对应的边角是谁、解出的另一个角为何舍去。这样即使最后计算失误，前面的模型和公式仍可能获得过程分。"
      ]}
    ],
    framework: ["标出角与对边的一一对应", "整理已知量和目标量", "有对边对角用正弦定理，有两边夹角或三边用余弦定理", "面积问题检查 $\\frac12bc\\sin A$", "SSA 检查多解，最后验证边角范围与单位"],
    errors: ["把边 $a$ 对应到错误的角", "把非夹角代入余弦定理的夹角位置", "反正弦后遗漏补角解", "求出角后未检查三角形内角和", "实际问题缺少示意图、单位或舍解理由"],
    examples: [
      { title: "两边夹角求第三边", stem: "在 $\\triangle ABC$ 中，$b=5,c=7,A=60^\\circ$，求 $a$。", answer: "$a=\\sqrt{39}$。", solution: ["已知两边及夹角，使用余弦定理。", "$a^2=b^2+c^2-2bc\\cos A=25+49-70\\times\\frac12=39$，故 $a=\\sqrt{39}$。"], takeaway: "SAS 条件直接用余弦定理，解唯一。" },
      { title: "两角一边求面积", stem: "在 $\\triangle ABC$ 中，$A=45^\\circ,B=60^\\circ,a=2\\sqrt2$，求三角形面积。", answer: "$S=3+\\sqrt3$。", solution: ["$C=75^\\circ$。由正弦定理，$b=\\frac{a\\sin B}{\\sin A}=2\\sqrt3$。", "$S=\\frac12ab\\sin C=2\\sqrt6\\sin75^\\circ$。代入 $\\sin75^\\circ=\\frac{\\sqrt6+\\sqrt2}{4}$，化简得 $S=3+\\sqrt3$。"], takeaway: "长链计算应在最后独立复核一次，及时纠正中间估算。" },
      { title: "判断三角形形状", stem: "在 $\\triangle ABC$ 中，若 $a^2+c^2-b^2=ac$，判断角 $B$ 的大小。", answer: "$B=60^\\circ$。", solution: ["由余弦定理 $b^2=a^2+c^2-2ac\\cos B$。", "移项得 $a^2+c^2-b^2=2ac\\cos B$。与条件比较，$2ac\\cos B=ac$；因边长为正，故 $\\cos B=\\frac12$，所以 $B=60^\\circ$。"], takeaway: "出现三边平方关系，优先与余弦定理标准形比较。" },
      { title: "实际测量", stem: "河岸同侧两点 $A,B$ 相距 $100$ 米，测得对岸目标 $C$ 满足 $\\angle CAB=45^\\circ,\\angle CBA=60^\\circ$。求 $AC$（结果保留根式）。", answer: "$AC=50(3\\sqrt2-\\sqrt6)$ 米。", solution: ["三角形内角 $C=75^\\circ$，且 $AB=100$ 是角 $C$ 的对边。", "由正弦定理 $\\frac{AC}{\\sin60^\\circ}=\\frac{100}{\\sin75^\\circ}$，故 $AC=\\frac{50\\sqrt3}{\\sin75^\\circ}$。", "代入 $\\sin75^\\circ=\\frac{\\sqrt6+\\sqrt2}{4}$ 并有理化，得 $AC=50(3\\sqrt2-\\sqrt6)$ 米，约为 $89.7$ 米，与图形量级相符。"], takeaway: "实际题先画图，计算后用近似值检查量级，能发现根式化简错误。" }
    ],
    summary: "解三角形不是三个公式轮流试。看见对边对角关系就想到正弦定理，看见三边平方或两边夹角就想到余弦定理，面积则寻找两边及夹角。SSA、多解和实际情境中的单位，是最需要主动检查的地方。",
    reference: { title: "高中数学解三角形题型归纳总结", url: "https://www.sohu.com/a/275384354_120007351", note: "参考其基本元素、形状判断、面积和实际应用的题型分类；本页文字、例题和解答均重新编写并独立核算。" }
  }
];

export function getTrigonometryTopic(slug: string) {
  return trigonometryTopics.find((topic) => topic.slug === slug);
}
