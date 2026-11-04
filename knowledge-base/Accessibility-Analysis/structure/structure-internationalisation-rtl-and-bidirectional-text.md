# Structure: Internationalisation, RTL, and Bidirectional Text

## Tags
Tags: #structure #internationalisation #rtl #bidirectional #language #wcag #eaa

## Purpose
Ensure web content correctly supports right-to-left (RTL) languages, bidirectional text, and internationalisation requirements so users of all languages can read and interact with content correctly.

## Key points
- Languages such as Arabic, Hebrew, Farsi, and Urdu are read right-to-left (RTL).
- The `dir` attribute on the `<html>` element sets the base text direction for the page.
- Mixed content (e.g., English text within an Arabic page) requires bidirectional (bidi) handling.
- Incorrect text direction makes content unreadable and unusable.
- Layout must mirror for RTL: navigation, reading flow, icons with directional meaning, and alignment should all flip.
- The EAA requires digital services to be accessible across EU languages, some of which may use RTL scripts.
- CSS logical properties (`inline-start`, `inline-end`, `block-start`, `block-end`) support both LTR and RTL without separate stylesheets.

## Developer checks
- Verify the `dir` attribute is set correctly on `<html>` (or on individual elements for mixed content).
- Check that the `lang` attribute matches the content language.
- Test the page with an RTL language and confirm layout mirrors appropriately.
- Verify that directional icons (arrows, progress indicators) flip or have RTL alternatives.
- Confirm CSS uses logical properties instead of physical ones where possible.
- Check that form fields, labels, and error messages align correctly in RTL mode.
- Test bidirectional text (e.g., English product names within Arabic sentences) for correct rendering.

## Fix patterns
- Set `<html lang="ar" dir="rtl">` for Arabic pages (and equivalent for other RTL languages).
- Use the `dir` attribute on individual elements when mixing directions.
- Replace CSS physical properties (`margin-left`, `padding-right`, `text-align: left`) with logical equivalents (`margin-inline-start`, `padding-inline-end`, `text-align: start`).
- Use `<bdo>` or `<bdi>` elements for bidirectional text isolation.
- Mirror directional icons for RTL using CSS transforms or separate icon sets.
- Test with real RTL content, not just mirrored LTR layouts.

## Examples
```html
<!-- RTL page setup -->
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>الصفحة الرئيسية – شركتنا</title>
</head>
<body>
  <h1>مرحبًا بكم في موقعنا</h1>
  <p>هذه صفحة تجريبية باللغة العربية.</p>
</body>
</html>

<!-- Mixed direction content -->
<p dir="rtl">
  اشتريت جهاز <bdi dir="ltr">iPhone 15 Pro</bdi> من المتجر.
</p>

<!-- Bidirectional isolation for user-generated content -->
<ul>
  <li>مستخدم: <bdi>Sarah</bdi> – تعليق جديد</li>
  <li>مستخدم: <bdi>أحمد</bdi> – تعليق جديد</li>
</ul>
```

```css
/* Use logical properties for LTR/RTL support */
/* Instead of: */
.card {
  margin-left: 1rem;
  padding-right: 2rem;
  text-align: left;
  border-left: 3px solid #005fcc;
}

/* Use: */
.card {
  margin-inline-start: 1rem;
  padding-inline-end: 2rem;
  text-align: start;
  border-inline-start: 3px solid #005fcc;
}

/* Flip directional icons in RTL */
[dir="rtl"] .icon-arrow-forward {
  transform: scaleX(-1);
}

/* Flexbox and grid respect dir automatically */
.nav-items {
  display: flex;
  gap: 1rem;
  /* Items will reverse in RTL automatically with row direction */
}
```
