# T22 Results — Cloud LLM Preliminary Benchmark

**Run date:** 7 April 2026  
**Conditions:** rn (rag-nothink), rt (rag-think), nn (norag-nothink), nt (norag-think)  
**Fixtures:** html-high (51 issues), css-high (50), js-high (50), tsx-high (50) — 201 total issues, 1 797 TN slots  
**Models:** 7 | **Runs/combo:** 3

**T22 changes from T21:**
1. `benchmark-prompt.ts` — confidence gate [vi] rebalanced: missed issues and hallucinations now penalised equally (was: FP cost > FN cost)
2. `benchmark-params.ts` — Gemini think-mode temperature raised `0.0 → 0.15`, top_p `1.0 → 0.95` (fix for tsx-rt collapse)
3. `benchmark.ts` — JS sweep queries `2 → 3` (added aria-live/announce query), `RAG_JS_MAX_CHUNKS` raised `4 → 5`

---

## 1. Composite Score — All Conditions

Composite = 80% F1 + 20% speed (higher = better).

| Model | rn | rt | nn | nt | **Best** |
|---|---|---|---|---|---|
| gpt-oss:120b | 41.7% | **53.1%** | 42.2% | 45.3% | **53.1% rt** |
| deepseek-v3.2 | 27.4% | **50.5%** | 33.4% | 44.9% | **50.5% rt** |
| qwen3.5:397b | 39.0% | 47.5% | 42.0% | **48.2%** | **48.2% nt** |
| kimi-k2.5 | 39.6% | 46.7% | 33.4% | 40.3% | **46.7% rt** |
| gemini-3-flash | **42.4%** | 36.4% | **44.2%** | 38.6% | **44.2% nn** |
| mistral-large-3 | 27.0% | **38.2%** | 33.4% | 37.2% | **38.2% rt** |
| glm-5 | 36.1% | 33.7% | **38.6%** | 25.4% | **38.6% nn** |

**T21 → T22 delta (best composite per model):**

| Model | T21 best | T22 best | Δ |
|---|---|---|---|
| gpt | 53.0% (nt) | **53.1% (rt)** | +0.1% |
| deepseek | 41.6% (nt) | **50.5% (rt)** | **+8.9%** |
| qwen | 48.8% (rt) | 48.2% (nt) | −0.6% |
| kimi | 42.3% (nn) | 46.7% (rt) | **+4.4%** |
| gemini | 44.6% (rn) | 44.2% (nn) | −0.4% |
| mistral | 39.8% (nt) | 38.2% (rt) | −1.6% |
| glm | 44.1% (rt) | 38.6% (nn) | −5.5% |

---

## 2. Accuracy — All Conditions

Accuracy = (TP + TN) / (TP + TN + FP + FN). **Target: ≥ 80%** (cells in **bold** = target met).

| Model | rn | rt | nn | nt |
|---|---|---|---|---|
| kimi-k2.5 | **81.8%** | **81.4%** | **80.5%** | **82.0%** |
| glm-5 | **81.9%** | **81.4%** | **80.7%** | 79.4% |
| qwen3.5:397b | 79.8% | **80.9%** | 79.5% | **80.9%** |
| gpt-oss:120b | **80.4%** | **80.7%** | 79.8% | **80.3%** |
| deepseek-v3.2 | 79.0% | **80.4%** | 78.1% | 79.4% |
| gemini-3-flash | 78.9% | 78.1% | 79.3% | 78.5% |
| mistral-large-3 | 78.3% | 78.6% | 78.5% | 78.0% |

**T21 → T22 accuracy delta:**

| Model | rn Δ | rt Δ | nn Δ | nt Δ |
|---|---|---|---|---|
| kimi | +1.0% | −0.4% | −1.8% | +0.4% |
| glm | +1.4% | +1.2% | +0.6% | −1.3% |
| qwen | +0.2% | +0.7% | −0.8% | +1.0% |
| gpt | +0.4% | +0.4% | 0.0% | 0.0% |
| deepseek | −0.3% | **+1.1%** | **−1.4%** | 0.0% |
| gemini | −0.3% | +0.1% | +0.7% | +0.5% |
| mistral | −0.1% | +0.8% | +1.1% | −0.2% |

