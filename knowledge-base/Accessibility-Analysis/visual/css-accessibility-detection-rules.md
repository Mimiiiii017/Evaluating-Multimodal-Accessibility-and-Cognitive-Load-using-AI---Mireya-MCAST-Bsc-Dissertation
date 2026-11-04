# CSS Accessibility Detection Rules

## Tags
Tags: #css #html #js #tsx #visual #focus #touch-target #motion #contrast #2.4.7 #2.5.5 #1.4.1 #2.3.1 #1.4.3 #1.4.11

## Overview

This document provides systematic detection rules for identifying CSS accessibility violations through static code analysis. Each rule describes the specific CSS pattern that constitutes a violation, what to look for, and common false-positive pitfalls.

---

## Rule 1 — Focus Indicator Removal

### What constitutes a violation

A CSS rule that sets `outline: 0` or `outline: none` on an interactive element (or using `:focus` / `:focus-visible`) without providing a compensating visible focus style in the same or a more specific selector.

### How to detect (static analysis)

1. Search for any occurrence of `outline: 0`, `outline: none`, or `outline: 0 !important`.
2. For each match, check the selector:
   - If the selector includes a pseudo-class like `:focus`, `:focus-visible`, `:focus-within`, or applies to a tag/class name used on interactive elements (a, button, input, select, textarea, [tabindex]) — it REMOVES the focus ring.
   - Check whether a `:focus-visible` block in the SAME scope re-applies `outline` with a visible value (e.g., `outline: 2px solid currentColor`). If no such compensating rule exists, the focus ring has been removed.
3. Check `box-shadow` as an alternative: a rule that removes `outline` but replaces it with a `box-shadow` that is visible (non-zero spread, visible colour) is acceptable.

### Common violation patterns

```css
/* ❌ Removes focus ring globally — applies to all interactive elements */
* { outline: none; }
*:focus { outline: 0; }

/* ❌ Base component rule (no :focus pseudo-class) — equally a violation.
   Setting outline:none on the base class removes the focus ring for all
   states including keyboard focus, even if no :focus rule exists. */
.btn           { outline: none; }   /* base button class — removes all outlines */
.tab           { outline: 0; }      /* tab component — focus ring gone */
.card-btn      { outline: none; }   /* card CTA buton */
.nav-item      { outline: 0; }      /* navigation item */
.footer-nav a  { outline: none; }   /* footer links */
.social-link   { outline: none; }   /* icon-only social link */
.pagination-btn { outline: none; }  /* pagination control */
.badge         { outline: 0; }      /* badge / pill */

/* ❌ Removes focus ring on a :focus or :focus-visible rule without replacement */
.btn:focus { outline: none; }
a:focus { outline: 0; }
.nav-item:focus-visible { outline: none; }

/* ✅ Removes browser default then replaces with custom visible indicator */
.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--focus-ring-color);
}
```

### Important: base-class rules vs :focus rules

Both of the following are violations — the absence of `:focus` does NOT make a rule safe:

| Selector pattern | Violation? |
|---|---|
| `.btn:focus { outline: none }` | ✅ Yes — classic :focus removal |
| `.btn:focus-visible { outline: none }` | ✅ Yes — removes keyboard-only ring |
| `.btn { outline: none }` | ✅ Yes — base rule prevents outline in ALL states including focus |
| `.btn { outline: none } .btn:focus-visible { outline: 2px solid blue }` | ❌ No — base rule overridden by visible :focus-visible replacement |

When scanning a stylesheet, inventory EVERY occurrence of `outline: none` or `outline: 0`, regardless of whether the selector includes a pseudo-class. Each distinct selector that sets outline removal without a compensating visible focus style in a paired rule is a separate violation.

### WCAG reference
SC 2.4.7 (Focus Visible, AA), SC 2.4.11 (Focus Appearance, AA 2.2).

---

## Rule 2 — Touch Target Below Minimum Size

### What constitutes a violation

An interactive element (button, link, input, icon-button) has an effective touch target area smaller than 24 × 24 CSS pixels (WCAG 2.2 minimum) or, for enhanced conformance, smaller than 44 × 44 CSS pixels.

### How to detect (static analysis)

1. Find selectors applied to interactive elements.
2. Check for explicit `height`, `min-height`, `width`, or `min-width` values.
3. If `height` or `min-height` is set to a value < 44px (e.g., `height: 32px`, `min-height: 36px`) AND no `padding` compensates to bring the tap area above 44px, flag as a potential violation.
4. Icon buttons using `font-size` instead of explicit dimensions: if `font-size` < 24px and no padding is set, the touch area is likely below minimum.

### Common violation patterns

```css
/* ❌ Small button without sufficient padding to compensate */
.btn-sm    { height: 24px; }
.icon-btn  { width: 24px; height: 24px; padding: 0; }
.close-btn { font-size: 12px; }

/* ✅ Padding brings total to ≥ 44px */
.icon-btn {
  width: 24px;
  height: 24px;
  padding: 10px; /* effective touch area = 44 × 44 px */
}
```

### WCAG reference
SC 2.5.5 Target Size (Enhanced, AAA: 44 × 44 px), SC 2.5.8 Target Size Minimum (AA 2.2: 24 × 24 px).

---

## Rule 3 — Visually-Hidden Utility Class Incorrect Implementation

### What constitutes a violation

A CSS class intended to hide content visually while keeping it accessible to screen readers uses `display: none` or `visibility: hidden`, which also hides it from assistive technologies.

### How to detect (static analysis)

