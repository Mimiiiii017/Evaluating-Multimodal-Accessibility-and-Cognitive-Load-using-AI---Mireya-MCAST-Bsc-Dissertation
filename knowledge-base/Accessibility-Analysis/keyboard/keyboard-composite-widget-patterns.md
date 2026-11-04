# Keyboard Interaction Patterns for Composite Widgets

## Overview

Composite widgets — those containing multiple interactive child elements — must implement specific keyboard interaction patterns so they are operable without a mouse. These patterns are defined by the ARIA Authoring Practices Guide (APG). A widget that only supports Tab/Shift-Tab navigation is non-conformant when arrow-key navigation or other patterns are expected.

The two main models are:

- **Tab stop model**: The widget as a whole is one tab stop; arrow keys navigate internally. Used for: toolbars, tab panels, menus, listboxes, trees, grids, radio groups.
- **Roving tabindex**: One child at a time has `tabindex="0"`, all others have `tabindex="-1"`. When focus moves inside the widget, `tabindex` is updated on the focused child and removed from the previous.

---

## Menu and Menu Bar

### Tab stop behaviour
- Tab moves to/from the menu as a whole unit (one tab stop in the page).
- Arrow keys navigate between menu items.

### Required keyboard interactions

| Key | Behaviour |
|-----|-----------|
| Arrow Down / Arrow Up | Move focus between menu items, wrapping at ends |
| Arrow Right / Arrow Left | Open submenu (right) / close submenu and return to parent (left) |
| Home | Move focus to first item |
| End | Move focus to last item |
| Enter or Space | Activate the focused item (follow link, trigger action, open submenu) |
| Escape | Close menu, return focus to trigger |
| Tab | Close menu, move focus to next element in page |
| Printable characters | Type-ahead: move focus to next item starting with typed character |

### ARIA roles

```html
<nav>
  <button aria-haspopup="menu" aria-expanded="false" id="menu-btn">Products</button>
  <ul role="menu" aria-labelledby="menu-btn">
    <li role="none">
      <a href="/pricing" role="menuitem">Pricing</a>
    </li>
    <li role="none">
      <a href="/enterprise" role="menuitem">Enterprise</a>
    </li>
  </ul>
</nav>
```

### Detection rules
A menu component is missing keyboard support if:
- Arrow-key event listeners are absent in the JavaScript managing the menu.
- `focus()` is not called when moving between items.
- `tabindex="-1"` is not set on non-focused items.
- `role="menu"` / `role="menuitem"` are not present.
- Escape key does not close the menu and return focus to the trigger.

---

## Tab Panel Widget

### Tab stop behaviour
- Tab moves to the tab list as one unit, then into the active panel.
- Arrow keys navigate between tabs (do not move to panel).

### Required keyboard interactions

| Key | Behaviour |
|-----|-----------|
| Arrow Left / Arrow Right | Move focus between tabs |
| Home | Focus first tab |
| End | Focus last tab |
| Enter or Space | (Automatic activation model): not needed — focus change activates tab. (Manual model): activates the focused tab without changing focus on arrow-key alone |
| Tab | Move focus from tab list into the associated panel |
| Shift + Tab | Move focus from panel back to active tab |

### ARIA roles

```html
<div>
  <div role="tablist" aria-label="Navigation sections">
    <button role="tab" id="tab-1" aria-controls="panel-1" aria-selected="true"  tabindex="0">Overview</button>
    <button role="tab" id="tab-2" aria-controls="panel-2" aria-selected="false" tabindex="-1">Details</button>
    <button role="tab" id="tab-3" aria-controls="panel-3" aria-selected="false" tabindex="-1">Reviews</button>
  </div>
  <div role="tabpanel" id="panel-1" aria-labelledby="tab-1">…</div>
  <div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>…</div>
  <div role="tabpanel" id="panel-3" aria-labelledby="tab-3" hidden>…</div>
</div>
```

### Detection rules
A tab widget is broken if:
- Tabs cannot be navigated with arrow keys.
- `aria-selected="true"` is not updated when tab changes.
- `tabindex="0"` / `tabindex="-1"` are not managed (roving tabindex absent).
- `aria-controls` on each tab does not match the `id` of the corresponding panel.
- Tab panels are removed from DOM instead of using `hidden` attribute (focus management lost).

---

## Listbox (Custom Select Replacement)

### Tab stop behaviour
- The listbox is a single tab stop.
- Arrow keys navigate between options.

### Required keyboard interactions

