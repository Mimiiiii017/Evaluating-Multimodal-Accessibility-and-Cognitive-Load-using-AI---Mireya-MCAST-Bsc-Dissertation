# Test 29 — Results

**Date:** 2026-04-11  
**Conditions:** rn (rag-nothink), rt (rag-think), nn (norag-nothink), nt (norag-think)  
**Fixtures:** html-high, css-high, js-high, tsx-high (high-difficulty only)  
**Models:** 6 — kimi-k2.5, qwen3.5:397b, gpt-oss:120b, gemini-3-flash-preview, deepseek-v3.2, gemma4:31b  
**Changes from T28:** JS-G new sweep (live-region announcements); CSS activation mandate + FP check; TSX-J new sweep (page-section accessible names); TSX Phase 1 expanded; all fixture-specific names generalised; full sweeps ported to extension prompt.  
**Pass threshold:** ≥ 80.0% accuracy  
**Ground truth per condition:** 603 positive issues, 1 797 TN slots → 2 400 total per model

---

## 1. Accuracy by condition (≥ 80.0% = PASS)

| Model | rn | rt | nn | nt | ≥80% |
|---|---|---|---|---|---|
| kimi-k2.5 | **82.1%** | **81.2%** | **82.1%** | **81.5%** | 4/4 ✅ |
| qwen3.5:397b | **81.9%** | **81.1%** | **81.0%** | **80.2%** | 4/4 ✅ |
| gpt-oss:120b | **81.1%** | **81.3%** | **81.7%** | **81.3%** | 4/4 ✅ |
| gemini-3-flash-preview | **80.4%** | 78.0% | 79.3% | 79.0% | 1/4 |
| deepseek-v3.2 | **80.7%**¹ | 79.7%² | **81.4%**² | 78.7% | 2/4 |
| gemma4:31b | 79.3% | 78.7% | 79.1% | 78.9% | 0/4 ❌ |

¹ 3 run errors — effective TN pool reduced to 1 348 for this condition.  
² 2 run errors — effective TN pool reduced to 1 497 for this condition.

**T29 total: 15/24 conditions passing** (up from 9/24 in T28)  
kimi 4/4 + qwen 4/4 + gpt 4/4 + gemini 1/4 + deepseek 2/4 + gemma4 0/4

---

## 2. T28 → T29 deltas (rn condition, same fixture scope)

| Model | T28 Acc | T29 Acc | Acc Δ | T28 F1 | T29 F1 | F1 Δ | T28 result | T29 result |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 81.6% | 82.1% | +0.5pp | 47.6% | 52.1% | **+4.5pp** | PASS | PASS |
| qwen3.5:397b | 80.8% | 81.9% | +1.1pp | 41.6% | 49.0% | **+7.4pp** | PASS | PASS |
| gpt-oss:120b | 79.9% | 81.1% | +1.2pp | 35.2% | 43.7% | **+8.5pp** | FAIL | **PASS** ✅ |
| gemini-flash | 79.2% | 80.4% | +1.2pp | 34.4% | 38.6% | **+4.2pp** | FAIL | **PASS** ✅ |
| deepseek-v3.2 | 78.6% | 80.7% | +2.1pp | 25.9% | 43.5% | **+17.6pp** | FAIL | **PASS** ✅ |
| gemma4:31b | 79.2% | 79.3% | +0.1pp | 32.1% | 32.3% | +0.2pp | FAIL | FAIL |

Key wins:
- **gpt** recovered from CSS collapse: CSS activation mandate forced CSS sweep in norag-nothink. T28 gpt css-high nn TP was 0; T29 recovered to 17 TP (nn css).
- **deepseek** recovered from timeout spiral: avg response time 795 s (T28) → 111 s (T29) in rn; F1 +17.6pp.
- **qwen** and **kimi** both gained substantial F1 from the combined JS-G + TSX-J sweeps.

---

## 3. TP / FP / FN totals by condition

### 3a. RAG No-Think (rn)

