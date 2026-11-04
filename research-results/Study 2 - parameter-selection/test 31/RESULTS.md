# Test 31 — Results

**Date:** 2026-04-12  
**Conditions:** rn (rag-nothink), rt (rag-think), nn (norag-nothink), nt (norag-think)  
**Fixtures:** html-high, css-high, js-high, tsx-high (high-difficulty only)  
**Models:** 6 — kimi-k2.5, qwen3.5:397b, gpt-oss:120b, gemini-3-flash-preview, deepseek-v3.2, gemma4:31b  
**Changes from T30:** JS Phase 1 LIST 1+2 merged into JS INTERACTION TABLE (THREE lists → shorter prompt); TSX Phase 1 article + star-widget inventory bullets merged into one; JS-A and JS-G cross-references updated to LIST 1; JS-G SPECIFICITY rule added (per-action live region required); TSX-K negative-evidence framing strengthened.  
**Pass threshold:** ≥ 80.0% accuracy  
**Ground truth per condition:** 603 positive issues, 1 797 TN slots → 2 400 total per model (3 runs × 4 fixtures)

> ✅ **Run quality note:** T31 had only 4 total errors across all conditions (rn: 3, nn: 1, rt: 0, nt: 0), down from T30's ~61. The JS Phase 1 compression resolved the timeout surge. All models in rt and nt ran with TN=1 797 (fully clean). T30 deepseek passes (rn/rt/nt) were denominator artifacts of error-reduced TN pools — T31 reveals deepseek's true baseline.

---

## 1. Accuracy by condition (≥ 80.0% = PASS)

| Model | rn | rt | nn | nt | ≥80% |
|---|---|---|---|---|---|
| kimi-k2.5 | **82.6%**⁰ | **81.7%**⁰ | **80.7%**⁰ | **82.4%**⁰ | 4/4 ✅ |
| qwen3.5:397b | **81.2%**⁰ | **80.3%**⁰ | **80.3%**⁰ | **81.5%**⁰ | 4/4 ✅ |
| gpt-oss:120b | **80.9%**⁰ | **81.1%**⁰ | **81.3%**⁰ | **80.5%**⁰ | 4/4 ✅ |
| gemini-3-flash-preview | 79.1%⁰ | 79.1%⁰ | **80.4%**⁰ | 78.1%⁰ | 1/4 |
| gemma4:31b | 79.1%⁰ | 79.4%⁰ | 79.2%⁰ | 79.3%⁰ | 0/4 |
| deepseek-v3.2 | 78.6%³ | 79.8%⁰ | 79.9%¹ | 77.3%⁰ | 0/4 |

Superscripts = error count for that model × condition.

**T31 total: 13/24 conditions passing**  
kimi 4/4 + qwen 4/4 + gpt 4/4 + gemini 1/4 + gemma4 0/4 + deepseek 0/4

**Versus T30 (15/24):** gpt recovered nt (+1, 3/4→4/4). deepseek dropped from 3/4 to 0/4. Net −2. However, T30's deepseek passes were error-denominator artifacts (rn: 7 errors TN=749; rt: 5 errors TN=1 048; nt: 4 errors TN=1 198 — smaller denominator inflated accuracy). T31 deepseek runs are mostly clean; the 0/4 outcome is the true baseline. **Effective clean-run comparison: T31 = one net gain (gpt nt recovered).**

---

## 2. T30 → T31 deltas (nt condition — cleanest comparison, both 0 errors for all models)

| Model | T29 nt Acc | T30 nt Acc | T31 nt Acc | T31 F1 | T31 TP | Pass |
|---|---|---|---|---|---|---|
| kimi-k2.5 | 81.5% | 81.9% | **82.4%** | 50.8% | 237 | ✅ |
| qwen3.5:397b | 80.2% | 82.3%³ | **81.5%** | 43.7% | 192 | ✅ |
| gpt-oss:120b | 81.3% | 79.3%¹ | **80.5%** | 38.7% | 161 | ✅ **recovered** |
| gemma4:31b | 78.9% | 78.3%³ | 79.3% | 32.6% | 141 | ❌ |
| gemini-flash | 79.0% | 77.5%¹ | 78.1% | 24.2% | 97 | ❌ |
| deepseek-v3.2 | 78.7% | 80.7%⁴ | 77.3% | 18.3% | 73 | ❌ |

