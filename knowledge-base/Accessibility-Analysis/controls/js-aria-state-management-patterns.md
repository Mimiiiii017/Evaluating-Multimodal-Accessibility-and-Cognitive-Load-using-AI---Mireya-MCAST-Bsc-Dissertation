# JavaScript Dynamic ARIA State Management Patterns

## Tags
#js #jsx #dynamic-aria #aria-expanded #aria-pressed #aria-invalid #event-handlers #wcag-2.2

## Overview
Critical patterns for detecting JavaScript accessibility defects specifically in high-complexity fixtures where state management and ARIA updates are frequent and complex.

---

## Pattern 1: Toggle Functions Not Updating ARIA State

### What to look for
Functions that toggle UI state (buttons, menus, accordions, dropdowns) without updating corresponding ARIA attributes.

### Common violations

```javascript
// ❌ VIOLATION: toggleMenu changes DOM but not aria-expanded
function toggleMenu(menuId) {
  const menu = document.getElementById(menuId);
  const button = menu.previousElementSibling;
  
  // Toggle visibility
  if (menu.style.display === 'none') {
    menu.style.display = 'block';
    button.classList.add('open');
  } else {
    menu.style.display = 'none';
    button.classList.remove('open');
  }
  // Missing: button.setAttribute('aria-expanded', menu.style.display === 'block')
}

// ❌ VIOLATION: openDropdown changes visibility without aria-expanded
function openDropdown(trigger) {
  const dropdown = trigger.nextElementSibling;
  dropdown.classList.remove('hidden');
  trigger.classList.add('active');
  // Screen reader doesn't know dropdown opened
}

// ❌ VIOLATION: expandAccordion changes parent but forgets aria-expanded
function expandAccordion(header) {
  const section = header.parentElement;
  const panel = section.querySelector('[role="region"]');
  
  // Show panel
  panel.style.maxHeight = panel.scrollHeight + 'px';
  section.classList.add('expanded');
  // Missing: header.setAttribute('aria-expanded', 'true')
}
```

### Correct implementations

```javascript
// ✅ CORRECT: toggleMenu updates both DOM and ARIA
function toggleMenu(menuId) {
  const menu = document.getElementById(menuId);
  const button = menu.previousElementSibling;
  
  const isOpen = menu.style.display === 'block';
  const newState = !isOpen;
  
  menu.style.display = newState ? 'block' : 'none';
  button.classList.toggle('open');
  button.setAttribute('aria-expanded', newState);  // ARIA updated
}

// ✅ CORRECT: openDropdown with aria-expanded
function openDropdown(trigger) {
  const dropdown = trigger.nextElementSibling;
  dropdown.classList.remove('hidden');
  trigger.classList.add('active');
  trigger.setAttribute('aria-expanded', 'true');  // ARIA added
}

// ✅ CORRECT: expandAccordion with full ARIA state
function expandAccordion(header) {
  const section = header.parentElement;
  const panel = section.querySelector('[role="region"]');
  
  panel.style.maxHeight = panel.scrollHeight + 'px';
  section.classList.add('expanded');
  header.setAttribute('aria-expanded', 'true');  // ARIA updated
}
```

---

## Pattern 2: Form Validation Not Setting ARIA-Invalid

### What to look for
Validation functions that mark fields as having errors (visually) but don't set `aria-invalid` attribute.

### Common violations

```javascript
// ❌ VIOLATION: validateEmail shows error but no aria-invalid
function validateEmail(input) {
  const email = input.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  if (!isValid) {
    input.classList.add('error');
    input.parentElement.querySelector('.error-msg').textContent = 'Invalid email';
  } else {
    input.classList.remove('error');
    input.parentElement.querySelector('.error-msg').textContent = '';
  }
  // Missing: input.setAttribute('aria-invalid', !isValid)
}

// ❌ VIOLATION: handleSubmit validates but doesn't set aria-invalid
function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  let hasErrors = false;
  
  form.querySelectorAll('input[required]').forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('invalid');
      hasErrors = true;
      // Missing: input.setAttribute('aria-invalid', 'true')
    }
  });
  
  if (!hasErrors) form.submit();
}

// ❌ VIOLATION: handleBlur marks field invalid without aria-invalid
function handleBlur(input) {
  const value = input.value.trim();
  const isValid = validateField(input.name, value);
  
  if (!isValid) {
    input.style.borderColor = 'red';
    input.nextElementSibling.style.display = 'block';  // show error message
  }
  // Missing: input.setAttribute('aria-invalid', !isValid)
}
```

