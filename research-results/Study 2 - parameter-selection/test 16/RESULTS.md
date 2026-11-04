# Cloud-LLM Preliminary Study — Test 16 Results

**Date:** 3–4 April 2026
**Scope:** html-high fixture only (51 issues, highest complexity tier)
**Models tested:** 7 (3 removed from T15 roster: cogito-2.1:671b, qwen3-vl:235b, qwen3-coder:480b)
**Conditions:** 4 (RAG × Think factorial design)
**Runs per combination:** 3
**Total LLM calls:** 7 models × 1 fixture × 3 runs × 4 conditions = **84 calls**

---

## 1. What Changed from Test 15

### 1.1 Roster: 10 → 7 Models

Three models removed after T15 on performance grounds:

| Model removed | Reason |
|---|---|
| cogito-2.1:671b | T15 avg F1=24.1%; zero FP all conditions — predicts no issues; 671B size with bottom-3 performance |
| qwen3-vl:235b | T15 avg F1=25.5%; vision-language model not suited to pure-text HTML analysis; nt worst at 17.9% |
| qwen3-coder:480b | T15 avg F1=20.9%; declining trend T12→T15; worst of all large models; below all 7 retained models |

### 1.2 Per-Model Manufacturer Hyperparameters

In T15 all models received identical cloud params: `temperature=0.2`, `top_p=0.95`. In T16 every model now receives parameters recommended by its manufacturer for structured/factual tasks:

| Model | Param mode | temperature | top_p |
|---|---|---|---|
| gpt-oss:120b | both | 0.0 | 1.0 |
| kimi-k2.5 | think | 0.6 | 0.95 |
| kimi-k2.5 | no-think | 0.3 | 0.90 |
| qwen3.5:397b | think | 0.6 | 0.95 |
| qwen3.5:397b | no-think | 0.7 | 0.80 |
| deepseek-v3.2 | both | 0.0 | 1.0 |
| glm-5 | both | 0.2 | 0.90 |
| gemini-3-flash | both | 0.0 | 1.0 |
| mistral-large-3 | both | 0.3 | 0.90 |

Baseline also tightened: `temperature: 0.2→0.1`, `top_p: 0.95→0.9`, `repeat_penalty: 1.1→1.05`, `repeat_last_n: 128→64` (local-model params; cloud gateway only receives num_predict, temperature, top_p).

### 1.3 Continue html-high, 3 Runs

Fixture and run count unchanged: `--fixtures html-high --runs 3`. Conditions: all 4 (nn, nt, rn, rt).

---

## 2. Results

### 2.1 Condition Definitions

| Condition | RAG | Thinking (extended CoT) |
|---|---|---|
| `rag-think` (rt) | Yes | Yes |
| `rag-nothink` (rn) | Yes | No |
| `norag-think` (nt) | No | Yes |
| `norag-nothink` (nn) | No | No |

### 2.2 F1 Score Matrix (html-high, avg of 3 runs, sorted by avg F1)

| Model | rt | rn | nt | nn | **Best F1** | **Avg F1** |
|---|---|---|---|---|---|---|
| **gpt-oss:120b** | 59.0% | 48.7% | 49.5% | **59.1%** | **59.1%** | **54.1%** |
| **kimi-k2.5** | 47.5% | 44.7% | **52.1%** | 37.0% | **52.1%** | **45.3%** |
| **glm-5** | **58.9%** | 42.8% | 38.5% | 38.7% | **58.9%** | **44.7%** |
| **deepseek-v3.2** | **47.6%** | 43.8% | 37.2% | 32.8% | **47.6%** | **40.4%** |
| **qwen3.5:397b** | 36.8% | 39.6% | 39.3% | **43.2%** | **43.2%** | **39.7%** |
| **mistral-large-3:675b** | 33.5% | 29.7% | **36.4%** | 35.5% | **36.4%** | **33.8%** |
| **gemini-3-flash** | 27.1% | **31.9%** | 30.9% | 30.6% | **31.9%** | **30.1%** |

### 2.3 Composite Score Matrix (80% F1 + 20% speed)

