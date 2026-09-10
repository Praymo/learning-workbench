import { redirect } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { MathContent } from "@/lib/mathContent";
import { prisma } from "@/lib/db";
import { createWrongQuestionReviewSet } from "@/lib/wrongQuestions";

const statusLabel: Record<string, string> = { needs_review: "待复查", reviewing: "复查中", mastered: "已稳定" };

export default async function WrongQuestionsPage() {
  async function createReview(formData: FormData) {
    "use server";
    const count = Math.max(1, Math.min(Number(formData.get("count")) || 6, 10));
    const practice = await createWrongQuestionReviewSet(count);
    redirect(`/practice/${practice.id}`);
  }

  const items = await prisma.wrongQuestion.findMany({
    include: { question: { include: { source: true } } },
    orderBy: [{ status: "asc" }, { nextReviewAt: "asc" }],
  });
  const now = new Date();
  const active = items.filter((item) => item.status !== "mastered");
  const due = active.filter((item) => item.nextReviewAt <= now);
  return <main className="app-shell"><AppNav />
    <section className="page-header compact"><div><p className="eyebrow">少量、按时、再确认</p><h1>错题复查</h1><p className="subtle">只有确认后的评分会进入这里。连续两次复查正确，才标记为稳定。</p></div></section>
    <section className="metrics-grid"><article><strong>{active.length}</strong><span>仍需复查</span></article><article><strong>{due.length}</strong><span>已到复查时间</span></article><article><strong>{items.length - active.length}</strong><span>已稳定</span></article></section>
    <section className="panel review-actions"><div><h2>生成复查练习</h2><p className="subtle">优先原错题；有余量时补同模型迁移题，不用重复题凑数。</p></div><form action={createReview}><label>题量<input name="count" type="number" min="1" max="10" defaultValue="6" /></label><button className="button primary" type="submit" disabled={!active.length}>生成复查卷</button></form></section>
    <section className="wrong-question-list">{items.map((item) => <article className="wrong-question-card" key={item.id}><div className="worksheet-question-head"><strong>{item.knowledgePoint}</strong><span>{statusLabel[item.status] ?? item.status}</span></div><div className="question-display"><MathContent text={item.question.stem} /></div><div className="meta-row"><span>错误 {item.wrongCount} 次</span><span>连续复查正确 {item.correctStreak} 次</span><span>下次 {item.nextReviewAt.toLocaleDateString("zh-CN")}</span></div><p className="subtle">最近错误：{item.errorType ?? "待归因"} · 来源：{item.question.source.name}</p></article>)}{!items.length ? <p className="empty">目前没有已确认错题。先完成一套练习并确认评分，这里才会建立复查任务。</p> : null}</section>
  </main>;
}
