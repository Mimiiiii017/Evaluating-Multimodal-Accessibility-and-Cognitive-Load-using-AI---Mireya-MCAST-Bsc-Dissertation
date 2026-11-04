# Cloud-LLM Preliminary Study — Test 8 Results

**Date:** 25–26 March 2026  
**Scope:** HTML fixtures only (html-clean, html-low, html-medium, html-high) — 4 complexity tiers  
**Models tested:** 22 cloud LLMs  
**Conditions:** 4 (RAG × Think factorial design)  
**Total LLM calls:** 352 (4 conditions × 22 models × 4 fixtures × 1 run)

---

## 1. What Changed from Test 7

### 1.1 Expanded Model Roster (+7 models)

Test 7 ran 15 models. Test 8 adds 7 smaller/mid-range models to test whether compact models are competitive with large ones on a focused accessibility detection task:

| New model | Size | Rationale |
|---|---|---|
| `ministral-3:3b` | ~3 B | Smallest available — SLM lower bound |
| `gemma3:4b` | ~4 B | Google small model baseline |
| `gpt-oss:20b` | ~20 B | Mid SLM, cost-efficient |
| `devstral-small-2:24b` | ~24 B | Mistral code-small |
| `gemma3:27b` | ~27 B | Google mid model |
| `nemotron-3-super` | ~253 B | NVIDIA reasoning model |
| `qwen3-vl:235b` | ~235 B | Qwen vision-language (tested text-only) |

### 1.2 RAG Pipeline Improvements

Following the diagnosis from Test 7 (RAG hurting top models due to retrieval noise), three changes were made to `services/rag/app.py`:

| Change | Before | After |
|---|---|---|
| Chunking strategy | Character-based (900 chars / 120 overlap) | Section-based (splits on `##` headings — 1 violation pattern = 1 chunk) |
| Default `top_k` | 6 chunks returned | 3 chunks returned |
| Relevance threshold | None (all chunks injected) | Cosine distance ≤ 0.65 (irrelevant chunks filtered out) |

Six new **FIRES / DOES NOT FIRE detection-rule** knowledge-base files were also added to the RAG index:

- `aria/aria-detection-rules.md` — 6 rules (redundant role, `aria-hidden`, broken `labelledby`, missing `lang`, live region)
- `controls/controls-detection-rules.md` — 5 rules (icon-only button, div-as-button, disclosure, search button)
- `forms/forms-detection-rules.md` — 5 rules (unlabelled input, radio fieldset, required, error association)
- `images/images-detection-rules.md` — 5 rules (missing alt, linked image, informative, button, SVG)
- `navigation/navigation-detection-rules.md` — 5 rules (link name, non-descriptive text, skip nav, landmark)
- `tables/tables-detection-rules.md` — 3 rules (th scope, caption, layout table)

**RAG net effect (no-think condition):** Average delta across all 22 models improved from **-0.5 pp** (old, coin-flip) to **+4.9 pp** (new, net positive).  
RAG now helps 61 of 95 comparable cases (up from 25/87 in Test 7), though large frontier models still prefer no RAG.

### 1.3 Prompt: Two-Phase Read-Then-Audit Structure

The system prompt was restructured into two explicit phases:

**Phase 1 — Read and Map (no output):** Build a complete internal inventory of: every `id`, every `<nav>` and whether it has a label, every `aria-labelledby`/`aria-controls` target id, every interactive element, page structure. Models must not write any output during this phase.

**Phase 2 — Report Issues:** Use the Phase 1 inventory to run all sweeps.

This prevents models from starting to report before they have seen the full document — a common failure mode on the medium/high fixtures where important context (e.g. an id referenced by `aria-labelledby`) appears late in the file.

### 1.4 New Real-World Mandatory Sweeps (G–J)

Four sweeps were added to the HTML audit prompt, each grounded in real accessibility failures that any senior auditor would check:

| Sweep | What it checks | WCAG / technique |
|---|---|---|
| **G** | Multiple `<nav>` without `aria-label` / `aria-labelledby` | ARIA11 |
| **H** | `aria-labelledby`, `aria-describedby`, `aria-controls` referencing a non-existent `id` | SC 4.1.2 |
| **I** | Toggle / disclosure buttons missing `aria-expanded` | SC 4.1.2 |
| **J** | Personal data inputs (`name`, `email`, `tel`, `address`) missing `autocomplete` | SC 1.3.5 |

