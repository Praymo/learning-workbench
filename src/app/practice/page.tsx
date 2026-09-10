import { redirect } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { createPracticeSet, type PracticeMode } from "@/lib/practice";
import type { DifficultyProfile } from "@/lib/practiceSelection";
import { getPublishedKnowledgePoints } from "@/lib/questionBank";

export default async function PracticePage() {
  const knowledgePoints = await getPublishedKnowledgePoints();

  async function create(formData: FormData) {
    "use server";
    const mode = String(formData.get("mode") ?? "stability") as PracticeMode;
    const targetMinutes = Number(formData.get("targetMinutes") ?? (mode === "stability" ? 30 : 45));
    const requestedCount = Number(formData.get("requestedCount") || 0) || undefined;
    const difficultyProfile = String(formData.get("difficultyProfile") ?? "balanced") as DifficultyProfile;
    const gradeScope = String(formData.get("gradeScope") ?? "high_two") as "high_one" | "high_two" | "all_published";
    const practice = await createPracticeSet({
      mode,
      targetMinutes,
      requestedCount,
      difficultyProfile,
      gradeScope,
      knowledgePoint: String(formData.get("knowledgePoint") ?? "") || undefined
    });
    redirect(`/practice/${practice.id}`);
  }

  return (
    <main className="app-shell">
      <AppNav />
      <section className="page-header compact">
        <div>
          <p className="eyebrow">只从已发布题库选题</p>
          <h1>生成一次有明确目的的练习</h1>
          <p className="subtle">不调用模型，不临时编题。系统按训练目的、知识点和时间预算选择本地已核验题目。</p>
        </div>
      </section>
      <section className="training-modes">
        <article><strong>客观题稳定</strong><span>8-10题 · 25-35分钟</span><p>减少概念、计算和多选决策失分。</p></article>
        <article><strong>解答题过程分</strong><span>2题 · 35-50分钟</span><p>练关键条件、推导和规范表达。</p></article>
        <article><strong>迁移与综合</strong><span>1-2题 · 每周一次</span><p>面对陌生设问仍能找到已有模型。</p></article>
      </section>
      <section className="panel narrow">
        <form className="edit-form" action={create}>
          <label>训练模式
            <select name="mode" defaultValue="stability">
              <option value="stability">客观题稳定训练</option>
              <option value="process">解答题过程分训练</option>
              <option value="transfer">迁移与综合训练</option>
            </select>
          </label>
          <label>知识点
            <select name="knowledgePoint" defaultValue="">
              <option value="">全部已学知识点</option>
              {knowledgePoints.map((point) => <option key={point} value={point}>{point}</option>)}
            </select>
          </label>
          <label>已学范围
            <select name="gradeScope" defaultValue="high_two">
              <option value="high_one">仅高一模块</option>
              <option value="high_two">准高二已学模块（推荐）</option>
              <option value="all_published">全部已发布题库</option>
            </select>
          </label>
          <label>当前训练强度
            <select name="difficultyProfile" defaultValue="balanced">
              <option value="foundation_transition">基础过渡（50%基础）</option>
              <option value="balanced">标准训练（推荐，30%基础）</option>
              <option value="advancing">逐步提升（35%提升题）</option>
            </select>
          </label>
          <label>时间预算（分钟）<input name="targetMinutes" type="number" min="10" max="120" defaultValue="30" /></label>
          <label>题量（留空采用推荐值）<input name="requestedCount" type="number" min="1" max="12" placeholder="推荐：客观9题，解答2题" /></label>
          <button className="primary">生成练习</button>
        </form>
      </section>
    </main>
  );
}
