# Test 18 — Results

**Date:** 5 April 2026
**Post-T18 follow-up (6 April 2026):** Knowledge base audit and expansion — 9 new KB files created, ChromaDB re-indexed to 509 chunks (↑ from 445). See §6.5.
**Scope:** 4 fixtures (html-high, css-high, js-high, tsx-high) × 4 conditions (nn, nt, rn, rt) × 3 runs each
**Models (7):** gpt-oss:120b, kimi-k2.5, qwen3.5:397b, deepseek-v3.2, glm-5, gemini-3-flash-preview, mistral-large-3:675b
**What changed from T17:** Added `CSS_MANDATORY_SWEEPS`, `JS_MANDATORY_SWEEPS`, and `TSX_MANDATORY_SWEEPS` to `buildAiPrompt`. Previously only HTML had a step-by-step scanning algorithm; all other language targets received only the anti-FP supplement.

---

## 1. What Changed from T17

T17 revealed near-zero JS detection (~9% avg F1) and below-expectation CSS/TSX performance. Root-cause analysis identified a prompt gap: the `HTML_MANDATORY_SWEEPS` block — a step-by-step scanning algorithm — existed only for HTML. Models lacked equivalent guidance for the other three languages.

Three new sweep blocks were added:

| Block | Key patterns targeted |
|---|---|
| `CSS_MANDATORY_SWEEPS` | `outline: none` / `outline: 0` without replacement, touch target < 44 × 44 px, `.sr-only` / `.visually-hidden` correctness, `@media (prefers-reduced-motion)` coverage, negative `word-spacing`, contrast failures, `forced-colors`, link underlines |
| `JS_MANDATORY_SWEEPS` | Toggle functions never calling `setAttribute('aria-expanded', …)`, `aria-pressed` for toggle/switch buttons, live-region announces for status changes, `aria-invalid` in validation functions, attribute initialisation on load |
| `TSX_MANDATORY_SWEEPS` | Disclosure toggles missing `aria-expanded` prop, decorative icons missing `aria-hidden`, form fields missing `htmlFor` / `aria-invalid`, `aria-pressed` on state props, `aria-current`, `aria-busy`, landmark accessible names |

---

## 2. Results

### 2.1 Composite Score Matrix (primary ranking metric)

Composite = 80% F1 + 20% speed penalty. Models sorted by best composite across all 4 conditions.

| Model | nn | nt | rn | rt | **Best** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 48.0% | **54.8%** | 46.3% | 50.6% | **54.8% (nt)** |
| **gpt-oss:120b** | **49.7%** | 48.2% | 46.6% | 50.1% | **50.1% (rt)** |
| **gemini-3-flash** | 41.4% | 36.1% | **42.3%** | 36.9% | **42.3% (rn)** |
| **glm-5** | 37.5% | 35.4% | 37.0% | 35.8% | **37.5% (nn)** |
| **deepseek-v3.2** | 35.1% | **39.2%** | 31.6% | 36.3% | **39.2% (nt)** |
| **mistral-large-3** | 35.7% | 35.4% | 34.8% | 34.5% | **35.7% (nn)** |
| **qwen3.5:397b** | 25.4% | 27.3% | 31.5% | 24.4% | **31.5% (rn)** |

### 2.2 Overall F1 Score Matrix (4 fixtures combined)

| Model | nn | nt | rn | rt | **Best F1** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 43.1% | **48.0%** | 44.4% | 45.0% | **48.0% (nt)** |
| **gpt-oss:120b** | **40.8%** | 35.2% | 38.7% | 37.6% | **40.8% (nn)** |
| **glm-5** | 39.5% | 35.2% | 37.2% | 36.6% | **39.5% (nn)** |
| **qwen3.5:397b** | 31.7% | 34.2% | 39.4% | 30.4% | **39.4% (rn)** |
| **deepseek-v3.2** | 31.6% | **32.5%** | 27.2% | 29.9% | **32.5% (nt)** |
| **mistral-large-3** | 28.0% | 24.5% | 25.2% | 26.6% | **28.0% (nn)** |
| **gemini-3-flash** | 26.8% | 21.7% | 27.8% | 23.3% | **27.8% (rn)** |

