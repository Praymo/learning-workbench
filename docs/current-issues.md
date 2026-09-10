# 当前问题审计

## 2026-07-10 重构后状态

- PDF 双栏文本层拆题已停用，`import:gaokao` 仅同步 PDF 元数据和哈希。
- 旧的 63 条损坏记录保留为 `candidate`，不会进入练习。
- 新增 GAOKAO-Bench 结构化导入、规范化去重、题型区分和发布质量门槛。
- 练习只查询 `status=published`，首页将“总记录”与“可正式使用”分开显示。
- 解答题评分点仍是参考草案，需要逐题核对后才能作为正式高考过程分标准。

## 已发现问题

- 数据库不是真正的 Prisma 题库模型：旧版只有 `Chapter` 和 `Problem`，运行时主要使用 `src/lib/probabilitySeed.ts` 的 Mock/种子数据。
- 旧 seed 脚本虽然生成了 SQLite 文件，但没有 Prisma migration，也没有 `Source`、`Question`、`ImportJob`、`OcrRecord` 等可长期使用的数据表。
- OCR 接口是 `mockOcrAnswers()`，只能模拟学生作业批改，不能保存原图、OCR 原始文本、人工修正和确认入库。
- 旧页面仍是周末补习流程：首页、计划、打印、上传作业、批改结果，不符合本轮题库管理信息架构。
- 数学渲染使用 KaTeX，但 `MathText` 将整段文本按 `$...$` 分割后直接渲染，缺少 OCR 正式题干清洗层。若 OCR 将 LaTeX 和纯文本 fallback 合并进 stem，页面会把 fallback 也显示出来。
- 截图中的公式后重复数字更可能来自 OCR/转换文本把分数的辅助文本或 token 内容追加到了题干，例如 `\frac{1}{2}` 后又出现 `21`。不是 KaTeX 自身渲染重复，而是正式题干保存前未区分 `rawText`、`rawLatex` 和人工确认后的 `stem/stemLatex`。
- 旧页面视觉更像项目说明页，大段说明文字过多，缺少题库首页、浏览、详情、上传、OCR 审核和数据源页。
- UTF-8 尚未用测试覆盖，无法证明中文写入 SQLite 后读取完全一致。
- 2026-06-28 追加：之前首页只显示 8 道题，是因为 `scripts/import-gaokao.mjs` 只导入了少量人工 seed 和 PDF 元数据，没有把目标高考 PDF 拆成题号级 Question 记录。已修复为对 2019 全国 1 理、2022 新高考 1、2025 全国 1 三套 PDF 做文本层粗拆题，生成 `raw/pending_review` 题目记录。
- 2026-06-28 追加：前端 500 的直接原因是运行中的 Next dev server 在 `.next` 被清理/重建后缓存损坏，出现 `Cannot find module './331.js'` 和 Next devtools `SegmentViewNode` manifest 错误。已停止 dev server，重新清理 `.next`、构建并用 production server 启动验证。

## 本轮修复方向

- 使用 Prisma + SQLite 建立真实题库表，并提供 migration、seed 和导入脚本。
- 将 OCR 原始结果保存在 `OcrRecord`，人工确认后才创建正式 `Question`。
- 正式题目只使用确认后的 `stem` 和 `stemLatex`；前端使用 KaTeX 渲染 LaTeX，不渲染 OCR HTML fallback。
- 新增中文持久化测试和公式清洗/渲染测试。
- 将前端收束成题库管理风格，去掉大段补习项目说明。
