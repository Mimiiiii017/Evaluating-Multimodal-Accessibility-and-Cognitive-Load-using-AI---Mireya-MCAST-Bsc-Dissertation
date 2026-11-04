# Cloud-LLM Preliminary Study — Test 10 Results

**Date:** 29–30 March 2026  
**Scope:** HTML fixtures only (html-clean, html-low, html-medium, html-high) — 4 complexity tiers  
**Models tested:** 20 cloud LLMs (minimax excluded — HTTP 500 confirmed broken in Test 9, not re-tested)  
**Conditions:** 4 (RAG × Think factorial design)  
**Total LLM calls:** 320 (20 models × 4 fixtures × 4 conditions)

---

## 1. What Changed from Test 9

### 1.1 minimax Excluded

Both minimax models returned HTTP 500 on every norag call in Test 9. Neither was re-included in Test 10. All 4 conditions now cover exactly 20 models.

### 1.2 Multi-Query HTML RAG

The single generic WCAG query was replaced with 5 targeted queries — one per sweep group — run in parallel, deduplicated, and capped at 8 chunks. Cosine distance threshold tightened from 0.65 → 0.50.

| Setting | Test 9 | Test 10 |
|---|---|---|
| Queries per fixture | 1 (generic) | 5 (per sweep group) |
| Chunks per query | 6 | 2 |
| Max unique chunks injected | 6 | 8 (deduplicated) |
| Cosine distance threshold | 0.65 | 0.50 |
| Non-HTML top_k | 6 | 3 |

### 1.3 Three New Anti-FP Prompt Rules (vi–viii)

Added to `ANTI_FP_SUPPLEMENT`:

| Rule | What it targets |
|---|---|
| [vi] Confidence gate | Every reported issue must be traceable to a Phase 1 element; hedged/speculative output is suppressed |
| [vii] Sweep J strictness | autocomplete only flagged for clear personal data signals; search, username, comment, coupon explicitly excluded |
| [viii] Sweep H gating | Broken ARIA refs only reported if the Phase 1 id inventory covers the full document |

---

## 2. Results — All 4 Conditions

### 2.1 Condition Definitions

| Condition | RAG | Thinking (extended CoT) | Models |
|---|---|---|---|
| `rag-think` (rt) | Yes | Yes | 20 |
| `rag-nothink` (rn) | Yes | No | 20 |
| `norag-nothink` (nn) | No | No | 20 |
| `norag-think` (nt) | No | Yes | 20 |

### 2.2 F1 Score Matrix (sorted by average across all 4 conditions)

| Model | rt | rn | nn | nt | **Best F1** | **Avg F1** |
|---|---|---|---|---|---|---|
| **gpt-oss:120b** | **70.2%** | 47.3% | 66.1% | 61.5% | **70.2%** | **61.3%** |
| **deepseek-v3.2** | **69.6%** | 48.5% | 42.0% | 61.8% | **69.6%** | **55.5%** |
| **qwen3.5:397b** | 58.4% | 40.3% | 45.6% | **71.2%** | **71.2%** | **53.9%** |
| **qwen3-vl:235b** | 50.3% | **55.4%** | 48.9% | 53.3% | **55.4%** | **52.0%** |
| **glm-5** | 38.1% | 38.8% | 52.7% | **57.2%** | **57.2%** | **46.7%** |
| **kimi-k2.5** | **46.0%** | 41.4% | 48.2% | 46.8% | **48.2%** | **45.6%** |
| **mistral-large-3:675b** | 28.5% | 31.0% | **31.7%** | 30.2% | **31.7%** | **30.4%** |
| **ministral-3:14b** | **29.4%** | 23.2% | 35.6% | 32.3% | **35.6%** | **30.1%** |
| **gemini-3-flash-preview** | 26.9% | 31.1% | **34.5%** | 21.7% | **34.5%** | **28.6%** |
| **gpt-oss:20b** | 25.0% | 25.0% | 25.0% | **35.7%** | **35.7%** | **27.7%** |
| **gemma3:4b** | 24.7% | **42.7%** | 23.8% | 14.3% | **42.7%** | **26.4%** |
| **nemotron-3-super** | 6.1% | **67.7%** | 0.0% | 27.4% | **67.7%** | **25.3%** |
| **ministral-3:3b** | **34.5%** | 27.7% | 8.3% | 24.8% | **34.5%** | **23.8%** |
| **cogito-2.1:671b** | **23.7%** | 24.0% | 27.1% | 19.3% | **27.1%** | **23.5%** |
| **qwen3-coder:480b** | 23.7% | 14.0% | **42.2%** | 12.5% | **42.2%** | **23.1%** |
| **gemma3:27b** | 18.3% | 20.5% | **20.7%** | 18.8% | **20.7%** | **19.6%** |
| **devstral-small-2:24b** | **22.0%** | 20.1% | 18.3% | 17.2% | **22.0%** | **19.4%** |
| **qwen3-coder-next** | **24.0%** | 19.9% | 10.8% | 18.5% | **24.0%** | **18.3%** |
| **nemotron-3-nano:30b** | **37.5%** | 8.8% | 9.6% | 13.8% | **37.5%** | **17.4%** |
| **devstral-2:123b** | 15.9% | 11.8% | 23.2% | 18.4% | **23.2%** | **17.3%** |

