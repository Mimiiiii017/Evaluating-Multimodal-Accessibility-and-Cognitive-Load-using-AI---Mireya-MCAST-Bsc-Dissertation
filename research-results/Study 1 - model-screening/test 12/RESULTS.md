# Cloud-LLM Preliminary Study — Test 12 Results

**Date:** 31 March – 1 April 2026  
**Scope:** HTML fixtures only (html-clean, html-low, html-medium, html-high) — 4 complexity tiers  
**Models tested:** 17 (3 removed from T11 roster: gemma3:4b, nemotron-3-nano:30b, devstral-2:123b)  
**Conditions:** 4 (RAG × Think factorial design)  
**Total LLM calls:** 272 (17 models × 4 fixtures × 4 conditions)

---

## 1. What Changed from Test 11

### 1.1 Benchmark Injection Bug Fixed — Anti-FP Rules Restored to Pre-Code Position

The core bug from Test 11 (§5.2): `benchmark-prompt.ts` was injecting `ANTI_FP_SUPPLEMENT` (rules vi–viii) by replacing the context label string. When the label moved after the HTML in Test 11, the anti-FP rules moved with it, rendering them ineffective as pre-task constraints.

**Fix:** The injection anchor was decoupled from the RAG label. A fixed marker is now placed at the end of the sweeps block in `prompt.ts`, guaranteeing rules vi–viii always appear before `CODE TO AUDIT` regardless of RAG position.

### 1.2 RAG Context Remains After the HTML

No change to RAG position from Test 11. Chunks continue to appear as `SUPPLEMENTARY WCAG GUIDANCE` after the HTML.

### 1.3 Prompt Changes (driven by Test 11 FN analysis)

Four targeted changes to sweep instructions, all written generically for real-world use:

| Change | Prompt Area | Target issue |
|---|---|---|
| Sweep H: in-page anchor `href="#id"` validation added | Sweep H | `faq-id-wrong-section` (87% miss rate in T11) |
| Sweep C: exhaustive `<img>` enumeration required | Sweep C | footer/late-document images (88% miss rate) |
| Explicit `<html lang>` checkpoint in Phase 1 | Phase 1 inventory | `html-lang-missing` (77% miss rate) |
| Sweep G: universal landmark/section label check | Sweep G | `logo-bar-aria-label` (100% miss rate) |

### 1.4 Model Roster

Three models removed from the active benchmark roster (from 20 down to 17):
- **gemma3:4b** — avg 13.6% F1 in T11, no signs of improvement across 3 tests
- **nemotron-3-nano:30b** — avg 17.3% F1, extreme instability (7.0% rt vs 31.7% rn in same test)
- **devstral-2:123b** — avg 18.7% F1, flat across all 3 tests

### 1.5 RAG Sweep H Query Updated

The `HTML_SWEEP_QUERIES[4]` in `benchmark.ts` now includes skip-link/anchor terms alongside the existing ARIA reference terms.

---

## 2. Results — All 4 Conditions

### 2.1 Condition Definitions

| Condition | RAG | Thinking (extended CoT) |
|---|---|---|
| `rag-think` (rt) | Yes | Yes |
| `rag-nothink` (rn) | Yes | No |
| `norag-nothink` (nn) | No | No |
| `norag-think` (nt) | No | Yes |

### 2.2 F1 Score Matrix (sorted by average across all 4 conditions)

| Model | rt | rn | nn | nt | **Best F1** | **Avg F1** |
|---|---|---|---|---|---|---|
| **gpt-oss:120b** | 42.8% | 72.7% | 70.2% | **74.2%** | **74.2%** | **65.0%** |
| **qwen3.5:397b** | 42.2% | 65.1% | 64.2% | **67.6%** | **67.6%** | **59.8%** |
| **kimi-k2.5** | **48.5%** | 47.0% | 48.3% | 43.1% | **48.5%** | **46.7%** |
| **qwen3-vl:235b** | 21.7% | 44.6% | **55.3%** | 53.5% | **55.3%** | **43.8%** |
| **glm-5** | 19.4% | **62.4%** | 39.1% | 39.8% | **62.4%** | **40.2%** |
| **deepseek-v3.2** | 35.0% | 36.2% | **51.8%** | 37.7% | **51.8%** | **40.2%** |
| **gemini-3-flash-preview** | 26.2% | 30.7% | 35.8% | **38.0%** | **38.0%** | **32.7%** |
| **mistral-large-3:675b** | **28.7%** | 23.5% | 29.9% | 31.9% | **31.9%** | **28.5%** |
| **ministral-3:3b** | **31.0%** | 19.1% | 33.3% | 28.7% | **33.3%** | **28.0%** |
| **qwen3-coder-next** | 25.8% | 21.5% | 13.4% | **46.7%** | **46.7%** | **26.9%** |
| **qwen3-coder:480b** | 26.0% | 24.9% | 27.3% | **27.8%** | **27.8%** | **26.5%** |
| **gpt-oss:20b** | 25.0% | 25.0% | 25.0% | 25.0% | **25.0%** | **25.0%** |
| **nemotron-3-super** | 26.6% | 25.1% | 12.0% | **31.7%** | **31.7%** | **23.9%** |
| **ministral-3:14b** | **27.1%** | 23.8% | 25.2% | 16.3% | **27.1%** | **23.1%** |
| **cogito-2.1:671b** | 19.0% | **29.6%** | 23.6% | 15.7% | **29.6%** | **22.0%** |
| **devstral-small-2:24b** | 21.1% | 16.8% | **24.0%** | 18.8% | **24.0%** | **20.2%** |
| **gemma3:27b** | 18.6% | **20.2%** | 19.7% | 18.4% | **20.2%** | **19.2%** |

