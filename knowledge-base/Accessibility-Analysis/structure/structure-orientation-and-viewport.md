# Structure: Orientation and Viewport

## Tags
Tags: #structure #orientation #viewport #responsive #wcag #1.3.4

## Purpose
Ensure content is not restricted to a single display orientation (portrait or landscape) unless a specific orientation is essential, so users who mount devices in a fixed orientation can still access all functionality.

## Key points
- Content must not be locked to portrait or landscape unless orientation is essential.
- Some users mount devices on wheelchairs or stands in a fixed orientation.
- Orientation restrictions prevent access for users who cannot physically rotate their device.
- Essential exceptions include a piano keyboard app or a bank cheque layout.
- The viewport meta tag must not disable user scaling or zoom.

## Developer checks
- Test the application in both portrait and landscape orientations.
- Check for CSS or JavaScript that forces a specific orientation.
- Verify no orientation lock is applied via the Web App Manifest or screen orientation API.
- Ensure the viewport meta tag does not include `user-scalable=no` or `maximum-scale=1`.
- Confirm all content and functionality is available in both orientations.

## Fix patterns
- Remove CSS or JavaScript that restricts orientation.
- Use responsive design to adapt layout to any orientation.
- Remove `user-scalable=no` and restrictive `maximum-scale` from the viewport meta tag.
- Only lock orientation when the content fundamentally requires it (and document this decision).
- Test on real devices or emulators in both orientations.

## Examples
```html
<!-- Incorrect: disables zoom and scaling -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

<!-- Correct: allows user zoom and scaling -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

```css
/* Incorrect: forces landscape only */
@media (orientation: portrait) {
  body {
    display: none;
  }
  body::after {
    content: "Please rotate your device.";
  }
}

/* Correct: adapts layout to both orientations */
@media (orientation: portrait) {
  .sidebar { flex-direction: column; }
}
@media (orientation: landscape) {
  .sidebar { flex-direction: row; }
}
```
