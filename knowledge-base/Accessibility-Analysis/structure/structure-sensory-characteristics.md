# Structure: Sensory Characteristics

## Tags
Tags: #structure #sensory-characteristics #wcag #1.3.3

## Purpose
Ensure instructions and information do not rely solely on sensory characteristics such as shape, color, size, visual location, orientation, or sound, so all users can understand the content regardless of ability.

## Key points
- Instructions must not depend on shape, size, visual location, or sound alone.
- Phrases like "click the round button" or "see the sidebar on the right" rely on visual perception.
- Users who are blind, have low vision, or use screen magnification may not perceive these cues.
- Supplementary text descriptions must accompany visual or spatial references.
- This applies to instructions, error messages, and any guidance provided to users.

## Developer checks
- Search for instructions that reference shape ("the round icon"), color ("the red button"), size ("the large heading"), or position ("the menu on the left").
- Check whether instructions reference sound alone ("when you hear the beep").
- Verify that all references include text-based alternatives (e.g., a label or name).
- Review onboarding flows, tooltips, and help text for sensory-only language.
- Test with a screen reader to confirm instructions make sense without visual context.

## Fix patterns
- Replace or supplement spatial references with descriptive text (e.g., "click the Submit button" instead of "click the button on the right").
- Add text labels alongside icons that are referenced in instructions.
- Provide both visual and textual cues for important actions.
- Avoid sound-only cues; pair audio signals with visual and text indicators.
- Ensure instructions reference element names or roles, not just appearance.

## Examples
```html
<!-- Incorrect: relies on visual location -->
<p>Use the menu on the left to navigate.</p>

<!-- Correct: references the element by name -->
<p>Use the "Main Navigation" menu to navigate.</p>

<!-- Incorrect: relies on shape -->
<p>Click the round button to continue.</p>

<!-- Correct: references the label -->
<p>Click the "Continue" button to proceed.</p>

<!-- Incorrect: relies on color alone -->
<p>Fields marked in red are required.</p>

<!-- Correct: uses text and symbol -->
<p>Fields marked with an asterisk (*) are required.</p>
```