### 2.3 Composite Score Matrix (80% F1 + 20% speed, sorted by average)

| Model | rt | rn | nn | nt | **Avg** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | 51.2% | **73.0%** | 68.0% | 70.3% | **65.6%** |
| **qwen3.5:397b** | 47.1% | **61.6%** | 58.7% | 54.2% | **55.4%** |
| **gemini-3-flash-preview** | 37.5% | **44.6%** | 48.6% | 43.7% | **43.6%** |
| **kimi-k2.5** | **48.8%** | 48.4% | 38.6% | 37.8% | **43.4%** |
| **deepseek-v3.2** | 28.0% | 42.6% | **49.7%** | 47.3% | **41.9%** |
| **qwen3-vl:235b** | 33.1% | 37.7% | **50.2%** | 43.4% | **41.1%** |
| **glm-5** | 31.0% | **56.8%** | 41.6% | 31.8% | **40.3%** |
| **mistral-large-3:675b** | **41.9%** | 37.4% | 42.1% | 44.3% | **41.4%** |
| **qwen3-coder-next** | 37.6% | 25.4% | 22.3% | **56.3%** | **35.4%** |
| **ministral-3:3b** | **41.5%** | 27.5% | 41.9% | 34.1% | **36.3%** |
| **cogito-2.1:671b** | 35.2% | **42.3%** | 28.3% | 32.6% | **34.6%** |
| **qwen3-coder:480b** | **36.9%** | 37.9% | 35.0% | 28.2% | **34.5%** |
| **devstral-small-2:24b** | **36.3%** | 32.2% | 38.3% | 30.7% | **34.4%** |
| **nemotron-3-super** | 36.0% | 32.0% | 24.0% | **41.0%** | **33.3%** |
| **gpt-oss:20b** | **36.3%** | 20.0% | 34.4% | 32.4% | **30.8%** |
| **gemma3:27b** | **33.0%** | 31.4% | 33.4% | 33.2% | **32.8%** |
| **ministral-3:14b** | **38.8%** | 29.2% | 35.4% | 19.4% | **30.7%** |

### 2.4 norag-nothink (nn) Detail

| Model | F1 | Precision | Recall | TP | FN | FP | Avg time |
|---|---|---|---|---|---|---|---|
| gpt-oss:120b | **70.2%** | 86.1% | 61.7% | 44 | 48 | 15 | 204 s |
| qwen3.5:397b | **64.2%** | 97.5% | 53.1% | 27 | 65 | 1 | 310 s |
| qwen3-vl:235b | **55.3%** | 100.0% | 44.6% | 19 | 73 | 0 | 341 s |
| deepseek-v3.2 | **51.8%** | 86.2% | 44.1% | 18 | 74 | 4 | 285 s |
| kimi-k2.5 | **48.3%** | 68.9% | 64.2% | 42 | 50 | 6 | 481 s |
| glm-5 | **39.1%** | 70.6% | 53.1% | 27 | 65 | 3 | 237 s |
| gemini-3-flash-preview | **35.8%** | 67.9% | 51.0% | 26 | 66 | 5 | 11 s |
| ministral-3:3b | **33.3%** | 48.1% | 64.4% | 38 | 54 | **60** | 123 s |
| mistral-large-3:675b | **29.9%** | 60.3% | 47.7% | 22 | 70 | 10 | 54 s |
| ministral-3:14b | **25.2%** | 75.0% | 40.6% | 15 | 77 | 3 | 122 s |
| gpt-oss:20b | **25.0%** | 100.0% | 25.0% | 0 | 92 | 0 | 142 s |
| qwen3-coder:480b | **27.3%** | 75.0% | 42.5% | 16 | 76 | 2 | 170 s |
| devstral-small-2:24b | **24.0%** | 72.7% | 39.8% | 16 | 76 | 2 | 33 s |
| cogito-2.1:671b | **23.6%** | 75.0% | 39.1% | 16 | 76 | 2 | 258 s |
| gemma3:27b | **19.7%** | 65.0% | 38.0% | 11 | 81 | 5 | 66 s |
| qwen3-coder-next | **13.4%** | 75.0% | 32.4% | 9 | 83 | 2 | 208 s |
| nemotron-3-super | **12.0%** | 71.9% | 31.7% | 9 | 83 | 4 | 144 s |