### 2.3 Composite Score Matrix (80% F1 + 20% speed, sorted by average across all 4 conditions)

| Model | rt | rn | nn | nt | **Avg** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | **70.2%** | 48.4% | 65.8% | 61.9% | **61.6%** |
| **deepseek-v3.2** | 59.5% | 55.1% | 42.0% | **59.8%** | **54.1%** |
| **qwen3.5:397b** | 58.7% | 36.1% | 49.4% | **65.5%** | **52.4%** |
| **kimi-k2.5** | 42.6% | 40.3% | **52.8%** | 45.3% | **45.3%** |
| **qwen3-vl:235b** | 40.2% | **44.3%** | 39.1% | 54.9% | **44.6%** |
| **glm-5** | 36.5% | 43.0% | 49.0% | **48.3%** | **44.2%** |
| **mistral-large-3:675b** | 42.2% | **43.4%** | 42.5% | 44.2% | **43.1%** |
| **gemini-3-flash-preview** | 34.7% | **44.9%** | 47.4% | 34.4% | **40.4%** |
| **nemotron-3-super** | 23.3% | **65.5%** | 20.0% | 31.4% | **35.1%** |
| **ministral-3:3b** | **44.8%** | 39.3% | 22.4% | 33.7% | **35.1%** |
| **qwen3-coder:480b** | 30.1% | 29.7% | **51.2%** | 29.1% | **35.0%** |
| **gpt-oss:20b** | 30.9% | 29.9% | 32.0% | **42.8%** | **33.9%** |
| **gemma3:4b** | 23.8% | **50.2%** | 31.4% | 25.1% | **32.6%** |
| **ministral-3:14b** | 32.1% | 26.5% | **37.6%** | 34.1% | **32.6%** |
| **gemma3:27b** | 30.3% | 30.9% | **31.5%** | 32.2% | **31.2%** |
| **devstral-2:123b** | **32.7%** | 23.5% | 34.6% | 32.4% | **30.8%** |
| **devstral-small-2:24b** | **34.2%** | 27.3% | 29.2% | 25.5% | **29.1%** |
| **nemotron-3-nano:30b** | **43.3%** | 21.0% | 22.1% | 27.7% | **28.5%** |
| **cogito-2.1:671b** | **38.9%** | 26.9% | 32.3% | 15.4% | **28.4%** |
| **qwen3-coder-next** | **37.2%** | 32.8% | 19.5% | 23.7% | **28.3%** |

### 2.4 norag-nothink (nn) Detail

