# Cloud-LLM Preliminary Study — Test 11 Results

**Date:** 30–31 March 2026  
**Scope:** HTML fixtures only (html-clean, html-low, html-medium, html-high) — 4 complexity tiers  
**Models tested:** 20 cloud LLMs (minimax excluded — HTTP 500 confirmed broken)  
**Conditions:** 4 (RAG × Think factorial design)  
**Total LLM calls:** 320 (20 models × 4 fixtures × 4 conditions)

---

## 1. What Changed from Test 10

### 1.1 RAG Context Moved to After the HTML Document

The single prompt layout change tested in Test 11: the retrieved WCAG guidance block moved from **before** the HTML to **after** it.

**Test 10 prompt order:**
```
[Rules + Sweeps A–J]
WCAG REFERENCE CONTEXT: [chunks]
CODE TO AUDIT: [HTML]
```

**Test 11 prompt order:**
```
[Rules + Sweeps A–J]
CODE TO AUDIT: [HTML]
SUPPLEMENTARY WCAG GUIDANCE (retrieved — consult after reading the code above): [chunks]
```

The hypothesis: models process the HTML cold during Phase 1 inventory without retrieved chunks anchoring their attention to specific topics, then reference supplementary chunks during Phase 2 sweeps.

### 1.2 Unintended Side Effect in Benchmark Injection

A consequence of the label rename: the `benchmark-prompt.ts` injection mechanism, which replaces the context label string to insert `ANTI_FP_SUPPLEMENT` and `HTML_MANDATORY_SWEEPS`, now injects these blocks **after the HTML** rather than before it. In Test 10 they appeared before the code; in Test 11 they appear after.

This is a structural bug in the benchmark wrapper — the anti-FP rules (vi, vii, viii) are less effective when a model sees them after already processing the code. This likely explains the FP regressions observed (see §5.2).

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
| **qwen3.5:397b** | 60.8% | **65.2%** | 59.3% | 60.0% | **65.2%** | **61.3%** |
| **gpt-oss:120b** | 40.0% | 59.2% | **67.7%** | 65.1% | **67.7%** | **58.0%** |
| **glm-5** | 60.5% | **63.1%** | 60.9% | 38.2% | **63.1%** | **55.7%** |
| **deepseek-v3.2** | 52.7% | 36.8% | 40.2% | **64.7%** | **64.7%** | **48.6%** |
| **gemini-3-flash-preview** | **64.3%** | 34.7% | 27.8% | 38.9% | **64.3%** | **41.4%** |
| **kimi-k2.5** | **45.7%** | 29.9% | 44.1% | 37.1% | **45.7%** | **39.2%** |
| **nemotron-3-super** | 34.2% | 41.2% | **55.5%** | 19.8% | **55.5%** | **37.7%** |
| **qwen3-vl:235b** | 23.4% | 40.1% | 28.7% | **56.3%** | **56.3%** | **37.1%** |
| **mistral-large-3:675b** | **36.8%** | 25.6% | 30.2% | 28.6% | **36.8%** | **30.3%** |
| **cogito-2.1:671b** | **27.3%** | 26.8% | 28.2% | 23.1% | **28.2%** | **26.4%** |
| **ministral-3:3b** | **31.7%** | 30.7% | 23.4% | 17.5% | **31.7%** | **25.8%** |
| **gpt-oss:20b** | 25.0% | 25.0% | 25.0% | 25.0% | **25.0%** | **25.0%** |
| **gemma3:27b** | 19.9% | 17.2% | **29.4%** | 27.4% | **29.4%** | **23.5%** |
| **devstral-small-2:24b** | 19.2% | 14.1% | 28.2% | **29.9%** | **29.9%** | **22.9%** |
| **ministral-3:14b** | **23.3%** | 24.3% | 22.5% | 19.0% | **24.3%** | **22.3%** |
| **qwen3-coder:480b** | 22.1% | **23.7%** | 20.7% | 16.1% | **23.7%** | **20.7%** |
| **devstral-2:123b** | 16.7% | 12.6% | **23.9%** | 21.7% | **23.9%** | **18.7%** |
| **nemotron-3-nano:30b** | 7.0% | **31.7%** | 14.9% | 15.5% | **31.7%** | **17.3%** |
| **gemma3:4b** | 15.9% | **16.2%** | 17.0% | 5.3% | **17.0%** | **13.6%** |
| **qwen3-coder-next** | 11.1% | **14.6%** | 8.4% | 7.8% | **14.6%** | **10.5%** |

### 2.3 Composite Score Matrix (80% F1 + 20% speed, sorted by average)