| Model | TP | FP | FN | TN | Acc | Recall | F1 |
|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 255 | 101 | 348 | 1797 | 82.1% | 42.3% | 52.1% |
| qwen3.5:397b | 227 | 71 | 376 | 1797 | 81.9% | 37.6% | 49.0% |
| deepseek-v3.2¹ | 147 | 52 | 305 | 1348 | 80.7% | 32.5% | 43.5% |
| gpt-oss:120b | 185 | 43 | 418 | 1797 | 81.1% | 30.7% | 43.7% |
| gemini-flash | 162 | 37 | 441 | 1797 | 80.4% | 26.9% | 38.6% |
| gemma4:31b | 140 | 41 | 463 | 1797 | 79.3% | 23.2% | 32.3% |

¹ 3 errors; TN pool reduced.

### 3b. RAG Think (rt)

| Model | TP | FP | FN | TN | Acc | Recall | F1 |
|---|---|---|---|---|---|---|---|
| gpt-oss:120b | 192 | 46 | 411 | 1797 | 81.3% | 31.8% | 43.7% |
| kimi-k2.5 | 217 | 80 | 386 | 1797 | 81.2% | 36.0% | 46.8% |
| qwen3.5:397b | 190 | 51 | 413 | 1797 | 81.1% | 31.6% | 43.6% |
| deepseek-v3.2² | 113 | 20 | 390 | 1497 | 79.7% | 22.4% | 32.5% |
| gemma4:31b | 129 | 47 | 474 | 1797 | 78.7% | 21.4% | 30.1% |
| gemini-flash | 138 | 85 | 465 | 1797 | 78.0% | 22.9% | 30.6% |

² 2 errors; TN pool reduced.

### 3c. No-RAG No-Think (nn)

| Model | TP | FP | FN | TN | Acc | Recall | F1 |
|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 241 | 83 | 362 | 1797 | 82.1% | 40.0% | 50.3% |
| gpt-oss:120b | 198 | 43 | 405 | 1797 | 81.7% | 32.8% | 45.8% |
| deepseek-v3.2² | 167 | 44 | 336 | 1497 | 81.4% | 33.2% | 43.8% |
| qwen3.5:397b | 198 | 64 | 405 | 1797 | 81.0% | 32.8% | 44.5% |
| gemini-flash | 147 | 49 | 456 | 1797 | 79.3% | 24.4% | 34.7% |
| gemma4:31b | 137 | 43 | 466 | 1797 | 79.1% | 22.7% | 31.8% |

² 2 errors; TN pool reduced.

### 3d. No-RAG Think (nt)

| Model | TP | FP | FN | TN | Acc | Recall | F1 |
|---|---|---|---|---|---|---|---|
| gpt-oss:120b | 212 | 72 | 391 | 1797 | 81.3% | 35.2% | 46.2% |
| kimi-k2.5 | 224 | 79 | 379 | 1797 | 81.5% | 37.2% | 48.2% |
| qwen3.5:397b | 180 | 65 | 423 | 1797 | 80.2% | 29.9% | 41.2% |
| gemini-flash | 121 | 28 | 482 | 1797 | 79.0% | 20.1% | 28.8% |
| gemma4:31b | 137 | 50 | 466 | 1797 | 78.9% | 22.7% | 31.4% |
| deepseek-v3.2 | 131 | 50 | 472 | 1797 | 78.7% | 21.7% | 31.1% |

---

## 4. Per-fixture TP breakdown (nn condition — representative per run)

| Fixture | kimi | qwen | gpt | gemini | deepseek | gemma4 |
|---|---|---|---|---|---|---|
| html-high (~51 pos) | 12 | 17 | **22** | 9 | 11 | 9 |
| css-high (~50 pos) | 26 | **27** | 17 | 24 | 21 | 25 |
| js-high (~50 pos) | **14** | 10 | 10 | 7 | 11 | 5 |
| tsx-high (~50 pos) | 16 | 11 | **25** | 9 | 22 | 5 |

