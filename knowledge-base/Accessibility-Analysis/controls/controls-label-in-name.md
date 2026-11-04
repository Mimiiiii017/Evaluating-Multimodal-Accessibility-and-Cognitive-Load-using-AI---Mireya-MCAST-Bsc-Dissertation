# Controls: Label in Name

## Tags
Tags: #controls #label-in-name #accessible-name #speech-input #wcag #2.5.3

## Purpose
Ensure the accessible name of interactive components contains the text that is visually presented, so users of speech input software can activate controls by speaking their visible label.

## Key points
- If a component has a visible text label, the accessible name must contain that visible text.
- Speech input users activate controls by saying their visible text (e.g., "click Submit").
- If the accessible name does not match the visible label, speech commands will fail.
- The visible text should ideally appear at the start of the accessible name.
- This applies to buttons, links, inputs, and any labeled interactive element.
- Mismatches commonly arise from `aria-label` overriding visible text.

## Developer checks
- Compare the visible text of each interactive element to its computed accessible name.
- Check for `aria-label` values that do not include the visible text.
- Verify `aria-labelledby` references include the visible label element.
- Test by using speech input software (or simulating it) to activate controls by their visible text.
- Review icon buttons where `aria-label` may not match any visible tooltip text.

## Fix patterns
- Ensure `aria-label` values include the visible text of the element.
- Prefer using `aria-labelledby` referencing the visible text element over a separate `aria-label`.
- If additional context is needed, append it after the visible text (e.g., visible: "Submit" → aria-label: "Submit application form").
- Remove unnecessary `aria-label` overrides when the visible text is already sufficient.
- Keep visible labels and accessible names synchronised during updates.

## Examples
```html
<!-- Incorrect: aria-label does not contain visible text -->
<button aria-label="Send your application now">
  Submit
</button>
<!-- Speech user says "click Submit" → fails because accessible name is "Send your application now" -->

<!-- Correct: aria-label contains the visible text -->
<button aria-label="Submit application form">
  Submit
</button>
<!-- Speech user says "click Submit" → works because "Submit" appears in the accessible name -->

<!-- Correct: no override needed, visible text is sufficient -->
<button>Submit</button>

<!-- Incorrect: image alt does not match adjacent visible text -->
<a href="/search">
  <img src="search.png" alt="Find products">
  Search
</a>

<!-- Correct: accessible name matches visible text -->
<a href="/search">
  <img src="search.png" alt="">
  Search
</a>
```
