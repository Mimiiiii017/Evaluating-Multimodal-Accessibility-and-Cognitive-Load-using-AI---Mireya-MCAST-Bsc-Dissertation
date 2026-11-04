# Cognitive Load: NASA-TLX and Accessibility

## Tags
Tags: #cognitive-load #nasa-tlx #usability #accessibility #wcag #eaa

## Purpose
Explain how accessibility barriers increase cognitive load and how NASA-TLX concepts can be used to reason about usability issues in web interfaces.

## Key points
- Cognitive load is the mental effort required to complete a task.
- Accessibility issues often increase cognitive load, even for non-disabled users.
- NASA-TLX measures workload across six dimensions.
- Poor structure, unclear labels, and unexpected behaviour increase mental demand.
- Reducing accessibility barriers helps lower overall task load and frustration.

### NASA-TLX Dimensions
- **Mental Demand**: How much thinking is required to complete a task.
- **Physical Demand**: The physical effort needed (e.g. excessive clicking or navigation).
- **Temporal Demand**: Time pressure or feeling rushed.
- **Performance**: How successful the user feels they were.
- **Effort**: How hard the user had to work to complete the task.
- **Frustration**: Stress, irritation, or annoyance experienced.

## Developer checks
- Identify tasks that require users to remember information across steps.
- Check for unclear instructions, labels, or error messages.
- Look for unnecessary steps or repeated actions.
- Verify navigation and page structure are predictable.
- Check whether dynamic updates cause confusion or loss of context.

## Fix patterns
- Simplify page layouts and reduce visual clutter.
- Use clear headings and consistent navigation.
- Provide explicit labels, instructions, and feedback.
- Break complex tasks into smaller, manageable steps.
- Avoid unexpected behaviour such as auto-updates or sudden focus changes.

## Examples

### Mapping accessibility issues to NASA-TLX dimensions
| Accessibility Issue | NASA-TLX Dimension | Impact |
|---|---|---|
| Missing labels on form fields | Mental Demand | User must guess what to enter |
| No skip links on a page with long navigation | Physical Demand | Excessive tabbing required |
| Session timeout without warning | Temporal Demand | User feels rushed and loses work |
| Unclear error messages | Performance | User cannot fix errors and feels unsuccessful |
| Complex multi-step process with no progress indicator | Effort | User must track their own progress |
| Unexpected page changes on input | Frustration | User loses context and becomes disoriented |

### Reducing cognitive load through design
```html
<!-- Progress indicator reduces effort and temporal demand -->
<nav aria-label="Progress">
  <ol>
    <li aria-current="step">Step 1: Personal details</li>
    <li>Step 2: Payment</li>
    <li>Step 3: Confirmation</li>
  </ol>
</nav>

<!-- Clear instructions reduce mental demand -->
<label for="dob">Date of birth</label>
<input id="dob" type="text" aria-describedby="dobHelp">
<div id="dobHelp">Format: DD/MM/YYYY</div>

<!-- Consistent navigation reduces frustration -->
<nav aria-label="Main navigation">
  <!-- Same items, same order on every page -->
</nav>
```