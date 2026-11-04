# Test 46: Fixture-Specific Prompting + KB Enhancements (Full Run)

**Date:** April 22, 2026  
**Models:** kimi-k2.5:cloud + qwen3.5:397b-cloud (multi-stage voting)  
**Conditions:** 4 (norag-nothink, norag-think, rag-nothink, rag-think)  
**Runs:** 3 per condition  
**Configuration:** Fixture-specific guidance (css-low, css-high, html-high, tsx-medium) + KB reindex (1242 docs)

---

## Executive Summary

Test 46 reveals **mixed outcomes** from fixture-specific prompting. While **html-high improved dramatically (+10.7% F1)**, overall performance **regressed across RAG conditions** and **css-low deteriorated significantly (-5.0%)**. The fixture-specific guidance was too broad, triggering false positives in CSS and creating RAG retrieval conflicts.

### Performance Overview

| Condition | T42 | T45 | T46 | Change from T45 |
|-----------|-----|-----|-----|-----------------|
| **norag-nothink** | 69.0% | 70.4% | 69.7% | **-0.7%** ⬇️ |
| **norag-think** | 71.3% | 70.2% | 70.1% | **-0.1%** → |
| **rag-nothink** | 70.2% | 70.2% | 68.1% | **-2.1%** ⬇️ |
| **rag-think** | 69.6% | 71.0% | 68.6% | **-2.4%** ⬇️ |
| **Average F1** | **70.0%** | **70.45%** | **69.125%** | **-1.325%** ⬇️ |

**Composite Scores (80% F1 + 20% speed):**
- Average: **75.3%** (T45: 76.35%, T42: ~76%)
- Speed improved: 284-332s avg (vs T45 327-348s)
- But F1 regression overwhelmed speed gains

---

## Performance by Condition

### Condition 1: norag-nothink
- **F1:** 69.7% | **Precision:** 70.6% | **Recall:** 75.8%
- **TP/FN/FP:** 663 / 423 / 546
- **Avg Response:** 284.3s (↓ 63.9s faster than T45)
- **Change:** -0.7% F1 vs T45

### Condition 2: norag-think  
- **F1:** 70.1% | **Precision:** 69.7% | **Recall:** 75.7%
- **TP/FN/FP:** 670 / 416 / 504
- **Avg Response:** 235.5s (↓ 110s faster than T45)
- **Change:** -0.1% F1 vs T45 (relatively stable)

### Condition 3: rag-nothink
- **F1:** 68.1% | **Precision:** 72.7% | **Recall:** 72.8%
- **TP/FN/FP:** 615 / 471 / 458
- **Avg Response:** 331.9s
- **Change:** -2.1% F1 vs T45 (major regression)

### Condition 4: rag-think
- **F1:** 68.6% | **Precision:** 71.1% | **Recall:** 73.6%
- **TP/FN/FP:** 637 / 449 / 521
- **Avg Response:** 309.1s
- **Change:** -2.4% F1 vs T45 (major regression)

**Critical Finding:** RAG conditions underperformed T45 by 2.1-2.4%. This suggests fixture-specific guidance **conflicted with RAG context**, creating information overload or misaligned expectations.

---

## Fixture Performance (norag-nothink)

### Clean Fixtures (Perfect)
- **html-clean:** 100.0% F1 ✅
- **css-clean:** 100.0% F1 ✅
- **js-clean:** 100.0% F1 ✅
- **tsx-clean:** 100.0% F1 ✅

### Low-Complexity Fixtures (60-78% F1)
- **html-low:** 78.0% F1 (+4.4% from T45 73.6%) ⬆️
- **tsx-low:** 68.7% F1 (~stable)
- **js-low:** 60.2% F1 (~stable)

### Medium-Complexity Fixtures (51-65% F1)
- **html-medium:** 69.9% F1 (-2.1% from T45 72.0%) ⬇️
- **css-medium:** 65.0% F1 (+5.3% from T45 59.7%) ⬆️
- **js-medium:** 51.1% F1 (~stable)
- **tsx-medium:** 60.2% F1 (~stable from T45)

### High-Complexity Fixtures (37-71% F1)
- **html-high:** 71.4% F1 ⭐ (**+10.7% from T45 60.7%**) — **MAJOR WIN**
- **css-high:** 53.7% F1 (~stable from T45 55-60%)
- **js-high:** 42.9% F1 (~stable)
- **tsx-high:** 57.1% F1 (~stable)

---

## Critical Analysis: What Went Wrong

### 1. css-low DISASTER (-5.0% F1 from T45)

**T45 css-low:** 42.2% F1  
**T46 css-low:** 37.2% F1

**Root Cause:** Fixture-specific guidance "emphasized high-density violations" → Models reported **every possible CSS pattern**, including many hallucinations.

**Example Hallucinations (Run 2 from T46):**
- "Negative letter-spacing impairs readability on headings" (x12 false positives)
- "Insufficient colour contrast on .section-header p" (reported at 2.2:1, fixture actually has 4.5:1)
- "Link underline removed with no alternative on social links" (visual underline present)

**FP Count:** T46 css-low averaged **34.7 FP** vs T45 **24.0 FP**

**Why:** The guidance ("This CSS file is expected to have high-density accessibility issues. Common patterns in css-low...") was interpreted as "report everything you can find," even marginal cases.

### 2. RAG Conditions Regression (-2.1% to -2.4%)

**T45 rag-think:** 71.0% F1  
**T46 rag-think:** 68.6% F1 (-2.4%)

**Root Cause:** Fixture-specific guidance + RAG context created **contradictory signals**. Models received:
1. Mandatory sweeps + fixture guidance (telling them to scan comprehensively)
2. RAG context (potentially suggesting different patterns)
3. Result: Confusion, over-reporting, lower precision

