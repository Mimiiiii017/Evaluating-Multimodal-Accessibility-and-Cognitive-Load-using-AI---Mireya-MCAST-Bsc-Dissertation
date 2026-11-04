# React and TypeScript (TSX) Accessibility Patterns

## Overview

React and TypeScript components (`.tsx` / `.jsx`) have specific accessibility requirements that differ from vanilla HTML. This document describes the most common patterns to check when reviewing React components for accessibility violations.

---

## Form Labels — htmlFor (not `for`)

### Correct pattern

In JSX, the HTML `for` attribute is written as `htmlFor`. A `<label>` element must have a `htmlFor` prop whose value matches the `id` prop of the associated form control.

```tsx
// ✅ Correct — htmlFor matches id
<label htmlFor="email">Email address</label>
<input id="email" type="email" />

// ❌ Broken — htmlFor missing, label not programmatically associated
<label>Email address</label>
<input id="email" type="email" />

// ❌ Broken — htmlFor present but does not match input id
<label htmlFor="user-email">Email address</label>
<input id="email" type="email" />
```

### Detection rule

Any `<label>` element rendered without a `htmlFor` prop (or `aria-labelledby`) is an unlabelled form field violation. Any custom `FormGroup`, `FormField`, or `InputWrapper` component that renders a label and an input must pass `htmlFor` through or use `aria-labelledby`.

---

## aria-invalid on Controlled Form Fields

### What is required

When a form field has a validation error, `aria-invalid="true"` must be set on the form control. In React, this is a JSX prop.

```tsx
// ✅ Correct — aria-invalid changes with validation state
<input
  id="email"
  type="email"
  aria-invalid={hasError ? "true" : "false"}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && <span id="email-error" role="alert">{errorMessage}</span>}

// ❌ Broken — aria-invalid never set, error shown only visually
<input id="email" type="email" className={hasError ? 'error' : ''} />
```

### Detection rule

A component that:
- Has a prop named `error`, `isError`, `hasError`, `isInvalid`, or `errorMessage`, AND
- Renders an `<input>`, `<textarea>`, or `<select>`, AND
- Does NOT pass `aria-invalid` to that element

…is a candidate for this violation. Custom `TextInput`, `Textarea`, or `SelectField` components that receive an error state must propagate `aria-invalid` to the underlying HTML element.

---

## aria-required on Required Fields

Required fields must expose their required state programmatically:

```tsx
// ✅ Correct
<input aria-required="true" required />

// ❌ Broken — only a visual asterisk, no semantic required state
<label>Email <span aria-hidden="true">*</span></label>
<input type="email" />
```

The `required` HTML attribute alone satisfies SC 3.3.2 in most browsers, but `aria-required="true"` is needed for custom components that do not use native `<input required>`.

---

## aria-expanded on Disclosure Buttons (Hamburger Menus, Accordions, Dropdowns)

A button that shows or hides a separate panel, menu, or subsection must have `aria-expanded` reflecting the visibility of the controlled content.

```tsx
// ✅ Correct
const [isOpen, setIsOpen] = useState(false);

<button
  aria-expanded={isOpen ? "true" : "false"}
  aria-controls="nav-menu"
  onClick={() => setIsOpen(!isOpen)}
>
  Menu
</button>
<nav id="nav-menu" hidden={!isOpen}>…</nav>
```

### Detection rule

A component that:
- Has a state variable named `isOpen`, `isExpanded`, `isVisible`, `showMenu`, or similar, AND
- Renders a `<button>` or element with `role="button"` that toggles that state, AND
- Does NOT pass `aria-expanded` to the button

…is a candidate for this violation. Common components: hamburger navigation, accordion trigger, dropdown container, collapsible filter panel.

---

## aria-pressed on Toggle Buttons

Toggle buttons (those that keep a persistent on/off state) need `aria-pressed`. See the dedicated `aria-pressed-and-toggle-buttons.md` document for full details.

