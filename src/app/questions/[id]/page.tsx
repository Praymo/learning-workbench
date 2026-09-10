import { notFound, redirect } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { MathContent } from "@/lib/mathContent";
import { getQuestion, parseJsonArray, updateQuestion } from "@/lib/questionBank";
import { modelConfiguration, runJsonModel } from "@/lib/modelClient";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { contentFingerprint, modelFingerprint, similarityFingerprint } from "@/lib/questionQuality";

export default async function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = await getQuestion(id);
  if (!question) notFound();
  const model = modelConfiguration();

  async function generateAiDraft() {
    "use server";
    const current = await prisma.question.findUnique({ where: { id }, include: { source: true } });
    if (!current) throw new Error("题目不存在");
    const config = modelConfiguration();
    if (!config.configured || !config.fastModel) throw new Error("请先配置 LLM_API_KEY 和 MODEL_FAST");
    const result = await runJsonModel<{ answer?: string; solution?: string; confidence?: number; checks?: string[] }>({
      task: "question_solution_draft",
      promptVersion: "question-solution-draft-v1",
      model: config.fastModel,
      system: "你负责独立求解中国高中数学题。输出严格JSON：{answer:string,solution:string,confidence:number,checks:string[]}。解答要符合高中课程范围，写出关键条件和完整推导；选择题必须核对所有选项，填空题给出精确形式。不要引用未提供的标准答案。confidence取0到1。",
      payload: {
        questionType: current.questionType,
        stem: current.stem,
        options: parseJsonArray(current.optionsJson),
        score: current.score,
        knowledgePoint: current.primaryKnowledgePoint,
        source: current.source.name,
      },
    });
    if (!result.answer?.trim() || !result.solution?.trim()) throw new Error("模型未返回完整答案与解析");
    await prisma.question.update({
      where: { id },
      data: {
        aiAnswerDraft: result.answer.trim(),
        aiSolutionDraft: result.solution.trim(),
        aiSolutionStatus: (result.confidence ?? 0) >= 0.8 ? "pending_review" : "needs_review",
        aiSolutionModel: config.fastModel,
        aiSolvedAt: new Date(),
      },
    });
    revalidatePath(`/questions/${id}`);
  }

  async function approveAiDraft() {
    "use server";
    const current = await prisma.question.findUnique({ where: { id } });
    if (!current?.aiAnswerDraft || !current.aiSolutionDraft) throw new Error("没有可确认的AI草案");
    await prisma.question.update({
      where: { id },
      data: {
        answer: current.aiAnswerDraft,
        solution: current.aiSolutionDraft,
        aiSolutionStatus: "human_approved",
        verificationStatus: "ai_solved_human_approved",
        status: current.status === "candidate" || current.status === "parsed" ? "solved" : current.status,
      },
    });
    revalidatePath(`/questions/${id}`);
  }

  async function generateAiVariant(formData: FormData) {
    "use server";
    const current = await prisma.question.findUnique({ where: { id }, include: { source: true } });
    if (!current || current.status !== "published") throw new Error("只有已发布并核验的基题可以生成变式候选");
    const config = modelConfiguration();
    if (!config.configured || !config.fastModel) throw new Error("请先配置 LLM_API_KEY 和 MODEL_FAST");
    const changeRequest = String(formData.get("changeRequest") ?? "").trim() || "改变参数或设问，保持核心方法，难度略有提升";
    const result = await runJsonModel<{
      stem?: string; options?: string[]; answer?: string; solution?: string;
      questionType?: string; relatedKnowledgePoints?: string[]; methodTags?: string[];
      difficultyDelta?: number; changeSummary?: string; checks?: string[];
    }>({
      task: "question_variant_candidate",
      promptVersion: "question-variant-candidate-v1",
      model: config.fastModel,
      system: "基于一道人类核验的高中数学基题生成一题可审核变式。不得照抄题干，不得超出高中课程，不得伪装成真题。优先改变参数、条件、设问或增加一个相关知识点，保持题意完整且答案唯一。输出严格JSON：{stem:string,options:string[],answer:string,solution:string,questionType:string,relatedKnowledgePoints:string[],methodTags:string[],difficultyDelta:number,changeSummary:string,checks:string[]}。difficultyDelta限制在-0.5到0.8。解析必须独立算出并检查最终答案。",
      payload: {
        baseQuestionId: current.id,
        questionType: current.questionType,
        stem: current.stem,
        options: parseJsonArray(current.optionsJson),
        answer: current.answer,
        solution: current.solution,
        knowledgePoint: current.primaryKnowledgePoint,
        methodTags: parseJsonArray(current.methodTagsJson),
        requestedChange: changeRequest,
      },
    });
    if (!result.stem?.trim() || !result.answer?.trim() || !result.solution?.trim()) throw new Error("模型未返回完整变式题、答案与解析");
    const questionType = ["single_choice", "multiple_choice", "fill_blank", "solution"].includes(result.questionType ?? "") ? result.questionType! : current.questionType;
    const options = Array.isArray(result.options) ? result.options.map(String).filter(Boolean) : [];
    if (["single_choice", "multiple_choice"].includes(questionType) && options.length < 4) throw new Error("变式选择题选项不完整，未进入候选库");
    const stem = result.stem.trim();
    const contentHash = contentFingerprint([stem, ...options].join("\n"));
    const similarityKey = similarityFingerprint([stem, ...options].join("\n"));
    const duplicate = await prisma.question.findFirst({ where: { OR: [{ contentHash }, { similarityKey }] }, select: { id: true } });
    if (duplicate) throw new Error(`变式与现有题目重复，未保存（${duplicate.id}）`);
    const source = await prisma.source.upsert({
      where: { id: "src-ai-variant-candidates-v1" },
      update: {},
      create: { id: "src-ai-variant-candidates-v1", name: "AI 变式候选 v1", sourceType: "ai_variant", licenseNote: "基于已核验基题生成；仅作候选，人工审批后方可发布。" },
    });
    const related = Array.isArray(result.relatedKnowledgePoints) ? result.relatedKnowledgePoints.map(String) : parseJsonArray(current.relatedKnowledgePointsJson);
    const methods = Array.isArray(result.methodTags) ? result.methodTags.map(String) : parseJsonArray(current.methodTagsJson);
    const difficultyDelta = Math.max(-0.5, Math.min(0.8, Number(result.difficultyDelta) || 0));
    const variant = await prisma.question.create({
      data: {
        sourceId: source.id,
        questionType,
        stem,
        optionsJson: JSON.stringify(options),
        answer: result.answer.trim(),
        solution: result.solution.trim(),
        primaryKnowledgePoint: current.primaryKnowledgePoint,
        relatedKnowledgePointsJson: JSON.stringify(related),
        methodTagsJson: JSON.stringify(methods),
        parentQuestionId: current.id,
        status: "candidate",
        reviewStatus: "pending_review",
        verificationStatus: "ai_generated_unverified",
        difficulty: current.difficulty,
        difficultyScore: Math.max(1, Math.min(5, (current.difficultyScore ?? 2.7) + difficultyDelta)),
        difficultyVersion: "ai-variant-v1",
        estimatedMinutes: current.estimatedMinutes,
        score: current.score,
        examSection: questionType,
        sourceDataset: "ai_variant_candidate_v1",
        contentHash,
        similarityKey,
        modelKey: modelFingerprint({ stem, questionType, primaryKnowledgePoint: current.primaryKnowledgePoint, relatedKnowledgePoints: related, methodTags: methods }),
        qualityFlagsJson: JSON.stringify(["ai_variant", "requires_independent_verification", result.changeSummary ?? changeRequest]),
      },
    });
    redirect(`/questions/${variant.id}`);
  }

  async function saveRubricPoint(formData: FormData) {
    "use server";
    const pointId = String(formData.get("pointId") ?? "");
    if (!pointId) return;
    const list = (name: string) => String(formData.get(name) ?? "").split(/[，,、\n]+/).map((item) => item.trim()).filter(Boolean);
    await prisma.rubricPoint.update({
      where: { id: pointId },
      data: {
        rubricCode: String(formData.get("rubricCode") ?? "") || null,
        subQuestion: String(formData.get("subQuestion") ?? "") || null,
        label: String(formData.get("label") ?? "评分点"),
        description: String(formData.get("description") ?? ""),
        points: Math.max(1, Number(formData.get("points") ?? 1)),
        requiredCondition: String(formData.get("requiredCondition") ?? "") || null,
        alternativesJson: JSON.stringify(list("alternatives")),
        acceptedMethodsJson: JSON.stringify(list("acceptedMethods")),
        dependsOnJson: JSON.stringify(list("dependsOn")),
        followThroughAllowed: formData.get("followThroughAllowed") === "on",
        fatalError: formData.get("fatalError") === "on",
        commonErrorsJson: JSON.stringify(list("commonErrors")),
        evidenceRequired: String(formData.get("evidenceRequired") ?? "") || null,
      },
    });
    revalidatePath(`/questions/${id}`);
  }

  async function addRubricPoint() {
    "use server";
    const count = await prisma.rubricPoint.count({ where: { questionId: id } });
    await prisma.rubricPoint.create({
      data: { questionId: id, order: count + 1, rubricCode: `P${count + 1}`, label: `评分点${count + 1}`, description: "待细化", points: 1 }
    });
    revalidatePath(`/questions/${id}`);
  }

  async function saveSolutionMethod(formData: FormData) {
    "use server";
    const methodId = String(formData.get("methodId") ?? "");
    if (!methodId) return;
    const signals = String(formData.get("signals") ?? "").split(/[，,、\n]+/).map((item) => item.trim()).filter(Boolean);
    await prisma.solutionMethod.update({
      where: { id: methodId },
      data: {
        name: String(formData.get("name") ?? "未命名方法"),
        summary: String(formData.get("summary") ?? ""),
        recognitionSignalsJson: JSON.stringify(signals),
        applicableConditions: String(formData.get("applicableConditions") ?? "") || null,
        steps: String(formData.get("steps") ?? ""),
        strengths: String(formData.get("strengths") ?? "") || null,
        risks: String(formData.get("risks") ?? "") || null,
        estimatedMinutes: Number(formData.get("estimatedMinutes") || 0) || null,
        isRecommended: formData.get("isRecommended") === "on",
        verificationStatus: String(formData.get("verificationStatus") ?? "pending_review"),
      },
    });
    revalidatePath(`/questions/${id}`);
  }

  async function addSolutionMethod() {
    "use server";
    const count = await prisma.solutionMethod.count({ where: { questionId: id } });
    await prisma.solutionMethod.create({
      data: { questionId: id, order: count + 1, name: `方法${count + 1}`, summary: "待整理", steps: "待整理" },
    });
    revalidatePath(`/questions/${id}`);
  }

  async function saveQuestion(formData: FormData) {
    "use server";
    const tags = String(formData.get("methodTags") ?? "").split(/[,\s，、]+/).filter(Boolean);
    await updateQuestion(id, {
      stem: String(formData.get("stem") ?? ""),
      stemLatex: String(formData.get("stemLatex") ?? ""),
      answer: String(formData.get("answer") ?? ""),
      solution: String(formData.get("solution") ?? ""),
      difficulty: String(formData.get("difficulty") ?? ""),
      primaryKnowledgePoint: String(formData.get("primaryKnowledgePoint") ?? ""),
      methodTags: tags,
      reviewStatus: String(formData.get("reviewStatus") ?? "approved"),
      verificationStatus: String(formData.get("verificationStatus") ?? "verified"),
      status: String(formData.get("status") ?? "verified"),
      questionType: String(formData.get("questionType") ?? "single_choice"),
      score: Number(formData.get("score") || 0) || undefined
    });
    redirect(`/questions/${id}`);
  }

  return (
    <main className="app-shell">
      <AppNav />
      <section className="page-header compact">
        <div>
          <h1>题目详情</h1>
          <p className="subtle">{question.source.name} · 题号 {question.sourceQuestionNumber ?? "未标注"}</p>
        </div>
      </section>

      <section className="detail-layout">
        <article className="panel">
          <h2>正式显示</h2>
          <div className="question-display"><MathContent text={question.stem} latex={question.stemLatex} /></div>
          {parseJsonArray(question.optionsJson).length ? (
            <ol className="options-list">
              {parseJsonArray(question.optionsJson).map((option) => <li key={option}><MathContent text={option} /></li>)}
            </ol>
          ) : null}
          <p><strong>答案：</strong><MathContent text={question.answer ?? "未录入"} /></p>
          <p><strong>解析：</strong><MathContent text={question.solution ?? "未录入"} /></p>
          <dl className="meta-list">
            <dt>来源</dt><dd>{question.source.name}</dd>
            <dt>页码</dt><dd>{question.sourcePage ?? "未标注"}</dd>
            <dt>知识点</dt><dd>{question.primaryKnowledgePoint ?? "未标注"}</dd>
            <dt>题型</dt><dd>{question.questionType}</dd>
            <dt>原卷位置</dt><dd>{question.positionInSection && question.sectionSize ? `${question.positionInSection}/${question.sectionSize}` : "待核验"}</dd>
            <dt>位置难度</dt><dd>{question.positionDifficulty === null ? "待核验" : question.positionDifficulty.toFixed(2)}</dd>
            <dt>综合难度分</dt><dd>{question.difficultyScore?.toFixed(1) ?? "待核验"} / 5（{question.difficultyVersion ?? "未评分"}）</dd>
            <dt>近似指纹</dt><dd className="mono">{question.similarityKey?.slice(0, 12) ?? "待生成"}</dd>
            <dt>模型指纹</dt><dd>{question.modelKey ?? "待生成"}</dd>
            <dt>分值</dt><dd>{question.score ?? "未标注"}</dd>
            <dt>数据状态</dt><dd>{question.status}</dd>
            <dt>方法标签</dt><dd>{parseJsonArray(question.methodTagsJson).join("、") || "未标注"}</dd>
            <dt>审核记录</dt><dd>{question.verificationStatus} / {question.reviewStatus}</dd>
          </dl>
          {question.sourceEvidence.length ? <div className="evidence-list"><h3>原卷证据</h3>{question.sourceEvidence.map((evidence) => <p key={evidence.id}><strong>{evidence.source.name}</strong><span>{evidence.sourcePage ? `第 ${evidence.sourcePage.pageNumber} 页` : "已匹配试卷，页码待核验"}</span><small>{evidence.matchStatus} · {evidence.matchMethod}</small></p>)}</div> : null}
        </article>

        <article className="panel">
          <h2>AI 独立解题草案</h2>
          <p className="subtle">模型只生成可审核草案，不会自动覆盖正式答案。相同输入会读取本地缓存。</p>
          {question.aiAnswerDraft ? (
            <>
              <p><strong>草案答案：</strong><MathContent text={question.aiAnswerDraft} /></p>
              <p><strong>草案解析：</strong><MathContent text={question.aiSolutionDraft ?? ""} /></p>
              <p className="subtle">{question.aiSolutionStatus} · {question.aiSolutionModel ?? "未知模型"}</p>
              {question.aiSolutionStatus !== "human_approved" ? <form action={approveAiDraft}><button className="primary">人工确认并采用</button></form> : null}
            </>
          ) : <p className="empty">尚未生成草案。</p>}
          {model.configured && model.fastModel
            ? <form action={generateAiDraft}><button>{question.aiAnswerDraft ? "重新生成并复核" : "生成 AI 解答草案"}</button></form>
            : <p className="warning-text">配置 LLM_API_KEY 和 MODEL_FAST 后可使用。</p>}
        </article>

        {question.questionType === "solution" ? <article className="panel rubric-editor">
          <div className="section-heading-row"><div><h2>详细评分细则</h2><p className="subtle">评分代码和证据要求完整后，模型才允许逐点评分。</p></div><form action={addRubricPoint}><button>增加评分点</button></form></div>
          {question.rubricPoints.map((point) => <form className="rubric-point-form" action={saveRubricPoint} key={point.id}>
            <input type="hidden" name="pointId" value={point.id} />
            <label>代码<input name="rubricCode" defaultValue={point.rubricCode ?? `P${point.order}`} /></label>
            <label>小问<input name="subQuestion" defaultValue={point.subQuestion ?? ""} placeholder="例如（1）" /></label>
            <label>名称<input name="label" defaultValue={point.label} /></label>
            <label>分值<input name="points" type="number" min="1" defaultValue={point.points} /></label>
            <label className="wide">评分说明<textarea name="description" defaultValue={point.description} /></label>
            <label className="wide">必须出现的证据<textarea name="evidenceRequired" defaultValue={point.evidenceRequired ?? ""} placeholder="例如：明确写出法向量及其来源" /></label>
            <label className="wide">成立条件<input name="requiredCondition" defaultValue={point.requiredCondition ?? ""} /></label>
            <label>允许方法<input name="acceptedMethods" defaultValue={parseJsonArray(point.acceptedMethodsJson).join("、")} /></label>
            <label>等价表达<input name="alternatives" defaultValue={parseJsonArray(point.alternativesJson).join("、")} /></label>
            <label>依赖评分点<input name="dependsOn" defaultValue={parseJsonArray(point.dependsOnJson).join("、")} /></label>
            <label>常见错误<input name="commonErrors" defaultValue={parseJsonArray(point.commonErrorsJson).join("、")} /></label>
            <label className="check"><input name="followThroughAllowed" type="checkbox" defaultChecked={point.followThroughAllowed} />允许顺错给分</label>
            <label className="check"><input name="fatalError" type="checkbox" defaultChecked={point.fatalError} />该错误会阻断后续</label>
            <button className="primary">保存评分点</button>
          </form>)}
          {!question.rubricPoints.length ? <p className="empty">尚无评分点，请先增加。</p> : null}
        </article> : null}

        <article className="panel rubric-editor">
          <div className="section-heading-row"><div><h2>多解法与方法选择</h2><p className="subtle">只保存思路真正不同的方法，并说明什么时候优先使用。</p></div><form action={addSolutionMethod}><button>增加一种方法</button></form></div>
          {question.solutionMethods.map((method) => <form className="solution-method-form" action={saveSolutionMethod} key={method.id}>
            <input type="hidden" name="methodId" value={method.id} />
            <label>方法名称<input name="name" defaultValue={method.name} /></label>
            <label>预计时间<input name="estimatedMinutes" type="number" min="1" defaultValue={method.estimatedMinutes ?? ""} /></label>
            <label>核验状态<select name="verificationStatus" defaultValue={method.verificationStatus}><option value="pending_review">待审核</option><option value="human_verified">人工核验</option><option value="rejected">不采用</option></select></label>
            <label className="check"><input name="isRecommended" type="checkbox" defaultChecked={method.isRecommended} />当前推荐</label>
            <label className="wide">方法概述<textarea name="summary" defaultValue={method.summary} /></label>
            <label className="wide">识别信号<input name="signals" defaultValue={parseJsonArray(method.recognitionSignalsJson).join("、")} /></label>
            <label className="wide">适用条件<input name="applicableConditions" defaultValue={method.applicableConditions ?? ""} /></label>
            <label className="wide">完整步骤<textarea name="steps" defaultValue={method.steps} /></label>
            <label className="wide">优势<input name="strengths" defaultValue={method.strengths ?? ""} /></label>
            <label className="wide">风险<input name="risks" defaultValue={method.risks ?? ""} /></label>
            <button className="primary">保存方法</button>
          </form>)}
          {!question.solutionMethods.length ? <p className="empty">尚未整理替代方法。</p> : null}
        </article>

        <article className="panel">
          <h2>生成 AI 变式候选</h2>
          <p className="subtle">仅以当前已发布题为基题。生成结果进入 candidate，不会进入正式练习；需要你核对题干、答案、解析、难度和重复情况后再发布。</p>
          {question.status === "published" && model.configured && model.fastModel ? <form className="edit-form" action={generateAiVariant}>
            <label>希望怎样变化<textarea name="changeRequest" placeholder="例如：改变参数并反转设问；增加一个函数性质条件；难度提高约0.3" /></label>
            <button>生成候选并进入审核页</button>
          </form> : <p className="warning-text">需要当前题已发布，并配置 LLM_API_KEY 与 MODEL_FAST。</p>}
        </article>

        <form className="panel edit-form" action={saveQuestion}>
          <h2>编辑并保存</h2>
          <label>题干<textarea name="stem" defaultValue={question.stem} /></label>
          <label>题干独立 LaTeX<textarea name="stemLatex" defaultValue={question.stemLatex ?? ""} /></label>
          <label>答案<input name="answer" defaultValue={question.answer ?? ""} /></label>
          <label>解析<textarea name="solution" defaultValue={question.solution ?? ""} /></label>
          <label>题型
            <select name="questionType" defaultValue={question.questionType}>
              <option value="single_choice">单项选择</option>
              <option value="multiple_choice">多项选择</option>
              <option value="fill_blank">填空题</option>
              <option value="solution">解答题</option>
            </select>
          </label>
          <label>分值<input name="score" type="number" min="1" defaultValue={question.score ?? ""} /></label>
          <label>难度<input name="difficulty" defaultValue={question.difficulty ?? ""} /></label>
          <label>主知识点<input name="primaryKnowledgePoint" defaultValue={question.primaryKnowledgePoint ?? ""} /></label>
          <label>方法标签<input name="methodTags" defaultValue={parseJsonArray(question.methodTagsJson).join("、")} /></label>
          <label>核验状态<input name="verificationStatus" defaultValue={question.verificationStatus} /></label>
          <label>审核状态<input name="reviewStatus" defaultValue={question.reviewStatus} /></label>
          <label>数据状态
            <select name="status" defaultValue={question.status}>
              <option value="candidate">候选</option>
              <option value="parsed">已拆题</option>
              <option value="solved">已有解答</option>
              <option value="verified">已核验待发布</option>
              <option value="published">可正式使用</option>
              <option value="rejected">不采用</option>
            </select>
          </label>
          <button className="primary">保存</button>
        </form>
      </section>
    </main>
  );
}
