# NASA-TLX Prediction Implementation Guide

## Overview

This guide explains the **NASA-TLX cognitive load prediction model** implemented in the test harness. It demonstrates how accessibility barriers detected in web fixtures map to cognitive workload dimensions and predicts Raw TLX scores for Chapter 4 correlation analysis (F1 metrics ↔ NASA-TLX).

---

## NASA-TLX Workload Assessment: Core Concepts

### The Six Subscales (0–100 each)

| Dimension | Definition | In A11y Context |
|-----------|-----------|-----------------|
| **Mental Demand (MD)** | Mental effort, problem-solving, concentration | Understanding complex ARIA semantics, inferring unlabeled controls |
| **Physical Demand (PD)** | Motor control, hand-eye coordination | Keyboard navigation complexity, mouse precision needed |
| **Temporal Demand (TD)** | Time pressure, pacing | Time to complete task despite navigation issues |
| **Performance** | Perceived success rate (0=fail, 100=perfect) | Confidence in identifying issues correctly |
| **Effort** | How hard you had to work to achieve performance | Cognitive/physical strain to complete task |
| **Frustration** | Discouragement, irritation, stress | Reaction to unexpected behavior, confusing errors |

### Raw TLX Score Calculation

```
Raw TLX = (MD + PD + TD + (100 - Perf) + E + F) / 6
```

- **Range**: 0–100 (0 = no workload, 100 = maximum)
- **Performance is inverse**: Lower perceived performance = higher workload contribution
- **Mean of all dimensions**: Equal weight to all 6 subscales

---

## Barrier → Dimension Mapping

The model maps **10 major accessibility barrier types** to affected NASA-TLX dimensions:

### 1. **Missing Labels** (`missing-labels`)
```
Barriers: Unlabeled form inputs, images without alt text, form sections without legends
Impact:
  - MD +15 (must infer purpose)
  - E +10 (extra validation work)
  - F +8 (uncertainty)
Example: "Form input missing aria-label"
```

### 2. **Keyboard Traps** (`keyboard-trap`)
```
Barriers: Tab trap in modal, focus trap, keyboard-only navigation broken
Impact:
  - PD +12 (requires workaround)
  - E +18 (significant extra steps)
  - F +15 (high frustration from unexpected behavior)
  - TD +8 (more time needed)
Example: "Tab trap in modal dialog"
```

### 3. **Poor Focus Visibility** (`poor-focus`)
```
Barriers: Focus indicators removed, invisible focus ring, low focus contrast
Impact:
  - MD +12 (visual search, uncertain where focus is)
  - F +12 (frustration from invisible state)
  - E +8 (harder to test)
Example: "Focus indicators removed without replacement"
```

### 4. **Low Contrast** (`low-contrast`)
```
Barriers: Text color ratio < 4.5:1 (normal), elements hard to distinguish
Impact:
  - MD +14 (visual strain, slower reading)
  - E +12 (physical strain)
  - Perf -8 (reduced perception of success, may miss issues)
Example: "Low color contrast on text (4 elements)"
```

### 5. **Unclear Error Messages** (`unclear-error`)
```
Barriers: Vague error text, no remediation guidance, confusing validation
Impact:
  - F +18 (highest frustration—cannot fix problem)
  - MD +10 (interpretation needed)
  - E +12 (debugging effort)
  - Perf -10 (low confidence in fix)
Example: "Form shows 'Invalid input' without details"
```

### 6. **Cluttered Layout** (`cluttered-layout`)
```
Barriers: Dense information, poor visual hierarchy, overwhelming content
Impact:
  - MD +16 (more cognitive parsing)
  - E +10 (scan fatigue)
  - F +8 (information overload)
Example: "Multiple elements overlapping, poor spacing"
```

### 7. **Dynamic Updates** (`dynamic-updates`)
```
Barriers: Content changes without announcement, no aria-live, tab refocus
Impact:
  - MD +14 (re-evaluate layout constantly)
  - TD +12 (time pressure: must react to changes)
  - F +14 (loss of context, disorientation)
  - E +8 (watch content constantly)
Example: "Dropdown updates table without aria-live"
```

