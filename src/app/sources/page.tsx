import { AppNav } from "@/components/AppNav";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";

function formatDate(value?: Date | null) {
  return value ? new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(value) : "暂无";
}

export default async function SourcesPage() {
  async function updateCandidate(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    await prisma.sourceCandidate.update({
      where: { id },
      data: {
        sourceUrl: String(formData.get("sourceUrl") ?? "") || null,
        answerUrl: String(formData.get("answerUrl") ?? "") || null,
        answerStatus: String(formData.get("answerStatus") ?? "unknown"),
        watermarkStatus: String(formData.get("watermarkStatus") ?? "unknown"),
        reviewStatus: String(formData.get("reviewStatus") ?? "research_pending"),
      },
    });
    revalidatePath("/sources");
  }

  async function uploadCandidateFile(formData: FormData) {
    "use server";
    const id = String(formData.get("candidateId") ?? "");
    const kind = String(formData.get("kind") ?? "answer") as "question" | "answer";
    const file = formData.get("file");
    if (!id || !(file instanceof File) || file.size === 0) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("只支持PDF文件");
    if (file.size > 50 * 1024 * 1024) throw new Error("单个PDF不能超过50MB");
    const directory = join(process.cwd(), "data", "uploads", "source-candidates", id);
    await mkdir(directory, { recursive: true });
    const path = join(directory, `${kind}-${Date.now()}.pdf`);
    await writeFile(path, Buffer.from(await file.arrayBuffer()));
    await prisma.sourceCandidate.update({
      where: { id },
      data: kind === "answer"
        ? { answerFilePath: path, answerStatus: "complete" }
        : { questionFilePath: path, fileType: "pdf" },
    });
    revalidatePath("/sources");
  }

  const [sources, jobs, candidates] = await Promise.all([
    prisma.source.findMany({ orderBy: { updatedAt: "desc" }, take: 250, include: { _count: { select: { questions: true } } } }),
    prisma.importJob.findMany({ orderBy: { startedAt: "desc" }, take: 30, include: { source: true } }),
    prisma.sourceCandidate.findMany({ orderBy: [{ sourceTier: "asc" }, { name: "asc" }] })
  ]);

  return (
    <main className="app-shell">
      <AppNav />
      <section className="page-header compact">
        <div>
          <h1>数据源</h1>
          <p className="subtle">查看真题仓库、同步文件、文件哈希、解析状态和错误信息。</p>
        </div>
      </section>
      <section className="panel">
        <div className="section-heading-row">
          <div>
            <h2>重点模拟卷候选</h2>
            <p className="subtle">这里只登记人工调研目标。未核验试卷、答案和使用条件前，不会自动进入题库。</p>
          </div>
          <span className="status-chip">{candidates.length} 个候选</span>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>考试</th><th>地区</th><th>类型</th><th>来源与答案</th><th>审核</th></tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>{candidate.name}</td>
                <td>{candidate.region ?? ""}</td>
                <td>{candidate.examRound ?? candidate.sourceTier}</td>
                <td colSpan={2}>
                  <form className="candidate-review-form" action={updateCandidate}>
                    <input type="hidden" name="id" value={candidate.id} />
                    <input name="sourceUrl" defaultValue={candidate.sourceUrl ?? ""} placeholder="试卷 URL" aria-label={`${candidate.name}试卷URL`} />
                    <input name="answerUrl" defaultValue={candidate.answerUrl ?? ""} placeholder="答案 URL" aria-label={`${candidate.name}答案URL`} />
                    <select name="answerStatus" defaultValue={candidate.answerStatus} aria-label={`${candidate.name}答案状态`}>
                      <option value="unknown">答案待查</option>
                      <option value="complete">答案完整</option>
                      <option value="missing">缺少答案</option>
                    </select>
                    <select name="watermarkStatus" defaultValue={candidate.watermarkStatus} aria-label={`${candidate.name}水印状态`}>
                      <option value="unknown">水印待查</option>
                      <option value="clean">无明显水印</option>
                      <option value="obstructed">水印遮挡</option>
                    </select>
                    <select name="reviewStatus" defaultValue={candidate.reviewStatus} aria-label={`${candidate.name}审核状态`}>
                      <option value="research_pending">待调研</option>
                      <option value="needs_license_review">使用条件待核验</option>
                      <option value="approved_for_download">允许下载测试</option>
                      <option value="rejected">不采用</option>
                    </select>
                    <button>保存</button>
                  </form>
                </td>
              </tr>
            ))}
            {!candidates.length ? <tr><td colSpan={5}>运行 <code>npm run sources:candidates</code> 建立首批候选清单。</td></tr> : null}
          </tbody>
        </table>
      </section>
      <section className="panel narrow">
        <h2>补充试卷或答案 PDF</h2>
        <p className="subtle">文件保存在本机并排除在 Git 之外。答案可以以后慢慢补，不会阻塞 AI 解题草案。</p>
        <form className="edit-form" action={uploadCandidateFile}>
          <label>候选考试
            <select name="candidateId" required>
              {candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
            </select>
          </label>
          <label>文件类型
            <select name="kind" defaultValue="answer">
              <option value="answer">答案与解析 PDF</option>
              <option value="question">试卷 PDF</option>
            </select>
          </label>
          <label>PDF 文件<input name="file" type="file" accept="application/pdf,.pdf" required /></label>
          <button className="primary">上传到本地</button>
        </form>
      </section>
      <section className="panel">
        <h2>来源清单</h2>
        <table className="data-table">
          <thead>
            <tr><th>名称</th><th>类型</th><th>年份</th><th>卷型</th><th>题数</th><th>哈希</th><th>更新时间</th></tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id}>
                <td>{source.name}</td>
                <td>{source.sourceType}</td>
                <td>{source.year ?? ""}</td>
                <td>{source.paperType ?? ""}</td>
                <td>{source._count.questions} {source._count.questions ? <Link href={`/sources/${source.id}/answer-version`}>答案版</Link> : null}</td>
                <td className="mono">{source.fileHash?.slice(0, 12) ?? ""}</td>
                <td>{formatDate(source.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="panel">
        <h2>导入任务</h2>
        <table className="data-table">
          <thead>
            <tr><th>来源</th><th>类型</th><th>状态</th><th>成功</th><th>失败</th><th>错误</th><th>完成时间</th></tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.source?.name ?? job.inputFile}</td>
                <td>{job.importType}</td>
                <td>{job.status}</td>
                <td>{job.successItems}/{job.totalItems}</td>
                <td>{job.failedItems}</td>
                <td>{job.errorLog ?? ""}</td>
                <td>{formatDate(job.finishedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
