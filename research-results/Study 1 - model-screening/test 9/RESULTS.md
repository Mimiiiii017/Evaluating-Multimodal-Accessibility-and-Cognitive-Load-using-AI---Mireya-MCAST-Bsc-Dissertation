# Cloud-LLM Preliminary Study — Test 9 Results

**Date:** 26–28 March 2026  
**Scope:** HTML fixtures only (html-clean, html-low, html-medium, html-high) — 4 complexity tiers  
**Models tested:** 22 cloud LLMs (20 for norag conditions — minimax excluded, see §1.1)  
**Conditions:** 4 (RAG × Think factorial design)  
**Total LLM calls:** 336 (22 models × 4 fixtures × 2 rag conditions + 20 models × 4 fixtures × 2 norag conditions)

---

## 1. What Changed from Test 8

### 1.1 minimax-m2 and minimax-m2.5 Confirmed Broken

During the norag runs, both minimax models returned **HTTP 500** on every request from the cloud API gateway — instantly, not after timeout. The error was server-side (Ollama gateway returning `Internal Server Error`). After confirming this with isolated single-fixture tests, both models were **commented out for the norag conditions** to avoid blocking further runs.

| Model | rag-think | rag-nothink | norag-nothink | norag-think |
|---|---|---|---|---|
| minimax-m2 | completed (Test 8 run reused) | completed | HTTP 500 — excluded | HTTP 500 — excluded |
| minimax-m2.5 | completed (Test 8 run reused) | completed | HTTP 500 — excluded | HTTP 500 — excluded |

The rag conditions were already complete when the problem was discovered. The minimax models' rag results are still reported but averaged over only 2 conditions.

### 1.2 Prompt: Two-Phase Read-Then-Audit Structure (Applied)

Following the Test 8 analysis (§7.2), the system prompt was restructured into two explicit phases:

**Phase 1 — Read and Map (no output):** Build a complete internal inventory of every `id`, every `<nav>` and whether it has a label, every `aria-labelledby`/`aria-controls` target id, every interactive element, and overall page structure. No output is produced during this phase.

**Phase 2 — Report Issues:** Use the Phase 1 inventory to run all sweeps and output findings.

### 1.3 Four New Mandatory Sweeps (G–J) Applied

| Sweep | What it checks | WCAG / technique |
|---|---|---|
| **G** | Multiple `<nav>` without `aria-label` / `aria-labelledby` | ARIA11 |
| **H** | `aria-labelledby`, `aria-describedby`, `aria-controls` referencing a non-existent `id` | SC 4.1.2 |
| **I** | Toggle / disclosure buttons missing `aria-expanded` | SC 4.1.2 |
| **J** | Personal data inputs (`name`, `email`, `tel`, `address`) missing `autocomplete` | SC 1.3.5 |

These sweeps directly target the 24 concepts missed by all 22 models in Test 8. See Test 8 §7.1–7.3 for the root cause analysis.

---

## 2. Results — All 4 Conditions

### 2.1 Condition Definitions

| Condition | RAG | Thinking (extended CoT) | Models |
|---|---|---|---|
| `rag-think` (rt) | Yes | Yes | 22 |
| `rag-nothink` (rn) | Yes | No | 22 |
| `norag-nothink` (nn) | No | No | 20 (no minimax) |
| `norag-think` (nt) | No | Yes | 20 (no minimax) |

### 2.2 F1 Score Matrix (sorted by average across available conditions)

Models with all 4 conditions sorted by avg F1. minimax models show avg over 2 conditions only (marked †).

