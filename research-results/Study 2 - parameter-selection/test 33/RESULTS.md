# Test 33 — Results

**Date:** 2026-04-12  
**Conditions:** rn (rag-nothink), rt (rag-think), nn (norag-nothink), nt (norag-think)  
**Fixtures:** html-high, css-high, js-high, tsx-high (high-difficulty only)  
**Models:** 3 — kimi-k2.5, qwen3.5:397b, gpt-oss:120b  
**Changes from T32:** JS LIST 1 completeness gate (state entry count, re-scan if low); CSS outline inventory gate (re-read file if count seems low); TSX-K mandatory active star/rating search. No RAG or param changes.  
**Pass threshold:** ≥ 80.0% accuracy  
**Ground truth per condition:** 603 positive issues, 1 797 TN slots → 2 400 total per model (3 runs × 4 fixtures)

> ⚠️ **Run quality note:** T33 had 0 errors across all 4 conditions. All models TN=1 797 in every condition — fully clean. The new completeness gates improved gpt rn dramatically (+83 TP) but caused gpt to collapse in nn and nt (html-high: 0 TP, css-high: 0 TP in noRAG conditions) — the gates trigger expensive re-reads that exhaust gpt's noRAG token budget.

---

## 1. Accuracy by condition (≥ 80.0% = PASS)

| Model | rn | rt | nn | nt | ≥80% |
|---|---|---|---|---|---|
| kimi-k2.5 | **82.2%**⁰ | **82.3%**⁰ | **82.6%**⁰ | **81.9%**⁰ | 4/4 ✅ |
| qwen3.5:397b | **81.8%**⁰ | **81.2%**⁰ | **81.3%**⁰ | **80.9%**⁰ | 4/4 ✅ |
| gpt-oss:120b | **82.4%**⁰ | **80.2%**⁰ | 79.4%⁰ | 78.4%⁰ | 2/4 |

Superscripts = error count.

**T33 total: 10/12 conditions passing**  
kimi 4/4 + qwen 4/4 + gpt 2/4

**Versus T32 (11/12):** gpt rn recovered (79.3%→82.4% ✅), but gpt nn and nt both failed (80.3%→79.4% and 81.9%→78.4%). Net −1. The completeness gates helped RAG conditions (gpt rn +83 TP) but backfired in noRAG (gpt html-high nn collapsed from 14→0 TP, response time 377 s).

---

## 2. T32 → T33 deltas (nn condition — 0 errors both tests, no RAG)

| Model | T32 nn Acc | T32 nn TP | T33 nn Acc | T33 nn TP | T33 F1 | Pass |
|---|---|---|---|---|---|---|
| kimi-k2.5 | 81.5% | 226 | **82.6%** | 245 | 52.5% | ✅ +1.1pp |
| qwen3.5:397b | 81.7% | 213 | **81.3%** | 216 | 46.3% | ✅ −0.4pp |
| gpt-oss:120b | 80.3% | 156 | 79.4% | 132 | 31.6% | ❌ −0.9pp |

kimi nn set a new high (82.6%, 245 TP — best kimi nn result in the series). qwen stable. gpt regressed: 156→132 TP with two fixture collapses (html+css both 0 TP in the snapshot run).

---

## 3. TP / FP / FN totals by condition

### 3a. RAG No-Think (rn)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| gpt-oss:120b | 228 | 59 | 375 | 1 797 | **82.4%** | 37.8% | 50.0% | 0 |
| kimi-k2.5 | 243 | 84 | 360 | 1 797 | **82.2%** | 40.3% | 51.1% | 0 |
| qwen3.5:397b | 219 | 64 | 384 | 1 797 | **81.8%** | 36.3% | 47.8% | 0 |

