ALTER TABLE "RubricPoint" ADD COLUMN "subQuestion" TEXT;
ALTER TABLE "RubricPoint" ADD COLUMN "rubricCode" TEXT;
ALTER TABLE "RubricPoint" ADD COLUMN "requiredCondition" TEXT;
ALTER TABLE "RubricPoint" ADD COLUMN "acceptedMethodsJson" TEXT;
ALTER TABLE "RubricPoint" ADD COLUMN "dependsOnJson" TEXT;
ALTER TABLE "RubricPoint" ADD COLUMN "followThroughAllowed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RubricPoint" ADD COLUMN "fatalError" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RubricPoint" ADD COLUMN "commonErrorsJson" TEXT;
ALTER TABLE "RubricPoint" ADD COLUMN "evidenceRequired" TEXT;

CREATE TABLE "SubmissionRubricGrade" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "submissionAnswerId" TEXT NOT NULL,
  "rubricPointId" TEXT,
  "rubricCode" TEXT NOT NULL,
  "awardedPoints" INTEGER NOT NULL,
  "maxPoints" INTEGER NOT NULL,
  "evidenceText" TEXT,
  "errorType" TEXT,
  "confidence" REAL,
  "reviewStatus" TEXT NOT NULL DEFAULT 'model_suggested',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "SubmissionRubricGrade_submissionAnswerId_fkey" FOREIGN KEY ("submissionAnswerId") REFERENCES "SubmissionAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SubmissionRubricGrade_rubricPointId_fkey" FOREIGN KEY ("rubricPointId") REFERENCES "RubricPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "StudentEvidence" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "submissionAnswerId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "knowledgePoint" TEXT NOT NULL,
  "modelKey" TEXT,
  "difficultyScore" REAL,
  "evidenceType" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "maxScore" INTEGER NOT NULL,
  "confirmed" BOOLEAN NOT NULL DEFAULT true,
  "errorType" TEXT,
  "methodUsed" TEXT,
  "reviewResult" TEXT,
  "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudentEvidence_submissionAnswerId_fkey" FOREIGN KEY ("submissionAnswerId") REFERENCES "SubmissionAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "KnowledgeMastery" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "knowledgePoint" TEXT NOT NULL,
  "score" REAL NOT NULL,
  "evidenceCount" INTEGER NOT NULL,
  "conceptualScore" REAL,
  "modelRecognitionScore" REAL,
  "methodSelectionScore" REAL,
  "computationScore" REAL,
  "expressionScore" REAL,
  "transferScore" REAL,
  "explanation" TEXT NOT NULL,
  "algorithmVersion" TEXT NOT NULL DEFAULT 'weighted-v1',
  "updatedAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "SubmissionRubricGrade_submissionAnswerId_rubricCode_key" ON "SubmissionRubricGrade"("submissionAnswerId", "rubricCode");
CREATE INDEX "SubmissionRubricGrade_reviewStatus_idx" ON "SubmissionRubricGrade"("reviewStatus");
CREATE UNIQUE INDEX "StudentEvidence_submissionAnswerId_key" ON "StudentEvidence"("submissionAnswerId");
CREATE INDEX "StudentEvidence_knowledgePoint_idx" ON "StudentEvidence"("knowledgePoint");
CREATE INDEX "StudentEvidence_occurredAt_idx" ON "StudentEvidence"("occurredAt");
CREATE UNIQUE INDEX "KnowledgeMastery_knowledgePoint_key" ON "KnowledgeMastery"("knowledgePoint");
