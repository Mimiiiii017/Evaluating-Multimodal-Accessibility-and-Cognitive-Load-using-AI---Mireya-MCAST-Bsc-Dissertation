(function() {
  'use strict';

  // Create announcement region for screen readers
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.style.position = 'absolute';
  announcer.style.left = '-10000px';
  document.body.appendChild(announcer);

  function announce(message) {
    announcer.textContent = message;
  }

  const appState = {
    menuOpen: false,
    selectedTab: 0,
    cartCount: 0,
    filters: {
      category: 'all',
      price: 'all',
      sort: 'relevance'
    }
  };

  // MENU TOGGLE - Fully accessible
  const menuButton = document.querySelector('[aria-label="Open navigation menu"]');
  const menu = document.querySelector('nav');

  if (menuButton && menu) {
    const handleMenuToggle = function() {
      appState.menuOpen = !appState.menuOpen;
      menuButton.setAttribute('aria-expanded', appState.menuOpen);
      menu.hidden = !appState.menuOpen;
      announce(appState.menuOpen ? 'Navigation menu opened' : 'Navigation menu closed');
    };

    menuButton.addEventListener('click', handleMenuToggle);
    menuButton.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleMenuToggle();
      }
    });
  }

  // TAB SWITCHING - Fully keyboard accessible
  const tabButtons = document.querySelectorAll('[role="tab"]');
  const tabPanels = document.querySelectorAll('[role="tabpanel"]');

  tabButtons.forEach((button, index) => {
    button.addEventListener('click', function() {
      selectTab(index);
    });

    button.addEventListener('keydown', function(e) {
      let nextIndex = index;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = index === 0 ? tabButtons.length - 1 : index - 1;
        selectTab(nextIndex);
        tabButtons[nextIndex].focus();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = index === tabButtons.length - 1 ? 0 : index + 1;
        selectTab(nextIndex);
        tabButtons[nextIndex].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        selectTab(0);
        tabButtons[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        selectTab(tabButtons.length - 1);
        tabButtons[tabButtons.length - 1].focus();
      }
    });
  });

  function selectTab(index) {
    tabButtons.forEach((btn, i) => {
      btn.setAttribute('aria-selected', i === index);
      btn.setAttribute('tabindex', i === index ? '0' : '-1');
    });
    
    tabPanels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });
    
    appState.selectedTab = index;
    announce(`Tab ${index + 1} selected`);
  }

  // FORM VALIDATION - Fully accessible
  const contactForm = document.querySelector('#contact-form');
  
  if (contactForm) {
    const formInputs = contactForm.querySelectorAll('input, textarea, select');
    const errorRegion = document.createElement('div');
    errorRegion.setAttribute('aria-live', 'assertive');
    errorRegion.setAttribute('role', 'alert');
    errorRegion.style.position = 'absolute';
    errorRegion.style.left = '-10000px';
    contactForm.appendChild(errorRegion);

    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const errors = [];
      formInputs.forEach((input) => {
        if (input.hasAttribute('required') && !input.value.trim()) {
          errors.push(input.id);
          input.setAttribute('aria-invalid', 'true');
        } else {
          input.setAttribute('aria-invalid', 'false');
        }
      });

      if (errors.length > 0) {
        errorRegion.textContent = `Form has ${errors.length} error(s). Please correct them.`;
        const firstError = document.getElementById(errors[0]);
        if (firstError) {
          firstError.focus();
        }
        return;
      }

      announce('Form submitted successfully');
    });

    formInputs.forEach(input => {
      input.addEventListener('blur', function() {
        if (this.hasAttribute('required') && !this.value.trim()) {
          this.setAttribute('aria-invalid', 'true');
        } else {
          this.setAttribute('aria-invalid', 'false');
        }
      });
    });
  }

  // DYNAMIC CONTENT LOADING
  const loadMoreButton = document.querySelector('.load-more-btn');
  
  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', async function() {
      announce('Loading more items');
      this.disabled = true;
      
      try {
        const response = await fetch('/api/more-items');
        const data = await response.json();
        
        const container = document.querySelector('.items-container');
        data.items.forEach(item => {
          const el = document.createElement('div');
          el.textContent = item.title;
          el.setAttribute('tabindex', '0');
          container.appendChild(el);
        });
        
        announce(`Loaded ${data.items.length} more items`);
      } catch (error) {
        announce('Error loading items. Please try again.');
      } finally {
        this.disabled = false;
      }
    });
  }

  // SHOPPING CART
  const cartButtons = document.querySelectorAll('.add-to-cart-btn');
  const cartCounter = document.querySelector('.cart-count');

  cartButtons.forEach(button => {
    button.addEventListener('click', function() {
      appState.cartCount++;
      if (cartCounter) {
        cartCounter.textContent = appState.cartCount;
        announce(`Item added to cart. Cart total: ${appState.cartCount} items`);
      }
    });
  });

  // MODAL DIALOG - Fully accessible
  const modalButton = document.querySelector('.open-modal-btn');
  const modal = document.querySelector('.modal');
  const closeButton = modal ? modal.querySelector('.close-btn') : null;
  let focusedBeforeModal = null;

  if (modalButton && modal) {
    const openModal = function() {
      focusedBeforeModal = document.activeElement;
      modal.hidden = false;
      modal.setAttribute('aria-modal', 'true');
      const firstFocusable = modal.querySelector('button, [href], input, select, textarea');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    };

    const closeModal = function() {
      modal.hidden = true;
      modal.setAttribute('aria-modal', 'false');
      if (focusedBeforeModal) {
        focusedBeforeModal.focus();
      }
    };

    modalButton.addEventListener('click', openModal);
    
    if (closeButton) {
      closeButton.addEventListener('click', closeModal);
    }

    modal.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  // DROPDOWN FILTER
  const filterSelects = document.querySelectorAll('.filter-select');
  
  filterSelects.forEach(select => {
    select.addEventListener('change', function() {
      const filterType = this.name;
      const filterValue = this.value;
      appState.filters[filterType] = filterValue;
      announce(`Results filtered by ${filterType}: ${filterValue}`);
    });
  });

  // Padding for realism
  const utilityFunctions = {
    debounce: (fn, wait) => {
      let timeout;
      return function execFunc(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
      };
    },
    throttle: (fn, wait) => {
      let timeout;
      let previous = 0;
      return function execFunc(...args) {
        const now = Date.now();
        const remaining = wait - (now - previous);
        if (remaining <= 0 || remaining > wait) {
          previous = now;
          fn(...args);
        } else if (!timeout) {
          timeout = setTimeout(() => {
            previous = Date.now();
            fn(...args);
          }, remaining);
        }
      };
    }
  };

  const largeDataSet = Array.from({ length: 500 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `Description for item ${i}`.repeat(5),
    category: ['electronics', 'clothing', 'books'][i % 3],
  }));

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
    }
  };

})();