| Model | rt | rn | nn | nt | **Avg** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | 48.9% | 64.4% | **67.6%** | 68.3% | **62.3%** |
| **qwen3.5:397b** | 60.6% | **61.6%** | 53.1% | 60.5% | **59.0%** |
| **glm-5** | 60.6% | **65.2%** | 48.7% | 41.1% | **53.9%** |
| **gemini-3-flash-preview** | **66.0%** | 47.8% | 42.3% | 48.1% | **51.1%** |
| **nemotron-3-super** | 45.1% | 52.7% | **64.2%** | 34.7% | **49.2%** |
| **deepseek-v3.2** | 42.2% | 42.1% | 41.4% | **51.8%** | **44.4%** |
| **mistral-large-3:675b** | **48.9%** | 39.1% | 42.3% | 42.1% | **43.1%** |
| **kimi-k2.5** | **48.0%** | 33.2% | 37.4% | 44.0% | **40.7%** |
| **cogito-2.1:671b** | **41.8%** | 40.7% | 41.6% | 38.5% | **40.7%** |
| **qwen3-vl:235b** | 27.3% | 32.1% | 36.0% | **55.2%** | **37.7%** |
| **ministral-3:3b** | **40.8%** | 40.0% | 35.0% | 30.9% | **36.7%** |
| **gemma3:27b** | 33.2% | 30.6% | **40.6%** | 40.1% | **36.1%** |
| **gpt-oss:20b** | 34.6% | 35.4% | 34.4% | **36.7%** | **35.3%** |
| **devstral-2:123b** | 32.0% | 28.0% | **38.6%** | 36.1% | **33.7%** |
| **qwen3-coder:480b** | **36.9%** | 36.4% | 28.3% | 31.2% | **33.2%** |
| **devstral-small-2:24b** | 26.4% | 24.4% | 39.2% | **39.5%** | **32.4%** |
| **ministral-3:14b** | 32.9% | **32.9%** | 29.3% | 29.1% | **31.1%** |
| **nemotron-3-nano:30b** | 19.3% | **40.3%** | 26.2% | 28.9% | **28.7%** |
| **gemma3:4b** | 23.8% | **30.4%** | 28.5% | 23.0% | **26.4%** |
| **qwen3-coder-next** | 13.2% | 21.3% | **25.4%** | 20.4% | **20.1%** |

### 2.4 norag-nothink (nn) Detail

| Model | F1 | Precision | Recall | TP | FN | FP | Avg time |
|---|---|---|---|---|---|---|---|
| gpt-oss:120b | **67.7%** | 95.8% | 58.5% | 30 | 62 | 3 | 156 s |
| glm-5 | **60.9%** | 98.2% | 49.5% | 25 | 67 | 1 | 455 s |
| qwen3.5:397b | **59.3%** | 94.7% | 48.7% | 22 | 70 | 2 | 329 s |
| nemotron-3-super | **55.5%** | 66.8% | 49.2% | 28 | 64 | 31 | 15 s |
| kimi-k2.5 | **44.1%** | 73.1% | 59.6% | 30 | 62 | 2 | 406 s |
| deepseek-v3.2 | **40.2%** | 75.0% | 53.6% | 28 | 64 | 2 | 250 s |
| gemma3:27b | **29.4%** | 65.6% | 46.9% | 19 | 73 | 9 | 75 s |
| qwen3-vl:235b | **28.7%** | 75.0% | 43.4% | 18 | 74 | 1 | 167 s |
| cogito-2.1:671b | **28.2%** | 70.8% | 44.8% | 16 | 76 | 4 | 33 s |
| devstral-small-2:24b | **28.2%** | 71.4% | 43.3% | 17 | 75 | 9 | 86 s |
| gemini-3-flash-preview | **27.8%** | 56.0% | 45.9% | 19 | 73 | 11 | 11 s |
| gpt-oss:20b | **25.0%** | 100.0% | 25.0% | 0 | 92 | 0 | 135 s |
| devstral-2:123b | **23.9%** | 68.8% | 40.1% | 16 | 76 | 2 | 22 s |
| ministral-3:3b | **23.4%** | 34.2% | 65.5% | 39 | 53 | **194** | 93 s |
| ministral-3:14b | **22.5%** | 68.8% | 39.2% | 14 | 78 | 3 | 204 s |
| qwen3-coder:480b | **20.7%** | 66.7% | 37.5% | 14 | 78 | 4 | 193 s |
| gemma3:4b | **17.0%** | 34.1% | 39.7% | 13 | 79 | 22 | 125 s |
| nemotron-3-nano:30b | **14.9%** | 70.0% | 35.8% | 5 | 87 | 3 | 137 s |
| qwen3-coder-next | **8.4%** | 51.7% | 42.9% | 10 | 82 | **113** | 41 s |

### 2.5 norag-think (nt) Detail

| Model | F1 | Precision | Recall | TP | FN | FP | Avg time |
|---|---|---|---|---|---|---|---|
| gpt-oss:120b | **65.1%** | 87.7% | 56.0% | 37 | 55 | 6 | 154 s |
| deepseek-v3.2 | **64.7%** | 100.0% | 54.3% | 26 | 66 | 0 | 652 s |
| qwen3.5:397b | **60.0%** | 95.0% | 49.0% | 24 | 68 | 2 | 271 s |
| qwen3-vl:235b | **56.3%** | 100.0% | 45.4% | 20 | 72 | 0 | 340 s |
| kimi-k2.5 | **37.1%** | 69.4% | 57.0% | 25 | 67 | 4 | 214 s |
| glm-5 | **38.2%** | 71.4% | 52.3% | 26 | 66 | 4 | 331 s |
| gemini-3-flash-preview | **38.9%** | 75.0% | 55.1% | 24 | 68 | 1 | 134 s |
| gemma3:27b | **27.4%** | 66.9% | 43.3% | 17 | 75 | 7 | 96 s |
| devstral-small-2:24b | **29.9%** | 67.7% | 46.1% | 18 | 74 | 3 | 173 s |
| gpt-oss:20b | **25.0%** | 100.0% | 25.0% | 0 | 92 | 0 | 142 s |
| cogito-2.1:671b | **23.1%** | 63.5% | 40.1% | 14 | 78 | 7 | 39 s |
| mistral-large-3:675b | **28.6%** | 60.6% | 46.3% | 19 | 73 | 13 | 64 s |
| devstral-2:123b | **21.7%** | 75.0% | 38.2% | 12 | 80 | 1 | 79 s |
| ministral-3:14b | **19.0%** | 68.8% | 37.1% | 11 | 81 | 16 | 226 s |
| nemotron-3-super | **19.8%** | 63.7% | 42.0% | 30 | 62 | 30 | 76 s |
| ministral-3:3b | **17.5%** | 35.6% | 51.1% | 23 | 69 | **141** | 135 s |
| qwen3-coder:480b | **16.1%** | 58.3% | 34.5% | 12 | 80 | 4 | 90 s |
| nemotron-3-nano:30b | **15.5%** | 75.0% | 34.6% | 6 | 86 | 1 | 147 s |
| gemma3:4b | **5.3%** | 57.8% | 29.0% | 5 | 87 | 20 | 78 s |
| qwen3-coder-next | **7.8%** | 52.8% | 30.3% | 6 | 86 | 10 | 220 s |