### Correct implementations

```javascript
// ✅ CORRECT: validateEmail with aria-invalid
function validateEmail(input) {
  const email = input.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  input.classList.toggle('error', !isValid);
  input.setAttribute('aria-invalid', !isValid);  // ARIA updated
  
  const errorMsg = input.parentElement.querySelector('.error-msg');
  errorMsg.textContent = isValid ? '' : 'Invalid email';
}

// ✅ CORRECT: handleSubmit with aria-invalid on all errors
function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  let hasErrors = false;
  
  form.querySelectorAll('input[required]').forEach(input => {
    const isEmpty = !input.value.trim();
    input.classList.toggle('invalid', isEmpty);
    input.setAttribute('aria-invalid', isEmpty);  // ARIA set for each field
    if (isEmpty) hasErrors = true;
  });
  
  if (!hasErrors) form.submit();
}

// ✅ CORRECT: handleBlur with full ARIA state
function handleBlur(input) {
  const value = input.value.trim();
  const isValid = validateField(input.name, value);
  
  input.style.borderColor = isValid ? 'initial' : 'red';
  input.setAttribute('aria-invalid', !isValid);  // ARIA updated
  input.nextElementSibling.style.display = isValid ? 'none' : 'block';
}
```

---

## Pattern 3: Live Region Updates Not Announced

### What to look for
Dynamic content changes (search results, filter updates, status messages) without announcing them to screen readers via live regions.

### Common violations

```javascript
// ❌ VIOLATION: search updates results without announcing
function performSearch(query) {
  const resultsContainer = document.querySelector('.search-results');
  resultsContainer.innerHTML = '';  // Clear old results
  
  const results = searchDB(query);
  results.forEach(result => {
    const item = document.createElement('div');
    item.textContent = result.title;
    resultsContainer.appendChild(item);
  });
  // Results changed but screen reader not notified
}

// ❌ VIOLATION: applyFilter updates display without aria-live
function applyFilter(filterType, filterValue) {
  const items = document.querySelectorAll('.item');
  const resultCount = 0;
  
  items.forEach(item => {
    const matches = item.dataset[filterType] === filterValue;
    item.style.display = matches ? 'block' : 'none';
    if (matches) resultCount++;
  });
  
  document.querySelector('.count').textContent = `${resultCount} results`;
  // Count changed but not announced as live region update
}

// ❌ VIOLATION: updateStatus changes without aria-live
function updateStatus(message) {
  const status = document.querySelector('.status-message');
  status.textContent = message;
  // Status changed but not marked as live region
}
```

### Correct implementations

```javascript
// ✅ CORRECT: performSearch with aria-live announcement
function performSearch(query) {
  const resultsContainer = document.querySelector('.search-results');
  const liveRegion = document.querySelector('[aria-live="polite"]') || createLiveRegion();
  
  resultsContainer.innerHTML = '';
  
  const results = searchDB(query);
  results.forEach(result => {
    const item = document.createElement('div');
    item.textContent = result.title;
    resultsContainer.appendChild(item);
  });
  
  // Announce results to screen readers
  liveRegion.textContent = `Found ${results.length} results`;  // Announced
}

function createLiveRegion() {
  const region = document.createElement('div');
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'true');
  region.style.position = 'absolute';
  region.style.left = '-10000px';  // Visually hidden but announced
  document.body.appendChild(region);
  return region;
}

// ✅ CORRECT: applyFilter with live region count
function applyFilter(filterType, filterValue) {
  const items = document.querySelectorAll('.item');
  let resultCount = 0;
  
  items.forEach(item => {
    const matches = item.dataset[filterType] === filterValue;
    item.style.display = matches ? 'block' : 'none';
    if (matches) resultCount++;
  });
  
  const countElement = document.querySelector('.count');
  countElement.textContent = `${resultCount} results`;
  countElement.setAttribute('aria-live', 'polite');  // Live region
  countElement.setAttribute('aria-atomic', 'true');
}

// ✅ CORRECT: updateStatus with aria-live
function updateStatus(message) {
  const status = document.querySelector('.status-message');
  status.textContent = message;
  status.setAttribute('aria-live', 'polite');  // Live region
  status.setAttribute('aria-atomic', 'true');
}
```

---

## Pattern 4: Event Handlers Missing Keyboard Support

### What to look for
Click event listeners without corresponding keyboard event handlers (Enter/Space keys).

### Common violations