| Model | rt | rn | nn | nt | **Best F1** | **Avg F1** |
|---|---|---|---|---|---|---|
| **gpt-oss:120b** | 66.7% | 37.3% | 65.5% | **66.7%** | **66.7%** | **59.1%** |
| **qwen3-vl:235b** | 57.3% | **59.4%** | 52.1% | 57.0% | **59.4%** | **56.5%** |
| **qwen3.5:397b** | **63.0%** | 38.0% | 59.0% | 45.2% | **63.0%** | **51.3%** |
| minimax-m2.5 (2 conditions only) | 51.4% | **51.8%** | N/A | N/A | **51.8%** | **51.6%** |
| **glm-5** | 59.4% | **60.0%** | 37.3% | 27.7% | **60.0%** | **46.1%** |
| **nemotron-3-super** | 42.0% | **53.2%** | 31.3% | 52.9% | **53.2%** | **44.9%** |
| minimax-m2 (2 conditions only) | 28.4% | **50.5%** | N/A | N/A | **50.5%** | **39.5%** |
| **kimi-k2.5** | 29.8% | 35.8% | **52.1%** | 38.9% | **52.1%** | **39.2%** |
| **deepseek-v3.2** | 39.0% | 43.9% | **56.1%** | 16.7% | **56.1%** | **38.9%** |
| **gemini-3-flash-preview** | 20.1% | 35.2% | 38.7% | **51.9%** | **51.9%** | **36.5%** |
| **ministral-3:3b** | 23.7% | 22.7% | **48.4%** | 29.9% | **48.4%** | **31.2%** |
| **gpt-oss:20b** | 25.0% | **39.3%** | 25.0% | 25.0% | **39.3%** | **28.6%** |
| **ministral-3:14b** | 28.0% | **30.7%** | 26.2% | 28.2% | **30.7%** | **28.3%** |
| **cogito-2.1:671b** | 22.2% | 22.8% | **34.3%** | 30.7% | **34.3%** | **27.5%** |
| **mistral-large-3:675b** | **32.6%** | 20.6% | 24.3% | 26.1% | **32.6%** | **25.9%** |
| **devstral-small-2:24b** | 21.1% | 25.2% | 24.6% | **29.9%** | **29.9%** | **25.2%** |
| **devstral-2:123b** | **27.4%** | 22.2% | 24.9% | 23.0% | **27.4%** | **24.4%** |
| **gemma3:4b** | 20.0% | **31.0%** | 23.4% | 18.3% | **31.0%** | **23.2%** |
| **qwen3-coder-next** | 18.8% | 15.8% | **30.2%** | 24.4% | **30.2%** | **22.3%** |
| **qwen3-coder:480b** | 15.7% | 19.9% | **26.0%** | 24.5% | **26.0%** | **21.5%** |
| **gemma3:27b** | 13.1% | 22.2% | 22.2% | **22.2%** | **22.2%** | **19.9%** |
| **nemotron-3-nano:30b** | 10.6% | 3.0% | 6.4% | **31.4%** | **31.4%** | **12.9%** |

### 2.3 Composite Score Matrix (80% F1 + 20% speed, sorted by average across available conditions)

