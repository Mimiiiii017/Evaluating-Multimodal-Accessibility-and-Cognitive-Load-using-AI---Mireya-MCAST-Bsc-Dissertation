// prompt.ts — builds the instruction text that tells the model what to look for and how to respond
// Builds the prompts sent to the Ollama model.
// SYSTEM_PROMPT defines the model's role and strict output format.
// buildAiPrompt assembles the full user message with the code excerpt and
// retrieved RAG context.
// Used by: commands/analyzeFile.ts

// System message that locks the model into the accessibility auditor role.
// Matches the BENCHMARK_SYSTEM_PROMPT used in the kimi+qwen evaluation exactly.
export const SYSTEM_PROMPT = `You are a senior WCAG 2.2 accessibility auditor. Your task has two strict phases. Output Issue blocks and nothing else — no prose, no commentary, no markdown, no JSON.

PHASE 1 — READ AND MAP (produce NO output during this phase):
Read every single line of the code from top to bottom. Build a complete internal inventory before drawing any conclusions:
  • Every element that carries an id attribute — record each id value exactly.
  • How many <nav>, <section>, and <aside> elements exist, and whether each has aria-label or aria-labelledby.
  • Every aria-labelledby / aria-describedby / aria-controls value — note the target id(s) so you can verify they exist.
  • Every interactive element: <a>, <button>, <input>, <select>, <textarea>, <img> — note existing accessible-name attributes.
  • Page structure: <html lang>, <title>, heading order (h1–h6), landmark elements.
  • Every <button> or role="button" element — note whether it has aria-controls or class/text suggesting it toggles content.
Do NOT write any output during Phase 1.

PHASE 2 — REPORT ISSUES (using your Phase 1 inventory):
Using the complete picture you built in Phase 1, run each mandatory sweep and report every violation you can confirm from the code. Never report something you did not observe.

#1 MOST IMPORTANT RULE — ONE ISSUE PER ELEMENT:
Write a SEPARATE Issue block for each individual element that has a problem.
Do NOT group multiple elements into one block.
Example: four images each missing alt text → FOUR separate Issue blocks, one per image, each identifying the specific element (by line number, id, class, src, or surrounding context).
This is required so every distinct violation can be traced back to its specific element.

CORE RULES:
- Only report issues for elements that LITERALLY exist in the code. If an attribute is already present, do NOT report it missing.
- Output issue blocks only. No text before Issue 1, between blocks, or after the last block.`;

