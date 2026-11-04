# Test 30 — Results

**Date:** 2026-04-12  
**Conditions:** rn (rag-nothink), rt (rag-think), nn (norag-nothink), nt (norag-think)  
**Fixtures:** html-high, css-high, js-high, tsx-high (high-difficulty only)  
**Models:** 6 — kimi-k2.5, qwen3.5:397b, gpt-oss:120b, gemini-3-flash-preview, deepseek-v3.2, gemma4:31b  
**Changes from T29:** JS Phase 1 explicit event-handler table (LIST 1–4); JS-G row-by-row iteration; TSX Phase 1 article heading-text + star/rating widget inventories; TSX-K new sweep (star/rating roles); CSS FP cap (>25 issues → re-verify each); RAG TSX Sweep 4 added; TSX max chunks 6→8; CSS Sweep 1 extended with `box-shadow high contrast`; 5 knowledge base files extended.  
**Pass threshold:** ≥ 80.0% accuracy  
**Ground truth per condition:** 603 positive issues, 1 797 TN slots → 2 400 total per model

> ⚠️ **Run quality note:** T30 had significantly more timeouts than any prior test. Total errors: rn=22, rt=14, nn=14, nt=11. This is a marked increase from T29 (≈7 total). TN pool figures per model reflect reduced denominators wherever errors occurred. All accuracy calculations are computed over each model's actual completed-fixture subset; cross-condition and cross-test TP comparisons must account for these reduced pools.

---

## 1. Accuracy by condition (≥ 80.0% = PASS)

| Model | rn | rt | nn | nt | ≥80% |
|---|---|---|---|---|---|
| kimi-k2.5 | **81.0%**³ | **81.9%**³ | **82.0%**³ | **81.9%**⁰ | 4/4 ✅ |
| qwen3.5:397b | **81.0%**⁴ | **82.4%**⁴ | **81.2%**² | **82.3%**³ | 4/4 ✅ |
| deepseek-v3.2 | **81.0%**⁷ | **81.4%**⁵ | 79.9%⁵ | **80.7%**⁴ | 3/4 |
| gpt-oss:120b | **80.4%**⁵ | **80.7%**¹ | **81.3%**² | 79.3%¹ | 3/4 |
| gemini-3-flash-preview | 79.7%² | 78.8%⁰ | **80.1%**¹ | 77.5%¹ | 1/4 |
| gemma4:31b | 79.2%¹ | 78.8%¹ | 79.4%¹ | 78.3%³ | 0/4 ❌ |

Superscripts = error count for that model × condition.  
Bold = PASS. Italics on kimi-k2.5 nt: only clean-pool (0 errors) reference in the run.

**T30 total: 15/24 conditions passing** (unchanged from T29)  
kimi 4/4 + qwen 4/4 + deepseek 3/4 + gpt 3/4 + gemini 1/4 + gemma4 0/4

**Versus T29:** deepseek gained nt (+1 condition, 2/4→3/4). gpt lost nt (-1 condition, 4/4→3/4). kimi, qwen, gemini, gemma4 unchanged. Net shift = 0 additional conditions. The heavy error burden in T30 rn/rt invalidates direct TP-level comparisons for those conditions.

---

## 2. T29 → T30 deltas (rn condition)

| Model | T29 Acc | T30 Acc | Acc Δ | T29 F1 | T30 F1 | F1 Δ | T29 TP (0 err) | T30 TP | T30 Errors | Result |
|---|---|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 82.1% | 81.0% | −1.1pp | 52.1% | 47.3% | −4.8pp | 255 | 175 | 3 | PASS→PASS |
| qwen3.5:397b | 81.9% | 81.0% | −0.9pp | 49.0% | 42.3% | −6.7pp | 227 | 114 | 4 | PASS→PASS |
| deepseek-v3.2 | 80.7%³ | 81.0% | +0.3pp | 43.5% | 43.0% | −0.5pp | 147 | 77 | 7 | PASS→PASS |
| gpt-oss:120b | 81.1% | 80.4% | −0.7pp | 43.7% | 41.8% | −1.9pp | 185 | 109 | 5 | PASS→PASS |
| gemini-flash | 80.4% | 79.7% | **−0.7pp** | 38.6% | 36.7% | −1.9pp | 162 | 134 | 2 | **PASS→FAIL** |
| gemma4:31b | 79.3% | 79.2% | −0.1pp | 32.3% | 32.8% | +0.5pp | 140 | 134 | 1 | FAIL→FAIL |