### 2.5 norag-think (nt) Detail

| Model | F1 | Precision | Recall | TP | FN | FP | Avg time |
|---|---|---|---|---|---|---|---|
| gpt-oss:120b | **74.2%** | 93.2% | 63.5% | 47 | 45 | 4 | 176 s |
| qwen3.5:397b | **67.6%** | 97.7% | 57.1% | 29 | 63 | 1 | 347 s |
| qwen3-coder-next | **46.7%** | 93.8% | 38.7% | 13 | 79 | 1 | 50 s |
| qwen3-vl:235b | **53.5%** | 89.3% | 45.1% | 20 | 72 | 3 | 339 s |
| kimi-k2.5 | **43.1%** | 69.0% | 57.2% | 40 | 52 | 8 | 298 s |
| glm-5 | **39.8%** | 75.0% | 53.3% | 28 | 64 | 1 | 350 s |
| gemini-3-flash-preview | **38.0%** | 75.0% | 53.0% | 24 | 68 | 1 | 138 s |
| deepseek-v3.2 | **37.7%** | 72.9% | 51.8% | 25 | 67 | 2 | 79 s |
| nemotron-3-super | **31.7%** | 54.4% | 52.8% | 43 | 49 | 38 | 101 s |
| mistral-large-3:675b | **31.9%** | 63.1% | 48.8% | 20 | 72 | 13 | 52 s |
| gpt-oss:20b | **25.0%** | 100.0% | 25.0% | 0 | 92 | 0 | 153 s |
| ministral-3:3b | **28.7%** | 55.8% | 48.5% | 23 | 69 | 15 | 173 s |
| cogito-2.1:671b | **15.7%** | 75.0% | 33.8% | 12 | 80 | 2 | 32 s |
| gemma3:27b | **18.4%** | 57.1% | 37.9% | 12 | 80 | 8 | 56 s |
| devstral-small-2:24b | **18.8%** | 68.8% | 36.9% | 10 | 82 | 3 | 101 s |
| qwen3-coder:480b | **27.8%** | 70.0% | 43.6% | 17 | 75 | 3 | 256 s |
| ministral-3:14b | **16.3%** | 49.4% | 52.1% | 18 | 74 | **80** | 249 s |

### 2.6 rag-nothink (rn) Detail

| Model | F1 | Precision | Recall | TP | FN | FP | Avg time |
|---|---|---|---|---|---|---|---|
| gpt-oss:120b | **72.7%** | 88.5% | 65.2% | 43 | 49 | 6 | 104 s |
| qwen3.5:397b | **65.1%** | 97.2% | 54.8% | 27 | 65 | 1 | 199 s |
| glm-5 | **62.4%** | 94.9% | 50.6% | 30 | 62 | 3 | 245 s |
| kimi-k2.5 | **47.0%** | 73.1% | 61.3% | 35 | 57 | 2 | 175 s |
| qwen3-vl:235b | **44.6%** | 100.0% | 36.9% | 10 | 82 | 0 | 334 s |
| deepseek-v3.2 | **36.2%** | 75.0% | 50.5% | 23 | 69 | 1 | 124 s |
| gemini-3-flash-preview | **30.7%** | 63.9% | 46.4% | 22 | 70 | 10 | 10 s |
| cogito-2.1:671b | **29.6%** | 70.0% | 46.2% | 16 | 76 | 2 | 34 s |
| qwen3-coder:480b | **24.9%** | 75.0% | 40.3% | 15 | 77 | 3 | 46 s |
| mistral-large-3:675b | **23.5%** | 60.8% | 40.5% | 16 | 76 | 8 | 35 s |
| gpt-oss:20b | **25.0%** | 100.0% | 25.0% | 0 | 92 | 0 | 370 s |
| devstral-small-2:24b | **16.8%** | 75.0% | 35.4% | 9 | 83 | 2 | 32 s |
| nemotron-3-super | **25.1%** | 61.4% | 42.1% | 25 | 67 | 25 | 156 s |
| gemma3:27b | **20.2%** | 57.3% | 40.9% | 10 | 82 | 12 | 94 s |
| ministral-3:14b | **23.8%** | 62.5% | 39.9% | 17 | 75 | 6 | 187 s |
| ministral-3:3b | **19.1%** | 75.0% | 36.1% | 16 | 76 | **62** | 150 s |
| qwen3-coder-next | **21.5%** | 75.0% | 38.9% | 10 | 82 | **27** | 221 s |

