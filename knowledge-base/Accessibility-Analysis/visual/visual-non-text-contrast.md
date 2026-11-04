# Visual: Non-Text Contrast

## Tags
Tags: #visual #non-text-contrast #ui-components #graphical-objects #wcag #1.4.11 #eaa

## Purpose
Ensure user interface components and meaningful graphical objects have sufficient contrast against their background, so users with low vision can perceive interactive controls, states, and informational graphics.

## Key points
- User interface components and their states must have a contrast ratio of at least 3:1 against adjacent colours (WCAG 1.4.11).
- Graphical objects required to understand the content must also meet 3:1 contrast.
- This applies to: form field borders, button boundaries, focus indicators, icons used for information, chart elements, and state indicators (checked, selected, active).
- The 3:1 ratio applies to the visual boundary that identifies the component, not necessarily the fill colour.
- Disabled components are exempt from this requirement.
- Decorative graphics that do not convey information are exempt.

### What counts as a UI component boundary?
- The border or outline of a text input field.
- The boundary of a button (if it has no visible border, the contrast of the button fill against the page background).
- The visual indicator of a checkbox or radio button.
- Custom toggle switches, sliders, and range controls.
- Focus indicators (also covered by 2.4.7 but must meet 3:1 for non-text contrast too).

### What counts as a meaningful graphical object?
- Icons that convey information (warning icons, status indicators).
- Chart elements (bars, lines, pie segments) where distinction matters.
- Infographics and diagrams used to explain content.
- Map elements that convey navigation or location information.

## Developer checks
- Check contrast of form field borders/outlines against the background (3:1 minimum).
- Verify button boundaries or fills have 3:1 contrast against adjacent colours.
- Confirm custom checkboxes, radio buttons, toggles, and sliders meet 3:1 contrast.
- Check that selected/active/hover states meet 3:1 contrast.
- Verify icons used for meaning (not decoration) meet 3:1 contrast.
- Test chart and graph elements for sufficient contrast between segments and against the background.
- Confirm focus indicators meet 3:1 contrast (overlap with WCAG 2.4.7).
- Test in both light and dark mode.

## Fix patterns
- Add or darken borders on form fields so they meet 3:1 against the background.
- Increase the contrast of button backgrounds or borders.
- Use strong, visible custom focus indicators (not just a subtle colour change).
- Ensure state changes (active, selected, checked) have visible contrast differences.
- Add patterns, hatching, or labels to chart segments in addition to colour differences.
- Use a contrast checking tool that supports non-text element testing.
- Avoid relying on thin, light-grey borders for input fields on white backgrounds.

## Examples
```css
/* Incorrect: low-contrast input border on white background */
input {
  border: 1px solid #cccccc; /* #ccc on #fff = 1.6:1 — FAIL */
  background: #ffffff;
}

/* Correct: sufficient contrast input border */
input {
  border: 1px solid #767676; /* #767676 on #fff = 4.5:1 — PASS */
  background: #ffffff;
}

/* Incorrect: button with no visible boundary */
.ghost-button {
  background: transparent;
  border: 1px solid #dddddd; /* too low contrast */
  color: #999999;
}

/* Correct: button with clear boundary */
.ghost-button {
  background: transparent;
  border: 2px solid #595959; /* 7:1 against white — PASS */
  color: #595959;
}

/* Custom checkbox with sufficient contrast */
.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #333333;
  border-radius: 3px;
}

.custom-checkbox.checked {
  background-color: #005fcc;
  border-color: #005fcc;
}

/* Chart: patterns supplement colour */
.chart-bar-a {
  background: #005fcc;
  background-image: repeating-linear-gradient(
    45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px
  );
}
```

```html
<!-- Icon with sufficient contrast -->
<span class="status-icon" aria-label="Warning">
  <svg fill="#b35900" aria-hidden="true" width="20" height="20">
    <!-- warning triangle icon, #b35900 on white = 4.6:1 PASS -->
  </svg>
  Warning
</span>

<!-- Chart with labels, not just colour -->
<figure>
  <figcaption>Quarterly revenue</figcaption>
  <div class="chart">
    <div class="chart-bar" style="height: 60%; background: #005fcc;">
      <span>Q1: €60k</span>
    </div>
    <div class="chart-bar" style="height: 80%; background: #b35900;">
      <span>Q2: €80k</span>
    </div>
  </div>
</figure>
```

### Recommended contrast checking tools
- **WebAIM Contrast Checker** — https://webaim.org/resources/contrastchecker/
- **Colour Contrast Analyser (CCA)** — Desktop tool by TPGi.
- **axe DevTools** — Reports non-text contrast issues.
- **Stark** — Figma/Sketch plugin for design-phase contrast checking.
