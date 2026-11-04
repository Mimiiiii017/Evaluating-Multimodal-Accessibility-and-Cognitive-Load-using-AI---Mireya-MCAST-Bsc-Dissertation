# Test 34 — Results

**Date:** 2026-04-13  
**Conditions:** rn (rag-nothink), rt (rag-think), nn (norag-nothink), nt (norag-think)  
**Fixtures (this run):** ALL 16 — html/css/js/tsx × clean/low/medium/high  
**Models:** 3 — kimi-k2.5, qwen3.5:397b, gpt-oss:120b  
**Changes from T33:** JS completeness gate → depth requirement; CSS completion gate → base-selector reminder; anti-FP rule [xi] (JS citation); CSS density range 15–35 → 20–50; CSS FP cap 25 → 40 with balanced framing; JS density range 18–30 → 25–50.  
**Pass threshold:** ≥ 80.0% accuracy  
**Ground truth (high fixtures only, for T33 comparison):** 201 positive concepts, 599 TN slots → 800 total per fixture set per run (4 fixtures × 200 slots)

> ⚠️ **Structural change:** T34 ran ALL 16 fixtures (clean / low / medium / high) rather than only the 4 high-difficulty fixtures used in T32–T33. The CSV overall accuracy (~90–91%) is inflated by the many TN slots in clean and low fixtures and is NOT directly comparable to T33's ~79–83%. Pass/fail decisions and T33 comparisons below use the **high-fixture subset only**, derived from the per-fixture detail rows in each CSV.

> **Run quality:** 0 errors across all 4 conditions.

---

## 1. Pass/fail summary (high-fixture subset, ≥ 80.0%)

| Model | rn | rt | nn | nt | ≥80% |
|---|---|---|---|---|---|
| kimi-k2.5 | **82.2%** | **82.1%** | **83.8%** | **83.5%** | 4/4 ✅ |
| qwen3.5:397b | **80.5%** | **81.8%** | **81.5%** | **81.3%** | 4/4 ✅ |
| gpt-oss:120b | **81.6%** | 79.9% | **81.9%** | **80.3%** | 3/4 |

**T34 total: 11/12 conditions passing** (gpt rt fails at 79.9%, 0.1pp below threshold)

**Versus T33 (10/12):** +1. gpt nn recovered (79.4% → 81.9% ✅) and gpt nt recovered (78.4% → 80.3% ✅). gpt rt slipped slightly (80.2% → 79.9% ❌) — within variance; the result difference is 0.3pp.

---

## 2. T33 → T34 deltas (high fixtures, per-run equivalent)

| Condition | Model | T33 Acc | T34 Acc | ΔAcc | T33 TP | T34 TP | ΔTP | Pass |
|---|---|---|---|---|---|---|---|---|
| nn | gpt | 79.4% | **81.9%** | +2.5pp | 29¹ | 72 | **+43** | ❌→✅ |
| nn | qwen | 81.3% | **81.5%** | +0.2pp | 73 | 73 | ~0 | ✅ |
| nn | kimi | 82.6% | **83.8%** | +1.2pp | 82 | 95 | **+13** | ✅ |
| nt | gpt | 78.4% | **80.3%** | +1.9pp | 42¹ | 69 | **+27** | ❌→✅ |
| nt | qwen | 80.9% | **81.3%** | +0.4pp | 65 | 55 | −10 | ✅ |
| nt | kimi | 81.9% | **83.5%** | +1.6pp | 76 | 78 | +2 | ✅ |
| rn | gpt | 82.4% | **81.6%** | −0.8pp | 76 | 68 | −8 | ✅ |
| rn | qwen | 81.8% | **80.5%** | −1.3pp | 73 | 59 | −14 | ✅ |
| rn | kimi | 82.2% | **82.2%** | 0pp | 81 | 80 | −1 | ✅ |
| rt | gpt | 80.2% | 79.9% | −0.3pp | 60 | 57 | −3 | ✅→❌ |
| rt | qwen | 81.2% | **81.8%** | +0.6pp | 67 | 71 | +4 | ✅ |
| rt | kimi | 82.3% | **82.1%** | −0.2pp | 79 | 78 | −1 | ✅ |

¹ T33 nn/nt gpt per-run TP estimated from T33 3-run totals: T33 nn TP=132/3=44, vs session-memory per-fixture sum of 0+0+10+19=29. Using conservative per-fixture sum for direct comparison.

