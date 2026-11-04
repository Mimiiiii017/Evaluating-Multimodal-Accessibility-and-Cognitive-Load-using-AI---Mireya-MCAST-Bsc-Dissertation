# Test 20 — Results

**Date:** 6 April 2026
**Scope:** 4 fixtures (html-high, css-high, js-high, tsx-high) × 4 conditions (nn, nt, rn, rt) × 3 runs each
**Models (7):** gpt-oss:120b, kimi-k2.5, qwen3.5:397b, deepseek-v3.2, glm-5, gemini-3-flash-preview, mistral-large-3:675b
**What changed from T19:** Multi-query RAG implemented for CSS, JS, and TSX fixtures. HTML already had multi-query RAG from T18. This test isolates the effect of the multi-query RAG change on rn/rt conditions for non-HTML fixtures.

---

## 1. What Changed from T19

### Multi-query RAG for Non-HTML Fixtures

T19 identified a single-query bottleneck in the RAG retrieval path for CSS, JS, and TSX. A single `buildRagQuery()` call compressed all fixture semantics into one embedding query, causing low recall on multi-domain fixtures. In T20, three new multi-query sweeps were added to `benchmark.ts`:

**CSS sweep (3 queries):**
1. Focus indicators and `:focus-visible` — outline removal, `:focus-visible` overrides
2. Touch targets, `.sr-only` / visually-hidden utility patterns
3. `prefers-reduced-motion`, `forced-colors`, contrast ratios, word-spacing, link underlines

**JS sweep (4 queries):**
1. `aria-expanded` toggle state management — nav, menus, accordions
2. `aria-pressed` button state — toggle switches, billing toggles, filter buttons
3. `aria-invalid` validation state — form validation callbacks
4. `aria-live` announcement injection — status updates, result counts, pricing changes

**TSX sweep (4 queries):**
1. `htmlFor` / `aria-invalid` form field associations in React components
2. `aria-hidden` on decorative icons and spinners
3. `aria-expanded` / `aria-controls` for disclosure widgets
4. Landmark accessible names, `aria-current` navigation state

Each sweep issues top_k=2 per query with a 0.65 distance threshold, deduplicates, and caps at 6 chunks. The HTML sweep (5 queries, top_k=2, threshold 0.50, max 8 chunks) was unchanged.

No prompt changes. No KB changes (still 509 chunks). Differences in rn/rt conditions are attributable to multi-query RAG.

---

## 2. Results

### 2.1 Composite Score Matrix (primary ranking metric)

Composite = 80% F1 + 20% speed penalty. Models sorted by best composite across all 4 conditions.

| Model | nn | nt | rn | rt | **Best** |
|---|---|---|---|---|---|
| **qwen3.5:397b** | 43.7% | **52.7%** | 39.4% | 51.6% | **52.7% (nt)** |
| **gpt-oss:120b** | **52.5%** | 45.9% | 47.8% | 48.1% | **52.5% (nn)** |
| **kimi-k2.5** | 35.4% | 48.8% | 37.8% | **46.4%** | **48.8% (nt)** |
| **mistral-large-3** | 24.6% | 41.6% | 42.5% | **46.9%** | **46.9% (rt)** |
| **gemini-3-flash** | **41.6%** | 35.6% | 44.3% | 39.5% | **44.3% (rn)** |
| **deepseek-v3.2** | 33.8% | 36.4% | 29.3% | **32.7%** | **36.4% (nt)** |
| **glm-5** | 24.7% | 28.4% | 28.2% | **32.5%** | **32.5% (rt)** |

### 2.2 Overall F1 Score Matrix

| Model | nn | nt | rn | rt | **Best F1** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 40.0% | 45.5% | 41.4% | **46.3%** | **46.3% (rt)** |
| **gpt-oss:120b** | **46.0%** | 35.1% | 41.9% | 35.2% | **46.0% (nn)** |
| **qwen3.5:397b** | 35.0% | 40.9% | 33.3% | **40.1%** | **40.9% (nt)** |
| **glm-5** | 30.9% | 35.5% | 35.2% | **40.7%** | **40.7% (rt)** |
| **mistral-large-3** | 22.5% | 27.0% | 34.3% | **34.5%** | **34.5% (rt)** |
| **deepseek-v3.2** | 28.3% | **28.5%** | 29.6% | 23.1% | **29.6% (rn)** |
| **gemini-3-flash** | 27.0% | 20.7% | 30.3% | **25.3%** | **30.3% (rn)** |

