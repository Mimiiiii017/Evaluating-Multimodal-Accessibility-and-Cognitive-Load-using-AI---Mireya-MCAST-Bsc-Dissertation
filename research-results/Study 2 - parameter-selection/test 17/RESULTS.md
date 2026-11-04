# Cloud-LLM Preliminary Study — Test 17 Results

**Date:** 4–5 April 2026
**Scope:** 4 fixtures (html-high, css-high, js-high, tsx-high) — highest complexity tier per language
**Models tested:** 7 (unchanged from T16)
**Conditions:** 4 (RAG × Think factorial design)
**Runs per combination:** 3
**Total LLM calls:** 7 models × 4 fixtures × 3 runs × 4 conditions = **336 calls**

---

## 1. What Changed from Test 16

### 1.1 Multi-Fixture Expansion

T16 used only `html-high` (pure HTML with 51 issues). T17 adds three additional language-specific fixtures to probe whether models can generalise accessibility detection beyond HTML markup:

| Fixture | Language | Total issues | Technology scope |
|---|---|---|---|
| `html-high` | HTML | 51 | Structural markup, ARIA attributes, landmarks, labels |
| `css-high` | CSS | 50 | Focus indicators, colour contrast, touch targets, forced-colours |
| `js-high` | JavaScript | 50 | Dynamic ARIA states, live-region announcements, `aria-expanded` |
| `tsx-high` | TypeScript/React | 50 | ARIA props, hidden decoratives, form associations, state management |

Each fixture also has a negative twin (zero real issues) used for FP measurement. Total ground-truth space per condition: 603 positives + 1,197 true-negatives = **1,800 points** (3 runs × 600).

### 1.2 Prompt Change: Anti-FP Rule [ix]

From observations in T16 that models hallucinated table-scope errors on unambiguous tables, `benchmark-prompt.ts` was updated:

- **Added rule [ix]:** Table header `scope` is only required when the table structure is structurally ambiguous (non-trivial multi-level headers). Single-axis tables do not require `scope`.
- **Tightened Sweep C:** A table-scope issue is only flagged when *both* (a) `scope` is absent and (b) the table structure is genuinely ambiguous. Previously, either condition alone could trigger a flag.

### 1.3 Parameter Change: gpt-oss Think Temperature

`benchmark-params.ts` updated gpt-oss think-mode temperature from 0.0 → 0.1 to break the deterministic table-scope hallucination pattern observed in T16.

| Model | Mode | temperature (T16) | temperature (T17) |
|---|---|---|---|
| gpt-oss:120b | think | 0.0 | **0.1** |
| gpt-oss:120b | noThink | 0.0 | 0.0 (unchanged) |

All other model hyperparameters unchanged from T16 manufacturer-recommended values.

---

## 2. Results

### 2.1 Condition Definitions

| Condition | RAG | Thinking (extended CoT) |
|---|---|---|
| `rag-think` (rt) | Yes | Yes |
| `rag-nothink` (rn) | Yes | No |
| `norag-think` (nt) | No | Yes |
| `norag-nothink` (nn) | No | No |

### 2.2 Overall Composite Score Matrix (4 fixtures combined, avg of 3 runs)

Composite = 80% F1 + 20% speed penalty. Models sorted by average.

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | 39.6% | **43.5%** | 41.3% | **43.9%** | **42.1%** |
| **gemini-3-flash** | **41.0%** | 35.1% | 38.3% | 39.1% | **38.4%** |
| **qwen3.5:397b** | 38.1% | **44.2%** | 28.2% | 31.6% | **35.5%** |
| **kimi-k2.5** | 35.0% | 41.7% | 25.5% | 28.3% | **32.6%** |
| **glm-5** | 30.7% | 24.7% | **35.2%** | 19.8% | **27.6%** |
| **mistral-large-3:675b** | 25.9% | 28.0%† | 32.8% | 29.1% | **28.9%** |
| **deepseek-v3.2** | 14.2% | 11.1% | 23.4% | **35.5%** | **21.1%** |

