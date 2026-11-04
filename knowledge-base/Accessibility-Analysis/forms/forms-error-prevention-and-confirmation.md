# Error Prevention and Confirmation Patterns

## Overview

WCAG SC 3.3.4 Error Prevention (Legal, Financial, Data) requires that for web pages causing legal commitments, financial transactions, or deletion of data, at least one of the following is true:

1. **Reversible** — the submission is reversible (e.g., a cancel/undo option before data is permanently committed).
2. **Checked** — data entered is checked for input errors and the user is given an opportunity to correct them before finalising.
3. **Confirmed** — a mechanism is available for reviewing, confirming, and correcting information before finalising it.

SC 3.3.6 Error Prevention (All) extends this requirement to all submissions (AAA level).

---

## When Error Prevention Is Required

Apply error prevention patterns to any action that:

- **Initiates a financial transaction** — purchases, subscriptions, payment method changes, refund requests.
- **Creates or modifies a legal agreement** — signing documents, accepting terms of service, contract creation.
- **Permanently deletes user data** — deleting accounts, deleting files, removing connections/contacts, clearing history.
- **Sends a message that cannot be recalled** — submitting support tickets, sending emails, publishing public posts.
- **Modifies significant settings** — changing account email, changing password, two-factor auth changes.

Lower stakes form submissions (newsletter signup, search queries, filter changes) do not require the same rigour but still benefit from error prevention best practices.

---

## Pattern 1 — Review and Confirm Step

Show a summary of what the user is about to submit before the action is completed:

```html
<!-- Step 1: User fills in order details -->
<form id="checkout-form">…</form>

<!-- Step 2: Review page — show all details with edit links -->
<section aria-labelledby="review-heading">
  <h2 id="review-heading">Review your order</h2>
  <dl>
    <dt>Item</dt><dd>Pro subscription <a href="#pricing">Edit</a></dd>
    <dt>Billing period</dt><dd>Annual <a href="#billing">Edit</a></dd>
    <dt>Total</dt><dd>£120.00/year including tax</dd>
  </dl>
  <button type="submit">Confirm and pay</button>
</section>
```

The review step must be keyboard-operable and screen-reader-readable. Ensure `aria-labelledby` links the section to its heading.

---

## Pattern 2 — Undo / Reversible Actions

For deletions or significant changes, provide an undo mechanism rather than an irreversible confirmation dialog:

```html
<!-- After delete action: show an undo toast -->
<div role="status" aria-live="polite" aria-atomic="true">
  Contact deleted.
  <button onclick="undoDelete()">Undo</button>
</div>
```

The undo option must:
- Be visible and keyboard-accessible immediately after the action.
- Remain available for a reasonable time (recommend: ≥ 8 seconds for keyboard users, ≥ 30 seconds for users who may need time to read).
- Not auto-dismiss before the user has had a realistic chance to activate it.
- Announce itself via `aria-live` so screen reader users are aware it exists.

---

## Pattern 3 — Confirmation Dialog for Destructive Actions

For irreversible actions (permanent delete, account closure), a confirmation dialog prevents accidents:

```html
<dialog
  id="confirm-delete"
  aria-labelledby="confirm-title"
  aria-describedby="confirm-desc"
  aria-modal="true"
>
  <h2 id="confirm-title">Delete your account?</h2>
  <p id="confirm-desc">
    This will permanently delete all your data. This action cannot be undone.
  </p>
  <button id="confirm-yes" autofocus>Yes, delete my account</button>
  <button id="confirm-cancel">Cancel</button>
</dialog>
```

Requirements for accessible confirmation dialogs:
- Focus must move to the dialog when it opens — use `dialog.showModal()` (native) or `focus()` on first button.
- The destructive action button should NOT be the autofocus target — default focus should be on the safe/cancel option to prevent accidental activation.
- Escape key must close the dialog and cancel the action.
- When the dialog closes, focus must return to the element that triggered it.
- `aria-modal="true"` and `role="dialog"` required on custom dialog implementations.

