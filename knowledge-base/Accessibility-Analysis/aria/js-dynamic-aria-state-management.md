# JavaScript Dynamic ARIA State Management — Detection Rules

## Overview

JavaScript files often manage interactive widget state — toggle menus, accordions, tabs, carousels, live search results, form validation feedback — without updating the corresponding ARIA attributes. This creates a gap between the visual UI and what assistive technologies communicate to users. This document provides systematic detection rules for identifying missing ARIA state management through static code analysis.

---

## Rule 1 — aria-expanded Not Updated in Toggle Functions

### What is required

Every function that shows or hides a panel, menu, submenu, or disclosure container must update `aria-expanded` on the controlling element (the button or link) to reflect the new state. The attribute must also be initialised on page load.

### How to detect (static analysis)

1. Find functions or event listener callbacks that toggle an element's visibility — identifiable by:
   - `.classList.toggle(...)`, `.classList.add('hidden')`, `.classList.remove('open')`
   - `.style.display = 'none'` / `.style.display = 'block'`
   - `.setAttribute('hidden', '')` / `.removeAttribute('hidden')`
   - Property assignments like `isOpen = !isOpen`, `expanded = !expanded`
2. For each such function, check whether `setAttribute('aria-expanded', 'true')` or `setAttribute('aria-expanded', 'false')` is called (or equivalent `el.ariaExpanded = ...`).
3. Also check that the controlling element has `aria-expanded` set in the initial HTML or in an `init()` / `DOMContentLoaded` callback.

### Common violation patterns

```javascript
// ❌ Toggles CSS class but never updates aria-expanded
function toggleNav() {
  nav.classList.toggle('open');
  // ❌ Missing: trigger.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
}

// ❌ Close function does not reset aria-expanded
menuClose.addEventListener('click', () => {
  menu.style.display = 'none';
  // ❌ Missing: menuBtn.setAttribute('aria-expanded', 'false');
});

// ✅ Correct pattern
function toggleNav() {
  const isNowOpen = nav.classList.toggle('open');
  navBtn.setAttribute('aria-expanded', isNowOpen ? 'true' : 'false');
}
// Initial state on load:
navBtn.setAttribute('aria-expanded', 'false');
```

### Affected widget types

Navigation toggles, hamburger menus, accordions, FAQ panels, filter sections, collapsible sidebars, combobox suggestion lists, dropdown menus, disclosure widgets.

---

## Rule 2 — aria-pressed Not Updated in Toggle Handlers

### What is required

Buttons that maintain a persistent binary state (active/inactive, on/off) must have `aria-pressed` updated in their click handler and set to the initial state on load. See also `aria-pressed-and-toggle-buttons.md`.

### How to detect (static analysis)

1. Find `.addEventListener('click', ...)` on elements that are `<button>` or have `role="button"`.
2. Check whether the handler toggles a state variable or CSS class that represents active/inactive.
3. If the handler does NOT contain `setAttribute('aria-pressed', ...)`:
   - Also confirm the element has `aria-pressed` in the HTML (not just in the JS).
   - If absent from both: **violation**.

### Common patterns

```javascript
// ❌ Filter tab group — toggles active class but no aria-pressed
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // ❌ Missing aria-pressed updates
  });
});

// ✅ Correct
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
  });
  // Init: default state
  btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
});
```

---

## Rule 3 — aria-invalid Not Set in Validation Functions

### What is required

When a validation function detects that a form field value is invalid, it must call `setAttribute('aria-invalid', 'true')` on the field. When the field becomes valid again, it must be reset to `setAttribute('aria-invalid', 'false')` or the attribute removed.

### How to detect (static analysis)

1. Find functions with names like `validate`, `validateField`, `checkInput`, `markInvalid`, `showError`, `setError`.
2. Inside those functions, look for logic that identifies a field as invalid (empty string check, regex .test(), value comparison).
3. If the function adds an error class (`classList.add('error')`) or inserts an error message element but does NOT call `setAttribute('aria-invalid', 'true')` on the input — flag as a violation.

```javascript
// ❌ Shows error visually but no aria-invalid
function validateEmail(input) {
  if (!input.value.includes('@')) {
    input.classList.add('error');
    document.getElementById('email-error').textContent = 'Invalid email';
    // ❌ Missing: input.setAttribute('aria-invalid', 'true');
  }
}

// ✅ Correct
function validateEmail(input) {
  if (!input.value.includes('@')) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', 'email-error');
    document.getElementById('email-error').textContent = 'Invalid email';
  } else {
    input.setAttribute('aria-invalid', 'false');
  }
}
```

---

## Rule 4 — aria-live Regions Not Populated for Dynamic Announcements

### What is required

When JavaScript changes content that users need to be informed about (search result counts, filter results, status updates, confirmation messages, loading completion, navigation state), the update must be injected into an `aria-live` region so screen readers announce it automatically.

### How to detect (static analysis)

1. Find functions that update visible status text, result counts, or notification messages by setting `.textContent`, `.innerHTML`, or `.innerText` on a visible element.
2. Check whether that element (or a parent) has `aria-live="polite"` or `aria-live="assertive"` (or `role="status"`, `role="alert"`, `role="log"`).
3. If the element lacks an `aria-live` attribute AND the content change is dynamically important (not just decorative): **violation**.

