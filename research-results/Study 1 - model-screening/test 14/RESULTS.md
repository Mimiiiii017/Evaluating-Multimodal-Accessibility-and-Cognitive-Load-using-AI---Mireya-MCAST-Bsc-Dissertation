# Cloud-LLM Preliminary Study — Test 14 Results

**Date:** 2 April 2026  
**Scope:** html-high fixture only (51 issues, highest complexity tier)  
**Models tested:** 13 (4 removed from T13 roster: ministral-3:3b, gpt-oss:20b, nemotron-3-super, qwen3-coder-next)  
**Conditions:** 4 (RAG × Think factorial design)  
**Runs per combination:** 3 (first test with multi-run averaging)  
**Total LLM calls:** 13 models × 1 fixture × 3 runs × 4 conditions = **156 calls**

---

## 1. What Changed from Test 13

### 1.1 Roster: 17 → 13 Models

Four models removed after T13 (commented out in `run.ts`):

| Model removed | Reason |
|---|---|
| ministral-3:3b | FP=225 in T13; chronic hallucinator |
| gpt-oss:20b | TP≈0 in 3/4 conditions across all tests |
| nemotron-3-super | Catastrophic rn (FP=39) and nt (F1=7.6%) |
| qwen3-coder-next | Extreme variance; nt dropped 32.5 pp T12→T13 |

### 1.2 Fixture Scope: All 4 HTML → html-high only

Previous tests ran all 4 HTML fixtures (clean, low, medium, high). T14 focuses exclusively on `html-high` — the most complex fixture with 51 real issues. This eliminates noise from simpler fixtures where most models achieve near-perfect scores on the clean fixture and trivially high scores on low.

### 1.3 Multiple Runs: 1 → 3 runs per combination

Each model/fixture/condition combination now runs 3 times. F1 scores are averaged across the 3 runs, giving statistically more stable measurements and reducing the effect of single-response variance.

---

## 2. Results

### 2.1 Condition Definitions

| Condition | RAG | Thinking (extended CoT) |
|---|---|---|
| `rag-think` (rt) | Yes | Yes |
| `rag-nothink` (rn) | Yes | No |
| `norag-nothink` (nn) | No | No |
| `norag-think` (nt) | No | Yes |

### 2.2 F1 Score Matrix (html-high, avg of 3 runs, sorted by avg)

| Model | nn | nt | rt | rn | **Best F1** | **Avg F1** |
|---|---|---|---|---|---|---|
| **gpt-oss:120b** | 57.5% | 31.3% | 39.2% | **64.1%** | **64.1%** | **48.0%** |
| **kimi-k2.5** | 32.2% | **65.9%** | 43.0% | 32.6% | **65.9%** | **43.4%** |
| **glm-5** | 39.9% | 37.5% | **52.6%** | 45.3% | **52.6%** | **43.8%** |
| **qwen3.5:397b** | 43.7% | **47.1%** | 42.4% | 36.9% | **47.1%** | **42.5%** |
| **deepseek-v3.2** | **46.5%** | 37.9% | 21.9% | 38.6% | **46.5%** | **36.2%** |
| **ministral-3:14b** | 32.8% | 27.1% | **42.9%** | 41.6% | **42.9%** | **36.1%** |
| **mistral-large-3:675b** | 32.6% | **35.3%** | 34.1% | 29.0% | **35.3%** | **32.8%** |
| **cogito-2.1:671b** | 25.1% | **30.0%** | 28.0% | 25.1% | **30.0%** | **27.0%** |
| **gemini-3-flash** | 29.5% | **31.4%** | 17.9% | 30.9% | **31.4%** | **27.4%** |
| **qwen3-coder:480b** | 25.1% | 23.1% | 23.1% | **28.1%** | **28.1%** | **24.9%** |
| **qwen3-vl:235b** | **27.0%** | 26.1% | 18.0% | 26.1% | **27.0%** | **24.3%** |
| **devstral-small-2:24b** | 25.1% | **30.0%** | 7.5% | 7.5% | **30.0%** | **17.5%** |
| **gemma3:27b** | 17.7% | **26.5%** | 12.0% | 8.6% | **26.5%** | **16.2%** |