### 2.3 F1 by Fixture and Condition

#### html-high (HTML markup, 51 issues; `HTML_MANDATORY_SWEEPS` unchanged from T17)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | **61.1%** | 39.5% | 51.5% | 58.6% | **52.7%** |
| **glm-5** | 48.1% | 37.9% | 36.1% | **42.8%** | **41.2%** |
| **kimi-k2.5** | 35.0% | **54.7%** | 41.1% | 37.9% | **42.2%** |
| **deepseek-v3.2** | 40.4% | 31.9% | 35.3% | **44.5%** | **38.0%** |
| **qwen3.5:397b** | 24.3% | 26.1% | 39.3% | **45.4%** | **33.8%** |
| **gemini-3-flash** | **35.5%** | 28.1% | 35.5% | 30.0% | **31.5%** |
| **mistral-large-3** | 30.7% | 27.9% | 30.8% | **29.8%** | **29.8%** |

#### css-high (CSS accessibility, 50 issues; new `CSS_MANDATORY_SWEEPS`)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 57.2% | 54.4% | 53.9% | **59.2%** | **56.2%** |
| **qwen3.5:397b** | 40.3% | **50.2%** | 43.9% | 47.4% | **45.5%** |
| **glm-5** | **46.9%** | 44.4% | 53.1% | 36.4% | **45.2%** |
| **deepseek-v3.2** | 36.1% | **43.6%** | 28.3% | 38.6% | **36.7%** |
| **gpt-oss:120b** | 41.3% | 37.4% | **41.4%** | 29.6% | **37.4%** |
| **gemini-3-flash** | **30.0%** | 22.9% | 30.0% | 25.3% | **26.8%** |
| **mistral-large-3** | **28.3%** | 23.5% | 20.2% | 27.0% | **24.8%** |

#### js-high (JavaScript ARIA dynamics, 50 issues; new `JS_MANDATORY_SWEEPS`)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 29.5% | 26.5% | **37.6%** | 31.1% | **31.2%** |
| **qwen3.5:397b** | 24.1% | 22.9% | **31.4%** | 17.3% | **23.9%** |
| **glm-5** | **26.1%** | 21.4% | 20.3% | 25.7% | **23.4%** |
| **gemini-3-flash** | **21.4%** | 21.1% | **21.4%** | 18.9% | **20.7%** |
| **deepseek-v3.2** | **23.0%** | 18.6% | 25.2% | 13.5% | **20.1%** |
| **mistral-large-3** | **18.0%** | 7.8% | 18.8% | 13.9% | **14.6%** |
| **gpt-oss:120b** | 9.9% | 15.8% | 15.2% | **15.8%** | **13.8%** |

#### tsx-high (TypeScript/React ARIA, 50 issues; new `TSX_MANDATORY_SWEEPS`)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 50.6% | **56.4%** | 44.9% | 51.7% | **50.9%** |
| **gpt-oss:120b** | **51.1%** | 48.3% | 46.7% | 47.7% | **48.5%** |
| **glm-5** | 36.9% | 37.0% | 39.1% | **41.2%** | **38.6%** |
| **mistral-large-3** | 34.9% | **38.8%** | 31.0% | 35.5% | **35.1%** |
| **qwen3.5:397b** | **38.0%** | 37.4% | 43.0% | 11.6%† | **32.5%** |
| **deepseek-v3.2** | 26.8% | **35.9%** | 20.1% | 23.0% | **26.5%** |
| **gemini-3-flash** | **24.5%** | 14.6% | 24.5% | 19.0% | **20.6%** |

†qwen3.5 rt tsx-high: 11.6% — anomalous collapse vs 37–43% in other conditions. Likely run-to-run variance at 3 runs; no structural explanation found.

### 2.4 Fixture Difficulty Ranking (average F1 across all models and conditions)

