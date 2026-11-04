# Buttons and Interactive Controls: Detection Rules

## Tags
Tags: #html #js #tsx #controls #buttons #aria-expanded #aria-pressed #4.1.2 #2.1.1

These are precise detection rules. Check the FIRES condition against the actual code. Do not report if the DOES NOT FIRE condition applies.

---

## Icon-only button with no accessible name — SC 4.1.2 (F68)

FIRES when: a `<button>` contains only an icon (SVG, `<img>`, or icon font character) with no visible text, AND has none of: `aria-label`, `aria-labelledby`, or `<title>` inside the SVG.

DOES NOT FIRE when:
- `<button aria-label="Close dialog">` — aria-label present
- `<button><svg aria-label="Search" role="img">...</svg></button>` — SVG labelled
- `<button><img src="edit.svg" alt="Edit item"> Edit</button>` — visible text present

```html
<!-- FIRES: icon only, no name -->
<button><svg>...</svg></button>

<!-- FIRES: aria-label missing, icon class only -->
<button class="btn-close"><i class="icon-x"></i></button>

<!-- DOES NOT FIRE -->
<button aria-label="Close dialog"><svg aria-hidden="true">...</svg></button>
```

---

## Button using non-button element with no keyboard support — SC 2.1.1, SC 4.1.2

FIRES when: a `<div>`, `<span>`, or `<a href="#">` is used as an interactive button (has `onClick`, `role="button"`, or acts as a trigger) but lacks `tabindex="0"` and keyboard event handlers (`onKeyDown` / `onKeyUp` / `onKeyPress`).

DOES NOT FIRE when:
- A native `<button>` or `<input type="submit">` is used
- `role="button"` is present AND `tabindex="0"` is set AND keyboard events are handled

---

## Disclosure button missing aria-expanded — SC 4.1.2

FIRES when: a `<button>` controls the visibility of another element (accordion, dropdown, FAQ panel) but has no `aria-expanded` attribute.

DOES NOT FIRE when:
- `aria-expanded="true"` or `aria-expanded="false"` is present on the controlling button
- The controlled element uses `aria-haspopup` + `aria-expanded` correctly

```html
<!-- FIRES -->
<button class="accordion-toggle">What is WCAG?</button>
<div class="panel">...</div>

<!-- DOES NOT FIRE -->
<button aria-expanded="false" aria-controls="faq-panel-1">What is WCAG?</button>
<div id="faq-panel-1" hidden>...</div>
```

---

## Search button missing accessible name — SC 4.1.2

FIRES when: a search `<button>` or `<input type="submit">` inside a search form has no visible text label and no `aria-label`.

DOES NOT FIRE when:
- Button has visible text ("Search", "Go")
- `aria-label="Search"` is present
- `<input type="submit" value="Search">` — value attribute serves as label

---

## Link used as button without correct semantics — SC 4.1.2

FIRES when: an `<a>` element has `href="#"` or `href="javascript:void(0)"` and is used to trigger an action (not navigation), but has no `role="button"` and no keyboard activation via `Enter`/`Space`.

DOES NOT FIRE when:
- A proper `<button>` is used instead
- The `<a>` genuinely navigates to a destination (including same-page anchor targets that are real sections)

---

## Multi-language examples

### JavaScript — aria-pressed toggle buttons
```javascript
// ❌ FIRES: filter button toggled visually but aria-pressed not updated
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => btn.classList.toggle('active'));
});

// ✅ DOES NOT FIRE: aria-pressed reflects pressed state
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const pressed = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!pressed));
  });
});
```

### TSX (React) — icon-only button and disclosure button
```tsx
// ❌ FIRES: icon-only button with no accessible name
function CloseButton({ onClose }: { onClose: () => void }) {
  return <button onClick={onClose}><XIcon /></button>;
}

// ✅ DOES NOT FIRE
function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button aria-label="Close dialog" onClick={onClose}>
      <XIcon aria-hidden="true" />
    </button>
  );
}

// ❌ FIRES: disclosure button missing aria-expanded
function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(v => !v)}>{question}</button>
      {open && <div>{answer}</div>}
    </>
  );
}

// ✅ DOES NOT FIRE
function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button aria-expanded={open} aria-controls="answer-panel"
              onClick={() => setOpen(v => !v)}>
        {question}
      </button>
      <div id="answer-panel" hidden={!open}>{answer}</div>
    </>
  );
}
```
