# Visual: Animation, Motion, and Seizure Prevention

## Tags
Tags: #visual #animation #motion #seizures #reduced-motion #vestibular #wcag #2.3.1 #eaa

## Purpose
Prevent content that flashes or moves excessively from causing seizures, migraines, or vestibular discomfort, and respect user preferences for reduced motion.

## Key points
- Content must not flash more than three times per second (WCAG 2.3.1).
- Flashing content can trigger photosensitive seizures in users with epilepsy.
- Excessive motion (parallax scrolling, zoom animations, spinning elements) can cause vestibular disorders including nausea and dizziness.
- The `prefers-reduced-motion` media query allows developers to respect user system preferences.
- Non-essential animation should be removable or reducible by the user.
- Animation that conveys meaning must have a non-animated alternative.

## Developer checks
- Identify any content that flashes, blinks, or strobes.
- Verify no content flashes more than three times per second.
- Check for parallax effects, auto-playing animations, and large-scale motion.
- Confirm the site responds to `prefers-reduced-motion: reduce`.
- Test the site with system-level "Reduce motion" enabled.
- Verify essential animations have non-animated alternatives.

## Fix patterns
- Remove or reduce flashing content below the three-flashes threshold.
- Use `prefers-reduced-motion` to disable or simplify animations for users who prefer it.
- Provide a user-accessible toggle to turn off all non-essential animations.
- Replace parallax scrolling with static alternatives.
- Use subtle transitions instead of dramatic motion effects.
- Add warnings before displaying content known to contain flashing.

## Examples
```css
/* Respect user preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Motion-safe animations only */
@media (prefers-reduced-motion: no-preference) {
  .hero-section {
    animation: fadeInUp 0.6s ease-out;
  }
}

/* Subtle fade instead of dramatic motion */
.card {
  transition: opacity 0.2s ease;
}
```

```html
<!-- User toggle for animations -->
<label>
  <input type="checkbox" id="reduceMotion" onchange="toggleAnimations()">
  Reduce animations
</label>

<!-- Warning for flashing content -->
<div role="alert">
  <p>Warning: The following video contains flashing lights that may affect photosensitive viewers.</p>
</div>
```
