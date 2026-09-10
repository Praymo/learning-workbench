CREATE TABLE "SolutionMethod" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "questionId" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "recognitionSignalsJson" TEXT,
  "applicableConditions" TEXT,
  "steps" TEXT NOT NULL,
  "strengths" TEXT,
  "risks" TEXT,
  "estimatedMinutes" INTEGER,
  "isRecommended" BOOLEAN NOT NULL DEFAULT false,
  "verificationStatus" TEXT NOT NULL DEFAULT 'pending_review',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "SolutionMethod_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "TopicSummary" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "knowledgePoint" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "coreFrameworkJson" TEXT NOT NULL,
  "recognitionSignalsJson" TEXT NOT NULL,
  "commonErrorsJson" TEXT NOT NULL,
  "transferTargetsJson" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "TopicExample" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "topicSummaryId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "teachingNote" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TopicExample_topicSummaryId_fkey" FOREIGN KEY ("topicSummaryId") REFERENCES "TopicSummary"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TopicExample_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "WrongQuestion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "questionId" TEXT NOT NULL,
  "knowledgePoint" TEXT NOT NULL,
  "modelKey" TEXT,
  "errorType" TEXT,
  "wrongCount" INTEGER NOT NULL DEFAULT 1,
  "correctStreak" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'needs_review',
  "firstWrongAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastWrongAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "nextReviewAt" DATETIME NOT NULL,
  "lastEvidenceId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "WrongQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "SolutionMethod_questionId_order_key" ON "SolutionMethod"("questionId", "order");
CREATE INDEX "SolutionMethod_questionId_idx" ON "SolutionMethod"("questionId");
CREATE UNIQUE INDEX "TopicSummary_knowledgePoint_key" ON "TopicSummary"("knowledgePoint");
CREATE UNIQUE INDEX "TopicExample_topicSummaryId_order_key" ON "TopicExample"("topicSummaryId", "order");
CREATE UNIQUE INDEX "TopicExample_topicSummaryId_questionId_key" ON "TopicExample"("topicSummaryId", "questionId");
CREATE INDEX "TopicExample_questionId_idx" ON "TopicExample"("questionId");
CREATE UNIQUE INDEX "WrongQuestion_questionId_key" ON "WrongQuestion"("questionId");
CREATE INDEX "WrongQuestion_nextReviewAt_idx" ON "WrongQuestion"("nextReviewAt");
CREATE INDEX "WrongQuestion_status_idx" ON "WrongQuestion"("status");
CREATE INDEX "WrongQuestion_knowledgePoint_idx" ON "WrongQuestion"("knowledgePoint");