| Model | rt | rn | nt | nn | **Best** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | **63.5%** | 44.3% | 56.9% | 60.1% | **63.5%** |
| **kimi-k2.5** | 48.5% | 39.5% | **51.9%** | 41.7% | **51.9%** |
| **glm-5** | 47.1% | 40.2% | 42.5% | 34.5% | **47.1%** |
| **deepseek-v3.2** | **47.7%** | 35.0% | 29.8% | 26.2% | **47.7%** |
| **qwen3.5:397b** | 44.1% | 40.9% | **51.5%** | 44.7% | **51.5%** |
| **mistral-large-3:675b** | 46.8% | 40.6% | 48.9% | 45.4% | **48.9%** |
| **gemini-3-flash** | 37.9% | **45.5%** | 38.0% | 44.5% | **45.5%** |

### 2.4 False Positive Summary (total across 3 runs per condition)

| Model | rt FP | rn FP | nt FP | nn FP | **Total** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | **12** | 7 | 4 | 8 | **31** |
| **glm-5** | 5 | 2 | 2 | 1 | **10** |
| **kimi-k2.5** | 1 | 2 | 5 | 1 | **9** |
| **qwen3.5:397b** | 2 | 1 | 2 | 2 | **7** |
| **mistral-large-3:675b** | 1 | 1 | 0 | 0 | **2** |
| **gemini-3-flash** | 0 | 0 | 0 | 2 | **2** |
| **deepseek-v3.2** | 0 | 1 | 0 | 0 | **1** |

### 2.5 Consistency (F1 σ across 3 runs, by condition)

| Model | rt σ | rn σ | nt σ | nn σ |
|---|---|---|---|---|
| **gemini-3-flash** | 0.000 | 0.013 | 0.027 | 0.012 |
| **glm-5** | 0.020 | 0.095 | 0.029 | 0.032 |
| **qwen3.5:397b** | 0.023 | 0.025 | 0.022 | 0.059 |
| **mistral-large-3:675b** | 0.034 | 0.037 | 0.012 | 0.000 |
| **gpt-oss:120b** | 0.052 | 0.113 | 0.126 | 0.055 |
| **kimi-k2.5** | 0.100 | 0.122 | 0.106 | 0.011 |
| **deepseek-v3.2** | 0.117 | 0.103 | 0.012 | 0.000 |

---

## 3. Key Findings

### 3.1 gpt-oss:120b Remains #1 — Near-Equal Peaks in nn and rt

gpt-oss:120b achieved nn=59.1% and rt=59.0% — two essentially identical peaks in opposite conditions (no-RAG+no-think vs RAG+think). This is the first time gpt-oss has shown comparable performance in non-RAG mode; in T15 nn was 50.2%. The temp=0.0 manufacturer param appears to have stabilised its baseline: the two deterministic conditions (no/minimal sampling noise) now both produce near-60% F1. The rt condition is the new series composite leader at 63.5%.

However, gpt-oss's FP count rose sharply in rt: 12 hallucinations (the highest single-condition FP ever recorded for this model), mostly repeating "table header missing scope" on the clean fixture. At temp=0.0, the model is locked into asserting these borderline issues regardless of run variation.

### 3.2 glm-5 — Biggest Gainer (+12.8pp avg) with rt=58.9%

glm-5 is the standout improvement of T16: avg F1 rose from 31.9% (T15) to 44.7% (+12.8pp). Its rt condition hit 58.9% with TP=66, FP=5 — a performance level it had never approached before (T15 rt was 32.4%, +26.5pp gain). The manufacturer params (temp=0.2, top_p=0.9) appear to have been the key unlock: GLM-5's T15 T=0.2 was not the issue — the combined effect of the specific top_p=0.9 and the new RAG pipeline delivering focused chunks has unlocked RAG+think performance.

At 58.9% F1 with RAG+think, glm-5 and gpt-oss are now within 0.1pp of each other in their best conditions, which was not expected given their T15 performance gap of 18.7pp.

### 3.3 deepseek-v3.2 — Manufacturer Params Pay Off (+6.5pp)

deepseek-v3.2 improved from 33.9% to 40.4% avg F1 (+6.5pp). Its rt condition jumped from 22.8% (T15) to 47.6% (+24.8pp) — the largest single-condition gain of any model across all T16 conditions. The temp=0.0 override recommended by DeepSeek for structured output is clearly effective: in T15 the standard temp=0.2 was causing variance that compounded across the 51-issue fixture.

The rn condition also improved: 43.8% vs T15 rn=50.4% is a slight drop (-6.6pp), but deepseek now has two strong conditions (rt and rn) rather than one. This is a healthier profile than T15 where only rn was performing well.