Key observations:
- **All apparent TP drops are confounded by errors.** With 2–7 errors per model, the observable positive pool in rn shrank substantially. Comparing raw TP figures between T29 (clean run) and T30 rn (22 total errors) is unreliable.
- **gemini rn flipped PASS→FAIL by 0.7pp.** gemini had 2 errors in T30 rn vs 0 in T29. The reduced TN pool (1499 vs 1797) changed the denominator enough to push accuracy below threshold.
- **F1 is uniformly lower in T30 rn.** This is consistent with higher error rates reducing the observable TP pool, not a genuine recall regression.

---

## 3. TP / FP / FN totals by condition

### 3a. RAG No-Think (rn)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 175 | 81 | 276 | 1 349 | 81.0% | 38.8% | 47.3% | 3 |
| deepseek-v3.2 | 77 | 19 | 174 | 749 | 81.0% | 30.7% | 43.0% | 7 |
| qwen3.5:397b | 114 | 18 | 289 | 1 197 | 81.0% | 28.3% | 42.3% | 4 |
| gpt-oss:120b | 109 | 39 | 244 | 1 047 | 80.4% | 30.8% | 41.8% | 5 |
| gemini-flash | 134 | 47 | 367 | 1 499 | 79.7% | 26.8% | 36.7% | 2 |
| gemma4:31b | 134 | 48 | 419 | 1 647 | 79.2% | 24.3% | 32.8% | 1 |

### 3b. RAG Think (rt)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 181 | 68 | 270 | 1 349 | 81.9% | 40.2% | 50.3% | 3 |
| qwen3.5:397b | 140 | 23 | 263 | 1 197 | 82.4% | 34.8% | 48.3% | 4 |
| deepseek-v3.2 | 119 | 34 | 233 | 1 048 | 81.4% | 33.8% | 45.2% | 5 |
| gpt-oss:120b | 150 | 27 | 403 | 1 647 | 80.7% | 27.0% | 39.3% | 1 |
| gemma4:31b | 133 | 58 | 419 | 1 648 | 78.8% | 24.1% | 32.0% | 1 |
| gemini-flash | 107 | 16 | 496 | 1 797 | 78.8% | 17.7% | 27.8% | 0 |

### 3c. No-RAG No-Think (nn)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 172 | 53 | 280 | 1 348 | 82.0% | 38.1% | 49.3% | 3 |
| gpt-oss:120b | 164 | 42 | 339 | 1 497 | 81.3% | 32.6% | 44.2% | 2 |
| qwen3.5:397b | 165 | 47 | 338 | 1 497 | 81.2% | 32.8% | 44.5% | 2 |
| gemini-flash | 155 | 49 | 397 | 1 648 | 80.1% | 28.1% | 38.5% | 1 |
| deepseek-v3.2 | 100 | 39 | 250 | 1 050 | 79.9% | 28.6% | 37.0% | 5 |
| gemma4:31b | 132 | 41 | 420 | 1 648 | 79.4% | 23.9% | 33.1% | 1 |

### 3d. No-RAG Think (nt)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| qwen3.5:397b | 181 | 57 | 271 | 1 348 | 82.3% | 40.0% | 50.4% | 3 |
| kimi-k2.5 | 241 | 88 | 362 | 1 797 | 81.9% | 40.0% | 50.1% | **0** |
| deepseek-v3.2 | 117 | 30 | 285 | 1 198 | 80.7% | 29.1% | 41.1% | 4 |
| gpt-oss:120b | 126 | 37 | 426 | 1 648 | 79.3% | 22.9% | 32.3% | 1 |
| gemma4:31b | 67 | 5 | 386 | 1 347 | 78.3% | 14.8% | 25.4% | 3 |
| gemini-flash | 62 | 4 | 491 | 1 647 | 77.5% | 11.2% | 18.9% | 1 |

Notable: kimi-k2.5 nt is the only clean reference (0 errors, TN=1 797) in the entire T30 run.

---

## 4. Per-fixture TP breakdown (nn condition)

### T30 nn fixture TP

| Fixture | kimi | qwen | gpt | gemini | deepseek | gemma4 |
|---|---|---|---|---|---|---|
| html-high (~51 pos) | 13 | **27** | 20 | 9 | ERR | 9 |
| css-high (~50 pos) | **30** | 27 | 17 | 27 | 26 | 26 |
| js-high (~50 pos) | 13 | **17** | 14 | 8 | 10 | 5 |
| tsx-high (~50 pos) | 23 | 14 | **26** | 11 | **0** | 6 |