```javascript
// ❌ Incorrect — destructive button is focused by default
confirmDialog.querySelector('.delete-btn').focus();

// ✅ Correct — safe cancel button is focused by default
confirmDialog.querySelector('.cancel-btn').focus();
```

---

## Pattern 4 — Inline Error Checking Before Submission

Validate fields before the form is submitted and present errors in a way that allows correction:

```html
<form novalidate>
  <!-- Individual field error -->
  <div class="field-group">
    <label for="card-number">Card number</label>
    <input
      id="card-number"
      type="text"
      inputmode="numeric"
      autocomplete="cc-number"
      aria-invalid="false"
      aria-describedby="card-error"
    />
    <span id="card-error" role="alert" hidden></span>
  </div>

  <!-- Summary error list at top of form (populated after submit attempt) -->
  <div role="alert" id="error-summary" hidden>
    <h2>There are 2 errors. Please correct them before continuing:</h2>
    <ul>
      <li><a href="#card-number">Card number is required</a></li>
      <li><a href="#expiry">Expiry date is invalid</a></li>
    </ul>
  </div>

  <button type="submit">Pay £120.00</button>
</form>
```

Requirements:
- Each error message must be associated with its field via `aria-describedby`.
- `aria-invalid="true"` must be set on invalid fields.
- An error summary must move focus to the summary heading so screen reader users are immediately informed.
- Error messages must identify the field and explain what is wrong — not just "Invalid input".

---

## Pattern 5 — Data Loss Warning on Navigation

When a user navigates away from a form with unsaved changes, warn them:

```javascript
// Warn before unload — prevents accidental data loss
window.addEventListener('beforeunload', (e) => {
  if (formHasUnsavedChanges()) {
    e.preventDefault();
    e.returnValue = ''; // Triggers browser's built-in "Leave site?" dialog
  }
});
```

For in-app navigation (SPA routing), show a **dialog** (not a browser alert) that meets accessibility requirements (focus management, keyboard operable, ARIA roles).

---

## Password and Sensitive Data Confirmation

For password changes, account email changes, and payment method updates, require confirmation:

1. **Current password** — request before allowing change, prevents malicious actors from changing settings if a session is left unattended.
2. **Confirm new password** — two-field confirmation for new passwords catches typos.
3. **Review on submit** — show the change that will be made before confirming.

Password fields must allow pasting (do not use `onpaste="return false"` — SC 3.3.8 Accessible Authentication prohibits cognitive function tests that prevent pasting credentials).

---

## Detection Rules

| Issue | Condition | WCAG SC |
|---|---|---|
| No confirmation before delete | Destructive action (delete account, delete all data) has no dialog or undo | 3.3.4 |
| Confirmation dialog traps focus | Dialog opens but focus not moved to it | 2.4.3 |
| Focus on destructive button | Default focus on "Confirm delete" not "Cancel" | Best practice / 3.3.4 |
| No error summary on submit | Form submission fails silently or only highlights fields visually | 3.3.1, 3.3.4 |
| Undo auto-dismisses too quickly | Undo toast dismisses before keyboard user can reach it | 2.2.1 |
| Paste blocked on password fields | `onpaste` prevented on credential inputs | 3.3.8 (WCAG 2.2 AA) |
| No reversibility or confirmation | Financial/legal transaction with no review step or undo | 3.3.4 |

---

## WCAG References

- SC 3.3.1 Error Identification (A) — errors must be identified and described.
- SC 3.3.4 Error Prevention: Legal, Financial, Data (AA) — reversible, checked, or confirmed.
- SC 3.3.6 Error Prevention: All (AAA) — extends 3.3.4 to all submissions.
- SC 3.3.8 Accessible Authentication (Minimum) (AA, WCAG 2.2) — no cognitive function test, paste allowed.
- SC 2.4.3 Focus Order — dialog must receive focus when opened.
- SC 2.1.2 No Keyboard Trap — dialogs must be dismissible.
- SC 2.2.1 Timing Adjustable — undo timeouts must be sufficient.
