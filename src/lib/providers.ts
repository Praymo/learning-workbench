export type StructuredModelRequest = {
  task: string;
  promptVersion: string;
  input: unknown;
  schemaName: string;
};

export interface QuestionSourceProvider {
  sync(): Promise<{ discovered: number; imported: number; skipped: number }>;
}

export interface MathSolverProvider {
  solve(request: StructuredModelRequest): Promise<unknown>;
}

export interface MathGradingProvider {
  grade(request: StructuredModelRequest): Promise<unknown>;
}

export interface QuestionVerifier {
  verify(request: StructuredModelRequest): Promise<{ passed: boolean; reasons: string[] }>;
}

export interface PracticeSelector {
  create(input: { mode: string; knowledgePoint?: string; targetMinutes: number }): Promise<{ id: string }>;
}

export interface StudentEvidenceStore {
  record(input: { questionId: string; score: number; maxScore: number; confirmed: boolean }): Promise<void>;
}
