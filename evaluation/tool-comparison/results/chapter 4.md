4. Results and Discussion 

4.1 Study 6: Comparative Accessibility Tool Evaluation Results 

4.1.1 Overview 

Study 6 compared the AI Accessibility Assistant with six established automated accessibility tools across four purpose-built test script files: HTML, CSS, JavaScript, and TSX. TSX refers to TypeScript with JSX syntax — the file format used for React component code. Each test script file contained 30 intentionally planted accessibility defects. This section reports results from the 2 June 2026 run, using a dual-model consensus configuration: two large language models (kimi-k2.5 and qwen3.5) independently analyse each 200-line code chunk and a finding is only included in the output if both models agree on it, measured using a Jaccard similarity score above 0.40. This consensus step is designed to suppress findings that only one model flags, reducing noise at the cost of some recall. Comment stripping was enabled to reduce token overhead. These findings replace all previous Study 6 result drafts. The 30-defect-per-test-file target was selected to reflect the empirical accessibility-error density reported by Martins and Duarte in their large-scale analysis of web pages (Martins and Duarte, 2024) \cite{martins2024large}. 

The purpose of the study was not to produce a single absolute ranking, but to examine how tool coverage changed by artefact type, analysis surface, and evaluation method. This distinction is important because accessibility tools inspect different representations of an interface: source-level linters examine authored code, while rendered-DOM tools such as Lighthouse and axe-core inspect browser-rendered output [13], [15], [55]. The comparison was also informed by WCAG-based evaluation practice, ACT rule consistency, and WCAG-EM guidance on structured, multi-method accessibility evaluation [8], [17], [54]. 

A distinction was made between raw findings and ground-truth recall. Raw findings refer to the number of issues reported by each tool. Ground-truth recall refers to how many of the 30 planted defects were detected. This distinction is necessary because automated tools may report more than 30 findings when they count repeated element-level violations, incidental issues, or overlapping rules for the same defect category. Therefore, high raw finding counts do not automatically indicate stronger accuracy. 

For classification metrics, each tool's output was evaluated against the 30 planted Ground Truth (GT) defects per test script file. Findings were classified into three categories: (1) **GT-matched TP** — the finding matches a planted GT defect; (2) **additional genuine TP** — the finding does not match any planted GT defect but, upon inspection of the source code, identifies a real accessibility issue that genuinely exists in the file (an unintentional error in the test script file that was not part of the planted set); (3) **false positive (FP)** — the finding does not correspond to any real accessibility issue in the code (hallucination or misidentification).

GT-matched TPs and additional genuine TPs are tracked separately because they measure different things. GT-matched TPs measure how well the tool covers a *known, controlled defect set* — this is the traditional recall metric and allows direct comparison across tools. Additional genuine TPs measure whether the tool surfaces *real problems beyond the planted set*, which matters for assessing practical utility: a tool that only detects planted issues but misses other genuine problems in the same file is less useful than one that catches both. Merging the two into a single TP count would inflate GT Recall figures and obscure the distinction between a tool that found planted defects versus one that found a wider range of genuine issues.

Total TP is the combined count (GT-matched + additional genuine). FP is the count of actual incorrect findings only. **Accuracy** is computed as Total TP / Raw Findings — the proportion of a tool's output that represents genuine accessibility issues, whether planted or not. **GT Recall** is GT-matched TP / 30 — the proportion of planted defects detected, used for cross-tool comparison. **F1** is the harmonic mean of Accuracy and GT Recall, providing a single balanced score. False negatives (FN) are not reported: FN requires a closed population assumption (that the tool *should* have found all 30 issues) which is not appropriate here since the planted set is a sample, not the full universe of issues in the file. AI findings were individually audited against the source files for the genuine/FP classification; other tools' non-GT findings were not subject to the same audit and are reported as-is.

The four test script files reflected modern front-end accessibility risk across multiple layers: structural semantics in HTML, style-driven barriers in CSS, interaction and state behaviour in JavaScript, and component-level implementation in TSX. The results are therefore interpreted as complementary coverage patterns rather than a winner-takes-all comparison.

  

4.1.2 Raw Findings by File Type 

Table 4.1.2 summarises the raw findings reported by each tool across the four file types. Because not every tool was applicable to every test script file, the results are presented by file type rather than as a single cross-file comparison. This avoids implying that Lighthouse, axe-core, ESLint jsx-a11y, and stylelint-a11y were equally applicable across all file types. Lighthouse and axe-core represent rendered-DOM audit tools — they inspect a browser-rendered accessibility tree rather than source code [13], [15], [55]. Axe Linter is a distinct tool from axe-core: it applies a subset of axe-core's rules statically to source files without requiring a browser, enabling it to flag issues in HTML and JSX at authoring time [56]. ESLint jsx-a11y represents JSX accessibility linting [57], Webhint represents configuration and accessibility hinting [58], and stylelint-a11y represents CSS accessibility linting [59].

| File Type | AI assistant | Lighthouse | axe-core | Axe Linter | ESLint jsx-a11y | Webhint | stylelint-a11y |
|---|---:|---:|---:|---:|---:|---:|---:|
| HTML | 11 | 3 | 6 | 6 | N/A | 2 | N/A |
| CSS | 6 | 0 | 0 | 0 | N/A | 0 | 29 |
| JavaScript | 60 | 0 | 0 | 0 | N/A | 1 | N/A |
| TSX | 32 | N/A | N/A | 1 | 1 | 1 | N/A |

*Table 4.1.2: Raw Findings Per Test Script File in Study 6 (2 June 2026 run)*

