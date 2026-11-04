# Keyboard: Focus Not Obscured

## Tags
Tags: #keyboard #focus #focus-obscured #sticky-headers #wcag #2.4.11

## Purpose
Ensure that when a user interface component receives keyboard focus, it is not entirely hidden behind other content such as sticky headers, footers, or overlays.

## Key points
- When a component receives keyboard focus, it must not be fully obscured by author-created content such as sticky navigation bars, cookie banners, or chat widgets.
- At minimum, the focused element must be partially visible (WCAG 2.4.11, Level AA).
- Ideally, the focused element should be fully visible (WCAG 2.4.12, Level AAA).
- Sticky headers, fixed footers, and floating overlays are the most common causes.
- This is particularly important for keyboard-only users who rely on visible focus to navigate.

## Developer checks
- Tab through the page and check if focus ever disappears behind a sticky header or footer.
- Check for fixed-position elements (navigation bars, cookie banners, chat widgets) that overlap content.
- Verify focus is visible when tabbing through content near the top and bottom of scrollable areas.
- Test with different viewport sizes where fixed elements take up more relative space.
- Confirm focus remains visible during scrolling triggered by focus movement.

## Fix patterns
- Use `scroll-padding-top` and `scroll-padding-bottom` in CSS to account for fixed elements.
- Add JavaScript to scroll focused elements into view, accounting for sticky element heights.
- Reduce the size of fixed-position elements or make them collapsible.
- Ensure cookie banners and chat widgets do not permanently obscure page content.
- Test focus visibility with sticky elements across all breakpoints.

## Examples
```css
/* Account for sticky header height when scrolling to focused elements */
html {
  scroll-padding-top: 80px;   /* height of the sticky header */
  scroll-padding-bottom: 60px; /* height of any sticky footer */
}

/* Sticky header that could cause issues */
.sticky-header {
  position: fixed;
  top: 0;
  height: 80px;
  width: 100%;
  z-index: 100;
}
```

```js
// Ensure focused element is not hidden behind sticky header
document.addEventListener('focusin', (e) => {
  const header = document.querySelector('.sticky-header');
  const headerHeight = header ? header.offsetHeight : 0;
  const rect = e.target.getBoundingClientRect();

  if (rect.top < headerHeight) {
    window.scrollBy(0, rect.top - headerHeight - 16);
  }
});
```
