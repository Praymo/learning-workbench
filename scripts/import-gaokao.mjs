import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";
import {
  isTargetGaokaoMathPdf,
  normalizeGaokaoPaperType,
  parseGaokaoYear
} from "../src/lib/gaokaoSourcePolicy.ts";

const prisma = new PrismaClient();
const repoUrl = "https://github.com/deekur/gaokaomath";
const repoDir = join(process.cwd(), "data", "sources", "gaokaomath");

function run(command, args, cwd = process.cwd()) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

function ensureRepo() {
  mkdirSync(join(process.cwd(), "data", "sources"), { recursive: true });
  if (!existsSync(repoDir)) {
    run("git", ["clone", "--depth", "1", repoUrl, repoDir]);
  } else {
    run("git", ["pull", "--ff-only"], repoDir);
  }
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function fileHash(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

ensureRepo();
const pdfs = walk(repoDir).filter(isTargetGaokaoMathPdf);
const selected = pdfs;

const importJob = await prisma.importJob.create({
  data: {
    importType: "gaokao_repo_scan",
    inputFile: repoUrl,
    status: "running",
    totalItems: selected.length
  }
});

let successItems = 0;
let failedItems = 0;
const errors = [];

for (const filePath of selected) {
  try {
    const name = basename(filePath);
    const year = parseGaokaoYear(name);
    const hash = fileHash(filePath);
    const unchanged = await prisma.source.findFirst({ where: { fileHash: hash } });
    const sourceData = {
        name,
        sourceType: "gaokao",
        sourceUrl: repoUrl,
        year,
        paperType: normalizeGaokaoPaperType(name),
        publisher: "deekur/gaokaomath",
        licenseNote: "公开 GitHub 仓库文件，仅扫描本地 PDF 元数据和少量人工核验样本。",
        localPath: filePath,
        fileHash: hash
    };
    const source = unchanged
      ? await prisma.source.update({ where: { id: unchanged.id }, data: sourceData })
      : await prisma.source.create({ data: sourceData });

    await prisma.importJob.create({
      data: {
        sourceId: source.id,
        importType: "gaokao_pdf_metadata",
        inputFile: filePath,
        status: unchanged ? "skipped_hash_unchanged" : "success",
        totalItems: 1,
        successItems: 1,
        finishedAt: new Date()
      }
    });
    successItems += 1;
  } catch (error) {
    failedItems += 1;
    errors.push(`${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

await prisma.importJob.update({
  where: { id: importJob.id },
  data: {
    status: failedItems ? "partial_success" : "success",
    successItems,
    failedItems,
    errorLog: errors.join("\n") || null,
    finishedAt: new Date()
  }
});

console.log(`Scanned ${pdfs.length} autumn gaokao math PDF files from 2016-2026, synchronized metadata for ${successItems}, failed ${failedItems}. No questions were created from PDF text layers.`);
await prisma.$disconnect();
