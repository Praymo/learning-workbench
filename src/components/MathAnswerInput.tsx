"use client";

import { useRef, useState } from "react";
import { MathContent } from "@/lib/mathContent";

const symbols = [
  ["分数", "\\frac{}{}"],
  ["根号", "\\sqrt{}"],
  ["指数", "^{}"],
  ["绝对值", "||"],
  ["π", "\\pi"],
  ["∞", "\\infty"],
  ["∪", "\\cup"],
  ["集合", "\\{\\}"],
] as const;

export function MathAnswerInput({ name, defaultValue = "" }: { name: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const input = useRef<HTMLInputElement>(null);

  function insert(text: string) {
    const element = input.current;
    const start = element?.selectionStart ?? value.length;
    const end = element?.selectionEnd ?? start;
    const next = `${value.slice(0, start)}${text}${value.slice(end)}`;
    setValue(next);
    requestAnimationFrame(() => {
      element?.focus();
      element?.setSelectionRange(start + text.length, start + text.length);
    });
  }

  return <div className="math-answer-input">
    <input ref={input} name={name} value={value} onChange={(event) => setValue(event.target.value)} placeholder="输入答案或使用下方数学符号" />
    <div className="math-symbol-toolbar">{symbols.map(([label, text]) => <button type="button" key={label} onClick={() => insert(text)}>{label}</button>)}</div>
    <div className="math-answer-preview"><span>预览</span>{value ? <MathContent text={`$${value}$`} /> : <i>尚未输入</i>}</div>
  </div>;
}