| Model | rt | rn | nn | nt | **Avg** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | 69.2% | 43.8% | 68.7% | **70.8%** | **63.1%** |
| **qwen3-vl:235b** | 54.0% | **52.0%** | 50.9% | 54.7% | **52.9%** |
| minimax-m2.5 (2 conditions only) | 56.8% | **51.3%** | N/A | N/A | **54.1%** |
| **qwen3.5:397b** | **60.3%** | 44.0% | 59.3% | 51.0% | **53.7%** |
| **glm-5** | 49.8% | **55.0%** | 37.6% | 39.1% | **45.4%** |
| **nemotron-3-super** | 50.9% | 54.7% | 39.3% | **62.2%** | **51.8%** |
| minimax-m2 (2 conditions only) | 41.9% | **51.3%** | N/A | N/A | **46.6%** |
| **gemini-3-flash-preview** | 31.2% | 48.2% | 50.9% | **57.5%** | **46.9%** |
| **kimi-k2.5** | 32.6% | 35.7% | **53.3%** | 47.1% | **42.2%** |
| **deepseek-v3.2** | 40.1% | 35.1% | **54.5%** | 13.3% | **35.8%** |
| **mistral-large-3:675b** | **44.4%** | 35.1% | 38.5% | 40.5% | **39.6%** |
| **devstral-2:123b** | **41.9%** | 37.2% | 39.4% | 38.4% | **39.2%** |
| **ministral-3:3b** | 33.8% | 34.5% | **57.0%** | 41.2% | **41.6%** |
| **cogito-2.1:671b** | 37.6% | 29.6% | **46.8%** | 33.7% | **36.9%** |
| **devstral-small-2:24b** | 33.7% | 35.2% | 36.5% | **40.7%** | **36.5%** |
| **gpt-oss:20b** | 35.7% | **43.8%** | 34.7% | 36.5% | **37.7%** |
| **qwen3-coder:480b** | 30.8% | 29.8% | 35.9% | **39.0%** | **33.9%** |
| **gemma3:4b** | 31.8% | **39.1%** | 35.8% | 27.7% | **33.6%** |
| **ministral-3:14b** | 36.1% | 34.4% | 34.2% | **36.7%** | **35.4%** |
| **gemma3:27b** | 27.6% | 32.7% | 34.8% | **33.9%** | **32.3%** |
| **nemotron-3-nano:30b** | 25.2% | 17.2% | 21.9% | **41.9%** | **26.6%** |
| **qwen3-coder-next** | 15.0% | 14.9% | 24.1% | **31.1%** | **21.3%** |

### 2.4 norag-nothink Detail

| Model | F1 | Precision | Recall | TP | FN | FP | Avg time |
|---|---|---|---|---|---|---|---|
| gpt-oss:120b | **65.5%** | 91.7% | 55.5% | 32 | 60 | 4 | 124 s |
| qwen3.5:397b | **59.0%** | 94.7% | 48.4% | 22 | 70 | 2 | 254 s |
| deepseek-v3.2 | **56.1%** | 98.6% | 48.3% | 23 | 69 | 1 | 329 s |
| kimi-k2.5 | **52.1%** | 69.0% | 67.2% | 47 | 45 | 6 | 267 s |
| qwen3-vl:235b | **52.1%** | 95.0% | 43.0% | 17 | 75 | 1 | 340 s |
| gemini-3-flash-preview | 38.7% | 66.5% | 54.6% | 28 | 64 | 8 | 12 s |
| glm-5 | 37.3% | 73.1% | 50.6% | 26 | 66 | 3 | 386 s |
| cogito-2.1:671b | 34.3% | 75.0% | 48.2% | 23 | 69 | 1 | 31 s |
| ministral-3:3b | 48.4% | 45.1% | 72.3% | 52 | 40 | 204 | 65 s |
| nemotron-3-super | 31.3% | 35.0% | 62.2% | 42 | 50 | 54 | 190 s |
| qwen3-coder-next | 30.2% | 65.6% | 47.4% | 20 | 72 | 5 | 622 s |
| nemotron-3-nano:30b | 6.4% | 75.0% | 28.5% | 3 | 89 | 3 | 112 s |
| gpt-oss:20b | 25.0% | 100.0% | 25.0% | 0 | 92 | 0 | 173 s |

---

## 3. RAG Analysis

### 3.1 RAG Effect — All Models (both conditions averaged)

