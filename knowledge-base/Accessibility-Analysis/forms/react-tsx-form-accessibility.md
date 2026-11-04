# React/TypeScript Form Accessibility Patterns

## Tags
#react #tsx #typescript #forms #form-validation #aria-invalid #aria-required #aria-describedby #controlled-inputs #wcag-2.2

## Overview
Critical patterns for detecting React/TypeScript form accessibility defects in high-complexity fixtures where controlled inputs, state management, and error handling require careful ARIA integration.

---

## Pattern 1: Form Fields Missing aria-invalid in Error State

### What to look for
React components that conditionally apply error styling or messages but don't bind `aria-invalid` to the error state.

### Common violations

```tsx
// ❌ VIOLATION: Error styling shown but no aria-invalid
function EmailField({ value, onChange, error }) {
  return (
    <div>
      <input
        type="email"
        value={value}
        onChange={onChange}
        className={error ? 'input-error' : 'input'}
        // Missing: aria-invalid={!!error}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

// ❌ VIOLATION: LoginForm shows errors without aria-invalid
function LoginForm() {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      setPasswordError('Password must be 8+ characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  return (
    <input
      type="password"
      value={password}
      onChange={(e) => {
        setPassword(e.target.value);
        validatePassword(e.target.value);
      }}
      style={{ borderColor: passwordError ? 'red' : 'initial' }}
      // Missing: aria-invalid={!!passwordError}
    />
  );
}

// ❌ VIOLATION: Custom Input wrapper loses aria-invalid
interface InputProps {
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

function CustomInput({ label, error, value, onChange }: InputProps) {
  return (
    <div className="input-wrapper">
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'error' : ''}
        // Missing: aria-invalid={!!error}
      />
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}
```

### Correct implementations

```tsx
// ✅ CORRECT: aria-invalid bound to error state
function EmailField({ value, onChange, error }: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div>
      <input
        type="email"
        value={value}
        onChange={onChange}
        className={error ? 'input-error' : 'input'}
        aria-invalid={!!error}  // ARIA bound to error
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

// ✅ CORRECT: LoginForm with aria-invalid
function LoginForm() {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      setPasswordError('Password must be 8+ characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  return (
    <input
      type="password"
      value={password}
      onChange={(e) => {
        setPassword(e.target.value);
        validatePassword(e.target.value);
      }}
      style={{ borderColor: passwordError ? 'red' : 'initial' }}
      aria-invalid={!!passwordError}  // ARIA tracks error state
    />
  );
}

// ✅ CORRECT: Custom Input with aria-invalid and aria-describedby
function CustomInput({ label, error, value, onChange }: InputProps) {
  const errorId = `error-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="input-wrapper">
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'error' : ''}
        aria-invalid={!!error}  // ARIA invalid state
        aria-describedby={error ? errorId : undefined}  // Links to error message
      />
      {error && <div className="error-msg" id={errorId}>{error}</div>}
    </div>
  );
}
```

---

## Pattern 2: Required Fields Missing aria-required or required Attribute

### What to look for
Form fields where validation logic requires a value, but neither `aria-required` nor HTML `required` attribute is present.

### Common violations

```tsx
// ❌ VIOLATION: NameField required by code but not marked
function NameField({ formData, setFormData }: FormProps) {
  const handleChange = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      // Validation rejects empty names
      return;
    }
    setFormData({ ...formData, name: trimmed });
  };

  return (
    <input
      type="text"
      placeholder="Full Name"
      value={formData.name}
      onChange={(e) => handleChange(e.target.value)}
      // Missing: required or aria-required="true"
    />
  );
}

// ❌ VIOLATION: SignupForm knows email is required but no marking
function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert('Email and password required');
      return;
    }
    // proceed...
  };

  return (
    <>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        // Missing: required attribute
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        // Missing: required attribute
      />
      <button type="submit">Sign Up</button>
    </>
  );
}

// ❌ VIOLATION: Custom handler knows field is required
const requiredFields = ['firstName', 'lastName', 'email'];

function validateForm(data: Record<string, string>): boolean {
  return requiredFields.every(field => data[field]?.trim());
}

function FormField({ name, value, onChange }: FieldProps) {
  const isRequired = requiredFields.includes(name);
  
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      // Missing: aria-required={isRequired} or required={isRequired}
    />
  );
}
```

### Correct implementations

```tsx
// ✅ CORRECT: Required field properly marked
function NameField({ formData, setFormData }: FormProps) {
  const handleChange = (value: string) => {
    setFormData({ ...formData, name: value });
  };

  return (
    <input
      type="text"
      placeholder="Full Name"
      value={formData.name}
      onChange={(e) => handleChange(e.target.value)}
      required  // HTML required attribute
      aria-required="true"  // ARIA required
    />
  );
}

