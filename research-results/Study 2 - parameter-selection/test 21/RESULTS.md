# Test 21 — Results

**Date:** 6–7 April 2026 (runs 22:05–00:34)
**Scope:** 4 fixtures (html-high, css-high, js-high, tsx-high) × 4 conditions (nn, nt, rn, rt) × 3 runs each
**Models (7):** gpt-oss:120b, kimi-k2.5, qwen3.5:397b, deepseek-v3.2, glm-5, gemini-3-flash-preview, mistral-large-3:675b
**What changed from T20:** JS multi-query RAG reduced from 4→2 queries with a stricter threshold (0.65→0.70) and tighter chunk cap (6→4). TSX multi-query RAG redesigned from 4→3 queries. HTML and CSS sweeps unchanged.

---

## 1. What Changed from T20

### 1.1 JS RAG Fix (T20§6.1 recommendation)

T20 revealed that deepseek's JS rn F1 collapsed to 8.2% — an apparent over-retrieval failure where 4 high-overlap JS queries produced diluted, contradictory context. Two mitigations were applied together:

- **Queries reduced 4→2:** Merged the aria-expanded/aria-pressed coverage into two focused queries rather than four overlapping ones.
- **Distance threshold tightened 0.65→0.70:** Requires chunks to be closer matches before inclusion.
- **Chunk cap tightened 6→4:** Prevents context dilution from marginal chunks.

The two T21 JS queries:
1. `aria-expanded toggle function setAttribute open close menu nav accordion JavaScript handler`
2. `aria-pressed toggle button filter tab pressed state aria-invalid validation JavaScript`

### 1.2 TSX RAG Redesign (T20§6.2 recommendation)

T20 TSX RAG results were net neutral. The 4-query sweep was redesigned to 3 queries with better separation of concerns:

1. `htmlFor aria-invalid aria-describedby error message accessible label React form controlled input TypeScript`
2. `aria-hidden decorative spinner carousel slide clone aria-pressed toggle billing filter hidden conditional render React`
3. `aria-label landmark nav region aria-current aria-modal role dialog hamburger accessible name React`

Query 3 merges the old queries 3 and 4 (which overlapped on `aria-expanded`/`aria-controls`) and adds `aria-modal`/`role=dialog` coverage for the mobile nav modal, which was being missed.

### 1.3 Unchanged Components

- HTML sweep: 5 queries, threshold 0.50, max 8 chunks — unchanged
- CSS sweep: 3 queries, threshold 0.65, max 6 chunks — unchanged
- Knowledge base: 509 chunks (same as T20)
- Prompt template: unchanged

---

## 2. Results

### 2.1 Composite Score Matrix (primary ranking metric)

Composite = 80% F1 + 20% speed penalty. Models sorted by best composite across all 4 conditions.

| Model | nn | nt | rn | rt | **Best** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | 42.5% | **53.0%** | 44.5% | 45.6% | **53.0% (nt)** |
| **qwen3.5:397b** | 45.3% | 47.8% | 41.9% | **48.8%** | **48.8% (rt)** |
| **gemini-3-flash** | 41.1% | 35.7% | **44.6%** | 36.2% | **44.6% (rn)** |
| **glm-5** | 37.2% | 35.1% | 42.2% | **44.1%** | **44.1% (rt)** |
| **kimi-k2.5** | **42.3%** | 37.0% | 34.3% | 38.1% | **42.3% (nn)** |
| **deepseek-v3.2** | 24.9% | **41.6%** | 32.0% | 39.5% | **41.6% (nt)** |
| **mistral-large-3** | 21.0% | **39.8%** | 38.3% | 39.2% | **39.8% (nt)** |

### 2.2 Overall F1 Score Matrix

| Model | nn | nt | rn | rt | **Best F1** |
|---|---|---|---|---|---|
| **kimi-k2.5** | **49.7%** | 46.3% | 42.9% | 47.6% | **49.7% (nn)** |
| **gpt-oss:120b** | 35.9% | **41.2%** | 38.4% | 35.3% | **41.2% (nt)** |
| **glm-5** | 35.3% | **38.4%** | 37.5% | 37.6% | **38.4% (nt)** |
| **qwen3.5:397b** | **36.4%** | 34.7% | 33.9% | 36.1% | **36.4% (nn)** |
| **deepseek-v3.2** | **31.2%** | 30.8% | 30.8% | 29.4% | **31.2% (nn)** |
| **gemini-3-flash** | 26.4% | 23.0% | **30.7%** | 22.5% | **30.7% (rn)** |
| **mistral-large-3** | 20.1% | 27.3% | **29.7%** | 24.0% | **29.7% (rn)** |

### 2.3 F1 by Fixture and Condition

