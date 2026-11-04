# Controls: Pointer Gestures and Pointer Cancellation

## Tags
Tags: #controls #pointer #gestures #cancellation #touch #wcag #2.5.1 #2.5.2

## Purpose
Ensure all functionality that uses multipoint or path-based pointer gestures can be operated with a single pointer without a path-based gesture, and that users can cancel accidental pointer actions.

## Key points
- All functionality operated through multipoint gestures (pinch, multi-finger swipe) or path-based gestures (swiping, dragging a path) must also be operable with a single-point activation such as a tap or click (WCAG 2.5.1).
- Exceptions exist where the multipoint or path-based gesture is essential (e.g., freehand drawing).
- For click/tap actions, the down-event must not trigger the action alone; instead, the action should complete on the up-event, and users must be able to abort or undo it (WCAG 2.5.2).
- This supports users with motor impairments, tremors, and those using assistive pointers.
- Touch gestures that require precise movements exclude many users.

## Developer checks
- Identify all interactions that require multipoint gestures (pinch to zoom, two-finger scroll).
- Check if path-based gestures (swipe, drag along a path) have single-click alternatives.
- Verify that actions fire on the up-event (mouseup/touchend/keyup), not the down-event.
- Confirm accidental taps can be cancelled by moving the pointer off the target before releasing.
- Test with a single pointer device (mouse or single-touch) to confirm all functionality works.

## Fix patterns
- Provide button alternatives for gestures (e.g., + / – buttons alongside pinch-to-zoom).
- Add on-screen controls (arrows, pagination) as alternatives to swipe gestures.
- Bind actions to `mouseup`/`touchend`/`click` instead of `mousedown`/`touchstart`.
- Allow users to cancel an action by moving the pointer away before releasing.
- Provide undo functionality for destructive or significant actions.

## Examples
```html
<!-- Gesture alternative: buttons for map zoom instead of pinch -->
<div class="map-controls">
  <button aria-label="Zoom in" onclick="zoomIn()">+</button>
  <button aria-label="Zoom out" onclick="zoomOut()">−</button>
</div>

<!-- Carousel: buttons instead of swipe-only -->
<button aria-label="Previous slide" onclick="prevSlide()">◀</button>
<button aria-label="Next slide" onclick="nextSlide()">▶</button>
```

```js
// Incorrect: action on down-event (cannot be cancelled)
element.addEventListener('mousedown', () => {
  deleteItem();
});

// Correct: action on up-event (can be cancelled by moving away)
element.addEventListener('click', () => {
  deleteItem();
});

// Correct: cancel if pointer leaves before release
element.addEventListener('mousedown', () => { element.dataset.pressed = 'true'; });
element.addEventListener('mouseleave', () => { element.dataset.pressed = 'false'; });
element.addEventListener('mouseup', () => {
  if (element.dataset.pressed === 'true') {
    deleteItem();
  }
  element.dataset.pressed = 'false';
});
```
