# Visual: Text Spacing and Content Adaptation

## Tags
Tags: #visual #text-spacing #content-adaptation #wcag #1.4.12

## Purpose
Ensure content remains readable and functional when users override text spacing properties, supporting users with dyslexia and low vision who need customised text presentation.

## Key points
- Users must be able to adjust line height, paragraph spacing, letter spacing, and word spacing without losing content or functionality.
- The minimum adjustable thresholds are: line height 1.5× the font size, paragraph spacing 2× the font size, letter spacing 0.12× the font size, and word spacing 0.16× the font size.
- Content must not overflow, overlap, or become clipped when these spacing adjustments are applied.
- Fixed-height containers are the most common cause of failure.
- This requirement applies to text rendered in human languages, not code blocks or preformatted content.

## Developer checks
- Apply the WCAG text spacing overrides (using a bookmarklet or browser extension) and check for content loss.
- Verify no text is clipped, overlapping, or hidden after spacing adjustments.
- Check containers with fixed heights for overflow issues.
- Confirm buttons, labels, and navigation items remain readable with increased spacing.
- Test across different viewport sizes and zoom levels.

## Fix patterns
- Avoid setting fixed `height` on containers that hold text content; use `min-height` instead.
- Use `overflow: visible` or `overflow: auto` instead of `overflow: hidden` on text containers.
- Ensure padding and margins use relative units.
- Do not constrain line height with fixed values; use relative units (e.g., `line-height: 1.5`).
- Test with the standard WCAG text spacing bookmarklet.

## Examples
```css
/* Incorrect: fixed height clips text when spacing is increased */
.card-title {
  height: 40px;
  overflow: hidden;
}

/* Correct: flexible height accommodates spacing changes */
.card-title {
  min-height: 40px;
  overflow: visible;
}

/* Good defaults that support spacing overrides */
body {
  line-height: 1.5;
  letter-spacing: 0.02em;
  word-spacing: 0.05em;
}

p + p {
  margin-top: 1.5em;
}
```

```js
// WCAG text spacing test bookmarklet values
// Apply these via a browser extension or bookmarklet to test:
// line-height: 1.5 × font-size
// letter-spacing: 0.12 × font-size
// word-spacing: 0.16 × font-size
// paragraph spacing (margin-bottom): 2 × font-size
```