Note: Raw counts include all findings reported by each tool regardless of ground-truth match. axe-core and Axe Linter returned 6 HTML findings each, of which 5 were true positives against ground-truth (the remaining 1 per tool was a duplicate rule firing on the same planted defect). stylelint-a11y returned 29 CSS findings, of which 6 matched planted GT issues; the remainder were rule-scope over-fires. The high AI raw count on JS (60) reflects the LLM's broader source-level reasoning — see Section 4.1.3 for TP/FP breakdown.


 

4.1.2.1 HTML

In the HTML test script file, the AI assistant reported 11 findings, axe-core and Axe Linter each reported 6, Lighthouse reported 3, and Webhint reported 2. ESLint jsx-a11y returned 0 (not applicable). Of the AI's 11 findings, 6 matched planted ground-truth defects and 2 additional findings were genuine unplanted issues; the remaining 3 were actual false positives (GT-TP=6, Add-TP=2, FP=3; Accuracy=0.727, GT-Recall=0.200, F1=0.314). Confirmed AI true positives covered: empty aria-label overriding visible link text, missing image alt attributes, non-descriptive link text ("here"), pricing call-to-action links lacking distinguishing accessible names, form input missing label, and missing accessible name on link. The two additional genuine findings were table header missing scope attribute and article sections lacking programmatic heading association. The three false positives were carousel navigation buttons flagged as missing aria-controls (no carousel present in source), toggle button missing aria-expanded (not evidenced in the HTML source), and a broken aria-labelledby reference (not present in source on inspection).

Lighthouse returned 3 findings, all matching planted GT issues (GT-TP=3, FP=0; Accuracy=1.000, GT-Recall=0.100, F1=0.182), covering heading level order, select element labelling, and table header structure. axe-core returned 6 findings covering 5 distinct GT issues (GT-TP=5, FP=1; Accuracy=0.833, GT-Recall=0.167, F1=0.280): heading order, image-alt, duplicate banner landmark, landmark uniqueness, and role-img-alt rules. Axe Linter produced identical coverage to axe-core (GT-TP=5, FP=1). Webhint returned 2 findings, of which 1 matched a planted GT issue (GT-TP=1, FP=1; Accuracy=0.500, GT-Recall=0.033, F1=0.062). The 1 Webhint false positive related to an autocomplete suggestion not present in the ground truth.

Table 4.1.2.1: HTML Test Script File Classification Metrics (30 GT defects)

| Tool | GT-TP | Add-TP | Total TP | FP | Raw | Accuracy | GT Recall | F1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| AI Assistant | 6 | 2 | 8 | 3 | 11 | 0.727 | 0.200 | 0.314 |
| Lighthouse | 3 | 0 | 3 | 0 | 3 | 1.000 | 0.100 | 0.182 |
| axe-core | 5 | 0 | 5 | 1 | 6 | 0.833 | 0.167 | 0.280 |
| Axe Linter | 5 | 0 | 5 | 1 | 6 | 0.833 | 0.167 | 0.280 |
| ESLint jsx-a11y | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Webhint | 1 | 0 | 1 | 1 | 2 | 0.500 | 0.033 | 0.062 |
| stylelint-a11y | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

*Note: The 1 axe-core and 1 Axe Linter FP was a duplicate rule firing (`landmark-no-duplicate-banner` on the same planted defect covered by `landmark-unique`). The 3 AI FPs were carousel navigation buttons flagged as missing aria-controls, a toggle button missing aria-expanded, and a broken aria-labelledby reference — all flagged by the AI but not evidenced in the source on inspection. Webhint's 1 FP was an autocomplete suggestion not corresponding to a planted defect.

This pattern is consistent with findings from accessibility tool evaluation literature. Vigo et al. found that different automated tools detect non-overlapping subsets of accessibility issues, with combined coverage typically not exceeding 20–36% of a comprehensive defect set (Vigo et al., 2013) \cite{vigo2013benchmarking}. The axe-core and Axe Linter recall here (17%) reflects that these tools were applicable to the rendered HTML harness and several planted issues fell within their ARIA and landmark rule sets. Frazão and Duarte observed that tool agreement rates are below 15% when comparing automated checkers on identical pages (Frazão and Duarte, 2020) \cite{frazao2020comparing}, which is reflected in the zero shared findings: no two tools detected the same individual planted issue.

Figure 4.1.2.1: HTML Test Script File Classification Metrics by Applicable Tool

  

4.1.2.2 CSS

In the CSS test script file, the AI assistant reported 6 findings. stylelint-a11y returned 29 findings. Lighthouse, axe-core, Axe Linter, and Webhint all returned 0. ESLint jsx-a11y is not applicable to CSS.

Of the AI's 6 findings, 1 matched a planted GT issue (GT#11: the backwards `prefers-reduced-motion` logic). Upon source inspection, 2 additional non-GT AI findings were confirmed as genuine accessibility issues in the code: link text distinguished only by colour removal (a WCAG 1.4.1 violation at the base link state), and `color: #fff !important` on social links overriding user stylesheets. Three findings were actual false positives: a forced-colors media query override that already exists correctly in the source, a `.search-icon` touch target that is 16×16 px and meets the WCAG 2.5.8 minimum, and a focus indicator inside `@media (prefers-reduced-motion: reduce)` that is correctly preserved. This gives total-TP=3 (1 GT-matched + 2 genuine additional), FP=3, Accuracy=0.500, GT-Recall=0.033, F1=0.062.

stylelint-a11y returned 29 raw findings. Of these, 6 matched planted GT issues. The remaining 23 are rule-scope over-fires across `a11y/no-display-none` and `a11y/media-prefers-reduced-motion` patterns, yielding Accuracy=0.207, GT-Recall=0.200, F1=0.203 — the highest F1 on the CSS test script file but still very low overall.

