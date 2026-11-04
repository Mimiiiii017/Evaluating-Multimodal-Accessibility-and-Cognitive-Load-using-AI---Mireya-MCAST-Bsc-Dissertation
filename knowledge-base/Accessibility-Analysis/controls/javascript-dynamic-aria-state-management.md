# JavaScript: Dynamic ARIA State Management

## Tags
Tags: #js #jsx #tsx #javascript #aria #aria-expanded #aria-pressed #aria-invalid #event-handlers #4.1.2 #2.1.1

## Purpose
Ensure JavaScript code that modifies DOM state also updates ARIA attributes so assistive technology users are informed of state changes. Missing ARIA updates is one of the most common A11y defects in JavaScript applications.

## Critical Patterns to Detect

### Pattern 1: Toggle Functions Not Updating aria-expanded

**FIRES when:**
- A function name contains: `toggle`, `open`, `close`, `expand`, `collapse`, `show`, `hide`, `activate`, `deactivate`
- AND the function modifies visible state (CSS class toggle, display change, innerHTML)
- AND no `setAttribute('aria-expanded', ...)` or `.ariaExpanded = ...` call in that function

**Examples:**
```javascript
// ❌ VIOLATION: Toggle visible state but no aria-expanded update
function toggleMenu() {
  const menu = document.getElementById('menu');
  menu.classList.toggle('open');  // visual change only
  // Missing: menu.setAttribute('aria-expanded', 'true/false')
}

function openDropdown(trigger) {
  const panel = document.getElementById('dropdown-content');
  panel.style.display = 'block';   // visual change
  // Missing: trigger.setAttribute('aria-expanded', 'true')
}

function expandAccordion(button) {
  const section = button.nextElementSibling;
  section.classList.add('visible');
  // Missing: button.setAttribute('aria-expanded', 'true')
}

// ✅ CORRECT: Updates aria-expanded when toggle occurs
function toggleMenu(trigger) {
  const menu = document.getElementById('menu');
  const isOpen = menu.classList.toggle('open');
  trigger.setAttribute('aria-expanded', isOpen);
}

function openDropdown(trigger) {
  const panel = document.getElementById('dropdown-content');
  panel.style.display = 'block';
  trigger.setAttribute('aria-expanded', 'true');
}

// ✅ Alternative form (also correct)
addEventListener('click', (e) => {
  const isExpanded = navMenu.ariaExpanded === 'true';
  navMenu.ariaExpanded = String(!isExpanded);
});
```

### Pattern 2: Validation Functions Not Setting aria-invalid

**FIRES when:**
- A function name contains: `validate`, `check`, `isValid`, `onSubmit`, `handleSubmit`, `handleBlur`, `handleChange`
- Function sets a field as invalid/error (adds error class, displays error message, sets validation flag)
- AND no `setAttribute('aria-invalid', 'true')` on that field
- OR function clears validation but fails to set `aria-invalid='false'` or remove it

**Examples:**
```javascript
// ❌ VIOLATION: Marks field invalid but no aria-invalid
function validateEmail(input) {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
  if (!isValid) {
    input.classList.add('error');           // visual only
    showErrorMessage('Invalid email');
    // Missing: input.setAttribute('aria-invalid', 'true')
  }
}

// ❌ VIOLATION: Clears validation without clearing aria-invalid
function onFieldChange(input) {
  input.classList.remove('error');
  // Missing: input.setAttribute('aria-invalid', 'false') or removeAttribute
}

// ✅ CORRECT: Sets aria-invalid when field is invalid
function validateEmail(input, errorEl) {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
  input.setAttribute('aria-invalid', !isValid);
  if (!isValid) {
    input.classList.add('error');
    errorEl.textContent = 'Invalid email format';
    errorEl.setAttribute('role', 'alert');
  } else {
    input.classList.remove('error');
    errorEl.textContent = '';
  }
}

// ✅ React example
function validateField(value, fieldName, setError) {
  const isValid = validateRules[fieldName](value);
  return {
    'aria-invalid': !isValid,           // Key: pass aria-invalid prop
    className: isValid ? '' : 'error'
  };
}
```

### Pattern 3: Event Handlers Not Announcing Live Region Updates

**FIRES when:**
- Code responds to user action (click, input, filter selection, result load)
- Updates visible content that assistant tech should announce (result count, status message, loading indicator, mode change)
- AND code does NOT write to an element with `role="status"`, `role="alert"`, or `aria-live` before/after the update

