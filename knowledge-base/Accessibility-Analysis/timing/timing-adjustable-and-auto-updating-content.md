# Timing: Adjustable Time Limits and Auto-Updating Content

## Tags
Tags: #timing #time-limits #auto-update #pause-stop-hide #wcag #2.2.1 #2.2.2

## Purpose
Ensure users have enough time to read and interact with content, and can control or stop content that moves, blinks, scrolls, or auto-updates.

## Key points
- Time limits must be adjustable: users must be able to turn off, extend, or adjust time limits before they expire (WCAG 2.2.1).
- Users must be warned before a session expires and given the option to extend it.
- Exceptions exist for real-time events (e.g., auctions) and essential time limits (e.g., security).
- Moving, blinking, scrolling, or auto-updating content that starts automatically and lasts more than 5 seconds must have a pause, stop, or hide mechanism (WCAG 2.2.2).
- Carousels, news tickers, auto-advancing slideshows, and background animations all require controls.
- Auto-updating content (e.g., live feeds, stock prices) must have a pause mechanism.

## Developer checks
- Identify all session timeouts and time-limited interactions.
- Check that users are warned before timeout and can extend the session.
- Look for moving, blinking, or scrolling content (carousels, banners, animations).
- Verify a visible pause/stop control exists for auto-playing content.
- Confirm auto-updating content can be paused without losing information.
- Check that content does not move or change in a way that prevents reading.

## Fix patterns
- Add session timeout warnings with an option to extend (at least 20 seconds before expiry).
- Allow users to turn off or adjust time limits in settings.
- Provide visible pause, stop, and hide controls for all auto-advancing content.
- Stop animations after a reasonable duration or provide a global animation toggle.
- Use `prefers-reduced-motion` to disable non-essential motion by default for users who prefer it.
- Ensure paused content can be resumed without losing context.

## Examples
```html
<!-- Session timeout warning -->
<div role="alertdialog" aria-labelledby="timeoutTitle" aria-describedby="timeoutDesc">
  <h2 id="timeoutTitle">Session expiring</h2>
  <p id="timeoutDesc">Your session will expire in 2 minutes. Would you like to continue?</p>
  <button onclick="extendSession()">Continue session</button>
  <button onclick="logout()">Log out</button>
</div>

<!-- Carousel with pause control -->
<div class="carousel" aria-label="Featured articles">
  <button aria-label="Pause carousel" onclick="toggleCarousel()">⏸ Pause</button>
  <div class="carousel-slides">
    <!-- slides here -->
  </div>
</div>

<!-- Auto-updating content with pause -->
<div aria-live="polite" id="liveFeed">
  <p>Latest: Stock prices updated at 14:32</p>
</div>
<button onclick="toggleLiveFeed()">Pause live updates</button>
```

```css
/* Respect user preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .carousel-slides {
    animation: none;
  }
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```
