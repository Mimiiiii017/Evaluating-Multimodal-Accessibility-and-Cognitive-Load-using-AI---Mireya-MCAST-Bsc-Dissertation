# Headings: Logical Hierarchy (H1–H6)

## Tags
Tags: #headings #structure #semantic-html #aria #wcag #1.3.1 #2.4.6

## Quick reference
Common heading hierarchy violations to flag in code reviews:

- **Heading level skipped** — jumping from `<h2>` to `<h4>`, `<h2>` to `<h5>`, or `<h1>` to `<h3>` (skipping a level) fails WCAG 1.3.1. Every heading level must appear in sequence before a deeper level.
- **No `<h1>` on the page** — a page without any `<h1>` element fails WCAG 1.3.1. There must be exactly one `<h1>` per page identifying the main topic.
- **Multiple `<h1>` elements** — more than one `<h1>` creates an ambiguous document outline.
- **Visual heading that is not a heading element** — a `<div>` or `<p>` styled large/bold to look like a heading but using no `<h1>`–`<h6>` element and no `role="heading"` fails WCAG 1.3.1.
- **Heading element used only for visual size** — `<h4>` applied to a label or caption purely for font-size effect breaks the document outline.

Violation code patterns:
```html
<!-- VIOLATION: heading level skip (h2 → h5, missing h3 and h4) -->
<h2>Features</h2>
<h5>Core features</h5>

<!-- VIOLATION: heading level skip (h2 → h4, missing h3) -->
<h2>Pricing</h2>
<h4>Monthly plan</h4>

<!-- FIXED -->
<h2>Pricing</h2>
<h3>Monthly plan</h3>

<!-- VIOLATION: page starts at h2, no h1 -->
<h2>Welcome to Acme</h2>
<h3>Our services</h3>
```

## Purpose
Ensure headings create a logical, thorough page structure so users (especially screen reader users) can understand content and navigate efficiently.

## Key points
- All elements that function as headings must be marked up using heading tags (`<h1>` to `<h6>`).
- The heading structure must be logical and thorough across the page.
- Avoid inconsistencies in heading levels.
- Ideally, avoid “jumps” in the hierarchy (e.g., `<h1>` directly to `<h3>` without an `<h2>`).
- Multiple `<h1>` elements may be used on a page when there are primary headings.
- Good practice is to avoid using hidden headings.
- ARIA can assign heading semantics to non-heading elements using `role="heading"` with `aria-level="1"` to `"6"`, but this should be a last resort and is not optimal compared to real heading elements.

## Developer checks
- Scan the DOM for visual headings implemented as `<div>`, `<p>`, or styled text instead of `<h1>`–`<h6>`.
- Verify heading levels progress logically (no unexpected level jumps).
- Confirm the page has a clear top-level heading strategy (single or multiple `<h1>` used consistently).
- Check that headings are not used purely for styling (e.g., heading tags applied to non-heading content).
- If `role="heading"` is used, verify that a matching `aria-level` is present and that replacing with native headings is not feasible.

## Fix patterns
- Replace non-semantic “heading-like” elements (e.g., `<div class="title">`) with appropriate `<h*>` tags.
- Reorder heading levels to remove skips (insert missing intermediate headings where needed).
- Ensure headings reflect the content outline (think of the page as a “Table of Contents”).
- Use CSS classes for styling rather than choosing heading levels for appearance.
- Only use `role="heading"` + `aria-level` when native heading tags cannot be used.

## Examples
```html
<!-- Correct example (logical and thorough) -->
<h1><a href="/"><img src="GreenPeace.png" alt="GreenPeace (go back to homepage)" /></a></h1>

<h2>In the spotlight</h2>
<h3>The Canadian government should not be writing blank cheques for Texas oil-giant</h3>

<h2>The latest updates</h2>
<h3>Plastic pollution reaches the Antarctic</h3>
<h3>Captain Crudeau’s Colossal Mistake</h3>

<h2>Multimedia</h2>
<h2>Join the movement</h2>
<h2>Become volunteer</h2>

<!-- ARIA heading as a last resort (not optimal) -->
<p role="heading" aria-level="1">Heading Level 1</p>
<div role="heading" aria-level="3">Heading Level 3</div>
```
