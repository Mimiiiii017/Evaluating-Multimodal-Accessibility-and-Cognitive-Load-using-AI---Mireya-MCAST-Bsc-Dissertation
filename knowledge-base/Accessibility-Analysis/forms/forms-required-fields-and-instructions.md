# Forms: Required Fields and Instructions

## Tags
Tags: #forms #required-fields #instructions #aria #wcag #3.3.2

## Purpose
Ensure users can clearly identify which form fields are required and understand instructions before and during form completion, reducing errors and cognitive load.

## Key points
- Required fields must be communicated programmatically and visually.
- Do not rely on color alone to indicate required status.
- Instructions should be provided before users interact with fields when possible.
- Screen reader users must be informed when a field is mandatory.
- Required indicators must be consistent across the form.

## Developer checks
- Check that required fields are clearly marked in the UI.
- Verify required fields expose their status to assistive technologies.
- Confirm that instructions are associated with the relevant fields.
- Ensure symbols (e.g., `*`) are explained to users.
- Check that required status is not conveyed by color alone.

## Fix patterns
- Add `aria-required="true"` to required form controls when needed.
- Use visible text such as “Required” in addition to symbols.
- Associate instructions with fields using `aria-describedby`.
- Provide a short explanation at the top of the form explaining required indicators.
- Keep required field messaging consistent across all forms.

## Examples
```html
<!-- Required field with visible indicator -->
<label for="name">Name <span aria-hidden="true">*</span></label>
<input id="name" type="text" aria-required="true">

<!-- Instruction linked to field -->
<label for="password">Password</label>
<input id="password" type="password" aria-describedby="passwordHelp" aria-required="true">
<div id="passwordHelp">
  Password must be at least 8 characters long.
</div>

<!-- Form-level instruction -->
<p id="requiredInfo">
  Fields marked with * are required.
</p>
```
