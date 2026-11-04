# Keyboard: Focus Indicators

## Tags
Tags: #keyboard #focus #focus-indicator #wcag #2.4.7 #2.4.13

## Purpose
Ensure users navigating with a keyboard can always see which element currently has focus, supporting orientation, efficiency, and error prevention.

## Key points
- A visible focus indicator must be present for all focusable elements.
- Focus indicators must be clearly distinguishable from the default state.
- Removing focus outlines without providing an accessible alternative creates barriers.
- Focus styles must be visible against all backgrounds and themes.
- Custom components must provide their own focus styles.

## Developer checks
- Navigate the page using only the keyboard and observe focus visibility.
- Check that focus indicators are not disabled using `outline: none` without replacement.
- Verify focus is visible on buttons, links, form fields, and custom widgets.
- Ensure focus styles meet sufficient contrast against the background.
- Test focus visibility in high-contrast modes and zoomed views.

## Fix patterns
- Restore default browser focus styles when they have been removed.
- Add custom focus styles using `:focus` or `:focus-visible`.
- Ensure focus indicators are at least as visible as hover states.
- Avoid relying solely on color changes that may be subtle or low-contrast.
- Apply consistent focus styling across all interactive elements.

## Examples
```css
/* Default-friendly custom focus style */
button:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

/* Using :focus-visible to avoid mouse-triggered focus styles */
a:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 3px solid #005fcc;
}
```

```html
<!-- Focusable element with visible focus -->
<a href="/settings">Account settings</a>
```

---

## Anti-patterns

### `box-shadow` is not a valid focus indicator

`box-shadow` is sometimes used to style a custom focus ring, but it is **not visible in Windows High Contrast Mode** (also called Forced Colours Mode), where `box-shadow` is suppressed entirely. Always use the `outline` property (or `outline` + `outline-offset`) for focus indicators.

```css
/* ❌ Broken — invisible in high-contrast mode */
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px #005fcc;
}

/* ✅ Correct — outline is always visible, including high-contrast mode */
button:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}
```

### Detection rule

Any selector that sets `outline: none` or `outline: 0` AND replaces it only with `box-shadow` (without any `outline` property with a non-zero value) is a violation.

---

## Pairing `:focus` with `:hover`

Whenever a `:hover` rule changes the appearance of an interactive element (colour, background, underline, border), the same visual change must be replicated for `:focus` (or `:focus-visible`). Keyboard users rely on the same visual affordances as mouse users.

```css
/* ❌ Broken — hover state has no keyboard equivalent */
a:hover {
  text-decoration: none;
  color: #005fcc;
}

/* ✅ Correct — :focus mirrors :hover */
a:hover,
a:focus {
  text-decoration: none;
  color: #005fcc;
}
```

### Detection rule

A CSS rule that applies only to `:hover` (with no accompanying `:focus` or `:focus-visible` declaration for the same selector and properties) is a candidate violation when the property change conveys interactive state to the user.