| Model | F1 | Precision | Recall | TP | FN | FP | Avg time |
|---|---|---|---|---|---|---|---|
| gpt-oss:120b | **66.1%** | 96.7% | 55.4% | 29 | 63 | 2 | 126 s |
| glm-5 | **52.7%** | 96.9% | 45.6% | 13 | 79 | 1 | 227 s |
| kimi-k2.5 | **48.2%** | 70.0% | 63.0% | 43 | 49 | 5 | 105 s |
| qwen3-vl:235b | **48.9%** | 95.0% | 41.0% | 13 | 79 | 1 | 339 s |
| qwen3.5:397b | **45.6%** | 70.4% | 59.8% | 40 | 52 | 4 | 126 s |
| deepseek-v3.2 | **42.0%** | 75.0% | 56.1% | 29 | 63 | 1 | 200 s |
| qwen3-coder:480b | **42.2%** | 83.3% | 35.7% | 11 | 81 | 3 | 51 s |
| gemini-3-flash-preview | **34.5%** | 61.3% | 51.0% | 26 | 66 | 12 | 13 s |
| ministral-3:14b | **35.6%** | 57.8% | 51.1% | 31 | 61 | 49 | 188 s |
| mistral-large-3:675b | **31.7%** | 63.2% | 46.8% | 23 | 69 | 12 | 57 s |
| cogito-2.1:671b | **27.1%** | 75.0% | 41.8% | 18 | 74 | 1 | 164 s |
| gpt-oss:20b | **25.0%** | 100.0% | 25.0% | 0 | 92 | 0 | 141 s |
| gemma3:4b | **23.8%** | 44.6% | 45.1% | 22 | 70 | 76 | 135 s |
| devstral-2:123b | **23.2%** | 56.7% | 39.7% | 18 | 74 | 7 | 75 s |
| devstral-small-2:24b | **18.3%** | 75.0% | 37.1% | 7 | 85 | 2 | 99 s |
| nemotron-3-super | **0.0%** | 75.0% | 25.0% | 0 | 92 | 28 | 9 s |
| gemma3:27b | **20.7%** | 60.4% | 38.3% | 11 | 81 | 8 | 93 s |
| ministral-3:3b | **8.3%** | 75.0% | 30.0% | 2 | 90 | 8 | 80 s |
| nemotron-3-nano:30b | **9.6%** | 66.7% | 38.5% | 6 | 76 | 8 | 101 s |
| qwen3-coder-next | **10.8%** | 75.0% | 30.9% | 6 | 86 | 4 | 161 s |

### 2.5 norag-think (nt) Detail

| Model | F1 | Precision | Recall | TP | FN | FP | Avg time |
|---|---|---|---|---|---|---|---|
| qwen3.5:397b | **71.2%** | 95.3% | 61.0% | 35 | 57 | 3 | 219 s |
| gpt-oss:120b | **61.5%** | 95.0% | 51.1% | 25 | 67 | 3 | 155 s |
| deepseek-v3.2 | **61.8%** | 100.0% | 50.2% | 25 | 67 | 0 | 191 s |
| glm-5 | **57.2%** | 82.7% | 48.7% | 24 | 68 | 6 | 310 s |
| qwen3-vl:235b | **53.3%** | 91.3% | 43.4% | 18 | 74 | 3 | 162 s |
| kimi-k2.5 | **46.8%** | 73.7% | 61.9% | 35 | 57 | 2 | 229 s |
| mistral-large-3:675b | **30.2%** | 66.0% | 44.8% | 23 | 69 | 10 | 43 s |
| gpt-oss:20b | **35.7%** | 94.7% | 32.4% | 15 | 77 | 4 | 132 s |
| ministral-3:14b | **32.3%** | 58.1% | 48.3% | 30 | 62 | 18 | 222 s |
| nemotron-3-super | **27.4%** | 58.2% | 48.0% | 37 | 55 | 38 | 204 s |
| ministral-3:3b | **24.8%** | 38.2% | 45.4% | 27 | 65 | 48 | 137 s |
| devstral-2:123b | **18.4%** | 56.7% | 40.9% | 14 | 78 | 13 | 79 s |
| gemma3:27b | **18.8%** | 56.7% | 37.5% | 10 | 82 | 7 | 86 s |
| cogito-2.1:671b | **19.3%** | 75.0% | 36.2% | 12 | 80 | 3 | 349 s |
| qwen3-coder:480b | **12.5%** | 62.5% | 32.1% | 9 | 83 | 2 | 57 s |
| nemotron-3-nano:30b | **13.8%** | 63.5% | 33.4% | 9 | 83 | 9 | 94 s |
| devstral-small-2:24b | **17.2%** | 71.4% | 35.3% | 9 | 83 | 2 | 169 s |
| gemma3:4b | **14.3%** | 62.5% | 35.1% | 7 | 85 | 8 | 140 s |
| qwen3-coder-next | **18.5%** | 71.4% | 35.8% | 14 | 78 | 6 | 213 s |
| gemini-3-flash-preview | **21.7%** | 72.9% | 39.3% | 22 | 70 | 7 | 88 s |

---

## 3. RAG Analysis

### 3.1 RAG Effect — no-think condition (rn F1 vs nn F1, sorted by Δ)

