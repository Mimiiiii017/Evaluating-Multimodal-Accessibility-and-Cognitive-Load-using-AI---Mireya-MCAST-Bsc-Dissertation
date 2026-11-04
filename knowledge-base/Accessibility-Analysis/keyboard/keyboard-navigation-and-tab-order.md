# Keyboard: Navigation and Tab Order

## Tags
Tags: #keyboard #navigation #tab-order #focus #wcag #2.1.1 #2.1.2 #2.4.3

## Purpose
Ensure all website functionality is usable with a keyboard alone, allowing users with motor impairments or assistive technologies to navigate and interact effectively.

## Key points
- All interactive elements must be reachable using the keyboard.
- Keyboard navigation must follow a logical, predictable order.
- Users must always be able to see which element currently has focus.
- Mouse-only interactions create accessibility barriers.
- Keyboard support is essential for screen readers and other assistive technologies.

## Developer checks
- Test the entire page using only the Tab, Shift+Tab, Enter, and Space keys.
- Check that buttons, links, inputs, and custom controls are focusable.
- Verify tab order follows the visual and reading order of the page.
- Ensure no keyboard traps exist.
- Confirm focus is not lost during dynamic updates or page changes.

## Fix patterns
- Use native interactive elements (`<button>`, `<a>`, `<input>`) instead of non-semantic containers.
- Add `tabindex="0"` to custom interactive elements when necessary.
- Remove positive tabindex values (`tabindex="1"` or higher).
- Ensure JavaScript click handlers also respond to keyboard events.
- Restore focus appropriately after dynamic actions (e.g., modals, form submission).

## Examples
```html
<!-- Native keyboard-accessible button -->
<button type="submit">Submit</button>

<!-- Custom interactive element made keyboard-focusable -->
<div tabindex="0" role="button" onclick="doAction()"
     onkeydown="if(event.key === 'Enter' || event.key === ' ') doAction();">
  Activate
</div>

<!-- Logical tab order -->
<input type="text" id="name">
<input type="email" id="email">
<button type="submit">Send</button>
```
