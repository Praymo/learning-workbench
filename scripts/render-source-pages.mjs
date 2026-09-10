import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const prisma = new PrismaClient();
function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const sourceId = argument("--source-id");
const dpi = Number(argument("--dpi", "144"));

if (!sourceId || sourceId.startsWith("--")) throw new Error("请提供 --source-id");

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${command} 失败：${result.stderr || result.stdout}`);
  return result.stdout;
}

function dimensions(path) {
  const output = run("/usr/bin/sips", ["-g", "pixelWidth", "-g", "pixelHeight", path]);
  return {
    width: Number(output.match(/pixelWidth:\s*(\d+)/)?.[1]) || null,
    height: Number(output.match(/pixelHeight:\s*(\d+)/)?.[1]) || null
  };
}

const source = await prisma.source.findUnique({ where: { id: sourceId } });
if (!source?.localPath) throw new Error("来源不存在或没有本地 PDF");

const outputDir = join(process.cwd(), "data", "generated", "source-pages", source.id);
mkdirSync(outputDir, { recursive: true });
const prefix = join(outputDir, "page");
run(process.env.PDFTOPPM_PATH || "pdftoppm", ["-png", "-r", String(dpi), source.localPath, prefix]);

const images = readdirSync(outputDir)
  .filter((name) => /^page-\d+\.png$/.test(name))
  .sort((left, right) => Number(left.match(/\d+/)?.[0]) - Number(right.match(/\d+/)?.[0]));

for (const [index, name] of images.entries()) {
  const imagePath = join(outputDir, name);
  const bytes = readFileSync(imagePath);
  const size = dimensions(imagePath);
  await prisma.sourcePage.upsert({
    where: { sourceId_pageNumber: { sourceId: source.id, pageNumber: index + 1 } },
    update: {
      imagePath,
      imageHash: createHash("sha256").update(bytes).digest("hex"),
      width: size.width,
      height: size.height,
      renderDpi: dpi,
      status: "rendered"
    },
    create: {
      sourceId: source.id,
      pageNumber: index + 1,
      imagePath,
      imageHash: createHash("sha256").update(bytes).digest("hex"),
      width: size.width,
      height: size.height,
      renderDpi: dpi,
      status: "rendered"
    }
  });
}

console.log(JSON.stringify({ sourceId: source.id, source: source.name, pages: images.length, outputDir }, null, 2));
await prisma.$disconnect();