deepseek html-high errored (timeout). deepseek tsx-high completed but returned 0 TP — a catastrophic regression (was 22 TP in T29 nn).

### T29 → T30 per-fixture deltas (nn)

| Fixture | kimi Δ | qwen Δ | gpt Δ | gemini Δ | deepseek Δ | gemma4 Δ |
|---|---|---|---|---|---|---|
| html-high | +1 (12→13) | **+10** (17→27) | −2 (22→20) | 0 (9→9) | N/A | 0 (9→9) |
| css-high | +4 (26→30) | 0 (27→27) | 0 (17→17) | +3 (24→27) | +5 (21→26) | +1 (25→26) |
| js-high | −1 (14→13) | **+7** (10→17) | +4 (10→14) | +1 (7→8) | −1 (11→10) | 0 (5→5) |
| tsx-high | **+7** (16→23) | +3 (11→14) | +1 (25→26) | +2 (9→11) | **−22** (22→0) | +1 (5→6) |

Key wins:
- **qwen html-high +10** — structural HTML improvements in Phase 1 benefited qwen significantly.
- **qwen js-high +7** — JS Phase 1 event-handler table + JS-G row-by-row iteration produced the largest JS gain of any model.
- **kimi tsx-high +7** — TSX Phase 1 expansions (article inventories + star-widget inventory) + TSX-K sweep lifted kimi tsx substantially.
- **css-high broadly stable/improved** — CSS FP cap did not hurt TP; several models gained 1–5 TP. CSS FP values remain controlled.

Critical regression:
- **deepseek tsx-high −22 (22→0)** — deepseek completely stopped finding TSX issues in the norag-nothink condition. See §6 for root cause analysis.

---

## 5. Hypothesis verification

| Hypothesis | Outcome |
|---|---|
| JS Phase 1 event-handler table forces exhaustive JS enumeration | ✅ Partial — qwen js +7, gpt js +4. However, ~65% FN still persists; announcement suite mostly still missed. |
| JS-G row-by-row iteration improves announcement detection | ✅ Partial — same evidence as above; not separable from Phase 1 table effect. |
| TSX Phase 1 heading/star inventories raise TSX recall | ✅ For kimi (+7) and qwen (+3); ❌ for deepseek (−22). Net effect is mixed. |
| TSX-K star-rating sweep detects star/rating widget issues | ⚠️ Unverifiable — most T30 nn TSX FNs still include `star-rating-role`; the sweep added instructions but recall did not improve meaningfully for that specific concept ID. |
| CSS FP cap (>25 → re-verify) suppresses CSS false positives | ✅ CSS FP counts remain well-controlled (kimi=14, qwen=16, gemini=13, deepseek=15, gpt=2, gemma4=11 in nn). No inflation detected. |
| gemma4 can reach ≥80% with better prompt structure | ❌ Not yet — 0/4 for third consecutive benchmark. Regression in nt (78.3% vs 78.9% T29). Prompt-length reductions in T31 are the next lever. |
| Error rate stays at T29 level | ❌ T30 had approximately 8× more errors than T29 (≈61 vs ≈7). New JS event-handler table substantially increased prompt length and likely caused timeouts. |

---

## 6. Root cause analysis

### 6a. deepseek TSX catastrophic regression (tsx-high nn: 22→0 TP)

deepseek found zero TSX issues under norag-nothink. It is the only model to regress this severely, and it did so only on tsx (css/js were unchanged or better). The most likely cause is the TSX Phase 1 addition of two new inventory blocks (article heading-text inventory + star/rating widget inventory) combined with the TSX-K sweep. These additions increased TSX prompt length substantially. For models with a tighter tolerance for long structured prompts (deepseek has shown sensitivity to this in prior tests), the combined Phase 1 inventory + Sweep K likely caused the model to either:

1. Truncate the sweep execution silently (context length boundary hit mid-prompt), or  
2. Confuse the inventory-scanning phase with the result-reporting phase and return the inventory as a "nothing found" trace.

The regression does not appear in rn/rt because RAG context presumably anchors deepseek's TSX Phase 1 execution. Without RAG (nn/nt conditions), deepseek processes TSX from structure alone and cannot recover.

nt data is less useful here because deepseek nt had 4 errors, but the partial TP (117 total across all 4 fixtures) implies tsx-high nt was also heavily impacted.

### 6b. gpt nt regression (PASS 81.3% → FAIL 79.3%)