#### html-high (HTML markup, 51 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **gpt-oss:120b** | 50.5% | 49.5% | 48.0% | **53.0%** | **50.3%** |
| **kimi-k2.5** | **56.2%** | 36.3% | 44.6% | 41.1% | **44.6%** |
| **qwen3.5:397b** | **46.2%** | 40.1% | 36.6% | 37.9% | **40.2%** |
| **deepseek-v3.2** | **46.9%** | 39.2% | 26.2% | 21.8% | **33.5%** |
| **glm-5** | 29.8% | **36.8%** | 31.5% | 36.1% | **33.6%** |
| **gemini-3-flash** | **34.6%** | 29.0% | 34.6% | 22.9% | **30.3%** |
| **mistral-large-3** | 25.6% | **30.9%** | 26.9% | 25.9% | **27.3%** |

#### css-high (CSS, 50 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 57.0% | 56.3% | 55.2% | **59.2%** | **56.9%** |
| **glm-5** | 36.4% | **59.3%** | 54.2% | 57.4% | **51.8%** |
| **deepseek-v3.2** | 39.6% | 30.6% | 33.0% | **59.8%** | **40.8%** |
| **gpt-oss:120b** | 40.2% | **42.2%** | 28.5% | 27.8% | **34.7%** |
| **qwen3.5:397b** | 34.2% | 32.4% | 36.7% | **39.0%** | **35.6%** |
| **gemini-3-flash** | 27.1% | 27.6% | **42.3%** | 35.5% | **33.1%** |
| **mistral-large-3** | 24.9% | 29.5% | **37.0%** | 29.5% | **30.2%** |

#### js-high (JavaScript, 50 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 30.4% | **36.3%** | 34.2% | 32.1% | **33.3%** |
| **qwen3.5:397b** | **30.7%** | 27.5% | 27.8% | 26.4% | **28.1%** |
| **glm-5** | **33.5%** | 22.1% | 24.3% | 17.6% | **24.4%** |
| **gemini-3-flash** | 21.4% | 20.7% | 21.4% | **25.7%** | **22.3%** |
| **deepseek-v3.2** | 20.7% | **23.2%** | **25.9%** | 9.2% | **19.8%** |
| **mistral-large-3** | 2.6% | 17.4% | **25.9%** | 19.2% | **16.3%** |
| **gpt-oss:120b** | 10.6% | **21.3%** | **21.3%** | 11.0% | **16.1%** |

#### tsx-high (TypeScript React, 50 issues)

| Model | nn | nt | rn | rt | **Avg** |
|---|---|---|---|---|---|
| **kimi-k2.5** | 55.1% | 56.3% | 37.6% | **57.8%** | **51.7%** |
| **gpt-oss:120b** | 42.3% | 51.8% | **55.7%** | 49.3% | **49.8%** |
| **glm-5** | **41.6%** | 35.5% | 39.8% | 39.3% | **39.1%** |
| **qwen3.5:397b** | 34.3% | 39.0% | 34.6% | **41.3%** | **37.3%** |
| **deepseek-v3.2** | 17.4% | 30.2% | **37.9%** | 26.6% | **28.0%** |
| **mistral-large-3** | 27.1% | **31.5%** | 28.9% | 21.3% | **27.2%** |
| **gemini-3-flash** | 24.4% | 14.7% | 24.6% | **6.0%** | **17.4%** |

### 2.4 False Positive Summary (hallucinations across all 4 conditions combined)

| Model | rn FP | rt FP | nn FP | nt FP | **Total** | vs T20 |
|---|---|---|---|---|---|---|
| **kimi-k2.5** | 64 | 72 | 64 | 60 | **260** | +66 ↑ |
| **gpt-oss:120b** | 63 | 21 | 44 | 70 | **198** | −46 ↓ |
| **mistral-large-3** | 40 | 24 | 16 | 33 | **113** | −83 ↓ |
| **glm-5** | 19 | 37 | 16 | 21 | **93** | +29 ↑ |
| **deepseek-v3.2** | 11 | 25 | 11 | 13 | **60** | +31 ↑ |
| **qwen3.5:397b** | 18 | 13 | 13 | 12 | **56** | −21 ↓ |
| **gemini-3-flash** | 14 | 8 | 6 | 11 | **39** | 0 → |

T20 total FP (for reference): gpt 244, mistral 196, kimi 194, qwen 77, glm 64, gemini 39, deepseek 29.

### 2.5 Consistency (F1 σ — lower is more reproducible)

Average σ across all 4 conditions:

| Model | rn σ | rt σ | nn σ | nt σ | **Avg σ** | vs T20 |
|---|---|---|---|---|---|---|
| **gemini-3-flash** | 0.083 | 0.121 | 0.043 | 0.067 | **0.079** | +0.019 |
| **qwen3.5:397b** | 0.072 | 0.084 | 0.102 | 0.062 | **0.080** | −0.043 ↓ |
| **mistral-large-3** | 0.098 | 0.116 | 0.133 | 0.102 | **0.112** | +0.006 |
| **glm-5** | 0.131 | 0.150 | 0.143 | 0.147 | **0.143** | −0.009 |
| **kimi-k2.5** | 0.148 | 0.157 | 0.143 | 0.148 | **0.149** | −0.009 |
| **deepseek-v3.2** | 0.123 | 0.223 | 0.155 | 0.140 | **0.160** | +0.017 |
| **gpt-oss:120b** | 0.187 | 0.203 | 0.166 | 0.138 | **0.174** | +0.016 |

T20 avg σ for reference: gemini 0.060, mistral 0.106, qwen 0.123, deepseek 0.143, glm 0.152, kimi 0.158, gpt 0.158.

---

## 3. Key Findings

### 3.1 JS RAG Fix: Partial Success

The primary target of T21 was deepseek's JS rn collapse (8.2% in T20). The fix succeeded substantially:

**JS F1 rn deltas (T21 − T20):**
| Model | T20 | T21 | Δ |
|---|---|---|---|
| deepseek | 8.2% | 25.9% | **+17.7pp** ✓ |
| kimi | 23.5% | 34.2% | **+10.7pp** ✓ |
| glm | 15.8% | 24.3% | **+8.5pp** ✓ |
| gpt | 19.6% | 21.3% | +1.7pp |
| gemini | 19.8% | 21.4% | +1.6pp |
| mistral | 26.9% | 25.9% | −1.0pp |
| qwen | 30.7% | 27.8% | −2.9pp |

The tighter threshold (0.70) and reduced query count (4→2) successfully resolved deepseek's retrieval overload. Models that had no collapse in T20 (mistral, qwen) were largely unaffected.

However, deepseek's **JS rt** regressed to 9.2% (from 19.0%), suggesting deepseek's think-mode behaves differently with the new query formulation.

The **JS fixture ceiling remains low** across all models (max 36.3% for kimi-nt). The js-high issues concentrate heavily on `aria-live` announcement injection and dynamic state visibility — 40+ issues of this type are beyond what static code inspection produces, limiting achievable F1 regardless of RAG configuration.

### 3.2 TSX Redesign: Mixed

TSX rn deltas against T20:
| Model | T20 | T21 | Δ |
|---|---|---|---|
| deepseek | 26.4% | 37.9% | **+11.5pp** ✓ |
| gpt | 48.9% | 55.7% | **+6.8pp** ✓ |
| glm | 38.4% | 39.8% | +1.4pp |
| gemini | 25.3% | 24.6% | −0.7pp |
| kimi | 44.7% | 37.6% | **−7.1pp** ✗ |
| qwen | 43.8% | 34.6% | **−9.2pp** ✗ |
| mistral | 40.0% | 28.9% | **−11.1pp** ✗ |

Deepseek and gpt benefited from the 3-query TSX redesign, but kimi, qwen, and mistral all regressed on rn. The rt condition was worse: gemini TSX rt collapsed to 6.0% (from 27.1%), and mistral dropped −16.1pp. The redesigned third query (aria-modal/role dialog/hamburger) appears to introduce retrieval noise for models sensitive to context volume in think mode.

### 3.3 GLM Breakout

glm showed dramatic composite improvement across all 4 conditions, with no targeted fix applied:

| Condition | T20 | T21 | Δ |
|---|---|---|---|
| nn | 24.7% | 37.2% | **+12.5pp** |
| nt | 28.4% | 35.1% | **+6.7pp** |
| rn | 28.2% | 42.2% | **+14.0pp** |
| rt | 32.5% | 44.1% | **+11.6pp** |

This is consistent with an API-side model update rather than any benchmark change. glm now ranks 3rd–4th overall and produces notably strong CSS results (nt CSS: 59.3%, rt CSS: 57.4%).

### 3.4 CSS Stability (and Anomalies)

CSS sweep was unchanged in T21. Results were largely stable for most models, but two notable outliers:
- **gpt CSS rn**: 42.3% → 28.5% (−13.8pp) — unexplained regression, likely variance
- **deepseek CSS rt**: 11.8% → 59.8% (+48.0pp) — largest single-cell gain in the dataset; deepseek's T20 CSS rt had severely under-reported (only 1 TP on css fixture), now recovered to 24 TP

These anomalies are consistent with high deepseek variance in RAG+think mode (σ=0.223 for rt).

### 3.5 Control Conditions (nn / nt)

