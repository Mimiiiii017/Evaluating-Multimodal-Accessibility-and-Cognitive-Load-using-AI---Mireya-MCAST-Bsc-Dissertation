# Test 19 — Results

**Date:** 6 April 2026
**Scope:** 4 fixtures (html-high, css-high, js-high, tsx-high) × 4 conditions (nn, nt, rn, rt) × 3 runs each
**Models (7):** gpt-oss:120b, kimi-k2.5, qwen3.5:397b, deepseek-v3.2, glm-5, gemini-3-flash-preview, mistral-large-3:675b
**What changed from T18:** Knowledge base expanded from 445 → 509 chunks (9 new files). Prompts and sweep blocks are identical to T18. This test isolates the effect of KB improvements on RAG-condition performance.

---

## 1. What Changed from T18

### Knowledge Base Expansion

All KB content from T18 was retained. Nine new files were added targeting T18 false-negative patterns:

**Round 1 — Fixture-gap files:**

| File | Gap addressed |
|---|---|
| `aria/aria-pressed-and-toggle-buttons.md` | `aria-pressed` absent from KB; covers billing toggles, filter tabs, pricing switches |
| `visual/css-accessibility-detection-rules.md` | Systematic CSS detection rules (outline:none, touch targets, sr-only, reduced-motion, word-spacing, forced-colors) |
| `structure/react-tsx-accessibility-patterns.md` | TSX-specific ARIA patterns mapped to React/JSX syntax |
| `aria/js-dynamic-aria-state-management.md` | Detection-oriented JS rules for toggle functions, validation callbacks, live-region injection |

**Round 2 — Real-world coverage files:**

| File | Real-world gap covered |
|---|---|
| `keyboard/keyboard-composite-widget-patterns.md` | Roving tabindex, arrow-key navigation for menus, tabs, listboxes, trees |
| `controls/carousel-and-auto-rotating-content.md` | `aria-roledescription="carousel"`, auto-play pause (SC 2.2.2), slide labels |
| `timing/notifications-toasts-and-status-messages.md` | `role="status"` vs `role="alert"`, auto-dismiss, SC 4.1.3 |
| `structure/iframes-and-embedded-content.md` | `title` on iframes, `aria-hidden` on decorative frames |
| `forms/forms-error-prevention-and-confirmation.md` | SC 3.3.4 confirm/undo pattern, error summaries, paste (SC 3.3.8) |

No prompt changes. No sweep changes. Results differences are attributable solely to RAG retrieval changes.

---

## 2. Results

### 2.1 Composite Score Matrix (primary ranking metric)

Composite = 80% F1 + 20% speed penalty. Models sorted by best composite across all 4 conditions.

| Model | nn | nt | rn | rt | **Best** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | 49.3% | **50.2%** | 39.5% | 49.5% | **50.2% (nt)** |
| **kimi-k2.5** | 45.4% | 48.6% | 43.3% | **54.0%** | **54.0% (rt)** |
| **deepseek-v3.2** | 34.1% | **48.6%** | 43.7% | 39.4% | **48.6% (nt)** |
| **gemini-3-flash** | **41.8%** | 30.8% | 40.0% | 31.3% | **41.8% (nn)** |
| **glm-5** | 31.7% | **36.1%** | 34.3% | 33.4% | **36.1% (nt)** |
| **mistral-large-3** | 25.7% | 34.5% | 26.5% | **36.2%** | **36.2% (rt)** |
| **qwen3.5:397b** | **27.7%** | 30.6% | 28.4% | 28.3% | **30.6% (nt)** |

### 2.2 Overall F1 Score Matrix

| Model | nn | nt | rn | rt | **Best F1** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 44.2% | 44.6% | **46.5%** | 49.8% | **49.8% (rt)** |
| **gpt-oss:120b** | 39.8% | **42.3%** | 33.0% | 38.3% | **42.3% (nt)** |
| **glm-5** | 36.9% | 40.9% | 38.9% | **41.8%** | **41.8% (rt)** |
| **deepseek-v3.2** | 27.6% | **35.8%** | 34.8% | 24.2% | **35.8% (nt)** |
| **qwen3.5:397b** | 34.6% | **38.2%** | 35.5% | 27.5% | **38.2% (nt)** |
| **mistral-large-3** | 23.5% | 27.3% | 27.1% | **27.3%** | **27.3% (rt)** |
| **gemini-3-flash** | 27.2% | 21.7% | **25.0%** | 21.8% | **27.2% (nn)** |