### 2.3 F1 by Fixture and Condition

#### html-high (HTML markup, 51 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | **60.7%** | 31.2% | 56.9% | 42.5% | **47.8%** |
| **qwen3.5:397b** | 48.8% | 44.9% | 31.5% | **47.0%** | **43.1%** |
| **glm-5** | 26.8% | **45.2%** | 36.2% | 43.1% | **37.8%** |
| **kimi-k2.5** | 35.5% | 41.0% | 41.3% | **48.0%** | **41.5%** |
| **deepseek-v3.2** | 32.8% | 35.3% | **43.2%** | 34.4% | **36.4%** |
| **gemini-3-flash** | **34.6%** | 29.0% | 34.6% | 22.9% | **30.3%** |
| **mistral-large-3** | 34.4% | 27.9% | 28.8% | 26.0% | **29.3%** |

#### css-high (CSS accessibility, 50 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 51.2% | 55.5% | 56.3% | **56.6%** | **54.9%** |
| **glm-5** | 31.8% | 35.6% | **58.2%** | 56.6% | **45.5%** |
| **gpt-oss:120b** | **44.9%** | 38.8% | 42.3% | 37.7% | **40.9%** |
| **qwen3.5:397b** | 29.2% | **47.5%** | 27.4% | 45.2% | **37.3%** |
| **mistral-large-3** | 13.4% | 16.9% | 41.5% | **47.5%** | **29.8%** |
| **deepseek-v3.2** | 29.3% | 37.9% | **40.5%** | 11.8%† | **29.9%** |
| **gemini-3-flash** | 28.8% | 18.2% | **41.7%** | 30.2% | **29.7%** |

†deepseek rt CSS = 11.8% — deepseek CSS performance collapses when both thinking and RAG are active (see §3.4). Deepseek nt=37.9% and rn=40.5% both show healthy CSS performance; the regression is specific to the rt combination.

#### js-high (JavaScript ARIA dynamics, 50 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 21.8% | **35.5%** | 23.5% | 26.1% | **26.7%** |
| **qwen3.5:397b** | 23.7% | 26.0% | **30.7%** | 26.3% | **26.7%** |
| **mistral-large-3** | 2.6% | 24.9% | 26.9% | **27.0%** | **20.4%** |
| **gemini-3-flash** | 21.4% | 20.7% | 19.8% | **21.1%** | **20.8%** |
| **glm-5** | **20.0%** | **26.3%** | 15.8% | 20.8% | **20.7%** |
| **gpt-oss:120b** | **26.3%** | 16.6% | 19.6% | 11.2% | **18.4%** |
| **deepseek-v3.2** | 20.8% | **20.9%** | 8.2% | 19.0% | **17.2%** |

#### tsx-high (TypeScript + React ARIA patterns, 50 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | 52.0% | **53.6%** | 48.9% | 49.3% | **50.9%** |
| **kimi-k2.5** | 51.8% | 49.9% | 44.7% | **54.5%** | **50.2%** |
| **qwen3.5:397b** | 38.2% | **45.2%** | 43.8% | 41.8% | **42.3%** |
| **glm-5** | **43.5%** | 35.1% | 38.4% | 42.1% | **39.8%** |
| **mistral-large-3** | 39.7% | 38.1% | **40.0%** | 37.4% | **38.8%** |
| **deepseek-v3.2** | **30.3%** | 19.7% | 26.4% | 27.3% | **25.9%** |
| **gemini-3-flash** | 24.6% | 14.7% | 25.3% | **27.1%** | **22.9%** |

### 2.4 False Positive Summary

Total hallucinations across all models and runs. Lower is better.

| Model | nn | nt | rn | rt | **Total** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | 80 | 61 | 57 | 46 | 244 |
| **mistral-large-3** | 6 | **99** | 24 | 67 | 196 |
| **kimi-k2.5** | 59 | 59 | 21 | 55 | 194 |
| **qwen3.5:397b** | 13 | 19 | 22 | 23 | 77 |
| **glm-5** | 17 | 14 | 12 | 21 | 64 |
| **deepseek-v3.2** | 9 | 5 | 11 | 4 | 29 |
| **gemini-3-flash** | 7 | 7 | 18 | 7 | 39 |
| **Grand Total T20** | **191** | **264** | **165** | **223** | **843** |

