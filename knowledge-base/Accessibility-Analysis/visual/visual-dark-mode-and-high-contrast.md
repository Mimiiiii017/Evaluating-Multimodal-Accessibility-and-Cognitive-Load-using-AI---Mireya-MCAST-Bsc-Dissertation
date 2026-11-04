# Visual: Dark Mode and High Contrast

## Tags
Tags: #visual #dark-mode #high-contrast #forced-colors #wcag #eaa

## Purpose
Ensure web content adapts correctly to dark mode preferences, high contrast modes, and forced color settings, so users with low vision or light sensitivity can use the site comfortably.

## Key points
- Many users with low vision, migraines, or photosensitivity use dark mode or high contrast settings.
- Windows High Contrast Mode (now called Forced Colors) overrides author-defined colors.
- CSS media queries `prefers-color-scheme` and `forced-colors` allow detection and adaptation.
- Custom focus indicators, borders, and icons must remain visible in all color modes.
- Images, charts, and media should remain perceptible in dark and high contrast modes.
- Background images used for meaning disappear in forced colors mode.

## Developer checks
- Test the site in dark mode (OS-level and browser-level).
- Test in Windows High Contrast Mode / Forced Colors.
- Verify focus indicators are visible in all color modes.
- Check that icons, borders, and graphical elements remain visible.
- Confirm text remains readable and contrast ratios are maintained.
- Verify background images used for informational purposes have fallbacks.

## Fix patterns
- Use `prefers-color-scheme: dark` to provide dark mode styles.
- Use `forced-colors: active` to adjust styles for Windows High Contrast.
- Ensure custom properties (CSS variables) adapt to color scheme changes.
- Replace background images used for meaning with inline elements or text.
- Use `currentColor` for SVG icons so they adapt to forced colors.
- Test focus indicators with both `outline` (visible in forced colors) and `box-shadow` (not visible in forced colors).

## Examples
```css
/* Dark mode support */
:root {
  --bg-color: #ffffff;
  --text-color: #1a1a1a;
  --link-color: #005fcc;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --link-color: #6db3f2;
  }
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}

a {
  color: var(--link-color);
}

/* Forced colors adaptation */
@media (forced-colors: active) {
  .custom-button {
    border: 2px solid ButtonText;
  }

  /* Ensure focus is visible — use outline, not box-shadow */
  :focus-visible {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }

  /* SVG icons adapt to system colors */
  svg {
    fill: currentColor;
  }
}
```

```html
<!-- Informational image with fallback for forced colors -->
<span class="status-icon" role="img" aria-label="Warning">
  <svg aria-hidden="true" fill="currentColor">
    <!-- warning icon -->
  </svg>
  Warning
</span>
```