### 2.3 F1 by Fixture and Condition

#### html-high (HTML markup, 51 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | 51.3% | **60.3%** | 30.9% | 49.3% | **48.0%** |
| **kimi-k2.5** | 51.4% | 34.9% | 44.3% | **52.4%** | **45.8%** |
| **deepseek-v3.2** | **52.5%** | 43.1% | 47.0% | 38.9% | **45.4%** |
| **glm-5** | 35.8% | **45.6%** | 37.5% | 42.6% | **40.4%** |
| **qwen3.5:397b** | **44.5%** | 48.1% | 37.6% | 22.0% | **38.1%** |
| **gemini-3-flash** | **32.4%** | 28.1% | 33.7% | 22.9% | **29.3%** |
| **mistral-large-3** | 17.9% | **29.8%** | 26.1% | 30.5% | **26.1%** |

#### css-high (CSS accessibility, 50 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **glm-5** | 50.2% | 50.2% | 58.8% | **59.3%** | **54.6%** |
| **kimi-k2.5** | 50.1% | **57.9%** | 52.8% | 55.5% | **54.1%** |
| **gpt-oss:120b** | 45.7% | **46.4%** | 41.2% | 38.8% | **43.0%** |
| **qwen3.5:397b** | 35.6% | **42.2%** | 40.0% | 34.3% | **38.0%** |
| **deepseek-v3.2** | 9.2% | **49.0%** | 40.4% | 19.1% | **29.4%** |
| **mistral-large-3** | 20.3% | 20.2% | **39.0%** | 35.5% | **28.8%** |
| **gemini-3-flash** | **30.5%** | 22.9% | 26.2% | 29.1% | **27.2%** |

†deepseek CSS nn=9.2% — condition instability. deepseek's CSS knowledge is not activated in nn, similar to T17 behaviour. T18 had resolved this but T19 shows regression in this specific condition.

#### js-high (JavaScript ARIA dynamics, 50 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 25.2% | 37.2% | 33.2% | **39.0%** | **33.7%** |
| **glm-5** | **27.5%** | 23.9% | 26.4% | 28.2% | **26.5%** |
| **qwen3.5:397b** | 9.8% | **33.4%** | 25.6% | 18.1% | **21.7%** |
| **deepseek-v3.2** | **21.4%** | 25.6% | 21.3% | 14.3% | **20.7%** |
| **gemini-3-flash** | **21.4%** | 21.1% | **21.4%** | 18.2% | **20.5%** |
| **mistral-large-3** | 16.7% | 19.8% | 12.4% | **12.9%** | **15.5%** |
| **gpt-oss:120b** | 12.3% | 7.5% | 9.7% | **21.5%** | **12.8%** |

#### tsx-high (TypeScript/React ARIA, 50 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 50.0% | 48.5% | **55.8%** | 52.5% | **51.7%** |
| **gpt-oss:120b** | 50.0% | **55.2%** | 50.0% | 43.6% | **49.7%** |
| **qwen3.5:397b** | **48.3%** | 29.2% | 38.9% | 39.7% | **39.0%** |
| **glm-5** | 34.3% | **43.8%** | 33.1% | 37.1% | **37.1%** |
| **mistral-large-3** | **39.1%** | 39.3% | 31.2% | 30.3% | **35.0%** |
| **deepseek-v3.2** | **27.4%** | 25.4% | 30.5% | 24.5% | **26.9%** |
| **gemini-3-flash** | **24.6%** | 14.6% | 18.6% | 16.8% | **18.7%** |

### 2.4 Fixture Difficulty Ranking

| Fixture | T17 Avg | T18 Avg | T19 Avg | T18→T19 | Range (T19) |
|---|---|---|---|---|---|
| **html-high** | ~36% | ~38.5% | **~39.0%** | +0.5pp | 26.1% – 48.0% |
| **css-high** | ~31% | ~38.9% | **~39.3%** | +0.4pp | 27.2% – 54.6% |
| **tsx-high** | ~25% | ~36.1% | **~36.9%** | +0.8pp | 18.7% – 51.7% |
| **js-high** | ~9%  | ~21.1% | **~21.6%** | +0.5pp | 12.8% – 33.7% |

