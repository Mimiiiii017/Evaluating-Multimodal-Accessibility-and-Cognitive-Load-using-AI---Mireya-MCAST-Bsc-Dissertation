# Test 28 — Results

**Date:** 2026-04-11  
**Conditions:** rn (rag-nothink), rt (rag-think), nn (norag-nothink), nt (norag-think)  
**Fixtures:** html-high, css-high, js-high, tsx-high (high-difficulty only, ~50 issues per fixture)  
**Models:** 6 — kimi-k2.5, qwen3.5:397b, gpt-oss:120b, gemini-3-flash-preview, deepseek-v3.2, **gemma4:31b** (first appearance)  
**Changes from T27:** CSS sweeps expanded (min-height/min-width scan, selector list, outline-offset anti-FP note); JS-F new sweep (dynamic ARIA hidden); JS completion ceiling removed.  
**Pass threshold:** ≥ 80.0% accuracy  
**Ground truth per condition:** 603 positive issues, 1 797 TN slots → 2 400 total per model

> ⚠ **Methodology note — T27 vs T28 scope difference:**  
> T27 ran without a `--fixtures` flag (all fixtures), producing TN = 8 514 per condition and a natural accuracy floor of ~88.7% (i.e., returning nothing still scored ~88.7%).  
> T28 explicitly ran `--fixtures html-high,css-high,js-high,tsx-high`, producing TN = 1 797 and an accuracy floor of ~74.9%.  
> The 80 % threshold is therefore substantially harder to achieve in T28 than in T27. **Direct accuracy comparisons between T27 and T28 are misleading**; use F1 / recall for cross-test comparisons.

---

## 1. Accuracy by condition (≥ 80.0% = PASS)

| Model | rn | rt | nn | nt | ≥80% |
|---|---|---|---|---|---|
| kimi-k2.5 | **81.6%** | **82.8%** | **81.4%** | **82.3%** | 4/4 ✅ |
| qwen3.5:397b | **80.8%** | **80.9%** | **80.4%** | **81.3%** | 4/4 ✅ |
| gpt-oss:120b | 79.9% | **81.0%** | 79.2% | 79.1% | 1/4 |
| gemini-3-flash-preview | 79.2% | 78.8% | 79.4% | 78.5% | 0/4 ❌ |
| gemma4:31b | 79.2% | 79.1% | 79.1% | 79.1% | 0/4 ❌ (debut) |
| deepseek-v3.2 | 78.6%¹ | 78.7%¹ | 78.7% | 77.9%¹ | 0/4 ❌ |

¹ deepseek had 1 error (run timeout) in rn, rt, and nt — TN pool reduced to ~1 647–1 648 for those conditions.

**T28 total: 9/24 conditions passing** (kimi 4/4 + qwen 4/4 + gpt 1/4)  
**For the 5-model subset shared with T27 (excl. gemma4): 9/20**

> Note: direct slot-count comparisons to T27 (16/20) are misleading due to the methodology difference above. In T28, the 80% threshold requires a minimum ~20% recall; in T27, near-zero recall still produced ~88–89% accuracy.

---

## 2. Accuracy deltas vs T27 (same models, rn condition for reference; caveat: different fixture scope)

| Model | T27 rn (all fix.) | T28 rn (high only) | F1 Δ (rn) | Recall Δ (rn) |
|---|---|---|---|---|
| kimi-k2.5 | 91.5% | 81.6% | +3.1pp (47.6 vs 44.5) | −6.3pp (36.2% vs 42.5%) |
| gpt-oss:120b | 90.4% | 79.9% | −4.2pp (35.2 vs 39.4) | −7.8pp (24.2% vs 32.0%) |
| qwen3.5:397b | 91.1% | 80.8% | +4.2pp (41.6 vs 37.4) | −2.2pp (29.0% vs 31.2%) |
| gemini-3-flash-preview | 89.9% | 79.2% | +1.5pp (34.4 vs 32.9) | −3.6pp (23.5% vs 27.1%) |
| deepseek-v3.2 | 91.3% | 78.6% | −18.8pp (25.9 vs 44.7) | −11.6pp (15.9% vs 27.5%) |

Key: the raw accuracy drop is almost entirely explained by the smaller TN pool (floor shift from ~88.7% to ~74.9%). F1/recall are the valid comparison metrics. kimi and qwen show modest F1 gains on rn; gpt and deepseek regressed in recall on the high subset.

---

## 3. TP / FP / FN totals by condition