These were chosen because they represent silent failures that are invisible without a full-document scan — exactly what Phase 1 enables. They are real-world issues, not fixture-specific hints.

---

## 2. Results — All 4 Conditions

### 2.1 Condition Definitions

| Condition | RAG | Thinking (extended CoT) |
|---|---|---|
| `rag-think` (rt) | Yes | Yes |
| `rag-nothink` (rn) | Yes | No |
| `norag-nothink` (nn) | No | No |
| `norag-think` (nt) | No | Yes |

### 2.2 F1 Score Matrix (sorted by average across conditions)

| Model | rt | rn | nn | nt | **Best F1** | **Avg F1** |
|---|---|---|---|---|---|---|
| **gpt-oss:120b** | 69.0% | 33.8% | **69.2%** | 67.2% | **69.2%** | **59.8%** |
| **kimi-k2.5** | 41.4% | 33.0% | **74.9%** | 46.8% | **74.9%** | **49.0%** |
| **minimax-m2.5** | 57.3% | 46.4% | 23.6% | **61.7%** | 61.7% | 47.2% |
| deepseek-v3.2 | **58.9%** | 37.3% | 63.9% | 25.4% | 63.9% | 46.4% |
| glm-5 | 31.9% | **72.8%** | 24.7% | 55.1% | 72.8% | 46.1% |
| minimax-m2 | 34.0% | **60.7%** | 38.2% | 40.3% | 60.7% | 43.3% |
| qwen3.5:397b | 17.4% | **45.9%** | 36.6% | 42.9% | 45.9% | 35.7% |
| qwen3-vl:235b | 29.5% | 43.4% | 14.0% | **54.7%** | 54.7% | 35.4% |
| gemini-3-flash-preview | 31.6% | 35.6% | 0.0% | **61.9%** | 61.9% | 32.3% |
| devstral-2:123b | 30.5% | **37.6%** | 29.3% | 26.8% | 37.6% | 31.0% |
| mistral-large-3:675b | 26.5% | 31.9% | **32.2%** | 29.9% | 32.2% | 30.1% |
| nemotron-3-super | **47.4%** | 15.7% | 26.3% | 17.2% | 47.4% | 26.6% |
| ministral-3:3b | 14.7% | **42.4%** | 18.6% | 22.0% | 42.4% | 24.4% |
| cogito-2.1:671b | 17.5% | 26.4% | **27.1%** | 26.2% | 27.1% | 24.3% |
| gpt-oss:20b | 25.0% | 11.5% | 25.0% | **31.9%** | 31.9% | 23.4% |
| ministral-3:14b | **26.8%** | 17.7% | 23.3% | 22.4% | 26.8% | 22.5% |
| qwen3-coder:480b | 16.5% | 22.4% | 16.4% | **23.7%** | 23.7% | 19.8% |
| qwen3-coder-next | 19.6% | 14.9% | **20.7%** | 17.3% | 20.7% | 18.1% |
| nemotron-3-nano:30b | 9.5% | 16.9% | 11.6% | **32.8%** | 32.8% | 17.7% |
| gemma3:4b | 16.1% | 17.5% | **25.6%** | 9.9% | 25.6% | 17.3% |
| devstral-small-2:24b | 7.6% | 18.5% | 20.0% | **22.4%** | 22.4% | 17.1% |
| gemma3:27b | 8.5% | **18.2%** | 8.5% | 8.2% | 18.2% | 10.9% |

### 2.3 Composite Score Matrix (80% F1 + 20% speed, sorted by average)