### 2.7 rag-think (rt) Detail

| Model | F1 | Precision | Recall | TP | FN | FP | Avg time |
|---|---|---|---|---|---|---|---|
| kimi-k2.5 | **48.5%** | 71.3% | 62.5% | 41 | 51 | 4 | 333 s |
| qwen3.5:397b | **42.2%** | 70.8% | 56.6% | 30 | 62 | 3 | 231 s |
| gpt-oss:120b | **42.8%** | 58.3% | 60.0% | 39 | 53 | 12 | 119 s |
| deepseek-v3.2 | **35.0%** | 73.9% | 52.8% | 28 | 64 | 4 | 641 s |
| mistral-large-3:675b | **28.7%** | 66.4% | 44.3% | 19 | 73 | 10 | 61 s |
| ministral-3:3b | **31.0%** | 60.3% | 48.0% | 33 | 59 | 34 | 127 s |
| ministral-3:14b | **27.1%** | 62.5% | 43.4% | 22 | 70 | 7 | 115 s |
| qwen3-coder-next | **25.8%** | 61.8% | 51.2% | 18 | 74 | 13 | 119 s |
| gemini-3-flash-preview | **26.2%** | 75.0% | 44.4% | 15 | 77 | 1 | 134 s |
| qwen3-coder:480b | **26.0%** | 75.0% | 41.7% | 15 | 77 | 2 | 146 s |
| devstral-small-2:24b | **21.1%** | 68.8% | 38.7% | 15 | 77 | 3 | 46 s |
| gpt-oss:20b | **25.0%** | 100.0% | 25.0% | 0 | 92 | 0 | 140 s |
| nemotron-3-super | **26.6%** | 62.8% | 44.2% | 26 | 66 | 10 | 190 s |
| cogito-2.1:671b | **19.0%** | 75.0% | 35.9% | 15 | 77 | 5 | 27 s |
| qwen3-vl:235b | **21.7%** | 75.0% | 37.8% | 14 | 78 | 22 | 159 s |
| gemma3:27b | **18.6%** | 57.1% | 38.3% | 11 | 81 | 11 | 85 s |
| glm-5 | **19.4%** | 70.3% | 37.3% | 20 | 72 | 4 | 166 s |

---

## 3. RAG and Think Analysis

### 3.1 RAG Effect (rn vs nn)

| Model | rn F1 | nn F1 | Δ | Verdict |
|---|---|---|---|---|
| glm-5 | 62.4% | 39.1% | **+23.3 pp** | RAG strongly helps |
| nemotron-3-super | 25.1% | 12.0% | **+13.1 pp** | RAG helps (but FP=25 in rn) |
| qwen3-coder-next | 21.5% | 13.4% | **+8.1 pp** | RAG mildly helps |
| qwen3.5:397b | 65.1% | 64.2% | +0.9 pp | Neutral |
| gpt-oss:20b | 25.0% | 25.0% | 0.0 pp | No effect |
| gemma3:27b | 20.2% | 19.7% | +0.5 pp | Neutral |
| cogito-2.1:671b | 29.6% | 23.6% | **+6.0 pp** | RAG helps |
| kimi-k2.5 | 47.0% | 48.3% | −1.3 pp | Neutral |
| ministral-3:14b | 23.8% | 25.2% | −1.4 pp | Neutral |
| qwen3-coder:480b | 24.9% | 27.3% | −2.4 pp | Neutral |
| gpt-oss:120b | 72.7% | 70.2% | +2.5 pp | Neutral-positive |
| gemini-3-flash-preview | 30.7% | 35.8% | **−5.1 pp** | RAG slightly hurts |
| mistral-large-3:675b | 23.5% | 29.9% | **−6.4 pp** | RAG hurts |
| devstral-small-2:24b | 16.8% | 24.0% | **−7.2 pp** | RAG hurts |
| qwen3-vl:235b | 44.6% | 55.3% | **−10.7 pp** | RAG hurts |
| ministral-3:3b | 19.1% | 33.3% | **−14.2 pp** | RAG hurts |
| deepseek-v3.2 | 36.2% | 51.8% | **−15.6 pp** | RAG hurts |