### 3a. RAG No-Think (rn)

| Model | TP | FP | FN | TN | Acc | Recall |
|---|---|---|---|---|---|---|
| kimi-k2.5 | 218 | 70 | 385 | 1797 | 81.6% | 36.2% |
| qwen3.5:397b | 175 | 39 | 428 | 1797 | 80.8% | 29.0% |
| gpt-oss:120b | 146 | 32 | 457 | 1797 | 79.9% | 24.2% |
| gemini-3-flash-preview | 142 | 47 | 461 | 1797 | 79.2% | 23.5% |
| gemma4:31b | 137 | 42 | 466 | 1797 | 79.2% | 22.7% |
| deepseek-v3.2 | 88 | 8 | 464 | 1648¹ | 78.6% | 14.6% |

¹ 1 run timeout dropped; effective positives reduced.

### 3b. RAG Think (rt)

| Model | TP | FP | FN | TN | Acc | Recall |
|---|---|---|---|---|---|---|
| kimi-k2.5 | 251 | 74 | 352 | 1797 | 82.8% | 41.6% |
| gpt-oss:120b | 184 | 46 | 419 | 1797 | 81.0% | 30.5% |
| qwen3.5:397b | 176 | 39 | 427 | 1797 | 80.9% | 29.2% |
| gemma4:31b | 138 | 45 | 465 | 1797 | 79.1% | 22.9% |
| gemini-3-flash-preview | 115 | 24 | 488 | 1797 | 78.8% | 19.1% |
| deepseek-v3.2 | 113 | 38 | 439 | 1648¹ | 78.7% | 20.5% |

¹ 1 run timeout dropped.

### 3c. No-RAG No-Think (nn)

| Model | TP | FP | FN | TN | Acc | Recall |
|---|---|---|---|---|---|---|
| kimi-k2.5 | 205 | 59 | 398 | 1797 | 81.4% | 34.0% |
| qwen3.5:397b | 171 | 48 | 432 | 1797 | 80.4% | 28.4% |
| gpt-oss:120b | 140 | 46 | 463 | 1797 | 79.2% | 23.2% |
| gemma4:31b | 138 | 44 | 465 | 1797 | 79.1% | 22.9% |
| gemini-3-flash-preview | 164 | 69 | 439 | 1797 | 79.4% | 27.2% |
| deepseek-v3.2 | 115 | 29 | 488 | 1797 | 78.7% | 19.1% |

### 3d. No-RAG Think (nt)

| Model | TP | FP | FN | TN | Acc | Recall |
|---|---|---|---|---|---|---|
| kimi-k2.5 | 222 | 54 | 381 | 1797 | 82.3% | 36.8% |
| qwen3.5:397b | 202 | 59 | 401 | 1797 | 81.3% | 33.5% |
| gpt-oss:120b | 125 | 31 | 478 | 1797 | 79.1% | 20.7% |
| gemma4:31b | 138 | 45 | 465 | 1797 | 79.1% | 22.9% |
| gemini-3-flash-preview | 132 | 58 | 471 | 1797 | 78.5% | 21.9% |
| deepseek-v3.2 | 73 | 8 | 480 | 1647¹ | 77.9% | 13.2% |

¹ 1 run timeout dropped.

---

## 4. Per-fixture TP breakdown (nn condition — representative)

| Fixture | kimi | qwen | gpt | gemini | gemma4 | deepseek |
|---|---|---|---|---|---|---|
| html-high (51 pos) | 19 | 11 | **28** | 11 | 8 | 0 |
| css-high (~50 pos) | 21 | 24 | **0** ‼ | 27 | 25 | 12 |
| js-high (~50 pos) | 15 | 6 | 7 | 10 | 8 | 10 |
| tsx-high (~50 pos) | 21 | 16 | 24 | 8 | 7 | 5 |

‼ **gpt CSS total collapse in nn**: gpt found zero CSS issues in norag-nothink. This is the single biggest anomaly in T28 — gpt's CSS detection requires either RAG context or think mode to activate. In rt (think mode), gpt recovered to 37 CSS TP.

---

## 5. Hypothesis verification

