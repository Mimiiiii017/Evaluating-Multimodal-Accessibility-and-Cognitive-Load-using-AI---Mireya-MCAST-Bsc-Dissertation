# Tables, ARIA, and Complex Component Patterns

## HTML Tables with Proper Header Scope

### Violation: Table Headers Missing Scope

```html
<!-- VIOLATION: Headers without scope attribute -->
<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Starter</th>
      <th>Pro</th>
      <th>Enterprise</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Component Scans / month</td>
      <td>50</td>
      <td>500</td>
      <td>Unlimited</td>
    </tr>
    <tr>
      <td>AI-Assisted Fixes</td>
      <td>No</td>
      <td>Yes</td>
      <td>Yes</td>
    </tr>
  </tbody>
</table>

<!-- VIOLATION: Row headers without scope -->
<table>
  <tbody>
    <tr>
      <th>Accessibility Score</th>
      <td>95</td>
      <td>88</td>
    </tr>
  </tbody>
</table>

<!-- VIOLATION: Complex tables missing caption and thead/tbody structure -->
<table>
  <tr>
    <td colspan="2"><strong>Q4 Results</strong></td>
  </tr>
  <tr>
    <td>Revenue</td>
    <td>$2.5M</td>
  </tr>
</table>
```

**Why it fails:**
- Screen readers cannot understand table structure
- Users cannot navigate by column or row
- Complex relationships unclear without scope
- WCAG 1.3.1 Info and Relationships (Level A)

**Correct implementation:**

```html
<!-- CORRECT: Headers with scope attribute -->
<table>
  <caption>Pricing Plans Comparison</caption>
  <thead>
    <tr>
      <th scope="col">Feature</th>
      <th scope="col">Starter</th>
      <th scope="col">Pro</th>
      <th scope="col">Enterprise</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Component Scans / month</th>
      <td>50</td>
      <td>500</td>
      <td>Unlimited</td>
    </tr>
    <tr>
      <th scope="row">AI-Assisted Fixes</th>
      <td>No</td>
      <td>Yes</td>
      <td>Yes</td>
    </tr>
    <tr>
      <th scope="row">24/7 Support</th>
      <td>No</td>
      <td>Yes</td>
      <td>Yes</td>
    </tr>
  </tbody>
</table>

<!-- CORRECT: Complex table with row groups -->
<table>
  <caption>Sales Data by Region and Quarter</caption>
  <thead>
    <tr>
      <th scope="col">Region</th>
      <th scope="col">Q1</th>
      <th scope="col">Q2</th>
      <th scope="col">Q3</th>
      <th scope="col">Q4</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">North America</th>
      <td>$450K</td>
      <td>$520K</td>
      <td>$580K</td>
      <td>$620K</td>
    </tr>
    <tr>
      <th scope="row">Europe</th>
      <td>$320K</td>
      <td>$380K</td>
      <td>$420K</td>
      <td>$480K</td>
    </tr>
  </tbody>
</table>

<!-- CORRECT: Table with colgroup for easier styling/accessibility -->
<table>
  <caption>Monthly Active Users Migration</caption>
  <colgroup>
    <col span="1">
    <col span="3" style="background-color: #e8f4f8">
  </colgroup>
  <thead>
    <tr>
      <th scope="col">Platform</th>
      <th scope="col">Previous (2025)</th>
      <th scope="col">Current (2026)</th>
      <th scope="col">Growth</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Web</th>
      <td>1.2M</td>
      <td>1.8M</td>
      <td>+50%</td>
    </tr>
  </tbody>
</table>
```

**Key rules:**
- `scope="col"` for column headers (th in thead)
- `scope="row"` for row headers (th in tbody)
- Always include `<caption>` describing table purpose
- Use `<thead>`, `<tbody>`, `<tfoot>` for structure
- Row headers should be in leftmost column

---

## ARIA Attributes for Complex Components

### Disclosure / Accordion Pattern

```html
<!-- VIOLATION: No ARIA attributes -->
<div class="faq-item">
  <div class="faq-question" onclick="toggleAnswer(this)">
    What is accessibility?
  </div>
  <div class="faq-answer" style="display: none;">
    Accessibility means designing digital content...
  </div>
</div>
```

