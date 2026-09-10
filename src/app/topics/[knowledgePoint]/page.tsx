import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { MathContent } from "@/lib/mathContent";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/questionBank";
import Link from "next/link";
import { getTopicLessons } from "@/lib/topicLessonCatalog";

function List({ values }: { values: string[] }) { return <ol>{values.map((value) => <li key={value}>{value}</li>)}</ol>; }

export default async function TopicPage({ params }: { params: Promise<{ knowledgePoint: string }> }) {
  const { knowledgePoint } = await params;
  const topic = await prisma.topicSummary.findUnique({
    where: { knowledgePoint: decodeURIComponent(knowledgePoint) },
    include: { examples: { orderBy: { order: "asc" }, include: { question: { include: { solutionMethods: { where: { verificationStatus: "human_verified" }, orderBy: { order: "asc" } } } } } } },
  });
  if (!topic) notFound();
  const lessons = getTopicLessons(topic.knowledgePoint);
  if (lessons) {
    return <main className="app-shell"><AppNav />
      <section className="page-header compact lesson-index-header"><div><p className="eyebrow">{topic.knowledgePoint} · 系列专题</p><h1>{topic.title}</h1><p>{topic.summary} 每个知识点包含独立讲解、方法选择和 {lessons[0]?.examples.length ?? 4} 道递进变式。</p></div></section>
      <section className="trig-topic-grid">{lessons.map((item, index) => <Link className="trig-topic-card" href={`/topics/${encodeURIComponent(topic.knowledgePoint)}/${item.slug}`} key={item.slug}><span>{String(index + 1).padStart(2, "0")}</span><h2>{item.title}</h2><p>{item.subtitle}</p><small>约 {item.estimatedMinutes} 分钟 · {item.examples.length} 道变式</small></Link>)}</section>
      <section className="topic-band lesson-index-note"><h2>怎样使用这组专题</h2><p>先独立完成每个知识点的前两题，确认结构识别稳定；再完成中间两道核心变式，最后挑战综合提升题。重点不是记住答案，而是比较条件改变后为什么方法也要改变。不会的题先看“可复用提醒”，最后再展开完整解析。</p></section>
    </main>;
  }
  return <main className="app-shell"><AppNav />
    <section className="page-header compact"><div><p className="eyebrow">{topic.knowledgePoint}</p><h1>{topic.title}</h1><p>{topic.summary}</p></div></section>
    <section className="topic-band topic-columns"><div><h2>通用框架</h2><List values={parseJsonArray(topic.coreFrameworkJson)} /></div><div><h2>识别信号</h2><List values={parseJsonArray(topic.recognitionSignalsJson)} /></div></section>
    <section className="topic-band topic-columns"><div><h2>常见错误</h2><List values={parseJsonArray(topic.commonErrorsJson)} /></div><div><h2>可以迁移到</h2><List values={parseJsonArray(topic.transferTargetsJson)} /></div></section>
    <section className="topic-band"><h2>代表题</h2>{topic.examples.map((example, index) => <article className="topic-example" key={example.id}><h3>例 {index + 1}</h3><p className="subtle">{example.teachingNote}</p><div className="question-display"><MathContent text={example.question.stem} /></div><p><strong>标准答案：</strong><MathContent text={example.question.answer ?? "待核验"} /></p><p><strong>基础解析：</strong><MathContent text={example.question.solution ?? "待核验"} /></p>{example.question.solutionMethods.length ? <div><h4>方法比较</h4>{example.question.solutionMethods.map((method) => <div className="answer-block" key={method.id}><strong>{method.name}{method.isRecommended ? "（推荐）" : ""}</strong><p>{method.summary}</p><p><b>识别信号：</b>{parseJsonArray(method.recognitionSignalsJson).join("、")}</p><p><b>适用条件：</b>{method.applicableConditions || "通用"}</p><MathContent text={method.steps} /><p className="subtle">优势：{method.strengths || "待总结"}；风险：{method.risks || "待总结"}</p></div>)}</div> : <p className="warning-text">该题暂时只有标准解法，多解法仍待人工整理。</p>}</article>)}</section>
  </main>;
}