| Model | Avg RAG F1 | Avg noRAG F1 | Δ | Verdict |
|---|---|---|---|---|
| glm-5 | 59.7% | 32.5% | **+27.2 pp** | RAG strongly helps |
| gpt-oss:20b | 32.2% | 25.0% | **+7.2 pp** | RAG mildly helps |
| nemotron-3-super | 47.6% | 42.1% | **+5.5 pp** | RAG mildly helps |
| deepseek-v3.2 | 41.5% | 36.4% | +5.1 pp | Neutral-positive |
| gemma3:4b | 25.5% | 20.9% | +4.6 pp | Neutral |
| qwen3-vl:235b | 58.4% | 54.6% | +3.8 pp | Neutral |
| ministral-3:14b | 29.4% | 27.2% | +2.2 pp | Neutral |
| mistral-large-3:675b | 26.6% | 25.2% | +1.4 pp | Neutral |
| devstral-2:123b | 24.8% | 24.0% | +0.8 pp | Neutral |
| devstral-small-2:24b | 23.2% | 27.3% | -4.1 pp | RAG slightly hurts |
| qwen3.5:397b | 50.5% | 52.1% | -1.6 pp | Neutral |
| gemma3:27b | 17.7% | 22.2% | -4.6 pp | RAG slightly hurts |
| qwen3-coder:480b | 17.8% | 25.3% | **-7.5 pp** | RAG hurts |
| cogito-2.1:671b | 22.5% | 32.5% | **-10.0 pp** | RAG hurts |
| qwen3-coder-next | 17.3% | 27.3% | **-10.0 pp** | RAG hurts |
| nemotron-3-nano:30b | 6.8% | 18.9% | **-12.1 pp** | RAG clearly hurts |
| kimi-k2.5 | 32.8% | 45.5% | **-12.7 pp** | RAG clearly hurts |
| gpt-oss:120b | 52.0% | 66.1% | **-14.1 pp** | RAG clearly hurts |
| ministral-3:3b | 23.2% | 39.2% | **-16.0 pp** | RAG clearly hurts |
| gemini-3-flash-preview | 27.7% | 45.3% | **-17.7 pp** | RAG clearly hurts |

### 3.2 Think (CoT) Effect

| Model | Avg Think F1 | Avg noThink F1 | Δ | Verdict |
|---|---|---|---|---|
| nemotron-3-nano:30b | 21.0% | 4.7% | **+16.3 pp** | Think strongly helps |
| gpt-oss:120b | 66.7% | 51.4% | **+15.3 pp** | Think helps |
| qwen3.5:397b | 54.1% | 48.5% | +5.6 pp | Think mildly helps |
| nemotron-3-super | 47.5% | 42.3% | +5.2 pp | Think mildly helps |
| mistral-large-3:675b | 29.4% | 22.5% | +6.9 pp | Think mildly helps |
| qwen3-vl:235b | 57.2% | 55.8% | +1.4 pp | Neutral |
| devstral-2:123b | 25.2% | 23.6% | +1.6 pp | Neutral |
| devstral-small-2:24b | 25.5% | 24.9% | +0.6 pp | Neutral |
| gemini-3-flash-preview | 36.0% | 37.0% | -1.0 pp | Neutral |
| qwen3-coder-next | 21.6% | 23.0% | -1.4 pp | Neutral |
| cogito-2.1:671b | 26.5% | 28.6% | -2.1 pp | Neutral |
| qwen3-coder:480b | 20.1% | 23.0% | -2.9 pp | Neutral |
| ministral-3:14b | 28.1% | 28.5% | -0.4 pp | Neutral |
| gemma3:27b | 17.7% | 22.2% | -4.6 pp | Think slightly hurts |
| glm-5 | 43.6% | 48.7% | **-5.1 pp** | Think slightly hurts |
| gpt-oss:20b | 25.0% | 32.2% | **-7.2 pp** | Think hurts |
| gemma3:4b | 19.2% | 27.2% | **-8.0 pp** | Think hurts |
| ministral-3:3b | 26.8% | 35.6% | **-8.8 pp** | Think hurts |
| kimi-k2.5 | 34.4% | 44.0% | **-9.6 pp** | Think hurts |
| deepseek-v3.2 | 27.9% | 50.0% | **-22.1 pp** | Think strongly hurts |

### 3.3 Best Condition Per Model

