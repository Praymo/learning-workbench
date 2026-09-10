import katex from "katex";

type MathProps = {
  text: string;
  block?: boolean;
};

function renderSegments(text: string) {
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$]+\$)/g);
  return parts.map((part, index) => {
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const html = katex.renderToString(part.slice(2, -2), { displayMode: true, throwOnError: false });
      return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      const html = katex.renderToString(part.slice(1, -1), { displayMode: false, throwOnError: false });
      return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    return <span key={index}>{part}</span>;
  });
}

export function MathText({ text, block = false }: MathProps) {
  if (block) {
    return <div className="math-text">{renderSegments(text)}</div>;
  }
  return <>{renderSegments(text)}</>;
}