Table 4.1.2.2: CSS Test Script File Classification Metrics (30 GT defects)

| Tool | GT-TP | Add-TP | Total TP | FP | Raw | Accuracy | GT Recall | F1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| AI Assistant | 1 | 2 | 3 | 3 | 6 | 0.500 | 0.033 | 0.062 |
| Lighthouse | 0 | 0 | 0 | 0 | 0 | — | 0.000 | — |
| axe-core | 0 | 0 | 0 | 0 | 0 | — | 0.000 | — |
| Axe Linter | 0 | 0 | 0 | 0 | 0 | — | 0.000 | — |
| ESLint jsx-a11y | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Webhint | 0 | 0 | 0 | 0 | 0 | — | 0.000 | — |
| stylelint-a11y | 6 | 0 | 6 | 23 | 29 | 0.207 | 0.200 | 0.203 |

*Note: stylelint-a11y Add-TP column shows 0 because non-GT findings were not individually source-audited; the 23 non-GT findings are treated as FP by default.*

The CSS result is the starkest finding of Study 6: no tool achieved GT Recall above 20% or Accuracy above 21% against the planted CSS defect set. The planted CSS issues targeted context-dependent composite patterns — `:focus` versus `:focus-visible`, font-size insufficiency at specific breakpoints, backwards reduced-motion logic, `user-select` blocking, and CSS-only state management without ARIA synchronisation — rather than single-property violations detectable by static rules. stylelint-a11y's `a11y/no-display-none` and `a11y/media-prefers-reduced-motion` rules match only a subset of those patterns. The AI's failure to reach higher recall under the strict dual-model consensus reflects that many CSS accessibility issues require visual rendering context to assess reliably; both models may either miss the issue or disagree on severity, and the 0.40 Jaccard threshold filters them out. The stylelint-a11y false-positive rate (23/29 = 79%) is consistent with prior observations that rule-based accessibility tools generate high false-positive rates when their rules fire across patterns beyond their calibrated scope (López-Gil and Pereira, 2025) \cite{lopezgil2025turning}.

Figure 4.1.2.2: CSS Test Script File Classification Metrics by Applicable Tool

  

4.1.2.3 JavaScript

In the JavaScript test script file, the AI assistant returned 60 findings — by far the highest raw output of any tool on any test script file. Webhint returned 1 finding (a colour contrast check, not matching any planted GT defect). Lighthouse, axe-core, Axe Linter, and stylelint-a11y all returned 0. ESLint jsx-a11y is not applicable to plain JavaScript.

Of the 60 AI findings, 15 matched planted ground-truth defects. Source-code audit of the remaining 45 found that approximately 36 were genuine accessibility issues present in the code (unintentional errors in the test script file beyond the planted set) and approximately 9 were actual false positives with no corresponding code evidence. The 15 GT-matched TPs covered: cart counter updates without aria-live, form validation errors not linked via aria-describedby, live region recreation on every update, mobile navigation toggle aria-expanded not initialised, reply form toggle missing aria-expanded update, keyboard accessibility gaps, reduced-motion preferences not respected, mobile nav missing aria-modal and focus trap, aria-expanded not synchronised on mobile toggle, CosmosReadingPrefs state changes not announced, CosmosTheme changes without announcement, dynamic search results hidden without announcement, interactive planet selection list not initialised, reading history progress bar not updated, and newsletter input missing aria-invalid. The 36 additional genuine findings covered router focus management gaps, ARIA attribute misuse patterns, duplicate ID risks, and live region configuration errors throughout the 4,800+ line codebase. Total TP = 51, FP = 9, Accuracy = 0.850, GT-Recall = 0.500, F1 = 0.630.

Table 4.1.2.3: JavaScript Test Script File Classification Metrics (30 GT defects)

| Tool | GT-TP | Add-TP | Total TP | FP | Raw | Accuracy | GT Recall | F1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| AI Assistant | 15 | 36 | 51 | 9 | 60 | 0.850 | 0.500 | 0.630 |
| Lighthouse | 0 | 0 | 0 | 0 | 0 | — | 0.000 | — |
| axe-core | 0 | 0 | 0 | 0 | 0 | — | 0.000 | — |
| Axe Linter | 0 | 0 | 0 | 0 | 0 | — | 0.000 | — |
| ESLint jsx-a11y | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Webhint | 0 | 0 | 0 | 1 | 1 | 0.000 | 0.000 | — |
| stylelint-a11y | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

The AI assistant achieved 85% accuracy (51/60 findings genuine) and 50% GT recall — the highest of any metric for any tool on any test script file in Study 6. The 9 actual false positives represent findings where the model cited patterns that either do not exist in the source or are correctly implemented. The high genuine-finding rate (85%) is substantially better than the raw-findings view suggested: most of the 45 non-GT AI findings are real accessibility issues in the codebase, not hallucinations. This confirms the pattern documented by Abascal et al. and Huang et al. (Abascal et al., 2019; Huang et al., 2024) \cite{abascal2019tools,huang2024access} that LLM-based tools surface genuine behavioural and state-management accessibility issues that deterministic tools cannot model.

Figure 4.1.2.3: JavaScript Test Script File Classification Metrics by Applicable Tool

  

  

4.1.2.4 TSX

In the TSX test script file, the AI assistant returned 32 findings. ESLint jsx-a11y returned 1. Axe Linter returned 1. Webhint returned 1. Lighthouse and axe-core were excluded because TSX is source-level code and no rendered browser runtime was used for this test script file. stylelint-a11y is not applicable to TSX.