---

## 3. RAG Analysis

### 3.1 RAG Effect — no-think condition (rn F1 vs nn F1)

| Model | rn F1 | nn F1 | Δ | Verdict |
|---|---|---|---|---|
| nemotron-3-nano:30b | 31.7% | 14.9% | **+16.8 pp** | RAG strongly helps |
| qwen3-vl:235b | 40.1% | 28.7% | **+11.4 pp** | RAG helps |
| ministral-3:3b | 30.7% | 23.4% | **+7.3 pp** | RAG helps (but FP=59 in rn) |
| gemini-3-flash-preview | 34.7% | 27.8% | **+6.9 pp** | RAG mildly helps |
| qwen3.5:397b | 65.2% | 59.3% | **+5.9 pp** | RAG mildly helps |
| deepseek-v3.2 | 36.8% | 40.2% | −3.4 pp | Neutral-negative |
| qwen3-coder:480b | 23.7% | 20.7% | +3.0 pp | Neutral |
| gpt-oss:20b | 25.0% | 25.0% | 0.0 pp | No effect |
| glm-5 | 63.1% | 60.9% | +2.2 pp | Neutral |
| ministral-3:14b | 24.3% | 22.5% | +1.8 pp | Neutral |
| devstral-small-2:24b | 14.1% | 28.2% | −14.1 pp | RAG hurts |
| devstral-2:123b | 12.6% | 23.9% | **−11.3 pp** | RAG hurts |
| gemma3:27b | 17.2% | 29.4% | **−12.2 pp** | RAG hurts |
| kimi-k2.5 | 29.9% | 44.1% | **−14.2 pp** | RAG hurts |
| nemotron-3-super | 41.2% | 55.5% | **−14.3 pp** | RAG hurts |
| cogito-2.1:671b | 26.8% | 28.2% | −1.4 pp | Neutral-negative |
| mistral-large-3:675b | 25.6% | 30.2% | −4.6 pp | RAG slightly hurts |
| gpt-oss:120b | 59.2% | 67.7% | **−8.5 pp** | RAG hurts |
| gemma3:4b | 16.2% | 17.0% | −0.8 pp | Neutral |
| qwen3-coder-next | 14.6% | 8.4% | +6.2 pp | Mildly helps (both very low) |

**Net RAG effect (no-think):** avg rn = 31.6%, avg nn = 32.8%, **Δ = −1.2 pp**  
(T10 was +1.3 pp, T9 was −2.4 pp — remains negative for most frontier models, now more models penalised)

### 3.2 Think (CoT) Effect

| Model | Avg Think F1 | Avg noThink F1 | Δ | Verdict |
|---|---|---|---|---|
| gemini-3-flash-preview | 51.6% | 31.3% | **+20.3 pp** | Think strongly helps |
| deepseek-v3.2 | 58.7% | 38.5% | **+20.2 pp** | Think strongly helps |
| qwen3-vl:235b | 39.9% | 34.4% | **+5.5 pp** | Think mildly helps |
| qwen3.5:397b | 60.4% | 62.3% | −1.9 pp | Neutral |
| gpt-oss:120b | 52.6% | 63.5% | **−10.9 pp** | Think hurts |
| glm-5 | 49.4% | 62.0% | **−12.6 pp** | Think hurts |
| kimi-k2.5 | 41.4% | 37.0% | +4.4 pp | Mildly helps |
| mistral-large-3:675b | 32.7% | 27.9% | +4.8 pp | Mildly helps |
| cogito-2.1:671b | 25.2% | 27.5% | −2.3 pp | Neutral |
| devstral-small-2:24b | 24.6% | 21.2% | +3.4 pp | Neutral |
| devstral-2:123b | 19.2% | 18.3% | +0.9 pp | Neutral |
| gemma3:27b | 23.7% | 23.3% | +0.4 pp | Neutral |
| ministral-3:14b | 21.2% | 23.4% | −2.2 pp | Neutral |
| qwen3-coder:480b | 19.1% | 22.2% | −3.1 pp | Neutral-negative |
| nemotron-3-super | 27.0% | 48.4% | **−21.4 pp** | Think clearly hurts |
| ministral-3:3b | 24.6% | 27.1% | −2.5 pp | Neutral |
| nemotron-3-nano:30b | 11.3% | 23.3% | **−12.0 pp** | Think hurts |
| gemma3:4b | 10.6% | 16.6% | **−6.0 pp** | Think hurts |
| gpt-oss:20b | 25.0% | 25.0% | 0.0 pp | No effect |
| qwen3-coder-next | 9.5% | 11.5% | −2.0 pp | Neutral |

### 3.3 Best Condition Per Model

