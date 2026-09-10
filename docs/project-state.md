# Project State

Last verified: 2026-07-14

## Goal

Build a warm, practical local mathematics tutoring tool for one high-school student. The system should improve score stability through reliable questions, clear solutions, paper-based practice, confirmed OCR grading, process-point feedback, and later wrong-question review.

The project is intentionally question-bank-first. Automatic weekly plans, broad student profiling, chat tutoring, and large-scale AI question generation are deferred.

## Current Stack

- Next.js 15, React 19, and TypeScript.
- Prisma 6 with SQLite at `data/question-bank.db`.
- KaTeX-based mathematics rendering.
- Local source PDFs and uploads, both excluded from Git.
- OpenAI-compatible provider interface for vision, solving, and review models.
- Model-call cache keyed by task, model, prompt version, and input hash.

## Implemented Data Model

The Prisma schema currently includes:

- `Source` and `ImportJob` for provenance and imports.
- `ExamProfile` for versioned examination structures.
- `Question` and `RubricPoint` for the four question types and process scoring.
- `SolutionMethod`, `TopicSummary`, and `TopicExample` for human-reviewed method comparison and compact topic teaching.
- `PracticeSet` and `PracticeItem` for deterministic practice selection and printing.
- `Submission`, `SubmissionPage`, and `SubmissionAnswer` for multi-photo answer sheets.
- `OcrRecord` for editable OCR review.
- `ModelCallCache` for avoiding repeated model calls.
- `WrongQuestion` for deterministic local review scheduling.

Question lifecycle:

```text
candidate -> parsed -> solved -> verified -> published
                                      \-> rejected
```

Only `published` questions are available to practice selection.

## Verified Database Snapshot

The local SQLite database was queried directly on 2026-07-14:

| Metric | Count |
| --- | ---: |
| Total question records | 657 |
| Published and usable | 569 |
| Verified, awaiting publication | 0 |
| Candidate, rejected, or legacy records | 88 |

Published questions by type:

| Question type | Count |
| --- | ---: |
| Single choice | 287 |
| Multiple choice | 19 |
| Fill blank | 129 |
| Solution | 134 |

These counts describe the current local database, not files committed to Git. The database itself is ignored.

Two pure-recall trigonometric templates (`sin 30°` and `tan 45°`) were retired on 2026-07-12 and are not selectable. On 2026-07-13, 26 high-one low-mid core template questions were added as published local generated templates, including 5 solution questions and 15 rubric points. These questions are explicitly labelled as generated templates and do not claim to be gaokao originals.

On 2026-07-13, the source policy was expanded to every autumn ordinary-gaokao mathematics paper from 2016 through 2026. The local source registry now includes 119 PDF papers across national, Beijing, Shanghai, and other provincial paper types. The structured GAOKAO-Bench import also retained National III records, adding 138 question records; 134 passed the current publication gate and 4 remain in review.

On 2026-07-14, all 527 GAOKAO-Bench question records were deterministically linked to their matching local original-paper PDF using year, paper family, and arts/science stream. The first 2024 National New Gaokao I paper was rendered into two visually checked page images. Page extraction drafts now have a separate review table and cannot publish directly.

## Implemented Workflows

- A responsive warm-paper visual system and product-focused homepage that exposes the real question-bank, practice, submission, OCR, and source workflows without changing their data boundaries.
- Browse, filter, inspect, edit, and review questions.
- Track source files and import jobs.
- Import structured GAOKAO-Bench records with normalization and publication gates.
- Register all 2016-2026 autumn ordinary-gaokao mathematics PDFs as source evidence without relying on unreliable two-column text extraction.
- Link structured questions back to original-paper PDFs without replacing their structured dataset provenance.
- Render original PDFs into local page images and store visual extraction drafts separately from formal questions.
- Generate three deterministic practice modes: objective stability, solution process, and transfer/comprehensive.
- Render A4 student and answer versions.
- Upload an arbitrary number of answer-sheet photos, with a 20 MB safety limit per file and server-side batches of four.
- Confirm recognized answers before grading.
- Grade single-choice, multiple-choice, and fill-blank answers with program rules.
- Route solution grading through stored rubric points and provider interfaces; unresolved cases require manual review.
- Fall back to manual answer entry when no vision model is configured. No fake OCR or process score is produced.
- Generate exact, near-duplicate, and model fingerprints for all questions.
- Score initial difficulty from the question's position inside its original section, with related-knowledge adjustments and a versioned rule.
- Exclude questions used in the latest three practice sets and enforce objective-practice difficulty quotas.
- Show question-selection reasons, exclusions, and shortages on each generated practice set.
- Maintain a local, manually reviewed shortlist of provincial mock exams, city exams, and multi-province or school-alliance joint exams.
- Provide an editable source-candidate review table for paper URL, answer URL, watermark, answer completeness, and approval status.
- Include 33 locally generated, explicitly labelled high-one foundation templates across sets, functions, exponential/logarithmic functions, trigonometry, vectors, complex numbers, statistics, and probability.
- Include 26 locally generated, explicitly labelled high-one low-mid core templates across objective and solution types, with basic rubrics for the solution questions.
- Default practice to the high-one curriculum and a 50/40/10 foundation/core/advanced transition profile; later modules require an explicit scope change.
- Register new mock-exam candidates directly from `/import`, including paper URL and answer URL.
- Upload question and answer PDFs separately for each mock-exam candidate, keeping both files local and outside Git.
- Generate cached per-question AI answer drafts without overwriting formal answers; adoption requires an explicit human confirmation.
- Render a printable answer-version URL for every imported source.
- Allow objective-only submissions with no photos: single choice, multiple choice, and fill blank are entered directly and graded locally.
- Compare fill-blank answers locally across rational numbers, radicals, algebraic expressions, sets, intervals, and ordered multi-blank forms; unsupported answers require review.
- Store detailed solution rubric definitions and per-point grading evidence; incomplete rubrics are blocked from model grading.
- Require human confirmation of per-point process scores before recording solution evidence.
- Maintain a local evidence ledger and explainable knowledge mastery using algorithm `weighted-v1`; fewer than three observations remain explicitly insufficient.
- Publish seven initial high-one topic summaries with 13 representative published questions.
- Expand the trigonometry summary into four full lessons: basic formulas, identity transformations, graphs and properties, and solving triangles. Each lesson contains 1,500-2,500 characters, four original examples, reusable methods, and checked answers.
- Add a second full lesson series for function concepts and properties: domain/range, monotonicity/extrema, parity/symmetry, and composition/parameters. Each page now contains 2,700-3,100 characters, a purpose-built concept diagram, a structure-based method decision tree, and six variants progressing from recognition to comprehensive work. Selected examples compare current-mainline solutions with optional methods such as derivatives, discriminants, root-distribution reasoning, inequalities, and function iteration.
- Expand the remaining five current topic modules into 15 independent lesson pages: sets/logic, exponential/logarithmic functions, planar vectors, probability, and statistics. Each page contains at least 1,500 characters, five verified draft examples progressing from structure recognition to transfer, and a module-specific explanatory diagram. Conic sections remain outside this milestone.
- Store multiple solution methods separately from the base solution; the first probability example contains two human-verified methods.
- Create a wrong-question queue only from confirmed scores, with idempotent updates and a two-success mastery rule.
- Generate deterministic review sheets from original wrong questions and same-model published variants.
- Support submission-level test mode so operator trials are graded without contaminating student evidence.
- Default new practice to the high-one curriculum and balanced difficulty; later modules require an explicit scope change, and pure-recall questions below the profile floor are skipped.
- Generate cached AI variants only from published parent questions, storing them as reviewable candidates rather than formal questions.
- Run the production site through a macOS LaunchAgent with login startup, crash restart, fixed localhost port, health check, and local logs.
- Keep student navigation focused on practice, grading, wrong questions, topics, and mastery; consolidate source, import, and OCR tools under `/maintenance`.