Also check: the `aria-live` container must exist in the initial HTML — not be inserted by JavaScript after the page loads, as screen readers only register live regions present at load time.

```javascript
// ❌ Updates visible text but no aria-live region
function updateFilterCount(count) {
  document.getElementById('result-count').textContent = `${count} results`;
  // ❌ result-count element does not have aria-live — screen reader won't announce
}

// ✅ Correct — result-count has aria-live="polite" in HTML
// <span id="result-count" aria-live="polite" aria-atomic="true"></span>
function updateFilterCount(count) {
  document.getElementById('result-count').textContent = `${count} results`;
  // ✅ Live region announces automatically
}
```

### Types of content that require live region announcements

- Filtering results ("Showing 12 results")
- View mode changes ("Switched to list view")
- Navigation shortcut confirmations ("Jumped to main navigation")
- Scroll button visibility state changes (not an announcement per se — but screen readers need context)
- Autocomplete/combobox expanded state
- Pagination: "Page 3 of 10 selected"
- Billing period selected ("Monthly billing selected")
- Comparison column selected/deselected

---

## Rule 5 — aria-expanded Not Initialised on Page Load

### What is required

ARIA state attributes must reflect the current state on page load — they cannot appear only after the first interaction. If a nav menu is closed when the page loads, the toggle button must already have `aria-expanded="false"` set in the HTML or in an initialisation function.

### How to detect (static analysis)

1. Check whether the toggle button element in the HTML source has `aria-expanded` set.
2. If not in HTML, check for an `init()` function, a `DOMContentLoaded` listener, or a self-invoked setup block that sets `aria-expanded` on all expandable triggers.
3. If `aria-expanded` is absent from both the HTML and any init function, the widget is uninitialised for AT.

```javascript
// ❌ No init — screen reader has no idea the button is a disclosure button
document.getElementById('nav-toggle').addEventListener('click', () => {
  // Toggle code
});

// ✅ Correct — explicit init
document.querySelectorAll('[data-toggle]').forEach(btn => {
  btn.setAttribute('aria-expanded', 'false'); // init
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !expanded ? 'true' : 'false');
  });
});
```

---

## Rule 6 — aria-controls Missing or Broken Reference

### What is required

Where a button controls a separate element (nav panel, accordion pane, dropdown list), `aria-controls` should reference the `id` of the controlled element. If `aria-controls` is present but the referenced `id` does not exist in the DOM, it is a broken reference.

### How to detect (static analysis)

1. Find `aria-controls="someId"` in HTML.
2. Verify that an element with `id="someId"` exists.
3. If not found: **broken aria-controls reference** — flag as a violation.

---

## Rule 7 — Focus Not Moved After Dynamic Content Change

### What is required

When JavaScript reveals a dialog, modal, or full-screen navigation overlay, keyboard focus must be moved into the revealed content (typically the first focusable element or a container with `tabindex="-1"`). When the overlay is closed, focus must return to the trigger button.

### How to detect (static analysis)

1. Find functions that reveal dialogs/modals/overlays (show class, `display: block`, `removeAttribute('hidden')`).
2. Check whether the function calls `.focus()` on an element inside the revealed container.
3. Find close/dismiss functions and check whether they call `.focus()` on the original trigger or a parent.
4. If open does not call `.focus()` → **violation**. If close does not call `.focus()` → **violation**.

```javascript
// ❌ Opens modal but does not move focus
function openModal() {
  modal.classList.remove('hidden');
  // ❌ Missing: modal.querySelector('[autofocus], h2, button').focus();
}

// ✅ Correct
function openModal() {
  modal.classList.remove('hidden');
  modal.querySelector('button, [tabindex]').focus();
}
function closeModal(triggerEl) {
  modal.classList.add('hidden');
  triggerEl.focus(); // return focus to trigger
}
```

---

## Rule 8 — aria-current Not Set on Active Navigation Items

### What is required

The currently active page link or breadcrumb step must have `aria-current="page"` (navigation links) or `aria-current="step"` (wizard steps).

### How to detect (static analysis)

Find navigation link lists where one item has a distinct CSS class (`active`, `current`, `selected`) but does NOT have `aria-current` in the HTML. This is a purely static check — if the class is managed server-side or set by a routing library, the attribute must be set in the same location.

```javascript
// ❌ Active class without aria-current
navLinks.forEach(link => {
  if (link.href === currentPage) {
    link.classList.add('active');
    // ❌ Missing: link.setAttribute('aria-current', 'page');
  }
});

// ✅ Correct
navLinks.forEach(link => {
  if (link.href === currentPage) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
});
```

---

## WCAG References

- SC 4.1.2 Name, Role, Value — state properties (aria-expanded, aria-pressed, aria-invalid, aria-selected) must be programmatically set and updated
- SC 1.3.1 Info and Relationships — form validation relationships (aria-invalid, aria-describedby) must be programmatic
- SC 4.1.3 Status Messages — status updates must be conveyed via aria-live/role="status" without moving focus
- SC 2.4.3 Focus Order — focus must be moved programmatically when content reveals (dialogs, overlays)
- ARIA 1.2 §6.6.5 aria-expanded, §6.6.2 aria-pressed, §6.6.9 aria-invalid
