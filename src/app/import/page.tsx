import { AppNav } from "@/components/AppNav";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export default async function ImportPage() {
  async function createCandidate(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;
    const answerUrl = String(formData.get("answerUrl") ?? "").trim();
    await prisma.sourceCandidate.create({
      data: {
        name,
        region: String(formData.get("region") ?? "").trim() || null,
        year: Number(formData.get("year") || 0) || null,
        examRound: String(formData.get("examRound") ?? "").trim() || null,
        organizer: String(formData.get("organizer") ?? "").trim() || null,
        sourceUrl: String(formData.get("sourceUrl") ?? "").trim() || null,
        answerUrl: answerUrl || null,
        answerStatus: answerUrl ? "complete" : "unknown",
        watermarkStatus: "unknown",
        sourceTier: String(formData.get("sourceTier") ?? "city_mock"),
        reviewStatus: "research_pending",
        usageNote: "用户手动登记的补充题源；需核验试卷、答案、版权和清晰度后再拆题入库。",
      },
    });
    revalidatePath("/import");
    revalidatePath("/sources");
  }

  async function updateCandidateAnswer(formData: FormData) {
    "use server";
    const id = String(formData.get("candidateId") ?? "");
    if (!id) return;
    await prisma.sourceCandidate.update({
      where: { id },
      data: {
        answerUrl: String(formData.get("answerUrl") ?? "").trim() || null,
        answerStatus: String(formData.get("answerStatus") ?? "unknown"),
        reviewStatus: String(formData.get("reviewStatus") ?? "research_pending"),
      },
    });
    revalidatePath("/import");
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
    revalidatePath("/import");
    revalidatePath("/sources");
  }

  const [jobs, candidates] = await Promise.all([
    prisma.importJob.findMany({ orderBy: { startedAt: "desc" }, take: 10, include: { source: true } }),
    prisma.sourceCandidate.findMany({ orderBy: [{ updatedAt: "desc" }], take: 12 }),
  ]);

  return (
    <main className="app-shell">
      <AppNav />
      <section className="page-header compact">
        <div>
          <h1>导入真题</h1>
          <p className="subtle">PDF 原卷保存版式与图形，结构化数据提供题干、答案和解析；两条来源分别缓存并接受质量审核。</p>
        </div>
      </section>
      <section className="panel narrow">
        <h2>PDF 原卷</h2>
        <p><a href="https://github.com/deekur/gaokaomath">https://github.com/deekur/gaokaomath</a></p>
        <p className="subtle">脚本会收录 2016—2026 年全部秋季普通高考数学卷，包括全国各卷、北京卷、上海卷及其他地方卷；只排除春季高考、职教、高职分类、单招、成人高考和非数学科目。</p>
        <pre className="command">npm run import:gaokao</pre>
        <p className="subtle">PDF 不再直接通过双栏文本层拆题，只用于原卷核对、页面裁图和来源追溯。</p>
        <h2>结构化真题</h2>
        <p><a href="https://github.com/OpenLMLab/GAOKAO-Bench">https://github.com/OpenLMLab/GAOKAO-Bench</a></p>
        <pre className="command">git clone --depth 1 https://github.com/OpenLMLab/GAOKAO-Bench.git data/sources/GAOKAO-Bench{`\n`}npm run import:gaokao-bench</pre>
        <p className="subtle">结构化导入覆盖 2016—2022 可获得的数学卷型，包括全国Ⅲ卷，并执行三级去重。带图未配图、布局异常、缺答案或缺解析的题只进入审核队列。</p>
      </section>
      <section className="content-grid">
        <div className="panel">
          <h2>我有新的试卷或答案 URL</h2>
          <p className="subtle">先登记为候选题源。后续只对清晰、有答案、可核验且适合学生阶段的试卷拆题入库。</p>
          <form className="edit-form" action={createCandidate}>
            <label>考试名称<input name="name" placeholder="例如：2026 某市高三一模数学" required /></label>
            <div className="form-row">
              <label>地区<input name="region" placeholder="省/市" /></label>
              <label>年份<input name="year" type="number" min="2016" max="2026" defaultValue="2026" /></label>
            </div>
            <div className="form-row">
              <label>轮次<input name="examRound" placeholder="一模 / 二模 / 联考" /></label>
              <label>组织方<input name="organizer" placeholder="教研院 / 联盟 / 学校" /></label>
            </div>
            <label>试卷 URL<input name="sourceUrl" placeholder="https://..." /></label>
            <label>答案 URL<input name="answerUrl" placeholder="https://..." /></label>
            <label>来源级别
              <select name="sourceTier" defaultValue="city_mock">
                <option value="provincial_mock">省级教研/适应性测试</option>
                <option value="city_mock">地市统考/质量检测</option>
                <option value="joint_exam">多省或名校联盟联考</option>
                <option value="manual_upload">手动补充</option>
              </select>
            </label>
            <button className="primary">登记候选题源</button>
          </form>
        </div>
        <div className="panel">
          <h2>补充已有候选的答案</h2>
          <p className="subtle">如果你已经有答案链接或答案 PDF，从这里直接补。答案不会自动覆盖题库，拆题和核验仍要单独进行。</p>
          <form className="edit-form" action={updateCandidateAnswer}>
            <label>候选考试
              <select name="candidateId" required>
                {candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
              </select>
            </label>
            <label>答案 URL<input name="answerUrl" placeholder="https://..." /></label>
            <label>答案状态
              <select name="answerStatus" defaultValue="complete">
                <option value="complete">答案完整</option>
                <option value="unknown">答案待查</option>
                <option value="missing">缺少答案</option>
              </select>
            </label>
            <label>审核状态
              <select name="reviewStatus" defaultValue="approved_for_download">
                <option value="research_pending">待调研</option>
                <option value="needs_license_review">使用条件待核验</option>
                <option value="approved_for_download">允许下载测试</option>
                <option value="rejected">不采用</option>
              </select>
            </label>
            <button>保存答案链接</button>
          </form>
          <form className="edit-form separated-form" action={uploadCandidateFile}>
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
            <button>上传到本地</button>
          </form>
        </div>
      </section>
      <section className="panel">
        <h2>最近题源候选</h2>
        <table className="data-table">
          <thead><tr><th>考试</th><th>地区</th><th>年份</th><th>答案</th><th>状态</th></tr></thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>{candidate.name}</td>
                <td>{candidate.region ?? ""}</td>
                <td>{candidate.year ?? ""}</td>
                <td>{candidate.answerFilePath ? "已上传PDF" : candidate.answerUrl ? "已填URL" : "待补"}</td>
                <td>{candidate.reviewStatus} · {candidate.answerStatus}</td>
              </tr>
            ))}
            {!candidates.length ? <tr><td colSpan={5}>暂无候选题源，可以先登记一份试卷或答案。</td></tr> : null}
          </tbody>
        </table>
      </section>
      <section className="panel">
        <h2>最近任务</h2>
        <table className="data-table">
          <thead><tr><th>类型</th><th>来源</th><th>状态</th><th>成功</th><th>失败</th></tr></thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.importType}</td>
                <td>{job.source?.name ?? job.inputFile}</td>
                <td>{job.status}</td>
                <td>{job.successItems}/{job.totalItems}</td>
                <td>{job.failedItems}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
