import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { CoreTopicVisual } from "@/components/CoreTopicVisual";
import { FunctionTopicVisual } from "@/components/FunctionTopicVisual";
import { MathContent } from "@/lib/mathContent";
import { getTopicLessons, topicLessonCatalog } from "@/lib/topicLessonCatalog";

export function generateStaticParams() {
  return Object.entries(topicLessonCatalog).flatMap(([knowledgePoint, lessons]) => lessons.map((topic) => ({ knowledgePoint, slug: topic.slug })));
}

export default async function TrigonometryTopicPage({ params }: { params: Promise<{ knowledgePoint: string; slug: string }> }) {
  const { knowledgePoint, slug } = await params;
  const decodedKnowledgePoint = decodeURIComponent(knowledgePoint);
  const lessons = getTopicLessons(decodedKnowledgePoint);
  const topic = lessons?.find((item) => item.slug === slug);
  if (!topic) notFound();
  const currentIndex = lessons.findIndex((item) => item.slug === slug);
  const previous = lessons[currentIndex - 1];
  const next = lessons[currentIndex + 1];

  return <main className="app-shell"><AppNav />
    <section className="page-header compact topic-lesson-header"><div><p className="eyebrow">{decodedKnowledgePoint} · 知识点 {currentIndex + 1}/{lessons.length}</p><h1>{topic.title}</h1><p>{topic.subtitle}</p><div className="lesson-meta"><span>预计 {topic.estimatedMinutes} 分钟</span><span>{topic.examples.length} 道变式</span><span>主干方法 + 拓展方法</span></div></div></section>
    <nav className="topic-subnav" aria-label={`${decodedKnowledgePoint}专题目录`}>{lessons.map((item, index) => <Link className={item.slug === slug ? "active" : ""} href={`/topics/${encodeURIComponent(decodedKnowledgePoint)}/${item.slug}`} key={item.slug}>{index + 1}. {item.title}</Link>)}</nav>
    <article className="topic-lesson">
      <section className="lesson-goals"><h2>学完这一页，你应当能够</h2><ul>{topic.goals.map((goal) => <li key={goal}><MathContent text={goal} /></li>)}</ul></section>
      {decodedKnowledgePoint === "函数概念与性质" ? <FunctionTopicVisual slug={slug} /> : null}
      <CoreTopicVisual knowledgePoint={decodedKnowledgePoint} />
      {topic.sections.map((section) => <section className="lesson-section" key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <MathContent text={paragraph} key={paragraph} />)}</section>)}
      <section className="lesson-method-grid"><div><h2>方法选择树</h2><ol>{topic.framework.map((item) => <li key={item}><MathContent text={item} /></li>)}</ol></div><div><h2>高频失分点</h2><ul>{topic.errors.map((item) => <li key={item}><MathContent text={item} /></li>)}</ul></div></section>
      <section className="lesson-examples"><div className="lesson-section-title"><p className="eyebrow">本站编写 · 已核算答案</p><h2>分层变式训练</h2></div>{topic.examples.map((example, index) => <article className={`lesson-example level-${Math.min(3, Math.floor(index / 2) + 1)}`} key={example.title}><header><span>例 {index + 1}</span><h3>{example.title}</h3><b>{index < 2 ? "结构识别" : index < 4 ? "核心变式" : "综合提升"}</b></header><div className="example-stem"><MathContent text={example.stem} /></div><details><summary>查看答案、推导与方法比较</summary><div className="example-answer"><p><strong>答案：</strong><MathContent text={example.answer} /></p><ol>{example.solution.map((step) => <li key={step}><MathContent text={step} /></li>)}</ol><div className="takeaway"><strong>可复用提醒：</strong><MathContent text={example.takeaway} /></div>{example.advancedNote ? <div className="advanced-method"><strong>方法升级</strong><MathContent text={example.advancedNote} /></div> : null}</div></details></article>)}</section>
      <section className="lesson-summary"><h2>本节收束</h2><MathContent text={topic.summary} /></section>
      {topic.reference ? <aside className="lesson-reference"><strong>参考资料：</strong><a href={topic.reference.url} target="_blank" rel="noreferrer">{topic.reference.title}</a><p>{topic.reference.note}</p></aside> : null}
    </article>
    <nav className="lesson-pagination">{previous ? <Link href={`/topics/${encodeURIComponent(decodedKnowledgePoint)}/${previous.slug}`}>← {previous.title}</Link> : <span />}{next ? <Link href={`/topics/${encodeURIComponent(decodedKnowledgePoint)}/${next.slug}`}>{next.title} →</Link> : <Link href={`/topics/${encodeURIComponent(decodedKnowledgePoint)}`}>返回专题目录</Link>}</nav>
  </main>;
}
