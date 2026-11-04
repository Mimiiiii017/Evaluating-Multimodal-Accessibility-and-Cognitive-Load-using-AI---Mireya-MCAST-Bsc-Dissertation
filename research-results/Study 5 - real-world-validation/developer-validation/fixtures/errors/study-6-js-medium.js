/**
 * Study 6: JavaScript Medium-Complexity Fixture (485 kB) — 30 Accessibility Errors
 * 
 * JavaScript accessibility errors include:
 *   • Missing ARIA attributes for dynamic content
 *   • State changes without announcements
 *   • Event handlers without keyboard support
 *   • Dynamic content changes without focus management
 *   • Missing aria-live regions
 *   • Improper error announcements in forms
 */

(function() {
  'use strict';

  // ─── ERROR 1: Module doesn't announce initialization ───
  console.log('App initialized');
  // Should trigger an aria-live region announcement

  // ─── GLOBAL STATE ───
  const appState = {
    menuOpen: false,
    selectedTab: 0,
    cartCount: 0,
    notificationCount: 0,
    filters: {
      category: 'all',
      price: 'all',
      sort: 'relevance'
    }
  };

  // ─── MENU TOGGLE (Errors 2-5) ───
  const menuButton = document.querySelector('#menu-button');
  const menu = document.querySelector('nav');

  if (menuButton) {
    menuButton.addEventListener('click', function() {
      appState.menuOpen = !appState.menuOpen;
      menu.style.display = appState.menuOpen ? 'block' : 'none';
      
      // ERROR 2: aria-expanded not updated
      // Added: // this.setAttribute('aria-expanded', appState.menuOpen);
      
      // ERROR 3: Menu state not announced
      // Should announce: "Navigation menu opened/closed"
      
      // ERROR 4: Focus not moved to menu
      // Should move focus into menu when opened
    });
    
    // ERROR 5: No keyboard support (Enter/Space)
    // Only handles click events, not keyboard
  }

  // ─── TAB SWITCHING (Errors 6-9) ───
  const tabButtons = document.querySelectorAll('[role="tab"]');
  const tabPanels = document.querySelectorAll('[role="tabpanel"]');

  tabButtons.forEach((button, index) => {
    button.addEventListener('click', function() {
      // Switch tabs
      tabButtons.forEach(btn => btn.setAttribute('aria-selected', 'false'));
      this.setAttribute('aria-selected', 'true');
      
      tabPanels.forEach(panel => panel.style.display = 'none');
      tabPanels[index].style.display = 'block';
      
      // ERROR 6: aria-selected set but aria-controls not used
      // ERROR 7: No focus announcement
      // ERROR 8: Tab order not managed for keyboard navigation
      // ERROR 9: Arrow keys not supported
      
      appState.selectedTab = index;
    });
    
    // ERROR 10: Tabs not keyboard accessible
    // Missing KeyDown handler for Arrow Left/Right
  });

  // ─── FORM VALIDATION (Errors 11-15) ───
  const contactForm = document.querySelector('#contact-form');
  const formInputs = contactForm ? contactForm.querySelectorAll('input, textarea, select') : [];

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      let hasErrors = false;
      const errors = [];
      
      formInputs.forEach((input, index) => {
        if (!input.value.trim()) {
          hasErrors = true;
          
          // ERROR 11: Error message not associated with input (no aria-describedby)
          const errorMsg = document.createElement('span');
          errorMsg.textContent = 'This field is required';
          errorMsg.style.color = 'red';
          
          // ERROR 12: Only visual indication of error (red text)
          // No aria-invalid or role
          input.style.border = '2px solid red';
          
          // ERROR 13: Error not announced to screen readers
          // Should use aria-live or aria-alert
          
          input.parentElement.appendChild(errorMsg);
          errors.push(`Field ${index + 1} is required`);
        }
      });
      
      if (hasErrors) {
        // ERROR 14: Error summary not in accessible location
        // Should announce: "Form has N errors"
        console.error('Form has errors:', errors);
        
        // ERROR 15: Focus not moved to first error field
        // Should focus on first invalid field
        return;
      }
      
      // Submit form...
    });
    
    // ERROR 16: Input validation doesn't provide real-time feedback
    formInputs.forEach(input => {
      input.addEventListener('blur', function() {
        if (!this.value.trim()) {
          this.setAttribute('aria-invalid', 'true');
          // But no aria-describedby to point to error message
          // ERROR 17: Error message not linked to input
        }
      });
    });
  }

  // ─── DYNAMIC CONTENT LOADING (Errors 18-22) ───
  const loadMoreButton = document.querySelector('.load-more-btn');
  
  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', async function() {
      // ERROR 18: No loading indicator for screen readers
      // Should show aria-live announcement: "Loading more items..."
      
      this.disabled = true;
      this.textContent = 'Loading...';
      
      try {
        const response = await fetch('/api/more-items');
        const data = await response.json();
        
        const container = document.querySelector('.items-container');
        
        // ERROR 19: New items inserted without announcement
        data.items.forEach(item => {
          const el = document.createElement('div');
          el.textContent = item.title;
          container.appendChild(el);
          
          // ERROR 20: New items not in tab order
          // Should be focusable and announced
        });
        
        // ERROR 21: Completion not announced
        // Should announce: "Loaded N more items"
        
        // ERROR 22: Focus not returned to button or moved to new content
      } catch (error) {
        console.error('Load failed:', error);
        // ERROR: No error announcement to user
      } finally {
        this.disabled = false;
        this.textContent = 'Load More';
      }
    });
  }

  // ─── SHOPPING CART (Errors 23-26) ───
  const cartButtons = document.querySelectorAll('.add-to-cart-btn');
  const cartCounter = document.querySelector('.cart-count');

  cartButtons.forEach(button => {
    button.addEventListener('click', function() {
      appState.cartCount++;
      
      if (cartCounter) {
        cartCounter.textContent = appState.cartCount;
        
        // ERROR 23: Cart count update not announced
        // Should use aria-live="polite"
        
        // ERROR 24: No keyboard access to add-to-cart
        // Only click handler, no Enter/Space support
        
        // ERROR 25: Confirmation not announced
        // Should announce: "Item added to cart"
      }
    });
  });

  // ─── NOTIFICATIONS (Errors 27-29) ───
  const notificationArea = document.querySelector('[aria-live="polite"]');
  
  function showNotification(message) {
    if (!notificationArea) {
      // ERROR 27: No aria-live region exists
      return;
    }
    
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.background = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '16px';
    notification.style.borderRadius = '4px';
    
    // ERROR 28: Notification not automatically dismissed
    // Stays on screen indefinitely; no timeout
    
    notificationArea.appendChild(notification);
    
    // ERROR 29: No keyboard accessible dismiss mechanism
    // User cannot manually close notification
  }

  // ─── MODAL DIALOG (ERROR 30) ───
  const modalButton = document.querySelector('.open-modal-btn');
  const modal = document.querySelector('.modal');
  const closeButton = modal ? modal.querySelector('.close-btn') : null;

  if (modalButton && modal) {
    modalButton.addEventListener('click', function() {
      modal.style.display = 'block';
      
      // ERROR 30: Focus not trapped in modal
      // No modal role, no focus trap, no backdrop
      // User can tab outside modal to background elements
    });
    
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
        // Focus not returned to opener
      });
    }
    
    // Missing: trap focus within modal, handle Escape key
  }

  // ─── UTILITY: Accessible announcements (not used properly above) ───
  function announceToScreenReader(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.textContent = message;
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    document.body.appendChild(announcement);
    
    // Auto-remove after announcement
    setTimeout(() => announcement.remove(), 1000);
  }

  // ─── DROPDOWN FILTER (Bonus errors not already counted) ───
  const filterSelects = document.querySelectorAll('.filter-select');
  
  filterSelects.forEach(select => {
    select.addEventListener('change', function() {
      const filterType = this.name;
      const filterValue = this.value;
      
      appState.filters[filterType] = filterValue;
      
      // ERROR: Results update not announced
      // Should announce: "Results filtered by [category]"
      
      // Trigger results refresh (would be in separate function)
      // updateResults(appState.filters);
    });
    
    // ERROR: No keyboard support beyond default select behavior
  });

  // ─── PAGE INITIALIZATION ───
  // Would normally initialize all components here
  // with proper aria-labels and roles

})();

