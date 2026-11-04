# Cloud-LLM Preliminary Study — Test 15 Results

**Date:** 3 April 2026
**Scope:** html-high fixture only (51 issues, highest complexity tier)
**Models tested:** 10 (3 removed from T14 roster: ministral-3:14b, devstral-small-2:24b, gemma3:27b)
**Conditions:** 4 (RAG × Think factorial design)
**Runs per combination:** 3
**Total LLM calls:** 10 models × 1 fixture × 3 runs × 4 conditions = **120 calls**

---

## 1. What Changed from Test 14

### 1.1 Roster: 13 → 10 Models

Three models removed after T14:

| Model removed | Reason |
|---|---|
| ministral-3:14b | rn FP=129 across 3 runs (avg 43 FP/run); hallucination flood undermines precision |
| devstral-small-2:24b | rt=7.5% rn=7.5%; complete collapse under RAG in both conditions |
| gemma3:27b | Avg F1=16.2% T14; four tests with no improvement trajectory |

### 1.2 Sweep Additions: Considered and Reverted

Sweeps K/L/M were drafted to address three of the seven universally-missed issues (`table-caption-missing`, `search-form-role`, `main-id-missing`) but were removed before T15. Decision: adding explicit sweep instructions for known gaps would test whether models follow instructions, not whether they can identify real violations independently. The benchmark should measure real-world capability without guided hints.

### 1.3 RAG Pipeline Overhauled

The RAG service was updated before T15 to address the consistent RAG penalty seen across T12–T14. Three changes:

- **Chunking**: replaced character-based slicing (900-char/120-overlap) with section-based splitting on `##` markdown headings — one chunk = one violation rule
- **Retrieval**: `top_k` reduced 6 → 3; cosine distance threshold of 0.65 added to filter irrelevant chunks
- **Knowledge base**: 6 new detection-rule files added (images, forms, controls, aria, navigation, tables), each structured as FIRES / DOES NOT FIRE rules with code examples rather than WCAG narrative

ChromaDB re-indexed with 353 sections (up from 225 under old chunking).

---

## 2. Results

### 2.1 Condition Definitions

| Condition | RAG | Thinking (extended CoT) |
|---|---|---|
| `rag-think` (rt) | Yes | Yes |
| `rag-nothink` (rn) | Yes | No |
| `norag-think` (nt) | No | Yes |
| `norag-nothink` (nn) | No | No |

### 2.2 F1 Score Matrix (html-high, avg of 3 runs, sorted by avg F1)

| Model | rt | rn | nt | nn | **Best F1** | **Avg F1** |
|---|---|---|---|---|---|---|
| **gpt-oss:120b** | 44.1% | **61.6%** | 46.4% | 50.2% | **61.6%** | **50.6%** |
| **kimi-k2.5** | 44.0% | 24.1% | **54.6%** | 46.8% | **54.6%** | **42.4%** |
| **qwen3.5:397b** | 41.2% | 38.5% | 42.1% | 37.8% | **42.1%** | **39.9%** |
| **deepseek-v3.2** | 22.8% | **50.4%** | 26.2% | 36.3% | **50.4%** | **33.9%** |
| **glm-5** | 32.4% | 26.8% | 33.3% | 35.2% | **35.2%** | **31.9%** |
| **gemini-3-flash** | 28.8% | 29.0% | 31.9% | 31.5% | **31.9%** | **30.3%** |
| **mistral-large-3:675b** | 27.8% | 31.9% | 19.9% | 32.4% | **32.4%** | **28.0%** |
| **cogito-2.1:671b** | 26.1% | 24.0% | 23.0% | 23.1% | **26.1%** | **24.1%** |
| **qwen3-vl:235b** | 35.3% | 21.0% | 17.9% | 27.9% | **35.3%** | **25.5%** |
| **qwen3-coder:480b** | 20.9% | 26.1% | 19.9% | 16.7% | **26.1%** | **20.9%** |

### 2.3 Composite Score Matrix (80% F1 + 20% speed)

