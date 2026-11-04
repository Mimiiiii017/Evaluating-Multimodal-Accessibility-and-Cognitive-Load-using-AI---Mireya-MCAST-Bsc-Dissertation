# Controls: Target Size

## Tags
Tags: #controls #target-size #touch #mobile #wcag #2.5.8

## Purpose
Ensure interactive elements are large enough to be activated easily, preventing accidental activation and supporting users with motor impairments, tremors, or limited dexterity.

## Key points
- The target size for pointer inputs must be at least 24×24 CSS pixels (WCAG 2.5.8, Level AA).
- The enhanced target size recommendation is 44×44 CSS pixels (WCAG 2.5.5, Level AAA).
- Targets smaller than 24×24 pixels must have sufficient spacing so the 24px target area does not overlap with adjacent targets.
- Exceptions include inline text links, targets whose size is determined by the user agent, and targets where a larger alternative is available on the same page.
- Small touch targets increase error rates for all users, especially on mobile devices.
- Grouping small targets too closely causes accidental activation.

## Developer checks
- Measure interactive element sizes (links, buttons, icons, checkboxes) to confirm they meet 24×24px minimum.
- Check spacing between adjacent targets.
- Verify icon-only buttons and controls meet the minimum target size.
- Test on mobile devices and with touch input.
- Confirm form controls (checkboxes, radio buttons) have a large enough clickable/tappable area.
- Check inline links for adequate size and spacing from other links.

## Fix patterns
- Set minimum width and height on interactive elements.
- Use padding to increase the clickable area without changing visual size.
- Add spacing (margin or gap) between adjacent small targets.
- Wrap checkbox and radio inputs in their labels to increase the tappable area.
- Use CSS to ensure icon buttons have sufficient padding.

## Examples
```css
/* Minimum target size */
button,
a,
input[type="checkbox"],
input[type="radio"],
select {
  min-width: 24px;
  min-height: 24px;
}

/* Enhanced target size for touch-friendly interfaces */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 8px;
}

/* Adequate spacing between adjacent targets */
.icon-toolbar button {
  min-width: 44px;
  min-height: 44px;
  margin: 4px;
}
```

```html
<!-- Checkbox with large clickable area via label -->
<label class="checkbox-label">
  <input type="checkbox" name="agree">
  <span>I agree to the terms</span>
</label>
```

```css
.checkbox-label {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 8px;
  cursor: pointer;
}
```
