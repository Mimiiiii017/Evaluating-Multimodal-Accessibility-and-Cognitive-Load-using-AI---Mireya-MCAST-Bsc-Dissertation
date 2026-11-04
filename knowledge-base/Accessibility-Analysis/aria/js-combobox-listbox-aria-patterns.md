# JavaScript Combobox and Listbox ARIA Patterns — Detection Rules

## Tags
Tags: #aria #combobox #listbox #javascript #autocomplete #search-suggestions #aria-expanded #aria-selected #aria-activedescendant #wcag #4.1.2

## Purpose
Search-with-suggestions (autocomplete/combobox) widgets require a precise set of
ARIA attributes that must be maintained in JavaScript as the user types. This
document provides detection rules for identifying missing or incorrect ARIA
management in combobox/listbox implementations.

---

## Required HTML Structure

```html
<!-- Input must declare its relationship to the listbox -->
<input type="text"
       id="search-input"
       role="combobox"
       aria-expanded="false"
       aria-haspopup="listbox"
       aria-autocomplete="list"
       aria-controls="suggestion-list"
       aria-activedescendant=""
       autocomplete="off">

<!-- Listbox container — hidden initially -->
<ul id="suggestion-list" role="listbox" hidden>
  <!-- Each option is a listbox option -->
  <li id="suggestion-0" role="option" aria-selected="false">First result</li>
  <li id="suggestion-1" role="option" aria-selected="false">Second result</li>
</ul>
```

---

## Rule 1 — Input Must Be Initialised with combobox Attributes

### Why this matters
Without `role="combobox"` and its companion attributes set on page load the
assistive technology cannot announce the widget type or its collapsed state.

### Violation pattern

```javascript
// ❌ init() creates listbox DOM but never sets attributes on the input
init() {
  this._list = document.createElement('ul');
  this._list.id = 'suggestion-list';
  this._list.setAttribute('role', 'listbox');
  this._input.parentNode.insertBefore(this._list, this._input.nextSibling);
  // ❌ Missing: role, aria-expanded, aria-haspopup, aria-autocomplete, aria-controls
}
```

### Correct pattern

```javascript
init() {
  this._list = document.createElement('ul');
  this._list.id = 'suggestion-list';
  this._list.setAttribute('role', 'listbox');
  this._input.parentNode.insertBefore(this._list, this._input.nextSibling);

  // ✅ Initialise all required combobox attributes on the input
  this._input.setAttribute('role', 'combobox');
  this._input.setAttribute('aria-expanded', 'false');
  this._input.setAttribute('aria-haspopup', 'listbox');
  this._input.setAttribute('aria-autocomplete', 'list');
  this._input.setAttribute('aria-controls', 'suggestion-list');
  this._input.setAttribute('aria-activedescendant', '');
}
```

---

## Rule 2 — Showing Suggestions Must Set aria-expanded="true"

### Why this matters
Screen readers announce "expanded" / "collapsed" state based on `aria-expanded`.
If suggestions appear visually but `aria-expanded` stays `"false"`, the user is
not aware that a listbox has opened.

### Violation pattern

```javascript
// ❌ Shows listbox visually but does not update aria-expanded
_showSuggestions(suggestions) {
  this._list.innerHTML = this._buildOptions(suggestions);
  this._list.removeAttribute('hidden');
  // ❌ Missing: this._input.setAttribute('aria-expanded', 'true');
}
```

### Correct pattern

```javascript
_showSuggestions(suggestions) {
  this._list.innerHTML = this._buildOptions(suggestions);
  this._list.removeAttribute('hidden');
  this._input.setAttribute('aria-expanded', 'true');   // ✅
}
```

---

## Rule 3 — Hiding Suggestions Must Set aria-expanded="false" and Clear aria-activedescendant

### Why this matters
When suggestions close, two attributes must be reset:
- `aria-expanded="false"` — tells AT the listbox is gone
- `aria-activedescendant=""` — removes the focus pointer to the (now removed) option

Failing to clear `aria-activedescendant` causes AT to announce a non-existent
element or throw an error.

### Violation pattern

```javascript
// ❌ Hides listbox but leaves stale aria attributes
_hideSuggestions() {
  this._list.setAttribute('hidden', '');
  this._list.innerHTML = '';
  // ❌ Missing: aria-expanded="false"
  // ❌ Missing: clear aria-activedescendant
}
```

### Correct pattern

```javascript
_hideSuggestions() {
  this._list.setAttribute('hidden', '');
  this._list.innerHTML = '';
  this._input.setAttribute('aria-expanded', 'false');      // ✅
  this._input.setAttribute('aria-activedescendant', '');   // ✅
}
```

---

## Rule 4 — Keyboard Navigation Must Manage aria-selected and aria-activedescendant

### Why this matters
When the user presses ArrowDown / ArrowUp to move through suggestions, AT reads
the newly focused option only when:
1. The option's `aria-selected="true"` (previous option set back to `"false"`)
2. The input's `aria-activedescendant` points to the **id** of that option

Without these, keyboard navigation is silent for screen reader users.

### Violation pattern