### 2.3 Composite Score Matrix (80% F1 + 20% speed)

| Model | nn | nt | rt | rn | **Best** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | 59.2% | 28.9% | 46.6% | **60.0%** | **60.0%** |
| **kimi-k2.5** | 25.7% | **55.2%** | 39.2% | 33.0% | **55.2%** |
| **glm-5** | 45.2% | 39.8% | **53.2%** | 37.8% | **53.2%** |
| **qwen3.5:397b** | 47.4% | **48.0%** | 44.9% | 34.5% | **48.0%** |
| **deepseek-v3.2** | **44.6%** | 45.8% | 17.5% | 44.4% | **45.8%** |
| **ministral-3:14b** | 36.1% | 21.7% | **41.5%** | 42.8% | **42.8%** |
| **mistral-large-3:675b** | 39.6% | **37.4%** | 44.9% | 39.7% | **44.9%** |
| **gemini-3-flash** | **43.6%** | 39.5% | 31.3% | 44.7% | **44.7%** |
| **cogito-2.1:671b** | 38.7% | **44.0%** | 42.4% | 38.6% | **44.0%** |
| **qwen3-vl:235b** | **36.6%** | 32.6% | 17.2% | 31.9% | **36.6%** |
| **qwen3-coder:480b** | 28.3% | 33.4% | 32.3% | **22.5%** | **33.4%** |
| **devstral-small-2:24b** | 34.3% | **43.0%** | 17.1% | 15.6% | **43.0%** |
| **gemma3:27b** | 31.5% | **38.3%** | 28.0% | 21.2% | **38.3%** |

### 2.4 False Positive Summary

| Model | nn FP | nt FP | rt FP | rn FP | **Total** |
|---|---|---|---|---|---|
| **ministral-3:14b** | 0 | 4 | 8 | **129** | **141** |
| **gpt-oss:120b** | 13 | 4 | 3 | 7 | **27** |
| **qwen3.5:397b** | 2 | 5 | 2 | 1 | **10** |
| **glm-5** | 2 | 2 | 5 | 3 | **12** |
| **kimi-k2.5** | 2 | 6 | 0 | 2 | **10** |
| **deepseek-v3.2** | 2 | 1 | 0 | 1 | **4** |
| **mistral-large-3:675b** | 1 | 1 | 2 | 0 | **4** |
| **gemini-3-flash** | 3 | 0 | 1 | 0 | **4** |
| **gemma3:27b** | 1 | 3 | 0 | 3 | **7** |
| **cogito-2.1:671b** | 0 | 2 | 0 | 0 | **2** |
| **devstral-small-2:24b** | 0 | 1 | 0 | 0 | **1** |
| **qwen3-coder:480b** | 0 | 0 | 0 | 0 | **0** |
| **qwen3-vl:235b** | 0 | 0 | 0 | 0 | **0** |

---

## 3. Key Findings

### 3.1 New Series High: kimi-k2.5 nt = 65.9% F1

kimi-k2.5 in the noRAG+Think condition achieved 65.9% F1 on html-high (averaged across 3 runs) — the highest single-condition F1 ever recorded for html-high specifically. In previous tests kimi-k2.5's best was 48.9% (T13 nt, averaged across all 4 fixtures). Isolating html-high reveals kimi is significantly stronger on complex fixtures than the multi-fixture average suggested.

This is the first test where kimi-k2.5 outperforms gpt-oss:120b's best single-condition result.

### 3.2 gpt-oss:120b Best Condition Flipped: rn (64.1%) Not rt

In T12/T13, gpt-oss:120b's best condition was rt (74.8% in T13 across all fixtures). On html-high specifically, its best is **rn at 64.1%** — RAG without thinking. Its nt score collapsed to 31.3%. This shows that on the hardest fixture, RAG+noThink is more effective for this model than RAG+Think, possibly because CoT on a 51-issue fixture causes over-analysis and hallucination.

Note: gpt-oss:120b still has the highest **average** F1 at 48.0%, followed closely by glm-5 (43.8%) and kimi-k2.5 (43.4%).

