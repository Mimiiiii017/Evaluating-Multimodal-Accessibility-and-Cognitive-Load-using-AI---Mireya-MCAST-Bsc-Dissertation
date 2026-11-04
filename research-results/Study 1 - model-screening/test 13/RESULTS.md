# Cloud-LLM Preliminary Study — Test 13 Results

**Date:** 1–2 April 2026  
**Scope:** HTML fixtures only (html-clean, html-low, html-medium, html-high) — 4 complexity tiers  
**Models tested:** 17 (roster unchanged from T12)  
**Conditions:** 4 (RAG × Think factorial design)  
**Total LLM calls:** 272 (17 models × 4 fixtures × 4 conditions)

---

## 1. What Changed from Test 12

### 1.1 Sweep G Extended to Cover `<section>` and `<aside>`

The only change from T12. `benchmark-prompt.ts` and `prompt.ts` both updated.

**Before (T12):** Sweep G only checked `<nav>` elements with the multi-instance qualifier ("skip if only one exists").

**After (T13):** Sweep G checks `<nav>`, `<section>`, and `<aside>` independently. For each type: if MORE than one exists → every instance without `aria-label` or `aria-labelledby` → report MEDIUM. If only ONE of that type exists → skip. `<main>`, `<header>`, `<footer>` explicitly excluded.

**Motivation:** `logo-bar-aria-label` is a `<section>` element. It had 100% miss rate in T11 and T12 because Sweep G didn't scan `<section>` at all. The T12/T11 ministral-3:14b FP=80 regression was caused by Sweep G being extended to include `<section>` in T12 *without* the multi-instance qualifier — fixed here.

---

## 2. Results — All 4 Conditions

### 2.1 Condition Definitions

| Condition | RAG | Thinking (extended CoT) |
|---|---|---|
| `rag-think` (rt) | Yes | Yes |
| `rag-nothink` (rn) | Yes | No |
| `norag-nothink` (nn) | No | No |
| `norag-think` (nt) | No | Yes |

### 2.2 F1 Score Matrix (sorted by average across all 4 conditions)

| Model | rt | rn | nn | nt | **Best F1** | **Avg F1** |
|---|---|---|---|---|---|---|
| **gpt-oss:120b** | **74.8%** | 51.3% | 70.1% | 70.6% | **74.8%** | **66.7%** |
| **glm-5** | 30.7% | **70.7%** | 67.8% | 58.7% | **70.7%** | **57.0%** |
| **qwen3.5:397b** | **72.4%** | 40.4% | 48.8% | 68.6% | **72.4%** | **57.6%** |
| **kimi-k2.5** | 47.6% | 46.8% | 46.6% | 48.9% | **48.9%** | **47.5%** |
| **deepseek-v3.2** | 42.3% | 26.9% | 37.7% | **61.8%** | **61.8%** | **42.2%** |
| **ministral-3:14b** | 34.7% | **36.1%** | 25.9% | 20.9% | **36.1%** | **29.4%** |
| **qwen3-vl:235b** | 53.7% | 55.0% | 50.3% | 51.0% | **55.0%** | **52.5%** |
| **gemini-3-flash** | 16.7% | 34.1% | 30.0% | 37.4% | **37.4%** | **29.6%** |
| **mistral-large-3:675b** | 28.3% | 26.1% | 32.8% | 26.3% | **32.8%** | **28.4%** |
| **cogito-2.1:671b** | 27.3% | 28.9% | 32.0% | 26.7% | **32.0%** | **28.7%** |
| **qwen3-coder:480b** | 19.7% | 22.5% | 18.0% | 19.4% | **22.5%** | **19.9%** |
| **devstral-small-2:24b** | 15.0% | 14.6% | 21.7% | 26.6% | **26.6%** | **19.5%** |
| **gemma3:27b** | 17.1% | 21.0% | 23.0% | 25.9% | **25.9%** | **21.8%** |
| **ministral-3:3b** | 14.8% | 27.9% | 29.0% | 25.4% | **29.0%** | **24.3%** |
| **nemotron-3-super** | 16.8% | 17.2% | 28.9% | 7.6% | **28.9%** | **17.6%** |
| **gpt-oss:20b** | 36.5% | 25.0% | 25.0% | 25.0% | **36.5%** | **27.9%** |
| **qwen3-coder-next** | 17.6% | 35.7% | 7.6% | 14.2% | **35.7%** | **18.8%** |