| Model | Best condition | Best F1 |
|---|---|---|
| gpt-oss:120b | rag-think / norag-think (tied) | 66.7% |
| qwen3.5:397b | rag-think | 63.0% |
| glm-5 | rag-nothink | 60.0% |
| qwen3-vl:235b | rag-nothink | 59.4% |
| deepseek-v3.2 | norag-nothink | 56.1% |
| nemotron-3-super | rag-nothink | 53.2% |
| kimi-k2.5 | norag-nothink | 52.1% |
| qwen3-vl:235b | rag-nothink | 59.4% |
| minimax-m2.5 | rag-nothink | 51.8% |
| gemini-3-flash-preview | norag-think | 51.9% |
| minimax-m2 | rag-nothink | 50.5% |
| ministral-3:3b | norag-nothink | 48.4% (FP=204) |
| gpt-oss:20b | rag-nothink | 39.3% |
| nemotron-3-nano:30b | norag-think | 31.4% |
| ministral-3:14b | rag-nothink | 30.7% |
| cogito-2.1:671b | norag-nothink | 34.3% |
| gemma3:4b | rag-nothink | 31.0% |
| mistral-large-3:675b | rag-think | 32.6% |
| devstral-small-2:24b | norag-think | 29.9% |
| qwen3-coder-next | norag-nothink | 30.2% |
| devstral-2:123b | rag-think | 27.4% |
| qwen3-coder:480b | norag-nothink | 26.0% |
| gemma3:27b | rag-nothink / norag-nothink / norag-think (tied) | 22.2% |

---

## 4. Small vs Large Model Analysis

| Tier | Models | Best F1 (best condition) | Avg F1 across conditions |
|---|---|---|---|
| <= 5 B | gemma3:4b, ministral-3:3b | 48.4% (3b nn, FP=204) | 27.2% |
| 5–30 B | gpt-oss:20b, devstral-small-2:24b, gemma3:27b, nemotron-3-nano:30b | 39.3% | 26.5% |
| 30–200 B | ministral-3:14b, devstral-2:123b, gpt-oss:120b, nemotron-3-super | **66.7%** | **40.3%** |
| > 200 B (non-MoE) | qwen3-vl:235b, qwen3.5:397b, qwen3-coder:480b, qwen3-coder-next | 63.0% | 37.5% |
| > 200 B (MoE / frontier) | kimi-k2.5, deepseek-v3.2, cogito-2.1:671b, mistral-large-3:675b, glm-5, gemini-3-flash-preview | **60.0%** | **37.2%** |

**Finding:** `gpt-oss:120b` (30–200 B tier) is the top model in Test 9. The >200 B frontier tier does not offer a consistent advantage — `kimi-k2.5` and `deepseek-v3.2` showed substantial performance variance across conditions.

`ministral-3:3b` appears high-recall in norag-nothink (recall=72.3%) but with 204 false positives — a hallucination rate that makes it unusable without a dedicated filter.

---

## 5. Key Findings

### 5.1 Sweeps G–J: Mixed Impact on Top Models

The top models did not see the expected gains from sweeps G–J. Possible explanations:

- **Ground truth mismatch:** The new sweeps check for G–J violations, but the ground-truth fixture annotations may not fully cover all the new patterns the model now reports, causing legitimate new detections to appear as FPs.
- **Phase 1 interference:** The two-phase prompt forces a full-document read, which may cause some models to over-report (finding patterns that would have been filtered by a more direct read-then-respond approach).
- **Run-to-run variance:** With n=1 per condition, the numbers include noise. A second run would confirm whether the differences are real.

### 5.2 RAG Regression

The RAG pipeline showed a net negative effect of −2.4 pp across the no-think condition. The new sweeps G–J require whole-document cross-referencing (e.g. checking whether an `aria-labelledby` target id exists anywhere in the document). Injecting RAG chunks — which are local excerpts — may actively confuse this analysis by providing partial context. This is consistent with the pattern of frontier models (with strong internal WCAG knowledge) performing worse with RAG.

**Recommendation:** For the full study, run top-tier models (kimi-k2.5, gpt-oss:120b, deepseek-v3.2) in the **norag condition**. Reserve RAG for mid-tier models where retrieval compensates for weaker internal knowledge (glm-5, nemotron-3-super).

### 5.3 Hallucination Outliers Persist