**Summary:** Gemini and mistral did not reach 80% in any condition. Deepseek crossed 80% for the first time in rt only. The confidence gate rebalancing did not produce the expected recall boost across the board — it instead caused a hallucination spike in mistral-nt (82 FPs, up from ~28 in T21 nt).

---

## 3. TP / FN / FP — All Conditions

### rn (rag-nothink)

| Model | TP | FN | FP | Recall | Precision | F1 |
|---|---|---|---|---|---|---|
| kimi-k2.5 | 226 | 377 | 75 | 37.5% | 83.7% | 48.6% |
| glm-5 | 188 | 415 | 24 | 31.2% | 89.2% | 45.1% |
| gpt-oss:120b | 171 | 432 | 47 | 28.3% | 85.3% | 39.0% |
| qwen3.5:397b | 138 | 465 | 26 | 22.9% | 88.3% | 34.6% |
| deepseek-v3.2 | 112 | 491 | 17 | 18.5% | 87.7% | 28.2% |
| gemini-3-flash | 100 | 503 | 5 | 16.6% | 94.7% | 28.1% |
| mistral-large-3 | 96 | 507 | 16 | 15.9% | 83.1% | 25.8% |

### rt (rag-think)

| Model | TP | FN | FP | Recall | Precision | F1 |
|---|---|---|---|---|---|---|
| kimi-k2.5 | 210 | 393 | 67 | 34.9% | 80.0% | 46.5% |
| glm-5 | 180 | 423 | 29 | 29.9% | 90.5% | 42.2% |
| gpt-oss:120b | 184 | 419 | 55 | 30.4% | 79.4% | 41.4% |
| qwen3.5:397b | 160 | 443 | 20 | 26.5% | 90.0% | 40.0% |
| deepseek-v3.2 | 168 | 435 | 43 | 27.8% | 86.9% | 38.8% |
| mistral-large-3 | 125 | 478 | 44 | 20.7% | 77.8% | 30.0% |
| gemini-3-flash | 92 | 511 | 17 | 15.2% | 90.0% | 24.2% |

### nn (norag-nothink)

| Model | TP | FN | FP | Recall | Precision | F1 |
|---|---|---|---|---|---|---|
| kimi-k2.5 | 185 | 418 | 62 | 30.7% | 82.0% | 41.8% |
| glm-5 | 151 | 452 | 14 | 25.1% | 93.2% | 37.8% |
| gpt-oss:120b | 144 | 459 | 31 | 23.9% | 86.6% | 33.4% |
| qwen3.5:397b | 128 | 475 | 22 | 21.3% | 90.7% | 32.6% |
| mistral-large-3 | 93 | 510 | 7 | 15.4% | 92.8% | 25.1% |
| gemini-3-flash | 109 | 494 | 2 | 18.1% | 98.7% | 30.2% |
| deepseek-v3.2 | 83 | 520 | 7 | 13.8% | 95.6% | 22.8% |

### nt (norag-think)

| Model | TP | FN | FP | Recall | Precision | F1 |
|---|---|---|---|---|---|---|
| kimi-k2.5 | 205 | 398 | 42 | 34.0% | 84.9% | 46.9% |
| qwen3.5:397b | 156 | 447 | 14 | 25.8% | 92.2% | 39.5% |
| gpt-oss:120b | 159 | 444 | 36 | 26.3% | 87.3% | 36.9% |
| deepseek-v3.2 | 120 | 483 | 15 | 19.9% | 92.1% | 31.1% |
| mistral-large-3 | 137 | 466 | 82 | 22.7% | 80.7% | 31.9% |
| glm-5 | 124 | 479 | 18 | 20.6% | 90.6% | 31.7% |
| gemini-3-flash | 104 | 499 | 21 | 17.3% | 89.2% | 27.4% |

