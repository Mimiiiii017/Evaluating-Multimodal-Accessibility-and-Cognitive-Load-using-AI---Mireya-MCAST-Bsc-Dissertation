# React/TypeScript: Form Validation and Component Accessibility

## Tags
Tags: #react #tsx #typescript #forms #validation #aria-invalid #aria-describedby #aria-required #controlled-inputs #3.3.1 #3.3.4

## Purpose
Ensure React form components properly expose validation state, error messages, and field requirements to assistive technologies through ARIA attributes and semantic HTML.

## Critical Patterns to Detect

### Pattern 1: Form Fields Missing aria-invalid in Error State

**FIRES when:**
- A form field component (`<input>`, `<textarea>`, `<select>`) renders with `className` containing `error` or `is-error` or `invalid`
- AND the component receives no `aria-invalid` prop
- OR `aria-invalid` prop is not bound to the error state variable

**Examples:**
```tsx
// ❌ VIOLATION: Error state visual only, no aria-invalid
function EmailField({ value, onChange, error }) {
  return (
    <>
      <input
        value={value}
        onChange={onChange}
        className={error ? 'input error' : 'input'}
        // Missing: aria-invalid={!!error}
      />
      {error && <span className="error-text">{error}</span>}
    </>
  );
}

// ❌ VIOLATION: Error message exists but input not marked invalid
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const handleBlur = () => {
    if (!isValidEmail(email)) {
      setEmailError('Invalid email');
    }
  };
  
  return (
    <form>
      <input
        value={email}
        onBlur={handleBlur}
        className={emailError ? 'error' : ''}
        // Missing: aria-invalid={!!emailError}
      />
      {emailError && <div>{emailError}</div>}
    </form>
  );
}

// ✅ CORRECT: aria-invalid prop bound to error state
function EmailField({ value, onChange, error }) {
  return (
    <>
      <input
        value={value}
        onChange={onChange}
        aria-invalid={!!error}              // Key: tied to error state
        className={error ? 'input error' : 'input'}
      />
      {error && <span className="error-text">{error}</span>}
    </>
  );
}

// ✅ Correct with aria-describedby linking to error element
function PasswordField({ value, error, errorId }) {
  return (
    <>
      <input
        type="password"
        value={value}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}  // Links to error message
      />
      {error && <div id={errorId} role="alert">{error}</div>}
    </>
  );
}

// ✅ Custom hook for form field management
function useFormField(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  
  return {
    value,
    onChange: (e) => setValue(e.target.value),
    onBlur: () => setTouched(true),
    'aria-invalid': touched && !!error,    // Clean ARIA binding
    'aria-describedby': error ? `${errorId}` : undefined,
    error: touched ? error : null,
  };
}
```

### Pattern 2: Form Fields Missing aria-required or required Attribute

**FIRES when:**
- A form field (`<input>`, `<select>`, `<textarea>`) is required (marked with `required` prop, or required validation exists)
- AND the field has neither the HTML `required` attribute
- AND no `aria-required="true"` prop

**Examples:**
```tsx
// ❌ VIOLATION: Required field but no indicator for assistive tech
function NameField({ isRequired }) {
  return (
    <input
      placeholder="Full name"
      // Missing: required or aria-required={isRequired}
    />
  );
}

// ❌ VIOLATION: Validation checks required but ARIA missing
export function SignupForm() {
  const handleSubmit = (e) => {
    if (!email) {
      setEmailError('Email is required');  // Code knows it's required
      return;
    }
    // ... but no aria-required on the input
  };
  
  return <input value={email} />;
}

// ✅ CORRECT: HTML required attribute used
<input
  type="email"
  required
  placeholder="Email address"
/>

// ✅ CORRECT: aria-required prop for dynamic required state
function FormField({ name, isRequired }) {
  return (
    <input
      name={name}
      aria-required={isRequired}
      required={isRequired}               // Also set HTML required
    />
  );
}

// ✅ CORRECT: Custom field wrapper with proper ARIA
function TextField({ label, isRequired, error, ...props }) {
  const inputId = `field-${Math.random()}`;
  
  return (
    <div>
      <label htmlFor={inputId}>
        {label}
        {isRequired && <span aria-hidden="true">*</span>}
      </label>
      <input
        id={inputId}
        required={isRequired}
        aria-required={isRequired}
        aria-invalid={!!error}
        {...props}
      />
      {error && <div id={`${inputId}-error`}>{error}</div>}
    </div>
  );
}
```

### Pattern 3: Form Fields Missing aria-describedby Linking to Error Message

**FIRES when:**
- An error message element displays below an input field
- The error element has an `id` attribute (or should have one)
- The input field has no `aria-describedby` prop pointing to that error id

**Examples:**
```tsx
// ❌ VIOLATION: Error message exists but not programmatically associated
function PasswordField() {
  const [password, setPassword] = useState('');
  const error = password.length < 8 ? 'Password must be 8+ chars' : '';
  
  return (
    <>
      <input
        type="password"
        value={password}
        // Missing: aria-describedby="password-error"
      />
      {error && <div>{error}</div>}
    </>
  );
}

// ✅ CORRECT: aria-describedby links input to error element
function PasswordField() {
  const [password, setPassword] = useState('');
  const error = password.length < 8 ? 'Password must be 8+ chars' : '';
  const errorId = 'password-error';
  
  return (
    <>
      <input
        type="password"
        value={password}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}  // Key: programmatic link
      />
      {error && <div id={errorId} role="alert">{error}</div>}
    </>
  );
}

// ✅ Form field component with error association
function FormField({ label, inputId, error, errorId, children, ...inputProps }) {
  return (
    <div className="form-field">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        {...inputProps}
      />
      {error && (
        <div id={errorId} role="alert" className="error">
          {error}
        </div>
      )}
    </div>
  );
}
```