### 2.3 Composite Score Matrix (80% F1 + 20% speed, sorted by best composite)

| Model | rt | rn | nn | nt | **Best** | **Avg** |
|---|---|---|---|---|---|---|
| **gpt-oss:120b** | **74.7%** | 56.6% | 70.8% | 67.3% | **74.7%** | **67.4%** |
| **glm-5** | 33.8% | **65.7%** | 68.1% | 47.0% | **68.1%** | **53.7%** |
| **qwen3.5:397b** | 58.0% | 42.5% | 50.9% | **63.2%** | **63.2%** | **53.7%** |
| **qwen3-vl:235b** | 45.6% | 44.0% | 42.9% | **51.8%** | **51.8%** | **46.1%** |
| **kimi-k2.5** | 38.1% | **51.2%** | 42.4% | 51.0% | **51.2%** | **45.7%** |
| **deepseek-v3.2** | 51.5% | 35.5% | **47.5%** | 56.2% | **56.2%** | **47.7%** |
| **gemini-3-flash** | 28.0% | **47.3%** | 44.0% | 42.8% | **47.3%** | **40.5%** |
| **ministral-3:14b** | 38.5% | **43.0%** | 32.5% | 23.3% | **43.0%** | **34.3%** |
| **cogito-2.1:671b** | **41.8%** | 40.9% | 35.5% | 40.8% | **41.8%** | **39.8%** |
| **mistral-large-3:675b** | **42.0%** | 39.4% | 43.2% | 41.1% | **43.2%** | **41.4%** |
| **gemma3:27b** | 30.6% | 32.3% | 35.4% | **37.7%** | **37.7%** | **34.0%** |
| **devstral-small-2:24b** | 25.4% | 30.5% | 27.4% | **30.2%** | **30.5%** | **28.4%** |
| **ministral-3:3b** | 28.9% | 36.2% | **33.7%** | 33.4% | **36.2%** | **33.1%** |
| **qwen3-coder:480b** | 31.8% | 31.2% | **26.0%** | 20.1% | **31.8%** | **27.3%** |
| **gpt-oss:20b** | **44.1%** | 23.4% | 22.2% | 31.6% | **44.1%** | **30.3%** |
| **nemotron-3-super** | 23.6% | 28.3% | **23.6%** | 11.8% | **28.3%** | **21.8%** |
| **qwen3-coder-next** | 15.4% | **42.2%** | 6.1% | 12.5% | **42.2%** | **19.1%** |

### 2.4 False Positive Summary

| Model | nn FP | nt FP | rt FP | rn FP | **Total** |
|---|---|---|---|---|---|
| **ministral-3:3b** | 56 | 35 | **115** | 19 | **225** |
| **nemotron-3-super** | 1 | 2 | 1 | **39** | **43** |
| **qwen3-coder-next** | 4 | 31 | 12 | 19 | **66** |
| **mistral-large-3:675b** | 11 | 11 | 12 | 12 | **46** |
| **gemma3:27b** | 13 | 9 | 10 | 8 | **40** |
| **gpt-oss:120b** | 9 | 4 | 11 | 2 | **26** |
| **gemini-3-flash** | 9 | 3 | 3 | 7 | **22** |
| **cogito-2.1:671b** | 4 | 9 | 2 | 3 | **18** |
| **ministral-3:14b** | 3 | 5 | 9 | 3 | **20** |
| **kimi-k2.5** | 2 | 3 | 6 | 4 | **15** |
| **qwen3.5:397b** | 1 | 2 | 3 | 2 | **8** |
| **deepseek-v3.2** | 4 | 0 | 4 | 1 | **9** |
| **glm-5** | 0 | 1 | 3 | 5 | **9** |
| **qwen3-coder:480b** | 5 | 2 | 2 | 2 | **11** |
| **devstral-small-2:24b** | 2 | 3 | 2 | 4 | **11** |
| **gpt-oss:20b** | 0 | 0 | 0 | 0 | **0** |
| **qwen3-vl:235b** | 0 | 0 | 0 | 0 | **0** |

### 2.5 Speed Summary (avg response time seconds)

