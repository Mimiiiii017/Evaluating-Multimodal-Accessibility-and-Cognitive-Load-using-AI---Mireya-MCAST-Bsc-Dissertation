# EAA Detection and Reporting: Practical Code Guidance

## Tags
Tags: #eaa #en301549 #wcag #html #css #js #tsx #1.1.1 #1.3.1 #1.3.5 #1.4.3 #2.1.1 #2.4.4 #2.4.7 #3.3.1 #3.3.8 #4.1.2 #4.1.3

Use this guide to frame accessibility violation reports in terms of both WCAG 2.2 and EAA regulatory obligations. Apply the FIRES / DOES NOT FIRE rules below when deciding whether to report an issue as an EAA compliance risk.

---

## EAA-Specific SC 3.3.8 — Accessible Authentication (Minimum) [WCAG 2.2 NEW]

**FIRES when:** a login, account creation, or security verification flow requires the user to solve a cognitive function test (e.g. CAPTCHA, memorising a password without a paste alternative, transcribing characters from an image) WITHOUT providing an accessible alternative such as:
- An object recognition task with a text alternative, OR
- A personal content recognition task (e.g. "select the photos you uploaded"), OR
- A mechanism that allows email/link-based authentication instead

**DOES NOT FIRE when:**
- The authentication step only requires copying a code from a separate device (physical security key, authenticator app push notification)
- Biometric authentication is provided as the primary method
- The CAPTCHA has an audio alternative AND the user can bypass the CAPTCHA via email link

**EAA mandate:** EN 301 549 clause 9.3.3.8 (Level AA) — in force from June 2025 for all in-scope EAA services.

```html
<!-- FIRES: CAPTCHA with no alternative -->
<form>
  <img src="/captcha.png" alt="">
  <input type="text" placeholder="Type the characters above">
</form>

<!-- DOES NOT FIRE: CAPTCHA with audio alternative and bypass link -->
<form>
  <img src="/captcha.png" alt="CAPTCHA challenge">
  <a href="/audio-captcha">Listen to audio version</a>
  <a href="/email-login">Log in with email link instead</a>
</form>
```

---

## EAA-Specific SC 3.3.7 — Redundant Entry [WCAG 2.2 NEW]

**FIRES when:** a multi-step form or process asks the user to re-enter information that was already provided earlier in the same session (e.g. asking for billing address again on a payment page after it was entered on a checkout page), without:
- Auto-populating the previously entered value, OR
- Providing a "same as above / use previously entered value" option

**DOES NOT FIRE when:**
- The re-entry is required for security verification (e.g. confirm new password)
- The previously entered value is shown and the user merely confirms it

**EAA mandate:** EN 301 549 clause 9.3.3.7 (Level A) — applies to e-commerce and multi-step service flows.

```html
<!-- FIRES: shipping address re-requested when billing was already entered -->
<fieldset>
  <legend>Billing Address</legend>
  <!-- user already entered this on previous step -->
  <input type="text" name="billing_street" required>
</fieldset>

<!-- DOES NOT FIRE: checkbox copies earlier entry -->
<label>
  <input type="checkbox" name="same_as_shipping"> Same as shipping address
</label>
```

---

## EAA-Specific SC 2.5.7 — Dragging Movements [WCAG 2.2 NEW]

**FIRES when:** a UI feature requires a drag operation (click+hold+move) to complete a function, and there is no single-pointer (click or tap) alternative for the same function.

Examples that FIRE:
- Drag-to-sort list with no alternative reorder buttons
- Drag-and-drop file upload with no "Browse" button fallback
- Slider range input (e.g. price filter) with no text input fallback for the value

**DOES NOT FIRE when:**
- The dragging is essential to the function (e.g. a drawing application)
- A keyboard-operable button or input achieves the same result

**EAA mandate:** EN 301 549 clause 9.2.5.7 (Level AA).

---

## EAA-Specific SC 2.5.8 — Target Size (Minimum) [WCAG 2.2 NEW]

**FIRES when:** the CSS height or width of a clickable/tappable target is resolvable as below 24×24 CSS pixels AND the target does not have sufficient spacing from adjacent targets to compensate.

**DOES NOT FIRE when:**
- The target is inline text within a sentence (e.g. hyperlinked word in a paragraph)
- The target's rendered bounding box including spacing totals at least 24×24 px
- The exact rendered size is not statically determinable from source

**EAA mandate:** EN 301 549 clause 9.2.5.8 (Level AA).

```css
/* FIRES: icon button with explicit small size */
.icon-btn {
  width: 16px;
  height: 16px;
}

/* DOES NOT FIRE: meets minimum */
.icon-btn {
  width: 44px;
  height: 44px;
}
```

