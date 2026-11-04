# Forms: Input Purpose and Autocomplete

## Tags
Tags: #forms #autocomplete #input-purpose #wcag #1.3.5 #eaa

## Purpose
Ensure form fields that collect personal information have a programmatically determinable purpose, allowing browsers and assistive technologies to offer autofill and icons to help users complete forms more easily.

## Key points
- Input fields that collect personal data must identify their purpose programmatically.
- The `autocomplete` attribute communicates the purpose of standard input fields.
- Autocomplete helps users with cognitive disabilities, motor impairments, and low vision.
- Browsers can autofill known values, reducing cognitive load and errors.
- Assistive technologies can display familiar icons alongside fields when purpose is identified.
- This requirement applies to fields collecting information about the user themselves.

## Developer checks
- Identify all form fields that collect personal information (name, email, phone, address, etc.).
- Check that appropriate `autocomplete` values are used on those fields.
- Verify that `autocomplete` values match the actual purpose of the field.
- Confirm the form is not disabling autocomplete unnecessarily (`autocomplete="off"`).
- Test that browsers correctly autofill the fields.

## Fix patterns
- Add `autocomplete` attributes to personal data fields using standard token values.
- Use correct tokens such as `name`, `given-name`, `family-name`, `email`, `tel`, `street-address`, `postal-code`, `country`, `bday`, `username`, `new-password`, `current-password`.
- Remove `autocomplete="off"` unless there is a legitimate security reason.
- Group related address fields logically and apply appropriate autocomplete tokens.
- Test autocomplete behavior across major browsers.

## Examples
```html
<!-- Personal information fields with autocomplete -->
<label for="fname">First name</label>
<input id="fname" type="text" autocomplete="given-name">

<label for="lname">Last name</label>
<input id="lname" type="text" autocomplete="family-name">

<label for="email">Email</label>
<input id="email" type="email" autocomplete="email">

<label for="tel">Phone</label>
<input id="tel" type="tel" autocomplete="tel">

<label for="address">Street address</label>
<input id="address" type="text" autocomplete="street-address">

<!-- Login fields -->
<label for="user">Username</label>
<input id="user" type="text" autocomplete="username">

<label for="pass">Password</label>
<input id="pass" type="password" autocomplete="current-password">

<!-- New account password -->
<label for="newpass">New password</label>
<input id="newpass" type="password" autocomplete="new-password">
```
