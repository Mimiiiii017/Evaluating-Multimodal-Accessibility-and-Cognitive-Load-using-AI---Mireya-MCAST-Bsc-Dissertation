# Forms: Accessible Authentication

## Tags
Tags: #forms #authentication #login #cognitive #wcag #3.3.8 #eaa

## Purpose
Ensure authentication processes do not rely on cognitive function tests such as memorising passwords, solving puzzles, or transcribing codes, so users with cognitive disabilities can log in.

## Key points
- Authentication must not require a cognitive function test (memorising, transcribing, calculating, or solving a puzzle) unless an alternative method is provided (WCAG 3.3.8).
- Cognitive function tests include: remembering a password without paste support, solving CAPTCHAs, and mental arithmetic challenges.
- Allowing password paste and autofill supports password manager use, which removes the memory burden.
- Alternative authentication methods include: email/SMS magic links, passkeys, biometric login, OAuth/social login, and hardware security keys.
- CAPTCHAs that require identifying objects or transcribing text are cognitive tests; alternatives must be offered.
- Users with cognitive, learning, and neurological disabilities are disproportionately affected.

## Developer checks
- Verify that password fields allow paste and autofill (no `autocomplete="off"` or JavaScript paste prevention on login forms).
- Check for CAPTCHAs and confirm an accessible alternative exists.
- Test the login flow with a password manager to confirm it works.
- Verify that multi-factor authentication methods include a non-cognitive option.
- Confirm authentication does not require users to transcribe codes from images.

## Fix patterns
- Allow paste and autofill on all password and authentication fields.
- Remove `autocomplete="off"` from login forms.
- Remove JavaScript that blocks paste events on password fields.
- Replace image-based CAPTCHAs with accessible alternatives (e.g., reCAPTCHA v3, hCaptcha accessibility mode).
- Offer passwordless login options (magic links, passkeys, biometrics, OAuth).
- Provide multiple authentication methods so users can choose the easiest for them.

## Examples
```html
<!-- Correct: allows paste and autofill -->
<label for="username">Username</label>
<input id="username" type="text" autocomplete="username">

<label for="password">Password</label>
<input id="password" type="password" autocomplete="current-password">

<!-- Incorrect: blocks paste -->
<input type="password" onpaste="return false;">

<!-- Incorrect: disables autofill -->
<input type="password" autocomplete="off">
```

```html
<!-- Alternative login methods -->
<div class="login-options">
  <button onclick="loginWithPasskey()">Log in with Passkey</button>
  <button onclick="loginWithGoogle()">Log in with Google</button>
  <button onclick="sendMagicLink()">Send me a login link</button>
</div>

<!-- Accessible CAPTCHA alternative -->
<div class="captcha-section">
  <div class="g-recaptcha" data-sitekey="..."></div>
  <p>
    Having trouble? <a href="/contact">Contact us for assistance</a>.
  </p>
</div>
```
