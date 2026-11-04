# Forms: Detection Rules for Accessibility Violations

## Tags
Tags: #html #css #js #tsx #forms #labels #inputs #1.3.1 #4.1.2 #3.3.2 #3.3.1

These are precise detection rules. For each rule: check whether the FIRES condition is met in the actual code before reporting. Do not report if the DOES NOT FIRE condition applies.

---

## Input with no accessible label — SC 1.3.1, SC 4.1.2 (F68)

FIRES when: `<input>`, `<select>`, or `<textarea>` has none of:
- A `<label for="id">` matching its `id`
- An `aria-label` attribute
- An `aria-labelledby` referencing visible text
- A wrapping `<label>` element

DOES NOT FIRE when:
- A `<label for="X">` exists and the input has `id="X"`
- `aria-label="..."` is present and non-empty
- `aria-labelledby="..."` references an element with visible text

```html
<!-- FIRES: placeholder only, no label -->
<input type="email" placeholder="Enter your email">

<!-- FIRES: label exists but not associated (no for/id match) -->
<label>Email address</label>
<input type="email">

<!-- DOES NOT FIRE: properly associated label -->
<label for="email">Email address</label>
<input id="email" type="email">

<!-- DOES NOT FIRE: aria-label present -->
<input type="search" aria-label="Search the site">
```

---

## Newsletter / subscription input missing label — SC 1.3.1 (F68)

FIRES when: an `<input type="email">` or text input inside a newsletter signup section has no label (common pattern: only a placeholder like "Enter email" and a submit button).

DOES NOT FIRE when: a visible `<label>` or `aria-label` is present.

---

## Radio or checkbox group missing fieldset/legend — SC 1.3.1

FIRES when: two or more `<input type="radio">` with the same `name`, or two or more `<input type="checkbox">` for a related group, are NOT inside a `<fieldset>` with a `<legend>`.

DOES NOT FIRE when:
- The group is wrapped in `<fieldset><legend>...</legend></fieldset>`
- Only a single standalone checkbox (e.g. "I agree to terms") — no group context needed
- `role="group"` + `aria-labelledby` is used as an alternative

```html
<!-- FIRES: related radios, no fieldset -->
<div>
  <input type="radio" name="plan" value="free"> Free
  <input type="radio" name="plan" value="pro"> Pro
</div>

<!-- DOES NOT FIRE -->
<fieldset>
  <legend>Choose a plan</legend>
  <input type="radio" id="plan-free" name="plan" value="free">
  <label for="plan-free">Free</label>
</fieldset>
```

---

## Required field with no indication — SC 3.3.2

FIRES when: a form field is required (`required` attribute or `aria-required="true"`) but the label or surrounding text does not indicate it is required (no asterisk, no "(required)" text, no visual indicator explained in instructions).

DOES NOT FIRE when: the label includes a required indicator and the form has an explanation of the indicator (e.g. "* required fields").

---

## Error message not associated with field — SC 3.3.1

FIRES when: a validation error or hint message appears near a form field but is not linked via `aria-describedby` on the input and not announced via a live region.

DOES NOT FIRE when: `aria-describedby` on the `<input>` references the error element's `id`.

---

## Multi-language examples

### CSS — visually hiding error messages accessibly
```css
/* ✅ Error text hidden visually but read by screen readers */
.error-message {
  position: absolute;
  width: 1px; height: 1px;
  clip: rect(0 0 0 0);
  overflow: hidden;
}

/* ❌ FIRES: display:none removes content from AT entirely */
.error-message { display: none; }
```

### JavaScript — dynamic aria-invalid and aria-describedby
```javascript
// ❌ FIRES: error shown visually but no ARIA link from field to message
function showError(fieldId, msg) {
  document.getElementById(fieldId + '-error').textContent = msg;
}

// ✅ DOES NOT FIRE: field linked to message via aria-describedby
function showError(fieldId, msg) {
  const errorEl = document.getElementById(fieldId + '-error');
  errorEl.textContent = msg;
  const input = document.getElementById(fieldId);
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', fieldId + '-error');
}
```

### TSX (React) — form field labelling and error state
```tsx
// ❌ FIRES: input has no accessible label (htmlFor missing or mismatched)
function EmailField() {
  return <input type="email" placeholder="Enter email" />;
}

// ✅ DOES NOT FIRE: label linked via htmlFor
function EmailField() {
  return (
    <>
      <label htmlFor="email">Email address</label>
      <input id="email" type="email" />
    </>
  );
}

// ❌ FIRES: error state not wired to input via aria-describedby
function PasswordField({ error }: { error: string }) {
  return (
    <>
      <label htmlFor="password">Password</label>
      <input id="password" type="password" />
      {error && <span className="error">{error}</span>}
    </>
  );
}

// ✅ DOES NOT FIRE
function PasswordField({ error }: { error: string }) {
  return (
    <>
      <label htmlFor="password">Password</label>
      <input
        id="password" type="password"
        aria-invalid={!!error}
        aria-describedby={error ? 'pw-error' : undefined}
      />
      {error && <span id="pw-error" role="alert">{error}</span>}
    </>
  );
}
```
