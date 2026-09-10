ALTER TABLE "Question" ADD COLUMN "aiAnswerDraft" TEXT;
ALTER TABLE "Question" ADD COLUMN "aiSolutionDraft" TEXT;
ALTER TABLE "Question" ADD COLUMN "aiSolutionStatus" TEXT NOT NULL DEFAULT 'not_requested';
ALTER TABLE "Question" ADD COLUMN "aiSolutionModel" TEXT;
ALTER TABLE "Question" ADD COLUMN "aiSolvedAt" DATETIME;

ALTER TABLE "SourceCandidate" ADD COLUMN "questionFilePath" TEXT;
ALTER TABLE "SourceCandidate" ADD COLUMN "answerFilePath" TEXT;