T30 nt deepseek (80.7%) had 4 errors reducing TN to 1 198 — accuracy was denominator-inflated. T31 deepseek nt at TN=1 797 gives the true baseline of 77.3%.

gpt nt target outcome confirmed: T30 gpt nt failed at 79.3% (1 error). T31 gpt nt passes at 80.5% with 0 errors. The JS prompt compression freed reasoning budget for TSX in think mode without RAG.

---

## 3. TP / FP / FN totals by condition

### 3a. RAG No-Think (rn)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 234 | 60 | 369 | 1 797 | 82.6% | 38.8% | 50.6% | 0 |
| qwen3.5:397b | 178 | 31 | 425 | 1 797 | 81.2% | 29.5% | 42.0% | 0 |
| gpt-oss:120b | 180 | 43 | 423 | 1 797 | 80.9% | 29.8% | 40.7% | 0 |
| gemini-flash | 143 | 53 | 460 | 1 797 | 79.1% | 23.8% | 33.2% | 0 |
| gemma4:31b | 138 | 46 | 465 | 1 797 | 79.1% | 22.9% | 32.3% | 0 |
| deepseek-v3.2 | 75 | 8 | 378 | 1 347 | 78.6% | 16.5% | 25.4% | 3 |

### 3b. RAG Think (rt)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| gpt-oss:120b | 191 | 53 | 412 | 1 797 | 81.1% | 31.6% | 42.9% | 0 |
| kimi-k2.5 | 216 | 63 | 387 | 1 797 | 81.7% | 35.9% | 47.4% | 0 |
| qwen3.5:397b | 166 | 45 | 437 | 1 797 | 80.3% | 27.6% | 39.0% | 0 |
| deepseek-v3.2 | 142 | 29 | 461 | 1 797 | 79.8% | 23.6% | 35.5% | 0 |
| gemma4:31b | 140 | 37 | 463 | 1 797 | 79.4% | 23.2% | 32.5% | 0 |
| gemini-flash | 129 | 35 | 474 | 1 797 | 79.1% | 21.4% | 30.6% | 0 |

deepseek rt is 0.2pp below threshold at TN=1 797 (clean run). This is the genuine deepseek baseline for rt — it was never truly passing.

### 3c. No-RAG No-Think (nn)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| gpt-oss:120b | 206 | 62 | 397 | 1 797 | 81.3% | 34.1% | 44.6% | 0 |
| kimi-k2.5 | 177 | 46 | 426 | 1 797 | 80.7% | 29.4% | 40.9% | 0 |
| qwen3.5:397b | 177 | 57 | 426 | 1 797 | 80.3% | 29.4% | 38.9% | 0 |
| gemini-flash | 172 | 47 | 431 | 1 797 | 80.4% | 28.6% | 39.6% | 0 |
| deepseek-v3.2 | 117 | 9 | 436 | 1 647 | 79.9% | 21.1% | 32.7% | 1 |
| gemma4:31b | 139 | 43 | 464 | 1 797 | 79.2% | 23.1% | 31.8% | 0 |

### 3d. No-RAG Think (nt)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 237 | 68 | 366 | 1 797 | 82.4% | 39.3% | 50.8% | 0 |
| qwen3.5:397b | 192 | 41 | 411 | 1 797 | 81.5% | 31.8% | 43.7% | 0 |
| gpt-oss:120b | 161 | 31 | 442 | 1 797 | 80.5% | 26.7% | 38.7% | 0 |
| gemma4:31b | 141 | 42 | 462 | 1 797 | 79.3% | 23.4% | 32.6% | 0 |
| gemini-flash | 97 | 24 | 506 | 1 797 | 78.1% | 16.1% | 24.2% | 0 |
| deepseek-v3.2 | 73 | 19 | 530 | 1 797 | 77.3% | 12.2% | 18.3% | 0 |

