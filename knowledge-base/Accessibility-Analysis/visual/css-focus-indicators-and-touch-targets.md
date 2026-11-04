# CSS Focus Indicators and Touch Targets: Enhanced Detection Rules

## Tags
Tags: #css #html #visual #focus #touch-target #interactive-elements #2.4.7 #2.5.5 #1.4.3

## Purpose
Enhanced detection rules for identifying CSS accessibility violations specific to focus indicators and touch target sizing in high-complexity stylesheets.

## Enhanced Rule: Focus Indicator Removal on Component Base Classes

### What constitutes a violation

CSS rules that remove focus indicators from interactive components by setting `outline: none` or `outline: 0` on the base component class (not scoped to `:focus` pseudo-class). This is subtle because:

1. A rule like `.btn { outline: none; }` removes the outline in ALL states including keyboard focus
2. A rule like `.tab { outline: 0; }` applies to tab elements even when they receive keyboard focus
3. A rule like `a { outline: none; }` removes focus rings from all links globally

### How to detect

**Search for these patterns exactly:**
```css
/* BASE CLASS removes outline - violation even without :focus pseudo-class */
.btn { outline: none; }
.button { outline: 0; }
.tab-button { outline: none; }
.nav-item { outline: 0; }
.menu-item { outline: none; }
.pagination-button { outline: 0; }
.badge { outline: none; }
.pill { outline: 0; }
.card-action { outline: none; }
.icon-button { outline: 0; }
.close-button { outline: none; }
.skip-link { outline: 0; }

/* TAG selectors for interactive elements */
a { outline: none; }
button { outline: 0; }
a, button { outline: none; }
input, select, textarea { outline: 0; }

/* UNIVERSAL selector with outline removal */
* { outline: none; }
*:not(code) { outline: 0; }
```

### Common false negatives (easy to miss)

1. **Outline removal on pseudo-elements or sibling selectors:**
   ```css
   /* Easy to miss: outline removed on pseudo-element, focus ring gone */
   .btn::before { outline: none; }
   .btn + .tooltip { outline: 0; }
   ```

2. **Outline reset in reset stylesheets:**
   ```css
   /* Global reset that applies to interactive elements */
   button, a, input { 
     outline: none;  /* Applies to keyboard focus too */
   }
   ```

3. **Outline removal via outline shorthand:**
   ```css
   /* Not just outline: none — also outline: 0 or outline: none none */
   .btn { outline: none none; }
   .nav { outline: 0 0; }
   ```

### How to verify it's a REAL violation

For each `outline: none` / `outline: 0` match:

1. **Identify the selector scope:**
   - Base class like `.btn`? → VIOLATION if no `:focus-visible` compensation
   - Tag selector like `button`? → VIOLATION if no `:focus` / `:focus-visible` compensation
   - Universal `*`? → VIOLATION

2. **Check for LATER `:focus-visible` / `:focus` rules that restore the outline:**
   ```css
   .btn { outline: none; }
   /* ... many rules later ... */
   .btn:focus-visible { outline: 2px solid blue; }  /* Compensation present */
   ```
   If the later `:focus` rule exists and provides visible outline → NOT a violation
   If later rule is missing → VIOLATION

3. **Check for alternative visible focus style (box-shadow, background-color change, border):**
   ```css
   .btn { outline: none; }
   .btn:focus {
     box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.5);  /* Visible alternative */
   }
   ```
   If visible alternative exists → NOT a violation
   If only `outline: none` with no visible focus style → VIOLATION

---

## Enhanced Rule: Touch Targets Below Minimum Size Without Compensation

### What constitutes a violation

An interactive element (button, link, input, custom control) with a CSS-enforced height or width LESS than 44 pixels. WCAG 2.2 SC 2.5.5 requires touch targets of at least 44×44 CSS pixels (Android convention: 48×48 dp).

### How to detect

**Search for these on interactive element selectors:**

1. **Buttons and button-like elements:**
   ```css
   .btn { width: 30px; height: 30px; }  /* VIOLATION */
   .icon-btn { min-height: 24px; }      /* VIOLATION */
   .tag-close { width: 18px; }          /* VIOLATION */
   ```

2. **Links and navigation items:**
   ```css
   .nav-link { padding: 4px 8px; }      /* May be too small; calculate actual clickable area */
   a.tag { font-size: 12px; line-height: 16px; }  /* Need to verify click area */
   .breadcrumb a { min-height: 20px; }  /* VIOLATION */
   ```

3. **Form controls:**
   ```css
   input[type="checkbox"] { width: 16px; height: 16px; }  /* VIOLATION */
   input[type="radio"] { min-width: 18px; }               /* VIOLATION */
   ```

