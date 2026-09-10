import { prisma } from "./db";
import { gradeObjective } from "./objectiveGrading";
import { modelConfiguration, runJsonModel } from "./modelClient";
import { normalizePointGrades, rubricIsDetailed, type ModelPointGrade } from "./rubricGrading";
import { recordSubmissionEvidence } from "./studentEvidence";

type OcrAnswer = { order: number; text: string; confidence?: number };
type OcrResponse = { answers: OcrAnswer[] };
type SolutionGrade = { order: number; pointGrades: ModelPointGrade[]; firstKeyError?: string; feedback: string; overallConfidence?: number };
type GradingResponse = { grades: SolutionGrade[] };

export async function recognizeSubmission(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      pages: { orderBy: { pageOrder: "asc" } },
      practiceSet: { include: { items: { orderBy: { order: "asc" }, include: { question: true } } } }
    }
  });
  if (!submission) throw new Error("答卷不存在");
  const config = modelConfiguration();

  await prisma.submissionAnswer.createMany({
    data: submission.practiceSet.items.map((item) => ({
      submissionId,
      practiceItemId: item.id,
      maxScore: item.points
    }))
  });

  if (!submission.pages.length) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "pending_confirmation", ocrProvider: "manual", ocrError: "未上传照片，请直接录入客观题答案；解答题可人工录入过程。" }
    });
    return;
  }

  if (!config.configured || !config.visionModel) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "pending_confirmation", ocrProvider: "manual", ocrError: "未配置视觉模型，请人工录入识别结果。" }
    });
    return;
  }

  const questions = submission.practiceSet.items.map((item) => ({ order: item.order, stem: item.question.stem }));
  const merged = new Map<number, OcrAnswer>();
  const chunks = [];
  for (let index = 0; index < submission.pages.length; index += 4) chunks.push(submission.pages.slice(index, index + 4));

  try {
    for (const chunk of chunks) {
      const result = await runJsonModel<OcrResponse>({
        task: "answer_ocr",
        promptVersion: "answer-ocr-v1",
        model: config.visionModel,
        system: "你只负责转写高中数学纸质答卷。根据练习题号识别学生实际书写，不补写、不批改、不猜测模糊内容。返回JSON：{answers:[{order:number,text:string,confidence:number}]}。无法识别的部分写[无法识别]。",
        payload: { questions },
        imagePaths: chunk.map((page) => page.filePath)
      });
      for (const answer of result.answers ?? []) {
        const current = merged.get(answer.order);
        if (!current || (answer.confidence ?? 0) > (current.confidence ?? 0)) merged.set(answer.order, answer);
      }
    }

    for (const item of submission.practiceSet.items) {
      const answer = merged.get(item.order);
      await prisma.submissionAnswer.update({
        where: { submissionId_practiceItemId: { submissionId, practiceItemId: item.id } },
        data: { ocrText: answer?.text ?? "", confidence: answer?.confidence }
      });
    }
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "pending_confirmation", ocrProvider: config.visionModel, ocrError: null }
    });
  } catch (error) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "pending_confirmation", ocrProvider: config.visionModel, ocrError: error instanceof Error ? error.message : String(error) }
    });
  }
}