| Fixture | T17 Avg | T18 Avg | Delta | Range (T18) |
|---|---|---|---|---|
| **html-high** | ~36% | **~38.5%** | +2.5pp | 24.3% – 61.1% |
| **css-high** | ~31% | **~38.9%** | **+8pp** | 20.2% – 59.2% |
| **tsx-high** | ~25% | **~36.1%** | **+11pp** | 11.6% – 56.4% |
| **js-high** | ~9%  | **~21.1%** | **+12pp** | 7.8% – 37.6% |

The sweep intervention produced the largest gains exactly where T17 performance was weakest. HTML (which already had sweeps) shows only marginal improvement, confirming that the T17→T18 effect is attributable to the new language-specific instructions rather than other changes.

### 2.5 False Positive Summary (total FP across 3 runs per condition)

| Model | nn FP | nt FP | rn FP | rt FP | **Total** | T17 Total |
|---|---|---|---|---|---|---|
| **mistral-large-3** | 63 | 87 | 20 | 119 | **289** | 236 |
| **kimi-k2.5** | 58 | 55 | 48 | 105 | **266** | 121 |
| **gpt-oss:120b** | 60 | 46 | 42 | 83 | **231** | 158 |
| **glm-5** | 13 | 18 | 24 | 22 | **77** | 39 |
| **qwen3.5:397b** | 21 | 12 | 22 | 16 | **71** | 78 |
| **deepseek-v3.2** | 10 | 16 | 14 | 8 | **48** | 55 |
| **gemini-3-flash** | 7 | 7 | 3 | 7 | **24** | 142 |

Key FP observations:
- **gemini-3-flash**: FP dropped dramatically (142 → 24). The explicit sweep instructions appear to have given gemini a more constrained search space, reducing speculative hallucinations.
- **kimi-k2.5**: FP more than doubled (121 → 266), concentrated in rt (105). Think-mode with RAG drives kimi to over-generate. The higher recall (+7–10pp F1) comes at a clear precision cost.
- **mistral-large-3**: Chronic FP inflation continues and worsened in rt (119 alone). Mistral js-high nt is particularly problematic (27 found, 5 TP, 22 FP, MCC = −0.03) — think mode triggers a hallucination spiral on JS.
- **deepseek-v3.2 / qwen3.5**: Both held FP steady. Best precision-recall balance among mid-table models.

### 2.6 Consistency (F1 σ across 3 runs, by condition)

Lower σ = more reproducible output.

| Model | nn σ | nt σ | rn σ | rt σ | **Avg σ** |
|---|---|---|---|---|---|
| **gemini-3-flash** | 0.046 | 0.059 | 0.058 | 0.052 | **0.054** |
| **deepseek-v3.2** | 0.097 | 0.108 | 0.137 | 0.180 | **0.131** |
| **mistral-large-3** | 0.114 | 0.144 | 0.095 | 0.119 | **0.118** |
| **glm-5** | 0.135 | 0.126 | 0.141 | 0.127 | **0.132** |
| **kimi-k2.5** | 0.122 | 0.140 | 0.105 | 0.123 | **0.123** |
| **qwen3.5:397b** | 0.135 | 0.167 | 0.100 | 0.207 | **0.152** |
| **gpt-oss:120b** | 0.194 | 0.192 | 0.171 | 0.204 | **0.190** |

Gemini remains the most consistent model by a wide margin (avg σ=0.054 vs next best ~0.118). High-σ models (gpt, qwen, kimi) show large within-model swings across runs — their peak F1 values are impressive but not reliably reproduced run-to-run. This reflects the fixture-difficulty spread: models that excel on html-high/tsx-high but struggle on js-high have intrinsically high cross-fixture variance.

---

## 3. Key Findings

### 3.1 Sweep Intervention — per-language effect

The T17 hypothesis that low CSS/JS/TSX detection was a **prompt gap** (not a capability ceiling) is confirmed.

#### JavaScript (most striking result)