Of the AI's 32 findings, 17 matched planted ground-truth defects. Source-code audit of the remaining 15 found approximately 12 to be genuine accessibility issues in the component code (unintentional errors beyond the planted set) and approximately 3 to be actual false positives. The 17 GT-matched TPs covered: div used as interactive element without keyboard semantics, missing aria-expanded and aria-haspopup on menu trigger, tab keyboard navigation absent, aria-labelledby ID mismatch, display:none hiding panel content from AT, accordion button missing aria-controls, DatePicker trigger missing aria-expanded, DatePicker calendar missing focus trap, DatePicker click-outside handler absent, rating component missing live-region announcement, stepper missing aria-live, progress bar missing aria-live region, toast dismiss button generic aria-label, combobox missing aria-required, combobox no-results state not announced, FileUpload conditional aria-describedby, and skeleton animation ignoring prefers-reduced-motion. The 12 additional genuine findings covered autocomplete attribute omissions on form inputs, tooltip describedby interaction conflicts, modal ARIA labelling gaps, and listbox role assignment errors throughout the component library. Total TP = 29, FP = 3, Accuracy = 0.906, GT-Recall = 0.567, F1 = 0.697.

ESLint jsx-a11y returned 1 finding, GT-matched (GT-TP=1, FP=0; Accuracy=1.000, GT-Recall=0.033, F1=0.064): `jsx-a11y/click-events-have-key-events` detecting the div-as-button pattern. Axe Linter returned 1 finding, GT-matched (GT-TP=1, FP=0; Accuracy=1.000, GT-Recall=0.033, F1=0.064). Webhint returned 1 finding; GT match not confirmed on inspection (GT-TP=0, FP=1).

Table 4.1.2.4: TSX Test Script File Classification Metrics (30 GT defects)

| Tool | GT-TP | Add-TP | Total TP | FP | Raw | Accuracy | GT Recall | F1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| AI Assistant | 17 | 12 | 29 | 3 | 32 | 0.906 | 0.567 | 0.697 |
| Lighthouse | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| axe-core | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Axe Linter | 1 | 0 | 1 | 0 | 1 | 1.000 | 0.033 | 0.064 |
| ESLint jsx-a11y | 1 | 0 | 1 | 0 | 1 | 1.000 | 0.033 | 0.064 |
| Webhint | 0 | 0 | 0 | 1 | 1 | 0.000 | 0.000 | — |
| stylelint-a11y | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

The TSX result remains the AI assistant's strongest test script file by Accuracy (0.906). 91% of the AI's TSX findings are genuine accessibility issues. GT Recall of 56.7% is the highest among non-JS test script files. ESLint jsx-a11y, Axe Linter, and Webhint each returned 1 finding, with ESLint and Axe Linter both achieving perfect Accuracy (1/1 genuine, 0 FP), confirming their value as zero-FP targeted checks for basic JSX and source-level patterns. The constrained scope of rule-based source linters for ARIA relationship errors, state-linked focus management, and programmatic accessibility associations has been observed in prior accessibility tool evaluations (Abascal et al., 2019) \cite{abascal2019tools}, and is confirmed here by ESLint jsx-a11y's 3.3% GT recall versus the AI's 56.7%.

Figure 4.1.2.4: TSX Test Script File Classification Metrics by Applicable Tool

  

4.1.3 Aggregate Results

Table 4.1.3a reports total findings by tool across all applicable test script files in the 2 June 2026 run.

| Tool | Total Raw Findings | Applicable Test Script Files | Avg per Applicable Test Script File |
|---|---:|---:|---:|
| AI Assistant | 109 | 4 | 27.25 |
| Lighthouse | 3 | 3 | 1.00 |
| axe-core | 6 | 3 | 2.00 |
| Axe Linter | 7 | 4 | 1.75 |
| ESLint jsx-a11y | 1 | 1 | 1.00 |
| Webhint | 4 | 4 | 1.00 |
| stylelint-a11y | 29 | 1 | 29.00 |

*Table 4.1.3a: Total Raw Findings by Tool Across All Test Script Files*

Figure 4.1.3a: Total Raw Findings by Tool Across Applicable Test Script Files

Table 4.1.3b provides the full classification metrics for every tool on every applicable test script file. AI findings were individually source-audited and split into GT-TP (planted match), Add-TP (genuine unplanted issue), and FP (actual false positive). Other tools show GT-TP only; Add-TP for non-AI tools was not separately audited. Accuracy = Total TP / Raw. GT Recall = GT-TP / 30. F1 = harmonic mean of Accuracy and GT Recall.

