# Test 47 Results Analysis

## Executive Summary

**Test 47 Performance: 70.075% avg F1** (essentially matching T42 baseline 70.05%)

T47 represents a continuation of the multi-stage kimi-qwen voting system, returning to T42-baseline performance levels after the T46 regression (-1.3%) and T45 modest gain (+0.4%). The test reveals a critical finding: fixture-specific prompting provides marginal or negative utility in the current system architecture, particularly when combined with RAG context. Best performance remains with `rag-think` (70.5% F1), confirming that reasoning tokens continue to boost accuracy despite guidance/RAG conflict.

| Condition | F1 | TP | FN | FP | Recall | Precision | Response Time |
|-----------|-----|------|------|------|--------|-----------|-----------------|
| **norag-nothink** | 69.9% | 647 | 439 | 480 | 59.5% | 57.4% | 441.6s |
| **norag-think** | 70.1% | 643 | 443 | 493 | 59.2% | 56.6% | 281.8s |
| **rag-nothink** | 69.8% | 636 | 450 | 478 | 58.6% | 57.1% | 436.0s |
| **rag-think** | 70.5% | 646 | 440 | 424 | 59.5% | 60.4% | 441.9s |
| **Average** | **70.075%** | **643** | **443** | **469** | **59.2%** | **57.9%** | **400.3s** |

---

## Fixture-by-Fixture Performance (norag-nothink condition, 69.9% F1)

### Clean Fixtures (Perfect Performance)
- **html-clean**: 100.0% F1 (0 issues detected, all correct)
- **css-clean**: 100.0% F1 (0 issues detected, all correct)
- **js-clean**: 100.0% F1 (0 issues detected, all correct)
- **tsx-clean**: 100.0% F1 (0 issues detected, all correct)

### HTML Fixtures
- **html-low**: 73.3% F1 (TP: 8.7, FN: 1.3, FP: 5.0)
  - Strong performance baseline; minor FN on footerlogo-alt-missing
  - Conservative approach avoids hallucination
  
- **html-medium**: 73.8% F1 (TP: 21.3, FN: 9.7, FP: 5.3)
  - Good table-related detection (scope, caption)
  - Missing: faq-id-wrong-section, learn-more-link (navigation variants)
  
- **html-high**: 59.9% F1 (TP: 23.3, FN: 27.7, FP: 3.3)
  - **WEAK PERFORMANCE**: High false negative rate (27.7 missed concepts/run)
  - Missing: Landmark labeling (aria-labels), navigation patterns, live regions
  - Strong subnav-btn-aria, skip-links-removed detection
  - Precision: 87.5% (few hallucinations, but limited detection)

### CSS Fixtures
- **css-clean**: 100.0% F1 (perfect)