| Model | nn | nt | rt | rn |
|---|---|---|---|---|
| gemini-3-flash | 12.2s | 140.3s | 138.0s | 10.5s |
| deepseek-v3.2 | 68.3s | 227.2s | 79.2s | 127.3s |
| gemma3:27b | 75.2s | 83.3s | 93.3s | 97.9s |
| mistral-large-3:675b | 77.5s | 40.5s | 45.8s | 39.7s |
| gpt-oss:120b | 124.9s | 169.1s | 134.8s | 95.4s |
| glm-5 | 141.0s | 323.1s | 245.2s | 219.0s |
| qwen3.5:397b | 183.8s | 205.5s | 427.3s | 199.3s |
| kimi-k2.5 | 326.4s | 156.2s | 429.4s | 131.4s |
| nemotron-3-super | 424.7s | 242.1s | 228.8s | 115.4s |

---

## 3. RAG+Think Condition Analysis (rt)

**Winner: gpt-oss:120b** — 74.7% composite / 74.8% F1 (new series high)

gpt-oss:120b in rt is now the single best result in the entire T9–T13 series, surpassing its own T12 nt record of 74.2%. TP=45 vs 47 FN. FP=11 is non-zero but comes from hallucinations on the dense high-complexity fixture.

**qwen3.5:397b rt** — 72.4% F1 / 58.0% composite. Precision 96.3% (virtually no hallucinations), but the 427-second average drags the composite down sharply. It's the most accurate auditor after gpt-oss:120b but very slow with RAG.

**Surprise: kimi-k2.5 rt** — F1=47.6% but TP=45 (tied with gpt-oss:120b), FN=47. The poor F1 vs high TP is because FP=6 and the MCC-weighted calculations weigh accuracy differently. Actually kimi has the most true positives of all models in rt, tied with the winner.

**glm-5 rt** — collapse continues. 30.7% F1, a repeat of T12's issue. glm-5 struggles specifically in think conditions with RAG; rn is its home turf (70.7%).

---

## 4. Key Findings

### 4.1 Sweep G Fix: logo-bar-aria-label Still a Problem

**Result: partial improvement, not solved.**

`logo-bar-aria-label` miss counts per condition in T13:
- nn: 32/34 models-on-fixtures missing it (T12: ~34/34)
- nt: 32/34 missing  
- rt: 31/34 missing
- rn: 31/34 missing

The fix moved the miss rate from ~100% to ~91–94%. Only 2–3 models are now finding it. This suggests that even with the expanded Sweep G, most models are not executing the multi-instance `<section>` count correctly. The rule exists in the prompt but models are not reliably following it.

**Interpretation:** The issue may not be the prompt rule itself but rather model compliance. `logo-bar-aria-label` is in a `<section class="logo-bar">` that shares the page with other `<section>` elements — the multi-instance gate should trigger — but models are not treating it as a landmark or not counting sections. This is a harder problem than a prompt fix can solve for most models.

### 4.2 ministral-3:3b: Catastrophic FP in rt (FP=115)

ministral-3:3b had FP=115 in the rt condition — meaning it hallucinated 115 issues across the 4 fixtures. This is up from FP ~80 in T12 nt and represents continued severe hallucination under RAG+Think conditions. The composite score for rt was 28.9%, the worst non-gpt-oss:20b result.

This model is functionally broken in think conditions. Even in its best condition (nn: 29.0% F1) it doesn't justify its place in the roster.

### 4.3 nemotron-3-super: rn FP Spike (FP=39)

nemotron-3-super had FP=39 in rn (RAG+noThink). In T12 its worst single-condition FP was ~5. This is a previously unseen spike for this model in rn — it had 0–5 FP across conditions in T12. The rn composite of 28.3% reflects this.

Combined with nt F1=7.6% (effectively non-functional in nt), this model now shows catastrophic failure modes in 2 out of 4 conditions.

### 4.4 qwen3-coder-next: Still Inconsistent but Improved in rn

