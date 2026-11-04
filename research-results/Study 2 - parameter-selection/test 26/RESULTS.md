# T26 Results

**Run date:** 2026-04-08
**Conditions:** rn (rag-nothink), rt (rag-think), nn (norag-nothink), nt (norag-think)
**Fixtures:** html-high (51), css-high (50), js-high (50), tsx-high (50) — 201 issues, 1797 TN slots
**Models:** kimi-k2.5, gpt-oss:120b, qwen3.5:397b, gemini-3-flash-preview, deepseek-v3.2
**Accuracy target:** ≥80% per condition

---

## Accuracy Summary

| Model | rn | rt | nn | nt | ≥80% |
|---|---|---|---|---|---|
| kimi-k2.5 | **82.9%** | **82.7%** | **82.5%** | **81.7%** | 4/4 ✅ |
| gpt-oss:120b | **80.5%** | 79.9% | 79.1% | 79.7% | 1/4 |
| qwen3.5:397b | **81.2%** | 79.9% | **81.0%** | **80.8%** | 3/4 |
| gemini-3-flash-preview | 79.5% | 79.0% | 79.7% | 78.2% | 0/4 |
| deepseek-v3.2 | 79.9% | **81.1%** | 79.3% | **80.5%** | 2/4 |

**T26 total: 10/20** — regression from T25 (13/20), matching T24 floor

---

## vs T25

| Model | T25 | T26 | Δ |
|---|---|---|---|
| kimi-k2.5 | 4/4 | 4/4 | 0 |
| gpt-oss:120b | 4/4 | 1/4 | **−3** |
| qwen3.5:397b | 3/4 | 3/4 | 0 |
| gemini-3-flash-preview | 1/4 | 0/4 | **−1** |
| deepseek-v3.2 | 1/4 | 2/4 | **+1** |
| **Total** | **13/20** | **10/20** | **−3** |

---

## TP / FP / FN per Condition

### rn (rag-nothink)

| Model | Acc | TP | TN | FP | FN |
|---|---|---|---|---|---|
| kimi-k2.5 | **82.9%** | 235 | 1797 | 52 | 368 |
| gpt-oss:120b | **80.5%** | 164 | 1797 | 37 | 439 |
| qwen3.5:397b | **81.2%** | 181 | 1797 | 36 | 422 |
| gemini-3-flash-preview | 79.5% | 117 | 1797 | 8 | 486 |
| deepseek-v3.2 | 79.9% | 135 | 1797 | 17 | 468 |

### rt (rag-think)

| Model | Acc | TP | TN | FP | FN |
|---|---|---|---|---|---|
| kimi-k2.5 | **82.7%** | 227 | 1797 | 46 | 376 |
| gpt-oss:120b | 79.9% | 133 | 1797 | 16 | 470 |
| qwen3.5:397b | 79.9% | 148 | 1797 | 35 | 455 |
| gemini-3-flash-preview | 79.0% | 106 | 1797 | 10 | 497 |
| deepseek-v3.2 | **81.1%** | 171 | 1797 | 26 | 432 |

### nn (norag-nothink)

| Model | Acc | TP | TN | FP | FN |
|---|---|---|---|---|---|
| kimi-k2.5 | **82.5%** | 229 | 1797 | 57 | 374 |
| gpt-oss:120b | 79.1% | 132 | 1797 | 39 | 471 |
| qwen3.5:397b | **81.0%** | 160 | 1797 | 15 | 443 |
| gemini-3-flash-preview | 79.7% | 146 | 1797 | 36 | 457 |
| deepseek-v3.2 | 79.3% | 125 | 1797 | 22 | 478 |

### nt (norag-think)

| Model | Acc | TP | TN | FP | FN |
|---|---|---|---|---|---|
| kimi-k2.5 | **81.7%** | 222 | 1797 | 72 | 381 |
| gpt-oss:120b | 79.7% | 150 | 1797 | 43 | 453 |
| qwen3.5:397b | **80.8%** | 177 | 1797 | 41 | 426 |
| gemini-3-flash-preview | 78.2% | 101 | 1797 | 26 | 502 |
| deepseek-v3.2 | **80.5%** | 156 | 1797 | 25 | 447 |

---

## T25 → T26 TP/FP/FN Delta

### rn

| Model | TP Δ | FP Δ | FN Δ | Acc Δ |
|---|---|---|---|---|
| kimi | 235 → 235 (0) | 76 → 52 (−24) | 368 → 368 (0) | 82.1% → 82.9% (+0.8pp) |
| gpt | 161 → 164 (+3) | 26 → 37 (+11) | 442 → 439 (−3) | **80.7%** → **80.5%** (stable) |
| qwen | 152 → 181 (+29) | 7 → 36 (+29) | 451 → 422 (−29) | **81.0%** → **81.2%** (stable) |
| gemini | **168** → 117 (−51) | 48 → 8 (−40) | 435 → 486 (+51) | **80.2%** → 79.5% (−0.7pp) |
| deepseek | 133 → 135 (+2) | 14 → 17 (+3) | 470 → 468 (−2) | 79.9% → 79.9% (stable) |