T29 gpt nt: TP=212, TN=1797, recall=35.2%. T30 gpt nt: TP=126, TN=1648 (1 error), recall≈22.9% (or ≈27.8% adjusted for the error-reduced pool). Even adjusted, a ~7pp recall regression is significant. gpt was the only model to consistently PASS all 4 conditions in T29 and regressed to 3/4 in T30.

The most likely cause is the new JS Phase 1 table structure interacting with norag-think mode. In think mode without RAG context, gpt may over-reason on the large JS event-handler table (LIST 1–4), spending its inference budget on JS before reaching TSX; or the extended TSX Phase 1 inventories are partially processed before a timeout on the reasoning trace.

gpt rn and nn retained PASS despite the error increase, suggesting ts (think) mode specifically amplifies the prompt-length sensitivity.

### 6c. Error rate surge (≈61 errors total vs ≈7 in T29)

T29 ran with the JS-G sweep pattern (~4 lines). T30 added an explicit 4-list event-handler table in JS Phase 1, expanded TSX Phase 1 with two inventory lists and a new sweep (TSX-K). The combined prompt length increase is the most parsimonious explanation for the error surge:

- Models that already had marginal timeout risk (deepseek, gpt) were pushed past their effective analysis window.
- Errors cluster heavily in rn (22 errors): rn = long RAG context + long prompt = maximum token pressure point.
- rt had fewer errors than rn despite think mode, likely because think mode manages context allocation differently than nothink.

### 6d. gemma4 still below threshold (0/4 third benchmark in a row)

gemma4 reached its lowest result ever in nt: 78.3%, TP=67, recall=14.8%. It produced only 5 FP across all nt fixtures — extreme conservatism. In think mode without RAG, gemma4 ignores structured sweep instructions entirely and performs a shallow accessibility scan. CSS performance remains adequate (26 TP in nn) but JS (5 TP) and TSX (6 TP) are the main drag. The prompt-length reduction targeted for T31 (§9) may free up capacity for gemma4 to follow structured sweeps; it remains in the benchmark.

---

## 7. Persistent FN patterns (all models, all conditions)

### 7a. JS announcement suite — still largely undetected

All models across all conditions continue to miss the vast majority of JS live-region announcements:

`scroll-top-announce`, `filter-result-announce`, `view-mode-announce`, `filter-reset-announce`, `billing-period-announce`, `comparison-expand-announce`, `faq-open-announce`, `faq-open-all-announce`, `faq-close-all-announce`, `shortcut-search-announce`, `shortcut-nav-announce`, `shortcut-main-announce`, `shortcut-footer-announce`, `nav-open-announce`, `nav-close-announce`, `search-submit-announce`, `search-clear-announce`, `suggestion-navigate-announce`

Best js-high performance in T30 nn: qwen 17/50 (34% recall). The event-handler table helps models find the handlers but models still fail to conclude that each handler needs a companion live-region write.

Root cause: JS-G says "for every row in LIST 2, check whether a visible change is announced via a live region." Models mark this step satisfied if any live region is found anywhere on the page, rather than verifying that each specific state change has a dedicated announcement.

### 7b. TSX plan-card / stat / hero cluster

Concept IDs still missed by most models in most conditions:

`plan-card-label`, `plan-article-labelledby`, `plan-cta-label`, `stat-value-label`, `stats-bar-labelledby`, `hero-ctas-label`, `hero-trust-label`, `hero-section-labelledby`

kimi improved from 8→12 on this cluster (rn) but these IDs remain miss-dominant. TSX Sweep 4 (plan-card) was added in T30 RAG but appears insufficient. The norag conditions rely on TSX-H (landmark labelling sweep) which does not reach plan-card sub-elements.

### 7c. TSX star-rating widget

`star-rating-role`, `star-inner-hidden` — missed by all models in all conditions despite TSX-K sweep. The sweep correctly names the required roles (`role="img"` + `aria-label` for read-only) but models still fail to flag the absence of these attributes. TSX-K needs stronger negative-evidence framing: "Report a missing `role` attribute as an issue even if the element renders correctly."

### 7d. HTML heading cluster

`features-heading-id`, `learn-more-link`, `step1-heading-skip`, `logo-bar-aria-label`, `partner-logo-alt` — persistent across all models in html-high. qwen's +10 improvement came primarily from link-name and heading structure issues; the above IDs still escape most models.

---

## 8. Notable FP patterns

### 8a. gemma4 rt: FP=58 in rag-think