qwen3-coder-next's best single performance this test was rn: composite=42.2%, F1=35.7%. This is an improvement from T12's rn=21.5%. However nn dropped to 7.6% F1 (from T12's 13.4%) and nt is 14.2%. The model shows extreme variance across conditions: best 35.7% vs worst 7.6%. Not reliable.

### 4.5 gpt-oss:20b: First Non-Zero TP in rt (TP=3)

gpt-oss:20b found 3 true positives in rt for the first time across T9–T13 (rn also TP=0 this test though). This is unusual — previous tests universally show TP=0 for this model. The 3 TPs in rt do not change the picture materially (F1=36.5% but that's a deceptive macro-average; the real composite is only 44.1% because speed is poor). The model remains non-functional as an accessibility auditor.

### 4.6 deepseek-v3.2 nt: F1=61.8% (new personal best)

deepseek surged to 61.8% F1 in nt — up from T12's 37.7% nt. This is the model's best single-condition F1 across the entire test series. FP=0 in nt (precision=100%), FN=68. The think mode significantly improves deepseek's recall without introducing hallucinations.

### 4.7 glm-5 rt Still Broken (F1=30.7%)

glm-5 performed poorly in rt and nt again. This is now 2 consecutive tests (T12 and T13) where glm-5 collapses in think+RAG conditions. In rn it reaches 70.7% F1 — suggesting the model is fundamentally impaired by CoT reasoning in its auditing mode. It produces verbose reasoning that loses track of the actual sweep structure.

### 4.8 The Logo-Bar Resistance Pattern

Across T13, the following issues are being missed by 30+ out of 34 fixture-runs (virtually universal):

| Issue ID | Times missed (nn) | Category |
|---|---|---|
| `footer-logo-alt-missing` | 44 | Image alt |
| `html-lang-missing` | 40 | Language attribute |
| `faq-id-wrong-section` | 38 | Anchor/section ID |
| `newsletter-label-missing` | 35 | Form label |
| `table-caption-missing` | 34 | Table structure |
| `learn-more-link` | 33 | Link name |
| `hero-img-alt-missing` | 32 | Image alt |
| `logo-bar-aria-label` | 32 | Landmark label |
| `step1-heading-skip` | 32 | Heading hierarchy |
| `pricing-toggle-role` | 32 | ARIA role |

`html-lang-missing` and `faq-id-wrong-section` were targeted by T12 prompt changes but remain near the top — the sweep instructions are not achieving reliable catch rates for these. `footer-logo-alt-missing` (44 misses) is a persistent blind spot: it's at the bottom of a long fixture and models run out of scanning attention.

---

## 5. T12 vs T13 Comparison

### 5.1 F1 Change per Model per Condition

| Model | rt Δ | rn Δ | nn Δ | nt Δ | **Avg Δ** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | +32.0 pp | −21.4 pp | −0.1 pp | −3.6 pp | **+1.7 pp** |
| **qwen3.5:397b** | +30.2 pp | −24.7 pp | −15.4 pp | +1.0 pp | **−2.2 pp** |
| **glm-5** | +11.3 pp | +8.3 pp | +28.7 pp | +18.9 pp | **+16.8 pp** |
| **kimi-k2.5** | −0.9 pp | −0.2 pp | −1.7 pp | +5.8 pp | **+0.8 pp** |
| **deepseek-v3.2** | +7.3 pp | −9.3 pp | −14.1 pp | +24.1 pp | **+2.0 pp** |
| **ministral-3:14b** | +7.6 pp | +12.3 pp | +0.7 pp | +4.6 pp | **+6.3 pp** |
| **qwen3-vl:235b** | +32.0 pp | +10.4 pp | −5.0 pp | −2.5 pp | **+8.7 pp** |
| **gemini-3-flash** | −9.5 pp | +3.4 pp | −5.8 pp | −0.6 pp | **−3.1 pp** |
| **mistral-large-3:675b** | −0.4 pp | +2.6 pp | +2.9 pp | −5.6 pp | **−0.1 pp** |
| **cogito-2.1:671b** | +8.3 pp | −0.7 pp | +8.4 pp | +11.0 pp | **+6.8 pp** |
| **qwen3-coder:480b** | −6.3 pp | −2.4 pp | −9.3 pp | −8.4 pp | **−6.6 pp** |
| **devstral-small-2:24b** | −6.1 pp | −2.2 pp | −2.3 pp | +7.8 pp | **−0.7 pp** |
| **gemma3:27b** | −1.5 pp | +0.8 pp | +3.3 pp | +7.5 pp | **+2.5 pp** |
| **ministral-3:3b** | −16.2 pp | +8.8 pp | −4.3 pp | −3.3 pp | **−3.8 pp** |
| **nemotron-3-super** | −9.8 pp | −7.9 pp | +16.9 pp | −24.1 pp | **−6.2 pp** |
| **gpt-oss:20b** | +11.5 pp | 0.0 pp | 0.0 pp | 0.0 pp | **+2.9 pp** |
| **qwen3-coder-next** | −8.2 pp | +14.2 pp | −5.8 pp | −32.5 pp | **−8.1 pp** |

> T12 F1 values used as baseline (from T12 RESULTS.md §2.2).

### 5.2 Series Best F1 Summary (T9–T13)

| Test | Best F1 | Model | Condition |
|---|---|---|---|
| T9 | ~69% | — | — |
| T10 | 71.2% | — | — |
| T11 | 67.7% | — | — (injection bug) |
| T12 | 74.2% | gpt-oss:120b | nt |
| **T13** | **74.8%** | **gpt-oss:120b** | **rt** |

---

## 6. Model Status Summary

| Model | Best F1 (T13) | Avg F1 (T13) | T12→T13 Avg Δ | Status |
|---|---|---|---|---|
| **gpt-oss:120b** | 74.8% (rt) | 66.7% | +1.7 pp | ✅ Top performer, consistent |
| **qwen3.5:397b** | 72.4% (rt) | 57.6% | −2.2 pp | ✅ Strong but slow in rt/rn |
| **glm-5** | 70.7% (rn) | 57.0% | **+16.8 pp** | ✅ Significant recovery — glm-5 rn best ever |
| **qwen3-vl:235b** | 55.0% (rn) | 52.5% | +8.7 pp | ✅ Steady, zero FP |
| **kimi-k2.5** | 48.9% (nt) | 47.5% | +0.8 pp | ✅ Stable, consistent across conditions |
| **deepseek-v3.2** | 61.8% (nt) | 42.2% | +2.0 pp | ✅ Strong in nt; weak in rn |
| **ministral-3:14b** | 36.1% (rn) | 29.4% | +6.3 pp | 🟡 Improving but still low |
| **cogito-2.1:671b** | 32.0% (nn) | 28.7% | +6.8 pp | 🟡 Gradual improvement |
| **gemma3:27b** | 25.9% (nt) | 21.8% | +2.5 pp | 🟡 Marginal |
| **mistral-large-3:675b** | 32.8% (nn) | 28.4% | −0.1 pp | 🟡 Flat, persistent FP |
| **gemini-3-flash** | 37.4% (nt) | 29.6% | −3.1 pp | 🟡 Fast but unreliable |
| **devstral-small-2:24b** | 26.6% (nt) | 19.5% | −0.7 pp | 🟡 Flat, small model penalty |
| **qwen3-coder:480b** | 22.5% (rn) | 19.9% | −6.6 pp | 🔴 Declining across tests |
| ~~**ministral-3:3b**~~ | 29.0% (nn) | 24.3% | −3.8 pp | ⛔ REMOVED T14: FP=225 total — chronically hallucinating |
| ~~**gpt-oss:20b**~~ | 36.5% (rt) | 27.9% | +2.9 pp | ⛔ REMOVED T14: TP≈0 in most conditions |
| ~~**nemotron-3-super**~~ | 28.9% (nn) | 17.6% | −6.2 pp | ⛔ REMOVED T14: 2 catastrophic condition failures |
| ~~**qwen3-coder-next**~~ | 35.7% (rn) | 18.8% | −8.1 pp | ⛔ REMOVED T14: Extreme variance, nt −32.5 pp |

---

## 7. Are We Going in Circles? — Honest Assessment

### What actually improved test-to-test:

| | T11→T12 | T12→T13 |
|---|---|---|
| Injection bug fix | ✅ qwen3-coder-next +39 pp nt | — (unchanged) |
| Sweep G nav | ✅ reduced some FP | N/A |
| Sweep G section/aside | — | ⚠️ logo-bar still 91% miss rate |
| glm-5 recovery | ❌ collapsed | ✅ +16.8 pp avg |
| Series best F1 | 74.2% | 74.8% (+0.6 pp) |
| Models improving | 9/17 | 10/17 |
| Avg F1 across all models/conditions | ~37% | ~36% |

### The honest answer: marginal progress with structural limits

**Things that are clearly getting better:**
- gpt-oss:120b is consistently the top model at 74–75% F1 in its best condition
- glm-5 recovered strongly (avg +16.8 pp) — the T12 regression was likely prompt-length sensitivity, and T13's slightly shorter Sweep G helped
- kimi-k2.5 is the most stable mid-tier model (47–48% F1, low variance)
- deepseek nt performance jumped sharply (+24.1 pp) — `/no_think` suppression is now confirmed reliable

**Things that are not improving:**
- The top-10 most missed issues are largely unchanged from T9. `footer-logo-alt-missing`, `html-lang-missing`, `faq-id-wrong-section` are still being missed 40+ times per condition despite targeted prompt changes. The prompts are not solving the attention/scanning problem.
- `logo-bar-aria-label` moved from 100% miss → 91% miss. The Sweep G fix works for models that carefully apply it, but 15/17 models still miss it.
- The overall average F1 across all 17 models × 4 conditions is hovering at ~36%, essentially flat since T10.
- 5 models (ministral-3:3b, nemotron-3-super, gpt-oss:20b, qwen3-coder:480b, qwen3-coder-next) are clearly below the threshold of usefulness and are dragging aggregate statistics down.

**Root cause of the plateau:** The benchmark is now fairly stable — the prompt changes are at diminishing returns. The top 3–4 models (gpt-oss:120b, glm-5, qwen3.5:397b, kimi-k2.5) are finding ~45–75% of issues depending on condition, and further gains require those models to detect issues they consistently miss — many of which are at the bottom of long documents, require multi-element cross-referencing, or need understanding of dynamic ARIA states that static analysis cannot readily infer.

---

## 8. Changes for Test 14

### 8.1 Roster Consolidation (applied — 17 → 13 models)

Four models commented out in `run.ts` after T13. All retain their entry with the removal reason for the record.

| Model | Reason for removal |
|---|---|
| ~~**ministral-3:3b**~~ | FP=225 total in T13; chronic hallucinator across all tests; avg F1=24.3% |
| ~~**nemotron-3-super**~~ | Catastrophic failure in rn (FP=39) and nt (F1=7.6%); avg F1=17.6%; incoherent condition variance |
| ~~**gpt-oss:20b**~~ | TP≈0 in 3/4 conditions across all tests; effectively non-functional as an accessibility auditor |
| ~~**qwen3-coder-next**~~ | Extreme condition variance (7.6%–35.7%); nt dropped 32.5 pp T12→T13; avg F1=18.8% |

Roster: 17 → 13 models. `qwen3-coder:480b` retained for one more test (borderline case, declining but not catastrophic).

### 8.2 Multiple Runs per Combination (applied — `--runs 3`)

T14 will run 3 repetitions per model/fixture/condition combination instead of 1. The `--runs` flag already exists in `run.ts` — no code changes required.

- T13: 17 models × 4 fixtures × 1 run × 4 conditions = **272 total calls**
- T14: 13 models × 1 fixture × 3 runs × 4 conditions = **156 total calls**

Testing is scoped to `html-high` only — the most complex fixture (51 issues) where model differentiation is greatest. Running all 4 fixtures at 3 runs each would be 624 calls; html-high only keeps it manageable.

F1 scores will be averaged across the 3 runs, reducing stochastic variance and giving more statistically stable results.

**T14 run commands:**
```bash
npm run study:norag-nothink -- --fixtures html-high --runs 3
npm run study:norag-think -- --fixtures html-high --runs 3
npm run study:rag-think -- --fixtures html-high --runs 3
npm run study:rag-nothink -- --fixtures html-high --runs 3
```

### 8.3 Prompt Focus: Document Scanning Completeness

The persistent blind spots (`footer-logo-alt-missing`, `html-lang-missing`, `faq-id-wrong-section`) are attention/scanning failures. Consider adding an explicit end-of-document pass instruction:

> "After completing all sweeps, scroll to the bottom of the code. Re-check: (1) every `<img>` in footer and the final 30% of the document has alt text; (2) `<html lang>` is present; (3) every `href="#id"` anchor has a matching `id=` target."

### 8.4 No Further Sweep Changes

The sweep structure is now mature. Further changes risk the T11-style regressions (expanded sweeps → increased FP for fragile models). Hold sweeps stable in T14 and evaluate whether roster consolidation alone improves aggregate scores.
