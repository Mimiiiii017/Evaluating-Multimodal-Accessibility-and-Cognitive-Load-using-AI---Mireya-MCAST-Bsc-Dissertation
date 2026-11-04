# CSS Accessibility Complete Patterns Guide

## Focus Indicator Patterns

### Violation: Focus Indicator Removed Without Replacement

```css
/* VIOLATION: Removes focus indicator globally without replacement */
* {
  outline: none;
}

button:focus {
  outline: none;
}

a {
  outline: none;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
}

/* Utility that removes focus from all interactive elements */
.focus-ring-none {
  outline: none !important;
  box-shadow: none !important;
}
```

**Why it fails:**
- Keyboard users cannot see which element has focus
- Tab navigation becomes unusable
- WCAG 2.4.7 Level AA violation
- Affects all keyboard-only users

**Correct implementation:**

```css
/* CORRECT: Provides visible focus indicator */
button:focus-visible,
a:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}

/* Or use box-shadow for custom styling */
.custom-button:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 95, 204, 0.5);
  outline: none;
}

/* Remove outline only for mouse users */
button:focus:not(:focus-visible) {
  outline: none;
}

/* Utility class that ADDS visible focus */
.focus-ring {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}

.focus-ring:focus {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}
```

**Key rules:**
- Never remove focus indicator without replacement
- Use `:focus-visible` to only show on keyboard interaction
- Minimum 3px outline or equivalent contrast
- Outline-offset of at least 2px maintains visibility
- Box-shadow can replace outline if sufficient contrast

---

## Touch Target Sizing

### Violation: Buttons Below 44×44 Minimum

```css
/* VIOLATION: Too small for reliable touch interaction */
.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  min-height: 20px;
  min-width: 20px;
}

/* Checkbox/radio below minimum */
input[type="checkbox"],
input[type="radio"] {
  width: 16px;
  height: 16px;
}

/* Icon button with insufficient target */
.btn-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Search button too narrow */
#site-search button[type="submit"] {
  width: 28px;
  height: 28px;
}

/* Footer nav links insufficient padding */
footer nav a {
  display: inline;
  padding: 2px;
}
```

**Why it fails:**
- 44×44px is WCAG AAA minimum for touch targets
- Motor impairment users struggle with small targets
- Mobile users experience accidental clicks
- WCAG 2.5.5 Level AAA violation

**Correct implementation:**

```css
/* CORRECT: Meeting 44×44 minimum */
.btn {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-sm {
  min-height: 36px;
  min-width: 36px;
  padding: 8px 12px;
}

/* Checkbox with proper sizing */
input[type="checkbox"],
input[type="radio"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 10px;
}

/* Icon buttons sized for touch */
.btn-icon {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Search with adequate target */
#site-search button[type="submit"] {
  min-width: 44px;
  min-height: 44px;
  padding: 10px 14px;
}

/* Nav links with proper spacing */
footer nav a {
  display: inline-block;
  padding: 12px 16px;
  min-height: 44px;
  line-height: 1.5;
}

/* Adjacent buttons need spacing */
.button-group button + button {
  margin-left: 8px;
}

/* Compensate with padding when minimum size required */
.filter-label {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  min-height: 44px;
}

.filter-label input[type="checkbox"] {
  margin-right: 8px;
}
```

**Key rules:**
- Minimum 44×44px active touch area (WCAG AAA)
- Include padding in minimum sizing
- Adjacent targets need 8px minimum spacing
- All interactive elements must meet this standard
- Use flexbox to center content while maintaining size

---

## Motion and Animation Accessibility

### Violation: Motion Animation Without Preference Support

```css
/* VIOLATION: Animation plays without checking preference */
.hero-image {
  animation: slide-in 0.6s ease-in-out;
}

@keyframes slide-in {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Button hover with motion */
.btn:hover {
  transform: translateY(-2px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* Pricing card animation */
.pricing-card--featured:hover {
  transform: scale(1.05);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Feature card animation */
.feature-card {
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
}
```

**Why it fails:**
- Vestibular disorders triggered by motion
- Users on medication sensitive to movement
- WCAG 2.3.3 Animation from Interactions Level AAA
- 25% of users disable animations

**Correct implementation:**