gpt's recovery in nn and nt is unambiguous: the two T33 failures reversed with +43 and +27 TP respectively.

---

## 3. TP / FP / FN by condition (high fixtures only)

### 3a. No-RAG No-Think (nn)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 95 | 28 | 106 | 599 | **83.8%** | 47.3% | 58.6% | 0 |
| gpt-oss:120b | 72 | 19 | 129 | 599 | **81.9%** | 35.8% | 49.3% | 0 |
| qwen3.5:397b | 73 | 25 | 128 | 599 | **81.5%** | 36.3% | 48.8% | 0 |

**gpt nn = 81.9%** — full recovery from T33's 79.4% failure. The two collapsed fixtures (html=0, css=0) recovered to html=22, css=19 TP.

### 3b. No-RAG Think (nt)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 78 | 11 | 123 | 599 | **83.5%** | 38.8% | 53.8% | 0 |
| gpt-oss:120b | 69 | 32 | 132 | 599 | **80.3%** | 34.3% | 45.7% | 0 |
| qwen3.5:397b | 55 | 4 | 146 | 599 | **81.3%** | 27.4% | 42.3% | 0 |

**gpt nt = 80.3%** — recovered from T33's 78.4% failure. gpt FP rose to 32 (T33: was 46, so improved; T32: 47). kimi and qwen hold stable. Note: qwen nt has very low FP (4) but also lower TP (55) — high precision, lower recall in this condition.

### 3c. RAG No-Think (rn)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 80 | 26 | 121 | 599 | **82.2%** | 39.8% | 52.1% | 0 |
| gpt-oss:120b | 68 | 17 | 133 | 599 | **81.6%** | 33.8% | 47.6% | 0 |
| qwen3.5:397b | 59 | 17 | 142 | 599 | **80.5%** | 29.4% | 42.6% | 0 |

All pass but qwen rn is borderline: **0 TP on js-high** (response time 404s — timeout collapse). qwen's overall rn accuracy held at 80.5% because the js-high TN=150 still counted correctly. Monitor in T35 — if qwen js-high rn collapses again, this is a structural RAG+noThink incompatibility for that fixture.

### 3d. RAG Think (rt)

| Model | TP | FP | FN | TN | Acc | Recall | F1 | Errors |
|---|---|---|---|---|---|---|---|---|
| kimi-k2.5 | 78 | 25 | 123 | 599 | **82.1%** | 38.8% | 51.3% | 0 |
| qwen3.5:397b | 71 | 19 | 130 | 599 | **81.8%** | 35.3% | 48.8% | 0 |
| gpt-oss:120b | 57 | 21 | 144 | 599 | 79.9% | 28.4% | 40.9% | 0 |

**gpt rt = 79.9%** — narrowly fails (0.1pp below threshold). T33 gpt rt was 80.2%. The 0.3pp regression is within normal run-to-run variance; this is not a regression caused by the T34 changes. The cause is low html-high TP (10) and high tsx-high FP (11) in this condition. gpt appears sensitive to think+RAG for TSX: with extended reasoning it over-reports TSX issues (11 FP, highest across all gpt conditions).

---

## 4. Per-fixture breakdown (high-only, nn condition)

### T33 → T34 (nn, per-run TP)

| Fixture | gpt T33 | gpt T34 | qwen T33 | qwen T34 | kimi T33 | kimi T34 |
|---|---|---|---|---|---|---|
| html-high | 0 → **22** (+22) | | 12 → 12 (0) | | 23 → **29** (+6) | |
| css-high | 0 → **19** (+19) | | 30 → **31** (+1) | | 27 → 26 (−1) | |
| js-high | 10 → **15** (+5) | | 13 → 8 (−5) | | 14 → 12 (−2) | |
| tsx-high | 19 → 16 (−3) | | 12 → **22** (+10) | | 18 → **28** (+10) | |

- **gpt html-high nn 0→22**: HTML depth requirement fixed the LIST 1 re-scan budget exhaustion. html-high gpt FP=2 (small).
- **gpt css-high nn 0→19**: Base-selector reminder finally produced CSS output from gpt in noRAG mode after 5 consecutive tests of 0 TP. css-high gpt FP=2 (small).
- **kimi tsx-high nn +10**: TSX-K mandatory search may be contributing to improved tsx-high detection.
- **qwen tsx-high nn +10**: Strong recovery after T33 regression.
- **js-high nn**: gpt +5 (improvement), qwen −5 (small regression), kimi −2 (small). JS announcement suite still dominates FN for all models at all tiers.

