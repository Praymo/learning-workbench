"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SubmissionUploadForm({ practices }: { practices: Array<{ id: string; title: string; createdAt: string }> }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("客观题可不上传照片，直接进入答案录入；有解答题时再附作答照片。");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("正在保存答卷并识别，请勿关闭页面...");
    const response = await fetch("/api/submissions", { method: "POST", body: new FormData(event.currentTarget) });
    const data = await response.json();
    if (!response.ok) {
      setBusy(false);
      setMessage(data.error ?? "上传失败");
      return;
    }
    router.push(`/submissions/${data.submissionId}/confirm`);
  }

  return (
    <form className="edit-form" onSubmit={submit}>
      <label>对应练习单
        <select name="practiceSetId" required defaultValue={practices[0]?.id ?? ""}>
          {practices.length ? practices.map((practice) => (
            <option value={practice.id} key={practice.id}>{practice.title} · {new Date(practice.createdAt).toLocaleDateString("zh-CN")}</option>
          )) : <option value="">请先生成练习</option>}
        </select>
      </label>
      <label>解答题作答照片（可选，不限张数）<input name="files" type="file" accept="image/*" multiple /></label>
      <label className="inline-check"><input name="recordEvidence" type="checkbox" value="off" />测试模式：本次只体验判分，不写入掌握档案和错题复查</label>
      <button className="primary" disabled={busy || !practices.length}>{busy ? "处理中..." : "进入答案确认"}</button>
      <p className="subtle">{message}</p>
    </form>
  );
}
