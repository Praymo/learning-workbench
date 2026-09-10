CREATE TABLE "ExamProfile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "paperType" TEXT NOT NULL,
  "totalScore" INTEGER NOT NULL DEFAULT 150,
  "durationMinutes" INTEGER NOT NULL DEFAULT 120,
  "structureJson" TEXT NOT NULL,
  "scoringRulesJson" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

ALTER TABLE "Question" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'candidate';
ALTER TABLE "Question" ADD COLUMN "score" INTEGER;
ALTER TABLE "Question" ADD COLUMN "examSection" TEXT;
ALTER TABLE "Question" ADD COLUMN "sourceDataset" TEXT;
ALTER TABLE "Question" ADD COLUMN "sourceIndex" INTEGER;
ALTER TABLE "Question" ADD COLUMN "contentHash" TEXT;
ALTER TABLE "Question" ADD COLUMN "classificationConfidence" REAL;
ALTER TABLE "Question" ADD COLUMN "qualityFlagsJson" TEXT;
ALTER TABLE "Question" ADD COLUMN "estimatedMinutes" INTEGER;
ALTER TABLE "Question" ADD COLUMN "publishedAt" DATETIME;
ALTER TABLE "Question" ADD COLUMN "examProfileId" TEXT REFERENCES "ExamProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "Question" SET "questionType" = 'single_choice' WHERE "questionType" = 'choice';
UPDATE "Question" SET "questionType" = 'multiple_choice' WHERE "questionType" = 'multi_choice';
UPDATE "Question" SET "questionType" = 'fill_blank' WHERE "questionType" = 'blank';
UPDATE "Question"
SET "status" = 'published', "publishedAt" = CURRENT_TIMESTAMP
WHERE "verificationStatus" = 'verified'
  AND "reviewStatus" = 'approved'
  AND "answer" IS NOT NULL
  AND "solution" IS NOT NULL;

CREATE TABLE "RubricPoint" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "questionId" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "points" INTEGER NOT NULL,
  "isRequired" BOOLEAN NOT NULL DEFAULT false,
  "alternativesJson" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "RubricPoint_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "PracticeSet" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "mode" TEXT NOT NULL,
  "knowledgePoint" TEXT,
  "targetMinutes" INTEGER NOT NULL,
  "estimatedMinutes" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ready',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "PracticeItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "practiceSetId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "points" INTEGER NOT NULL,
  CONSTRAINT "PracticeItem_practiceSetId_fkey" FOREIGN KEY ("practiceSetId") REFERENCES "PracticeSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PracticeItem_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "ModelCallCache" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "cacheKey" TEXT NOT NULL,
  "task" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "promptVersion" TEXT NOT NULL,
  "inputHash" TEXT NOT NULL,
  "responseJson" TEXT NOT NULL,
  "inputTokens" INTEGER,
  "outputTokens" INTEGER,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastAccessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Question_contentHash_key" ON "Question"("contentHash");
CREATE INDEX "ExamProfile_year_paperType_idx" ON "ExamProfile"("year", "paperType");
CREATE INDEX "Question_status_idx" ON "Question"("status");
CREATE INDEX "Question_examSection_idx" ON "Question"("examSection");
CREATE INDEX "Question_examProfileId_idx" ON "Question"("examProfileId");
CREATE UNIQUE INDEX "RubricPoint_questionId_order_key" ON "RubricPoint"("questionId", "order");
CREATE INDEX "RubricPoint_questionId_idx" ON "RubricPoint"("questionId");
CREATE INDEX "PracticeSet_createdAt_idx" ON "PracticeSet"("createdAt");
CREATE INDEX "PracticeSet_mode_idx" ON "PracticeSet"("mode");
CREATE UNIQUE INDEX "PracticeItem_practiceSetId_order_key" ON "PracticeItem"("practiceSetId", "order");
CREATE UNIQUE INDEX "PracticeItem_practiceSetId_questionId_key" ON "PracticeItem"("practiceSetId", "questionId");
CREATE INDEX "PracticeItem_questionId_idx" ON "PracticeItem"("questionId");
CREATE UNIQUE INDEX "ModelCallCache_cacheKey_key" ON "ModelCallCache"("cacheKey");
CREATE INDEX "ModelCallCache_task_idx" ON "ModelCallCache"("task");
CREATE INDEX "ModelCallCache_inputHash_idx" ON "ModelCallCache"("inputHash");
