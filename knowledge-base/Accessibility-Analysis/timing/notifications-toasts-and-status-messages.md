# Notifications, Toasts, and Status Messages

## Overview

Notifications — including toast messages, snackbars, banners, inline alerts, form submission feedback, and progress updates — must be communicated to assistive technology users without requiring them to move focus. WCAG SC 4.1.3 Status Messages requires that status information be programmatically determinable through role or property so that it can be announced automatically by screen readers.

---

## When a Notification Needs a Live Region

A live region is required whenever content changes on screen in response to a user action or system event, **and** that change is meaningful but does not require immediate focus (i.e., it's status information, not an error requiring correction):

- Form submitted successfully / failed
- Item added to cart / wishlist / favourites
- File upload progress or completion
- Search results updated ("12 results found")
- Copy to clipboard confirmation
- Filter applied ("Showing 3 of 47 products")
- Real-time data update ("Last updated 2 minutes ago")
- Save in progress / saved
- Email/SMS sent confirmation

---

## Role Selection

Use the most specific role that matches the urgency:

| Role / Live value | When to use | Announcement timing |
|---|---|---|
| `role="status"` / `aria-live="polite"` | Success confirmations, filter counts, save state | After current speech finishes |
| `role="alert"` / `aria-live="assertive"` | Errors requiring immediate attention, destructive action warnings | Interrupts current speech |
| `role="log"` | Chronological logs (chat, activity feed) | Polite, cumulative |
| `role="progressbar"` | Upload/download/process progress | Combined with aria-valuenow/valuemin/valuemax |
| `role="timer"` | Countdown timers visible on screen | Announced periodically |

**Do not overuse `assertive`** — it interrupts the user mid-sentence and causes a poor experience. Most notifications are `polite`.

---

## The Live Region Must Exist on Initial Render

The most common implementation mistake: inserting a `<div aria-live="polite">` into the DOM at the same time as the message. Screen readers only register live regions that exist at page load. A dynamically inserted live region will usually not be announced.

```html
<!-- ✅ Correct — region in initial HTML, content injected later -->
<div
  id="toast-region"
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
>
  <!-- empty until a message fires -->
</div>

<!-- JS: update the region's text content to trigger announcement -->
<script>
  function showToast(message) {
    document.getElementById('toast-region').textContent = message;
    // Optionally clear after delay so screen reader can re-announce same message
    setTimeout(() => {
      document.getElementById('toast-region').textContent = '';
    }, 5000);
  }
</script>
```

```html
<!-- ❌ Broken — live region inserted by JS; AT won't announce it -->
<script>
  function showToast(message) {
    const div = document.createElement('div');
    div.setAttribute('aria-live', 'polite');
    div.textContent = message;
    document.body.appendChild(div);
  }
</script>
```

---

## Toast Auto-Dismiss Requirements

Automatically dismissed toasts must comply with SC 2.2.1 (Timing Adjustable) and SC 2.2.4 (Interruptions):

1. **Display duration** — must be long enough for users who read slowly. The minimum practical duration is 5 seconds for a short message; 10+ seconds for messages with action buttons.
2. **Pause on hover and focus** — if a toast contains interactive elements (e.g., "Undo" button), auto-dismiss must pause when the user hovers or focuses the toast.
3. **Keyboard dismissible** — pressing Escape should dismiss the toast.
4. **Not time-limited if action required** — a toast with an "Undo" button that auto-dismisses in 3 seconds gives keyboard users insufficient time to activate the action. Either extend the duration significantly or keep the toast until the user explicitly dismisses it.

```javascript
// ❌ Non-compliant — short auto-dismiss with interactive action button
showToast('Deleted. <button onclick="undo()">Undo</button>', { duration: 3000 });

// ✅ Compliant — pause on focus, Escape to dismiss, sufficient duration
let dismissTimer;
function showToast(message, duration = 8000) {
  toastEl.innerHTML = message;
  toastEl.classList.add('visible');

  dismissTimer = setTimeout(() => dismissToast(), duration);

  toastEl.addEventListener('mouseenter', () => clearTimeout(dismissTimer));
  toastEl.addEventListener('mouseleave', () => { dismissTimer = setTimeout(() => dismissToast(), duration); });
  toastEl.addEventListener('focusin',    () => clearTimeout(dismissTimer));
  toastEl.addEventListener('focusout',   () => { dismissTimer = setTimeout(() => dismissToast(), duration); });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && toastEl.classList.contains('visible')) dismissToast();
});
```

---

## Focus Management for Toasts

Toasts should **not** steal focus when they appear. Focus theft on every notification would be disruptive for keyboard and screen reader users. Use `aria-live` instead.

The one exception: a modal-style alert that requires the user to make a choice (e.g., "Session expiring. Continue?" with Yes/No buttons) should use `role="alertdialog"` and move focus to the dialog.

```html
<!-- Toast: no focus movement, aria-live region announces -->
<div role="status" aria-live="polite">Message saved.</div>

<!-- Alert dialog requiring response: needs focus management -->
<div role="alertdialog" aria-modal="true" aria-labelledby="alert-title" aria-describedby="alert-desc">
  <h2 id="alert-title">Session expiring</h2>
  <p id="alert-desc">Your session will expire in 2 minutes.</p>
  <button>Continue session</button>
  <button>Log out</button>
</div>
```

---

## Multiple Simultaneous Toasts

When the UI can show multiple toasts (e.g., a notification stack), use a single live region container:

```html
<div id="notification-stack" aria-live="polite" aria-relevant="additions removals">
  <!-- individual toast items inserted here -->
</div>
```

`aria-relevant="additions removals"` tells AT to announce both new toasts appearing and old ones being removed.

---

## Detection Rules

A notification system is non-conformant if:

1. **Live region not in initial HTML** — created by JavaScript at notification time. SC 4.1.3.
2. **Auto-dismiss too fast with interactive elements** — action buttons reachable by keyboard before auto-dismiss. SC 2.2.1.
3. **Does not pause on hover/focus** — toasts with actions that dismiss automatically without respecting hover/focus. SC 2.2.1.
4. **No keyboard dismiss** — user cannot press Escape to close a toast. SC 2.1.1.
5. **Uses focus theft** — `focus()` called on toast container on appearance (not alertdialog). SC 3.2.1 On Focus.
6. **`role="alert"` used for routine status** — overuse of assertive live regions. ARIA authoring guidance (not a WCAG violation of itself but causes AT frustration).
7. **No accessible name on close button** — icon-only × button without `aria-label`. SC 4.1.2.

---

## WCAG References

- SC 4.1.3 Status Messages (AA) — status can be programmatically determined without focus.
- SC 2.2.1 Timing Adjustable (A) — time limits must be adjustable.
- SC 2.2.2 Pause, Stop, Hide (A) — auto-updating content must be pausable.
- SC 2.2.4 Interruptions (AAA) — non-emergency interruptions must be suppressible.
- SC 3.2.1 On Focus (A) — receiving focus must not cause context changes.
