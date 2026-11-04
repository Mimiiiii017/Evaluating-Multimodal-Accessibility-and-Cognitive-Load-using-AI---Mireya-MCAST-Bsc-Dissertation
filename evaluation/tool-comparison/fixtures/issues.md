# Benchmark Fixture — Accessibility Issues Reference

All four fixtures contain **30 labelled accessibility issues** distributed throughout the full file length.

---

## `study-6-html-medium.html`

| # | Line | Issue |
|---|------|-------|
| 1 | 20 | Non-descriptive link text ("click here") |
| 2 | 22 | Empty `aria-label` overrides visible text |
| 3 | 28 | Duplicate landmark — second `role="banner"` inside `<header>` |
| 4 | 29 | `<img>` missing `alt` attribute entirely |
| 5 | 46 | Decorative/meaningful image with empty `alt` — loses context |
| 6 | 54 | Heading level skip — `<h4>` after `<h2>` with no `<h3>` |
| 7 | 65 | `<img>` missing `alt` attribute entirely |
| 8 | 80 | `<form>` has no accessible name (no `aria-label` / `aria-labelledby` / `<legend>`) |
| 9 | 81 | `input[type="email"]` has no associated `<label>` |
| 10 | 82 | `input[type="text"]` has no associated `<label>` |
| 11 | 83 | `input[type="tel"]` has no associated `<label>` |
| 12 | 84 | `<select>` has no associated `<label>` |
| 13 | 88 | `<textarea>` has no associated `<label>` |
| 14 | 97 | `<table>` (pricing) has no `<caption>` or `aria-label` |
| 15 | 100 | Table header row uses `<td>` instead of `<th>` for "Plan" column |
| 16 | 123 | `<img>` (gallery 1) missing `alt` attribute entirely |
| 17 | 124 | Image with empty `alt` in non-decorative context |
| 18 | 125 | Alt text too vague ("image" is non-descriptive) |
| 19 | 126 | `role="img"` on `<div>` with no accessible name |
| 20 | 331 | Non-descriptive link text "Get Started" (Starter plan card) |
| 21 | 345 | Non-descriptive link text "Get Started" (Pro plan card) |
| 22 | 359 | Non-descriptive link text "Get Started" (Enterprise plan card) |
| 23 | 369 | `<code>` block has no language identifier (no `class="language-*"`) |
| 24 | 405 | `<article>` `aria-label` is bare version number ("3.4.0") — not meaningful |
| 25 | 446 | Integration card (`id="github-integration"`) has no actionable link or button |
| 26 | 473 | Link text is raw email address (not descriptive) |
| 27 | 497 | `<ul>` for job listings has no `aria-label` — indistinguishable from other lists |
| 28 | 511 | Publication date is plain text — should be in `<time datetime="">` element |
| 29 | 526 | External link (Discord) opens without "(opens in new tab)" warning |
| 30 | 560 | Cookie banner uses `role="region"` — should use `role="dialog"` or `role="alertdialog"` |

---

## `study-6-css-medium.css`

