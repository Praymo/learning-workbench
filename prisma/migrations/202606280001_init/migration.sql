CREATE TABLE "Source" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceUrl" TEXT,
  "year" INTEGER,
  "paperType" TEXT,
  "publisher" TEXT,
  "isbn" TEXT,
  "licenseNote" TEXT,
  "localPath" TEXT,
  "fileHash" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Question" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sourceId" TEXT NOT NULL,
  "sourceQuestionNumber" TEXT,
  "questionType" TEXT NOT NULL,
  "stem" TEXT NOT NULL,
  "stemLatex" TEXT,
  "optionsJson" TEXT,
  "answer" TEXT,
  "solution" TEXT,
  "difficulty" TEXT,
  "primaryKnowledgePoint" TEXT,
  "relatedKnowledgePointsJson" TEXT,
  "methodTagsJson" TEXT,
  "targetScoreBand" TEXT,
  "sourcePage" INTEGER,
  "imagePathsJson" TEXT,
  "parentQuestionId" TEXT,
  "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
  "reviewStatus" TEXT NOT NULL DEFAULT 'pending_review',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Question_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Question_parentQuestionId_fkey" FOREIGN KEY ("parentQuestionId") REFERENCES "Question" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "ImportJob" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sourceId" TEXT,
  "importType" TEXT NOT NULL,
  "inputFile" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "totalItems" INTEGER NOT NULL DEFAULT 0,
  "successItems" INTEGER NOT NULL DEFAULT 0,
  "failedItems" INTEGER NOT NULL DEFAULT 0,
  "errorLog" TEXT,
  "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" DATETIME,
  CONSTRAINT "ImportJob_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "OcrRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sourceId" TEXT,
  "originalFilePath" TEXT NOT NULL,
  "pageNumber" INTEGER,
  "rawText" TEXT NOT NULL,
  "rawLatex" TEXT,
  "correctedText" TEXT,
  "correctedLatex" TEXT,
  "provider" TEXT NOT NULL,
  "confidence" REAL,
  "status" TEXT NOT NULL DEFAULT 'pending_review',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "OcrRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Source_sourceType_idx" ON "Source"("sourceType");
CREATE INDEX "Source_year_idx" ON "Source"("year");
CREATE INDEX "Source_fileHash_idx" ON "Source"("fileHash");
CREATE INDEX "Question_sourceId_idx" ON "Question"("sourceId");
CREATE INDEX "Question_questionType_idx" ON "Question"("questionType");
CREATE INDEX "Question_primaryKnowledgePoint_idx" ON "Question"("primaryKnowledgePoint");
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");
CREATE INDEX "Question_reviewStatus_idx" ON "Question"("reviewStatus");
CREATE INDEX "ImportJob_status_idx" ON "ImportJob"("status");
CREATE INDEX "ImportJob_importType_idx" ON "ImportJob"("importType");
CREATE INDEX "OcrRecord_status_idx" ON "OcrRecord"("status");
CREATE INDEX "OcrRecord_sourceId_idx" ON "OcrRecord"("sourceId");