| Hypothesis | Outcome |
|---|---|
| T28 CSS sweep improvements increase CSS recall | ⚠️ Partial — kimi/qwen css-high TP ~21–27 in nn (similar to T27 high-fixture estimates), but gpt collapses to 0 CSS TP in nn. gemini css recall slightly improved vs direct T27 fixture comparison but with high FP proliferation. |
| JS-F sweep adds dynamic-ARIA recall | ⚠️ Minimal — kimi gains a few JS TP; most models remain ≤10 JS TP per condition. The completion ceiling removal helped kimi (15 TP nn) but JS recall ceiling persists at ~30%. |
| gemma4 debuts with competitive performance | ❌ No — gemma4 tracks gpt-nn (0/4, ~79.1% flat across all conditions). Very consistent but pinned 0.9pp below threshold in every condition. |
| kimi stays best overall | ✅ Yes — kimi highest recall and F1 in all 4 conditions, 4/4 pass. |
| deepseek recovers with new JS-F sweep | ❌ No — deepseek has the worst recall (13–20%), multiple timeouts, 0/4. |
| gpt CSS collapse repeated | ⚠️ New finding — gpt CSS only collapses in nn. rt and nt recover (13–37 CSS TP). RAG or think mode required for gpt CSS detection. |

---

## 6. Root cause analysis

### 6a. gpt CSS collapse in norag-nothink

gpt finds **zero** CSS issues in the nn condition (norag-nothink). In nt (think) it recovers to 13 TP; in rt it reaches 37 TP. This pattern strongly suggests gpt's CSS-sweep chain requires either think-mode reasoning to self-verify or RAG-supplied pattern anchors to bootstrap. Without both, gpt skips the CSS phase entirely or exits after the inventory step. This is functionally similar to the T26 regression where the two-pass CSS-A structure caused gpt to collapse — the model appears sensitive to any added complexity in the CSS sweep trigger.

### 6b. JS recall ceiling (~20–40%)

All models remain below 40% recall on js-high across all conditions. The new JS-F sweep (dynamically-hidden elements) was correctly targeted, but the dominant FN cluster is the announcement suite: `scroll-top-announce`, `filter-result-announce`, `faq-open-announce`, `faq-close-all-announce`, `billing-period-announce`, `comparison-expand-announce`, `shortcut-*-announce` — all live-region announcement FNs. These ~20 issues represent ~40% of all JS FNs. No existing JS sweep covers the pattern "action performed with no aria-live announcement". JS-G sweep needed.

### 6c. Persistent TSX FN cluster — plan-card, stat, hero landmarks

In tsx-high, the following concept IDs are missed by every model in every condition without exception:
`plan-card-label`, `plan-article-labelledby`, `plan-cta-label`, `hero-ctas-label`, `hero-trust-label`, `stat-value-label`, `stats-bar-labelledby`, `spinner-icon-hidden`, `spinner-ring-hidden`, `integrations-clone-hidden`, `nav-chevron-hidden`, `nav-submenu-labelledby`, `mobile-backdrop-hidden`, `required-marker-hidden`, `section-labelledby`, `account-actions-label`.

These ~16 FNs account for ~30 FN per condition on tsx-high and appear to require very specific React-component-level inspection heuristics that no existing TSX sweep covers.

### 6d. gemini CSS FP explosion in think mode

gemini-3-flash-preview generates ~21 FP in css-high when thinking is enabled (nt: 21 FPs; rn/rt: similar). It hallucinates: per-element `outline: none` violations on correct selectors, touch-target violations using inferred sizes rather than measured values, `reduced-motion` violations on animations that have correct overrides, and negative letter-spacing issues that are within tolerance. The outline-offset anti-FP note from T28 did not reduce this behaviour. gemini needs a CSS FP hard-limit instruction ("output max N CSS issues; verify each against the exact CSS text before reporting").

### 6e. deepseek timeout pattern

deepseek hits the 900s execution limit in ~1 run per condition (rn, rt, nt all have 1 error). With html-high consuming 900s per run in some cases, it drops entire fixture data. deepseek's avg response time is 448–795s (the highest by far, vs gemini's 18–143s). deepseek is unreliable for the high-density fixture suite at this time.

### 6f. gemma4 consistent underperformance

gemma4 is pinned at 79.1–79.2% across all 4 conditions — 0.8–0.9pp below the threshold every time, with minimal variance. Its recall (22.7–22.9%) is almost identical across conditions, suggesting it is not meaningfully affected by RAG or think mode. gemma4 is not following the sweep instructions in a way that explores the fixture depth.

---

## 7. Persistent FN patterns (all models, all conditions)

