# NASA-TLX LLM Evaluation — Test 1 Results

**Date:** 25 April 2026  
**Fixtures:** `html-high`, `css-high`, `js-high`, `tsx-high`  
**Conditions:** `rag-think`, `rag-nothink`, `norag-think`, `norag-nothink` (4 per config)

---

## Files in this folder

| File | Description |
|------|-------------|
| `nasa-tlx-kimi-k2.5+gpt-oss:120b-cloud+qwen3.5:397b-cloud-all-conditions-...-08-40-...` | Individual models — Run 1 (first attempt) |
| `nasa-tlx-kimi-k2.5+gpt-oss:120b-cloud+qwen3.5:397b-cloud-all-conditions-...-11-59-...` | Individual models — Run 2 (used for analysis below) |
| `nasa-tlx-multi-stage-voting-kimi-qwen-all-conditions-...-13-23-...` | kimi + qwen voting |
| `nasa-tlx-multi-stage-voting-all-conditions-...-14-47-...` | kimi + gpt voting |
| `nasa-tlx-multi-stage-voting-3models-all-conditions-...-16-51-...` | kimi + gpt + qwen voting (3-model) |

> All statistics below use **Run 2** for the individual models (full 48-row dataset). Run 1 is a repeat for variability reference.

---

## Overall Configuration Comparison

> Averages are across all 4 conditions × 4 fixtures (16 rows per voting config; 48 rows for individual models = 3 models × 16 rows).

| Configuration | Avg F1 | Avg Precision | Avg Recall | Avg TLX | Avg RT (s) | TLX Category |
|---|:---:|:---:|:---:|:---:|:---:|---|
| Individual (kimi + gpt + qwen) | 0.45 | **0.82** | 0.33 | 44 | 240 | Low–Moderate |
| **kimi-qwen Voting** | **0.55** | 0.59 | 0.54 | 65 | 316 | High |
| kimi-gpt Voting | 0.53 | 0.58 | 0.52 | 61 | 315 | Moderate–High |
| 3-Model Voting (all three) | 0.53 | 0.48 | **0.60** | **67** | 462 | High |

**Bold** = best in column.

---

## Individual Models Breakdown (Run 2)

### Per-model averages (across all 4 conditions × 4 fixtures)

| Model | Avg F1 | Avg Precision | Avg Recall | Avg TLX | Avg RT (s) |
|---|:---:|:---:|:---:|:---:|:---:|
| kimi-k2.5:cloud | **0.49** | 0.83 | **0.36** | 44 | 323 |
| gpt-oss:120b-cloud | 0.43 | 0.80 | 0.32 | 46 | 149 |
| qwen3.5:397b-cloud | 0.41 | **0.83** | 0.30 | 43 | **247** |

> kimi is the best individual model overall. gpt-oss is notably faster (149s avg). qwen had 2 complete zero-detection failures in `rag-think` (`html-high`, `js-high`), dragging its average down.

### Per-model F1 by condition

| Condition | kimi | gpt | qwen |
|---|:---:|:---:|:---:|
| rag-think | **0.54** | **0.50** | 0.26 |
| rag-nothink | 0.48 | 0.34 | **0.45** |
| norag-think | 0.44 | 0.45 | **0.47** |
| norag-nothink | 0.49 | 0.43 | 0.47 |

> kimi peaks at `rag-think`. gpt peaks at `rag-think`. **qwen is unusual**: RAG+think causes failures — `norag-think` or `norag-nothink` work best for it.

---

## Voting Mode Breakdown

### F1 by condition

| Condition | kimi-qwen | kimi-gpt | 3-models |
|---|:---:|:---:|:---:|
| rag-think | **0.61** | 0.53 | 0.51 |
| rag-nothink | 0.59 | 0.49 | **0.56** |
| norag-think | 0.54 | 0.54 | 0.54 |
| norag-nothink | 0.57 | **0.57** | 0.49 |

> kimi-qwen is clearly best in `rag-think`. kimi-gpt is most consistent across conditions (narrow range 0.49–0.57). 3-model voting struggles in `norag-nothink` despite highest overall recall.

### F1 by fixture

| Fixture | kimi-qwen | kimi-gpt | 3-models |
|---|:---:|:---:|:---:|
| html-high | **0.73** | 0.60 | 0.63 |
| css-high | 0.56 | **0.58** | 0.49 |
| tsx-high | **0.59** | 0.59 | 0.59 |
| js-high | 0.44 | 0.36 | 0.40 |

> `js-high` is the hardest fixture for every configuration. `html-high` sees the largest spread — kimi-qwen particularly excels here.

---

## Best Condition per Configuration