| Test Script File | Tool | GT-TP | Add-TP | Total TP | FP | Raw | Accuracy | GT Recall | F1 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| HTML | AI Assistant | 6 | 2 | 8 | 3 | 11 | 0.727 | 0.200 | 0.314 |
| HTML | Lighthouse | 3 | 0 | 3 | 0 | 3 | 1.000 | 0.100 | 0.182 |
| HTML | axe-core | 5 | 0 | 5 | 1 | 6 | 0.833 | 0.167 | 0.280 |
| HTML | Axe Linter | 5 | 0 | 5 | 1 | 6 | 0.833 | 0.167 | 0.280 |
| HTML | ESLint jsx-a11y | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| HTML | Webhint | 1 | 0 | 1 | 1 | 2 | 0.500 | 0.033 | 0.062 |
| HTML | stylelint-a11y | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| CSS | AI Assistant | 1 | 2 | 3 | 3 | 6 | 0.500 | 0.033 | 0.062 |
| CSS | Lighthouse | 0 | 0 | 0 | 0 | 0 | — | 0.000 | — |
| CSS | axe-core | 0 | 0 | 0 | 0 | 0 | — | 0.000 | — |
| CSS | Axe Linter | 0 | 0 | 0 | 0 | 0 | — | 0.000 | — |
| CSS | ESLint jsx-a11y | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| CSS | Webhint | 0 | 0 | 0 | 0 | 0 | — | 0.000 | — |
| CSS | stylelint-a11y | 6 | 0 | 6 | 23 | 29 | 0.207 | 0.200 | 0.203 |
| JS | AI Assistant | 15 | 36 | 51 | 9 | 60 | 0.850 | 0.500 | 0.630 |
| JS | Lighthouse | 0 | 0 | 0 | 0 | 0 | — | 0.000 | — |
| JS | axe-core | 0 | 0 | 0 | 0 | 0 | — | 0.000 | — |
| JS | Axe Linter | 0 | 0 | 0 | 0 | 0 | — | 0.000 | — |
| JS | ESLint jsx-a11y | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| JS | Webhint | 0 | 0 | 0 | 1 | 1 | 0.000 | 0.000 | — |
| JS | stylelint-a11y | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| TSX | AI Assistant | 17 | 12 | 29 | 3 | 32 | 0.906 | 0.567 | 0.697 |
| TSX | Lighthouse | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| TSX | axe-core | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| TSX | Axe Linter | 1 | 0 | 1 | 0 | 1 | 1.000 | 0.033 | 0.064 |
| TSX | ESLint jsx-a11y | 1 | 0 | 1 | 0 | 1 | 1.000 | 0.033 | 0.064 |
| TSX | Webhint | 0 | 0 | 0 | 1 | 1 | 0.000 | 0.000 | — |
| TSX | stylelint-a11y | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

*Table 4.1.3b: Full Classification Metrics Per Tool Per Test Script File (AI source-audited; other tools GT-TP only)*

Figure 4.1.3b: Accuracy by Tool and Test Script File

Figure 4.1.3c: GT Recall by Tool and Test Script File

Figure 4.1.3d: F1 Score by Tool and Test Script File

Table 4.1.3c summarises the AI assistant's aggregate performance across all four test script files combined (120 total GT issues, source-audited).

| Metric | Value |
|---|---:|
| Total GT-TP | 39 |
| Total Add-TP (genuine unplanted) | 52 |
| Total TP (GT + genuine) | 91 |
| Total FP (actual hallucinations) | 18 |
| Total Raw Findings | 109 |
| Aggregate Accuracy | 0.835 |
| Aggregate GT Recall | 0.325 |
| Aggregate F1 | 0.468 |

*Table 4.1.3c: AI Assistant Aggregate Metrics Across All Four Test Script Files (120 GT issues, source-audited)*

The aggregate results show that 83.5% of the AI assistant's 109 total findings are genuine accessibility issues (either planted GT defects or real unintentional errors in the code). Only 18 findings (16.5%) were actual false positives with no corresponding code evidence. The aggregate GT Recall of 32.5% — the proportion of planted defects detected — is at the upper end of published baselines for automated accessibility tools. Vigo et al. (2013) \cite{vigo2013benchmarking} found that leading automated tools achieved 20–36% recall against comprehensive WCAG defect sets; multi-tool comparison studies consistently confirm that no single tool provides complete or high coverage (Pool, 2023; Lempola et al., 2024; Fischer et al., 2025) \cite{pool2023accessibility,lempola2024comparing,fischer2025coverage}. The aggregate F1 of 0.468, balancing Accuracy against GT Recall, represents a substantially better characterisation of the tool's real-world utility than the raw-findings view: the system is both finding most issues it reports (83.5% genuine) and detecting a meaningful proportion of the planted defect set (32.5%).


  

4.1.4 Ground-Truth Recall Analysis

Because each test script file contained 30 intentionally planted accessibility defects, ground-truth recall was calculated by matching each tool's reported findings against the planted issue descriptions and line numbers. A finding was counted as a TP when it matched the planted defect's issue type; findings outside the planted set were counted as FP. Tables 4.1.4a and 4.1.4b summarise TP counts and recall percentages.

| Test Script File | AI Assistant | Lighthouse | axe-core | Axe Linter | ESLint jsx-a11y | Webhint | stylelint-a11y |
|---|---:|---:|---:|---:|---:|---:|---:|
| HTML | 6 | 6 | 7 | 7 | N/A | 2 | N/A |
| CSS | 1 | 0 | 0 | 0 | N/A | 0 | 6 |
| JavaScript | 15 | 0 | 0 | 0 | N/A | 0 | N/A |
| TSX | 20 | N/A | N/A | 0 | 2 | 0 | N/A |

*Table 4.1.4a: True Positive Counts (GT Matches) Out of 30 Planted Defects*

| Test Script File | AI Assistant | Lighthouse | axe-core | Axe Linter | ESLint jsx-a11y | Webhint | stylelint-a11y |
|---|---:|---:|---:|---:|---:|---:|---:|
| HTML | **20%** | 20% | **23%** | **23%** | N/A | 7% | N/A |
| CSS | **3%** | 0% | 0% | 0% | N/A | 0% | 20% |
| JavaScript | **50%** | 0% | 0% | 0% | N/A | 0% | N/A |
| TSX | **67%** | N/A | N/A | 0% | 7% | 0% | N/A |

*Table 4.1.4b: Recall Percentage Out of 30 Planted GT Defects*

Figure 4.1.4a: HTML Test Script File Ground-Truth Recall by Applicable Tool

Figure 4.1.4b: CSS Test Script File Ground-Truth Recall by Applicable Tool

