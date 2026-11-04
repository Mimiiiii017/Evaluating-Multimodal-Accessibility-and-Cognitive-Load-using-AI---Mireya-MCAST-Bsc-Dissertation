# Forms: Labels and Accessible Names

## Tags
Tags: #forms #labels #accessible-name #aria #wcag #1.3.1 #4.1.2 #3.3.2
## Quick reference
Common form label violations to flag in code reviews:

- **`<input>` with no label** — an `<input>` that has no `<label for="…">`, no `aria-label`, and no `aria-labelledby` fails WCAG 1.3.1 and 4.1.2. A `placeholder` alone is NOT a label.
- **Label not programmatically associated** — a visible `<label>` that has no `for` attribute matching the input's `id` (or is not wrapping the input) is not associated and fails WCAG 1.3.1.
- **Placeholder-only labelling** — `<input placeholder="Enter email">` with no `<label>` or `aria-label` fails WCAG 1.3.1. Placeholders disappear on input and are not consistently announced by screen readers.
- **`<select>` with no label** — `<select>` elements need the same accessible name as text inputs.
- **`<textarea>` with no label** — same requirement applies.
- **Group of radio/checkbox without `<fieldset><legend>`** — related radio buttons or checkboxes not wrapped in `<fieldset>` with a descriptive `<legend>` fail WCAG 1.3.1.

Violation code patterns:
```html
<!-- VIOLATION: input with no label at all -->
<input type="email" placeholder="Enter your email">

<!-- VIOLATION: label exists but not associated (no for/id match) -->
<label>Newsletter email</label>
<input type="email" name="newsletter">

<!-- FIXED -->
<label for="newsletter-email">Newsletter email</label>
<input id="newsletter-email" type="email" name="newsletter">

<!-- VIOLATION: radio group no fieldset -->
<div>
  <input type="radio" name="plan" value="free"> Free
  <input type="radio" name="plan" value="pro"> Pro
</div>

<!-- FIXED -->
<fieldset>
  <legend>Choose a plan</legend>
  <input type="radio" id="plan-free" name="plan" value="free">
  <label for="plan-free">Free</label>
</fieldset>
```
## Purpose
Ensure all form controls have clear, programmatically associated labels so users of assistive technologies can understand what information is required.

## Key points
- Every form control must have an accessible name.
- The `<label>` element is the preferred way to label inputs.
- Labels must be explicitly associated using the `for` attribute and matching `id`.
- Placeholder text must not be used as a replacement for labels.
- When visible labels are not possible, ARIA labeling may be used as a fallback.
- Grouped controls require contextual labels to explain their purpose.

## Developer checks
- Verify each `<input>`, `<select>`, and `<textarea>` has a visible `<label>`.
- Check that each `<label>` uses `for` and matches a unique `id`.
- Confirm placeholders are supplementary, not the only label.
- Ensure icon-only or visually hidden controls still expose an accessible name.
- Check radio buttons and checkboxes for group context.

## Fix patterns
- Add missing `<label>` elements and link them correctly.
- Replace placeholder-only instructions with proper labels.
- Use visually hidden labels when design constraints exist.
- Apply `aria-label` or `aria-labelledby` only when a visible label cannot be used.
- Ensure grouped inputs are wrapped in semantic structures when needed.

## Examples
```html
<!-- Correct label association -->
<label for="email">Email address</label>
<input id="email" type="email">

<!-- Visually hidden label (still accessible) -->
<label for="search" class="sr-only">Search</label>
<input id="search" type="text">

<!-- ARIA label as a fallback -->
<input type="text" aria-label="Search">

<!-- Grouped controls -->
<fieldset>
  <legend>Preferred contact method</legend>
  <label><input type="radio" name="contact" value="email"> Email</label>
  <label><input type="radio" name="contact" value="phone"> Phone</label>
</fieldset>
```