**Correct implementation:**

```html
<!-- CORRECT: Full ARIA disclosure pattern -->
<div class="faq-item">
  <button
    class="faq-question"
    aria-expanded="false"
    aria-controls="answer-1"
    id="question-1"
  >
    What is accessibility?
    <span aria-hidden="true">▼</span>
  </button>
  <div
    id="answer-1"
    role="region"
    aria-labelledby="question-1"
    hidden
  >
    <p>Accessibility means designing digital content...</p>
  </div>
</div>

<script>
const button = document.querySelector('.faq-question');
const answer = document.querySelector('[role="region"]');

button.addEventListener('click', () => {
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', !isExpanded);
  answer.hidden = isExpanded;
});
</script>
```

**Key attributes:**
- `aria-expanded="true/false"` - Current state of disclosure
- `aria-controls="id"` - Links button to controlled content
- `role="region"` - Identifies expanded content
- `aria-labelledby` - Describes region by button text
- `hidden` attribute - Hide when collapsed

---

### Form Validation and Error Messaging

```html
<!-- VIOLATION: No aria attributes for validation -->
<div class="form-group">
  <label for="email">Email Address</label>
  <input
    type="email"
    id="email"
    name="email"
    required
  >
  <span class="error" style="display: none;">
    Please enter a valid email
  </span>
</div>
```

**Correct implementation:**

```html
<!-- CORRECT: Full validation ARIA -->
<div class="form-group">
  <label for="email">Email Address <span aria-label="required">*</span></label>
  <input
    type="email"
    id="email"
    name="email"
    required
    aria-required="true"
    aria-invalid="false"
    aria-describedby="email-error email-hint"
  >
  <p id="email-hint" class="hint">
    Format: example@domain.com
  </p>
  <span
    id="email-error"
    role="alert"
    aria-live="polite"
    aria-atomic="true"
    style="display: none;"
  >
    Please enter a valid email address
  </span>
</div>

<script>
const input = document.getElementById('email');
const errorMsg = document.getElementById('email-error');

input.addEventListener('blur', () => {
  const isValid = input.value.includes('@');

  if (!isValid) {
    input.setAttribute('aria-invalid', 'true');
    errorMsg.style.display = 'block';
  } else {
    input.setAttribute('aria-invalid', 'false');
    errorMsg.style.display = 'none';
  }
});
</script>

<style>
input[aria-invalid="true"] {
  border: 2px solid #dc2626;
}

input[aria-invalid="false"] {
  border: 2px solid #10b981;
}
</style>
```

**Key attributes:**
- `aria-required="true"` - Field is required
- `aria-invalid="true/false"` - Validation state
- `aria-describedby="id"` - Links to hint/error text
- `role="alert"` - Announces errors immediately
- `aria-live="polite"` - Updates announced respectfully
- `aria-atomic="true"` - Read entire alert message

---

### Star Rating Widget

```html
<!-- VIOLATION: Icon-based rating without proper ARIA -->
<div class="star-rating">
  <span class="star" onclick="rate(1)">★</span>
  <span class="star" onclick="rate(2)">★</span>
  <span class="star" onclick="rate(3)">★</span>
  <span class="star" onclick="rate(4)">★</span>
  <span class="star" onclick="rate(5)">★</span>
</div>
```

**Correct implementation:**