### 3.3 ministral-3:14b: FP=129 in rn — Remove

ministral-3:14b produced 129 false positives across 3 runs in the rn condition — an average of 43 hallucinations per run. This is worse than ministral-3:3b was before its removal. The rn composite of 42.8% looks acceptable but is entirely built on a precision of 38% backed by an FP flood. This model must be removed before T15.

### 3.4 devstral-small-2:24b: RAG Collapse (7.5% rt/rn)

devstral-small-2 collapses completely under RAG conditions: rt=7.5%, rn=7.5%. Without RAG it manages 25–30%. This is a consistent pattern — the model is overwhelmed by the combined length of the html-high fixture plus RAG chunks. Candidate for removal.

### 3.5 deepseek-v3.2 rt = 21.9% — Worst Ever for Large Model

deepseek-v3.2 in rt dropped to 21.9% F1 — its worst single-condition result in the entire series. This matches the T13 rt figure (42.3%) trend of decline. deepseek clearly performs worst with RAG+Think on complex fixtures. Its nn condition (46.5%) remains strong. Condition sensitivity is extreme (46.5% vs 21.9%).

### 3.6 Universal Miss Cluster: 7 Issues at 100% Miss Rate

Across all conditions, the following issues were missed by every model in every run (39/39 = 100%):

| Issue ID | Category | Why models miss it |
|---|---|---|
| `table-caption-missing` | Table structure | `<caption>` rarely present; models don't scan for its absence |
| `subnav-btn-aria` | ARIA button state | Dynamic ARIA state on nested nav button |
| `account-nav-label` | Landmark label | Single `<nav>` inside header — Sweep G skips it (only one) |
| `main-id-missing` | ID attribute | `<main>` lacks `id` — not covered by any sweep |
| `live-region-removed` | ARIA live region | `aria-live` removed — absence detection |
| `product-grid-label` | Landmark label | `<section>` — same multi-instance gate issue |
| `search-form-role` | ARIA role | `<form>` missing `role="search"` — not in sweeps |

These 7 are structural gaps in the prompt coverage, not attention failures. They require sweep additions to fix.

### 3.7 Multi-Run Effect: Stability Confirmed

The 3-run averaging produced notably stable scores. Key evidence:
- qwen3-coder:480b: F1 σ=0.014 (extremely consistent across 3 runs)
- gemini-3-flash: FP dropped to 0 in nt/rn — consistent clean behaviour when not hallucinating
- ministral-3:14b rn FP=129 with 3 runs means ~43 FP per run — the instability was genuine, not an outlier

---

## 4. T13 vs T14 Comparison (html-high F1)

> Note: T13 values are from the html-high fixture only (extracted from T13 multi-fixture run). T14 values are 3-run averages.

| Model | T13 nn | T14 nn | T13 nt | T14 nt | T13 rt | T14 rt | T13 rn | T14 rn | **Avg Δ** |
|---|---|---|---|---|---|---|---|---|---|
| **gpt-oss:120b** | 55.3% | 57.5% | 65.6% | 31.3% | 74.8% | 39.2% | 42.3% | 64.1% | −12.2 pp |
| **kimi-k2.5** | 60.3% | 32.2% | — | 65.9% | 47.6% | 43.0% | 46.8% | 32.6% | −5.0 pp |
| **glm-5** | 47.8% | 39.9% | 58.7% | 37.5% | 30.7% | 52.6% | 70.7% | 45.3% | −6.0 pp |
| **qwen3.5:397b** | 64.0% | 43.7% | 68.6% | 47.1% | 72.4% | 42.4% | 40.4% | 36.9% | −22.6 pp |
| **deepseek-v3.2** | 37.7% | 46.5% | 61.8% | 37.9% | 42.3% | 21.9% | 26.9% | 38.6% | −7.8 pp |
| **ministral-3:14b** | 32.8% | 32.8% | 20.9% | 27.1% | 34.7% | 42.9% | 36.1% | 41.6% | +5.6 pp |
| **mistral-large-3:675b** | 40.0% | 32.6% | 26.3% | 35.3% | 28.3% | 34.1% | 26.1% | 29.0% | +0.1 pp |
| **cogito-2.1:671b** | 47.9% | 25.1% | 26.7% | 30.0% | 27.3% | 28.0% | 28.9% | 25.1% | −10.5 pp |
| **gemini-3-flash** | 32.8% | 29.5% | 37.4% | 31.4% | 16.7% | 17.9% | 34.1% | 30.9% | −4.3 pp |
| **qwen3-coder:480b** | 24.1% | 25.1% | 19.4% | 23.1% | 19.7% | 23.1% | 22.5% | 28.1% | +2.8 pp |
| **qwen3-vl:235b** | 27.1% | 27.0% | 51.0% | 26.1% | 53.7% | 18.0% | 55.0% | 26.1% | −19.5 pp |
| **devstral-small-2:24b** | 17.9% | 25.1% | 26.6% | 30.0% | 15.0% | 7.5% | 14.6% | 7.5% | −4.7 pp |
| **gemma3:27b** | 17.9% | 17.7% | 25.9% | 26.5% | 17.1% | 12.0% | 21.0% | 8.6% | −5.8 pp |