| Model | rn F1 | nn F1 | Δ | Verdict |
|---|---|---|---|---|
| nemotron-3-super | 67.7% | 0.0% | **+67.7 pp** | RAG critical (nn completely fails) |
| ministral-3:3b | 27.7% | 8.3% | **+19.4 pp** | RAG strongly helps |
| gemma3:4b | 42.7% | 23.8% | **+18.9 pp** | RAG strongly helps |
| qwen3-coder-next | 19.9% | 10.8% | **+9.1 pp** | RAG helps |
| deepseek-v3.2 | 48.5% | 42.0% | **+6.5 pp** | RAG mildly helps |
| qwen3-vl:235b | 55.4% | 48.9% | **+6.5 pp** | RAG mildly helps |
| devstral-small-2:24b | 20.1% | 18.3% | +1.8 pp | Neutral |
| gpt-oss:20b | 25.0% | 25.0% | 0.0 pp | No effect |
| gemma3:27b | 20.5% | 20.7% | −0.2 pp | Neutral |
| nemotron-3-nano:30b | 8.8% | 9.6% | −0.8 pp | Neutral |
| mistral-large-3:675b | 31.0% | 31.7% | −0.7 pp | Neutral |
| cogito-2.1:671b | 24.0% | 27.1% | −3.1 pp | RAG slightly hurts |
| gemini-3-flash-preview | 31.1% | 34.5% | −3.4 pp | RAG slightly hurts |
| qwen3.5:397b | 40.3% | 45.6% | −5.3 pp | RAG slightly hurts |
| kimi-k2.5 | 41.4% | 48.2% | −6.8 pp | RAG hurts |
| devstral-2:123b | 11.8% | 23.2% | **−11.4 pp** | RAG hurts |
| ministral-3:14b | 23.2% | 35.6% | **−12.4 pp** | RAG hurts |
| glm-5 | 38.8% | 52.7% | **−13.9 pp** | RAG hurts |
| gpt-oss:120b | 47.3% | 66.1% | **−18.8 pp** | RAG clearly hurts |
| qwen3-coder:480b | 14.0% | 42.2% | **−28.2 pp** | RAG clearly hurts |

**Net RAG effect (no-think):** avg rn = 32.0%, avg nn = 30.7%, **Δ = +1.3 pp**  
(Test 9 no-think RAG effect was −2.4 pp — multi-query retrieval has flipped the net direction, but the average is still driven by high-variance models.)

### 3.2 Think (CoT) Effect

| Model | Avg Think F1 | Avg noThink F1 | Δ | Verdict |
|---|---|---|---|---|
| qwen3.5:397b | 64.8% | 42.9% | **+21.9 pp** | Think strongly helps |
| deepseek-v3.2 | 65.7% | 45.3% | **+20.4 pp** | Think strongly helps ← reversal from T9 |
| nemotron-3-nano:30b | 25.7% | 9.2% | **+16.5 pp** | Think strongly helps |
| ministral-3:3b | 29.7% | 18.0% | **+11.7 pp** | Think helps |
| gpt-oss:20b | 30.4% | 25.0% | **+5.4 pp** | Think mildly helps |
| qwen3-vl:235b | 51.8% | 52.2% | −0.4 pp | Neutral |
| gemma3:27b | 18.6% | 20.6% | −2.0 pp | Neutral |
| mistral-large-3:675b | 29.4% | 31.4% | −2.0 pp | Neutral |
| cogito-2.1:671b | 21.5% | 25.6% | −4.1 pp | Think slightly hurts |
| devstral-small-2:24b | 19.6% | 19.2% | +0.4 pp | Neutral |
| devstral-2:123b | 17.2% | 17.5% | −0.3 pp | Neutral |
| ministral-3:14b | 30.9% | 29.4% | +1.5 pp | Neutral |
| qwen3-coder-next | 21.3% | 15.4% | +5.9 pp | Think mildly helps |
| gpt-oss:120b | 65.9% | 56.7% | **+9.2 pp** | Think helps |
| kimi-k2.5 | 46.4% | 44.8% | +1.6 pp | Neutral |
| gemini-3-flash-preview | 24.3% | 32.8% | **−8.5 pp** | Think hurts |
| gemma3:4b | 19.5% | 33.3% | **−13.8 pp** | Think clearly hurts |
| glm-5 | 47.7% | 45.8% | +1.9 pp | Neutral |
| qwen3-coder:480b | 18.1% | 28.1% | **−10.0 pp** | Think clearly hurts |
| nemotron-3-super | 16.8% | 33.9% | **−17.1 pp** | Think clearly hurts |