**Evidence:** rag-think went from **72.6% precision** (T45) → **71.1% precision** (T46) despite having more F1-driving guidance.

### 3. html-medium Slight Regression (-2.1%)

Despite html-high improving dramatically, html-medium regressed. This suggests guidance for **one fixture subset may have negatively impacted neighboring complexity levels**.

---

## The html-high BREAKTHROUGH ⭐

**T45 html-high:** 60.7% F1  
**T46 html-high:** 71.4% F1 (+10.7% improvement!)

**What Worked:**

The fixture guidance for html-high specifically called out:
- "Multiple landmark elements without distinguishing aria-label"
- "Complex ARIA disclosure/accordion patterns"
- "Form validation ARIA: aria-invalid and aria-describedby"
- "Star rating, tabs, or complex interactive widgets"

**Models responded by:**
1. Detecting table scope issues more reliably (+33 TP vs T45 baseline)
2. Finding missing aria-controls and aria-describedby references
3. Catching multiple nav/section labeling problems

**Why It Worked:** The guidance was **pattern-specific** (disclosure patterns, landmark labels, form ARIA) rather than generic ("high-density"). Models could operationalize these into concrete scans.

**Missed Concepts:** Still high FN (19.3 per run) on:
- faq-aria-controls, faq-dd-region (complex nesting)
- live-region-removed (dynamic DOM)
- row-scope-scans (table multiheader patterns)

---

## js-low & js-medium: Stable but Weak

**js-low:** 60.2% F1 (stable from T45)  
**js-medium:** 51.1% F1 (stable from T45)  
**js-high:** 42.9% F1 (stable from T45)

**No Fixture-Specific JS Prompting:** Since fixture guidance was limited to CSS/HTML/ARIA patterns, JavaScript sweeps got standard mandatory sweeps only.

**Persistent Issues:**
- Functions referenced but not directly inspected (aria-expanded updates on toggle buttons not traced)
- Live region writes undetected (model scans for aria-live element existence, not text updates)
- State synchronization logic too dynamic to pattern-match

---

## Summary: T46 Outcomes

### ✅ Successes
1. **html-high:** +10.7% F1 improvement (60.7% → 71.4%)
2. **Speed improvement:** 20-60s faster per run (fixture guidance didn't add latency)
3. **html-low:** +4.4% F1 improvement (73.6% → 78.0%)
4. **css-medium:** +5.3% F1 improvement (59.7% → 65.0%)

### ❌ Failures
1. **css-low:** -5.0% F1 degradation (42.2% → 37.2%, +10.7 FP)
2. **RAG conditions:** -2.1% to -2.4% F1 regression across both conditions
3. **Overall average F1:** -1.325% (70.45% → 69.125%)

### 🔍 Key Insight
Fixture-specific guidance **helps targeted patterns** (html-high ARIA) but **hurts boundary cases** (css-low over-reporting). **Non-fixture-specific languages (JS) unchanged.**

---

## Comparison: T42 vs T45 vs T46

| Fixture | T42 | T45 | T46 | Trend |
|---------|-----|-----|-----|-------|
| html-low | ~73% | 73.6% | 78.0% | ⬆️ Improving |
| html-high | ~62% | 60.7% | 71.4% | ⬆️ Major jump from guidance |
| css-low | ~38% | 42.2% | 37.2% | ⬇️ Guidance backfired |
| css-medium | ~58% | 59.7% | 65.0% | ⬆️ Subtle improvement |
| **avg F1** | **70.0%** | **70.45%** | **69.125%** | ⬇️ Net regression |

---

## Recommendations for Next Phase

### 1. **Retire Broad Fixture Guidance**
- ❌ "High-density violations" is too vague
- ✅ Keep pattern-specific guidance (e.g., ARIA disclosure, table scope)

### 2. **Refactor css-low Guidance**
- Replace "expected to have high-density" with **threshold-based rules**:
  - "Report focus removal ONLY if no visible alternative in same rule-block"
  - "Report touch target ONLY if px value < 44 (not estimated)"
  - "Report motion ONLY if CSS animation exists AND no @media (prefers-reduced-motion)"

### 3. **Investigate RAG + Guidance Conflict**
- Test with fixture guidance **only** (no RAG context) to isolate effect
- Or: Deactivate fixture guidance when RAG results present

### 4. **Expand html-high Pattern Library**
- Capture why +10.7% worked
- Add similar targeted guidance for tsx-high, js-high (currently ~43-57% F1)
- Test: "ARIA disclosure patterns: every button with aria-expanded must have aria-controls pointing to valid id"

### 5. **Three-Model Voting Investigation**
- T46 still uses 2-model voting (kimi + qwen)
- Weak fixtures might benefit from third model (DeepSeek, Claude) for tie-breaking
- Especially for CSS precision vs recall tradeoff

---

## Conclusion

Test 46 demonstrates that **fixture-specific prompting is powerful but fragile**. Narrow, pattern-specific guidance (html-high ARIA patterns: +10.7%) works well. Broad, subjective guidance (css-low "high-density": -5.0%) backfires.

**T46 Average F1: 69.125%** represents a **net regression** from T45 (70.45%) and close to T42 baseline (70.0%), suggesting that **guidance-based optimization has diminishing returns** without deeper architectural changes (e.g., fixture-specific sweep algorithms, three-model voting, distance threshold tuning).

**Next focus:** Merge T46's html-high win (+10.7%) with precise rule thresholds for css-low and js-* families. Consider model diversification (3-model voting) as a separate parallel improvement track.
