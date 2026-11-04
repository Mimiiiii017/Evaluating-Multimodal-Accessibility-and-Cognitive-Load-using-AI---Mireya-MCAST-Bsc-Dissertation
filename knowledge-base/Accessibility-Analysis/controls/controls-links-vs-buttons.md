# Controls: Links vs Buttons

## Tags
Tags: #controls #links #buttons #semantic-html #aria #wcag

## Quick reference
Common control violations to flag in code reviews:

- **Icon-only button with no accessible name** — `<button>` containing only an `<svg>`, `<img alt="">`, or icon font glyph with no `aria-label`, no `title`, and no visible text fails WCAG 4.1.2. Screen readers announce it as an unlabelled button. This includes search buttons, close/dismiss buttons, send buttons, and hamburger menu toggles.
- **`<div>` or `<span>` used as a button** — a non-interactive element with `onclick` but no `role="button"`, no `tabindex`, and no keyboard handler fails WCAG 2.1.1 and 4.1.2.
- **`<a href="#">` used to trigger an action** — anchor with `href="#"` used for a form action, toggle, or dismiss (not navigation) fails 4.1.2 because `<a>` only activates properly on Enter, not Space like a button.
- **Button with no visible text tested by name** — `<button><span class="sr-only">Search</span></button>` where the sr-only text is the only label is acceptable, but `<button></button>` (no content at all) has no accessible name.

Violation code patterns:
```html
<!-- VIOLATION: icon-only search button, no accessible name -->
<button><svg viewBox="0 0 24 24"><path d="..."/></svg></button>
<button><i class="fa fa-search"></i></button>

<!-- FIXED -->
<button aria-label="Search"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="..."/></svg></button>

<!-- VIOLATION: div used as button -->
<div onclick="submitForm()" class="btn">Submit</div>

<!-- FIXED -->
<button type="submit">Submit</button>

<!-- VIOLATION: <a href="#"> as action -->
<a href="#" onclick="openModal()">Open dialog</a>

<!-- FIXED -->
<button type="button" onclick="openModal()">Open dialog</button>
```

## Purpose
Ensure links and buttons are used correctly according to their function, so users of assistive technologies can predict behavior and interact with controls effectively.

## Key points
- Links (`<a>`) are for navigation to another location or resource.
- Buttons (`<button>`) are for actions that change state, submit data, or trigger behavior.
- Using the wrong element type creates confusion for screen reader and keyboard users.
- Visual styling must not determine whether something is a link or a button.
- ARIA should not be used to override native semantics unless absolutely necessary.

## Developer checks
- Identify interactive elements that look like buttons or links.
- Check whether the element performs navigation or an action.
- Verify `<div>` or `<span>` elements are not being used as interactive controls.
- Confirm keyboard behavior matches expectations (Enter for links, Enter/Space for buttons).
- Test how controls are announced by a screen reader.

## Fix patterns
- Replace clickable `<div>` or `<span>` elements with `<button>` or `<a>`.
- Use `<a href="...">` only when navigating to a new page or section.
- Use `<button>` for form submission, toggles, modals, and UI actions.
- Remove unnecessary `role="button"` when a native `<button>` can be used.
- Ensure disabled states are communicated properly for buttons.

## Examples
```html
<!-- Correct: link for navigation -->
<a href="/profile">View profile</a>

<!-- Correct: button for action -->
<button type="button" onclick="openModal()">
  Open settings
</button>

<!-- Incorrect: div used as button -->
<div onclick="submitForm()">Submit</div>

<!-- ARIA role only as a last resort -->
<div role="button" tabindex="0"
     onclick="doAction()"
     onkeydown="if(event.key==='Enter'||event.key===' ') doAction();">
  Activate
</div>
```