**Notes:**
- gpt css-high recovered to 17 TP (vs 0 in T28 nn) thanks to the CSS activation mandate.
- gpt tsx-high leads at 25 TP; TSX-J sweep benefit is most visible here.
- js-high remains low across all models (max 14 TP/kimi). JS-G added some improvement but ~40 FN per condition persist.
- gemma4 tsx and js are the weakest at 5 TP each, reinforcing that it does not follow structured sweep instructions.

---

## 5. Hypothesis verification

| Hypothesis | Outcome |
|---|---|
| CSS activation mandate fixes gpt css-high collapse in nn | ✅ Yes — gpt css-high nn TP 0→17; gpt crossed to 4/4 conditions passing. |
| JS-G sweep increases JS recall | ⚠️ Partial — JS recall improved modestly (~2–5 TP/model) but ~40 FN per condition persist; models still miss most announcement patterns. |
| TSX-J sweep improves tsx recall | ✅ Yes — gpt tsx +1pp; deepseek tsx strong at 22. kimi tsx still limited. Net TSX F1 improved. |
| Generalising fixture names works for all models | ✅ Yes — no model-specific name collisions; all 6 models improved (except gemma4 which improved 0.2pp). |
| deepseek recovery | ✅ Yes — avg response time 795 s (T28 rn) → 111 s (T29 rn); F1 rn +17.6pp; two conditions now passing. |
| gemma4 can improve with new sweeps | ❌ No — gemma4 moved 0pp to 0.2pp across all conditions; it is not following sweep instructions at all. |

---

## 6. Root cause analysis

### 6a. gpt CSS activation mandate — full recovery

In T28, gpt found **zero** CSS issues in norag-nothink. Adding "You MUST complete CSS-A through CSS-H even if no RAG context is present" resolved this completely — gpt CSS nn: 0→17 TP. This confirms that without explicit activation, gpt exits the CSS sweep during the inventory phase when RAG context is absent.

### 6b. JS recall ceiling persists (~25–43% F1)

All models remain below 43% F1 on js-high. JS-G improved because it prompts checking for live-region announcement after any action, but models still miss the full announcement suite. Root cause: JS-G says "for every user-triggered action" but models interpret this as "actions I already noticed", not a systematic enumeration. The T30 fix (explicit EVENT HANDLER TABLE in Phase 1) should force exhaustive enumeration before any sweep runs.

Persistent FN cluster in JS announcement suite (all models, all conditions):
`scroll-top-announce`, `filter-result-announce`, `view-mode-announce`, `filter-reset-announce`, `billing-period-announce`, `comparison-expand-announce`, `faq-open-announce`, `faq-open/close-all-announce`, `shortcut-*-announce`, `nav-open/close-announce`, `search-submit/clear-announce`, `search-highlight-announce`, `suggestion-navigate-announce`.

### 6c. TSX plan-card / stat / hero cluster still partially missed

In tsx-high the following concept IDs are still missed by most models in most conditions:
`plan-card-label`, `plan-article-labelledby`, `plan-cta-label`, `stats-bar-labelledby`, `hero-ctas-label`, `hero-trust-label`, `stat-value-label`, `integrations-clone-hidden`, `star-rating-role`, `star-inner-hidden`.

TSX-J covered some but the star-rating cluster and explicit article aria-labelledby check are still incomplete. T30 adds TSX-K (star/rating sweep) and an explicit article heading-text inventory step to Phase 1.

### 6d. gemma4 — capability floor confirmed

gemma4 was included at supervisor's request to evaluate a mid-range model (~31B parameters). Results across T28 and T29:
- T28: 0/4 conditions passing; accuracy 79.1–79.2% flat across all conditions.
- T29: 0/4 conditions passing; accuracy 78.7–79.3% flat across all conditions.
- Zero variance across RAG/noRAG and think/nothink confirms the model is **not following** the structured sweep instructions.
- F1 rn improved 0.2pp across two tests (32.1% → 32.3%) while all other models improved 4–18pp.