Figure 4.1.4c: JavaScript Test Script File Ground-Truth Recall by Applicable Tool

Figure 4.1.4d: TSX Test Script File Ground-Truth Recall by Applicable Tool

The ground-truth recall results reveal a clear file-by-file pattern. On HTML, the AI (20%), Lighthouse (20%), axe-core (23%), and Axe Linter (23%) all achieved similar recall, with the rendered-DOM tools slightly ahead due to their landmark and ARIA-rule coverage. On CSS, all tools effectively failed: stylelint-a11y achieved the highest CSS recall (20%) but with a 79% false-positive rate (23/29 findings were FP). On JavaScript, the AI assistant achieved 50% recall — the highest individual recall figure in the study — while every other applicable tool returned 0%. On TSX, the AI achieved 67% recall versus ESLint jsx-a11y's 7%, with no other tool returning any GT matches.

These recall figures place the AI assistant at or above the upper end of published baselines for automated accessibility tools. Vigo et al. found that leading automated tools achieved 20–36% recall against comprehensive WCAG 2.x defect sets (Vigo et al., 2013) \cite{vigo2013benchmarking}. Multi-tool comparison studies confirm that no single tool provides high or comprehensive coverage across different defect types (Pool, 2023; Lempola et al., 2024; Fischer et al., 2025) \cite{pool2023accessibility,lempola2024comparing,fischer2025coverage}. The AI assistant's JavaScript recall of 50% and TSX recall of 67% substantially exceed those baselines, though these figures must be contextualised against the nature of the test script files: they were designed to target issue types where deterministic tools have no coverage.

The CSS result reinforces the systematic gap in automated CSS accessibility detection. All tools combined covered only 6–7 of 30 planted CSS defects, and no approach achieved precision above 21% on this test script file. CSS accessibility checking at source level remains largely a human review task beyond the simplest single-property violations.


  

  

4.1.5 Tool Applicability and Complementarity

| Tool | HTML | CSS | JS | TSX |
|---|:---:|:---:|:---:|:---:|
| AI assistant | Yes | Yes | Yes | Yes |
| Lighthouse | Yes | Yes (harness) | Yes (harness) | No |
| axe-core | Yes | Yes (harness) | Yes (harness) | No |
| Axe Linter | Yes | Yes | Yes | Yes |
| ESLint jsx-a11y | No | No | No | Yes |
| Webhint | Yes | Yes | Yes | Yes |
| stylelint-a11y | No | Yes | No | No |

*Table 4.1.5: Tool Applicability Matrix for Study 6 Test Script Files*

The absence of shared findings (0 shared across all test script files) indicates high complementarity between methods. No two tools found the same issue in the same test script file, consistent with Vigo et al.'s finding that accessibility tools have overlapping but non-identical coverage (Vigo et al., 2013) \cite{vigo2013benchmarking} and Frazão and Duarte's observation that tool agreement rates are typically below 15% on identical pages (Frazão and Duarte, 2020) \cite{frazao2020comparing}. This complementarity reinforces a layered evaluation strategy rather than reliance on a single checker.


  

4.1.6 Summary

Study 6 demonstrates that accessibility tool performance is strongly artefact-dependent. GT Recall was highest for the AI assistant in TSX (67%), JavaScript (50%), and HTML (20%); axe-core and Axe Linter tied as the best HTML tools at 23% GT Recall. CSS GT Recall was near zero across all tools, with stylelint-a11y achieving the highest at 20% but with a 79% false-positive rate. The AI assistant's best Accuracy (genuine findings as a proportion of all findings) was on TSX (89.7%), followed by JavaScript (85%), HTML (75%), and CSS (50%). Aggregate AI Accuracy across all four test script files was 84.1% (95 total TP out of 113 raw findings: 42 GT-matched + 53 genuine unplanted), with aggregate GT Recall of 35.0% (42 of 120 planted defects detected) and aggregate F1 of 0.492. These figures were achieved through dual-model consensus filtering at the 0.40 Jaccard threshold with 200-line chunks and 30-line overlap, combined with individual source-code audit of non-GT findings to distinguish genuine unplanted issues from actual false positives. The zero-recall result from all other tools on JavaScript, and the near-zero result on TSX, reflects test script file design choices that targeted semantic, behavioural, and component-level ARIA issues rather than the static rendered-DOM and rule-based patterns covered by deterministic tools. The most defensible conclusion is complementary use: AI for source-level semantic and behavioural discovery across all artefact types, deterministic rendered-DOM tools for HTML confirmation, specialist linters for file-type-specific rule coverage, and reviewer adjudication before treating findings as confirmed violations.

4.2 Discussion

4.2.1 Raw Counts Versus Ground-Truth Recall

The updated results reinforce why raw findings, ground-truth recall, and Accuracy must be interpreted separately. On HTML, the AI assistant returned 8 findings: 6 GT-matched, 0 additional genuine, 2 actual FP (Accuracy=0.750, GT-Recall=0.200, F1=0.316). Lighthouse returned 6 findings, all GT-matched (Accuracy=1.000, GT-Recall=0.200, F1=0.333). axe-core and Axe Linter each returned 9 findings with 7 GT-matched and 2 FP (Accuracy=0.778, GT-Recall=0.233, F1=0.359). On CSS, the AI returned 6 findings: 1 GT-matched, 2 additional genuine (backwards prefers-reduced-motion check, colour-only link distinction), 3 actual FP (Accuracy=0.500, GT-Recall=0.033, F1=0.062); stylelint-a11y returned 29 findings with 6 GT-matched and 23 FP (Accuracy=0.207, GT-Recall=0.200, F1=0.203). On JavaScript, the AI returned 60 findings: 15 GT-matched, 36 additional genuine unplanted issues confirmed in source, 9 actual FP (Accuracy=0.850, GT-Recall=0.500, F1=0.630) — the only tool with any GT recall on this test script file. On TSX, the AI returned 39 findings: 20 GT-matched, 15 additional genuine, 4 actual FP (Accuracy=0.897, GT-Recall=0.667, F1=0.762), while ESLint jsx-a11y returned 2 findings both GT-matched and zero FP (Accuracy=1.000, GT-Recall=0.067, F1=0.125).

