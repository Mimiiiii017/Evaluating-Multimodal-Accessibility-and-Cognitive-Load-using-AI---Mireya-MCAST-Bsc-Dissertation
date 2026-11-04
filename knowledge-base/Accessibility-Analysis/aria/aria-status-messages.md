# ARIA: Status Messages

## Tags
Tags: #aria #status-messages #live-regions #wcag #4.1.3

## Purpose
Ensure status messages are programmatically determined through role or properties so they can be presented to users of assistive technologies without receiving focus.

## Key points
- Status messages that provide information about the success or result of an action, the state of an application, or the progress of a process must be communicated to assistive technologies without moving focus (WCAG 4.1.3).
- Status messages include: search results counts, form submission confirmations, loading indicators, error counts, and shopping cart updates.
- ARIA live regions, `role="status"`, `role="alert"`, and `role="log"` are the primary methods.
- Focus must not move to the status message unless user action is required.
- Overuse of assertive announcements can overwhelm screen reader users.

## Developer checks
- Identify all status messages in the application (success messages, result counts, progress updates, error summaries).
- Check that each status message is in an ARIA live region or has an appropriate role.
- Verify status messages are announced without moving focus.
- Confirm the correct politeness level is used (polite for routine, assertive for urgent).
- Test with a screen reader to confirm messages are announced at the right time.

## Fix patterns
- Use `role="status"` for routine status information (equivalent to `aria-live="polite"`).
- Use `role="alert"` for important, time-sensitive messages (equivalent to `aria-live="assertive"`).
- Use `role="log"` for sequential information like chat messages or activity logs.
- Use `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` for progress indicators.
- Ensure the live region container exists in the DOM before the content is added to it.

## Examples
```html
<!-- Search results count as status message -->
<div role="status">
  42 results found for "accessibility."
</div>

<!-- Form submission success -->
<div role="status">
  Your profile has been updated successfully.
</div>

<!-- Shopping cart update -->
<div role="status">
  Item added to cart. You have 3 items in your cart.
</div>

<!-- Error count summary -->
<div role="alert">
  3 errors found. Please review the form.
</div>

<!-- Progress bar -->
<div role="progressbar"
     aria-valuenow="60"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="Upload progress">
  60% complete
</div>

<!-- Activity log -->
<div role="log" aria-label="Recent activity">
  <p>14:30 – Document saved.</p>
  <p>14:32 – Comment added by Alex.</p>
</div>
```
