# Visual: Resize Text and Reflow

## Tags
Tags: #visual #resize-text #reflow #zoom #responsive #wcag #1.4.4 #1.4.10 #eaa

## Purpose
Ensure text can be resized up to 200% and content reflows at up to 400% zoom without loss of information or functionality, supporting users with low vision.

## Key points
- Text must be resizable up to 200% without assistive technology and without loss of content or functionality (WCAG 1.4.4).
- Content must reflow in a single column at 400% zoom (equivalent to 320 CSS pixels wide for vertical scrolling content) without requiring horizontal scrolling (WCAG 1.4.10).
- Two-dimensional scrolling is only acceptable for content that requires spatial layout (e.g., data tables, maps, diagrams).
- Fixed-width containers, fixed font sizes in pixels, and `overflow: hidden` can break reflow.
- Viewport units for font sizes can prevent text resizing.

## Developer checks
- Zoom the browser to 200% and confirm all text is readable with no content overlap or clipping.
- Zoom to 400% (or set viewport to 320px) and confirm content reflows into a single column.
- Check for horizontal scrolling at 400% zoom (it should not be required for normal content).
- Verify text is not set in absolute units (px) that prevent browser resizing.
- Ensure no content is cut off by `overflow: hidden` on containers.
- Test that interactive elements remain usable at all zoom levels.

## Fix patterns
- Use relative font sizes (`rem`, `em`, `%`) instead of `px` for text.
- Use flexible layouts (`flexbox`, `grid`) with relative widths instead of fixed widths.
- Replace `overflow: hidden` with `overflow: auto` or `overflow: visible` where appropriate.
- Avoid setting `max-width` in px on content containers; use relative units.
- Use responsive breakpoints that adapt to narrow viewports.
- Do not disable zoom via the viewport meta tag.

## Examples
```css
/* Incorrect: fixed font size prevents resizing */
body {
  font-size: 14px;
}

/* Correct: relative font size */
body {
  font-size: 1rem;
}

/* Incorrect: fixed-width container breaks reflow */
.container {
  width: 960px;
  overflow: hidden;
}

/* Correct: flexible container supports reflow */
.container {
  max-width: 60rem;
  width: 100%;
  overflow: visible;
}

/* Responsive single-column reflow */
@media (max-width: 20rem) {
  .content {
    flex-direction: column;
  }
  .sidebar {
    display: none; /* or stack below main content */
  }
}
```

```html
<!-- Correct: viewport allows zoom -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```
