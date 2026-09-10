import { redirect, notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { MathContent } from "@/lib/mathContent";
import { confirmAndGradeSubmission, getSubmission } from "@/lib/submissionProcessing";
import { parseJsonArray } from "@/lib/questionBank";
import { MathAnswerInput } from "@/components/MathAnswerInput";

function publicPath(path: string) {
  const marker = "/public/";
  const index = path.indexOf(marker);
  return index >= 0 ? path.slice(index + marker.length - 1) : path;
}

const questionTypeLabels: Record<string, string> = {
  single_choice: "单选题",
  multiple_choice: "多选题",
  fill_blank: "填空题",
  solution: "解答题"
};

function providerLabel(provider: string | null | undefined) {
  if (!provider || provider === "manual" || provider === "manual-entry-unconfigured") return "人工录入";
  return provider;
}

export default async function ConfirmSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) notFound();
  const submissionAnswers = submission.answers;

  async function confirm(formData: FormData) {
    "use server";
    const values = Object.fromEntries(submissionAnswers.map((answer) => {
      const field = `answer-${answer.id}`;
      const questionType = answer.practiceItem.question.questionType;
      const value = questionType === "multiple_choice"
        ? formData.getAll(field).map(String).sort().join("")
        : String(formData.get(field) ?? "");
      return [answer.id, value];
    }));
    await confirmAndGradeSubmission(id, values);
    redirect(`/submissions/${id}/result`);
  }

  return (
    <main className="app-shell">
      <AppNav />
      <section className="page-header compact">
        <div>
          <h1>确认识别结果</h1>
          <p className="subtle">{submission.practiceSet.title} · {submission.pages.length} 张照片 · 识别方式：{providerLabel(submission.ocrProvider ?? "未调用")}</p>
          {submission.ocrError ? <p className="warning-text">{submission.ocrError}</p> : null}
        </div>
      </section>
      <section className={`submission-review-layout ${submission.pages.length ? "" : "manual-only"}`}>
        {submission.pages.length ? <aside className="submission-pages">
          {submission.pages.map((page) => <img key={page.id} src={publicPath(page.filePath)} alt={`答卷第${page.pageOrder}页`} />)}
        </aside> : null}
        <form className="answer-confirm-form" action={confirm}>
          {submission.answers.map((answer) => {
            const question = answer.practiceItem.question;
            const options = parseJsonArray(question.optionsJson);
            const field = `answer-${answer.id}`;
            return <article className="panel" key={answer.id}>
              <strong>第 {answer.practiceItem.order} 题 · {questionTypeLabels[answer.practiceItem.question.questionType] ?? answer.practiceItem.question.questionType}</strong>
              <div className="question-preview"><MathContent text={answer.practiceItem.question.stem} /></div>
              {question.questionType === "single_choice" ? (
                <fieldset className="objective-entry"><legend>选择答案</legend>{options.map((option, index) => {
                  const value = String.fromCharCode(65 + index);
                  return <label key={value}><input type="radio" name={field} value={value} defaultChecked={answer.ocrText?.trim().toUpperCase() === value} /><MathContent text={option} /></label>;
                })}</fieldset>
              ) : question.questionType === "multiple_choice" ? (
                <fieldset className="objective-entry"><legend>选择所有正确选项</legend>{options.map((option, index) => {
                  const value = String.fromCharCode(65 + index);
                  return <label key={value}><input type="checkbox" name={field} value={value} defaultChecked={answer.ocrText?.toUpperCase().includes(value)} /><MathContent text={option} /></label>;
                })}</fieldset>
              ) : question.questionType === "fill_blank" ? (
                <div><strong>填空答案</strong><MathAnswerInput name={field} defaultValue={answer.ocrText ?? ""} /></div>
              ) : (
                <label>解答过程<textarea name={field} defaultValue={answer.ocrText ?? ""} placeholder="请根据照片确认或补充学生实际写出的步骤" /></label>
              )}
              {submission.pages.length ? <p className="subtle">识别置信度：{answer.confidence == null ? "未提供" : `${Math.round(answer.confidence * 100)}%`}</p> : null}
            </article>;
          })}
          <button className="primary sticky-submit">确认无误并开始评分</button>
        </form>
      </section>
    </main>
  );
}
