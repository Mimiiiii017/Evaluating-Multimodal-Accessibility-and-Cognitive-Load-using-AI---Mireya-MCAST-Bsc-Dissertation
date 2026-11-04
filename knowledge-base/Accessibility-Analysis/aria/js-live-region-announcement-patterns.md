# JavaScript Live Region Announcement Patterns — Detection Rules

## Tags
Tags: #aria #live-regions #javascript #announcements #screen-readers #dynamic-content #wcag #2.4.3 #4.1.3

## Purpose
JavaScript-driven UI actions — opening menus, submitting forms, filtering lists,
scrolling to content, toggling views, running keyboard shortcuts — must announce
their outcome to screen reader users. This document provides systematic detection
rules for identifying missing live region announcements in vanilla JavaScript files.

---

## The Core Pattern: announceToScreenReader()

Every accessible JavaScript codebase should contain a utility function that
injects a message into a visually-hidden live region. Without this utility, none
of the application's dynamic interactions can communicate outcomes to screen
readers.

### Required utility (or equivalent inline implementation)

```javascript
// Polite: use for non-urgent updates (search results, filter counts, view changes)
function announce(message, politeness = 'polite') {
  const el = document.getElementById('sr-announcer');
  el.setAttribute('aria-live', politeness);
  el.textContent = '';                      // Clear first to re-trigger announcement
  requestAnimationFrame(() => { el.textContent = message; });
}

// Assertive: use only for errors or urgent destructive actions
function announceAssertive(message) {
  announce(message, 'assertive');
}
```

### Required HTML (must exist once in page, outside any hidden container)
```html
<div id="sr-announcer" aria-live="polite" aria-atomic="true"
     class="sr-only" aria-relevant="additions"></div>
```

### How to detect the absence

1. Search for `aria-live` in the codebase. If no element with `aria-live` is
   present in the HTML and no JS creates one, all announcements are missing.
2. Search for functions named `announce`, `announceToScreenReader`, `liveAnnounce`,
   `screenReaderAnnounce`, or equivalent. If none exist, every interactive action
   is silent for screen reader users.

---

## Rule 1 — Navigation Open / Close Must Be Announced

### What is required
When a mobile navigation panel opens or closes, screen reader users must be told.

### Violation patterns

```javascript
// ❌ Opens nav panel but says nothing to screen reader
open() {
  this._panel.classList.remove('hidden');
  this._panel.removeAttribute('aria-hidden');
  this._trigger.setAttribute('aria-expanded', 'true');
  // ❌ Missing: announce('Navigation opened');
}

// ❌ Closes nav panel but says nothing
close() {
  this._panel.classList.add('hidden');
  this._panel.setAttribute('aria-hidden', 'true');
  this._trigger.setAttribute('aria-expanded', 'false');
  // ❌ Missing: announce('Navigation closed');
}
```

### Correct pattern

```javascript
open() {
  this._panel.classList.remove('hidden');
  this._trigger.setAttribute('aria-expanded', 'true');
  announce('Navigation opened');
}

close() {
  this._panel.classList.add('hidden');
  this._trigger.setAttribute('aria-expanded', 'false');
  announce('Navigation closed');
}
```

---

## Rule 2 — Search Operations Must Announce Results

### Violation patterns

```javascript
// ❌ Highlights matches but does not announce count
highlight(query) {
  this._matches = this._items.filter(/*...*/);
  this._renderHighlights();
  // ❌ Missing: announce(`${this._matches.length} results highlighted for ${query}`);
}

// ❌ Form submit fires but says nothing
_onFormSubmit(e) {
  e.preventDefault();
  this._performSearch(this._input.value);
  // ❌ Missing: announce(`Searching for ${this._input.value}`);
}

// ❌ Clear button clears input but says nothing
clear() {
  this._input.value = '';
  this._clearResults();
  // ❌ Missing: announce('Search cleared');
}
```

### Correct pattern

```javascript
highlight(query) {
  this._matches = this._items.filter(/*...*/);
  this._renderHighlights();
  announce(`${this._matches.length} result${this._matches.length !== 1 ? 's' : ''} highlighted for "${query}"`);
}

_onFormSubmit(e) {
  e.preventDefault();
  announce(`Searching for ${this._input.value}`);
  this._performSearch(this._input.value);
}

clear() {
  this._input.value = '';
  this._clearResults();
  announce('Search cleared');
}
```

