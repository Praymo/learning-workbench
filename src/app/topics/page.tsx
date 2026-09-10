import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { prisma } from "@/lib/db";

export default async function TopicsPage() {
  const topics = await prisma.topicSummary.findMany({ where: { status: "published" }, include: { _count: { select: { examples: true } } }, orderBy: { knowledgePoint: "asc" } });
  return <main className="app-shell"><AppNav />
    <section className="page-header compact"><div><p className="eyebrow">练一题，会一类</p><h1>专题方法总结</h1><p className="subtle">每个专题只保留核心判断框架、代表题和真正不同的解题路径。</p></div></section>
    <section className="topic-list">{topics.map((topic) => <Link className="topic-card" href={`/topics/${encodeURIComponent(topic.knowledgePoint)}`} key={topic.id}><h2>{topic.title}</h2><p>{topic.summary}</p><span className="subtle">{topic._count.examples} 道代表题</span></Link>)}{!topics.length ? <p className="empty">运行 npm run topics:seed 建立首批专题。</p> : null}</section>
  </main>;
}
