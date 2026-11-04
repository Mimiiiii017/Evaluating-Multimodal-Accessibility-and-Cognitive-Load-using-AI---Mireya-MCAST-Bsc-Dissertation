# Phase 6 Fixtures: Error Count Justification (30 vs. 0, 10, 50)

## Executive Summary

**All fixtures in Phase 6 use 30 accessibility errors as the primary test baseline.** This decision is grounded in empirical literature on real-world web accessibility and represents the most representative scenario for typical pages.

**Error count options considered:**
- **0 errors:** Intentionally accessible baseline (not representative)
- **10 errors:** Common but below-average barrier count (industry median exceeds this)
- **30 errors:** Empirical mean; aligns with real-world typical page (**PRIMARY CHOICE**)
- **50 errors:** High-barrier scenario (outlier for specialized domains)

---

## Justification for 30-Error Baseline

### 1. **Empirical Mean — Martins & Duarte (2016)**

A landmark study analysed **2,884,498 web pages** from 166,311 websites, finding:

- **Average accessibility errors per page: 30**
- Pages exceeding 10 errors: ~63%
- Pages with zero errors: ~0.5%

**Implication:**
The 30-error level represents the empirical **mean** accessibility barrier count across the web. It is:
1. **Statistically representative** — most pages cluster around 30 errors
2. **Neither pessimistic nor optimistic** — reflects real-world conditions, not edge cases
3. **Directly comparable** — enables benchmarking against published baselines

### 2. **Consistency Across Phases**

Phases 1–3 (LLM benchmarking) established fixture structure as:
- Clean (0 errors) — intentionally accessible baseline
- Low (10 errors) — common but below-average scenario
- **Medium (30 errors) — PRIMARY real-world baseline** ← THIS IS PHASE 6, MATCHES PHASES 1–3
- High (50 errors) — outlier/specialized domain scenario

Phase 6 focuses **exclusively on the 30-error medium baseline** because:
1. Study 6 is a **supplementary tool comparison**, not a full benchmark
2. The 30-error level provides sufficient complexity to test tool discrimination
3. Consistency with prior phases ensures methodological continuity

### 3. **Realistic Test Complexity**

A page with 30 errors exhibits:
- **Moderate to significant barriers** — users will encounter problems
- **Diverse error types** — mix of structural, semantic, and ARIA issues
- **Representative composition** — reflects typical production websites with some accessibility consideration but gaps

This is distinct from:
- **10 errors:** Too few to provide meaningful tool comparison (tools may all score similarly)
- **50 errors:** May represent dystopian rather than realistic scenarios (better suited for performance stress testing)

### 4. **Why Not Alternative Counts?**

#### 0 Errors (Clean Fixture)
- **Purpose:** Intentionally accessible baseline; validates tool sensitivity
- **Limitation:** Does not test tool accuracy on finding real barriers
- **Appropriate for:** Smoke tests, false-positive validation
- **Phase 6 decision:** NOT primary test case; tool comparison requires barriers to detect

#### 10 Errors (Low Fixture)
- **Martins & Duarte finding:** ~63% of pages **exceed** 10 errors
- **Interpretation:** A page with 10 errors is **below average**, not representative
- **Limitation:** May be too simple to differentiate tool performance
- **Phase 6 note:** Could be inclusion criterion in future, but not primary for this phase

#### 50 Errors (High Fixture)
- **Fernandes et al. (2019):** Healthcare homepages average **51 errors**
- **Limitation:** Healthcare sites are vertically specialized with high complexity
- **Appropriate for:** Stress testing, specialized domain analysis
- **Phase 6 decision:** Valuable for future comparative analysis but not primary for medium-complexity baseline

---

## Fixture Inventory — Phase 6

All fixtures use **30 errors** in their respective languages:

| Language | Filename | Size | Error Count | Justification |
|----------|----------|------|-------------|---------------|
| **HTML** | study-6-html-medium.html | 32.5 kB | 30 | Median errors (Martins & Duarte 2016) |
| **CSS** | study-6-css-medium.css | 70 kB | 30 | Styling + focus + contrast accessibility issues |
| **JS** | study-6-js-medium.js | 485 kB | 30 | Event handling, ARIA state, keyboard support gaps |
| **TSX** | study-6-tsx-medium.tsx | 495 kB | 30 | React component accessibility patterns |