| # | Line | Issue |
|---|------|-------|
| 1 | 20 | `*:focus` applies a global `:focus` style to every element; should usually be `:focus-visible` (WCAG 2.4.7) |
| 2 | 29 | `.caption` uses `font-size: 10px`, which is too small (WCAG 1.4.4) |
| 3 | 35 | `.muted` uses `color: #999`, which is too low-contrast on white (WCAG 1.4.3) |
| 4 | 74 | `header nav a:focus` uses `:focus` and a colour shift — colour alone is insufficient for focus indication (WCAG 1.4.1, 2.4.7) |
| 5 | 144 | `#cta-btn:focus` uses `:focus` rather than `:focus-visible` (WCAG 2.4.7) |
| 6 | 224 | `input:focus, select:focus, textarea:focus` uses `:focus` rather than `:focus-visible` (WCAG 2.4.7) |
| 7 | 260 | `button[type="submit"]:focus` uses a 1 px outline, which is too weak (WCAG 2.4.11) |
| 8 | 317 | `.gallery-grid img:focus` uses `:focus` rather than `:focus-visible` (WCAG 2.4.7) |
| 9 | 342 | `section a:focus` uses `:focus` rather than `:focus-visible` (WCAG 2.4.7) |
| 10 | 396 | `table { font-size: 12px; }` at the 480 px breakpoint is too small (WCAG 1.4.4) |
| 11 | 406 | `@media (prefers-reduced-motion: no-preference)` is backwards — disables motion for users who want it reduced (WCAG 2.3.3) |
| 12 | 577 | `html { scroll-behavior: smooth; }` has no `prefers-reduced-motion: reduce` override (WCAG 2.3.3) |
| 13 | 595 | `.mega-menu` uses `display: none` without real `aria-hidden` / `aria-expanded` state management (WCAG 4.1.2) |
| 14 | 597 | `aria-hidden: true;` is invalid CSS and should not be in the stylesheet |
| 15 | 606 | `.form-control:focus` uses `:focus` — focus styles applied unconditionally rather than only for keyboard navigation (WCAG 2.4.7) |
| 16 | 643 | `.tab-list::-webkit-scrollbar-thumb` background `#999` on `#f5f5f5` is insufficient contrast (~2.4:1) (WCAG 1.4.3) |
| 17 | 646 | `.sm-hidden { display: none !important; }` hides content visually with no synced accessibility state (WCAG 1.3.2) |
| 18 | 945 | `user-select: none` on the FAQ summary blocks text selection for cognitive and motor-impaired users (WCAG 1.3.3) |
| 19 | 1047 | `.newsletter-form input:focus-visible` outline `#a5b4fc` on white is too low-contrast (~1.95:1) (WCAG 1.4.3) |
| 20 | 1182 | `.btn-cta:focus-visible` uses `outline: 2px solid #4f46e5` on a dark blue background (~2.01:1) (WCAG 1.4.3) |
| 21 | 1458 | `.footer-bottom` border-top `#1f2937` on `#030712` has insufficient contrast (~1.7:1) (WCAG 1.4.3) |
| 22 | 1600 | `.cursor-not-allowed` implies a disabled state visually only — no `aria-disabled` communicated to AT (WCAG 4.1.2) |
| 23 | 1613 | `.invisible { visibility: hidden; }` can desync the visual state and the accessibility state (WCAG 1.3.1) |
| 24 | 1621 | `.select-none { user-select: none; }` blocks text selection (WCAG 1.3.3) |
| 25 | 1749 | `.avatar-xs` is 24×24 with `font-size: 10px`, below accessible target and readability expectations (WCAG 2.5.5, 1.4.4) |
| 26 | 1851 | `.search-clear` is shown/hidden only through CSS, with no focus or state management (WCAG 2.1.1) |
| 27 | 1866 | `.combobox-option` uses `cursor: pointer` as the primary visual affordance — no keyboard visual cue (WCAG 1.3.3) |
| 28 | 1914 | `.focus-trap-sentinel` uses `opacity: 0`, which does not remove it from assistive technology (WCAG 4.1.2) |
| 29 | 1918 | `.print-only { display: none; }` hides content from assistive technology until print mode (WCAG 1.3.1) |
| 30 | 2375 | `.modal-secondary-link` colour `#4f46e5` on white is just below WCAG AA 4.5:1 (~4.47:1) (WCAG 1.4.3) |

---

## `study-6-js-medium.js`