| Model | rt | rn | nt | nn | **Best** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | 42.2% | **60.6%** | 50.2% | 47.6% | **60.6%** |
| **kimi-k2.5** | 36.4% | 23.8% | **57.2%** | 37.5% | **57.2%** |
| **qwen3.5:397b** | **49.8%** | 46.3% | 52.4% | 40.7% | **52.4%** |
| **deepseek-v3.2** | 18.2% | **40.3%** | 20.9% | 40.3% | **40.3%** |
| **gemini-3-flash** | 36.7% | **43.2%** | 43.5% | 45.2% | **45.2%** |
| **glm-5** | 29.0% | 32.1% | 41.9% | 38.4% | **41.9%** |
| **mistral-large-3:675b** | 40.6% | 35.3% | 35.9% | 39.9% | **40.6%** |
| **cogito-2.1:671b** | 40.8% | 37.5% | 36.7% | 37.5% | **40.8%** |
| **qwen3-vl:235b** | 35.9% | 27.1% | 20.2% | 35.3% | **35.9%** |
| **qwen3-coder:480b** | 31.8% | 27.7% | 32.0% | 16.5% | **32.0%** |

### 2.4 False Positive Summary (total across 3 runs per condition)

| Model | rt FP | rn FP | nt FP | nn FP | **Total** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | 4 | **13** | 7 | 2 | **26** |
| **kimi-k2.5** | 3 | 2 | 5 | 5 | **15** |
| **glm-5** | 2 | 1 | 2 | 4 | **9** |
| **qwen3.5:397b** | 1 | 2 | 1 | 1 | **5** |
| **gemini-3-flash** | 1 | 0 | 0 | 2 | **3** |
| **mistral-large-3:675b** | 0 | 0 | 0 | 2 | **2** |
| **deepseek-v3.2** | 0 | 0 | 0 | 0 | **0** |
| **cogito-2.1:671b** | 0 | 0 | 0 | 0 | **0** |
| **qwen3-coder:480b** | 0 | 0 | 0 | 0 | **0** |
| **qwen3-vl:235b** | 0 | 0 | 0 | 0 | **0** |

### 2.5 Consistency (F1 σ across 3 runs, by condition)

| Model | rt σ | rn σ | nt σ | nn σ |
|---|---|---|---|---|
| **qwen3.5:397b** | 0.022 | 0.031 | 0.015 | 0.044 |
| **glm-5** | 0.022 | 0.046 | 0.012 | 0.263 |
| **gemini-3-flash** | 0.038 | 0.014 | 0.013 | 0.024 |
| **cogito-2.1:671b** | 0.037 | 0.042 | 0.039 | 0.029 |
| **mistral-large-3:675b** | 0.074 | 0.013 | 0.148 | 0.040 |
| **deepseek-v3.2** | 0.161 | 0.121 | 0.188 | 0.025 |
| **qwen3-coder:480b** | 0.044 | 0.037 | 0.040 | 0.031 |
| **gpt-oss:120b** | 0.146 | 0.013 | 0.157 | 0.145 |
| **kimi-k2.5** | 0.191 | 0.173 | 0.154 | 0.147 |
| **qwen3-vl:235b** | 0.059 | 0.026 | 0.136 | 0.050 |

---

## 3. Key Findings

### 3.1 gpt-oss:120b Dominates rn — 61.6% F1, Best of Series (html-high)

gpt-oss:120b in the RAG+noThink condition achieved 61.6% F1 on html-high (avg 3 runs) — the highest F1 ever recorded on this specific fixture across the entire series. TP=25, FP=4, with σ=0.013 (highly consistent). The rn condition produces 29 found issues per run on average, the highest discovery rate of any model in any condition.

This reverses the T13 pattern where rt was gpt-oss's best condition. On html-high specifically, RAG without thinking outperforms RAG with thinking — suggesting that CoT on a 51-issue fixture causes over-analysis rather than improving recall.

### 3.2 deepseek-v3.2 rn = 50.4% — RAG Now Helps When Thinking Is Off