| Model | Best-condition FP | Condition |
|---|---|---|
| ministral-3:3b | 204 | norag-nothink |
| nemotron-3-super | 79 | rag-nothink |
| gemma3:4b | 80 | norag-nothink |
| ministral-3:14b | 32 | norag-nothink |

These models detect many real issues (high recall) but cannot suppress false positives and remain unusable without post-processing.

### 5.4 deepseek-v3.2 Behaviour

deepseek showed a striking think/no-think split: F1=56.1% in norag-nothink vs F1=16.7% in norag-think — a **−22.1 pp** think penalty (worst of any model). This suggests the model's chain-of-thought overthinks the problem, second-guessing valid detections. The `--no-think` flag (`/no_think` directive) is essential for deepseek.

---

## 6. Model Selection for Full Study

### Recommended longlist (best overall F1, low FP, viable latency)

| Model | Best condition | Best F1 | Avg F1 | Recommended condition |
|---|---|---|---|---|
| **gpt-oss:120b** | norag-think / rag-think | 66.7% | 59.1% | norag-think |
| **qwen3.5:397b** | rag-think | 63.0% | 51.3% | rag-think |
| **glm-5** | rag-nothink | 60.0% | 46.1% | rag-nothink |
| **qwen3-vl:235b** | rag-nothink | 59.4% | 56.5% | rag-nothink |
| **deepseek-v3.2** | norag-nothink | 56.1% | 38.9% | norag-nothink (slow: 329 s) |
| **nemotron-3-super** | rag-nothink | 53.2% | 44.9% | rag-nothink (FP risk: 79 in rn) |
| **kimi-k2.5** | norag-nothink | 52.1% | 39.2% | norag-nothink |
| **gemini-3-flash-preview** | norag-think | 51.9% | 36.5% | norag-think (fastest: 12 s) |
| **minimax-m2.5** | rag-nothink | 51.8% | 51.6% (2 conditions) | rag-nothink (norag broken) |
| **cogito-2.1:671b** | norag-nothink | 34.3% | 27.5% | norag-nothink (fast: 31 s) |

### Excluded from longlist

| Model | Reason |
|---|---|
| ministral-3:3b | FP=204 in best condition — hallucination rate unacceptable |
| nemotron-3-nano:30b | Best F1=31.4%, inconsistent across conditions |
| gemma3:27b | Best F1=22.2% — below viability threshold |
| gpt-oss:20b | Zero TP in most conditions — refuses to flag issues |
| minimax-m2 | Cloud API broken (HTTP 500) for norag conditions |

---

## 7. F1 Score Comparison: Test 8 vs Test 9 — All Conditions

Positive Avg Δ = overall improvement from Test 8 to Test 9; negative = regression. Sorted by Avg Δ descending.
minimax models (marked †) ran all 4 conditions in Test 8 but only rag-think and rag-nothink in Test 9 (norag excluded due to HTTP 500). Their Avg Δ is computed over rag conditions only for a like-for-like comparison.

