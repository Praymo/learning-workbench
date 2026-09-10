import { AppNav } from "@/components/AppNav";
import { prisma } from "@/lib/db";
import { modelConfiguration } from "@/lib/modelClient";
import { SubmissionUploadForm } from "./SubmissionUploadForm";

export default async function NewSubmissionPage({ searchParams }: { searchParams: Promise<{ practiceSetId?: string }> }) {
  const { practiceSetId } = await searchParams;
  const practices = await prisma.practiceSet.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  const orderedPractices = practiceSetId
    ? [...practices].sort((left, right) => Number(right.id === practiceSetId) - Number(left.id === practiceSetId))
    : practices;
  const model = modelConfiguration();
  return (
    <main className="app-shell">
      <AppNav />
      <section className="page-header compact">
        <div>
          <p className="eyebrow">纸上作答 · 上传确认后再评分</p>
          <h1>上传答卷</h1>
          <p className="subtle">单选、多选和填空可直接录入并由程序评分；只有解答题需要照片或过程文本。照片数量不限，单张不超过20MB。</p>
        </div>
      </section>
      <section className="panel narrow">
        <div className={`provider-status ${model.configured && model.visionModel ? "ready" : "pending"}`}>
          {model.configured && model.visionModel ? `视觉识别模型：${model.visionModel}` : "尚未配置视觉模型：照片会保存，确认页允许人工录入答案。"}
        </div>
        <SubmissionUploadForm practices={orderedPractices.map((practice) => ({ ...practice, createdAt: practice.createdAt.toISOString() }))} />
      </section>
    </main>
  );
}