**Examples:**
```javascript
// ❌ VIOLATION: Results updated but no announcement
document.getElementById('filter').addEventListener('change', () => {
  const results = performFilter();
  updateResultsDisplay(results);  // Updates DOM visually
  // Missing: live region write to announce count/status change
});

// ❌ VIOLATION: Search results loaded but not announced
function performSearch(query) {
  const results = api.search(query);
  renderResults(results);          // Updates DOM
  document.title = `Results (${results.length})`;  // title only, not live announced
}

// ✅ CORRECT: Announces result changes to screen reader
document.getElementById('filter').addEventListener('change', () => {
  const results = performFilter();
  updateResultsDisplay(results);
  
  // Write to live region
  const announcer = document.getElementById('search-announcer');
  announcer.textContent = `${results.length} results found`;
});

// ✅ Correct with dedicated live region
function performSearch(query) {
  const results = api.search(query);
  renderResults(results);
  
  const liveRegion = document.getElementById('search-status');
  liveRegion.setAttribute('role', 'status');
  liveRegion.textContent = `Found ${results.length} results`;
}

// ✅ Using aria-live polite
function updateSort(field) {
  const results = sortResults(field);
  renderResults(results);
  
  const announcer = document.getElementById('announcer');
  announcer.setAttribute('aria-live', 'polite');
  announcer.textContent = `Results sorted by ${field}`;
}
```

### Pattern 4: Form Fields Not Initialized with aria-expanded/aria-invalid

**FIRES when:**
- Page loads with a disclosure/accordion/dropdown already open or closed
- OR page loads with a form field pre-populated with an error state (visually red, error message shown)
- AND on page load, no code sets `aria-expanded="false"` / `aria-expanded="true"` on the trigger
- OR no code sets `aria-invalid="true"` on the already-errored field

**Examples:**
```javascript
// ❌ VIOLATION: Checkbox initially checked visually but no aria-checked
window.addEventListener('DOMContentLoaded', () => {
  const checkbox = document.getElementById('agree');
  checkbox.checked = true;
  // Missing: checkbox.setAttribute('aria-checked', 'true')
});

// ❌ VIOLATION: Accordion panel visually open on load but aria-expanded not set
window.addEventListener('load', () => {
  const accordion = document.getElementById('faq-1');
  accordion.classList.add('expanded');
  accordion.style.display = 'block';
  // Missing: accordion.previousElementSibling.setAttribute('aria-expanded', 'true')
});

// ✅ CORRECT: Initialize aria-expanded on page load
window.addEventListener('DOMContentLoaded', () => {
  const trigger = document.querySelector('[aria-controls="nav-menu"]');
  const startOpen = localStorage.getItem('menu-open') === 'true';
  trigger.setAttribute('aria-expanded', startOpen);
  if (startOpen) {
    document.getElementById('nav-menu').classList.add('visible');
  }
});

// ✅ CORRECT: Initialize aria-invalid for pre-error'd fields
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.field.error').forEach(field => {
    const input = field.querySelector('input, textarea, select');
    input.setAttribute('aria-invalid', 'true');
  });
});
```

### Pattern 5: addEventListener Not Checking for Keyboard Events

**FIRES when:**
- Code attaches interaction handler only to mouse events (click, mousedown) on non-native-button elements
- Element has `role="button"` or class suggesting button-like behavior
- AND no keyboard handler (keydown, keyup, keypress) for that same element

**Examples:**
```javascript
// ❌ VIOLATION: Click handler only, no keyboard support
document.getElementById('custom-btn').addEventListener('click', handleButtonClick);

// ❌ VIOLATION: Div used as button but keyboard handler missing
const menuTrigger = document.querySelector('.menu-trigger');
menuTrigger.addEventListener('click', toggleMenu);
// Missing: menuTrigger.addEventListener('keydown', (e) => { if (e.key === 'Enter') ... })

// ✅ CORRECT: Keyboard handler included
const button = document.getElementById('custom-btn');
const handleClick = () => { /* do thing */ };
button.addEventListener('click', handleClick);
button.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleClick();
  }
});

// ✅ Using class abstraction (also correct)
class AccessibleButton {
  constructor(element) {
    this.element = element;
    this.element.setAttribute('tabindex', '0');
    this.element.setAttribute('role', 'button');
    this.element.addEventListener('click', () => this.handleActivate());
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleActivate();
      }
    });
  }
  handleActivate() { /* event logic */ }
}
```

## Summary Checklist for JS Auditing

When scanning JavaScript files for dynamic ARIA defects, check for:

- ✓ All `toggle` / `open` / `close` / `expand` / `collapse` functions update `aria-expanded`
- ✓ All form validation functions update `aria-invalid` and `aria-describedby`
- ✓ All content-mutation operations write to a live region (`role="status"`, `aria-live="polite"`, etc.)
- ✓ All non-button interactive elements have keyboard handlers (Enter / Space keys)
- ✓ All pre-load state is initialized with correct ARIA attributes on DOMContentLoaded
- ✓ Toggle/disclosure triggers have `aria-controls` pointing to the managed region's id

## References
- WCAG 2.2 SC 4.1.2 Name, Role, Value: https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html
- WCAG 2.2 SC 2.1.1 Keyboard: https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