| Model | Best condition | Best F1 |
|---|---|---|
| qwen3.5:397b | rag-nothink | 65.2% (0 FP) |
| gpt-oss:120b | norag-nothink | 67.7% |
| gemini-3-flash-preview | rag-think | 64.3% (0 FP) |
| deepseek-v3.2 | norag-think | 64.7% (0 FP) |
| glm-5 | rag-nothink | 63.1% |
| qwen3-vl:235b | norag-think | 56.3% (0 FP) |
| nemotron-3-super | norag-nothink | 55.5% (FP=31) |
| kimi-k2.5 | rag-think | 45.7% |
| mistral-large-3:675b | rag-think | 36.8% |
| nemotron-3-nano:30b | rag-nothink | 31.7% |
| ministral-3:3b | rag-think | 31.7% (FP=67) |
| cogito-2.1:671b | norag-nothink | 28.2% |
| devstral-small-2:24b | norag-think | 29.9% |
| gemma3:27b | norag-nothink | 29.4% |
| gpt-oss:20b | any | 25.0% (0 TP in all conditions) |
| ministral-3:14b | rag-nothink | 24.3% |
| qwen3-coder:480b | rag-nothink | 23.7% |
| devstral-2:123b | norag-nothink | 23.9% |
| gemma3:4b | rag-nothink | 16.2% (all below 17%) |
| qwen3-coder-next | rag-nothink | 14.6% |

---

## 4. Small vs Large Model Analysis

| Tier | Models | Best F1 (best condition) | Avg F1 across conditions |
|---|---|---|---|
| ≤5 B | gemma3:4b, ministral-3:3b | 31.7% (3b rt, FP=67) | 19.7% |
| 5–30 B | gpt-oss:20b, devstral-small-2:24b, gemma3:27b, nemotron-3-nano:30b | 31.7% (nano rn) | 22.2% |
| 30–200 B | ministral-3:14b, devstral-2:123b, gpt-oss:120b, nemotron-3-super | **67.7%** (gpt-oss:120b nn) | **35.9%** |
| >200 B (non-MoE) | qwen3-vl:235b, qwen3.5:397b, qwen3-coder:480b, qwen3-coder-next | 65.2% (qwen3.5 rn) | 33.4% |
| >200 B (MoE / frontier) | kimi-k2.5, deepseek-v3.2, cogito-2.1:671b, mistral-large-3:675b, glm-5, gemini-3-flash-preview | **64.7%** (deepseek nt) | **39.4%** |

**Finding:** The MoE/frontier tier continues to improve test-over-test (T9: 37.2%, T10: 40.3%, T11: 39.4%). `qwen3.5:397b` remains the highest avg F1 overall (61.3%), consistent across all 4 conditions (59–65% range). `gpt-oss:120b` remains the strongest single-condition performer (67.7% nn) but shows more variance across conditions.

---

## 5. Key Findings

### 5.1 RAG Position Change: Winners and Losers

The hypothesis that moving chunks to after the HTML would help frontier models was **partially confirmed**:

| Model | T10 rt | T11 rt | Δ rt | T10 rn | T11 rn | Δ rn | Net verdict |
|---|---|---|---|---|---|---|---|
| gemini-3-flash-preview | 26.9% | **64.3%** | **+37.4 pp** | 31.1% | 34.7% | +3.6 pp | **Strong winner** |
| glm-5 | 38.1% | **60.5%** | **+22.4 pp** | 38.8% | **63.1%** | **+24.3 pp** | **Strong winner** |
| qwen3.5:397b | 58.4% | 60.8% | +2.4 pp | 40.3% | **65.2%** | **+24.9 pp** | **Winner (rn)** |
| gpt-oss:120b | **70.2%** | 40.0% | **−30.2 pp** | 47.3% | 59.2% | +11.9 pp | Mixed (rt collapsed) |
| deepseek-v3.2 | **69.6%** | 52.7% | **−16.9 pp** | 48.5% | 36.8% | −11.7 pp | **Loser** |
| kimi-k2.5 | 46.0% | 45.7% | −0.3 pp | 41.4% | 29.9% | **−11.5 pp** | Loser (rn) |
| qwen3-vl:235b | 50.3% | 23.4% | **−26.9 pp** | 55.4% | 40.1% | **−15.3 pp** | **Strong loser** |

Models that gained: gemini-3-flash-preview, glm-5, qwen3.5:397b (rn) — these models appear to perform better when they read the HTML without pre-primed chunks anchoring their attention.

Models that lost: gpt-oss:120b (rt), deepseek-v3.2 (both), qwen3-vl:235b (both) — these models may have relied on the chunk context appearing before the code as an attention anchor in long-context processing.

### 5.2 Anti-FP Rule Regression — Benchmark Injection Bug

The benchmark prompt wrapper (`benchmark-prompt.ts`) injects `ANTI_FP_SUPPLEMENT` (rules vi–viii) by replacing the context label string. When the label moved to after the HTML, the injection point also moved. **Rules vi–viii now appear after the HTML rather than before it**, reducing their effectiveness as pre-task constraints.

| Model | T10 nn FP | T11 nn FP | Regression |
|---|---|---|---|
| ministral-3:3b | 8 | **194** | +186 (back to T9 levels) |
| qwen3-coder-next | 4 | **113** | +109 |

Rule [vii] (autocomplete exclusions) that eliminated 196 FPs from ministral-3:3b in Test 10 is being ignored again because the model has already processed the code before seeing the rule. The anti-FP rules must be before the HTML to function as pre-task constraints.

This is a prompt architecture bug, not a model failure. The fix is to decouple the `ANTI_FP_SUPPLEMENT` injection from the context label replacement, anchoring it to a position before the `CODE TO AUDIT` block.

### 5.3 deepseek-v3.2 RAG Regression

deepseek reversed its Test 10 gains in both RAG conditions:

| | T10 rt | T11 rt | T10 rn | T11 rn |
|---|---|---|---|---|
| deepseek-v3.2 | 69.6% | 52.7% | 48.5% | 36.8% |

Both conditions regressed despite the noRAG conditions remaining reasonable (40.2% nn, 64.7% nt). This suggests deepseek benefits from reading the code before the chunks in the noRAG-think path (which is now effectively a clean read), but loses performance when the chunks appear at the end of a long RAG prompt — the model may be discarding late-position context in favour of its own internal analysis that it has already committed to.

