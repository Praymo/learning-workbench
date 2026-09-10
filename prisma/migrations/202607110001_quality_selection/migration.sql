ALTER TABLE "Question" ADD COLUMN "similarityKey" TEXT;
ALTER TABLE "Question" ADD COLUMN "modelKey" TEXT;
ALTER TABLE "Question" ADD COLUMN "originalQuestionNumber" INTEGER;
ALTER TABLE "Question" ADD COLUMN "sectionType" TEXT;
ALTER TABLE "Question" ADD COLUMN "positionInSection" INTEGER;
ALTER TABLE "Question" ADD COLUMN "sectionSize" INTEGER;
ALTER TABLE "Question" ADD COLUMN "positionDifficulty" REAL;
ALTER TABLE "Question" ADD COLUMN "difficultyScore" REAL;
ALTER TABLE "Question" ADD COLUMN "difficultyVersion" TEXT;

ALTER TABLE "PracticeSet" ADD COLUMN "selectionSummaryJson" TEXT;
ALTER TABLE "PracticeItem" ADD COLUMN "selectionReason" TEXT;

CREATE TABLE "SourceCandidate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "region" TEXT,
  "year" INTEGER,
  "examRound" TEXT,
  "organizer" TEXT,
  "sourceUrl" TEXT,
  "answerUrl" TEXT,
  "fileType" TEXT,
  "answerStatus" TEXT NOT NULL DEFAULT 'unknown',
  "watermarkStatus" TEXT NOT NULL DEFAULT 'unknown',
  "usageNote" TEXT,
  "sourceTier" TEXT NOT NULL,
  "reviewStatus" TEXT NOT NULL DEFAULT 'research_pending',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "Question_similarityKey_idx" ON "Question"("similarityKey");
CREATE INDEX "Question_modelKey_idx" ON "Question"("modelKey");
CREATE INDEX "Question_difficultyScore_idx" ON "Question"("difficultyScore");
CREATE INDEX "SourceCandidate_sourceTier_idx" ON "SourceCandidate"("sourceTier");
CREATE INDEX "SourceCandidate_reviewStatus_idx" ON "SourceCandidate"("reviewStatus");
CREATE INDEX "SourceCandidate_year_idx" ON "SourceCandidate"("year");
