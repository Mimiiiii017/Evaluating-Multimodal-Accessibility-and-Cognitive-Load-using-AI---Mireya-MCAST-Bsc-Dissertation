# iFrames and Embedded Content Accessibility

## Overview

Embedded content — iframes, embedded PDFs, embedded maps, third-party widgets — requires specific accessibility treatment to ensure screen reader users understand what they are navigating into and can use the embedded content effectively.

---

## iFrame Title Attribute (SC 4.1.2)

Every `<iframe>` must have a `title` attribute that describes its content or purpose. Without a title, screen readers announce "frame" with no context, forcing users to navigate into unknown content.

```html
<!-- ❌ Broken — no title; screen reader says "frame" or nothing -->
<iframe src="https://maps.example.com/embed"></iframe>

<!-- ❌ Broken — title is generic and unhelpful -->
<iframe src="https://maps.example.com/embed" title="iframe"></iframe>
<iframe src="video-player.html" title="Content"></iframe>

<!-- ✅ Correct — title describes what is embedded -->
<iframe
  src="https://maps.example.com/embed?q=London"
  title="Map showing office location in London"
></iframe>

<iframe
  src="video-player.html"
  title="Product demo video: 3-minute overview"
></iframe>

<iframe
  src="https://checkout.stripe.com/pay/…"
  title="Stripe payment form"
></iframe>
```

### Detection rule
Any `<iframe>` that:
- Has no `title` attribute, OR
- Has `title=""` (empty), OR
- Has a `title` value of "iframe", "frame", "embed", "content", or other generic words

…is a violation of SC 4.1.2.

---

## Decorative iFrames

If an iframe contains purely decorative content (e.g., an invisible tracking pixel, a zero-size ad placeholder), hide it from the accessibility tree:

```html
<!-- Decorative iframe — hide from AT -->
<iframe
  src="tracker.html"
  title=""
  aria-hidden="true"
  tabindex="-1"
  style="display:none"
></iframe>
```

Use `aria-hidden="true"` AND `tabindex="-1"` together to prevent keyboard focus entering the frame.

---

## Focusable Content Inside iFrames

Keyboard users must be able to navigate into and out of iframes:

- **Tab in**: focus enters the iframe when tabbing through the page.
- **Tab out**: focus exits the iframe when the user tabs past all focusable content inside.
- A `tabindex="-1"` on the `<iframe>` element prevents it from being a tab stop — the user cannot enter it via keyboard.

Do not use `tabindex="-1"` on iframes that contain interactive content (links, buttons, forms).

---

## Embedded Videos — Third-Party Players

Embedded video players (YouTube, Vimeo, etc.) are iframes and must have:

1. A `title` describing the video content.
2. Auto-play disabled if the video contains audio — SC 1.4.2 requires a mechanism to pause/stop audio that auto-plays for more than 3 seconds.

```html
<!-- ✅ Correct YouTube embed -->
<iframe
  src="https://www.youtube.com/embed/ABC?autoplay=0"
  title="Introduction to web accessibility — 5 minute overview"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
```

---

## Embedded Maps

Map embeds (Google Maps, OpenStreetMap) are iframes and need:

1. A descriptive `title` indicating what the map shows or its purpose.
2. A text alternative near the map providing the same information non-visually (address, directions, or location description) — because the embedded map is not navigable for screen reader users.

```html
<!-- Embedded map with text alternative -->
<iframe
  src="https://www.google.com/maps/embed?…"
  title="Map showing our office at 42 Example Street, London"
></iframe>
<p>Our office: <address>42 Example Street, London, EC1A 1AA</address></p>
```

---

## Sandboxed iFrames

The `sandbox` attribute restricts iframe capabilities. Some sandbox restrictions affect accessibility:

- `sandbox="allow-same-origin"` alone without `allow-scripts` prevents JavaScript from running in the iframe — this will break interactive content.
- `sandbox="allow-same-origin allow-scripts"` is the minimum for interactive embedded content.
- `allow-forms` is required if the embedded content has forms that must be submittable.

Accessibility concern: an over-restrictive `sandbox` that disables scripts may silently break focus management and ARIA inside the embedded page.

---

## scrolling Attribute

In HTML5, `scrolling="no"` on an iframe prevents users from scrolling embedded content even when it overflows. If the content inside is taller than the iframe height, users who rely on scroll (keyboard arrow keys, touchpad) cannot access it.

Do not use `scrolling="no"` unless the iframe is a fixed, self-contained component that never overflows.

---

## Detection Rules Summary

| Issue | Condition | WCAG SC |
|---|---|---|
| Missing title | `<iframe>` has no `title` attribute | 4.1.2 |
| Empty or generic title | `title=""` or title is "iframe"/"frame"/"embed" | 4.1.2 |
| Keyboard trap risk | `tabindex="-1"` on iframe with interactive content | 2.1.2 |
| Auto-play audio | `autoplay=1` on video embed without audio mute option | 1.4.2 |
| No text alternative for map | Map iframe with no nearby address/location text | 1.1.1 |
| Over-restricted sandbox | Interactive content in `sandbox` without `allow-scripts` | 4.1.2 (functional) |

---

## WCAG References

- SC 4.1.2 Name, Role, Value — iframes are UI components and must have accessible names.
- SC 2.1.1 Keyboard — all keyboard-operable content within iframes must be reachable.
- SC 2.1.2 No Keyboard Trap — users must be able to navigate out of iframes.
- SC 1.4.2 Audio Control — auto-playing audio/video must be controllable.
- SC 1.1.1 Non-text Content — meaningful embedded content needs a text alternative.