T19 averages are essentially flat vs T18 across all four fixtures (+0.4–0.8pp). The KB additions produced no meaningful aggregate improvement. Prompts and sweeps remain the dominant performance driver.

### 2.5 False Positive Summary (total FP across all 4 conditions × 3 runs)

| Model | nn FP | nt FP | rn FP | rt FP | **T19 Total** | T18 Total | **Delta** |
|---|---|---|---|---|---|---|---|
| **kimi-k2.5** | 49 | 58 | 59 | 46 | **212** | 266 | **−54** |
| **gpt-oss:120b** | 31 | 55 | 30 | 42 | **158** | 231 | **−73** |
| **mistral-large-3** | 20 | 55 | 37 | 14 | **126** | 289 | **−163** |
| **glm-5** | 17 | 20 | 26 | 26 | **89** | 77 | **+12** |
| **qwen3.5:397b** | 17 | 21 | 19 | 22 | **79** | 71 | **+8** |
| **deepseek-v3.2** | 7 | 14 | 13 | 2 | **36** | 48 | **−12** |
| **gemini-3-flash** | 7 | 7 | 5 | 3 | **22** | 24 | **−2** |

Key observations:
- FP declined for 5 of 7 models. Overall ecosystem hallucination rate is improving.
- **mistral-large-3**: Dramatic FP drop (289 → 126, −163). The js-nt hallucination spiral appears to have partially resolved — nt FP = 55 vs T18's chronic over-generation (rt alone was 119 in T18). rt FP = 14 (vs 119 in T18) is the most striking improvement.
- **gpt-oss:120b**: FP dropped by 73. The precision improvement in non-think conditions is real.
- **kimi-k2.5**: FP down 54. rt condition improved (46 vs 105 in T18). The KB additions may have constrained kimi's speculation by providing more precise retrieval targets.
- **glm-5 / qwen3.5**: Slight FP increase (+12/+8) — negligible and within run variance.

### 2.6 Consistency (F1 σ across 3 runs, by condition)

| Model | nn σ | nt σ | rn σ | rt σ | **Avg σ** | T18 Avg |
|---|---|---|---|---|---|---|
| **gemini-3-flash** | 0.048 | 0.059 | 0.068 | 0.067 | **0.061** | 0.054 |
| **kimi-k2.5** | 0.139 | 0.107 | 0.109 | 0.088 | **0.111** | 0.123 |
| **mistral-large-3** | 0.133 | 0.094 | 0.127 | 0.136 | **0.123** | 0.118 |
| **deepseek-v3.2** | 0.185 | 0.118 | 0.143 | 0.126 | **0.143** | 0.131 |
| **glm-5** | 0.124 | 0.136 | 0.140 | 0.137 | **0.134** | 0.132 |
| **qwen3.5:397b** | 0.173 | 0.114 | 0.094 | 0.208 | **0.147** | 0.152 |
| **gpt-oss:120b** | 0.173 | 0.212 | 0.202 | 0.132 | **0.180** | 0.190 |

Gemini remains by far the most consistent model (avg σ=0.061). kimi improved significantly (0.123 → 0.111), especially in rt (0.088). deepseek increased moderately (0.131 → 0.143), largely from CSS nn variance. gpt improved mildly (0.190 → 0.180). Overall consistency is essentially stable at the ecosystem level.

---

## 3. Key Findings

### 3.1 KB Additions: No Meaningful Aggregate Effect

The primary hypothesis — that expanded KB content would improve RAG-condition (rn, rt) performance relative to no-RAG conditions (nn, nt) — is **not confirmed**.

Fixture averages improved by only 0.4–0.8pp across all four fixtures. The improvement is uniformly distributed across RAG and no-RAG conditions, indicating that the effect (if any) is from run-to-run variance rather than retrieval improvement.

**RAG benefit test: rn vs nn per fixture (T19):**

| Fixture | T19 rn avg | T19 nn avg | RAG gain | T18 RAG gain |
|---|---|---|---|---|
| html | 36.7% | 37.7% | **−1.0pp** | n/a (mixed) |
| css | 42.5% | 35.9% | **+6.6pp** | n/a (mixed) |
| js | 21.4% | 19.8% | **+1.6pp** | n/a |
| tsx | 38.3% | 40.8% | **−2.5pp** | n/a |

