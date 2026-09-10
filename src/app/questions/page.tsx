import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { MathContent } from "@/lib/mathContent";
import { parseJsonArray, searchQuestions } from "@/lib/questionBank";

export default async function QuestionsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const result = await searchQuestions(params);
  const questions = result.questions;
  function pageHref(page: number) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string" && value) query.set(key, value);
    }
    query.set("page", String(page));
    if (!query.has("status")) query.set("status", result.status);
    return `/questions?${query.toString()}`;
  }

  return (
    <main className="app-shell">
      <AppNav />
      <section className="page-header compact">
        <div>
          <h1>题库浏览</h1>
          <p className="subtle">支持关键词、年份、卷型、来源、知识点、难度和审核状态筛选。</p>
        </div>
      </section>
      <section className="panel">
        <form className="filter-grid">
          <input name="q" placeholder="关键词" defaultValue={String(params.q ?? "")} />
          <input name="year" placeholder="年份" defaultValue={String(params.year ?? "")} />
          <input name="paperType" placeholder="卷型" defaultValue={String(params.paperType ?? "")} />
          <select name="sourceType" defaultValue={String(params.sourceType ?? "")}>
            <option value="">全部来源</option>
            <option value="gaokao">高考真题</option>
            <option value="workbook">教辅</option>
            <option value="joint_exam">联考</option>
            <option value="manual_upload">手动上传</option>
            <option value="generated_template">本地基础模板题</option>
            <option value="ai_variant">AI 变式</option>
          </select>
          <select name="questionType" defaultValue={String(params.questionType ?? "")}>
            <option value="">全部题型</option>
            <option value="single_choice">单项选择</option>
            <option value="multiple_choice">多项选择</option>
            <option value="fill_blank">填空题</option>
            <option value="solution">解答题</option>
          </select>
          <input name="knowledge" placeholder="知识点" defaultValue={String(params.knowledge ?? "")} />
          <select name="difficulty" defaultValue={String(params.difficulty ?? "")}>
            <option value="">全部难度</option>
            <option value="基础">基础</option>
            <option value="中档">中档</option>
            <option value="综合">综合</option>
            <option value="挑战">挑战</option>
          </select>
          <select name="reviewStatus" defaultValue={String(params.reviewStatus ?? "")}>
            <option value="">全部审核状态</option>
            <option value="pending_review">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
          </select>
          <select name="status" defaultValue={result.status}>
            <option value="">全部数据状态</option>
            <option value="candidate">候选</option>
            <option value="parsed">已拆题</option>
            <option value="solved">已有解答</option>
            <option value="verified">已核验待发布</option>
            <option value="published">可正式使用</option>
            <option value="rejected">不采用</option>
          </select>
          <button className="primary">筛选</button>
        </form>
      </section>

      <section className="question-list">
        {questions.length ? questions.map((question) => (
          <Link className="question-card" href={`/questions/${question.id}`} key={question.id}>
            <div className="question-meta">
              <span>{question.source.year ?? "未知年份"}</span>
              <span>{question.source.paperType ?? question.source.sourceType}</span>
              <span>题号 {question.sourceQuestionNumber ?? "未标注"}</span>
              <span>{question.questionType}</span>
              <span>{question.status}</span>
            </div>
            <h2><MathContent text={question.stem} /></h2>
            <p className="subtle">
              {question.primaryKnowledgePoint ?? "未标知识点"} · {question.difficulty ?? "未标难度"} · {parseJsonArray(question.methodTagsJson).join("、") || "未标方法"}
            </p>
          </Link>
        )) : <p className="empty">没有匹配的题目。可以调整筛选条件或先导入数据。</p>}
      </section>
      <nav className="pagination" aria-label="题库分页">
        <span>共 {result.total} 道 · 第 {result.page}/{Math.max(1, Math.ceil(result.total / result.pageSize))} 页</span>
        <div>
          {result.page > 1 ? <Link className="button" href={pageHref(result.page - 1)}>上一页</Link> : null}
          {result.page * result.pageSize < result.total ? <Link className="button" href={pageHref(result.page + 1)}>下一页</Link> : null}
        </div>
      </nav>
    </main>
  );
}