```javascript
// ❌ VIOLATION: customButton only handles click, not keyboard
const customButton = document.querySelector('[role="button"]');
customButton.addEventListener('click', () => {
  console.log('Button activated');
  performAction();
});
// No Enter/Space key handler; keyboard inaccessible

// ❌ VIOLATION: toggleDropdown only listens to click
document.querySelector('.dropdown-trigger').addEventListener('click', function() {
  this.nextElementSibling.classList.toggle('open');
});
// Keyboard users can't toggle

// ❌ VIOLATION: cardClick only responds to mouse
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    navigateToDetail(card.dataset.id);
  });
});
// Cards not keyboard accessible
```

### Correct implementations

```javascript
// ✅ CORRECT: customButton with keyboard support
const customButton = document.querySelector('[role="button"]');
function handleActivation() {
  console.log('Button activated');
  performAction();
}

customButton.addEventListener('click', handleActivation);
customButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
    handleActivation();
  }
});

// ✅ CORRECT: toggleDropdown with keyboard support
document.querySelector('.dropdown-trigger').addEventListener('click', function() {
  this.nextElementSibling.classList.toggle('open');
  this.setAttribute('aria-expanded', this.nextElementSibling.classList.contains('open'));
});

document.querySelector('.dropdown-trigger').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    this.click();
  }
});

// ✅ CORRECT: card with keyboard support
document.querySelectorAll('.card').forEach(card => {
  card.setAttribute('tabindex', '0');
  
  function handleCardActivation() {
    navigateToDetail(card.dataset.id);
  }
  
  card.addEventListener('click', handleCardActivation);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCardActivation();
    }
  });
});
```

---

## Pattern 5: Form Field ARIA Not Initialized on Page Load

### What to look for
Form fields that should have ARIA attributes (aria-invalid, aria-required, aria-expanded) set on page load but aren't until user interaction.

### Common violations

```javascript
// ❌ VIOLATION: Required fields not marked at initialization
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  // Form fields exist with <input required> but...
  // Screen readers don't see aria-required because it's not set
});

// ❌ VIOLATION: Pre-checked accordion not marked as expanded
document.addEventListener('DOMContentLoaded', () => {
  const expandedAccordion = document.querySelector('.accordion-item.expanded');
  // Visual state shows it's expanded, but aria-expanded not set on header
});

// ❌ VIOLATION: Field with pre-filled error state
document.addEventListener('DOMContentLoaded', () => {
  const emailField = document.querySelector('#email');
  if (emailField.classList.contains('error')) {
    // Visual error state exists but aria-invalid not set
  }
});
```

### Correct implementations

```javascript
// ✅ CORRECT: Initialize ARIA on required fields
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  form.querySelectorAll('[required]').forEach(field => {
    field.setAttribute('aria-required', 'true');  // Set on init
  });
});

// ✅ CORRECT: Initialize aria-expanded on pre-expanded accordion
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.accordion-item').forEach(item => {
    const header = item.querySelector('[role="heading"]');
    const isExpanded = item.classList.contains('expanded');
    header.setAttribute('aria-expanded', isExpanded);  // Set on init
  });
});

// ✅ CORRECT: Initialize aria-invalid on fields with error state
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input').forEach(field => {
    const hasError = field.classList.contains('error');
    if (hasError) {
      field.setAttribute('aria-invalid', 'true');  // Set on init
      const errorMsg = field.nextElementSibling;
      if (errorMsg && errorMsg.classList.contains('error-message')) {
        field.setAttribute('aria-describedby', errorMsg.id || generateId(errorMsg));
      }
    }
  });
});

function generateId(element) {
  const id = 'error-' + Math.random().toString(36).substr(2, 9);
  element.id = id;
  return id;
}
```

---

## Detection Checklist for Static Analysis

- [ ] All toggle functions update `aria-expanded` when shown/hidden
- [ ] All validation functions set `aria-invalid` when errors detected
- [ ] All search/filter updates announce results to `[aria-live]` regions
- [ ] All interactive elements handle both `click` and `keydown` (Enter/Space)
- [ ] All required form fields have `aria-required="true"` on initialization
- [ ] All dynamic content changes announced before/after to assistive tech

---

## WCAG References

- **WCAG 2.2 SC 4.1.2:** Name, Role, Value — requires ARIA state to match DOM state
- **WCAG 2.2 SC 2.1.1:** Keyboard — all functionality available via keyboard
- **WCAG 2.2 SC 4.1.3:** Status Messages — important messages announced to users