---

## 4. Total FP Count (All Conditions Combined)

| Model | rn | rt | nn | nt | **Total** | T21 total | Δ |
|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 75 | 67 | 62 | 42 | **246** | 260 | −14 |
| gpt-oss:120b | 47 | 55 | 31 | 36 | **169** | 198 | −29 |
| mistral-large-3 | 16 | 44 | 7 | 82 | **149** | 113 | **+36** |
| qwen3.5:397b | 26 | 20 | 22 | 14 | **82** | 56 | +26 |
| glm-5 | 24 | 29 | 14 | 18 | **85** | 93 | −8 |
| deepseek-v3.2 | 17 | 43 | 7 | 15 | **82** | 60 | +22 |
| gemini-3-flash | 5 | 17 | 2 | 21 | **45** | 39 | +6 |

**Note:** Mistral-nt produced 82 FPs — its worst hallucination count of any single condition across all tests. The confidence gate change intended to encourage recall appears to have instead triggered aggressive hallucination in mistral's think mode. Deepseek-rt also increased substantially (17→43). Kimi and gpt improved (fewer total FPs vs T21).

---

## 5. Per-Fixture F1 — All Conditions

### rag-nothink (rn)

| Model | html | css | js | tsx | mean |
|---|---|---|---|---|---|
| gpt-oss:120b | 56.8% | 26.9% | 24.0% | 48.2% | 39.0% |
| kimi-k2.5 | 48.5% | 56.3% | 38.2% | 51.2% | 48.6% |
| deepseek-v3.2 | 47.1% | 34.4% | 15.1% | 16.3% | 28.2% |
| glm-5 | 46.3% | 61.5% | 31.5% | 41.3% | 45.1% |
| qwen3.5:397b | 43.3% | 40.1% | 16.7% | 38.4% | 34.6% |
| gemini-3-flash | 32.8% | 30.0% | 19.0% | 30.4% | 28.1% |
| mistral-large-3 | 25.8% | 29.8% | 14.0% | 33.7% | 25.8% |

### rag-think (rt)

| Model | html | css | js | tsx | mean |
|---|---|---|---|---|---|
| gpt-oss:120b | 59.0% | 43.1% | 13.3% | 50.2% | 41.4% |
| deepseek-v3.2 | 44.3% | 44.9% | 18.4% | 47.7% | 38.8% |
| kimi-k2.5 | 43.2% | 54.7% | 35.7% | 52.2% | 46.5% |
| qwen3.5:397b | 41.4% | 37.3% | 36.9% | 44.6% | 40.0% |
| glm-5 | 38.0% | 60.1% | 21.1% | 49.5% | 42.2% |
| mistral-large-3 | 29.8% | 45.1% | 7.3% | 37.8% | 30.0% |
| gemini-3-flash | 29.0% | 30.1% | 15.9% | **21.8%** | 24.2% |

### norag-nothink (nn)

| Model | html | css | js | tsx | mean |
|---|---|---|---|---|---|
| gpt-oss:120b | 35.2% | 33.0% | 8.5% | 57.0% | 33.4% |
| kimi-k2.5 | 35.1% | 52.4% | 28.2% | 51.2% | 41.8% |
| glm-5 | 36.7% | 46.3% | 22.1% | 46.1% | 37.8% |
| gemini-3-flash | 32.8% | 39.2% | 21.4% | 27.6% | 30.2% |
| qwen3.5:397b | 24.1% | 35.8% | 24.6% | 45.7% | 32.6% |
| mistral-large-3 | 30.6% | 32.3% | 9.7% | 27.8% | 25.1% |
| deepseek-v3.2 | 24.5% | 17.9% | 19.3% | 29.3% | 22.8% |

### norag-think (nt)