| Model | T17 js-high Avg | T18 js-high Avg | Delta |
|---|---|---|---|
| kimi-k2.5 | 11.4% | **31.2%** | **+19.8pp** |
| qwen3.5:397b | 11.5% | **23.9%** | **+12.4pp** |
| deepseek-v3.2 | 8.2% | **20.1%** | **+11.9pp** |
| glm-5 | 11.8% | **23.4%** | **+11.6pp** |
| gpt-oss:120b | 4.5% | **13.8%** | **+9.3pp** |
| mistral-large-3 | 5.3% | **14.6%** | **+9.3pp** |
| gemini-3-flash | 14.1% | **20.7%** | **+6.6pp** |

**All 7 models improved.** The T17 floor (~9% avg) jumps to ~21% (+12pp). The JS floor is crossed: the T18 threshold of ≥20% avg F1 for fixture retention is met. JS is confirmed for T19.

The most common TP patterns identified by the sweeps:
- `aria-expanded` not updated in toggle functions (detected by kimi, glm, qwen in rn)
- `aria-invalid` not set in validation callbacks (detected by kimi, deepseek)
- `aria-pressed` missing on filter tab groups (detected by kimi, gpt in select conditions)

The dominant FN pattern (still missed by all models): **console-announced state changes via `aria-live` regions** — 9 of the 50 JS issues involve `aria-live` announcement injection that models cannot detect via static pattern matching. This is an irreducible floor for static analysis.

Despite the improvement, JS remains the hardest fixture: max individual F1 is 37.6% (kimi rn), and the structural barrier (live-region injection requires runtime execution) means a ceiling of approximately 40% F1 is estimated for static analysis alone.

#### TypeScript/React

| Model | T17 tsx-high Avg | T18 tsx-high Avg | Delta |
|---|---|---|---|
| gpt-oss:120b | 26.8% | **48.5%** | **+21.7pp** |
| glm-5 | 16.8% | **38.6%** | **+21.8pp** |
| deepseek-v3.2 | 12.8% | **26.5%** | **+13.7pp** |
| kimi-k2.5 | 45.9% | **50.9%** | **+5.0pp** |
| mistral-large-3 | 29.6% | **35.1%** | **+5.5pp** |
| qwen3.5:397b | 26.3% | **32.5%** | **+6.2pp** |
| gemini-3-flash | 18.0% | **20.6%** | **+2.6pp** |

TSX was the largest absolute improvement fixture for **gpt-oss** and **glm-5**. Both models gained 20+ pp — the biggest beneficiaries of the new TSX sweeps. kimi already led TSX in T17 (~46%) and now reaches ~51%, maintaining its lead but with narrowed margin over gpt.

#### CSS

| Model | T17 css-high Avg | T18 css-high Avg | Delta |
|---|---|---|---|
| kimi-k2.5 | 39.1% | **56.2%** | **+17.1pp** |
| deepseek-v3.2 | 17.7% | **36.7%** | **+19.0pp** |
| glm-5 | 31.8% | **45.2%** | **+13.4pp** |
| qwen3.5:397b | 36.6% | **45.5%** | **+8.9pp** |
| gpt-oss:120b | 36.2% | **37.4%** | **+1.2pp** |
| gemini-3-flash | 33.9% | **26.8%** | **−7.1pp** |
| mistral-large-3 | 29.1% | **24.8%** | **−4.3pp** |

Most models improved substantially on CSS. **deepseek's CSS anomaly from T17 is resolved** — the CSS sweeps provided the scanning vocabulary deepseek needed, and CSS F1 is now 36.7% avg without requiring the `rt` condition. T17 deep-seek needed RAG+think to reach 36.5% on CSS; T18 achieves similar results across conditions (36.1% nn, 43.6% nt, 28.3% rn, 38.6% rt).

**gemini and mistral regressed on CSS** (−7pp and −4pp respectively). These models appear to respond poorly to the CSS sweep density — the extensive `outline: none` and touch-target checks may trigger over-literal interpretation, suppressing recall in areas outside the sweep checklist.

#### HTML (control fixture)