```css
/* CORRECT: Respects prefers-reduced-motion */

/* Default: No motion when preference unclear */
.hero-image {
  opacity: 1;
  transform: translateX(0);
}

/* Animation only enabled when user allows motion */
@media (prefers-reduced-motion: no-preference) {
  .hero-image {
    animation: slide-in 0.6s ease-in-out;
  }

  @keyframes slide-in {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
}

/* Button: Subtle change without motion */
.btn {
  background-color: #005fcc;
  transition: background-color 0.2s ease;
  transform: none;
}

.btn:hover {
  background-color: #004399;
  /* No transform - color change sufficient */
}

/* Button motion only when allowed */
@media (prefers-reduced-motion: no-preference) {
  .btn:hover {
    transform: translateY(-2px);
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
}

/* Pricing card - respectful animation */
.pricing-card--featured {
  background-color: #f0f9ff;
  border: 2px solid #005fcc;
}

@media (prefers-reduced-motion: no-preference) {
  .pricing-card--featured:hover {
    transform: scale(1.05);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

/* Without reduced-motion preference */
@media (prefers-reduced-motion: reduce) {
  .pricing-card--featured:hover {
    transform: none;
  }
}

/* Feature cards with fallback */
.feature-card {
  border: 1px solid #e2e8f0;
  background-color: white;
}

@media (prefers-reduced-motion: no-preference) {
  .feature-card {
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Key rules:**
- Always wrap animations with `@media (prefers-reduced-motion: no-preference)`
- Provide functional equivalent without motion
- Essential transitions (focus, state change) can be instant
- Test with `prefers-reduced-motion: reduce` system setting

---

## Color Contrast Ratios

### Violation: Insufficient Contrast

```css
/* VIOLATION: Light gray on white - 2.3:1 contrast */
.secondary-text {
  color: #aaaaaa;
  background-color: white;
}

/* VIOLATION: Dark gray on dark background - 1.8:1 */
.footer-text {
  color: #666666;
  background-color: #555555;
}

/* VIOLATION: Light blue on white - 3.2:1 (needs 4.5:1) */
.primary-button {
  color: white;
  background-color: #5588bb;
}

/* VIOLATION: Placeholder text insufficient contrast */
input::placeholder {
  color: #cccccc;
  background-color: white;
}

/* VIOLATION: Disabled state too light */
button:disabled {
  color: #dddddd;
  background-color: #ffffff;
  cursor: not-allowed;
}
```

**Why it fails:**
- Low contrast prevents reading for users with:
  - Low vision (20/40 vision)
  - Color blindness (red-green, blue-yellow)
  - Older adults with age-related vision changes
- WCAG 2.1.3 Contrast Minimum Level AA requires 4.5:1 for normal text, 3:1 for large text
- WCAG 2.1.3 Level AAA requires 7:1 for normal, 4.5:1 for large

**Correct implementation:**

```css
/* CORRECT: 4.5:1 contrast minimum */
.secondary-text {
  color: #666666; /* Ratio 7:1 on white */
  background-color: white;
}

/* Dark text on dark backgrounds - use lighter background */
.footer-text {
  color: #ffffff;
  background-color: #333333; /* High contrast */
}

/* Primary button with WCAG AAA */
.primary-button {
  color: white;
  background-color: #003f7f; /* Proper blue for 7:1 */
}

/* Alternative: Add border for definition */
.primary-button {
  color: #003f7f;
  background-color: #ffffff;
  border: 2px solid #003f7f;
}

/* Placeholder text meeting minimum */
input::placeholder {
  color: #666666; /* 7:1 on white */
  background-color: white;
}