```html
<!-- CORRECT: Accessible star rating -->
<div class="star-rating">
  <fieldset>
    <legend>Rate this product:</legend>
    
    <div class="rating-buttons">
      <button
        type="button"
        value="1"
        aria-label="1 star"
        aria-pressed="false"
      >
        [star]
      </button>
      <button
        type="button"
        value="2"
        aria-label="2 stars"
        aria-pressed="false"
      >
        [star] [star]
      </button>
      <button
        type="button"
        value="3"
        aria-label="3 stars"
        aria-pressed="false"
      >
        [star] [star] [star]
      </button>
      <button
        type="button"
        value="4"
        aria-label="4 stars"
        aria-pressed="false"
      >
        [star] [star] [star] [star]
      </button>
      <button
        type="button"
        value="5"
        aria-label="5 stars"
        aria-pressed="false"
      >
        [star] [star] [star] [star] [star]
      </button>
    </div>

    <div aria-live="polite" aria-atomic="true">
      <p id="rating-result"></p>
    </div>
  </fieldset>
</div>

<script>
const buttons = document.querySelectorAll('.rating-buttons button');
const result = document.getElementById('rating-result');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const rating = button.value;
    
    // Update all buttons
    buttons.forEach(btn => {
      btn.setAttribute('aria-pressed', 'false');
    });
    button.setAttribute('aria-pressed', 'true');
    
    // Announce result
    result.textContent = `You rated this product ${rating} stars`;
  });

  button.addEventListener('keydown', (e) => {
    const index = Array.from(buttons).indexOf(button);
    let nextButton = null;

    if (e.key === 'ArrowRight' && index < buttons.length - 1) {
      nextButton = buttons[index + 1];
    } else if (e.key === 'ArrowLeft' && index > 0) {
      nextButton = buttons[index - 1];
    }

    if (nextButton) {
      e.preventDefault();
      nextButton.focus();
    }
  });
});
</script>

<style>
.rating-buttons {
  display: flex;
  gap: 4px;
}

.rating-buttons button {
  min-width: 44px;
  min-height: 44px;
  padding: 8px;
  border: 2px solid #e2e8f0;
  background-color: white;
  font-size: 18px;
}

.rating-buttons button[aria-pressed="true"] {
  background-color: #fbbf24;
  border-color: #f59e0b;
  font-weight: bold;
}

.rating-buttons button:hover,
.rating-buttons button:focus-visible {
  border-color: #f59e0b;
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}
</style>
```

**Key attributes:**
- `aria-label` - Describes rating value
- `aria-pressed="true/false"` - Current selection state
- `aria-live="polite"` - Announces rating change
- Use buttons not spans for keyboard support
- Arrow keys for navigation

---

### Tabs Component

```html
<!-- VIOLA TION: Tabs without ARIA roles -->
<div class="tabs">
  <div class="tab-buttons">
    <button onclick="showTab(1)">Overview</button>
    <button onclick="showTab(2)">Specifications</button>
    <button onclick="showTab(3)">Reviews</button>
  </div>
  <div id="tab1" style="display: block;">Content 1</div>
  <div id="tab2" style="display: none;">Content 2</div>
  <div id="tab3" style="display: none;">Content 3</div>
</div>
```

**Correct implementation:**

```html
<!-- CORRECT: Full ARIA tablist pattern -->
<div class="tabs">
  <div role="tablist" aria-label="Product information">
    <button
      role="tab"
      aria-selected="true"
      aria-controls="tabpanel-overview"
      id="tab-overview"
      tabindex="0"
    >
      Overview
    </button>
    <button
      role="tab"
      aria-selected="false"
      aria-controls="tabpanel-specs"
      id="tab-specs"
      tabindex="-1"
    >
      Specifications
    </button>
    <button
      role="tab"
      aria-selected="false"
      aria-controls="tabpanel-reviews"
      id="tab-reviews"
      tabindex="-1"
    >
      Reviews
    </button>
  </div>

  <div
    role="tabpanel"
    id="tabpanel-overview"
    aria-labelledby="tab-overview"
    tabindex="0"
  >
    <p>Product overview content...</p>
  </div>

  <div
    role="tabpanel"
    id="tabpanel-specs"
    aria-labelledby="tab-specs"
    tabindex="0"
    hidden
  >
    <p>Specifications content...</p>
  </div>

  <div
    role="tabpanel"
    id="tabpanel-reviews"
    aria-labelledby="tab-reviews"
    tabindex="0"
    hidden
  >
    <p>Reviews content...</p>
  </div>
</div>

<script>
const tabs = document.querySelectorAll('[role="tab"]');
const panels = document.querySelectorAll('[role="tabpanel"]');

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(index));
  
  tab.addEventListener('keydown', (e) => {
    let nextIndex = index;
    
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
      e.preventDefault();
    }
    
    if (nextIndex !== index) {
      selectTab(nextIndex);
      tabs[nextIndex].focus();
    }
  });
});

function selectTab(index) {
  // Deselect all tabs and hide all panels
  tabs.forEach(tab => {
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('tabindex', '-1');
  });
  panels.forEach(panel => {
    panel.hidden = true;
  });

  // Select active tab and show panel
  tabs[index].setAttribute('aria-selected', 'true');
  tabs[index].setAttribute('tabindex', '0');
  panels[index].hidden = false;
}
</script>

<style>
[role="tablist"] {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e2e8f0;
}

[role="tab"] {
  padding: 12px 24px;
  background-color: #f8f9fa;
  border: none;
  cursor: pointer;
  font-size: 16px;
  min-height: 44px;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
}

[role="tab"]:hover {
  background-color: #e8e9ea;
}

[role="tab"][aria-selected="true"] {
  background-color: white;
  border-bottom-color: #005fcc;
  color: #005fcc;
}

[role="tab"]:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: -3px;
}

[role="tabpanel"] {
  padding: 20px;
  background-color: white;
}
</style>
```

