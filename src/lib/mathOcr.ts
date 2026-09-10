export interface MathOcrProvider {
  recognize(input: {
    filePath: string;
    pageNumber?: number;
    mode: "single_question" | "question_page" | "answer_page";
  }): Promise<MathOcrResult>;
}

export interface MathOcrResult {
  rawText: string;
  rawLatex?: string;
  detectedQuestions: DetectedQuestion[];
  confidence?: number;
  provider: string;
}

export interface DetectedQuestion {
  questionNumber?: string;
  stem: string;
  stemLatex?: string;
  options?: string[];
  answer?: string;
  solution?: string;
  imageRegions?: number[][];
}

const resultSchema = z.object({
  rawText: z.string(),
  rawLatex: z.string().optional(),
  detectedQuestions: z.array(z.object({
    questionNumber: z.string().optional(),
    stem: z.string(),
    stemLatex: z.string().optional(),
    options: z.array(z.string()).optional(),
    answer: z.string().optional(),
    solution: z.string().optional(),
    imageRegions: z.array(z.array(z.number())).optional()
  })),
  confidence: z.number().min(0).max(1).optional()
});

export class VisionMathOcrProvider implements MathOcrProvider {
  async recognize(input: {
    filePath: string;
    pageNumber?: number;
    mode: "single_question" | "question_page" | "answer_page";
  }): Promise<MathOcrResult> {
    const config = modelConfiguration();
    const result = await runJsonModel<unknown>({
      task: "math_ocr",
      promptVersion: "math-ocr-v2",
      model: config.visionModel,
      system: "识别高中数学题目或答案页面。只返回JSON。逐题保留题号、题干、选项、答案和解析；公式使用LaTeX。不要猜测看不清的图形、字符或答案，无法确认的字段省略。imageRegions使用[x,y,width,height]相对坐标，范围0到1。",
      payload: { mode: input.mode, pageNumber: input.pageNumber ?? null },
      imagePaths: [input.filePath]
    });
    const parsed = resultSchema.parse(result);
    return { ...parsed, provider: `${config.baseUrl}/${config.visionModel}` };
  }
}

export class ManualMathOcrProvider implements MathOcrProvider {
  async recognize(): Promise<MathOcrResult> {
    return {
      rawText: "",
      detectedQuestions: [],
      provider: "manual-entry-unconfigured"
    };
  }
}

export function getMathOcrProvider(): MathOcrProvider {
  const config = modelConfiguration();
  return config.configured && config.visionModel ? new VisionMathOcrProvider() : new ManualMathOcrProvider();
}
import { z } from "zod";
import { modelConfiguration, runJsonModel } from "./modelClient";