// ─── PADDING FOR FILE SIZE (~485 KB) ───
// Repeated utility patterns to reach target size

const unused_var_1 = 'This is padding for file size';
const unused_var_2 = 'Realistic JavaScript bundles contain various utilities';
const unused_var_3 = 'Framework code, polyfills, third-party libraries';
const unused_var_4 = 'Analytics, ads, tracking pixels';
const unused_var_5 = 'CSS-in-JS processors and runtime utilities';

function noop() { return null; }
function identity(x) { return x; }
function constant(val) { return () => val; }

const utilityFunctions = {
  debounce: (fn, wait) => {
    let timeout;
    return function execFunc(...args) {
      const later = () => {
        clearTimeout(timeout);
        fn(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  throttle: (fn, wait) => {
    let timeout;
    let previous = 0;
    return function execFunc(...args) {
      const now = Date.now();
      const remaining = wait - (now - previous);
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        fn(...args);
      } else if (!timeout) {
        timeout = setTimeout(() => execFunc(...args), remaining);
      }
    };
  },
  
  curry: (fn) => {
    const arity = fn.length;
    return function $curry(...args) {
      if (args.length < arity) {
        return $curry.bind(null, ...args);
      }
      return fn.call(null, ...args);
    };
  },
  
  compose: (...fns) => (val) => fns.reduceRight((acc, fn) => fn(acc), val),
  
  pipe: (...fns) => (val) => fns.reduce((acc, fn) => fn(acc), val),
};

// Dummy DOM utilities
const dom = {
  query: (sel) => document.querySelector(sel),
  queryAll: (sel) => document.querySelectorAll(sel),
  create: (tag, attrs = {}) => {
    const el = document.createElement(tag);
    Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]));
    return el;
  },
  addClass: (el, cls) => el.classList.add(cls),
  removeClass: (el, cls) => el.classList.remove(cls),
  toggleClass: (el, cls) => el.classList.toggle(cls),
  hasClass: (el, cls) => el.classList.contains(cls),
};

