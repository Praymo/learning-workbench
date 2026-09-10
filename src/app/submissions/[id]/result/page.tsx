import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { MathContent } from "@/lib/mathContent";
import { getSubmission } from "@/lib/submissionProcessing";
import { prisma } from "@/lib/db";
import { recordSubmissionEvidence } from "@/lib/studentEvidence";
import { revalidatePath } from "next/cache";

export default async function SubmissionResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) notFound();
  const shouldRecordEvidence = submission.recordEvidence;
  const objectiveScore = submission.answers
    .filter((answer) => answer.gradingStatus === "graded_by_rule")
    .reduce((sum, answer) => sum + (answer.score ?? 0), 0);

  async function confirmRubricGrades(formData: FormData) {
    "use server";
    const answerId = String(formData.get("answerId") ?? "");
    const answer = await prisma.submissionAnswer.findUnique({ where: { id: answerId }, include: { rubricGrades: true } });
    if (!answer || answer.submissionId !== id || !answer.rubricGrades.length) return;
    let score = 0;
    for (const point of answer.rubricGrades) {
      const awardedPoints = Math.max(0, Math.min(point.maxPoints, Math.round(Number(formData.get(`points-${point.id}`) ?? point.awardedPoints))));
      score += awardedPoints;
      await prisma.submissionRubricGrade.update({ where: { id: point.id }, data: { awardedPoints, reviewStatus: "human_approved" } });
    }
    await prisma.submissionAnswer.update({
      where: { id: answerId },
      data: { score, needsReview: false, gradingStatus: "graded_by_human_review" },
    });
    const answers = await prisma.submissionAnswer.findMany({ where: { submissionId: id } });
    await prisma.submission.update({
      where: { id },
      data: {
        totalScore: answers.reduce((sum, item) => sum + (item.id === answerId ? score : item.score ?? 0), 0),
        maxScore: answers.reduce((sum, item) => sum + item.maxScore, 0),
        status: answers.some((item) => item.id !== answerId && item.needsReview) ? "needs_review" : "graded",
      },
    });
    if (shouldRecordEvidence) await recordSubmissionEvidence(id);
    revalidatePath(`/submissions/${id}/result`);
    revalidatePath("/mastery");
  }

  return (
    <main className="app-shell">
      <AppNav />
      <section className="page-header compact">
        <div>
          <p className="eyebrow">评分结果</p>
          <h1>{submission.totalScore ?? 0} / {submission.maxScore ?? 0}</h1>
          <p className="subtle">客观题程序得分 {objectiveScore} 分。标记“需要确认”的题目未计入总分。{shouldRecordEvidence ? "本次确认结果会写入本地档案。" : "本次为测试模式，不写入档案。"}</p>
        </div>
      </section>
      <section className="result-list">
        {submission.answers.map((answer) => (
          <article className="panel" key={answer.id}>
            <div className="worksheet-question-head">
              <strong>第 {answer.practiceItem.order} 题</strong>
              <span>{answer.needsReview ? "需要人工确认" : `${answer.score ?? 0}/${answer.maxScore}分`}</span>
            </div>
            <div className="question-preview"><MathContent text={answer.practiceItem.question.stem} /></div>
            <p><strong>学生作答：</strong><MathContent text={answer.correctedText || "未作答"} /></p>
            <p><strong>标准答案：</strong><MathContent text={answer.practiceItem.question.answer ?? "待核验"} /></p>
            <p><strong>反馈：</strong>{answer.feedback ?? "暂无反馈"}</p>
            {answer.rubricGrades.length ? (
              <form className="rubric-grade-table" action={confirmRubricGrades}>
                <input type="hidden" name="answerId" value={answer.id} />
                <strong>过程评分点</strong>
                {answer.rubricGrades.map((point) => (
                  <div key={point.id}>
                    <span>{point.rubricCode}</span>
                    <label><input name={`points-${point.id}`} type="number" min="0" max={point.maxPoints} defaultValue={point.awardedPoints} /> / {point.maxPoints}分</label>
                    <p>{point.evidenceText || "未找到明确作答证据"}</p>
                    <small>{point.errorType ? `错误类型：${point.errorType} · ` : ""}{point.reviewStatus}</small>
                  </div>
                ))}
                {answer.rubricGrades.some((point) => point.reviewStatus !== "human_approved") ? <button className="primary">确认过程分并写入档案</button> : <p className="subtle">过程分已经人工确认。</p>}
              </form>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
