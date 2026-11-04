# Tables: Detection Rules for Accessibility Violations

## Tags
Tags: #html #tsx #tables #scope #1.3.1

These are precise detection rules. Check the FIRES condition against the actual code. Do not report if the DOES NOT FIRE condition applies.

---

## Table header missing scope attribute — SC 1.3.1 (F63)

FIRES when: a data table (`<table>`) contains `<th>` elements that have no `scope` attribute AND the table has both row and column headers (complex table). Without `scope`, screen readers cannot determine which data cells the header applies to.

DOES NOT FIRE when:
- `<th scope="col">` or `<th scope="row">` is present
- The table is a simple one-directional table with only column headers in the first row (some screen readers can infer `scope="col"` in this case, but explicit is preferred)
- The element is NOT a data table (e.g. a layout table with `role="presentation"`)

```html
<!-- FIRES: th with no scope in a complex table -->
<table>
  <tr><th></th><th>Q1</th><th>Q2</th></tr>
  <tr><th>Revenue</th><td>100</td><td>200</td></tr>
</table>

<!-- DOES NOT FIRE -->
<table>
  <tr><th scope="col">Name</th><th scope="col">Score</th></tr>
  <tr><td>Alice</td><td>95</td></tr>
</table>
```

---

## Data table with no caption or summary — SC 1.3.1

FIRES when: a data table has no `<caption>` element AND the table is not labelled by `aria-label` or `aria-labelledby`, making its purpose unclear to screen reader users.

DOES NOT FIRE when:
- `<caption>` is present and describes the table
- `aria-label="..."` on the `<table>` element
- The table is a layout table (`role="presentation"`)

---

## Layout table using th elements — best practice

FIRES when: a table used purely for layout (no data relationship between cells) contains `<th>` elements, which incorrectly announce header semantics to screen readers.

DOES NOT FIRE when:
- The table uses `role="presentation"` or `role="none"` (suppresses table semantics)
- The table is a genuine data table with meaningful row/column relationships

---

## Multi-language examples

### TSX (React) — table without scope attributes
```tsx
// ❌ FIRES: complex table, th elements have no scope
function PricingTable() {
  return (
    <table>
      <tbody>
        <tr><th></th><th>Monthly</th><th>Annual</th></tr>
        <tr><th>Basic</th><td>$9</td><td>$90</td></tr>
        <tr><th>Pro</th><td>$29</td><td>$290</td></tr>
      </tbody>
    </table>
  );
}

// ✅ DOES NOT FIRE: scope explicitly set on all th elements
function PricingTable() {
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Plan</th>
          <th scope="col">Monthly</th>
          <th scope="col">Annual</th>
        </tr>
      </thead>
      <tbody>
        <tr><th scope="row">Basic</th><td>$9</td><td>$90</td></tr>
        <tr><th scope="row">Pro</th><td>$29</td><td>$290</td></tr>
      </tbody>
    </table>
  );
}
```