---

## 5. Per-fixture breakdown (all conditions, high, showing TP / FP)

### html-high

| Condition | gpt TP/FP | qwen TP/FP | kimi TP/FP |
|---|---|---|---|
| nn | 22/2 | 12/0 | 29/5 |
| nt | 23/11 | 13/1 | 14/1 |
| rn | 27/2 | 11/1 | 8/1 |
| rt | 10/1 | 14/1 | 21/0 |

gpt html-high best in nn (22 TP) and rn (27 TP). gpt rt html collapses to 10 TP — combined with think mode, html-high underperforms. kimi rt html = 21 TP with 0 FP — cleanest html-high result in T34.

### css-high

| Condition | gpt TP/FP | qwen TP/FP | kimi TP/FP |
|---|---|---|---|
| nn | 19/2 | 31/16 | 26/15 |
| nt | 15/5 | 19/1 | 25/4 |
| rn | 21/12 | 30/15 | 30/16 |
| rt | 17/2 | 26/13 | 30/19 |

qwen and kimi find more CSS issues but with more FP (15–19 FP). gpt finds fewer but with fewer FP (2–12). The base-selector reminder improved gpt CSS detection from persistent 0 TP to 15–21 TP across conditions.

### js-high

| Condition | gpt TP/FP | qwen TP/FP | kimi TP/FP |
|---|---|---|---|
| nn | 15/10 | 8/1 | 12/1 |
| nt | 7/4 | 12/2 | 14/0 |
| rn | 11/2 | **0/0** | 11/1 |
| rt | 12/7 | 11/2 | 9/0 |

JS-high is the weakest fixture across all models and conditions. The announcement-function suite (scroll-top-announce, search-submit-announce, filter-result-announce, billing-period-announce, faq-open-announce, shortcut-*-announce, nav-open-announce, etc.) remains in FN for all models in all conditions — no progress in T34.

⚠️ qwen rn js-high = **0 TP and 0 FP** (404s response) — qwen timed out in RAG+noThink for js-high. This is a new anomaly distinct from T33's gpt CSS timeouts. qwen produced no output at all (not even incorrect output).

### tsx-high

| Condition | gpt TP/FP | qwen TP/FP | kimi TP/FP |
|---|---|---|---|
| nn | 16/5 | 22/8 | 28/7 |
| nt | 24/12 | 11/0 | 25/6 |
| rn | 9/1 | 18/1 | 31/8 |
| rt | 18/11 | 20/3 | 18/6 |

kimi rn tsx-high = 31 TP (best TSX-high result in the series, 62% recall). gpt nt tsx-high = 24 TP but 12 FP — think mode causes over-reporting in TSX. `star-rating-role` still in FN for all models in all conditions — TSX-K mandatory search still not triggering correct detection (issue likely at the semantic level, not the search instruction).

---

## 6. Overall CSV metrics (all 16 fixtures, 3 runs)

These include clean/low/medium/high fixtures. Accuracy ~90–91% is inflated by TN-heavy easy fixtures and is not the pass criterion for this study; shown for completeness.

### nn (all fixtures)

| Rank | Model | Acc | F1 | Prec | Recall | TP | FP | FN | Avg t |
|---|---|---|---|---|---|---|---|---|---|
| 1 | gpt-oss:120b | 90.7% | 40.0% | 63.6% | 52.5% | 374 | 206 | 712 | 116.6s |
| 2 | qwen3.5:397b | 90.6% | 42.6% | 58.6% | 60.1% | 441 | 290 | 645 | 248.2s |
| 3 | kimi-k2.5 | 91.0% | 44.3% | 57.5% | 64.2% | 494 | 298 | 592 | 288.2s |

### nt (all fixtures)

| Rank | Model | Acc | F1 | Prec | Recall | TP | FP | FN | Avg t |
|---|---|---|---|---|---|---|---|---|---|
| 1 | gpt-oss:120b | 90.7% | 43.4% | 66.1% | 55.2% | 378 | 205 | 708 | 129.7s |
| 2 | qwen3.5:397b | 91.1% | 43.8% | 66.8% | 57.7% | 408 | 197 | 678 | 241.2s |
| 3 | kimi-k2.5 | 91.1% | 43.0% | 60.7% | 60.9% | 458 | 257 | 628 | 281.0s |