export async function confirmAndGradeSubmission(submissionId: string, answers: Record<string, string>) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      answers: { include: { practiceItem: { include: { question: { include: { rubricPoints: true } } } } } }
    }
  });
  if (!submission) throw new Error("答卷不存在");
  const config = modelConfiguration();
  const solutionPayload = [];

  for (const answerRecord of submission.answers) {
    const correctedText = answers[answerRecord.id] ?? "";
    const question = answerRecord.practiceItem.question;
    if (["single_choice", "multiple_choice", "fill_blank"].includes(question.questionType) && question.answer) {
      const result = gradeObjective({
        questionType: question.questionType as "single_choice" | "multiple_choice" | "fill_blank",
        answer: question.answer,
        score: answerRecord.maxScore
      }, correctedText);
      await prisma.submissionAnswer.update({
        where: { id: answerRecord.id },
        data: {
          correctedText,
          score: result.score,
          gradingStatus: result.status === "needs_review" ? "needs_review" : "graded_by_rule",
          feedback: result.correct ? "答案正确。" : result.status === "partial" ? "部分选对且没有错选，获得部分分。" : result.status === "needs_review" ? "当前本地规则无法可靠判断数学等价，需要人工确认。" : "答案与标准结果不一致。",
          needsReview: result.status === "needs_review"
        }
      });
    } else {
      const detailed = rubricIsDetailed(question.rubricPoints);
      if (!detailed) {
        await prisma.submissionAnswer.update({
          where: { id: answerRecord.id },
          data: { correctedText, gradingStatus: "needs_review", needsReview: true, feedback: "该题评分细则尚未细化，暂不调用模型评分。" }
        });
        continue;
      }
      solutionPayload.push({
        answerRecordId: answerRecord.id,
        order: answerRecord.practiceItem.order,
        maxScore: answerRecord.maxScore,
        stem: question.stem,
        standardSolution: question.solution,
        rubric: question.rubricPoints,
        studentAnswer: correctedText
      });
      await prisma.submissionAnswer.update({ where: { id: answerRecord.id }, data: { correctedText } });
    }
  }

  if (solutionPayload.length && config.configured && config.fastModel) {
    try {
      const grading = await runJsonModel<GradingResponse>({
        task: "solution_grading",
        promptVersion: "solution-grading-v2-rubric-points",
        model: config.fastModel,
        system: "依据给定题目、参考解答和详细评分点批改高中数学解答题。允许等价正确解法，只评价学生明确写出的内容。必须逐评分点引用学生作答中的可见证据；不得只给总分。前一步计算错误但后续方法正确时，仅在followThroughAllowed=true时继续给分。返回严格JSON：{grades:[{order:number,pointGrades:[{rubricPointId:string,rubricCode:string,awardedPoints:number,evidenceText:string,errorType?:string,confidence:number}],firstKeyError?:string,feedback:string,overallConfidence:number}]}。无法判断的评分点confidence低于0.78。",
        payload: { questions: solutionPayload }
      });
      for (const grade of grading.grades ?? []) {
        const target = solutionPayload.find((item) => item.order === grade.order);
        if (!target) continue;
        const normalized = normalizePointGrades(target.rubric, grade.pointGrades ?? []);
        const safeScore = Math.max(0, Math.min(target.maxScore, normalized.score));
        const needsReview = normalized.needsReview || (grade.overallConfidence ?? normalized.confidence) < 0.78;
        await prisma.submissionRubricGrade.deleteMany({ where: { submissionAnswerId: target.answerRecordId } });
        await prisma.submissionRubricGrade.createMany({
          data: normalized.rows.map((point) => ({ ...point, submissionAnswerId: target.answerRecordId }))
        });
        await prisma.submissionAnswer.update({
          where: { id: target.answerRecordId },
          data: {
            score: needsReview ? null : safeScore,
            gradingStatus: needsReview ? "needs_review" : "graded_by_model",
            feedback: [grade.firstKeyError ? `第一处关键问题：${grade.firstKeyError}` : "", grade.feedback].filter(Boolean).join(" "),
            confidence: grade.overallConfidence ?? normalized.confidence,
            needsReview
          }
        });
      }
    } catch (error) {
      for (const item of solutionPayload) {
        await prisma.submissionAnswer.update({
          where: { id: item.answerRecordId },
          data: { gradingStatus: "needs_review", needsReview: true, feedback: error instanceof Error ? error.message : "模型评分失败" }
        });
      }
    }
  } else {
    for (const item of solutionPayload) {
      await prisma.submissionAnswer.update({
        where: { id: item.answerRecordId },
        data: { gradingStatus: "needs_review", needsReview: true, feedback: "未配置解答题评分模型，需要人工确认过程分。" }
      });
    }
  }

  const graded = await prisma.submissionAnswer.findMany({ where: { submissionId } });
  const totalScore = graded.reduce((sum, item) => sum + (item.score ?? 0), 0);
  const maxScore = graded.reduce((sum, item) => sum + item.maxScore, 0);
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: graded.some((item) => item.needsReview) ? "needs_review" : "graded", totalScore, maxScore }
  });
  if (submission.recordEvidence) await recordSubmissionEvidence(submissionId);
}

export async function getSubmission(id: string) {
  return prisma.submission.findUnique({
    where: { id },
    include: {
      pages: { orderBy: { pageOrder: "asc" } },
      practiceSet: true,
      answers: {
        include: { practiceItem: { include: { question: true } }, rubricGrades: { orderBy: { rubricCode: "asc" } } },
        orderBy: { practiceItem: { order: "asc" } }
      }
    }
  });
}