**gpt rn = 82.4%** — best gpt result ever in rn (recovering from T32's 79.3% fail). The completeness gates work well when RAG context helps guide the re-reads. gpt TP jumped from 145 (T32) to 228 (+83).

### 3b. RAG Think (rt)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 238 | 73 | 365 | 1 797 | **82.3%** | 39.4% | 49.4% | 0 |
| qwen3.5:397b | 201 | 61 | 402 | 1 797 | **81.2%** | 33.4% | 45.2% | 0 |
| gpt-oss:120b | 179 | 64 | 424 | 1 797 | **80.2%** | 29.7% | 40.1% | 0 |

All pass. kimi and qwen slightly declined from T32 rt (kimi 258→238, qwen 204→201). gpt also declined (204→179). Think mode did not benefit from the completeness gates as much as rn.

### 3c. No-RAG No-Think (nn)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 245 | 72 | 358 | 1 797 | **82.6%** | 40.6% | 52.5% | 0 |
| qwen3.5:397b | 216 | 76 | 387 | 1 797 | **81.3%** | 35.8% | 46.3% | 0 |
| gpt-oss:120b | 132 | 28 | 471 | 1 797 | 79.4% | 21.9% | 31.6% | 0 |

gpt fails at 79.4%. The response time data tells the story: gpt css-high nn = 452 s, gpt html-high nn = 377 s — both extreme, both produced 0 TP. The completion/completeness gates triggered re-reads that consumed the entire analysis window. FP dropped sharply (47→28) because gpt barely reported anything.

### 3d. No-RAG Think (nt)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 227 | 72 | 376 | 1 797 | **81.9%** | 37.7% | 49.0% | 0 |
| qwen3.5:397b | 195 | 63 | 408 | 1 797 | **80.9%** | 32.4% | 44.3% | 0 |
| gpt-oss:120b | 120 | 46 | 483 | 1 797 | 78.4% | 19.8% | 27.9% | 0 |

gpt nt fails at 78.4% — worst gpt result since T28. TP dropped from 213 (T32) to 120 (−93). Same dynamic as nn: gpt spends too long on re-reads in the noRAG condition and produces minimal output. In think mode the re-read loop is even more expensive.

---

## 4. Per-fixture TP breakdown (nn condition — single-run snapshot)

### T33 nn fixture TP

| Fixture | gpt | qwen | kimi |
|---|---|---|---|
| html-high (~51 pos) | **0** | 12 | **23** |
| css-high (~50 pos) | **0** | **30** | 27 |
| js-high (~50 pos) | 10 | 13 | **14** |
| tsx-high (~50 pos) | 19 | 12 | 18 |

### T32 → T33 per-fixture deltas (nn)

| Fixture | gpt Δ | qwen Δ | kimi Δ |
|---|---|---|---|
| html-high | **−14 (14→0)** ❌ | 0 (12→12) | **+3** (20→23) |
| css-high | 0 (0→0) | +1 (29→30) | −4 (31→27) |
| js-high | −1 (11→10) | −1 (14→13) | **+3** (11→14) |
| tsx-high | +1 (18→19) | −5 (17→12) | −3 (21→18) |

Key changes:
- **gpt html-high nn: 14→0** ❌ — new collapse. The JS completeness gate (re-scan if count seems low) triggered a full file re-scan that consumed gpt's noRAG budget. Response time 377 s.
- **gpt css-high nn: still 0** — CSS completion gate did NOT fix gpt. Response time 452 s — gpt is re-reading but still not reporting.
- **kimi html-high: +3** ✅ and **kimi js-high: +3** ✅ — gates helped kimi.
- **qwen css-high: +1** (stable) — qwen unaffected by gates.
- **star-rating-role** still missed by all models in nn (in FN lists for all three).

---

## 5. Hypothesis verification

| Hypothesis | Outcome |
|---|---|
| JS completeness gate improves live-region recall | ⚠️ Mixed — gpt rn TP +83 (strong benefit with RAG); gpt nn html collapsed (14→0, re-scan budget exhausted). kimi/qwen unaffected. |
| CSS completion gate fixes gpt CSS collapse | ❌ Not fixed — gpt css-high nn still 0 TP (452 s response, re-reading but not reporting). The gate causes longer responses but not more issues. |
| TSX-K mandatory search improves star-rating detection | ❌ Not confirmed — `star-rating-role` still in FN list for all models in nn snapshot. No measurable TSX-K improvement visible yet. |
| gpt rn recovery from T32 | ✅ Confirmed — gpt rn 79.3%→82.4%, TP 145→228. Best gpt rn result in series. |
| kimi/qwen stability | ✅ Confirmed — both remain 4/4; kimi nn hit 82.6% (new high). |

---

## 6. Root cause analysis

### 6a. gpt noRAG budget exhaustion — gates backfire without RAG

The completeness gates instruct models to re-read files if their inventory seems insufficient. For kimi and qwen (which have more efficient noRAG processing), this works. For gpt-oss:120b in noRAG mode:
- CSS re-read: 452 s, still 0 TP — gpt reads the file twice but produces no output (likely truncated)
- HTML re-scan: 377 s, 0 TP — gpt exhausts its generation window before producing issue blocks
- nt condition: TP dropped from 213→120 — same budget exhaustion in think+noRAG

The gates are effective **only when RAG provides context** to help the model prioritise. Without RAG, gpt needs its full budget just to complete one pass. A second pass is impossible within the token limit.

**Fix:** Make the completeness gates RAG-conditional, or apply only to kimi/qwen, or replace with a more targeted instruction that doesn't require re-reading the full file.

### 6b. gpt CSS collapse — 4th consecutive test (nn), structural not prompt-based

gpt css-high nn = 0 TP for T30, T31, T32, T33. The completion gate adds 452 s but still produces nothing. This is not a prompt issue — gpt appears incapable of producing CSS issues in noRAG-noThink mode regardless of instruction. Possible causes:
1. gpt's context window in noRAG-noThink runs is entirely consumed by the CSS file + prompt, leaving no room for the output
2. gpt's noThink CSS processing produces a very long Phase 1 inventory that itself fills the output budget before sweeps start

The CSS completion gate may have made this worse by encouraging gpt to write an even longer Phase 1 inventory.

### 6c. kimi and qwen benefit from gates

kimi nn improved: 226→245 TP (+19), accuracy 81.5%→82.6%. kimi js-high +3, html-high +3. The completeness gate appears to help kimi identify more JS handlers in LIST 1. qwen nn is stable (81.7%→81.3%), marginally lower but within variance.

### 6d. gpt rn best result in series — gate works with RAG

With RAG context available, gpt rn produced 228 TP (37.8% recall) at 82.4% accuracy — best ever for gpt rn. The CSS chunks and JS sweep chunks from RAG gave gpt enough guidance to complete sweeps efficiently without exhausting its budget on re-reads. This confirms the gates are useful in RAG conditions.

---

## 7. Persistent FN patterns (all models, all conditions)

### 7a. JS announcement suite — still dominant despite completeness gate

JS FN patterns are largely unchanged. Models still stop at ~10–14 JS issues in nn. The gate caused some models to report their LIST 1 count (evidence in gpt FP list — "mediaPlayerController" entries suggest gpt built a broader LIST 1) but did not push recall into the announcement suite. The announcement functions are at the end of a very long JS file — even with a complete LIST 1, models run out of sweep budget before reaching them.

`scroll-top-announce`, `search-submit-announce`, `filter-result-announce`, `billing-period-announce`, `faq-open-announce`, `shortcut-*-announce`, `nav-open-announce` — all still in FN for all models.

### 7b. TSX star-rating cluster — unchanged

`star-rating-role`, `star-inner-hidden` — in FN lists for all models in the nn snapshot. TSX-K mandatory search instruction has not yet produced visible improvement. The issue may be that models are finding the star elements but not reporting them because they believe them to be "visually correct."

### 7c. TSX plan-card cluster — partially improved

`plan-cta-label`: still in FN for gpt and kimi nn. `plan-article-labelledby`: still in FN for qwen and kimi nn. `plan-card-label`: still in FN for qwen and kimi nn. Small improvement — qwen found `plan-cta-label` in some conditions.

### 7d. CSS deep inventory items — unchanged

The same set of deep CSS items remains persistently missed: `btn-primary-outline-none`, `skip-link-transform`, `negative-word-spacing`, `forced-colors-outline`, `brand-secondary-contrast`, `forced-color-adjust`, `badge-outline-none`, `stat-item-small`, `testimonial-outline-none`, `pagination-small`, `footer-text-contrast`, `modal-btn-outline-none`, `form-input-outline-none`, `footer-nav-outline`.

---

## 8. Notable FP patterns

### 8a. gpt nn: FP=28 (lowest ever) — artefact of near-zero output

gpt nn FP dropped from 47 (T32) to 28 (T33), but this is not a precision improvement — it's because gpt barely reported anything (html=0, css=0). Low FP at low TP is meaningless. Precision = 86.6% but recall = 21.9%.

### 8b. gpt JS FP spike — completeness gate hallucinations

gpt js-high nn: 10 TP, 10 FP (FP rate = 50%). The completeness gate caused gpt to build a broader LIST 1 including `mediaPlayerController` functions that don't exist in the ground truth. The gate successfully expanded LIST 1 but introduced hallucinated entries. This is a prompt-gate side-effect.

### 8c. kimi html-high: 1 FP ("Fieldset missing legend") — recurring

kimi consistently hallucinates "Fieldset missing legend" on html-high across multiple tests. This is a structural FP in kimi's HTML analysis.

---

## 9. Changes made for T34

### Prompt changes (applied after T33)

1. **JS completeness gate → depth requirement** (`JS_MANDATORY_SWEEPS`, LIST 1) — the re-scan instruction caused gpt html-high nn to collapse from 14→0 TP (377 s response, budget exhausted) and introduced hallucinated `mediaPlayerController` FPs. Replaced with a depth-scope requirement: LIST 1 must include handlers at ALL nesting levels — inside `DOMContentLoaded`, IIFE bodies, class method definitions, and helper functions called from init — without triggering any file re-scan.

2. **CSS completion gate → base-selector reminder** (`CSS_MANDATORY_SWEEPS`, Phase 1) — the "re-read the file" gate caused gpt css-high nn to produce 0 TP at 452 s in both T33 and prior tests. Replaced with a targeted reminder that `outline: none` most commonly appears in base component rules (`.btn`, `.tab`, `.form-input`) rather than only in `:focus` / `:focus-visible` pseudo-class rules. No re-read required — models should scan their existing Phase 1 inventory for base-class selectors they may have attributed only to `:focus`.

3. **Anti-FP rule [xi] — JS function citation** (`ANTI_FP_SUPPLEMENT`) — gpt js-high nn produced 10 TP and 10 FP in T33, with FP entries citing functions that do not exist in the source (inferred from class names or assumed patterns). New rule: every JS sweep issue must cite a function name and/or element selector that appears literally in the file being analysed. If the exact name cannot be quoted from source, skip the issue.

4. **CSS density range raised: 15–35 → 20–50** (`CSS_MANDATORY_SWEEPS`, COMPLETION CHECK) — the previous cap told models a "dense stylesheet" yields at most 35 issues; css-high has ~50 positives. Models were stopping and pruning at ~25–30. Raised to 20–50 to match the actual fixture density.

5. **CSS FP CAP raised and reworded: 25 → 40, balanced framing** (`CSS_MANDATORY_SWEEPS`, COMPLETION CHECK) — "A false positive is significantly worse for the user than a missed issue" was actively instructing models to err toward under-reporting. Replaced with balanced framing: "Both missed issues and false positives harm users — report everything you can directly confirm from the source." Cap raised to 40 (still a sanity gate, but no longer triggers pruning of a ~50-positive fixture).

6. **JS density range raised: 18–30 → 25–50** (`JS_MANDATORY_SWEEPS`, COMPLETION CHECK) — same issue as CSS. js-high has ~50 positives; models treated reaching ~20 issues as completion. Raised to 25–50.

7. **TSX-K**: Mandatory search in place — monitor T34 before adjusting further. One run is not enough to assess impact.

### P1 — Monitor

8. **gpt CSS noRAG — structural issue persists**: 4 consecutive tests with gpt css-high nn = 0 TP. T34 will show whether the base-selector reminder + balanced FP framing is sufficient, or whether this is a fundamental context-window incompatibility for gpt in noRAG conditions.

9. **kimi FP stability**: kimi rn FP=84 (highest of three rn models). Monitor T34.

10. **qwen tsx-high regression**: qwen tsx-high nn dropped 17→12 TP in T33. Monitor T34 to determine if TSX-K disrupted qwen's normal TSX flow.

---

## 10. Score and rank tables by condition

### rn (RAG No-Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | gpt-oss:120b | 60.0% | 50.0% | 80.9% | 37.8% | 132.4 s | 0 |
| 2 | qwen3.5:397b | 54.6% | 47.8% | 82.6% | 36.3% | 168.2 s | 0 |
| 3 | kimi-k2.5 | 40.9% | 51.1% | 81.1% | 40.3% | 331.5 s | 0 |

### rt (RAG Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | qwen3.5:397b | 53.0% | 45.2% | 82.0% | 33.4% | 173.7 s | 0 |
| 2 | gpt-oss:120b | 52.1% | 40.1% | 79.2% | 29.7% | 144.7 s | 0 |
| 3 | kimi-k2.5 | 39.5% | 49.4% | 81.9% | 39.4% | 331.3 s | 0 |

### nn (No-RAG No-Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | qwen3.5:397b | 46.6% | 46.3% | 79.3% | 35.8% | 216.9 s | 0 |
| 2 | gpt-oss:120b | 45.3% | 31.6% | 86.6% | 21.9% | 175.9 s | 0 |
| 3 | kimi-k2.5 | 42.0% | 52.5% | 81.0% | 40.6% | 254.3 s | 0 |

gpt ranks #2 composite despite failing accuracy — speed compensates in the composite metric.

### nt (No-RAG Think)

| Rank | Model | Composite | F1 | Prec | Recall | Avg t | Errors |
|---|---|---|---|---|---|---|---|
| 1 | qwen3.5:397b | 50.6% | 44.3% | 80.6% | 32.4% | 200.5 s | 0 |
| 2 | gpt-oss:120b | 42.3% | 27.9% | 80.9% | 19.8% | 187.7 s | 0 |
| 3 | kimi-k2.5 | 39.2% | 49.0% | 78.0% | 37.7% | 240.4 s | 0 |

---

## 11. Cross-test history (T28→T33, active models only)

| Test | Key change | Active model passes | Notes |
|---|---|---|---|
| T28 | Baseline restructure | 3/12 | Initial structured sweep format |
| T29 | JS-G sweep; CSS activation mandate; TSX-J sweep | 12/12 | All 3 models 4/4 |
| T30 | JS Phase 1 expansion; TSX-K | 11/12 | gpt nt failed |
| T31 | JS Phase 1 compressed; TSX Phase 1 merged; JS-G specificity; TSX-K strengthened | 12/12 | gpt nt recovered |
| T32 | 3-model only; RAG top_k 2→3; caps raised | 11/12 | gpt rn failed (RAG overload) |
| T33 | JS completeness gate; CSS completion gate; TSX-K mandatory search | 10/12 | gpt rn recovered; gpt nn+nt failed (budget exhaustion) |

**Model-level history (conditions passing out of 4):**

| Model | T29 | T30 | T31 | T32 | T33 | Trend |
|---|---|---|---|---|---|---|
| kimi-k2.5 | 4/4 | 4/4 | 4/4 | 4/4 | 4/4 | ✅ Stable |
| qwen3.5:397b | 4/4 | 4/4 | 4/4 | 4/4 | 4/4 | ✅ Stable |
| gpt-oss:120b | 4/4 | 3/4 | 4/4 | 3/4 | 2/4 | ⚠️ Volatile |

gpt has now failed in 3 of the last 4 tests. The failures alternate between conditions (T30: nt, T32: rn, T33: nn+nt) and are triggered by different changes, suggesting gpt is operating at or near its accuracy threshold and is sensitive to prompt/RAG changes that alter token consumption.

**Best F1 per model per test:**

| Model | T30 | T31 | T32 | T33 |
|---|---|---|---|---|
| kimi-k2.5 | 50.3% (rt) | 50.8% (nt) | 54.1% (rt) | **52.5%** (nn) |
| qwen3.5:397b | 50.4% (nt) | 43.7% (nt) | 47.4% (nn) | **47.8%** (rn) |
| gpt-oss:120b | 44.2% (nn) | 44.6% (nn) | 48.0% (nt) | **50.0%** (rn) ↑ |

gpt rn F1=50.0% is its best ever result — the completeness gates clearly benefit gpt when RAG is active.