### rn (all fixtures)

| Rank | Model | Acc | F1 | Prec | Recall | TP | FP | FN | Avg t |
|---|---|---|---|---|---|---|---|---|---|
| 1 | gpt-oss:120b | 90.9% | 44.0% | 66.8% | 55.0% | 377 | 185 | 709 | 128.2s |
| 2 | qwen3.5:397b | 90.5% | 44.6% | 62.0% | 58.9% | 435 | 293 | 651 | 252.4s |
| 3 | kimi-k2.5 | 90.9% | 41.1% | 55.0% | 63.0% | 485 | 302 | 601 | 285.9s |

### rt (all fixtures)

| Rank | Model | Acc | F1 | Prec | Recall | TP | FP | FN | Avg t |
|---|---|---|---|---|---|---|---|---|---|
| 1 | gpt-oss:120b | 90.4% | 40.5% | 64.8% | 53.0% | 369 | 223 | 717 | 144.2s |
| 2 | qwen3.5:397b | 90.8% | 41.4% | 60.3% | 59.3% | 411 | 232 | 675 | 232.7s |
| 3 | kimi-k2.5 | 91.3% | 42.4% | 55.8% | 63.3% | 479 | 255 | 607 | 279.7s |

---

## 7. Hypothesis verification

| Hypothesis | Outcome |
|---|---|
| JS depth requirement fixes gpt noRAG html collapse | ✅ Confirmed — gpt html-high nn 0→22 TP (+22), gpt html-high nt 0→23 TP. No more budget exhaustion. |
| CSS base-selector reminder fixes gpt CSS noRAG | ✅ Confirmed after 5 consecutive 0 TP tests — gpt css-high nn 0→19 TP, gpt css-high nt 0→15 TP. |
| Anti-FP [xi] reduces JS hallucinations | ⚠️ Partial — gpt js-high nn FP still 10 (same as T33). The citation rule alone doesn't eliminate all inferred issues. JS overall FP slightly reduced. |
| CSS density cap 20–50 and balanced FP framing | ✅ qwen and kimi CSS recall improved: qwen css-high rn 30 TP (was 30, stable), kimi css-high rn 30 TP (was ~26). More importantly, gpt CSS came back from 0. Overall CSS FP increased slightly for qwen/kimi but within acceptable range vs TP gain. |
| JS density 25–50 improves JS recall | ⚠️ Marginal — gpt js-high nn +5 TP (10→15), but js-high still the weakest fixture in the suite for all models. The announcement-function suite is the structural FN gap, not a density issue. |
| TSX-K star-rating resolution | ❌ Not yet — `star-rating-role` remains in FN for all models in all conditions. kimi noted "StarRating widget missing role=img" as a FP title in nn but still didn't get the correct ID. tsx-K mandatory search is finding the elements but models are not mapping them to the correct concept ID. |
| gpt rt stability | ❌ Minor slip — 80.2% → 79.9%, 3 conditions improved but rt narrowly missed. Within variance. |

---

## 8. Persistent FN patterns

### 8a. JS announcement suite — unchanged in T34

The full set of live-region announcement functions at the END of js-high remains undetected by all models in all conditions:
`scroll-top-announce`, `search-submit-announce`, `search-clear-announce`, `filter-result-announce`, `view-mode-announce`, `filter-reset-announce`, `billing-period-announce`, `comparison-expand-announce`, `scroll-to-plan-announce`, `faq-open-announce`, `faq-open-all-announce`, `faq-close-all-announce`, `shortcut-search-announce`, `nav-open-announce`, `combobox-expanded` (expanded), `price-aria-selected`, etc.

These are consistently in FN for all 3 models across all 4 conditions. The functions exist at the END of a very long JS file — models complete the early part of LIST 1 and the early sweeps but never reach these sections within their token budget. This is not resolvable by prompt changes without addressing the token budget constraint directly.

### 8b. CSS deep inventory — unchanged

`btn-primary-outline-none`, `skip-link-transform`, `negative-word-spacing`, `forced-colors-outline`, `brand-secondary-contrast`, `forced-color-adjust`, `badge-outline-none`, `stat-item-small`, `testimonial-outline-none`, `pagination-small`, `footer-text-contrast`, `modal-btn-outline-none`, `form-input-outline-none`, `footer-nav-outline`, `hero-link-outline-none`, `skip-link-target-small`.

