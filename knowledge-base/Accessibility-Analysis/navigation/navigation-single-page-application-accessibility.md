# Navigation: Single-Page Application Accessibility

## Tags
Tags: #navigation #spa #single-page-application #routing #focus-management #wcag #eaa

## Purpose
Ensure single-page applications (SPAs) built with frameworks like React, Vue, Angular, or Svelte provide an accessible navigation experience equivalent to traditional multi-page websites.

## Key points
- SPAs do not trigger full page reloads, so screen readers are not automatically informed of route changes.
- The document title must be updated on every route change.
- Focus must be managed after navigation — users should know that new content has loaded.
- Screen reader users may not notice a route change unless it is explicitly announced.
- Browser back/forward navigation must work correctly.
- Loading states and client-side errors must be communicated to assistive technologies.

## Developer checks
- Navigate between routes using a screen reader and confirm each transition is announced.
- Verify `document.title` updates on every route change.
- Check that focus moves to a meaningful element after navigation (heading, main content, or page title).
- Test browser back/forward buttons for correct behaviour.
- Confirm loading indicators are announced to screen readers.
- Verify error pages (404, network errors) are accessible.
- Check that the URL updates on route change (for bookmarking and sharing).

## Fix patterns
- Update `document.title` on every route change.
- Move focus to the main heading (`<h1>`) or main content area after navigation.
- Use an ARIA live region to announce route changes (e.g., "Page loaded: Contact Us").
- Ensure the `<main>` element updates with new content.
- Handle loading states with `aria-busy="true"` and `aria-live="polite"`.
- Announce client-side errors using `role="alert"`.
- Use the History API correctly so browser navigation works.

## Examples
```js
// React: update title and manage focus on route change
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function useAccessibleRouting(pageTitle) {
  const location = useLocation();
  const headingRef = useRef(null);

  useEffect(() => {
    // Update document title
    document.title = `${pageTitle} – My App`;

    // Move focus to main heading
    if (headingRef.current) {
      headingRef.current.focus();
    }

    // Announce to screen readers
    const announcement = document.getElementById('route-announcer');
    if (announcement) {
      announcement.textContent = `Navigated to ${pageTitle}`;
    }
  }, [location, pageTitle]);

  return headingRef;
}
```

```html
<!-- Route announcer live region (always in the DOM) -->
<div id="route-announcer" 
     role="status" 
     aria-live="polite" 
     aria-atomic="true" 
     class="sr-only">
</div>

<!-- Main content with focusable heading -->
<main>
  <h1 tabindex="-1" ref={headingRef}>Contact Us</h1>
  <p>Get in touch with our team...</p>
</main>
```

```js
// Vue: accessible route navigation
router.afterEach((to) => {
  // Update title
  document.title = `${to.meta.title || 'Page'} – My App`;

  // Focus management
  nextTick(() => {
    const heading = document.querySelector('h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  });
});
```

```html
<!-- Loading state during route transition -->
<div aria-live="polite" aria-busy="true">
  Loading page…
</div>

<!-- Error state -->
<div role="alert">
  <h1>Page not found</h1>
  <p>The page you requested could not be found. <a href="/">Return to homepage</a>.</p>
</div>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```
