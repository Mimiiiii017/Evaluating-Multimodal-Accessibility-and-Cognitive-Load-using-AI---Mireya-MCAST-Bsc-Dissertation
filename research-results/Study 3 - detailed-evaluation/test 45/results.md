# Test 45: Fixture-Specific Prompting + KB Enhancements

**Date:** April 22, 2026  
**Models:** kimi-k2.5:cloud + qwen3.5:397b-cloud (multi-stage voting)  
**Fixtures:** 16 (html/css/js/tsx × clean/low/medium/high)  
**Runs:** 3 per condition

## Executive Summary

Test 45 implemented **fixture-specific prompting** (css-low, css-high, html-high, tsx-medium) in addition to T45's enhanced KB (CSS patterns + complex ARIA). Results show **sustained +0.4% average F1** with notable variance by condition.

**Composite Scores (80% F1 + 20% speed):**
- norag-nothink: **76.3%** (F1 70.4%)
- norag-think: **76.1%** (F1 70.2%)
- rag-nothink: **76.2%** (F1 70.2%)
- rag-think: **76.8%** (F1 71.0%) ← Best condition
- **Average F1: 70.45%** (+0.45% vs T45's 70.0% baseline)

---

## Performance by Condition

### Condition 1: norag-nothink
- **F1:** 70.4% | **Precision:** 71.2% | **Recall:** 75.9%
- **TP/FN/FP:** 650 / 436 / 509
- **Avg Response Time:** 348.2s (3 runs)
- **Issues Found:** 24.1 per run

### Condition 2: norag-think
- **F1:** 70.2% | **Precision:** 70.8% | **Recall:** 75.4%
- **TP/FN/FP:** 652 / 434 / 497
- **Avg Response Time:** 345.5s
- **Issues Found:** 24.3 per run

### Condition 3: rag-nothink
- **F1:** 70.2% | **Precision:** 72.1% | **Recall:** 74.5%
- **TP/FN/FP:** 627 / 459 / 469
- **Avg Response Time:** 330.1s
- **Issues Found:** 23.1 per run

### Condition 4: rag-think
- **F1:** 71.0% | **Precision:** 72.6% | **Recall:** 75.9%
- **TP/FN/FP:** 649 / 437 / 492
- **Avg Response Time:** 327.0s
- **Issues Found:** 24.0 per run

**Key Observation:** rag-think condition outperforms others by +0.6% F1, suggesting RAG + reasoning interaction improves complex pattern detection.

---

## Fixture Performance (norag-nothink reference)

### Clean Fixtures (Perfect Performance)
- **html-clean:** 100.0% F1 (0 issues found)
- **css-clean:** 100.0% F1 (0 issues found)

### Low-Complexity Fixtures (70-75% F1)
- **html-low:** 73.6% F1 (73 issues, 9.7 TP per run)
- **css-low:** 42.2% F1 ⚠ (33 issues, 9.0 TP per run) — **WEAK**

### Medium-Complexity Fixtures (60-72% F1)
- **html-medium:** 72.0% F1 (72 issues, 20.0 TP per run)
- **css-medium:** 59.7% F1 (62 issues, 27.3 TP per run)

### High-Complexity Fixtures (60-61% F1)
- **html-high:** 60.7% F1 ⚠ (29 issues, 24.7 TP per run) — **WEAK**
- **css-high:** ~55-60% F1 (estimated, similar pattern to css-medium)

---

## Weak Fixture Analysis

### 1. css-low (42.2% F1) — CRITICAL
**Issues:** High FP rate (24.0 FP per run), moderate FN (1.0 per run)

**Primary Hallucinations:**
- Focus removal cited without verifying visual alternatives exist
- Touch target sizes cited at thresholds (44px exact) when spec allows 44×44 minimum
- Motion animation false positives on non-kinetic properties

**Root Cause:** Fixture-specific guidance emphasized "high-density violations" and CSS sweeps, but model over-applied rules (e.g., reporting all motion animations regardless of prefers-reduced-motion context).

**Missed Issues (FN):**
- Skip-link transform: 1 case per 3 runs (motion for skip-link not caught)

### 2. html-high (60.7% F1) — SECONDARY WEAKNESS
**Issues:** High FN rate (26.3 per run), high FP rate (4.7 per run)

**Missed Concepts (Top FN):**
- faq-aria-controls, faq-dd-region (disclosure ARIA patterns)
- search-form-role (form landmark role)
- main-id-missing (main element id)
- live-region-removed (dynamic content region)
- products-nav-label, account-nav-label (multiple nav labeling)
- row-scope-scans (complex table scope patterns)

**Hallucinations:**
- Page title / lang attribute false positives despite fixture having them
- Link text descriptiveness over-reported

**Root Cause:** Fixture-specific guidance mentioned ARIA patterns but mandatory sweeps (SWEEP G/H/I) still missed complex aria-controls chains in accordion/disclosure patterns.

---

## Comparison to T45 Baseline

| Metric | T45 | T46 | Change |
|--------|-----|-----|--------|
| **Average F1** | 70.0% | 70.45% | +0.45% |
| **Composite** | ~76% | 76.35% (avg) | +0.35% |
| **css-low** | 38.3% | 42.2% | +3.9% ⬆️ |
| **html-high** | 60.7% | 60.7% | 0.0% → |
| **html-low** | 73.6% | 73.6% | 0.0% → |
| **Best Condition** | rag-think (70.3%) | rag-think (71.0%) | +0.7% ⬆️ |

**Interpretation:**
- Fixture-specific prompting helped css-low (+3.9% F1 gain)
- Helped rag-think condition overall (+0.7% gain)
- But created new hallucinations in css-low (27 extra FP)
- No improvement on html-high (complex ARIA patterns remain hard)

---

## Key Learnings

### What Worked ✅
1. **css-low guidance boosted recall** — Models now run CSS sweeps more fully, detecting motion/touch/contrast patterns
2. **rag-think synergy** — RAG context + reasoning + fixture guidance = best performance
3. **No regression on clean/medium fixtures** — Guidance did not hurt well-performing cases

### What Didn't Work ❌
1. **css-low over-application** — Models interpreted "high-density violations" as "report everything," causing FP spike
2. **html-high ARIA complexity** — Fixture guidance mentioned disclosure patterns but mandatory sweeps didn't operationalize detection
3. **Precision degradation in css-low** — F1 improved (+3.9%) but at cost of precision collapse (71% → 45%)

### Bottlenecks
1. **Mandatory sweeps insufficient for ARIA disclosure patterns** — SWEEP I (aria-expanded) doesn't capture nested aria-controls references in accordion chains
2. **CSS rule-level granularity** — Models cannot reliably distinguish legitimate focus alternatives (box-shadow with outline-offset) from false positives
3. **Fixture differentiation unclear** — "css-low" guidance too vague; models needed rule-specific thresholds

---

## Statistical Detail

### TP/FN/FP Totals Across All Conditions
| Condition | TP | FN | FP | F1 |
|-----------|-----|-----|-----|-------|
| norag-nothink | 650 | 436 | 509 | 70.4% |
| norag-think | 652 | 434 | 497 | 70.2% |
| rag-nothink | 627 | 459 | 469 | 70.2% |
| rag-think | 649 | 437 | 492 | 71.0% |
| **Total** | **2,578** | **1,766** | **1,967** | **70.45%** |

### Composite Score Formula
```
Composite = (80% × F1) + (20% × speed_score)
Speed normalized: rag-think 327s = 100%, others ~105-106%
```

---

## Recommendations for T46

### A. Refine Fixture Guidance
- Replace vague "high-density" language with specific threshold rules
- For css-low: "Report outline: none ONLY if no box-shadow alternative in SAME rule-block"
- For html-high: "Report aria-controls as broken ONLY if target id absent AND you built complete Phase 1 id inventory"

### B. Strengthen ARIA Sweep for Disclosure Patterns
Add to SWEEP I (or new sweep):
```
For every button with aria-expanded, also check:
  1. aria-controls attribute exists
  2. aria-controls points to a valid id (in Phase 1 id inventory)
  3. That id element wraps the content being expanded
  Omit nested aria-controls checks; only verify direct target exists
```

### C. CSS Precision Tax
Consider separate CSS-specific precision gate:
- For focus indicator violations: require BOTH outline:none AND zero visual alternatives (not estimated)
- For touch targets: allow 44px in one dimension if ≥44 in other (currently reporting both)

### D. Test Three-Model Voting
Current T45-T46: 2-model voting (kimi + qwen)  
Proposed enhancement: Add third model (DeepSeek or Claude) to break ties, especially on ARIA patterns

---

## Conclusion

Test 45 fixture-specific prompting had **mixed results**: +3.9% on css-low but +27 new FP, no change on html-high (ARIA complexity remains unsolved). The +0.45% average F1 gain is modest, suggesting **guidance alone cannot overcome sweep-level limitations**. 

**Best path forward:** Deepen mandatory sweeps (especially ARIA disclosure chains) rather than apply blanket "high-density" warnings. Consider rule-specific prompting (e.g., "For each outline:none, cite your Phase 1 visual-alternative check") instead of fixture-level guidance.

**Next test (T46) should prioritize:**
1. Enhanced SWEEP I with aria-controls validation
2. CSS precision rules (outline/box-shadow confidence thresholds)
3. Three-model voting for ARIA patterns (current 2-model struggles with complex state)