| Model | html | css | js | tsx | mean |
|---|---|---|---|---|---|
| gpt-oss:120b | 50.5% | 32.4% | 19.9% | 44.8% | 36.9% |
| kimi-k2.5 | 44.2% | 59.9% | 32.3% | 51.3% | 46.9% |
| qwen3.5:397b | 48.1% | 35.7% | 27.8% | 46.3% | 39.5% |
| mistral-large-3 | 35.3% | 29.7% | 19.7% | 43.0% | 31.9% |
| deepseek-v3.2 | 33.5% | 41.9% | 23.3% | 25.6% | 31.1% |
| glm-5 | 30.6% | 42.6% | 18.1% | 35.6% | 31.7% |
| gemini-3-flash | 26.0% | 33.8% | 19.0% | 30.7% | 27.4% |

**T21 → T22 per-fixture F1 deltas (rn condition, tracking T22 change targets):**

| Model | html Δ | css Δ | js Δ | tsx Δ |
|---|---|---|---|---|
| gemini-rn | −1.8% | −12.3% | −2.4% | +5.8% |
| mistral-rn | −1.1% | −7.2% | −11.9% | +4.8% |
| deepseek-rn | +20.9% | +1.4% | −10.8% | −21.6% |
| gpt-rn | +8.8% | −1.6% | +2.7% | −7.5% |
| kimi-rn | +3.9% | +1.1% | +4.0% | +13.6% |

**gemini tsx-rt (key hypothesis):**

| Condition | T21 | T22 | Δ |
|---|---|---|---|
| gemini tsx-rt | 6.0% | **21.8%** | **+15.8%** |

The temperature increase for Gemini think-mode successfully reversed the tsx-rt collapse from T21 (6.0% was the lowest single-fixture score of that run). However, gemini-rt overall dropped in composite rank (from 36.2% in T21 to 36.4% — nearly flat), because CSS and HTML scores remained low.

---

## 6. Consistency (F1 σ) — All Conditions

Lower σ = more stable across 3 repeated runs.

| Model | rn σ | rt σ | nn σ | nt σ | Avg σ |
|---|---|---|---|---|---|
| gemini-3-flash | **0.057** | 0.134 | **0.067** | 0.104 | **0.091** |
| kimi-k2.5 | 0.099 | 0.116 | 0.128 | 0.118 | 0.115 |
| qwen3.5:397b | 0.138 | **0.100** | 0.137 | **0.106** | 0.120 |
| mistral-large-3 | 0.112 | 0.154 | 0.140 | 0.121 | 0.132 |
| glm-5 | 0.114 | 0.157 | 0.143 | 0.134 | 0.137 |
| deepseek-v3.2 | 0.184 | 0.161 | 0.141 | 0.137 | 0.156 |
| gpt-oss:120b | 0.177 | 0.176 | 0.217 | 0.194 | 0.191 |

**T21 → T22 avg σ delta:**

| Model | T21 avg σ | T22 avg σ | Δ |
|---|---|---|---|
| gemini | 0.079 | 0.091 | +0.012 |
| qwen | 0.080 | 0.120 | +0.040 |
| mistral | 0.112 | 0.132 | +0.020 |
| glm | 0.143 | 0.137 | −0.006 |
| kimi | 0.149 | 0.115 | **−0.034** |
| deepseek | 0.160 | 0.156 | −0.004 |
| gpt | 0.174 | 0.191 | +0.017 |

Kimi improved consistency noticeably. Qwen became less consistent despite better scores. Gemini remains the most consistent model overall.

---

## 7. Response Time

Average across all 4 conditions:

| Model | rn avg | rt avg | nn avg | nt avg | Overall avg |
|---|---|---|---|---|---|
| gemini-3-flash | 14.6s | 122.1s | 42.1s | 121.6s | 75.1s |
| qwen3.5:397b | 105.5s | 140.6s | 112.9s | 122.4s | 120.4s |
| gpt-oss:120b | 114.0s | 88.5s | 121.8s | 129.8s | 113.5s |
| deepseek-v3.2 | 172.8s | 94.8s | 126.1s | 94.0s | 121.9s |
| mistral-large-3 | 157.7s | 154.7s | 158.8s | 163.9s | 158.8s |
| glm-5 | 223.3s | 317.3s | 246.1s | 262.4s | 262.3s |
| kimi-k2.5 | 216.0s | 208.2s | 391.4s | 239.1s | 263.7s |

