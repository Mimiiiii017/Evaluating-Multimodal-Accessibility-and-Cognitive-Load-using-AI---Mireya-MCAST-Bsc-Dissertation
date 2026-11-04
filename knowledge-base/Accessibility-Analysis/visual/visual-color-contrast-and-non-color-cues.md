# Visual Design: Color Contrast and Non-Color Cues

## Tags
Tags: #color-contrast #visual-design #non-color-cues #wcag #1.4.1 #1.4.3 #1.4.6 #1.4.11 #eaa

## Purpose
Ensure text and essential visual information are perceivable by users with low vision or color vision deficiencies by providing sufficient contrast and not relying on color alone.

## Key points
- Text must meet minimum contrast ratios against its background (WCAG 1.4.3).
- Normal text requires a contrast ratio of at least 4.5:1 (Level AA).
- Large text (18pt / 24px or 14pt / 18.5px bold and above) requires at least 3:1 (Level AA).
- Enhanced contrast (Level AAA): 7:1 for normal text, 4.5:1 for large text (WCAG 1.4.6).
- User interface components and graphical objects must have at least 3:1 contrast (WCAG 1.4.11 — see also visual-non-text-contrast.md for full detail).
- Color must not be the only method used to convey information, status, or errors (WCAG 1.4.1).
- Links within text must be distinguishable by more than colour alone — use underlines, font weight, or 3:1 contrast difference between link colour and surrounding text.
- Contrast requirements apply equally in light mode, dark mode, and user-selected themes.

## Developer checks
- Check text contrast against backgrounds for normal and large text using a contrast checker tool.
- Verify icons, borders, and focus indicators have sufficient contrast (3:1 minimum).
- Ensure error states, success states, and warnings are not color-only.
- Test contrast in light mode, dark mode, and high-contrast settings.
- Confirm links are distinguishable from surrounding text without color alone (underline or 3:1 contrast difference).
- Check placeholder text contrast (often too light — must still meet 4.5:1 if it conveys information).
- Test with colour blindness simulation tools to confirm non-colour cues are present.

### Recommended contrast tools
- **WebAIM Contrast Checker** — https://webaim.org/resources/contrastchecker/
- **Colour Contrast Analyser (CCA)** — Desktop tool by TPGi.
- **Chrome DevTools** — Inspect element → colour picker shows contrast ratio.
- **axe DevTools** — Automated contrast checking in browser.
- **Stark** — Design tool plugin (Figma, Sketch) for contrast checking.

## Fix patterns
- Adjust foreground or background colors to meet contrast requirements.
- Increase font weight or size where appropriate.
- Add non-color indicators such as text labels, icons, or patterns.
- Underline links or add visual indicators beyond color.
- Improve contrast for UI components such as buttons, inputs, and focus rings.

## Examples
```css
/* Sufficient contrast for body text (4.5:1) */
body {
  color: #333333; /* on #ffffff = 12.6:1 */
  background-color: #ffffff;
}

/* Clear focus indicator with strong contrast */
button:focus-visible {
  outline: 3px solid #005fcc;
}

/* Links distinguished by underline (not colour alone) */
a {
  color: #005fcc; /* 4.5:1 against white */
  text-decoration: underline;
}

/* Incorrect: placeholder too low contrast */
input::placeholder {
  color: #cccccc; /* on white = 1.6:1 FAIL */
}

/* Correct: placeholder with sufficient contrast */
input::placeholder {
  color: #767676; /* on white = 4.5:1 PASS */
}

/* Non-colour indicator for required fields */
.required-label::after {
  content: ' *';
  color: inherit; /* not red-only */
}
```
```html
<!-- Error message with text, icon, and border — not colour alone -->
<div class="error-message">
  <span aria-hidden="true">!</span>
  <strong>Error:</strong> Please enter a valid email address.
</div>

<!-- Link distinguished beyond colour -->
<a href="/terms">Terms and conditions</a>

<!-- Status indicators with text, not colour alone -->
<span class="status status--success">Active</span>
<span class="status status--error">Expired</span>

<!-- Form validation with multiple cues -->
<label for="email">Email address</label>
<input id="email" type="email" aria-invalid="true" aria-describedby="emailErr"
       class="input--error">
<div id="emailErr" class="error-text">
  <span aria-hidden="true">!</span> Please enter a valid email address.
</div>
```