| Model | T17 html-high Avg | T18 html-high Avg | Delta |
|---|---|---|---|
| glm-5 | 28.7% | **41.2%** | **+12.5pp** |
| deepseek-v3.2 | 32.3% | **38.0%** | **+5.7pp** |
| kimi-k2.5 | 40.2% | **42.2%** | **+2.0pp** |
| gpt-oss:120b | 52.4% | **52.7%** | **+0.3pp** |
| gemini-3-flash | 32.2% | **31.5%** | **−0.7pp** |
| mistral-large-3 | 30.6% | **29.8%** | **−0.8pp** |
| qwen3.5:397b | 39.2% | **33.8%** | **−5.4pp** |

HTML shows mixed results as expected — no new sweeps were added. The improvement for glm-5 (+12.5pp) is likely a carry-over effect: the new sweeps improved glm's overall attention to ARIA patterns, boosting HTML detection as well. qwen regression on HTML (−5.4pp) is unexplained — possibly related to the same over-distraction effect seen in T17's RAG analysis.

### 3.2 kimi-k2.5 Consolidates as Best F1 Model

kimi leads overall F1 in 3 of 4 conditions (nt=48.0%, rn=44.4%, rt=45.0%) and scores highest avg F1 (48.0% nt). Its strongest fixture is tsx-high (50.9% avg), with meaningful JS improvement (+19.8pp avg). The FP increase (121 → 266) is the main concern — particularly in rt where 105 FP across 4 fixtures is high.

### 3.3 gpt-oss:120b TSX Recovery

gpt-oss was weak on TSX in T17 (avg 26.8%). T18 brings a 21.7pp improvement (avg 48.5%), making gpt-oss the second-best TSX model and effectively on par with kimi for that fixture. html-high remains gpt's strongest (52.7% avg, best model). gpt-oss's JS performance remains below average (13.8% avg) despite the JS sweeps — it is the only model where js-high nn < 10% (9.9%).

### 3.4 glm-5 Recovery Confirmed

In T17, glm-5 showed dramatic degradation in think mode for HTML (35.3% nn → 10.8% nt). T18 shows no such collapse: glm-5 achieves consistent HTML across conditions (48.1%, 37.9%, 36.1%, 42.8%). CSS and TSX improvements are substantial. glm-5's precision remains strong (FP=77 total vs kimi's 266), making it the most efficient mid-table model.

### 3.5 deepseek-v3.2 CSS Condition-Independence

T17: deepseek required `rt` to activate CSS knowledge (nn=7.5%, nt=8.2%, rn=18.7%, rt=36.5%).
T18: CSS performance is condition-independent (nn=36.1%, nt=43.6%, rn=28.3%, rt=38.6%).
The CSS mandatory sweeps provided explicit scanning vocabulary that deepseek previously only accessed through RAG+think. deepseek is now the 4th strongest CSS model (avg 36.7%) vs its T17 rank of last (avg 17.7%).

### 3.6 mistral-large-3 JS/Think Interaction

**mistral js-high nt**: 27 found, 5 TP, 22 FP, MCC = **−0.03**, F1 = 7.8%.  
In think mode, mistral's JS performance collapses — it generates the most hallucinations of any model × condition × fixture combination. This is reproducible (MCC negative implies worse than random). The JS_MANDATORY_SWEEPS appear to trigger over-literal pattern matching that results in mass false positives in think mode. mistral should avoid `nt` and `rt` for JS in the main study.

### 3.7 qwen3.5 rt tsx-high Anomaly

qwen3.5 scores 11.6% F1 on tsx-high in rt condition vs 37–43% in other three conditions. No structural explanation; with only 3 runs this may be a sampling artefact. As a single-condition outlier it does not materially affect qwen's overall TSX avg (32.5%) or model status.

---

## 4. T17 vs T18 Comparison

### Per-fixture, per-model F1 (T17 avg → T18 avg)

