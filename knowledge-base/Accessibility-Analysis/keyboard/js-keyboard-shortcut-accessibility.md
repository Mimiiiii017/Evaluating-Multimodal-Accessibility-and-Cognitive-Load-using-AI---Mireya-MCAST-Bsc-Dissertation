# JavaScript Keyboard Shortcut Accessibility Patterns — Detection Rules

## Tags
Tags: #keyboard #javascript #keyboard-shortcuts #announcements #live-regions #focus-management #wcag #2.1.4 #2.4.3 #4.1.3

## Purpose
Keyboard shortcuts (e.g. Alt+N, Alt+M, Alt+F, Alt+S) are a powerful navigation
aid, but they must satisfy two accessibility requirements:
1. **Focus management** — the shortcut must move keyboard focus to the target
   section so keyboard and screen reader users land where they expect.
2. **Screen reader announcement** — because focus moves programmatically (often
   to a non-interactive container), the screen reader must be told what happened
   via a live region announcement.

This document provides detection rules for identifying keyboard shortcut handlers
that are missing either requirement.

---

## Required Pattern: Focus Then Announce

Every keyboard shortcut that moves the user to a new section must:
1. Call `.focus()` on the target element (which must have `tabindex="-1"`)
2. Immediately call `announce()` to describe what happened

```javascript
// ✅ Correct keyboard shortcut handler
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key === 'n') {
    e.preventDefault();
    const nav = document.getElementById('main-nav');
    nav.focus();                              // ✅ 1. Move focus
    announce('Navigation focused');          // ✅ 2. Announce destination
  }
});
```

Both steps are required. Focus alone is insufficient because many screen readers
do not read non-interactive containers when they receive programmatic focus without
an ARIA label. The live region provides the reliable fallback.

---

## Rule 1 — Alt+N / Navigation Shortcut Must Focus and Announce

### Common violation

```javascript
// ❌ Only focuses — no announcement
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key === 'n') {
    e.preventDefault();
    document.querySelector('nav').focus();
    // ❌ Missing: announce('Navigation focused');
  }
});
```

### Correct pattern

```javascript
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key === 'n') {
    e.preventDefault();
    document.querySelector('nav').focus();
    announce('Navigation focused');   // ✅
  }
});
```

### Detection signal
Search for `altKey` + `'n'` (or `key === 'n'`) in `keydown` handlers. Confirm
that a `.focus()` call and an `announce(…)` call both appear in the same branch.

---

## Rule 2 — Alt+M / Main Content Shortcut Must Focus and Announce

### Common violation

```javascript
// ❌ Skips focus management entirely — announcements also missing
if (e.altKey && e.key === 'm') {
  // jumps scroll position but no focus, no announcement
  document.getElementById('main-content').scrollIntoView();
}
```

### Correct pattern

```javascript
if (e.altKey && e.key === 'm') {
  e.preventDefault();
  const main = document.getElementById('main-content');
  main.focus();
  announce('Main content focused');   // ✅
}
```

---

## Rule 3 — Alt+F / Footer Shortcut Must Focus and Announce

```javascript
if (e.altKey && e.key === 'f') {
  e.preventDefault();
  const footer = document.querySelector('footer');
  footer.focus();
  announce('Footer focused');         // ✅
}
```

---

## Rule 4 — Alt+S / Search Shortcut Must Focus and Announce

```javascript
if (e.altKey && e.key === 's') {
  e.preventDefault();
  const search = document.getElementById('search-input');
  search.focus();                     // ✅ moves to interactive input
  announce('Search focused');         // ✅ still announce for clarity
}
```

Note: `<input>` elements already announce themselves on focus, but an explicit
announcement avoids reliance on AT reading the placeholder or label in context.

---

## Rule 5 — Shortcut Target Elements Must Have tabindex="-1"

For non-interactive elements (e.g. `<nav>`, `<main>`, `<footer>`, `<section>`)
receiving programmatic `.focus()`, the element must have `tabindex="-1"`. Without
it, `.focus()` silently fails in some browsers.

### Violation

```html
<!-- ❌ nav has no tabindex — .focus() will fail -->
<nav id="main-nav">...</nav>
```

### Correct

```html
<!-- ✅ tabindex="-1" permits programmatic focus without adding to tab order -->
<nav id="main-nav" tabindex="-1">...</nav>
```

### Detection in JavaScript
If the shortcut calls `el.focus()` but the HTML for that element has no
`tabindex` attribute, the focus will not land on the element.

---

## Rule 6 — Keyboard Shortcut Must Call preventDefault()

If `e.preventDefault()` is omitted, the browser's own behaviour for Alt+key
combinations (e.g. opening the browser menu on Windows) may fire, disrupting
the user experience.

```javascript
// ❌ Missing preventDefault
if (e.altKey && e.key === 'n') {
  document.querySelector('nav').focus();
}

// ✅ Correct
if (e.altKey && e.key === 'n') {
  e.preventDefault();               // ✅
  document.querySelector('nav').focus();
  announce('Navigation focused');
}
```

---

## Summary: Detection Checklist for Each Shortcut

For every `keydown` handler that checks `e.altKey` (or equivalent modifier):

| Requirement | Check | Pass condition |
|---|---|---|
| Focus target exists | Target element has `tabindex="-1"` or is interactive | Attribute present in HTML |
| Focus is moved | Handler calls `.focus()` on target | `.focus()` call in branch |
| Default prevented | Handler calls `e.preventDefault()` | Call in branch |
| Announcement made | Handler calls `announce(…)` or equivalent | Live region updated in branch |
| Announcement text | Message describes the destination | E.g. "Navigation focused", "Search focused" |

---

## Anti-Patterns to Flag

| Anti-pattern | Problem |
|---|---|
| `scrollIntoView()` with no `.focus()` | Focus stays on shortcut trigger; keyboard user cannot interact with destination |
| `.focus()` with no `announce()` | Screen reader reads raw content of element (e.g. all nav links) instead of a clear destination message |
| `announce()` before `.focus()` | AT may read the live region text and then immediately override it with the focused element content |
| Shortcut handled in `keyup` | May conflict with browser defaults that fire on `keydown` |
| Missing `tabindex="-1"` on `<section>` / `<div>` target | `.focus()` silently fails |

WCAG references: SC 2.1.4 Character Key Shortcuts (Level A), SC 2.4.3 Focus Order (Level A), SC 4.1.3 Status Messages (Level AA).