| Model | T8 rt | T9 rt | T8 rn | T9 rn | T8 nn | T9 nn | T8 nt | T9 nt | Avg Δ |
|---|---|---|---|---|---|---|---|---|---|
| **qwen3-vl:235b** | 29.5% | 57.3% | 43.4% | 59.4% | 14.0% | 52.1% | 54.7% | 57.0% | **+21.1 pp** |
| **nemotron-3-super** | 47.4% | 42.0% | 15.7% | 53.2% | 26.3% | 31.3% | 17.2% | 52.9% | **+18.3 pp** |
| **qwen3.5:397b** | 17.4% | 63.0% | 45.9% | 38.0% | 36.6% | 59.0% | 42.9% | 45.2% | **+15.6 pp** |
| **gemma3:27b** | 8.5% | 13.1% | 18.2% | 22.2% | 8.5% | 22.2% | 8.2% | 22.2% | **+9.0 pp** |
| **devstral-small-2:24b** | 7.6% | 21.1% | 18.5% | 25.2% | 20.0% | 24.6% | 22.4% | 29.9% | **+8.1 pp** |
| **ministral-3:3b** | 14.7% | 23.7% | 42.4% | 22.7% | 18.6% | 48.4% | 22.0% | 29.9% | **+6.8 pp** |
| **gemma3:4b** | 16.1% | 20.0% | 17.5% | 31.0% | 25.6% | 23.4% | 9.9% | 18.3% | **+5.9 pp** |
| **ministral-3:14b** | 26.8% | 28.0% | 17.7% | 30.7% | 23.3% | 26.2% | 22.4% | 28.2% | **+5.8 pp** |
| **gpt-oss:20b** | 25.0% | 25.0% | 11.5% | 39.3% | 25.0% | 25.0% | 31.9% | 25.0% | **+5.2 pp** |
| **gemini-3-flash-preview** | 31.6% | 20.1% | 35.6% | 35.2% | 0.0% | 38.7% | 61.9% | 51.9% | **+4.2 pp** |
| **qwen3-coder-next** | 19.6% | 18.8% | 14.9% | 15.8% | 20.7% | 30.2% | 17.3% | 24.4% | **+4.2 pp** |
| **cogito-2.1:671b** | 17.5% | 22.2% | 26.4% | 22.8% | 27.1% | 34.3% | 26.2% | 30.7% | **+3.2 pp** |
| **qwen3-coder:480b** | 16.5% | 15.7% | 22.4% | 19.9% | 16.4% | 26.0% | 23.7% | 24.5% | **+1.7 pp** |
| **glm-5** | 31.9% | 59.4% | 72.8% | 60.0% | 24.7% | 37.3% | 55.1% | 27.7% | 0.0 pp |
| **gpt-oss:120b** | 69.0% | 66.7% | 33.8% | 37.3% | 69.2% | 65.5% | 67.2% | 66.7% | −0.7 pp |
| **minimax-m2.5** † | 57.3% | 51.4% | 46.4% | 51.8% | 23.6% | N/A | 61.7% | N/A | −0.3 pp† |
| **mistral-large-3:675b** | 26.5% | 32.6% | 31.9% | 20.6% | 32.2% | 24.3% | 29.9% | 26.1% | −4.2 pp |
| **nemotron-3-nano:30b** | 9.5% | 10.6% | 16.9% | 3.0% | 11.6% | 6.4% | 32.8% | 31.4% | −4.8 pp |
| **devstral-2:123b** | 30.5% | 27.4% | 37.6% | 22.2% | 29.3% | 24.9% | 26.8% | 23.0% | −6.6 pp |
| **deepseek-v3.2** | 58.9% | 39.0% | 37.3% | 43.9% | 63.9% | 56.1% | 25.4% | 16.7% | −7.5 pp |
| **minimax-m2** † | 34.0% | 28.4% | 60.7% | 50.5% | 38.2% | N/A | 40.3% | N/A | −7.9 pp† |
| **kimi-k2.5** | 41.4% | 29.8% | 33.0% | 35.8% | 74.9% | 52.1% | 46.8% | 38.9% | −9.8 pp |

---

## 8. What to Change for Test 10

The goal of these changes is not to improve benchmark scores in isolation — it is to make the tool more useful to a real developer auditing a real production page. The benchmark fixtures are proxies for real-world HTML; the failure modes observed in Test 9 are the same ones that would frustrate a developer using the extension on their own code.

### 8.1 RAG Pipeline — Per-Sweep Multi-Query Retrieval

**Real-world problem:** A developer's HTML file typically contains issues spread across several accessibility categories at once — unlabelled form inputs, missing nav labels, broken ARIA references, and images without alt text could all appear in the same file. The current RAG pipeline fires a single generic WCAG query. That query cannot simultaneously retrieve relevant guidance for all of those categories. The chunks it returns are broad enough to cover something, but too shallow to give the model the specific rule details it needs to accurately detect (for example) SC 1.3.5 autocomplete requirements versus ARIA11 landmark labelling.

The result in practice: the model gets vague context, applies it imprecisely, and either misses the specific violation or reports a false positive because the retrieved text loosely matched the pattern without confirming the actual condition.