T19 total FP was 722. T20 total = 843 (+121). The increase is concentrated in mistral nt (99, +73 vs T19), gpt nn (+28 vs T19 gpt), and kimi nn (+10). The rn condition improved overall (165 vs estimated T19 ~202 for rn).

### 2.5 Consistency (F1 σ across repeated runs)

Lower σ = more reproducible. Listed best-to-worst per condition.

| Model | nn σ | nt σ | rn σ | rt σ | **Avg σ** |
|---|---|---|---|---|---|
| **gemini-3-flash** | 0.049 | 0.053 | 0.089 | 0.050 | **0.060** |
| **qwen3.5:397b** | 0.116 | 0.120 | 0.135 | 0.120 | **0.123** |
| **mistral-large-3** | 0.156 | 0.081 | 0.092 | 0.095 | **0.106** |
| **deepseek-v3.2** | 0.141 | 0.122 | 0.172 | 0.135 | **0.143** |
| **glm-5** | 0.165 | 0.155 | 0.149 | 0.137 | **0.152** |
| **kimi-k2.5** | 0.206 | 0.110 | 0.153 | 0.161 | **0.158** |
| **gpt-oss:120b** | 0.134 | 0.187 | 0.146 | 0.163 | **0.158** |

Gemini remains the most consistent model across all conditions. Mistral improved notably in nt/rn/rt (0.081–0.095) vs T19 (0.123 avg). kimi and gpt remain the most variable.

---

## 3. Key Findings

### 3.1 Multi-Query RAG for CSS — Significant Win

The CSS multi-query sweep produced clear improvements in the rn condition (RAG + no-think) relative to nn (no-RAG + no-think):

| Model | rn CSS | nn CSS | Δ (rn − nn) |
|---|---|---|---|
| **mistral** | 41.5% | 13.4% | **+28.1pp** |
| **glm** | 58.2% | 31.8% | **+26.4pp** |
| **gemini** | 41.7% | 28.8% | **+12.9pp** |
| **deepseek** | 40.5% | 29.3% | **+11.2pp** |
| **kimi** | 56.3% | 51.2% | **+5.1pp** |
| **gpt** | 42.3% | 44.9% | −2.6pp |
| **qwen** | 27.4% | 29.2% | −1.8pp |

Five of seven models improved, with mistral (+28.1pp) and glm (+26.4pp) showing the largest gains. This validates the multi-query CSS sweep design. Mistral's baseline CSS score (13.4% nn) was near-unusable; multi-query RAG brought it into the normal range (41.5%). The two exceptions (gpt and qwen) regressed slightly, suggesting these models are less dependent on retrieved CSS context or were confused by the additional chunks.

### 3.2 Multi-Query RAG for JS — Mixed, with a Critical Regression

The JS multi-query sweep produced inconsistent results:

| Model | rn JS | nn JS | Δ |
|---|---|---|---|
| **mistral** | 26.9% | 2.6% | **+24.3pp** |
| **qwen** | 30.7% | 23.7% | **+7.0pp** |
| **kimi** | 23.5% | 21.8% | +1.7pp |
| **gemini** | 19.8% | 21.4% | −1.6pp |
| **glm** | 15.8% | 20.0% | −4.2pp |
| **gpt** | 19.6% | 26.3% | −6.7pp |
| **deepseek** | **8.2%** | 20.8% | **−12.6pp** |

Mistral benefited enormously (2.6% → 26.9%), rescuing it from the JS floor. Qwen also improved meaningfully. However, deepseek suffered a severe regression (20.8% → 8.2%). This is the largest single-fixture regression in the T20 run. The JS multi-query chunks appear to introduce conflicting context that causes deepseek's response parser to malfunction or produce systematically wrong issue IDs.

gpt's regression (−6.7pp) is also notable. Both deepseek and gpt are high-parameter models that may be more susceptible to context dilution from multi-query retrieval.

### 3.3 Multi-Query RAG for TSX — Minimal Benefit, Net Negative

The TSX multi-query sweep showed limited benefit:

| Model | rn TSX | nn TSX | Δ |
|---|---|---|---|
| **qwen** | 43.8% | 38.2% | +5.6pp |
| **gemini** | 25.3% | 24.6% | +0.7pp |
| **mistral** | 40.0% | 39.7% | +0.3pp |
| **gpt** | 48.9% | 52.0% | −3.1pp |
| **deepseek** | 26.4% | 30.3% | −3.9pp |
| **glm** | 38.4% | 43.5% | −5.1pp |
| **kimi** | 44.7% | 51.8% | **−7.1pp** |

