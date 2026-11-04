# CSS Visual Accessibility Patterns

## Tags
#css #html #visual-design #focus-indicators #touch-targets #contrast #wcag-2.2 #2.4.7 #2.5.5

## Overview
Critical CSS patterns for detecting visual accessibility defects in high-complexity stylesheets affecting focus visibility, interactive element sizing, and visual contrast.

---

## Pattern 1: Focus Indicator Removal on Component Base Classes

### What to look for
CSS rules that remove focus outlines from interactive elements by setting `outline: none` or `outline: 0` on base component selectors.

### Common violations

```css
/* ❌ VIOLATION: outline removed from all buttons */
.btn {
  outline: none;
  border: 1px solid #999;
  padding: 8px 16px;
}

/* ❌ VIOLATION: outline removed from base tab class */
.tab-button {
  background: #f0f0f0;
  outline: 0;
  border: none;
  cursor: pointer;
}

/* ❌ VIOLATION: global outline removal on links */
a {
  color: blue;
  outline: none;
  text-decoration: none;
}

/* ❌ VIOLATION: universal selector removes outline */
* {
  outline: none;
}

/* ❌ VIOLATION: outline reset in form reset */
button, input, select, textarea {
  outline: 0;
  border: none;
}

/* ❌ VIOLATION: nav items lose focus indicator */
.nav-item {
  padding: 12px;
  outline: none;
  display: inline-block;
}

/* ❌ VIOLATION: Interactive elements outline removed */
.menu-item {
  outline: none;
}

.badge {
  outline: 0;
}

.icon-button {
  outline: none;
}
```

### Correct implementations

```css
/* ✅ CORRECT: button with focus outline recovery */
.btn {
  border: 1px solid #999;
  padding: 8px 16px;
  background: white;
}

.btn:focus-visible {
  outline: 2px solid #0066cc;  /* Visible focus indicator */
  outline-offset: 2px;
}

/* ✅ CORRECT: tab with focus-visible */
.tab-button {
  background: #f0f0f0;
  border: 1px solid #ddd;
  cursor: pointer;
  padding: 12px 16px;
}

.tab-button:focus-visible {
  outline: 3px solid #0066cc;  /* Strong focus indicator */
}

/* ✅ CORRECT: link with focus treatment */
a {
  color: blue;
  text-decoration: none;
}

a:focus-visible {
  outline: 2px solid #0066cc;  /* Focus visible on links */
  outline-offset: 2px;
}

/* ✅ CORRECT: nav items with focus recovery */
.nav-item {
  padding: 12px;
  display: inline-block;
}

.nav-item:focus-visible {
  outline: 2px solid #0066cc;
}

/* ✅ CORRECT: Alternative focus style with box-shadow */
.button-alt {
  background: #007bff;
  color: white;
  border: none;
}

.button-alt:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);  /* Alternative focus style */
}

/* ✅ CORRECT: Interactive elements with strong focus */
.interactive {
  cursor: pointer;
}

.interactive:focus-visible {
  outline: 2px solid #000;
}
```

---

## Pattern 2: Touch Targets Below Minimum 44×44 Pixels

### What to look for
Interactive elements with CSS-enforced dimensions below 44×44 CSS pixels without sufficient padding or spacing compensation.

### Common violations

```css
/* ❌ VIOLATION: tiny button */
.icon-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
}

/* ❌ VIOLATION: small checkbox */
input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

/* ❌ VIOLATION: small radio button */
input[type="radio"] {
  width: 14px;
  height: 14px;
  min-width: 14px;
  min-height: 14px;
}

/* ❌ VIOLATION: close button too small */
.close-btn {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* ❌ VIOLATION: tag remove button undersized */
.tag-close {
  width: 16px;
  height: 16px;
  padding: 0;
}

/* ❌ VIOLATION: link button too compact */
.link-btn {
  font-size: 12px;
  padding: 2px 4px;
  min-height: 20px;
}

/* ❌ VIOLATION: badge with small click area */
.badge-interactive {
  width: 24px;
  height: 24px;
  display: inline-flex;
}

/* ❌ VIOLATION: pagination link undersized */
.pagination a {
  width: 30px;
  height: 30px;
  display: inline-flex;
}
```

### Correct implementations

```css
/* ✅ CORRECT: icon button with sufficient touch area */
.icon-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
}

/* ✅ CORRECT: icon with padding for touch */
.icon-btn-compact {
  /* Icon 24px, but padding makes clickable area 44px */
  padding: 10px;
  width: 24px;
  height: 24px;
}
/* Total: 24 + 10*2 = 44px */

/* ✅ CORRECT: checkbox with increased size */
input[type="checkbox"] {
  width: 44px;
  height: 44px;
  cursor: pointer;
}

/* ✅ CORRECT: checkbox via wrapper */
.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  padding: 8px;  /* Adds to click area */
}

.checkbox-wrapper input {
  width: 24px;
  height: 24px;
}
/* Wrapper provides 24 + 8*2 = 40px, close enough */

/* ✅ CORRECT: close button with sufficient size */
.close-btn {
  width: 44px;
  height: 44px;
  padding: 10px;
  cursor: pointer;
}

/* ✅ CORRECT: link button minimum size */
.link-btn {
  font-size: 14px;
  padding: 10px 16px;
  min-height: 44px;  /* Minimum 44px height */
  display: inline-block;
}

/* ✅ CORRECT: badge with sufficient click area */
.badge-interactive {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ✅ CORRECT: pagination links sized properly */
.pagination a {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

---

## Pattern 3: Focus Ring Color Insufficient Contrast

### What to look for
Focus indicator colors that don't provide sufficient contrast (≥3:1) against surrounding background colors.

### Common violations

```css
/* ❌ VIOLATION: light outline on light background */
.btn-light:focus {
  outline: 1px solid #ddd;  /* Light gray on light btn */
}