```javascript
// ❌ Moves visual highlight but does not update ARIA
_highlightOption(index) {
  this._options.forEach(opt => opt.classList.remove('highlighted'));
  this._options[index].classList.add('highlighted');
  // ❌ Missing: aria-selected management
  // ❌ Missing: aria-activedescendant update
}
```

### Correct pattern

```javascript
_highlightOption(index) {
  this._options.forEach((opt, i) => {
    opt.classList.toggle('highlighted', i === index);
    opt.setAttribute('aria-selected', i === index ? 'true' : 'false');  // ✅
  });
  // ✅ Point combobox to the currently active option
  const activeId = this._options[index]?.id;
  this._input.setAttribute('aria-activedescendant', activeId ?? '');
}
```

---

## Rule 5 — Each Option Must Have a Stable id

### Why this matters
`aria-activedescendant` must point to a real element `id`. Dynamically rendered
options that lack `id` attributes break the programmatic association.

### Violation pattern

```javascript
// ❌ Renders <li role="option"> elements without id attributes
_buildOptions(suggestions) {
  return suggestions.map(s => `<li role="option" aria-selected="false">${s.label}</li>`).join('');
}
```

### Correct pattern

```javascript
_buildOptions(suggestions) {
  return suggestions
    .map((s, i) => `<li id="suggestion-${i}" role="option" aria-selected="false">${s.label}</li>`)
    .join('');
}
```

---

## Complete Correct Combobox Class

```javascript
class SearchCombobox {
  constructor(input) {
    this._input = input;
    this._index = -1;
  }

  init() {
    this._list = document.createElement('ul');
    this._list.id = `${this._input.id}-list`;
    this._list.setAttribute('role', 'listbox');
    this._list.setAttribute('hidden', '');
    this._input.parentNode.insertBefore(this._list, this._input.nextSibling);

    this._input.setAttribute('role', 'combobox');
    this._input.setAttribute('aria-expanded', 'false');
    this._input.setAttribute('aria-haspopup', 'listbox');
    this._input.setAttribute('aria-autocomplete', 'list');
    this._input.setAttribute('aria-controls', this._list.id);
    this._input.setAttribute('aria-activedescendant', '');

    this._input.addEventListener('input', () => this._onInput());
    this._input.addEventListener('keydown', (e) => this._onKeydown(e));
    this._input.addEventListener('blur', () => this._hideSuggestions());
  }

  _onInput() {
    const suggestions = this._fetchSuggestions(this._input.value);
    if (suggestions.length > 0) {
      this._showSuggestions(suggestions);
    } else {
      this._hideSuggestions();
    }
  }

  _showSuggestions(suggestions) {
    this._list.innerHTML = suggestions
      .map((s, i) => `<li id="${this._list.id}-opt-${i}" role="option" aria-selected="false">${s}</li>`)
      .join('');
    this._list.removeAttribute('hidden');
    this._input.setAttribute('aria-expanded', 'true');
    this._options = Array.from(this._list.querySelectorAll('[role="option"]'));
    this._index = -1;
  }

  _hideSuggestions() {
    this._list.setAttribute('hidden', '');
    this._list.innerHTML = '';
    this._input.setAttribute('aria-expanded', 'false');
    this._input.setAttribute('aria-activedescendant', '');
    this._options = [];
    this._index = -1;
  }

  _onKeydown(e) {
    if (!this._options?.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._setIndex(Math.min(this._index + 1, this._options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._setIndex(Math.max(this._index - 1, -1));
    } else if (e.key === 'Enter' && this._index >= 0) {
      e.preventDefault();
      this._selectOption(this._options[this._index]);
    } else if (e.key === 'Escape') {
      this._hideSuggestions();
    }
  }

  _setIndex(index) {
    this._index = index;
    this._options.forEach((opt, i) => {
      opt.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
    const active = index >= 0 ? this._options[index].id : '';
    this._input.setAttribute('aria-activedescendant', active);
  }

  _selectOption(option) {
    this._input.value = option.textContent;
    this._hideSuggestions();
  }

  _fetchSuggestions(query) {
    // application-specific implementation
    return [];
  }
}
```

---

## Detection Checklist

When auditing a JavaScript search/autocomplete widget:

| Check | Attribute / Method | Pass condition |
|---|---|---|
| Input role | `role="combobox"` | Set in init() |
| Popup hint | `aria-haspopup="listbox"` | Set in init() |
| Initial collapsed | `aria-expanded="false"` | Set in init() |
| Autocomplete hint | `aria-autocomplete="list"` | Set in init() |
| Links to listbox | `aria-controls="[listbox-id]"` | Set in init() |
| Open notification | `aria-expanded="true"` | Set in showSuggestions() |
| Close notification | `aria-expanded="false"` | Set in hideSuggestions() |
| Clear focus pointer | `aria-activedescendant=""` | Set in hideSuggestions() |
| Active option | `aria-activedescendant` → option id | Set on ArrowDown/Up |
| Selected option | option `aria-selected="true"` | Set on ArrowDown/Up |
| Deselected option | other options `aria-selected="false"` | Cleared on ArrowDown/Up |
| Option ids | `id` on each `[role="option"]` | Set in buildOptions() |

WCAG reference: SC 4.1.2 Name, Role, Value (Level A).
