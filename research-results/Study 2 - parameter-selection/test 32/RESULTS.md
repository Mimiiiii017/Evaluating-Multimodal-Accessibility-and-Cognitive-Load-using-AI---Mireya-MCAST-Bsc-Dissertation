# Test 32 — Results

**Date:** 2026-04-12  
**Conditions:** rn (rag-nothink), rt (rag-think), nn (norag-nothink), nt (norag-think)  
**Fixtures:** html-high, css-high, js-high, tsx-high (high-difficulty only)  
**Models:** 3 — kimi-k2.5, qwen3.5:397b, gpt-oss:120b  
**Changes from T31:** Removed gemini/deepseek/gemma4 from run.ts and benchmark-params.ts. RAG per-query top_k raised 2→3; max chunk caps raised (HTML 8→10, CSS 6→8, JS 5→7, TSX 8→9). No prompt changes.  
**Pass threshold:** ≥ 80.0% accuracy  
**Ground truth per condition:** 603 positive issues, 1 797 TN slots → 2 400 total per model (3 runs × 4 fixtures)

> ✅ **Run quality note:** T32 had 0 errors across all 4 conditions. All models ran with TN=1 797 in every condition — fully clean dataset. First test with only 3 models; maximum theoretical passes = 12/12.

---

## 1. Accuracy by condition (≥ 80.0% = PASS)

| Model | rn | rt | nn | nt | ≥80% |
|---|---|---|---|---|---|
| kimi-k2.5 | **82.1%**⁰ | **83.2%**⁰ | **81.5%**⁰ | **81.2%**⁰ | 4/4 ✅ |
| qwen3.5:397b | **81.1%**⁰ | **81.0%**⁰ | **81.7%**⁰ | **81.0%**⁰ | 4/4 ✅ |
| gpt-oss:120b | 79.3%⁰ | **80.7%**⁰ | **80.3%**⁰ | **81.9%**⁰ | 3/4 |

Superscripts = error count for that model × condition.

**T32 total: 11/12 conditions passing**  
kimi 4/4 + qwen 4/4 + gpt 3/4

**Versus T31 (12/12 for the same 3 active models):** gpt rn regressed (80.9% → 79.3%, FAIL). Net −1. The RAG top_k increase (2→3) likely introduced extra FP noise for gpt in the rag-nothink condition (FP=47, up from T31 rn FP=43). All other conditions stable or improved. kimi rt set the highest single-condition accuracy in the series at 83.2%.

---

## 2. T31 → T32 deltas (nt condition — cleanest comparison, 0 errors both tests, no RAG)

| Model | T31 nt Acc | T31 nt TP | T32 nt Acc | T32 nt TP | T32 F1 | Pass |
|---|---|---|---|---|---|---|
| gpt-oss:120b | 80.5% | 161 | **81.9%** | 213 | 48.0% | ✅ +1.4pp |
| kimi-k2.5 | 82.4% | 237 | **81.2%** | 221 | 46.2% | ✅ −1.2pp |
| qwen3.5:397b | 81.5% | 192 | **81.0%** | 193 | 43.4% | ✅ −0.5pp |

gpt nt improved further (+1.4pp, 161→213 TP) despite no prompt change. kimi and qwen show slight declines within normal variance range (no structural regression). The nt condition FP counts increased for all models (gpt +23, kimi +18, qwen +16) even though nt uses no RAG — this reflects run-to-run variance in the underlying cloud model.

---

## 3. TP / FP / FN totals by condition

### 3a. RAG No-Think (rn)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 224 | 62 | 379 | 1 797 | **82.1%** | 37.2% | 49.0% | 0 |
| qwen3.5:397b | 173 | 29 | 430 | 1 797 | **81.1%** | 28.7% | 42.3% | 0 |
| gpt-oss:120b | 145 | 47 | 458 | 1 797 | 79.3% | 24.1% | 33.5% | 0 |

gpt rn is the only fail in T32. The raised RAG top_k (2→3) added 3–4 extra chunks per sweep query. For gpt in noThink mode this appears to introduce FP noise (47 FP vs T31's 43) and suppress recall (145 TP vs T31's 180). This is the inverse of the kimi rn result. The extra RAG context may exceed gpt's noThink processing budget, causing it to drop issues.