Four models regressed. Only qwen (+5.6pp) showed a notable improvement. The TSX sweep queries may not be well-targeted to the actual gaps in TSX fixture coverage — the fixture relies heavily on React-specific `aria-*` prop patterns and dynamic state tracking which may require different KB content than what the TSX sweep queries retrieve.

### 3.4 deepseek CSS Collapse Under Think + RAG (rt)

An unexpected finding: deepseek's CSS performance collapses when both thinking and RAG are active simultaneously:

| Condition | deepseek CSS |
|---|---|
| nn (baseline) | 29.3% |
| nt (think only) | 37.9% |
| rn (RAG only) | 40.5% |
| rt (think + RAG) | **11.8%** |

The rt collapse (11.8%) is far below all other conditions and below T19 deepseek rt CSS (19.1%). The combination of multi-query RAG context injection with deep reasoning mode appears to produce context overload or a systematic output parsing failure for deepseek on CSS.

This pattern (think alone good, RAG alone good, think + RAG catastrophic) is a warning signal for multi-query RAG in thinking models that don't handle long contexts well.

### 3.5 qwen Breakout Performance

qwen3.5:397b showed dramatic improvement across all conditions compared to T19:

| Condition | T19 qwen | T20 qwen | Δ |
|---|---|---|---|
| nn | 27.7% | 43.7% | **+16.0pp** |
| nt | 30.6% | 52.7% | **+22.1pp** |
| rn | 28.4% | 39.4% | **+11.0pp** |
| rt | 28.3% | 51.6% | **+23.3pp** |

This magnitude of improvement (+11–23pp across all conditions, including the RAG-unchanged nn and nt) cannot plausibly be explained by the multi-query RAG change alone. It is attributable to an API-side model update to qwen3.5:397b between T19 and T20. qwen is now competitive with kimi and gpt in composite score.

### 3.6 kimi and deepseek Regression

Conversely, kimi and deepseek both showed T20 regressions:

| Model | T19 best | T20 best | Δ |
|---|---|---|---|
| kimi rt | 54.0% | 46.4% | −7.6pp |
| kimi nn | 45.4% | 35.4% | −10.0pp |
| deepseek nt | 48.6% | 36.4% | −12.2pp |
| deepseek rn | 43.7% | 29.3% | −14.4pp |

kimi's T19 rt composite of 54.0% (previous session best) dropped to 46.4%. deepseek's T19 nt composite of 48.6% dropped to 36.4%. These may reflect API-side changes or increased response variance. Neither regression is explained by the multi-query RAG change (which only affects rn/rt, and deepseek nt is RAG-free).

---

## 4. T19 → T20 Comparison Table

### Composite Score Deltas

| Model | nn Δ | nt Δ | rn Δ | rt Δ | **Net** |
|---|---|---|---|---|---|
| **qwen** | +16.0pp | **+22.1pp** | **+11.0pp** | **+23.3pp** | **+18.1pp avg** |
| **mistral** | −1.1pp | +7.1pp | **+16.0pp** | **+10.7pp** | **+8.2pp avg** |
| **gemini** | −0.2pp | +4.8pp | +4.3pp | +8.2pp | **+4.3pp avg** |
| **gpt** | +3.2pp | −4.3pp | +8.3pp | −1.4pp | **+1.5pp avg** |
| **deepseek** | −0.3pp | −12.2pp | −14.4pp | −6.7pp | **−8.4pp avg** |
| **glm** | −7.0pp | −7.7pp | −6.1pp | −0.9pp | **−5.4pp avg** |
| **kimi** | −10.0pp | +0.2pp | −5.5pp | −7.6pp | **−5.7pp avg** |

### Condition-Level Averages (across all 7 models)

| Condition | T19 avg | T20 avg | Δ |
|---|---|---|---|
| nn | 36.5% | 36.6% | +0.1pp (control — stable) |
| nt | 39.9% | 41.3% | +1.4pp |
| rn | 36.5% | 38.5% | **+2.0pp** |
| rt | 38.9% | 42.5% | **+3.6pp** |

rn and rt improved more than nn (+2.0pp and +3.6pp respectively) while the control condition nn stayed flat (+0.1pp), providing causal evidence that multi-query RAG is driving the rn/rt improvements. However, the improvements are modest and heavily model-dependent (qwen and mistral improved substantially; deepseek and kimi regressed in RAG conditions).