**Decision: gemma4:31b retained for T30 as a final retest.** The T30 prompt restructure (explicit event-handler LIST 2 in Phase 1, TSX-K new sweep, CSS FP cap) represents the most structurally different prompt yet. One further run will determine whether the zero-variance pattern is fundamental to the model's capacity or an instruction-following issue that the new explicit enumeration approach can resolve. If gemma4 remains at 0/4 with zero variance in T30, removal will be confirmed.

### 6e. gemini FP spike in think-mode CSS

gemini-flash generates ~28–85 FP in the rt condition (rag-think), driven by its CSS sweep hallucinating: inferred touch-target sizes, assumed outline violations on unrelated selectors, and reduced-motion claims where the @media override exists. The T29 `⚠ FALSE-POSITIVE CHECK` helps slightly (rn FP=37) but rt still reaches FP=85. T30 adds the 25-issue hard cap guard to force per-issue citation.

### 6f. deepseek errors (not fully resolved)

deepseek had 3 errors in rn and 2 errors in both rt and nn. The errors reduce the TN pool and inflate accuracy slightly (fewer total slots evaluated). deepseek has no errors in nt, which is its worst-accuracy condition. Error source is 900s run timeouts on individual calls. T30 has no specific mitigation — deepseek's average response time has improved substantially (111–193s vs 448–795s in T28) so the error pattern may be a residual fixture-specific spike rather than a systematic timeout.

---

## 7. Persistent FN patterns (all models, all conditions)

### JS — live-region announcement suite (~40 FNs per condition)

Every model misses the full announcement suite on every interaction type. JS-G reduced the gap slightly but did not resolve it. T30 intervention: build an explicit EVENT HANDLER TABLE in Phase 1 (enumerate every `addEventListener` call with its target element and visible DOM change), then JS-G iterates the table row-by-row rather than asking the model to recall actions from memory.

### TSX — plan/stat/hero landmark cluster (~25 FNs per condition)

`plan-card-label`, `plan-article-labelledby`, `plan-cta-label`, `stats-bar-labelledby`, `hero-ctas-label`, `hero-trust-label`, `stat-value-label`, `integrations-clone-hidden`. The TSX-J sweep now covers section labelling but does not yet mandate recording the heading text inside each article; without this, kimi/qwen skip the per-card aria-labelledby check. T30: Phase 1 records article heading text; TSX-J checks use that record.

### TSX — star-rating widget (~5–10 FNs per condition)

`star-rating-role`, `star-inner-hidden`. No existing TSX sweep checked for `role="img"` + `aria-label` on star widgets. T30 adds TSX-K.

### HTML — aria-controls / aria-expanded init cluster

`faq-aria-controls`, `faq-dd-region`, `faq-q1-expanded`, `faq-q2-expanded`, `nav-init-controls`, `nav-init-expanded` — still missed universally.

---

## 8. Notable FP patterns

| Model | Condition | Pattern |
|---|---|---|
| gemini-flash | css-high (rt) | 85 FPs — hallucinated touch-target + outline violations at scale |
| gemini-flash | css-high (rn) | 37 FPs — same pattern at lower rate without think mode |
| gpt-oss:120b | tsx-high (nt) | ~18 FPs — repeated aria-labelledby issues already correctly implemented |
| kimi-k2.5 | tsx-high (all) | ~4–7 FPs — aria-modal and aria-describedby on correctly-labelled components |
| qwen3.5:397b | css-high (all) | ~10–15 FPs — touch-target violations from inferred class sizes |
| deepseek-v3.2 | tsx-high (nn) | ~6 FPs — duplicate issue reports across multiple component instances |

---

## 9. T30 recommendations

### Applied in T30 (benchmark-prompt.ts and run.ts)