### 5.4 nemotron-3-super Still Medically Condition-Dependent

| Condition | F1 | FP |
|---|---|---|
| norag-nothink | 55.5% | 31 |
| norag-think | 19.8% | 30 |
| rag-nothink | 41.2% | 10 |
| rag-think | 34.2% | 66 |

nemotron-3-super recovered from its T10 nn collapse (0.0% → 55.5%) but its think conditions remain unreliable. The T10 rn best condition (67.7%) dropped to 41.2%. This model is simply too condition-sensitive for reliable deployment.

### 5.5 gpt-oss:120b Condition Divergence

| Condition | T10 F1 | T11 F1 | Δ |
|---|---|---|---|
| norag-nothink | 66.1% | **67.7%** | +1.6 pp |
| norag-think | 61.5% | **65.1%** | +3.6 pp |
| rag-nothink | 47.3% | **59.2%** | +11.9 pp |
| rag-think | **70.2%** | 40.0% | **−30.2 pp** |

The noRAG and RAG-nothink conditions all improved. The rt collapse is striking — 33 TP, 59 FN, 5 FP for F1=40.0%. The extended thinking combined with late-position RAG chunks may cause the model to get confused between its own chain-of-thought analysis and the supplementary guidance appearing after the code.

---

## 6. Model Selection for Full Study

### Recommended longlist

| Model | Best condition | Best F1 | Avg F1 | Recommended condition |
|---|---|---|---|---|
| **qwen3.5:397b** | rag-nothink | 65.2% (0 FP) | 61.3% | rag-nothink |
| **gpt-oss:120b** | norag-nothink | 67.7% | 58.0% | norag-nothink (RAG hurts: −8.5 pp rn) |
| **glm-5** | rag-nothink | 63.1% | 55.7% | rag-nothink |
| **deepseek-v3.2** | norag-think | 64.7% (0 FP) | 48.6% | norag-think (651 s avg — slow) |
| **gemini-3-flash-preview** | rag-think | 64.3% (0 FP) | 41.4% | rag-think (fastest: ~132 s) |
| **kimi-k2.5** | rag-think | 45.7% | 39.2% | rag-think |
| **qwen3-vl:235b** | norag-think | 56.3% (0 FP) | 37.1% | norag-think |

### Excluded from longlist

| Model | Reason |
|---|---|
| nemotron-3-super | FP=31 in best condition (nn); extreme condition sensitivity; unreliable |
| ministral-3:3b | FP=67–194 across conditions; rule regression in T11 |
| gpt-oss:20b | 0 TP in all 4 conditions — refuses to flag issues |
| qwen3-coder-next | Best F1=14.6%; FP=113 in nn — hallucination-prone |
| gemma3:4b | Best F1=17.0%; avg 13.6% — below viability threshold |
| nemotron-3-nano:30b | Avg 17.3%; extreme condition variance |
| cogito-2.1:671b | Avg 26.4%; slow (649 s nt) |
| devstral-2:123b | Avg 18.7%; below threshold |
| devstral-small-2:24b | Avg 22.9%; inconsistent |
| ministral-3:14b | Avg 22.3%; FP=22 in rt |
| gemma3:27b | Avg 23.5%; below threshold |
| qwen3-coder:480b | Avg 20.7%; dropped significantly from T10 |

---

## 7. F1 Score Comparison: Test 10 vs Test 11 — All Conditions

Sorted by Avg Δ descending. Positive = improvement; negative = regression.

| Model | T10 rt | T11 rt | T10 rn | T11 rn | T10 nn | T11 nn | T10 nt | T11 nt | Avg Δ |
|---|---|---|---|---|---|---|---|---|---|
| **gemini-3-flash-preview** | 26.9% | **64.3%** | 31.1% | 34.7% | 34.5% | 27.8% | 21.7% | **38.9%** | **+12.8 pp** |
| **nemotron-3-super** | 6.1% | **34.2%** | 67.7% | 41.2% | 0.0% | **55.5%** | 27.4% | 19.8% | **+12.4 pp** |
| **glm-5** | 38.1% | **60.5%** | 38.8% | **63.1%** | 52.7% | **60.9%** | 57.2% | 38.2% | **+9.0 pp** |
| **qwen3.5:397b** | 58.4% | 60.8% | 40.3% | **65.2%** | 45.6% | **59.3%** | 71.2% | 60.0% | **+7.4 pp** |
| **gemma3:27b** | 18.3% | **19.9%** | 20.5% | 17.2% | 20.7% | **29.4%** | 18.8% | **27.4%** | **+3.9 pp** |
| **devstral-small-2:24b** | 22.0% | 19.2% | 20.1% | 14.1% | 18.3% | **28.2%** | 17.2% | **29.9%** | **+3.5 pp** |
| **cogito-2.1:671b** | 23.7% | **27.3%** | 24.0% | **26.8%** | 27.1% | **28.2%** | 19.3% | 23.1% | **+2.9 pp** |
| **ministral-3:3b** | 34.5% | 31.7% | 27.7% | **30.7%** | 8.3% | **23.4%** | 24.8% | 17.5% | **+2.0 pp** ‡ |
| **devstral-2:123b** | 15.9% | 16.7% | 11.8% | 12.6% | 23.2% | **23.9%** | 18.4% | **21.7%** | **+1.4 pp** |
| **mistral-large-3:675b** | 28.5% | **36.8%** | 31.0% | 25.6% | 31.7% | 30.2% | 30.2% | 28.6% | **−0.1 pp** |
| **nemotron-3-nano:30b** | 37.5% | 7.0% | 8.8% | **31.7%** | 9.6% | **14.9%** | 13.8% | 15.5% | **−0.1 pp** |
| **qwen3-coder:480b** | 23.7% | 22.1% | 14.0% | **23.7%** | 42.2% | 20.7% | 12.5% | 16.1% | **−2.4 pp** |
| **gpt-oss:20b** | 25.0% | 25.0% | 25.0% | 25.0% | 25.0% | 25.0% | 35.7% | 25.0% | **−2.7 pp** |
| **gpt-oss:120b** | **70.2%** | 40.0% | 47.3% | **59.2%** | 66.1% | **67.7%** | 61.5% | **65.1%** | **−3.3 pp** |
| **kimi-k2.5** | 46.0% | **45.7%** | 41.4% | 29.9% | 48.2% | 44.1% | 46.8% | 37.1% | **−6.4 pp** |
| **deepseek-v3.2** | **69.6%** | 52.7% | 48.5% | 36.8% | 42.0% | 40.2% | 61.8% | **64.7%** | **−6.9 pp** |
| **ministral-3:14b** | 29.4% | 23.3% | 23.2% | **24.3%** | 35.6% | 22.5% | 32.3% | 19.0% | **−7.8 pp** |
| **qwen3-coder-next** | 24.0% | 11.1% | 19.9% | **14.6%** | 10.8% | 8.4% | 18.5% | 7.8% | **−7.8 pp** |
| **gemma3:4b** | 24.7% | 15.9% | **42.7%** | 16.2% | 23.8% | 17.0% | 14.3% | 5.3% | **−12.8 pp** |
| **qwen3-vl:235b** | 50.3% | 23.4% | 55.4% | 40.1% | 48.9% | 28.7% | 53.3% | **56.3%** | **−14.9 pp** |