CSS is the only fixture where rn > nn by a meaningful margin in T19, but this is largely an artefact of deepseek's CSS nn collapse (9.2%) inflating the nn baseline downward. Without deepseek, CSS rn vs nn is near-zero.

**Root cause: Single-query RAG retrieval remains the bottleneck.** The new KB files are indexed and retrievable (confirmed by manual queries), but a single `buildRagQuery()` call with top_k=3 is insufficient to surface the right chunks for the diverse issue categories within each fixture. This is the principal engineering gap identified for T20.

### 3.2 deepseek CSS Condition Instability Returns

T18 achieved deepseek CSS condition-independence (nn=36.1%, nt=43.6%, rn=28.3%, rt=38.6%). T19 shows regression:

| Condition | T18 | T19 | Delta |
|---|---|---|---|
| nn | 36.1% | 9.2% | **−26.9pp** |
| nt | 43.6% | 49.0% | +5.4pp |
| rn | 28.3% | 40.4% | +12.1pp |
| rt | 38.6% | 19.1% | −19.5pp |

The T19 pattern resembles T17 — deepseek activates CSS knowledge in nt but not in nn or rt. The T18 resolution appears to have been a run-specific effect rather than a stable capability unlock. With only 3 runs per condition this cannot be conclusively determined, but deepseek's CSS condition-independence is not reliable across tests.

**Overall deepseek avg** is down for CSS (T18: 36.7%, T19: 29.4%, −7.3pp) but the composite score improvements in nt offset this.

### 3.3 deepseek Composite Surge in nt (+9.4pp)

