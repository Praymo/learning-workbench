import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { PrintButton } from "@/components/PrintButton";
import { prisma } from "@/lib/db";
import { MathContent } from "@/lib/mathContent";
import { parseJsonArray } from "@/lib/questionBank";

export default async function SourceAnswerVersionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const source = await prisma.source.findUnique({
    where: { id },
    include: { questions: { orderBy: [{ sourceQuestionNumber: "asc" }, { createdAt: "asc" }] } },
  });
  if (!source) notFound();

  return (
    <main className="print-shell">
      <div className="no-print"><AppNav /></div>
      <header className="worksheet-header">
        <div><p className="eyebrow">来源答案版</p><h1>{source.name}</h1><p>共 {source.questions.length} 题 · AI草案必须人工确认后才视为正式答案</p></div>
        <div className="worksheet-actions no-print"><PrintButton /></div>
      </header>
      <section className="worksheet-body">
        {source.questions.map((question, index) => {
          const answer = question.answer || question.aiAnswerDraft;
          const solution = question.solution || question.aiSolutionDraft;
          const isDraft = !question.answer && Boolean(question.aiAnswerDraft);
          return (
            <article className="worksheet-question" key={question.id}>
              <div className="worksheet-question-head"><strong>{question.sourceQuestionNumber ?? index + 1}. {question.questionType}</strong><span>{isDraft ? "AI草案待确认" : question.answer ? "正式答案" : "待解答"}</span></div>
              <div className="question-display"><MathContent text={question.stem} /></div>
              {parseJsonArray(question.optionsJson).length ? <div className="print-options">{parseJsonArray(question.optionsJson).map((option) => <div key={option}><MathContent text={option} /></div>)}</div> : null}
              <div className="answer-block">
                <p><strong>答案：</strong><MathContent text={answer ?? "待补充"} /></p>
                <p><strong>解析：</strong><MathContent text={solution ?? "待补充"} /></p>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
