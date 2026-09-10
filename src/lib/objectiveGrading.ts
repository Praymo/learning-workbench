import { evaluate, simplify } from "mathjs";

export type ObjectiveQuestion = {
  questionType: "single_choice" | "multiple_choice" | "fill_blank";
  answer: string;
  score: number;
};

function selectedOptions(value: string) {
  return [...new Set(value.toUpperCase().match(/[A-D]/g) ?? [])].sort();
}

function stripMath(value: string) {
  return value
    .trim()
    .replace(/\$/g, "")
    .replace(/\\left|\\right/g, "")
    .replace(/，/g, ",")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/−/g, "-")
    .replace(/∞/g, "\\infty");
}

function replaceLatexFractions(value: string) {
  let result = value;
  const fraction = /\\(?:d?frac)\{([^{}]+)\}\{([^{}]+)\}/g;
  for (let index = 0; index < 8 && fraction.test(result); index += 1) {
    result = result.replace(fraction, "(($1)/($2))");
    fraction.lastIndex = 0;
  }
  return result;
}

function latexToExpression(value: string) {
  const expression = replaceLatexFractions(stripMath(value))
    .replace(/\\sqrt\{([^{}]+)\}/g, "sqrt($1)")
    .replace(/\\pi/g, "pi")
    .replace(/\\cdot|\\times/g, "*")
    .replace(/\\infty/g, "Infinity")
    .replace(/\{/g, "(")
    .replace(/\}/g, ")")
    .replace(/\s+/g, "");
  if (!/^[0-9a-zA-Z_+\-*/^().,]+$/.test(expression)) throw new Error("unsupported expression");
  return expression;
}

function canonicalExpression(value: string) {
  return simplify(latexToExpression(value)).toString().replace(/\s+/g, "");
}

function expressionEquivalent(expected: string, actual: string) {
  try {
    const expectedExpression = latexToExpression(expected);
    const actualExpression = latexToExpression(actual);
    const differenceExpression = `(${expectedExpression})-(${actualExpression})`;
    const difference = simplify(differenceExpression).toString();
    if (difference === "0") return { decided: true, equal: true };
    const variables = [...new Set(`${expectedExpression} ${actualExpression}`.match(/\b[a-zA-Z]\w*\b/g) ?? [])]
      .filter((name) => !["sqrt", "pi", "Infinity", "e"].includes(name));
    if (!variables.length) return { decided: true, equal: false };
    const samples = [-2.3, -1, -0.25, 0.5, 1.7, 3.1];
    let evaluated = 0;
    for (const [index, sample] of samples.entries()) {
      const scope = Object.fromEntries(variables.map((name, variableIndex) => [name, sample + variableIndex * 0.73 + index * 0.11]));
      try {
        const value = Number(evaluate(differenceExpression, scope));
        if (!Number.isFinite(value)) continue;
        evaluated += 1;
        if (Math.abs(value) > 1e-8) return { decided: true, equal: false };
      } catch {
        continue;
      }
    }
    return evaluated >= 3 ? { decided: true, equal: true } : { decided: false, equal: false };
  } catch {
    return { decided: false, equal: false };
  }
}

function setElements(value: string) {
  const cleaned = stripMath(value).replace(/^\\?\{/, "").replace(/\\?\}$/, "");
  if (!cleaned || cleaned === "\\varnothing" || cleaned === "∅") return [];
  return cleaned.split(",").map((item) => canonicalExpression(item)).sort();
}

function setEquivalent(expected: string, actual: string) {
  try {
    const left = setElements(expected);
    const right = setElements(actual);
    return { decided: true, equal: left.length === right.length && left.every((value, index) => value === right[index]) };
  } catch {
    return { decided: false, equal: false };
  }
}

function normalizeIntervals(value: string) {
  return stripMath(value)
    .replace(/\\cup|∪/g, "∪")
    .split("∪")
    .map((part) => part.trim().replace(/\\infty/g, "∞"))
    .sort()
    .join("∪");
}

function looksLikeSet(value: string) {
  const cleaned = stripMath(value);
  return /^(?:\\?\{|\\varnothing|∅)/.test(cleaned);
}

function looksLikeInterval(value: string) {
  const cleaned = stripMath(value);
  return /\\infty|∞|\\cup|∪/.test(cleaned) || /^[[(].+,.+[\])]$/.test(cleaned);
}

export function compareFillBlank(expected: string, actual: string): { decided: boolean; equal: boolean } {
  const expectedParts = expected.split(";;").map((item) => item.trim()).filter(Boolean);
  if (expectedParts.length > 1) {
    const actualParts = actual.split(/;;|；/).map((item) => item.trim()).filter(Boolean);
    if (actualParts.length !== expectedParts.length) return { decided: true, equal: false };
    const comparisons = expectedParts.map((part, index) => compareFillBlank(part, actualParts[index]));
    return { decided: comparisons.every((item) => item.decided), equal: comparisons.every((item) => item.equal) };
  }
  if (looksLikeSet(expected)) return setEquivalent(expected, actual);
  if (looksLikeInterval(expected)) {
    return { decided: true, equal: normalizeIntervals(expected) === normalizeIntervals(actual) };
  }
  const expression = expressionEquivalent(expected, actual);
  if (expression.decided) return expression;
  const normalizedExpected = stripMath(expected).replace(/\s+/g, "").toLowerCase();
  const normalizedActual = stripMath(actual).replace(/\s+/g, "").toLowerCase();
  if (normalizedExpected === normalizedActual) return { decided: true, equal: true };
  return { decided: false, equal: false };
}

export function gradeObjective(question: ObjectiveQuestion, studentAnswer: string) {
  if (question.questionType === "single_choice") {
    const expected = selectedOptions(question.answer);
    const selected = selectedOptions(studentAnswer);
    const correct = expected.length === 1 && selected.length === 1 && expected[0] === selected[0];
    return { score: correct ? question.score : 0, maxScore: question.score, correct, status: correct ? "correct" : "wrong" };
  }

  if (question.questionType === "multiple_choice") {
    const expected = selectedOptions(question.answer);
    const selected = selectedOptions(studentAnswer);
    const hasWrong = selected.some((option) => !expected.includes(option));
    const exact = !hasWrong && selected.length === expected.length && expected.every((option) => selected.includes(option));
    const score = exact ? question.score : hasWrong || selected.length === 0 ? 0 : Math.floor((question.score * selected.length) / expected.length);
    return { score, maxScore: question.score, correct: exact, status: score > 0 ? "partial" : "wrong" };
  }

  const alternatives = question.answer.split(/\|\|/).map((value) => value.trim()).filter(Boolean);
  const comparisons = alternatives.map((answer) => compareFillBlank(answer, studentAnswer));
  const correct = comparisons.some((item) => item.equal);
  if (!correct && comparisons.every((item) => !item.decided)) {
    return { score: null, maxScore: question.score, correct: false, status: "needs_review" };
  }
  return { score: correct ? question.score : 0, maxScore: question.score, correct, status: correct ? "correct" : "wrong" };
}