| Key | Behaviour |
|-----|-----------|
| Arrow Down / Arrow Up | Move focus between options, wrapping at ends |
| Home | Move focus to first option |
| End | Move focus to last option |
| Enter or Space | Select focused option |
| Escape | Close listbox if used as a popup, clear selection |
| Printable characters | Type-ahead to first option matching character |
| Shift + Arrow | Extend selection in multi-select listbox |

### ARIA roles

```html
<ul role="listbox" aria-label="Sort by" aria-activedescendant="opt-date">
  <li role="option" id="opt-rel" aria-selected="false" tabindex="-1">Relevance</li>
  <li role="option" id="opt-date" aria-selected="true" tabindex="0">Date</li>
  <li role="option" id="opt-pop" aria-selected="false" tabindex="-1">Popularity</li>
</ul>
```

### Detection rules
A listbox is broken if:
- `aria-selected` is not updated when option changes.
- `aria-activedescendant` on the listbox element is not updated to the focused option's `id`.
- Arrow keys do not move focus between options (no keydown listener for ArrowUp/ArrowDown).
- `role="option"` is missing on child items.

---

## Disclosure / Accordion

### Required keyboard interactions

| Key | Behaviour |
|-----|-----------|
| Enter or Space | Toggle panel open/closed |
| Tab | Move to next focusable element |
| Shift + Tab | Move to previous focusable element |

Arrow keys are NOT required for accordions (unlike trees/menus) — accordions are a sequence of buttons, each a separate tab stop.

### ARIA roles

```html
<h3>
  <button aria-expanded="false" aria-controls="panel-1">Section 1</button>
</h3>
<div id="panel-1" role="region" aria-labelledby="heading-1" hidden>…</div>
```

### Detection rules
- `aria-expanded` not toggled on button click → violation.
- Panel uses `display: none` toggled via class without setting `hidden` attribute → focus management may break.
- `aria-controls` does not reference the panel element → broken relationship.

---

## Tree Widget

### Required keyboard interactions

| Key | Behaviour |
|-----|-----------|
| Arrow Down / Up | Move focus to next/previous visible node |
| Arrow Right | Expand closed node; move to first child if already open |
| Arrow Left | Collapse open node; move to parent if already closed |
| Home | Move focus to first node |
| End | Move focus to last visible node |
| Enter | Activate node (select, navigate) |
| Printable characters | Type-ahead |

### ARIA roles

```html
<ul role="tree" aria-label="File structure">
  <li role="treeitem" aria-expanded="true" aria-level="1" tabindex="0">
    src
    <ul role="group">
      <li role="treeitem" aria-level="2" tabindex="-1">index.ts</li>
    </ul>
  </li>
</ul>
```

---

## Radio Group

### Required keyboard interactions

| Key | Behaviour |
|-----|-----------|
| Arrow Down / Right | Move to next radio button and select it |
| Arrow Up / Left | Move to previous radio button and select it |
| Tab | Move into and out of the group as a single tab stop |
| Space | Select focused radio button (if using `role="radio"` custom widget) |

### Detection rule
Native `<input type="radio">` inside `<fieldset>`/`<legend>` handles keyboard automatically. Custom radio groups using `role="radiogroup"` / `role="radio"` must implement arrow key navigation manually.

---

## Roving Tabindex — Implementation Pattern

All composite widgets use roving tabindex to ensure exactly one child is tab-reachable at a time:

```javascript
function roveTo(newItem) {
  // Remove tabindex from current item
  currentItem.setAttribute('tabindex', '-1');
  // Set tabindex on new item and focus it
  newItem.setAttribute('tabindex', '0');
  newItem.focus();
  currentItem = newItem;
}

// Initialise: set all to -1 except first/default
items.forEach((item, i) => {
  item.setAttribute('tabindex', i === defaultIndex ? '0' : '-1');
});
```

### Detection rule
A composite widget is broken if:
- All children have `tabindex="0"` (all are tab stops — makes widget tedious to use).
- All children have `tabindex="-1"` (no child is reachable by Tab from outside the widget).
- `tabindex` is never updated when keyboard focus moves between children.

---

## WCAG References

- SC 2.1.1 Keyboard — all functionality must be operable by keyboard.
- SC 2.1.2 No Keyboard Trap — focus must not get stuck.
- SC 4.1.2 Name, Role, Value — interactive elements must expose state (`aria-selected`, `aria-expanded`, `aria-activedescendant`).
- ARIA APG Keyboard Interaction Patterns — definitive source for each widget type.