### JS — live-region announcement suite (~20 FNs per condition)
None of the existing JS sweeps (A–F) detect the pattern: "action triggered but no `aria-live` / `aria-atomic` region announces the result to screen readers". Missed IDs (from nn):
`scroll-top-announce`, `filter-result-announce`, `view-mode-announce`, `filter-reset-announce`, `billing-period-announce`, `comparison-expand-announce`, `scroll-to-plan-announce`, `faq-open-announce`, `faq-open-all-announce`, `faq-close-all-announce`, `shortcut-search-announce`, `shortcut-nav-announce`, `shortcut-main-announce`, `shortcut-footer-announce`, `suggestion-navigate-announce`, `nav-open-announce`, `nav-close-announce`, `search-submit-announce`, `search-clear-announce`, `search-highlight-announce`, `faq-close-announce`.  
→ Requires JS-G: "live region announcement check — for every user action, verify a status/polite region announces the result".

### JS — breadcrumb and pagination ARIA
`breadcrumb-current`, `breadcrumb-separator`, `pagination-aria-label` — all models miss consistently.  
→ These are ARIA landmark detail issues not covered by any existing JS sweep.

### TSX — component-level landmark labelling (see 6c above)
~16 tsx concept IDs missed universally.

### CSS — stat-item, footer-brand, social-link outline/target cluster
`stat-item-small`, `footer-brand-outline`, `footer-nav-outline`, `social-link-outline`, `social-link-small-h` — still missed by most models despite the T28 selector list expansion. The expanded list may not have been effective when models encounter these patterns mid-cascade.

### HTML — aria-controls / aria-expanded init cluster
`faq-aria-controls`, `faq-dd-region`, `faq-q1-expanded`, `faq-q2-expanded`, `nav-init-controls`, `nav-init-expanded`, `nav-close-expanded` — persistent across all models in all tests.

---

## 8. Notable FP patterns

| Model | Condition | Pattern |
|---|---|---|
| gemini-3-flash-preview | css-high (nt) | 21 FPs: inferred focus/touch/motion violations not in CSS text |
| gemini-3-flash-preview | css-high (nn) | 9 FPs: same pattern, shorter run |
| gemini-3-flash-preview | js-high (nn) | 10 FPs: invented `aria-expanded` / `aria-hidden` management issues |
| gpt-oss:120b | tsx-high (nn) | 25 FPs: repeated aria-labelledby and missing label issues that are correctly implemented |
| qwen3.5:397b | css-high (nn) | 15 FPs: touch-target violations computed from inferred min-height |
| kimi-k2.5 | tsx-high (all) | 4–7 FPs: `aria-modal` and `aria-describedby` on components that have correct equivalents |
| deepseek-v3.2 | css-high (nn) | 5 FPs: button size computed from class names rather than actual property values |

---

## 9. T29 recommendations

### Priority 1: Add JS-G — live-region announcement sweep
The ~20 announcement FNs dominate JS recall failure. JS-G should check: for every user-triggered action (button click, form submit, filter apply, nav open/close), does the page have an `aria-live` region that announces the outcome? Estimated impact: +15–20 JS TP per condition.

### Priority 2: Fix gpt CSS norag-nothink collapse
gpt needs CSS to work without RAG context and without think mode. Options:
- Add explicit CSS sweep activation trigger ("You MUST complete CSS-A through CSS-F regardless of prior context available")
- Add a self-check step after Phase 1: "Have you scanned css-high? It must yield ≥ 15 issues — if your count is zero, restart CSS-A."
- Estimated impact: recovers ~50 TP for gpt in nn condition → could push gpt to 3/4 or 4/4.

### Priority 3: Add TSX component-labelling sweep (TSX-C)
A new TSX sweep targeting: `PlanCard aria-labelledby`, `StatsBar landmark label`, `HeroSection landmark label`, `DesktopNav landmark label`, `SpinnerIcon hidden decorative`, `Integrations clone hidden`. These are component patterns that require reading individual exported React components rather than layout-level analysis.

### Priority 4: Gemini CSS FP hard limit
Add instruction to `CSS_COMPLETION_CHECK`: "Do not report an issue unless you can quote the exact CSS rule that causes it. If you cannot cite a specific rule, omit that issue." This should cut gemini's FP rate from ~9–21 down to ≤3 per condition.

### Priority 5: deepseek timeout mitigation
deepseek's 900s response time for single html-high calls is causing data dropout. Consider either:
- Adding `--exclude-models deepseek` for high-fixture runs pending investigation
- Setting a per-model prompt length limit for high-density fixtures
- Running deepseek as a separate lower-concurrency job

