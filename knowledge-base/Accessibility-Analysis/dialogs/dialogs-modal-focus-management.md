# Dialogs: Modal Dialogs and Focus Management

## Tags
Tags: #dialogs #modals #focus-management #keyboard #aria #wcag #2.4.3 #2.4.7

## Purpose
Ensure modal dialogs are accessible by managing focus correctly so keyboard and screen reader users can interact with dialogs without losing context.

## Key points
- When a modal dialog opens, focus must move inside the dialog.
- While the dialog is open, focus must be trapped within it.
- When the dialog closes, focus must return to the element that opened it.
- Background content must not be accessible while the modal is open.
- Dialogs must have an accessible name that describes their purpose.

## Developer checks
- Open the modal using only the keyboard and observe where focus moves.
- Verify focus does not move to background content while the dialog is open.
- Check that the dialog has a clear title announced by screen readers.
- Confirm Escape key closes the modal when appropriate.
- Ensure focus returns to the triggering control after closing.

## Fix patterns
- Move focus to the first meaningful element inside the dialog on open.
- Trap focus within the dialog using JavaScript.
- Restore focus to the trigger element when the dialog closes.
- Mark the dialog container with `role="dialog"` or `role="alertdialog"` when needed.
- Hide background content from assistive technologies while the dialog is open.

## Examples
```html
<!-- Modal dialog -->
<div role="dialog" aria-labelledby="dialogTitle" aria-modal="true">
  <h2 id="dialogTitle">Delete item</h2>
  <p>Are you sure you want to delete this item?</p>
  <button type="button">Cancel</button>
  <button type="button">Delete</button>
</div>
```

```js
// Open dialog and move focus
function openDialog(dialog, trigger) {
  dialog.removeAttribute('hidden');
  dialog.querySelector('[autofocus]')?.focus() || dialog.focus();

  // Trap focus inside dialog
  dialog.addEventListener('keydown', function trapFocus(e) {
    if (e.key === 'Tab') {
      const focusable = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    if (e.key === 'Escape') {
      closeDialog(dialog, trigger);
    }
  });
}

// Close dialog and restore focus
function closeDialog(dialog, trigger) {
  dialog.setAttribute('hidden', '');
  trigger.focus();
}
```

```html
<!-- Trigger button -->
<button id="openDialog">Delete item</button>
```