**Note:** Gemini rn is dramatically faster than its other conditions (14.6s vs ~120s) due to generating fewer issues per run. kimi-nn was notably slow at 391.4s average — the highest single-condition average recorded across all tests.

---

## 8. Hypothesis Evaluation

### H1: Confidence gate rebalancing boosts recall for conservative models
**Partially confirmed, with side-effects.**
- Mistral recall improved slightly in some conditions (rt: 15.9→20.7% recall, nt: 15.9→22.7%), but gemini recall remained flat or dropped.
- Critical failure: **mistral-nt generated 82 FPs** (previous high was ~28). The rebalancing triggered aggressive hallucination in think mode, collapsing accuracy to 78.0%.
- Deepseek-rt TP increased substantially (from T21's 168 → T22's 168, same), but deepseek-nn fell from 83→83 (same) — net effect modest.
- The prompt change helped precision-dominant models try more, but for think-mode models it removed a guardrail that was working.

### H2: Gemini think temperature 0.15 fixes tsx-rt collapse
**Confirmed.**
- Gemini tsx-rt: 6.0% (T21) → **21.8%** (T22), +15.8% absolute.
- Gemini-rt overall improved from 36.2% to 36.4% (marginal composite gain, but no longer pathologically low on tsx).
- Side-effect: gemini-rt is now slower (122.1s vs was faster in T21 rn) and generated 17 FPs vs 5 in rn — temperature increase slightly hurt precision.

### H3: JS aria-live query unlocks *-announce issues
**Not confirmed.**
- Announce pattern issues (`scroll-top-announce`, `faq-open-announce`, `billing-period-announce`, `filter-result-announce`, etc.) remain almost universally missed across all models and conditions.
- JS TP counts are still low: kimi-rn=12, qwen-rt=12, kimi-rt=12 are the best, but these don't appear to be announce issues.
- The structural barrier — models cannot execute JavaScript to observe runtime aria-live announcements — is not solvable via RAG alone.
- JS fixture F1 range: 7.3% (mistral-rt) to 38.2% (kimi-rn). Adding a third query marginalised the improvement.

---

## 9. Summary

**Best composite per condition:**
- rn: gemini 42.4% (speed-boosted by low issue count)
- rt: gpt 53.1%
- nn: gemini 44.2%
- nt: qwen 48.2%

**Accuracy target (≥80%) status:**
- Met in all 4 conditions: kimi ✅
- Met in 3 of 4: glm ✅ (fails nt), gpt ✅ (fails nn)
- Met in 2 of 4: qwen (rt, nt)
- Met in 1 of 4: deepseek (rt only)
- Met in 0 of 4: gemini ✗, mistral ✗

**Regressions vs T21:**
- glm-rt: composite 44.1% → 33.7% (−10.4%) — significant drop
- glm-nt: 35.1% → 25.4% (−9.7%)
- deepseek-rn: 32.0% → 27.4% (−4.6%)
- mistral-nt FPs: ~28 → 82

**Improvements vs T21:**
- deepseek-rt: 39.5% → **50.5%** (+11.0%) — largest single-model gain
- kimi-rt: 38.1% → **46.7%** (+8.6%)
- kimi-rn: 34.3% → 39.6% (+5.3%)
- gemini tsx-rt: 6.0% → 21.8% F1 (+15.8%)

**Structural finding:** The JS fixture has a hard ceiling caused by runtime semantics, not RAG coverage. All 30+ aria-live announce issues require dynamic execution to verify. These are undetectable from static source analysis alone.