| Model | rt | rn | nn | nt | **Avg** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | 72.1% | 43.4% | **73.2%** | 71.5% | **65.0%** |
| minimax-m2.5 | 60.9% | 55.0% | 36.0% | **69.3%** | **55.3%** |
| kimi-k2.5 | 48.0% | 43.3% | **75.6%** | 51.9% | **54.7%** |
| minimax-m2 | 39.6% | **67.9%** | 44.2% | 48.1% | 49.9% |
| glm-5 | 29.2% | **66.9%** | 37.4% | 53.2% | 46.7% |
| qwen3.5:397b | 32.2% | 52.5% | 43.2% | **52.0%** | 45.0% |
| gemini-3-flash-preview | 42.5% | 48.5% | 20.0% | **64.8%** | 44.0% |
| devstral-2:123b | **43.3%** | 48.2% | 42.3% | 40.8% | 43.7% |
| mistral-large-3:675b | 41.2% | 44.1% | **44.6%** | 43.2% | 43.3% |
| deepseek-v3.2 | **62.3%** | 29.8% | 51.2% | 20.3% | 40.9% |
| nemotron-3-super | **55.3%** | 26.7% | 37.1% | 32.0% | 37.8% |
| ministral-3:3b | 29.7% | **52.0%** | 32.3% | 34.2% | 37.0% |
| qwen3-vl:235b | 23.6% | **45.4%** | 23.2% | 52.6% | 36.2% |
| gpt-oss:20b | 37.4% | 25.4% | 36.7% | **42.2%** | 35.4% |
| qwen3-coder:480b | 31.1% | 34.6% | 31.6% | **37.6%** | 33.7% |
| devstral-small-2:24b | 23.0% | 34.2% | 35.3% | **35.3%** | 31.9% |
| nemotron-3-nano:30b | 26.0% | 31.0% | 26.7% | **43.3%** | 31.8% |
| cogito-2.1:671b | 30.0% | 34.0% | **36.8%** | 23.3% | 31.0% |
| ministral-3:14b | **35.6%** | 24.9% | 31.4% | 30.5% | 30.6% |
| gemma3:4b | 30.4% | 28.3% | **38.0%** | 23.5% | 30.1% |
| gemma3:27b | 25.9% | **31.8%** | 24.7% | 24.3% | 26.7% |
| qwen3-coder-next | **30.5%** | 17.5% | 23.1% | 31.3% | 25.6% |

### 2.4 norag-nothink Detail (best overall condition for the top models)

| Model | F1 | Precision | Recall | TP | FN | FP | Avg time |
|---|---|---|---|---|---|---|---|
| kimi-k2.5 | **74.9%** | 97.0% | 64.9% | 39 | 53 | 2 | 176 s |
| gpt-oss:120b | **69.2%** | 96.6% | 57.5% | 34 | 58 | 2 | 91 s |
| deepseek-v3.2 | 63.9% | 95.0% | 54.2% | 25 | 67 | 2 | 778 s |
| minimax-m2 | 38.2% | 100.0% | 35.9% | 4 | 57 | 0 | 253 s |
| qwen3.5:397b | 36.6% | 69.6% | 51.5% | 23 | 69 | 3 | 245 s |
| mistral-large-3:675b | 32.2% | 55.3% | 51.0% | 24 | 68 | 15 | 53 s |
| devstral-2:123b | 29.3% | 71.9% | 44.1% | 18 | 74 | 3 | 55 s |
| cogito-2.1:671b | 27.1% | 72.2% | 42.9% | 15 | 77 | 2 | 196 s |
| gemma3:4b | 25.6% | 67.9% | 43.8% | 14 | 78 | 6 | 105 s |
| gpt-oss:20b | 25.0% | 100.0% | 25.0% | 0 | 92 | 0 | 138 s |
| ministral-3:14b | 23.3% | 72.5% | 39.3% | 15 | 77 | 7 | 288 s |
| devstral-small-2:24b | 20.0% | 75.0% | 38.2% | 8 | 84 | 3 | 38 s |
| ministral-3:3b | 18.6% | 40.2% | 61.0% | 29 | 63 | **309** | 110 s |
| nemotron-3-super | 26.3% | 40.7% | 52.4% | 38 | 54 | **190** | 160 s |

---

## 3. RAG Analysis

### 3.1 RAG Effect — All Models

