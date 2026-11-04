# Controls: Predictable Behaviour on Focus and Input

## Tags
Tags: #controls #predictable #on-focus #on-input #wcag #3.2.1 #3.2.2

## Purpose
Ensure that receiving focus or changing the value of a form control does not automatically trigger unexpected changes in context, which can disorient users.

## Key points
- Receiving focus on an element must not cause a change of context (WCAG 3.2.1).
- Changing a form setting (selecting an option, toggling a checkbox) must not automatically cause a change of context unless the user has been advised in advance (WCAG 3.2.2).
- Changes of context include: navigating to a new page, significantly rearranging the page, moving focus unexpectedly, or opening a new window.
- Submitting a form on input change (e.g., auto-submitting when a dropdown value changes) is a common violation.
- Opening a new window or tab on focus or on input is especially disorienting for screen reader users.

## Developer checks
- Tab through the page and confirm nothing unexpected happens when elements receive focus.
- Test all form controls (dropdowns, checkboxes, radio buttons, text inputs) and verify changing their value does not navigate away or trigger a context change.
- Check for auto-submitting forms when a dropdown selection changes.
- Verify no new windows or popups open automatically on focus.
- Confirm focus does not jump unexpectedly when interacting with controls.

## Fix patterns
- Require explicit user action (e.g., pressing a Submit button) to trigger form submission or navigation.
- If a change of context on input is necessary, warn users in advance with clear instructions.
- Avoid opening new windows on focus events.
- Use `onchange` for non-context-changing updates only (e.g., filtering a list on the same page).
- Add a visible submit button next to auto-submit dropdowns.

## Examples
```html
<!-- Incorrect: auto-navigates on dropdown change -->
<label for="country">Country</label>
<select id="country" onchange="window.location.href = this.value;">
  <option value="/us">United States</option>
  <option value="/uk">United Kingdom</option>
</select>

<!-- Correct: requires explicit submit -->
<label for="country">Country</label>
<select id="country">
  <option value="/us">United States</option>
  <option value="/uk">United Kingdom</option>
</select>
<button type="submit">Go</button>

<!-- Incorrect: opens new window on focus -->
<input type="text" onfocus="window.open('help.html')">

<!-- Correct: help link provided separately -->
<label for="email">Email</label>
<input type="email" id="email" aria-describedby="emailHelp">
<a href="help.html" id="emailHelp" target="_blank" rel="noopener">
  Email help (opens in new window)
</a>
```
