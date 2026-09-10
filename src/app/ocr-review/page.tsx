"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";

type OcrPayload = {
  id: string;
  originalFilePath: string;
  rawText: string;
  rawLatex?: string | null;
  correctedText?: string | null;
  correctedLatex?: string | null;
  confidence?: number | null;
  provider: string;
};

function OcrReviewContent() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");
  const [record, setRecord] = useState<OcrPayload | null>(null);
  const [message, setMessage] = useState(id ? "加载 OCR 记录..." : "请选择一条待审核 OCR 记录。");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/ocr?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setRecord(data.record);
        setMessage(data.record ? "请审核并修正识别结果。" : "未找到 OCR 记录。");
      });
  }, [id]);

  async function confirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/ocr/confirm", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "确认失败");
      return;
    }
    router.push(`/questions/${data.questionId}`);
  }

  return (
    <main className="app-shell">
      <AppNav />
      <section className="page-header compact">
        <div>
          <h1>OCR 审核</h1>
          <p className="subtle">左侧保留原始图片和 OCR 原文，右侧人工确认后才入库。</p>
        </div>
      </section>
      {!record ? (
        <section className="panel narrow"><p className="empty">{message}</p></section>
      ) : (
        <section className="ocr-layout">
          <aside className="panel">
            <h2>原始材料</h2>
            {record.originalFilePath.match(/\.(png|jpe?g|gif|webp)$/i) ? (
              <img className="source-image" src={record.originalFilePath.replace(/^public/, "")} alt="上传原图" />
            ) : (
              <p className="empty">PDF 文件已保存：{record.originalFilePath}</p>
            )}
            <h3>OCR 原文</h3>
            <pre className="raw-text">{record.rawText}</pre>
            <p className="subtle">Provider：{record.provider} · 置信度：{record.confidence ?? "未提供"}</p>
          </aside>
          <form className="panel edit-form" onSubmit={confirm}>
            <h2>人工确认</h2>
            <input type="hidden" name="ocrRecordId" value={record.id} />
            <label>题号<input name="questionNumber" /></label>
            <label>题型
              <select name="questionType" defaultValue="solution">
                <option value="single_choice">单项选择题</option>
                <option value="multiple_choice">多项选择题</option>
                <option value="fill_blank">填空题</option>
                <option value="solution">解答题</option>
              </select>
            </label>
            <label>题干<textarea name="stem" defaultValue={record.correctedText ?? record.rawText} required /></label>
            <label>题干 LaTeX<textarea name="stemLatex" defaultValue={record.correctedLatex ?? record.rawLatex ?? ""} /></label>
            <label>选项 JSON<textarea name="optionsJson" placeholder="[&quot;A&quot;,&quot;B&quot;]" /></label>
            <label>答案<input name="answer" /></label>
            <label>解析<textarea name="solution" /></label>
            <label>主知识点<input name="primaryKnowledgePoint" /></label>
            <label>难度<input name="difficulty" /></label>
            <button className="primary">确认并生成正式题目</button>
          </form>
        </section>
      )}
    </main>
  );
}

export default function OcrReviewPage() {
  return (
    <Suspense fallback={<main className="app-shell"><AppNav /><section className="panel narrow"><p className="empty">加载 OCR 审核页...</p></section></main>}>
      <OcrReviewContent />
    </Suspense>
  );
}