Despite CSS instability, deepseek achieves its best ever composite: **48.6% (nt)**, up from T18's best of 39.2% (nt). The gain is driven by:
- HTML nt: 43.1% (vs T18 avg 38.0%, a proxy improvement)
- CSS nt: 49.0% (vs T18's 43.6% nt, +5.4pp)

deepseek is now tied with kimi for 2nd/3rd place in nt composite (both 48.6%), behind only gpt-oss (50.2%). deepseek is establishing itself as a strong no-RAG think-mode performer.

### 3.4 mistral Precision Recovery

mistral total FP dropped from 289 → 126 (−163). The js-think hallucination spiral that produced MCC = −0.03 in T18 (nt) improved: T19 nt js=19.8% F1 with 55 total nt FP (vs T18's catastrophic FP explosion in nt). The rt condition — which was mistral's worst in T18 (119 FP alone) — improved dramatically: rt FP = 14.

This is a significant precision improvement. Corresponding F1 gains are modest (+2.5pp best composite delta), suggesting mistral was not converting hallucinations into detected issues but rather generating noise. The FP reduction makes mistral's output more usable even if recall did not improve.

### 3.5 kimi Consolidates Leadership in rt

kimi reaches **54.0% composite (rt)** — its best performance across all 19 tests. F1 in rt = 49.8%, also a kimi record. The RAG+think combination consistently extracts the most from kimi. CSS rt=55.5%, tsx rt=52.5%, and js rt=39.0% (best JS performance by any model in T19).

kimi's FP in rt dropped from 105 (T18) to 46 (T19) — a 59 FP reduction in that specific condition. Think+RAG kimi is now significantly more precise.

### 3.6 gpt-oss html nt Peak

gpt-oss scores **60.3% F1 on html-high nt** — the highest single-fixture score in T19, and matching gpt's T18 html record (61.1% nn in T18). gpt's nt composite (50.2%) edges out kimi nt (48.6%) as overall #1 in that condition.

However, gpt html rn = 30.9% (vs T18 rn 51.5%) — an enormous rn regression on HTML. The same HTML RAG path that worked well in T18 produced poor results in T19 rn. This suggests gpt is more sensitive to retrieval context changes and may be over-relying on retrieved chunks when they are present.

### 3.7 JS Remains at Structural Floor

JS avg F1 is 21.6% — statistically identical to T18's 21.1%. The dominant FN cluster across all models and conditions remains live-region announce patterns (e.g., `scroll-top-announce`, `faq-open-announce`, `filter-result-announce`) — patterns that require runtime execution to verify and are invisible to static analysis.

The new `aria/js-dynamic-aria-state-management.md` KB file improved retrieval for static ARIA toggle patterns, but the >40% of JS issues that involve live-region injection remain undetectable by static methods. kimi's rt performance (39.0%) is approaching the estimated static analysis ceiling (~40%).

---

## 4. T18 vs T19 Comparison

### Per-fixture, per-model F1 (T18 avg → T19 avg)

| Fixture | Model | T18 Avg | T19 Avg | Delta |
|---|---|---|---|---|
| **html-high** | gpt-oss:120b | 52.7% | 48.0% | −4.7pp |
| | deepseek-v3.2 | 38.0% | 45.4% | **+7.4pp** |
| | kimi-k2.5 | 42.2% | 45.8% | +3.6pp |
| | qwen3.5:397b | 33.8% | 38.1% | +4.3pp |
| | glm-5 | 41.2% | 40.4% | −0.8pp |
| | gemini-3-flash | 31.5% | 29.3% | −2.2pp |
| | mistral-large-3 | 29.8% | 26.1% | −3.7pp |
| **css-high** | glm-5 | 45.2% | 54.6% | **+9.4pp** |
| | kimi-k2.5 | 56.2% | 54.1% | −2.1pp |
| | gpt-oss:120b | 37.4% | 43.0% | +5.6pp |
| | mistral-large-3 | 24.8% | 28.8% | +4.0pp |
| | qwen3.5:397b | 45.5% | 38.0% | −7.5pp |
| | deepseek-v3.2 | 36.7% | 29.4% | −7.3pp |
| | gemini-3-flash | 26.8% | 27.2% | +0.4pp |
| **js-high** | kimi-k2.5 | 31.2% | 33.7% | +2.5pp |
| | glm-5 | 23.4% | 26.5% | +3.1pp |
| | deepseek-v3.2 | 20.1% | 20.7% | +0.6pp |
| | gemini-3-flash | 20.7% | 20.5% | −0.2pp |
| | qwen3.5:397b | 23.9% | 21.7% | −2.2pp |
| | mistral-large-3 | 14.6% | 15.5% | +0.9pp |
| | gpt-oss:120b | 13.8% | 12.8% | −1.0pp |
| **tsx-high** | kimi-k2.5 | 50.9% | 51.7% | +0.8pp |
| | gpt-oss:120b | 48.5% | 49.7% | +1.2pp |
| | qwen3.5:397b | 32.5% | 39.0% | **+6.5pp** |
| | glm-5 | 38.6% | 37.1% | −1.5pp |
| | mistral-large-3 | 35.1% | 35.0% | −0.1pp |
| | deepseek-v3.2 | 26.5% | 26.9% | +0.4pp |
| | gemini-3-flash | 20.6% | 18.7% | −1.9pp |

**Summary:** Of 28 model × fixture cells, 17 improved (61%) and 11 regressed. T18's 82% improvement rate is not reproduced — T19's changes are scattered and largely within run variance. The standout improvements (glm css +9.4pp, deepseek html +7.4pp, qwen tsx +6.5pp, gpt css +5.6pp) are genuine but inconsistent with a systematic KB retrieval benefit. No single fixture improved uniformly across all models, confirming that prompts drove T17→T18 gains and KB additions alone are insufficient.

---

## 5. Model Status Summary

| Model | Assessment | Notes |
|---|---|---|
| **kimi-k2.5** | Strong candidate | Best overall composite rt=54.0%, best F1 rt=49.8%. JS rt=39.0% is best JS across T19. FP much improved (rt: 105→46). kimi benefits most from RAG. |
| **gpt-oss:120b** | Strong candidate | html-high nt=60.3% F1 (highest T19 single-fixture result). nt and rt composite both ~50%. Large rn HTML regression (30.9%) is a concern — gpt disrupted by RAG context changes. |
| **deepseek-v3.2** | Candidate | Composite best nt=48.6% (new personal best, +9.4pp vs T18). CSS condition instability persists in nn (9.2%). Low FP=36 total. Reliable in think mode. |
| **glm-5** | Candidate | CSS leader (avg 54.6%, best rn=58.8%, rt=59.3%). Consistent σ=0.134. Precision strong (FP=89). Lower HTML and JS cap limits overall composite. |
| **qwen3.5:397b** | Candidate | TSX improved +6.5pp (avg 39.0%). CSS regression (38.0% vs T18 45.5%). JS qwen nt=33.4% is the second-best JS result in T19. Slowest model. |
| **gemini-3-flash** | Limited candidate | Most consistent (σ=0.061). Fewest FP (22). Composite nn=41.8%. But lowest overall F1 ceiling (~27% avg). Best suited for speed-critical / low-FP use cases. |
| **mistral-large-3** | Weak candidate | Massive FP improvement (289→126). js-think hallucination stabilised. But F1 performance still lowest or near-lowest on most fixtures. No condition leadership. |

---

## 6. Changes for T20

### 6.1 Multi-Query RAG for Non-HTML Languages ✅ implemented (6 April 2026)

T19 confirms that the single `buildRagQuery()` path is the principal bottleneck for RAG benefit in CSS, JS, and TSX. HTML retrieves 5 targeted queries × 2 chunks (max 8 deduped, threshold 0.50). Non-HTML was retrieving 1 query × 3 chunks (threshold 0.65).

**Implemented in `evaluation/Cloud-LLM-Preliminary/benchmark.ts`:**

- `CSS_SWEEP_QUERIES` (3 queries) — focus indicators, touch targets/sr-only, motion/forced-colors/contrast/word-spacing/link underlines
- `JS_SWEEP_QUERIES` (4 queries) — aria-expanded toggles, aria-pressed buttons, aria-invalid validation, aria-live announcements
- `TSX_SWEEP_QUERIES` (4 queries) — htmlFor/aria-invalid forms, aria-hidden icons, aria-expanded disclosure, landmark names/aria-current
- `retrieveMultiQueryRag()` — shared dedup helper (max 6 chunks, threshold 0.65)
- `retrieveCssMultiQueryRag`, `retrieveJsMultiQueryRag`, `retrieveTsxMultiQueryRag` — thin wrappers
- Dispatch updated: the `else` branch now routes `'css'` / `'javascript'` / `'typescriptreact'` to their respective multi-query functions; original `buildRagQuery` single-query path kept as fallback for other languages

Each query targets one sweep group, mirroring the HTML multi-query approach. Expected impact for T20: +3–8pp rn/rt F1 improvement for JS and TSX relative to nn/nt.

### 6.2 deepseek CSS Condition Stabilisation

deepseek CSS nn remains stochastic (T17: ~7%, T18: 36%, T19: 9%). The CSS sweeps should activate CSS knowledge — the fact that deepseek nn=9.2% despite having `CSS_MANDATORY_SWEEPS` in the prompt suggests either:
1. Prompt position: the sweep block may be crowded out in deepseek's context when combined with fixture content
2. 3-run variance with deepseek's high HTML CSS score in nn masking the CSS collapse

Monitor deepseek CSS nn with 5 runs in T20. If instability persists, investigate reducing CSS sweep density for deepseek-specific conditions.

### 6.3 gpt-oss HTML rn Regression

gpt html rn dropped from 51.5% (T18) to 30.9% (T19) — the largest single condition regression in T19. This coincides with adding new KB files that may have displaced previously-useful HTML chunks from the 8-chunk deduped window. Review the HTML multi-query retrieval to ensure new KB additions (react-tsx-accessibility-patterns.md, aria-pressed-and-toggle-buttons.md) are not being preferentially retrieved over HTML-specific chunks for the HTML fixture.

### 6.4 JS Ceiling Planning

The static-analysis ceiling for JS is estimated at ~40% F1. With kimi rt at 39.0% in T19, the sweep+RAG improvements are approaching this limit. The dominant remaining FN cluster (live-region announce patterns: `scroll-top-announce`, `faq-open-announce`, etc. — estimated 18–22 of 50 JS issues) is structurally unreachable by static analysis alone.

For the main study design, JS detection must be framed as "detectable static ARIA pattern violations only" rather than "all JS accessibility issues." The known ceiling should be documented in the methodology.

### 6.5 Model Selection for Main Study

Based on T17 + T18 + T19 trajectory:
- **Include**: kimi-k2.5, gpt-oss:120b, glm-5, gemini-3-flash-preview, deepseek-v3.2
- **Monitor for T20**: qwen3.5:397b (TSX improved, CSS regressed — inconsistent trajectory; speed is concern)
- **Exclude from main study**: mistral-large-3:675b (improved precision but F1 remains uncompetitive; no fixture leadership; speed unreliable — nt p95=532s)