‡ ministral-3:3b nn FP regressed 8→194 due to benchmark injection bug (§5.2); headline F1 improvement is partially artificial (rule [vii] not enforced pre-code in T11).

---

## 8. FN Pattern Analysis — What Is Being Missed

The following analysis uses the `missedIds` field from the JSON output across all four conditions. Miss rates are expressed as a fraction of the maximum possible misses for that concept (which depends on how many fixtures contain it: HTML_LOW issues appear in 3 fixtures × 20 models = 60 max; HTML_MEDIUM extras in 2 fixtures × 20 models = 40 max; HTML_HIGH extras in 1 fixture × 20 models = 20 max).

### 8.1 Most-Missed Concepts (norag-nothink — cleanest signal)

| Issue ID | Category | Miss count | Max possible | Miss rate | Why it's hard |
|---|---|---|---|---|---|
| `footer-logo-alt-missing` | Image alt | 53 | 60 | **88%** | Specific element — models catch some alts but not footer logo by name |
| `faq-id-wrong-section` | Broken ID ref | 52 | 60 | **87%** | Requires cross-referencing `href="#faq"` anchor with actual section `id="contact"` — no ARIA involved |
| `html-lang-missing` | Language | 46 | 60 | **77%** | Simple check but models often overlook the `<html>` element itself |
| `logo-bar-aria-label` | Landmark label | 40 | 40 | **100%** | No model in any run detected this — section landmark labelling of decorative logo bars is outside model WCAG training |
| `table-caption-missing` | Table structure | 40 | 40 | **100%** | No model detected this — `<caption>` element is rarely flagged despite being a clear WCAG 1.3.1 issue |
| `th-row-scope-missing` | Table structure | 39 | 40 | **98%** | Row scope almost never flagged; col scope detected more often |
| `contrast-studio-link` | Non-descriptive link | 39 | 40 | **98%** | Second "Click here" link — models flag the first one but stop short of enumerating all instances |
| `pricing-toggle-role` | ARIA widget | 39 | 40 | **98%** | `role="group"` on pricing toggle div — requires understanding grouping pattern |
| `search-label-missing` | Form label | 38 | 40 | **95%** | Models detect newsletter/contact labels more often than the inline search input |
| `hero-img-alt-missing` | Image alt | 38 | 40 | **95%** | Hero image named `hero-dashboard` — models often describe visuals without flagging the missing alt |
| `step1-heading-skip` | Heading structure | 38 | 40 | **95%** | Nested step headings skip to h5 inside a how-it-works section — missed hierarchy |
| `faq-dd-region` | ARIA widget | 38 | 40 | **95%** | FAQ answer `role="region"` + `aria-labelledby` missing — disclosure pattern not consistently checked |
| `filter-btn-aria-pressed` | ARIA state | 37 | 40 | **93%** | `aria-pressed` on filter toggle buttons — toggle state checking is uncommon |
| `td-icon-aria-label` | Table cells | 37 | 40 | **93%** | Icon cells (✓/—) need `aria-label` — models don't enumerate table cell content |

**All 20 HTML_HIGH_EXTRA concepts at 20/20 miss rate** in 14 of 20: complex navigation structures (skip links, landmark labels, mobile toggle ARIA, subnav ARIA), live regions, hero section labelling, FAQ expanded state, contact form autocomplete/required/describedby, footer nav labels. The remaining 6 high-tier concepts were detected by 1–3 models at most.

### 8.2 Miss Rate by Sweep Type