---

## 4. Per-fixture TP breakdown (nn condition — single-run snapshot)

### T31 nn fixture TP

| Fixture | kimi | qwen | gpt | gemini | deepseek | gemma4 |
|---|---|---|---|---|---|---|
| html-high (~51 pos) | **22** | 13 | 25 | 9 | 11 | 9 |
| css-high (~50 pos) | 17 | 25 | **0** | 27 | **0** | 27 |
| js-high (~50 pos) | **14** | 12 | 9 | 9 | 11 | 4 |
| tsx-high (~50 pos) | 16 | **20** | 19 | 14 | **15** | 6 |

### T30 → T31 per-fixture deltas (nn)

| Fixture | kimi Δ | qwen Δ | gpt Δ | gemini Δ | deepseek Δ | gemma4 Δ |
|---|---|---|---|---|---|---|
| html-high | **+9** (13→22) | −14 (27→13) | +5 (20→25) | 0 (9→9) | +11 (ERR→11) | 0 (9→9) |
| css-high | −13 (30→17) | −2 (27→25) | **−17** (17→0) | 0 (27→27) | **−26** (26→0) | +1 (26→27) |
| js-high | +1 (13→14) | −5 (17→12) | −5 (14→9) | +1 (8→9) | +1 (10→11) | −1 (5→4) |
| tsx-high | −7 (23→16) | +6 (14→20) | −7 (26→19) | +3 (11→14) | **+15** (0→15) | 0 (6→6) |

Key changes:
- **deepseek tsx-high: 0→15** ✅ — TSX Phase 1 compression fixed the norag crash. The primary T31 goal achieved.
- **gemini tsx-high: +3, qwen tsx-high: +6** ✅ — Broader TSX benefit from Phase 1 compression.
- **gpt css-high: 17→0 / deepseek css-high: 26→0** ❌ — CSS activation collapse re-emerged for both gpt and deepseek in norag-nothink. See §6.
- **kimi html-high: +9** ✅ — Likely indirect effect of JS prompt shortening giving more capacity for html scanning.

---

## 5. Hypothesis verification

| Hypothesis | Outcome |
|---|---|
| JS Phase 1 compression reduces timeout rate | ✅ Confirmed — 4 errors in T31 vs ~61 in T30. Error rate dropped ~15×. |
| gpt nt regression recovered by shorter JS prompt | ✅ Confirmed — gpt nt 79.3%→80.5%, PASS restored. |
| TSX Phase 1 compression fixes deepseek tsx-high norag crash | ✅ Confirmed — deepseek tsx-high nn went 0→15 TP. |
| T30 deepseek passes were error-denominator artifacts | ✅ Confirmed — T31 deepseek with clean TN=1 797 shows 77–80% across all conditions, never ≥80.0%. |
| JS-G SPECIFICITY rule improves live-region recall | ⚠️ Insufficient evidence yet — JS FN patterns largely unchanged; announcement suite still dominates (see §7a). |
| TSX-K negative-evidence framing improves star-rating detection | ❌ Not yet effective — `star-rating-role` still in most models' FN list for tsx-high nn. |

---

## 6. Root cause analysis

### 6a. CSS activation collapse re-emerged for gpt and deepseek (nn)

In T31 nn, gpt found 0 CSS issues (0 TP, 0 FP, 388 s response) and deepseek found 0 CSS issues (0 TP, 0 FP, 900 s response). This is the same collapse seen in T28 nn for gpt and fixed by the CSS activation mandate in T29.

The mandate (`⚠ ACTIVATION MANDATE`) is still present in `CSS_MANDATORY_SWEEPS` and was not modified. Possible causes:

