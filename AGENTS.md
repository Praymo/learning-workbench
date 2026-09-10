# Project Instructions

## Purpose

This repository is a local, single-student high-school mathematics practice and grading tool. Its current priority order is:

1. Reliable question-bank data and source traceability.
2. Accurate question types, answers, solutions, knowledge tags, and rubrics.
3. Useful printable practice.
4. Objective grading and confirmed OCR.
5. Solution-question process grading.
6. Wrong-question review and student mastery only after the evidence is reliable.

Stay in this repository. Do not create a second project or expand it into an LMS, class-management product, social product, or large multi-agent system unless the user explicitly changes scope.

## Product Boundaries

- The product serves one student and stores data locally.
- Preserve Chinese content and UTF-8 throughout the stack.
- Use the four explicit question types: `single_choice`, `multiple_choice`, `fill_blank`, and `solution`.
- Only questions with `status=published` may be selected for practice.
- OCR output must remain editable and must be confirmed by the user before grading.
- Never fabricate OCR, model confidence, scores, source provenance, or high-exam marking precision.
- Objective questions should be graded by deterministic code where possible.
- Model calls must use provider interfaces, small task-specific inputs, versioned prompts, and local input-hash caching.
- Keep future extension boundaries stable: question source, OCR, solver, grading, verification, practice selection, and student evidence providers.

## Question-Bank Rules

- Prefer structured, attributable data over PDF text-layer scraping.
- Treat the local gaokao PDF collection as original evidence, not automatically parsed question data.
- Preserve source year, paper, question number, page, images, answer, solution, and review status.
- Do not publish records with missing answers, broken formulas, missing required images, or uncertain question boundaries.
- AI-generated variants are deferred until verified source questions and examination-pattern rules are dependable.
- Never bypass paywalls, authentication, captchas, or commercial question-bank restrictions.

## Data And Secrets

Never commit:

- `.env` or API keys.
- SQLite databases and their journal, WAL, or SHM files.
- downloaded PDF/data repositories under `data/sources`.
- uploaded question or answer-sheet images.
- `.next`, `node_modules`, caches, logs, or generated local JSON data.

Commit `.env.example` with placeholder values only. Do not print complete API keys in terminal output, logs, screenshots, documentation, or responses.

## Working Method

- Inspect the current implementation and database before making repo-state claims.
- Preserve user changes in a dirty worktree and keep edits scoped to the request.
- Use Prisma migrations for schema changes and make seed/import jobs repeatable.
- Prefer rules and structured parsers before LLM calls.
- Keep UI operational, restrained, and focused on question review, practice, printing, OCR confirmation, and grading.
- Do not add placeholder pages or fake API responses to imply completion.

Before proposing a commit, run the checks proportional to the change. For normal application changes, use:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

For database changes, also run:

```bash
npx prisma validate
npm run db:migrate
```

Do not run `git add`, `git commit`, or `git push` without the user's explicit approval.

## Context Files

- Read `docs/project-state.md` first for the current implementation state and next priorities.
- Read `README.md` for setup and operator commands.
- Read `docs/current-issues.md` when working on data quality, encoding, KaTeX, or legacy records.
- Update `docs/project-state.md` after a material milestone, database-count change, or scope decision.
