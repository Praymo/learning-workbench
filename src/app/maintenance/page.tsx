import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { prisma } from "@/lib/db";
import { modelConfiguration } from "@/lib/modelClient";

export default async function MaintenancePage() {
  const config = modelConfiguration();
  const [sources, questions, published, evidence, pages, drafts, pendingOcr] = await Promise.all([
    prisma.source.count(),
    prisma.question.count(),
    prisma.question.count({ where: { status: "published" } }),
    prisma.questionEvidence.count(),
    prisma.sourcePage.count(),
    prisma.questionExtractionDraft.count({ where: { status: "pending_review" } }),
    prisma.ocrRecord.count({ where: { status: "pending_review" } })
  ]);

  const tools = [
    { href: "/questions", title: "题库审核", text: "检查题型、答案、解析、知识点和发布状态。" },
    { href: "/sources", title: "原卷与答案", text: "管理 PDF 原卷、答案 URL、文件哈希和来源。" },
    { href: "/import", title: "批量导入", text: "同步结构化真题、登记模拟卷和答案 PDF。" },
    { href: "/upload", title: "上传单题", text: "导入教辅、联考或临时发现的好题。" },
    { href: "/ocr-review", title: "OCR 审核", text: "人工确认识别结果后再生成正式题目。" }
  ];

  return <main className="app-shell"><AppNav />
    <section className="page-header compact"><div><p className="eyebrow">仅用于题库维护</p><h1>维护中心</h1><p className="subtle">学生平时不需要进入这里。原卷、导入、OCR 和质量审核统一集中管理。</p></div></section>
    <section className="metrics-grid maintenance-metrics">
      <article className="metric"><span>来源</span><strong>{sources}</strong><small>本地 PDF 与结构化数据</small></article>
      <article className="metric"><span>正式可用</span><strong>{published}/{questions}</strong><small>只有 published 可组卷</small></article>
      <article className="metric"><span>原卷关联</span><strong>{evidence}</strong><small>结构化题回看原卷</small></article>
      <article className="metric"><span>已渲染页面</span><strong>{pages}</strong><small>视觉拆题的输入</small></article>
      <article className="metric"><span>拆题草稿</span><strong>{drafts}</strong><small>等待人工审核</small></article>
      <article className="metric"><span>OCR 待审</span><strong>{pendingOcr}</strong><small>不自动发布</small></article>
    </section>
    <section className="maintenance-grid">{tools.map((tool) => <Link className="maintenance-tool" href={tool.href} key={tool.href}><h2>{tool.title}</h2><p>{tool.text}</p><span>打开 →</span></Link>)}</section>
    <section className={`provider-status ${config.configured && config.visionModel ? "ready" : "pending"}`}>
      {config.configured && config.visionModel ? `视觉模型已配置：${config.visionModel}` : "视觉模型未配置：可以渲染并保存原卷页面，但不会生成假 OCR 或拆题草稿。"}
    </section>
    <section className="panel narrow"><h2>原卷页面处理</h2><p className="subtle">PDF 渲染与批量拆题属于本机维护任务，不在学生网页中执行。维护人员可使用 README 中的 <code>questions:render-pages</code> 与 <code>questions:extract-pages</code> 命令；结果仍会在这里显示并进入人工审核。</p></section>
  </main>;
}