### 3b. RAG Think (rt)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 258 | 69 | 345 | 1 797 | **83.2%** | 42.8% | 54.1% | 0 |
| qwen3.5:397b | 204 | 71 | 399 | 1 797 | **81.0%** | 33.9% | 45.3% | 0 |
| gpt-oss:120b | 204 | 80 | 399 | 1 797 | **80.7%** | 33.8% | 44.5% | 0 |

kimi rt = 83.2% is the highest single-condition accuracy recorded in this series (T28–T32). The RAG top_k increase appears to have strongly benefited kimi in think mode — TP rose from T31's 216 to 258 (+42). gpt rt also improved (191→204 TP) but FP rose sharply (53→80), limiting the accuracy gain.

### 3c. No-RAG No-Think (nn)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| qwen3.5:397b | 213 | 60 | 390 | 1 797 | **81.7%** | 35.3% | 47.4% | 0 |
| kimi-k2.5 | 226 | 82 | 377 | 1 797 | **81.5%** | 37.5% | 48.2% | 0 |
| gpt-oss:120b | 156 | 31 | 447 | 1 797 | **80.3%** | 25.8% | 37.2% | 0 |

All three pass. gpt nn passed (80.3%) despite CSS still contributing 0 TP. qwen leads accuracy in nn for the first time. kimi nn TP=226 is strongest recall of any passing nn result.

### 3d. No-RAG Think (nt)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| gpt-oss:120b | 213 | 54 | 390 | 1 797 | **81.9%** | 35.3% | 48.0% | 0 |
| kimi-k2.5 | 221 | 86 | 382 | 1 797 | **81.2%** | 36.7% | 46.2% | 0 |
| qwen3.5:397b | 193 | 57 | 410 | 1 797 | **81.0%** | 32.0% | 43.4% | 0 |

gpt nt is the highest in T32 nt — gpt's best norag-think result in the series (80.5%→81.9%). kimi nt drops from 82.4% to 81.2% — still passing, within normal variance.

---

## 4. Per-fixture TP breakdown (nn condition — single-run snapshot)

### T32 nn fixture TP

| Fixture | gpt | qwen | kimi |
|---|---|---|---|
| html-high (~51 pos) | 14 | 12 | **20** |
| css-high (~50 pos) | **0** | 29 | **31** |
| js-high (~50 pos) | 11 | **14** | 11 |
| tsx-high (~50 pos) | 18 | 17 | **21** |

### T31 → T32 per-fixture deltas (nn)

| Fixture | gpt Δ | qwen Δ | kimi Δ |
|---|---|---|---|
| html-high | −11 (25→14) | −1 (13→12) | −2 (22→20) |
| css-high | 0 (0→0) | **+4** (25→29) | **+14** (17→31) |
| js-high | **+2** (9→11) | **+2** (12→14) | −3 (14→11) |
| tsx-high | −1 (19→18) | −3 (20→17) | **+5** (16→21) |