---

## EAA-Specific SC 2.4.11 — Focus Not Obscured (Minimum) [WCAG 2.2 NEW]

**FIRES when:** a sticky or fixed CSS element (header, footer, cookie banner, chat widget) can fully overlap and hide the keyboard focus indicator when a user tabs to an interactive element behind it.

**DOES NOT FIRE when:**
- The focused element is partially visible (only fully hidden focus fails this SC)
- The page uses `scroll-padding-top` or similar to offset sticky header height
- No focused element is positionally obscured by a sticky layer

**EAA mandate:** EN 301 549 clause 9.2.4.11 (Level AA).

```css
/* FIRES risk: no scroll offset for sticky header */
header {
  position: fixed;
  top: 0;
  height: 64px;
}
/* No scroll-padding-top on :target or html/body — focused elements may be hidden */

/* DOES NOT FIRE: offset applied */
html {
  scroll-padding-top: 72px; /* header height + margin */
}
```

---

## EAA and SC 1.3.5 — Identify Input Purpose (autocomplete) [WCAG 2.0 AA, EAA required]

**FIRES when:** an `<input>` that collects personal data (name, email, phone, address, credit card, date of birth) does not have the corresponding `autocomplete` attribute value from the WCAG-defined autocomplete token list.

**DOES NOT FIRE when:**
- The input is for non-personal data (e.g. product search, free-text comments)
- The `autocomplete="off"` is justified by security requirements (e.g. one-time codes)
- The field is in a confirmed non-EAA-scope context

**EAA mandate:** EN 301 549 clause 9.1.3.5 (Level AA). Particularly important for e-commerce (checkout flows) and banking (account registration).

```html
<!-- FIRES: personal data inputs without autocomplete -->
<input type="text" name="full_name" placeholder="Full name">
<input type="email" name="email" placeholder="Email">
<input type="tel" name="phone" placeholder="Phone">

<!-- DOES NOT FIRE -->
<input type="text" name="full_name" autocomplete="name">
<input type="email" name="email" autocomplete="email">
<input type="tel" name="phone" autocomplete="tel">
```

---

## EAA and SC 4.1.3 — Status Messages [WCAG 2.0 AA, EAA required]

**FIRES when:** a dynamic status update (success confirmation, error notification, loading state, cart count change, search result count) is injected into the DOM BUT:
- The container does not have `role="status"`, `role="alert"`, or `role="log"`
- AND `aria-live="polite"` or `aria-live="assertive"` is absent

**DOES NOT FIRE when:**
- The element that receives focus change IS the status message (focus change itself conveys the update)
- The container already has an appropriate live region role

**EAA mandate:** EN 301 549 clause 9.4.1.3 (Level AA). Critical for single-page applications that update content dynamically.

```js
// FIRES: status injected without live region
document.getElementById('status').textContent = 'Item added to cart';

// DOES NOT FIRE: container already has role="status"
// <div id="status" role="status"></div>
document.getElementById('status').textContent = 'Item added to cart';
```

---

## EAA and SC 3.2.6 — Consistent Help [WCAG 2.2 NEW, EAA required]

**FIRES when:** a website provides a help mechanism (contact form, chat widget, FAQ link, phone number, self-help tool) on some pages of a multi-page site but NOT in a consistent location across all pages — i.e., it appears in different positions (e.g. footer on homepage, header on checkout, absent on error pages) without a predictable pattern.

**DOES NOT FIRE when:**
- Help is only provided on one page (consistency within a page set)
- Help mechanism appears in the same relative location consistently across all pages

**EAA mandate:** EN 301 549 clause 9.3.2.6 (Level A). Particularly relevant to e-commerce and banking service flows.

---

## Cross-Cutting EAA Obligation: Accessibility Statement

The EAA (and the earlier Web Accessibility Directive for public bodies) requires in-scope services to publish an **accessibility statement** disclosing:
- Level of conformance claimed (WCAG 2.2 Level AA)
- Known non-conformance items and justification
- Accessible alternatives where full conformance is not achieved
- Contact mechanism for accessibility feedback
- Link to the enforcement body

While an accessibility statement cannot be detected from source code alone, its absence from a `<footer>` or navigation area (as a link to `/accessibility`) is a reportable gap in a full site audit context.

**Detection hint:** Check for a link with text containing "accessibility", "accessibilité", "Barrierefreiheit", "zugänglichkeit", or equivalent in the site footer or navigation landmark. Absence is worth noting in a full-site EAA compliance review.