/* ❌ VIOLATION: gray outline too subtle */
button:focus {
  outline: 2px solid #999;  /* Gray hard to see */
}

/* ❌ VIOLATION: low contrast focus when darker background */
input:focus {
  outline: 2px solid #666;  /* Dark gray on dark input background */
}

/* ❌ VIOLATION: focus color matches nearby text */
a:focus {
  outline: 1px solid blue;  /* Same blue as link text */
}

/* ❌ VIOLATION: outline removed, replaced with near-white box-shadow */
.btn:focus {
  outline: none;
  box-shadow: inset 0 0 0 1px #f0f0f0;  /* Nearly invisible */
}

/* ❌ VIOLATION: dark on dark in dark mode */
[data-theme="dark"] button:focus {
  outline: 2px solid #333;  /* Dark on dark background */
}
```

### Correct implementations

```css
/* ✅ CORRECT: high contrast outline on light background */
.btn-light:focus-visible {
  outline: 2px solid #0066cc;  /* Blue on light background, 3:1+ contrast */
}

/* ✅ CORRECT: strong outline color */
button:focus-visible {
  outline: 2px solid #000;  /* Black on any light background */
}

/* ✅ CORRECT: focus contrast on dark backgrounds */
input:focus-visible {
  outline: 2px solid #ffff00;  /* Yellow on dark input background */
}

/* ✅ CORRECT: distinct focus color from link text */
a:focus-visible {
  outline: 2px solid #ff6600;  /* Orange stands out from blue link */
  outline-offset: 2px;
}

/* ✅ CORRECT: visible outline instead of invisible shadow */
.btn:focus-visible {
  outline: 2px solid #0066cc;  /* Visible outline */
  outline-offset: 2px;
}

/* ✅ CORRECT: focus color visible in dark mode */
[data-theme="dark"] button:focus-visible {
  outline: 2px solid #ffff00;  /* Yellow on dark background */
}

/* ✅ CORRECT: thick outline for better visibility */
a:focus-visible {
  outline: 3px solid #000;  /* Thicker = easier to see */
}

/* ✅ CORRECT: box-shadow with high contrast */
input:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.5);  /* Blue shadow, 3:1+ contrast */
}
```

---

## Pattern 4: Contrast Ratio Violations on Text and Components

### What to look for
Text colors or component backgrounds that don't meet WCAG contrast requirements (normal: 4.5:1, large: 3:1).

### Common violations

```css
/* ❌ VIOLATION: light gray text on white */
.subtitle {
  color: #ccc;  /* ~1.5:1 contrast on white */
  background: white;
}

/* ❌ VIOLATION: text on colored background too light */
.badge-info {
  background: #0066cc;
  color: #99ccff;  /* Light blue on blue, very low contrast */
}

/* ❌ VIOLATION: placeholder text insufficient contrast */
input::placeholder {
  color: #bbb;  /* Light gray, ~2:1 on white */
}

/* ❌ VIOLATION: disabled button text hard to read */
button:disabled {
  background: #f0f0f0;
  color: #ccc;  /* ~2.5:1 on light gray */
}

/* ❌ VIOLATION: secondary text too light */
.secondary-text {
  color: #999;  /* ~4:1 on white, below 4.5:1 for small text */
  font-size: 12px;
}
```

### Correct implementations

```css
/* ✅ CORRECT: high contrast subtitle */
.subtitle {
  color: #333;  /* Dark gray on white, ~7:1 */
  background: white;
}

/* ✅ CORRECT: text on colored background with contrast */
.badge-info {
  background: #0066cc;
  color: white;  /* White on blue, ~8:1 */
}

/* ✅ CORRECT: placeholder with sufficient contrast */
input::placeholder {
  color: #666;  /* Dark gray, ~4.5:1 on white */
}

/* ✅ CORRECT: disabled button readable */
button:disabled {
  background: #e0e0e0;
  color: #333;  /* Dark text on light background, ~7:1 */
}

/* ✅ CORRECT: secondary text with sufficient contrast */
.secondary-text {
  color: #555;  /* Dark gray, ~5.5:1 on white */
  font-size: 12px;
}

/* ✅ CORRECT: link color with sufficient contrast */
a {
  color: #0066cc;  /* Blue link, ~5:1 on white */
}

/* ✅ CORRECT: visited link still has contrast */
a:visited {
  color: #551a8b;  /* Purple, ~5:1 on white */
}
```

---

## Detection Checklist for CSS Accessibility Auditing

- [ ] No `outline: none` on base element classes (only acceptable on focused alternatives)
- [ ] All interactive elements ≥44×44 CSS pixels
- [ ] Focus outline color ≥3:1 contrast against surrounding background
- [ ] Text color ≥4.5:1 contrast on normal text
- [ ] Text color ≥3:1 contrast on large text (18pt+)
- [ ] Button/badge color ≥3:1 contrast
- [ ] Disabled state still readable (≥4.5:1)

---

## WCAG References

- **WCAG 2.2 SC 2.4.7:** Focus Visible — keyboard focus must be visible
- **WCAG 2.2 SC 2.5.5:** Target Size (Enhanced) — interactive elements ≥44×44 CSS pixels
- **WCAG 2.2 SC 1.4.3:** Contrast (Minimum) — text ≥4.5:1 for normal, ≥3:1 for large
- **WCAG 2.2 SC 1.4.11:** Non-text Contrast — UI components ≥3:1 contrast ratio