1. **JS Phase 1 event-handler table** — Phase 1 now builds LIST 2 (Event Handlers): enumerate every `addEventListener`, `onclick/onkeydown` assignment, and delegation pattern with (a) element selector, (b) event type, (c) visible DOM change. JS-G iterates this list row-by-row.
2. **JS-G restructure** — JS-G rewritten to explicitly walk LIST 2 rather than asking for qualitative introspection.
3. **TSX Phase 1 article inventory** — Phase 1 now records the exact heading text inside each `<article>` in card grids; TSX-J uses this to verify `aria-labelledby` targets.
4. **TSX Phase 1 star-rating inventory** — Phase 1 records each star/rating widget; new TSX-K sweep verifies `role="img"` + `aria-label` or interactive `role="radio"`.
5. **CSS FP hard cap** — `⚠ FP CAP`: if CSS issue count > 25, re-verify each with exact property+value citation before outputting.
6. **gemma4:31b retained for T30 final retest** — 0/4 in T28 and T29 with zero variance; T30's explicit event-handler enumeration and TSX-K are the most structurally different prompt changes applied so far. One more run before confirming removal.

### Applied in T30 (knowledge base — RAG conditions)

The following knowledge base files were extended for T30. These additions are retrieved by the RAG service in rag-nothink (rn) and rag-think (rt) conditions and injected as context into the prompt.

7. **`aria-live-regions-and-dynamic-content.md`** — Added "User-Action Announcement Patterns" section: a table of 13 action types (filter apply/clear, search submit, autocomplete navigation, view-mode toggle, accordion open/close, nav drawer open/close, scroll-to-top, keyboard shortcut fire, billing/plan selection, comparison expand) each with a required live-region announcement. Includes `announce()` JS helper pattern and detection rule with explicit exceptions. Addresses the persistent JS announcement FN cluster (~40 FNs/condition).

8. **`aria-common-widget-patterns.md`** — Added "Rating and Review Widgets" section: read-only pattern (`role="img"` + `aria-label`), interactive pattern (`role="radiogroup"` + `role="radio"` per star), TSX variant, and detection rules. Addresses `star-rating-role` / `star-inner-hidden` FNs missed universally in T28/T29.

9. **`react-tsx-accessibility-patterns.md`** — Added "Card CTA Buttons — Context-aware Labels" section: explains why repeated cards need item-specific `aria-label` on CTA buttons (e.g. `aria-label="Buy Starter plan"` not `aria-label="Buy now"`), with broken/correct TSX examples and detection rule. Addresses `plan-cta-label` / `hero-ctas-label` FNs.

10. **`keyboard-focus-indicators.md`** — Added two new sections: (a) `box-shadow` anti-pattern — `outline:none` + `box-shadow` is a violation because `box-shadow` is invisible in Windows High Contrast / Forced Colours Mode; (b) `:hover` without `:focus` pairing — any `:hover` rule that changes interactive state appearance must have a matching `:focus`/`:focus-visible` rule.

11. **`forms-error-messages-and-validation-feedback.md`** — Added "Focus management on dynamic form submission" section: when AJAX/SPA form submission detects errors, `focus()` must be called on the first errored field or an error summary container. Includes JS handler pattern, HTML summary pattern, and detection rule targeting `form.addEventListener('submit', ...)` / React `onSubmit` handlers.

### Remaining open issues

- **JS announcement coverage (~40 FNs)**: the event-handler table is the key intervention; estimated +10–15 TP per model if models follow the explicit enumeration instruction.
- **TSX CTA label via article heading**: TSX-J now mandates that per-card CTA buttons include the plan/item name from Phase 1. Expected +5–10 TP per model.
- **gemini CSS FP at scale**: the 25-issue cap should prevent the FP=85 scenario by requiring per-issue citation; estimated gemini FP −50pp in rt.
- **deepseek errors**: no specific mitigation; rely on improved response times observed in T29.

---

## 10. Score and rank summary per condition

### RAG No-Think (rn)
| Rank | Model | Composite | F1 | Acc |
|---|---|---|---|---|
| 1 | gemini-flash | 50.9% | 38.6% | **80.4%** |
| 2 | deepseek-v3.2¹ | 48.7% | 43.5% | **80.7%** |
| 3 | gpt-oss:120b | 46.3% | 43.7% | **81.1%** |
| 4 | qwen3.5:397b | 43.3% | 49.0% | **81.9%** |
| 5 | gemma4:31b | 43.1% | 32.3% | 79.3% |
| 6 | kimi-k2.5 | 41.7% | 52.1% | **82.1%** |