### Pattern 4: Toggle/Disclosure Components Missing aria-expanded

**FIRES when:**
- A component manages an `isOpen` / `open` / `expanded` boolean state variable
- A button or clickable element triggers state changes
- The trigger element has no `aria-expanded` prop
- OR `aria-expanded` is hardcoded instead of bound to the state variable

**Examples:**
```tsx
// ❌ VIOLATION: Accordion trigger without aria-expanded
function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setOpen(!open)}>
        {title}
        {/* Missing: aria-expanded={open} */}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ❌ VIOLATION: aria-expanded hardcoded, not dynamic
function DisclosureButton({ label, children }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button aria-expanded="true">  {/* Wrong: should be {isOpen} */}
        {label}
      </button>
      {isOpen && <div>{children}</div>}
    </>
  );
}

// ✅ CORRECT: aria-expanded bound to state
function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div>
      <button
        aria-expanded={open}          // Key: state-bound
        aria-controls="accordion-content"
        onClick={() => setOpen(!open)}
      >
        {title}
      </button>
      {open && <div id="accordion-content">{children}</div>}
    </div>
  );
}

// ✅ CORRECT: Dropdown with aria-expanded + aria-controls
export function Dropdown({ trigger, options }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="dropdown">
      <button
        aria-expanded={isOpen}
        aria-controls="dropdown-menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </button>
      {isOpen && (
        <ul id="dropdown-menu" role="menu">
          {options.map((opt) => (
            <li key={opt}><button role="menuitem">{opt}</button></li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ✅ Disclosure hook pattern
function useDisclosure(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  
  return {
    isOpen,
    toggle: () => setIsOpen(!isOpen),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    // Props to spread on trigger button
    triggerProps: {
      'aria-expanded': isOpen,
      onClick: () => setIsOpen(!isOpen),
    },
  };
}
```

### Pattern 5: Star Rating Widgets Without Accessible Semantics

**FIRES when:**
- Component renders a star rating (1-5 stars, filled/unfilled)
- Widget is interactive (user can click stars to rate)
- AND no `role="radio"` on individual stars
- AND no `aria-label` describing the rating value (e.g., "4 out of 5 stars")
- OR composite rating is read-only but lacks `role="img"` + `aria-label`

**Examples:**
```tsx
// ❌ VIOLATION: Star rating with no ARIA semantics
function StarRating({ rating, onRate }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={star <= rating ? 'filled' : 'empty'}
          onClick={() => onRate(star)}
          // Missing: role="radio", aria-label, aria-checked
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ❌ VIOLATION: Read-only star display without accessible name
function RatingDisplay({ score, maxScore = 5 }) {
  return (
    <div className="rating">
      {[...Array(maxScore)].map((_, i) => (
        <span key={i} className={i < score ? 'filled' : 'empty'}>
          ★
        </span>
      ))}
    </div>
  );
}

// ✅ CORRECT: Interactive star rating with radio semantics
function StarRating({ rating, onRate, maxStars = 5 }) {
  return (
    <div className="star-rating" role="radiogroup" aria-label="Rate this item">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          role="radio"
          aria-label={`${star} out of ${maxStars} stars`}
          aria-checked={star === rating}
          onClick={() => onRate(star)}
          className={star <= rating ? 'filled' : 'empty'}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ✅ CORRECT: Read-only star display with accessible name
function RatingDisplay({ score, maxScore = 5 }) {
  return (
    <div
      className="rating"
      role="img"
      aria-label={`${score} out of ${maxScore} stars`}
    >
      {[...Array(maxScore)].map((_, i) => (
        <span key={i} className={i < score ? 'filled' : 'empty'}>
          ★
        </span>
      ))}
    </div>
  );
}

// ✅ Read-only with individual star labels (alternative pattern)
function RatingBars({ score, maxScore = 5 }) {
  return (
    <div>
      <span className="rating-value">{score} out of {maxScore}</span>
      <div className="star-display" role="img" aria-hidden="true">
        {[...Array(maxScore)].map((_, i) => (
          <span key={i} className={i < score ? 'filled' : 'empty'}>★</span>
        ))}
      </div>
    </div>
  );
}
```

## Summary Checklist for React/TSX Form Auditing

When scanning React/TypeScript files for form accessibility defects:

- ✓ All form inputs with error states have `aria-invalid={!!error}`
- ✓ All error messages are linked via `aria-describedby={errorId}`
- ✓ All required fields have `required` or `aria-required="true"`
- ✓ All toggle/disclosure triggers have `aria-expanded={isOpen}`
- ✓ All toggle triggers have `aria-controls="id"` pointing to managed region
- ✓ All form labels are associated via `htmlFor={inputId}`
- ✓ Star ratings use `role="radio"` for interactive, or `role="img"` + `aria-label` for read-only
- ✓ No hardcoded `aria-expanded="true"` — must be state-bound
- ✓ Error region has `role="alert"` for dynamic errors
- ✓ Form field components don't rely on visual indicators alone

## References
- WCAG 2.2 SC 3.3.1 Error Identification: https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html
- WCAG 2.2 SC 3.3.4 Error Prevention (Legal, Financial, Data): https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html
- React Accessibility: https://react.dev/learn/accessibility
- ARIA Authoring Practices - Form Components: https://www.w3.org/WAI/ARIA/apg/patterns/forms/