---

## Rule 3 — Filter Operations Must Announce Result Counts

### Why this matters
When a user applies a filter (category, price range, view mode), the visible
content changes but screen readers receive no feedback unless explicitly announced.

### Violation patterns

```javascript
// ❌ Filters products but does not tell screen reader how many remain
_applyFilter(category) {
  this._filtered = this._products.filter(p => p.category === category);
  this._render();
  // ❌ Missing: announce(`${this._filtered.length} products shown`);
}

// ❌ Reset clears filters silently
resetFilters() {
  this._activeFilter = null;
  this._render();
  // ❌ Missing: announce('Filters reset');
}

// ❌ View mode switch (grid/list) not announced
_setViewMode(mode) {
  this._mode = mode;
  this._syncModeButtons();
  this._render();
  // ❌ Missing: announce(`${mode} view`);
}
```

### Correct pattern

```javascript
_applyFilter(category) {
  this._filtered = this._products.filter(p => p.category === category);
  this._render();
  announce(`${this._filtered.length} product${this._filtered.length !== 1 ? 's' : ''} shown`);
}

resetFilters() {
  this._activeFilter = null;
  this._render();
  announce('Filters reset');
}

_setViewMode(mode) {
  this._mode = mode;
  this._syncModeButtons();
  this._render();
  announce(`${mode} view`);
}
```

---

## Rule 4 — Accordion / FAQ Open and Close Must Be Announced

### Violation patterns

```javascript
// ❌ Opens FAQ item but does not tell screen reader
open(item) {
  item.panel.removeAttribute('hidden');
  item.trigger.setAttribute('aria-expanded', 'true');
  // ❌ Missing: announce(`${item.trigger.textContent} expanded`);
}

// ❌ openAll / closeAll do not announce bulk state change
openAll() {
  this._items.forEach(item => this.open(item));
  // ❌ Missing: announce('All answers expanded');
}

closeAll() {
  this._items.forEach(item => this.close(item));
  // ❌ Missing: announce('All answers collapsed');
}
```

---

## Rule 5 — Scroll-to Actions Must Announce Target

### Violation patterns

```javascript
// ❌ Scrolls to element but user receives no feedback
scrollToPlan(planId) {
  const el = document.getElementById(planId);
  el.scrollIntoView({ behavior: 'smooth' });
  // ❌ Missing: announce(`Viewing ${el.querySelector('h3').textContent} plan`);
}

scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // ❌ Missing: announce('Scrolled to top of page');
}
```

---

## Rule 6 — Billing / Toggle Period Changes Must Be Announced

### Violation patterns

```javascript
// ❌ Switches billing period but does not announce
_setBillingPeriod(period) {
  this._period = period;
  this._syncToggleState();
  this._updatePrices();
  // ❌ Missing: announce(`${period} billing selected`);
}
```

---

## Rule 7 — Comparison Table Expansion Must Be Announced

### Violation patterns

```javascript
// ❌ Expands hidden comparison rows but says nothing
expandComparison() {
  document.querySelectorAll('.comparison-row--hidden').forEach(row => {
    row.classList.remove('comparison-row--hidden');
  });
  this._expanded = true;
  // ❌ Missing: announce('Comparison table expanded');
}
```

---

## Summary Checklist

For every JavaScript action that modifies visible content, verify:

| Action type | Required announcement |
|---|---|
| Navigation open | `"Navigation opened"` |
| Navigation close | `"Navigation closed"` |
| Search submit | `"Searching for [query]"` |
| Search results shown | `"[N] results for [query]"` |
| Search cleared | `"Search cleared"` |
| Filter applied | `"[N] products shown"` |
| Filter reset | `"Filters reset"` |
| View mode change | `"[mode] view"` |
| Accordion item open | `"[item title] expanded"` |
| Accordion item close | `"[item title] collapsed"` |
| Open all accordion | `"All answers expanded"` |
| Close all accordion | `"All answers collapsed"` |
| Scroll to section | `"Viewing [section name]"` |
| Scroll to top | `"Scrolled to top of page"` |
| Billing period change | `"[period] billing selected"` |
| Comparison table expand | `"Comparison table expanded"` |

WCAG references: SC 4.1.3 Status Messages (Level AA), SC 1.3.1 Info and Relationships.
