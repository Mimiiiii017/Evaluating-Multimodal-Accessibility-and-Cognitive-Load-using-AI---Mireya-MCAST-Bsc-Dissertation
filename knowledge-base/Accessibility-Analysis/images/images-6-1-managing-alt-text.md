# Images: Managing Alternative Text (alt)

## Tags
Tags: #images #alt-text #non-text-content #wcag #1.1.1

## Quick reference
Common image alt-text violations to flag in code reviews:

- **Missing `alt` attribute** — `<img src="photo.png">` with no `alt` attribute at all fails WCAG 1.1.1. Every `<img>` must have an `alt` attribute (even if empty for decorative images).
- **Filename or URL as alt** — `alt="photo_2024.jpg"` or `alt="https://cdn.example.com/img.png"` fails WCAG 1.1.1. Alt text must describe the content, not the filename.
- **Vague alt text** — `alt="image"`, `alt="photo"`, `alt="picture"` or `alt="image of"` prefix adds no information and fails WCAG 1.1.1.
- **Linked image with empty alt** — `<a href="/"><img src="logo.png" alt=""></a>`: when the image IS the link, empty alt removes the link's accessible name entirely (WCAG 2.4.4). The alt must describe where the link goes.
- **Informative image with empty alt** — `<img src="chart.png" alt="">` where the chart conveys data fails WCAG 1.1.1.

Violation code patterns:
```html
<!-- VIOLATION: missing alt -->
<img src="hero.jpg">

<!-- VIOLATION: linked image with empty alt (link has no name) -->
<a href="/home"><img src="footer-logo.png" alt=""></a>

<!-- VIOLATION: filename as alt -->
<img src="team.jpg" alt="team_photo_2024.jpg">

<!-- FIXED: linked image -->
<a href="/home"><img src="footer-logo.png" alt="Acme Corp — homepage"></a>

<!-- FIXED: decorative image (correctly empty) -->
<img src="divider.png" alt="">
```

## Purpose
Explain how to provide appropriate alternative text for images so non-text content is accessible to users of assistive technologies.

## Key points
- Every `<img>` and `<input type="image">` must have an `alt` attribute.
- The `alt` text must convey the purpose or information of the image.
- Decorative images must have an empty `alt` attribute (`alt=""`).
- Informative images must have meaningful, concise alternative text.
- Images that act as links or buttons must describe the action, not just the appearance.
- The same image used in different contexts may require different `alt` text.

## Developer checks
- Check that all `<img>` elements include an `alt` attribute.
- Verify that decorative images use `alt=""` and are not announced by screen readers.
- Ensure informative images do not have vague alt text such as “image” or “photo”.
- Confirm that image links describe the destination or action.
- Check `<input type="image">` elements for appropriate `alt` text.

## Fix patterns
- Add missing `alt` attributes to images.
- Replace filename-based or generic alt text with meaningful descriptions.
- Use `alt=""` for purely decorative images that add no information.
- Rewrite alt text to describe function when images are interactive.
- Avoid duplicating adjacent text content in the `alt` attribute unless necessary.

## Examples
```html
<!-- Informative image -->
<img src="logo.png" alt="Company name">

<!-- Decorative image -->
<img src="divider.png" alt="">

<!-- Image used as a link -->
<a href="/home">
  <img src="home-icon.png" alt="Go to homepage">
</a>

<!-- Image input -->
<input type="image" src="search.png" alt="Search">
```