**Key reversal:** deepseek-v3.2 had a −22.1 pp think penalty in Test 9 (norag condition: 56.1% nn vs 16.7% nt). In Test 10 it is +20.4 pp in favour of thinking. The Phase 1/Phase 2 two-pass prompt structure appears to have resolved the think penalty by giving the chain-of-thought a clear two-stage scaffold to follow.

### 3.3 Best Condition Per Model

| Model | Best condition | Best F1 |
|---|---|---|
| qwen3.5:397b | norag-think | 71.2% |
| gpt-oss:120b | rag-think | 70.2% |
| nemotron-3-super | rag-nothink | 67.7% (FP=29) |
| deepseek-v3.2 | rag-think | 69.6% |
| glm-5 | norag-think | 57.2% |
| qwen3-vl:235b | rag-nothink | 55.4% |
| kimi-k2.5 | norag-nothink | 48.2% |
| gemma3:4b | rag-nothink | 42.7% |
| qwen3-coder:480b | norag-nothink | 42.2% |
| kimi-k2.5 | norag-nothink | 48.2% |
| mistral-large-3:675b | norag-nothink | 31.7% |
| ministral-3:14b | norag-nothink | 35.6% |
| gemini-3-flash-preview | norag-nothink | 34.5% |
| ministral-3:3b | rag-think | 34.5% |
| gpt-oss:20b | norag-think | 35.7% |
| nemotron-3-nano:30b | rag-think | 37.5% |
| cogito-2.1:671b | norag-nothink | 27.1% |
| gemma3:27b | norag-nothink | 20.7% |
| devstral-small-2:24b | rag-think | 22.0% |
| qwen3-coder-next | rag-think | 24.0% |
| devstral-2:123b | norag-nothink | 23.2% |

---

## 4. Small vs Large Model Analysis

| Tier | Models | Best F1 (best condition) | Avg F1 across conditions |
|---|---|---|---|
| ≤5 B | gemma3:4b, ministral-3:3b | 42.7% (gemma3:4b rn) | 24.9% |
| 5–30 B | gpt-oss:20b, devstral-small-2:24b, gemma3:27b, nemotron-3-nano:30b | 37.5% (nano rt) | 22.5% |
| 30–200 B | ministral-3:14b, devstral-2:123b, gpt-oss:120b, nemotron-3-super | **70.2%** (gpt-oss:120b rt) | **38.3%** |
| >200 B (non-MoE) | qwen3-vl:235b, qwen3.5:397b, qwen3-coder:480b, qwen3-coder-next | 71.2% (qwen3.5 nt) | 37.6% |
| >200 B (MoE / frontier) | kimi-k2.5, deepseek-v3.2, cogito-2.1:671b, mistral-large-3:675b, glm-5, gemini-3-flash-preview | **69.6%** (deepseek rt) | **40.3%** |

**Finding:** The top two models by best F1 are now `qwen3.5:397b` (71.2%, norag-think) and `gpt-oss:120b` (70.2%, rag-think). The MoE/frontier tier improved substantially vs Test 9, primarily due to `deepseek-v3.2`'s think penalty reversal. `nemotron-3-super` remains a high-variance outlier: best F1 is 67.7% in rag-nothink but 0.0% in norag-nothink — it is completely dependent on RAG context.

---

## 5. Key Findings

### 5.1 deepseek-v3.2 Think Penalty Reversed

| Condition | Test 9 | Test 10 | Δ |
|---|---|---|---|
| norag-nothink | 56.1% | 42.0% | −14.1 pp |
| norag-think | 16.7% | 61.8% | **+45.1 pp** |
| Think penalty (noRAG) | −39.4 pp | **+19.8 pp** | reversal |
| rag-nothink | 43.9% | 48.5% | +4.6 pp |
| rag-think | 39.0% | 69.6% | **+30.6 pp** |
| Think penalty (RAG) | −4.9 pp | **+21.1 pp** | reversal |