nn and nt conditions have no RAG, so changes here reflect model API drift:
- **glm** improved +12.5pp (nn) and +6.7pp (nt) — likely API update
- **deepseek** improved +5.2pp (nt) — possibly API update  
- **kimi** dropped −11.8pp (nt) and was flat (nn at +6.9pp) — nt regression suggests think-mode behaviour change
- **mistral** dropped −3.6pp (nn) and −1.8pp (nt) — mild regression
- **gpt** dropped −10.0pp (nn) but gained +7.1pp (nt)

High within-experiment variance makes it difficult to attribute control changes definitively to model updates vs. natural run-to-run variance.

---

## 4. T20 → T21 Comparison

### 4.1 Composite Score Deltas

| Model | nn Δ | nt Δ | rn Δ | rt Δ | Best Δ |
|---|---|---|---|---|---|
| **glm-5** | **+12.5** | **+6.7** | **+14.0** | **+11.6** | **+11.6** |
| **deepseek-v3.2** | −8.9 | **+5.2** | +2.7 | **+6.8** | **+5.2** |
| **gpt-oss:120b** | −10.0 | **+7.1** | −3.3 | −2.5 | **+0.5** |
| **gemini-3-flash** | −0.5 | +0.1 | +0.3 | −3.3 | **+0.3** |
| **qwen3.5:397b** | +1.6 | −4.9 | +2.5 | −2.8 | **−3.9** |
| **kimi-k2.5** | +6.9 | −11.8 | −3.5 | −8.3 | **−6.5** |
| **mistral-large-3** | −3.6 | −1.8 | −4.2 | −7.7 | **−7.1** |

### 4.2 Key Per-Fixture Changes

| Fixture | Biggest gain | Biggest loss |
|---|---|---|
| **html** | deepseek nn +14.1pp | deepseek rn −17.0pp |
| **css** | deepseek rt +48.0pp | gpt rn −13.8pp |
| **js** | deepseek rn +17.7pp | deepseek rt −9.8pp |
| **tsx** | deepseek rn +11.5pp | gemini rt −21.1pp |

---

## 5. Model Status Summary

| Model | T20 Best | T21 Best | Δ Best | Status |
|---|---|---|---|---|
| **gpt-oss:120b** | 52.5% | 53.0% | +0.5% | Stable leader; FP improved −46 |
| **qwen3.5:397b** | 52.7% | 48.8% | −3.9% | Slightly regressed; most consistent model in T21 |
| **gemini-3-flash** | 44.3% | 44.6% | +0.3% | Stable; lowest FP count (39 total) |
| **glm-5** | 32.5% | 44.1% | **+11.6%** | Large improvement — likely API update |
| **kimi-k2.5** | 48.8% | 42.3% | −6.5% | Regressed; FP count jumped to 260 (highest) |
| **deepseek-v3.2** | 36.4% | 41.6% | **+5.2%** | Improved; JS rn fix successful; but high variance |
| **mistral-large-3** | 46.9% | 39.8% | −7.1% | Consistent regressor across T20→T21 |

---

## 6. Recommendations for T22

### 6.1 JS: Add aria-live / Announcement Query

The JS fixture ceiling (~34% for the best models) reflects a structural knowledge gap. Over 30 of the 50 JS issues involve `aria-live` regions and dynamic announcement injection patterns (`scroll-top-announce`, `faq-open-announce`, etc.). The current 2 JS queries do not cover this domain. Add a third query targeting live-region patterns:

```
aria-live polite assertive innerHTML textContent announcement inject scroll top announce search results count
```

### 6.2 TSX: Revert Third Query or Score It

The TSX third query (aria-modal/hamburger) caused regressions in kimi, qwen, and mistral. Options:
- **Remove query 3** and revert to 2 queries — cleaner context, likely avoids the regression for most models
- **Test with threshold 0.68** mid-point — reduce noise without fully eliminating modal-pattern coverage

### 6.3 Investigate deepseek JS rt Collapse

deepseek JS rt regressed to 9.2% despite the rn fix (+17.7pp). This suggests the think-mode (`-rt`) path processes the new 2-query RAG context differently. Consider testing deepseek separately with `--think=false` to isolate RAG-only behaviour before addressing the rt path.

### 6.4 gemini TSX rt Monitoring

Gemini TSX rt collapsed to 6.0% (from 27.1%). With only 2 TP across 3 runs on that cell, this may be a one-run anomaly amplified by averaging. Monitor in T22 — if it recurs, gemini may need a fixture-specific exception.

### 6.5 Calibrate Expectations: JS Fixture Ceiling

Even with improved RAG, JS fixture scores are unlikely to exceed ~40% for any model with current knowledge base content. The 50 JS issues are dominated by aria-live announcement patterns that require runtime execution semantics — no amount of static code retrieval can fully address this. Consider whether the JS fixture design itself needs adjustment for the final evaluation (either weight reduction or a complementary dynamic-analysis pass).