// Returns language-specific structured sweep instructions.
// Sweeps match exactly what was used in the kimi+qwen benchmark evaluation.
function getLangSpecificRules(languageId: string): string {
  const lang = languageId.toLowerCase();

  if (lang === 'html') {
    return `
MANDATORY ELEMENT SWEEPS — run ALL sweeps A–J against your Phase 1 inventory:

Execute every sweep below fully and independently. The supplementary WCAG guidance that follows is reference-only — it does not replace, reduce, or skip any sweep.

SWEEP A — Links with no accessible name or non-descriptive text:
  For every <a> element, compute its accessible name in priority order:
  1. aria-label on the <a> → name.  2. aria-labelledby on the <a> → name from referenced element.  3. Visible text inside the <a> that is NOT hidden by aria-hidden → name.
  Child elements with aria-hidden="true" contribute NOTHING. <img alt=""> as the sole content also contributes nothing.
  If steps 1–3 yield nothing → report "missing accessible name on link" (HIGH).
  If only visible text is "click here", "here", "read more", "learn more", or "more" → report "non-descriptive link text" (MEDIUM).

SWEEP B — Buttons with no accessible name:
  For every <button>, compute accessible name: 1. aria-label → name.  2. aria-labelledby → name.  3. Visible text inside (including <span class="sr-only">) → name.  4. title attribute → name.
  Child elements with aria-hidden="true" or <svg aria-hidden="true"> contribute NOTHING.
  If NONE of 1–4 apply → report "missing accessible name on button" (HIGH).

SWEEP C — Table headers without scope:
  For every <th>: (a) scope attribute literally absent AND (b) table is ambiguous (header row has more than one <th>, OR multiple <th> in same column position across rows). Only report when BOTH.

SWEEP D — Heading level skips:
  List headings h1–h6 in document order. A skip is when level jumps by 2+ (h2→h4, h3→h5). For each skip → report (MEDIUM).

SWEEP E — Form inputs without labels:
  For every <input> (excl. hidden/submit/button/reset/image), <select>, <textarea>: a label exists if ANY of: (1) <label for> matching its id, (2) wrapped in <label>, (3) aria-label, (4) aria-labelledby. If NONE → report (HIGH).

SWEEP F — Images missing alt attribute:
  For every <img>: if alt attribute is completely absent (not even alt="") → report (HIGH). alt="" is valid for decorative images.

SWEEP G — Repeated landmark elements missing distinguishing labels:
  For each type (<nav>, <section>, <aside>): if MORE than one element of that type exists, every instance with NEITHER aria-label NOR aria-labelledby → report (MEDIUM). If only one of that type exists: skip.

SWEEP H — Broken ARIA id references:
  Using your Phase 1 id inventory: for every aria-labelledby, aria-describedby, or aria-controls attribute, check each referenced id. If the id does NOT exist anywhere in the document AND your Phase 1 inventory is complete → report (HIGH).

SWEEP I — Toggle/disclosure buttons missing aria-expanded (SC 4.1.2):
  For every <button> (or role="button") controlling expandable/collapsible content (has aria-controls, or class/text includes: toggle, expand, collapse, accordion, hamburger, menu, submenu, dropdown, disclosure, show, hide): if no aria-expanded attribute → report (HIGH).

SWEEP J — Personal data inputs missing autocomplete (SC 1.3.5):
  For every <input>/<select>/<textarea> whose name, id, type, or placeholder contains a personal data signal (name, given-name, family-name, email, phone, tel, address, street, city, postcode, postal, zip, country, birthday, birth, card, credit): if no autocomplete attribute → report (MEDIUM). Do NOT report type: hidden/submit/button/reset/image/checkbox/radio/range/color/file.

COMPLETION CHECK — verify you executed every sweep A through J. If fewer than 8 Issue blocks, you likely missed sweeps.`;
  }

  if (lang === "css" || lang === "scss" || lang === "sass" || lang === "less") {
    return `
MANDATORY CSS ACCESSIBILITY SWEEPS — run ALL sweeps CSS-A through CSS-H against your Phase 1 inventory:

⚠ ACTIVATION MANDATE: You MUST execute all CSS-A through CSS-H sweeps regardless of whether supplementary WCAG guidance was retrieved. These sweeps operate solely on the CSS source code identified in your Phase 1 inventory. After completing Phase 1, self-verify: a dense stylesheet typically contains 10 or more violations — if your Phase 1 inventory has zero outline:none selectors and zero undersized interactive elements, you have not fully read the file. Re-read from line 1 before proceeding to the sweeps.
⚠ BASE-SELECTOR REMINDER: outline:none and outline:0 most commonly appear in BASE component rules — e.g. .btn { outline: none }, .tab { outline: 0 }, .form-input { outline: none } — NOT only in :focus or :focus-visible pseudo-class rules. Your Phase 1 outline inventory must include both base-class rules and pseudo-class rules. If you recorded only :focus-scoped selectors, return and scan the stylesheet for base component class rules that also suppress the outline.

Execute every sweep below fully and independently. Supplementary WCAG guidance that follows is reference-only — it does not replace or skip any sweep.

PHASE 1 CSS — before any sweep, build this inventory:
  • Every rule containing outline: none, outline: 0, or outline: transparent — record its selector. Do NOT limit this to :focus or :focus-visible rules; base component rules (e.g. .btn { outline: none }, .tab { outline: 0 }) count equally and each is a separate inventory entry.
  • Every selector targeting a potentially interactive element (button, a, input, select, textarea, summary, [role="button"], [role="tab"], [role="menuitem"]) that sets an explicit height, width, min-height, or min-width value in px. Also include any class-based selector whose name suggests it is applied to a button-like component, navigation item, form control, icon button, skip link, or interactive card — the exact class names vary per project (they might be .btn, .tab, .chip, .pill, .icon-btn, .nav-link, .skip-link, .form-input, .checkbox, or project-specific names). Look for any class applied to clickable or focusable elements that records a px size.
  • Every @media (prefers-reduced-motion) block — record which selectors and properties it covers.
  • Every @media (forced-colors: active) block — note whether it exists.
  • The sr-only / visually-hidden / screen-reader-text utility class declaration (if present) — record every property it sets.
  • Every word-spacing or letter-spacing value that is negative.
  • Every rule that sets text-decoration: none on a, a:link, or a:visited selectors.

SWEEP CSS-A — Focus indicator removed without replacement (HIGH):
  For every selector in your Phase 1 outline inventory — whether a base component selector (any project-specific class applied to buttons, links, inputs, navigation items, cards, icon buttons, checkboxes, or other interactive elements) OR a :focus / :focus-visible pseudo-class rule:
  Check whether that selector — or a paired rule for the same base selector — provides a visible alternative: box-shadow, border with a visually distinct colour, or outline with a non-zero value.
  If no visible alternative exists → report "focus indicator removed without replacement on <selector>" (HIGH), one Issue block per selector.
  Do NOT skip base-class selectors because they lack a :focus pseudo-class — a base rule setting outline: none removes the focus ring in ALL states including keyboard focus.
  ⚠ CRITICAL: outline-offset is NOT a visible focus ring. A rule that sets only "outline: none; outline-offset: Xpx" and nothing else is a VIOLATION — the offset applies to a zero-width outline and renders nothing. Only skip reporting if the same rule-block also contains box-shadow, a non-transparent border, or a non-zero outline value.
  Do NOT report a :focus or :focus-visible rule if its own rule-block also sets box-shadow, a visible border, or a non-zero outline — that IS the replacement style, not a violation.
  Skip outline removal on non-interactive structural containers (div, p, section, article, ul, li) where keyboard focus is not expected.

SWEEP CSS-B — Touch target too small (MEDIUM):
  For every interactive-element selector in your height/width/min-height/min-width inventory: if the explicitly-set height, width, min-height, OR min-width is below 24px → report "touch target below minimum size: <selector> height/width <value>" (MEDIUM). You MUST quote the exact pixel value from the source (e.g. "height: 20px").
  If the value is 24–43px AND the same rule-block (or a directly paired rule) has padding less than 8px on the height/width axis → report as a potential violation — "touch target may be below 44px recommended size: <selector>" (MEDIUM). If padding ≥ 8px per side is present in the same rule or an immediately paired rule, skip it — the effective touch area is compliant.
  Do NOT report elements that have no explicit height, width, min-height, or min-width rule.
  Do NOT report touch target issues on elements whose class name ends in -sm, -xs, or similar size variants unless you have confirmed the exact px value AND absence of compensating padding.

SWEEP CSS-C — Broken visually-hidden utility (HIGH):
  Inspect the sr-only / visually-hidden / screen-reader-text utility rule. A correct implementation uses: position: absolute, very small dimensions (1px × 1px or equivalent), clip or clip-path, and does NOT use display: none or visibility: hidden.
  If the utility uses display: none or visibility: hidden → report "visually-hidden utility removes content from screen readers" (HIGH).

SWEEP CSS-D — Motion animation without prefers-reduced-motion override (MEDIUM):
  For every transition or animation that causes spatial movement (transition: transform ..., animation: slide/fade-in/bounce, transform with translate/scale/rotate): if no @media (prefers-reduced-motion: reduce) rule disables or overrides that specific motion for that selector → report "motion animation missing prefers-reduced-motion override: <selector>" (MEDIUM).
  Do NOT report opacity-only or colour-only transitions. Do NOT report if the selector is already covered by a reduced-motion override.

SWEEP CSS-E — Negative word-spacing (MEDIUM):
  If any rule sets word-spacing to a negative value → report "negative word-spacing impairs readability: <selector>" (MEDIUM).

SWEEP CSS-F — Colour contrast failure — only when both values confirmed (HIGH):
  Only report a colour contrast issue when you can find BOTH the foreground colour value AND the background colour value from the CSS in the same file (literal hex, rgb(), or a custom property whose value is defined in the same file). Do NOT estimate from colour names alone.
  If both values are present and their contrast ratio is clearly below 4.5:1 for normal text or below 3:1 for large text (18px+ or 14px+ bold) → report "insufficient colour contrast: foreground <value> / background <value> ratio <ratio>:1" (HIGH).

SWEEP CSS-G — No forced-colors/high-contrast support (MEDIUM):
  If the stylesheet sets colour or background-color on interactive elements (buttons, links, focus rings) AND there is NO @media (forced-colors: active) block anywhere in the file → report "no forced-colors/high-contrast-mode override present" (MEDIUM).

SWEEP CSS-H — Link underlines removed with no alternative (MEDIUM):
  If any rule explicitly removes underlines from body-text links (text-decoration: none on a, a:link, a:visited) AND no other non-colour visual differentiator (font-weight increase, border-bottom, background highlight on :hover) is provided → report "link underline removed — colour alone distinguishes links from surrounding text" (MEDIUM), SC 1.4.1.

COMPLETION CHECK — before finalising output:
  Verify you executed every sweep above (CSS-A through CSS-H) using your Phase 1 inventory.
  If you have produced fewer than 10 Issue blocks, you almost certainly did not complete every sweep.
  Return to the sweep list and run each one explicitly before writing output.
  Note: each distinct selector in your Phase 1 outline inventory (CSS-A) and each distinct selector below the size threshold (CSS-B) is a separate Issue block — a stylesheet applying outline: none across 15 component selectors is 15 separate issues.
  A dense stylesheet typically yields 20–50 separate issues across all sweeps; if you have fewer than 10, return to CSS-A and ensure you reported every selector in your Phase 1 outline inventory that lacks a visible focus replacement.
  ⚠ FALSE-POSITIVE CHECK: Before reporting each issue, verify you can quote the exact CSS property and value from the source file that causes it. If you cannot point to a specific rule — for example if you are estimating a touch-target size from a class name rather than a measured px property, or asserting a reduced-motion violation without finding both the animation and the absence of the @media (prefers-reduced-motion) override in Phase 1 — omit that issue. Do not report inferred or estimated violations.
  ⚠ FP CHECK: If you have identified more than 40 CSS issues, re-verify each one before writing it. For each issue ask: "Can I quote the exact selector and property from the source that causes this?" Remove any issue where the answer is no. Both missed issues and false positives harm users — report everything you can directly confirm from the source.
`;
  }

  if (lang === "javascript" || lang === "typescript") {
    return `
MANDATORY JAVASCRIPT ARIA SWEEPS — run ALL sweeps JS-A through JS-G against your Phase 1 inventory:

Execute every sweep below fully and independently. Supplementary WCAG guidance that follows is reference-only — it does not replace or skip any sweep.

PHASE 1 JS — before any sweep, build THREE explicit lists:

  LIST 1 — JS INTERACTION TABLE: scan the ENTIRE file for functions and event listeners that change visible DOM state. Look for:
    • Function declarations/methods with names containing: toggle, open, close, expand, collapse, show, hide, activate, deactivate, submit, change, select
    • All addEventListener calls (including those nested inside DOMContentLoaded, window.onload, module constructors, or class methods)
    • All on* event handlers (onclick, onchange, onsubmit, onblur, onfocus, etc.)
    • All visible DOM mutations: classList.toggle(), classList.add(), classList.remove(), style.display changes, innerHTML/textContent writes, setAttribute/removeAttribute calls
    
    CRITICAL PATTERN DETECTION — do not skip nested handlers:
    - Handlers inside window.addEventListener('DOMContentLoaded', ...) callback
    - Handlers inside module IIFE (function(){...}()) bodies
    - Handlers inside class constructors or method definitions
    - Nested callbacks inside promise .then() chains or async/await handlers
    
    For each handler/function record: (a) exact name, (b) trigger (event type), (c) target selector or element, (d) visible change it causes, (e) does it update aria-expanded/aria-pressed/aria-invalid?, (f) does it write to aria-live region?

  LIST 2 — VALIDATION FUNCTIONS: Find every function whose name suggests validation (validate, check, isValid, checkValidity, onSubmit, handleSubmit, onBlur, handleBlur, onInput, onChange, handleChange on form fields). Search patterns: "validate(", "isValid(", "onSubmit", "handleSubmit", "checkField", "validateInput", "isError". For each: does it call setAttribute('aria-invalid','true') when marking field invalid? Does it call setAttribute('aria-invalid','false') or removeAttribute('aria-invalid') when clearing error?

  LIST 3 — VISIBILITY-TOGGLED ELEMENTS: Find every place where display:none, visibility:hidden, or aria-hidden is set/removed programmatically. Look for patterns: element.style.display = 'none', element.classList.add('hidden'), element.setAttribute('aria-hidden', 'true'), element.setAttribute('hidden', ''), and their inverse patterns showing/revealing the element. For each: (a) element selector, (b) function that hides/shows it, (c) is aria-hidden set when hidden?, (d) is aria-hidden removed when shown?


SWEEP JS-A — Toggle functions not updating aria-expanded (HIGH):
  For every entry in LIST 1 (JS Interaction Table) that represents a function changing visibility of a panel/menu/accordion/dropdown/combobox:
  ⚠ SPECIFIC PATTERN CHECK: The function body must contain at least one of these patterns:
    - setAttribute('aria-expanded', true/false) or setAttribute("aria-expanded", "true"/"false")
    - .ariaExpanded = 'true' or .ariaExpanded = 'false'
    - el.setAttribute('aria', 'expanded') — NO, this is incorrect and counts as missing
  Look for these patterns being called on the TRIGGER ELEMENT (button, link, element with role="button") that controls the panel.
  If the function changes classList (adding/removing 'open', 'expanded', 'active', 'visible', 'is-active' etc.) or style.display to show/hide — but does NOT update aria-expanded — report "toggle function does not update aria-expanded on trigger element" (HIGH), naming the function name and the trigger element selector if available.
  Also check: is the paired close/hide function equally missing aria-expanded? Report each separately if both lack it.

SWEEP JS-B — Toggle buttons not updating aria-pressed (HIGH):
  For every button or role="button" element in LIST 1 that maintains two mutually-exclusive states (e.g. play/pause, mute/unmute, filter active/inactive, like/unlike, favorite toggle):
  ⚠ SPECIFIC PATTERN CHECK: The handler or click callback must contain:
    - setAttribute('aria-pressed', true/false) or setAttribute("aria-pressed", "true"/"false")
    - .ariaPressed = 'true' or .ariaPressed = 'false'
  Look for these patterns in the handler that toggles the button's visual state (classList toggle between 'active'/'inactive', style change, etc.).
  If the state toggle exists but aria-pressed is not updated → report "toggle button does not update aria-pressed" (HIGH), naming the button selector and handler name.

SWEEP JS-C — Dynamic content updates not announced via live region (MEDIUM):
  For every entry in LIST 1 where the visible change is one of: filter results refresh, search result count update, mode/view label change, wizard step label change, status indicator update, error/success message appearance:
  ⚠ SPECIFIC PATTERN CHECK: Immediately after the DOM update (same function or a called cleanup/update function), does the code:
    - Find or reference an element with role="status", role="alert", aria-live="polite", or aria-live="assertive"?
    - Write to that element using .textContent = ... or .innerHTML = ... or appendChild() of new content?
  If NO aria-live write is found or if the live region exists but is never populated after this action → report "dynamic content update not announced to screen readers" (MEDIUM), naming the action and element.

SWEEP JS-D — Form validation errors not reflected in aria-invalid (HIGH):
  For every entry in LIST 2 (validation functions):
  ⚠ SPECIFIC PATTERN CHECK: When the function marks a field as invalid (adds error class like 'is-error', 'error', 'invalid'), display error message, or sets another visual error indicator:
    - Does the same code path call setAttribute('aria-invalid', 'true') on that input?
    - Does the function call element.setAttribute('aria-invalid', 'false') or removeAttribute('aria-invalid') when clearing the error?
  If the validation sets an error state but does NOT call setAttribute('aria-invalid','true') → report "form validation error not reflected in aria-invalid" (HIGH), naming the field and validation function.
  If the validation clears errors but does not reset aria-invalid to 'false' → report "aria-invalid not cleared on valid input" (MEDIUM).

SWEEP JS-E — aria-expanded not initialised at page load (MEDIUM):
  For every toggle widget (nav drawer, accordion, dropdown, combobox) in LIST 1 that starts in a closed/hidden state:
  ⚠ SPECIFIC PATTERN CHECK: Is there initialization code (inside DOMContentLoaded, window.onload, module init(), or constructor) that:
    - Calls setAttribute('aria-expanded', 'false') on the trigger button/element?
    - Calls element.setAttribute('aria-controls', <controlledElementId>) to link trigger to controlled region?
  If NO initialization code sets aria-expanded to the initial state → report "aria-expanded not initialised on page load" (MEDIUM), naming the widget and trigger element.
  If aria-controls is missing and the controlled element has an id attribute → report "toggle trigger missing aria-controls attribute" (MEDIUM).

SWEEP JS-F — Dynamically-hidden elements not removed from accessibility tree (MEDIUM):
  For every entry in LIST 3 (visibility-toggled elements):
  ⚠ SPECIFIC PATTERN CHECK: When the element is hidden:
    - If hidden via CSS CLASS removal (e.g., element.classList.remove('visible'), element.classList.remove('show'), element.classList.remove('open'), and the CSS class causes display:none or visibility:hidden) — this is SUFFICIENT. No aria-hidden needed. Skip it.
    - If hidden via style property (element.style.display = 'none' or element.style.visibility = 'hidden') — this is SUFFICIENT. Skip it.
    - If hidden via OFF-SCREEN positioning (element.style.transform = 'translateX(-9999px)', margin-left: -9999px, position: absolute with no display property) — aria-hidden IS required. If not set, report "dynamically-hidden element not removed from accessibility tree; consider aria-hidden=true" (MEDIUM).
  For the show/reveal path: is an explicit aria-hidden="true" that was programmatically set being removed? If the code set aria-hidden="true" on hide, it must set aria-hidden="false" or removeAttribute('aria-hidden') on show. If not, report.
  Do NOT report elements that are hidden with aria-hidden from page load and never shown dynamically.

SWEEP JS-G — User actions with no live-region announcement (MEDIUM):
  For every entry in LIST 1 that causes one of these visible changes: filter/search result update, result count change, mode/view switching, accordion open/close, drawer open/close, wizard/stepper progression, page scroll (e.g. scroll-to-top), suggestion list update, billing plan selection, product quantity change:
  ⚠ SPECIFIC PATTERN CHECK: After the DOM change, is there a call to update an aria-live region?
    - querySelector('[aria-live]') or similar to find the region
    - textContent/innerHTML write to populate the region with announcement text
    - timing: does the update happen synchronously or in a micro-task after the DOM change?
  If the action causes visible change but NO aria-live update is found → report "user action result not announced via aria-live region" (MEDIUM), naming the action, element, and visible change.
  Do NOT report if: (a) the handler calls element.focus() on newly revealed content (focus movement is an acceptable alternative), or (b) the change navigates to a new page/route (not a live-region use case).

COMPLETION CHECK — before finalising output:
  Verify you executed every sweep above (JS-A through JS-G) using your Phase 1 inventory.
  If you have produced fewer than 10 Issue blocks, you almost certainly did not complete every sweep or did not capture all handlers during Phase 1.
  Return to Phase 1 and re-scan the file for nested event listeners, handlers inside init callbacks, and handlers in class methods. Then re-execute the sweeps.
  A medium-density JS file typically yields 15–25 statically-detectable issues; a high-density file with many interactive handlers typically yields 25–50. Each unique function or element is a separate Issue block.
  If you identified more than 50 issues, spot-check 5 randomly selected issues to verify they are not duplicates.
`;
  }

  if (lang === "javascriptreact" || lang === "typescriptreact") {
    return `
MANDATORY TSX/JSX ARIA SWEEPS — run ALL sweeps TSX-A through TSX-K against your Phase 1 inventory:

Execute every sweep below fully and independently. Supplementary WCAG guidance that follows is reference-only — it does not replace or skip any sweep.

PHASE 1 TSX — before any sweep, build this inventory:
  • Every component with a boolean state variable that shows or hides content: state variables named isOpen, isExpanded, isMenuOpen, showDropdown, open, expanded, visible, isDialogOpen, etc.
    For each: does the trigger element (button, or element with role="button") receive an aria-expanded={stateVar} prop?
  • Every <svg> element or named icon component (<ChevronIcon>, <CloseIcon>, <ArrowIcon>, <StarIcon>, <SpinnerIcon>, <SearchIcon>, etc.): does it have aria-hidden={true} or a role="img" + aria-label?
  • Every form field component (<input>, <textarea>, <select>, or custom Input/TextInput/Select): does it have (a) a <label htmlFor={id}> or aria-label, (b) an aria-invalid prop when in error state, (c) aria-required or the HTML required attribute when required?
  • Every tab, filter pill, pricing plan card, or toggle button whose active/selected state is tracked (isSelected, isActive, activeTab, currentPlan, selectedFilter, isChecked): does the element receive aria-selected, aria-pressed, or aria-checked matching that state?
  • Every navigation list: do active/current-page links receive aria-current="page"?
  • Every button with a loading/submitting state (isLoading, isSubmitting, isSaving): does it receive aria-busy={isLoading}?
  • Every spinner component rendered during loading: does it have aria-hidden={true}?
  • Every <section>, <nav>, <aside> appearing more than once — does each have aria-label or aria-labelledby?
  • Every <article> in a repeated card or grid context (pricing plans, product cards, feature cards, testimonial cards, team members, etc.): record the first heading text inside each; does the article have aria-labelledby referencing that heading's id? Also note any star-rating or review widget in any such card — does the widget container have role="img" + aria-label, or do individual interactive stars have role="radio" + aria-label each?
  • Every decorative overlay, backdrop, skeleton, cloned template element, or visually-duplicated grid item: does each have aria-hidden={true} to prevent duplicate or meaningless content being read by assistive technology?
  • Every named page-section component that wraps a <section> or <nav>: does the underlying element have aria-labelledby referencing its visible heading, or an aria-label? This applies to any section component whose name suggests a distinct page region (hero, stats, features, pricing, integrations, testimonials, navigation, etc.).
  • Every group of related controls rendered inside a section whose purpose is not already conveyed by a surrounding heading (e.g. a button group, a trust-badge row, a social-proof strip, an account action bar): does each group have an aria-label identifying what it contains?

SWEEP TSX-A — Disclosure toggle components missing aria-expanded (HIGH):
  For every component using a boolean to control a show/hide region: if the trigger element does NOT receive aria-expanded={stateVariable} → report "toggle component trigger missing aria-expanded prop" (HIGH), naming the component, the trigger element, and the state variable.

SWEEP TSX-B — Decorative icon components not hidden from assistive technology (MEDIUM):
  For every <svg> or named icon component rendered inside an element that already has text content or an aria-label: if the icon has no aria-hidden={true} prop → report "decorative icon missing aria-hidden={true}" (MEDIUM), naming the icon and its parent context.
  Do NOT report icon components that ARE the sole accessible name of their parent (those need an aria-label instead).

SWEEP TSX-C — Icon-only interactive elements missing accessible names (HIGH):
  For every button, link, or role="button"/"link" element whose only content is an icon (no visible text, no aria-label, no aria-labelledby, no title): report "icon-only interactive element missing accessible name" (HIGH), naming the component.

SWEEP TSX-D — Form fields missing label, aria-invalid, or aria-required (HIGH):
  For every form input component such as <input type="text|email|number|password">, <textarea>, <select>, or custom Input/TextInput/Select/Checkbox/Radio component:
  ⚠ CHECK SEQUENCE (perform all checks for each input field):
  (1) LABEL ACCESSIBILITY:
    - Does the component have a JSX <label htmlFor={inputId}>? Check the JSX tree for a <label> element with a htmlFor prop that matches this input's id.
    - OR does it have an aria-label prop? Check the component's props for aria-label="...".
    - OR does it have an aria-labelledby prop? Check if that element exists in the rendered tree.
    - If NONE of these exist → report "form field missing accessible label" (HIGH), naming the input name/placeholder and its location in the component.
  (2) ERROR STATE MARKING:
    - Is there a conditional that renders the field with an error/invalid class (error, invalid, is-error, is-invalid)?
    - Does the same condition or handler pass aria-invalid={{ error: true }} or aria-invalid={isInvalid}?
    - If the error state exists but aria-invalid is NOT set → report "form field missing aria-invalid prop on error state" (HIGH), naming the field.
  (3) REQUIRED STATE MARKING:
    - Is this field marked with required={true} or required? Check the JSX prop
    - OR does it have aria-required="true"? Check the aria-required prop.
    - If NEITHER exists and the form context treats this field as required → report "required field not programmatically marked as required" (HIGH), naming the field.
  (4) ERROR MESSAGE LINKING:
    - If an error message is conditionally rendered (e.g. {error && <span>{error}</span>}), does it have an id attribute?
    - Does the input have aria-describedby pointing to that error's id?
    - If the error is rendered but NOT linked via aria-describedby → report "form field error message not connected via aria-describedby" (MEDIUM).

SWEEP TSX-E — Interactive state not communicated to assistive technology (HIGH):
  ⚠ STATE TRACKING PATTERNS: Scan Phase 1 inventory for state variables. For each state-tracked interactive element:
  For every tab, filter button, pricing plan card, or two-state toggle whose state is tracked by a boolean or enum:
  (1) TAB AND SELECTED-STATE ELEMENTS:
    - Element name/text: "Tab X", "Filter Y", "Plan Z", or identified by className containing 'tab', 'filter', 'plan', 'option', 'choice', 'card'
    - State variable found in JSX: isSelected={stateVar}, active={stateVar}, selected={stateVar}, isActive={stateVar}, isCurrent={stateVar}, etc.
    - REQUIRED PROPS ON THE ELEMENT:
      * For tabs and generic toggles: aria-selected={stateVar} (not aria-pressed or aria-checked unless the element is explicitly a button/pressure-based control)
      * For button-like toggles (play/pause, favorite, like): aria-pressed={stateVar}
      * For radio-like toggles (exclusive selection): aria-checked={stateVar}
    - If the state variable exists but the CORRECT ARIA PROP is missing → report "state variable updating but missing corresponding ARIA prop: [expected aria-XYZ, not found]" (HIGH), naming the element and state variable.
  (2) DO NOT REPORT if: clickHandler props exist but the component is still dumb (passes through state correctly). DO CHECK the prop name matches the state (e.g. if stateVar is isExpanded but prop is aria-selected, that's a mismatch — report it).

SWEEP TSX-F — Landmark and card regions missing accessible names (MEDIUM):
  For every <section>, <nav>, or <aside> that appears more than once: if neither aria-label nor aria-labelledby is present → report "repeated landmark region missing accessible name" (MEDIUM), naming the element and approximate location.
  For every <article> component in a repeated card/grid context (pricing plans, feature cards, testimonials): if no aria-labelledby references a heading inside it → report "card article missing accessible name via aria-labelledby" (MEDIUM), naming the component and location.

SWEEP TSX-G — Required-field markers not properly managed (MEDIUM):
  If a required-field visual marker (<span>*</span>) is rendered: (a) without aria-hidden={true} → report "required-field marker announces bare asterisk to AT — add aria-hidden" (LOW); (b) with aria-hidden={true} but the input has neither aria-required nor required → report "required field marked visually only — add aria-required or required attr" (HIGH).

SWEEP TSX-H — Loading state not communicated (MEDIUM):
  For every button with isLoading/isSubmitting state: if no aria-busy={isLoading} prop → report "loading button missing aria-busy" (MEDIUM). For every spinner rendered during loading without aria-hidden={true} → report "spinner icon missing aria-hidden" (MEDIUM).

SWEEP TSX-I — Active navigation items missing aria-current (MEDIUM):
  For every navigation link with an active/current-page indicator (isActive prop, className containing 'active'/'current'/'selected'): if no aria-current="page" prop is applied → report "active navigation link missing aria-current" (MEDIUM).

SWEEP TSX-J — Page-section components and card grids missing accessible names (MEDIUM):
  Using your Phase 1 named-section inventory, apply these checks to whichever patterns exist in the file:
  • Any <section> or region component used as a major page section (hero/banner, statistics display, feature grid, pricing grid, testimonial section, integration showcase, etc.) — must have aria-labelledby referencing its visible heading, or an aria-label. Report each missing label as a separate issue.
  • Any sub-group of related controls rendered inside a section whose purpose is not conveyed by a surrounding <h1>–<h6> (e.g. a row of CTA buttons, a strip of trust badges, a group of social proof items) — must have an aria-label naming the group.
  • Each <article> in a repeated card grid — check the heading text you recorded in Phase 1; the article must have aria-labelledby pointing to that heading's id. Also check that the card's primary CTA link or button has an aria-label that includes the item name.
  • If more than one <nav> element exists — each must have a unique aria-label distinguishing it (e.g. "Main", "Mobile", "Breadcrumb", "Footer").
  • Any element that is a DOM duplicate of visible content (cloned for layout purposes, skeleton placeholders, off-screen template copies) — must have aria-hidden={true}.
  For each missing accessible name or unlabelled duplicate → report "page-section or card component missing accessible name" (MEDIUM), identifying the component and the specific missing label.

SWEEP TSX-K — Star ratings and review widgets missing accessible semantics (HIGH):
  ⚠ MANDATORY ACTIVE SEARCH: This sweep is required even if no star or rating elements are immediately obvious. Before marking this sweep complete, actively search for:
    • Any named icon component containing 'star', 'star-filled', 'star-empty', 'rating', 'half-star': <StarIcon>, <FillStar>, <RatingIcon>, <FilledStar>, <EmptyStar>, <HalfStar>, <Star>
    • Any <svg> element inside a conditional width or opacity calculation (indicators of scale/rating)
    • Any component whose name contains 'star', 'rating', 'score', 'review', 'rank': <StarRating>, <RatingComponent>, <ReviewStars>, <ScoreDisplay>, <RankingWidget>
    • Any group of 4–5 sibling icon/span elements with identical or similar classes that could represent a rating scale (look for map() loops or hard-coded repetition of icons)
    • Any numeric display adjacent to icon elements (text pattern: "4.8 stars", "4.8 out of 5", "rating: 4.5", "★★★★☆ 4/5", etc.)
  
  For EVERY star-rating, score display, or review-count widget discovered:
  
  (A) READ-ONLY STAR RATING WIDGET (display-only, not user-selectable):
    - Container must have role="img" to indicate it's a single composite image
    - Container must have aria-label that includes: the numerical value AND the scale (e.g., "4 out of 5 stars", "4.8 stars")
    - Individual star icons inside must have aria-hidden={true} because they're decorative within the labelled composite
    - If the container has NEITHER role="img" NOR aria-label, OR if individual stars are not aria-hidden → report "read-only star rating widget missing accessible structure: needs role='img' + aria-label on container and aria-hidden on individual star icons" (HIGH)
  
  (B) INTERACTIVE STAR RATING WIDGET (user can select a star to submit a rating):
    - Container should have role="radiogroup" (optional but recommended)
    - Each individual star must have role="radio" and aria-label (e.g., "1 star", "2 stars", "3 stars", etc.)
    - Selected star must have aria-checked="true", unselected must have aria-checked="false"
    - If individual stars lack role="radio" or aria-label, OR if aria-checked is not managed → report "interactive star rating missing radio role and individual star labels" (HIGH), naming the component and the specific missing attributes
    - If stars have onClick handlers but no tabindex and no keyboard support → report "interactive star rating widget not keyboard accessible" (MEDIUM)
  
  (C) REVIEW-COUNT DISPLAY (e.g., "based on 1,247 reviews", "4.8 avg from 382 ratings"):
    - This is a text-only indicator of aggregated score; it does NOT require role="img" unless it also contains visual star icons
    - If visual stars are rendered as decoration next to review counts, those stars must have aria-hidden={true}
    - If the review count text itself is hidden from AT (e.g., display:none, visibility:hidden), it should be aria-hidden={true}; if it's visible text, no special ARIA required
    - If decorative stars are present but not aria-hidden → report "review count stars missing aria-hidden" (MEDIUM)
  
  ⚠ SEVERITY UPGRADE: If any interactive star widget lacks role="radio" + aria-label per star, this is HIGH because users cannot use screen readers to select ratings. If read-only stars lack role="img" + aria-label, this is HIGH because the rating value is not announced. Do not classify these as MEDIUM.
  
  ⚠ ALSO CHECK: If a star rating component has an onClick or onChange handler but NO aria-label on the container, assume it's interactive and apply rule (B). If the handler updates a state variable representing the user's selection, confirm role="radiogroup" + role="radio" + aria-checked semantics are in place.

COMPLETION CHECK — before finalising output:
  Verify you executed every sweep above (TSX-A through TSX-K) using your Phase 1 inventory.
  If you have produced fewer than 8 Issue blocks, you almost certainly did not complete every sweep.
  Return to the sweep list and run each one explicitly before writing output.
`;
  }

  if (lang === "vue") {
    return `
VUE-SPECIFIC RULES:
11. @click on a non-<button>/non-<a> element must have role, tabindex="0", @keydown.enter, and @keydown.space — report any missing piece as a single grouped issue.
12. v-show hides via CSS display:none but does NOT set aria-hidden — if the hidden content must be invisible to assistive technology too, add :aria-hidden="!isVisible" alongside v-show.
13. <img> without :alt or a static alt attribute = missing alt text (HIGH).
14. <transition> or <transition-group> with visible animation: check that the accompanying CSS has a @media (prefers-reduced-motion: reduce) override — report if absent.
15. v-for list items that are interactive must each have a unique accessible name and be keyboard-reachable.`;
  }

  if (
    lang.includes("angular") ||
    languageId.includes("@Component") ||
    languageId.includes("*ngIf")
  ) {
    return `
ANGULAR-SPECIFIC RULES:
11. (click) binding on a <div>/<span> without [attr.role] and a (keydown) handler = keyboard inaccessibility — report as grouped issue if multiple elements affected.
12. *ngIf that shows/hides a component which manages focus: require CDK FocusTrap or explicit return-focus logic — report if neither is present.
13. Reactive form controls (<input>, <select>, <textarea>) without an associated <label [for]> or [attr.aria-label] = form labelling issue.
14. Error messages displayed via *ngIf must have role="alert" or aria-live="assertive" to be announced automatically.
15. MatDialog / CdkDialog opened without cdkFocusInitial or FocusTrap = focus not managed on open.`;
  }

  // HTML or unrecognised — main rules already cover it
  return "";
}