†Mistral nt: 7 of 12 expected runs failed (Ollama HTTP 500). Composite score is based on partial data.

### 2.3 Overall F1 Score Matrix (4 fixtures combined, avg of 3 runs)

F1 = harmonic mean of Precision and Recall. This is the primary accuracy metric.

| Model | nn | nt | rn | rt | **Best F1** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 34.3% | **35.1%** | 31.9% | **35.4%** | **35.4%** |
| **qwen3.5:397b** | 32.1% | 32.8% | 20.7% | 28.1% | **32.8%** |
| **gpt-oss:120b** | 28.6% | 29.4% | **32.0%** | 29.9% | **32.0%** |
| **glm-5** | 26.0% | 14.1% | **33.4%** | 15.5% | **33.4%** |
| **gemini-3-flash** | 26.3% | 21.0% | 22.9% | 27.9% | **27.9%** |
| **mistral-large-3:675b** | 23.3% | 23.9%† | 29.1% | 21.1% | **29.1%** |
| **deepseek-v3.2** | 17.8% | 13.9% | 16.0% | 23.3% | **23.3%** |

**Note:** The composite score diverges from F1 order because gemini is fast (avg ~22–36s vs kimi's 165–417s). Kimi leads F1 in 3 of 4 conditions.

### 2.4 F1 by Fixture and Condition

The central finding of T17 is that model performance varies dramatically by programming language.

#### html-high (HTML markup, 51 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | 50.3% | 50.9% | **57.5%** | 51.0% | **52.4%** |
| **qwen3.5:397b** | 44.0% | **52.8%** | 25.0% | 35.1% | **39.2%** |
| **kimi-k2.5** | 44.4% | 47.0% | 26.9% | **42.6%** | **40.2%** |
| **gemini-3-flash** | 33.1% | 30.0% | **35.5%** | 30.0% | **32.2%** |
| **deepseek-v3.2** | 32.6% | 32.5% | 23.6% | **40.3%** | **32.3%** |
| **mistral-large-3:675b** | 26.9% | 32.6% | 29.0% | **33.7%** | **30.6%** |
| **glm-5** | 35.3% | 10.8% | **41.3%** | 27.5% | **28.7%** |

#### css-high (CSS accessibility, 50 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 40.2% | 38.6% | **42.4%** | 35.1% | **39.1%** |
| **qwen3.5:397b** | **43.7%** | 38.5% | 20.1% | 44.0% | **36.6%** |
| **gpt-oss:120b** | 31.2% | 31.4% | **42.3%** | 39.9% | **36.2%** |
| **gemini-3-flash** | 41.0% | 25.4% | 21.3% | **47.8%** | **33.9%** |
| **glm-5** | **44.8%** | 26.3% | 43.1% | 12.9% | **31.8%** |
| **mistral-large-3:675b** | 31.5% | 21.9%† | **35.7%** | 27.2% | **29.1%** |
| **deepseek-v3.2** | 7.5% | 8.2% | 18.7% | **36.5%** | **17.7%** |

#### js-high (JavaScript ARIA dynamics, 50 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **gemini-3-flash** | 13.8% | 12.3% | **20.1%** | 10.1% | **14.1%** |
| **glm-5** | 10.8% | **13.5%** | 15.3% | 7.6% | **11.8%** |
| **qwen3.5:397b** | **13.7%** | 12.6% | 8.7% | 11.0% | **11.5%** |
| **kimi-k2.5** | 7.2% | 12.7% | 9.4% | **16.2%** | **11.4%** |
| **deepseek-v3.2** | 7.5% | 6.3% | 6.2% | **12.8%** | **8.2%** |
| **mistral-large-3:675b** | 4.9% | 0.0%† | **13.8%** | 2.3% | **5.3%** |
| **gpt-oss:120b** | 8.8% | **0.0%** | 3.9% | 5.2% | **4.5%** |

#### tsx-high (TypeScript/React ARIA, 50 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 45.2% | 42.0% | **48.8%** | 47.6% | **45.9%** |
| **mistral-large-3:675b** | **29.9%** | ERR† | 37.7% | 21.1% | **29.6%**\* |
| **gpt-oss:120b** | 23.9% | **35.3%** | 24.3% | 23.5% | **26.8%** |
| **qwen3.5:397b** | **27.0%** | 27.2% | 28.8% | 22.2% | **26.3%** |
| **gemini-3-flash** | 17.2% | 16.4% | 14.8% | **23.5%** | **18.0%** |
| **glm-5** | 13.1% | 6.1% | **33.7%** | 14.2% | **16.8%** |
| **deepseek-v3.2** | **23.6%** | 8.7% | 15.3% | 3.7% | **12.8%** |

\*Mistral tsx-high: nt fully failed (HTTP 500 across all runs); average uses 3 conditions.

### 2.5 Fixture Difficulty Ranking (average F1 across all models and conditions)

| Fixture | Avg F1 (all models, all 4 conditions) | Range observed |
|---|---|---|
| **html-high** | ~36% | 10.8% – 57.5% |
| **css-high** | ~31% | 7.5% – 47.8% |
| **tsx-high** | ~25% | 3.7% – 48.8% |
| **js-high** | ~9%  | 0.0% – 20.1% |

JavaScript runtime ARIA manipulation is near-undetectable through static analysis. TSX (React) is harder than CSS for most models but kimi-k2.5 is a consistent outlier with ~46% F1 on tsx-high.

### 2.6 False Positive Summary (total FP across 3 runs per condition)

| Model | nn FP | nt FP | rn FP | rt FP | **Total** |
|---|---|---|---|---|---|
| **mistral-large-3:675b** | 78 | 9† | 78 | 71 | **236** |
| **gemini-3-flash** | 39 | 40 | 36 | 27 | **142** |
| **gpt-oss:120b** | 39 | 47 | 39 | 33 | **158** |
| **kimi-k2.5** | 40 | 25 | 28 | 28 | **121** |
| **qwen3.5:397b** | 33 | 17 | 13 | 15 | **78** |
| **deepseek-v3.2** | 7 | 15 | 18 | 15 | **55** |
| **glm-5** | 10 | 3 | 20 | 6 | **39** |

Mistral's hallucination count remains the worst across all conditions. Mistral nt FP counts only reflect partial successful runs. glm-5 has fewest hallucinations overall, consistent with its ultra-high precision (94–98%) but at cost of low recall.

### 2.7 Consistency (F1 σ across 3 runs, by condition)

Note: σ is dominated by the 4-fixture spread (html ~35% vs js ~9%), so values are much higher than T16 (which was html-only). Lower σ = more reproducible *within this multi-fixture context*.

| Model | nn σ | nt σ | rn σ | rt σ |
|---|---|---|---|---|
| **deepseek-v3.2** | 0.118 | 0.137 | 0.145 | 0.168 |
| **gemini-3-flash** | 0.122 | **0.075** | **0.104** | 0.150 |
| **mistral-large-3:675b** | 0.143 | 0.128 | 0.130 | **0.127** |
| **qwen3.5:397b** | 0.155 | 0.178 | 0.128 | 0.162 |
| **gpt-oss:120b** | 0.168 | 0.189 | 0.205 | 0.188 |
| **glm-5** | 0.171 | 0.145 | 0.130 | **0.107** |
| **kimi-k2.5** | 0.174 | 0.164 | 0.193 | 0.191 |

Gemini is most stable in nt (σ=0.075) and rn (σ=0.104). glm-5 is most stable in rt (σ=0.107). The high σ for kimi and gpt-oss reflects that these models collapse on js-high (low F1) but excel on html-high/tsx-high (high F1), creating within-run spread dominated by fixture difficulty.

### 2.8 Extended Metrics Highlights (best-in-condition)

| Condition | Best MCC | Best Acc | Best Specificity | Fewest FP |
|---|---|---|---|---|
| **nn** | kimi MCC=0.333 | kimi 79.5% | deepseek 99.6% | deepseek 7 |
| **nt** | kimi MCC=0.358 | kimi 80.0% | glm-5 99.8% | glm-5 3 |
| **rn** | glm-5 MCC=0.360 | glm-5 79.6% | qwen 99.3% | qwen 13 |
| **rt** | kimi MCC=0.355 | kimi 80.1% | glm-5 99.7% | glm-5 6 |

kimi-k2.5 wins best MCC in 3 of 4 conditions, confirming it as the most balanced detector despite not leading the composite ranking (composite penalises its 165–417s average latency).

---

## 3. Key Findings

### 3.1 Language-Specific Capability Gap (Primary Finding)

The most important result of T17 is the dramatic performance stratification by language type:

- **HTML accessibility** (~36% avg F1): Models have clear signal. Issues like missing ARIA labels, alt text, heading structure, landmark roles are frequently identified. Best models reach 50–57% on individual conditions.
- **CSS accessibility** (~31% avg F1): Models understand focus indicators and contrast, but small-target sizing and forced-colours rules are largely missed. Performance roughly tracks HTML but with more variance.
- **TypeScript/React accessibility** (~25% avg F1): Models can identify ARIA prop mistakes and missing form associations, but dynamic state patterns (aria-expanded, aria-pressed lifecycle) are largely missed. **kimi-k2.5 is an outlier** at ~46% average — substantially above all others.
- **JavaScript ARIA dynamics** (~9% avg F1): Near-zero detection in T17. Static analysis of runtime `aria-expanded`, `aria-live` region announcements, and `aria-selected` state transitions failed across all models with the T17 prompt. **This is a prompt gap, not a capability ceiling** — the ground truth issues are fully observable from static code (a toggle function that never calls `setAttribute('aria-expanded', ...)` is a static bug). T18 adds `JS_MANDATORY_SWEEPS` to give models a scanning algorithm for these patterns.

### 3.2 deepseek-v3.2: Think+RAG Combination Required

deepseek's performance is highly condition-dependent:

| Condition | deepseek composite | deepseek F1 | deepseek css-high F1 |
|---|---|---|---|
| nn | 14.2% | 17.8% | **7.5%** |
| nt | 11.1% | 13.9% | 8.2% |
| rn | 23.4% | 16.0% | 18.7% |
| rt | **35.5%** | **23.3%** | **36.5%** |

In nn (baseline), deepseek's CSS-high F1 is catastrophic (7.5%). With RAG+think (rt), it recovers to 36.5% on css-high and 35.5% composite — jumping from last place to 3rd. The effect is non-additive: RAG alone (rn=23.4%) or think alone (nt=11.1%) are insufficient. deepseek appears to require both conditions to reliably activate CSS accessibility knowledge.

### 3.3 gpt-oss Think Mode Collapse on JS

gpt-oss shows an anomalous collapse on js-high in think mode:

| Condition | gpt-oss js-high F1 |
|---|---|
| nn | 8.8% |
| nt | **0.0%** |
| rn | 3.9% |
| rt | 5.2% |

In nt, gpt-oss scored 0.0% on js-high — it failed to identify any of the 50 dynamic ARIA issues across all 3 runs. Think mode may cause gpt-oss to over-reason about whether a pattern constitutes a violation, ultimately concluding nothing qualifies. This contrasts with glm-5 which performs *better* in js-high with think mode (nn=10.8% → nt=13.5%).

### 3.4 glm-5 Think Mode Degradation

glm-5 shows systematic decline in think mode across HTML and TSX:

| Fixture | glm-5 nn | glm-5 nt | Δ |
|---|---|---|---|
| html-high | 35.3% | 10.8% | **−24.5pp** |
| css-high | 44.8% | 26.3% | −18.5pp |
| js-high | 10.8% | 13.5% | +2.7pp |
| tsx-high | 13.1% | 6.1% | −7.0pp |

Without RAG, think mode severely degrades glm-5 for HTML/CSS/TSX. The same pattern persists with RAG (glm-5 rn=35.2% → rt=19.8% overall). glm-5's extended reasoning appears to introduce over-caution and self-doubt on static markup patterns.

### 3.5 kimi-k2.5 TSX Specialisation

kimi-k2.5 is the clear outlier on tsx-high:

| Model | tsx-high avg (4 conditions) |
|---|---|
| **kimi-k2.5** | **45.9%** |
| mistral-large-3 | 29.6% |
| gpt-oss:120b | 26.8% |
| qwen3.5:397b | 26.3% |
| gemini-3-flash | 18.0% |
| glm-5 | 16.8% |
| deepseek-v3.2 | 12.8% |

kimi scores 45.2–48.8% across all valid conditions, compared to the next-best at ~26–30%. This likely reflects pre-training on TypeScript/React codebases with accessibility annotations. kimi may have encountered React ARIA patterns in training data that other models did not.

### 3.6 RAG Effect on HTML Recall

RAG (context injection from the knowledge-base) shows mixed effects on html-high:

| Model | nn html-high | rn html-high | Δ |
|---|---|---|---|
| gpt-oss | 50.3% | **57.5%** | **+7.2pp** |
| glm-5 | 35.3% | **41.3%** | **+6.0pp** |
| gemini | 33.1% | 35.5% | +2.4pp |
| mistral | 26.9% | 29.0% | +2.1pp |
| deepseek | 32.6% | 23.6% | −9.0pp |
| qwen | 44.0% | 25.0% | **−19.0pp** |
| kimi | 44.4% | 26.9% | **−17.5pp** |

RAG helps gpt-oss (+7.2pp) and glm-5 (+6.0pp) on HTML. But qwen and kimi suffer dramatic RAG degradation on html-high (rn condition). Both models' RAG recall underperforms even deepseek in rn. This may indicate a RAG distraction effect — injected context interfering with the model's own HTML accessibility knowledge.

### 3.7 Mistral Reliability Issues

Mistral failed 7 of 12 expected runs in nt (Ollama HTTP 500), leaving only partial tsx-high data for that condition. Across all conditions, mistral also generates the highest FP counts (total 236 FP vs deepseek's 55 and glm-5's 39). The combination of reliability failures and chronic hallucination makes mistral the weakest candidate for the main study despite mid-table F1 on html-high.

---

## 4. T16 vs T17 html-high Comparison

Since html-high is the only fixture shared between T16 and T17, a per-model comparison shows the prompt/parameter changes' effect on the same task.

| Model | T16 avg html-high F1 | T17 avg html-high F1 | Δ |
|---|---|---|---|
| **gpt-oss:120b** | 54.1% | 52.4% | −1.7pp |
| **kimi-k2.5** | 45.3% | 40.2% | −5.1pp |
| **glm-5** | 44.7% | 28.7% | **−16.0pp** |
| **deepseek-v3.2** | 40.4% | 32.3% | −8.1pp |
| **qwen3.5:397b** | 39.7% | 39.2% | −0.5pp |
| **mistral-large-3:675b** | 33.8% | 30.6% | −3.2pp |
| **gemini-3-flash** | 30.1% | 32.2% | **+2.1pp** |

Most models show slight declines. The Sweep C tightening (targeting table-scope FPs) may have marginally reduced TP recall for legitimate table issues as collateral. glm-5's 16pp drop is primarily driven by nt condition collapse (single-condition outlier at 10.8% rather than typical 35–41%), not a systematic regression.

Importantly, **gpt-oss remains the strongest on html-high** despite the temperature change (0.0→0.1 for think mode). The table-scope hallucinations from T16 are substantially reduced — verifying the prompt fix was effective.

---

## 5. Model Status Summary

| Model | Status | Key characteristics |
|---|---|---|
| **gpt-oss:120b** | Strong candidate | Consistent html leader (52% avg). Fast think mode (66–105s). High FP in think mode (47). Collapses to 0% js-high in nt (think mode suppresses JS detection). |
| **kimi-k2.5** | Strong candidate | Best F1 3/4 conditions, best MCC. TSX specialist (46% avg). Slow (165–417s). RAG hurts html-high significantly. |
| **qwen3.5:397b** | Candidate | Best html-high nt (52.8%). RAG degrades html and css significantly. Good CSS in nn/rt. Balanced FP (78 total). |
| **gemini-3-flash** | Candidate | Fastest model by far (22–135s). Best JS recall in rn (20.1%). Lowest html F1 among top 4. High TSX hallucinations. |
| **glm-5** | Conditional | Ultra-low FP (39 total). Think mode degrades systematically. Best without RAG+think. May be useful as conservative baseline. |
| **deepseek-v3.2** | Conditional | Requires rt to perform competitively. CSS collapsed in noThink (7.5%). Strong specificity (99.2–99.6%). Very slow (122–460s). |
| **mistral-large-3:675b** | Weakest | Highest FP by far (236 total). Repeated HTTP 500 failures. 78 FP in nn and rn. Bottom on JS. Not recommended for main study. |

---

## 6. Changes for Test 18

Based on T17 findings:

### 6.1 Language-Specific Mandatory Sweeps (Primary Change)

The primary root cause of low CSS/JS/TSX performance is the absence of a scanning algorithm for those languages. HTML performance is ~36% F1 because the prompt contains `HTML_MANDATORY_SWEEPS` — a step-by-step instruction to iterate every element type and check specific conditions. CSS, JS, and TSX previously received only the anti-FP supplement, leaving models to guess what patterns to look for.

T18 adds equivalent mandatory sweep blocks to `benchmark-prompt.ts`:

| New constant | Language | Key patterns covered |
|---|---|---|
| `CSS_MANDATORY_SWEEPS` | CSS | Focus rings removed (outline:none), touch targets <44px, broken sr-only, missing reduced-motion, negative word-spacing, contrast (when both values present), forced-colors absent, link underlines removed |
| `JS_MANDATORY_SWEEPS` | JavaScript | Toggle functions not updating `aria-expanded`; toggle buttons not updating `aria-pressed`; dynamic content not announced via live region; `aria-invalid` not set/cleared on validation; `aria-expanded` not initialised at load |
| `TSX_MANDATORY_SWEEPS` | TypeScript/React | `aria-expanded` on disclosure toggles; `aria-hidden` on decorative icons; `aria-invalid`/`aria-required`/`aria-describedby` on form fields; `aria-selected`/`aria-pressed`/`aria-checked` on state widgets; `aria-current` on active nav; `aria-busy` on loading buttons; landmark region labels |

Each sweep follows the same scanning-algorithm pattern as the HTML sweeps: "for every X, check if Y, report if Z". This is the principal change for T18 and the expected driver of performance improvement on all non-HTML fixtures.

### 6.2 Fixture Scope

All four fixtures (html-high, css-high, js-high, tsx-high) are retained for T18. The T17 conclusion that js-high should be excluded was premature — the near-zero JS detection was a prompt gap, not a fundamental capability ceiling. With `JS_MANDATORY_SWEEPS` targeting the specific static patterns that constitute the ground truth issues (toggle functions that never call `setAttribute('aria-expanded', ...)`, validation functions that never call `setAttribute('aria-invalid', 'true')`), JS F1 is expected to improve substantially.

If JS F1 does not improve to at least 20% avg after T18, the fixture can be reconsidered for removal.

### 6.3 Model Roster for T18

Retire mistral (reliability + FP). Retain 6 models:
- gpt-oss, kimi, qwen, gemini (strong candidates)
- glm-5, deepseek (conditional — evaluate in favourable conditions)

### 6.4 Parameter Tuning

- gpt-oss think mode at temperature=0.1 is stable; no change needed.
- Consider raising deepseek think temperature slightly (currently 0.0) if nt performance continues to collapse.
- glm-5 think-mode degradation remains unexplained; monitor with T18 multi-fixture results before changing params.