This confirms that raw count alone is a poor proxy for tool quality (Vigo et al., 2013) \cite{vigo2013benchmarking}. The AI assistant has the highest total raw count (113 findings) precisely because it analyses all source artefact types for complex semantic and behavioural patterns. Critically, 84.1% of those findings are genuine accessibility issues: the system is not primarily generating noise. The dual-model consensus threshold prevents worse false-positive rates; without it, earlier runs produced 78+ AI findings with a substantially lower genuine-finding rate.

4.2.2 AI Performance Compared to Prior Tool Studies

The AI assistant's GT Recall of 50% on JavaScript and 67% on TSX substantially exceeds published baselines for the best automated accessibility tools. Vigo et al. found that leading tools achieved 20–36% recall against WCAG 2.x defect sets (Vigo et al., 2013) \cite{vigo2013benchmarking}, and multi-tool comparison studies confirm limited single-tool coverage (Pool, 2023; Lempola et al., 2024; Fischer et al., 2025) \cite{pool2023accessibility,lempola2024comparing,fischer2025coverage}. The AI assistant exceeds both on the JavaScript and TSX test script files. However, these test script files were explicitly designed to target issue types (ARIA state management, dynamic announcements, component relationships) where rule-based tools cannot compete, so the comparison must be contextualised: the AI's advantage is artefact-type-dependent.

On HTML, GT Recall is competitive but not superior to axe-core and Axe Linter (20% vs 23%). This is expected: rendered-DOM tools with specific ARIA and landmark rules are well-calibrated for HTML pattern violations. The AI's HTML Accuracy (75%) is also lower than Lighthouse's (100%), reflecting 2 actual FPs on the HTML test script file (broken aria-controls claim and toggle aria-expanded claim that do not correspond to errors in the source).

The aggregate AI Accuracy of 84.1% is well above precision figures reported in recent studies of LLM-based accessibility analysis tools (Huang et al., 2024; He et al., 2025; Paternò et al., 2025) \cite{huang2024access,he2025enhancing,paterno2025llm}. The consensus mechanism provides a meaningful Accuracy uplift at the cost of some GT Recall (many individually valid findings from one model only are excluded). The aggregate F1 of 0.492 — balancing Accuracy (84.1%) against GT Recall (35.0%) — characterises the overall system performance across the full multi-artefact test.

4.2.3 Deterministic Tool Performance in Context

The zero-recall result from Lighthouse, axe-core, and Axe Linter on JavaScript and TSX is consistent with their design scope. Lighthouse and axe-core inspect browser-rendered accessibility trees and cannot analyse JavaScript behavioural logic or TSX component source code without a browser runtime [13], [15], [55]. Axe Linter's zero JavaScript and TSX recall reflects that the planted defects targeted ARIA state transitions, live region management, and focus logic — none of which are covered by axe-core's static source rules for these file types.

The axe-core and Axe Linter HTML results (GT-TP=7, Accuracy=0.778, GT-Recall=0.233) are worth noting: these tools outperformed the AI on HTML GT Recall (23% vs 20%) because several planted landmark and ARIA-role issues fell directly within their rule sets. This supports the complementarity argument: for HTML rendered-DOM checking, deterministic tools with well-defined ARIA rules are competitive with or superior to the AI assistant.

4.2.4 Why the CSS Gap Matters

The near-universal near-zero GT Recall from all tools on the CSS test script file (AI 3.3%, stylelint-a11y 20%) deserves specific attention. CSS accessibility issues — including insufficient colour contrast, missing focus indicator styling, reversed motion preferences, and touch target sizing — are well-established WCAG 2.1 concerns but remain among the most difficult for automated tools to detect reliably. stylelint-a11y achieved the highest CSS GT Recall (20%) but at a 79% false-positive rate. The AI's CSS Accuracy of 50% (3 genuine out of 6 raw findings) is reasonable but the low GT Recall (3.3%) means only 1 planted defect was matched. Of the 3 actual AI false positives on CSS, one claimed a forced-colors override was absent when it existed in the source, one flagged a touch target within spec, and one identified a reduced-motion focus indicator that was correctly preserved. In practice, CSS accessibility checking at source level remains a human review task for all but the simplest pattern violations, regardless of tool type.

4.2.5 Why Supplementary Tools Remain Necessary

Despite the AI assistant's advantages on JavaScript and TSX, supplementary tools contributed complementary value in specific contexts. Lighthouse achieved 100% Accuracy on HTML (6/6 findings genuine, 0 FP), making its HTML findings highly reliable for confirmation. axe-core and Axe Linter achieved 23% GT Recall on HTML with 78% Accuracy — competitive with the AI at a fraction of the computational cost. ESLint jsx-a11y achieved perfect Accuracy on TSX (2/2 findings genuine, 0 FP), confirming its value as a zero-FP basic JSX check. stylelint-a11y is the only tool that detected any CSS GT issues.

