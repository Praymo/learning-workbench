import { renderLatex, splitMathText, stripOcrFallback } from "./mathSanitize";
export { renderLatex, splitMathText, stripOcrFallback };

export function MathContent({ text, latex }: { text: string; latex?: string | null }) {
  if (latex) {
    return (
      <div className="math-content">
        <span>{stripOcrFallback(text)}</span>
        <span
          className="latex-block"
          dangerouslySetInnerHTML={{ __html: renderLatex(latex, true) }}
        />
      </div>
    );
  }

  return (
    <span className="math-content">
      {splitMathText(text).map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          return <span key={index} dangerouslySetInnerHTML={{ __html: renderLatex(part.slice(2, -2), true) }} />;
        }
        if (part.startsWith("$") && part.endsWith("$")) {
          return <span key={index} dangerouslySetInnerHTML={{ __html: renderLatex(part.slice(1, -1), false) }} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