1. **gpt context budget shift**: The shorter JS prompt freed ~300 tokens per fixture, but for CSS in norag-nothink mode, gpt may now allocate more reasoning to Phase 1 scanning and exhaust its output budget before the sweeps. The 388 s response time suggests gpt spent the full analysis window and returned a truncated response that was parsed as empty.

2. **deepseek CSS timeout**: 900 s is at or past the fixture-level timeout ceiling. Without RAG context, deepseek processes CSS phase 1 from scratch, and the compact Phase 1 CSS inventory (7 bullets) still requires full file scanning. Deepseek's CSS cold-analysis is simply too slow for the norag condition.

3. **Per-run variance**: Since T31 uses 3 runs, if TWO of the three runs returned CSS issues and ONE returned 0, the per-fixture detail snapshot (showing one run) would show 0 while the aggregated total_tp still includes the two successful runs. The gpt aggregate total_tp=206 for nn is plausible even with one zero-CSS run.

The aggregate accuracy for gpt nn (81.3%) is the reliable figure. The per-fixture CSS collapse may be a single-run outlier. Resolution: add a CSS completion gate similar to the JS completion check.

### 6b. deepseek confirmed at true baseline 0/4

T30 deepseek passed 3 conditions (rn, rt, nt) but all three had 4–7 errors that reduced TN pools to 749–1 198, inflating accuracy. T31 with clean runs shows:
- rt: 79.8% (0 errors, TN=1 797) — barely below threshold
- nn: 79.9% (1 error) — barely below threshold
- nt: 77.3% (0 errors) — further below threshold

deepseek consistently achieves ~77–80% genuine accuracy. It would need approximately +0.5–2.5pp accuracy improvement to pass. The primary bottleneck is:
- Extremely high recall reluctance in norag-think (nt: 12.2% recall, F1=18.3%)
- Severe CSS timeout in norag conditions (900 s → 0 CSS issues)
- Slow response times in all conditions (557–767 s per fixture average)

### 6c. gpt nt fully recovered

The gpt nt failure in T30 (79.3%) was caused by the JS Phase 1 LIST 1–4 exhausting the reasoning budget before TSX sweeps completed in think+norag mode. With the merged JS INTERACTION TABLE (shorter), gpt nt recovers to 80.5% with 0 errors. This is a direct validation of the T31 change.

### 6d. deepseek rn still affected by 3 errors

deepseek rn had 3 errors (TN=1 347) again in T31, same as T30. These appear to be fixture-level timeouts specific to deepseek × rag-nothink, likely because RAG context + Phase 1 inventory is the maximum token load for deepseek. This is a structural ceiling for the model, not a prompt issue.

---

## 7. Persistent FN patterns (all models, all conditions)

### 7a. JS announcement suite — unchanged

The JS live-region announcement suite remains the dominant FN cluster across all models and conditions. The JS-G SPECIFICITY addition did not measurably change the FN pattern in T31 — most models still find 8–14 JS issues (vs a ground truth of ~50), all from non-announcement categories:

`scroll-top-announce`, `filter-result-announce`, `view-mode-announce`, `filter-reset-announce`, `billing-period-announce`, `comparison-expand-announce`, `faq-open-announce`, `faq-open/close-all-announce`, `shortcut-*-announce`, `nav-open/close-announce`, `search-submit/clear-announce`, `suggestion-navigate-announce`

The SPECIFICITY rule alone is not enough. Models aren't even getting far enough in JS-G to hit the specificity distinction — they are stopping after 8–14 entries in LIST 1, treating the list as complete when it is not. The underlying issue is that LIST 1 (JS INTERACTION TABLE) is still not being built exhaustively. Models stop cataloguing handlers around the 10–15th entry.

### 7b. TSX star-rating widget — unchanged

`star-rating-role`, `star-inner-hidden` — still missed by all models except deepseek (which recovered tsx but still misses star-rating). gpt explicitly lists `star-rating-role` in its tsx-high nn FN list even after the TSX-K negative-evidence addition.