**Net RAG effect (no-think):** avg rn = 35.2%, avg nn = 35.7%, **Δ = −0.5 pp**  
(T11: −1.2 pp, T10: +1.3 pp, T9: −2.4 pp — consistently near-zero or negative on average; a subset of models benefit while the majority are penalised)

### 3.2 Think Effect (avg think F1 vs avg noThink F1)

| Model | Avg Think (rt+nt)/2 | Avg noThink (rn+nn)/2 | Δ | Verdict |
|---|---|---|---|---|
| qwen3-coder-next | 36.3% | 17.5% | **+18.8 pp** | Think strongly helps |
| kimi-k2.5 | 45.8% | 47.7% | −1.9 pp | Neutral |
| qwen3.5:397b | 54.9% | 64.7% | **−9.8 pp** | Think hurts |
| gpt-oss:120b | 58.5% | 71.5% | **−13.0 pp** | Think hurts |
| qwen3-vl:235b | 37.6% | 50.0% | **−12.4 pp** | Think hurts |
| deepseek-v3.2 | 36.4% | 44.0% | **−7.6 pp** | Think hurts |
| gemini-3-flash-preview | 32.1% | 33.3% | −1.2 pp | Neutral |
| glm-5 | 29.6% | 50.8% | **−21.2 pp** | Think heavily hurts |
| mistral-large-3:675b | 30.3% | 26.7% | +3.6 pp | Neutral-positive |
| nemotron-3-super | 29.2% | 18.6% | **+10.6 pp** | Think mildly helps |
| ministral-3:3b | 29.9% | 26.2% | +3.7 pp | Neutral |
| cogito-2.1:671b | 17.4% | 26.6% | **−9.2 pp** | Think hurts |
| devstral-small-2:24b | 20.0% | 20.4% | −0.4 pp | Neutral |
| gemma3:27b | 18.5% | 20.0% | −1.5 pp | Neutral |
| qwen3-coder:480b | 26.9% | 26.1% | +0.8 pp | Neutral |
| ministral-3:14b | 21.7% | 24.5% | −2.8 pp | Neutral |
| gpt-oss:20b | 25.0% | 25.0% | 0.0 pp | No effect |

### 3.3 Best Condition Per Model

| Model | Best condition | Best F1 | FP in best cond |
|---|---|---|---|
| gpt-oss:120b | norag-think | **74.2%** | 4 |
| qwen3.5:397b | norag-think | **67.6%** | 1 |
| glm-5 | rag-nothink | **62.4%** | 3 |
| qwen3-vl:235b | norag-nothink | **55.3%** | 0 |
| deepseek-v3.2 | norag-nothink | **51.8%** | 4 |
| kimi-k2.5 | rag-think | **48.5%** | 4 |
| qwen3-coder-next | norag-think | **46.7%** | 1 |
| gemini-3-flash-preview | norag-think | **38.0%** | 1 |
| nemotron-3-super | norag-think | **31.7%** | 38 |
| mistral-large-3:675b | norag-think | **31.9%** | 13 |
| ministral-3:3b | norag-nothink | **33.3%** | 60 |
| qwen3-coder:480b | norag-think | **27.8%** | 3 |
| cogito-2.1:671b | rag-nothink | **29.6%** | 2 |
| ministral-3:14b | rag-think | **27.1%** | 7 |
| gpt-oss:20b | any | **25.0%** | 0 (but 0 TP) |
| devstral-small-2:24b | norag-nothink | **24.0%** | 2 |
| gemma3:27b | rag-nothink | **20.2%** | 12 |

---

## 4. Key Findings

### 4.1 Anti-FP Injection Bug Fix: Partial Recovery

The injection bug fix had a clearly measurable effect on qwen3-coder-next and a significant but incomplete effect on ministral-3:3b:

| Model | T10 nn FP | T11 nn FP | T12 nn FP | Status |
|---|---|---|---|---|
| ministral-3:3b | 8 | 194 | **60** | Improved 68% from T11 — still above T10 baseline |
| qwen3-coder-next | 4 | 113 | **2** | Virtually fully restored to T10 levels |

qwen3-coder-next confirms the fix worked: FP collapsed from 113 to 2. The residual FP count for ministral-3:3b (60 in nn, 62 in rn) suggests the model has an inherent tendency to over-report that the rules partially suppress — in T10 it had only 8 FP, which was achieved under the same rules-before-HTML arrangement. It is possible that the expanded Sweep G and sweep H instructions (which ask the model to check more elements) are causing some additional spurious flags alongside the benefit in recall.

