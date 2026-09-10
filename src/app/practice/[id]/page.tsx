import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { PrintButton } from "@/components/PrintButton";
import { MathContent } from "@/lib/mathContent";
import { getPracticeSet } from "@/lib/practice";
import { parseJsonArray } from "@/lib/questionBank";

const typeLabels: Record<string, string> = {
  single_choice: "单选题",
  multiple_choice: "多选题",
  fill_blank: "填空题",
  solution: "解答题"
};

export default async function PracticeDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ answers?: string }>;
}) {
  const { id } = await params;
  const { answers } = await searchParams;
  const practice = await getPracticeSet(id);
  if (!practice) notFound();
  const showAnswers = answers === "1";
  const selectionSummary = practice.selectionSummaryJson
    ? JSON.parse(practice.selectionSummaryJson) as {
        requested: number;
        selected: number;
        excludedRecent: number;
        excludedDuplicate: number;
        excludedModel: number;
        excludedLatePosition: number;
        shortages: string[];
      }
    : null;

  return (
    <main className="print-shell">
      <div className="no-print"><AppNav /></div>
      <header className="worksheet-header">
        <div>
          <p className="eyebrow">{showAnswers ? "答案与解析版" : "学生练习版"}</p>
          <h1>{practice.title}</h1>
          <p>预计 {practice.estimatedMinutes} 分钟 · 共 {practice.items.length} 题 · 姓名：__________ 日期：__________</p>
        </div>
        <div className="worksheet-actions no-print">
          <Link className="button" href={showAnswers ? `/practice/${id}` : `/practice/${id}?answers=1`}>
            {showAnswers ? "查看学生版" : "查看答案版"}
          </Link>
          {!showAnswers ? <Link className="button primary" href={`/submissions/new?practiceSetId=${id}`}>上传答卷</Link> : null}
          <PrintButton />
        </div>
      </header>

      {selectionSummary ? (
        <section className="selection-summary no-print">
          <strong>选题质量检查</strong>
          <span>计划 {selectionSummary.requested} 题，实际 {selectionSummary.selected} 题</span>
          <span>排除近期题 {selectionSummary.excludedRecent} 道</span>
          <span>排除重复/同模型 {selectionSummary.excludedDuplicate + selectionSummary.excludedModel} 道</span>
          <span>排除题型末段集中 {selectionSummary.excludedLatePosition} 道</span>
          {selectionSummary.shortages.length ? <b>题库缺口：{selectionSummary.shortages.join("；")}</b> : <b>难度配额已满足</b>}
        </section>
      ) : null}

      <section className="worksheet-body">
        {practice.items.map((item) => {
          const question = item.question;
          const options = parseJsonArray(question.optionsJson);
          return (
            <article className="worksheet-question" key={item.id}>
              <div className="worksheet-question-head">
                <strong>{item.order}. {typeLabels[question.questionType] ?? question.questionType}</strong>
                {showAnswers ? <span>{item.points}分 · 约{question.estimatedMinutes ?? "-"}分钟</span> : null}
              </div>
              <div className="question-display"><MathContent text={question.stem} /></div>
              {options.length ? <div className="print-options">{options.map((option) => <div key={option}><MathContent text={option} /></div>)}</div> : null}
              {!showAnswers && question.questionType === "solution" ? <div className="writing-space" /> : null}
              {showAnswers ? (
                <div className="answer-block">
                  <p><strong>答案：</strong><MathContent text={question.answer ?? "待核验"} /></p>
                  <p><strong>解析：</strong><MathContent text={question.solution ?? "待核验"} /></p>
                  <p className="subtle">{question.primaryKnowledgePoint} · {parseJsonArray(question.methodTagsJson).join("、") || "方法待细分"} · 来源：{question.source.name}</p>
                  {question.rubricPoints.length ? (
                    <div className="rubric-list">
                      <strong>参考评分框架</strong>
                      {question.rubricPoints.map((point) => <p key={point.id}>{point.label}：{point.description}（{point.points}分）</p>)}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}