| Sweep | What it checks | Representative missed issues | Avg miss rate |
|---|---|---|---|
| **Sweep A** (Link names) | `href` link accessible names | `click-here-link`, `twitter-link-name`, `linkedin-link-name` | ~45% — better than others |
| **Sweep B** (Button names/state) | Button accessible names, `aria-expanded` | `search-btn-name`, `mobile-toggle-aria`, `filter-btn-aria-pressed` | ~80% |
| **Sweep C** (Images) | `alt` attribute | `footer-logo-alt-missing`, `hero-img-alt-missing`, `partner-logo-alt`, avatar images | ~88% |
| **Sweep D** (Headings) | Heading level hierarchy | `heading-level-skip-h5`, `step1-heading-skip` | ~75% |
| **Sweep E** (Forms) | `<label>` association, `autocomplete` | `newsletter-label-missing`, `search-label-missing`, `contact-name-autocomplete` | ~90% |
| **Sweep F** (Tables) | `scope`, `<caption>`, header association | `th-col-scope-missing`, `th-row-scope-missing`, `table-caption-missing` | ~95% |
| **Sweep G** (Landmarks) | Section/nav `aria-label` | `logo-bar-aria-label`, `main-nav-aria-label`, `account-nav-label` | **~97%** |
| **Sweep H** (Broken ID refs) | `aria-labelledby`, `aria-controls`, `aria-describedby`, skip-link targets | `faq-id-wrong-section`, `features-heading-id`, `main-id-missing` | ~87% |
| **Sweep I** (Disclosure/toggle) | `role="group"`, `role="region"`, `aria-controls` | `pricing-toggle-role`, `faq-aria-controls`, `faq-dd-region` | ~95% |
| **Sweep J** (Autocomplete) | `autocomplete` attribute on personal data inputs | `contact-name-autocomplete` | **~100%** |

### 8.3 Key Observations

**Sweep H miss analysis — the ID cross-reference problem.** The most-missed issue in the entire test suite is `faq-id-wrong-section` (87%). This is not an ARIA reference problem — it's a skip-link integrity check: the document has `<a href="#faq">` but the FAQ section has `id="contact"`, not `id="faq"`. The current Sweep H prompt asks models to check ARIA attributes (`aria-labelledby`, `aria-describedby`, `aria-controls`) for broken ID references, but it does not explicitly ask models to validate `href="#..."` anchor targets for skip links. Models don't generalise from ARIA ref checking to anchor-href checking.

**Image alt enumeration stops early.** `footer-logo-alt-missing` (88%) is worse than `axe-runner-alt-missing` (23%). Both are missing `alt`. The difference is location: axe Runner appears early in the document (product section), the footer logo appears at the very end. Models likely perform an image scan that stops after finding a few issues early in the document rather than exhaustively iterating every `<img>`.

**Logo bar / landmark labels — completely invisible.** `logo-bar-aria-label` (100% miss) and other section-level landmark labels are never detected. Models don't seem to apply Sweep G to every `<section>` element — they apply it selectively to elements they recognise as named landmarks (nav, main, header, footer) and ignore unnamed sections that serve as grouping structures.

**Table captions — universally missed.** `table-caption-missing` (100%) and `th-row-scope-missing` (98%) suggest models know to look for tables but only check the most visible table accessibility issue (column scope on `<th>`). Row scope and captions require a deeper table grammar check.

**Think (CoT) does not help with missed issues.** The top 20 missed concepts are almost identical across nn and nt conditions — extended thinking does not help models find these specific issues. The problems are structural: models don't enumerate exhaustively or check certain element types at all.

---

## 9. Changes for Test 12

> **Design constraint — prompt changes must be general-purpose.** The extension is used on real websites, not on the test fixtures. Every prompt change must describe a check that applies to *any* HTML document. Changes that reference specific element names, page layouts, or content patterns from the fixture (e.g. naming particular sections like "hero", "logo bar", or "FAQ") are invalid — they would overfit to the benchmark and fail on real-world pages. Each proposed change below is verified against this constraint.

### 9.1 Model Roster — Remove Three Underperforming Models

Three models are removed from the roster effective Test 12. They consumed run budget (each ~$0.10–0.40 per condition) without producing usable signal across 3 tests:

| Model removed | Avg F1 (T11) | Reason |
|---|---|---|
| **gemma3:4b** | 13.6% | Below viability threshold across all 3 tests; no response to any prompt changes; avg F1 declining |
| **nemotron-3-nano:30b** | 17.3% | Extreme instability (7.0% rt vs 31.7% rn in same test); condition variance makes results uninterpretable |
| **devstral-2:123b** | 18.7% | Flat across all 3 tests (24.4% → 17.3% → 18.7%); large 123 B model with no advantage over small ones |

Roster drops from 20 to **17 active models** for Test 12.

### 9.2 Fix the Benchmark Injection Bug — Anti-FP Rules Must Be Before the HTML

**Real-world problem:** Rules vi–viii (confidence gate, autocomplete exclusions, broken ARIA gating) exist because developers using the extension saw false positives that eroded trust. When ministral-3:3b produced 194 FPs in Test 11's norag-nothink condition, that's equivalent to a developer seeing 194 spurious warnings on a single file — the tool becomes actively harmful.

The bug: `benchmark-prompt.ts` injects `ANTI_FP_SUPPLEMENT` by replacing the context-block label string. When that label moved to after the HTML in Test 11, the anti-FP rules moved with it, appearing only after the model had already processed the code. Pre-task constraints that arrive post-task have no effect.

**Fix:** Change the injection anchor in `benchmark-prompt.ts` to target a fixed marker string that appears **before** the `CODE TO AUDIT` block — for example `ANTI_FP_RULES_INJECTION_POINT` inserted at the end of the sweeps block in `prompt.ts` — so it is always in the pre-code position regardless of where the RAG block sits.

### 9.3 RAG Context Position — Keep After HTML but Fix the Wrapper

The post-HTML RAG position produced real gains (gemini-3-flash-preview +37.4 pp rt, glm-5 +22 pp, qwen3.5:397b +24.9 pp rn) and is worth keeping. The problem was not the RAG position but the benchmark wrapper accidentally moving the anti-FP rules along with it. Once §9.2 is fixed, this can be evaluated cleanly in Test 12.

