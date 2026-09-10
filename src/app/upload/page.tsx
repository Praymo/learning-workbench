"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppNav } from "@/components/AppNav";

export default function UploadPage() {
  const router = useRouter();
  const [status, setStatus] = useState("请选择图片或 PDF 单页。");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("正在保存文件并调用 OCR...");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/ocr", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "OCR 失败");
      setBusy(false);
      return;
    }
    router.push(`/ocr-review?id=${data.ocrRecordId}`);
  }

  return (
    <main className="app-shell">
      <AppNav />
      <section className="page-header compact">
        <div>
          <h1>上传好题</h1>
          <p className="subtle">上传原图后先进入 OCR 审核，确认前不会生成正式题目。</p>
        </div>
      </section>
      <section className="panel narrow">
        <form className="edit-form" onSubmit={submit}>
          <label>题目图片或 PDF 单页<input name="file" type="file" accept="image/*,.pdf" required /></label>
          <label>识别模式
            <select name="mode" defaultValue="single_question">
              <option value="single_question">单题图片</option>
              <option value="question_page">题目页</option>
              <option value="answer_page">答案页</option>
            </select>
          </label>
          <label>页码<input name="pageNumber" type="number" min="1" placeholder="可选" /></label>
          <button className="primary" disabled={busy}>{busy ? "识别中..." : "保存并识别"}</button>
        </form>
        <p className="subtle">{status}</p>
      </section>
    </main>
  );
}