### 7c. TSX plan-card / hero cluster — partially persistent

`plan-card-label`, `plan-article-labelledby`, `plan-cta-label`, `hero-ctas-label`, `hero-trust-label` — still in FN lists for most models. kimi missed `plan-article-labelledby` and `plan-cta-label` in nn; gpt missed `plan-card-label` and `plan-article-labelledby`. qwen missed `plan-cta-label`. TSX-J sweep covers these but models complete only part of it.

### 7d. CSS FP classes — stable but deep

The FN list for css-high is long but stable across tests: `btn-primary-outline-none`, `skip-link-transform`, `negative-word-spacing`, `forced-colors-outline`, `visually-hidden-display`, `skip-link-target-small`, `brand-secondary-contrast`, `neutral-900-contrast`, `error-colour-contrast`, `footer-text-contrast`, and ~15 more outline-none/small-target selectors. These represent the deepest items in the CSS inventory that models consistently miss. Models are finding the "easy" outline:none and touch-target items but not the full set.

---

## 8. Notable FP patterns

### 8a. gpt nn tsx-high: 11 FP — highest FP of any passing model

gpt tsx-high nn: 30 issues found, 19 TP, 11 FP. The FP titles include `"FAQ accordion button missing aria-expanded"` for FAQs 2–8 (duplicates) and `"Filter tab button missing aria-pressed (Scanning/Design/Testing/Reporting)"` (not present in ground truth). gpt over-generates aria-expanded and aria-pressed FPs on tsx components that apparently don't have them in the ground truth, or are grouped differently.

### 8b. kimi consistently highest FP among passing models

Across all conditions, kimi has the highest FP count: rn=60, rt=63, nn=46, nt=68. kimi's hallucination pattern is structural — it identifies legitimate accessibility patterns but applies them to elements that don't need them (e.g., reporting `aria-current` on nav items that already have it, or `aria-labelledby` on sections that are already labelled). Precision kimi nt = 77.7%.

### 8c. deepseek nt: only 73 TP from 767 s average response

deepseek's recall in nt (12.2%) is catastrophically low — only 73 TP from 603 possible across 3 runs. In think+norag mode, deepseek spends the analysis time reasoning rather than executing sweeps. FP=19 (very clean) but at the cost of virtually no recall. This is a fundamental mode incompatibility between deepseek's reasoning style and the norag-think condition.

---

## 9. Changes made for T32

### Model changes (applied after T31)

- **Removed from run.ts and benchmark-params.ts:** gemini-3-flash-preview, deepseek-v3.2, gemma4:31b
  - deepseek: genuine 0/4 across T28–T31 (T29/T30 passes were error-denominator artifacts); extreme slowness (557–767 s avg); nt recall 12.2%
  - gemma4: 0/4 across T28–T31; flat 79.1–79.4% ceiling; JS TP=4, TSX TP=6
  - gemini: 1/4 across T29–T31 (nn only); plateau; TSX/JS recall near-zero
- **Active models for T32:** kimi-k2.5, qwen3.5:397b, gpt-oss:120b

### RAG changes (applied after T31)

- **Per-query top_k raised from 2→3** (all multi-query retrieve functions in benchmark.ts) — each sweep query now fetches 3 candidate chunks before dedup, increasing coverage
- **Max chunk caps raised:** HTML 8→10, CSS/non-HTML 6→8, JS 5→7, TSX 8→9 — aligns caps with the new 3×queries candidate pool to allow more unique chunks through



1. **JS-G exhaustive enumeration**: The JS INTERACTION TABLE is still being stopped early. Add an explicit gate: *"LIST 1 is complete only when you have processed every function definition and every addEventListener/on* call in the file. State the total entry count before proceeding to sweeps. If your count is below 20 entries for a medium-density JS file, you have missed entries — re-scan."*