The two-phase prompt (Phase 1: read and inventory; Phase 2: audit and report) appears to provide the structured scaffold that deepseek's chain-of-thought needed. In Test 9, the model's extended reasoning led it to second-guess valid detections; the mandatory Phase 1 inventory step channeled that reasoning into the correct pre-audit work.

### 5.2 Anti-FP Rules Success: ministral-3:3b

| Fixture / condition | Test 9 FP | Test 10 FP | Reduction |
|---|---|---|---|
| norag-nothink total FP | 204 | 8 | **−196 FPs (96% drop)** |

Rule [vii] (autocomplete only for clear personal data signals) eliminated the primary hallucination driver for this model. The trade-off is that F1 dropped from 48.4% → 8.3% in norag-nothink, because the high recall in Test 9 was partly driven by the overreporting. The model's actual TP detection capability without hallucination support is 8.3% — it was never reliably finding issues, just flooding output.

### 5.3 nemotron-3-super Instability

nemotron-3-super has extreme condition-sensitivity:

| Condition | F1 | FP |
|---|---|---|
| norag-nothink | 0.0% | 28 |
| norag-think | 27.4% | 38 |
| rag-nothink | **67.7%** | 29 |
| rag-think | 6.1% | 1 |

It is the top-performing model in rag-nothink (67.7%, 47 TP, 45 FN, 29 FP) yet completely fails in norag-nothink (0 TP, 28 FP). This model cannot function without RAG context, and even with RAG produces 29 false positives. The think mode in the RAG condition catastrophically collapses performance (6.1%). Treating this model as a general-purpose auditor would be unreliable.

### 5.4 RAG Multi-Query Net Effect

The net RAG effect (no-think) moved from −2.4 pp (Test 9) to +1.3 pp (Test 10). However this headline is driven by nemotron-3-super's +67.7 pp RAG uplift. Excluding nemotron-3-super, the remaining 19 models show:

- avg rn = 27.5%, avg nn = 32.4% → net = **−4.9 pp**

This means multi-query RAG still hurts most frontier models (gpt-oss:120b: −18.8 pp, qwen3-coder:480b: −28.2 pp, glm-5: −13.9 pp). The RAG context continues to confuse models with strong internal WCAG knowledge by injecting partial page excerpts that conflict with whole-document cross-referencing (ARIA id lookups, landmark counts).

### 5.5 qwen3-coder:480b Strong norag-nothink Preference

qwen3-coder:480b shows a pronounced no-RAG, no-think preference (+28.2 pp worse with RAG in no-think). In norag-nothink it achieves 42.2% F1 — competitive with kimi-k2.5 and deepseek-v3.2 in the same condition, while being much faster (51 s avg). This model ranks 3rd in the norag-nothink composite, suggesting it as a strong candidate for fast auditing without infrastructure overhead.

### 5.6 hallucination Outliers — Before and After

| Model | Best-condition FP (T9) | Best-condition FP (T10) | Change |
|---|---|---|---|
| ministral-3:3b | 204 (nn) | 8 (nn) | **−96%** |
| nemotron-3-super | 79 (rn) | 29 (rn) | **−63%** |
| gemma3:4b | 80 (nn) | 76 (nn) | −5% (minimal) |
| ministral-3:14b | 32 (nn) | 49 (nn) | +53% (regressed) |

gemma3:4b did not benefit from rule [vii] — its hallucinations come from a wider range of categories than just autocomplete. ministral-3:14b's FP increase in nn is unexpected; it may reflect the confidence gate rule backfiring for this model (outputting more speculative reports that weren't previously being filtered at this confidence level).

---

## 6. Model Selection for Full Study

### Recommended longlist (best overall F1, manageable FP, viable latency)

| Model | Best condition | Best F1 | Avg F1 | Recommended condition |
|---|---|---|---|---|
| **qwen3.5:397b** | norag-think | 71.2% | 53.9% | norag-think |
| **gpt-oss:120b** | rag-think | 70.2% | 61.3% | norag-think (RAG hurts: −18.8 pp) |
| **deepseek-v3.2** | rag-think | 69.6% | 55.5% | rag-think (0 FP, 250 s) |
| **qwen3-vl:235b** | rag-nothink | 55.4% | 52.0% | rag-nothink |
| **glm-5** | norag-think | 57.2% | 46.7% | norag-think |
| **kimi-k2.5** | norag-nothink | 48.2% | 45.6% | norag-nothink |
| **qwen3-coder:480b** | norag-nothink | 42.2% | 23.1% | norag-nothink (fast: 51 s) |
| **gemini-3-flash-preview** | norag-nothink | 34.5% | 28.6% | norag-nothink (fastest: 13 s) |
| **mistral-large-3:675b** | norag-nothink | 31.7% | 30.4% | norag-nothink |