Common TSX patterns that need `aria-pressed`:
- Billing period toggles (`<button onClick={() => setPeriod('annual')}>`)
- Filter tab groups where one tab highlights as active
- Play/pause, mute/unmute, bold/italic toolbar buttons
- Like/save/bookmark icon buttons

```tsx
// ✅ Correct — filter tab group
{tabs.map(tab => (
  <button
    key={tab.id}
    aria-pressed={activeTab === tab.id ? "true" : "false"}
    onClick={() => setActiveTab(tab.id)}
  >
    {tab.label}
  </button>
))}
```

---

## Decorative Icons — aria-hidden on SVG Components

Icon components used as pure decoration inside a button or link must be hidden from assistive technologies. In React, this is done via `aria-hidden={true}` or a prop like `aria-hidden="true"`.

```tsx
// ✅ Correct — decorative icon hidden, button has accessible name
<button aria-label="Close">
  <CloseIcon aria-hidden="true" focusable="false" />
</button>

// ✅ Correct — text label provides accessible name, icon is redundant
<button>
  <StarIcon aria-hidden="true" />
  Save favourite
</button>

// ❌ Broken — icon exposed to AT, reads out as "svg" or icon title
<button>
  <CloseIcon />
</button>

// ❌ Broken — icon has a title exposed to AT that conflicts with button label
<button aria-label="Close dialog">
  <svg role="img" aria-label="Delete">…</svg>
</button>
```

### Detection rule

An `<svg>`, `<img>`, or icon component that is:
- Rendered inside a `<button>` or `<a>`, AND
- The button/link already has accessible text (via `aria-label`, `aria-labelledby`, or visible text content), AND
- The icon component does NOT have `aria-hidden="true"` or `aria-hidden={true}`

…is a candidate for this violation. Star rating decorative SVGs, spinner rings/icons during loading states, and clone/copy icon buttons are common examples.

---

## Landmark Labels — Sections and Nav Elements

When a page contains multiple landmarks of the same type, each must have a unique accessible name via `aria-label` or `aria-labelledby`.

```tsx
// ❌ Broken — two nav elements, screen reader cannot distinguish them
<nav>…desktop navigation…</nav>
<nav>…mobile navigation…</nav>

// ✅ Correct
<nav aria-label="Desktop navigation">…</nav>
<nav aria-label="Mobile navigation">…</nav>

// ❌ Broken — generic section without label (not a landmark unless labelled)
<section>
  <h2 id="hero-heading">Welcome</h2>
  …
</section>

// ✅ Correct — aria-labelledby makes it a labelled landmark
<section aria-labelledby="hero-heading">
  <h2 id="hero-heading">Welcome</h2>
  …
</section>
```

### Detection rule

Multiple `<nav>`, `<section>`, or `<aside>` elements without `aria-label` or `aria-labelledby` is a violation when more than one instance of the same element type is rendered on the same page.

Single `<main>`, `<header>`, `<footer>` elements do not need labels (one per page is implicit). Multiple `<nav>` elements always need labels.

---

## aria-current on Navigation

The currently active link in a navigation menu must have `aria-current="page"` (or `aria-current="step"` for a wizard/stepper).

```tsx
// ✅ Correct
{navLinks.map(link => (
  <a
    key={link.href}
    href={link.href}
    aria-current={currentPath === link.href ? "page" : undefined}
  >
    {link.label}
  </a>
))}
```

### Detection rule

A navigation list that uses a CSS class to mark the active link (e.g., `className={isActive ? 'active' : ''}`) without setting `aria-current="page"` is a violation.

---

## aria-live Regions — Must Be in Initial Render

Dynamic status regions (loading indicators, toast notifications, filter results count, form submission feedback) must use `aria-live` to announce changes to screen readers. The region element must be mounted in the initial render, not inserted dynamically when the content appears — screen readers only register live regions that exist at page load.