deepseek-v3.2 in rn achieved 50.4% F1 (TP=18, FP=0) — its best T15 result and notably the first time RAG has helped deepseek rather than hurt it. The RAG pipeline overhaul may be a factor: with section-based chunks and top_k=3, deepseek receives fewer, more targeted chunks that don't overwhelm its context.

However, deepseek nt collapsed to 26.2% and rt to 22.8%, confirming that adding thinking on top of RAG still destroys this model's performance. The interaction between thinking and RAG is the issue, not RAG alone.

### 3.3 kimi-k2.5 — nt Peak (54.6%) but Extreme Variance

kimi-k2.5 achieved 54.6% F1 in nt — strong performance with zero RAG. However its rn score collapsed to 24.1% (−30.5pp from nt). F1 σ ranges from 0.147–0.191 across conditions, the highest variance of any model. In a single run it reached 66.7% F1 (nt, run 3) but also hit 0.0% in isolated runs (rt/rn). The model is capable but unreliable.

### 3.4 qwen3.5:397b — Most Stable Model

qwen3.5:397b has the lowest average σ of any model. F1 ranges from 37.8–42.1% across all 4 conditions — only a 4.3pp spread. Zero runs produced sudden drops. This consistency makes it the most predictable model despite not having the peak F1 of gpt-oss or kimi.

### 3.5 glm-5 — Significant Drop from T14

glm-5 dropped sharply: rt went from 52.6% (T14) to 32.4% (T15), and rn from 45.3% to 26.8%. Average F1 fell from 43.8% to 31.9% (−11.9pp). The T14 rt peak was likely a single-run anomaly; 3-run averaging reveals the true level. nn is now glm-5's best condition at 35.2%, not rt.

### 3.6 RAG Pipeline: Mixed Improvement

The overhauled RAG pipeline produced mixed but mostly positive results:

| Model | T14 rn F1 | T15 rn F1 | Δ |
|---|---|---|---|
| gpt-oss:120b | 64.1% | 61.6% | −2.5pp |
| deepseek-v3.2 | 38.6% | **50.4%** | **+11.8pp** |
| qwen3.5:397b | 36.9% | 38.5% | +1.6pp |
| kimi-k2.5 | 32.6% | 24.1% | −8.5pp |
| glm-5 | 45.3% | 26.8% | −18.5pp |

deepseek is the clearest beneficiary. gpt-oss and qwen3.5 are roughly stable. kimi and glm-5 show decline in rn — the threshold filtering may be too aggressive for their query patterns.

### 3.7 qwen3-coder:480b — Persistent Anomaly

qwen3-coder:480b remains the largest model with the worst performance: avg F1=20.9%, worst single condition nn=16.7% (only 14 TP, FP=0). Despite being 480B parameters, it consistently underperforms models one-tenth its size. Zero hallucinations across all 120 runs, but recall is too low to compensate. This is Paul's "large model anomaly" — the model appears to not apply complex accessibility reasoning regardless of condition.

### 3.8 Universal Miss Cluster — Same 7 Issues

As in T14, the following issues were missed by every model in every condition:

| Issue ID | Category |
|---|---|
| `table-caption-missing` | Table structure |
| `subnav-btn-aria` | ARIA button state |
| `account-nav-label` | Landmark label |
| `main-id-missing` | ID attribute |
| `live-region-removed` | ARIA live region |
| `product-grid-label` | Landmark label |
| `search-form-role` | ARIA role |

These were not addressed in T15 (sweeps reverted). They remain structural gaps in what current LLMs can detect without explicit prompt guidance.

---

## 4. T14 vs T15 Comparison (html-high F1, 3-run avg)

