# Controls: Dragging Movements

## Tags
Tags: #controls #dragging #drag-and-drop #wcag #2.5.7

## Purpose
Ensure any functionality that uses dragging movements can also be achieved through a simple single-pointer alternative, such as clicking or tapping, so users who cannot perform drag operations can still access all features.

## Key points
- All functionality that requires dragging must have a single-pointer alternative (WCAG 2.5.7).
- Users with motor impairments, tremors, or limited dexterity may be unable to perform drag operations.
- Touch-only devices and assistive technologies may not support drag-and-drop.
- Alternatives include click-to-select then click-to-place, arrow buttons, or dropdown reordering controls.
- Exceptions exist where dragging is essential (e.g., freehand drawing or signature capture).

## Developer checks
- Identify all drag-and-drop interactions in the application.
- Verify each has a non-dragging alternative (buttons, menus, or keyboard controls).
- Test drag-and-drop features using only a keyboard.
- Confirm reorderable lists have up/down buttons or other non-drag alternatives.
- Test sortable or movable elements with assistive technologies.

## Fix patterns
- Add move up/move down buttons alongside draggable list items.
- Provide click-to-select and click-to-place as an alternative to drag-and-drop.
- Use dropdown controls for reordering (e.g., "Move to position: [select]").
- Implement keyboard arrow key support for draggable elements.
- Add ARIA live announcements to communicate the result of non-drag reordering.

## Examples
```html
<!-- Draggable list with button alternatives -->
<ul id="sortableList" aria-label="Task list">
  <li>
    <span>Task 1</span>
    <button aria-label="Move Task 1 up" onclick="moveUp(this)">↑</button>
    <button aria-label="Move Task 1 down" onclick="moveDown(this)">↓</button>
  </li>
  <li>
    <span>Task 2</span>
    <button aria-label="Move Task 2 up" onclick="moveUp(this)">↑</button>
    <button aria-label="Move Task 2 down" onclick="moveDown(this)">↓</button>
  </li>
  <li>
    <span>Task 3</span>
    <button aria-label="Move Task 3 up" onclick="moveUp(this)">↑</button>
    <button aria-label="Move Task 3 down" onclick="moveDown(this)">↓</button>
  </li>
</ul>

<!-- Live region for announcing reorder results -->
<div aria-live="polite" id="reorderStatus"></div>
```

```js
function moveUp(button) {
  const li = button.parentElement;
  const prev = li.previousElementSibling;
  if (prev) {
    li.parentElement.insertBefore(li, prev);
    document.getElementById('reorderStatus').textContent =
      `${li.querySelector('span').textContent} moved up.`;
  }
}

function moveDown(button) {
  const li = button.parentElement;
  const next = li.nextElementSibling;
  if (next) {
    li.parentElement.insertBefore(next, li);
    document.getElementById('reorderStatus').textContent =
      `${li.querySelector('span').textContent} moved down.`;
  }
}
```
