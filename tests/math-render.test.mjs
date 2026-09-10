import assert from "node:assert/strict";
import test from "node:test";
import { renderLatex, splitMathText, stripOcrFallback } from "../src/lib/mathSanitize.ts";

const formulas = [
  "\\frac{1}{2}",
  "\\sqrt{x+1}",
  "2^3",
  "a_n",
  "[0,1]",
  "A\\cap B",
  "C_5^2",
  "P(A\\mid B)",
  "f(x)=\\begin{cases}x,&x\\ge 0\\\\-x,&x<0\\end{cases}"
];

test("KaTeX renders common high-school formulas without raw MathML fallback", () => {
  for (const formula of formulas) {
    const html = renderLatex(formula);
    assert.match(html, /katex/);
    assert.doesNotMatch(html, /<math/);
  }
});

test("OCR fallback artifacts are stripped before formal question rendering", () => {
  const cleaned = stripOcrFallback("命中概率分别为 $\\frac{1}{2}$，$\\frac{2}{3}$，$\\frac{3}{4}$ 21,32,43");
  assert.equal(cleaned.includes("21,32,43"), false);
  assert.deepEqual(splitMathText(cleaned).filter((part) => part.startsWith("$")).length, 3);
});