/* Disabled state contrast maintained */
button:disabled {
  color: #666666; /* Maintains contrast */
  background-color: #f8f8f8;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Test these combinations */
.test-combinations {
  /* Dark text on light - safe */
  color: #222222;
  background-color: #ffffff;
  /* Ratio: 18.5:1 */

  /* Light text on dark - safe */
  color: #ffffff;
  background-color: #1a1a1a;
  /* Ratio: 15.8:1 */

  /* Medium contrast - acceptable */
  color: #444444;
  background-color: #ffffff;
  /* Ratio: 12.6:1 */
}

/* Hover states must maintain contrast */
.nav-link {
  color: #005fcc;
  background-color: white;
}

.nav-link:hover {
  color: #003f7f;
  background-color: #f0f9ff;
  /* Maintains contrast on state change */
}

/* Links underline to distinguish from surrounding text */
a {
  color: #005fcc;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}

a:visited {
  color: #663399;
  text-decoration: underline;
}

a:hover {
  color: #003f7f;
  text-decoration-thickness: 3px;
}
```

**Contrast ratio calculator:**
- Use https://www.tpgi.com/color-contrast-checker/
- Formula: (L1 + 0.05) / (L2 + 0.05) where L = relative luminance
- Minimum ratios:
  - Normal text (14px or less): 4.5:1 (AA), 7:1 (AAA)
  - Large text (18px+): 3:1 (AA), 4.5:1 (AAA)
  - Graphical elements: 3:1

---

## Letter-Spacing and Text Readability

### Violation: Letter-Spacing Impairs Readability

```css
/* VIOLATION: Excessive negative letter-spacing */
h1, h2, h3, h4, h5, h6 {
  letter-spacing: -0.05em;
}

.hero-content h1 {
  letter-spacing: -0.08em;
}

.stat-value {
  font-weight: bold;
  letter-spacing: -0.03em;
}

.price-amount {
  font-size: 3em;
  letter-spacing: -0.1em;
}
```

**Why it fails:**
- Dyslexic users need normal letter-spacing
- Negative spacing makes characters crowd
- Difficult to distinguish individual letters
- WCAG 2.4.8 Visual Presentation

**Correct implementation:**

```css
/* CORRECT: Maintains natural letter-spacing */
h1, h2, h3, h4, h5, h6 {
  letter-spacing: normal;
  /* Or slightly positive: 0.02em */
}

/* Large text can be adjusted but not negatively */
.hero-content h1 {
  font-size: 2.5em;
  letter-spacing: 0;
  /* Natural spacing for readability */
}

.stat-value {
  font-weight: bold;
  font-size: 2em;
  letter-spacing: normal;
}

.price-amount {
  font-size: 3em;
  letter-spacing: 0.02em; /* Slightly positive at large size */
}

/* Word spacing can be increased */
.hero-content {
  word-spacing: 0.1em;
  line-height: 1.6;
  letter-spacing: normal;
}
```

**Key rules:**
- Maintain natural letter-spacing (normal)
- Can go slightly positive (0.02em) for large text
- Never use negative letter-spacing
- Pair with adequate line-height (1.5-1.6)

---

## High Contrast Mode Support

### Violation: Focus/State Indicators Invisible in High Contrast

```css
/* VIOLATION: Box-shadow focus only - invisible in high contrast */
button:focus {
  box-shadow: 0 0 0 3px rgba(0, 95, 204, 0.5);
  outline: none;
}

/* Links colored only - no border */
a {
  color: #005fcc;
  text-decoration: none;
}
```

**Why it fails:**
- Users with high contrast mode (Windows, macOS) cannot see box-shadow
- Focus becomes invisible in forced-colors mode
- WCAG 2.4.7 requires visible focus indicator

**Correct implementation:**

```css
/* CORRECT: Outline works in high contrast mode */
button:focus-visible {
  outline: 3px solid;
  outline-offset: 2px;
  /* Outline uses system colors in high contrast mode */
}

/* Fallback with both outline and box-shadow */
button:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
  box-shadow: inset 0 0 0 2px white;
}

/* Links have borders not just color */
a {
  color: #005fcc;
  text-decoration: underline;
  text-decoration-thickness: 2px;
}

/* High contrast mode rules */
@media (forced-colors: active) {
  button {
    border: 2px solid CanvasText;
  }

  button:focus-visible {
    outline: 3px solid CanvasText;
  }

  a {
    text-decoration: underline;
  }
}

/* Or use forced-color-adjust to let system style */
.button-that-respects-contrast {
  forced-color-adjust: none;
  outline: 3px solid;
  outline-offset: 2px;
}
```

**Key rules:**
- Always use `outline` for focus, not just `box-shadow`
- Test with Windows High Contrast mode
- Use `@media (forced-colors: active)` for custom styling
- `forced-color-adjust: none` lets you maintain custom styling
