# Structure: Meaningful Sequence and Reading Order

## Tags
Tags: #structure #reading-order #meaningful-sequence #wcag #1.3.2

## Purpose
Ensure the reading and navigation order of content is logical and meaningful, so users of assistive technologies experience information in the same meaningful sequence as sighted users.

## Key points
- The DOM order must reflect the intended reading order of the content.
- CSS layout techniques (flexbox, grid, float, position) can visually reorder content without changing the DOM, causing mismatches.
- Screen readers follow the DOM order, not the visual order.
- Tab order for interactive elements follows the DOM order by default.
- Content that is visually rearranged but semantically disordered creates confusion for keyboard and screen reader users.
- Meaningful sequence applies to all content, not just interactive elements.

## Developer checks
- Compare the visual layout to the DOM order and ensure they match logically.
- Check for CSS properties that reorder content visually (`order`, `flex-direction: row-reverse`, `grid-row`, `float`, `position: absolute`).
- Navigate the page using only a screen reader and confirm the reading order makes sense.
- Tab through interactive elements and verify focus follows a logical path.
- Check that content injected dynamically appears in the correct position in the DOM.

## Fix patterns
- Restructure the HTML so the DOM order matches the intended reading order.
- Avoid using CSS `order` property to rearrange content that must be read sequentially.
- Place important content earlier in the DOM when it should be encountered first.
- Use CSS for visual styling without altering the logical sequence of information.
- Test reading order with screen readers after any layout changes.

## Examples
```html
<!-- Incorrect: CSS reorders visually but DOM order is wrong -->
<div style="display: flex;">
  <div style="order: 2;">Step 2: Confirm your details</div>
  <div style="order: 1;">Step 1: Enter your email</div>
  <div style="order: 3;">Step 3: Submit</div>
</div>

<!-- Correct: DOM order matches visual and logical order -->
<div style="display: flex;">
  <div>Step 1: Enter your email</div>
  <div>Step 2: Confirm your details</div>
  <div>Step 3: Submit</div>
</div>
```
