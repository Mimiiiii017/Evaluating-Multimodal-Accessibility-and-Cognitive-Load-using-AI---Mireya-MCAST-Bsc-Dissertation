# Navigation: Link Purpose and Meaningful Link Text

## Tags
Tags: #navigation #links #link-purpose #link-text #wcag #2.4.4

## Quick reference
Common link violations to flag in code reviews:

- **Non-descriptive link text** — `<a>` with text like "click here", "read more", "here", "more", "learn more" with no `aria-label` override fails WCAG 2.4.4.
- **Icon-only link** — `<a>` containing only an `<svg>`, `<img alt="">`, or icon font character (e.g. `<i class="fa fa-twitter">`) with no visible text, no `aria-label`, and no `aria-labelledby` fails WCAG 2.4.4 and 4.1.2. Screen readers announce the link as unlabelled or read the URL.
- **Linked logo with empty alt** — `<a href="/"><img src="logo.png" alt=""></a>`: when the image IS the link, `alt=""` removes its name entirely. The `alt` must describe the link destination.
- **Links that open in new tab with no warning** — `<a target="_blank">` with no visible indicator and no `aria-label` mentioning "opens in new tab".
- **Duplicate non-descriptive links** — multiple `<a>Read more</a>` links on the same page pointing to different destinations each need unique `aria-label` values.

Violation code patterns:
```html
<!-- VIOLATION: non-descriptive -->
<a href="/policy">Click here</a>

<!-- FIXED -->
<a href="/policy">Read our accessibility policy</a>

<!-- VIOLATION: icon-only link (Twitter/social) -->
<a href="https://twitter.com/acme"><svg>...</svg></a>
<a href="https://twitter.com/acme"><i class="fab fa-twitter"></i></a>

<!-- FIXED -->
<a href="https://twitter.com/acme" aria-label="Acme on Twitter (opens in new tab)"><svg aria-hidden="true">...</svg></a>

<!-- VIOLATION: linked logo with empty alt -->
<a href="/"><img src="footer-logo.png" alt=""></a>

<!-- FIXED -->
<a href="/"><img src="footer-logo.png" alt="Acme Corp — go to homepage"></a>
```

## Purpose
Ensure link text clearly describes the destination or action of the link, so users of screen readers and other assistive technologies can understand links without needing surrounding context.

## Key points
- Every link must have text that describes its purpose.
- Link purpose must be determinable from the link text alone or from the link text together with its programmatic context (enclosing paragraph, list item, table cell, or heading).
- Generic link text such as "click here," "read more," or "learn more" is insufficient on its own.
- Screen reader users often navigate links out of context (e.g., listing all links on a page).
- Image links must use alt text to describe the link destination.
- Links to files should indicate the file type and size where possible.

## Developer checks
- List all links on the page and review their text in isolation.
- Check for generic text like "click here," "more," "read more," or "here."
- Verify image links have meaningful alt text describing the destination.
- Confirm links to downloads include file type information (e.g., "Annual Report (PDF, 2MB)").
- Test by using a screen reader's link list feature and checking whether links are understandable.

## Fix patterns
- Replace generic link text with descriptive text (e.g., "Read the accessibility policy" instead of "click here").
- Use `aria-label` or `aria-labelledby` to provide a more descriptive name when the visible text must remain short.
- Add visually hidden text to supplement brief visible link text.
- Include file type and size in link text for downloads.
- Ensure link text is unique when links go to different destinations.

## Examples
```html
<!-- Incorrect: generic link text -->
<p>To view our accessibility policy, <a href="/policy">click here</a>.</p>

<!-- Correct: descriptive link text -->
<p><a href="/policy">View our accessibility policy</a>.</p>

<!-- Correct: aria-label supplements short visible text -->
<a href="/report" aria-label="Read the 2025 Annual Report (PDF, 3MB)">
  Annual Report
</a>

<!-- Correct: visually hidden text adds context -->
<a href="/news/climate">
  Read more <span class="sr-only">about climate change initiatives</span>
</a>

<!-- Correct: image link with descriptive alt -->
<a href="/home">
  <img src="logo.png" alt="Acme Corp homepage">
</a>

<!-- Correct: download link with file info -->
<a href="/files/guide.pdf">
  Accessibility guide (PDF, 1.2 MB)
</a>
```

```css
/* Visually hidden class for supplementary link text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```