### rt

| Model | TP Δ | FP Δ | FN Δ | Acc Δ |
|---|---|---|---|---|
| kimi | 189 → 227 (+38) | 40 → 46 (+6) | 414 → 376 (−38) | **81.4%** → **82.7%** (+1.3pp) |
| gpt | 186 → 133 (−53) | 78 → 16 (−62) | 417 → 470 (+53) | **80.1%** → 79.9% (−0.2pp) |
| qwen | 122 → 148 (+26) | 15 → 35 (+20) | 481 → 455 (−26) | 79.5% → 79.9% (+0.4pp) |
| gemini | 86 → 106 (+20) | 11 → 10 (−1) | 517 → 497 (−20) | 78.1% → 79.0% (+0.9pp) |
| deepseek | **147** → **171** (+24) | 22 → 26 (+4) | 456 → 432 (−24) | **80.3%** → **81.1%** (+0.8pp) |

### nn

| Model | TP Δ | FP Δ | FN Δ | Acc Δ |
|---|---|---|---|---|
| kimi | 219 → 229 (+10) | 55 → 57 (+2) | 384 → 374 (−10) | **82.1%** → **82.5%** (+0.4pp) |
| gpt | 160 → 132 (−28) | 37 → 39 (+2) | 443 → 471 (+28) | **80.3%** → 79.1% (−1.2pp) |
| qwen | 137 → 160 (+23) | 11 → 15 (+4) | 466 → 443 (−23) | **80.2%** → **81.0%** (+0.8pp) |
| gemini | 104 → 146 (+42) | 2 → 36 (+34) | 499 → 457 (−42) | 79.1% → 79.7% (+0.6pp) |
| deepseek | 111 → 125 (+14) | 9 → 22 (+13) | 492 → 478 (−14) | 79.2% → 79.3% (stable) |

### nt

| Model | TP Δ | FP Δ | FN Δ | Acc Δ |
|---|---|---|---|---|
| kimi | 214 → 222 (+8) | 65 → 72 (+7) | 389 → 381 (−8) | **81.6%** → **81.7%** (stable) |
| gpt | 170 → 150 (−20) | 30 → 43 (+13) | 433 → 453 (+20) | **80.9%** → 79.7% (−1.2pp) |
| qwen | 160 → 177 (+17) | 38 → 41 (+3) | 443 → 426 (−17) | **80.3%** → **80.8%** (+0.5pp) |
| gemini | 81 → 101 (+20) | 6 → 26 (+20) | 522 → 502 (−20) | 78.1% → 78.2% (stable) |
| deepseek | 124 → 156 (+32) | 12 → 25 (+13) | 479 → 447 (−32) | 79.6% → **80.5%** (+0.9pp) |

---

## Root Cause Analysis

### Primary regression: gpt CSS collapse in think mode

gpt's CSS TP dropped catastrophically in think conditions:
- rt: CSS TP 16 → 5 (−11)
- nt: CSS TP 15 → 6 (−9)
- nn: CSS TP 13 → 11 (−2, smaller)
- rn: CSS TP 11 → 11 (0, no change)

The new CSS-A two-pass instruction ("CSS-A(i) base selectors" / "CSS-A(ii) `:focus` pseudo-class selectors") created a complex execution path that gpt's chain-of-thought reasoning over-parsed. In think mode, gpt appears to have applied the CSS-A(ii) restraint rule too broadly — concluding that most outline removal examples it found had companion replacement rules, when they did not. The non-think conditions (rn, nn) used simpler execution paths and the impact was smaller.

The gpt rt/nn/nt fallout cost 3 passing conditions (was 4/4, now 1/4).

### Secondary regression: gemini rn precision collapse

gemini rn FP dropped from 48 → 8 (CSS-A(ii) over-restraint correctly reduced `:focus-visible` FPs), but TP also dropped from 168 → 117 (−51). The net effect on accuracy was negative: 80.2% → 79.5%, losing the pass. The CSS-A(ii) rule correctly stopped gemini reporting `:focus-visible` replacements as violations, but also suppressed legitimate base-class detections.

### Partial win: deepseek CSS improved

deepseek CSS TP improved across all conditions:
- rn: 18 → 18 (stable)
- rt: 20 → 20 (stable)
- nn: 14 → 16 (+2)
- nt: 16 → 22 (+6)

This pushed deepseek to pass 2/4 conditions (up from 1/4). The CSS-A split was well-suited to deepseek's more literal instruction-following — it applied the two-pass approach as intended.

### kimi and qwen stable / improved

kimi: fully stable at 4/4, with slight improvements in most conditions. The sweep execution mandate and CSS-A split caused minimal disruption — kimi's formatting following is robust enough to handle the additional complexity.

