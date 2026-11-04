# Structure: Landmarks and Page Regions

## Tags
Tags: #structure #landmarks #page-regions #aria #wcag #eaa

## Purpose
Explain how to structure a web page using semantic HTML and ARIA landmark roles so users of assistive technologies can understand and navigate the page layout efficiently.

## Key points
- A web page must be structured using clear, semantic regions.
- Landmark roles help screen reader users quickly move between major sections.
- Each landmark role has a specific purpose and usage constraint.
- Some landmark roles must only appear once per page.
- Native HTML elements should be preferred, with ARIA roles used to reinforce or clarify structure when needed.

## Developer checks
- Check that the page has exactly one main content area.
- Verify that header, navigation, main content, and footer are clearly defined.
- Ensure landmark roles are not duplicated where only one is allowed.
- Confirm that navigation landmarks are only used for internal navigation.
- Check that nested landmarks are used logically and sparingly.

## Fix patterns
- Replace generic `<div>` containers with semantic elements such as `<header>`, `<nav>`, `<main>`, and `<footer>`.
- Add appropriate ARIA roles when required to clarify structure.
- Remove duplicate landmark roles that should only appear once.
- Add `aria-label` to navigation landmarks to describe their purpose.
- Ensure the main content is not hidden or duplicated.

## Examples
```html
<header role="banner">
  <img src="logo.png" alt="Website name (logo)">
  <div role="search">
    <form>
      <input type="search" title="Keyword search">
      <input type="submit" value="Search">
    </form>
  </div>
</header>

<nav role="navigation" aria-label="Primary menu">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main role="main">
  <h1>Main page content</h1>
  <p>Page-specific information goes here.</p>
</main>

<footer role="contentinfo">
  <ul>
    <li><a href="/sitemap">Sitemap</a></li>
    <li><a href="/terms">Terms and Conditions</a></li>
  </ul>
  <p>© Company name</p>
</footer>
```
