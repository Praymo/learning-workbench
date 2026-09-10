import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  const now = new Date();
  const [availableQuestions, submissions, activeWrong, dueWrong, stableKnowledge, recentPractice] = await Promise.all([
    prisma.question.count({ where: { status: "published" } }),
    prisma.submission.count(),
    prisma.wrongQuestion.count({ where: { status: { not: "mastered" } } }),
    prisma.wrongQuestion.count({ where: { status: { not: "mastered" }, nextReviewAt: { lte: now } } }),
    prisma.knowledgeMastery.count({ where: { evidenceCount: { gte: 3 } } }),
    prisma.practiceSet.findMany({ orderBy: { createdAt: "desc" }, take: 4, include: { _count: { select: { items: true } } } })
  ]);

  return (
    <main className="app-shell">
      <AppNav />
      <section className="page-header dashboard-header">
        <div>
          <p className="eyebrow">一次只解决一个问题</p>
          <h1>今天从哪里开始？</h1>
          <p className="subtle">先完成一组难度合适的练习，再根据确认后的错误安排复查。不用一次做很多，关键是把会做的题稳定拿分。</p>
        </div>
        <div className="action-row">
          <Link className="button primary" href="/practice">生成练习</Link>
          <Link className="button" href="/wrong-questions">复查错题{dueWrong ? `（${dueWrong}）` : ""}</Link>
        </div>
      </section>

      <section className="metrics-grid student-metrics">
        <article className="metric"><span>可用练习题</span><strong>{availableQuestions}</strong><small>只选答案解析完整的题</small></article>
        <article className="metric"><span>已提交答卷</span><strong>{submissions}</strong><small>确认后才计入记录</small></article>
        <article className="metric"><span>仍需复查</span><strong>{activeWrong}</strong><small>{dueWrong ? `${dueWrong} 道已到时间` : "目前没有到期任务"}</small></article>
        <article className="metric"><span>证据充分的知识点</span><strong>{stableKnowledge}</strong><small>至少有 3 条有效作答证据</small></article>
      </section>

      <section className="home-section compact-home-section">
        <div className="section-heading"><p className="eyebrow">三种训练目的</p><h2>根据现在最需要提高的地方选择</h2></div>
        <div className="workflow-grid">
          <Link href="/practice?mode=stability" className="workflow-card"><span>01</span><h3>客观题稳定</h3><p>基础与中档为主，控制末位难题比例，减少会做却丢分。</p><b>开始稳定训练 →</b></Link>
          <Link href="/practice?mode=solution" className="workflow-card featured"><span>02</span><h3>解答题过程</h3><p>围绕关键条件、公式依据和中间推导训练过程分。</p><b>开始过程训练 →</b></Link>
          <Link href="/practice?mode=transfer" className="workflow-card"><span>03</span><h3>迁移与综合</h3><p>少量陌生设问和跨知识点题，练习从条件中识别熟悉模型。</p><b>开始迁移训练 →</b></Link>
        </div>
      </section>

      <section className="panel recent-learning">
        <div className="section-heading-row"><div><h2>最近生成的练习</h2><p className="subtle">继续完成，或打开答案版复盘。</p></div><Link href="/practice">查看全部</Link></div>
        {recentPractice.length ? <div className="recent-practice-list">{recentPractice.map((practice) => (
          <Link key={practice.id} href={`/practice/${practice.id}`}><strong>{practice.title}</strong><span>{practice._count.items} 题 · 约 {practice.estimatedMinutes} 分钟</span></Link>
        ))}</div> : <p className="empty">还没有练习。先生成一组 30—45 分钟的训练。</p>}
      </section>
    </main>
  );
}