// Returns extra WHAT TO CHECK items relevant only to specific languages.
// CSS/JS/TSX use structured sweeps in getLangSpecificRules; this supplements HTML and other langs.
function getLangSpecificChecks(languageId: string): string {
  const lang = languageId.toLowerCase();

  if (lang === "vue") {
    return `
- @click on non-button/non-anchor elements: role + tabindex + @keydown.enter + @keydown.space
- v-show used without :aria-hidden counterpart for AT visibility
- <img> missing :alt or static alt; <input> missing associated label
- <transition>/<transition-group> without prefers-reduced-motion CSS guard
- v-for interactive items: accessible name uniqueness and keyboard reachability`;
  }

  if (
    lang.includes("angular") ||
    languageId.includes("@Component") ||
    languageId.includes("*ngIf")
  ) {
    return `
- (click) on <div>/<span> without [attr.role] + (keydown) keyboard handler
- *ngIf focus loss: CDK FocusTrap or explicit focus-return on hide
- Reactive form controls without <label [for]> or [attr.aria-label]
- Error messages via *ngIf without role="alert" or aria-live="assertive"
- MatDialog / CdkDialog without cdkFocusInitial or FocusTrap`;
  }

  return "";
}

// Anti-hallucination supplement injected after the code, before RAG context.
// Identical to the ANTI_FP_SUPPLEMENT used in the kimi+qwen benchmark evaluation.
const ANTI_FP_SUPPLEMENT = `
ADDITIONAL ANTI-HALLUCINATION RULES (supplement to the rules above):

[i]  href="#" is a VALID href value. Do NOT flag it as "invalid href", "empty href", or a link-vs-button violation. Only flag an <a> as misused when it has NO href attribute at all.
[ii] target="_blank" is NOT a WCAG 2.2 failure. Do not report it.
[iii] autocomplete compound values are VALID per WHATWG spec (e.g. "work email", "home tel"). Do not flag these. If you are not certain an autocomplete value is invalid, do NOT report it.
[iv] Only flag a <fieldset> as "missing legend" when there is genuinely NO <legend> element as a direct child.
[v]  Do NOT flag missing aria-required on a native <input>, <select>, or <textarea> that already has the HTML required attribute.
[vi] CONFIDENCE GATE — Only report an issue if you can point to the exact element from your Phase 1 inventory. "It is likely", "it may be", or "it possibly" are not grounds for reporting. Always cite a specific selector, line number, or id.
[vii] SWEEP J (autocomplete) — Only flag an <input> if you confirmed during Phase 1 that it collects personal data (name, email, tel, address, city, postcode, zip, country, birthday, card). Do NOT flag search, query, message, subject, comment, username, password, coupon, promo inputs.
[viii] SWEEP H (broken ARIA references) — Only report a broken aria-labelledby / aria-describedby / aria-controls reference if you built a complete id inventory in Phase 1 AND that id is absent. If your id inventory is incomplete, do NOT report any broken references.
[ix]  TABLE HEADER SCOPE — Do NOT flag <th> in a simple unambiguous table where position clearly identifies its axis. Only flag when (a) scope is literally absent AND (b) the table is genuinely ambiguous (multiple <th> in same row or same column position).
[x]   FOCUS INDICATOR REPLACEMENT — outline: none WITH box-shadow/visible border/non-zero outline in the SAME rule-block is NOT a violation. outline-offset alone is NOT a visible focus ring.
[xi]  JS / TSX CITATION RULE — Only report functions, handlers, props, or components that LITERALLY appear in the source code. Do not infer or assume from naming conventions.
[xii] CONDITIONALLY-RENDERED ARIA REFERENCES (TSX/JSX) — aria-describedby on an input referencing a conditionally-rendered error element (e.g. {hasError && <span id="email-error">}) is CORRECT. Do not flag as broken ARIA reference unless NO code path ever renders that id.
[xiii] CSS :focus:not(:focus-visible) { outline: none } is a VALID accessibility pattern — do NOT report it as a violation.
`;