| # | Line | Issue |
|---|------|-------|
| 1 | 12 | Announcement element cleared after only 1000 ms — too short for screen readers to finish reading |
| 2 | 18 | `menuButton` `aria-expanded` is reset to `false` on init but never updated on click — AT always sees "closed" (WCAG 4.1.2) |
| 3 | 36 | `loadMore` sets `disabled` + `textContent` but no `aria-busy` on the container — AT gets no loading-state announcement (WCAG 4.1.3) |
| 4 | 47 | `cartCounter` `textContent` updated directly — no `aria-live` region announces the cart count change to AT (WCAG 4.1.3) |
| 5 | 58 | Cookie banner dismissal is never announced — `hide()` runs silently with no live-region update (WCAG 4.1.3) |
| 6 | 77 | `openModal()` does not set `role="dialog"` or `aria-modal="true"` on the modal element (WCAG 4.1.2) |
| 7 | 92 | `modal.style.display='block'` opens the dialog without moving focus into it (WCAG 2.1.2) |
| 8 | 98 | `modal.style.display='none'` closes the dialog without restoring focus — `prevFocus` never assigned (WCAG 2.1.2) |
| 9 | 132 | Carousel sets `aria-hidden="false"` on the active slide — invalid value; `removeAttribute` must be used (WCAG 4.1.3) |
| 10 | 149 | Carousel container has no `tabindex="0"` — `keydown` listeners on it can never fire for keyboard users (WCAG 2.1.1) |
| 11 | 197 | Error `<span>` is given an `id` but `aria-describedby` is never set on the `<input>` (WCAG 1.3.1) |
| 12 | 219 | Form error branch has no announcement and no focus move — intentionally suppressed (WCAG 4.1.3) |
| 13 | 226 | `delegate()` wires only the named event — no keyboard equivalent added for non-native elements (WCAG 2.1.1) |
| 14 | 310 | `patch('REMOVE')` moves focus to prev/next/parent without checking `tabIndex >= 0` — focus may land on non-focusable element (WCAG 2.1.1) |
| 15 | 482 | `CosmosConfig.accessibility.reducedMotion` is read but modules do not check it consistently before animating (WCAG 2.3.3) |
| 16 | 893 | Offscreen live-region `sr-only` styling is brittle — may be clipped or removed by layout changes (WCAG 4.1.3) |
| 17 | 900 | `CosmosAnnouncer.announce()` creates a fresh live region on every call — AT may not announce from freshly-inserted regions; `getEl()` is unused (WCAG 4.1.3) |
| 18 | 906 | Announcement helper timing/state is not stable enough for reliable live-region output (WCAG 4.1.3) |
| 19 | 1099 | `updateBreadcrumbs()` updates `innerHTML` without calling `CosmosAnnouncer` — navigation context change not announced (WCAG 4.1.3) |
| 20 | 1153 | Search box focus is announced only via the `/` shortcut — direct tab/click focus receives no announcement (WCAG 4.1.3) |
| 21 | 1213 | `renderReadingTime()` stores word count in a `title` attribute — inaccessible to keyboard and touch users (WCAG 1.3.1) |
| 22 | 1438 | Article card `<img>` elements rendered via template literals have no `alt` attribute (WCAG 1.1.1) |
| 23 | 1793 | Search suggestion list updates `aria-expanded` but does not announce suggestion count to AT (WCAG 4.1.3) |
| 24 | 1855 | `CosmosSolarViz` is mouse-only — no `tabindex`, no keyboard handler, canvas `aria-hidden="true"`, `setupAccessibleList()` never called (WCAG 1.1.1, 2.1.1) |
| 25 | 2697 | `CosmosHistory` renders and updates history UI without announcing state changes to AT (WCAG 4.1.3) |
| 26 | 2793 | `CosmosGallery` lightbox opens without moving focus into it or trapping it (WCAG 2.1.2) |
| 27 | 2970 | `CosmosAnimations` applies scroll/intersection animations without checking `prefers-reduced-motion` (WCAG 2.3.3) |
| 28 | 3250 | Reply toggle buttons set `aria-expanded` but are missing `aria-controls` to associate with the reply form (WCAG 4.1.2) |
| 29 | 3341 | Newsletter `showState('error')` sets `aria-describedby` on the input but omits `aria-invalid="true"` (WCAG 1.3.1) |
| 30 | 3349 | Newsletter success/info path does not remove or reset `aria-invalid` previously set on the input (WCAG 1.3.1) |

---

## `study-6-tsx-medium.tsx`

