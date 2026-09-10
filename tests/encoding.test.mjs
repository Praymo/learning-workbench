import assert from "node:assert/strict";
import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { PrismaClient } from "@prisma/client";

const testDirectory = mkdtempSync(join(tmpdir(), "learning-workbench-encoding-"));
const testDatabase = join(testDirectory, "encoding.db");
copyFileSync(resolve("data/question-bank.db"), testDatabase);

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${testDatabase}` } }
});

test("Chinese text round-trips through SQLite without mojibake", async () => {
  const text = "甲、乙、丙三人各投篮一次，命中概率分别为……";
  const source = await prisma.source.upsert({
    where: { id: "test-utf8-source" },
    update: { name: "UTF-8 测试来源" },
    create: {
      id: "test-utf8-source",
      name: "UTF-8 测试来源",
      sourceType: "manual_upload",
      licenseNote: "测试数据"
    }
  });

  const question = await prisma.question.upsert({
    where: { id: "test-utf8-question" },
    update: { stem: text },
    create: {
      id: "test-utf8-question",
      sourceId: source.id,
      questionType: "solution",
      stem: text,
      verificationStatus: "verified",
      reviewStatus: "approved"
    }
  });

  const reread = await prisma.question.findUniqueOrThrow({ where: { id: question.id } });
  assert.equal(reread.stem, text);
});

test.after(async () => {
  await prisma.question.deleteMany({ where: { id: "test-utf8-question" } });
  await prisma.source.deleteMany({ where: { id: "test-utf8-source" } });
  await prisma.$disconnect();
  rmSync(testDirectory, { recursive: true, force: true });
});