gemma4 produced 58 FP in rt — the highest FP count of any model in any condition. In think mode with RAG, gemma4 appears to treat RAG snippet matches as ground truth for hallucinating issues. This is not fixable without changing the model.

### 8b. kimi-k2.5 nt: FP=88 — highest FP of any passing model

kimi nt is the only clean reference point in T30 (0 errors). With 88 FP, precision = 73.3%. This is structurally consistent with T29 (kimi nt FP=79) and represents kimi's characteristic over-detection pattern in think mode without RAG. kimi's high recall (40.0%) comes at the cost of precision.

### 8c. JS hallucination under gemini-flash (rn/nn)

gemini-flash hallucinated JS labels in rn and nn:  
`"Missing accessible name"`, `"Non-native interactive element missing keyboard support"`, `"Missing autocomplete attribute"` — these appear as FP titles on js-high. These are category-level labels, not specific element+attribute citations. This suggests gemini-flash is still not producing the required `element | attribute/value | WCAG ref | fix` structure for JS issues.

### 8d. CSS "focus indicator removed" FP surge under qwen/deepseek/kimi

Multiple models hallucinate `:focus-visible { outline: none }` removals on elements that do not exist in the fixture, or report `box-shadow` focus styles as "removed" rather than recognising them as compliant replacements. The CSS FP cap partially mitigated this (re-verification step flagged some) but not all models applied it consistently.

---

## 9. Changes made for T31

All changes applied to `evaluation/Cloud-LLM-Preliminary/benchmark-prompt.ts`.

### P0 — Applied (regression fixes)

1. **JS Phase 1 shortened — LIST 1+2 merged into JS INTERACTION TABLE**: The T30 LIST 1–4 structure increased timeout rate 8×. LIST 1 (toggle functions) and LIST 2 (event handlers) are now a single combined table with columns: `function/handler | element | trigger | visible DOM change | aria notes`. Old LIST 3 → LIST 2 (validation), old LIST 4 → LIST 3 (visibility-toggled elements). Phase 1 is now THREE lists instead of FOUR.

2. **TSX Phase 1 shortened — article + star-rating bullets merged**: The two separate T30 inventory bullets (article heading-text and star/review widget) are now one combined bullet. This reduces TSX Phase 1 length for deepseek in norag conditions, addressing the 22→0 tsx-high TP regression.

3. **JS-A and JS-G updated to reference new LIST 1**: All sweep cross-references updated from `LIST 2 (event handlers)` → `LIST 1 (JS Interaction Table)` to stay consistent with the Phase 1 renumbering.

### P1 — Applied (recall improvements)

4. **TSX-K negative-evidence framing strengthened**: Added `⚠ The absence of role and aria-label IS the accessibility defect — report it even if the element renders visually correctly. Do not skip any star/rating element that lacks these attributes.` Targets persistent `star-rating-role` / `star-inner-hidden` zero-detection.

5. **JS-G live-region specificity added**: Added `⚠ SPECIFICITY: An aria-live write satisfies this check only if it announces this specific state change. A generic status region written to by multiple unrelated actions does NOT count — each action must have its own dedicated announcement.` Targets the JS announcement suite FN cluster.

### Not yet applied (still pending / monitor)

6. **gemma4** — monitor after prompt compression. If nt TP=67 persists in T31, investigate context-length ceiling.
7. **Deepseek nt improvement** — verify in T31 whether 80.7% holds with fewer errors.
8. **CSS `:focus-visible` FP clarification** — `box-shadow` inside `:focus-visible` is a valid replacement; already covered by anti-FP rule [x] but may need reinforcing if FP rate rises.
9. **Gemini TSX/JS** — gemini is 1/4 across T28–T30; consider mandatory-sweep reminder if plateau continues into T31.

---

## 10. Score and rank tables by condition

### rn (RAG No-Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | gemini-flash | 49.4% | 36.7% | 84.4% | 26.8% | 205.8 s | 2 |
| 2 | gpt-oss:120b | 41.6% | 41.8% | 78.8% | 30.8% | 335.7 s | 5 |
| 3 | deepseek-v3.2 | 41.0% | 43.0% | 84.2% | 30.7% | 352.4 s | 7 |
| 4 | kimi-k2.5 | 37.8% | 47.3% | 77.3% | 38.8% | 424.9 s | 3 |
| 5 | gemma4:31b | 35.6% | 32.8% | 85.0% | 24.3% | 322.5 s | 1 |
| 6 | qwen3.5:397b | 35.0% | 42.3% | 87.4% | 28.3% | 412.2 s | 4 |

