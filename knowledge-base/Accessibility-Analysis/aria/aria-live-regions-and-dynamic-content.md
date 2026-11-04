# ARIA: Live Regions and Dynamic Content

## Tags 
Tags: #aria #live-regions #dynamic-content #screen-readers #wcag

## Purpose
Ensure users of assistive technologies are informed when content changes dynamically without a page reload, such as form feedback, notifications, or status updates.

## Key points
- Dynamic content updates must be communicated to screen readers.
- ARIA live regions announce changes without requiring user focus.
- The `aria-live` attribute controls how and when updates are announced.
- Live regions should be used sparingly to avoid overwhelming users.
- Content changes that require user action should also be focus-managed.

## Developer checks
- Identify content that updates dynamically (AJAX, validation messages, status updates).
- Check whether updates are announced by screen readers.
- Verify correct `aria-live` politeness level is used.
- Ensure live regions are not overused or nested incorrectly.
- Confirm important updates are not visually hidden without an accessible alternative.

## Fix patterns
- Add `aria-live="polite"` for non-urgent updates.
- Use `aria-live="assertive"` or `role="alert"` for critical messages.
- Mark regions with `aria-atomic="true"` when full content should be read.
- Use `aria-busy="true"` during loading states.
- Combine live regions with focus movement when user action is required.

## Examples
```html
<!-- Polite live region -->
<div aria-live="polite">
  Profile saved successfully.
</div>

<!-- Assertive live region for critical feedback -->
<div role="alert">
  Error: Your session has expired.
</div>

<!-- Loading state -->
<div aria-live="polite" aria-busy="true">
  Loading results…
</div>

<!-- Atomic live region -->
<div aria-live="polite" aria-atomic="true">
  You have 3 new notifications.
</div>
```

---

## User-Action Announcement Patterns

Many interactive features update visible content but never write to a live region, leaving screen-reader users unaware of the change. The following action types **must** announce their result via an `aria-live` region unless an equivalent focus-move is performed instead.

| Action type | What to announce | Politeness |
|---|---|---|
| Filter applied / cleared | "Showing N results for [term]" or "Filter cleared" | `polite` |
| Search submitted | "N results found for [query]" | `polite` |
| Search result highlighted | "Result N of N highlighted" | `polite` |
| Autocomplete suggestion navigated | "[Suggestion text], N of N" | `polite` |
| View / display mode toggled | "Switched to [grid / list] view" | `polite` |
| Accordion section opened | "[Section name] expanded" | `polite` |
| Accordion section closed | "[Section name] collapsed" | `polite` |
| Navigation drawer opened | "Navigation menu open" | `polite` |
| Navigation drawer closed | "Navigation menu closed" | `polite` |
| Scroll-to-top activated | "Scrolled to top of page" | `polite` |
| Keyboard shortcut fired | "[Action] activated" (e.g. "Search opened") | `polite` |
| Billing period / plan changed | "[Plan name] selected" | `polite` |
| Comparison panel expanded | "Comparison view opened" | `polite` |

### Code pattern

```html
<!-- Hidden live region — inject text after each action -->
<div class="sr-only" role="status" aria-live="polite" aria-atomic="true" id="action-announcer"></div>
```

```js
function announce(message) {
  const el = document.getElementById('action-announcer');
  el.textContent = '';
  // Small delay ensures screen reader picks up the change
  requestAnimationFrame(() => { el.textContent = message; });
}

// Example: filter button click handler
filterBtn.addEventListener('click', () => {
  applyFilter();
  announce(`Showing ${getResultCount()} results`);
});
```

### Detection rule

For every event handler that updates visible DOM content (text, count, label, show/hide), check whether the same code path also writes to an element with `role="status"`, `role="alert"`, `aria-live="polite"`, or `aria-live="assertive"`.

Exceptions — a live-region announcement is **not required** when:
- The handler calls `element.focus()` on the newly revealed content (focus movement is an acceptable substitute).
- The action is purely a route/URL navigation with a full page-title update.
- The visible change is only a CSS class toggle with no text, count, or label change perceivable by the user.