### 9.4 Prompt: Expand Sweep H to Cover Skip-Link ID Validation

**Driven by FN analysis §8.3.** Current Sweep H only checks ARIA reference attributes (`aria-labelledby`, `aria-describedby`, `aria-controls`). The most-missed issue in the whole test suite (`faq-id-wrong-section`, 87% miss rate) is a skip-link target mismatch — a completely different check that uses `href="#id"` anchors. These appear on any website that uses in-page jump links, skip-navigation links, table-of-contents anchors, or same-page tab controls.

**Change:** Add an explicit in-page anchor validation step to Sweep H in `prompt.ts`. This must be written generically — the prompt is used on any HTML document, not just the test fixture:
> *"Also check every `<a href="#id">` in-page anchor. For each, confirm that an element with the matching `id` attribute exists somewhere in the document. Flag any anchor whose target ID is missing or incorrect — this breaks keyboard navigation and skip-link functionality on any page."*

This is applicable to any real website: any page with a "Skip to content" link, anchor menu, FAQ accordion, or tabbed interface has this check.

### 9.5 Prompt: Require Exhaustive Image Enumeration in Sweep C

**Driven by FN analysis §8.3.** Images in later parts of a document are routinely missed — models appear to stop enumerating after finding the first missing alt rather than scanning the full document. This is not a fixture-specific problem: on any real website, images appear throughout the page (navigation, content, sidebars, footers, banners). Stopping early produces incomplete audits regardless of which page is being audited.

**Change:** Add a completeness instruction to Sweep C in `prompt.ts`. The wording must not reference any specific page structure:
> *"Check every `<img>` element in the document without exception — do not stop after finding the first issue. Images can appear anywhere in the markup: navigation areas, main content, sidebars, and page footers are all equally in scope."*

### 9.6 Prompt: Explicit html lang Check

**Driven by FN analysis §8.1.** `html-lang-missing` has a 77–80% miss rate despite being WCAG 3.1.1 (Level A) — one of the most fundamental requirements. The `<html>` element is present in every HTML document, so this check is fully generalisable. Models likely miss it because it is at the structural root of the document, above the visible page content, and models may focus their scan on the `<body>` area.

**Change:** Add as an explicit named checkpoint in the Phase 1 inventory block in `prompt.ts`:
> *"✓ `<html lang>` — the root `<html>` element must have a non-empty `lang` attribute declaring the document's primary language (e.g. `lang="en"`). WCAG 3.1.1 Level A."*

Including the WCAG criterion number and level makes it a mandatory checklist item rather than something models infer.

### 9.7 Prompt: Apply Landmark/Section Label Check Universally (Sweep G)

**Driven by FN analysis §8.2.** The 100% miss rate on `logo-bar-aria-label` and similar landmark labels indicates models apply Sweep G selectively only to elements they recognise from WCAG examples (nav, main, header, footer) and skip grouping sections that don't fit a named template. On any real website, `<section>` and `<aside>` elements are used throughout as grouping containers, and all of them need distinguishing labels if there are multiple of the same type.

**Change:** Amend Sweep G in `prompt.ts` to state scope explicitly — with no mention of any fixture-specific structures:
> *"Apply this check to every `<nav>`, `<section>`, `<aside>`, and other landmark element in the document — not just the ones named in WCAG examples. If two or more elements of the same type are present, each must carry a unique `aria-label` or `aria-labelledby` so assistive technology users can distinguish them. Do not treat any element as exempt because its content appears simple."*

### 9.8 RAG: Update Sweep H Query to Include Skip-Link Patterns

**Driven by §9.4.** The current Sweep H RAG query targets only ARIA reference attributes. It should also retrieve chunks about skip-link / anchor integrity.

**Change in `benchmark.ts` `HTML_SWEEP_QUERIES[4]`:**

Current:
```
'aria-labelledby aria-describedby aria-controls broken reference id does not exist SC 4.1.2'
```
Proposed:
```
'aria-labelledby aria-describedby aria-controls broken reference id does not exist SC 4.1.2 skip link anchor href target missing id'
```

### 9.9 deepseek-v3.2 RAG Sensitivity — Monitor, No Change Yet

deepseek-v3.2 RAG regression (§5.3) is noted but no prompt change is made for Test 12. The priority is to get a clean baseline from the injection bug fix (§9.2) before adding model-specific RAG handling. If deepseek continues to regress in RAG conditions in Test 12, a targeted change will be considered for Test 13.

### 9.10 Summary Table

| Change | Type | Section | Expected impact |
|---|---|---|---|
| Remove gemma3:4b, nemotron-3-nano:30b, devstral-2:123b | Roster | §9.1 | Leaner run, budget saved |
| Fix anti-FP injection anchor | Bug fix | §9.2 | Restore FP control for ministral-3:3b (FP 194→~8), qwen3-coder-next |
| Keep RAG after HTML | Retain | §9.3 | Preserve gains for gemini, glm-5, qwen3.5 |
| Sweep H: skip-link ID validation | Prompt | §9.4 | Target `faq-id-wrong-section` (87% miss rate) |
| Sweep C: full image enumeration | Prompt | §9.5 | Target footer/avatar/product image alts (88% miss rate) |
| Explicit html lang check | Prompt | §9.6 | Target `html-lang-missing` (77% miss rate) |
| Sweep G: all section/landmark check | Prompt | §9.7 | Target `logo-bar-aria-label` (100% miss rate) |
| RAG Sweep H query: add skip-link terms | RAG | §9.8 | Better chunk retrieval for anchor href validation |