### Priority 6: Normalise fixture scope going forward
All future tests should use `--fixtures html-high,css-high,js-high,tsx-high` (the T28 baseline), making cross-test accuracy figures directly comparable. Document T27's broader fixture scope as a separate data point.

---

## 10. Score and rank summary per condition

### RAG No-Think (rn)
| Rank | Model | Composite | F1 | Acc |
|---|---|---|---|---|
| 1 | qwen3.5:397b | 49.5% | 41.6% | 80.8% |
| 2 | gemini-3-flash-preview | 47.5% | 34.4% | 79.2% |
| 3 | kimi-k2.5 | 47.1% | 47.6% | 81.6% |
| 4 | gemma4:31b | 43.9% | 32.1% | 79.2% |
| 5 | gpt-oss:120b | 41.1% | 35.2% | 79.9% |
| 6 | deepseek-v3.2 | 20.7% | 25.9% | 78.6% |

### RAG Think (rt)
| Rank | Model | Composite | F1 | Acc |
|---|---|---|---|---|
| 1 | kimi-k2.5 | 57.6% | 52.4% | 82.8% |
| 2 | gpt-oss:120b | 52.9% | 41.8% | 81.0% |
| 3 | qwen3.5:397b | 47.1% | 40.4% | 80.9% |
| 4 | gemini-3-flash-preview | 42.4% | 28.0% | 78.8% |
| 5 | gemma4:31b | 42.2% | 32.6% | 79.1% |
| 6 | deepseek-v3.2 | 23.1% | 28.9% | 78.7% |

### No-RAG No-Think (nn)
| Rank | Model | Composite | F1 | Acc |
|---|---|---|---|---|
| 1 | gemini-3-flash-preview | 50.3% | 37.8% | 79.4% |
| 2 | qwen3.5:397b | 47.0% | 39.5% | 80.4% |
| 3 | kimi-k2.5 | 45.0% | 46.3% | 81.4% |
| 4 | gemma4:31b | 44.3% | 32.5% | 79.1% |
| 5 | gpt-oss:120b | 37.3% | 31.8% | 79.2% |
| 6 | deepseek-v3.2 | 23.1% | 28.9% | 78.7% |

### No-RAG Think (nt)
| Rank | Model | Composite | F1 | Acc |
|---|---|---|---|---|
| 1 | kimi-k2.5 | 56.3% | 49.2% | 82.3% |
| 2 | qwen3.5:397b | 53.2% | 45.8% | 81.3% |
| 3 | gemma4:31b | 45.5% | 31.9% | 79.1% |
| 4 | gpt-oss:120b | 44.2% | 31.2% | 79.1% |
| 5 | gemini-3-flash-preview | 43.3% | 29.7% | 78.5% |
| 6 | deepseek-v3.2 | 16.9% | 21.2% | 77.9% |

---

## 11. Cross-test accuracy history

> Note: T24–T27 used all-fixture runs (TN ≈ 8 514 per condition). T28 uses high-fixture-only (TN = 1 797). Accuracy figures are not directly comparable across this boundary (see methodology note at top).

| Model | T24 | T25 | T26 | T27¹ | **T28²** |
|---|---|---|---|---|---|
| kimi-k2.5 | 4/4 ✅ | 4/4 ✅ | 4/4 ✅ | 4/4 ✅ | **4/4 ✅** |
| gpt-oss:120b | 4/4 ✅ | 4/4 ✅ | 1/4 | 4/4 ✅ | **1/4** |
| qwen3.5:397b | — | 3/4 | 3/4 | 4/4 ✅ | **4/4 ✅** |
| gemini-3-flash-preview | — | 1/4 | 0/4 | 0/4 ❌ | **0/4 ❌** |
| deepseek-v3.2 | — | 1/4 | 2/4 | 4/4 ✅ | **0/4 ❌** |
| gemma4:31b | — | — | — | — | **0/4 ❌ (debut)** |

¹ T27 fixture scope: all available fixtures, TN = 8 514 (accuracy floor ~88.7%)  
² T28 fixture scope: html-high, css-high, js-high, tsx-high only, TN = 1 797 (accuracy floor ~74.9%)

**Passing condition counts (excl. gemma4):** T24: 10 → T25: 13 → T26: 10 → T27: 16/20 (all-fixture) → **T28: 9/20 (high-only)**  
*Comparing T27 and T28 by recall (more meaningful):* kimi +F1 in rn; qwen +F1 in rn/nt; gpt −recall (css collapse in nn); deepseek −recall (timeouts + high-difficulty gap).
