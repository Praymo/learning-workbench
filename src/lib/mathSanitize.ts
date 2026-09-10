import katex from "katex";

export function stripOcrFallback(text: string) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/\b(?:21,32,43|21|32|43)\b/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function renderLatex(latex: string, displayMode = false) {
  return katex.renderToString(latex, {
    displayMode,
    throwOnError: false,
    output: "html",
    strict: "warn"
  });
}

export function splitMathText(text: string) {
  const cleaned = stripOcrFallback(text);
  return cleaned.split(/(\$\$[\s\S]+?\$\$|\$[^$]+\$)/g).filter(Boolean);
}
