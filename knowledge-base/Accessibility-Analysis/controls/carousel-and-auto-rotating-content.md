# Carousel and Auto-Rotating Content Accessibility

## Overview

Carousels (also called sliders, hero rotators, or content rotators) are among the most accessibility-problematic UI patterns on the web. They present multiple content items sequentially, often with auto-rotation, and require careful ARIA and keyboard implementation to be usable by screen reader users, keyboard-only users, and users with vestibular disorders.

---

## Structure and ARIA Roles

### Recommended ARIA structure

```html
<!-- Outer container — labelled landmark -->
<section aria-roledescription="carousel" aria-label="Featured products">

  <!-- Slide container -->
  <div class="slides">
    <div
      role="group"
      aria-roledescription="slide"
      aria-label="1 of 4"
      aria-hidden="false"
    >
      <!-- slide content -->
    </div>
    <div
      role="group"
      aria-roledescription="slide"
      aria-label="2 of 4"
      aria-hidden="true"  <!-- non-active slides hidden from AT -->
    >
      <!-- slide content -->
    </div>
  </div>

  <!-- Controls -->
  <button aria-label="Previous slide">‹</button>
  <button aria-label="Next slide">›</button>

  <!-- Pause button (required when auto-rotating) -->
  <button aria-label="Pause auto-rotation" aria-pressed="false">⏸</button>

  <!-- Slide picker tabs (optional but common) -->
  <div role="tablist" aria-label="Pick a slide">
    <button role="tab" aria-selected="true"  aria-label="Slide 1" tabindex="0"></button>
    <button role="tab" aria-selected="false" aria-label="Slide 2" tabindex="-1"></button>
    <button role="tab" aria-selected="false" aria-label="Slide 3" tabindex="-1"></button>
  </div>

</section>
```

---

## Auto-Rotation Requirements (SC 2.2.2)

A carousel that automatically advances to the next slide without user interaction must provide all three of:

1. **Pause** — the user can pause the rotation entirely.
2. **Stop** — the user can stop the rotation (disable auto-advance permanently for the session).
3. **Control** — the user can control the timing.

The simplest compliant implementation: a visible **pause button** that sets `aria-pressed="true"` when paused and stops the auto-advance interval. The button must be keyboard-accessible.

Auto-rotation must also pause when:
- A slide or its contents receives keyboard focus.
- The carousel is hovered by a pointer device.

```javascript
// ❌ Non-compliant — auto-rotates with no pause control
setInterval(() => goToNextSlide(), 5000);

// ✅ Compliant — auto-rotates with keyboard/focus/hover pause
let autoTimer = setInterval(() => goToNextSlide(), 5000);

pauseBtn.addEventListener('click', () => {
  if (isPaused) {
    autoTimer = setInterval(() => goToNextSlide(), 5000);
    pauseBtn.setAttribute('aria-pressed', 'false');
    pauseBtn.setAttribute('aria-label', 'Pause auto-rotation');
  } else {
    clearInterval(autoTimer);
    pauseBtn.setAttribute('aria-pressed', 'true');
    pauseBtn.setAttribute('aria-label', 'Resume auto-rotation');
  }
  isPaused = !isPaused;
});

// Pause on focus
carouselEl.addEventListener('focusin', () => clearInterval(autoTimer));
carouselEl.addEventListener('focusout', () => { if (!isPaused) autoTimer = setInterval(…); });

// Pause on hover
carouselEl.addEventListener('mouseenter', () => clearInterval(autoTimer));
carouselEl.addEventListener('mouseleave', () => { if (!isPaused) autoTimer = setInterval(…); });
```

---

## Slide Visibility — aria-hidden

Only the currently visible slide should be in the accessibility tree. Non-visible slides must have `aria-hidden="true"` to prevent screen reader cursors from finding them.

```javascript
// When advancing to slide N:
slides.forEach((slide, i) => {
  slide.setAttribute('aria-hidden', i === currentIndex ? 'false' : 'true');
});
```

Without this, a screen reader user navigating by headings or links will encounter content from hidden slides, creating confusion about page structure.

---

## Previous/Next Button Labels

Icon-only previous/next buttons must have descriptive accessible names:

```html
<!-- ❌ Broken — icon with no name -->
<button><svg>…</svg></button>

<!-- ✅ Correct — aria-label provides name -->
<button aria-label="Previous slide">
  <svg aria-hidden="true" focusable="false">…</svg>
</button>
<button aria-label="Next slide">
  <svg aria-hidden="true" focusable="false">…</svg>
</button>
```

The carousel navigation SVG icons must have `aria-hidden="true"` and `focusable="false"` (the `focusable` attribute prevents IE/Edge from making SVGs a separate tab stop).

---

## Live Region for Screen Reader Announcement

When the carousel advances (either automatically or via user controls), the new slide content should be announced. Use `aria-live="polite"` on the slide container so screen readers announce the incoming slide:

```html
<div class="slides" aria-live="polite" aria-atomic="false">
  <!-- active slide content only -->
</div>
```

Set `aria-live="off"` during rapid manual navigation (when the user is clicking Next repeatedly) to prevent announcement of every intermediate slide.

---

## Keyboard Interaction

When focus is inside the carousel:

| Key | Behaviour |
|-----|-----------|
| Arrow Left / Arrow Right | Previous / next slide |
| Tab | Move to next focusable element within the slide |
| Home / End | First / last slide |

All slide content (links, buttons, images with alt text) must be reachable by keyboard when the slide is active. Inactive slides with `aria-hidden="true"` should also have their links set to `tabindex="-1"` so they are not reached by Tab.

---

## Detection Rules

A carousel is non-conformant if any of the following is true:

1. **No pause control** — auto-rotation runs without a pause/stop button. SC 2.2.2.
2. **Non-visible slides not hidden** — `aria-hidden="true"` not applied to inactive slides. Links and headings from hidden slides appear in AT navigation.
3. **Previous/next buttons have no accessible name** — icon-only buttons without `aria-label`. SC 4.1.2, SC 1.1.1.
4. **Slide labels missing** — slides have no `aria-label="N of M"` or descriptive label. SC 4.1.2.
5. **Auto-rotation does not pause on focus** — focus entering the carousel must pause auto-advance. SC 2.2.2.
6. **Carousel section has no accessible name** — the container has no `aria-label` or `aria-labelledby`, making it an unlabelled landmark. SC 1.3.6.
7. **Slide picker tabs missing roving tabindex** — tab-based slide pickers must implement roving tabindex (one `tabindex="0"`, rest `tabindex="-1"`).

---

## Reduced Motion

Carousel transition animations must be disabled when the user has requested reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  .carousel-slide {
    transition: none;
    animation: none;
  }
}
```

---

## WCAG References

- SC 2.2.2 Pause, Stop, Hide — auto-rotating content must be pausable.
- SC 2.1.1 Keyboard — all navigation must be keyboard accessible.
- SC 1.1.1 Non-text Content — icon buttons need accessible names.
- SC 4.1.2 Name, Role, Value — slides, tabs, and buttons must expose names and states.
- SC 1.3.6 Identify Purpose (AAA).
- SC 2.3.3 Animation from Interactions (AAA) — reduced motion.
