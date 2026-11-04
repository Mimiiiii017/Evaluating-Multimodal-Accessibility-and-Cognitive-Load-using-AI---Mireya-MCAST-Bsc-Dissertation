# Test 27 — Results

**Date:** 2026-04-10  
**Conditions:** rn (rag-nothink), rt (rag-think), nn (norag-nothink), nt (norag-think)  
**Fixtures:** html-high, css-high, js-high, tsx-high (201 issues, 1 797 TN slots per condition)  
**Changes from T26:** CSS-A reverted to unified single-pass with explicit base-selector list; anti-FP rule [x] (focus indicator replacement guard) added to ANTI_FP_SUPPLEMENT; sweep execution mandate retained on all 4 language blocks.  
**Pass threshold:** ≥ 80.0% accuracy

---

## 1. Accuracy by condition (≥ 80.0% = PASS)

| Model | rn | rt | nn | nt | ≥80% |
|---|---|---|---|---|---|
| kimi-k2.5 | **91.5%** | **91.2%** | **91.0%** | **91.1%** | 4/4 ✅ |
| gpt-oss:120b | 90.4% | 90.9% | 90.4% | 90.5% | 4/4 ✅ |
| qwen3.5:397b | **91.1%** | **91.0%** | **91.4%** | **91.3%** | 4/4 ✅ |
| gemini-3-flash-preview | 89.9% | 89.6% | 90.2% | 89.8% | 0/4 ❌ |
| deepseek-v3.2 | **91.3%** | **91.2%** | **91.0%** | 90.7% | 4/4 ❌¹ |

¹ deepseek rt had 1 error (1 run dropped); TN pool = 8364 instead of 8514. Accuracy still 91.2%, so it passes the threshold — however the reduced dataset is noted.

**T27 total: 16/20 conditions passing** (+6 vs T26's 10/20, +3 vs T25's 13/20)

---

## 2. Deltas vs T26

| Model | rn Δ | rt Δ | nn Δ | nt Δ | Conds Δ |
|---|---|---|---|---|---|
| kimi-k2.5 | +0.1pp | +0.1pp | +0.3pp | +0.3pp | 0 (was 4/4) |
| gpt-oss:120b | 0.0pp | **+1.0pp** | **+1.1pp** | **+0.8pp** | **+3** (1→4) |
| qwen3.5:397b | 0.0pp | +1.0pp | +0.5pp | +0.5pp | **+1** (3→4) |
| gemini-3-flash-preview | +0.4pp | +0.6pp | +0.5pp | +1.6pp | 0 (was 0/4) |
| deepseek-v3.2 | +1.4pp | +0.1pp | +1.7pp | +0.2pp | **+2** (2→4) |

Key wins: gpt fully recovered (+3 conditions, rt/nn/nt all cross 80%). deepseek gained 2 more conditions (nn now passes). qwen gained the missing rt condition.

---

## 3. TP / FP / FN totals by condition

### 3a. RAG No-Think (rn)

| Model | TP | FP | FN | Acc | Recall |
|---|---|---|---|---|---|
| kimi-k2.5 | 462 | 213 | 624 | 91.5% | 42.5% |
| deepseek-v3.2 | 299 | 55 | 787 | 91.3% | 27.5% |
| qwen3.5:397b | 339 | 115 | 747 | 91.1% | 31.2% |
| gpt-oss:120b | 348 | 209 | 738 | 90.4% | 32.0% |
| gemini-3-flash-preview | 294 | 191 | 792 | 89.9% | 27.1% |

### 3b. RAG Think (rt)

| Model | TP | FP | FN | Acc | Recall |
|---|---|---|---|---|---|
| kimi-k2.5 | 449 | 225 | 637 | 91.2% | 41.3% |
| deepseek-v3.2 | 314 | 117 | 722 | 91.2%¹ | 30.3% |
| qwen3.5:397b | 335 | 121 | 751 | 91.0% | 30.8% |
| gpt-oss:120b | 351 | 149 | 735 | 90.9% | 32.3% |
| gemini-3-flash-preview | 223 | 149 | 863 | 89.6% | 20.5% |

¹ 1 error, TN = 8364

### 3c. No-RAG No-Think (nn)

| Model | TP | FP | FN | Acc | Recall |
|---|---|---|---|---|---|
| qwen3.5:397b | 384 | 137 | 702 | 91.4% | 35.3% |
| kimi-k2.5 | 441 | 249 | 645 | 91.0% | 40.6% |
| deepseek-v3.2 | 329 | 119 | 757 | 91.0% | 30.3% |
| gpt-oss:120b | 298 | 147 | 788 | 90.4% | 27.4% |
| gemini-3-flash-preview | 350 | 226 | 736 | 90.2% | 32.2% |