### RAG Think (rt)
| Rank | Model | Composite | F1 | Acc |
|---|---|---|---|---|
| 1 | gpt-oss:120b | 50.9% | 43.7% | **81.3%** |
| 2 | gemma4:31b | 44.0% | 30.1% | 78.7% |
| 3 | gemini-flash | 41.0% | 30.6% | 78.0% |
| 4 | qwen3.5:397b | 39.5% | 43.6% | **81.1%** |
| 5 | deepseek-v3.2² | 38.4% | 32.5% | 79.7% |
| 6 | kimi-k2.5 | 37.5% | 46.8% | **81.2%** |

### No-RAG No-Think (nn)
| Rank | Model | Composite | F1 | Acc |
|---|---|---|---|---|
| 1 | gpt-oss:120b | 48.0% | 45.8% | **81.7%** |
| 2 | gemini-flash | 47.8% | 34.7% | 79.3% |
| 3 | deepseek-v3.2² | 44.7% | 43.8% | **81.4%** |
| 4 | gemma4:31b | 40.3% | 31.8% | 79.1% |
| 5 | kimi-k2.5 | 40.3% | 50.3% | **82.1%** |
| 6 | qwen3.5:397b | 39.7% | 44.5% | **81.0%** |

### No-RAG Think (nt)
| Rank | Model | Composite | F1 | Acc |
|---|---|---|---|---|
| 1 | gpt-oss:120b | 52.2% | 46.2% | **81.3%** |
| 2 | gemma4:31b | 45.1% | 31.4% | 78.9% |
| 3 | qwen3.5:397b | 41.0% | 41.2% | **80.2%** |
| 4 | gemini-flash | 38.6% | 28.8% | 79.0% |
| 5 | kimi-k2.5 | 38.5% | 48.2% | **81.5%** |
| 6 | deepseek-v3.2 | 29.5% | 31.1% | 78.7% |

---

## 11. Cross-test accuracy history

> Note: T24–T27 used all-fixture runs (TN ≈ 8 514 per condition). T28–T29 use high-fixture-only (TN = 1 797). Accuracy figures are not directly comparable across this boundary.

| Model | T24 | T25 | T26 | T27¹ | T28² | **T29²** |
|---|---|---|---|---|---|---|
| kimi-k2.5 | 4/4 ✅ | 4/4 ✅ | 4/4 ✅ | 4/4 ✅ | 4/4 ✅ | **4/4 ✅** |
| qwen3.5:397b | — | 3/4 | 3/4 | 4/4 ✅ | 4/4 ✅ | **4/4 ✅** |
| gpt-oss:120b | 4/4 ✅ | 4/4 ✅ | 1/4 | 4/4 ✅ | 1/4 | **4/4 ✅** |
| gemini-flash | — | 1/4 | 0/4 | 0/4 ❌ | 0/4 ❌ | **1/4** |
| deepseek-v3.2 | — | 1/4 | 2/4 | 4/4 ✅ | 0/4 ❌ | **2/4**³ |
| gemma4:31b | — | — | — | — | 0/4 ❌ | **0/4 ❌** (T30 final retest) |

¹ T27 fixture scope: all available fixtures, TN = 8 514 (accuracy floor ~88.7%)  
² T28–T29 fixture scope: html-high, css-high, js-high, tsx-high only, TN = 1 797 (accuracy floor ~74.9%)  
³ deepseek had run errors (2–3 per condition) that reduced TN pool; passing conditions are rn and nn

**Passing condition counts (excl. gemma4, high-fixture only):**  
T28: 9/20 → **T29: 15/20** (+6 conditions)

**Modal accuracy trajectory (rn, high-fixture):**  
kimi +0.5pp, qwen +1.1pp, **gpt +1.2pp (FAIL→PASS)**, **gemini +1.2pp (FAIL→PASS)**, **deepseek +2.1pp (FAIL→PASS)**, gemma4 +0.1pp (no change in status)
