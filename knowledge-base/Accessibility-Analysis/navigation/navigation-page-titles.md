# Navigation: Page Titles

## Tags
Tags: #navigation #page-titles #wcag #2.4.2

## Purpose
Ensure every web page has a descriptive, unique title that helps users identify the page's purpose, especially when using screen readers, browser tabs, or bookmarks.

## Key points
- Every page must have a `<title>` element in the `<head>` that describes its topic or purpose.
- Page titles must be unique across the site so users can distinguish between pages.
- Titles should be concise but descriptive, using a pattern like "Page Name – Site Name."
- Screen reader users hear the page title first when a page loads.
- Page titles are displayed in browser tabs, bookmarks, and search engine results.
- Single-page applications must update the document title on route changes.

## Developer checks
- Confirm every page has a non-empty `<title>` element.
- Check that titles are descriptive and indicate the page content.
- Verify titles are unique across the site.
- Test that the title updates on navigation in single-page applications.
- Confirm the title does not contain only the site name without page-specific context.

## Fix patterns
- Add a `<title>` element to every page if missing.
- Use a pattern like "Page Name – Site Name" or "Site Name | Page Name."
- Update `document.title` dynamically in single-page applications on route change.
- Include the most specific information first in the title (e.g., "Contact Us – Acme Corp" rather than "Acme Corp – Contact Us").
- Include relevant state information in titles where useful (e.g., "Search Results (42) – Acme Corp").

## Examples
```html
<!-- Correct: descriptive page title -->
<head>
  <title>Contact Us – Acme Corporation</title>
</head>

<!-- Incorrect: non-descriptive title -->
<head>
  <title>Page</title>
</head>

<!-- Incorrect: same title on every page -->
<head>
  <title>Acme Corporation</title>
</head>
```

```js
// SPA: update title on route change
function onRouteChange(routeName) {
  const titles = {
    home: 'Home – Acme Corporation',
    about: 'About Us – Acme Corporation',
    contact: 'Contact Us – Acme Corporation',
  };
  document.title = titles[routeName] || 'Acme Corporation';
}
```