```tsx
// ❌ Broken — live region inserted dynamically, screen reader may miss announcement
{showSuccess && (
  <p aria-live="polite">Form submitted successfully.</p>
)}

// ✅ Correct — container always rendered, content injected into it
<p aria-live="polite" aria-atomic="true">
  {statusMessage}
</p>
```

### Detection rule

A `<p>`, `<div>`, or `<span>` with `aria-live` inside a conditional `{condition && <...>}` expression is a candidate for this violation. Status updates, search result counts, form feedback, and pagination announcements should use a persistent live region container with dynamic content updates.

---

## Custom Components — Accessible Name Responsibility

Custom components that wrap interactive elements are responsible for passing accessible name props through to the underlying HTML element. A component named `PlanCard`, `ProductCard`, `ArticleCard`, or similar that renders an `<article>`, `<section>`, or `<div role="region">` must expose an accessible label.

```tsx
// ❌ Broken — article has no accessible name; screen reader reads "article" only
<article className="plan-card">
  <h3>Pro Plan</h3>
  …
</article>

// ✅ Correct — aria-labelledby links the article landmark to its heading
<article className="plan-card" aria-labelledby="plan-heading-pro">
  <h3 id="plan-heading-pro">Pro Plan</h3>
  …
</article>
```

### Detection rule

An `<article>`, `<section>`, or element with `role="region"` that lacks `aria-labelledby` or `aria-label` is a violation. ARIA landmark regions must have accessible names when there is more than one landmark of the same type.

---

---

## Card CTA Buttons — Context-aware Labels

In repeated card grids (pricing plans, product cards, team member cards, feature cards), each card's primary call-to-action link or button must have an `aria-label` that includes the name of the item the card represents. Without this, a screen reader user navigating by button announces N identical "Buy now" or "Learn more" labels with no way to distinguish them.

```tsx
// ❌ Broken — three cards, three identical CTA labels
<article aria-labelledby="plan-heading-starter">
  <h3 id="plan-heading-starter">Starter</h3>
  <button>Buy now</button>      {/* announced: "Buy now" */}
</article>
<article aria-labelledby="plan-heading-pro">
  <h3 id="plan-heading-pro">Pro</h3>
  <button>Buy now</button>      {/* announced: "Buy now" */}
</article>
<article aria-labelledby="plan-heading-enterprise">
  <h3 id="plan-heading-enterprise">Enterprise</h3>
  <button>Buy now</button>      {/* announced: "Buy now" */}
</article>

// ✅ Correct — aria-label provides item-specific context
<article aria-labelledby="plan-heading-starter">
  <h3 id="plan-heading-starter">Starter</h3>
  <button aria-label="Buy Starter plan">Buy now</button>
</article>
<article aria-labelledby="plan-heading-pro">
  <h3 id="plan-heading-pro">Pro</h3>
  <button aria-label="Buy Pro plan">Buy now</button>
</article>
```

### Detection rule

In any repeated card component where the card body contains a heading or title and a CTA button or link:
- If multiple cards share the same visible button/link text (e.g. "Buy now", "Learn more", "View details", "Read more", "Get started") and the button has no `aria-label` that includes the item-specific name → violation.
- The `aria-label` on the button must include the item name from the card heading (e.g. `aria-label="Buy Starter plan"` not just `aria-label="Buy now"`).

---

## WCAG References

- SC 1.1.1 Non-text Content — decorative images and icons must be hidden (`aria-hidden`)
- SC 1.3.1 Info and Relationships — programmatic label associations (`htmlFor`, `aria-labelledby`)
- SC 4.1.2 Name, Role, Value — custom widgets must expose name, role, and state
- SC 1.4.13 Content on Hover or Focus — dynamic content accessibility
- SC 2.4.6 Headings and Labels — labels must describe purpose
- ARIA 1.2 Authoring Practices Guide — Toggle Button, Disclosure, Navigation Landmark patterns