| Configuration | Best condition | Avg F1 |
|---|---|:---:|
| kimi-k2.5 (individual) | rag-think | 0.54 |
| gpt-oss (individual) | rag-think | 0.50 |
| qwen3.5 (individual) | norag-think | 0.47 |
| kimi-qwen voting | rag-think | 0.61 |
| kimi-gpt voting | norag-nothink | 0.57 |
| 3-model voting | rag-nothink | 0.56 |

---

## TLX Subscale Averages (Predicted Cognitive Load)

TLX subscales (0–100): Mental, Physical, Temporal, Performance (effort to meet goals), Effort, Frustration.

| Configuration | Mental | Physical | Temporal | Performance | Effort | Frustration |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| kimi (individual) | 85 | 2 | 14 | 51 | 76 | 68 |
| gpt (individual) | 70 | 0 | 11 | 54 | 66 | 67 |
| qwen (individual) | 78 | 1 | 11 | 62 | 74 | 67 |
| kimi-qwen voting | 99 | 2 | 18 | 19 | 97 | 88 |
| kimi-gpt voting | 99 | 1 | 15 | 32 | 93 | 87 |
| 3-model voting | 100 | 2 | 21 | 22 | 98 | 97 |

> Voting modes produce near-maximum Mental (100), Effort (~97), and Frustration (~90) subscale scores, largely because they detect far more issues (and more FPs) than individual models. The Performance subscale is actually lower for voting (19–32) because the high number of flagged items implies the user is less likely to feel they performed well at the review task.

---

## Fixture Difficulty Summary (all configs combined)

| Fixture | Avg F1 (individual) | Avg F1 (voting avg) | Relative Difficulty |
|---|:---:|:---:|---|
| html-high | 0.40 | 0.65 | Moderate — voting excels |
| css-high | 0.55 | 0.54 | Moderate |
| tsx-high | 0.53 | 0.59 | Moderate |
| js-high | 0.30 | 0.40 | **Hardest** — all configs struggle |

> JavaScript is consistently the hardest fixture for accessibility detection. Complex JSX/TS semantics, dynamic interactions, and fewer explicit ARIA/HTML landmarks make issues harder for the LLM to identify reliably.

---

## Run Variability (Run 1 vs Run 2 — Individual Models)

Both runs used the same config: all 3 models × 4 fixtures × 4 conditions.

| Metric | Run 1 (08:40) | Run 2 (11:59) |
|---|:---:|:---:|
| Sample F1 (rag-think only, 12 rows) | ~0.40 | ~0.43 |
| Notable difference | gpt css-high: 0 issues | qwen html/js-high: 0 issues |

> LLM outputs are non-deterministic — a ~0.03 F1 shift between runs is expected. The zero-detection failures differ between runs, confirming these are stochastic failures rather than systematic ones. Repeating runs and averaging is recommended for final evaluation.

---

## Which Configuration is Best?

### For highest F1 (quality balance):
**→ kimi-qwen voting, rag-think condition (avg F1 = 0.61)**

Best overall detection quality. Pairs well with RAG context and extended thinking. A good default for dissertation benchmarking.

### For highest recall (catch the most issues):
**→ 3-model voting, rag-nothink condition (recall = 0.60, F1 = 0.56)**

If missing accessibility issues is the greater risk, the 3-model union finds the most. Trade-off: 462s avg response time and highest false positive rate (precision = 0.48).

### For speed + acceptable quality:
**→ gpt-oss:120b-cloud individual, rag-think (149s avg, F1 = 0.50)**

At ~2.5× the speed of kimi and consistent F1, gpt-oss is the pragmatic choice when throughput matters.

### For lowest predicted cognitive burden on the user (TLX):
**→ Individual models (avg TLX ~44 vs ~65 for voting)**

Fewer issues reported, higher precision, cleaner outputs = less overwhelming for human reviewers. Important if the goal is usable real-time feedback rather than comprehensive audit.

### Summary recommendation:
Use **kimi-qwen voting with rag-think** as the primary configuration. It peaks on F1, hits the best recall–precision balance among voting modes, and the ~316s response time is acceptable for asynchronous analysis. For a supplementary analysis with a catch-everything focus, run **3-model voting with rag-nothink** and filter by high-confidence issues only.

---

## Model Improvements Applied After Test 1

The following changes were made to `nasa-tlx-test-harness.ts` after reviewing Test 1 results. These improve the calibration of the TLX prediction model for future runs.

### 1. Severity Weighting

Previously all issues were treated equally regardless of the `severity` field on each `AccessibilityIssue`. A critical keyboard trap was weighted the same as a low-severity colour issue.

