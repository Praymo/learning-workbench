CREATE TABLE "SourcePage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sourceId" TEXT NOT NULL,
  "pageNumber" INTEGER NOT NULL,
  "imagePath" TEXT NOT NULL,
  "imageHash" TEXT,
  "width" INTEGER,
  "height" INTEGER,
  "renderDpi" INTEGER NOT NULL DEFAULT 144,
  "textLayerAvailable" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'rendered',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "SourcePage_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "QuestionEvidence" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "questionId" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "sourcePageId" TEXT,
  "evidenceType" TEXT NOT NULL DEFAULT 'original_paper',
  "matchMethod" TEXT NOT NULL,
  "matchStatus" TEXT NOT NULL DEFAULT 'paper_matched',
  "cropPath" TEXT,
  "regionJson" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "QuestionEvidence_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "QuestionEvidence_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "QuestionEvidence_sourcePageId_fkey" FOREIGN KEY ("sourcePageId") REFERENCES "SourcePage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "QuestionExtractionDraft" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sourceId" TEXT NOT NULL,
  "sourcePageId" TEXT,
  "sourceQuestionNumber" TEXT,
  "questionType" TEXT,
  "stem" TEXT NOT NULL,
  "stemLatex" TEXT,
  "optionsJson" TEXT,
  "answer" TEXT,
  "solution" TEXT,
  "sourceRegionJson" TEXT,
  "answerRegionJson" TEXT,
  "provider" TEXT NOT NULL,
  "promptVersion" TEXT,
  "confidence" REAL,
  "status" TEXT NOT NULL DEFAULT 'pending_review',
  "confirmedQuestionId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "QuestionExtractionDraft_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "QuestionExtractionDraft_sourcePageId_fkey" FOREIGN KEY ("sourcePageId") REFERENCES "SourcePage" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "QuestionExtractionDraft_confirmedQuestionId_fkey" FOREIGN KEY ("confirmedQuestionId") REFERENCES "Question" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "SourcePage_sourceId_pageNumber_key" ON "SourcePage"("sourceId", "pageNumber");
CREATE INDEX "SourcePage_status_idx" ON "SourcePage"("status");
CREATE UNIQUE INDEX "QuestionEvidence_questionId_sourceId_key" ON "QuestionEvidence"("questionId", "sourceId");
CREATE INDEX "QuestionEvidence_sourceId_idx" ON "QuestionEvidence"("sourceId");
CREATE INDEX "QuestionEvidence_matchStatus_idx" ON "QuestionEvidence"("matchStatus");
CREATE INDEX "QuestionExtractionDraft_sourceId_idx" ON "QuestionExtractionDraft"("sourceId");
CREATE INDEX "QuestionExtractionDraft_status_idx" ON "QuestionExtractionDraft"("status");
CREATE INDEX "QuestionExtractionDraft_confirmedQuestionId_idx" ON "QuestionExtractionDraft"("confirmedQuestionId");