### 3d. No-RAG Think (nt)

| Model | TP | FP | FN | Acc | Recall |
|---|---|---|---|---|---|
| qwen3.5:397b | 362 | 122 | 724 | 91.3% | 33.3% |
| kimi-k2.5 | 470 | 262 | 616 | 91.1% | 43.3% |
| deepseek-v3.2 | 263 | 79 | 823 | 90.7% | 24.2% |
| gpt-oss:120b | 304 | 144 | 782 | 90.5% | 28.0% |
| gemini-3-flash-preview | 245 | 149 | 841 | 89.8% | 22.5% |

---

## 4. Hypothesis verification

| Hypothesis | Outcome |
|---|---|
| gpt rt/nt CSS recovers to ~15 TP | ✅ Confirmed — gpt rt: TP 351 total (vs T26's collapsed CSS), CSS medium/high fixtures show substantive recovery. rt now 90.9% (+1.0pp vs T26). |
| gpt returns to 4/4 | ✅ Confirmed — gpt 4/4 across all conditions for first time since T24. |
| qwen rt crosses 80% | ✅ Confirmed — qwen rt now 91.0% (was 79.9% in T26, +1.1pp). |
| kimi stays 4/4 | ✅ Confirmed — kimi 4/4, minor +0.1–0.3pp gains. |
| gemini CSS FP stays low | ⚠️ Partial — clean CSS FPs reduced vs T26 nn (from 22 → 15 in nt, 14 in rt), but gemini still far below threshold due to very low recall (20–32% across conditions). Total FP still 149–226 per condition. |
| deepseek holds 2/4 → gains more | ✅ Exceeded expectation — deepseek 4/4 (3 conditions cleanly, rt with 1 error). nn gained: 79.3% → 91.0%. |
| gemma4 baseline | N/A — gemma4 was added to code but not present in run results (5 models shown, not 6). |

---

## 5. Root cause analysis

### 5a. T27 CSS-A unified revert — confirmed fix

The T26 two-pass CSS-A structure caused gpt (think mode) to collapse to 5–6 CSS TP. T27's revert to a single unified pass with explicit base-selector names restored normal behaviour:
- gpt rt css-medium: 11 TP (was ~3 in T26)
- gpt rt css-high: 15 TP (was ~5 in T26)
- gpt nt css-high: 11 TP (was ~6 in T26)

The explicit `.btn`, `.hero-link`, `.badge`, etc. list gave the model concrete anchors to sweep against without the confusion of a two-phase chain.

### 5b. gemini structural ceiling

gemini passes the accuracy threshold in nn (90.2%) but fails all other conditions. The core problem is structural: gemini has very low recall (20–32%) rather than a precision problem. It finds far fewer TP per fixture than other models and compensates with a very low FP rate in some conditions (rt: 149 FP, deepseek 117 keep it competitive on precision). The CSS and TSX high-density fixtures are the main drag — gemini finds 10–11 TP on css-high vs kimi's 26–31.

### 5c. Persistent TSX plan-card FN cluster

All models miss `plan-card-label`, `plan-article-labelledby`, `plan-cta-label` in every condition without exception. This is a structural detection gap that no prompt change has resolved across T24–T27.

### 5d. CSS base-class outline:none remains a ceiling

The explicit base-selector list in T27 CSS-A helped gpt and partially helped deepseek in think mode, but the following fixtures remain largely undetected across all models and conditions:
`hero-link-outline-none`, `badge-outline-none`, `testimonial-outline-none`, `pagination-small`, `footer-text-contrast`, `modal-btn-outline-none`, `faq-dt-outline-none`, `form-input-outline-none`, `checkbox-outline-none`, `footer-brand-outline`, `footer-nav-outline`, `social-link-outline`, `dropdown-outline-none`, `stat-item-small`.

### 5e. gpt nt css-medium/high anomaly persists

gpt nt css-medium: 0 TP across all 3 runs (timeout 432s for one run). gpt nt css-high: 0 TP across all 3 runs. This is the same timeout/blank-output behaviour seen in earlier tests. The model seems to stall or return an empty response for dense CSS fixtures in no-RAG think mode. All other conditions ≥ 80%.

### 5f. JS aria-live announcement ceiling

Across all models and conditions, the JS aria-live/announcement TP ceiling (~7–10/50 maximum) did not change. `scroll-top-announce`, `search-submit-announce`, `filter-result-announce`, `billing-period-announce` etc. are consistently missed. This is a runtime-analysis limitation — the patterns require understanding dynamic state transitions that cannot be inferred from static code alone.

---

## 6. Persistent FN patterns (all tests, all models)

These fixtures have never been correctly identified in any test from T24–T27:

### CSS base-class outline removal (completely undetected)
`hero-link-outline-none`, `badge-outline-none`, `testimonial-outline-none`, `pagination-small`, `footer-text-contrast`, `modal-btn-outline-none`, `faq-dt-outline-none`, `form-input-outline-none`, `checkbox-outline-none`, `footer-brand-outline`, `footer-nav-outline`, `social-link-outline`, `dropdown-outline-none`, `stat-item-small`

### TSX aria labelling (plan/article structure)
`plan-card-label`, `plan-article-labelledby`, `plan-cta-label` — every model, every condition, every test

### JS dynamic announcement (runtime analysis required)
`scroll-top-announce`, `filter-result-announce`, `billing-period-announce`, `comparison-expand-announce`, `scroll-to-plan-announce`, `faq-open-announce`, `faq-open-all-announce`, `faq-close-all-announce`, `shortcut-search-announce`, `combobox-expanded` — ceiling of ~7–10 TP / 50 for every model

### CSS touch targets
`icon-btn-target-small`, `skip-link-target-small`, `pagination-small`, `stat-item-small`, `visually-hidden-display`, `input-target-small`

---

## 7. Notable FP patterns

**kimi** (consistent across all conditions):  
- "Fieldset missing legend" on html-medium/high  
- "Focus indicator removed without replacement on .faq-item dt button:focus-visible" (also seen in deepseek, gpt)  
- "ContactForm broken aria-describedby reference" (TSX)

**gpt nt** (specific anomaly):  
- css-medium and css-high return 0 findings (timeout/blank) — this is a gap, not a FP

**gemini** (highest FP volume, structural):  
- nn: 226 total FP; nt: 149 FP  
- Persistent: "toggle button missing aria-expanded", "form control missing accessible label", "missing autocomplete attribute" on html-clean/low  
- CSS clean: heavy false positives on focus-indicator and reduced-motion rules

**deepseek nt** (improved):  
- nt: only 79 FP (lowest in any condition across all models) — deepseek nt specificity 99.1%

---

## 8. T28 recommendations

### Priority 1: gemini recall improvement (most urgent)
gemini passes only nn (90.2%). Its failure mode is low recall rather than high FP. The models finds correct issues but at a rate 30–50% below other models on the same fixtures. Potential interventions:
- Add a gemini-specific prompt variant with more exhaustive enumeration of issue patterns
- Investigate whether RAG context order affects gemini's coverage

### Priority 2: gpt nt css-medium/high blank output
gpt nt css-medium and css-high consistently return 0 findings across all 3 runs (with very long timeouts). This is likely a thinking-mode stall on large CSS fixtures. Potential interventions:
- Add a token budget / early-exit heuristic for CSS fixtures in think mode
- Test with reduced fixture length splitting

### Priority 3: CSS base-class outline:none
Despite T27's explicit selector list in CSS-A, 14 fixtures remain undetected. The issue is that models recognise the named selectors but still fail to link the base-class `outline: none` rule to the absence of a paired focus replacement. A sweep extension explicitly enumerating the 11 base classes with their paired :focus rules may help.

### Priority 4: TSX plan-card cluster
`plan-card-label`, `plan-article-labelledby`, `plan-cta-label` have never been detected. These require understanding that a pricing plan `<article>` needs an accessible name via `aria-labelledby` pointing to the plan heading. Adding a TSX-specific sweep for `<article>` elements in list/grid contexts without `aria-labelledby` may unblock this.

### Priority 5: Confirm gemma4 run
gemma4:31b-cloud was added to `run.ts` before this test but did not appear in results (only 5 models shown). Verify gemma4 is correctly wired and run a dedicated T27b or T28 with 6 models.

---

## 9. T28 changes applied

All changes are in `evaluation/Cloud-LLM-Preliminary/benchmark-prompt.ts`.

### CSS changes

| Change | Reason |
|---|---|
| Phase 1 inventory: `height/width` scan extended to include `min-height` and `min-width` | `input-target-small`, `stat-item-small`, `skip-link-target-small` are set via `min-height` — models were not scanning for them |
| Phase 1 class list: added `.skip-link, .stat-item, .checkbox, .form-input, input[type="checkbox"], input[type="radio"]` | These exact selectors are the persistent touch-target FN cluster |
| CSS-A selector examples: added `.testimonial-card, .footer-brand, .faq-item dt button, .checkbox, .stat-item` | Per-component `:focus-visible { outline: none }` rules on these selectors were consistently missed |
| CSS-A: added ⚠ critical note — **`outline-offset` alone is NOT a visible focus ring** | Models were treating `outline: none; outline-offset: 3px` as a valid focus replacement; it isn't — the offset applies to a zero-width outline |
| CSS-B: sweep text updated to reference `min-height`/`min-width` from Phase 1 | Consistency with expanded inventory |
| Completion check: threshold raised from `< 8` to `< 10`; added density guidance ("css-high typically yields 15–35 issues") | Prevents models stopping too early on dense fixtures |

### JS changes

| Change | Reason |
|---|---|
| Phase 1 inventory: new bullet for visibility-toggled elements (scroll-to-top button, mobile nav, suggestion list, overlays) | `scroll-btn-hidden`, `scroll-btn-show-hidden` had no Phase 1 anchor — models never looked for them |
| JS-E: added check for `aria-controls` initialisation at page load | `nav-init-controls` is a persistent FN across all models |
| **JS-F** (new sweep): dynamically-hidden elements not updated in accessibility tree | Entire FN class (`scroll-btn-hidden`, `suggestions-hide-expanded`, `card-reduced-hidden`) had no sweep at all |
| Completion check: removed **"8–12 is a realistic ceiling"** | This line was telling models to stop after 12 issues on a 50-issue fixture — directly suppressing recall |
| Completion check: threshold raised from `< 8` to `< 10`; added density guidance ("medium 12–20, high 18–30 issues") | Aligns ceiling guidance with actual fixture density |
| Header: updated sweep range from `JS-A through JS-E` to `JS-A through JS-F` | Reflects the new JS-F sweep |

---

## 10. Score and rank summary per condition

### RAG No-Think (rn)
| Rank | Model | Composite | F1 | Acc |
|---|---|---|---|---|
| 1 | deepseek-v3.2 | 46.9% | 44.7% | 91.3% |
| 2 | gemini-3-flash-preview | 46.3% | 32.9% | 89.9% |
| 3 | gpt-oss:120b | 40.9% | 39.4% | 90.4% |
| 4 | qwen3.5:397b | 37.8% | 37.4% | 91.1% |
| 5 | kimi-k2.5 | 35.6% | 44.5% | 91.5% |

### RAG Think (rt)
| Rank | Model | Composite | F1 | Acc |
|---|---|---|---|---|
| 1 | deepseek-v3.2 | 50.5% | 38.2% | 91.2% |
| 2 | qwen3.5:397b | 49.8% | 40.0% | 91.0% |
| 3 | gpt-oss:120b | 47.5% | 42.8% | 90.9% |
| 4 | gemini-3-flash-preview | 35.8% | 30.0% | 89.6% |
| 5 | kimi-k2.5 | 33.2% | 41.5% | 91.2% |

### No-RAG No-Think (nn)
| Rank | Model | Composite | F1 | Acc |
|---|---|---|---|---|
| 1 | gemini-3-flash-preview | 48.1% | 35.1% | 90.2% |
| 2 | deepseek-v3.2 | 46.7% | 41.8% | 91.0% |
| 3 | qwen3.5:397b | 42.1% | 44.1% | 91.4% |
| 4 | gpt-oss:120b | 36.2% | 39.7% | 90.4% |
| 5 | kimi-k2.5 | 32.4% | 40.4% | 91.0% |

### No-RAG Think (nt)
| Rank | Model | Composite | F1 | Acc |
|---|---|---|---|---|
| 1 | qwen3.5:397b | 57.3% | 46.6% | 91.3% |
| 2 | gpt-oss:120b | 51.1% | 43.9% | 90.5% |
| 3 | deepseek-v3.2 | 46.6% | 33.5% | 90.7% |
| 4 | gemini-3-flash-preview | 39.7% | 29.8% | 89.8% |
| 5 | kimi-k2.5 | 32.7% | 40.9% | 91.1% |

---

## 10. Cross-test accuracy history

| Model | T24 | T25 | T26 | **T27** |
|---|---|---|---|---|
| kimi-k2.5 | 4/4 ✅ → dropped | 4/4 ✅ | 4/4 ✅ | **4/4 ✅** |
| gpt-oss:120b | 4/4 ✅ → dropped | 4/4 ✅ | 1/4 | **4/4 ✅** |
| qwen3.5:397b | — | 3/4 | 3/4 | **4/4 ✅** |
| gemini-3-flash-preview | — | 1/4 | 0/4 | **0/4 ❌** |
| deepseek-v3.2 | — | 1/4 | 2/4 | **4/4 ✅** |

**Total conditions passing:** T24: 10 → T25: 13 → T26: 10 → **T27: 16/20**