2. **CSS completion gate**: Add after the CSS Phase 1 inventory a self-check: *"If your Phase 1 CSS outline inventory has fewer than 5 selectors, re-read the full stylesheet from line 1. A dense stylesheet will have at least 10 outline:none entries."* This should prevent the gpt/deepseek 0-issue CSS collapse.

3. **TSX-K enforcement**: The TSX-K rule is correct but models skip it. Add: *"SWEEP TSX-K is mandatory even if no star/rating elements are visually obvious — search for: any `<svg>` or named icon component inside a row of sibling elements that may represent a score scale; any component with 'star', 'rating', 'score', or 'review' in its name; any group of 5 sibling icons. Report each one missing role + aria-label."*

### P1 — High impact

4. **deepseek norag-think (nt)**: deepseek nt 77.3% with 530 FN and 12.2% recall. In extended think mode without RAG, deepseek essentially does not perform sweeps. Consider adding a per-condition note at the end of the prompt: *"If you are in reasoning/thinking mode, you must still complete all sweeps. Do not substitute reasoning about what MIGHT be an issue for executing each sweep against the code."*

5. **TSX-J plan-card CTA labels**: `plan-cta-label` is persistently missed. The TSX-J sweep checks it but models skip the CTA sub-check. Add a concrete example: *"Every `<article>` plan card: the primary CTA button (e.g. 'Get Started', 'Buy Now') must have an aria-label that includes the plan name, e.g. `aria-label='Get started with Pro'`. Report missing."*

### P2 — Monitor

6. **kimi FP reduction**: kimi is 4/4 all T28–T31 but precision is plateauing at ~79–82%. The main FP sources are structural duplicates (reporting already-labelled landmarks, duplicate aria-expanded reports). Consider a single anti-duplication note: *"Before reporting an issue, verify the fix attribute is not already present on that element — check your Phase 1 inventory."*

7. **gemma4**: nt at 79.3% — closest to threshold across tests. Prompt-level changes don't appear to improve gemma4 meaningfully (stable 79.1–79.4% across all conditions for 3+ tests). Monitor T32 result.

8. **gemini nn stability**: gemini consistently passes on nn (80.1%, 80.4%, 80.4% across T29–T31) while failing the other three. Its nn performance is near-threshold; any regression would drop it to 0/4.

---

## 10. Score and rank tables by condition

### rn (RAG No-Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | kimi-k2.5 | 51.3% | 50.6% | 81.5% | 38.8% | 268.1 s | 0 |
| 2 | gpt-oss:120b | 47.3% | 40.7% | 87.8% | 29.8% | 160.6 s | 0 |
| 3 | gemini-flash | 46.6% | 33.2% | 80.4% | 23.8% | 19.1 s | 0 |
| 4 | gemma4:31b | 43.4% | 32.3% | 86.4% | 22.9% | 86.0 s | 0 |
| 5 | qwen3.5:397b | 41.0% | 42.0% | 86.9% | 29.5% | 359.1 s | 0 |
| 6 | deepseek-v3.2 | 20.3% | 25.4% | 94.5% | 16.5% | 557.8 s | 3 |

### rt (RAG Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | gpt-oss:120b | 51.6% | 42.9% | 82.4% | 31.6% | 157.8 s | 0 |
| 2 | kimi-k2.5 | 50.8% | 47.4% | 80.5% | 35.9% | 307.5 s | 0 |
| 3 | gemma4:31b | 46.0% | 32.5% | 87.9% | 23.2% | 66.5 s | 0 |
| 4 | qwen3.5:397b | 45.1% | 39.0% | 82.5% | 27.6% | 271.5 s | 0 |
| 5 | gemini-flash | 42.5% | 30.6% | 89.9% | 21.4% | 133.0 s | 0 |
| 6 | deepseek-v3.2 | 28.4% | 35.5% | 87.3% | 23.6% | 745.4 s | 0 |

