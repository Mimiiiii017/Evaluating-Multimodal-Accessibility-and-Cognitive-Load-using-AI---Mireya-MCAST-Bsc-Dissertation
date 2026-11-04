# Input Modalities: Voice Control and Speech Input

## Tags
Tags: #input-modalities #voice-control #speech-input #multimodal #wcag #eaa

## Purpose
Ensure web content and applications are compatible with voice control and speech input software, allowing users who cannot use a keyboard or pointing device to interact with all functionality.

## Key points
- Voice control users activate interactive elements by speaking their visible labels (e.g., "click Submit").
- All interactive elements must have visible text labels that match their accessible names (related to WCAG 2.5.3 Label in Name).
- Icon-only buttons without visible text are difficult to activate by voice.
- Voice control software includes Dragon NaturallySpeaking, Windows Voice Access, macOS Voice Control, and Android Voice Access.
- Complex custom widgets must expose correct roles and names for voice navigation.
- Voice users navigate by saying "show numbers" or "show grid" — elements must be visible and not obscured.

## Developer checks
- Verify all interactive elements have visible text labels.
- Check that accessible names contain the visible text.
- Test whether icon-only buttons have visible tooltips or labels that voice users can speak.
- Confirm custom widgets expose their role and accessible name to the accessibility tree.
- Verify no interactive elements are hidden behind overlays or off-screen.
- Test the full application flow using a voice control tool.

## Fix patterns
- Add visible text labels to all buttons and controls.
- Ensure `aria-label` values match or contain the visible text.
- Provide visible text alongside icons where possible.
- Use standard HTML elements (`<button>`, `<a>`, `<input>`) that voice software recognises natively.
- Avoid custom gestures or interaction patterns that voice software cannot replicate.
- Test with at least one voice control tool during development.

## Examples
```html
<!-- Voice-friendly: visible label matches accessible name -->
<button>Submit application</button>
<!-- Voice user says: "click Submit application" -->

<!-- Voice-unfriendly: icon only without visible text -->
<button aria-label="Send">
  <svg aria-hidden="true"><!-- send icon --></svg>
</button>
<!-- Voice user cannot see what to say -->

<!-- Fixed: icon with visible text -->
<button>
  <svg aria-hidden="true"><!-- send icon --></svg>
  Send
</button>
<!-- Voice user says: "click Send" -->

<!-- Voice-friendly link -->
<a href="/contact">Contact us</a>
<!-- Voice user says: "click Contact us" -->
```
