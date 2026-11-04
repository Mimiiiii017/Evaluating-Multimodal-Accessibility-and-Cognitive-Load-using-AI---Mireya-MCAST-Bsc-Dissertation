# Visual: CSS Visibility and Accessible Hiding Techniques

## Tags
Tags: #visual #css #hiding #visibility #aria-hidden #screen-readers #wcag

## Purpose
Explain the different methods for hiding content in HTML and CSS, and how each method affects visibility, accessibility tree exposure, focus behaviour, and screen reader announcements.

## Key points
- There are multiple ways to hide content, and each has a different impact on visual rendering, assistive technology exposure, and keyboard focus.
- Choosing the wrong hiding technique creates accessibility barriers.
- Content that is visually hidden but must remain accessible to screen readers requires the "sr-only" (screen reader only) technique.
- Content that is decorative or redundant should be hidden from both visual display and assistive technologies.
- Focusable elements must never be hidden from assistive technologies while remaining focusable.

## Comparison of hiding methods

| Method | Visually hidden? | Hidden from screen readers? | Removed from focus order? | Use case |
|---|---|---|---|---|
| `display: none` | Yes | Yes | Yes | Completely hidden from everyone |
| `visibility: hidden` | Yes | Yes | Yes | Hidden but retains layout space |
| `hidden` attribute | Yes | Yes | Yes | Semantic HTML equivalent of `display: none` |
| `aria-hidden="true"` | No (still visible) | Yes | No (danger!) | Hide decorative visuals from screen readers |
| `.sr-only` class | Yes | No (announced) | No | Visually hidden text for screen readers |
| `opacity: 0` | Yes (invisible) | No | No | Animations; avoid for hiding — still focusable |
| `clip-path: inset(100%)` | Yes | No | No | Alternative to sr-only technique |
| Off-screen positioning | Yes | No | No | Legacy sr-only technique |

## Developer checks
- Verify decorative elements use `aria-hidden="true"` or `role="presentation"`.
- Check that visually hidden content intended for screen readers uses the sr-only pattern.
- Confirm no focusable elements are inside `aria-hidden="true"` containers.
- Ensure `display: none` and `hidden` are used correctly when content should be removed entirely.
- Test with a screen reader to confirm hidden elements are not announced.
- Test with a keyboard to confirm hidden elements are not focusable.

## Fix patterns
- Use `display: none` or the `hidden` attribute to hide content from everyone.
- Use the `.sr-only` class for content that should only be available to screen readers.
- Use `aria-hidden="true"` for decorative visuals (icons, dividers) that are visible but meaningless to screen readers.
- Never put focusable elements inside an `aria-hidden="true"` container.
- Remove `aria-hidden="true"` from elements that convey important information.
- Use `inert` attribute (modern browsers) to make entire sections non-interactive and hidden from assistive technologies.

## Examples
```css
/* Screen reader only — visually hidden, still announced */
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

/* Allow sr-only elements to become visible on focus (e.g., skip links) */
.sr-only-focusable:focus,
.sr-only-focusable:active {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
  margin: 0;
}
```

```html
<!-- Decorative icon hidden from screen readers -->
<button>
  <svg aria-hidden="true" class="icon"><!-- decorative icon --></svg>
  Save document
</button>

<!-- Visually hidden label for screen readers -->
<button>
  <svg aria-hidden="true" class="icon"><!-- search icon --></svg>
  <span class="sr-only">Search</span>
</button>

<!-- Completely hidden from everyone -->
<div hidden>This content is not rendered at all.</div>

<!-- INCORRECT: focusable element inside aria-hidden -->
<div aria-hidden="true">
  <button>Delete</button> <!-- DANGER: focusable but hidden from AT -->
</div>

<!-- CORRECT: use inert to disable an entire section -->
<div class="modal-backdrop" inert>
  <!-- Background content is non-interactive while modal is open -->
</div>

<!-- CORRECT: aria-hidden on a purely decorative divider -->
<hr aria-hidden="true">
```