qwen: remained at 3/4. qwen rn TP grew significantly (+29 TP) but with proportional FP growth (+29 FP), suggesting the mandate drove higher volume reporting without discrimination. qwen rt stayed below 80% (79.9%).

### CSS base-class outline FNs: still structural

`hero-link-outline-none`, `badge-outline-none`, `testimonial-outline-none`, `pagination-small`, `footer-nav-outline`, `social-link-outline`, etc. remain in FN lists across all models and conditions. The CSS-A change did not solve this — deepseek detected more CSS-A issues overall, but not these specific base-class selectors consistently.

### `:focus-visible` FP: partially fixed but over-corrected

The CSS-A(ii) instruction succeeded in reducing some `:focus-visible` FPs for gemini (rn: 48→8) and gpt (rt: 78→16). However, the same restraint also suppressed legitimate detections (gemini CSS rn TP: 28→13). The instruction is too conservative — it prevents reporting `.table-wrapper:focus-visible` and `.faq-item dt button:focus-visible` as FPs, correctly, but also causes the models to hesitate on legitimate base-class detections.

---

## CSS TP by Fixture — rn condition

| Model | css-high TP | FP | FN |
|---|---|---|---|
| kimi-k2.5 | 25 | 11 | 25 |
| qwen3.5:397b | 21 | 6 | 29 |
| deepseek-v3.2 | 18 | 5 | 32 |
| gemini-3-flash-preview | 13 | 2 | 37 |
| gpt-oss:120b | 11 | 4 | 39 |

Still-persistent CSS FNs (all models, all conditions):
`hero-link-outline-none`, `badge-outline-none`, `testimonial-outline-none`, `pagination-small`, `footer-nav-outline`, `footer-brand-outline`, `social-link-outline`, `dropdown-outline-none`, `modal-btn-outline-none`, `faq-dt-outline-none`, `form-input-outline-none`, `checkbox-outline-none`, `visually-hidden-display`, `skip-link-target-small`, `input-target-small`

---

## T26 Changes — Verdict

| Change | Intended Effect | Actual Effect |
|---|---|---|
| Sweep execution mandate (all languages) | Force models to execute all sweeps, not skip basic ones | Neutral to slightly positive for kimi/qwen/deepseek; over-complicated gpt think-mode CSS |
| CSS-A split into 2 passes | (i) catch base-class outline FNs; (ii) stop `:focus-visible` FPs | deepseek CSS improved; gpt CSS collapsed in think mode; gemini over-corrected |

Net verdict: **revert CSS-A split**. The two-pass structure is too complex for gpt/gemini in think mode and produces worse results than the simpler T25 single-pass version. The sweep execution mandate can stay (it helped qwen/deepseek/kimi).

---

## T27 Recommendations

### Priority 1 — Revert CSS-A to a simpler unified rule (CRITICAL)
The T25 CSS-A was a single sweep. Revert to a unified CSS-A instruction that:
1. Explicitly lists base-selector examples (`.btn`, `.card-btn`, `.hero-link`, `.badge`) as valid outline-removal targets
2. Adds a single restraint note: "Do NOT report a `:focus-visible` selector as a violation if its rule-block provides a `box-shadow`, visible `border`, or non-zero outline — that IS the replacement style"

This avoids the two-pass complexity while preserving both the TP gain (being explicit about base selectors) and the FP reduction (restraint on `:focus-visible` with replacements).

### Priority 2 — gpt CSS think recovery
The CSS-A revert should restore gpt think CSS recall. If gpt CSS rt/nt TP does not recover to ~15-16 TP in T27, further investigation is needed (possibly a CSS-specific temperature or completion threshold for gpt).

### Priority 3 — Gemini nn FP spike
gemini nn FP jumped from 2 → 36 in T26. This is the CSS sweep execution mandate triggering more aggressive CSS reporting in norag+nothink mode (the mandatory execution note pushed gemini to report more CSS issues from its existing limited knowledge). A per-model FP guard may be needed, or gemini's CSS sweeps need explicit FP-restraint conditions.

### Priority 4 — qwen rt (persistent)
qwen rt has been below 80% in T25 and T26 (79.5%, 79.9%). It's just under the threshold. The sweep mandate slightly helped (+0.4pp) but wasn't enough. Consider:
- T27: check if qwen rt TP composition — is it CSS or another fixture dragging it under?

### Priority 5 — TSX plan-card / article (structural, all tests)
`plan-card-label` and `plan-article-labelledby` remain in every model's FN list. Still not addressed at prompt level.

---

## Summary

T26 regressed to **10/20** — same floor as T24 — primarily due to the CSS-A two-pass split confusing gpt's chain-of-thought (CSS TP collapsed from 16→5 in rt, 15→6 in nt). deepseek gained 1 condition, kimi/qwen held steady, but gpt lost 3.

The core lesson: adding structural complexity to a sweep instruction harms models that reason in multi-step fashion (gpt think mode) more than it helps them. The simpler single-pass CSS-A with explicit base-selector examples and a targeted `:focus-visible` restraint note is the correct form for T27.