qwen3-coder-next's nt F1 jumped dramatically from 7.8% (T11) to 46.7% (T12) — the restored pre-code rules allowed the model to operate cleanly in think mode rather than being overwhelmed by hallucinations. This is the single largest per-model improvement in the test series.

### 4.2 glm-5 Regression — rt Condition Collapsed

glm-5 was the third-best model in T11 (avg F1 55.7%). In T12 it dropped to 40.2% avg, almost entirely driven by the rt condition collapsing from 60.5% to 19.4%:

| Condition | T11 F1 | T12 F1 | Δ |
|---|---|---|---|
| rag-nothink | 63.1% | **62.4%** | −0.7 pp |
| norag-think | 38.2% | **39.8%** | +1.6 pp |
| norag-nothink | 60.9% | 39.1% | **−21.8 pp** |
| rag-think | **60.5%** | 19.4% | **−41.1 pp** |

The rn and nt conditions are essentially unchanged. The nn and rt conditions collapsed. The rt collapse is larger than any single-model drop seen in the test series. The RAG think condition (longest prompt: rules + sweeps + code + RAG chunks + thinking) combined with the expanded sweep instructions in T12 appears to have exceeded what glm-5 can process coherently in think mode.

The nn collapse (−21.8 pp) is harder to explain — glm-5 should not have been affected by RAG in nn. The expanded Sweep G/H instructions appear to have confused this model in the noRAG no-think path compared to T11. The rn condition (also no-think but with RAG) remained stable.

### 4.3 nemotron-3-super nn Collapse

nemotron-3-super in nn collapsed from 55.5% (T11) to 12.0% (T12). The model only found 9 TP out of 92 expected with 4 FP. Given it found 28 TP in T11 nn, the expanded prompt instructions substantially degraded performance in the no-think no-RAG path. The nt condition is more stable (31.7%, FP=38).

This model now shows severe condition sensitivity across three consecutive tests — too unreliable for deployment:
- T11: nn=55.5%, nt=19.8%, rn=41.2%, rt=34.2%
- T12: nn=12.0%, nt=31.7%, rn=25.1%, rt=26.6%

### 4.4 deepseek-v3.2 Think Effect Reversed — /no_think Token Now Working

In T11, deepseek nt averaged 652 seconds — an anomalously long time consistent with the model ignoring the `/no_think` suffix and performing extended chain-of-thought regardless. F1 was 64.7%.

In T12, deepseek nt takes 79 seconds and F1 is 37.7%. This reversal (speed ×8 faster, F1 half as good) strongly suggests the `/no_think` flag now took effect in T12 — the model stopped thinking and produced faster but lower-quality output. The noRAG nn condition improved (40.2% → 51.8%) suggesting deepseek benefits from the new Phase 1 prompt instructions when not thinking.

### 4.5 ministral-3:14b nt — New FP Problem

ministral-3:14b developed a large FP count in the nt condition: FP=80 in T12 vs FP=16 in T11. This is a new regression with no clear trigger — the injection fix should have helped, not hurt. The expanded Sweep G universal landmark check may be causing the model to hallucinate landmark violations in think mode. The other conditions remain reasonable (nn FP=3, rn FP=6, rt FP=7).

### 4.6 gpt-oss:120b — Best F1 in Series

gpt-oss:120b achieved 74.2% F1 in the nt condition — the highest single-condition F1 recorded in the entire test series (T9–T12). The rn and nn conditions also improved vs T11:

| Condition | T11 F1 | T12 F1 | Δ |
|---|---|---|---|
| norag-think | 65.1% | **74.2%** | **+9.1 pp** |
| rag-nothink | 59.2% | **72.7%** | **+13.5 pp** |
| norag-nothink | 67.7% | **70.2%** | **+2.5 pp** |
| rag-think | 40.0% | 42.8% | +2.8 pp |

