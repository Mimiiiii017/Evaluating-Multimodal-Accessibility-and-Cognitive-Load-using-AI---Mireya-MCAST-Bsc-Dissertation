# Study 6: Supplementary Tool Comparison — Implementation Summary

> Supplementary descriptive comparison of the AI Accessibility Assistant against Google Lighthouse and Deque axe-core to assess tool alignment, identify high-confidence violations, and quantify potential recall gaps in the AI system.

---

## Table of Contents

1. [Study Design & Scope](#1-study-design--scope)
2. [Fixture Selection & Justification](#2-fixture-selection--justification)
3. [Tool Integration Architecture](#3-tool-integration-architecture)
4. [Analysis Workflow](#4-analysis-workflow)
5. [Categorisation & Classification](#5-categorisation--classification)
6. [Alignment Metrics](#6-alignment-metrics)
7. [Expected Outcomes](#7-expected-outcomes)
8. [File Reference](#8-file-reference)
9. [References](#references)

---

## 1. Study Design & Scope

### 1.1 Rationale

Study 6 is a **descriptive rather than controlled benchmark** because the three tools operate on fundamentally different analysis targets:

| Tool | Analysis Target | Vantage Point |
|------|-----------------|---------------|
| **AI Accessibility Assistant** | Source files inside VS Code | Static source-level analysis |
| **Google Lighthouse** | Rendered DOM in browser | Runtime evaluation after execution |
| **Deque axe-core** | Rendered DOM in browser | Runtime evaluation after execution |

Because Lighthouse and axe-core analyse the **rendered DOM** whilst the AI system analyses **source files**, direct quantitative comparison would be misleading. Instead, Study 6 uses a **descriptive alignment methodology**:

1. **Shared findings** (reported by 2+ tools) → **high-confidence violations**
2. **AI-only findings** (source-level issues not evident in rendered DOM) → **expert review**
3. **Lighthouse/axe-core only** (not caught by AI) → **potential recall gaps for AI system**
4. **Tool disagreements** → **identification of tool limitations**

This approach provides qualitative insight into tool complementarity without making false claims of equivalence.

### 1.2 Scope Boundaries

**Included:**
- HTML structure, semantic markup, ARIA attributes
- Links, buttons, form labels, headings, tables, images
- Accessibility violations detectable by all three tools

**Excluded:**
- CSS-only issues (e.g., colour contrast evaluated by Lighthouse but not by source-level analysis)
- JavaScript event handlers and dynamic DOM mutations (beyond static source analysis)
- React/TSX component patterns and client-side state management
- Screen reader behaviour verification

These exclusions align with the tools' capabilities: Lighthouse and axe-core specialise in **rendered DOM analysis**, whilst the AI system specialises in **source-level semantic errors**.

---

## 2. Fixture Selection & Justification

### 2.1 Fixture Catalogue

Two HTML fixtures are analysed in Study 6:

| Fixture | Error Count | HTML Size | CSS Size | JS Size | Justification |
|---------|-------------|-----------|----------|---------|---------------|
| **html-medium.html** | 30 errors | 32.5 kB | 70 kB | 485 kB | Median real-world error count (Martins & Duarte 2016) |
| **html-high.html** | 50 errors | 33.2 kB | 71 kB | 495 kB | High-barrier site baseline (Fernandes et al. 2019 healthcare homepages) |

**Why HTML-only?**

- Lighthouse and axe-core perform full accessibility audits on **rendered HTML**. This is their primary vantage point.
- JavaScript and TSX analysis by Lighthouse requires runtime evaluation after code execution; axe-core cannot deeply inspect React component logic.
- The AI Accessibility Assistant's static source-level analysis is most comparable to DOM-based tools when both are examining **HTML structure and semantic markup**.
- CSS-only issues (colour contrast, text spacing) are better handled by Lighthouse and are not within scope for static source analysis.
- Dynamic event handling and client-side state management are outside the scope of all three tools for this comparison.

**Why CSS and JS sizes are cited?**

Although Study 6 is HTML-focused, CSS and JS payload sizes are included to match the realistic context established in Phases 1–3. This ensures:
1. Consistency across all evaluation phases
2. Acknowledgment that real pages contain these resources
3. Transparency about realistic page composition

---

### 2.2 Size Justification — HTTP Archive Web Almanac 2024

#### HTML: 32–33 kB

**Data source:** HTTP Archive 2024 Web Almanac

- **Median transferred HTML (desktop):** 33 kB
- **Median transferred HTML (mobile):** 32 kB
- **CMS median range:** 22–38 kB (Drupal, WordPress, Joomla)
- **Outliers:** Wix averages ~142 kB

**Selection rationale:**
An HTML document of 32–33 kB reflects a **typical modern webpage** rather than a simplified prototype or artificially bloated page. This size is:
- Within the mainstream CMS range (22–38 kB)
- Neither minimalist (< 10 kB) nor extreme (> 100 kB)
- Representative of production websites with moderate content and markup complexity

**Reference:** [HTTP Archive 2024: Page Weight](https://almanac.httparchive.org/en/2024/page-weight)

#### CSS: 68–72 kB

**Data source:** HTTP Archive 2022 Web Almanac

- **Median desktop CSS:** 72 kB
- **Median mobile CSS:** 68 kB

**Selection rationale:**
These sizes reflect realistic stylesheet complexity for contemporary pages. The 68–72 kB range accommodates:
- CSS-in-JS frameworks and compiled stylesheets
- Utility frameworks (Tailwind, Bootstrap)
- Responsive design breakpoints and media queries
- Vendor prefixes and browser-specific rules

**Reference:** [HTTP Archive 2022: CSS Size](https://almanac.httparchive.org/en/2022/css)

#### JavaScript: 461–509 kB

**Data source:** HTTP Archive 2022 Web Almanac

- **Median desktop JavaScript:** 509 kB
- **Median mobile JavaScript:** 461 kB

**Selection rationale:**
Modern web applications rely heavily on JavaScript. The 461–509 kB range reflects:
- SPA frameworks (React, Vue, Angular bundles)
- Third-party libraries (analytics, ads, widgets)
- Polyfills and backward-compatibility shims
- Runtime and build-tool overhead

This is a realistic baseline for pages that are not deliberately optimised for minimal JS.

**Reference:** [HTTP Archive 2022: JavaScript Size](https://almanac.httparchive.org/en/2022/javascript)

---

### 2.3 Error Count Justification — Empirical Literature

#### 30 Errors: Medium-Complexity Baseline (PRIMARY)

**Data source:** Martins, J., & Duarte, C. (2016)

Large-scale accessibility analysis of **2,884,498 web pages** from 166,311 websites found:
- **Average accessibility errors per page:** 30
- **Pages exceeding 10 errors:** ~63%
- **Pages with zero errors:** ~0.5%

**Selection rationale:**
The 30-error fixture represents the **empirical mean**. This is the most appropriate baseline because:
1. It directly matches published average error counts
2. It provides the most representative test case for typical real-world pages
3. It is neither pessimistic nor optimistic
4. Phases 1–3 benchmarks used 30 as their medium-error baseline, ensuring consistency

**Why not lower?** 10 errors (63% of pages exceed this) is common but below average. **Why not skip it?** 30 errors provides the primary real-world comparison point.

**Reference:** Martins, J., & Duarte, C. (2016). Web accessibility assessment: A methodology for large-scale analysis. In *Proceedings of the 18th International ACM SIGACCESS Conference on Computers and Accessibility* (pp. 143–152). ACM.

#### 50 Errors: High-Complexity Scenario

**Data source:** Fernandes, M. S., et al. (2019)

Accessibility audit of healthcare-related web resources (WAVE evaluation) found:
- **Healthcare homepages:** Average of 51 accessibility errors
- **Highest error rate among page types studied**

**Selection rationale:**
The 50-error fixture represents **high-barrier sites** observed in practice. This scenario:
1. Aligns with Fernandes et al. findings from healthcare domain (51 errors)
2. Tests tool performance when barriers are numerous and complex
3. Provides insight into how tools scale with problem severity
4. Matches the "high-error" baseline used in Phases 1–3

**Reference:** Fernandes, M. S., et al. (2019). Automatic web accessibility evaluation: A systematic literature review. *Journal of Web Engineering*, 18(6), 501–544.

---

## 3. Tool Integration Architecture

### 3.1 Component Overview

```
study-6-run.ts (orchestrator)
       │
       ├─► AI Accessibility Assistant
       │   └─ Extension Analysis Pipeline (reused from src/utils/analysis/)
       │   └─ Multi-query RAG context (same as benchmark.ts)
       │
       ├─ Local HTTP Server (fixtures rendered via HTML)
       │
       ├─► Google Lighthouse (CLI)
       │   └─ Chrome DevTools Protocol
       │   └─ Accessibility audit collection
       │
       └─► Deque axe-core (puppeteer + Node API)
           └─ Browser automation
           └─ Real-time DOM traversal

study-6-compare.ts (analysis engine)
       │
       ├─ normaliseFindings() → canonical issue format
       ├─ buildAlignmentMatrix() → cross-tool comparison
       ├─ calculateStatistics() → agreement rates & gaps
       └─ saveComparisonReport() → JSON export

study-6-fixtures.ts (test data)
       │
       └─ STUDY_6_FIXTURES → { html-medium, html-high }
```

### 3.2 Data Flow

1. **Load fixture** → `loadFixtureHtml(fixture)`
2. **AI analysis** → `analyzeWithAI(htmlContent, model)`
   - Build multi-query RAG context (5 targeted queries)
   - Query LLM with extension prompt
   - Parse and deduplicate findings
3. **Browser setup** → Start local server at `:3456`
4. **Lighthouse** → `runLighthouse(url, outputPath)`
   - Execute `lighthouse` CLI, capture JSON report
   - Extract `audits.accessibility.details.items`
5. **axe-core** → `runAxeCore(browser, url)`
   - Inject axe-core script into page
   - Execute `axe.run()` and collect violations
6. **Compare** → `createComparisonReport(...)` 
   - Build alignment matrix
   - Classify findings (SHARED, AI_ONLY, TOOL_ONLY, LIGHTHOUSE_ONLY, AXE_ONLY)
   - Calculate agreement statistics
7. **Output** → Save JSON report and print summary

---

## 4. Analysis Workflow

### 4.1 Per-Fixture Workflow

For each fixture (e.g., `html-medium.html`):

**Step 1: Prepare**
```
Load html-medium.html (32.5 kB)
Read source content into memory
```

**Step 2: Analyze with AI**
```
Build multi-query RAG context:
  • Query 1: Links & navigation (aria-label, non-descriptive text, nav landmarks)
  • Query 2: Buttons & toggles (aria-expanded, disclosure patterns)
  • Query 3: Forms & labels (autocomplete, input associations)
  • Query 4: Images, headings, tables (alt text, heading hierarchy, scopes)
  • Query 5: ARIA ID references (aria-labelledby, aria-describedby, broken refs)

Call AI model with embedded prompt
Parse response into AiIssue[] (using extension parser)
Deduplicate findings
```

**Step 3: Browser-based Analysis**
```
Start local HTTP server on :3456
Serve html-medium.html at http://localhost:3456

Run Lighthouse:
  • cli: lighthouse http://localhost:3456 --form=json
  • Extract audits.accessibility.details.items
  • Normalise findings to canonical format

Run axe-core:
  • Launch puppeteer browser
  • Navigate to http://localhost:3456
  • Inject axe-core script
  • Call axe.run() and collect violations
  • Normalise findings
```

**Step 4: Comparison & Analysis**
```
buildAlignmentMatrix():
  • Group findings by (WCAG criterion, issue type)
  • Mark which tools reported each
  • Classify: SHARED | AI_ONLY | LIGHTHOUSE_ONLY | AXE_ONLY
  • Assign confidence: HIGH (2+ tools) | MEDIUM | LOW (1 tool)

calculateStatistics():
  • Total unique issues
  • Shared percentage
  • AI-only count (AI has unique findings)
  • Tool-only count (Lighthouse/axe-core only, potential AI recall gaps)
  • Recall gaps = issues AI missed
```

**Step 5: Output**
```
Save JSON report: {fixture}-comparison.json
  {
    metadata: { fixture, errorCount, timestamp, aiModel },
    toolOutputs: { ai, lighthouse, axeCore },
    alignmentMatrix: [ alignment rows ],
    statistics: { totalUnique, shared%, aiOnly, toolOnly, recallGaps }
  }

Print terminal summary (alignment matrix + stats)
```

---

## 5. Categorisation & Classification

### 5.1 Finding Categories

After alignment analysis, each unique (WCAG criterion, issue type) pair is classified:

#### SHARED — High-Confidence Violations
- **Definition:** Found by 2 or 3 tools
- **Confidence:** HIGH
- **Interpretation:** Multiple independent tools agree → strong evidence of actual barrier
- **Example:** Missing `alt` attribute on product images (AI detects via source, Lighthouse/axe-core verify via DOM)

#### AI_ONLY — Source-Level Findings
- **Definition:** Only AI system reports it
- **Confidence:** MEDIUM to LOW
- **Interpretation:** AI detected a semantic or source-level issue not evident in rendered DOM
- **Example:** Heading hierarchy jump (h2 → h5) — detectable via source structure analysis
- **Action:** Pass to accessibility expert for review and manual verification

#### LIGHTHOUSE_ONLY — Lighthouse-Specific Findings
- **Definition:** Only Lighthouse reports it
- **Confidence:** MEDIUM to LOW
- **Interpretation:** Issue manifests during runtime (e.g., colour contrast after CSS applied)
- **Example:** Low colour contrast ratio (requires CSS evaluation)
- **Action:** Document as potential AI recall gap; assess if source analysis could detect

#### AXE_ONLY — axe-core-Specific Findings
- **Definition:** Only axe-core reports it
- **Confidence:** MEDIUM to LOW
- **Interpretation:** Issue specific to axe-core's rule set or DOM traversal logic
- **Example:** ARIA attribute syntax issue that axe-core's parser catches
- **Action:** Document as potential AI recall gap; assess severity

### 5.2 Confidence Assignment

| Scenario | Confidence | Rationale |
|----------|------------|-----------|
| 2–3 tools agree | **HIGH** | Multiple independent validators confirm issue |
| AI + one tool agree | **MEDIUM** | Two sources, but one is static + one is dynamic |
| Single tool only | **LOW** | No corroboration; tool-specific limitation or false positive possible |
| Experts review AI-only | **MEDIUM** (post-review) | Experts may validate source-level issues not visible in rendered DOM |

---

## 6. Alignment Metrics

### 6.1 Key Statistics

**Example output from html-medium.html (30 errors):**

```
Total unique issues:       42
Shared findings:           28 (66.7%)
AI-only findings:          8 (19%)
Lighthouse-only:           4 (9.5%)
axe-core-only:             2 (4.8%)
Potential recall gaps:     6 (AI missed Lighthouse/axe-core findings)
```

### 6.2 Interpretation

- **Shared ≥ 60%:** Good alignment; tools agree on majority of violations
- **AI-only 10–25%:** AI system identifies unique source-level issues; expect some after expert review
- **Tool-only (LH/axe) < 10%:** Low recall gaps; AI system catches most issues
- **Tool-only > 20%:** Potential systematic AI gaps in recall; investigate pattern

---

## 7. Expected Outcomes

### 7.1 Primary Findings

1. **Shared violations** confirm core accessibility issues that all tools reliably detect
2. **AI-only findings** demonstrate unique source-level analysis capability (semantic structure, ARIA patterns)
3. **Lighthouse/axe-core only** issues identify gaps where AI static analysis cannot substitute for runtime evaluation (CSS properties, dynamic state)
4. **Disagreements** reveal tool limitations and complementary strengths

### 7.2 Reporting in Dissertation

**Chapter 4: Evaluation**
- Section 4.6: Tool Alignment Summary (descriptive findings, agreement rates)
- Figure: Alignment matrix (30 × 50 error versions)
- Discussion: Complementary tool strengths and limitations

**Appendix E.7: Detailed Tool Alignment**
- Full alignment matrices for both fixtures
- WCAG criterion breakdown
- Issue classification tables
- Individual tool output summaries (abbreviated)

---

## 8. File Reference

| File | Purpose |
|------|---------|
| `study-6-fixtures.ts` | Fixture definitions, literature justification, HTML access |
| `study-6-compare.ts` | Alignment analysis, categorisation, statistics, reporting |
| `study-6-run.ts` | Orchestrator, tool integration (AI, Lighthouse, axe-core) |
| `results/study-6/` | Output directory for JSON reports and summaries |

### NPM Scripts

```json
{
  "study6:compare": "ts-node study-6-run.ts",
  "study6:compare:all": "ts-node study-6-run.ts --all-fixtures",
  "study6:compare:medium": "ts-node study-6-run.ts --fixture html-medium",
  "study6:compare:high": "ts-node study-6-run.ts --fixture html-high"
}
```

---

## 9. References

[1] HTTP Archive. (2024). "Web Almanac: Page Weight." 
    https://almanac.httparchive.org/en/2024/page-weight

[2] HTTP Archive. (2022). "Web Almanac: CSS." 
    https://almanac.httparchive.org/en/2022/css

[3] HTTP Archive. (2022). "Web Almanac: JavaScript." 
    https://almanac.httparchive.org/en/2022/javascript

[4] Martins, J., & Duarte, C. (2016). "Web accessibility assessment: A methodology for large-scale analysis." 
    In *Proceedings of the 18th International ACM SIGACCESS Conference on Computers and Accessibility* (pp. 143–152). ACM.

[5] Fernandes, M. S., et al. (2019). "Automatic web accessibility evaluation: A systematic literature review." 
    *Journal of Web Engineering*, 18(6), 501–544.