---

## 5. Model Status Summary

| Model | Best condition | T20 composite | T19 composite | T20 status |
|---|---|---|---|---|
| **qwen3.5:397b** | nt | 52.7% | 30.6% | ⬆ Breakout — apparent model upgrade between tests |
| **gpt-oss:120b** | nn | 52.5% | 50.2% | ↔ Stable (marginal improvement; RAG rn gain +8.3pp) |
| **kimi-k2.5** | nt | 48.8% | 54.0% | ⬇ Regressed from T19 high (54.0% rt → 46.4%) |
| **mistral-large-3** | rt | 46.9% | 36.2% | ⬆ Large RAG-driven improvement (rn +16.0pp, rt +10.7pp) |
| **gemini-3-flash** | rn | 44.3% | 41.8% | ↔ Modest improvement; consistent (σ 0.060) |
| **deepseek-v3.2** | nt | 36.4% | 48.6% | ⬇ Severe regression — JS rn collapse (8.2%), CSS rt collapse (11.8%) |
| **glm-5** | rt | 32.5% | 36.1% | ⬇ Regressed across all conditions; cause unclear |

---

## 6. Recommendations for T21

### 6.1 Fix deepseek JS multi-query RAG regression

**Priority: HIGH.** deepseek JS rn collapsed from 20.8% (nn) to 8.2% — a 12.6pp regression with multi-query RAG enabled. The JS sweep queries may be retrieving chunks that confuse deepseek's ARIA state detection logic. Options:
- Reduce the number of JS sweep queries from 4 to 2 (fewer chunks = less dilution)
- Increase the distance threshold for JS from 0.65 to 0.70 (more selective retrieval)
- Explicitly exclude annotation/tutorial-heavy KB files from the JS sweep
- Run A/B with no-RAG JS as a per-model gate (apply JS RAG only to models that benefit)

The deepseek CSS rt collapse (29.3% nt → 11.8% rt) is a further symptom of context overload when combining thinking + multi-query RAG.

### 6.2 Refine TSX multi-query RAG queries

**Priority: MEDIUM.** TSX multi-query RAG is net neutral/negative (4 of 7 models regressed). The TSX fixture's patterns (React prop-level `aria-*` attributes, conditional rendering of hidden elements, `aria-current` in router-linked `<nav>`) may not be well-covered by the current KB. The TSX sweep should be revised to target:
- `aria-hidden` on animated decorative content (carousels, spinners, skeleton loaders)
- `aria-describedby` reference ID correctness
- `role="dialog"` + `aria-modal` patterns in modal components

### 6.3 Investigate kimi and deepseek regression

**Priority: MEDIUM.** Both models regressed in conditions independent of multi-query RAG (kimi nn T19→T20: −10pp, deepseek nt T19→T20: −12.2pp). These regressions predate the multi-query change and suggest API-level model changes between the 22 March 2026 T19 run and the 6 April 2026 T20 run. If the API providers publish changelogs, check for model updates around late March / early April 2026.

### 6.4 Address mistral nt hallucination spike

**Priority: MEDIUM.** Mistral's nt FP count surged to 99 (vs 6 in nn), the highest FP count for any model × condition in T20. Like T19, mistral "thinks" its way into fabricating elaborate chains of hallucinated issues when given unbounded reasoning time. Consider adding a per-model FP penalty weight or capping mistral's FP budget in the composite score formula. Alternatively, prompt mistral specifically to avoid speculative ARIA attributions.

### 6.5 Investigate gpt hallucination concentration in TSX

**Priority: LOW.** gpt has a systematic hallucination pattern across tests: it consistently invents `FilterTabs aria-pressed` issues, `Section` missing accessible names, and `ContactForm aria-describedby` references regardless of condition. These account for a large proportion of its 244 T20 FPs (all conditions). A targeted exclusion rule in the HTML/TSX prompt may reduce gpt's hallucination rate significantly.

### 6.6 CSS and JS structural floor

**Priority: BACKGROUND.** The JS ceiling remains approximately 35% (kimi nt best), driven by the near-impossibility of static inference for live-region announcement patterns. 43 of 50 JS issues require reasoning about event-driven `aria-live` injection paths that cannot be fully resolved by code reading alone. This is a fundamental fixture design issue, not a model capability gap. Future tests could introduce a lighter-weight JS fixture that excludes live-region announcements in favour of verifiable static-state ARIA.
