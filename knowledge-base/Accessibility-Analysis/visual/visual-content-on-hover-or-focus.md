# Visual: Content on Hover or Focus

## Tags
Tags: #visual #hover #focus #tooltips #popovers #wcag #1.4.13

## Purpose
Ensure additional content that appears on hover or keyboard focus (such as tooltips, popovers, and custom dropdowns) is dismissible, hoverable, and persistent, so users with low vision and motor impairments can perceive and interact with it.

## Key points
- Content that appears on hover or focus must be dismissible without moving hover or focus (e.g., by pressing Escape).
- Users must be able to move the pointer over the newly appeared content without it disappearing (hoverable).
- The content must remain visible until the user dismisses it, moves focus/hover, or the information is no longer valid (persistent).
- This applies to custom tooltips, popovers, dropdown menus triggered on hover, and any non-modal overlay.
- Native browser tooltips (from the `title` attribute) are exempt, but they are generally insufficient for accessibility.

## Developer checks
- Identify content that appears on hover or keyboard focus.
- Test whether the additional content can be dismissed without moving the pointer (e.g., pressing Escape).
- Hover the pointer over the newly appeared content and check that it remains visible.
- Move focus away and confirm the content disappears appropriately.
- Verify the content does not obscure other content the user needs to see.

## Fix patterns
- Make tooltip/popover content dismissible via the Escape key.
- Allow users to hover over the tooltip content itself without it disappearing.
- Keep the content visible until the user explicitly dismisses it or moves away.
- Avoid using `title` attributes as the sole source of important information.
- Position additional content so it does not cover the triggering element or other critical content.

## Examples
```html
<!-- Accessible tooltip pattern -->
<div class="tooltip-container">
  <button aria-describedby="tooltip1">Settings</button>
  <div id="tooltip1" role="tooltip" class="tooltip">
    Configure your account preferences
  </div>
</div>
```

```css
/* Tooltip visible on hover and focus */
.tooltip {
  display: none;
  position: absolute;
  padding: 8px;
  background: #333;
  color: #fff;
  border-radius: 4px;
}

.tooltip-container:hover .tooltip,
.tooltip-container:focus-within .tooltip {
  display: block;
}

/* Tooltip itself can be hovered */
.tooltip:hover {
  display: block;
}
```

```js
// Dismiss on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.tooltip').forEach(t => t.style.display = 'none');
  }
});
```