| # | Line | Issue |
|---|------|-------|
| 1 | 12 | `<div>` used instead of `<button>` — no `role`, no `tabIndex`, no `onKeyDown`; invisible to keyboard navigation (WCAG 2.1.1) |
| 2 | 12 | `onClick` on `<div>` with no accessible name — element lacks `aria-label` (WCAG 4.1.2) |
| 3 | 25 | Menu trigger has no `aria-expanded` or `aria-haspopup` — popup state not communicated to AT (WCAG 4.1.2) |
| 4 | 30 | Array index used as React `key` — can cause AT to misidentify re-ordered items |
| 5 | 32 | Icon `<span>` has no `aria-hidden` or `aria-label` — may be announced as a symbol by AT (WCAG 1.1.1) |
| 6 | 38 | Empty `<div>` where `aria-live` region should be — no announcement when menu opens/closes (WCAG 4.1.3) |
| 7 | 56 | Tab `<button>` has `role="tab"` and `aria-selected` but missing `aria-controls` — not linked to its panel (WCAG 4.1.2) |
| 8 | 62 | Tab `onClick` with no `ArrowLeft`/`ArrowRight` keyboard handler — violates the ARIA TabList keyboard pattern (WCAG 2.1.1) |
| 9 | 74 | `aria-labelledby` ID does not match the actual button ID |
| 10 | 75 | `display:none` hides panel content from all users including AT |
| 11 | 608 | Badge dot `<span>` rendered without `aria-hidden="true"` — decorative indicator may be read by AT (WCAG 1.1.1) |
| 12 | 777 | Accordion `<button>` has `aria-expanded` but missing `aria-controls` — not linked to its disclosure panel (WCAG 4.1.2) |
| 13 | 979 | DataTable sort header `handleSort()` result not announced via `aria-live` — sort direction change invisible to AT (WCAG 4.1.3) |
| 14 | 1093 | Toast type icon `<span>` renders an emoji without `aria-hidden="true"` — symbol may be read aloud by AT (WCAG 1.1.1) |
| 15 | 1111 | Toast dismiss button `aria-label="Close"` is generic — does not identify which notification it closes (WCAG 2.4.6) |
| 16 | 1195 | Combobox `<input role="combobox">` missing `aria-required` when field is required (WCAG 1.3.1) |
| 17 | 1221 | Combobox no-results `<li>` inside `role="listbox"` with no `aria-live` — empty-list state not announced to AT (WCAG 4.1.3) |
| 18 | 1278 | Progress `role="progressbar"` with `aria-valuenow` but no explicit `aria-live` region — value changes may not be proactively announced to AT (WCAG 4.1.3) |
| 19 | 1278 | Progress `role="progressbar"` has no `aria-live` region — value changes not proactively announced to AT (WCAG 4.1.3) |
| 20 | 1341 | Stepper renders `aria-current="step"` but has no `aria-live` region — step activation not announced to AT (WCAG 4.1.3) |
| 21 | 1449 | DatePicker trigger `onKeyDown` handles only `Enter`/`Space`; no `Escape` handler to close the calendar (WCAG 2.1.1) |
| 22 | 1450 | DatePicker trigger has `aria-haspopup="dialog"` but missing `aria-expanded` — open/closed state not communicated (WCAG 4.1.2) |
| 23 | 1459 | DatePicker calendar declares `aria-modal="true"` but has no focus trap — focus can escape (WCAG 2.1.2) |
| 24 | 1454 | DatePicker calendar has no backdrop or click-outside handler — clicking outside will not close it (WCAG 2.1.1) |
| 25 | 1603 | Rating star `onMouseEnter` updates visual hover state without `aria-live` announcement — AT users unaware of the currently hovered star rating (WCAG 4.1.3) |
| 26 | 1603 | Rating star `onMouseEnter` updates visual hover state with no `aria-live` announcement — AT unaware of hovered star (WCAG 4.1.3) |
| 27 | 1679 | FileUpload drop-zone `aria-describedby` conditionally omits the error ID until an error occurs — not persistently linked (WCAG 1.3.1) |
| 28 | 1697 | FileUpload `<input type="file">` `aria-describedby` same conditional issue — validation message not persistently linked (WCAG 1.3.1) |
| 29 | 1772 | ColorPicker hex `<input>` has a `pattern` attribute but no `aria-invalid` when value is invalid (WCAG 1.3.1) |
| 30 | 1808 | Skeleton animation runs regardless of `prefers-reduced-motion` user preference (WCAG 2.3.3) |
