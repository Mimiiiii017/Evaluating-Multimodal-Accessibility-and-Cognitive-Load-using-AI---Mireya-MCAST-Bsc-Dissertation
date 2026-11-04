# Keyboard: Character Key Shortcuts

## Tags
Tags: #keyboard #shortcuts #character-keys #wcag #2.1.4

## Purpose
Ensure single-character keyboard shortcuts do not interfere with speech input users or keyboard-only users who may accidentally trigger shortcuts.

## Key points
- Single-character key shortcuts (using only letters, numbers, punctuation, or symbols) can be accidentally triggered by speech input users.
- If single-character shortcuts exist, users must be able to turn them off, remap them to include a modifier key (Ctrl, Alt, etc.), or they must only be active when the relevant component has focus.
- This requirement does not apply to shortcuts that already require a modifier key (e.g., Ctrl+S).
- Speech input software interprets spoken words as keystrokes, which can trigger unintended shortcuts.
- Common examples include "S" for search, "?" for help, or "J/K" for navigation.

## Developer checks
- Identify all single-character keyboard shortcuts in the application.
- Check whether shortcuts can be turned off by the user.
- Verify shortcuts can be remapped to include a modifier key.
- Confirm shortcuts that only work on focused components (e.g., a media player) are scoped correctly.
- Test with speech recognition software to check for accidental triggering.

## Fix patterns
- Provide a settings panel to disable or remap keyboard shortcuts.
- Require a modifier key for all shortcuts (e.g., Alt+S instead of S).
- Scope shortcuts to only be active when a specific component has focus.
- Document available shortcuts and how to customise them.
- Avoid implementing single-character shortcuts unless they provide essential functionality.

## Examples
```js
// Incorrect: single character shortcut always active
document.addEventListener('keydown', (e) => {
  if (e.key === 's') {
    openSearch();
  }
});

// Correct: requires modifier key
document.addEventListener('keydown', (e) => {
  if (e.key === 's' && e.ctrlKey) {
    openSearch();
  }
});

// Correct: only active when component has focus
searchPanel.addEventListener('keydown', (e) => {
  if (e.key === '/') {
    focusSearchInput();
  }
});
```

```html
<!-- Settings option to disable shortcuts -->
<label>
  <input type="checkbox" id="disableShortcuts"> Disable single-key shortcuts
</label>
```