// ✅ CORRECT: SignupForm with required fields marked
function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert('Email and password required');
      return;
    }
    // proceed...
  };

  return (
    <>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required  // HTML required
        aria-required="true"  // ARIA required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required  // HTML required
        aria-required="true"  // ARIA required
      />
      <button type="submit">Sign Up</button>
    </>
  );
}

// ✅ CORRECT: FormField marks required via ARIA
function FormField({ name, value, onChange }: FieldProps) {
  const isRequired = requiredFields.includes(name);
  
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-required={isRequired}  // ARIA required when needed
      required={isRequired}  // HTML required attribute
    />
  );
}
```

---

## Pattern 3: Error Messages Not Linked with aria-describedby

### What to look for
Form fields with error messages displayed nearby but not programmatically linked via `aria-describedby`.

### Common violations

```tsx
// ❌ VIOLATION: PasswordField error shown but not linked
function PasswordField({ password, onPasswordChange, error }: PwdFieldProps) {
  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        // Missing: aria-describedby linking to error message
      />
      {error && <div className="error">Password must be 8+ characters</div>}
    </div>
  );
}

// ❌ VIOLATION: Form validation flow has unlinked errors
function ContactForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  return (
    <>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setEmailError(validateEmail(e.target.value) ? '' : 'Invalid email');
        }}
        // Missing: aria-describedby reference to error message
      />
      {emailError && <span className="error-msg">{emailError}</span>}
    </>
  );
}

// ❌ VIOLATION: Lost connection between field and helper text
interface TextFieldProps {
  label: string;
  helpText?: string;
  error?: string;
}

function TextField({ label, helpText, error }: TextFieldProps) {
  return (
    <div>
      <label>{label}</label>
      <input type="text" />
      {helpText && <small>{helpText}</small>}
      {error && <div className="error">{error}</div>}
      {/* Neither helpText nor error is linked to input */}
    </div>
  );
}
```

### Correct implementations

```tsx
// ✅ CORRECT: PasswordField with aria-describedby
function PasswordField({ password, onPasswordChange, error }: PwdFieldProps) {
  const errorId = 'pwd-error-' + Math.random().toString(36).substr(2, 9);
  
  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}  // Links to error
      />
      {error && (
        <div className="error" id={errorId}>
          Password must be 8+ characters
        </div>
      )}
    </div>
  );
}

// ✅ CORRECT: ContactForm with linked error messages
function ContactForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const errorId = 'email-error-msg';

  return (
    <>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setEmailError(validateEmail(e.target.value) ? '' : 'Invalid email');
        }}
        aria-invalid={!!emailError}
        aria-describedby={emailError ? errorId : undefined}  // Links to error
      />
      {emailError && <span className="error-msg" id={errorId}>{emailError}</span>}
    </>
  );
}