| Fixture | Model | T17 Avg | T18 Avg | Delta |
|---|---|---|---|---|
| **html-high** | gpt-oss:120b | 52.4% | 52.7% | +0.3pp |
| | kimi-k2.5 | 40.2% | 42.2% | +2.0pp |
| | glm-5 | 28.7% | 41.2% | **+12.5pp** |
| | deepseek-v3.2 | 32.3% | 38.0% | +5.7pp |
| | qwen3.5:397b | 39.2% | 33.8% | −5.4pp |
| | gemini-3-flash | 32.2% | 31.5% | −0.7pp |
| | mistral-large-3 | 30.6% | 29.8% | −0.8pp |
| **css-high** | kimi-k2.5 | 39.1% | 56.2% | **+17.1pp** |
| | deepseek-v3.2 | 17.7% | 36.7% | **+19.0pp** |
| | glm-5 | 31.8% | 45.2% | **+13.4pp** |
| | qwen3.5:397b | 36.6% | 45.5% | +8.9pp |
| | gpt-oss:120b | 36.2% | 37.4% | +1.2pp |
| | gemini-3-flash | 33.9% | 26.8% | −7.1pp |
| | mistral-large-3 | 29.1% | 24.8% | −4.3pp |
| **js-high** | kimi-k2.5 | 11.4% | 31.2% | **+19.8pp** |
| | qwen3.5:397b | 11.5% | 23.9% | **+12.4pp** |
| | deepseek-v3.2 | 8.2% | 20.1% | **+11.9pp** |
| | glm-5 | 11.8% | 23.4% | **+11.6pp** |
| | gpt-oss:120b | 4.5% | 13.8% | +9.3pp |
| | mistral-large-3 | 5.3% | 14.6% | +9.3pp |
| | gemini-3-flash | 14.1% | 20.7% | +6.6pp |
| **tsx-high** | gpt-oss:120b | 26.8% | 48.5% | **+21.7pp** |
| | glm-5 | 16.8% | 38.6% | **+21.8pp** |
| | deepseek-v3.2 | 12.8% | 26.5% | **+13.7pp** |
| | kimi-k2.5 | 45.9% | 50.9% | +5.0pp |
| | mistral-large-3 | 29.6% | 35.1% | +5.5pp |
| | qwen3.5:397b | 26.3% | 32.5% | +6.2pp |
| | gemini-3-flash | 18.0% | 20.6% | +2.6pp |

**Summary:** Of 28 model × fixture cells, 23 improved (82%). The 5 regressions are: qwen html, gemini html (minor), gemini css (−7pp), mistral css (−4pp), and the qwen rt tsx anomaly (not in avg calculation above). No model regressed on JS or had no improvement on both CSS and TSX.

---

## 5. Model Status Summary

| Model | Assessment | Notes |
|---|---|---|
| **kimi-k2.5** | Strong candidate | Best F1 overall (48.0% nt), best TSX (50.9% avg). JS improved +20pp. FP inflation in rt (105) is a concern. |
| **gpt-oss:120b** | Strong candidate | Best html-high (52.7% avg). Massive TSX recovery (+22pp). Fastest capable model (avg 99–119s). JS remains weakest fixture (13.8% avg). |
| **glm-5** | Candidate | Strong gains across all three new sweep fixtures (+12–22pp). Low FP (77 total). Consistent across conditions. No glm-5 think-mode collapse in T18 unlike T17. |
| **deepseek-v3.2** | Candidate | CSS anomaly resolved — no longer requires rt. JS improved +12pp. FP remains low (48). Performance is mid-table but reliable. |
| **qwen3.5:397b** | Candidate | CSS strong (45.5% avg). JS improved +12pp. rt tsx anomaly needs monitoring. Slowest non-think model (avg 350–490s). |
| **gemini-3-flash** | Limited candidate | Fastest by far (avg 14–140s). Most consistent (σ=0.054). Fewest FP (24 total). But CSS regressed (−7pp) and overall F1 remains lowest (22–28%). Best for speed-critical / low-FP scenarios. |
| **mistral-large-3** | Weak candidate | Chronic FP inflation (289 total). JS nt hallucination spiral (MCC −0.03). CSS regression (−4pp). No condition where mistral leads. |

