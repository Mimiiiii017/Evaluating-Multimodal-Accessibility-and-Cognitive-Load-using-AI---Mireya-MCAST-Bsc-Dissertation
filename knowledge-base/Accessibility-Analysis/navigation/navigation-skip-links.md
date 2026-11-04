# Navigation: Skip Links

## Tags
Tags: #navigation #skip-links #keyboard #focus #wcag #2.4.1

## Purpose
Allow keyboard and screen reader users to bypass repeated navigation and jump directly to the main content, reducing effort and cognitive load.

## Key points
- Skip links provide a fast path to the main content.
- They are especially important on pages with long or repeated navigation.
- Skip links must be the first focusable element on the page.
- They must be visible when focused.
- The target of a skip link must exist and be focusable.

## Developer checks
- Press Tab at the top of the page and confirm a skip link appears first.
- Verify the skip link moves focus to the main content region.
- Ensure the target element has an `id` that matches the link.
- Check the skip link is visible on focus (not permanently hidden).
- Confirm the skip link works consistently across pages.

## Fix patterns
- Add a skip link at the top of the document body.
- Point the skip link to the main content container.
- Make the skip link visually hidden by default but visible on focus.
- Ensure the target element can receive focus if needed.
- Keep skip link text clear and consistent (e.g., “Skip to content”).

## Examples
```html
<!-- Skip link -->
<a href="#mainContent" class="skip-link">Skip to content</a>

<!-- Main content target -->
<main id="mainContent" role="main">
  <h1>Main content</h1>
  <p>Page content starts here.</p>
</main>
```

```css
/* Visually hidden until focused */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #ffffff;
  color: #000000;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```