> T13 html-high single-run vs T14 html-high 3-run average. Drops likely reflect 3-run averaging smoothing out lucky single-run peaks.

---

## 5. Model Status Summary

| Model | Best F1 (T14) | Avg F1 (T14) | Status |
|---|---|---|---|
| **gpt-oss:120b** | 64.1% (rn) | 48.0% | ✅ Still top avg; best condition flipped to rn |
| **kimi-k2.5** | **65.9% (nt)** | 43.4% | ✅ New series high for html-high; strong in nt |
| **glm-5** | 52.6% (rt) | 43.8% | ✅ Consistent; best in rt |
| **qwen3.5:397b** | 47.1% (nt) | 42.5% | ✅ Stable; low FP |
| **deepseek-v3.2** | 46.5% (nn) | 36.2% | 🟡 Strong nn/rn; collapses in rt |
| **ministral-3:14b** | 42.9% (rt) | 36.1% | 🔴 rn FP=129 — removed T15 |
| **mistral-large-3:675b** | 35.3% (nt) | 32.8% | 🟡 Flat but stable, low FP |
| **cogito-2.1:671b** | 30.0% (nt) | 27.0% | 🟡 Zero FP; low but clean |
| **gemini-3-flash** | 31.4% (nt) | 27.4% | 🟡 Fastest by far (13.5s avg) |
| **qwen3-coder:480b** | 28.1% (rn) | 24.9% | 🟡 Zero FP; consistent but low |
| **qwen3-vl:235b** | 27.0% (nn) | 24.3% | 🟡 Zero FP; dropped vs T13 |
| **devstral-small-2:24b** | 30.0% (nt) | 17.5% | 🔴 7.5% in both RAG conditions — remove T15 |
| **gemma3:27b** | 26.5% (nt) | 16.2% | 🔴 Low across all conditions; remove candidate |

---

## 6. Changes for Test 15

### 6.1 Roster: 13 → 10 Models (remove 3)

| Model | Reason |
|---|---|
| **ministral-3:14b** | rn FP=129 (avg 43/run); avg F1=36.1% built on unreliable precision |
| **devstral-small-2:24b** | rt/rn F1=7.5% both; complete RAG collapse; avg F1=17.5% |
| **gemma3:27b** | Avg F1=16.2%; four tests of no improvement; rn=8.6% |

### 6.2 Sweep Additions: Considered and Reverted

Sweeps K/L/M were drafted to address three of the seven universally-missed issues (`table-caption-missing`, `search-form-role`, `main-id-missing`) but were removed before T15. Decision: adding explicit sweep instructions for known gaps would test whether models follow instructions, not whether they can identify real violations independently. The benchmark should measure real-world capability without guided hints.

### 6.3 Continue html-high, 3 runs

Keep `--fixtures html-high --runs 3` for T15. The multi-run averaging is working — scores are more stable and FP spikes are properly exposed rather than hidden by lucky single-run results.