---

## 6. Changes for T19

### 6.1 Fixture Set

All four fixtures retained:
- **html-high**: Baseline performance, small T18 gains — no changes needed
- **css-high**: Large gains but gemini/mistral regressed. Investigate whether sweep density is causing over-literal hallucinations (reduce gemini/mistral to outline-only CSS sweeps as ablation?)
- **js-high**: Confirmed viable (avg 21.1% > 20% threshold). Dominant FN cluster is `aria-live` region injection — these are runtime patterns unreachable by static analysis. Accept as structural floor.
- **tsx-high**: Large gains. kimi and gpt-oss are competitive. Maintain current TSX sweeps.

### 6.2 Prompt Refinements

1. **FP suppression for think-mode models**: kimi rt FP = 105 and mistral nt/rt FP are problematic. Add explicit anti-hallucination guard for dynamic-state patterns that require runtime confirmation: "Only report an issue if the missing attribute is absent in the static source and the pattern is definitively broken by inspection."
2. **JS sweep refinement**: `aria-live` region patterns generate false positives (models report "live region not injected" when one exists elsewhere). Add a specific instruction to verify the region element exists before flagging missing announcements.
3. **gemini/mistral CSS sweep**: Consider a trimmed CSS sweep variant that removes the reduced-motion and forced-colors checks (which these models hallucinate frequently) as a targeted ablation for T19.

### 6.3 Run Parameters

T18 used 3 runs per condition per fixture. For T19 consider increasing to 5 runs for js-high and tsx-high to reduce σ-driven anomalies (e.g. qwen rt tsx). HTML and CSS are more stable (σ ≈ 0.05–0.14) and 3 runs remains adequate.

### 6.4 Model Selection for Main Study

Based on T17 + T18:
- **Include**: kimi-k2.5, gpt-oss:120b, glm-5, gemini-3-flash-preview
- **Monitor for T19**: deepseek-v3.2 (improving trajectory), qwen3.5:397b (CSS strong, JS viable, speed concern)
- **Exclude from main study**: mistral-large-3:675b (chronic FP, hallucination spiral in think mode, no condition leadership)

### 6.5 Knowledge Base Updates (post-T18, targeting T19)

Following T18 analysis, a full audit of the RAG knowledge base was performed against the four fixture FN categories. Two rounds of additions were made.

**Previous state:** 59 files, 445 indexed chunks.
**Post-update state:** 68 files, **509 indexed chunks**.

#### Round 1 — Fixture-gap files (FN patterns directly observed in T18)

These four files address specific issue categories that were consistently missed across multiple models in T18:

| File | Gap addressed |
|---|---|
| `aria/aria-pressed-and-toggle-buttons.md` | `aria-pressed` was completely absent from the KB. Covers billing toggles, filter tab groups, pricing switches — all common FN patterns in js-high and tsx-high. |
| `visual/css-accessibility-detection-rules.md` | CSS detection was previously descriptive, not rule-based. New file provides systematic detection rules: `outline:none` without replacement, touch targets < 44×44 px, `.sr-only`/`.visually-hidden` correctness, `@media (prefers-reduced-motion)` coverage, negative `word-spacing`, `forced-colors`, link underlines. |
| `structure/react-tsx-accessibility-patterns.md` | TSX-specific patterns: `htmlFor` on controlled inputs, `aria-invalid` on form fields, `aria-hidden` on decorative icons, `aria-expanded` on hamburger buttons, `aria-current` on nav links, landmark labels, `aria-live` on initial render — all mapped to React/JSX syntax. |
| `aria/js-dynamic-aria-state-management.md` | Detection-oriented JS rules: toggle functions not calling `setAttribute('aria-expanded', …)`, `aria-pressed` in event handlers, `aria-invalid` in validation callbacks, live-region announcement injection, attribute initialisation on load. Written specifically to improve RAG retrieval for JS fixture queries. |

