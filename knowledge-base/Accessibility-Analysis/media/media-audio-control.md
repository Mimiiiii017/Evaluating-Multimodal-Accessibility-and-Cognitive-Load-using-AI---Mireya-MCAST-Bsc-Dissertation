# Media: Audio Control

## Tags
Tags: #media #audio #autoplay #wcag #1.4.2

## Purpose
Ensure users can control audio that plays automatically, preventing interference with screen readers and reducing cognitive overload.

## Key points
- Audio that plays automatically for more than 3 seconds must have a mechanism to pause, stop, or control volume independently from the system volume.
- Autoplay audio interferes with screen reader output, making the page unusable for some users.
- Background music, video soundtracks, and ambient audio all fall under this requirement.
- Ideally, audio should not autoplay at all.
- Controls must be accessible via keyboard and assistive technologies.

## Developer checks
- Check for any audio or video that plays automatically on page load.
- Verify a visible and accessible mechanism exists to pause, stop, or mute the audio.
- Confirm the control is keyboard accessible and reachable early in the tab order.
- Ensure the control adjusts the media volume independently from the system volume.
- Test with a screen reader to confirm audio does not drown out screen reader speech.

## Fix patterns
- Remove autoplay from audio and video elements.
- If autoplay is required, provide a prominently placed pause/mute button.
- Place the audio control mechanism near the top of the page or early in the focus order.
- Ensure the control has a clear accessible name (e.g., "Mute background music").
- Use the `muted` attribute on autoplay video as a fallback.

## Examples
```html
<!-- Incorrect: autoplay with no control -->
<audio autoplay>
  <source src="background.mp3" type="audio/mpeg">
</audio>

<!-- Correct: no autoplay -->
<audio controls>
  <source src="background.mp3" type="audio/mpeg">
</audio>

<!-- If autoplay is essential, provide a mute control -->
<audio id="bgAudio" autoplay>
  <source src="ambient.mp3" type="audio/mpeg">
</audio>
<button onclick="document.getElementById('bgAudio').muted = !document.getElementById('bgAudio').muted;">
  Mute / Unmute background audio
</button>

<!-- Video with muted autoplay (acceptable pattern) -->
<video autoplay muted controls>
  <source src="hero.mp4" type="video/mp4">
</video>
```
