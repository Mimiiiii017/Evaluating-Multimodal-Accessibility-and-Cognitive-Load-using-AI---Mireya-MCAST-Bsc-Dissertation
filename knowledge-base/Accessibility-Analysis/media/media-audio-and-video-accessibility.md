# Media: Audio and Video Accessibility

## Tags 
Tags: #media #audio #video #captions #transcripts #audio-descriptions #wcag #1.2.1 #1.2.2 #1.2.3 #1.2.4 #1.2.5 #eaa

## Purpose
Ensure audio and video content is accessible to users with hearing, visual, and cognitive impairments by providing equivalent alternatives and clear controls.

## Key points
- Audio and video content must have text alternatives.
- Captions are required for prerecorded video with audio (WCAG 1.2.2, Level A).
- Live video with audio must have real-time captions (WCAG 1.2.4, Level AA).
- Transcripts must be provided for audio-only content (WCAG 1.2.1, Level A).
- Audio descriptions must be provided for prerecorded video to describe important visual information for blind users (WCAG 1.2.3 Level A, 1.2.5 Level AA — see also media-audio-descriptions-and-live-captions.md for full detail).
- Media controls must be keyboard accessible.
- Users must be able to pause, stop, or control playback.
- Autoplaying media can increase cognitive load and should be avoided.

## Developer checks
- Check that videos include captions for spoken audio.
- Verify audio-only content has an accessible transcript.
- Ensure media players expose controls to keyboard and assistive technologies.
- Confirm users can pause or stop moving, blinking, or auto-playing content.
- Check that media does not start automatically without user control.

## Fix patterns
- Add captions to prerecorded videos.
- Provide transcripts for podcasts or audio clips.
- Use native HTML media elements where possible.
- Ensure custom media players support keyboard interaction.
- Disable autoplay or provide a clear pause/stop control.

## Examples
```html
<!-- Video with captions -->
<video controls>
  <source src="intro.mp4" type="video/mp4">
  <track kind="captions" src="intro-captions.vtt" srclang="en" label="English captions">
</video>

<!-- Audio with transcript -->
<audio controls>
  <source src="interview.mp3" type="audio/mpeg">
</audio>

<p>
  <strong>Transcript:</strong> This interview discusses…
</p>

<!-- Video with captions and audio descriptions -->
<video controls>
  <source src="demo.mp4" type="video/mp4">
  <track kind="captions" src="demo-captions.vtt" srclang="en" label="English captions">
  <track kind="descriptions" src="demo-descriptions.vtt" srclang="en" label="Audio descriptions">
</video>

<!-- Avoid autoplay -->
<video controls>
  <source src="demo.mp4" type="video/mp4">
</video>
```