## Model Configuration

Model configuration is server-side in `.env`:

```env
LLM_BASE_URL="https://api.openai.com/v1"
LLM_API_KEY="replace-with-your-key"
MODEL_FAST="general-math-model"
MODEL_VISION="vision-model"
MODEL_REVIEW="strong-review-model"
```

Do not store real keys in documentation or Git. With no key configured, question browsing, practice generation, printing, uploads, manual OCR confirmation, and objective grading remain usable.

## Known Gaps

- The 2023-2026 and regional papers still need visual question splitting, page crops, answer association, and verification. The page/draft pipeline exists, but no fake extraction is produced without a configured vision model.
- Current knowledge-point tags are primarily rule-based and require review for low-confidence or comprehensive questions.
- Solution rubrics are drafts; they must be checked question by question before claiming gaokao-equivalent process scoring.
- Mathematical equivalence for all fill-blank answer forms is not yet complete.
- Verified AI variants are not implemented; review sheets currently reuse verified published questions only.
- Automated browser inspection may be unavailable in some Codex sessions; use build, HTTP, database, and server-side checks when that occurs.
- Near-duplicate fingerprints deliberately identify parameter variants as one family; suspicious groups still require human review before merging or rejecting records.
- Difficulty `position-v1` is an initial prior, not a claim about measured student difficulty; future confirmed performance can calibrate it without overwriting source position data.
- Public searches for mock papers frequently lead to commercial banks or directories with unclear reuse terms; candidate URLs remain outside the formal bank until paper, answer, watermark, and usage conditions are reviewed.
- AI answer generation has a safe unconfigured state and was not live-called during this milestone; real provider output still needs a configured-key smoke test before relying on it.
- Existing imported solution rubrics are still simple drafts. They must be enriched in the question detail editor before visual process grading becomes available for those questions.

## Next Recommended Milestones

1. Research and approve the first small batch from the 15 simulated-exam source candidates; do not bulk import unverified files.
2. Import 50-100 approved mock-exam questions and report duplicate, missing-answer, image, knowledge, and difficulty distributions.
3. Audit the 88 non-published candidate, rejected, or legacy records; publish only records with complete answers, solutions, images, and reliable question boundaries.
4. Build a visual import pipeline for complete 2023-2026 National I papers, preserving page crops and source references.
5. Audit knowledge tags and rubrics for a representative mix of all four question types.
6. Expand local mathematical-equivalence grading for roots, algebraic expressions, sets, intervals, and multi-blank answers.
7. Replace draft solution rubrics with detailed subquestion scoring points before enabling visual API process grading.
8. Expand human-reviewed multi-solution examples only where methods are genuinely distinct, beginning with functions, vectors, and geometry.
9. Add error-type-specific review hints after enough confirmed wrong-answer evidence exists.

## Git Plan

The repository currently has no initial commit. Keep generated/private data out of Git and create intentional commits in this order:

1. `chore: initialize application and project guardrails`
   Project configuration, `.gitignore`, `.env.example`, README, `AGENTS.md`, and docs.
2. `feat: add local question bank and import pipeline`
   Prisma schema and migrations, database helpers, exam profiles, question-bank logic, import scripts, and data-quality tests.
3. `feat: add question review and printable practice`
   Question/source/import pages, practice selection, math rendering, print views, and related tests.
4. `feat: add confirmed OCR submission grading`
   Upload and confirmation pages, OCR/model providers, objective grading, solution-review flow, APIs, and tests.

Before staging, inspect each commit's exact file list. Do not commit the local SQLite database, downloaded PDFs, uploaded images, `.env`, caches, or model outputs.