// Large constant data structures (simulating real app data)
const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
  description: `Description for item ${i}`.repeat(10),
  price: Math.random() * 1000,
  category: ['electronics', 'clothing', 'books', 'home'][i % 4],
}));

// Event delegation helpers
function delegate(selector, eventName, handler) {
  document.addEventListener(eventName, (event) => {
    if (event.target.matches(selector)) {
      handler.call(event.target, event);
    }
  });
}

// Library-like functions (not used but present in bundle)
const logger = {
  log: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
  debug: (...args) => console.debug(...args),
};

// Async utilities
const asyncUtils = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  retry: async (fn, maxAttempts = 3) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        return await fn();
      } catch (e) {
        if (i === maxAttempts - 1) throw e;
      }
    }
  },
  timeout: (promise, ms) => Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    ),
  ]),
};

// Storage utilities
const storage = {
  get: (key) => JSON.parse(localStorage.getItem(key)),
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  remove: (key) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
};

// API client (mock)
const api = {
  get: async (url) => {
    const response = await fetch(url);
    return response.json();
  },
  post: async (url, data) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  put: async (url, data) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  delete: async (url) => {
    await fetch(url, { method: 'DELETE' });
  },
};

// Polyfills and compatibility shims (padding)
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {
      if (this == null) throw new TypeError('"this" is null or not defined');
      const O = Object(this);
      const len = parseInt(O.length) || 0;
      if (len === 0) return false;
      let n = parseInt(fromIndex) || 0;
      let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
      while (k < len) {
        if (O[k] === searchElement) return true;
        k++;
      }
      return false;
    },
  });
}

// Export for use (CJS/ESM compatibility)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { appState, announceToScreenReader, utilityFunctions };
}
