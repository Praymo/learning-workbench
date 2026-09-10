import { AppNav } from "@/components/AppNav";
import { prisma } from "@/lib/db";

function level(score: number, count: number) {
  if (count < 3) return "证据不足";
  if (score < 40) return "需要补基础";
  if (score < 60) return "初步理解";
  if (score < 75) return "基本掌握";
  if (score < 90) return "较熟练";
  return "稳定掌握";
}

export default async function MasteryPage() {
  const mastery = await prisma.knowledgeMastery.findMany({ orderBy: [{ evidenceCount: "desc" }, { knowledgePoint: "asc" }] });
  const recent = await prisma.studentEvidence.findMany({ orderBy: { occurredAt: "desc" }, take: 12 });
  return (
    <main className="app-shell">
      <AppNav />
      <section className="page-header compact"><div><p className="eyebrow">本地学习证据</p><h1>知识点掌握档案</h1><p className="subtle">档案由已确认评分按透明规则计算，API不保存长期记忆。少于3条证据时不下稳定结论。</p></div></section>
      <section className="mastery-grid">
        {mastery.map((item) => <article className="panel" key={item.id}>
          <div className="worksheet-question-head"><strong>{item.knowledgePoint}</strong><span>{level(item.score, item.evidenceCount)}</span></div>
          <div className="mastery-score">{item.score.toFixed(1)}<small>/100</small></div>
          <p>{item.explanation}</p>
          <p className="subtle">有效证据 {item.evidenceCount} 条 · 算法 {item.algorithmVersion}</p>
        </article>)}
        {!mastery.length ? <p className="empty">完成并确认一次练习评分后，这里会开始积累证据。</p> : null}
      </section>
      <section className="panel">
        <h2>最近证据</h2>
        <table className="data-table"><thead><tr><th>知识点</th><th>类型</th><th>得分</th><th>错误</th><th>时间</th></tr></thead><tbody>
          {recent.map((item) => <tr key={item.id}><td>{item.knowledgePoint}</td><td>{item.evidenceType}</td><td>{item.score}/{item.maxScore}</td><td>{item.errorType ?? "无"}</td><td>{item.occurredAt.toLocaleDateString("zh-CN")}</td></tr>)}
        </tbody></table>
      </section>
    </main>
  );
}