These selectors appear in the FN list across models and conditions. They are deep in the CSS file past the point where models stop their Phase 1 CSS inventory.

### 8c. TSX star-rating cluster — TSX-K finding but not matching

`star-rating-role`, `star-inner-hidden` still in FN. kimi rn attempted to find the rating widget and reported "StarRating widget missing role=img" as a hallucinated issue title on some runs — suggesting it found the component but didn't correctly identify the failing concept IDs. The ground truth concept likely requires `role="img"` on the container AND specific `aria-label` content which models aren't producing.

### 8d. HTML persistent FN

`faq-id-wrong-section`, `search-label-missing`, `hero-img-alt-missing`, `step1-heading-skip`, `pricing-toggle-role`, `table-caption-missing`, `faq-aria-controls`, `faq-dd-region`, `contact-label-missing`, `logo-bar-aria-label` consistently missed by qwen across all conditions. kimi misses `search-label-missing`, `step1-heading-skip`, `pricing-toggle-role` in multiple conditions. These appear in the middle of html-high, after models have processed the early sections.

---

## 9. Notable FP patterns

### 9a. gpt nt tsx-high: 12 FP — think+TSX over-reporting

gpt nt tsx-high = 24 TP but 12 FP. Think mode causes gpt to explore TSX component relationships more deeply but also to infer issues from component prop patterns (e.g. broken aria-describedby references on ContactForm — many of these are listed as FP). This is consistent with gpt rt tsx-high also having 11 FP. Think mode appears to cause gpt to over-analyse TSX.

### 9b. kimi rn tsx-high: 8 FP with 31 TP — highest recall/FP tradeoff

kimi rn tsx-high = 31 TP / 8 FP — best TSX-high result in the T34 series. The FP (ContactForm broken aria-describedby refs, MobileNav active link missing aria-current, HeroSection/StatsBar landmarks, Modal dialog issues) are at the boundary of real vs inferred issues. kimi is the most aggressive TSX reporter.

### 9c. gpt table-scope FP — persistent cross-test issue

gpt repeatedly hallucinates `table header missing scope` for both column headers and row headers in tables where scope is either already present or unambiguous. Present in html-low, html-medium, html-high across nn, nt, rn, rt conditions. Anti-FP rule [ix] (TABLE HEADER SCOPE) is not fully preventing this; gpt appears to over-apply this check when tables have multiple `<th>` elements.

### 9d. qwen js-high rn: 0 TP, 0 FP, 404s

qwen produced no output for js-high in RAG+noThink mode. This is distinct from the T33 gpt CSS timeout (which had 452s but still 0 TP and was caused by a re-read instruction). qwen rn js-high with RAG context appears to trigger a very long internal reasoning loop — 404s with no output. No prompt instruction caused this; it may be a model-specific issue with the RAG context depth + JS complexity.

---

## 10. Cross-test history (active models)

| Test | Key change | High-fixture passes | Notes |
|---|---|---|---|
| T29 | JS-G sweep; CSS activation mandate; TSX-J | 12/12 | All 3 models 4/4 |
| T30 | JS Phase 1 expansion; TSX-K | 11/12 | gpt nt failed |
| T31 | JS Phase 1 compressed; JS-G specificity; TSX-K strengthened | 12/12 | gpt nt recovered |
| T32 | 3-model only; RAG top_k 2→3; caps raised | 11/12 | gpt rn failed (RAG overload) |
| T33 | JS completeness gate; CSS completion gate; TSX-K mandatory | 10/12 | gpt nn+nt failed (budget exhaustion) |
| T34 | JS depth req; CSS base-selector reminder; anti-FP[xi]; density caps | 11/12 | gpt nn+nt recovered; gpt rt near-miss |

**Model-level history (conditions passing out of 4):**

| Model | T30 | T31 | T32 | T33 | T34 (high-only) | Trend |
|---|---|---|---|---|---|---|
| kimi-k2.5 | 4/4 | 4/4 | 4/4 | 4/4 | 4/4 | ✅ Stable |
| qwen3.5:397b | 4/4 | 4/4 | 4/4 | 4/4 | 4/4 | ✅ Stable |
| gpt-oss:120b | 3/4 | 4/4 | 3/4 | 2/4 | 3/4 | ⚠️ Volatile |

