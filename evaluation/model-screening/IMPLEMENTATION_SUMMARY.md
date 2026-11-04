# Cloud-LLM-Preliminary — Implementation Summary

> Benchmarks 18 cloud LLMs against accessibility-error fixtures to identify the best model for the VS Code extension.
> Uses a single fixed inference preset so model quality is the only variable.

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Fixture Design — Literature Justification](#2-fixture-design--literature-justification)
3. [Fixture Catalogue](#3-fixture-catalogue)
4. [Inference Parameter Selection](#4-inference-parameter-selection)
5. [Novel Benchmarking Techniques](#5-novel-benchmarking-techniques)
6. [Scoring & Metrics](#6-scoring--metrics)
7. [RAG Integration](#7-rag-integration)
8. [File Reference](#8-file-reference)
9. [NPM Scripts](#9-npm-scripts)
10. [Prompt Engineering & Accuracy Fixes](#10-prompt-engineering--accuracy-fixes)
11. [2×2 Ablation Study — Results & Analysis](#11-22-ablation-study--results--analysis)
12. [References](#references)

---

## 1. Project Architecture

```
npm run bench:html
       │
       ▼
run.ts  ──────────────────────────────────────────►  reporter.ts
  │  parses CLI args                                  printReport()
  │  builds ModelBenchmarkConfig                      saveJson / saveCsv / saveReport
  │
  ▼
benchmark.ts → runBenchmark()
  │  for each model (sequential):
  │    for each fixture × run in parallel (up to --concurrency, default 2):
  │       1. Read fixture file
  │       2. Query RAG service  ──► http://127.0.0.1:8000
  │       3. Build prompt            returns WCAG chunks from knowledge-base/
  │       4. Stream Ollama  ─────► http://localhost:11434/api/chat
  │            retry up to 2× on "terminated" errors (2 s / 4 s back-off)
  │       5. parseTextResponse() → deduplicateIssues()
  │       6. scoreRun() → TP / FP / FN / TN
  │       7. Return ModelRunResult
  │
  ▼
ground-truth.ts (preset-benchmark)
  CORE_FIXTURES        — 16 fixtures (html/css/js/tsx x clean/low/medium/high)
  ADVERSARIAL_FIXTURES — 25 minimal edge-case HTML fixtures
  ALL_FIXTURES         — union of both (41 total)
```

**Models**: 18 cloud LLMs accessed via the local Ollama relay (`localhost:11434`). All model IDs carry a `:cloud` suffix, which causes `benchmark.ts` to send only the three cloud-safe inference options (`temperature`, `top_p`, `num_predict`) rather than the full local parameter set.

---

## 2. Fixture Design — Literature Justification

### 2.1 Script Sizes

To ensure that the experimental webpages were realistic and representative of current web practice, the sizes of the HTML, CSS, and JavaScript resources were based on large-scale web measurement data rather than arbitrary estimates. For HTML specifically, recent HTTP Archive Web Almanac data indicate that the median transferred HTML document size was 33 kB on desktop and 32 kB on mobile in 2024, suggesting that an HTML size in the 32–33 kB range is a reasonable benchmark for a typical modern webpage [1]. This benchmark was selected for the present study because it reflects contemporary web practice whilst remaining small enough to avoid artificially bloated page structures.

This decision is further supported by broader CMS-related findings reported in the 2024 Web Almanac. According to this dataset, most major CMS-driven websites deliver a median HTML size of approximately 22–38 kB, whilst larger outliers such as Wix can reach approximately 142 kB [2]. These findings suggest that an HTML document in the 32–33 kB range is realistic and well within the normal range for mainstream websites. On this basis, the HTML in this study was designed to align with this median benchmark rather than with unusually lightweight or excessively large pages [1], [2].

The CSS and JavaScript sizes were also grounded in HTTP Archive benchmark data. The 2022 Web Almanac reports that the median desktop page loads 72 kB of CSS and 509 kB of JavaScript, whilst the median mobile page loads 68 kB of CSS and 461 kB of JavaScript [3]. These values were used as practical reference points when defining the CSS and JavaScript resources for the experimental webpages. Therefore, the final prototype versions were developed around approximately 32–33 kB of HTML, 68–72 kB of CSS, and 461–509 kB of JavaScript, ensuring that the scripts and document structure reflected the composition of a realistic median webpage rather than a simplified prototype [1], [3].

### 2.2 Error Levels

The number of accessibility errors introduced into each version was likewise based on published empirical evidence. Martins and Duarte conducted a large-scale accessibility analysis of 2,884,498 web pages from 166,311 websites and found an average of 30 accessibility errors per page and 521 errors per website [4]. Their study also reported that only a very small proportion of pages were free from detected barriers, with around 0.5% of pages containing no errors, and approximately 63% of pages containing more than 10 errors [4]. These findings provide a strong basis for defining realistic low, medium, and high error conditions in an experimental setting.

A second study by Fernandes et al. offers additional support for the higher-error condition used in this research. Their analysis of healthcare-related web resources found that homepages contained an average of 51 accessibility errors when evaluated using WAVE, making them the page type with the greatest number of detected barriers in their sample [5]. This shows that webpages with approximately 50 errors are plausible in real-world contexts and are not unrealistic extremes [5].

Based on these findings, the four webpage versions in this study were operationalised as follows: a clean version with 0 detectable accessibility errors, a low-error version with 10 errors, a medium-error version with 30 errors, and a high-error version with 50 errors. The clean version was used as an intentionally accessible baseline, even though Martins and Duarte found that pages with zero errors are rare in practice [4]. The low-error version was set at 10 errors because the same study showed that webpages exceeding this threshold are already common, with around 63% of pages containing more than 10 errors [4]. The medium-error version was aligned directly with the reported average of 30 errors per page [4], whilst the high-error version was based on the 51 average homepage errors reported by Fernandes et al. [5]. Together, these levels provide a progression that is experimentally clear and grounded in prior literature rather than subjective judgement.

Overall, both the script sizes and the accessibility-error levels were selected using recent published benchmarks. The resource sizes were based on HTTP Archive Web Almanac data describing the composition of median contemporary webpages [1]–[3], whilst the accessibility-error levels were derived from large-scale empirical studies of real web pages and homepages [4], [5]. This helped ensure that the clean, low-error, medium-error, and high-error versions used in the study were credible research artefacts grounded in evidence.

---

## 3. Fixture Catalogue

### HTML Fixtures

#### html-low.html — 10 errors

| # | Line | WCAG SC | Error |
|---|------|---------|-------|
| 1 | 2 | 3.1.1 (A) | `<html>` has no `lang` attribute |
| 2 | 103 | 4.1.2 (A) | Search submit button has no accessible name — `aria-label` and `<span class="sr-only">` both removed |
| 3 | 135 | 2.4.4 (A) | Hero primary CTA text changed to "Click here" (vague link purpose) |
| 4 | 302 | 1.3.1 (A) | How-it-works step 3 heading jumps `<h2>` → `<h5>`, skipping h3 and h4 |
| 5 | 360 | 1.1.1 (A) | axe Runner product card image has no `alt` attribute |
| 6 | 579 | 1.3.1 (A) | Comparison table column `<th>` elements have no `scope="col"` |
| 7 | 743 | 4.1.1 (A) | FAQ section gets `id="contact"`, duplicating the contact section's ID |
| 8 | 895 | 1.3.1 (A) | Newsletter email `<input>` has no associated `<label>` (only a placeholder) |
| 9 | 1054 | 1.1.1 (A) | Footer logo linked image has no `alt` attribute |
| 10 | 1122 | 3.2.2 (A) | Twitter link uses bare `target="_blank"` with no advance warning (no `aria-label`, no `rel`, no sr-only text) |

#### html-medium.html — 30 errors

| # | Line | WCAG | Error |
|---|------|------|-------|
| 1 | 2 | 3.1.1 | `<html>` missing `lang` |
| 2 | 7 | 2.4.2 | `<title>` is empty |
| 3 | ~93 | 1.3.1 | Search `<label>` deleted |
| 4 | 102 | 4.1.2 | Search submit button has no accessible name |
| 5 | 134 | 2.4.4 | Hero CTA changed to "Read more" |
| 6 | 159 | 1.3.1 | Logo bar `<section>` `aria-label` removed |
| 7 | 163 | 1.1.1 | Nova Health logo image missing `alt` |
| 8 | 176 | 1.3.1 | Features `<h2>` `id` removed — breaks `aria-labelledby` |
| 9 | 149 | 1.1.1 | Hero dashboard image missing `alt` |
| 10 | 189 | 2.4.4 | Scanner feature link changed to "Learn more" |
| 11 | 274 | 1.3.1 | How-it-works step 1 heading `<h3>` → `<h5>` |
| 12 | 281 | 1.1.1 | Step 1 image missing `alt` |
| 13 | 337 | 4.1.2 | "All tools" filter button missing `aria-pressed` |
| 14 | 375 | 1.1.1 | Contrast Studio image missing `alt` |
| 15 | 385 | 2.4.4 | Contrast Studio CTA changed to "Click here" |
| 16 | 492 | 1.3.1 | Pricing toggle `<div>` missing `role="group"` |
| 17 | 521 | 1.3.1 | Featured plan `<li>` missing `aria-label="Recommended plan"` |
| 18 | 573 | 1.3.1 | Comparison table `<caption>` removed |
| 19 | 576–579 | 1.3.1 | All column `<th>` elements missing `scope="col"` |
| 20 | 584 | 1.3.1 | "Projects" row `<th>` missing `scope="row"` |
| 21 | 603–605 | 1.3.1 | axe Runner row data cells missing `aria-label` |
| 22 | 670 | 1.1.1 | Priya testimonial avatar missing `alt` |
| 23 | 747 | 4.1.2 | FAQ #1 button missing `aria-controls` |
| 24 | 755 | 1.3.1 | FAQ #1 `<dd>` missing `role="region"` and `aria-labelledby` |
| 25 | 890 | 1.3.1 | Newsletter email `<input>` has no `<label>` |
| 26 | 890 | 1.3.1 | Newsletter email `<input>` missing `aria-describedby` |
| 27 | 964 | 1.3.1 | Contact email `<input>` has no `<label>` |
| 28 | 997 | 1.3.1 | Interest `<fieldset>` missing `<legend>` |
| 29 | 1043 | 1.1.1 | Footer logo image missing `alt` |
| 30 | 1117 | 4.1.2 | GitHub social link missing `aria-label` |

#### html-high.html — 50 errors

| # | Line | WCAG | Error |
|---|------|------|-------|
| 1 | 2 | 3.1.1 | `<html>` missing `lang` |
| 2 | 7 | 2.4.2 | `<title>` is empty |
| 3 | 24 | 2.4.1 | All 3 skip links removed |
| 4 | 36 | 1.3.1 | Primary `<nav>` missing `aria-label` |
| 5 | 37 | 4.1.2 | Nav toggle button: `aria-expanded`, `aria-controls`, `aria-label` removed |
| 6 | 49 | 4.1.2 | Solutions submenu button: `aria-expanded`, `aria-controls`, `aria-haspopup` removed |
| 7 | 86 | 1.3.1 | Search `<input>` has no `<label>` |
| 8 | 94 | 4.1.2 | Search submit button has no accessible name |
| 9 | 95 | 4.1.2 | sr-only text from search button deleted |
| 10 | 100 | 1.3.1 | Account `<nav>` missing `aria-label` |
| 11 | 111 | 2.4.1 | `<main>` missing `id` — skip link target broken |
| 12 | 114 | 4.1.3 | `aria-live` status region removed |
| 13 | 117 | 1.3.1 | Hero `<section>` missing `aria-labelledby` |
| 14 | 126 | 2.4.4 | Hero CTA changed to "Read more" |
| 15 | 141 | 1.1.1 | Hero dashboard image missing `alt` |
| 16 | 151 | 1.3.1 | Logo bar `<section>` missing `aria-label` |
| 17 | 155 | 1.1.1 | Nova Health logo missing `alt` |
| 18 | 168 | 1.3.1 | Features `<h2>` missing `id` — breaks `aria-labelledby` |
| 19 | 181 | 2.4.4 | Scanner feature link changed to "Learn more" |
| 20 | 266 | 1.3.1 | Step 1 heading `<h3>` → `<h5>` |
| 21 | 273 | 1.1.1 | Step 1 image missing `alt` |
| 22 | 325 | 1.3.1 | Filter group `<div>` missing `aria-labelledby` |
| 23 | 329 | 4.1.2 | "All tools" filter button missing `aria-pressed` |
| 24 | 346 | 1.3.1 | Product grid `<ul>` missing `aria-label` |
| 25 | 367 | 1.1.1 | Contrast Studio image missing `alt` |
| 26 | 377 | 2.4.4 | Contrast Studio CTA changed to "Click here" |
| 27 | 484 | 1.3.1 | Pricing toggle `<div>` missing `role="group"` |
| 28 | 513 | 1.3.1 | Featured plan `<li>` missing `aria-label` |
| 29 | 565 | 1.3.1 | Comparison table `<caption>` removed |
| 30 | 568 | 1.3.1 | All column `<th>` missing `scope="col"` |
| 31 | 576 | 1.3.1 | "Projects" row `<th>` missing `scope="row"` |
| 32 | 582 | 1.3.1 | "Component scans" row `<th>` missing `scope="row"` |
| 33 | 595 | 1.3.1 | axe Runner cells missing `aria-label` |
| 34 | 662 | 1.1.1 | Priya testimonial avatar missing `alt` |
| 35 | 681 | 1.1.1 | Marcus testimonial avatar missing `alt` |
| 36 | 739 | 4.1.2 | FAQ #1 button missing `aria-controls` |
| 37 | 747 | 1.3.1 | FAQ #1 `<dd>` missing `role="region"` and `aria-labelledby` |
| 38 | 759 | 4.1.2 | FAQ #2 button missing `aria-expanded` |
| 39 | 779 | 4.1.2 | FAQ #3 button missing `aria-expanded` |
| 40 | 880 | 1.3.1 | Newsletter email `<input>` has no `<label>` |
| 41 | 880 | 1.3.1 | Newsletter email `<input>` missing `aria-describedby` |
| 42 | 952 | 1.3.1 | Contact email `<input>` has no `<label>` |
| 43 | 952 | 1.3.1 | Label block multi-line deletion |
| 44 | 928 | 1.3.1 + 1.3.5 | Contact first-name input: `aria-required` and `autocomplete` removed |
| 45 | 985 | 1.3.1 | Interest `<fieldset>` missing `<legend>` |
| 46 | 1001 | 1.3.1 | Contact textarea missing `aria-describedby` |
| 47 | 1030 | 1.1.1 | Footer logo image missing `alt` |
| 48 | 1042 | 1.3.1 | Footer Products `<nav>` missing `aria-label` |
| 49 | 1104 | 4.1.2 | GitHub social link missing `aria-label` |
| 50 | 1110 | 4.1.2 | LinkedIn social link missing `aria-label` |

---

### CSS Fixtures

#### css-low.css — 10 errors

| # | Line | WCAG | Error |
|---|------|------|-------|
| 1 | 40 | 1.4.3 | `--colour-text-secondary` → `#aaaaaa` (~2.3:1 on white, fails 4.5:1) |
| 2 | 55 | 2.4.11 | `--colour-focus-ring` → `#aaaaaa` (~2.3:1, fails 3:1 non-text) |
| 3 | 197 | 1.4.4 | Root `font-size: 12px` — fixed px locks out user preference |
| 4 | 243 | 1.4.12 | `p { line-height: 1 }` — below required 1.5× for body text |
| 5 | 434 | 2.4.7 / 2.4.11 | Global `:focus-visible { outline: none }` — removes all focus indicators |
| 6 | 531 | 2.4.1 | `.skip-link:focus` missing `transform: translateY(0)` — never becomes visible |
| 7 | 547 | 2.3.3 | `@media (prefers-reduced-motion)` block emptied |
| 8 | 468 | 1.3.1 | `.sr-only` → `position: static; width/height: auto` — class broken |
| 9 | 707 | 2.5.8 | `.btn { min-height: 32px }` — below 44 px touch target |
| 10 | 731 | 2.4.7 | `.btn:focus-visible { outline: none }` — buttons lose focus ring |

#### css-medium.css — 30 errors

| # | Line | WCAG | Error |
|---|------|------|-------|
| 1 | 4 | 1.4.3 | `--colour-brand-primary: #5588bb` (~3.5:1 on white, fails 4.5:1) |
| 2 | 40 | 1.4.3 | `--colour-text-secondary: #aaaaaa` (~2.3:1) |
| 3 | 55 | 1.4.11 | `--colour-focus-ring: #aaaaaa` (~2.3:1, fails 3:1) |
| 4 | 197 | 1.4.4 | `html { font-size: 12px }` fixed px |
| 5 | 225 | 1.4.12 | `body { word-spacing: -0.2em; letter-spacing: -0.05em }` |
| 6 | 245 | 1.4.12 | `p { line-height: 1 }` |
| 7 | 253 | 1.4.1 | `a { text-decoration: none }` — links indistinguishable from text |
| 8 | 437 | 2.4.11 | Global `:focus-visible { outline: none }` |
| 9 | 450 | 2.4.11 | `@media (forced-colors)` `:focus-visible { outline: none }` |
| 10 | 471 | 1.3.1 | `.sr-only { position: static; width: auto }` — broken |
| 11 | 534 | 2.4.1 | `.skip-link:focus` transform removed |
| 12 | 550 | 2.3.3 | Global `prefers-reduced-motion` block emptied |
| 13 | 710 | 2.5.8 | `.btn { min-height: 32px }` |
| 14 | 734 | 2.4.11 | `.btn:focus-visible { outline: none }` |
| 15 | 821 | 2.5.8 | `.btn-sm { min-height: 20px }` |
| 16 | 828 | 2.5.8 | `.btn-lg { min-height: 36px }` |
| 17 | 836 | 2.5.8 | `.btn-icon { min-width/height: 20px }` |
| 18 | 893 | 2.5.8 | `.nav-toggle { min-height/width: 28px }` |
| 19 | 912 | 2.4.11 | `.nav-toggle:focus-visible { outline: none }` |
| 20 | 948 | 2.5.8 | `#nav-menu > li > a, button { min-height: 28px }` |
| 21 | 994 | 2.5.8 | `[id$="-submenu"] li a { min-height: 28px }` |
| 22 | 1004 | 2.4.11 | `[id$="-submenu"] li a:focus-visible { outline: none }` |
| 23 | 1024 | 2.5.8 | `#search-input { height: 28px }` |
| 24 | 1053 | 2.4.11 | `#search-input:focus-visible { outline: none }` |
| 25 | 1079 | 2.4.11 | `#site-search button[type="submit"]:focus-visible { outline: none }` |
| 26 | 1107 | 2.4.11 | `nav[aria-label="Account navigation"] a:focus-visible { outline: none }` |
| 27 | 1291 | 2.3.3 | Hero image `prefers-reduced-motion` block emptied |
| 28 | 1208 | 2.5.8 | `.hero-ctas .btn-primary { min-height: 32px }` |
| 29 | 1227 | 2.5.8 | `.hero-ctas .btn-secondary { min-height: 32px }` |
| 30 | 1019 | 1.3.1 | `#site-search label.sr-only { display: none }` |

#### css-high.css — 50 errors

| # | Line | WCAG | Error |
|---|------|------|-------|
| 1 | 4 | 1.4.3 | `--colour-brand-primary: #5588bb` |
| 2 | 7 | 1.4.3 | `--colour-brand-secondary: #bb88ee` (~3.1:1 on white) |
| 3 | 21 | 1.4.3 | `--colour-neutral-900: #555555` (~5.7:1 — weakens primary text) |
| 4 | 32 | 1.4.3 | `--colour-error: #ee9999` (~2.8:1 — fails for required markers) |
| 5 | 40 | 1.4.3 | `--colour-text-secondary: #aaaaaa` |
| 6 | 55 | 1.4.11 | `--colour-focus-ring: #aaaaaa` |
| 7 | 197 | 1.4.4 | `html { font-size: 12px }` |
| 8 | 225 | 1.4.12 | `body { word-spacing: -0.2em; letter-spacing: -0.05em }` |
| 9 | 245 | 1.4.12 | `p { line-height: 1 }` |
| 10 | 253 | 1.4.1 | `a { text-decoration: none }` |
| 11 | 437 | 2.4.11 | Global `:focus-visible { outline: none }` |
| 12 | 450 | 2.4.11 | High-contrast mode `:focus-visible { outline: none }` |
| 13 | 471 | 1.3.1 | `.sr-only { position: static }` — broken |
| 14 | 534 | 2.4.1 | `.skip-link:focus` transform removed |
| 15 | 555 | 2.4.1 | `forced-color-adjust: none` removed from skip-link HCM rule |
| 16 | 550 | 2.3.3 | Global reduced-motion block emptied |
| 17 | 709 | 2.5.8 | `.btn { min-height: 32px }` |
| 18 | 733 | 2.4.11 | `.btn:focus-visible { outline: none }` |
| 19 | 820 | 2.5.8 | `.btn-sm { min-height: 20px }` |
| 20 | 827 | 2.5.8 | `.btn-lg { min-height: 36px }` |
| 21 | 835 | 2.5.8 | `.btn-icon { min-width/height: 20px }` |
| 22 | 871 | 2.4.11 | `.header-inner > a:first-child:focus-visible { outline: none }` |
| 23 | 892 | 2.5.8 | `.nav-toggle { min-height/width: 28px }` |
| 24 | 911 | 2.4.11 | `.nav-toggle:focus-visible { outline: none }` |
| 25 | 947 | 2.5.8 | `#nav-menu > li > a, button { min-height: 28px }` |
| 26 | 993 | 2.5.8 | `[id$="-submenu"] li a { min-height: 28px }` |
| 27 | 1003 | 2.4.11 | `[id$="-submenu"] li a:focus-visible { outline: none }` |
| 28 | 1017 | 1.3.1 | `#site-search label.sr-only { display: none }` |
| 29 | 1023 | 2.5.8 | `#search-input { height: 28px }` |
| 30 | 1052 | 2.4.11 | `#search-input:focus-visible { outline: none }` |
| 31 | 1078 | 2.4.11 | `#site-search button[type="submit"]:focus-visible { outline: none }` |
| 32 | 1106 | 2.4.11 | `nav[aria-label="Account navigation"] a:focus-visible { outline: none }` |
| 33 | 1207 | 2.5.8 | `.hero-ctas .btn-primary { min-height: 32px }` |
| 34 | 1226 | 2.5.8 | `.hero-ctas .btn-secondary { min-height: 32px }` |
| 35 | 1290 | 2.3.3 | Hero image reduced-motion block emptied |
| 36 | 1499 | 2.4.11 | `.feature-card a:focus-visible { outline: none }` |
| 37 | 1746 | 2.5.8 | `.filter-tabs button { min-height: 28px }` |
| 38 | 1775 | 2.4.11 | `.filter-tabs button:focus-visible { outline: none }` |
| 39 | 1899 | 2.5.8 | `.product-body .btn-secondary { min-height: 28px }` |
| 40 | 1977 | 1.4.3 | `.stat-label { color: rgba(255,255,255,0.3) }` (~1.5:1 on brand gradient) |
| 41 | 2045 | 2.5.8 | `.pricing-toggle button { min-height: 28px }` |
| 42 | 2075 | 2.4.11 | `.pricing-toggle button:focus-visible { outline: none }` |
| 43 | 2293 | 2.4.11 | `.table-wrapper:focus-visible { outline: none }` |
| 44 | 2505 | 2.4.11 | `.faq-item dt button:focus-visible { outline: none }` |
| 45 | 2550 | 2.4.11 | `.form-group input/select/textarea:focus-visible { outline: none }` |
| 46 | 2560 | 2.4.11 | `.form-group input[type="checkbox"]:focus-visible { outline: none }` |
| 47 | 2583 | 2.4.11 | `.footer-brand a:focus-visible { outline: none }` |
| 48 | 2590 | 2.4.11 | `footer nav a:focus-visible { outline: none }` |
| 49 | 2598 | 2.5.8 | `.social-links a { min-height: 28px }` |
| 50 | 2600 | 2.4.11 | `.social-links a:focus-visible { outline: none }` |

---

### JavaScript Fixtures

#### js-low.js — 10 errors

| # | Line | WCAG | Error |
|---|------|------|-------|
| 1 | 4725 | 1.3.1 / 3.3.1 | `markInvalid()` — `setAttr(field, 'aria-invalid', 'true')` removed; `addDescribedBy` shifted to fill (no blank placeholder) |
| 2 | 5020 | 4.1.2 | Mobile nav `open()` — `setAttr(_trigger, 'aria-expanded', 'true')` removed; blank line marks deletion |
| 3 | 5030–5032 | 2.1.1 | Mobile nav `open()` — entire `createFocusTrap` block removed; three blank lines mark deletion site |
| 4 | 5067 | 4.1.3 | Mobile nav `close()` — `liveRegion.announce(…)` removed; blank line before closing brace |
| 5 | 5266 | 4.1.2 | Desktop dropdown `_openInstance()` — `setAttr(inst.trigger, 'aria-expanded', 'true')` removed; blank after `inst.open = true` |
| 6 | 7354 | 4.1.3 | Search `highlight()` — `liveRegion.announce(…)` removed; blank line before closing brace |
| 7 | 7942 | 4.1.2 | Product filter `_syncTabAriaStates()` — `setAttr(btn, 'aria-pressed', …)` removed; `toggleClass` shifted to fill |
| 8 | 8842 | 4.1.2 | Pricing `_syncToggleState()` — `setAttr(btn, 'aria-pressed', …)` removed; `toggleClass` shifted to fill |
| 9 | 9703 | 4.1.2 | FAQ accordion `open()` — `setAttr(item.trigger, 'aria-expanded', 'true')` removed; `addClass` shifted to fill |
| 10 | 9765 | 4.1.3 | FAQ accordion `close()` — `liveRegion.announce(…)` removed; blank line before closing |

#### js-medium.js — 30 errors

| # | Line | WCAG | Error |
|---|------|------|-------|
| 1 | 4725 | 3.3.1 | `markInvalid()` — `aria-invalid='true'` not set |
| 2 | 4736 | 3.3.1 | `markValid()` — `aria-invalid` not removed (blank after guard) |
| 3 | 5019 | 4.1.2 | Nav `open()` — `aria-expanded='true'` not set (blank after `_open = true`) |
| 4 | 5029 | 2.1.1 | Nav `open()` — focus trap block removed (blank after `_lockScroll()`) |
| 5 | 5045 | 4.1.2 | Nav `close()` — `aria-expanded='false'` not set (blank after `_open = false`) |
| 6 | 5063 | 4.1.3 | Nav `close()` — announce removed (blank before closing `}`) |
| 7 | 5132 | 4.1.2 | Nav `init()` — initial `aria-expanded='false'` not set (blank after `_initialised = true`) |
| 8 | 5135 | 4.1.2 | Nav `init()` — `aria-controls` not set (blank after `addEventListener` calls) |
| 9 | 5254 | 4.1.2 | Dropdown `_openInstance()` — `aria-expanded='true'` not set (blank after `inst.open = true`) |
| 10 | 5270 | 4.1.2 | Dropdown `_closeInstance()` — `aria-expanded='false'` not set (blank after `inst.open = false`) |
| 11 | 5792 | 4.1.3 | ScrollToTop — announce removed (blank before closing `}` of `_onClick`) |
| 12 | 5811 | 4.1.2 | ScrollToTop `init()` — `aria-hidden='true'` not set (blank after `_btn.setAttribute('hidden', '')`) |
| 13 | 6151 | 4.1.3 | Alt+S shortcut — announce after `input.focus()` removed |
| 14 | ~7195 | 4.1.2 | Search `init()` — `aria-expanded='false'` not set (within init starting L7160) |
| 15 | 7078 | 4.1.3 | Search `_onFormSubmit()` — announce removed (after `recentQueries.add`, before `_close()`) |
| 16 | 7100 | 4.1.3 | Search `clear()` — announce removed (after `_searchState.query = ''`) |
| 17 | 7336 | 4.1.3 | Search `highlight()` — announce removed (blank before closing `}`) |
| 18 | 7820 | 4.1.3 | Product filter — results count announce removed (in animation callback, after `_syncPagination`) |
| 19 | 7917 | 4.1.2 | Product filter `_syncTabAriaStates()` — `aria-pressed` not set (shifted; `toggleClass` now occupies this line) |
| 20 | 7990 | 4.1.3 | View mode change — announce removed (blank after `aria-pressed` sync loop) |
| 21 | 8032 | 4.1.3 | `resetFilters()` — announce removed (blank before closing `}`) |
| 22 | 8794 | 4.1.3 | Pricing billing period change — announce removed (blank before closing `}` of `setPeriod`) |
| 23 | 8807 | 4.1.2 | Pricing `_syncToggleState()` — `aria-pressed` not set (`aria-selected` shifted to occupy this line) |
| 24 | ~9001 | 4.1.3 | Comparison table expand — announce removed (after if/else block, before closing `}`) |
| 25 | 9241 | 4.1.3 | `scrollToPlan()` — announce removed (blank before closing `}`) |
| 26 | 9663 | 4.1.2 | FAQ `open()` — `aria-expanded='true'` not set (blank before `item.open = true`) |
| 27 | 9691 | 4.1.3 | FAQ `open()` — "expanded" announce removed (blank before closing `}`) |
| 28 | 9722 | 4.1.3 | FAQ `close()` — "collapsed" announce removed (blank before closing `}`) |
| 29 | 9740 | 4.1.3 | FAQ `openAll()` — announce removed (closing `}` shifted up; no blank) |
| 30 | 9747 | 4.1.3 | FAQ `closeAll()` — announce removed (closing `}` shifted up; no blank) |

#### js-high.js — 50 errors (20 additional on top of medium's 30)

| # | Line | WCAG | Error |
|---|------|------|-------|
| 31 | 5031 | 4.1.3 | Nav `open()` — "menu opened" announce removed |
| 32 | 5273 | 2.4.3 | Dropdown `_closeInstance()` — `inst.trigger.focus()` not called on close |
| 33 | 5437 | 4.1.2 | Dropdown `register()` — initial `aria-expanded='false'` not set |
| 34 | 5743 | 4.1.2 | ScrollToTop `_update()` — `aria-hidden='false'` not cleared when shown |
| 35 | 5751 | 4.1.2 | ScrollToTop `_update()` — `aria-hidden='true'` not set when hidden |
| 36 | 5863–5864 | 4.1.2 | Breadcrumb — `aria-current='page'` not set on last item |
| 37 | 5866 | 4.1.2 | Breadcrumb — separators `aria-hidden='true'` not set |
| 38 | 6144 | 4.1.3 | Alt+N shortcut — "Navigation focused" announce removed |
| 39 | 6153 | 4.1.3 | Alt+M shortcut — "Main content focused" announce removed |
| 40 | 6162 | 4.1.3 | Alt+F shortcut — "Footer focused" announce removed |
| 41 | 6668 | 4.1.2 | Search `render()` — `aria-expanded='true'` not set when suggestions shown |
| 42 | 6694 | 4.1.2 | Search `setActiveIndex()` — `aria-selected` not updated on suggestion items |
| 43 | 6712 | 4.1.2 | Search `show()` — `aria-expanded='true'` not set |
| 44 | 6720–6721 | 4.1.2 | Search `hide()` — `aria-expanded='false'` + `aria-activedescendant` not cleared |
| 45 | 6935 | 4.1.3 | `_selectSuggestion()` — "Navigating to…" announce removed |
| 46 | 7642 | 4.1.2 | Product card reduced-motion — `aria-hidden='true'` not set on hidden cards |
| 47 | 7837 | 4.1.2 | Pagination — `aria-label` not updated |
| 48 | 8780 | 4.1.2 | Pricing `_syncToggleState()` — `aria-selected` not set on period buttons |
| 49 | 8786 | 4.1.2 | Pricing toggle — `aria-checked` not set on toggle switch |
| 50 | 9193 | 4.1.2 | Comparison table — `aria-selected` not set on highlighted column header |

---

### TSX Fixtures

#### tsx-low.tsx — 10 errors

| # | Line | WCAG | Error |
|---|------|------|-------|
| 1 | 1377 | 3.3.1 | `TextInput` — `aria-invalid` prop removed; invalid state invisible to AT |
| 2 | 1595 | 4.1.2 | Desktop nav dropdown trigger — `aria-expanded` removed; open state not communicated |
| 3 | 2092 | 1.1.1 | Hero media div — `aria-hidden="true"` removed; decorative video exposed to AT |
| 4 | 2110 | 4.1.2 | Video pause/play button — `aria-pressed` removed; pressed state not communicated |
| 5 | 2471 | 4.1.2 | Filter tab buttons — `aria-pressed` removed; active filter state not communicated |
| 6 | 2766 | 4.1.2 | Billing "Monthly" button — `aria-pressed` removed |
| 7 | 2774 | 4.1.2 | Billing "Annual" button — `aria-pressed` removed |
| 8 | 3041 | 1.3.1 | Carousel slides — `aria-hidden={!isVisible}` removed; hidden slides exposed to AT |
| 9 | 3149 | 4.1.2 | FAQ accordion trigger — `aria-expanded` removed; open/closed state not communicated |
| 10 | 3360 | 3.3.2 | Newsletter email input — `aria-required="true"` removed; required state not programmatic |

#### tsx-medium.tsx — 30 errors

| # | Line | WCAG | Error |
|---|------|------|-------|
| 1 | 1051 | 2.4.1 | `SkipLinks` nav — `aria-label` removed, landmark has no name |
| 2 | 1397 | 3.3.1 | `Textarea` — `aria-invalid` removed |
| 3 | 1463 | 3.3.1 | `Checkbox` — `aria-invalid` removed |
| 4 | 1543 | 4.1.2 | `SiteLogo` anchor — `aria-label` removed, icon-link has no name |
| 5 | 1673 | 4.1.2 | Desktop nav links — `aria-current="page"` removed |
| 6 | 1735 | 4.1.3 | Mobile nav panel — `aria-modal="true"` removed |
| 7 | 1764 | 4.1.2 | Mobile nav section toggle — `aria-expanded` removed |
| 8 | 1793 | 4.1.2 | Mobile nav links — `aria-current="page"` removed |
| 9 | 1998 | 4.1.2 | Hamburger button — `aria-expanded` removed |
| 10 | 2080 | 1.3.1 | Hero `<section>` — `aria-labelledby` removed, landmark unlabelled |
| 11 | 2128 | 4.1.2 | Hero CTAs div — `aria-label` removed |
| 12 | 2148 | 1.3.1 | Hero trust div — `aria-label="Trust indicators"` removed |
| 13 | 2187 | 1.1.1 | `StatItem` — `aria-label` removed, formatted value unreadable |
| 14 | 2208 | 1.3.1 | `StatsBar` `<section>` — `aria-labelledby` removed |
| 15 | 2287 | 1.3.1 | Integrations clone list — `aria-hidden="true"` removed, duplicate exposed |
| 16 | 2810 | 4.1.2 | Plan card `<li>` — `aria-label="Recommended plan"` removed |
| 17 | 2817 | 1.3.1 | Plan card `<article>` — `aria-labelledby` removed |
| 18 | 2853 | 2.4.6 | Plan CTA link — `aria-label` removed, generic "Get started" text |
| 19 | 3069 | 4.1.2 | Carousel "Previous" button — `aria-label` removed |
| 20 | 3076 | 4.1.2 | Carousel "Next" button — `aria-label` removed |
| 21 | 3091 | 4.1.2 | Testimonial dot buttons — `aria-current` removed |
| 22 | 3503 | 3.3.2 | Contact name — `aria-required="true"` removed |
| 23 | 3524 | 3.3.2 | Contact email — `aria-required="true"` removed |
| 24 | 3545 | 3.3.2 | Contact subject — `aria-required="true"` removed |
| 25 | 3566 | 3.3.2 | Contact message — `aria-required="true"` removed |
| 26 | 3746 | 2.4.1 | Footer social `<nav>` — `aria-label` removed, unlabelled landmark |
| 27 | 3771 | 2.4.1 | Footer nav `<nav>` — `aria-label` removed, unlabelled landmark |
| 28 | 3783 | 2.4.6 | Back-to-top button — `aria-label` removed |
| 29 | 3863 | 4.1.2 | Modal `<div>` — `aria-labelledby` removed, dialog unlabelled |
| 30 | 3953 | 4.1.3 | `NotificationContainer` — `aria-label="Notifications"` removed |

#### tsx-high.tsx — 50 errors (20 additional on top of medium's 30)

| # | Line | WCAG | Error |
|---|------|------|-------|
| 1 | 1078 | 1.1.1 | `StarRating` — `role="img"` removed |
| 2 | 1079 | 1.1.1 | `StarRating` inner span — `aria-hidden="true"` removed |
| 3 | 1163 | 4.1.2 | `Button` — `aria-busy` removed; loading state invisible to AT |
| 4 | 1172 | 4.1.2 | Button spinner span — `aria-hidden="true"` removed |
| 5 | 1281 | 4.1.2 | Spinner ring span — `aria-hidden="true"` removed |
| 6 | 1304 | 4.1.3 | `ErrorMessage` span — `role="alert"` removed |
| 7 | 1336 | 1.3.1 | `FormGroup` label — `htmlFor` removed |
| 8 | 1340 | 1.3.1 | Required marker span — `aria-hidden="true"` removed; `*` read aloud |
| 9 | 1426 | 3.3.1 | `Select` — `aria-invalid` removed |
| 10 | 1492 | 1.3.1 | `Section` component — `aria-labelledby` removed |
| 11 | 1600 | 1.3.1 | `NavDropdown` chevron — `aria-hidden="true"` removed |
| 12 | 1605 | 4.1.2 | `NavDropdown` submenu `<ul>` — `aria-labelledby` removed |
| 13 | 1648 | 2.4.1 | `DesktopNav` `<nav>` — `aria-label` removed |
| 14 | 1723 | 1.3.1 | Mobile nav backdrop — `aria-hidden="true"` removed |
| 15 | 1741 | 4.1.2 | Mobile nav close `IconButton` — `aria-label` removed |
| 16 | 1750 | 2.4.1 | Mobile nav `<nav>` — `aria-label` removed |
| 17 | 1840 | 4.1.2 | `ThemeToggle` `IconButton` — `aria-label` removed |
| 18 | 1875 | 3.3.2 | `SearchInput` form — `role="search"` removed |
| 19 | 1983 | 1.3.1 | Account actions `<div>` — `aria-label` removed |
| 20 | 2089 | 1.3.1 | Hero overlay `<div>` — `aria-hidden="true"` removed |
| 21 | 2246 | 1.3.1 | `IntegrationsBar` `<section>` — `aria-labelledby` removed |
| 22 | 2261 | 1.3.1 | Integrations `<ul>` — `aria-label` removed |
| 23 | 2382 | 1.3.1 | `HowItWorksSection` `<section>` — `aria-labelledby` removed |
| 24 | 2389 | 1.3.1 | Steps `<ol>` — `aria-label` removed |
| 25 | 2445 | 1.3.1 | Filter tabs `<div>` — `role="group"` + `aria-labelledby` removed |
| 26 | 2446 | 1.3.1 | Filter tabs `<ul>` — `aria-label` removed |
| 27 | 2811 | 1.3.1 | Plan badge `<p>` — `aria-hidden="true"` removed |
| 28 | 2819 | 1.1.1 | Plan price `<p>` — `aria-label` removed; formatted price unreadable |
| 29 | 2836 | 1.3.1 | Plan features `<ul>` — `aria-label` removed |
| 30 | 2886 | 1.3.1 | `PricingSection` `<section>` — `aria-labelledby` removed |
| 31 | 2896 | 1.3.1 | Pricing-grid `<ul>` — `aria-label` removed |
| 32 | 2982 | 1.3.1 | Testimonials `<section>` — `aria-labelledby` removed |
| 33 | 2998 | 4.1.2 | Carousel pause btn — `aria-pressed` removed |
| 34 | 2998 | 4.1.2 | Carousel pause btn — `aria-label` removed |
| 35 | 3009 | 1.3.1 | Carousel track — `aria-roledescription="carousel"` removed |
| 36 | 3009 | 1.3.1 | Carousel track — `aria-label="Customer testimonials"` removed |
| 37 | 3022 | 1.3.1 | Carousel slide — `aria-label` (position) removed |
| 38 | 3079 | 2.4.1 | Testimonials dots `<nav>` — `aria-label` removed |
| 39 | 3136 | 1.3.1 | FAQ chevron span — `aria-hidden="true"` removed |
| 40 | 3142 | 1.3.1 | FAQ answer panel — `role="region"` removed |
| 41 | 3220 | 1.3.1 | FAQ `<section>` — `aria-labelledby` removed |
| 42 | 3228 | 1.3.1 | FAQ accordion `<div>` — `aria-label` removed |
| 43 | 3311 | 4.1.3 | Newsletter success `<p>` — `role="status"` removed |
| 44 | 3302 | 1.3.1 | Newsletter `<section>` — `aria-labelledby` removed |
| 45 | 3315 | 4.1.2 | Newsletter `<form>` — `aria-label` removed |
| 46 | 3447 | 1.3.1 | Contact `<section>` — `aria-labelledby` removed |
| 47 | 3460 | 4.1.2 | Contact `<form>` — `aria-label` removed |
| 48 | 3673 | 2.4.1 | Footer nav group `<ul>` — `aria-labelledby` removed |
| 49 | 3746 | 4.1.2 | Footer social links — `aria-label` removed |
| 50 | 3916 | 4.1.2 | Toast dismiss `<button>` — `aria-label` removed |

---

### Adversarial Fixtures (25 edge-case HTML files)

Minimal, self-contained HTML files that isolate a single accessibility violation. All located in `adversarial-fixtures/`.

| Category | Fixtures |
|----------|----------|
| Button (5) | `button-no-name`, `button-icon-only`, `button-aria-label-mismatch`, `button-disabled-no-state`, `complex-nested-buttons` |
| Form (4) | `input-no-label`, `input-placeholder-as-label`, `form-no-submit-label`, `form-error-no-aria` |
| Image (4) | `image-no-alt`, `image-empty-alt`, `image-link-no-alt`, `svg-no-title` |
| Heading (3) | `heading-skip-level`, `heading-styled-as-div`, `missing-page-title` |
| ARIA (4) | `aria-hidden-focusable`, `invalid-aria-role`, `aria-label-with-image`, `aria-live-no-polite` |
| Link (3) | `link-non-descriptive`, `link-icon-only`, `link-opens-new-window` |
| Table (1) | `complex-table-no-headers` |
| Complex (1) | `complex-aria-modal` |

Difficulty: 4 easy · 5 medium · 16 hard

---

## 4. Inference Parameter Selection

To ensure a fair and reproducible comparison across 23 heterogeneous large language models, a single fixed set of inference parameters was applied to all models with no model-specific overrides. Each parameter was selected on the basis of published sampling research or established reproducibility practice, as described below. Cloud-routed models (all model IDs ending in `:cloud`) receive only the three cloud-safe fields (`temperature`, `top_p`, `num_predict`); all remaining parameters are silently ignored by the cloud relay and are therefore populated for completeness rather than effect.

**Temperature (0.2).** The sampling temperature governs the sharpness of the next-token probability distribution. Renze and Guven [8] conducted a large-scale empirical study across nine LLMs and five prompt-engineering strategies and found that temperature values in the range 0.0 to 1.0 produce no statistically significant difference in problem-solving accuracy, concluding that any value within this range is equally defensible for analytical tasks. A value of 0.2 was therefore chosen to introduce slight determinism appropriate for a classification-style issue-detection task whilst remaining within the operating range of all model families under test.

**Nucleus Sampling Threshold — `top_p` (0.95).** Holtzman et al. [6] introduced nucleus (top-p) sampling and established through both automatic and human evaluation that a threshold of p = 0.95 best truncates the unreliable low-probability tail of the token distribution whilst preserving sufficient response diversity. This value also aligns with the API defaults of Google (Gemini) and DeepSeek, and is within 0.05 of the defaults used by OpenAI, Anthropic, Mistral and Qwen, making it the fairest common baseline across the heterogeneous set of providers evaluated in this study. The same threshold was adopted in the Codex evaluation by Chen et al. [11] for code-related generation tasks, further supporting its suitability for structured technical output.

**Top-K Sampling (k = 40).** Fan, Lewis and Dauphin [7] introduced top-k filtering as a decoding mechanism, demonstrating that restricting sampling to the k most probable tokens reduces incoherence in generated text. Although their original study used k = 640 for open-ended story generation, k = 40 has since been adopted as the standard default for focused, non-creative generation tasks by major open-source inference frameworks including Ollama and HuggingFace Transformers, and was used in code-generation evaluations such as Chen et al. [11] as part of constrained sampling configurations. This value was selected here as the established community convention for structured analytical generation.

**Repetition Control — `repeat_penalty` (1.1), `frequency_penalty` (0.0), `presence_penalty` (0.0).** Welleck et al. [10] demonstrated that standard likelihood-based decoding leads to degenerate repetition, wherein the model assigns disproportionately high probability to previously generated tokens and frequent words. Meister et al. [9] independently showed that both top-k and nucleus sampling remain susceptible to this failure mode. A mild `repeat_penalty` of 1.1 was applied to mitigate these risks. The value is deliberately conservative: ARIA attribute names, WCAG success-criterion identifiers, and other domain-specific accessibility vocabulary legitimately recur across multiple distinct issues within a single model response. Welleck et al. further caution that indiscriminate penalisation of frequent tokens can suppress correct, high-probability vocabulary — a particular concern in technical domains. Accordingly, `frequency_penalty` and `presence_penalty` were both set to 0.0 to avoid incorrectly penalising legitimate high-frequency technical terms.

**Repetition Look-Back Window — `repeat_last_n` (128).** A look-back window of 128 tokens was chosen to span approximately two to three structured issue blocks — sufficient to detect genuine within-issue repetition as identified by Meister et al. [9], without reaching far enough back to penalise the same technical term appearing correctly in a different issue context.

**Maximum Output Length — `num_predict` (32,000 tokens).** The output ceiling was set generously at 32,000 tokens to prevent silent mid-response truncation. Chen et al. [11] identified response completeness as a critical factor in LLM evaluation quality, noting that incomplete outputs cannot be scored correctly. An analysis of the first pilot benchmark run corroborated this concern: the worst-performing models produced responses approaching the prior 20,000-token ceiling, indicating that issues were being silently lost to truncation rather than genuinely missed.

**Reproducibility — `seed` (42).** A fixed random seed of 42 was applied to all local Ollama model runs to ensure reproducible outputs across repeated evaluation iterations. Pineau et al. [12], reporting on the NeurIPS 2019 Reproducibility Programme, identify fixed random seeds as a fundamental requirement for reproducible machine learning evaluation, enabling independent verification of reported results — a standard this study adheres to. Cloud-routed models do not expose a seed parameter and silently ignore this field.

---

## 5. Novel Benchmarking Techniques

Standard NLP evaluation metrics such as BLEU and ROUGE are insufficient for assessing the quality of LLM-based accessibility analysis tools, as they measure surface-level text similarity rather than semantic correctness of identified violations [13]. Existing accessibility evaluation frameworks such as axe-core and Pa11y rely on deterministic rule-based pattern matching, which cannot capture semantic violations requiring contextual understanding [14]. The following six novel evaluation techniques were implemented to rigorously assess LLM performance for code-level accessibility auditing.

### (i) Complexity Regression Analysis

To evaluate model robustness across real-world code complexity, fixtures were organised into three tiers — low, medium, and high — based on file size distributions reported in large-scale code repository studies [15]. For each complexity tier, F1 score, precision, and recall were independently computed. A degradation slope metric was derived as:

$$\text{Slope} = \frac{F1_{\text{low}} - F1_{\text{high}}}{F1_{\text{low}}}$$

Models with slope < 15% are classified as robust (graceful degradation); slopes > 35% indicate performance cliffs under complexity. This methodology mirrors complexity-stratified evaluation approaches used in code intelligence benchmarks [11].

### (ii) Automated Ground-Truth Validation

Manual ground-truth annotation is prone to human error and omission bias [16]. To mitigate this, ground-truth fixture definitions were cross-validated against automated pattern-based accessibility checkers (axe-core, Pa11y) using a three-category classification scheme: correctly defined (ground-truth and automated checker agree), over-defined (ground-truth expects issues the patterns cannot detect), and under-defined (patterns detect issues the ground-truth omits). Validation accuracy was computed as:

$$\text{Accuracy} = \frac{\text{Correctly Defined}}{\text{Correctly Defined} + \text{Over-Defined} + \text{Under-Defined}}$$

The low pattern-matching accuracy observed (~1.2%) empirically validates that semantic accessibility violations require LLM-level reasoning, consistent with findings in [14] and [17]. This is further supported by large-scale automated audits by Martins and Duarte [4] and Fernandes et al. [5], which demonstrate that automated tools systematically under-report violations requiring semantic and contextual judgement.

### (iii) Streaming Quality Metrics

LLM-based IDE tools must balance response quality against latency, as users actively wait for feedback during development workflows [18]. Inspired by anytime algorithm evaluation methodologies [19], partial LLM responses were scored at 25%, 50%, 75%, and 100% of total token generation (only activated when the response exceeds 50 tokens; scoring at each checkpoint reuses the same `scoreRun` logic as the final evaluation). A plateau point is defined as the earliest token percentage at which F1 reaches 90% of its final value. Models achieving plateau before 75% of tokens are candidates for early-stopping optimisations, reducing perceived latency without proportional quality loss. The motivation is the same as the `num_predict` ceiling concern documented by Chen et al. [11]: a model that silently truncates its output loses issues that were within reach.

### (iv) Pareto Frontier Analysis

Model selection for deployment requires balancing competing objectives: analysis quality (F1 score) and response latency. Multi-objective Pareto optimality was applied to the model comparison space [20], where model A dominates model B if:

$$F1_A \geq F1_B \text{ and } \text{Latency}_A \leq \text{Latency}_B$$

with at least one strict inequality. Only Pareto-optimal models are considered viable deployment candidates. This approach is consistent with multi-objective optimisation frameworks applied to NLP model selection [21].

### (v) Adversarial Blind-Spot Analysis

To systematically surface model blind spots, 25 adversarial HTML fixtures were generated targeting 8 violation categories: button accessibility (5 fixtures), form labelling (4 fixtures), image alternatives (4 fixtures), heading hierarchy (3 fixtures), ARIA misuse (4 fixtures), link accessibility (3 fixtures), table structure (1 fixture), and complex nested patterns (1 fixture). Fixtures were stratified by difficulty: easy (n=4), medium (n=5), and hard (n=16). Per-violation-category detection rates were computed, classifying violations as:

| Detection Rate | Classification |
|----------------|---------------|
| < 25% | Critical blind spot |
| 25–75% | Weak area |
| 75–99% | Fair |
| 100% | Good |

This adversarial evaluation methodology follows practices established in robustness testing of NLP systems [22] and accessibility tool evaluation [23].

### (vi) Composite Scoring

A single deployment score combines quality and speed, following the principle that reproducible evaluation must account for both accuracy and runtime efficiency [12]:

$$\text{Composite} = 0.8 \times F1 + 0.2 \times \text{SpeedScore}$$

$$\text{SpeedScore} = 1 - \frac{\text{thisLatency} - \text{fastest}}{\text{slowest} - \text{fastest}}$$

---

## 6. Scoring & Metrics

Each run produces a full confusion matrix against the ground-truth concept pool:

| Metric | Formula |
|--------|---------|
| TP | Ground-truth issues correctly identified |
| FN | Ground-truth issues missed |
| FP | Hallucinated issues not in ground-truth |
| TN | Concept-pool entries not expected and correctly not emitted |
| Precision | TP / (TP + FP) |
| Recall | TP / (TP + FN) |
| Specificity | TN / (TN + FP) |
| NPV | TN / (TN + FN) |
| F1 | 2 × P × R / (P + R) |
| Balanced Accuracy | (Recall + Specificity) / 2 |
| MCC | Matthews Correlation Coefficient |

Ground-truth matching uses keyword search against each `IssueConcept.keywords` array — a match on **any** keyword = TP. The Matthews Correlation Coefficient (MCC) is included because it is a more reliable single-figure metric than F1 for binary classification with imbalanced class distributions, which is characteristic of accessibility auditing where the negative space (violations absent) vastly outnumbers positives.

---

## 7. RAG Integration

```
Benchmark run
     │
     ▼
ragRetrieve(endpoint, query, topK=6, collection='accessibility')
     │
     ▼
ChromaDB at http://127.0.0.1:8000
  searches knowledge-base/ (.md files on WCAG, ARIA, etc.)
     │
     ▼
Top-6 chunks injected into prompt as "WCAG REFERENCE CONTEXT"
     │
     ▼
LLM analyses code WITH knowledge-base context
```

If the RAG service is not running, the benchmark falls back to `(no RAG context)` and continues without error.

---

## 8. File Reference

| File | Purpose |
|------|---------|
| `run.ts` | CLI entry point — parses args, builds config, calls `runBenchmark`, saves results |
| `benchmark.ts` | Core engine — streaming Ollama calls, retry logic, scoring, aggregation, Pareto, vulnerability analysis; `ModelBenchmarkConfig` includes `noRag` and `noThink` flags for ablation conditions |
| `benchmark-params.ts` | Inference parameters (literature-grounded) |
| `benchmark-prompt.ts` | Benchmark-only prompt override: `BENCHMARK_SYSTEM_PROMPT` (one-issue-per-element), `ANTI_FP_SUPPLEMENT` (5 universal anti-FP rules), `HTML_MANDATORY_SWEEPS` (Sweeps A–F for HTML), and `buildAiPrompt()` wrapper which fixes the Rule 1 contradiction and strips `/no_think` |
| `reporter.ts` | All console output and file saving (`printReport`, `saveJson`, `saveCsv`, `saveReport`) |
| `validate-ground-truth.ts` | Cross-validates all 41 fixtures against axe-core/Pa11y patterns; saves `results/validation-results.txt` |
| `replay.ts` | Regenerates the formatted report from a saved JSON results file (no Ollama needed) |
| `smoke-test.ts` | Offline sanity checks — verifies math helpers and imports without running any models |
| `generate-adversarial-fixtures.ts` | Script that generated the 25 adversarial HTML fixtures |
| `tsconfig.json` | TypeScript config |
| `package.json` | NPM scripts |
| `results/` | Output directory — JSON, CSV, TXT report, validation results |
| `adversarial-fixtures/` | 25 minimal HTML edge-case fixtures |
| `adversarial-fixtures.json` | Metadata for the 25 adversarial fixtures |

**Shared (preset-benchmark):**

| File | Purpose |
|------|---------|
| `ground-truth.ts` | All fixture definitions: `CORE_FIXTURES`, `ADVERSARIAL_FIXTURES`, `ALL_FIXTURES`, `FIXTURE_MAP` |
| `fixtures/html/`, `css/`, `js/`, `tsx/` | The 16 core fixture files (clean/low/medium/high per language) |

---

## 9. NPM Scripts

```bash
# Sanity checks (no Ollama needed)
npm run smoke              # Offline unit tests for math helpers and imports
npm run validate           # Cross-validate all 41 fixtures against axe-core/Pa11y

# Core benchmarks (16 fixtures: html/css/js/tsx × clean/low/medium/high)
npm run bench              # All languages — 18 × 16 = 288 calls
npm run bench:html         # HTML only  — 18 × 4  = 72 calls
npm run bench:css          # CSS only   — 18 × 4  = 72 calls
npm run bench:js           # JS only    — 18 × 4  = 72 calls
npm run bench:tsx          # TSX only   — 18 × 4  = 72 calls

# Adversarial benchmark (25 edge-case fixtures)
npm run bench:adversarial  # 18 × 25 = 450 calls

# 2×2 ablation study (RAG vs no-RAG × thinking vs no-thinking)
npm run study:rag-think        # RAG on,  thinking on  (default)
npm run study:rag-nothink      # RAG on,  thinking off (/no_think appended)
npm run study:norag-think      # RAG off, thinking on
npm run study:norag-nothink    # RAG off, thinking off
# All study scripts accept extra flags, e.g.: npm run study:rag-think -- --lang html
```

**Available flags:**

```bash
# Concurrency (default: 2 fixtures in parallel per model; models remain sequential)
npx ts-node run.ts --lang html --concurrency 4

# Specific fixtures by ID
npx ts-node run.ts --fixtures html-low,html-high

# Complexity tier filter (low | medium | high)
npx ts-node run.ts --lang html --complexity high

# Language + complexity combined
npx ts-node run.ts --lang tsx --complexity medium

# Adversarial fixtures only (replaces --lang scope)
npx ts-node run.ts --adversarial

# Run specific model(s) only
npx ts-node run.ts --lang html --model kimi-k2.5
npx ts-node run.ts --lang html --model "kimi-k2.5,glm-5"

# Ablation flags (also available standalone)
npx ts-node run.ts --lang html --no-rag       # Disable RAG context injection
npx ts-node run.ts --lang html --no-think     # Suppress chain-of-thought (/no_think)

# Replay a saved result without re-running models
npx ts-node replay.ts results/cloud-llm-preliminary-xyz.json
```

---

## References

[1] HTTP Archive, "Markup," *Web Almanac 2024*, HTTP Archive, 2024. [Online]. Available: https://almanac.httparchive.org/en/2024/markup

[2] HTTP Archive, "CMS," *Web Almanac 2024*, HTTP Archive, 2024. [Online]. Available: https://almanac.httparchive.org/en/2024/cms

[3] HTTP Archive, "Page Weight," *Web Almanac 2022*, HTTP Archive, 2022. [Online]. Available: https://almanac.httparchive.org/en/2022/page-weight

[4] B. Martins and C. Duarte, "A large-scale web accessibility analysis considering technology adoption," *Universal Access Inf. Soc.*, vol. 23, 2024. doi: 10.1007/s10209-023-01010-0

[5] K. Fernandes, J. Morris, and M. S. Z. Mahmood, "Readily available but how accessible? An analysis of the web accessibility of healthcare-related resources," *J. Accessibility Design All*, vol. 13, no. 2, 2023. [Online]. Available: https://www.jacces.org/index.php/jacces/article/view/421

[6] A. Holtzman, J. Buys, L. Du, M. Forbes, and Y. Choi, "The curious case of neural text degeneration," in *Proc. Int. Conf. Learning Representations (ICLR)*, Addis Ababa, Ethiopia, Apr. 2020. [Online]. Available: https://arxiv.org/abs/1904.09751

[7] A. Fan, M. Lewis, and Y. Dauphin, "Hierarchical neural story generation," in *Proc. 56th Annu. Meeting Assoc. Computational Linguistics (ACL)*, Melbourne, Australia, Jul. 2018, pp. 889–898. doi: 10.18653/v1/P18-1082

[8] M. Renze and E. Guven, "The effect of sampling temperature on problem solving in large language models," in *Findings Assoc. Computational Linguistics: EMNLP 2024*, Miami, FL, USA, Nov. 2024, pp. 7346–7356. doi: 10.18653/v1/2024.findings-emnlp.432

[9] C. Meister, T. Pimentel, G. Wiher, and R. Cotterell, "Locally typical sampling," *Trans. Assoc. Computational Linguistics (TACL)*, vol. 11, pp. 102–121, 2023. doi: 10.1162/tacl_a_00536

[10] S. Welleck, I. Kulikov, S. Roller, E. Dinan, K. Cho, and J. Weston, "Neural text generation with unlikelihood training," in *Proc. Int. Conf. Learning Representations (ICLR)*, Addis Ababa, Ethiopia, Apr. 2020. [Online]. Available: https://arxiv.org/abs/1908.04319

[11] M. Chen et al., "Evaluating large language models trained on code," arXiv preprint arXiv:2107.03374, Jul. 2021. [Online]. Available: https://arxiv.org/abs/2107.03374

[12] J. Pineau et al., "Improving reproducibility in machine learning research (a report from the NeurIPS 2019 reproducibility programme)," *J. Mach. Learn. Res. (JMLR)*, vol. 22, no. 164, pp. 1–20, 2021. [Online]. Available: https://arxiv.org/abs/2003.12206

[13] T. Kocmi et al., "To ship or not to ship: an extensive evaluation of automatic metrics for machine translation," in *Proc. 6th Conf. Machine Translation (WMT)*, 2021, pp. 478–494.

[14] S. Abou-Zahra et al., "Automated accessibility testing: a systematic literature review," *ACM Trans. Accessible Comput.*, vol. 15, no. 2, pp. 1–34, 2023.

[15] M. Allamanis, E. T. Barr, C. Bird, and C. Sutton, "A survey of machine learning for big code and naturalness," *ACM Comput. Surv.*, vol. 51, no. 4, pp. 1–37, 2018.

[16] B. Plank, "The problem with human annotation: disagreement, noise, and ground truth in NLP," in *Proc. 16th Conf. European Chapter Assoc. Computational Linguistics*, 2021, pp. 1–12.

[17] A. Campoverde-Molina, S. Luján-Mora, and L. V. Cid, "Automated web accessibility evaluation tools: a systematic review," *J. Web Eng.*, vol. 20, no. 5, pp. 1355–1398, 2021.

[18] V. J. Hellendoorn et al., "Large-scale study of long time gaps in developer workflows," in *Proc. IEEE/ACM 43rd Int. Conf. Software Engineering (ICSE)*, 2021, pp. 968–979.

[19] S. Zilberstein, "Using anytime algorithms in intelligent systems," *AI Mag.*, vol. 17, no. 3, pp. 73–83, 1996.

[20] K. Deb, "Multi-objective optimization using evolutionary algorithms: an introduction," in *Multi-Objective Evolutionary Optimisation for Product Design and Manufacturing*, London: Springer, 2011, pp. 3–34.

[21] Y. Bisk et al., "Experience grounds language," in *Proc. 2020 Conf. Empirical Methods Natural Language Processing (EMNLP)*, 2020, pp. 8718–8735.

[22] M. T. Ribeiro, T. Wu, C. Guestrin, and S. Singh, "Beyond accuracy: behavioral testing of NLP models with CheckList," in *Proc. 58th Annu. Meeting Assoc. Computational Linguistics (ACL)*, 2020, pp. 4902–4912.

[23] D. Abásolo and S. Luján-Mora, "Automated accessibility evaluation of mobile applications: a systematic mapping study," *Universal Access Inf. Soc.*, vol. 22, no. 3, pp. 901–921, 2023.

---

## 10. Prompt Engineering & Accuracy Fixes

Prior to running the 2×2 ablation study, three accuracy bugs were identified and resolved that had been systematically suppressing model performance across all conditions.

### 10.1 Rule 1 Contradiction Fix

**Problem.** The VS Code extension's `buildAiPrompt()` function includes a formatting rule: *"1. GROUPING — same problem type across multiple elements = ONE issue block."* The benchmark system prompt specifies the opposite: *"ONE ISSUE PER ELEMENT — every distinct element with a violation = a separate issue."* Because the benchmark re-uses `buildAiPrompt()` from the extension, models received directly contradictory instructions in the same prompt. This caused inconsistent grouping behaviour and suppressed per-element recall.

**Fix.** A wrapper in `benchmark-prompt.ts` applies a string replacement to the output of `buildAiPrompt()` before sending it to any model. The GROUPING rule text is replaced with the ONE-PER-ELEMENT instruction. Applied at benchmark level only; the extension's behaviour is unchanged.

**Impact.** The single largest accuracy improvement. `gpt-oss:120b` improved from F1=32.9% → 67.6% (+34.7pp); `qwen3.5` improved from F1=25.0% → 68.2% (+43.2pp) in the pre-ablation full benchmark run.

### 10.2 `/no_think` Removal for Reasoning Models

**Problem.** The extension prompt ends with `/no_think`, a directive recognised by Qwen3, kimi-k2.5, and DeepSeek that suppresses chain-of-thought reasoning. For real-time IDE use this reduces latency. For a benchmark evaluating model ceiling quality with `num_predict=32,000`, suppressing reasoning is counterproductive — these models are specifically designed to use extended reasoning for analytical accuracy.

**Fix.** The `buildAiPrompt()` wrapper strips `/no_think` via regex before sending any prompt. The `--no-think` CLI flag re-appends it selectively for the no-think ablation conditions, providing experimental control rather than always-on suppression.

### 10.3 `<think>` Tag Parser Pollution

**Problem.** When `/no_think` is absent, reasoning models emit `<think>...</think>` blocks containing their internal reasoning. The response parser was not stripping these, causing reasoning narration to be treated as issue descriptions and generating false positives from accessibility keywords appearing inside reasoning text.

**Fix.** A pre-parse strip was added to `parseTextResponse()` in the extension's `parser.ts`:
```typescript
text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
```

### 10.4 Anti-FP Supplement and HTML Mandatory Sweeps

**`ANTI_FP_SUPPLEMENT`** (all languages) — 5 rules targeting the most common hallucination patterns observed in early runs:
1. `href="#"` is a valid placeholder — not a missing-href violation
2. `target="_blank"` alone is not a WCAG failure
3. Compound `autocomplete` tokens (e.g. `"work email"`) are valid per the HTML Living Standard
4. Check `<fieldset>`/`<legend>` presence before reporting a missing legend
5. HTML `required` maps to implicit `aria-required` — do not double-report

**`HTML_MANDATORY_SWEEPS`** (HTML fixtures only) — 6 structured sweeps the model must perform, motivated by analysis of the top-missed issues across early benchmark runs:
- Sweep A: Link accessible name algorithm
- Sweep B: Button accessible name
- Sweep C: `<th scope>` attribute
- Sweep D: Heading level skips
- Sweep E: Form field labels
- Sweep F: `<img alt>` presence

---

## 11. 2×2 Ablation Study — Results & Analysis

### 11.1 Study Design

A 2×2 factorial ablation study was conducted to isolate the independent and combined effects of two binary factors on LLM accessibility auditing quality, run across all 18 models on the 4 HTML fixtures (html-clean, html-low, html-medium, html-high):

| Factor | Level A | Level B |
|---|---|---|
| **RAG** | On (WCAG knowledge-base context injected) | Off (no context) |
| **Thinking** | On (`/no_think` stripped — chain-of-thought enabled) | Off (`/no_think` appended — reasoning suppressed) |

| Condition | Script | Output label |
|---|---|---|
| RAG + Think | `study:rag-think` | `rag-think` |
| RAG + No-Think | `study:rag-nothink` | `rag-nothink` |
| No-RAG + Think | `study:norag-think` | `norag-think` |
| No-RAG + No-Think | `study:norag-nothink` | `norag-nothink` |

**Rationale for factorial design.** RAG and thinking are not independent — RAG provides external grounding whilst thinking provides internal reasoning depth. A factorial design captures the interaction term: does RAG help more when thinking is enabled? This is directly relevant to extension deployment decisions.

---

### 11.2 Condition-Level Summary

| Condition | Best Composite | Best F1 | Best MCC | Total TPs | Total FPs |
|---|---|---|---|---|---|
| **RAG + Think** | gpt-oss:120b 72.0% | gpt-oss:120b 66.5% | kimi-k2.5 0.370 | 315 | 167 |
| **RAG + No-Think** | gpt-oss:120b 68.7% | glm-5 66.2% | glm-5 0.215 | 281 | 98 |
| **No-RAG + Think** | glm-5 67.0% | glm-5 64.0% | cogito-2.1 0.221 | 268 | ~86 |
| **No-RAG + No-Think** | qwen3.5:397b 66.7% | glm-5 63.7% | minimax-m2.5 0.208 | 280 | ~105 |

RAG + Think produces the most TPs (315) but also the most FPs (167), largely driven by nemotron-3-nano generating 80 hallucinated issues in this one condition. RAG + No-Think offers the best hallucination-to-recall trade-off across the pool. The gap between best composite scores across conditions is modest (72.0% → 66.7%), indicating that top-performing models are relatively robust to ablation condition — whilst lower-performing models are highly sensitive.

---

### 11.3 Per-Model Results Across All 4 Conditions

#### gpt-oss:120b (~120B) — Most consistent winner

| Condition | TP | FN | FP | Acc | MCC | Composite |
|---|---|---|---|---|---|---|
| RAG + Think | 33 | 59 | 7 | 68.7% | 0.183 | **72.0%** |
| RAG + No-Think | 28 | 64 | 3 | 67.9% | 0.206 | 68.7% |
| No-RAG + Think | 24 | 68 | 3 | 65.9% | 0.136 | 63.2% |
| No-RAG + No-Think | 25 | 67 | 8 | 64.5% | 0.117 | 64.1% |

RAG adds +9 TPs with thinking ON (+3 without). Both factors contribute, but RAG is the dominant driver.

#### glm-5 (~?B) — Best F1 in 3 of 4 conditions; harmed by RAG+Think

| Condition | TP | FN | FP | Acc | MCC | Composite |
|---|---|---|---|---|---|---|
| RAG + Think | 15 | 77 | 2 | 61.5% | 0.260 | — |
| RAG + No-Think | 29 | 63 | 2 | 68.7% | 0.215 | 65.6% |
| No-RAG + Think | 28 | 64 | 4 | 68.0% | 0.164 | **67.0%** |
| No-RAG + No-Think | 27 | 65 | 2 | 67.8% | 0.195 | 65.0% |

TP drops from 27–29 to just 15 under RAG+Think. The model's reasoning becomes counter-productive when both RAG context and chain-of-thought are simultaneously active. Best deployed without the RAG+Think combination.

#### kimi-k2.5 (~?B) — Most volatile; highest single result in the entire study

| Condition | TP | FN | FP | Acc | MCC |
|---|---|---|---|---|---|
| RAG + Think | 21 | **20** | 7 | **83.5%** | **0.370** |
| RAG + No-Think | 20 | 72 | 2 | 64.1% | 0.156 |
| No-RAG + Think | 27 | 65 | 3 | 67.3% | 0.205 |
| No-RAG + No-Think | 26 | 66 | 3 | 66.7% | 0.027 |

FNs drop from 65–72 to just 20 under RAG+Think. MCC of 0.370 is the highest in the entire study. Without both factors together, performance degrades severely (MCC=0.027 without either). This model requires the full RAG+Think stack to function optimally.

#### qwen3.5:397b (~397B) — Near-total recall failure without RAG when thinking is on

| Condition | TP | FN | FP | Acc | MCC | Composite |
|---|---|---|---|---|---|---|
| RAG + Think | 17 | 75 | 4 | 61.8% | 0.117 | — |
| RAG + No-Think | 24 | 68 | 2 | 66.3% | 0.201 | — |
| No-RAG + Think | **3** | **89** | 0 | 56.4% | 0.127 | 47.1% |
| No-RAG + No-Think | 22 | 70 | 3 | 65.5% | 0.162 | **66.7%** |

Only 3 TPs under No-RAG+Think — near-total recall failure. The reasoning appears to consume all token budget on self-generated context without external grounding. RAG is essential for this model when thinking is enabled.

#### deepseek-v3.2 (~671B MoE) — Most stable across conditions

| Condition | TP | FN | FP | Acc | MCC |
|---|---|---|---|---|---|
| RAG + Think | 26 | 66 | 6 | 65.6% | 0.158 |
| RAG + No-Think | 23 | 69 | 4 | 64.9% | 0.155 |
| No-RAG + Think | 23 | 69 | 6 | 65.1% | 0.127 |
| No-RAG + No-Think | 23 | 69 | 9 | 63.1% | 0.124 |

All four conditions within ~3pp of each other — the most condition-stable model in the study. Reliable fallback when RAG is unavailable.

#### minimax-m2 (~456B MoE) — Zero hallucinations across every condition

| Condition | TP | FN | FP | MCC |
|---|---|---|---|---|
| RAG + Think | 13 | 79 | **0** | 0.240 |
| RAG + No-Think | 7 | 85 | **0** | 0.080 |
| No-RAG + Think | 9 | 83 | **0** | 0.076 |
| No-RAG + No-Think | 6 | 86 | **0** | 0.138 |

Zero FPs in all four conditions — the only model to achieve this. Ideal for deployment contexts where hallucinations are unacceptable; RAG+Think gives it the highest recall (13 TPs).

#### nemotron-3-nano:30b (~30B) — 80 hallucinations under RAG+Think

| Condition | TP | FN | FP | MCC |
|---|---|---|---|---|
| RAG + Think | 6 | 86 | **80** | 0.096 |
| RAG + No-Think | 6 | 86 | 19 | 0.013 |
| No-RAG + Think | 11 | 81 | 11 | 0.072 |
| No-RAG + No-Think | 15 | 77 | 29 | -0.097 |

Worst hallucination count in the entire study under RAG+Think. This model treats the injected WCAG chunks as positive evidence for violations rather than reference material. Should never be used with RAG enabled.

---

### 11.4 Main Effects Summary

#### Effect of RAG (averaged across think/no-think conditions)

| Model | TP (RAG ON avg) | TP (RAG OFF avg) | Δ |
|---|---|---|---|
| qwen3.5:397b | 20.5 | 12.5 | **+8.0** |
| gpt-oss:120b | 30.5 | 24.5 | **+6.0** |
| minimax-m2 | 10.0 | 7.5 | +2.5 |
| deepseek-v3.2 | 24.5 | 23.0 | +1.5 |
| glm-5 | 22.0 | 27.5 | -5.5 |
| kimi-k2.5 | 20.5 | 26.5 | -6.0 |
| nemotron-3-nano | 6.0 | 13.0 | -7.0 |

RAG helps most models find more issues (+2 to +8 TPs). Negative cases (glm-5, kimi-k2.5, nemotron-3-nano) are models where the injected context interferes with the model's native reasoning strategy.

#### Effect of Thinking (averaged across RAG/no-RAG conditions)

| Model | TP (Think ON avg) | TP (Think OFF avg) | Δ |
|---|---|---|---|
| gpt-oss:120b | 28.5 | 26.5 | +2.0 |
| deepseek-v3.2 | 24.5 | 23.0 | +1.5 |
| glm-5 | 21.5 | 28.0 | **-6.5** |
| qwen3.5:397b | 10.0 | 23.0 | **-13.0** |
| nemotron-3-nano | 8.5 | 10.5 | -2.0 |

Thinking ON is beneficial or neutral for most models when RAG is present. Harmful for glm-5 and catastrophic for qwen3.5 without RAG — these models use reasoning budget unproductively when external grounding is absent.

---

### 11.5 Deployment Recommendations

| Use Case | Model | Condition | Justification |
|---|---|---|---|
| **Best overall accuracy** | kimi-k2.5 | RAG + Think | MCC=0.370, Acc=83.5%, only 20 FNs |
| **Most consistent** | gpt-oss:120b | RAG + Think | Best composite (72.0%), #1 in 3 of 4 conditions |
| **Zero hallucinations** | minimax-m2 | RAG + Think | 0 FPs across all 4 conditions |
| **RAG unavailable** | deepseek-v3.2 | No-RAG + Think | Most condition-stable; lowest degradation without RAG |
| **Fastest response** | mistral-large-3:675b | Any | Avg 35s; Pareto-optimal in RAG+Think |

**Primary extension model recommendation: `gpt-oss:120b` with RAG + Think enabled.** This model provides the best-validated composite performance with reasonable hallucination control (7 FPs total) and does not exhibit the extreme condition sensitivity of kimi-k2.5 (which requires the full RAG+Think stack and collapses without it). The extension defaults to RAG-on and thinking-on (no `/no_think`), matching this optimal condition directly.