**Key ARIA roles and attributes:**
- `role="tablist"` - Container for tabs
- `role="tab"` - Individual tab button
- `role="tabpanel"` - Content panel
- `aria-selected="true/false"` - Current tab state
- `aria-controls="id"` - Tab controls panel
- `aria-labelledby="id"` - Panel labeled by tab
- Arrow key navigation between tabs
- Only active tab in tab order (tabindex="0")

---

## Navigation Landmarks and Labels

### Violation: Multiple Navigation Elements Without Labels

```html
<!-- VIOLATION: Multiple nav elements without aria-label -->
<nav>
  <a href="/">Home</a>
  <a href="/products">Products</a>
</nav>

<!-- Later in page -->
<nav>
  <a href="/">Account</a>
  <a href="/settings">Settings</a>
</nav>
```

**Correct implementation:**

```html
<!-- CORRECT: Each nav has distinct label -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<!-- Another nav with different purpose -->
<nav aria-label="Account navigation">
  <ul>
    <li><a href="/account">My Account</a></li>
    <li><a href="/settings">Settings</a></li>
    <li><a href="/logout">Logout</a></li>
  </ul>
</nav>

<!-- Footer navigation -->
<footer>
  <nav aria-label="Footer links">
    <section>
      <h3>Company</h3>
      <ul>
        <li><a href="/about">About</a></li>
        <li><a href="/careers">Careers</a></li>
      </ul>
    </section>
  </nav>
</footer>
```

**Key landmarks:**
- Use `<nav>` for major navigation blocks
- Add `aria-label` to distinguish multiple nav elements
- Use `aria-current="page"` for active link
- Use `<main>` for primary content
- Use `<aside>` for secondary content
- Use `<footer>` with proper structure

---

## ARIA Live Regions for Dynamic Updates

### Form Submission Feedback

```html
<!-- CORRECT: Live region for form feedback -->
<form id="contact-form">
  <div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" required>
  </div>

  <div
    id="form-status"
    role="status"
    aria-live="polite"
    aria-atomic="true"
    class="sr-only"
  ></div>

  <button type="submit">Send Message</button>
</form>

<script>
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Clear previous message
  status.textContent = '';
  
  try {
    status.textContent = 'Sending message...';
    
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: new FormData(form)
    });

    if (response.ok) {
      status.textContent = 'Message sent successfully!';
      form.reset();
    } else {
      status.textContent = 'Failed to send message. Please try again.';
    }
  } catch (error) {
    status.textContent = 'An error occurred. Please try again.';
  }
});
</script>

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
```

**Live region types:**
- `role="status"` - Status messages, updates
- `role="alert"` - Urgent alerts, errors
- `aria-live="polite"` - Announce when appropriate
- `aria-live="assertive"` - Announce immediately
- `aria-atomic="true"` - Read entire region