### 8. **ARIA Errors** (`aria-errors`)
```
Barriers: Wrong ARIA role, incorrect attributes, semantic mismatch
Impact:
  - MD +16 (understand ARIA semantics, debug semantics)
  - F +12 (broken trust in accessibility)
  - E +14 (debugging complexity)
  - Perf -8 (uncertainty if fix is correct)
Example: "aria-label on button contradicts text"
```

### 9. **Focus Trap** (`focus-trap-exit`)
```
Barriers: Tab order issues, trap in modal, no escape route
Impact:
  - TD +10 (time to find exit)
  - F +14 (feels stuck)
  - E +8 (navigation effort)
Example: "Cannot tab out of dropdown list"
```

### 10. **Missing Skip Links** (`no-skip-links`)
```
Barriers: No skip to main, repetitive navigation, keyboard-only burden
Impact:
  - TD +14 (time to skip repetitive content)
  - F +10 (frustration from repetition)
  - E +12 (navigation overhead)
Example: "No skip link, must tab through 50+ nav items"
```

---

## Scaling Model: Logarithmic Aggregation

When **multiple issues of the same barrier type** exist:

```typescript
adjustment = Math.min(barrier_impact × log₂(issue_count + 1), cap)
```

**Logic:**
- **Count = 1**: Impact applied once (baseline)
- **Count = 2**: ~1.4× multiplier (logarithmic)
- **Count = 4**: ~2.0× multiplier
- **Count = 8**: ~2.3× multiplier
- **Multiple similar issues compound sublinearly** (not 1:1)

Each subscale has a **cap** (typically 30–45 points):
- Prevents score explosion from many issues
- Reflects human perception: "8 missing labels ≠ 8× worse than 1"

---

## Implementation: Key Functions

### 1. `classifyIssueBarrier(issue: AccessibilityIssue): string[]`

**Purpose**: Map accessibility issue title → barrier type(s)

```typescript
// Input:
{
  title: "Focus indicators removed without replacement",
  category: "focus",
  severity: "critical"
}

// Output:
["poor-focus"]
```

**Logic**: Simple keyword matching on issue title. In production, would integrate with LLM classification.

---

### 2. `predictTlxFromIssues(fixtureName, issues): NasaTlxPrediction`

**Purpose**: Predict Raw TLX score from accessibility issue list

**Algorithm**:
1. Classify each issue → barrier types
2. Group issues by barrier type
3. For each barrier type:
   - Look up affected dimensions from `BARRIER_MAPPING`
   - Apply logarithmic scaling: `impact × log(count + 1)`
   - Cap each subscale at max value (100)
4. Calculate Raw TLX: `(MD + PD + TD + (100 - Perf) + E + F) / 6`

**Example Output**:
```typescript
{
  fixture_name: "html-high",
  issue_count: 8,
  subscale_scores: {
    mental_demand: 65,
    physical_demand: 35,
    temporal_demand: 42,
    performance: 45,
    effort: 68,
    frustration: 72
  },
  raw_tlx: 58,
  confidence: "high",
  explanation: "...top drivers: focus visibility +X, keyboard trap +Y..."
}
```

---

### 3. `validatePrediction(predicted, actual): ValidationResult`

**Purpose**: Compare predicted TLX vs developer-reported rating

**Output**:
```typescript
{
  fixture_name: "html-high",
  predicted_tlx: 58,
  actual_tlx: 67,     // From mock developer
  error_margin: 9,    // |58 - 67|
  decision: "underestimated"  // Predicted lower than actual
}
```

**Decision Logic**:
- `error < 15`: **accurate** (within ±15 points)
- `predicted > actual`: **overestimated**
- `predicted < actual`: **underestimated**

---

## Test Suite: Four Scenarios

The test harness includes **four realistic fixtures** representing escalating accessibility issues:

| Fixture | Issues | Prediction | Expected TLX |
|---------|--------|------------|--------------|
| `html-clean` | 0 | Very low workload | 0–15 |
| `html-low` | 2 (alt, label) | Low workload | 10–35 |
| `html-medium` | 4 (aria, alt, caption, links) | Medium workload | 25–60 |
| `html-high` | 8 (critical: focus, labels, contrast, keyboard trap, ARIA errors) | High workload | 50–85 |

**Run tests**:
```bash
npx ts-node src/test-runner.ts
```

**Expected output**:
- Predictions fall within expected ranges
- `html-high` scenario validated against mock developer rating
- Pass rate ≥ 75% indicates model calibration success

---

## Assumptions & Limitations

1. **Issue titles are descriptive**: Classification relies on keyword matching. LLM pre-classification improves accuracy.

2. **Barriers are independent**: In reality, some combinations (e.g., low contrast + poor focus) may compound non-linearly.

3. **Developer expertise neutral**: Model assumes consistent dev experience. In production, personalize for skill level.

4. **Single-pass detection**: Assumes ground-truth issue list is comprehensive. Real workload = issues detected × effort to find.

5. **No domain adaptation**: Barrier impacts calibrated to general accessibility context. Specific apps (e.g., maps vs. docs) may differ.

6. **Subscale capping**: Prevents extreme values but may underestimate true workload in pathological cases (1000+ issues).

---

## Integration with Chapter 4 Analysis

### Goal
Validate correlation between **F1 metrics** (LLM issue detection accuracy) and **NASA-TLX** (developer-reported cognitive workload).

### Data Flow
```
1. Issue ground-truth (fixed fixture) → accessibility issues
2. LLM detection (baseline/variant) → predicted issues
3. F1 score = 2 × (precision × recall) / (precision + recall)
4. TLX prediction = predictTlxFromIssues(predicted_issues)
5. Developer rating = mock or real survey data
6. Pearson r(F1, TLX_error) → correlation coefficient
```

### Hypothesis
> "As F1 improves (more issues detected correctly), developer-reported workload decreases."

**Expected relationship**:
- F1 = 0.8 → Predicted TLX close to actual → low error
- F1 = 0.5 → Predicted TLX misses issues → high error
- F1 = 0.95 → Predicted TLX very accurate → very low error

---

## Next Steps

1. **Collect real developer ratings**: Replace mock data with actual NASA-TLX survey responses.
2. **LLM classification**: Integrate GPT/Claude to classify issues → barriers (higher accuracy than keyword match).
3. **Sensitivity analysis**: Vary barrier impact weights to find optimal calibration.
4. **Multi-participant validation**: Pool ratings from 5–10 developers to reduce individual bias.
5. **Report generation**: Export correlation results and visualizations for dissertation Chapter 4.

---

## Files in This Directory

```
nasa-tlx-test-harness/
  ├── nasa-tlx-test-harness.ts      # Core model & types
  ├── test-runner.ts                 # Test suite entry point
  ├── IMPLEMENTATION_GUIDE.md         # This file
  ├── package.json                    # Dependencies
  └── tsconfig.json                   # TypeScript config
```

---

## Quick Reference: Barrier Impact Weights

Print-friendly lookup for dimension impacts:

```
missing-labels        │ MD:15  E:10  F:8       │ Infer purpose
keyboard-trap         │ PD:12  E:18  F:15  TD:8 │ Workarounds, frustration
poor-focus            │ MD:12  F:12  E:8       │ Visual search
low-contrast          │ MD:14  E:12           │ Visual strain
unclear-error         │ F:18  MD:10  E:12  P:-10 │ Cannot remediate
cluttered-layout      │ MD:16  E:10  F:8       │ Cognitive parsing
dynamic-updates       │ MD:14  TD:12  F:14  E:8 │ Constant re-eval
aria-errors           │ MD:16  F:12  E:14  P:-8 │ Semantic debugging
focus-trap-exit       │ TD:10  F:14  E:8       │ Stuck feeling
no-skip-links         │ TD:14  F:10  E:12      │ Repetition overhead

Legend: MD=Mental Demand  PD=Physical  TD=Temporal  Perf=Performance
        E=Effort  F=Frustration
        P=Performance impact (negative = reduces perceived success)
```