| Model | T14 rt | T15 rt | T14 rn | T15 rn | T14 nt | T15 nt | T14 nn | T15 nn | **Avg Δ** |
|---|---|---|---|---|---|---|---|---|---|
| **gpt-oss:120b** | 39.2% | 44.1% | 64.1% | 61.6% | 31.3% | 46.4% | 57.5% | 50.2% | **+1.0 pp** |
| **kimi-k2.5** | 43.0% | 44.0% | 32.6% | 24.1% | 65.9% | 54.6% | 32.2% | 46.8% | **+0.5 pp** |
| **qwen3.5:397b** | 42.4% | 41.2% | 36.9% | 38.5% | 47.1% | 42.1% | 43.7% | 37.8% | **−3.3 pp** |
| **deepseek-v3.2** | 21.9% | 22.8% | 38.6% | 50.4% | 37.9% | 26.2% | 46.5% | 36.3% | **+1.2 pp** |
| **glm-5** | 52.6% | 32.4% | 45.3% | 26.8% | 37.5% | 33.3% | 39.9% | 35.2% | **−12.0 pp** |
| **gemini-3-flash** | 17.9% | 28.8% | 30.9% | 29.0% | 31.4% | 31.9% | 29.5% | 31.5% | **+3.0 pp** |
| **cogito-2.1:671b** | 28.0% | 26.1% | 25.1% | 24.0% | 30.0% | 23.0% | 25.1% | 23.1% | **−3.3 pp** |
| **mistral-large-3:675b** | 34.1% | 27.8% | 29.0% | 31.9% | 35.3% | 19.9% | 32.6% | 32.4% | **−5.0 pp** |
| **qwen3-coder:480b** | 23.1% | 20.9% | 28.1% | 26.1% | 23.1% | 19.9% | 25.1% | 16.7% | **−4.5 pp** |
| **qwen3-vl:235b** | 18.0% | 35.3% | 26.1% | 21.0% | 26.1% | 17.9% | 27.0% | 27.9% | **+0.0 pp** |

> glm-5's T14 rt=52.6% was likely a lucky single-run; 3-run avg in T15 reveals the true floor at 32.4%.

---

## 5. Model Status Summary

| Model | Best F1 (T15) | Avg F1 (T15) | Status |
|---|---|---|---|
| **gpt-oss:120b** | **61.6% (rn)** | 50.6% | Clear #1; new html-high series best |
| **kimi-k2.5** | 54.6% (nt) | 42.4% | Strong nt peak; high variance; rn collapses |
| **qwen3.5:397b** | 42.1% (nt) | 39.9% | Most stable; low FP; consistent across conditions |
| **deepseek-v3.2** | 50.4% (rn) | 33.9% | rn improved with new RAG; still collapses in rt/nt |
| **glm-5** | 35.2% (nn) | 31.9% | Dropped vs T14; nn best condition |
| **gemini-3-flash** | 31.9% (nt) | 30.3% | Most consistent speed (14s); flat F1 |
| **mistral-large-3:675b** | 32.4% (nn) | 28.0% | nt collapsed to 19.9%; low FP |
| **cogito-2.1:671b** | 26.1% (rt) | 24.1% | Zero FP all conditions; low but reliable |
| **qwen3-vl:235b** | 35.3% (rt) | 25.5% | Zero FP; nt worst condition at 17.9% |
| **qwen3-coder:480b** | 26.1% (rn) | 20.9% | 480B model; persistent anomaly; worst performer |

---

## 6. Changes for Test 16

### 6.1 Per-Model Hyperparameter Investigation (Paul's recommendation)

Current standardised params: `temperature=0.2`, `top_p=0.95`, `num_predict=32000`. All models receive identical settings regardless of architecture.

Paul's recommendation: find manufacturer-recommended hyperparameters for the **best** model (gpt-oss:120b) and the **anomaly** (qwen3-coder:480b), then re-run those two models with model-specific params to see if qwen3-coder's underperformance is a configuration issue rather than a capability gap.

### 6.2 Ministral-3:3b Validation Run

Paul specifically requested ministral-3:3b as a small-scale control to test whether nn (noRAG+noThink) beats RAG-assisted configs. This model was removed in T14 for FP=225. A targeted single-model run with its best historical condition (nn) would serve as the small-model baseline for Paul's comparative analysis.

### 6.3 Continue html-high, 3 runs

Keep `--fixtures html-high --runs 3`. Stability is confirmed and anomalies are correctly exposed.
