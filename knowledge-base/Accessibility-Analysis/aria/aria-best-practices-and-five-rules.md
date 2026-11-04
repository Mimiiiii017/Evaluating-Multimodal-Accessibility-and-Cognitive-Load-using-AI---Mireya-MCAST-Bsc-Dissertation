# ARIA: Best Practices and the Five Rules of ARIA

## Tags
Tags: #aria #best-practices #five-rules-of-aria #semantic-html #wcag

## Purpose
Explain when and how ARIA should be used correctly, and highlight common misuse that can reduce accessibility instead of improving it.

## Key points
- ARIA is meant to enhance accessibility, not replace semantic HTML.
- Native HTML elements already provide built-in accessibility features.
- Incorrect ARIA usage can make interfaces harder to use with assistive technologies.
- The “Five Rules of ARIA” guide safe and effective usage.
- ARIA should only be used when native HTML cannot achieve the desired accessibility.

### The Five Rules of ARIA
1. **Do not use ARIA if you can use native HTML instead**  
   Native elements (`<button>`, `<input>`, `<nav>`, etc.) have built-in semantics and keyboard support.

2. **Do not change native semantics unless absolutely necessary**  
   Overriding roles can confuse assistive technologies.

3. **All interactive ARIA controls must be keyboard accessible**  
   ARIA does not add keyboard behavior automatically.

4. **Do not hide focusable elements from assistive technologies**  
   Elements that receive focus must be perceivable by screen readers.

5. **Accessible name and role are required**  
   Elements must expose both a role and a name that users can understand.

## Developer checks
- Look for ARIA roles applied to native elements unnecessarily.
- Check for `role="button"` on elements that could be `<button>`.
- Verify all ARIA widgets support keyboard interaction.
- Confirm accessible names are present (`aria-label`, `aria-labelledby`).
- Ensure ARIA is not used to mask structural or semantic issues.

## Fix patterns
- Replace ARIA-enhanced elements with native HTML where possible.
- Remove redundant or conflicting ARIA roles.
- Add keyboard event handling to custom widgets.
- Ensure all ARIA widgets have clear, descriptive accessible names.
- Test ARIA-heavy interfaces with screen readers.

## Examples
```html
<!-- Incorrect: unnecessary ARIA -->
<button role="button">Submit</button>

<!-- Correct: native element without ARIA -->
<button>Submit</button>

<!-- ARIA used appropriately for custom control -->
<div role="button" tabindex="0"
     aria-label="Expand details"
     onclick="toggleDetails()"
     onkeydown="if(event.key==='Enter'||event.key===' ') toggleDetails();">
  Show details
</div>

<!-- Incorrect: hiding focusable element -->
<button aria-hidden="true">Save</button>
```
