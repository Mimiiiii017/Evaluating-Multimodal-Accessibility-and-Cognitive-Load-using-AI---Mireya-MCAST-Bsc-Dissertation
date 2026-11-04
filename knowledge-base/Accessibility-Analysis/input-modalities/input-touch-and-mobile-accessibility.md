# Input Modalities: Touch and Mobile Accessibility

## Tags
Tags: #input-modalities #touch #mobile #gestures #responsive #wcag #eaa

## Purpose
Ensure web content is fully accessible on touch-enabled mobile devices, including smartphones and tablets, by supporting touch input, screen readers, and responsive design.

## Key points
- Touch is the primary input modality on mobile devices; all functionality must be touch-accessible.
- Touch targets must be large enough to activate without error (minimum 24×24px, recommended 44×44px).
- Complex gestures (pinch, multi-finger swipe) must have simple single-tap alternatives.
- Mobile screen readers (VoiceOver on iOS, TalkBack on Android) use specific touch gestures for navigation.
- Content must respond to orientation changes and support both portrait and landscape.
- Mobile users frequently zoom; pinch-to-zoom must not be disabled.

## Developer checks
- Test all functionality on a real mobile device with touch input.
- Verify touch targets are at least 24×24px with adequate spacing.
- Check that complex gestures have single-tap or single-swipe alternatives.
- Test with VoiceOver (iOS) and TalkBack (Android).
- Verify the viewport does not disable zoom (`user-scalable=no` or `maximum-scale=1`).
- Confirm content reflows properly on small screens without horizontal scrolling.
- Test focus and input behaviour on mobile keyboards (virtual keyboards).

## Fix patterns
- Increase touch target sizes with padding.
- Provide button controls as alternatives to complex gestures.
- Allow both portrait and landscape orientation.
- Ensure the viewport meta tag allows user zoom.
- Use responsive design that adapts to small screens.
- Test with mobile screen readers to verify all content and controls are accessible.
- Ensure virtual keyboard does not obscure form fields (scroll into view on focus).

## Examples
```html
<!-- Mobile-friendly viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

```css
/* Touch-friendly button sizes */
.mobile-button {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 16px;
  font-size: 1rem;
}

/* Adequate spacing between touch targets */
.button-group button {
  margin: 8px;
}

/* Responsive layout */
@media (max-width: 480px) {
  .sidebar {
    display: none;
  }
  .main-content {
    width: 100%;
  }
}
```

```js
// Scroll input into view when mobile keyboard opens
document.querySelectorAll('input, textarea, select').forEach((el) => {
  el.addEventListener('focus', () => {
    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
  });
});
```