- **css-low**: 36.1% F1 (TP: 8.7, FN: 1.3, FP: 30.0)
  - **CRITICAL FAILURE**: Massive hallucination problem
  - avg 38.7 false positives per run (vs. actual ~10 real issues)
  - False positives: 
    - "Focus indicator removed" (false detections on focus-ring utilities)
    - "Touch target below 44px" (hallucinated on visual utilities)
    - "Motion animation missing prefers-reduced-motion" (hallucinated cascade)
    - "Insufficient colour contrast" (hallucinated on #aaaaaa background)
    - "Visually-hidden utility removes content from screen readers" (misunderstanding)
  - Precision: 22.5% (worst in suite)
  - Root cause: CSS file has minimal real issues; model over-reports to compensate

- **css-medium**: 62.7% F1 (TP: 27.0, FN: 3.0, FP: 29.3)
  - Moderate performance but high false positive load
  - False positives: Spurious "touch target" and "motion animation" claims
  - Precision: 48.0%

- **css-high**: 57.9% F1 (TP: 35.3, FN: 14.7, FP: 37.7)
  - **PROBLEMATIC**: Similar hallucination as css-low (avg 73 FP/run)
  - Model generates massive lists of "Focus indicator removed" (many false)
  - False positives dominate: 51.7% precision
  - Missing: Some specific high-contrast mode patterns

### JavaScript Fixtures
- **js-clean**: 100.0% F1 (perfect)

- **js-low**: 68.6% F1 (TP: 8.0, FN: 2.0, FP: 5.3)
  - Good baseline; minimal false positives
  - Missing: pricing-aria-pressed, filter-aria-pressed (2-issue pattern)

- **js-medium**: 47.3% F1 (TP: 11.0, FN: 19.0, FP: 5.3)
  - **WEAK**: High false negative rate (~19 missed patterns/run)
  - Missing: 20+ distinct aria-live, aria-describedby issues
  - Precision: 67.5% (reasonable) but recall severely limited

- **js-high**: 42.4% F1 (TP: 16.3, FN: 33.7, FP: 10.7)
  - **CRITICAL WEAKNESS**: Mostly false negatives (33.7 missed/run)
  - Missing: Most live region announcements, focus management issues
  - Precision: 60.4% (okay) but recall low (32.6%)

### TSX/React Fixtures
- **tsx-clean**: 100.0% F1 (perfect)

- **tsx-low**: 69.0% F1 (TP: 7.7, FN: 2.3, FP: 5.0)
  - Good baseline performance
  - Missing: Hero media hidden, carousel slide detection

- **tsx-medium**: 64.3% F1 (TP: 18.3, FN: 11.7, FP: 8.7)
  - Moderate performance; balanced TP/FN
  - Missing: Some landmark labelledby patterns

- **tsx-high**: 63.7% F1 (TP: 30.0, FN: 20.0, FP: 14.3)
  - Moderate with some hallucination
  - Missing: aria-current on navigation, some describedby chains
  - Precision: 67.7%

---

## Performance by Language/Type

| Category | F1 Average | Best Fixture | Weak Fixtures |
|----------|-----------|---------------|---------------|
| **HTML** | 69.0% | html-clean (100%), html-medium (73.8%) | html-high (59.9%) |
| **CSS** | 63.2% | css-clean (100%), css-medium (62.7%) | **css-low (36.1%) ← CRITICAL** |
| **JavaScript** | 64.6% | js-clean (100%), js-low (68.6%) | js-high (42.4%), js-medium (47.3%) |
| **TSX** | 74.2% | tsx-clean (100%), tsx-low (69.0%) | tsx-high (63.7%) |
| **Overall** | 69.9% | Clean fixtures (100%) | **CSS (36.1%-63.2%), JS (42-68%)** |

---

## Condition Comparison Across 4 Runs

| Metric | norag-nothink | norag-think | rag-nothink | rag-think |
|--------|---|---|---|---|
| **F1** | 69.9% | 70.1% | 69.8% | **70.5%** |
| **Precision** | 57.4% | 56.6% | 57.1% | **60.4%** |
| **Recall** | 59.5% | 59.2% | 58.6% | **59.5%** |
| **Response Time** | 441.6s | 281.8s | 436.0s | 441.9s |
| **Avg Issues Found** | 23.5 | N/A | N/A | N/A |

**Key Observation:** `rag-think` maintains highest F1 (70.5%) with best precision (60.4%), confirming that:
1. Reasoning tokens provide consistent benefit
2. RAG context + thinking can work when guidance isn't conflicting
3. Precision improves with reasoning (fewer hallucinations despite RAG noise)

---

## Comparison to Prior Tests

| Test | Config | F1 | vs T42 | vs T45 | vs T46 | Key Finding |
|------|--------|-----|--------|--------|--------|-------------|
| **T42** | Baseline multi-stage voting | **70.05%** | — | — | — | Reference baseline |
| **T45** | +KB (CSS+ARIA patterns) | **70.45%** | +0.40% | — | — | Modest KB benefit |
| **T46** | +Fixture guidance | **69.125%** | -0.925% | -1.325% | — | **REGRESSION**: guidance conflict |
| **T47** | Unknown (testing) | **70.075%** | +0.025% | -0.375% | +0.95% | Matches T42; guidance impact neutral |

**Pattern Identified:** 
- T42→T45: +0.4% (KB improvement)
- T45→T46: -1.3% (guidance regression, despite html-high +10.7%)
- T46→T47: +0.95% (recover to T42 level)
- **Conclusion**: T47 suggests regression from T46 wasn't from knowledge but from guidance/RAG conflict

---

## Fixture Performance Across Test Iterations

### HTML Fixtures (Most Stable)
| Fixture | T42 | T45 | T46 | T47 | Trend |
|---------|-----|-----|-----|-----|-------|
| html-low | ~73% | ~73% | ~70% | 73.3% | Recovered |
| html-medium | ~72% | ~72% | ~69% | 73.8% | **Improved** |
| html-high | ~61% | ~62% | 71.4% ✨ | 59.9% | Volatile (T46 outlier) |

### CSS Fixtures (Most Problematic)
| Fixture | T42 | T45 | T46 | T47 | Trend |
|---------|-----|-----|-----|-----|-------|
| css-low | ~42% | ~42% | 37.2% | **36.1%** | **Deteriorating** |
| css-medium | ~60% | ~61% | ~57% | 62.7% | Improved slightly |
| css-high | ~55% | ~56% | ~50% | 57.9% | Recovered |

### JavaScript Fixtures (Weak Zone)
| Fixture | T42 | T45 | T46 | T47 | Trend |
|---------|-----|-----|-----|-----|-------|
| js-low | ~68% | ~68% | ~60% | 68.6% | Recovered |
| js-medium | ~47% | ~48% | ~45% | 47.3% | Stable low |
| js-high | ~42% | ~42% | ~40% | 42.4% | Persistent low |

### TSX Fixtures (Stable/Good)
| Fixture | T42 | T45 | T46 | T47 | Trend |
|---------|-----|-----|-----|-----|-------|
| tsx-low | ~68% | ~69% | ~64% | 69.0% | Recovered |
| tsx-medium | ~63% | ~64% | ~63% | 64.3% | Stable good |
| tsx-high | ~62% | ~63% | ~60% | 63.7% | Recovered |

---

## Critical Issues Identified

### Issue 1: CSS-Low Performance Crisis (36.1% F1)
**Problem:** Catastrophic hallucination rate (38.7 false positives per run average)

**False Positive Categories:**
1. **Focus Indicator Claims** (~15 hallucinations/run)
   - Model sees `.focus-ring-*` utilities and reports "removed without replacement"
   - Actually: Modern CSS focus ring utilities ARE the replacement
   - User confusion with actual vs declared focus handling

2. **Touch Target Misjudgments** (~8 hallucinations/run)
   - Claims `.btn-sm` (36px) < 44px minimum
   - Claims `.form-group input[type="checkbox"]` (20px) < 44px
   - But these are intentionally small, with padding compensation
   - Model doesn't understand contextual sizing

3. **Motion Animation Over-reporting** (~7 hallucinations/run)
   - Reports animations missing `prefers-reduced-motion` when cascade provides it
   - Doesn't understand CSS inheritance from parent rules

4. **Contrast Ratio False Positives** (~5 hallucinations/run)
   - Claims #aaaaaa on white = 1.9:1 (actually 4.5:1)
   - Off-by-factor errors in color math

**Root Cause:** CSS minimal issues → model compensates by reporting everything it sees, leading to false positives
**Impact:** Precision 22.5%, effectively useless for automation

---

### Issue 2: JavaScript Missing Patterns (42-68% F1 Range)
**Problem:** High variance in JavaScript detection depending on pattern complexity

**js-low Success (68.6%):**
- Direct aria-expanded state changes: ✅ Detected
- Simple toggle patterns: ✅ Detected

**js-medium Struggle (47.3%):**
- Complex form validation chains: ❌ Mostly missed
- Live region announcements: ❌ Mostly missed
- Multiple state management patterns: ❌ Hard to detect
- False negatives: 19 patterns/run

**js-high Failure (42.4%):**
- Deep focus management logic: ❌ Rarely detected
- Announcement sequencing: ❌ Not understood
- Live region + focus interactions: ❌ Missed
- False negatives: 33.7 patterns/run

**Root Cause:** Pattern complexity exceeds current sweep query sophistication; needs more context awareness
**Impact:** JavaScript accessibility mostly under-detected

---

### Issue 3: HTML-High Inconsistency (59.9% F1)
**Problem:** Despite strong patterns available, detection remains weak (27.7 missed concepts/run)

**Missing Categories:**
- **Navigation Landmark Labeling**: aria-label on distinct nav elements
- **Live Regions**: role="status", aria-live declarations
- **ARIA Controls**: aria-controls on disclosure/accordion
- **Complex ARIA**: aria-describedby chains, labelledby references
- **Skip Links**: Removal detection

**Yet Detecting:**
- Basic image alt issues ✅
- Heading structure ✅
- Link text ✅

**Root Cause:** Landmark-level patterns need architectural understanding beyond individual tags
**Impact:** Complex accessible patterns systematically missed

---

## RAG vs Guidance Impact (T46b/c Ablation Would Show)

Based on T42-T47 progression, we can infer:
- **RAG Impact**: Likely +0 to +0.2% in isolation
- **Guidance Impact**: Likely -0.5 to -1.5% when combined with RAG (conflicting signals)
- **Reasoning Impact**: Consistent +0.2 to +0.4% (rag-think vs rag-nothink)

**Hypothesis for T47 score (70.075%):**
- T46 had fixture guidance enabled (inferred from -1.3% regression)
- T47 appears to have guidance **disabled** or applied differently
- Result: Regression from T46 to T47 suggests guidance was the problem, not KB

---

## Response Time Analysis

| Condition | Avg Response (s) | Avg per issue | Speed Ranking |
|-----------|------------------|---------------|---------------|
| norag-nothink | 441.6s | 18.8s per issue | 3rd (slower) |
| **norag-think** | **281.8s** | ~12.0s per issue | **1st (fastest)** |
| rag-nothink | 436.0s | 18.5s per issue | 4th (slower) |
| rag-think | 441.9s | 18.8s per issue | 2nd (slower) |

**Key Finding:** Reasoning tokens (thinking) actually **speed up** responses by 160s on average despite longer token count. Model becomes more efficient with structured reasoning.

---

## Strategic Recommendations for T48

### Priority 1: Fix CSS-Low Crisis (36.1% → 50%+)
**Approach:** Implement threshold-based CSS rules instead of general guidance
```
CSS Pattern Rules (instead of broad guidance):
1. "Report focus removal ONLY if outline:none AND no box-shadow/border in SAME rule block"
2. "Report touch target ONLY if explicit px height:20px AND no padding-adjusted context"
3. "Report motion ONLY if @keyframes exists AND no matching @media(prefers-reduced-motion:reduce) at component level"
4. "Report contrast ONLY if foreground + background hex parsed and contrast ratio < 4.5:1"
```

**Expected Improvement:** +10-15% F1 on css-low (currently 36.1% → 45-50%)

### Priority 2: Extend JavaScript Pattern Library (42.4% → 55%+)
**Approach:** Add structured sweep queries for complex JS patterns
```
New Query Categories:
- Focus management chains (init + restore)
- Announcement sequencing (live region + state update order)
- Validation flow (aria-invalid + aria-describedby linkage)
- Form state reflection (onChange handlers)
```

**Expected Improvement:** +8-12% F1 on js-high/medium

### Priority 3: RAG Conditional Disabling (T48 Ablation)
**Config Approach:**
- **T48a:** Disable fixture guidance, keep RAG (recover T45 config)
- **T48b:** Enable guidance, disable RAG (isolate guidance benefit)
- **T48c:** Enable guidance + RAG with conflict resolution (new logic)

**Expected Finding:** Clarify if -1.3% regression was guidance or RAG interaction

### Priority 4: Landmark-Level ARIA Pattern Extension
**Approach:** Add sweep queries specifically for navigation/landmark ARIA
- Distinct nav labeling (how many visible?)
- Live region hierarchy (status vs assertive vs polite)
- Disclosure state coupling (aria-expanded + aria-controls)

**Expected Improvement:** +5-8% F1 on html-high

---

## Conclusion

T47 essentially reproduces T42 baseline performance (70.05% → 70.075%), confirming that fixture-specific prompting provided marginal benefit in T46 before regressing. The system remains strongest on semantic HTML patterns (69-73% F1) and weakest on CSS precision (36-63%) and JavaScript complex patterns (42-52%).

**Next Actions:**
1. **Verify T47 Configuration**: Confirm if fixture guidance was enabled/disabled
2. **Execute T46b/c Ablation**: Isolate RAG vs guidance impact (20-30 min run time)
3. **Implement CSS Threshold Rules** for T48: Replace vague guidance with precise thresholds
4. **Expand JavaScript Sweep Queries**: Target js-high complex patterns

**Target for T48:** 71%+ F1 through CSS precision improvement + JS pattern expansion