1. Find any class whose name suggests screen-reader-only hiding: `.sr-only`, `.visually-hidden`, `.screen-reader-only`, `.a11y-hidden`, `.visually-hidden-focusable`.
2. Inspect the rule body:
   - If it contains `display: none` → **violation** (content removed from accessibility tree entirely).
   - If it contains `visibility: hidden` → **violation** (invisible to AT as well as sighted users).
   - If it contains `opacity: 0` alone without position clipping → **violation** (keyboard focus is lost in some browsers).
3. The correct implementation uses absolute positioning + clipping:

```css
/* ✅ Correct sr-only pattern — visually hidden but in accessibility tree */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ❌ Incorrect — hides from AT entirely */
.sr-only { display: none; }
.visually-hidden { visibility: hidden; opacity: 0; }
```

4. Also check for `.not-sr-only` or `.sr-only-focusable` — these should restore visibility on `:focus` using `position: static` and `clip: auto`.

### WCAG reference
SC 1.3.1 Info and Relationships, SC 4.1.2 Name Role Value.

---

## Rule 4 — Missing prefers-reduced-motion Override

### What constitutes a violation

A CSS file contains `animation`, `transition`, or `transform` declarations that trigger motion but does not wrap them in a `@media (prefers-reduced-motion: no-preference)` block, or does not provide a `@media (prefers-reduced-motion: reduce)` block that removes or minimises them.

### How to detect (static analysis)

1. Count all `animation:` and `transition:` declarations outside any `@media` block.
2. For each such declaration, check whether a `@media (prefers-reduced-motion: reduce)` block exists that:
   - Sets `animation: none` or `transition: none` for the same selector, OR
   - Sets `animation-duration` and `transition-duration` to `0.001ms` or `0s`.
3. If a motion declaration exists without a corresponding reduced-motion override, flag it.
4. `transition: color 0.2s` is fine as colour-only transitions do not cause vestibular disruption — the main violations are `transform`, `translate`, `scale`, `rotate`, `opacity` fade-in, and `@keyframes` that move elements.

### Common violation patterns

```css
/* ❌ Motion animation without reduced-motion override */
.hero-image { transition: transform 0.4s ease; }
.feature-card { animation: slide-in 0.6s ease-out; }

/* ✅ Motion wrapped in capability query */
@media (prefers-reduced-motion: no-preference) {
  .hero-image { transition: transform 0.4s ease; }
  .feature-card { animation: slide-in 0.6s ease-out; }
}
/* OR provide a disabling override */
@media (prefers-reduced-motion: reduce) {
  .hero-image { transition: none; }
  .feature-card { animation: none; }
}
```

### WCAG reference
SC 2.3.3 Animation from Interactions (AAA), SC 2.3.1 Three Flashes (AA).

---

## Rule 5 — Negative word-spacing

### What constitutes a violation

A CSS rule sets `word-spacing` to a negative value, which collapses or overlaps words and overrides user text-spacing customisations.

### How to detect (static analysis)

Search for `word-spacing:` with a negative value: `word-spacing: -0.1em`, `word-spacing: -2px`, `word-spacing: -.05rem`.

### WCAG reference
SC 1.4.12 Text Spacing (AA).

---

## Rule 6 — forced-colors Suppression

### What constitutes a violation

A CSS rule uses `forced-color-adjust: none` or the deprecated `-ms-high-contrast: none` to opt an element out of Windows High Contrast / Forced Colours mode, removing the user's chosen colour overrides.

### How to detect (static analysis)

1. Search for `forced-color-adjust: none`.
2. Search for `-ms-high-contrast: none`.
3. Any element with these rules will not respond to the user's forced colour scheme, making it invisible or unusable in High Contrast mode.

The correct pattern is to use the `@media (forced-colors: active)` block to adapt the component rather than suppressing the mode.

### WCAG reference
SC 1.4.3 Contrast Minimum, SC 1.4.11 Non-text Contrast (both impacted by forced-colors override).

---

## Rule 7 — Link Underlines Removed Without Alternative

### What constitutes a violation

Inline text links have `text-decoration: none` (or `text-decoration-line: none`) applied without a colour contrast difference of at least 3:1 between the link colour and the surrounding body text colour.

### How to detect (static analysis)

1. Find any `a { text-decoration: none; }` or `a:link { text-decoration: none; }` rule.
2. If the rule applies globally to inline links (not navigation blocks or buttons), flag it.
3. If a `text-decoration: underline` is restored on `:hover` or `:focus` but is absent at rest, the link is distinguishable only by colour at rest — a violation for users with colour vision deficiency.

### Common violation patterns

```css
/* ❌ Removes underline — link distinguishable by colour only */
a { text-decoration: none; color: var(--brand-primary); }

/* ✅ Restores underline or keeps it */
a { text-decoration: underline; }
a { text-decoration: none; border-bottom: 1px solid currentColor; } /* alternative */
```

### WCAG reference
SC 1.4.1 Use of Color (AA) — information cannot be conveyed by colour alone.

---

## Rule 8 — Contrast Failures

### What constitutes a violation

A CSS colour value used for text or UI component borders/states does not meet the minimum contrast ratio against its background.

- Normal text (< 18pt or < 14pt bold): **4.5:1** against background.
- Large text (≥ 18pt or ≥ 14pt bold): **3:1** against background.
- UI components and graphical objects (icon borders, input borders, focus rings): **3:1** against adjacent colour.

### How to detect (static analysis)

When both foreground (`color`) and background (`background-color`) values appear in the same selector or can be resolved from CSS variables, compute the relative luminance (WCAG formula) and derive the contrast ratio. Flag any pair below the applicable threshold.

Common violation patterns: light grey placeholder text on white backgrounds (`#aaaaaa` on `#ffffff` = 2.3:1, a common failure), secondary/muted text in UI libraries.

### WCAG reference
SC 1.4.3 Contrast Minimum (AA), SC 1.4.6 Contrast Enhanced (AAA: 7:1 normal, 4.5:1 large).