**Change implemented:** Five targeted queries — one per sweep group — are run in parallel, deduplicated, and injected as a clean context block. A stricter retrieval threshold (cosine distance 0.50 vs 0.65) ensures only directly relevant chunks are included.

| Setting | Test 9 | Test 10 |
|---|---|---|
| Queries per fixture | 1 (generic) | 5 (one per sweep group) |
| Chunks per query | 6 | 2 |
| Max unique chunks injected | 6 | 8 (after deduplication) |
| Cosine distance threshold | 0.65 | 0.50 (stricter) |
| Non-HTML top_k | 6 | 3 |

The five queries target: (1) links and nav landmark labels, (2) buttons and aria-expanded on toggles, (3) form inputs, labels, and autocomplete on personal data fields, (4) images alt text, heading hierarchy, and table header scope, (5) broken ARIA id references. A developer's real page will hit multiple of these simultaneously; the model now receives useful, specific guidance for each.

### 8.2 Prompt — Three New Anti-Hallucination Rules

**Real-world problem:** False positives are more damaging in real-world use than in benchmarking. When a developer sees 15 reported issues and 8 of them are wrong, they lose confidence in the tool and start ignoring its output — including the real issues. The 204 false positives from ministral-3:3b on a single fixture, or the 79 from nemotron-3-super, represent the kind of noise that makes an accessibility assistant worse than useless: it creates work without creating value.

Three specific false-positive patterns were identified from the Test 9 output:

**Pattern 1 — Autocomplete over-reporting:** Models flagged inputs like `<input name="search">` or `<input name="username">` as missing autocomplete for personal data, despite these inputs not collecting personal information. In a real page with a search box and a login form, this produces a flood of reports that the developer must manually check and dismiss.

**Pattern 2 — Speculative broken ARIA references:** Models reported broken `aria-labelledby` references without having completed the full id inventory required by Phase 1. On a long production page, a referenced id might appear 200 lines below the element — a model that gives up on Phase 1 early will incorrectly flag it as missing.

**Pattern 3 — Hedged reporting:** Models emitted issue blocks with language like "this may be missing" or "it is possible that...". In a real audit, a hedged report is not actionable. A developer cannot fix something that "may" be wrong.

**Change implemented (`ANTI_FP_SUPPLEMENT` rules vi–viii):**

| New rule | What it prevents in real use |
|---|---|
| [vi] Confidence gate | Hedged or speculative issues are dropped before output — every reported issue must be traceable to a specific element the model observed in Phase 1 |
| [vii] Sweep J strictness | Autocomplete is only flagged when the input's name, id, type, or placeholder contains a clear personal data signal (name, email, tel, address, etc.); search, username, comment, coupon and similar are explicitly excluded |
| [viii] Sweep H gating | Broken ARIA references are only reported if the Phase 1 id inventory covers the whole document — a partial scan cannot produce reliable broken-ref reports |

### 8.3 What Was Not Changed and Why

| Area | Decision | Rationale |
|---|---|---|
| Inference parameters (temperature, top_p, top_k) | Unchanged | These are literature-grounded and appropriate for a deterministic code-analysis task; the false positive and miss rates observed are caused by retrieval noise and prompt ambiguity, not sampling randomness |
| Phase 1 / Phase 2 prompt structure | Unchanged | The two-phase read-then-audit structure is the right approach for real pages where ARIA references, heading order, and landmark counts require whole-document awareness before any issue can be confirmed |
| Sweep definitions A–J | Unchanged | The sweeps represent real WCAG 2.2 violations that real auditors check; the problem is model compliance with the sweep instructions, not the sweep logic itself |
| Ground truth fixtures | Unchanged | The fixtures model real production pages; adjusting ground truth to chase F1 would decouple the benchmark from real-world validity |
| Model roster | No models added or removed | The priority for Test 10 is to confirm whether the prompt and RAG changes improve real-world detection accuracy before expanding the roster further |