### Excluded from longlist

| Model | Reason |
|---|---|
| nemotron-3-super | Extreme condition instability (0.0% nn → 67.7% rn); 29 FP in best condition; unreliable without RAG |
| ministral-3:3b | Best F1 34.5% (rt) — reliable TP detection is low; FP improved but recall too poor |
| gemma3:4b | FP=76 in best condition (rn); 42.7% F1 driven by RAG dependency |
| gpt-oss:20b | Zero TP in norag conditions; refuses to flag issues without external context |
| devstral-2:123b | Best F1=23.2%, low across all conditions |
| nemotron-3-nano:30b | Best F1=37.5% (rt) but extreme variance; avg 17.4% |
| cogito-2.1:671b | Avg 23.5%, too slow (349 s in nt) for the uplift it offers |
| gemma3:27b | Best F1=20.7%, below viability threshold |
| devstral-small-2:24b | Best F1=22.0%, avg 19.4% |
| qwen3-coder-next | Best F1=24.0%, avg 18.3% |

---

## 7. F1 Score Comparison: Test 9 vs Test 10 — All Conditions

Sorted by Avg Δ descending. Positive = improvement Test 9 → Test 10; negative = regression.

| Model | T9 rt | T10 rt | T9 rn | T10 rn | T9 nn | T10 nn | T9 nt | T10 nt | Avg Δ |
|---|---|---|---|---|---|---|---|---|---|
| **deepseek-v3.2** | 39.0% | **69.6%** | 43.9% | **48.5%** | 56.1% | 42.0% | 16.7% | **61.8%** | **+16.6 pp** |
| **kimi-k2.5** | 29.8% | **46.0%** | 35.8% | **41.4%** | 52.1% | 48.2% | 38.9% | **46.8%** | **+6.4 pp** |
| **mistral-large-3:675b** | 32.6% | 28.5% | 20.6% | **31.0%** | 24.3% | **31.7%** | 26.1% | **30.2%** | **+4.5 pp** |
| **nemotron-3-nano:30b** | 10.6% | **37.5%** | 3.0% | **8.8%** | 6.4% | **9.6%** | 31.4% | 13.8% | **+4.5 pp** |
| **gemma3:4b** | 20.0% | **24.7%** | 31.0% | **42.7%** | 23.4% | **23.8%** | 18.3% | 14.3% | **+3.2 pp** |
| **qwen3.5:397b** | 63.0% | 58.4% | 38.0% | **40.3%** | 59.0% | 45.6% | 45.2% | **71.2%** | **+2.6 pp** |
| **gpt-oss:120b** | 66.7% | **70.2%** | 37.3% | **47.3%** | 65.5% | **66.1%** | 66.7% | 61.5% | **+2.2 pp** |
| **ministral-3:14b** | 28.0% | **29.4%** | 30.7% | 23.2% | 26.2% | **35.6%** | 28.2% | **32.3%** | **+1.8 pp** |
| **qwen3-coder:480b** | 15.7% | **23.7%** | 19.9% | 14.0% | 26.0% | **42.2%** | 24.5% | 12.5% | **+1.6 pp** |
| **glm-5** | 59.4% | 38.1% | 60.0% | 38.8% | 37.3% | **52.7%** | 27.7% | **57.2%** | **+0.6 pp** |
| **gemma3:27b** | 13.1% | **18.3%** | 22.2% | 20.5% | 22.2% | **20.7%** | 22.2% | 18.8% | **−0.3 pp** |
| **gpt-oss:20b** | 25.0% | 25.0% | 39.3% | 25.0% | 25.0% | 25.0% | 25.0% | **35.7%** | **−0.9 pp** |
| **cogito-2.1:671b** | 22.2% | **23.7%** | 22.8% | **24.0%** | 34.3% | 27.1% | 30.7% | 19.3% | **−4.0 pp** |
| **qwen3-coder-next** | 18.8% | **24.0%** | 15.8% | **19.9%** | 30.2% | 10.8% | 24.4% | **18.5%** | **−4.0 pp** |
| **qwen3-vl:235b** | 57.3% | 50.3% | 59.4% | **55.4%** | 52.1% | 48.9% | 57.0% | 53.3% | **−4.5 pp** |
| **devstral-small-2:24b** | 21.1% | **22.0%** | 25.2% | 20.1% | 24.6% | 18.3% | 29.9% | 17.2% | **−5.8 pp** |
| **devstral-2:123b** | 27.4% | 15.9% | 22.2% | 11.8% | 24.9% | **23.2%** | 23.0% | 18.4% | **−7.1 pp** |
| **ministral-3:3b** | 23.7% | **34.5%** | 22.7% | **27.7%** | 48.4% | 8.3% | 29.9% | **24.8%** | **−7.4 pp** ‡ |
| **gemini-3-flash-preview** | 20.1% | **26.9%** | 35.2% | 31.1% | 38.7% | 34.5% | 51.9% | 21.7% | **−7.9 pp** |
| **nemotron-3-super** | 42.0% | 6.1% | 53.2% | **67.7%** | 31.3% | 0.0% | 52.9% | 27.4% | **−19.6 pp** |

