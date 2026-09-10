import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { prisma } from "./db";

type JsonModelInput = {
  task: string;
  promptVersion: string;
  model: string;
  system: string;
  payload: unknown;
  imagePaths?: string[];
};

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function parseJsonContent(content: string) {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

function mimeType(path: string) {
  const extension = extname(path).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "image/jpeg";
}

export function modelConfiguration() {
  return {
    configured: Boolean(process.env.LLM_API_KEY),
    baseUrl: (process.env.LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
    fastModel: process.env.MODEL_FAST || "",
    visionModel: process.env.MODEL_VISION || "",
    reviewModel: process.env.MODEL_REVIEW || ""
  };
}

export async function runJsonModel<T>(input: JsonModelInput): Promise<T> {
  const config = modelConfiguration();
  if (!config.configured) throw new Error("尚未配置 LLM_API_KEY");
  if (!input.model) throw new Error(`任务 ${input.task} 尚未配置模型名称`);

  const imageHashes = [];
  const imageContents = [];
  for (const path of input.imagePaths ?? []) {
    const bytes = await readFile(path);
    imageHashes.push(hash(bytes.toString("base64")));
    imageContents.push({
      type: "image_url",
      image_url: { url: `data:${mimeType(path)};base64,${bytes.toString("base64")}`, detail: "high" }
    });
  }

  const inputHash = hash(JSON.stringify({ payload: input.payload, imageHashes }));
  const cacheKey = hash(JSON.stringify({ task: input.task, promptVersion: input.promptVersion, model: input.model, inputHash }));
  const cached = await prisma.modelCallCache.findUnique({ where: { cacheKey } });
  if (cached) {
    await prisma.modelCallCache.update({ where: { id: cached.id }, data: { lastAccessedAt: new Date() } });
    return JSON.parse(cached.responseJson) as T;
  }

  const userContent = [
    { type: "text", text: JSON.stringify(input.payload) },
    ...imageContents
  ];
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LLM_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: input.model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: userContent }
      ]
    })
  });

  if (!response.ok) throw new Error(`模型请求失败：${response.status} ${await response.text()}`);
  const body = await response.json();
  const content = body.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("模型未返回 JSON 文本");
  const parsed = parseJsonContent(content) as T;

  await prisma.modelCallCache.create({
    data: {
      cacheKey,
      task: input.task,
      provider: config.baseUrl,
      model: input.model,
      promptVersion: input.promptVersion,
      inputHash,
      responseJson: JSON.stringify(parsed),
      inputTokens: body.usage?.prompt_tokens,
      outputTokens: body.usage?.completion_tokens
    }
  });
  return parsed;
}