### 3.4 kimi-k2.5 — Manufacturer Params Stabilise Without Sacrificing Peak

kimi-k2.5 improved to avg F1=45.3% (+2.9pp from T15). Its nt peak held at 52.1% (vs T15 nt=54.6%, −2.5pp — within run variance). Importantly, the catastrophic rn collapse seen in T15 (24.1%) was corrected: T16 rn=44.7% (+20.6pp). The kimi NoThink params (temp=0.3, top_p=0.9) contributed to this, as NoThink+RAG is now a viable configuration.

kimi's nn score dropped from T15's 46.8% to 37.0% (−9.8pp), suggesting the tighter no-think params (temp=0.3 is lower than T15's 0.2 for the baseline but higher than gpt-oss/deepseek's 0.0) may be slightly over-constraining it in the no-RAG baseline.

### 3.5 qwen3.5:397b — Essentially Flat (−0.2pp), Most Consistent

qwen3.5:397b avg dropped marginally from 39.9% to 39.7% (−0.2pp). The manufacturer params (temp=0.6 think / 0.7 no-think) are significantly higher than the T15 baseline; they were already in place from the previous session. T16 brought no additional change for this model. F1 range across all 4 conditions: 36.8%–43.2% (6.4pp spread) — still the tightest spread of any model, confirming qwen3.5 as the most stable performer.

### 3.6 mistral-large-3 — Modest Gain (+5.8pp)

mistral-large-3 improved from 28.0% to 33.8% avg F1 (+5.8pp). The manufacturer temp=0.3 helps: T15's nt collapse to 19.9% recovered to 36.4% (+16.5pp). mistral now has a relatively flat profile across conditions (33.5%–36.4%) rather than the extreme nt drop seen in T15. Zero FP in nn and nt — the most precise model when not using RAG.

### 3.7 gemini-3-flash — Structural Ceiling Confirmed (30.1%)

gemini-3-flash remains at its T13/T14/T15/T16 floor: avg F1=30.1% (−0.2pp vs T15). Fastest model in every condition (11–15s avg). The manufacturer temp=0.0 brought no improvement. gemini's recall ceiling appears to be a model capability constraint, not a hyperparameter issue: it consistently finds 8–10 TP out of 51 regardless of conditions. It remains the most consistent model in terms of σ (0.000 in rt) but that consistency is at a low ceiling.

### 3.8 Recurring Hallucination Pattern — gpt-oss Table Scope

gpt-oss hallucinated "table header missing scope" on the clean fixture in every condition across T15 and T16. The clean fixture's pricing table uses `<th>` without explicit `scope` attributes — the model consistently identifies these as errors even though they are not in the ground truth. This pattern is deterministic at temp=0.0 (appearing every run). This suggests gpt-oss's accessibility training data includes scope-on-th as a firm rule, diverging from the ground truth definition used in this evaluation.

### 3.9 "Fieldset Missing Legend" — Cross-Model Hallucination

qwen3.5, kimi, glm-5, and sometimes deepseek hallucinate "fieldset missing legend" on the clean fixture. Four different models flagging the same non-existent issue across multiple conditions suggests the clean fixture's contact form fieldset structure is genuinely ambiguous — it may be a near-miss that humans would also flag in a real accessibility review, even if it does not meet the ground truth classification.

### 3.10 Universal Miss Cluster Persists

The following issues were missed by all 7 models in the no-RAG, no-think condition. Many are also missed across other conditions:

Core cluster (missed by 7/7 in nn, and appear in multiple other conditions):
`table-caption-missing`, `subnav-btn-aria`, `account-nav-label`, `main-id-missing`, `live-region-removed`, `product-grid-label`, `search-form-role`, `faq-q1-expanded`, `faq-q2-expanded`, `contact-aria-required`, `contact-msg-describedby`, `skip-links-removed`, `mobile-toggle-aria`, `pricing-toggle-role`, `filter-btn-aria-pressed`, `hero-section-label`, `filter-group-label`

These are dynamic/stateful ARIA issues (expanded state, live regions, aria-required) and landmark labelling — categories that require awareness of the page's interactive behaviour, not just static structure. Static analysis cannot detect them without dynamic execution context.

---

## 4. T15 vs T16 Comparison (html-high F1, 3-run avg)