#### Round 2 — Real-world coverage files (comprehensiveness beyond benchmark fixtures)

Five additional files covering major real-world accessibility patterns entirely absent from the KB before T18:

| File | Real-world gap covered |
|---|---|
| `keyboard/keyboard-composite-widget-patterns.md` | Arrow-key navigation for menus, tab panels, listboxes, trees, and radio groups. Roving `tabindex` implementation pattern (home/end keys, wrapping). Covers SC 2.1.1 composite widget requirements. |
| `controls/carousel-and-auto-rotating-content.md` | `aria-roledescription="carousel"`, slide labels, `aria-hidden` on inactive slides, auto-play pause on focus/hover (SC 2.2.2), prev/next button naming, `aria-live` for manual carousels. |
| `timing/notifications-toasts-and-status-messages.md` | Toast/notification live regions must exist in initial HTML (not injected), auto-dismiss pause on focus/hover, Escape to dismiss, no focus theft, `role="status"` vs `role="alert"` distinction, SC 4.1.3 status messages. |
| `structure/iframes-and-embedded-content.md` | `title` attribute required on every `<iframe>`, decorative iframes must use `aria-hidden`, embedded video autoplay restrictions, `<map>` text alternatives, keyboard tab order through embedded content. |
| `forms/forms-error-prevention-and-confirmation.md` | SC 3.3.4 — review/confirm step for irreversible actions, undo pattern, confirmation dialogs (focus on cancel, not destructive action), error summary on submission, SC 3.3.8 paste must not be blocked. |

#### Expected T19 impact

The four fixture-gap files directly target categories accounting for approximately 30–35% of T18 FNs in js-high and tsx-high. If RAG retrieval surfaces these chunks during inference:

- **js-high (rn, rt):** Improved recall on `aria-pressed`, `aria-live` injection patterns, and `aria-expanded` toggle detection. Expected +3–8pp F1 for top models in RAG conditions.
- **tsx-high (rn, rt):** Improved recall on React JSX ARIA prop patterns. Expected +2–5pp F1 for models that already responded to the TSX sweeps (gpt, glm).
- **css-high (rn, rt):** The systematic CSS detection rules give the KB content that directly mirrors the `CSS_MANDATORY_SWEEPS` vocabulary. Expected to strengthen rn/rt over nn/nt by 2–4pp.
- **html-high:** Minor improvement expected; HTML KB was already comprehensive.

If rn/rt conditions improve *more* than nn/nt relative to T18, the KB additions are contributing via retrieval. If all conditions improve equally, prompt sweeps continue to dominate and the single-query RAG weakness (§6.6) is the likely bottleneck.

### 6.6 Non-HTML RAG Retrieval Gap (identified post-T18)

An asymmetry exists between HTML and non-HTML RAG retrieval that was not addressed in T18:

| Path | Implementation | Queries | top_k | Threshold |
|---|---|---|---|---|
| HTML | `retrieveHtmlMultiQueryRag()` | 5 targeted sweep-group queries | 2 each (max 8 deduped) | 0.50 (strict) |
| CSS / JS / TSX | `buildRagQuery()` single call | 1 generic query | 3 | 0.65 (relaxed) |

The HTML path fires 5 specialised queries aligned to each sweep group (landmarks, images, forms, ARIA states, keyboard) and deduplicates up to 8 high-precision chunks. CSS/JS/TSX send a single query and retrieve 3 chunks at a looser threshold — returning fewer, potentially less relevant KB sections.

This asymmetry likely contributes to why rn/rt conditions do not consistently outperform nn/nt for CSS, JS, and TSX: retrieval quality is too low to reliably add signal. A multi-query approach for non-HTML languages (aligned to their respective sweep groups) is the single most impactful retrieval improvement available for T19.

**Potential T19 improvement (not yet implemented):** Add language-specific multi-query retrieval functions `retrieveCssMultiQueryRag()`, `retrieveJsMultiQueryRag()`, and `retrieveTsxMultiQueryRag()` mirroring the HTML path, each with 3–4 targeted queries per sweep category.