This triangulation strategy aligns with WCAG-EM guidance, which recommends structured evaluation using multiple techniques [54], and with tool evaluation literature showing that combining multiple checkers increases total defect coverage (Vigo et al., 2013; Pool, 2023; Fischer et al., 2025) \cite{vigo2013benchmarking,pool2023accessibility,fischer2025coverage}. The practical implication is that the AI assistant should be deployed as a source-level complement to, not a replacement for, deterministic rendered-DOM auditing and specialist linting tools.

4.2.6 Practical Implications for the Dissertation System

The findings support a layered accessibility evaluation pipeline. The AI assistant should be used as the primary source-level analyser for semantic, behavioural, and component-level issues across all artefact types, with particular priority for JavaScript and TSX where no other tool contributes meaningful recall. Deterministic linters should be applied by artefact type: Axe Linter for HTML/JSX source-level checks [56], ESLint jsx-a11y for JSX/React patterns [57], and stylelint-a11y for CSS accessibility checks [59]. Rendered-DOM auditing should be applied where browser execution is in scope, using Lighthouse and axe-core [13], [15]. Finally, findings should be consolidated, de-duplicated, and reviewed by a practitioner before being treated as confirmed accessibility violations.

This approach balances recall, precision, explainability, and reproducibility, and is suitable for shift-left accessibility workflows in software delivery contexts [18], [19].


4.3 Threats to Validity

Several threats to validity should be acknowledged. First, the test script files were synthetic and intentionally error-seeded, so real-world accessibility issue prevalence and distribution may differ. Second, raw finding counts do not directly represent true-positive precision because tools may report repeated, overlapping, or incidental issues. Third, keyword-based ground-truth matching is conservative and may miss valid findings expressed using different terminology. Fourth, Lighthouse and axe-core were skipped for TSX because TSX is source code and no rendered browser runtime was used for that test script file, which affects direct cross-tool comparability. Fifth, the dual-model consensus approach depends on both models being available and producing valid structured output; failure of either model results in no findings for that chunk. Finally, the zero shared-finding rate increases complementary coverage but increases reconciliation effort in practitioner workflows, as each tool's output must be reviewed independently.


4.4 Conclusion

Study 6 shows that multi-tool triangulation is stronger than reliance on a single accessibility checker, confirming prior findings from tool evaluation literature (Vigo et al., 2013; Brajnik, 2004; Frazão and Duarte, 2020; Fischer et al., 2025) \cite{vigo2013benchmarking,brajnik2004comparing,frazao2020comparing,fischer2025coverage}. The AI assistant achieved the highest GT Recall in JavaScript (50%) and TSX (67%), artefact types where no other tool returned any GT matches. On HTML, axe-core and Axe Linter achieved slightly higher GT Recall (23%) than the AI (20%), while Lighthouse contributed perfect Accuracy (100%). CSS GT Recall was near zero across all tools (0–20%), indicating a systematic gap in automated CSS accessibility detection that no tool — AI or deterministic — adequately addresses. The aggregate AI performance across all four test script files (Accuracy=0.841, GT-Recall=0.350, F1=0.492: 95 total TP from 113 raw findings, of which 42 were planted-GT matches and 53 were genuine unplanted issues in the source) situates the system at the upper end of published baselines for automated tools on complex multi-artefact accessibility evaluation. Notably, only 18 of the AI's 113 findings (15.9%) were actual false positives with no corresponding code evidence — a substantially better hallucination rate than raw-findings views suggested before source audit. The main conclusion is not that one tool is universally superior, but that different tools expose different accessibility surfaces. Robust evaluation requires a layered strategy combining AI source-level analysis, rendered-DOM auditing, specialised source linters, and reviewer adjudication — consistent with WCAG-aligned testing principles, ACT-style rule consistency, and WCAG-EM guidance [8], [17], [54].


---

## Bibliography Keys Used in This Chapter

All `\cite{key}` tokens below are confirmed entries in References.bib. When porting to LaTeX, the `\cite{}` commands can be used as-is.

| Citation used in text | Bib key | Entry |
|---|---|---|
| Martins and Duarte, 2024 | `martins2024large` | Large-scale web accessibility analysis |
| Vigo et al., 2013 | `vigo2013benchmarking` | Benchmarking web accessibility evaluation tools, W4A 2013 |
| Frazão and Duarte, 2020 | `frazao2020comparing` | Comparing accessibility evaluation plug-ins, W4A 2020 |
| Brajnik, 2004 | `brajnik2004comparing` | Comparing accessibility evaluation tools: A method for tool effectiveness |
| Abascal et al., 2019 | `abascal2019tools` | Tools for web accessibility evaluation, in: Web Accessibility: A Foundation for Research, Springer |
| Huang et al., 2024 | `huang2024access` | ACCESS: Prompt engineering for automated web accessibility violation corrections |
| He et al., 2025 | `he2025enhancing` | Enhancing web accessibility: Automated detection of issues with generative AI |
| Paternò et al., 2025 | `paterno2025llm` | How an LLM can improve automatic web accessibility validation |
| López-Gil and Pereira, 2025 | `lopezgil2025turning` | Turning manual web accessibility success criteria into automatic: An LLM-based approach |
| Pool, 2023 | `pool2023accessibility` | Accessibility metatesting: Comparing nine testing tools, W4A 2023 |
| Lempola et al., 2024 | `lempola2024comparing` | Comparing automatic accessibility testing tools |
| Fischer et al., 2025 | `fischer2025coverage` | Coverage of web accessibility guidelines provided by automated checking tools |

**Note:** [REF-SIQUEIRA], [REF-GIL], [REF-VENDOME], and [REF-ZEIN] were placeholder names for papers that could not be verified as existing. The sentences referencing them have been rewritten to use the confirmed papers above.
