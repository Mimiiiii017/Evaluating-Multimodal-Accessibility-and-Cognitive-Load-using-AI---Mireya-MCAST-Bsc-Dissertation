# Visual: Images of Text

## Tags
Tags: #visual #images-of-text #wcag #1.4.5

## Purpose
Ensure text is rendered as real text rather than embedded in images, so it can be resized, recolored, and read by assistive technologies.

## Key points
- Real text must be used instead of images of text wherever possible.
- Images of text cannot be resized without degradation, restyled by users, or read reliably by screen readers.
- Exceptions exist for logos, branding, and situations where a specific visual presentation is essential.
- Users with low vision rely on the ability to change text size, spacing, font, and color.
- Images of text also cause problems for users who customize browser stylesheets.

## Developer checks
- Identify any images that contain text content (headings, labels, paragraphs, buttons).
- Check whether the text could be achieved using real HTML text and CSS.
- Verify that logos and branding using images of text have appropriate alt text.
- Confirm no functional text (navigation, labels, instructions) is rendered as an image.
- Test text rendering at increased zoom levels and with custom user stylesheets.

## Fix patterns
- Replace images of text with HTML text styled using CSS.
- Use web fonts to achieve custom typography without resorting to images.
- Keep images of text only for logos and essential branding.
- Add meaningful alt text to any remaining images that contain text.
- Ensure replaced text supports resizing, reflow, and user style customization.

## Examples
```html
<!-- Incorrect: heading as image of text -->
<img src="welcome-heading.png" alt="Welcome to our website">

<!-- Correct: real text with CSS styling -->
<h1 class="hero-heading">Welcome to our website</h1>
```

```css
/* Styled text replaces image of text */
.hero-heading {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  color: #1a1a2e;
  letter-spacing: 0.05em;
}
```

```html
<!-- Acceptable exception: logo -->
<img src="company-logo.png" alt="Acme Corporation">
```
