export type EvidenceQuestionSource = {
  year: number | null;
  paperType: string | null;
  sourceDataset: string | null;
};

export type PdfEvidenceSource = {
  id: string;
  year: number | null;
  name: string;
  paperType: string | null;
  localPath: string | null;
};

function normalized(value: string) {
  return value
    .replace(/Ⅰ|ⅰ/g, "1")
    .replace(/Ⅱ|ⅱ/g, "2")
    .replace(/Ⅲ|ⅲ/g, "3")
    .normalize("NFKC")
    .replace(/一卷/g, "1卷")
    .replace(/二卷/g, "2卷")
    .replace(/三卷/g, "3卷")
    .replace(/\s+/g, "");
}

export function paperFamily(value: string | null | undefined) {
  const label = normalized(value ?? "");
  if (/甲卷|全国甲/.test(label)) return "national-a";
  if (/乙卷|全国乙/.test(label)) return "national-b";
  const match = label.match(/(?:新课标|新高考|全国(?:卷)?)([123])/);
  return match ? `national-${match[1]}` : null;
}

export function datasetStream(value: string | null | undefined) {
  if (/Math[_-]II(?:\D|$)/.test(value ?? "")) return "文";
  if (/Math[_-]I(?:\D|$)/.test(value ?? "")) return "理";
  return null;
}

export function matchPdfEvidence(questionSource: EvidenceQuestionSource, pdfSources: PdfEvidenceSource[]) {
  const family = paperFamily(questionSource.paperType);
  if (!questionSource.year || !family) return { status: "unmatched" as const, reason: "missing_year_or_family", candidates: [] };

  let candidates = pdfSources.filter((source) =>
    source.year === questionSource.year &&
    Boolean(source.localPath) &&
    paperFamily(`${source.paperType ?? ""} ${source.name}`) === family
  );

  if (candidates.length > 1) {
    const stream = datasetStream(questionSource.sourceDataset);
    const streamMatches = stream ? candidates.filter((source) => normalized(`${source.paperType ?? ""} ${source.name}`).includes(stream)) : [];
    if (streamMatches.length === 1) candidates = streamMatches;
  }

  if (candidates.length === 1) {
    return { status: "matched" as const, reason: "year_family_stream", source: candidates[0], candidates };
  }
  return {
    status: candidates.length ? "ambiguous" as const : "unmatched" as const,
    reason: candidates.length ? "multiple_pdf_candidates" : "no_pdf_candidate",
    candidates
  };
}
