# T25 Results

**Run date:** 2026-04-08
**Conditions:** rn (rag-nothink), rt (rag-think), nn (norag-nothink), nt (norag-think)
**Fixtures:** html-high (51), css-high (50), js-high (50), tsx-high (50) — 201 issues, 1797 TN slots
**Models:** kimi-k2.5, gpt-oss:120b, qwen3.5:397b, gemini-3-flash-preview, deepseek-v3.2
**Accuracy target:** ≥80% per condition

---

## Accuracy Summary

| Model | rn | rt | nn | nt | ≥80% |
|---|---|---|---|---|---|
| kimi-k2.5 | **82.1%** | **81.4%** | **82.1%** | **81.6%** | 4/4 ✅ |
| gpt-oss:120b | **80.7%** | **80.1%** | **80.3%** | **80.9%** | 4/4 ✅ |
| qwen3.5:397b | **81.0%** | 79.5% | **80.2%** | **80.3%** | 3/4 |
| gemini-3-flash-preview | **80.2%** | 78.1% | 79.1% | 78.1% | 1/4 |
| deepseek-v3.2 | 79.9% | **80.3%** | 79.2% | 79.6% | 1/4 |

**T25 total: 13/20** — restored to T23 level (+3 vs T24's 10/20)

---

## vs T24

| Model | T24 | T25 | Δ |
|---|---|---|---|
| kimi-k2.5 | 3/4 | 4/4 | **+1** |
| gpt-oss:120b | 3/4 | 4/4 | **+1** |
| qwen3.5:397b | 4/4 | 3/4 | **−1** |
| gemini-3-flash-preview | 0/4 | 1/4 | **+1** |
| deepseek-v3.2 | 0/4 | 1/4 | **+1** |
| **Total** | **10/20** | **13/20** | **+3** |

---

## TP / FP / FN per Condition

### rn (rag-nothink)

| Model | Acc | TP | TN | FP | FN |
|---|---|---|---|---|---|
| kimi-k2.5 | **82.1%** | 235 | 1797 | 76 | 368 |
| gpt-oss:120b | **80.7%** | 161 | 1797 | 26 | 442 |
| qwen3.5:397b | **81.0%** | 152 | 1797 | 7 | 451 |
| gemini-3-flash-preview | **80.2%** | 168 | 1797 | 48 | 435 |
| deepseek-v3.2 | 79.9% | 133 | 1797 | 14 | 470 |

### rt (rag-think)

| Model | Acc | TP | TN | FP | FN |
|---|---|---|---|---|---|
| gpt-oss:120b | **80.1%** | 186 | 1797 | 78 | 417 |
| deepseek-v3.2 | **80.3%** | 147 | 1797 | 22 | 456 |
| kimi-k2.5 | **81.4%** | 189 | 1797 | 40 | 414 |
| qwen3.5:397b | 79.5% | 122 | 1797 | 15 | 481 |
| gemini-3-flash-preview | 78.1% | 86 | 1797 | 11 | 517 |

### nn (norag-nothink)

| Model | Acc | TP | TN | FP | FN |
|---|---|---|---|---|---|
| kimi-k2.5 | **82.1%** | 219 | 1797 | 55 | 384 |
| gpt-oss:120b | **80.3%** | 160 | 1797 | 37 | 443 |
| qwen3.5:397b | **80.2%** | 137 | 1797 | 11 | 466 |
| deepseek-v3.2 | 79.2% | 111 | 1797 | 9 | 492 |
| gemini-3-flash-preview | 79.1% | 104 | 1797 | 2 | 499 |

### nt (norag-think)

| Model | Acc | TP | TN | FP | FN |
|---|---|---|---|---|---|
| gpt-oss:120b | **80.9%** | 170 | 1797 | 30 | 433 |
| kimi-k2.5 | **81.6%** | 214 | 1797 | 65 | 389 |
| qwen3.5:397b | **80.3%** | 160 | 1797 | 38 | 443 |
| deepseek-v3.2 | 79.6% | 124 | 1797 | 12 | 479 |
| gemini-3-flash-preview | 78.1% | 81 | 1797 | 6 | 522 |

---

## T24 → T25 TP/FP/FN Delta

### rn

| Model | TP Δ | FP Δ | FN Δ | Acc Δ |
|---|---|---|---|---|
| kimi | 129 → **235** (+106) | 24 → 76 (+52) | 474 → 368 (−106) | 79.4% → **82.1%** |
| gpt | 202 → 161 (−41) | 51 → 26 (−25) | 401 → 442 (+41) | **81.6%** → **80.7%** |
| qwen | 137 → 152 (+15) | 17 → 7 (−10) | 466 → 451 (−15) | **80.0%** → **81.0%** |
| gemini | 111 → **168** (+57) | 12 → 48 (+36) | 492 → 435 (−57) | 79.1% → **80.2%** |
| deepseek | 61 → 133 (+72) | 4 → 14 (+10) | 542 → 470 (−72) | 77.3% → 79.9% |

### rt

| Model | TP Δ | FP Δ | FN Δ | Acc Δ |
|---|---|---|---|---|
| gpt | 205 → 186 (−19) | 73 → 78 (+5) | 398 → 417 (+19) | **81.0%** → **80.1%** |
| deepseek | 82 → **147** (+65) | 7 → 22 (+15) | 521 → 456 (−65) | 78.1% → **80.3%** |
| kimi | 173 → 189 (+16) | 44 → 40 (−4) | 430 → 414 (−16) | **80.6%** → **81.4%** |
| qwen | 157 → 122 (−35) | 11 → 15 (+4) | 446 → 481 (+35) | **81.0%** → 79.5% |
| gemini | 119 → 86 (−33) | 23 → 11 (−12) | 484 → 517 (+33) | 79.1% → 78.1% |

### nn

| Model | TP Δ | FP Δ | FN Δ | Acc Δ |
|---|---|---|---|---|
| kimi | 183 → **219** (+36) | 38 → 55 (+17) | 420 → 384 (−36) | **81.2%** → **82.1%** |
| gpt | 156 → 160 (+4) | 38 → 37 (−1) | 447 → 443 (−4) | **80.1%** → **80.3%** |
| qwen | 153 → 137 (−16) | 19 → 11 (−8) | 450 → 466 (+16) | **80.6%** → **80.2%** |
| deepseek | 109 → 111 (+2) | 11 → 9 (−2) | 494 → 492 (−2) | 79.0% → 79.2% |
| gemini | 91 → 104 (+13) | 2 → 2 (0) | 512 → 499 (−13) | 78.6% → 79.1% |

### nt

| Model | TP Δ | FP Δ | FN Δ | Acc Δ |
|---|---|---|---|---|
| gpt | 153 → 170 (+17) | 45 → 30 (−15) | 450 → 433 (−17) | 79.8% → **80.9%** |
| kimi | 165 → **214** (+49) | 33 → 65 (+32) | 438 → 389 (−49) | **80.6%** → **81.6%** |
| qwen | 160 → 160 (0) | 21 → 38 (+17) | 443 → 443 (0) | **80.8%** → **80.3%** |
| deepseek | 60 → 124 (+64) | 6 → 12 (+6) | 543 → 479 (−64) | 77.2% → 79.6% |
| gemini | 101 → 81 (−20) | 16 → 6 (−10) | 502 → 522 (+20) | 78.5% → 78.1% |

---

## Hypothesis Verification

| Hypothesis | Result | Evidence |
|---|---|---|
| kimi restores to 4/4 | ✅ Confirmed | rn TP: 129→235 (+106); all 4 conditions ≥80% |
| gpt restores to 4/4 | ✅ Confirmed | nt recovered 79.8%→80.9%; FP dropped 45→30 |
| qwen stays at 4/4 | ❌ Failed | rt slipped 81.0%→79.5%; TP dropped 157→122 |
| gemini CSS recall improves | ⚠️ Partial | rn now passes (80.2% ✅); rt/nn/nt still fail; FP cost +36 in rn |
| TSX plan-card/article FNs reduce | ❌ Not yet | plan-card-label and plan-article-labelledby still FN across all models/conditions |
| deepseek stable (no regression) | ✅ Better | deepseek rt actually passed at 80.3% — net gain from temp revert |

---

## Root Cause Analysis

### kimi rn restoration (+106 TP, +1 condition)
The threshold revert (12→8) was the primary driver. In T24, kimi rn TP collapsed from ~220s to 129 because the higher completion threshold caused the model to abandon partially-complete audits. With threshold back to 8, kimi rn returned to 235 TP — its highest ever. The FP cost rose (24→76) but accuracy still reached 82.1%. This confirms the T24 diagnosis: completion threshold 12 was too aggressive for kimi.

### gpt nt restoration (+17 TP, −15 FP, +1 condition)
The threshold revert also helped gpt's precision in nt — fewer premature completions meant fewer speculative FPs. TP improved 153→170 while FP dropped 45→30, pushing nt from 79.8%→80.9%. gpt now passes 4/4.

### deepseek rt breakthrough (+65 TP, +1 condition)
The think-temperature revert from 0.1→0.0 was the clear driver. At 0.0, deepseek's chain-of-thought is deterministic and focused; the 0.1 noise in T24 caused recall scatter. RT TP: 82→147 (+65), clearing 80.3% accuracy. 

### gemini rn breakthrough (+57 TP, +1 condition)
The noThink temperature revert (0.1→0.0) combined with the KB update (css-accessibility-detection-rules.md) appears to have improved gemini's rn recall. TP jumped 111→168, just enough to clear 80.2%. However, gemini's FP in rn exploded from 12→48 — suggesting the KB additions also triggered false pattern matches in clean files. The rag condition amplifies this since retrieval pulls in more context. gemini still fails rt/nn/nt.

### qwen rt regression (−35 TP, −1 condition)
qwen's think temperature was not changed in T25 (still at T23 setting), but qwen rt dropped from 157→122 TP (81.0%→79.5%). Two possible causes:
1. **Prompt sensitivity**: The new CSS Phase 1 inventory bullets and TSX article/card instructions added complexity that qwen's reasoning chain in think mode mis-applied — increasing FNs in css-high and tsx-high specifically.
2. **Natural variance**: qwen's F1 σ in rt was 0.078 (most consistent), but a −1.5pp accuracy swing is within plausible variance across run groups.
This needs monitoring in T26.

### CSS base-class outline detection: not yet cracked
`btn-primary-outline-none`, `hero-link-outline-none`, `badge-outline-none`, `testimonial-outline-none`, `pagination-small`, `footer-nav-outline`, and related base-selector IDs remain in FN lists across all models and conditions. The KB update clarified the rule in documentation, and gemini/deepseek showed TP gains in CSS, but the specific targeted FNs persist. The models appear to be detecting some CSS issues (colour contrast, known focus violations) while systematically missing the base-class outline:none patterns that lack `:focus` pseudo-classes.

### TSX plan-card / article: still FN everywhere
`plan-card-label` and `plan-article-labelledby` remain in every model's FN list across all conditions. The TSX-F extension and Phase 1 article/card inventory added in T25 have not resolved these. Both targets require models to correctly correlate `<article>` elements in a pricing grid with the `aria-labelledby` pointing to a child heading — a multi-step spatial reasoning task that the current prompt structure doesn't enforce reliably.

---

## Per-Fixture Accuracy (rn)

### html-high
| Model | TP | TN | FP | FN | Acc% |
|---|---|---|---|---|---|
| kimi-k2.5 | 23 | 149 | 2 | 28 | 85.2% |
| gpt-oss:120b | 16 | 149 | 2 | 35 | 81.8% |
| qwen3.5:397b | 15 | 149 | 0 | 36 | 81.7% |
| deepseek-v3.2 | 12 | 149 | 2 | 39 | 79.4% |
| gemini-3-flash-preview | 11 | 149 | 0 | 40 | 80.0% |

### css-high
| Model | TP | TN | FP | FN | Acc% |
|---|---|---|---|---|---|
| kimi-k2.5 | 29 | 150 | 17 | 21 | 82.6% |
| gemini-3-flash-preview | 28 | 150 | 16 | 22 | 82.4% |
| deepseek-v3.2 | 18 | 150 | 1 | 32 | 83.4% |
| qwen3.5:397b | 12 | 150 | 0 | 38 | 80.9% |
| gpt-oss:120b | 11 | 150 | 3 | 39 | 79.6% |

### js-high
| Model | TP | TN | FP | FN | Acc% |
|---|---|---|---|---|---|
| kimi-k2.5 | 10 | 150 | 1 | 40 | 79.4% |
| gpt-oss:120b | 9 | 150 | 0 | 41 | 79.2% |
| qwen3.5:397b | 9 | 150 | 0 | 41 | 79.2% |
| deepseek-v3.2 | 7 | 150 | 0 | 43 | 78.5% |
| gemini-3-flash-preview | 6 | 150 | 0 | 44 | 78.0% |

### tsx-high
| Model | TP | TN | FP | FN | Acc% |
|---|---|---|---|---|---|
| gpt-oss:120b | 18 | 150 | 4 | 32 | 82.2% |
| qwen3.5:397b | 15 | 150 | 1 | 35 | 82.1% |
| kimi-k2.5 | 17 | 150 | 5 | 33 | 81.2% |
| gemini-3-flash-preview | 11 | 150 | 0 | 39 | 80.5% |
| deepseek-v3.2 | 7 | 150 | 1 | 43 | 78.4% |

---

## Persistent FN Patterns (cross-condition)

### CSS — base-class outline:none (all models, all conditions)
Every model misses these consistently:
- `btn-primary-outline-none`, `hero-link-outline-none`, `badge-outline-none`
- `testimonial-outline-none`, `pagination-small`, `dropdown-outline-none`
- `modal-btn-outline-none`, `faq-dt-outline-none`, `form-input-outline-none`
- `footer-nav-outline`, `footer-brand-outline`, `social-link-outline`
- `checkbox-outline-none`, `tab-outline-none`, `card-btn-outline-none`

These are all base-component selectors without `:focus`. Despite the KB update, models are not scanning for `outline: none/0` on non-pseudo-class selectors systematically.

### CSS — touch target size (most models, multiple conditions)
- `icon-btn-target-small`, `skip-link-target-small`, `pagination-small`
- `social-link-small-h`, `stat-item-small`, `visually-hidden-display`

### TSX — article/card ARIA (all models, all conditions)
- `plan-card-label`, `plan-article-labelledby`, `plan-cta-label`
- Models consistently detect other TSX ARIA issues but miss the pricing plan article pattern

### JS — aria-live / announcement (all models, all conditions)
JS recall remains structurally low (~7–10 TP out of 50). The models find basic aria-expanded/aria-pressed issues but almost universally miss all `aria-live` announcement patterns, status updates, and the breadcrumb/scroll behaviours.

### HTML — complex ARIA patterns (most models)
- `faq-q1-expanded`, `faq-q2-expanded` — FAQ accordion aria-expanded misses
- `skip-links-removed`, `main-id-missing`, `live-region-removed` — structural misses
- `contact-aria-required`, `contact-msg-describedby` — form attribute patterns

---

## T26 Recommendations

### Priority 1 — qwen rt regression
qwen rt dropped from 81.0%→79.5%. Monitor in T26 — if the regression persists, investigate whether the CSS/TSX Phase 1 additions disrupt think-mode reasoning specifically for qwen3.5.

### Priority 2 — CSS base-class outline:none
The KB update was insufficient. The models need more forceful prompt-level instruction. Consider:
- Adding an explicit CSS scan step: *"For every occurrence of `outline: none` or `outline: 0` — regardless of selector — that lacks a `:focus`/`:focus-visible` compensating rule in the same or parent ruleset, report a separate issue."*
- A dedicated CSS Phase 1 sub-step: enumerate ALL outline suppressions before moving to size thresholds

### Priority 3 — TSX plan-card / article
The current TSX-F approach adds a sweep but models don't execute it reliably. Consider:
- Moving the plan-card/article check into a required TSX Phase 2 structured step (analogous to CSS Phase 2 size check)
- Adding a concrete example with expected output format

### Priority 4 — gemini/deepseek FP control
Gemini rn now passes but at FP=48 (up from 12). Precision is degraded. Similarly deepseek rt FP=22 (up from 7). For gemini, consider tightening the noThink instructions around FP-prone patterns (`:focus-visible` present → do NOT report as missing focus indicator).

### Priority 5 — JS recall ceiling
JS remains around 7–10 TP / 50 across all models. The `aria-live` / announcement patterns are a knowledge gap, not a threshold issue. A dedicated JS knowledge-base file covering `aria-live` usage patterns, and a JS Phase audit step for announcement functions, may be needed.

---

## Summary

T25 restored the benchmark to **13/20 passing conditions** — matching T23 and recovering the 3 conditions lost in T24's regression.

The T25 reverts worked as intended: kimi rn recovered massively (+106 TP) confirming the threshold-12 was the T24 root cause, and deepseek rt surprised with an unexpected breakthrough (+65 TP from temp-0.0 revert). The KB update triggered a marginal gemini rn breakthrough (+57 TP), crossing 80% for the first time.

The one new regression — qwen rt (−35 TP) — is the key concern for T26. CSS base-class outline:none detection and TSX plan-card ARIA remain structurally unsolved across all models and conditions.