**Fix:** Each issue now contributes a severity-weighted count before logarithmic scaling:

| Severity | Weight |
|---|:---:|
| critical | 2.0 |
| high | 1.5 |
| medium | 1.0 |
| low | 0.5 |

This corrects the underestimation documented in `TEST-RESULTS.md` (predicted TLX 27 vs actual 66 for an 8-issue high-density fixture), where all issues were critical/high.

### 2. Extended WCAG SC Matching in Barrier Classification

Previously `classifyIssueBarrier()` matched only a narrow set of English keywords. LLM outputs that describe violations using WCAG Success Criterion numbers (e.g. `"1.4.3 insufficient contrast"`, `"2.4.1 skip link missing"`) or slightly different phrasings would fall through to the generic `cluttered-layout` fallback.

**Fix:** Expanded matching to cover:
- WCAG SC number patterns via regex (e.g. `\b1\.4\.3\b`, `\b2\.4\.1\b`) for each barrier type
- British and American English variants (`colour` / `color`)
- Additional LLM output phrases seen in Test 1 (e.g. `aria-`, `live region`, `status message`, `bypass`, `alt`, `reading order`)

### 3. Raised Per-Barrier Caps and Added Density Penalty

Per-barrier dimension caps were too conservative (mental/effort capped at 40, frustration at 45), making it impossible to reach the empirically observed TLX range for high-density fixtures regardless of how many critical issues were present.

**Fix:**
- Raised caps: mental demand 40 → 55, effort 40 → 55, temporal 35 → 40, frustration 45 → 60
- Added a **density penalty** applied after per-barrier scoring:
  - Temporal demand: +1.5 pts per issue (capped at 18)
  - Performance: −1.5 pts per issue (capped at 25)

This ensures the model can reach TLX ≈ 60–70 for fixtures with 20–30 issues, consistent with real developer ratings.

### 4. Language Difficulty Modifier

JavaScript and TypeScript/React fixtures consistently scored the lowest F1 across all Test 1 configurations (JS avg F1 ≈ 0.30 vs HTML ≈ 0.40). Accessibility issues in these languages involve more complex reasoning — dynamic ARIA state, event handlers, React component semantics — and impose higher cognitive burden when surfaced. The original model applied an identical scoring formula regardless of language.

**Fix:** A post-scoring multiplier is applied to `raw_tlx` based on fixture language:

| Language | Modifier |
|---|:---:|
| JavaScript | ×1.20 |
| TypeScript / TSX | ×1.10 |
| CSS | ×0.95 |
| HTML | ×1.00 (baseline) |

---

## Quick Reference — All Configurations

| Config | Condition | Fixture | F1 | Precision | Recall | TLX | RT (s) |
|---|---|---|:---:|:---:|:---:|:---:|:---:|
| kimi-qwen | rag-think | html-high | **0.80** | 0.80 | 0.80 | 63 | 400 |
| kimi-qwen | rag-think | css-high | 0.60 | 0.54 | 0.68 | 65 | 257 |
| kimi-qwen | rag-think | js-high | 0.43 | 0.55 | 0.36 | 74 | 290 |
| kimi-qwen | rag-think | tsx-high | 0.59 | 0.60 | 0.58 | 73 | 276 |
| kimi-gpt | rag-think | html-high | 0.60 | 0.64 | 0.57 | 55 | 208 |
| kimi-gpt | rag-think | css-high | 0.54 | 0.52 | 0.56 | 68 | 303 |
| kimi-gpt | rag-think | js-high | 0.41 | 0.65 | 0.30 | 63 | 299 |
| kimi-gpt | rag-think | tsx-high | 0.58 | 0.57 | 0.60 | 68 | 221 |
| 3-models | rag-nothink | html-high | **0.70** | 0.71 | 0.69 | 57 | 446 |
| 3-models | rag-nothink | css-high | 0.52 | 0.39 | 0.78 | 68 | 527 |
| 3-models | rag-nothink | js-high | 0.46 | 0.59 | 0.38 | 73 | 411 |
| 3-models | rag-nothink | tsx-high | 0.54 | 0.45 | 0.68 | 70 | 343 |
| kimi (indiv.) | rag-think | html-high | 0.45 | 0.94 | 0.29 | 40 | 354 |
| kimi (indiv.) | rag-think | css-high | 0.71 | 0.91 | 0.58 | 56 | 391 |
| kimi (indiv.) | rag-think | js-high | 0.34 | 0.73 | 0.22 | 55 | 434 |
| kimi (indiv.) | rag-think | tsx-high | 0.65 | 0.87 | 0.52 | 68 | 440 |
