# Images: Alternative Text for SVG

## Tags
Tags: #images #svg #alt-text #aria #wcag #1.1.1

## Purpose
Explain how to provide accessible alternative text for SVG graphics so their meaning is available to assistive technologies.

## Key points
- SVG images that convey information must have a text alternative.
- Decorative SVGs must be hidden from assistive technologies.
- Alternative text for SVGs can be provided in multiple ways depending on usage.
- The method used must ensure screen readers can access the description.
- SVGs used as icons, controls, or illustrations require different handling based on context.

## Developer checks
- Identify whether each SVG is informative or decorative.
- Check that informative SVGs expose a text alternative to screen readers.
- Verify decorative SVGs are hidden using appropriate techniques.
- Confirm that SVGs used inside links or buttons describe the action, not just the graphic.
- Test SVGs with a screen reader to ensure the text alternative is announced.

## Fix patterns
- Add a `<title>` element inside the SVG for short alternative text.
- Use `<desc>` inside the SVG for longer descriptions when necessary.
- Reference SVG text alternatives using `aria-labelledby`.
- Mark decorative SVGs with `aria-hidden="true"`.
- Avoid relying on visual-only cues inside SVGs without textual equivalents.

## Examples
```html
<!-- Informative SVG with title -->
<svg role="img" aria-labelledby="svgTitle">
  <title id="svgTitle">Sales growth chart</title>
  <!-- SVG content -->
</svg>

<!-- Decorative SVG -->
<svg aria-hidden="true">
  <!-- Decorative SVG content -->
</svg>

<!-- SVG used as a button icon -->
<button aria-label="Close">
  <svg aria-hidden="true">
    <!-- Icon SVG -->
  </svg>
</button>
```
