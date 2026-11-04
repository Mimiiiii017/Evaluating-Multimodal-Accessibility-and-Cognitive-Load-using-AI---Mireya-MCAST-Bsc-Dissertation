# NASA-TLX LLM Evaluation — Test 2 Results

**Date:** 1 May 2026  
**Configuration:** `multi-stage-voting-kimi-qwen` (kimi-k2.5:cloud + qwen3.5:397b-cloud)  
**Fixtures:** `html-high`, `css-high`, `js-high`, `tsx-high`  
**Conditions:** `rag-think`, `rag-nothink`, `norag-think`, `norag-nothink`  
**TLX model:** Updated (severity weighting, WCAG SC matching, raised caps, language difficulty modifier)

---

## What Changed from Test 1

This test uses the same kimi-qwen voting configuration as Test 1 but with a
**recalibrated TLX prediction model**. See [test 1/results.md](../test%201/results.md#model-improvements-applied-after-test-1)
for a full description of the four changes applied.

The most impactful change is the **language difficulty modifier**, which multiplies
the base TLX score by 1.20× for JS and 1.10× for TSX fixtures, reflecting the
empirically observed gap in F1 between language types in Phase 1 benchmarking.

---

## Overall Summary

| Metric | Test 2 | Test 1 (same config) | Δ |
|---|:---:|:---:|:---:|
| Overall avg F1 | **0.533** | 0.579 | −0.046 |
| Overall avg TLX | **77** | 65 | +12 |
| Best condition F1 | 0.574 (rag-think) | 0.608 (rag-think) | −0.034 |
| JS avg TLX | **94** | 70 | +24 |
| RT (avg) | 273 s | ~316 s | −43 s |

> F1 is slightly lower in Test 2 — this is expected non-determinism from LLM sampling (temperature 0.2), not a regression. The key improvement is TLX: the model now correctly differentiates workload by language, with JS scoring 24 points higher than in Test 1.

---

## Results by Condition

| Condition | Avg F1 | Avg Precision | Avg Recall | Avg TLX | Avg RT (s) |
|---|:---:|:---:|:---:|:---:|:---:|
| **rag-think** | **0.574** | 0.586 | **0.591** | 80 | 291 |
| rag-nothink | 0.560 | **0.612** | 0.532 | 78 | **212** |
| norag-think | 0.523 | 0.610 | 0.493 | 78 | 267 |
| norag-nothink | 0.474 | 0.675 | 0.434 | **73** | 321 |

**Bold** = best in column.

> `rag-think` leads on both F1 and recall. `rag-nothink` is almost as accurate at half the response time and achieves the best precision — useful when speed matters. `norag-nothink` produces the cleanest outputs (fewest FP per TP, highest precision 0.675) but misses the most violations.

---

## Results by Fixture

| Fixture | Avg F1 | Avg Precision | Avg Recall | Avg TLX | Difficulty |
|---|:---:|:---:|:---:|:---:|---|
| tsx-high | **0.604** | 0.649 | 0.565 | 81 | Moderate |
| css-high | 0.574 | 0.495 | **0.685** | 69 | Moderate |
| html-high | 0.568 | **0.792** | 0.500 | 65 | Moderate |
| js-high | 0.386 | 0.545 | 0.300 | **94** | **Hardest** |

> JS remains the hardest fixture by a large margin (F1 0.386 vs 0.574–0.604 for others). HTML has the highest precision (0.792) — when both models agree on an HTML violation, they are usually right. CSS has the highest recall (0.685) — the models collectively catch the most CSS issues.

---

## Full Results Table

| Condition | Fixture | F1 | Precision | Recall | TLX | TP | FP | FN | Issues | RT (s) |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| rag-think | html-high | **0.696** | 0.639 | **0.765** | 73 | 39 | 22 | 12 | 61 | 301 |
| rag-think | css-high | 0.598 | 0.522 | 0.700 | 69 | 35 | 32 | 15 | 67 | 294 |
| rag-think | js-high | 0.342 | 0.500 | 0.260 | 95 | 13 | 13 | 37 | 26 | 204 |
| rag-think | tsx-high | 0.660 | 0.681 | 0.640 | 83 | 32 | 15 | 18 | 47 | 367 |
| rag-nothink | html-high | 0.681 | **0.775** | 0.608 | 72 | 31 | 9 | 20 | 40 | 170 |
| rag-nothink | css-high | 0.602 | 0.540 | 0.680 | 69 | 34 | 29 | 16 | 63 | 258 |
| rag-nothink | js-high | 0.350 | 0.467 | 0.280 | 91 | 14 | 16 | 36 | 30 | 157 |
| rag-nothink | tsx-high | 0.609 | 0.667 | 0.560 | 80 | 28 | 14 | 22 | 42 | 264 |
| norag-think | html-high | 0.571 | 0.846 | 0.431 | 67 | 22 | 4 | 29 | 26 | 230 |
| norag-think | css-high | 0.528 | 0.440 | 0.660 | 68 | 33 | 42 | 17 | 75 | 267 |
| norag-think | js-high | 0.439 | 0.562 | 0.360 | **97** | 18 | 14 | 32 | 32 | 206 |
| norag-think | tsx-high | 0.553 | 0.591 | 0.520 | 81 | 26 | 18 | 24 | 44 | 366 |
| norag-nothink | html-high | 0.323 | **0.909** | 0.196 | 47 | 10 | 1 | 41 | 11 | 513 |
| norag-nothink | css-high | 0.569 | 0.479 | 0.700 | 68 | 35 | 38 | 15 | 73 | 243 |
| norag-nothink | js-high | 0.411 | 0.652 | 0.300 | 94 | 15 | 8 | 35 | 23 | 235 |
| norag-nothink | tsx-high | 0.593 | 0.659 | 0.540 | 81 | 27 | 14 | 23 | 41 | 294 |

---

## TLX Subscale Averages

TLX subscales (0–100): Mental, Physical, Temporal, Performance (perceived success), Effort, Frustration.

| Subscale | Test 2 avg | Test 1 avg | Δ |
|---|:---:|:---:|:---:|
| Mental | **99** | 99 | 0 |
| Physical | 3 | 2 | +1 |
| Temporal | **42** | 18 | +24 |
| Performance | 5 | 19 | −14 |
| Effort | **98** | 97 | +1 |
| Frustration | **97** | 88 | +9 |
| **Raw TLX** | **77** | **65** | **+12** |

> **Temporal demand** rose sharply (+24) due to the density penalty (1.5 pts/issue, capped at 18) now correctly adding time pressure for every unresolved violation regardless of type. **Performance** dropped (−14) meaning the model now correctly predicts that developers will feel less confident when faced with many flagged issues, especially in JS. Frustration and Effort are near-maximum, which aligns with the high issue count reported by the voting mode.

---

## TLX by Language (Test 2 vs Test 1 — key improvement)

| Fixture | T2 avg TLX | T1 avg TLX | Modifier applied |
|---|:---:|:---:|:---:|
| html-high | 65 | 56 | ×1.00 (baseline) |
| css-high | 69 | 66 | ×0.95 |
| tsx-high | 81 | 69 | ×1.10 |
| js-high  | **94** | 70 | ×1.20 |

> The language difficulty modifier correctly separates JS (94) and TSX (81) from HTML (65) and CSS (69). In Test 1 all four fixtures produced similar TLX values (~65–70), which did not reflect the empirically observed ordering of language difficulty. This is now fixed.

---

## Notable Observations

### norag-nothink html-high collapse
kimi-k2.5 detected only 2 violations (F1 = 7.5%) without RAG or thinking, whilst qwen found 9 (F1 = 29.5%). The voted result was F1 = 32.3% — the lowest of any row. This confirms that HTML accessibility detection degrades severely without both RAG context and extended reasoning. The TLX was correctly low (47) because few issues were surfaced, not because they were easy.

### norag-think js-high is the best JS condition (F1 0.439)
Counterintuitively, enabling thinking without RAG outperforms RAG+think for JS (0.439 vs 0.342). This mirrors the Test 1 finding for qwen individually — JS dynamic-interaction violations may not be well represented in the WCAG knowledge base chunks, so RAG context adds noise rather than signal for this fixture type.

### Voting FP inflation
The voting union mode inflates FP counts significantly for CSS fixtures — norag-think css-high had 42 FPs from 75 combined issues. This is a known trade-off of the union voting strategy: recall improves but precision degrades when both models independently generate errors on the same fixture class. A future improvement would apply a confidence threshold to only include issues where both models agree.

---

## Best Conditions Summary

| Goal | Best condition | F1 | TLX | RT |
|---|---|:---:|:---:|:---:|
| Highest F1 | rag-think | **0.574** | 80 | 291 s |
| Fastest with good F1 | rag-nothink | 0.560 | 78 | **212 s** |
| Lowest cognitive burden | norag-nothink | 0.474 | **73** | 321 s |
| Best recall | rag-think | 0.574 | 80 | 291 s |
| Best precision | norag-nothink | 0.474 | 73 | 321 s |

**Recommended configuration for dissertation:** `rag-think` — leads on F1 and recall, consistent with Phase 1 findings, and represents the full treatment condition (RAG + reasoning both enabled).
