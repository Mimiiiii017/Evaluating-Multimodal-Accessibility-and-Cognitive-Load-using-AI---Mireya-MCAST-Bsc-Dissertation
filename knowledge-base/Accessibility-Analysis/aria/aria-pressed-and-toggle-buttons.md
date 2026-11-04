# aria-pressed and Toggle Buttons

## What is aria-pressed?

`aria-pressed` communicates the current toggled state of a button to assistive technologies such as screen readers. It is used whenever a button controls a binary persistent state that changes on every click — for example a play/pause button, a mute/unmute button, a billing period switch, or a filter tab that highlights as active.

Valid values: `"true"` (currently pressed/active), `"false"` (not pressed, default state), `"mixed"` (indeterminate state, rarely needed).

`aria-pressed` must be explicitly set on first render — it cannot be omitted until the first interaction. `aria-pressed` absent is treated by screen readers as a regular button with no state semantics.

## When to Use aria-pressed vs aria-expanded

- **`aria-pressed`** — the button itself has two persistent states that alternate (ON/OFF, active/inactive). The UI change that results is a visual emphasis on the button itself. Example: "Bold" button in a text editor, "Mute" button on a video player, "Like" button.
- **`aria-expanded`** — the button shows or hides *another* section of content (a menu, a disclosure panel, a submenu). The button's own visual state may change, but the primary purpose is to reveal or hide a separate container. Example: hamburger menu button, FAQ accordion trigger, dropdown menu toggle.

Never use both `aria-pressed` and `aria-expanded` on the same button for the same action.

## Toolbar and Filter Tab Groups

When a group of buttons acts like a segmented control — one option active at a time — each button participates in an `aria-pressed` group:

```html
<!-- Correct: each button in the group carries aria-pressed -->
<div role="group" aria-label="Billing period">
  <button aria-pressed="true">Monthly</button>
  <button aria-pressed="false">Annual</button>
</div>
```

When the user clicks "Annual", the handler sets Monthly to `aria-pressed="false"` and Annual to `aria-pressed="true"`. Without this, a screen reader user cannot determine which option is currently selected.

Common patterns that need aria-pressed in a group:
- Billing period toggles (monthly / annual)
- Filter tabs that highlight as active (All / Active / Completed)
- View mode selectors (Grid / List)
- Sort direction buttons (Ascending / Descending)

## Detection Rules — when aria-pressed is Missing

A button is missing `aria-pressed` if:

1. It visually changes its own appearance (colour, background, icon swap) when clicked.
2. The change is persistent — it does not revert when the user clicks elsewhere or presses Escape.
3. The toggle is binary — on or off, active or inactive.
4. The element is a `<button>` or has `role="button"`.
5. The button does NOT have `aria-pressed` set on initial render.
6. The button handler does NOT toggle `aria-pressed` between `"true"` and `"false"` on each click.

A toggle button that only changes CSS classes without updating `aria-pressed` is broken for screen reader users, even if it looks correct visually.

## JavaScript Detection Pattern

```javascript
// BROKEN — toggles CSS class but never updates aria-pressed
toggleBtn.addEventListener('click', () => {
  isActive = !isActive;
  toggleBtn.classList.toggle('active', isActive);
  // ❌ aria-pressed never set
});

// CORRECT — sets initial state AND updates on toggle
toggleBtn.setAttribute('aria-pressed', 'false'); // on init

toggleBtn.addEventListener('click', () => {
  isActive = !isActive;
  toggleBtn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  toggleBtn.classList.toggle('active', isActive);
});
```

A static code reviewer should flag any function that toggles a binary class or state variable on a `<button>` without a corresponding `setAttribute('aria-pressed', …)` call, and any button element that lacks `aria-pressed` in the initial HTML.

## React / TSX Detection Pattern

```tsx
// BROKEN — no aria-pressed prop
<button onClick={() => setIsActive(!isActive)}>{label}</button>

// CORRECT — aria-pressed as an explicit JSX prop
<button
  aria-pressed={isActive ? "true" : "false"}
  onClick={() => setIsActive(!isActive)}
>
  {label}
</button>
```

In React, `aria-pressed` must be passed as a string prop (`"true"` or `"false"`), not a boolean. A boolean `aria-pressed={false}` will render the attribute correctly in most cases, but `aria-pressed={true}` may be rendered as `aria-pressed="true"` or omitted — use explicit strings to be safe.

A component that receives an `isActive`, `isPressed`, `isSelected`, or `isSorting` prop and renders a `<button>` without passing `aria-pressed` is a detection candidate.

## Initial State Requirement

`aria-pressed` must be present in the initial HTML/JSX, not added only after the first click. If `aria-pressed` is absent on the first render, assistive technologies will not know the button is a toggle button even after the user discovers it.

```html
<!-- BROKEN — aria-pressed added only after click, absent on load -->
<button id="mute-btn">Mute</button>

<!-- CORRECT — initial state explicit on load -->
<button id="mute-btn" aria-pressed="false">Mute</button>
```

## WCAG Reference

- WCAG SC 4.1.2 Name, Role, Value — interactive components must expose their current state.
- ARIA 1.2 §6.6.2 — `aria-pressed` is a required state property for the "button" role when the button is a toggle widget.
- ARIA Authoring Practices Guide — Toggle Button Pattern.