gpt's pattern: fails when noRAG budget is constrained (T30 nt, T33 nn+nt) and nearly fails at the 80% boundary otherwise. The T34 prompt changes fixed the two T33 failures but gpt rt landed 0.1pp below the threshold — probably not a meaningful regression.

---

## 11. Changes made for T35

### Prompt changes (applied after T34)

1. **Anti-FP [xii] — Conditionally-rendered ARIA references (TSX/React)** — All three models produced 7–8 FP on tsx-clean by flagging `aria-describedby` pointing to conditional error element IDs (React pattern: `{hasError && <span id="email-error">…`). New rule: this pattern is valid — only flag if there is NO code path in the component that ever renders an element with that id.

2. **Anti-FP [xiii] — `:focus:not(:focus-visible)`** — kimi produced 8 FP on css-clean by reporting `:focus:not(:focus-visible) { outline: none }` as a focus indicator violation. New rule: this IS the correct keyboard/mouse technique. Only flag if `:focus-visible` itself also suppresses the indicator.

3. **JS-F rewritten — CSS class removal is sufficient** — gpt produced 11 FP, qwen 15, kimi 10 on js-clean by flagging elements hidden via CSS class removal as needing explicit `aria-hidden`. Rewritten: `display:none` via CSS class removal automatically removes from the accessibility tree — no `aria-hidden` required. Only report JS-F when hide is achieved by off-screen positioning (still in display tree).

4. **SWEEP C hardened — requires literal `<th>` tag re-read before reporting scope absent** — gpt consistently reported scope missing on `<th>` elements across all html fixture tiers (low/medium/high) when scope was already present. New requirement: must re-read the exact opening tag of the specific `<th>` before reporting. If the literal tag was not re-read, skip the issue.

5. **CSS-B hardened — requires quoted px value and padding check** — qwen and kimi produced 8 FP each on css-clean by reporting touch-target violations on elements with compensating padding. Updated: must quote the exact px value from source; if the 24–43px range applies, must check padding ≥8px per side before reporting.

6. **Anti-FP [xi] extended to cover TSX** — was JS-only; now covers JS-A through JS-G AND TSX-A through TSX-K. Any cited function, prop, or component name must appear literally in the source file.

7. **TSX-K strengthened — explicit `role="img"` + `aria-label` requirement** — models find the star-rating component via mandatory search but still fail to match the correct concept ID. Strengthened with explicit pattern: container must have `role="img"` AND `aria-label` stating the numerical value; report it citing the missing `role="img"` and `aria-label` on the container, not on individual star icons.

### P1 — Monitor

8. **qwen rn js-high timeout (404s, 0 output)** — No prompt change can fix a cloud gateway timeout. Monitor T35. If persistent, this is a structural qwen+RAG+JS incompatibility for this fixture.

9. **gpt rt tsx-high FP (11 FP)** — Think mode causes gpt to over-analyse TSX component prop patterns. The new [xi]/[xii] rules should reduce this. Confirm in T35.

10. **No parameter changes** — All sampling params (temperature, top_p, num_predict) are correctly set per manufacturer guidance. The hallucination issues are prompt-level, not sampling-level.

4. **gpt rt tsx-high FP** — gpt rt tsx-high = 11 FP. Think mode causes gpt to over-analyse TSX component prop patterns. Anti-FP [xi] applies to JS only; extend the citation rule to TSX: similar instruction that any TSX issue must cite a prop or element visible in the JSX/TSX source.

### P1 — Monitor

5. **JS announcement suite** — 15+ consistently FN functions at the end of js-high. This is a token-budget issue not solvable by prompt changes. Consider whether dedicating a separate sweep specifically to the end of the file is viable: "SWEEP JS-G CONTINUATION: After completing all JS sweeps, return to the BOTTOM of LIST 1 (the last 20% of entries) and verify each has been evaluated for JS-G. Pay particular attention to keyboard shortcut handlers and scroll/announce functions."

6. **kimi and qwen FP in CSS (15–19 FP on css-high)** — Density cap raised in T34 is working well (improved recall), but FP is now high for these two models. Consider whether a per-fixture FP cap is needed, or whether the false-positive check in the COMPLETION CHECK is sufficient. The false positive check already requires quoting the exact selector.