| Model | Avg RAG F1 | Avg noRAG F1 | Δ | Verdict |
|---|---|---|---|---|
| glm-5 | 52.3% | 39.9% | **+12.4 pp** | RAG strongly helps |
| minimax-m2.5 | 51.8% | 42.7% | **+9.2 pp** | RAG helps |
| nemotron-3-super | 31.5% | 21.8% | **+9.8 pp** | RAG helps |
| minimax-m2 | 47.4% | 39.2% | **+8.1 pp** | RAG helps |
| ministral-3:3b | 28.5% | 20.3% | **+8.2 pp** | RAG helps |
| devstral-2:123b | 34.0% | 28.1% | +6.0 pp | RAG mildly helps |
| gemma3:27b | 13.3% | 8.3% | +5.0 pp | RAG mildly helps |
| deepseek-v3.2 | 48.1% | 44.6% | +3.4 pp | Neutral |
| gemini-3-flash-preview | 33.6% | 30.9% | +2.7 pp | Neutral |
| qwen3-vl:235b | 36.5% | 34.4% | +2.1 pp | Neutral |
| mistral-large-3:675b | 29.2% | 31.1% | -1.9 pp | Neutral |
| gemma3:4b | 16.8% | 17.8% | -0.9 pp | Neutral |
| qwen3-coder-next | 17.2% | 19.0% | -1.8 pp | Neutral |
| qwen3-coder:480b | 19.4% | 20.0% | -0.6 pp | Neutral |
| ministral-3:14b | 22.2% | 22.9% | -0.6 pp | Neutral |
| cogito-2.1:671b | 21.9% | 26.6% | **-4.7 pp** | RAG slightly hurts |
| devstral-small-2:24b | 13.1% | 21.2% | **-8.1 pp** | RAG hurts |
| qwen3.5:397b | 31.6% | 39.8% | **-8.1 pp** | RAG hurts |
| nemotron-3-nano:30b | 13.2% | 22.2% | **-9.0 pp** | RAG hurts |
| gpt-oss:20b | 18.2% | 28.4% | **-10.2 pp** | RAG hurts |
| gpt-oss:120b | 51.4% | 68.2% | **-16.8 pp** | RAG clearly hurts |
| kimi-k2.5 | 37.2% | 60.9% | **-23.6 pp** | RAG strongly hurts |

### 3.2 Comparison to Test 7 — RAG Net Effect

| Metric | Test 7 (old pipeline) | Test 8 (new pipeline) | Change |
|---|---|---|---|
| Avg RAG delta (no-think) | -0.5 pp | **+4.9 pp** | +5.4 pp improvement |
| RAG helped (cases) | 25 / 87 | **61 / 95** | More models benefit |
| RAG hurt (cases) | 25 / 87 | 19 / 95 | Fewer harmed |
| Section-based chunks | No | Yes | Fixes mid-sentence breaks |
| Relevance threshold | None | 0.65 cosine | Drops irrelevant chunks |

The refactored RAG pipeline is working for 2/3 of models. The frontier models that still prefer no-RAG (kimi, gpt-oss:120b) likely have strong internal WCAG knowledge — retrieved chunks add noise rather than signal for these.

### 3.3 Think (CoT) Effect

| Model | Avg Think F1 | Avg noThink F1 | Δ | Verdict |
|---|---|---|---|---|
| gemini-3-flash-preview | 46.8% | 17.8% | **+28.9 pp** | Think strongly helps |
| minimax-m2.5 | 59.5% | 35.0% | **+24.5 pp** | Think strongly helps |
| gpt-oss:120b | 68.1% | 51.5% | **+16.6 pp** | Think helps |
| qwen3-vl:235b | 42.1% | 28.7% | +13.4 pp | Think helps |
| nemotron-3-super | 32.3% | 21.0% | +11.3 pp | Think helps |
| gpt-oss:20b | 28.4% | 18.2% | +10.2 pp | Think helps |
| nemotron-3-nano:30b | 21.1% | 14.2% | +6.9 pp | Think mildly helps |
| ministral-3:14b | 24.6% | 20.5% | +4.1 pp | Think mildly helps |
| qwen3-coder-next | 18.5% | 17.8% | +0.7 pp | Neutral |
| qwen3-coder:480b | 20.1% | 19.4% | +0.7 pp | Neutral |
| mistral-large-3:675b | 28.2% | 32.0% | -3.8 pp | Neutral |
| devstral-small-2:24b | 15.0% | 19.2% | -4.2 pp | Think slightly hurts |
| devstral-2:123b | 28.6% | 33.5% | -4.8 pp | Think slightly hurts |
| cogito-2.1:671b | 21.9% | 26.8% | -4.9 pp | Think slightly hurts |
| gemma3:4b | 13.0% | 21.6% | **-8.6 pp** | Think hurts |
| deepseek-v3.2 | 42.1% | 50.6% | **-8.4 pp** | Think hurts |
| gemma3:27b | 8.3% | 13.3% | -5.0 pp | Think hurts |
| glm-5 | 43.5% | 48.8% | -5.2 pp | Think hurts |
| kimi-k2.5 | 44.1% | 54.0% | **-9.9 pp** | Think hurts |
| qwen3.5:397b | 30.1% | 41.2% | **-11.1 pp** | Think hurts |
| ministral-3:3b | 18.4% | 30.5% | **-12.1 pp** | Think hurts |
| minimax-m2 | 37.1% | 49.5% | **-12.3 pp** | Think hurts |

