# Images: Detection Rules for Accessibility Violations

## Tags
Tags: #html #tsx #images #alt #svg #1.1.1 #2.4.4

These are precise detection rules. For each rule: check whether the FIRES condition is met in the actual code before reporting. Do not report if the DOES NOT FIRE condition applies.

---

## Missing alt attribute on informative image — SC 1.1.1 (F65)

FIRES when: `<img>` element has no `alt` attribute at all.

DOES NOT FIRE when:
- `<img>` has `alt=""` (decorative image, correctly suppressed)
- `<img>` has `alt="some text"` (any non-empty alt is present)
- `<img role="presentation">` or `<img aria-hidden="true">` (intentionally hidden)

```html
<!-- FIRES -->
<img src="hero.jpg">

<!-- DOES NOT FIRE: decorative, correctly empty -->
<img src="divider.png" alt="">

<!-- DOES NOT FIRE: has alt text -->
<img src="team.jpg" alt="The engineering team at the 2025 offsite">
```

---

## Linked image with empty alt — SC 2.4.4 (F89)

FIRES when: `<a>` contains only an `<img>` (no visible text), AND the img has `alt=""`, AND the link has no `aria-label` or `aria-labelledby`.

DOES NOT FIRE when:
- The link also contains visible text next to the image
- The img has a non-empty `alt` describing the link destination
- The `<a>` has `aria-label` or `aria-labelledby`

```html
<!-- FIRES: link name is empty -->
<a href="/home"><img src="logo.png" alt=""></a>

<!-- DOES NOT FIRE: img alt describes destination -->
<a href="/home"><img src="logo.png" alt="Acme Corp — go to homepage"></a>

<!-- DOES NOT FIRE: link has aria-label -->
<a href="/home" aria-label="Go to homepage"><img src="logo.png" alt=""></a>
```

---

## Informative image with empty alt — SC 1.1.1 (F38)

FIRES when: `<img alt="">` appears in a context where the image conveys information (e.g. a chart, product photo, illustration explaining content).

DOES NOT FIRE when:
- The image is purely decorative (background texture, spacer, icon that duplicates adjacent text)
- The same information is available in adjacent text

---

## Image used as button with no accessible name — SC 4.1.2

FIRES when: `<input type="image">` has no `alt` attribute, OR `<button>` contains only `<img>` with `alt=""` and no `aria-label`.

DOES NOT FIRE when:
- `<input type="image" alt="Submit form">` (alt present)
- `<button aria-label="Search"><img src="search.svg" alt=""></button>` (button has aria-label)

```html
<!-- FIRES -->
<input type="image" src="submit.png">

<!-- DOES NOT FIRE -->
<input type="image" src="submit.png" alt="Submit form">
```

---

## SVG image with no accessible name — SC 1.1.1

FIRES when: `<svg>` that conveys information has no `<title>`, no `role="img"`, no `aria-label`, and no `aria-labelledby`.

DOES NOT FIRE when:
- `<svg aria-hidden="true">` (decorative icon, intentionally hidden)
- `<svg role="img" aria-label="Upload icon">` (labelled correctly)
- `<svg><title>Chart showing revenue growth</title></svg>`

---

## Multi-language examples

### TSX (React) — img alt and SVG accessible name
```tsx
// ❌ FIRES: img has no alt attribute
function HeroBanner() {
  return <img src="/hero.jpg" />;
}

// ✅ DOES NOT FIRE: informative image with descriptive alt
function HeroBanner() {
  return <img src="/hero.jpg" alt="Team collaborating in an open office" />;
}

// ✅ DOES NOT FIRE: decorative image with empty alt
function Divider() {
  return <img src="/wave.svg" alt="" />;
}

// ❌ FIRES: SVG star-rating widget has no role or accessible name
function StarRating({ rating }: { rating: number }) {
  return (
    <div>
      {[1,2,3,4,5].map(i => (
        <svg key={i}><use href="#star" /></svg>
      ))}
      <span>{rating}/5</span>
    </div>
  );
}

// ✅ DOES NOT FIRE: container has role="img" with descriptive aria-label
function StarRating({ rating }: { rating: number }) {
  return (
    <div role="img" aria-label={`Rated ${rating} out of 5 stars`}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} aria-hidden="true"><use href="#star" /></svg>
      ))}
    </div>
  );
}
```