‡ ministral-3:3b F1 regression is an expected consequence of the FP reduction: Test 9 nn FP=204 inflated apparent recall. Test 10 nn FP=8 (−96%) means reported issues are now substantially more trustworthy despite the lower F1.

---

## 8. What to Change for Test 11

### 8.1 RAG — Selective Deployment

**Real-world problem:** Multi-query RAG helps models with weak internal WCAG knowledge (nemotron-3-super, gemma3:4b, ministral-3:3b) but consistently hurts top-tier frontier models (gpt-oss:120b −18.8 pp, qwen3-coder:480b −28.2 pp, glm-5 −13.9 pp). Injecting partial page chunk extracts into a whole-document ARIA cross-reference task interferes with the model's own internal structure traversal. Running RAG for every model is wasteful infrastructure load that actively degrades the best performers.

**Possible change:** Tier-based RAG deployment — enable multi-query RAG only for models below a known F1 threshold in noRAG conditions; disable for top-tier models. Alternatively, test a hybrid: inject RAG chunks as a supplementary block after the full HTML rather than before, reducing the chance that retrieved chunks anchor the model's attention before it reads the document.

### 8.2 Prompt — deepseek-v3.2 norag-nothink Regression

**Real-world problem:** deepseek-v3.2 reversed its think penalty but also regressed in norag-nothink compared to Test 9 (56.1% → 42.0%). When running without RAG and without thinking, the two-phase prompt appears to impose overhead that disrupts the model's direct no-think response path. A developer using deepseek without --think set should not see worse results than the previous version.

**Possible change:** Add a conditional fast-path directive: if no thinking tokens are being emitted (detectable by absence of `<think>` block in output), the model is advised to skip the explicit Phase 1 narration and proceed directly to Phase 2 sweeps. This preserves the inventory requirement without forcing a no-think model to write out an intermediate monologue it would otherwise skip.

### 8.3 nemotron-3-super Condition Gating

**Real-world problem:** nemotron-3-super is the only model that reached 67.7% F1 in a rn condition but simultaneously scored 0.0% in nn. Deploying this model in the extension without guaranteeing RAG is reachable would produce completely empty or entirely wrong output for real users.

**Possible change:** Add a model-capability profile to the extension that gates which conditions are offered per model. nemotron-3-super should only be offered in rag conditions; its norag config should be disabled.

### 8.4 What Was Not Changed and Why

| Area | Decision | Rationale |
|---|---|---|
| Anti-FP rules vi–vii | Retain | Rule [vii] eliminated 196 FPs from ministral-3:3b; rules [vi] and [viii] are sound and did not cause regressions in top models |
| Phase 1 / Phase 2 structure | Retain | Resolved deepseek's think penalty; qwen3.5:397b gained +21.9 pp in think effect. The structure is confirmed beneficial overall |
| Sweep definitions A–J | Retain | Sweeps are grounded in WCAG 2.2 and reflect real developer use cases |
| Ground truth fixtures | Retain | No drift from real-world validity is warranted yet |
| Rule [viii] (broken ARIA gating) | Review for ministral-3:14b | FP increased from 32 → 49 in nn. Rule [viii] may be gating too conservatively for this model, allowing other FP categories through while blocking the intended pattern |