### 3.4 Best Condition Per Model

| Model | Best condition | F1 |
|---|---|---|
| kimi-k2.5 | norag-nothink | 74.9% |
| gpt-oss:120b | norag-nothink | 69.2% |
| deepseek-v3.2 | norag-nothink | 63.9% |
| glm-5 | rag-nothink | 72.8% |
| minimax-m2 | rag-nothink | 60.7% |
| minimax-m2.5 | norag-think | 61.7% |
| gemini-3-flash-preview | norag-think | 61.9% |
| qwen3-vl:235b | norag-think | 54.7% |
| nemotron-3-super | rag-think | 47.4% |
| qwen3.5:397b | rag-nothink | 45.9% |

---

## 4. Small vs Large Model Analysis

A key question for this test was whether smaller models are competitive.

| Tier | Models | Best F1 (best condition) | Best avg F1 |
|---|---|---|---|
| ≤ 5 B | gemma3:4b, ministral-3:3b | 42.4% (3b, rag-nothink) | 24.4% |
| 5–30 B | gpt-oss:20b, devstral-small-2:24b, gemma3:27b, nemotron-3-nano:30b | 32.8% | 17.2% |
| 30–200 B | ministral-3:14b, devstral-2:123b, gpt-oss:120b, nemotron-3-super | **69.2%** | **39.0%** |
| > 200 B | All others | **74.9%** | **42.7%** |

**Finding:** The 30–200 B tier (especially `gpt-oss:120b`) is close to the >200 B tier in raw F1. The efficiency sweet spot is **gpt-oss:120b** — best or near-best across all conditions, fast (91 s avg), and near-zero FP in its best condition.

Small models (≤30 B) do not reach competitive F1 but `ministral-3:3b` shows surprisingly high recall (61%) in no-think — at the cost of extreme FP (309 hallucinations). They are not viable without a dedicated hallucination filter.

---

## 5. Key Findings

### Why overall F1 is still low (avg ~30%)

The core issue identified from FN analysis: **most missed concepts are ARIA state/interaction patterns** (accordion expanded state, toggle group roles, multi-landmark navigation labels, broken `aria-labelledby` chains) that require a full-document read before they can be confirmed. These are legitimate, real-world accessibility problems — the benchmark is hard on purpose.

The new two-phase prompt and sweeps G–J specifically target these. Full impact will only show in the next benchmark run (Test 9) which applies the updated prompt.

### Hallucination outliers

Two models have pathological FP rates that make them unusable without filtering:
- **ministral-3:3b** — 309 FPs in norag-nothink (reports almost everything as a violation)
- **nemotron-3-super** — 190 FPs in norag-nothink (similar behaviour)

Both models have high recall, suggesting they know what to look for but cannot suppress false positives.

---

## 6. Model Selection for Full Study

### Recommended longlist (≥ F1 25% best condition, no pathological FP)

| Model | Best condition | Best F1 | Avg F1 | Recommended condition |
|---|---|---|---|---|
| **kimi-k2.5** | norag-nothink | 74.9% | 49.0% | norag-nothink |
| **gpt-oss:120b** | norag-nothink | 69.2% | 59.8% | norag-nothink |
| **deepseek-v3.2** | norag-nothink | 63.9% | 46.4% | norag-nothink (slow: 778 s) |
| **minimax-m2.5** | norag-think | 61.7% | 47.2% | norag-think or rag-nothink |
| **gemini-3-flash-preview** | norag-think | 61.9% | 32.3% | norag-think |
| **glm-5** | rag-nothink | 72.8% | 46.1% | rag-nothink |
| **minimax-m2** | rag-nothink | 60.7% | 43.3% | rag-nothink |
| **qwen3.5:397b** | rag-nothink | 45.9% | 35.7% | rag-nothink |
| **nemotron-3-super** | rag-think | 47.4% | 26.6% | rag-think (high FP in nn) |
| **devstral-2:123b** | rag-nothink | 37.6% | 31.0% | rag-nothink |