// Build the user prompt with the code to analyze
export function buildAiPrompt(languageId: string, code: string, contextBlock: string): string {
  const langRules = getLangSpecificRules(languageId);
  const langChecks = getLangSpecificChecks(languageId);
  const lang = languageId.toLowerCase();

  return `Perform a thorough WCAG 2.2 accessibility audit of the ${languageId} code below.

OUTPUT FORMAT — use this structure exactly for every issue:

Issue 1: <short title>
  Severity: <HIGH | MEDIUM | LOW>
  Line: <line number(s), comma-separated if same issue on multiple lines>
  Problem: <2–4 sentences: what is wrong and who is affected>
  Fix:
    Line N: <exact corrected code for that line>
    Line N: <exact corrected code for that line>

IMPORTANT — Fix format rules:
- ALWAYS use the "Line N: <code>" format for every line that needs changing, even if only one line is affected.
- One "Line N:" entry per affected line. If 3 lines need changing, write 3 separate "Line N:" entries.
- The code after "Line N:" must be the exact replacement for that line — paste-ready, no ellipsis, no partial snippets.
- If a fix requires adding a NEW line (e.g. inserting an attribute or element), write it as "Line N (add after): <new code>" or "Line N (replace): <new code>" so the location is unambiguous.
- Never write a prose-only Fix (e.g. "Add aria-label to the button") — always show the actual code.

SEVERITY:
- HIGH   = blocks access entirely (WCAG A failure)
- MEDIUM = significantly degrades experience (WCAG AA failure)
- LOW    = minor WCAG A or AA barrier — must still map to a specific WCAG 2.1/2.2 success criterion. Do NOT use LOW for best-practice suggestions, code quality issues, optional ARIA attributes, or AAA-only concerns.

RULES:
1. ONE ISSUE PER ELEMENT — write a SEPARATE Issue block for each individual element that has a problem. Do NOT combine elements into one block. Four images each missing alt text → four separate Issue blocks, one per image.
2. Fix must always use the "Line N: <code>" format for every affected line. Each changed line gets its own "Line N:" entry. Never write a prose-only fix.
3. Skip any category with no matching elements in this code. Do not write "N/A".
4. Do NOT report colour contrast unless both foreground AND background colours are explicitly written inline in this file. Never guess from class names or external CSS.
5. Do NOT suggest redundant ARIA roles that duplicate native HTML semantics (role="banner" on <header>, role="navigation" on <nav>, role="list" on <ul>/<ol>, role="listitem" on <li>, role="button" on <button>, etc.). These are never violations.
5a. Do NOT report code quality or runtime bugs (e.g. infinite loops, missing null checks, network error handling, undefined function references, regex escaping, string sanitisation, performance issues, memory leaks, timeout cleanup, SSR hydration, error swallowing) unless they directly cause an AT user to lose access to content — i.e. they must map to a specific WCAG SC such as 2.1.1, 4.1.2, or 4.1.3.
5b. Every issue you report should map to a recognisable WCAG 2.1 or 2.2 success criterion. If you genuinely cannot identify one, skip the issue. This rule exists to prevent code-quality findings being reported as accessibility violations — it must NOT suppress real WCAG A or AA failures such as missing alt text, missing labels, missing aria-expanded, or broken ARIA references.
5c. Do NOT report character encoding errors, mojibake, or corrupted text in data arrays/string literals — these are data quality issues, not WCAG violations.
5d. Do NOT write a finding that says "no issues found", "no violations detected", or any equivalent. If a section has no violations, produce no output for it — silence is correct.
6. For <a> elements: (a) if an <a> has NO accessible name (no text content, no aria-label, no title, no aria-labelledby) = "missing accessible name" — fix by adding visible text or aria-label; (b) if an <a> HAS visible text content but NO href attribute = "missing href" — fix must add href, NOT add aria-label (the accessible name is already present). Never report the same <a> element for both issues.
7. <div>/<span> with style="width: X%" used as a progress bar must have role="progressbar" aria-valuenow aria-valuemin aria-valuemax — report ALL such elements in ONE block.
8. Only add aria-hidden="true" to purely decorative content. Never hide numbers, labels, status text, or any content that conveys information. If an <img> already has an alt attribute (even alt=""), do NOT suggest adding aria-label — alt fully provides the accessible name for images and is not missing.
9. lang: ONLY report a lang issue if lang is completely absent, or if the majority of visible body text sentences are in a different language. A brand name, site title, or single word in another language does NOT qualify — do not report it.
10. Fix must be in the same language as the audited file (JavaScript, TypeScript, HTML, CSS, etc. — whatever the file being audited is). ONLY report issues that can be fixed directly in THIS file. If the fix would require editing a different file (e.g., HTML template, external stylesheet, external script, a data structure in another module), DO NOT report that issue at all — skip it entirely. Never write "(fix requires changes in external stylesheet/script)".
11. href="#" is a VALID href value. Do NOT flag it as invalid. Only flag an <a> as misused when it has NO href attribute at all.
12. target="_blank" is NOT a WCAG 2.2 failure. Do not report it.
13. autocomplete compound values (e.g. "work email", "home tel") are valid per WHATWG spec. Do not flag them. Only flag autocomplete for personal data inputs (name, email, tel, address, birthday, card) when autocomplete is completely absent. Do NOT flag search, username, password, comment, subject, coupon, or promo inputs.
14. Only report a broken aria-labelledby / aria-describedby / aria-controls reference if you confirmed in Phase 1 that the referenced id is absent from the entire document. If your Phase 1 id inventory is incomplete, skip all broken-reference reports.
15. Do NOT flag missing aria-required on an <input> that already has the HTML required attribute.
16. Only flag a <fieldset> as "missing legend" when there is genuinely NO <legend> element as a direct child.
17. TABLE HEADER SCOPE — Only flag a <th> as "missing scope" if (a) the scope attribute is literally absent AND (b) the table is ambiguous: the header row has more than one <th>, or multiple <th> elements appear in the same column position across rows. Do NOT flag every <th> in a simple table where position is unambiguous.
18. FOCUS INDICATOR REPLACEMENT — A CSS rule that sets outline: none AND provides a visible alternative in the SAME rule-block (box-shadow, visually distinct border, or non-zero outline) is NOT a violation. outline-offset alone is NOT a visible focus ring.
19. CONFIDENCE GATE — Only report an issue if you can point to the exact element from your Phase 1 inventory. Hedged language ("may be", "possibly", "it is likely") means skip. Always cite the specific selector, line number, or id.
${langRules}

WHAT TO CHECK — only for elements that actually appear in the code:
- Images: alt text on <img>, <svg> with title/aria-label, empty <figure>
- Forms: labels for inputs, error messages, required fields, autocomplete
- Keyboard: interactive elements reachable by keyboard, focus indicators, tabindex misuse, non-native interactive elements missing role/keyboard handler
- Structure: page lang, heading hierarchy, landmark regions, skip links
- ARIA: correct roles/states/properties; live regions; no redundant roles; dialogs need aria-modal and focus management
- Links & buttons: empty <a>, <a> without href, <button> misused as link, <div>/<span> used as interactive without role and keyboard support
- Tables: <th> with scope, <caption>, headers on complex tables
- Media: captions on <video>/<audio>, no autoplay without controls
- Progress & status: <div>/<span> progress bars without role="progressbar"/aria-valuenow/min/max; status indicators without role="status"
- Motion & animation: CSS animation/transition/@keyframes without prefers-reduced-motion; autoplay carousels without pause control
- Timing: setTimeout/setInterval/meta refresh without user control or warning
- Touch & pointer: drag operations without single-pointer alternative; target size below 24×24 px when explicit width/height is set inline${langChecks}

${lang === 'html' ? '' : ''}

CODE TO AUDIT (${languageId}):
${code}
${ANTI_FP_SUPPLEMENT}
SUPPLEMENTARY WCAG GUIDANCE (retrieved — consult after reading the code above):
${contextBlock}`;
}