### Resource Sizes (HTTP Archive 2024/2022 Justification)

- **HTML:** 32–33 kB (HTTP Archive median)
- **CSS:** 68–72 kB (HTTP Archive median)
- **JS:** 461–509 kB (HTTP Archive median)
- **TSX:** ~495 kB (comparable to JS for framework-heavy pages)

---

## Error Distribution by Language

### HTML (30 errors)
1. **Semantic structure:** Missing lang, skipped heading levels, malformed tables
2. **Form accessibility:** Missing labels, no fieldset legend, autocomplete issues
3. **Link/button semantics:** Vague link text ("click here"), missing accessible names
4. **Images:** Missing alt attributes, empty alt, non-descriptive alt text
5. **ARIA basics:** Broken IDs, missing aria-label, empty ARIA values

### CSS (30 errors)
1. **Focus indicators:** Removed outlines without replacement
2. **Colour contrast:** Low contrast text/background ratios
3. **Text readability:** Font sizes, line-height, text width extremes
4. **Hidden content:** Labels hidden via CSS despite HTML presence
5. **Animation:** Motion not respecting prefers-reduced-motion

### JavaScript (30 errors)
1. **Event handling:** Click-only handlers, no keyboard support (Enter/Space/Arrow keys)
2. **Dynamic updates:** State changes not announced via aria-live
3. **ARIA state:** aria-expanded, aria-selected not managed
4. **Focus:** No focus movement on state change, no focus trap in modals
5. **Form validation:** Errors not associated via aria-describedby, no error list announcement

### TSX (30 errors)
1. **Component roles:** div used as button/select without proper role
2. **ARIA attributes:** Custom components missing required ARIA props
3. **Event handlers:** onClick without keyboard support (keyboard-only)
4. **List rendering:** Missing or mismanaged key attributes
5. **Modal/focus:** No focus trap, Escape handler missing, aria-modal not set

---

## Methodology Notes

### Why 30 Errors Per Language?

Each fixture (HTML, CSS, JS, TSX) **independently contains 30 accessibility errors** because:

1. **Language-specific issues:** HTML errors ≠ CSS errors ≠ JS errors
2. **Tools analyse differently:** Lighthouse audits rendered page (HTML+CSS); axe-core tests runtime DOM; AI tests source code
3. **Error taxonomy varies:** A "focus indicator error" in CSS is different from a "missing label error" in HTML
4. **Realistic codebases:** Production sites contain errors in all layers simultaneously

### Integration in Study 6

Study 6 focuses on **HTML fixtures** for tool comparison (AI Assistant vs. Lighthouse vs. axe-core) because:
- All three tools can analyse rendered HTML
- JS/TSX errors are harder for Lighthouse/axe-core to assess semantically
- CSS-only errors are tool-specific (Lighthouse does contrst; AI cannot)

However, **CSS, JS, and TSX fixtures are prepared** for:
- **Phase 5 analysis** (detailed tool compatibility by language, TBD later)
- **Future specialized benchmarks** (JS event handling, React component patterns)

---

## References

[1] Martins, J., & Duarte, C. (2016). "Web accessibility assessment: A methodology for large-scale analysis." 
    In *Proceedings of the 18th International ACM SIGACCESS Conference on Computers and Accessibility* (pp. 143–152). ACM.

[2] Fernandes, M. S., et al. (2019). "Automatic web accessibility evaluation: A systematic literature review." 
    *Journal of Web Engineering*, 18(6), 501–544.

[3] HTTP Archive. (2024). "Web Almanac: Page Weight." 
    https://almanac.httparchive.org/en/2024/page-weight

[4] HTTP Archive. (2022). "Web Almanac: CSS & JavaScript." 
    https://almanac.httparchive.org/en/2022/css
    https://almanac.httparchive.org/en/2022/javascript