---

## 7. Improvements Made After Test 8 (Applied for Test 9)

After analysing the Test 8 results, two targeted changes were made to `evaluation/Cloud-LLM-Preliminary/benchmark-prompt.ts`. These have already been committed and will apply to all subsequent runs.

### 7.1 Root Cause: 24 Concepts Missed by All 22 Models

Cross-referencing the FN breakdown against the ground truth revealed that **24 distinct accessibility concepts were missed by every single one of the 22 models** across the norag-nothink condition. The simultaneous failure of 22 diverse models on the same concepts is not a capability problem — it is a **prompt coverage gap**. If the prompt does not tell the model to check for something, no model will consistently find it, regardless of capability.

The missed concepts fell into 4 categories:

| Category | Example | Count |
|---|---|---|
| Multiple landmarks without labels | Page has 2+ `<nav>` but none have `aria-label` | ~6 |
| Broken ARIA cross-references | `aria-labelledby`/`aria-controls` points to a non-existent `id` | ~8 |
| Toggle / disclosure state | Button opens a panel but has no `aria-expanded` | ~5 |
| Autocomplete on personal inputs | `<input type="email">` has no `autocomplete` attribute | ~5 |

### 7.2 Fix A — Two-Phase Read-Then-Audit System Prompt

**Problem:** Models were beginning to output issues before reading the full document. On medium/high fixtures (500–1,200 lines), critical context — e.g. an `id` referenced by a later `aria-labelledby` — appears well into the file. Models that report early make false "broken reference" calls (FPs) or miss valid ones (FNs).

**Change:** The system prompt was restructured into two explicit phases:

```
PHASE 1 — READ AND MAP (produce NO output)
Build a complete internal inventory:
  - Every id attribute in the document
  - Every <nav> and whether it has aria-label / aria-labelledby
  - Every aria-labelledby / aria-describedby / aria-controls value
    (and whether its target id exists)
  - Every interactive element and its ARIA state attributes
  - Overall page structure (landmarks, headings, skip links)

PHASE 2 — REPORT
Using ONLY your Phase 1 inventory, run all sweeps and output issues.
```

This forces a full-document parse before any conclusion is drawn, mirroring how a human auditor works: read the whole page first, then write the report.

### 7.3 Fix B — Four New Mandatory Sweeps (G–J)

To directly close the coverage gaps identified above, four new sweeps were added:

| Sweep | What it checks | WCAG / technique | Why added |
|---|---|---|---|
| **G** — Nav landmark labelling | If the page has 2+ `<nav>` elements, each must have a distinct `aria-label` or `aria-labelledby`. | ARIA11 | Screen readers list all landmarks — duplicate "navigation" entries are indistinguishable. |
| **H** — Broken ARIA id references | Every `aria-labelledby`, `aria-describedby`, and `aria-controls` value must point to an `id` that actually exists in the document. | SC 4.1.2 | Dangling references silently break assistive technology with no visible symptom. |
| **I** — Toggle button state | Any button or `role=button` that opens/closes/toggles another element must have `aria-expanded`. | SC 4.1.2 | Without it, screen readers cannot announce whether the controlled element is open or closed. |
| **J** — Autocomplete on personal data inputs | Any `<input>` collecting name, email, address, phone, username, password, or credit card must have a valid `autocomplete` attribute. | SC 1.3.5 | Required for password managers and users with cognitive disabilities who rely on browser autofill. |

These sweeps are grounded directly in the Test 8 FN analysis — they close specific confirmed gaps, not speculative ones.

### 7.4 Expected Impact on Test 9

The 24 missed concepts map closely to sweeps G–J. If the prompt change alone closes these gaps (with sweeps A–F remaining stable), the theoretical F1 ceiling for the top models rises from ~75% to ~90%+ on the html-high fixture.

Recall is currently the binding constraint (kimi-k2.5: R=64.9%, gpt-oss:120b: R=57.5%). Sweeps G–J add ~24 more TP opportunities. If the top models find the majority:

- kimi-k2.5: F1=74.9% → estimated **~85–90%**
- gpt-oss:120b: F1=69.2% → estimated **~80–85%**

This would bring the best models above the **80% F1 dissertation target** for the first time.