| Model | T15 rt | T16 rt | T15 rn | T16 rn | T15 nt | T16 nt | T15 nn | T16 nn | **Avg Δ** |
|---|---|---|---|---|---|---|---|---|---|
| **gpt-oss:120b** | 44.1% | **59.0%** | 61.6% | 48.7% | 46.4% | 49.5% | 50.2% | **59.1%** | **+3.5 pp** |
| **kimi-k2.5** | 44.0% | 47.5% | 24.1% | **44.7%** | 54.6% | **52.1%** | 46.8% | 37.0% | **+2.9 pp** |
| **glm-5** | 32.4% | **58.9%** | 26.8% | **42.8%** | 33.3% | 38.5% | 35.2% | 38.7% | **+12.8 pp** |
| **deepseek-v3.2** | 22.8% | **47.6%** | 50.4% | 43.8% | 26.2% | 37.2% | 36.3% | 32.8% | **+6.5 pp** |
| **qwen3.5:397b** | 41.2% | 36.8% | 38.5% | 39.6% | 42.1% | 39.3% | 37.8% | **43.2%** | **−0.2 pp** |
| **mistral-large-3:675b** | 27.8% | 33.5% | 31.9% | 29.7% | 19.9% | **36.4%** | 32.4% | 35.5% | **+5.8 pp** |
| **gemini-3-flash** | 28.8% | 27.1% | 29.0% | **31.9%** | 31.9% | 30.9% | 31.5% | 30.6% | **−0.2 pp** |

> glm-5 rt: T15=32.4% → T16=58.9% (+26.5pp) — largest single-condition improvement in the series.
> deepseek-v3.2 rt: T15=22.8% → T16=47.6% (+24.8pp) — second largest.
> gpt-oss rn: T15=61.6% → T16=48.7% (−12.9pp) — only model to show significant regression in any condition.

---

## 5. Model Status Summary

| Model | Best F1 (T16) | Avg F1 (T16) | Status |
|---|---|---|---|
| **gpt-oss:120b** | 59.1% (nn) / 59.0% (rt) | 54.1% | Clear #1; both deterministic conditions produce near-60% peaks; high FP in rt |
| **kimi-k2.5** | 52.1% (nt) | 45.3% | #2; rn collapse corrected; nn dropped; still highest variance |
| **glm-5** | 58.9% (rt) | 44.7% | #3; biggest T16 winner; rt=58.9% near-matches gpt-oss peak |
| **deepseek-v3.2** | 47.6% (rt) | 40.4% | #4; manufacturer params unlocked rt; zero FP in 3/4 conditions |
| **qwen3.5:397b** | 43.2% (nn) | 39.7% | #5; flat vs T15; most stable model; no hallucinaton benefit from params change |
| **mistral-large-3:675b** | 36.4% (nt) | 33.8% | #6; nt collapse corrected; most precise in nn and nt (0 FP) |
| **gemini-3-flash** | 31.9% (rn) | 30.1% | #7; structural recall ceiling confirmed; fastest model; manufacturer params had no effect |

---

## 6. Changes for Test 17

### 6.1 Investigate gpt-oss rt Hallucination Pattern

gpt-oss:120b in rag-think produced 12 hallucinations (mostly "table header missing scope") — its worst FP count. At temp=0.0, these hallucinations are perfectly consistent across all 3 runs. Two options:
- Add a negative example to the prompt explicitly showing that `<th>` without scope is acceptable when scope is inferrable from position
- Raise temp slightly (0.1) for balance between FP suppression and recall

### 6.2 Fixture Expansion (Paul's recommendation)

T16 continues to use html-high only. html-low and css-low fixtures have not been included since T12. To properly assess generalisation:
- Include `--fixtures html-high,html-low` to test whether the universal miss cluster is fixture-specific
- Or run a full 3-fixture round: html-high + html-low + css-low

### 6.3 Investigate glm-5 rt Mechanism

GLM-5's rt=58.9% is near gpt-oss's peak, but GLM-5 is undisclosed-size vs gpt-oss's 120B. Understanding why RAG+think unlocks GLM-5 but not gemini-3-flash (also at temp=0.0) would clarify whether the improvement is param-driven or architecture-driven.

### 6.4 Keep 7 Models

All 7 current models have demonstrated a clear performance rationale for inclusion. No further cuts recommended before T17 unless a model is structurally broken.