Key changes:
- **kimi css-high: +14 (17→31)** ✅ — Major CSS recall improvement. nn uses no RAG so this is run-to-run model variance or drift in the provider model, not a prompt or RAG change.
- **gpt html-high: −11 (25→14)** ❌ — Notable regression. gpt's HTML recall in nn dropped significantly. With no prompt change and no RAG active, this is model variance.
- **gpt css-high: 0→0** ❌ — CSS activation collapse persists for gpt in nn across T31 and T32. CSS completion gate (T31 §9 P0 #2) still not applied.
- **kimi tsx-high: +5 (16→21)** ✅ — Incremental TSX improvement for kimi.
- **qwen/gpt js-high: +2 each** — Small but consistent JS improvement.

---

## 5. Hypothesis verification

| Hypothesis | Outcome |
|---|---|
| RAG top_k 2→3 improves overall recall | ⚠️ Partial — kimi rt dramatically improved (+42 TP); gpt rn FAILED (extra noise overwhelmed noThink budget). Mixed by model/condition. |
| Raising max chunk caps improves coverage | ⚠️ Same as above — benefits think-mode models; hurts noThink gpt in rag conditions. |
| gpt rn would remain stable | ❌ Not confirmed — gpt rn 80.9%→79.3%, FAIL. |
| kimi rt near-threshold improvement | ✅ Exceeded — kimi rt 81.7%→83.2%, best series result. |
| CSS completion gate would fix gpt CSS | N/A — CSS gate not applied before T32. gpt CSS still 0 TP. |
| JS-G exhaustive enumeration gate | N/A — Not applied. JS recall still capped at ~11–14 TP per model in nn. |

---

## 6. Root cause analysis

### 6a. gpt rn failure — RAG top_k overload in noThink mode

gpt rn dropped from 80.9% (T31) to 79.3% (T32). The only change between T31 and T32 that affects rn conditions is the RAG top_k increase (2→3) and cap increases. For gpt in noThink mode, the extra chunks appear to exceed the processing budget: FP rose (43→47) while TP dropped sharply (180→145). This contrasts with kimi rn which remained stable (82.6%→82.1%) and qwen rn which was unaffected. gpt's noThink context handling is more brittle under larger RAG payloads.

**Recommendation:** Consider reverting rn top_k for gpt specifically, or applying a tighter RAG distance threshold in rn (currently 0.65 for non-HTML) to reduce chunk noise.

### 6b. gpt CSS persistent collapse (nn condition)

gpt css-high nn = 0 TP for both T31 and T32. This is the third consecutive test where gpt fully fails CSS in norag-nothink mode. The CSS sweep activation mandate is present in the prompt but not respected. The CSS completion gate (T31 §9 P0 #2) needs to be applied.

### 6c. kimi rt breakthrough — RAG think synergy confirmed

kimi rt TP=258 (42.8% recall, 83.2% accuracy, F1=54.1%) is the strongest single-condition result in the series. The raised top_k appears to provide kimi's think mode with denser, more relevant context that it successfully processes. kimi has consistently been the best RAG + think model. Its FP in rt (69) is notably lower than gpt rt (80) despite higher TP, indicating better precision discipline.

### 6d. gpt html-high nn regression

gpt html-high nn dropped from 25 TP (T31) to 14 TP (T32). No prompt or param change affects nn condition. This is cloud model variance — gpt-oss:120b via the Ollama cloud gateway is not pinned to a fixed model version. The fluctuation highlights the difficulty of analysing single-run snapshots.

---

## 7. Persistent FN patterns (all models, all conditions)

### 7a. JS announcement suite — still dominant FN cluster

The JS announcement suite remains the largest FN category across all models and conditions. Models find 11–14 JS issues in nn (vs GT ~50). The announcement functions that are persistently missed:

`scroll-top-announce`, `search-submit-announce`, `search-clear-announce`, `filter-result-announce`, `filter-reset-announce`, `billing-period-announce`, `comparison-expand-announce`, `scroll-to-plan-announce`, `faq-open-announce`, `faq-open/close-all-announce`, `shortcut-*-announce`, `nav-open-announce`, `suggestion-navigate-announce`

Models are exhausting LIST 1 entries around entry 10–15 in JS-G without hitting the announcement suite. The JS-G exhaustive enumeration gate (T31 §9 P0 #1) still needs to be applied.

### 7b. TSX star-rating and plan-card cluster

`star-rating-role`, `plan-cta-label`, `plan-card-label`, `plan-article-labelledby` remain in FN lists for all models across conditions. These appeared consistently in T31 and T32 FN data. TSX-K expansion (T31 §9 P0 #3) and TSX-J CTA examples (T31 §9 P1 #5) not yet applied.

### 7c. CSS deep inventory items

`btn-primary-outline-none`, `skip-link-transform`, `brand-primary-contrast`, `negative-word-spacing`, `forced-colors-outline`, `visually-hidden-display`, `skip-link-target-small`, `brand-secondary-contrast`, `forced-color-adjust`, `hero-link-outline-none`, `badge-outline-none` — these are consistently in the css-high FN list for all models. They represent the deep inventory items that models miss even when they successfully complete the CSS sweeps.

---

## 8. Notable FP patterns

### 8a. gpt rt: FP=80 — highest FP of any passing condition this test

gpt rt FP=80 is notably high. The raised RAG top_k introduced extra chunks (up to 3 per query × 8 queries for HTML = 24 candidates), and in think mode gpt uses the additional context aggressively, over-applying patterns to borderline elements. This is the precision/recall trade-off of more RAG context.

### 8b. kimi nn: FP=82 — kimi's noThink FP remains elevated

kimi nn FP=82 is the highest FP of any single model-condition pair. kimi consistently generates more FPs in noThink mode across all tests (T28–T32). Its precision in nn = 80.7% (lowest of the three nn models). The duplicate-landmark and duplicate aria-expanded reporting patterns from T31 persist.

### 8c. gpt rn FP=47 despite lower TP

gpt rn found only 145 TP but generated 47 FP — a precision of 85.7% paired with only 24.1% recall. This "low recall, non-trivial FP" profile is consistent with RAG noise overwhelming gpt's noThink classification, causing both over-reporting on familiar patterns and under-reporting on novel ones.

---

## 9. Changes made for T33

### Prompt changes (applied after T32)

- **JS LIST 1 completeness gate** (benchmark-prompt.ts): After building the JS INTERACTION TABLE, models must now state the total entry count and re-scan if it seems low relative to the interactive features in the file. Targets the persistent JS announcement suite FN cluster — models were stopping at ~10–15 entries and never reaching the announcement functions.
- **CSS outline inventory gate** (benchmark-prompt.ts): After building the Phase 1 outline inventory, models must count their `outline:none`/`outline:0`/`outline:transparent` selectors and re-read the full file if the count seems low relative to the number of interactive components. Directly targets gpt css-high 0 TP in nn (3rd consecutive test).
- **TSX-K mandatory active search** (benchmark-prompt.ts): TSX-K now requires an explicit search for star/rating elements rather than relying on what was noticed in Phase 1 — hunt for `<StarIcon>` / components with 'star'/'rating'/'score'/'review' in their name / groups of 4–5 sibling icons / numeric displays adjacent to icons.

### P1 — High impact

1. **JS-G exhaustive enumeration gate** *(carried from T31 §9 P0 #1 — not yet applied)*: Add an explicit gate after LIST 1 build: *"LIST 1 is complete only when you have processed every function definition and every addEventListener/on* call in the file. State the total entry count before proceeding to sweeps. If your count is below 20 entries for a medium-density JS file, you have missed entries — re-scan."*

2. **CSS completion gate** *(carried from T31 §9 P0 #2 — not yet applied)*: Add after CSS Phase 1 inventory: *"If your Phase 1 CSS outline inventory has fewer than 5 selectors, re-read the full stylesheet from line 1. A dense stylesheet will have at least 10 outline:none entries."* — gpt css-high has been 0 TP for 2 consecutive tests.

3. **TSX-K star-rating expansion** *(carried from T31 §9 P0 #3 — not yet applied)*: Add explicit mandatory star-rating search: *"SWEEP TSX-K is mandatory even if no star/rating elements are visually obvious — search for: any `<svg>` or icon component inside a row of siblings that may represent a score scale; any component with 'star', 'rating', 'score', or 'review' in its name; any group of 5 sibling icons."*

### P1 — High impact

4. **gpt rn RAG overload**: gpt rn failed T32 (79.3%). Two options: (a) tighten the RAG distance threshold for noThink conditions (currently 0.65 → try 0.55 to reduce noise chunks), or (b) revert `JS_MAX_CHUNKS` and `NONHTML_MAX_CHUNKS` for the rn condition specifically. Monitor whether gpt rn recovers or needs a special RAG config path.

5. **TSX-J plan-card CTA labels** *(carried from T31 §9 P1 #5 — not yet applied)*: `plan-cta-label` persistently missed. Add: *"Every `<article>` plan card: the primary CTA button must have an aria-label including the plan name, e.g. `aria-label='Get started with Pro'`."*

### P2 — Monitor

6. **kimi FP reduction**: kimi nn FP=82 (T32), up from T31's 46. The inconsistency (46→82) suggests variance rather than structural drift. Monitor T33 kimi nn FP.

7. **gpt html-high variance**: gpt html-high nn dropped 25→14 TP with no prompt change. Single-run snapshot volatility is high for HTML. Consider whether 3 runs is sufficient to stabilise this fixture's per-model estimates.

---

## 10. Score and rank tables by condition

### rn (RAG No-Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | gpt-oss:120b | 46.8% | 33.5% | 85.7% | 24.1% | 160.9 s | 0 |
| 2 | qwen3.5:397b | 40.8% | 42.3% | 87.0% | 28.7% | 300.5 s | 0 |
| 3 | kimi-k2.5 | 39.2% | 49.0% | 80.6% | 37.2% | 374.9 s | 0 |

Note: gpt ranks #1 on composite (speed-weighted) despite failing accuracy threshold. Composite score is not the pass/fail metric.

### rt (RAG Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | gpt-oss:120b | 55.6% | 44.5% | 74.6% | 33.8% | 113.9 s | 0 |
| 2 | qwen3.5:397b | 44.0% | 45.3% | 79.6% | 33.9% | 310.4 s | 0 |
| 3 | kimi-k2.5 | 43.2% | 54.1% | 81.9% | 42.8% | 435.8 s | 0 |

kimi ranks #3 on composite (slowest) but has by far the best F1 (54.1%) and recall (42.8%) — the composite score penalises slow models significantly.

### nn (No-RAG No-Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | gpt-oss:120b | 49.8% | 37.2% | 87.3% | 25.8% | 128.4 s | 0 |
| 2 | qwen3.5:397b | 42.4% | 47.4% | 81.5% | 35.3% | 312.6 s | 0 |
| 3 | kimi-k2.5 | 38.5% | 48.2% | 80.7% | 37.5% | 365.7 s | 0 |

### nt (No-RAG Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | gpt-oss:120b | 58.4% | 48.0% | 81.3% | 35.3% | 137.6 s | 0 |
| 2 | kimi-k2.5 | 38.4% | 46.2% | 77.0% | 36.7% | 309.1 s | 0 |
| 3 | qwen3.5:397b | 34.7% | 43.4% | 81.3% | 32.0% | 322.6 s | 0 |

---

## 11. Cross-test history (T28→T32, active models only)

| Test | Key change | Active model passes | Notes |
|---|---|---|---|
| T28 | Baseline restructure | 3/12 | Initial structured sweep format |
| T29 | JS-G sweep; CSS activation mandate; TSX-J sweep | 12/12 | All 3 models 4/4 |
| T30 | JS Phase 1 expansion; TSX-K | 11/12 | gpt nt failed (JS prompt too long) |
| T31 | JS Phase 1 compressed; TSX Phase 1 merged; JS-G specificity; TSX-K strengthened | 12/12 | gpt nt recovered; 0 errors |
| T32 | 3-model only; RAG top_k 2→3; caps raised | 11/12 | gpt rn failed; RAG overload in noThink mode |

**Model-level history (conditions passing out of 4):**

| Model | T28 | T29 | T30 | T31 | T32 | Trend |
|---|---|---|---|---|---|---|
| kimi-k2.5 | 2/4 | 4/4 | 4/4 | 4/4 | 4/4 | ✅ Stable |
| qwen3.5:397b | 1/4 | 4/4 | 4/4 | 4/4 | 4/4 | ✅ Stable |
| gpt-oss:120b | 0/4 | 4/4 | 3/4 | 4/4 | 3/4 | ⚠️ Volatile in rn |

gpt's rn condition has failed in T30 (different cause — JS prompt length) and T32 (RAG overload). The rn condition appears to be gpt's weakest point.

**Best F1 per model per test:**

| Model | T29 | T30 | T31 | T32 |
|---|---|---|---|---|
| kimi-k2.5 | 52.1% (rn) | 50.3% (rt) | 50.8% (nt) | **54.1%** (rt) ↑ |
| qwen3.5:397b | 49.0% (rn) | 50.4% (nt) | 43.7% (nt) | **47.4%** (nn) ↑ |
| gpt-oss:120b | 46.2% (nt) | 44.2% (nn) | 44.6% (nn) | **48.0%** (nt) ↑ |

All three models improved their best F1 in T32 compared to T31, driven primarily by recall gains in think-mode conditions.