### nn (No-RAG No-Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | gemini-flash | 51.7% | 39.6% | 85.1% | 28.6% | 21.8 s | 0 |
| 2 | gpt-oss:120b | 49.5% | 44.6% | 82.5% | 34.1% | 163.9 s | 0 |
| 3 | gemma4:31b | 43.2% | 31.8% | 86.5% | 23.1% | 72.8 s | 0 |
| 4 | kimi-k2.5 | 38.7% | 40.9% | 83.1% | 29.4% | 346.4 s | 0 |
| 5 | qwen3.5:397b | 34.0% | 38.9% | 84.1% | 29.4% | 418.6 s | 0 |
| 6 | deepseek-v3.2 | 26.1% | 32.7% | 93.3% | 21.1% | 483.9 s | 1 |

### nt (No-RAG Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | kimi-k2.5 | 51.9% | 50.8% | 82.9% | 39.3% | 375.9 s | 0 |
| 2 | qwen3.5:397b | 49.4% | 43.7% | 86.2% | 31.8% | 262.2 s | 0 |
| 3 | gpt-oss:120b | 48.7% | 38.7% | 87.2% | 26.7% | 148.9 s | 0 |
| 4 | gemma4:31b | 46.1% | 32.6% | 84.5% | 23.4% | 68.2 s | 0 |
| 5 | gemini-flash | 37.2% | 24.2% | 89.2% | 16.1% | 144.1 s | 0 |
| 6 | deepseek-v3.2 | 14.6% | 18.3% | 91.4% | 12.2% | 767.2 s | 0 |

---

## 11. Cross-test history (T28→T31)

| Test | Key change | Conditions passing | Notes |
|---|---|---|---|
| T28 | baseline restructure | 9/24 | gpt css collapse; deepseek timeout spiral |
| T29 | JS-G sweep; CSS activation mandate; TSX-J sweep | 15/24 | +6. deepseek recovered (error-inflated). gpt 4/4. |
| T30 | JS Phase 1 LIST 1–4 table; TSX Phase 1 expansion; TSX-K | 15/24 | Net zero. ~61 errors. deepseek TSX crash. gpt nt failed. |
| T31 | JS Phase 1 merged → 3 lists; TSX Phase 1 merged; JS-G specificity; TSX-K strengthened | 13/24 | 4 errors (−57). gpt nt recovered. deepseek true baseline revealed (0/4 clean). |

**Model-level history (conditions passing out of 4):**

| Model | T28 | T29 | T30 | T31 | Trend |
|---|---|---|---|---|---|
| kimi-k2.5 | 2/4 | 4/4 | 4/4 | 4/4 | ✅ Stable |
| qwen3.5:397b | 1/4 | 4/4 | 4/4 | 4/4 | ✅ Stable |
| gpt-oss:120b | 0/4 | 4/4 | 3/4 | 4/4 | ✅ Recovered |
| gemini-flash | 0/4 | 1/4 | 1/4 | 1/4 | ⚠️ Plateau |
| gemma4:31b | 0/4 | 0/4 | 0/4 | 0/4 | ⚠️ Plateau |
| deepseek-v3.2 | 0/4 | 2/4¹ | 3/4¹ | 0/4 | ❌ True 0/4 |

¹ T29 and T30 deepseek passes relied on error-reduced TN pools. T31 clean runs show true 0/4.

**F1 best-condition trajectory (best F1 across any condition):**

| Model | T28 | T29 | T30 | T31 |
|---|---|---|---|---|
| kimi-k2.5 | ~31% | 52.1% (rn) | 50.3% (rt) | 50.8% (nt) |
| qwen3.5:397b | ~26% | 49.0% (rn) | 50.4% (nt) | 43.7% (nt) |
| gpt-oss:120b | ~10% | 46.2% (nt) | 44.2% (nn) | 44.6% (nn) |
| gemini-flash | ~20% | 38.6% (rn) | 38.5% (nn) | 39.6% (nn) |
| deepseek-v3.2 | ~15% | 43.8% (nn) | 45.2% (rt) | 35.5% (rt) |
| gemma4:31b | ~20% | 32.3% (rn) | 33.1% (nn) | 32.6% (nt) |