Three of four conditions improved. The rt condition remains the weak point but also recovered slightly. The anti-FP fix (FP: nn 15 vs T11's 3 — actually slightly worse here), combined with the prompt improvements, drove this model to its best performance.

### 4.7 Prompt Changes — FN Impact

Comparing missed concept counts between T11 nn and T12 nn (cleanest condition, max 17×4=68 possible misses given 17 models across 4 fixtures where each concept is testable):

| Issue concept | T11 nn miss | T12 nn miss | Δ | Prompt change |
|---|---|---|---|---|
| `faq-id-wrong-section` | 52 | 41 | **−11** | Sweep H skip-link check |
| `html-lang-missing` | 46 | 39 | **−7** | Phase 1 explicit checkpoint |
| `logo-bar-aria-label` | 40 | 34 | **−6** | Sweep G universal check |
| `table-caption-missing` | 40 | 34 | **−6** | (no direct change) |
| `footer-logo-alt-missing` | 53 | 46 | **−7** | Sweep C exhaustive enumeration |
| `hero-img-alt-missing` | 38 | 34 | **−4** | Sweep C |
| `search-label-missing` | 38 | 32 | **−6** | (indirect benefit) |
| `partner-logo-alt` | 36 | 31 | **−5** | Sweep C |
| `contrast-studio-link` | 39 | 31 | **−8** | (indirect benefit) |

All targeted issues improved. The improvements are moderate (4–11 fewer misses per concept) rather than dramatic — the issues are genuinely difficult cross-document checks and single-sentence additions to a long prompt cannot fully bridge the gap. `footer-logo-alt-missing` remains the most-missed concept (46/68 possible misses), indicating late-document enumeration is still a structural challenge.

---

## 5. F1 Score Comparison: Test 11 vs Test 12

| Model | T11 rt | T12 rt | T11 rn | T12 rn | T11 nn | T12 nn | T11 nt | T12 nt | **Avg Δ** |
|---|---|---|---|---|---|---|---|---|---|
| **qwen3-coder-next** | 11.1% | 25.8% | 14.6% | 21.5% | 8.4% | 13.4% | 7.8% | **46.7%** | **+16.4 pp** |
| **gpt-oss:120b** | 40.0% | 42.8% | 59.2% | **72.7%** | 67.7% | **70.2%** | 65.1% | **74.2%** | **+7.0 pp** |
| **kimi-k2.5** | 45.7% | **48.5%** | 29.9% | **47.0%** | 44.1% | **48.3%** | 37.1% | **43.1%** | **+7.5 pp** |
| **qwen3-vl:235b** | 23.4% | 21.7% | 40.1% | **44.6%** | 28.7% | **55.3%** | 56.3% | 53.5% | **+6.7 pp** |
| **qwen3-coder:480b** | 22.1% | **26.0%** | 23.7% | **24.9%** | 20.7% | **27.3%** | 16.1% | **27.8%** | **+5.8 pp** |
| **ministral-3:3b** | 31.7% | 31.0% | 30.7% | 19.1% | 23.4% | **33.3%** | 17.5% | **28.7%** | **+2.2 pp** |
| **ministral-3:14b** | 23.3% | **27.1%** | 24.3% | 23.8% | 22.5% | **25.2%** | 19.0% | 16.3% | **+0.9 pp** |
| **gpt-oss:20b** | 25.0% | 25.0% | 25.0% | 25.0% | 25.0% | 25.0% | 25.0% | 25.0% | **0.0 pp** |
| **cogito-2.1:671b** | 27.3% | 19.0% | 26.8% | **29.6%** | 28.2% | 23.6% | 23.1% | 15.7% | **−4.4 pp** |
| **gemma3:27b** | 19.9% | 18.6% | 17.2% | **20.2%** | 29.4% | 19.7% | 27.4% | 18.4% | **−4.3 pp** |
| **devstral-small-2:24b** | 19.2% | **21.1%** | 14.1% | 16.8% | 28.2% | 24.0% | 29.9% | 18.8% | **−2.7 pp** |
| **mistral-large-3:675b** | 36.8% | 28.7% | 25.6% | 23.5% | 30.2% | **29.9%** | 28.6% | **31.9%** | **−1.7 pp** |
| **qwen3.5:397b** | 60.8% | 42.2% | 65.2% | 65.1% | 59.3% | **64.2%** | 60.0% | **67.6%** | **−1.5 pp** |
| **deepseek-v3.2** | 52.7% | 35.0% | 36.8% | 36.2% | 40.2% | **51.8%** | 64.7% | 37.7% | **−8.4 pp** |
| **gemini-3-flash-preview** | **64.3%** | 26.2% | 34.7% | 30.7% | 27.8% | **35.8%** | 38.9% | **38.0%** | **−8.7 pp** |
| **nemotron-3-super** | 34.2% | 26.6% | 41.2% | 25.1% | 55.5% | 12.0% | 19.8% | **31.7%** | **−13.7 pp** |
| **glm-5** | **60.5%** | 19.4% | **63.1%** | 62.4% | **60.9%** | 39.1% | 38.2% | 39.8% | **−15.5 pp** |

---

## 6. Model Status Summary

### Performing well and stable

| Model | Best F1 (T12) | Avg F1 (T12) | T9–T12 trend | Notes |
|---|---|---|---|---|
| **gpt-oss:120b** | 74.2% (nt) | 65.0% | 🔼 Improving | Best single-condition F1 in series; rn also strong (72.7%) |
| **qwen3.5:397b** | 67.6% (nt) | 59.8% | 🔼 Stable-high | Consistent across 3/4 conditions; rt remains weak |
| **kimi-k2.5** | 48.5% (rt) | 46.7% | 🔼 Improving | Most consistent improvement across all 3 tests |
| **qwen3-vl:235b** | 55.3% (nn) | 43.8% | 🔼 Recovering | Recovered strongly from T11 regression |

### Deteriorating or newly problematic

| Model | Best F1 (T12) | Avg F1 (T12) | Issue |
|---|---|---|---|
| **glm-5** | 62.4% (rn) | 40.2% | rt and nn collapsed; prompt-length sensitive in think mode |
| **nemotron-3-super** | 31.7% (nt) | 23.9% | nn collapsed from 55.5% to 12.0%; severe condition instability continues |
| **deepseek-v3.2** | 51.8% (nn) | 40.2% | nt condition dropped 27 pp (think now suppressed); overall −8.4 pp |
| **gemini-3-flash-preview** | 38.0% (nt) | 32.7% | rt collapsed again (26.2%); best was 64.3% in T11 rt |
| **ministral-3:14b** | 27.1% (rt) | 23.1% | FP=80 in nt condition — new hallucination pattern in think mode |

### Structurally stuck

| Model | Avg F1 | Pattern |
|---|---|---|
| **gpt-oss:20b** | 25.0% | 0 TP in all conditions all tests — refuses to flag issues |
| **gemma3:27b** | 19.2% | Flat across 4 tests; no condition or prompt change moves it |
| **devstral-small-2:24b** | 20.2% | Slight T12 regression; no pathway to improvement |
| **cogito-2.1:671b** | 22.0% | T12 decline; fast but low quality |

---

## 7. What to Change for Test 13

> **Design constraint reminder:** All prompt changes must apply to any HTML document. No fixture-specific element names, page structures, or content types.

### 7.1 ministral-3:14b nt FP=80 — Investigate Sweep G

The expanded Sweep G universal landmark check is the most likely cause of the new hallucination pattern in ministral-3:14b think mode. Landmark labelling for every `<section>` may cause small models to flag every unlabelled section as a violation regardless of context. The instruction should include a qualification:

> *"Only flag a missing `aria-label`/`aria-labelledby` if there are two or more elements of the **same type** present — a single `<nav>` or `<section>` does not require a label to distinguish it."*

This limits landmark label reports to genuinely ambiguous multi-instance cases rather than every element, which is the correct WCAG interpretation (WCAG 2.4.1 doesn't require labels on unique landmarks).

### 7.2 glm-5 rt + nn Collapse — Monitor, No Prompt Change

The glm-5 regression in rt (−41.1 pp) and nn (−21.8 pp) is severe. However, given the rn and nt conditions are stable, the most likely explanation is prompt-length sensitivity specific to the think+RAG combination. No prompt change can selectively address one model's behaviour. If the issue persists in Test 13 after §7.1 (shorter Sweep G), it may indicate glm-5 should be dropped from the active roster.

### 7.3 ministral-3:3b Persistent FP — Consider Roster Drop

ministral-3:3b has FP=60 in nn and FP=62 in rn across three tests. In the best case (T10) it had FP=8, but that was under the original pre-code injection. The model consistently over-reports and the F1 ceiling is constrained by precision (48.1% nn). Given its avg F1 of 28.0% and persistent FP problem, dropping this model from Test 13 is worth considering.

### 7.4 deepseek-v3.2 Think Flag — Confirm Behaviour Change

The dramatic nt condition change (652s→79s, F1 64.7%→37.7%) warrants verification. If the `/no_think` token now reliably suppresses deepseek's CoT, then the nt condition is not a fair comparison to earlier tests. Test 13 should note whether the response text includes `<think>` blocks to confirm the token is or is not being respected.

### 7.5 gpt-oss:120b rt Weakness — Accept and Route Around

gpt-oss:120b's rt condition has been weak across all tests (T11: 40.0%, T12: 42.8%). The noRAG-think condition delivers the best results consistently. For the purposes of the main study, gpt-oss:120b should be tested in the nt condition only to avoid wasting budget on rt.

### 7.6 Summary

| Change | Type | Section |
|---|---|---|
| Qualify Sweep G: only flag if multiple same-type landmarks exist | Prompt fix | §7.1 |
| Monitor glm-5; drop if rt+nn collapse persists | Roster watch | §7.2 |
| Consider dropping ministral-3:3b (chronic FP) | Roster watch | §7.3 |
| Confirm deepseek-v3.2 `/no_think` behaviour | Diagnostic | §7.4 |
| Route gpt-oss:120b to nt only in full study | Study design | §7.5 |