4. **Custom interactive elements:**
   ```css
   [role="button"] { height: 32px; }    /* VIOLATION */
   [role="tab"] { min-height: 36px; }   /* VIOLATION if no padding adds height */
   .slider-thumb { width: 20px; }       /* VIOLATION */
   ```

### Common false negatives

1. **Padding can expand click area even if base size is small:**
   ```css
   .btn {
     width: 30px;
     height: 30px;
     padding: 8px;                      /* Adds to click area: 30+16=46×46 */
   }
   ```
   Calculate: `final_size = declared_size + (2 × padding)`
   If `30 + (2 × 8) = 46px` → Min threshold met, NOT a violation

2. **Multiple size declarations (min/max can hide violations):**
   ```css
   .btn {
     width: 100%;          /* Large on desktop */
     min-width: 20px;      /* VIOLATION: can collapse to 20px on small screens */
     max-width: 200px;
   }
   ```

3. **Font-size and line-height on icon buttons:**
   ```css
   .icon-btn {
     font-size: 18px;      /* Don't assume this sets click target size */
     background: none;
     border: none;         /* No explicit width/height; actual size unclear */
   }
   ```
   Icon buttons without explicit width/height are often too small. Verify actual rendered size.

### How to verify it's a REAL violation

For each small size match:

1. **Calculate TOTAL click area including padding, border, margin:**
   - `effective_size = width + (2 × horizontal_padding + 2 × border_width)`
   - If effective size ≥ 44px → NOT a violation
   - If effective size < 44px → Check for next point

2. **Check for visual NEXT to or PART OF a larger clickable area:**
   ```css
   .close-icon {
     width: 16px;                    /* Small icon */
     padding: 12px;                  /* Padding makes it 40px */
   }
   /* Still might be small; check if spacing to other elements < 44px */
   ```
   If the element is part of a group and spacing between targets is <12px → VIOLATION on the group

3. **Mark as exceptions ONLY if:**
   - Element is NOT interactive (e.g., decorative or display-only)
   - OR element has substantial surrounding padding/click area that meets 44px
   - OR element is **secondary** with a 44px+ alternative available (WCAG exception)

---

## Rule: Focus Ring Color Insufficient Contrast

### What constitutes a violation

A focus ring (`outline`, `box-shadow`, `border` applied via `:focus` / `:focus-visible`) that provides insufficient contrast between the focus ring color and both:
1. The background behind the element
2. The background of the element itself

WCAG 2.2 SC 2.4.7 requires ≥ 3:1 contrast for focus indicators.

### How to detect

1. **Identify focus styles in CSS:**
   ```css
   .btn:focus { outline: 1px solid #ccc; }          /* Light outline */
   .input:focus-visible { box-shadow: 0 0 0 2px #f0f0f0; }  /* Very light */
   a:focus { border-bottom: 2px solid #999; }       /* Medium-dark */
   ```

2. **Check contrast:**
   - On light backgrounds (#ffffff, #f5f5f5): light outline colors fail
   - On dark backgrounds: dark outline colors fail
   - Test both scenarios

3. **Common failures:**
   ```css
   /* ❌ VIOLATION: Same color as input background */
   input { background: white; }
   input:focus { outline: 2px solid #fafafa; }  /* Nearly white outline on white bg */

   /* ❌ VIOLATION: Too light on light background */
   .btn:focus { outline: 2px solid #e0e0e0; }   /* Gray on light btn background */

   /* ❌ VIOLATION: Too dark on dark background */
   [data-theme="dark"] .btn:focus { outline: 2px solid #333; }  /* Dark on dark bg */
   ```

4. **Acceptable focus styles:**
   ```css
   /* ✅ High contrast on light background */
   .btn:focus { outline: 2px solid #0066cc; }   /* Blue, 3:1+ contrast */

   /* ✅ High contrast on dark background */
   .dark .btn:focus { outline: 2px solid #ffff00; }  /* Yellow, 3:1+ contrast */

   /* ✅ Thick outline with high contrast */
   button:focus-visible { outline: 3px solid #000; }  /* Black, highest contrast */
   ```

---

## Summary Checklist for CSS Focus & Touch Target Auditing

- ✓ No `outline: none` / `outline: 0` on base component classes without `:focus-visible` compensation
- ✓ No global `*` or tag-level `outline` removal without visible `:focus` alternative
- ✓ All interactive elements ≥ 44×44 CSS pixels (including padding and border)
- ✓ If element < 44px, verify padding/border expands to 44px
- ✓ Focus indicator has ≥ 3:1 contrast against surrounding background
- ✓ Focus indicators visible and not hidden by z-index or overflow
- ✓ No transparent or near-invisible outlines as "focus styles"

## References
- WCAG 2.2 SC 2.4.7 Focus Visible: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
- WCAG 2.2 SC 2.5.5 Target Size: https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
- Focus Ring Sizing in CSS: https://www.a11y-101.com/design/focus-indicator-size
