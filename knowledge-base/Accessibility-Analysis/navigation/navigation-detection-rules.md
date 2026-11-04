# Navigation and Links: Detection Rules for Accessibility Violations

## Tags
Tags: #html #js #tsx #navigation #landmarks #links #2.4.4 #2.4.1 #1.3.6 #4.1.2

These are precise detection rules. Check the FIRES condition against the actual code. Do not report if the DOES NOT FIRE condition applies.

---

## Link with no accessible name — SC 2.4.4, SC 4.1.2 (F89)

FIRES when: an `<a href="...">` element has empty or whitespace-only text content AND no `aria-label`, `aria-labelledby`, or child image with non-empty `alt`.

DOES NOT FIRE when:
- The link contains visible text
- `aria-label="..."` is present and descriptive
- The link wraps an `<img>` with a non-empty `alt` describing the destination
- `aria-labelledby` references visible text

```html
<!-- FIRES: empty link -->
<a href="/twitter"></a>

<!-- FIRES: icon only, no label -->
<a href="/twitter"><svg aria-hidden="true">...</svg></a>

<!-- DOES NOT FIRE -->
<a href="/twitter" aria-label="Follow us on Twitter"><svg aria-hidden="true">...</svg></a>

<!-- DOES NOT FIRE -->
<a href="/twitter"><img src="twitter.svg" alt="Twitter"></a>
```

---

## Non-descriptive link text — SC 2.4.4 (F84)

FIRES when: link text is generic and provides no destination context out of context: "click here", "read more", "here", "more", "link", "this page".

DOES NOT FIRE when:
- Generic text is supplemented by `aria-label` that provides full context
- The link text is "Read more about WCAG 2.2" (generic phrase but includes destination)
- `aria-describedby` provides additional context

```html
<!-- FIRES -->
<a href="/report">Click here</a>
<a href="/report">Read more</a>

<!-- DOES NOT FIRE -->
<a href="/report" aria-label="Read more about the 2025 accessibility report">Read more</a>
<a href="/report">Read the 2025 accessibility report</a>
```

---

## Twitter / social media icon link missing accessible name — SC 2.4.4

FIRES when: a link to a social media profile (Twitter/X, LinkedIn, GitHub, Facebook, Instagram) contains only an SVG icon or image with `aria-hidden="true"` or `alt=""`, with no `aria-label` on the link.

DOES NOT FIRE when: `aria-label="Follow us on Twitter"` (or equivalent) is on the `<a>`.

---

## Skip navigation link missing or non-functional — SC 2.4.1

FIRES when: the page has no "skip to main content" link (or equivalent bypass mechanism) as the first focusable element, making keyboard users navigate through the entire header/nav on every page.

DOES NOT FIRE when:
- A "Skip to main content" link exists as the first focusable element (it may be visually hidden until focused)
- `<main id="main">` exists and is directly reachable without skip link if nav is short
- The page has no repeated navigation blocks

---

## Navigation landmark missing label when multiple nav elements exist — SC 1.3.6

FIRES when: a page has more than one `<nav>` element (or `role="navigation"`) and none of them have `aria-label` or `aria-labelledby` to distinguish them.

DOES NOT FIRE when:
- Only one `<nav>` exists on the page
- Each `<nav>` has a unique `aria-label` (e.g. "Main navigation", "Footer navigation")

---

## Multi-language examples

### JavaScript — SPA route change announcement
```javascript
// ❌ FIRES: client-side navigation changes content without announcing the new page
router.on('navigate', () => renderPage());

// ✅ DOES NOT FIRE: live region announces new page title after route change
router.on('navigate', () => {
  renderPage();
  document.getElementById('route-announce').textContent = document.title;
});
// requires: <div id="route-announce" role="status" aria-live="polite" class="sr-only"></div>
```

### TSX (React) — non-descriptive link and multiple unlabelled nav elements
```tsx
// ❌ FIRES: generic link text with no additional context
function ArticleCard({ href, title }: { href: string; title: string }) {
  return <a href={href}>Read more</a>;
}

// ✅ DOES NOT FIRE
function ArticleCard({ href, title }: { href: string; title: string }) {
  return (
    <a href={href} aria-label={`Read more about ${title}`}>Read more</a>
  );
}

// ❌ FIRES: two nav elements with no distinguishing labels
function Layout() {
  return (
    <>
      <nav><MainLinks /></nav>
      <nav><FooterLinks /></nav>
    </>
  );
}

// ✅ DOES NOT FIRE
function Layout() {
  return (
    <>
      <nav aria-label="Main navigation"><MainLinks /></nav>
      <nav aria-label="Footer navigation"><FooterLinks /></nav>
    </>
  );
}
```