// ✅ CORRECT: TextField with both helpText and error linked
function TextField({ label, helpText, error }: TextFieldProps) {
  const helpId = `help-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `error-${Math.random().toString(36).substr(2, 9)}`;
  
  // Combine all descriptions
  const describedBy = [
    helpText ? helpId : null,
    error ? errorId : null
  ].filter(Boolean).join(' ');

  return (
    <div>
      <label>{label}</label>
      <input 
        type="text"
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}  // Links all descriptions
      />
      {helpText && <small id={helpId}>{helpText}</small>}
      {error && <div className="error" id={errorId}>{error}</div>}
    </div>
  );
}
```

---

## Pattern 4: Toggle/Disclosure Components Missing aria-expanded Binding

### What to look for
React components that show/hide content based on state but don't bind `aria-expanded` to that state.

### Common violations

```tsx
// ❌ VIOLATION: AccordionItem toggles but no aria-expanded
function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        {title}
      </button>
      {isOpen && <div className="content">{children}</div>}
    </div>
  );
}

// ❌ VIOLATION: DisclosureButton state not reflected in ARIA
function DisclosureButton({ label }: { label: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <button onClick={() => setExpanded(!expanded)}>
        {label}
      </button>
      {expanded && <div>Disclosed content here</div>}
    </>
  );
}

// ❌ VIOLATION: Dropdown component missing aria-expanded
function Dropdown({ trigger, options }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(!open)}>
        {trigger}
      </button>
      {open && (
        <ul>
          {options.map(opt => <li key={opt}>{opt}</li>)}
        </ul>
      )}
    </>
  );
}
```

### Correct implementations

```tsx
// ✅ CORRECT: AccordionItem with aria-expanded
function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}  // State bound to ARIA
      >
        {title}
      </button>
      {isOpen && <div className="content">{children}</div>}
    </div>
  );
}

// ✅ CORRECT: DisclosureButton with aria-expanded
function DisclosureButton({ label }: { label: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <button 
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}  // State bound to ARIA
      >
        {label}
      </button>
      {expanded && <div>Disclosed content here</div>}
    </>
  );
}

// ✅ CORRECT: Dropdown with aria-expanded and hook pattern
function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen)
  };
}

function Dropdown({ trigger, options }: DropdownProps) {
  const disclosure = useDisclosure();

  return (
    <>
      <button 
        onClick={disclosure.toggle}
        aria-expanded={disclosure.isOpen}  // State bound to ARIA
      >
        {trigger}
      </button>
      {disclosure.isOpen && (
        <ul role="listbox">
          {options.map(opt => <li key={opt} role="option">{opt}</li>)}
        </ul>
      )}
    </>
  );
}
```

---

## Pattern 5: Star Rating Widgets Without Accessible Semantics

### What to look for
Interactive or read-only star rating components missing proper ARIA roles and labels.

### Common violations

```tsx
// ❌ VIOLATION: Interactive stars lack role="radio"
function StarRating({ rating, onRatingChange }: StarProps) {
  return (
    <div>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onRatingChange(star)}
          className={star <= rating ? 'filled' : 'empty'}
          aria-label={`${star} star`}  // Has label but missing role
          // Missing: role="radio" and proper ARIA attributes
        >
          [star]
        </button>
      ))}
    </div>
  );
}

// ❌ VIOLATION: Read-only stars lack role="img" + label
function RatingDisplay({ rating }: { rating: number }) {
  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={star <= rating ? 'filled' : 'empty'}
          // Missing: role="img" aria-label describing rating
        >
          [star]
        </span>
      ))}
    </div>
  );
}

// ❌ VIOLATION: Aggregate rating display not accessible
function ProductRating({ average, count }: ProductRatingProps) {
  return (
    <div className="rating-aggregate">
      <div className="stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= average ? 'filled' : 'empty'}>[star]</span>
        ))}
      </div>
      <span>{average} out of 5</span>
      <span>({count} reviews)</span>
      {/* No accessible aggregate description */}
    </div>
  );
}
```

### Correct implementations

```tsx
// ✅ CORRECT: Interactive stars with radio role
function StarRating({ rating, onRatingChange }: StarProps) {
  return (
    <div role="radiogroup" aria-label="Product rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          role="radio"  // Proper ARIA role
          onClick={() => onRatingChange(star)}
          className={star <= rating ? 'filled' : 'empty'}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          aria-checked={star === rating}  // Reflects selection
        >
          [star]
        </button>
      ))}
    </div>
  );
}

// ✅ CORRECT: Read-only stars with role="img"
function RatingDisplay({ rating }: { rating: number }) {
  return (
    <div 
      className="rating"
      role="img"  // Treat as image
      aria-label={`${rating} out of 5 stars`}  // Descriptive label
    >
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={star <= rating ? 'filled' : 'empty'}
          aria-hidden="true"  // Don't announce individual stars
        >
          [star]
        </span>
      ))}
    </div>
  );
}

// ✅ CORRECT: Aggregate rating fully accessible
function ProductRating({ average, count }: ProductRatingProps) {
  const ratingLabel = `${average} out of 5 stars (${count} reviews)`;
  
  return (
    <div className="rating-aggregate">
      <div 
        className="stars"
        role="img"
        aria-label={ratingLabel}  // Aggregate description
      >
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star} 
            className={star <= average ? 'filled' : 'empty'}
            aria-hidden="true"
          >
            [star]
          </span>
        ))}
      </div>
      <span aria-hidden="false">{average} out of 5</span>
      <span aria-hidden="false">({count} reviews)</span>
    </div>
  );
}
```

---

## Detection Checklist for React Form Auditing

- [ ] All form fields with errors have `aria-invalid={!!error}`
- [ ] All required fields have `required` attribute AND `aria-required="true"`
- [ ] All error messages linked with `aria-describedby={errorId}`
- [ ] All disclosure/accordion buttons have `aria-expanded={state}`
- [ ] All star ratings use proper roles: `role="radio"` (interactive) or `role="img"` (display)
- [ ] All form fields with help text linked with `aria-describedby`

---

## WCAG References

- **WCAG 2.2 SC 3.3.1:** Error Identification — errors marked with aria-invalid
- **WCAG 2.2 SC 3.3.4:** Error Prevention — form submission protected
- **WCAG 2.2 SC 1.1.1:** Non-text Content — star ratings properly labeled
- **WCAG 2.2 SC 4.1.2:** Name, Role, Value — ARIA properly reflects state