### rt (RAG Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | deepseek-v3.2 | 51.7% | 45.2% | 84.4% | 33.8% | 329.1 s | 5 |
| 2 | gemini-flash | 42.2% | 27.8% | 89.5% | 17.7% | 313.3 s | 0 |
| 3 | kimi-k2.5 | 40.2% | 50.3% | 76.9% | 40.2% | 384.2 s | 3 |
| 4 | qwen3.5:397b | 40.1% | 48.3% | 88.8% | 34.8% | 379.1 s | 4 |
| 5 | gemma4:31b | 37.0% | 32.0% | 83.6% | 24.1% | 343.6 s | 1 |
| 6 | gpt-oss:120b | 32.8% | 39.3% | 84.9% | 27.0% | 379.4 s | 1 |

### nn (No-RAG No-Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | gemini-flash | 50.8% | 38.5% | 82.3% | 28.1% | 218.8 s | 1 |
| 2 | kimi-k2.5 | 42.2% | 49.3% | 81.7% | 38.1% | 407.4 s | 3 |
| 3 | gpt-oss:120b | 40.7% | 44.2% | 86.1% | 32.6% | 380.2 s | 2 |
| 4 | qwen3.5:397b | 38.5% | 44.5% | 81.1% | 32.8% | 406.8 s | 2 |
| 5 | gemma4:31b | 37.0% | 33.1% | 85.5% | 23.9% | 322.5 s | 1 |
| 6 | deepseek-v3.2 | 29.6% | 37.0% | 79.7% | 28.6% | 438.4 s | 5 |

### nt (No-RAG Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | kimi-k2.5 | 42.9% | 50.1% | 78.2% | 40.0% | 391.6 s | **0** |
| 2 | deepseek-v3.2 | 42.8% | 41.1% | 87.1% | 29.1% | 344.8 s | 4 |
| 3 | qwen3.5:397b | 40.3% | 50.4% | 78.8% | 40.0% | 410.3 s | 3 |
| 4 | gemma4:31b | 40.3% | 25.4% | 94.0% | 14.8% | 277.7 s | 3 |
| 5 | gpt-oss:120b | 29.7% | 32.3% | 84.6% | 22.9% | 384.9 s | 1 |
| 6 | gemini-flash | 27.5% | 18.9% | 86.4% | 11.2% | 328.7 s | 1 |

---

## 11. Cross-test history (T28→T30)

| Test | Key change | Conditions passing | Notes |
|---|---|---|---|
| T28 | baseline restructure | 9/24 | gpt css collapse; deepseek timeout spiral |
| T29 | JS-G sweep; CSS activation mandate; TSX-J sweep; generalised fixture names | 15/24 | +6. deepseek recovered. gpt reached 4/4. |
| T30 | JS Phase 1 table; JS-G row-iteration; TSX Phase 1 expansions; TSX-K; CSS FP cap; gemma4 retest | 15/24 | Net zero. deepseek 2/4→3/4; gpt 4/4→3/4. Error rate 8×. deepseek TSX regression. |

**Model-level history (conditions passing out of 4):**

| Model | T28 | T29 | T30 | Trend |
|---|---|---|---|---|
| kimi-k2.5 | 2/4 | 4/4 | 4/4 | ✅ Stable |
| qwen3.5:397b | 1/4 | 4/4 | 4/4 | ✅ Stable |
| gpt-oss:120b | 0/4 | 4/4 | 3/4 | ⚠️ Minor regression |
| gemini-flash | 0/4 | 1/4 | 1/4 | ⚠️ Plateau |
| deepseek-v3.2 | 0/4 | 2/4 | 3/4 | 📈 Improving |
| gemma4:31b | 0/4 | 0/4 | 0/4 | ⚠️ Plateau |

**F1 best-condition trajectory (best F1 across any condition):**

| Model | T28 best F1 | T29 best F1 | T30 best F1 |
|---|---|---|---|
| kimi-k2.5 | ~31% | 52.1% | 50.3% (rt) |
| qwen3.5:397b | ~26% | 49.0% | 50.4% (nt) |
| gpt-oss:120b | ~10% | 46.2% | 44.2% (nn) |
| gemini-flash | ~20% | 38.6% | 38.5% (nn) |
| deepseek-v3.2 | ~15% | 43.8% | 45.2% (rt) |
| gemma4:31b | ~20% | 32.3% | 33.1% (nn) |
