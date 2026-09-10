CREATE TABLE "Submission" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "practiceSetId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'uploaded',
  "ocrProvider" TEXT,
  "ocrError" TEXT,
  "totalScore" INTEGER,
  "maxScore" INTEGER,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Submission_practiceSetId_fkey" FOREIGN KEY ("practiceSetId") REFERENCES "PracticeSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "SubmissionPage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "submissionId" TEXT NOT NULL,
  "pageOrder" INTEGER NOT NULL,
  "filePath" TEXT NOT NULL,
  "fileHash" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SubmissionPage_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "SubmissionAnswer" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "submissionId" TEXT NOT NULL,
  "practiceItemId" TEXT NOT NULL,
  "ocrText" TEXT,
  "correctedText" TEXT,
  "confidence" REAL,
  "score" INTEGER,
  "maxScore" INTEGER NOT NULL,
  "gradingStatus" TEXT NOT NULL DEFAULT 'pending_confirmation',
  "feedback" TEXT,
  "needsReview" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "SubmissionAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SubmissionAnswer_practiceItemId_fkey" FOREIGN KEY ("practiceItemId") REFERENCES "PracticeItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Submission_practiceSetId_idx" ON "Submission"("practiceSetId");
CREATE INDEX "Submission_status_idx" ON "Submission"("status");
CREATE UNIQUE INDEX "SubmissionPage_submissionId_pageOrder_key" ON "SubmissionPage"("submissionId", "pageOrder");
CREATE INDEX "SubmissionPage_fileHash_idx" ON "SubmissionPage"("fileHash");
CREATE UNIQUE INDEX "SubmissionAnswer_submissionId_practiceItemId_key" ON "SubmissionAnswer"("submissionId", "practiceItemId");
CREATE INDEX "SubmissionAnswer_gradingStatus_idx" ON "SubmissionAnswer"("gradingStatus");
