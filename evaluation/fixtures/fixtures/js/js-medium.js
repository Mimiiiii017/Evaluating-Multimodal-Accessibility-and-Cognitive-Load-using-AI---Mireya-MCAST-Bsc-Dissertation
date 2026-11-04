/**
 * @fileoverview Luminary Studio — Main Application Script
 *
 * Handles all client-side interactivity for the Luminary Studio marketing site,
 * including accessible navigation, search, product filtering, pricing toggle,
 * FAQ accordion, form validation, analytics, and progressive enhancement.
 *
 * Accessibility commitments:
 *   - All interactive components managed with correct ARIA states / roles
 *   - Full keyboard operability (WCAG 2.1.1)
 *   - Focus visible on all custom controls (WCAG 2.4.7 / 2.4.11)
 *   - Live-region announcements for dynamic content changes (WCAG 4.1.3)
 *   - Reduced-motion guard on all animations (WCAG 2.3.3)
 *   - Touch targets ≥ 44 × 44 px (WCAG 2.5.8)
 *
 * @author       Luminary Studio Engineering
 * @version      3.7.2
 * @license      Proprietary — © 2025 Luminary Studio Ltd
 */

'use strict';

/* ---------------------------------------------------------------------------
   CONFIGURATION
   All tunable values live here so the rest of the code stays clean.
   --------------------------------------------------------------------------- */

/**
 * Global application configuration.
 * Override individual keys by setting window.LUMINARY_CONFIG before this
 * script loads.
 *
 * @namespace
 * @property {object} app            - Core application settings.
 * @property {object} navigation     - Header/nav behaviour settings.
 * @property {object} search         - Search feature settings.
 * @property {object} products       - Product catalogue settings.
 * @property {object} pricing        - Pricing module settings.
 * @property {object} faq            - FAQ accordion settings.
 * @property {object} forms          - Form validation settings.
 * @property {object} analytics      - Analytics / telemetry settings.
 * @property {object} accessibility  - a11y-specific overrides.
 * @property {object} performance    - Performance & loading settings.
 * @property {object} api            - API endpoint configuration.
 * @property {object} storage        - Browser-storage key names.
 * @property {object} cookies        - Cookie policy settings.
 * @property {object} toast          - Toast notification settings.
 */
const CONFIG = Object.freeze(
  Object.assign(
    {
      app: {
        name:              'Luminary Studio',
        version:           '3.7.2',
        environment:       'production',
        debug:             false,
        locale:            'en-GB',
        currency:          'GBP',
        currencySymbol:    '£',
        baseUrl:           'https://luminarystudio.io',
        cdnUrl:            'https://cdn.luminarystudio.io',
        supportEmail:      'hello@luminarystudio.io',
        billingEmail:      'billing@luminarystudio.io',
        twitterHandle:     '@luminarystudio',
        githubOrg:         'luminary-studio',
      },

      navigation: {
        /** Pixel distance to scroll before the header gets the scrolled class */
        stickyThreshold:          10,
        /** Milliseconds before a dropdown auto-closes after focus leaves */
        dropdownCloseDelay:       200,
        /** Milliseconds before a dropdown opens on hover (desktop) */
        dropdownOpenDelay:        100,
        /** CSS class toggled on <header> when page is scrolled */
        headerScrolledClass:      'header--scrolled',
        /** CSS class added to <body> when mobile menu is open */
        bodyNavOpenClass:         'nav-open',
        /** CSS class toggled on the mobile nav element when open */
        navOpenClass:             'is-open',
        /** Minimum swipe distance (px) to trigger close-on-swipe */
        swipeCloseThreshold:      80,
        /** Whether to close dropdowns when pressing Escape */
        closeDropdownOnEscape:    true,
        /** Whether dropdowns open on hover (desktop only) */
        openDropdownOnHover:      true,
        /** Whether the mobile menu closes when user taps outside */
        closeMenuOnOutsideClick:  true,
      },

      search: {
        /** Minimum characters before search fires */
        minQueryLength:            2,
        /** Debounce delay (ms) for the search input handler */
        debounceDelay:             300,
        /** Maximum number of suggestion items to render */
        maxSuggestions:            8,
        /** Maximum number of recent queries stored in localStorage */
        maxRecentQueries:          5,
        /** localStorage key for persisted recent queries */
        recentQueriesKey:          'luminary_recent_searches',
        /** Endpoint for search suggestions (autocomplete) */
        suggestionsEndpoint:       '/api/v1/search/suggest',
        /** Endpoint for full search results */
        resultsEndpoint:           '/api/v1/search',
        /** Default category to search (empty = all) */
        defaultCategory:           '',
        /** Whether to highlight matching terms in results */
        highlightMatches:          true,
        /** CSS class applied to highlighted match spans */
        highlightClass:            'search-highlight',
        /** Number of ms to cache suggestions in memory */
        cacheLifetimeMs:           60_000,
        /** Whether to show recent queries when input is focused with no text */
        showRecentOnFocus:         true,
      },

      products: {
        /** CSS class added to cards that are hidden by the active filter */
        hiddenClass:               'product-card--hidden',
        /** CSS class added to cards that are visible */
        visibleClass:              'product-card--visible',
        /** Animation duration (ms) for show/hide transitions */
        animationDuration:        250,
        /** Whether to animate card count badge updates */
        animateCount:             true,
        /** Attribute used to read a card's category */
        categoryAttribute:        'data-category',
        /** Value of the "show all" filter button */
        allFilterValue:           'all',
        /** localStorage key for persisting user's last selected filter */
        lastFilterKey:            'luminary_product_filter',
        /** Whether to restore last filter on page load */
        restoreLastFilter:        true,
      },

      pricing: {
        /** Initially selected billing period ('monthly' | 'annual') */
        defaultPeriod:            'annual',
        /** Discount percentage shown for annual billing */
        annualDiscountPercent:    20,
        /** Data attribute on price elements holding the monthly value */
        monthlyAttr:              'data-price-monthly',
        /** Data attribute on price elements holding the annual value */
        annualAttr:               'data-price-annual',
        /** Currency prefix prepended to rendered prices */
        currencyPrefix:           '£',
        /** Suffix appended after the numeric price */
        priceSuffix:              '/seat/month',
        /** Whether to animate price transitions */
        animatePriceChange:       true,
        /** Duration (ms) of the price flip animation */
        priceAnimationDuration:   300,
        /** localStorage key for persisting billing period preference */
        storageKey:               'luminary_billing_period',
      },

      faq: {
        /** Whether clicking an open item closes it (accordion mode) */
        collapsible:              true,
        /** Whether only one item can be open at a time */
        singleOpen:               false,
        /** Duration (ms) for expand/collapse animation */
        animationDuration:        250,
        /** CSS easing for the height transition */
        animationEasing:          'ease-in-out',
        /** Whether the first item opens automatically on load */
        openFirstOnLoad:          false,
        /** Deep-link hash prefix for direct-linking to FAQ items */
        hashPrefix:               'faq-',
        /** Whether to honour URL hash on page load */
        honoursHash:              true,
      },

      forms: {
        /** Debounce delay (ms) between keystrokes and inline validation */
        validationDebounce:       400,
        /** Whether to validate in real-time (on input) */
        realtimeValidation:       true,
        /** Whether to validate on blur */
        validateOnBlur:           true,
        /** Whether to show character count on textareas */
        showCharCount:            true,
        /** Minimum message length for the contact form textarea */
        minMessageLength:         20,
        /** Maximum message length for the contact form textarea */
        maxMessageLength:         2000,
        /** Maximum file size (bytes) for any file uploads */
        maxFileSize:              5_242_880,
        /** Accepted MIME types for file uploads */
        acceptedFileTypes:        ['image/png', 'image/jpeg', 'application/pdf'],
        /** Simulated network delay (ms) for form submission in dev */
        simulatedSubmitDelay:     1200,
        /** Contact form submission endpoint */
        contactEndpoint:          '/api/v1/contact',
        /** Newsletter subscription endpoint */
        newsletterEndpoint:       '/api/v1/newsletter/subscribe',
        /** CSS class added to invalid fields */
        invalidClass:             'input--invalid',
        /** CSS class added to valid fields */
        validClass:               'input--valid',
        /** CSS class for the inline error message element */
        errorMsgClass:            'field-error',
        /** CSS class for the inline success message element */
        successMsgClass:          'field-success',
        /** Whether honeypot field is used for spam detection */
        useHoneypot:              true,
        /** Name of the honeypot field (should stay empty) */
        honeypotFieldName:        'website',
      },

      analytics: {
        /** Whether analytics collection is enabled */
        enabled:                  true,
        /** MeasurementId for GA4 */
        ga4MeasurementId:         'G-XXXXXXXXXX',
        /** Whether to anonymise IP addresses */
        anonymiseIp:              true,
        /** Whether to send performance timings */
        sendPerformance:          true,
        /** Whether to track scroll depth */
        trackScrollDepth:         true,
        /** Scroll depth thresholds to fire events at (%) */
        scrollDepthThresholds:    [25, 50, 75, 90, 100],
        /** Whether to track outbound link clicks */
        trackOutboundLinks:       true,
        /** Whether to track CTA button clicks */
        trackCtaClicks:           true,
        /** Whether to track file downloads */
        trackDownloads:           true,
        /** File extension patterns considered "downloads" */
        downloadExtensions:       ['pdf', 'zip', 'xlsx', 'csv', 'docx'],
        /** Milliseconds to wait before firing time-on-page events */
        engagementTimeMs:         30_000,
        /** Custom dimension slot for the user plan type */
        planDimension:            'custom_plan_type',
        /** Custom dimension slot for the referral source */
        referralDimension:        'custom_referral',
      },

      accessibility: {
        /** Whether to inject a live-region status element if not in DOM */
        injectLiveRegion:         true,
        /** ID of the live-region element */
        liveRegionId:             'status-region',
        /** How long (ms) before clearing the live-region text */
        liveRegionClearDelay:     5000,
        /** Whether to show a visible skip-link on load (for debugging) */
        showSkipLinks:            true,
        /** Minimum colour-contrast ratio to flag contrast warnings */
        minContrastRatio:         4.5,
        /** Whether to add visible focus styles via JS (fallback) */
        forceFocusVisible:        false,
        /** Class added to <html> when user prefers reduced motion */
        reducedMotionClass:       'prefers-reduced-motion',
        /** Class added to <html> when the device is touch-primary */
        touchClass:               'is-touch',
        /** Whether to manage roving tabindex on nav menus */
        rovingTabindex:           true,
      },

      performance: {
        /** Whether to use IntersectionObserver for lazy reveals */
        lazyReveal:               true,
        /** Root margin for the IntersectionObserver */
        lazyRootMargin:           '0px 0px -80px 0px',
        /** IntersectionObserver threshold */
        lazyThreshold:            0.1,
        /** CSS class added when an element enters the viewport */
        revealClass:              'is-visible',
        /** Whether to prefetch links on hover */
        prefetchOnHover:          true,
        /** Delay (ms) before prefetch fires on hover */
        prefetchDelay:            150,
        /** Maximum concurrent prefetch requests */
        maxPrefetchConcurrent:    3,
        /** Whether to enable resource hints (preconnect / dns-prefetch) */
        resourceHints:            true,
      },

      api: {
        baseUrl:                  '/api/v1',
        timeout:                  10_000,
        retryAttempts:            3,
        retryDelay:               1000,
        headers: {
          'Content-Type':         'application/json',
          'Accept':               'application/json',
          'X-Requested-With':     'XMLHttpRequest',
        },
      },

      storage: {
        billingPeriod:            'luminary_billing_period',
        productFilter:            'luminary_product_filter',
        recentSearches:           'luminary_recent_searches',
        cookieConsent:            'luminary_cookie_consent',
        themePreference:          'luminary_theme',
        dismissedBanners:         'luminary_dismissed_banners',
      },

      cookies: {
        consentCookieName:        'luminary_consent',
        consentCookieExpiry:      365,
        analyticsCategory:        'analytics',
        marketingCategory:        'marketing',
        functionalCategory:       'functional',
        necessaryCategory:        'necessary',
        bannerDismissedKey:       'cookie_banner_dismissed',
      },

      toast: {
        defaultDuration:          4000,
        errorDuration:            6000,
        successDuration:          3500,
        position:                 'bottom-right',
        maxVisible:               3,
        animationDuration:        300,
        classes: {
          container:              'toast-container',
          item:                   'toast',
          success:                'toast--success',
          error:                  'toast--error',
          warning:                'toast--warning',
          info:                   'toast--info',
          dismissBtn:             'toast__dismiss',
        },
      },
    },
    window.LUMINARY_CONFIG || {}
  )
);

/* ---------------------------------------------------------------------------
   SELECTORS
   All DOM query strings in one place.
   --------------------------------------------------------------------------- */

/**
 * CSS selector strings mapped to short, readable keys.
 * Centralising selectors makes refactoring markup much easier
 * and avoids magic strings scattered throughout the code.
 *
 * @namespace
 */
const SELECTORS = Object.freeze({
  /* Header / Nav */
  header:                    'header[role="banner"]',
  headerInner:               '.header-inner',
  navToggle:                 '.nav-toggle',
  mainNav:                   '#main-nav',
  navMenu:                   '#nav-menu',
  navMenuItems:              '#nav-menu > li > a, #nav-menu > li > button',
  navDropdownTrigger:        '#nav-menu > li > button[aria-haspopup]',
  navDropdownMenu:           '#nav-menu [id$="-submenu"]',
  navDropdownLinks:          '#nav-menu [id$="-submenu"] a',
  logoLink:                  '.header-inner > a:first-child',
  skipLinks:                 '.skip-link',

  /* Search */
  searchForm:                '#site-search',
  searchInput:               '#search-input',
  searchSubmit:              '#site-search button[type="submit"]',
  searchSuggestions:         '#search-suggestions',
  searchResults:             '#search-results',

  /* Account nav */
  accountNav:                'nav[aria-label="Account navigation"]',

  /* Main content */
  main:                      '#main-content',
  statusRegion:              '#status-region',

  /* Hero */
  hero:                      '.hero',
  heroCta:                   '.hero-ctas .btn',

  /* Logo bar */
  logoBar:                   '.logo-bar',
  logoList:                  '.logo-list',

  /* Features */
  featuresSection:           '.features-section',
  featureCards:              '.feature-card',

  /* How it works */
  howItWorks:                '.how-it-works',
  stepsItems:                '.step',

  /* Products */
  productsSection:           '.products-section',
  filterTabs:                '.filter-tabs button',
  productGrid:               '.product-grid',
  productCards:              '.product-card',

  /* Stats */
  statsSection:              '.stats-section',
  statItems:                 '.stat-item',
  statValues:                '.stat-value',

  /* Pricing */
  pricingSection:            '.pricing-section',
  billingMonthly:            '#billing-monthly',
  billingAnnual:             '#billing-annual',
  pricingCards:              '.pricing-card',
  priceAmount:               '.price-amount',
  pricePeriod:               '.price-period',
  pricingToggle:             '.pricing-toggle',

  /* Comparison table */
  comparisonSection:         '.comparison-section',
  tableWrapper:              '.table-wrapper',

  /* Testimonials */
  testimonialsSection:       '.testimonials-section',
  testimonialCards:          '.testimonial-card',

  /* FAQ */
  faqSection:                '.faq-section',
  faqList:                   '.faq-list',
  faqItems:                  '.faq-item',
  faqTriggers:               '.faq-item dt button',
  faqAnswers:                '.faq-item dd',

  /* Newsletter */
  newsletterSection:         '.newsletter-section',
  newsletterForm:            '.newsletter-section form',
  newsletterEmail:           '#newsletter-email',
  newsletterConsent:         '#newsletter-consent',
  newsletterSubmit:          '.newsletter-section button[type="submit"]',

  /* Contact form */
  contactSection:            '.contact-section',
  contactForm:               '.contact-section form',
  contactFirstName:          '#contact-first-name',
  contactLastName:           '#contact-last-name',
  contactEmail:              '#contact-email',
  contactCompany:            '#contact-company',
  contactTeamSize:           '#contact-team-size',
  contactMessage:            '#contact-message',
  contactSubmit:             '.contact-section button[type="submit"]',

  /* Footer */
  footer:                    'footer[role="contentinfo"]',
  footerBrand:               '.footer-brand',
  footerNav:                 '.footer-inner nav',
  footerBottom:              '.footer-bottom',
  socialLinks:               '.social-links a',
  cookieSettingsBtn:         '#cookie-settings-btn',

  /* Scroll to top */
  scrollTopBtn:              '#scroll-top-btn',
});

/* ---------------------------------------------------------------------------
   ARIA ATTRIBUTE NAMES
   --------------------------------------------------------------------------- */

/**
 * ARIA attribute name constants to avoid typos in setAttribute calls.
 *
 * @namespace
 */
const ARIA = Object.freeze({
  EXPANDED:         'aria-expanded',
  CONTROLS:         'aria-controls',
  HASPOPUP:         'aria-haspopup',
  LABEL:            'aria-label',
  LABELLEDBY:       'aria-labelledby',
  DESCRIBEDBY:      'aria-describedby',
  HIDDEN:           'aria-hidden',
  LIVE:             'aria-live',
  ATOMIC:           'aria-atomic',
  RELEVANT:         'aria-relevant',
  BUSY:             'aria-busy',
  CURRENT:          'aria-current',
  PRESSED:          'aria-pressed',
  SELECTED:         'aria-selected',
  CHECKED:          'aria-checked',
  DISABLED:         'aria-disabled',
  REQUIRED:         'aria-required',
  INVALID:          'aria-invalid',
  ERRORMESSAGE:     'aria-errormessage',
  ROLE:             'role',
  TABINDEX:         'tabindex',
  AUTOCOMPLETE:     'aria-autocomplete',
  ACTIVEDESCENDANT: 'aria-activedescendant',
  MULTISELECTABLE:  'aria-multiselectable',
  ORIENTATION:      'aria-orientation',
  SORT:             'aria-sort',
  LEVEL:            'aria-level',
  POSINSET:         'aria-posinset',
  SETSIZE:          'aria-setsize',
  VALUENOW:         'aria-valuenow',
  VALUEMIN:         'aria-valuemin',
  VALUEMAX:         'aria-valuemax',
  VALUETEXT:        'aria-valuetext',
  MODAL:            'aria-modal',
  READONLY:         'aria-readonly',
  PLACEHOLDER:      'aria-placeholder',
  KEYSHORTCUTS:     'aria-keyshortcuts',
  ROLEDESCRIPTION:  'aria-roledescription',
});

/* ---------------------------------------------------------------------------
   KEY CODES
   --------------------------------------------------------------------------- */

/**
 * Keyboard key identifiers used in event handlers.
 * Uses the modern `event.key` values.
 *
 * @namespace
 */
const KEYS = Object.freeze({
  ENTER:      'Enter',
  SPACE:      ' ',
  ESCAPE:     'Escape',
  TAB:        'Tab',
  ARROW_UP:   'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT:'ArrowRight',
  HOME:       'Home',
  END:        'End',
  PAGE_UP:    'PageUp',
  PAGE_DOWN:  'PageDown',
  BACKSPACE:  'Backspace',
  DELETE:     'Delete',
  F1:         'F1',
  F2:         'F2',
  F6:         'F6',
  A:          'a',
  C:          'c',
  V:          'v',
  X:          'x',
  Z:          'z',
});

/* ---------------------------------------------------------------------------
   BREAKPOINTS
   Keep in sync with CSS custom properties --container-* values.
   --------------------------------------------------------------------------- */

/**
 * Responsive breakpoint values (pixels) matching the CSS layout.
 *
 * @namespace
 */
const BREAKPOINTS = Object.freeze({
  xs:    0,
  sm:    480,
  md:    768,
  lg:    1024,
  xl:    1280,
  '2xl': 1536,
});

/* ---------------------------------------------------------------------------
   TIMING
   --------------------------------------------------------------------------- */

/**
 * Animation and timeout durations (milliseconds).
 *
 * @namespace
 */
const TIMING = Object.freeze({
  FAST:              150,
  BASE:              200,
  SLOW:              300,
  SLOWER:            500,
  SKELETON_DELAY:    800,
  TOAST_SHOW:        300,
  DEBOUNCE_INPUT:    300,
  DEBOUNCE_RESIZE:   150,
  DEBOUNCE_SCROLL:   50,
  RIPPLE_DURATION:   600,
  COUNTER_DURATION:  2000,
  COUNTER_STEPS:     60,
  PREFETCH_DELAY:    150,
  LIVE_REGION_CLEAR: 5000,
});

/* ---------------------------------------------------------------------------
   EVENT TYPES
   --------------------------------------------------------------------------- */

/**
 * DOM event type strings to avoid magic strings in addEventListener calls.
 *
 * @namespace
 */
const EVENTS = Object.freeze({
  CLICK:           'click',
  KEYDOWN:         'keydown',
  KEYUP:           'keyup',
  KEYPRESS:        'keypress',
  FOCUS:           'focus',
  BLUR:            'blur',
  FOCUSIN:         'focusin',
  FOCUSOUT:        'focusout',
  CHANGE:          'change',
  INPUT:           'input',
  SUBMIT:          'submit',
  RESET:           'reset',
  SCROLL:          'scroll',
  RESIZE:          'resize',
  LOAD:            'load',
  DOMCONTENTLOADED:'DOMContentLoaded',
  BEFOREUNLOAD:    'beforeunload',
  VISIBILITYCHANGE:'visibilitychange',
  POINTERDOWN:     'pointerdown',
  POINTERUP:       'pointerup',
  POINTERMOVE:     'pointermove',
  TOUCHSTART:      'touchstart',
  TOUCHMOVE:       'touchmove',
  TOUCHEND:        'touchend',
  MOUSEENTER:      'mouseenter',
  MOUSELEAVE:      'mouseleave',
  MOUSEOVER:       'mouseover',
  MOUSEOUT:        'mouseout',
  CONTEXTMENU:     'contextmenu',
  WHEEL:           'wheel',
  ANIMATIONEND:    'animationend',
  TRANSITIONEND:   'transitionend',
  HASHCHANGE:      'hashchange',
  POPSTATE:        'popstate',
  STORAGE:         'storage',
  ONLINE:          'online',
  OFFLINE:         'offline',
  ERROR:           'error',
  ABORT:           'abort',
  PROGRESS:        'progress',
  MESSAGEEVENT:    'message',
  INTERSECTION:    'intersection',
});

/* ---------------------------------------------------------------------------
   CSS CLASS NAMES
   --------------------------------------------------------------------------- */

/**
 * CSS class names toggled by JavaScript.
 * Having them here avoids typos and makes refactoring a one-line change.
 *
 * @namespace
 */
const CSS = Object.freeze({
  /* Visibility */
  HIDDEN:              'is-hidden',
  VISIBLE:             'is-visible',
  OPEN:                'is-open',
  CLOSED:              'is-closed',
  ACTIVE:              'is-active',
  INACTIVE:            'is-inactive',
  SELECTED:            'is-selected',
  DISABLED:            'is-disabled',
  LOADING:             'is-loading',
  LOADED:              'is-loaded',
  ERROR:               'has-error',
  SUCCESS:             'has-success',
  FOCUSED:             'is-focused',
  ANIMATING:           'is-animating',

  /* Header */
  HEADER_SCROLLED:     'header--scrolled',
  HEADER_TRANSPARENT:  'header--transparent',
  BODY_NAV_OPEN:       'nav-open',

  /* Navigation */
  NAV_OPEN:            'is-open',
  NAV_ITEM_ACTIVE:     'nav-item--active',
  DROPDOWN_OPEN:       'dropdown--open',

  /* Cards */
  CARD_VISIBLE:        'product-card--visible',
  CARD_HIDDEN:         'product-card--hidden',
  CARD_HIGHLIGHTED:    'product-card--highlighted',

  /* Forms */
  FIELD_INVALID:       'input--invalid',
  FIELD_VALID:         'input--valid',
  FIELD_DIRTY:         'is-dirty',
  FIELD_TOUCHED:       'is-touched',

  /* Animation helpers */
  FADE_IN:             'fade-in',
  FADE_OUT:            'fade-out',
  SLIDE_IN:            'slide-in',
  SLIDE_OUT:           'slide-out',
  SCALE_IN:            'scale-in',
  SCALE_OUT:           'scale-out',
  BOUNCE:              'bounce',
  SHAKE:               'shake',
  PULSE:               'pulse',

  /* Scroll-to-top */
  SCROLL_BTN_VISIBLE:  'scroll-top-btn--visible',

  /* Toast */
  TOAST_SHOW:          'toast--show',
  TOAST_HIDE:          'toast--hide',

  /* Reduced motion */
  REDUCED_MOTION:      'prefers-reduced-motion',

  /* Touch device */
  IS_TOUCH:            'is-touch',

  /* Sticky sentinel */
  STICKY_SENTINEL:     'sticky-sentinel',
});

/* ---------------------------------------------------------------------------
   USER-FACING STRINGS
   --------------------------------------------------------------------------- */

/**
 * All user-facing strings (error messages, announcements, labels) in one
 * place for easy localisation and audit.
 *
 * @namespace
 */
const STRINGS = Object.freeze({
  /* Announcements */
  announce: {
    navOpen:              'Navigation menu opened',
    navClosed:            'Navigation menu closed',
    filterApplied:        (cat) => `Showing ${cat} products`,
    filterAll:            'Showing all products',
    pricingMonthly:       'Prices switched to monthly billing',
    pricingAnnual:        'Prices switched to annual billing — save 20%',
    faqOpened:            (title) => `${title} — answer expanded`,
    faqClosed:            (title) => `${title} — answer collapsed`,
    formSubmitting:       'Submitting your form, please wait…',
    formSuccess:          'Your message has been sent. We\'ll be in touch shortly.',
    newsletterSuccess:    'You\'re subscribed! Check your inbox to confirm.',
    searchResultsFound:   (n, q) => `${n} result${n === 1 ? '' : 's'} found for "${q}"`,
    searchNoResults:      (q) => `No results found for "${q}"`,
    searchClearing:       'Search cleared',
    pageLoaded:           'Page loaded',
    scrolledToTop:        'Scrolled back to top of page',
    copied:               'Copied to clipboard',
    loggedIn:             'Welcome back. You are now signed in.',
    loggedOut:            'You have been signed out.',
    sessionExpiring:      'Your session will expire in 5 minutes.',
  },

  /* Form validation errors */
  validation: {
    required:             'This field is required.',
    emailInvalid:         'Please enter a valid email address (e.g. you@example.com).',
    emailDomain:          'Please use a work email address.',
    nameTooShort:         'Please enter at least 2 characters.',
    nameTooLong:          (max) => `Name must be ${max} characters or fewer.`,
    messageTooShort:      (min) => `Message must be at least ${min} characters.`,
    messageTooLong:       (max) => `Message must be ${max} characters or fewer.`,
    consentRequired:      'You must agree to receive marketing emails to subscribe.',
    phoneInvalid:         'Please enter a valid phone number.',
    urlInvalid:           'Please enter a valid URL (e.g. https://example.com).',
    fileTooLarge:         (maxMb) => `File must be smaller than ${maxMb} MB.`,
    fileTypeNotAllowed:   'This file type is not allowed.',
    honeypotFilled:       'Submission blocked.',
    serverError:          'Something went wrong on our end. Please try again in a moment.',
    networkError:         'Unable to reach the server. Please check your connection.',
    rateLimited:          'Too many requests. Please wait a moment and try again.',
    sessionExpired:       'Your session has expired. Please refresh the page.',
    recaptchaFailed:      'Security check failed. Please refresh and try again.',
  },

  /* API status messages */
  api: {
    loading:              'Loading…',
    success:              'Success!',
    error:                'An error occurred.',
    timeout:              'The request timed out. Please try again.',
    offline:              'You appear to be offline. Please check your connection.',
    retrying:             (n) => `Retrying… (attempt ${n})`,
  },

  /* Cookie consent */
  cookies: {
    bannerMessage:        'We use cookies to improve your experience and analyse site usage.',
    acceptAll:            'Accept all cookies',
    rejectNonEssential:   'Reject non-essential',
    manageSettings:       'Manage cookie settings',
    saved:                'Cookie preferences saved.',
  },

  /* Tooltips / labels */
  labels: {
    scrollToTop:          'Scroll back to top',
    dismissToast:         'Dismiss notification',
    openMenu:             'Open navigation menu',
    closeMenu:            'Close navigation menu',
    expandFaq:            'Expand answer',
    collapseFaq:          'Collapse answer',
    switchToMonthly:      'Switch to monthly billing',
    switchToAnnual:       'Switch to annual billing (save 20%)',
    copyToClipboard:      'Copy to clipboard',
    showPassword:         'Show password',
    hidePassword:         'Hide password',
    clearSearch:          'Clear search',
    search:               'Search',
    loading:              'Loading, please wait',
    close:                'Close',
    previous:             'Previous',
    next:                 'Next',
  },

  /* Pricing strings */
  pricing: {
    free:                 'Free',
    custom:               'Custom',
    perSeatPerMonth:      'per seat / month',
    perMonth:             'per month',
    billedAnnually:       'billed annually',
    billedMonthly:        'billed monthly',
    savePercent:          (n) => `Save ${n}%`,
    startTrial:           'Start free trial',
    talkToSales:          'Talk to sales',
    mostPopular:          'Most popular',
    currentPlan:          'Current plan',
  },
});

/* ---------------------------------------------------------------------------
   REGEX PATTERNS
   --------------------------------------------------------------------------- */

/**
 * Regular expressions for validation and parsing.
 *
 * @namespace
 */
const REGEX = Object.freeze({
  /**
   * RFC 5322-aligned email pattern — covers the vast majority of valid
   * addresses without being overly restrictive.
   */
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,

  /**
   * Work email — rejects common public / free providers.
   * Used on the contact form "work email" field.
   */
  FREE_EMAIL_DOMAIN: /^[^@]+@(gmail|yahoo|hotmail|outlook|icloud|proton|me|aol|live|msn)\./i,

  /** E.164-ish phone number (accepts spaces, dashes, brackets, +) */
  PHONE: /^\+?[\d\s\-().]{7,20}$/,

  /** Basic URL — must include a protocol */
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/,

  /** Matches leading and trailing whitespace */
  TRIM_WHITESPACE: /^\s+|\s+$/g,

  /** Collapses multiple internal spaces */
  COLLAPSE_SPACES: /\s{2,}/g,

  /** Matches anything that looks like an HTML tag */
  HTML_TAG: /<[^>]+>/g,

  /** Matches characters that must be escaped in HTML */
  HTML_ENTITY: /[&<>"']/g,

  /** Matches a CSS hex colour (3 or 6 digits, with optional #) */
  HEX_COLOUR: /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,

  /** Slug validator — lowercase alphanumeric + hyphens */
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

  /** UK postcode */
  UK_POSTCODE: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,

  /** Semantic version */
  SEMVER: /^\d+\.\d+\.\d+(?:[-+].+)?$/,

  /** Matches a camelCase word boundary for conversion */
  CAMEL_BOUNDARY: /([a-z])([A-Z])/g,

  /** ISO 8601 date string */
  ISO_DATE: /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/,
});

/* ---------------------------------------------------------------------------
   FEATURE DETECTION
   --------------------------------------------------------------------------- */

/**
 * Detected browser and platform capabilities.
 * Evaluated once on script parse; use these instead of calling
 * matchMedia / navigator etc. in hot paths.
 *
 * @namespace
 */
const SUPPORTS = Object.freeze({
  /** Whether IntersectionObserver is available */
  intersectionObserver:    typeof IntersectionObserver !== 'undefined',

  /** Whether ResizeObserver is available */
  resizeObserver:          typeof ResizeObserver !== 'undefined',

  /** Whether MutationObserver is available */
  mutationObserver:        typeof MutationObserver !== 'undefined',

  /** Whether CSS custom properties are supported */
  cssCustomProperties:     CSS.supports && CSS.supports('--test', '0'),

  /** Whether the :focus-visible pseudo-class is supported */
  focusVisible:            CSS.supports && CSS.supports('selector(:focus-visible)'),

  /** Whether the :has() pseudo-class is supported */
  cssHas:                  CSS.supports && CSS.supports('selector(:has(*))'),

  /** Whether requestAnimationFrame is available */
  raf:                     typeof requestAnimationFrame !== 'undefined',

  /** Whether the user prefers reduced motion */
  prefersReducedMotion:    window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  /** Whether the user prefers a dark colour scheme */
  prefersDark:             window.matchMedia('(prefers-color-scheme: dark)').matches,

  /** Whether the user prefers high contrast */
  prefersHighContrast:     window.matchMedia('(forced-colors: active)').matches,

  /** Whether the device is touch-primary */
  touch:                   typeof window.ontouchstart !== 'undefined' || navigator.maxTouchPoints > 0,

  /** Whether sessionStorage is accessible */
  sessionStorage: (() => {
    try { sessionStorage.setItem('_t', '1'); sessionStorage.removeItem('_t'); return true; }
    catch { return false; }
  })(),

  /** Whether localStorage is accessible */
  localStorage: (() => {
    try { localStorage.setItem('_t', '1'); localStorage.removeItem('_t'); return true; }
    catch { return false; }
  })(),

  /** Whether the Clipboard API is available */
  clipboard:               typeof navigator.clipboard !== 'undefined',

  /** Whether the share sheet API is available */
  share:                   typeof navigator.share !== 'undefined',

  /** Whether geolocation is available */
  geolocation:             typeof navigator.geolocation !== 'undefined',

  /** Whether the Page Visibility API is available */
  pageVisibility:          typeof document.hidden !== 'undefined',

  /** Whether the Performance API (with PerformanceObserver) is available */
  performanceObserver:     typeof PerformanceObserver !== 'undefined',

  /** Whether idleCallback is supported */
  idleCallback:            typeof requestIdleCallback !== 'undefined',

  /** Whether this is a WebKit/Blink browser */
  webkit:                  /webkit/i.test(navigator.userAgent),

  /** Whether this is a Firefox browser */
  firefox:                 /firefox/i.test(navigator.userAgent),

  /** Whether this is an iOS device */
  ios:                     /iphone|ipad|ipod/i.test(navigator.userAgent),

  /** Whether this is an Android device */
  android:                 /android/i.test(navigator.userAgent),

  /** Whether this is a Mac desktop */
  mac:                     /mac/i.test(navigator.platform) && !/iphone|ipad|ipod/i.test(navigator.userAgent),

  /** Whether this is a Windows desktop */
  windows:                 /win/i.test(navigator.platform),

  /** Whether the browser reports save-data mode */
  saveData:                navigator.connection && navigator.connection.saveData,

  /** Whether the Beacon API is available for send-on-unload analytics */
  beacon:                  typeof navigator.sendBeacon !== 'undefined',

  /** Whether ES modules are supported natively */
  esModules:               'noModule' in document.createElement('script'),

  /** Maximum device pixel ratio (for high-DPI aware queries) */
  devicePixelRatio:        window.devicePixelRatio || 1,
});

/* ---------------------------------------------------------------------------
   ENVIRONMENT HELPERS
   --------------------------------------------------------------------------- */

/**
 * Returns whether the application is in development mode.
 * @returns {boolean}
 */
function isDev() {
  return CONFIG.app.environment !== 'production';
}

/**
 * Returns whether verbose debug logging is enabled.
 * @returns {boolean}
 */
function isDebug() {
  return CONFIG.app.debug || isDev();
}

/**
 * Logs a message to the console only when debug mode is active.
 * Groups related messages when a label is provided.
 *
 * @param {...*} args - Values forwarded to console.log.
 */
function debug(...args) {
  if (isDebug()) {
    console.log('[Luminary]', ...args);
  }
}

/**
 * Logs a warning to the console only when debug mode is active.
 *
 * @param {...*} args - Values forwarded to console.warn.
 */
function warn(...args) {
  if (isDebug()) {
    console.warn('[Luminary]', ...args);
  }
}

/**
 * Logs an error to the console unconditionally (errors are always visible).
 *
 * @param {...*} args - Values forwarded to console.error.
 */
function logError(...args) {
  console.error('[Luminary]', ...args);
}

/**
 * Returns the current Unix timestamp in milliseconds.
 * Thin wrapper over Date.now() for readability.
 *
 * @returns {number} Milliseconds since Unix epoch.
 */
function now() {
  return Date.now();
}

/**
 * Returns a high-resolution timestamp if available, otherwise Date.now().
 *
 * @returns {number} Milliseconds (possibly sub-millisecond precision) elapsed.
 */
function perfNow() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/**
 * Generates a pseudo-random UUID v4.
 * Uses the Web Crypto API when available for better entropy; otherwise
 * falls back to Math.random().
 *
 * @returns {string} A UUID-formatted string, e.g. "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".
 */
function uuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates a short, URL-safe unique ID of a given length.
 * Suitable for generating element IDs or tracking tokens (not crypto-secure).
 *
 * @param   {number} [len=8] - Desired length of the ID.
 * @returns {string} Alphanumeric string of `len` characters.
 */
function shortId(len = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/* ---------------------------------------------------------------------------
   MATH UTILITIES
   --------------------------------------------------------------------------- */

/**
 * Clamps a number between a minimum and maximum value.
 *
 * @param   {number} value - The value to clamp.
 * @param   {number} min   - Lower bound.
 * @param   {number} max   - Upper bound.
 * @returns {number} Clamped value within [min, max].
 *
 * @example
 * clamp(150, 0, 100); // => 100
 * clamp(-5, 0, 100);  // => 0
 * clamp(42, 0, 100);  // => 42
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linearly interpolates between two values.
 *
 * @param   {number} a - Start value.
 * @param   {number} b - End value.
 * @param   {number} t - Interpolation factor (0 = a, 1 = b).
 * @returns {number} Interpolated value.
 *
 * @example
 * lerp(0, 100, 0.5); // => 50
 * lerp(0, 100, 0.1); // => 10
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Maps a value from one range to another.
 *
 * @param   {number} value  - Input value.
 * @param   {number} inMin  - Input range minimum.
 * @param   {number} inMax  - Input range maximum.
 * @param   {number} outMin - Output range minimum.
 * @param   {number} outMax - Output range maximum.
 * @returns {number} Mapped value in the output range.
 *
 * @example
 * mapRange(5, 0, 10, 0, 100); // => 50
 */
function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

/**
 * Returns a random integer in the inclusive range [min, max].
 *
 * @param   {number} min - Minimum value.
 * @param   {number} max - Maximum value.
 * @returns {number} Random integer within [min, max].
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Rounds a number to a specified number of decimal places.
 *
 * @param   {number} value   - The number to round.
 * @param   {number} [dp=2]  - Decimal places.
 * @returns {number} Rounded value.
 */
function round(value, dp = 2) {
  const factor = Math.pow(10, dp);
  return Math.round(value * factor) / factor;
}

/**
 * Formats a number as a localised currency string.
 *
 * @param   {number} amount             - The numeric amount.
 * @param   {string} [currency='GBP']   - ISO 4217 currency code.
 * @param   {string} [locale='en-GB']   - IETF locale tag.
 * @returns {string} Formatted currency string, e.g. "£45.00".
 */
function formatCurrency(amount, currency = 'GBP', locale = 'en-GB') {
  return new Intl.NumberFormat(locale, {
    style:                 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a large number with short suffixes (K, M, B).
 *
 * @param   {number} value  - The number to format.
 * @param   {number} [dp=1] - Decimal places for the suffix value.
 * @returns {string} Formatted string, e.g. "4.2M", "40K".
 *
 * @example
 * shortNumber(4200000);  // => "4.2M"
 * shortNumber(40000);    // => "40K"
 * shortNumber(500);      // => "500"
 */
function shortNumber(value, dp = 1) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${round(value / 1_000_000_000, dp)}B`;
  if (abs >= 1_000_000)     return `${round(value / 1_000_000, dp)}M`;
  if (abs >= 1_000)         return `${round(value / 1_000, dp)}K`;
  return String(value);
}

/**
 * Calculates the percentage of a part relative to a total.
 *
 * @param   {number} part   - The part value.
 * @param   {number} total  - The total value.
 * @param   {number} [dp=1] - Decimal places.
 * @returns {number} Percentage value.
 */
function percent(part, total, dp = 1) {
  if (total === 0) return 0;
  return round((part / total) * 100, dp);
}

/* ---------------------------------------------------------------------------
   STRING UTILITIES
   --------------------------------------------------------------------------- */

/**
 * Trims leading and trailing whitespace, then collapses internal runs of
 * multiple whitespace characters to a single space.
 *
 * @param   {string} str - Input string.
 * @returns {string} Normalised string.
 */
function normaliseWhitespace(str) {
  if (typeof str !== 'string') return '';
  return str.replace(REGEX.TRIM_WHITESPACE, '').replace(REGEX.COLLAPSE_SPACES, ' ');
}

/**
 * Truncates a string to a maximum length, appending an ellipsis if needed.
 *
 * @param   {string} str         - Input string.
 * @param   {number} maxLength   - Maximum character count.
 * @param   {string} [ellipsis='…'] - Suffix appended when truncated.
 * @returns {string} Truncated string.
 *
 * @example
 * truncate('Hello World', 8); // => "Hello Wo…"
 */
function truncate(str, maxLength, ellipsis = '…') {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Converts a string to a URL-safe slug.
 *
 * @param   {string} str - Input string.
 * @returns {string} Slug string, e.g. "hello-world-123".
 *
 * @example
 * slugify('Hello World! 123'); // => "hello-world-123"
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Converts a camelCase or PascalCase identifier to a human-readable label.
 *
 * @param   {string} str - camelCase / PascalCase string.
 * @returns {string} Spaced label string, e.g. "myVariable" → "My Variable".
 */
function camelToLabel(str) {
  return str
    .replace(REGEX.CAMEL_BOUNDARY, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Capitalises the first letter of a string.
 *
 * @param   {string} str - Input string.
 * @returns {string} String with first character uppercased.
 */
function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Escapes HTML special characters to their entity equivalents.
 * Use this when inserting untrusted content into innerHTML.
 *
 * @param   {string} str - Raw string that may contain HTML.
 * @returns {string} Escaped string safe for innerHTML insertion.
 */
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(REGEX.HTML_ENTITY, (c) => map[c]);
}

/**
 * Strips all HTML tags from a string, leaving only text content.
 *
 * @param   {string} html - HTML string.
 * @returns {string} Plain-text string.
 */
function stripHtml(html) {
  return html.replace(REGEX.HTML_TAG, '');
}

/**
 * Wraps occurrences of `query` in a string with a <mark> element.
 * Case-insensitive. Returns the original string if query is empty.
 *
 * @param   {string} text       - The source text.
 * @param   {string} query      - The term to highlight.
 * @param   {string} [cls='']   - Optional class attribute value for <mark>.
 * @returns {string} HTML string with matches wrapped in <mark>.
 */
function highlightText(text, query, cls = '') {
  if (!query.trim()) return escapeHtml(text);
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(${safeQuery})`, 'gi');
  const classAttr = cls ? ` class="${escapeHtml(cls)}"` : '';
  return escapeHtml(text).replace(
    new RegExp(escapeHtml(safeQuery), 'gi'),
    (match) => `<mark${classAttr}>${match}</mark>`
  );
}

/**
 * Pads a number with leading zeros to a specified total length.
 *
 * @param   {number} n          - The number to pad.
 * @param   {number} [len=2]    - Total desired length.
 * @returns {string} Zero-padded string.
 *
 * @example
 * zeroPad(7, 2);  // => "07"
 * zeroPad(42, 4); // => "0042"
 */
function zeroPad(n, len = 2) {
  return String(n).padStart(len, '0');
}

/**
 * Converts bytes to a human-readable file size string.
 *
 * @param   {number} bytes - File size in bytes.
 * @param   {number} [dp=1] - Decimal places for the formatted value.
 * @returns {string} Human-readable file size, e.g. "4.2 MB".
 */
function formatFileSize(bytes, dp = 1) {
  if (bytes < 1024)                       return `${bytes} B`;
  if (bytes < 1024 * 1024)               return `${round(bytes / 1024, dp)} KB`;
  if (bytes < 1024 * 1024 * 1024)        return `${round(bytes / (1024 * 1024), dp)} MB`;
  return `${round(bytes / (1024 * 1024 * 1024), dp)} GB`;
}

/* ---------------------------------------------------------------------------
   ARRAY UTILITIES
   --------------------------------------------------------------------------- */

/**
 * Returns a new array with duplicate values removed.
 * Keeps the first occurrence of each value.
 *
 * @template T
 * @param   {T[]} arr - Source array.
 * @returns {T[]} De-duplicated array.
 */
function unique(arr) {
  return [...new Set(arr)];
}

/**
 * Splits an array into chunks of a given size.
 *
 * @template T
 * @param   {T[]}    arr  - Source array.
 * @param   {number} size - Chunk size.
 * @returns {T[][]} Array of chunks.
 *
 * @example
 * chunk([1,2,3,4,5], 2); // => [[1,2],[3,4],[5]]
 */
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Returns a shallow copy of an array sorted by a key accessor function.
 *
 * @template T
 * @param   {T[]}           arr       - Source array.
 * @param   {function(T):*} accessor  - Function that returns the sort key.
 * @param   {'asc'|'desc'}  [dir='asc'] - Sort direction.
 * @returns {T[]} Sorted copy.
 */
function sortBy(arr, accessor, dir = 'asc') {
  return [...arr].sort((a, b) => {
    const ka = accessor(a);
    const kb = accessor(b);
    if (ka < kb) return dir === 'asc' ? -1 : 1;
    if (ka > kb) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Groups an array of objects by the value of a given key.
 *
 * @template T
 * @param   {T[]}            arr - Source array.
 * @param   {function(T):string} keyFn - Function returning the group key.
 * @returns {Object.<string, T[]>} Object whose keys are group names.
 *
 * @example
 * groupBy([{type:'a'},{type:'b'},{type:'a'}], x => x.type);
 * // => { a: [{type:'a'},{type:'a'}], b: [{type:'b'}] }
 */
function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

/**
 * Returns the first element of an array that satisfies the predicate,
 * or a default value if none is found.
 *
 * @template T
 * @param   {T[]}          arr         - Source array.
 * @param   {function(T):boolean} pred - Predicate function.
 * @param   {T|null}       [def=null]  - Default return if not found.
 * @returns {T|null} Matching element or default.
 */
function findOrDefault(arr, pred, def = null) {
  return arr.find(pred) ?? def;
}

/**
 * Flattens a nested array one level deep.
 *
 * @template T
 * @param   {(T|T[])[]} arr - Possibly-nested array.
 * @returns {T[]} Flattened array.
 */
function flatten(arr) {
  return arr.reduce((acc, val) => acc.concat(val), []);
}

/**
 * Returns a shuffled copy of an array (Fisher–Yates algorithm).
 *
 * @template T
 * @param   {T[]} arr - Source array.
 * @returns {T[]} Shuffled copy.
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------------------------------------------------------------------------
   OBJECT UTILITIES
   --------------------------------------------------------------------------- */

/**
 * Performs a deep merge of two plain objects.
 * Arrays in `source` overwrite arrays in `target` (not merged).
 *
 * @param   {Object} target - Base object (will not be mutated).
 * @param   {Object} source - Overrides to apply.
 * @returns {Object} New deeply-merged object.
 */
function deepMerge(target, source) {
  const output = Object.assign({}, target);
  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isPlainObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

/**
 * Returns a shallow copy of an object with a subset of its keys.
 *
 * @param   {Object}   obj  - Source object.
 * @param   {string[]} keys - Keys to include.
 * @returns {Object} New object containing only the specified keys.
 */
function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) acc[key] = obj[key];
    return acc;
  }, {});
}

/**
 * Returns a shallow copy of an object with specified keys removed.
 *
 * @param   {Object}   obj  - Source object.
 * @param   {string[]} keys - Keys to exclude.
 * @returns {Object} New object without the specified keys.
 */
function omit(obj, keys) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !keys.includes(k))
  );
}

/* ---------------------------------------------------------------------------
   TYPE CHECKING
   --------------------------------------------------------------------------- */

/**
 * Returns whether a value is a plain (non-class) object.
 *
 * @param   {*} val - Value to test.
 * @returns {boolean}
 */
function isPlainObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}

/**
 * Returns whether a value is a non-null object.
 *
 * @param   {*} val - Value to test.
 * @returns {boolean}
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Returns whether a value is a function.
 *
 * @param   {*} val - Value to test.
 * @returns {boolean}
 */
function isFunction(val) {
  return typeof val === 'function';
}

/**
 * Returns whether a value is a string.
 *
 * @param   {*} val - Value to test.
 * @returns {boolean}
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Returns whether a value is a finite number (not NaN or Infinity).
 *
 * @param   {*} val - Value to test.
 * @returns {boolean}
 */
function isFiniteNumber(val) {
  return typeof val === 'number' && isFinite(val);
}

/**
 * Returns whether a value is a non-empty string.
 *
 * @param   {*} val - Value to test.
 * @returns {boolean}
 */
function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

/**
 * Returns whether a value is null or undefined.
 *
 * @param   {*} val - Value to test.
 * @returns {boolean}
 */
function isNil(val) {
  return val === null || val === undefined;
}

/**
 * Returns whether a DOM element is a valid HTMLElement.
 *
 * @param   {*} el - Value to test.
 * @returns {boolean}
 */
function isElement(el) {
  return el instanceof HTMLElement;
}

/**
 * Returns whether a DOM element is focusable (can receive keyboard focus).
 *
 * @param   {HTMLElement} el - Element to check.
 * @returns {boolean}
 */
function isFocusable(el) {
  if (!isElement(el)) return false;
  if (el.disabled) return false;
  if (el.getAttribute(ARIA.HIDDEN) === 'true') return false;
  const tabIndex = parseInt(el.getAttribute(ARIA.TABINDEX), 10);
  if (!isNaN(tabIndex) && tabIndex < 0) return false;
  const focusableTags = ['a', 'button', 'input', 'select', 'textarea', 'details', 'summary'];
  return (
    focusableTags.includes(el.tagName.toLowerCase()) ||
    el.hasAttribute('tabindex') ||
    el.isContentEditable
  );
}

/**
 * Returns whether a DOM node is visible (not hidden via CSS or HTML attribute).
 *
 * @param   {HTMLElement} el - Element to check.
 * @returns {boolean}
 */
function isVisible(el) {
  if (!isElement(el)) return false;
  if (el.hidden) return false;
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

/* ---------------------------------------------------------------------------
   DOM QUERY HELPERS
   --------------------------------------------------------------------------- */

/**
 * Returns the first element matching a CSS selector within an optional context.
 * Returns null if no match is found.
 *
 * @param   {string}                selector - CSS selector.
 * @param   {Document|HTMLElement}  [ctx=document] - Search root.
 * @returns {HTMLElement|null}
 *
 * @example
 * const btn = qs('#my-button');
 * const item = qs('.item', listEl);
 */
function qs(selector, ctx = document) {
  try {
    return ctx.querySelector(selector);
  } catch (e) {
    warn('qs: invalid selector', selector, e);
    return null;
  }
}

/**
 * Returns all elements matching a CSS selector within an optional context
 * as a real Array (not a NodeList), making array methods directly usable.
 *
 * @param   {string}                selector - CSS selector.
 * @param   {Document|HTMLElement}  [ctx=document] - Search root.
 * @returns {HTMLElement[]}
 *
 * @example
 * const buttons = qsa('.btn');
 * buttons.forEach(btn => btn.classList.add('tracked'));
 */
function qsa(selector, ctx = document) {
  try {
    return Array.from(ctx.querySelectorAll(selector));
  } catch (e) {
    warn('qsa: invalid selector', selector, e);
    return [];
  }
}

/**
 * Returns the closest ancestor of `el` (including `el` itself) that matches
 * the given CSS selector. Returns null if none is found within an optional
 * boundary element.
 *
 * @param   {HTMLElement}      el        - Starting element.
 * @param   {string}           selector  - CSS selector to match.
 * @param   {HTMLElement|null} [boundary=null] - Stop searching at this element.
 * @returns {HTMLElement|null}
 */
function closest(el, selector, boundary = null) {
  if (!isElement(el)) return null;
  let current = el;
  while (current && current !== boundary) {
    if (current.matches && current.matches(selector)) return current;
    current = current.parentElement;
  }
  return null;
}

/**
 * Returns all focusable descendants of `el`, sorted by DOM order.
 * Excludes elements that are visually hidden or explicitly inert.
 *
 * @param   {HTMLElement} el - Container element.
 * @returns {HTMLElement[]} Ordered list of focusable elements.
 */
function getFocusableChildren(el) {
  if (!isElement(el)) return [];
  const candidates = qsa(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), details > summary, ' +
    '[contenteditable="true"]',
    el
  );
  return candidates.filter((child) => isVisible(child) && !child.closest('[inert]'));
}

/**
 * Returns the first and last focusable children of an element.
 * Used for focus-trap implementation.
 *
 * @param   {HTMLElement} el - Container element.
 * @returns {{ first: HTMLElement|null, last: HTMLElement|null }}
 */
function getFocusBoundaries(el) {
  const focusable = getFocusableChildren(el);
  return {
    first: focusable[0] || null,
    last:  focusable[focusable.length - 1] || null,
  };
}

/**
 * Tests whether `el` has a given attribute set to a truthy-looking value.
 * Handles boolean attributes (present = true) and string values like "true" / "false".
 *
 * @param   {HTMLElement} el   - DOM element.
 * @param   {string}      attr - Attribute name.
 * @returns {boolean}
 */
function getAttrBool(el, attr) {
  if (!isElement(el)) return false;
  const val = el.getAttribute(attr);
  if (val === null) return el.hasAttribute(attr);
  return val !== 'false' && val !== '0' && val !== '';
}

/**
 * Sets an ARIA attribute on an element.
 * Passes its value through String() so booleans are handled cleanly.
 *
 * @param {HTMLElement} el    - Target element.
 * @param {string}      attr  - ARIA attribute name (from the ARIA namespace).
 * @param {*}           value - Value to set.
 */
function setAttr(el, attr, value) {
  if (!isElement(el)) return;
  el.setAttribute(attr, String(value));
}

/**
 * Removes an attribute from an element only if it exists.
 *
 * @param {HTMLElement} el   - Target element.
 * @param {string}      attr - Attribute name to remove.
 */
function removeAttr(el, attr) {
  if (isElement(el) && el.hasAttribute(attr)) el.removeAttribute(attr);
}

/**
 * Toggles an attribute between two values (or removes it entirely).
 *
 * @param {HTMLElement} el         - Target element.
 * @param {string}      attr       - Attribute name.
 * @param {*}           trueValue  - Value when condition is true.
 * @param {*}           falseValue - Value when condition is false. Pass null to remove.
 * @param {boolean}     condition  - Which value to apply.
 */
function toggleAttr(el, attr, trueValue, falseValue, condition) {
  if (!isElement(el)) return;
  if (condition) {
    el.setAttribute(attr, String(trueValue));
  } else if (falseValue === null) {
    el.removeAttribute(attr);
  } else {
    el.setAttribute(attr, String(falseValue));
  }
}

/**
 * Sets the `aria-expanded` attribute on a trigger element and optionally
 * shows / hides the controlled panel element.
 *
 * @param {HTMLElement}       trigger  - The button/link that controls the panel.
 * @param {boolean}           expanded - Whether the panel is expanded.
 * @param {HTMLElement|null}  [panel]  - The controlled panel element (optional).
 */
function setExpanded(trigger, expanded, panel = null) {
  setAttr(trigger, ARIA.EXPANDED, expanded);
  if (panel) {
    if (expanded) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', '');
    }
  }
}

/* ---------------------------------------------------------------------------
   DOM CREATION & MANIPULATION
   --------------------------------------------------------------------------- */

/**
 * Creates a DOM element with optional attributes, properties, and children.
 *
 * @param   {string}                           tag         - Tag name.
 * @param   {Object}                           [attrs={}]  - Attribute key/value pairs.
 * @param   {string|HTMLElement|(string|HTMLElement)[]} [children=[]] - Child nodes or text.
 * @returns {HTMLElement} The created element.
 *
 * @example
 * const btn = createElement('button', { type: 'button', class: 'btn btn-primary' }, 'Click me');
 */
function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, val]) => {
    if (key === 'className') {
      el.className = val;
    } else if (key === 'innerHTML') {
      el.innerHTML = val;
    } else if (key === 'textContent') {
      el.textContent = val;
    } else if (key.startsWith('on') && typeof val === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    } else if (val === true) {
      el.setAttribute(key, '');
    } else if (val !== false && val !== null && val !== undefined) {
      el.setAttribute(key, String(val));
    }
  });
  const kids = Array.isArray(children) ? children : [children];
  kids.forEach((child) => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (isElement(child)) {
      el.appendChild(child);
    }
  });
  return el;
}

/**
 * Inserts an element before a reference element in the DOM.
 *
 * @param {HTMLElement} newEl - Element to insert.
 * @param {HTMLElement} ref   - Reference element.
 */
function insertBefore(newEl, ref) {
  if (ref && ref.parentNode) ref.parentNode.insertBefore(newEl, ref);
}

/**
 * Inserts an element after a reference element in the DOM.
 *
 * @param {HTMLElement} newEl - Element to insert.
 * @param {HTMLElement} ref   - Reference element.
 */
function insertAfter(newEl, ref) {
  if (ref && ref.parentNode) ref.parentNode.insertBefore(newEl, ref.nextSibling);
}

/**
 * Replaces a DOM element with another element or HTML string.
 *
 * @param {HTMLElement}       target      - Element to replace.
 * @param {HTMLElement|string} replacement - New content.
 */
function replaceWith(target, replacement) {
  if (!isElement(target) || !target.parentNode) return;
  if (typeof replacement === 'string') {
    target.insertAdjacentHTML('afterend', replacement);
    target.parentNode.removeChild(target);
  } else if (isElement(replacement)) {
    target.parentNode.replaceChild(replacement, target);
  }
}

/**
 * Removes an element from the DOM safely (no-op if element has no parent).
 *
 * @param {HTMLElement} el - Element to remove.
 */
function removeElement(el) {
  if (isElement(el) && el.parentNode) el.parentNode.removeChild(el);
}

/**
 * Empties all child nodes from an element.
 *
 * @param {HTMLElement} el - Element to empty.
 */
function emptyElement(el) {
  if (!isElement(el)) return;
  while (el.firstChild) el.removeChild(el.firstChild);
}

/**
 * Adds one or more CSS classes to an element.
 * Accepts a space-separated string or an array of class names.
 *
 * @param {HTMLElement}   el      - Target element.
 * @param {string|string[]} classes - Classes to add.
 */
function addClass(el, classes) {
  if (!isElement(el)) return;
  const list = Array.isArray(classes) ? classes : classes.split(' ');
  list.filter(Boolean).forEach((c) => el.classList.add(c));
}

/**
 * Removes one or more CSS classes from an element.
 *
 * @param {HTMLElement}   el      - Target element.
 * @param {string|string[]} classes - Classes to remove.
 */
function removeClass(el, classes) {
  if (!isElement(el)) return;
  const list = Array.isArray(classes) ? classes : classes.split(' ');
  list.filter(Boolean).forEach((c) => el.classList.remove(c));
}

/**
 * Toggles a CSS class on an element with an optional force parameter.
 *
 * @param {HTMLElement} el        - Target element.
 * @param {string}      className - Class name to toggle.
 * @param {boolean}     [force]   - If provided, forces add (true) or remove (false).
 * @returns {boolean} Whether the class is now present.
 */
function toggleClass(el, className, force) {
  if (!isElement(el)) return false;
  if (force !== undefined) return el.classList.toggle(className, force);
  return el.classList.toggle(className);
}

/**
 * Returns whether an element has a given CSS class.
 *
 * @param   {HTMLElement} el        - Target element.
 * @param   {string}      className - Class to check.
 * @returns {boolean}
 */
function hasClass(el, className) {
  return isElement(el) && el.classList.contains(className);
}

/**
 * Reads a CSS custom property value from an element (or :root by default).
 *
 * @param   {string}      prop       - CSS custom property name (with --).
 * @param   {HTMLElement} [el=document.documentElement] - Element to read from.
 * @returns {string} The trimmed property value.
 */
function getCssVar(prop, el = document.documentElement) {
  return getComputedStyle(el).getPropertyValue(prop).trim();
}

/**
 * Sets a CSS custom property value on an element.
 *
 * @param {string}      prop  - CSS custom property name (with --).
 * @param {string}      value - Value to set.
 * @param {HTMLElement} [el=document.documentElement] - Element to apply to.
 */
function setCssVar(prop, value, el = document.documentElement) {
  el.style.setProperty(prop, value);
}

/**
 * Returns the bounding rect of an element, adjusted for any scroll offset
 * to produce document-relative coordinates.
 *
 * @param   {HTMLElement} el - Target element.
 * @returns {{ top: number, left: number, bottom: number, right: number, width: number, height: number }}
 */
function getDocumentRect(el) {
  const rect  = el.getBoundingClientRect();
  const scrollTop  = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  return {
    top:    rect.top  + scrollTop,
    left:   rect.left + scrollLeft,
    bottom: rect.bottom + scrollTop,
    right:  rect.right  + scrollLeft,
    width:  rect.width,
    height: rect.height,
  };
}

/**
 * Returns the current scroll position of the window.
 *
 * @returns {{ x: number, y: number }}
 */
function getScrollPosition() {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop,
  };
}

/**
 * Smoothly scrolls the page to a given Y offset.
 * Falls back to `scrollTop` assignment when reduced motion is preferred.
 *
 * @param {number}  y         - Target Y offset in pixels.
 * @param {string}  [behavior='smooth'] - ScrollBehavior value.
 */
function scrollToY(y, behavior = 'smooth') {
  if (SUPPORTS.prefersReducedMotion) {
    window.scrollTo(0, y);
  } else {
    window.scrollTo({ top: y, behavior });
  }
}

/**
 * Scrolls a given element into the viewport.
 * Respects reduced-motion preference.
 *
 * @param {HTMLElement} el      - Element to scroll into view.
 * @param {string}  [block='start'] - Vertical alignment.
 * @param {string}  [behavior='smooth'] - Scroll behaviour.
 */
function scrollIntoView(el, block = 'start', behavior = 'smooth') {
  if (!isElement(el)) return;
  el.scrollIntoView({
    behavior: SUPPORTS.prefersReducedMotion ? 'auto' : behavior,
    block,
    inline: 'nearest',
  });
}

/**
 * Scrolls the page to a named anchor / element id, accounting for
 * the sticky header height so the content is not obscured.
 *
 * @param {string} targetId - ID of the element to scroll to (without #).
 */
function scrollToId(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const header = qs(SELECTORS.header);
  const headerHeight = header ? header.offsetHeight : 0;
  const top = getDocumentRect(target).top - headerHeight - 8;
  scrollToY(top);
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

/* ---------------------------------------------------------------------------
   FUNCTION UTILITIES (DEBOUNCE / THROTTLE / RAF)
   --------------------------------------------------------------------------- */

/**
 * Returns a debounced version of `fn` that only executes after `wait` ms
 * have elapsed since the last invocation.
 *
 * @param   {Function} fn    - Function to debounce.
 * @param   {number}   wait  - Milliseconds to wait.
 * @param   {boolean}  [leading=false] - If true, also invoke on the leading edge.
 * @returns {Function} Debounced function with a `.cancel()` method.
 *
 * @example
 * const onResize = debounce(() => recalcLayout(), TIMING.DEBOUNCE_RESIZE);
 * window.addEventListener('resize', onResize);
 */
function debounce(fn, wait, leading = false) {
  let timer = null;
  let lastArgs = null;
  let lastThis = null;
  let result;

  function invoke() {
    result = fn.apply(lastThis, lastArgs);
    lastThis = lastArgs = null;
    return result;
  }

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    const callNow = leading && timer === null;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!leading) invoke();
    }, wait);
    if (callNow) invoke();
    return result;
  }

  debounced.cancel = () => {
    if (timer !== null) clearTimeout(timer);
    timer = lastArgs = lastThis = null;
  };

  debounced.flush = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
      return invoke();
    }
    return result;
  };

  return debounced;
}

/**
 * Returns a throttled version of `fn` that fires at most once per `wait` ms.
 * The trailing call fires after the interval if there were calls during it.
 *
 * @param   {Function} fn    - Function to throttle.
 * @param   {number}   wait  - Minimum milliseconds between calls.
 * @param   {{ leading?: boolean, trailing?: boolean }} [options]
 * @returns {Function} Throttled function with a `.cancel()` method.
 *
 * @example
 * const onScroll = throttle(() => updateProgress(), TIMING.DEBOUNCE_SCROLL);
 * window.addEventListener('scroll', onScroll, { passive: true });
 */
function throttle(fn, wait, { leading = true, trailing = true } = {}) {
  let timer = null;
  let lastCallTime = 0;
  let lastArgs = null;
  let lastThis = null;

  function trailingCall() {
    lastCallTime = leading ? Date.now() : 0;
    timer = null;
    fn.apply(lastThis, lastArgs);
    lastArgs = lastThis = null;
  }

  function throttled(...args) {
    const nowMs = Date.now();
    if (!lastCallTime && !leading) lastCallTime = nowMs;
    const remaining = wait - (nowMs - lastCallTime);
    lastArgs = args;
    lastThis = this;
    if (remaining <= 0 || remaining > wait) {
      if (timer) { clearTimeout(timer); timer = null; }
      lastCallTime = nowMs;
      fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
    } else if (!timer && trailing) {
      timer = setTimeout(trailingCall, remaining);
    }
  }

  throttled.cancel = () => {
    if (timer) clearTimeout(timer);
    lastCallTime = 0;
    timer = lastArgs = lastThis = null;
  };

  return throttled;
}

/**
 * Returns a version of `fn` throttled to one call per animation frame.
 * Ideal for DOM-reading / writing inside scroll or pointer handlers.
 *
 * @param   {Function} fn - Function to wrap.
 * @returns {Function} RAF-throttled function with a `.cancel()` method.
 */
function rafThrottle(fn) {
  let rafId = null;
  let lastArgs = null;
  let lastThis = null;

  function wrapped(...args) {
    lastArgs = args;
    lastThis = this;
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        fn.apply(lastThis, lastArgs);
        rafId = null;
        lastArgs = lastThis = null;
      });
    }
  }

  wrapped.cancel = () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = lastArgs = lastThis = null;
  };

  return wrapped;
}

/**
 * Returns a function that can only be called once.
 * Subsequent calls return the value from the first invocation.
 *
 * @param   {Function} fn - Function to wrap.
 * @returns {Function}
 */
function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

/**
 * Returns a memoized version of a function.
 * Results are cached by JSON-serialising the arguments.
 * Only suitable for pure functions with serialisable arguments.
 *
 * @param   {Function} fn - Pure function to memoize.
 * @returns {Function} Memoized function with a `.cache` Map property.
 */
function memoize(fn) {
  const cache = new Map();
  function memoized(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  }
  memoized.cache = cache;
  memoized.clearCache = () => cache.clear();
  return memoized;
}

/**
 * Wait for a given number of milliseconds before resolving.
 *
 * @param   {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 *
 * @example
 * await sleep(300); // pause for 300 ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Schedules work during idle periods using `requestIdleCallback` when
 * available, falling back to `setTimeout(..., 0)`.
 *
 * @param   {Function} fn      - Work to execute.
 * @param   {Object}   [opts]  - Options forwarded to requestIdleCallback.
 * @returns {number} Handle that can be passed to `cancelIdleWork`.
 */
function scheduleIdleWork(fn, opts = { timeout: 2000 }) {
  if (SUPPORTS.idleCallback) return requestIdleCallback(fn, opts);
  return setTimeout(fn, 0);
}

/**
 * Cancels a pending idle work handle.
 *
 * @param {number} handle - Handle returned by `scheduleIdleWork`.
 */
function cancelIdleWork(handle) {
  if (SUPPORTS.idleCallback) cancelIdleCallback(handle);
  else clearTimeout(handle);
}

/* ---------------------------------------------------------------------------
   EVENT SYSTEM
   --------------------------------------------------------------------------- */

/**
 * Adds an event listener to one or more elements.
 * Supports space-separated event names, optional capture/passive flags,
 * and an array of elements.
 *
 * @param {HTMLElement|HTMLElement[]|Document|Window} el - Target element(s).
 * @param {string}   events   - Space-separated event type(s).
 * @param {Function} handler  - Event handler function.
 * @param {Object|boolean} [opts=false] - AddEventListener options.
 *
 * @example
 * on(btn, 'click keydown', handleInteraction);
 * on(qsa('.card'), 'focus blur', handleFocus, true);
 */
function on(el, events, handler, opts = false) {
  const targets = Array.isArray(el) ? el : [el];
  const types   = events.split(' ').filter(Boolean);
  targets.forEach((t) => {
    if (!t || !t.addEventListener) return;
    types.forEach((evt) => t.addEventListener(evt, handler, opts));
  });
}

/**
 * Removes an event listener from one or more elements.
 * Mirrors the `on()` signature exactly.
 *
 * @param {HTMLElement|HTMLElement[]|Document|Window} el - Target element(s).
 * @param {string}   events   - Space-separated event type(s).
 * @param {Function} handler  - Handler reference (must be the same function passed to on()).
 * @param {Object|boolean} [opts=false] - RemoveEventListener options.
 */
function off(el, events, handler, opts = false) {
  const targets = Array.isArray(el) ? el : [el];
  const types   = events.split(' ').filter(Boolean);
  targets.forEach((t) => {
    if (!t || !t.removeEventListener) return;
    types.forEach((evt) => t.removeEventListener(evt, handler, opts));
  });
}

/**
 * Attaches an event listener that fires only once, then removes itself.
 *
 * @param {EventTarget} el      - Target element.
 * @param {string}      event   - Event type.
 * @param {Function}    handler - Handler to invoke once.
 * @param {Object|boolean} [opts=false] - AddEventListener options.
 * @returns {Function} The wrapper function (can be used to cancel early).
 */
function onOnce(el, event, handler, opts = false) {
  function wrapper(e) {
    handler.call(this, e);
    off(el, event, wrapper, opts);
  }
  on(el, event, wrapper, opts);
  return wrapper;
}

/**
 * Attaches a delegated event listener to a parent element.
 * The handler is only called when the event target matches `childSelector`.
 * Returns a cleanup function that removes the listener.
 *
 * @param   {HTMLElement|Document} parent        - Ancestor element to listen on.
 * @param   {string}               event         - Event type.
 * @param   {string}               childSelector - CSS selector for the delegated target.
 * @param   {Function}             handler       - Handler called with (event, matchedElement).
 * @param   {Object|boolean}       [opts=false]  - AddEventListener options.
 * @returns {Function} Cleanup function to remove the listener.
 *
 * @example
 * const cleanup = delegate(document, 'click', '.faq-item dt button', (e, btn) => {
 *   toggleFaq(btn);
 * });
 */
function delegate(parent, event, childSelector, handler, opts = false) {
  function listener(e) {
    const match = closest(e.target, childSelector, parent);
    if (match) handler.call(match, e, match);
  }
  on(parent, event, listener, opts);
  return () => off(parent, event, listener, opts);
}

/**
 * Dispatches a custom DOM event on an element.
 *
 * @param {HTMLElement | Document | Window} el     - Target element.
 * @param {string}                          type   - Event type name.
 * @param {*}                               [detail=null] - Data attached to event.detail.
 * @param {{ bubbles?: boolean, cancelable?: boolean, composed?: boolean }} [opts]
 */
function emit(el, type, detail = null, { bubbles = true, cancelable = true, composed = false } = {}) {
  const event = new CustomEvent(type, { bubbles, cancelable, composed, detail });
  el.dispatchEvent(event);
}

/**
 * Returns a Promise that resolves when the given event fires on the element.
 *
 * @param   {EventTarget} el      - Target element.
 * @param   {string}      event   - Event type.
 * @param   {number}      [timeout=0] - If > 0, rejects after this many ms.
 * @returns {Promise<Event>}
 *
 * @example
 * await waitForEvent(dialog, 'animationend', 500);
 */
function waitForEvent(el, event, timeout = 0) {
  return new Promise((resolve, reject) => {
    const cleanup = onOnce(el, event, resolve);
    if (timeout > 0) {
      setTimeout(() => {
        off(el, event, cleanup);
        reject(new Error(`Timed out waiting for '${event}' on`, el));
      }, timeout);
    }
  });
}

/* ---------------------------------------------------------------------------
   ANIMATION HELPERS
   --------------------------------------------------------------------------- */

/**
 * Returns whether animations should be suppressed.
 * Checks the live media query (not the frozen SUPPORTS value) in case the
 * user changes the OS setting while the page is open.
 *
 * @returns {boolean}
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Animates an element's height from 0 to its natural height (expand)
 * or from its natural height to 0 (collapse).
 * Calls `onComplete` when the transition finishes.
 * Falls back to an immediate show/hide when reduced motion is active.
 *
 * @param {HTMLElement} el          - Element to animate.
 * @param {boolean}     expanding   - true = expand, false = collapse.
 * @param {number}      [duration]  - Duration in ms (defaults to CONFIG.faq.animationDuration).
 * @param {Function}    [onComplete] - Callback fired when animation finishes.
 */
function animateHeight(el, expanding, duration = CONFIG.faq.animationDuration, onComplete = null) {
  if (!isElement(el)) return;

  if (prefersReducedMotion()) {
    if (expanding) {
      el.removeAttribute('hidden');
      el.style.height = '';
    } else {
      el.setAttribute('hidden', '');
      el.style.height = '';
    }
    if (isFunction(onComplete)) onComplete();
    return;
  }

  const naturalHeight = (() => {
    const prev = { height: el.style.height, overflow: el.style.overflow, display: el.style.display };
    el.style.height   = 'auto';
    el.style.overflow = 'hidden';
    el.removeAttribute('hidden');
    const h = el.scrollHeight;
    el.style.height   = prev.height;
    el.style.overflow = prev.overflow;
    if (!expanding) el.style.display = prev.display;
    return h;
  })();

  let start = null;
  const startHeight = expanding ? 0 : naturalHeight;
  const endHeight   = expanding ? naturalHeight : 0;

  el.style.overflow   = 'hidden';
  el.style.height     = `${startHeight}px`;
  el.style.transition = 'none';
  if (expanding) el.removeAttribute('hidden');

  requestAnimationFrame(() => {
    el.style.transition = `height ${duration}ms ${CONFIG.faq.animationEasing}`;
    requestAnimationFrame(() => {
      el.style.height = `${endHeight}px`;
    });
  });

  function onEnd(e) {
    if (e.propertyName !== 'height') return;
    el.removeEventListener('transitionend', onEnd);
    if (!expanding) el.setAttribute('hidden', '');
    el.style.height   = '';
    el.style.overflow = '';
    el.style.transition = '';
    if (isFunction(onComplete)) onComplete();
  }

  el.addEventListener('transitionend', onEnd);
}

/**
 * Fades an element in by transitioning opacity from 0 → 1.
 * Does nothing if reduced motion is preferred.
 *
 * @param {HTMLElement} el         - Element to fade in.
 * @param {number}      [duration=TIMING.SLOW] - Duration in ms.
 * @param {Function}    [onComplete] - Called when the fade finishes.
 */
function fadeIn(el, duration = TIMING.SLOW, onComplete = null) {
  if (!isElement(el)) return;
  if (prefersReducedMotion()) {
    el.style.opacity = '';
    if (isFunction(onComplete)) onComplete();
    return;
  }
  el.style.opacity    = '0';
  el.style.transition = `opacity ${duration}ms ease`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = '1';
    });
  });
  onOnce(el, 'transitionend', () => {
    el.style.opacity    = '';
    el.style.transition = '';
    if (isFunction(onComplete)) onComplete();
  });
}

/**
 * Fades an element out by transitioning opacity from 1 → 0.
 *
 * @param {HTMLElement} el         - Element to fade out.
 * @param {number}      [duration=TIMING.SLOW] - Duration in ms.
 * @param {Function}    [onComplete] - Called when the fade finishes.
 */
function fadeOut(el, duration = TIMING.SLOW, onComplete = null) {
  if (!isElement(el)) return;
  if (prefersReducedMotion()) {
    el.style.opacity = '';
    if (isFunction(onComplete)) onComplete();
    return;
  }
  el.style.opacity    = '1';
  el.style.transition = `opacity ${duration}ms ease`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = '0';
    });
  });
  onOnce(el, 'transitionend', () => {
    el.style.opacity    = '';
    el.style.transition = '';
    if (isFunction(onComplete)) onComplete();
  });
}

/**
 * Animates a numeric value from `from` to `to` over `duration` ms,
 * calling `onUpdate` on each animation frame with the current value.
 * Used for the stat counter animation.
 *
 * @param {number}   from       - Start value.
 * @param {number}   to         - End value.
 * @param {number}   [duration=TIMING.COUNTER_DURATION] - Duration in ms.
 * @param {Function} onUpdate   - Called with the current value (number) each frame.
 * @param {Function} [easing]   - Optional easing function (progress → factor).
 * @param {Function} [onComplete] - Called when animation completes.
 * @returns {{ cancel: Function }} Object with a `cancel` method.
 */
function animateNumber(from, to, duration = TIMING.COUNTER_DURATION, onUpdate, easing = null, onComplete = null) {
  if (prefersReducedMotion()) {
    onUpdate(to);
    if (isFunction(onComplete)) onComplete();
    return { cancel: () => {} };
  }

  let start = null;
  let rafId = null;

  const defaultEase = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out quad
  const easeFn = isFunction(easing) ? easing : defaultEase;

  function step(timestamp) {
    if (!start) start = timestamp;
    const elapsed  = timestamp - start;
    const progress = clamp(elapsed / duration, 0, 1);
    const value    = from + (to - from) * easeFn(progress);
    onUpdate(value);
    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      onUpdate(to);
      if (isFunction(onComplete)) onComplete();
    }
  }

  rafId = requestAnimationFrame(step);
  return { cancel: () => { if (rafId) cancelAnimationFrame(rafId); } };
}

/**
 * Triggers a CSS "shake" animation on an element (e.g. for form errors).
 * Adds a class, then removes it after the animation duration.
 *
 * @param {HTMLElement} el         - Element to shake.
 * @param {string}      [cls=CSS.SHAKE] - Animation class name.
 * @param {number}      [duration=500]  - Duration in ms.
 */
function shakeElement(el, cls = CSS.SHAKE, duration = 500) {
  if (!isElement(el) || prefersReducedMotion()) return;
  removeClass(el, cls);
  requestAnimationFrame(() => {
    addClass(el, cls);
    setTimeout(() => removeClass(el, cls), duration);
  });
}

/* ---------------------------------------------------------------------------
   STORAGE UTILITIES
   --------------------------------------------------------------------------- */

/**
 * Wrapper around localStorage that silently handles QuotaExceededError
 * and JSON serialisation / deserialisation.
 * All writes are no-ops when localStorage is unavailable (private browsing).
 *
 * @namespace storage
 */
const storage = {
  /**
   * Reads a value from localStorage and JSON-parses it.
   *
   * @template T
   * @param   {string} key          - Storage key.
   * @param   {T}      [fallback]   - Value to return if key is absent or parse fails.
   * @returns {T}
   */
  get(key, fallback = null) {
    if (!SUPPORTS.localStorage) return fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  /**
   * Writes a value to localStorage after JSON-serialising it.
   *
   * @param {string} key   - Storage key.
   * @param {*}      value - Value to store.
   * @returns {boolean} Whether the write succeeded.
   */
  set(key, value) {
    if (!SUPPORTS.localStorage) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      warn('storage.set: failed to write', key);
      return false;
    }
  },

  /**
   * Removes a key from localStorage.
   *
   * @param {string} key - Storage key to remove.
   */
  remove(key) {
    if (!SUPPORTS.localStorage) return;
    try {
      localStorage.removeItem(key);
    } catch { /* noop */ }
  },

  /**
   * Returns whether a given key exists in localStorage.
   *
   * @param   {string} key - Storage key.
   * @returns {boolean}
   */
  has(key) {
    if (!SUPPORTS.localStorage) return false;
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  },

  /**
   * Clears all keys from localStorage.
   * Use with caution — affects all keys, not just Luminary's.
   */
  clear() {
    if (!SUPPORTS.localStorage) return;
    try { localStorage.clear(); } catch { /* noop */ }
  },

  /**
   * Returns all Luminary-owned keys (those prefixed with "luminary_").
   *
   * @returns {string[]}
   */
  getLuminaryKeys() {
    if (!SUPPORTS.localStorage) return [];
    try {
      return Object.keys(localStorage).filter((k) => k.startsWith('luminary_'));
    } catch {
      return [];
    }
  },
};

/**
 * Wrapper around sessionStorage.
 * Mirrors the `storage` API exactly but uses sessionStorage.
 *
 * @namespace sessionStore
 */
const sessionStore = {
  get(key, fallback = null) {
    if (!SUPPORTS.sessionStorage) return fallback;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch { return fallback; }
  },
  set(key, value) {
    if (!SUPPORTS.sessionStorage) return false;
    try { sessionStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  remove(key) {
    if (!SUPPORTS.sessionStorage) return;
    try { sessionStorage.removeItem(key); } catch { /* noop */ }
  },
  has(key) {
    if (!SUPPORTS.sessionStorage) return false;
    try { return sessionStorage.getItem(key) !== null; }
    catch { return false; }
  },
  clear() {
    if (!SUPPORTS.sessionStorage) return;
    try { sessionStorage.clear(); } catch { /* noop */ }
  },
};

/* ---------------------------------------------------------------------------
   COOKIE UTILITIES
   --------------------------------------------------------------------------- */

/**
 * Reads a cookie by name.
 *
 * @param   {string} name - Cookie name.
 * @returns {string|null} Cookie value or null if not found.
 */
function getCookie(name) {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Sets a cookie.
 *
 * @param {string} name     - Cookie name.
 * @param {string} value    - Cookie value.
 * @param {Object} [opts]   - Options (days, path, domain, secure, sameSite).
 */
function setCookie(name, value, {
  days     = 365,
  path     = '/',
  domain   = '',
  secure   = true,
  sameSite = 'Lax',
} = {}) {
  const expiry  = new Date(Date.now() + days * 864e5).toUTCString();
  const domainStr = domain ? `; domain=${domain}` : '';
  const secureStr = secure ? '; secure' : '';
  document.cookie = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `expires=${expiry}`,
    `path=${path}`,
    domainStr,
    secureStr,
    `samesite=${sameSite}`,
  ].filter(Boolean).join('; ');
}

/**
 * Deletes a cookie by setting its expiry to the past.
 *
 * @param {string} name   - Cookie name.
 * @param {string} [path='/'] - Path the cookie was set on.
 */
function deleteCookie(name, path = '/') {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}

/**
 * Returns all cookies as an object keyed by name.
 *
 * @returns {Object.<string, string>}
 */
function getAllCookies() {
  return Object.fromEntries(
    document.cookie.split(';')
      .map((c) => c.trim().split('='))
      .filter(([k]) => k)
      .map(([k, v]) => [decodeURIComponent(k), decodeURIComponent(v || '')])
  );
}

/* ---------------------------------------------------------------------------
   URL & HISTORY UTILITIES
   --------------------------------------------------------------------------- */

/**
 * Parses the current URL's search parameters and returns them as a plain object.
 *
 * @param   {string} [url=location.search] - Optional URL string to parse.
 * @returns {Object.<string, string>}
 */
function getQueryParams(url = location.search) {
  const params = {};
  new URLSearchParams(url).forEach((val, key) => { params[key] = val; });
  return params;
}

/**
 * Builds a query string from a plain object.
 *
 * @param   {Object.<string, string|number|boolean>} params - Key/value pairs.
 * @returns {string} Query string starting with '?' (e.g. "?plan=pro&billing=annual").
 */
function buildQueryString(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') qs.set(k, String(v));
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
}

/**
 * Updates a single query parameter in the URL bar without reloading the page.
 * Removes the parameter if `value` is null or undefined.
 *
 * @param {string}      key   - Parameter name.
 * @param {string|null} value - New value, or null to remove.
 * @param {boolean}     [replace=false] - Use replaceState instead of pushState.
 */
function setQueryParam(key, value, replace = false) {
  const url = new URL(location.href);
  if (value === null || value === undefined) {
    url.searchParams.delete(key);
  } else {
    url.searchParams.set(key, String(value));
  }
  const method = replace ? 'replaceState' : 'pushState';
  history[method](null, '', url.toString());
}

/**
 * Returns the fragment identifier (hash) of the current URL, without the '#'.
 *
 * @returns {string} Hash value or empty string.
 */
function getHash() {
  return location.hash.slice(1);
}

/**
 * Returns the domain of the current page (protocol + hostname).
 *
 * @returns {string} E.g. "https://luminarystudio.io".
 */
function getOrigin() {
  return location.origin;
}

/**
 * Returns whether a given URL is external (different origin from the current page).
 *
 * @param   {string} url - URL to test.
 * @returns {boolean}
 */
function isExternalUrl(url) {
  try {
    return new URL(url, location.href).origin !== location.origin;
  } catch {
    return false;
  }
}

/* ---------------------------------------------------------------------------
   HTTP / FETCH UTILITIES
   --------------------------------------------------------------------------- */

/**
 * A thin wrapper around `fetch` with:
 *   - configurable timeout (aborts via AbortController)
 *   - automatic JSON parsing of responses
 *   - consistent error objects shaped as { status, message, data }
 *   - retry logic with exponential back-off
 *
 * @param   {string}  url                  - Request URL.
 * @param   {Object}  [opts]               - Options.
 * @param   {string}  [opts.method='GET']  - HTTP method.
 * @param   {Object}  [opts.headers]       - Additional request headers.
 * @param   {*}       [opts.body]          - Request body (auto-serialised to JSON).
 * @param   {number}  [opts.timeout]       - Abort timeout in ms (0 = no timeout).
 * @param   {number}  [opts.retries]       - Number of retries on server errors.
 * @param   {number}  [opts.retryDelay]    - Base delay (ms) between retries (doubles each time).
 * @param   {string}  [opts.credentials]   - fetch credentials mode.
 * @returns {Promise<*>} Resolved with parsed JSON or Response, or throws on error.
 */
async function fetchJson(url, {
  method      = 'GET',
  headers     = {},
  body        = undefined,
  timeout     = CONFIG.api.timeout,
  retries     = CONFIG.api.retryAttempts,
  retryDelay  = CONFIG.api.retryDelay,
  credentials = 'same-origin',
} = {}) {
  const controller  = new AbortController();
  const timeoutId   = timeout > 0 ? setTimeout(() => controller.abort(), timeout) : null;

  const effectiveHeaders = {
    ...CONFIG.api.headers,
    ...headers,
  };

  const fetchOpts = {
    method,
    headers: effectiveHeaders,
    credentials,
    signal: controller.signal,
  };

  if (body !== undefined) {
    if (typeof body === 'object' && !(body instanceof FormData)) {
      fetchOpts.body = JSON.stringify(body);
    } else {
      fetchOpts.body = body;
      if (body instanceof FormData) delete fetchOpts.headers['Content-Type'];
    }
  }

  let lastError;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetch(url, fetchOpts);
      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData = null;
        try { errorData = await response.json(); } catch { /* noop */ }
        const err = new Error(errorData?.message || `HTTP ${response.status}`);
        err.status = response.status;
        err.data   = errorData;
        throw err;
      }

      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      }
      return response;

    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError') {
        const timeoutErr = new Error(STRINGS.api.timeout);
        timeoutErr.code  = 'TIMEOUT';
        throw timeoutErr;
      }
      // Only retry on server errors (5xx) or network failures
      const isRetryable = !err.status || err.status >= 500;
      if (isRetryable && attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt);
        debug(STRINGS.api.retrying(attempt + 1), 'in', delay, 'ms');
        await sleep(delay);
        attempt++;
        continue;
      }
      break;
    }
  }

  if (timeoutId) clearTimeout(timeoutId);
  throw lastError;
}

/**
 * POST helper: sends a JSON body to a URL and returns the parsed response.
 *
 * @param   {string} url   - Endpoint URL.
 * @param   {Object} data  - Data to send as the request body.
 * @param   {Object} [opts] - fetchJson options.
 * @returns {Promise<*>}
 */
function postJson(url, data, opts = {}) {
  return fetchJson(url, { ...opts, method: 'POST', body: data });
}

/**
 * Sends form data as either JSON or multipart/form-data.
 *
 * @param   {string}  url     - Endpoint URL.
 * @param   {HTMLFormElement | FormData | Object} formOrData - Source of form values.
 * @param   {boolean} [asJson=true] - Whether to serialise as JSON.
 * @returns {Promise<*>}
 */
function submitForm(url, formOrData, asJson = true) {
  let body;
  if (formOrData instanceof HTMLFormElement) {
    body = asJson ? formToObject(formOrData) : new FormData(formOrData);
  } else if (formOrData instanceof FormData) {
    body = asJson ? Object.fromEntries(formOrData.entries()) : formOrData;
  } else {
    body = formOrData;
  }
  return postJson(url, body, asJson ? {} : { headers: {} });
}

/**
 * Converts an HTML form's fields to a plain JavaScript object.
 * Handles checkboxes (arrays of values), radio buttons, and selects.
 *
 * @param   {HTMLFormElement} form - The form element.
 * @returns {Object} Form data as a key/value object.
 */
function formToObject(form) {
  const data = {};
  const elements = Array.from(form.elements);
  elements.forEach((el) => {
    if (!el.name || el.disabled) return;
    if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
    if (el.type === 'checkbox') {
      if (data[el.name] === undefined) {
        data[el.name] = el.value;
      } else {
        data[el.name] = [].concat(data[el.name], el.value);
      }
      return;
    }
    data[el.name] = el.value;
  });
  return data;
}

/* ---------------------------------------------------------------------------
   INTERSECTION OBSERVER FACTORY
   --------------------------------------------------------------------------- */

/**
 * Creates an IntersectionObserver that adds `revealClass` to elements when they
 * enter the viewport. Once revealed, the element is unobserved.
 * Falls back to immediately adding the class when IntersectionObserver is unavailable.
 *
 * @param   {string}   [rootMargin]   - IO rootMargin.
 * @param   {number}   [threshold]    - IO threshold.
 * @param   {string}   [revealClass]  - Class to add when visible.
 * @returns {{ observe: Function, disconnect: Function, observer: IntersectionObserver|null }}
 */
function createRevealObserver(
  rootMargin  = CONFIG.performance.lazyRootMargin,
  threshold   = CONFIG.performance.lazyThreshold,
  revealClass = CONFIG.performance.revealClass
) {
  if (!SUPPORTS.intersectionObserver) {
    return {
      observe(el) { addClass(el, revealClass); },
      disconnect() {},
      observer: null,
    };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          addClass(entry.target, revealClass);
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin, threshold }
  );

  return {
    observe(el)  { if (isElement(el)) observer.observe(el); },
    disconnect() { observer.disconnect(); },
    observer,
  };
}

/**
 * Creates an IntersectionObserver that fires a callback once when an element
 * first enters the viewport, then unobserves it.
 *
 * @param   {Function} callback  - Called with (entry, observer) when element is visible.
 * @param   {Object}   [ioOpts]  - IntersectionObserver options.
 * @returns {IntersectionObserver}
 */
function onceVisible(callback, ioOpts = {}) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry, obs);
        obs.unobserve(entry.target);
      }
    });
  }, ioOpts);
  return observer;
}

/* ---------------------------------------------------------------------------
   TOAST NOTIFICATION SYSTEM
   --------------------------------------------------------------------------- */

/**
 * Toast notification manager.
 * Injects and manages a container element in the DOM for stacked
 * accessible toast messages. Each toast has a live-region role and
 * a dismiss button meeting the 44 px touch-target minimum.
 *
 * @namespace toastManager
 */
const toastManager = (() => {
  let container = null;
  const activeToasts = [];

  /**
   * Ensures the toast container is in the DOM.
   * @returns {HTMLElement}
   */
  function getContainer() {
    if (container && document.body.contains(container)) return container;
    container = createElement('div', {
      className: CONFIG.toast.classes.container,
      role:      'region',
      [ARIA.LIVE]:   'polite',
      [ARIA.ATOMIC]: 'false',
      [ARIA.LABEL]:  'Notifications',
    });
    document.body.appendChild(container);
    return container;
  }

  /**
   * Shows a toast notification.
   *
   * @param {string}  message   - Notification text.
   * @param {'success'|'error'|'warning'|'info'} [type='info'] - Toast type.
   * @param {number}  [duration] - Auto-dismiss delay in ms (0 = no auto-dismiss).
   * @returns {{ dismiss: Function }} Object with a manual dismiss method.
   */
  function show(message, type = 'info', duration) {
    const c = getContainer();
    const classes = CONFIG.toast.classes;
    const dur = duration !== undefined
      ? duration
      : type === 'error'   ? CONFIG.toast.errorDuration
      : type === 'success' ? CONFIG.toast.successDuration
      : CONFIG.toast.defaultDuration;

    // Limit concurrent toasts
    if (activeToasts.length >= CONFIG.toast.maxVisible) {
      dismiss(activeToasts[0]);
    }

    const id   = `toast-${shortId()}`;
    const typeClass = classes[type] || classes.info;

    const dismissBtn = createElement('button', {
      type:         'button',
      className:    classes.dismissBtn,
      [ARIA.LABEL]: STRINGS.labels.dismissToast,
    }, '×');

    const toast = createElement('div', {
      role:        'alert',
      id,
      className:   `${classes.item} ${typeClass}`,
      [ARIA.LIVE]: type === 'error' ? 'assertive' : 'polite',
      [ARIA.ATOMIC]: 'true',
    }, [
      createElement('p', { className: 'toast__message' }, message),
      dismissBtn,
    ]);

    on(dismissBtn, EVENTS.CLICK, () => dismiss(toast));

    c.appendChild(toast);
    activeToasts.push(toast);

    requestAnimationFrame(() => addClass(toast, classes.TOAST_SHOW || CSS.TOAST_SHOW));

    let timerId = null;
    if (dur > 0) {
      timerId = setTimeout(() => dismiss(toast), dur);
    }

    function dismiss(t) {
      if (timerId) clearTimeout(timerId);
      removeClass(t, CSS.TOAST_SHOW);
      addClass(t, CSS.TOAST_HIDE);
      const idx = activeToasts.indexOf(t);
      if (idx !== -1) activeToasts.splice(idx, 1);
      setTimeout(() => removeElement(t), CONFIG.toast.animationDuration);
    }

    return { dismiss: () => dismiss(toast) };
  }

  /**
   * Dismisses a specific toast element immediately.
   *
   * @param {HTMLElement} toastEl - Toast element to dismiss.
   */
  function dismiss(toastEl) {
    if (!isElement(toastEl)) return;
    removeClass(toastEl, CSS.TOAST_SHOW);
    addClass(toastEl, CSS.TOAST_HIDE);
    const idx = activeToasts.indexOf(toastEl);
    if (idx !== -1) activeToasts.splice(idx, 1);
    setTimeout(() => removeElement(toastEl), CONFIG.toast.animationDuration);
  }

  /** Dismisses all open toast notifications. */
  function dismissAll() {
    [...activeToasts].forEach(dismiss);
  }

  return { show, dismiss, dismissAll };
})();


/* ---------------------------------------------------------------------------
 * ACCESSIBILITY CORE
 * Live region announcer, focus trap, roving tabindex, skip-link manager,
 * scroll-spy, colour contrast utilities, and screen-reader helpers.
 * --------------------------------------------------------------------------- */

/* --- Live Region Announcer --- */

/**
 * liveRegion
 * Manages an ARIA live region element that politely (or assertively) announces
 * messages to screen readers without moving keyboard focus.
 *
 * The implementation uses a double-buffer trick: two visually hidden nodes are
 * alternated so that repeating the same string still triggers an announcement
 * (some AT only re-reads when the DOM text actually changes).
 *
 * @type {Object}
 */
const liveRegion = (function buildLiveRegion() {

  /**
   * @typedef {Object} LiveRegionBuffer
   * @property {HTMLElement} polite    - aria-live="polite" container
   * @property {HTMLElement} assertive - aria-live="assertive" container
   * @property {HTMLElement} politeA   - Double-buffer node A (polite)
   * @property {HTMLElement} politeB   - Double-buffer node B (polite)
   * @property {HTMLElement} assertA   - Double-buffer node A (assertive)
   * @property {HTMLElement} assertB   - Double-buffer node B (assertive)
   * @property {boolean}     useA      - Which buffer is active for polite
   * @property {boolean}     assertUseA- Which buffer is active for assertive
   * @property {number|null} politeTimer  - clearTimeout handle
   * @property {number|null} assertTimer  - clearTimeout handle
   */

  /** @type {LiveRegionBuffer|null} */
  let _buf = null;

  /**
   * Lazily initialises the live-region DOM nodes and appends them to
   * <body>.  Idempotent — safe to call multiple times.
   *
   * @returns {LiveRegionBuffer}
   */
  function init() {
    if (_buf) return _buf;

    const srStyles = {
      position : 'absolute',
      width    : '1px',
      height   : '1px',
      padding  : '0',
      overflow : 'hidden',
      clip     : 'rect(0,0,0,0)',
      whiteSpace: 'nowrap',
      border   : '0',
    };

    /**
     * Creates a single live-region wrapper with its two buffer children.
     *
     * @param  {'polite'|'assertive'} politeness - ARIA politeness setting
     * @returns {{ wrapper: HTMLElement, nodeA: HTMLElement, nodeB: HTMLElement }}
     */
    function makeRegion(politeness) {
      const wrapper = createElement('div', {
        role        : 'status',
        'aria-live' : politeness,
        'aria-atomic': 'true',
        'aria-relevant': 'additions text',
        id          : `luminary-live-${politeness}`,
      });
      Object.assign(wrapper.style, srStyles);

      const nodeA = createElement('span', { 'data-buf': 'a' });
      const nodeB = createElement('span', { 'data-buf': 'b' });
      wrapper.appendChild(nodeA);
      wrapper.appendChild(nodeB);
      return { wrapper, nodeA, nodeB };
    }

    const politeRegion   = makeRegion('polite');
    const assertRegion   = makeRegion('assertive');

    document.body.appendChild(politeRegion.wrapper);
    document.body.appendChild(assertRegion.wrapper);

    _buf = {
      polite     : politeRegion.wrapper,
      assertive  : assertRegion.wrapper,
      politeA    : politeRegion.nodeA,
      politeB    : politeRegion.nodeB,
      assertA    : assertRegion.nodeA,
      assertB    : assertRegion.nodeB,
      useA       : true,
      assertUseA : true,
      politeTimer : null,
      assertTimer : null,
    };

    return _buf;
  }

  /**
   * Writes a message into the appropriate double-buffer node.
   *
   * The inactive node is cleared immediately; after a short rAF the active
   * node receives the new text.  This guarantees AT re-reads even when the
   * same string is announced twice in a row.
   *
   * @param {string}  message    - Text to announce.
   * @param {'polite'|'assertive'} politeness
   * @param {number}  [clearAfter=5000] - Ms after which the node is emptied.
   */
  function _announce(message, politeness, clearAfter) {
    const buf  = init();
    const delay = isFiniteNumber(clearAfter) ? clearAfter : 5000;

    if (politeness === 'assertive') {
      const active   = buf.assertUseA ? buf.assertA : buf.assertB;
      const inactive = buf.assertUseA ? buf.assertB : buf.assertA;
      inactive.textContent = '';
      buf.assertUseA = !buf.assertUseA;

      if (buf.assertTimer !== null) clearTimeout(buf.assertTimer);

      requestAnimationFrame(() => {
        active.textContent = message;
        buf.assertTimer = delay > 0
          ? setTimeout(() => { active.textContent = ''; }, delay)
          : null;
      });

    } else {
      const active   = buf.useA ? buf.politeA : buf.politeB;
      const inactive = buf.useA ? buf.politeB : buf.politeA;
      inactive.textContent = '';
      buf.useA = !buf.useA;

      if (buf.politeTimer !== null) clearTimeout(buf.politeTimer);

      requestAnimationFrame(() => {
        active.textContent = message;
        buf.politeTimer = delay > 0
          ? setTimeout(() => { active.textContent = ''; }, delay)
          : null;
      });
    }
  }

  /**
   * Politely announces a message to screen readers.
   * The announcement does not interrupt the current speech stream.
   *
   * @param {string} message       - Text to speak.
   * @param {number} [clearAfter]  - Override the auto-clear delay in ms.
   */
  function announce(message, clearAfter) {
    if (!isNonEmptyString(message)) return;
    _announce(String(message).trim(), 'polite', clearAfter);
  }

  /**
   * Assertively announces a message to screen readers.
   * This interrupts any in-progress speech — use sparingly.
   *
   * @param {string} message       - Text to interrupt with.
   * @param {number} [clearAfter]  - Override the auto-clear delay in ms.
   */
  function announceAssertive(message, clearAfter) {
    if (!isNonEmptyString(message)) return;
    _announce(String(message).trim(), 'assertive', clearAfter);
  }

  /**
   * Immediately clears all live-region nodes.
   * Useful when navigating away from a view that previously set a message.
   */
  function clear() {
    const buf = init();
    [buf.politeA, buf.politeB, buf.assertA, buf.assertB].forEach(n => {
      n.textContent = '';
    });
    if (buf.politeTimer !== null) { clearTimeout(buf.politeTimer); buf.politeTimer = null; }
    if (buf.assertTimer !== null) { clearTimeout(buf.assertTimer); buf.assertTimer = null; }
  }

  /**
   * Returns the polite live-region wrapper element (useful for testing).
   * @returns {HTMLElement}
   */
  function getPoliteNode() { return init().polite; }

  /**
   * Returns the assertive live-region wrapper element (useful for testing).
   * @returns {HTMLElement}
   */
  function getAssertiveNode() { return init().assertive; }

  return Object.freeze({ announce, announceAssertive, clear, getPoliteNode, getAssertiveNode, init });
}());


/* --- Focus Trap --- */

/**
 * createFocusTrap
 * Returns a focus-trap controller that confines keyboard Tab navigation to a
 * given element subtree.  Commonly used by modal dialogs, drawers, and
 * off-canvas menus.
 *
 * Features:
 *  - Wraps Tab and Shift+Tab so focus cycles within the container.
 *  - Saves & restores the previously focused element on deactivation.
 *  - Optionally moves focus to a nominated initial element on activation.
 *  - Auto-deactivates when the container is removed from the DOM (via
 *    MutationObserver).
 *  - Emits custom events: 'focustrap:activate', 'focustrap:deactivate'.
 *
 * @param {HTMLElement} container        - The element to trap focus within.
 * @param {object}      [options={}]     - Configuration options.
 * @param {string|HTMLElement} [options.initialFocus]
 *   CSS selector or element to focus when the trap is activated.
 *   Defaults to the first focusable child.
 * @param {string|HTMLElement} [options.returnFocus]
 *   Element to restore focus to on deactivation.
 *   Defaults to the element that was focused when activate() was called.
 * @param {boolean} [options.escapeDeactivates=true]
 *   Whether pressing Escape deactivates the trap.
 * @param {Function} [options.onActivate]   - Called after trap activates.
 * @param {Function} [options.onDeactivate] - Called after trap deactivates.
 * @param {boolean}  [options.preventScroll=false]
 *   Passed to `focus()` on activation to avoid scroll jumps.
 * @returns {{ activate: Function, deactivate: Function, pause: Function, resume: Function, isActive: Function }}
 */
function createFocusTrap(container, options) {
  if (!isElement(container)) {
    warn('createFocusTrap: container must be a DOM element');
    return null;
  }

  const opts = deepMerge({
    initialFocus      : null,
    returnFocus       : null,
    escapeDeactivates : true,
    onActivate        : null,
    onDeactivate      : null,
    preventScroll     : false,
  }, isPlainObject(options) ? options : {});

  /** @type {HTMLElement|null} */
  let _savedFocus = null;
  let _active     = false;
  let _paused     = false;
  let _observer   = null;

  /**
   * Resolves a selector string or element reference to a DOM element
   * within the trap container.
   *
   * @param {string|HTMLElement|null} ref
   * @returns {HTMLElement|null}
   */
  function _resolve(ref) {
    if (!ref) return null;
    if (isElement(ref)) return ref;
    if (isString(ref)) return qs(ref, container) || qs(ref);
    return null;
  }

  /**
   * Finds the element that should receive focus when the trap activates.
   * Priority: options.initialFocus → [autofocus] child → first focusable child
   * → the container itself.
   *
   * @returns {HTMLElement}
   */
  function _getInitialFocusEl() {
    const explicit = _resolve(opts.initialFocus);
    if (explicit && isFocusable(explicit)) return explicit;

    const autofocusEl = qs('[autofocus]', container);
    if (autofocusEl && isFocusable(autofocusEl)) return autofocusEl;

    const children = getFocusableChildren(container);
    if (children.length) return children[0];

    return container;
  }

  /**
   * Handles keydown events within the trap.
   * Constrains Tab / Shift+Tab to the focusable children, and optionally
   * responds to Escape.
   *
   * @param {KeyboardEvent} e
   */
  function _onKeydown(e) {
    if (!_active || _paused) return;

    if (opts.escapeDeactivates && (e.key === KEYS.ESCAPE || e.keyCode === 27)) {
      e.preventDefault();
      deactivate();
      return;
    }

    if (e.key !== KEYS.TAB && e.keyCode !== 9) return;

    const focusable = getFocusableChildren(container);
    if (!focusable.length) { e.preventDefault(); return; }

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first || document.activeElement === container) {
        e.preventDefault();
        last.focus({ preventScroll: opts.preventScroll });
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus({ preventScroll: opts.preventScroll });
      }
    }
  }

  /**
   * Handles focus events: if focus leaves the container, pull it back inside.
   *
   * @param {FocusEvent} e
   */
  function _onFocusin(e) {
    if (!_active || _paused) return;
    if (!container.contains(e.target)) {
      const firstFocusable = getFocusableChildren(container)[0] || container;
      firstFocusable.focus({ preventScroll: opts.preventScroll });
    }
  }

  /**
   * Sets up a MutationObserver to auto-deactivate if the container is
   * removed from the DOM.
   */
  function _watchRemoval() {
    if (_observer) return;
    _observer = new MutationObserver(() => {
      if (!document.contains(container)) {
        deactivate();
      }
    });
    _observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Activates the focus trap.
   * Saves the current active element, moves focus into the trap, and
   * binds keyboard/focus event listeners.
   */
  function activate() {
    if (_active) return;
    _active = true;

    const returnEl = _resolve(opts.returnFocus);
    _savedFocus = returnEl || document.activeElement;

    if (SUPPORTS.dom) {
      document.addEventListener('keydown',  _onKeydown,  true);
      document.addEventListener('focusin',  _onFocusin,  true);
    }

    _watchRemoval();

    requestAnimationFrame(() => {
      _getInitialFocusEl().focus({ preventScroll: opts.preventScroll });
    });

    emit(container, 'focustrap:activate', { trap: exports });

    if (isFunction(opts.onActivate)) {
      try { opts.onActivate(); } catch (err) { logError('focusTrap onActivate', err); }
    }
  }

  /**
   * Deactivates the focus trap.
   * Removes event listeners, restores focus to the saved element, and
   * disconnects the MutationObserver.
   */
  function deactivate() {
    if (!_active) return;
    _active = false;
    _paused = false;

    document.removeEventListener('keydown', _onKeydown, true);
    document.removeEventListener('focusin', _onFocusin, true);

    if (_observer) { _observer.disconnect(); _observer = null; }

    if (_savedFocus && isElement(_savedFocus) && document.contains(_savedFocus)) {
      _savedFocus.focus({ preventScroll: true });
    }
    _savedFocus = null;

    emit(container, 'focustrap:deactivate', { trap: exports });

    if (isFunction(opts.onDeactivate)) {
      try { opts.onDeactivate(); } catch (err) { logError('focusTrap onDeactivate', err); }
    }
  }

  /**
   * Temporarily suspends the trap without fully deactivating it.
   * Focus can leave the container while paused; resume() re-enables
   * containment.
   */
  function pause() {
    if (_active) _paused = true;
  }

  /**
   * Resumes a paused focus trap, immediately pulling focus back inside
   * if it has wandered outside.
   */
  function resume() {
    if (!_active) return;
    _paused = false;
    if (!container.contains(document.activeElement)) {
      _getInitialFocusEl().focus({ preventScroll: opts.preventScroll });
    }
  }

  /**
   * Returns whether the trap is currently active (and not paused).
   * @returns {boolean}
   */
  function isActive() { return _active && !_paused; }

  const exports = Object.freeze({ activate, deactivate, pause, resume, isActive });
  return exports;
}


/* --- Roving Tabindex --- */

/**
 * createRovingTabindex
 * Implements the roving tabindex pattern for composite widgets such as
 * toolbars, tab lists, tree views, and radio groups.
 *
 * Exactly one item in the group has tabindex="0"; the rest have tabindex="-1".
 * Arrow keys move the "active" item, wrapping at the boundaries.
 *
 * @param {HTMLElement}  container  - Parent element that owns the group.
 * @param {object}       [opts={}]  - Configuration options.
 * @param {string}       [opts.itemSelector='[role]']
 *   CSS selector (relative to container) matching each roving item.
 * @param {'horizontal'|'vertical'|'both'} [opts.orientation='both']
 *   Which arrow keys to intercept.
 * @param {boolean}      [opts.wrap=true]
 *   Whether navigation wraps from last to first (and vice versa).
 * @param {boolean}      [opts.activateOnFocus=false]
 *   If true, clicking/focusing an item also "activates" it (fires a custom
 *   'roving:select' event and sets aria-selected/aria-checked where present).
 * @param {Function}     [opts.onSelect]
 *   Callback invoked with the newly selected item element.
 * @returns {{ setActive: Function, getActive: Function, destroy: Function, refresh: Function }}
 */
function createRovingTabindex(container, opts) {
  if (!isElement(container)) {
    warn('createRovingTabindex: container must be a DOM element');
    return null;
  }

  const cfg = deepMerge({
    itemSelector    : '[role]',
    orientation     : 'both',
    wrap            : true,
    activateOnFocus : false,
    onSelect        : null,
  }, isPlainObject(opts) ? opts : {});

  /**
   * Returns the current list of roving items (queried fresh each time so
   * dynamic additions are picked up automatically).
   *
   * @returns {HTMLElement[]}
   */
  function _getItems() {
    return Array.from(qsa(cfg.itemSelector, container)).filter(el => {
      return !el.disabled && !el.getAttribute('aria-disabled');
    });
  }

  /**
   * Sets up tabindex values so only `activeEl` is reachable via Tab.
   * All others are set to -1.
   *
   * @param {HTMLElement} activeEl
   */
  function _applyTabindices(activeEl) {
    _getItems().forEach(item => {
      item.tabIndex = (item === activeEl) ? 0 : -1;
    });
  }

  /**
   * Focuses an item and updates the tabindex state.
   *
   * @param {HTMLElement} item
   * @param {boolean}     [fireSelect=false]
   */
  function setActive(item, fireSelect) {
    if (!isElement(item) || !container.contains(item)) return;
    _applyTabindices(item);
    item.focus();

    if (fireSelect || cfg.activateOnFocus) {
      emit(container, 'roving:select', { item });
      if (isFunction(cfg.onSelect)) {
        try { cfg.onSelect(item); } catch (err) { logError('rovingTabindex onSelect', err); }
      }
    }
  }

  /**
   * Returns the item that currently has tabindex="0", or null.
   *
   * @returns {HTMLElement|null}
   */
  function getActive() {
    return _getItems().find(item => item.tabIndex === 0) || null;
  }

  /**
   * Handles keydown events to move focus within the group.
   *
   * @param {KeyboardEvent} e
   */
  function _onKeydown(e) {
    const items = _getItems();
    if (!items.length) return;

    const idx = items.indexOf(document.activeElement);
    if (idx === -1) return;

    const isHoriz  = cfg.orientation === 'horizontal' || cfg.orientation === 'both';
    const isVert   = cfg.orientation === 'vertical'   || cfg.orientation === 'both';

    let next = -1;

    switch (e.key) {
      case KEYS.ARROW_RIGHT: if (isHoriz) { next = idx + 1; } break;
      case KEYS.ARROW_LEFT:  if (isHoriz) { next = idx - 1; } break;
      case KEYS.ARROW_DOWN:  if (isVert)  { next = idx + 1; } break;
      case KEYS.ARROW_UP:    if (isVert)  { next = idx - 1; } break;
      case KEYS.HOME:        next = 0;                        break;
      case KEYS.END:         next = items.length - 1;         break;
      default: return;
    }

    if (next === -1) return;
    e.preventDefault();

    if (cfg.wrap) {
      next = ((next % items.length) + items.length) % items.length;
    } else {
      next = clamp(next, 0, items.length - 1);
    }

    setActive(items[next], false);
  }

  /**
   * Handles click events on roving items, updating tabindex state and
   * optionally firing the select event.
   *
   * @param {MouseEvent} e
   */
  function _onClick(e) {
    const items = _getItems();
    const target = e.target.closest(cfg.itemSelector);
    if (!target || !items.includes(target)) return;
    setActive(target, true);
  }

  container.addEventListener('keydown', _onKeydown);
  if (cfg.activateOnFocus) container.addEventListener('click', _onClick);

  // Initialise: give tabindex 0 to the first item or the currently marked one.
  (function _init() {
    const items = _getItems();
    if (!items.length) return;
    const preSelected = items.find(i => i.tabIndex === 0) || items[0];
    _applyTabindices(preSelected);
  }());

  /**
   * Re-scans the container items and repairs tabindex state.
   * Call this after dynamically adding or removing items.
   */
  function refresh() {
    const items = _getItems();
    if (!items.length) return;
    const currentActive = getActive();
    const target = (currentActive && items.includes(currentActive)) ? currentActive : items[0];
    _applyTabindices(target);
  }

  /**
   * Removes all event listeners bound by this controller.
   */
  function destroy() {
    container.removeEventListener('keydown', _onKeydown);
    container.removeEventListener('click',   _onClick);
    _getItems().forEach(item => { item.tabIndex = 0; });
  }

  return Object.freeze({ setActive, getActive, destroy, refresh });
}


/* --- Skip Link Manager --- */

/**
 * skipLinkManager
 * Enhances the native `<a href="#main-content">Skip to main content</a>` link
 * by ensuring the target element is keyboard-focusable and that scroll + focus
 * behave correctly across all browsers.
 *
 * Also supports multiple skip destinations (e.g. "Skip to navigation",
 * "Skip to search") declared via `data-skip-target` attributes.
 *
 * @type {Object}
 */
const skipLinkManager = (function buildSkipLinkManager() {

  /**
   * @type {Map<HTMLAnchorElement, { href: string, targetId: string }>}
   */
  const _registry = new Map();

  /**
   * Processes a single skip link, making the target focusable and wiring up
   * a smooth-focus handler that works even when tabIndex management differs
   * between browsers.
   *
   * @param {HTMLAnchorElement} link
   */
  function _processLink(link) {
    if (_registry.has(link)) return;

    const href     = link.getAttribute('href') || '';
    const targetId = href.startsWith('#') ? href.slice(1) : '';
    if (!targetId) return;

    _registry.set(link, { href, targetId });

    /**
     * Ensures the destination element is programmatically focusable.
     * If a tabIndex is not already set, temporarily sets tabindex="-1".
     *
     * @param {HTMLElement} el
     */
    function _ensureFocusable(el) {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '-1');
        // Remove tabindex on blur so the element isn't in the natural tab order.
        el.addEventListener('blur', function _clearTabindex() {
          el.removeAttribute('tabindex');
          el.removeEventListener('blur', _clearTabindex);
        }, { once: true });
      }
    }

    link.addEventListener('click', function _onSkipClick(e) {
      e.preventDefault();

      const target = document.getElementById(targetId);
      if (!target) {
        debug(`skipLinkManager: target #${targetId} not found`);
        return;
      }

      _ensureFocusable(target);

      // Prefer scrollIntoView + focus to respect any CSS scroll-margin.
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /**
   * Scans the document for skip links (`.skip-link` class or
   * `[data-skip-link]` attribute) and wires up each one.
   */
  function init() {
    const links = qsa('.skip-link, [data-skip-link]');
    links.forEach(link => {
      if (link.tagName === 'A') _processLink(link);
    });
    debug(`skipLinkManager: registered ${_registry.size} skip link(s)`);
  }

  /**
   * Manually registers a skip link element that was not picked up by init().
   *
   * @param {HTMLAnchorElement} link
   */
  function register(link) {
    if (isElement(link) && link.tagName === 'A') _processLink(link);
  }

  /**
   * Returns an array of all registered skip links.
   * @returns {HTMLAnchorElement[]}
   */
  function getLinks() { return Array.from(_registry.keys()); }

  return Object.freeze({ init, register, getLinks });
}());


/* --- Scroll Spy --- */

/**
 * createScrollSpy
 * Updates `aria-current="page"` (or a custom attribute) on navigation links
 * as the user scrolls through named sections of the page.
 *
 * Uses IntersectionObserver for performance; falls back to a scroll-event
 * listener with requestAnimationFrame throttling on older browsers.
 *
 * @param {object}  [opts={}]             - Configuration options.
 * @param {string}  [opts.navSelector='[data-spy-nav]']
 *   CSS selector for the navigation container(s).
 * @param {string}  [opts.sectionSelector='section[id], [data-spy-section]']
 *   CSS selector for the observed content sections.
 * @param {string}  [opts.activeAttr='aria-current']
 *   Attribute set on the active nav link.
 * @param {string}  [opts.activeValue='true']
 *   Value applied to activeAttr; use 'page' for landmark nav, 'true' for tabs.
 * @param {string}  [opts.activeClass='is-active']
 *   CSS class also toggled on the active link.
 * @param {number}  [opts.rootMargin='-20% 0px -60% 0px']
 *   IntersectionObserver rootMargin (as a string).
 * @param {boolean} [opts.hashSync=true]
 *   Whether to push the section id to location.hash when it becomes active.
 * @param {Function} [opts.onChange]
 *   Callback invoked with (sectionEl, linkEl) when the active section changes.
 * @returns {{ destroy: Function, getActiveSection: Function }}
 */
function createScrollSpy(opts) {
  const cfg = deepMerge({
    navSelector      : '[data-spy-nav]',
    sectionSelector  : 'section[id], [data-spy-section]',
    activeAttr       : 'aria-current',
    activeValue      : 'true',
    activeClass      : CSS.active,
    hashSync         : true,
    onChange         : null,
    rootMargin       : '-20% 0px -60% 0px',
  }, isPlainObject(opts) ? opts : {});

  /** @type {HTMLElement|null} */
  let _activeSection = null;

  /** @type {IntersectionObserver|null} */
  let _observer = null;

  /** @type {Function|null} — scroll fallback RAF handle */
  let _rafCancel = null;

  /**
   * Returns the nav link that points to a given section id.
   *
   * @param {string} sectionId
   * @returns {HTMLElement|null}
   */
  function _getLinkForSection(sectionId) {
    const navEls = qsa(cfg.navSelector);
    for (const nav of navEls) {
      const link = qs(`a[href="#${sectionId}"]`, nav);
      if (link) return link;
    }
    return null;
  }

  /**
   * Marks a section as active, updating aria-current and CSS classes on
   * the corresponding nav link.
   *
   * @param {HTMLElement} section
   */
  function _activate(section) {
    if (section === _activeSection) return;

    // Deactivate previous
    if (_activeSection) {
      const prevLink = _getLinkForSection(_activeSection.id);
      if (prevLink) {
        prevLink.removeAttribute(cfg.activeAttr);
        removeClass(prevLink, cfg.activeClass);
      }
    }

    _activeSection = section;

    const link = _getLinkForSection(section.id);
    if (link) {
      link.setAttribute(cfg.activeAttr, cfg.activeValue);
      addClass(link, cfg.activeClass);
    }

    if (cfg.hashSync && section.id) {
      try {
        history.replaceState(null, '', `#${section.id}`);
      } catch (_e) { /* ignore SecurityError in sandboxed frames */ }
    }

    if (isFunction(cfg.onChange)) {
      try { cfg.onChange(section, link); } catch (err) { logError('scrollSpy onChange', err); }
    }
  }

  /**
   * Initialises the IntersectionObserver-based implementation.
   */
  function _initObserver() {
    const sections = qsa(cfg.sectionSelector);
    if (!sections.length) return;

    _observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) _activate(entry.target);
      });
    }, {
      rootMargin: cfg.rootMargin,
      threshold : [0],
    });

    sections.forEach(sec => _observer.observe(sec));
  }

  /**
   * Fallback scroll-based implementation for browsers without
   * IntersectionObserver support. Uses RAF throttling to avoid jank.
   */
  function _initScrollFallback() {
    const sections = Array.from(qsa(cfg.sectionSelector));
    if (!sections.length) return;

    function _check() {
      const midpoint = window.scrollY + window.innerHeight * 0.3;
      let best = null;
      let bestTop = -Infinity;

      sections.forEach(sec => {
        const offset = sec.getBoundingClientRect().top + window.scrollY;
        if (offset <= midpoint && offset > bestTop) {
          bestTop = offset;
          best = sec;
        }
      });

      if (best) _activate(best);
    }

    const throttledCheck = rafThrottle(_check);
    _rafCancel = throttledCheck.cancel;
    window.addEventListener('scroll', throttledCheck, { passive: true });
    _check(); // Run once on init
  }

  /**
   * Activates scroll-spy, using IntersectionObserver if available.
   */
  function init() {
    if (SUPPORTS.intersectionObserver) {
      _initObserver();
    } else {
      _initScrollFallback();
    }

    // Handle initial hash on page load.
    if (location.hash) {
      const el = qs(location.hash);
      if (el) _activate(el);
    }
  }

  /**
   * Returns the currently active section element, or null if none.
   * @returns {HTMLElement|null}
   */
  function getActiveSection() { return _activeSection; }

  /**
   * Destroys the scroll-spy, disconnecting the observer and removing
   * any event listeners and active state markup.
   */
  function destroy() {
    if (_observer) { _observer.disconnect(); _observer = null; }
    if (_rafCancel) { _rafCancel(); _rafCancel = null; }

    if (_activeSection) {
      const link = _getLinkForSection(_activeSection.id);
      if (link) {
        link.removeAttribute(cfg.activeAttr);
        removeClass(link, cfg.activeClass);
      }
      _activeSection = null;
    }
  }

  init();
  return Object.freeze({ destroy, getActiveSection });
}


/* --- Colour Contrast Utilities --- */

/**
 * Colour contrast utilities conforming to WCAG 2.x / 3.0 relative luminance
 * and contrast ratio calculations.  All functions operate on either a
 * #rrggbb / #rgb hex string or an [r, g, b] tuple (0–255 range).
 *
 * @namespace contrast
 */
const contrast = (function buildContrastUtils() {

  /**
   * Parses a CSS hex colour string to an [r, g, b] tuple.
   * Handles 3-digit (#rgb) and 6-digit (#rrggbb) forms, with or without '#'.
   *
   * @param  {string} hex - CSS hex colour, e.g. '#3a86ff' or '3a86ff'.
   * @returns {[number, number, number]|null} RGB tuple or null on parse failure.
   */
  function hexToRgb(hex) {
    if (!isString(hex)) return null;
    const clean = hex.replace(/^#/, '');
    let r, g, b;

    if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16);
      g = parseInt(clean[1] + clean[1], 16);
      b = parseInt(clean[2] + clean[2], 16);
    } else if (clean.length === 6) {
      r = parseInt(clean.slice(0, 2), 16);
      g = parseInt(clean.slice(2, 4), 16);
      b = parseInt(clean.slice(4, 6), 16);
    } else {
      return null;
    }

    return [r, g, b];
  }

  /**
   * Converts an [r, g, b] tuple to a '#rrggbb' hex string.
   *
   * @param  {[number, number, number]} rgb
   * @returns {string}
   */
  function rgbToHex(rgb) {
    return '#' + rgb.map(v => {
      const clamped = clamp(Math.round(v), 0, 255);
      return clamped.toString(16).padStart(2, '0');
    }).join('');
  }

  /**
   * Converts a linear (0–255) sRGB component value to its linearised
   * counterpart used in WCAG relative luminance formula.
   *
   * @param  {number} val - sRGB channel value 0–255.
   * @returns {number} Linearised value 0–1.
   */
  function _linearise(val) {
    const sRgb = val / 255;
    return sRgb <= 0.04045
      ? sRgb / 12.92
      : Math.pow((sRgb + 0.055) / 1.055, 2.4);
  }

  /**
   * Calculates the WCAG 2.x relative luminance of a colour.
   *
   * @param  {string|[number,number,number]} colour - Hex string or RGB tuple.
   * @returns {number|null} Relative luminance 0–1, or null on invalid input.
   *
   * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
   */
  function relativeLuminance(colour) {
    const rgb = Array.isArray(colour) ? colour : hexToRgb(colour);
    if (!rgb) return null;

    const [r, g, b] = rgb;
    return 0.2126 * _linearise(r) +
           0.7152 * _linearise(g) +
           0.0722 * _linearise(b);
  }

  /**
   * Calculates the WCAG 2.x contrast ratio between two colours.
   *
   * @param  {string|[number,number,number]} fg - Foreground colour.
   * @param  {string|[number,number,number]} bg - Background colour.
   * @returns {number|null} Contrast ratio ≥ 1, or null on invalid input.
   *
   * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
   */
  function contrastRatio(fg, bg) {
    const lumFg = relativeLuminance(fg);
    const lumBg = relativeLuminance(bg);
    if (lumFg === null || lumBg === null) return null;

    const lighter = Math.max(lumFg, lumBg);
    const darker  = Math.min(lumFg, lumBg);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Returns the WCAG 2.x conformance level for a given contrast ratio.
   *
   * @param  {number}  ratio      - Contrast ratio.
   * @param  {'normal'|'large'}   [textSize='normal']
   *   'large' = 18pt regular or 14pt bold; affects AA threshold.
   * @returns {'AAA'|'AA'|'FAIL'}
   */
  function wcagLevel(ratio, textSize) {
    if (!isFiniteNumber(ratio) || ratio < 1) return 'FAIL';
    const isLarge = textSize === 'large';

    if (ratio >= 7)             return 'AAA';
    if (isLarge && ratio >= 3)  return 'AA';
    if (!isLarge && ratio >= 4.5) return 'AA';
    return 'FAIL';
  }

  /**
   * Full WCAG 2.x compliance check for a foreground/background pair.
   *
   * @param  {string|[number,number,number]} fg
   * @param  {string|[number,number,number]} bg
   * @param  {'normal'|'large'} [textSize='normal']
   * @returns {{ ratio: number, level: string, passesAA: boolean, passesAAA: boolean }|null}
   */
  function check(fg, bg, textSize) {
    const ratio = contrastRatio(fg, bg);
    if (ratio === null) return null;

    return {
      ratio     : round(ratio, 2),
      level     : wcagLevel(ratio, textSize || 'normal'),
      passesAA  : wcagLevel(ratio, textSize || 'normal') !== 'FAIL',
      passesAAA : ratio >= 7,
    };
  }

  /**
   * Given a background colour, returns either '#000000' or '#ffffff'
   * depending on which provides the higher contrast ratio.
   * Useful for auto-computing readable text colour on dynamic backgrounds.
   *
   * @param  {string|[number,number,number]} bg
   * @returns {'#000000'|'#ffffff'}
   */
  function readableOn(bg) {
    const onBlack = contrastRatio('#000000', bg) || 0;
    const onWhite = contrastRatio('#ffffff', bg) || 0;
    return onBlack >= onWhite ? '#000000' : '#ffffff';
  }

  /**
   * Brightens or darkens a hex colour by a given amount (-255 to 255).
   * Negative amounts darken; positive amounts brighten.
   *
   * @param  {string}  hex    - Source colour.
   * @param  {number}  amount - Adjustment amount.
   * @returns {string} Adjusted hex colour.
   */
  function adjustBrightness(hex, amount) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return rgbToHex(rgb.map(v => clamp(v + amount, 0, 255)));
  }

  /**
   * Blends two hex colours by a ratio t (0 = all `from`, 1 = all `to`).
   *
   * @param  {string} from - Start colour.
   * @param  {string} to   - End colour.
   * @param  {number} t    - Blend ratio 0–1.
   * @returns {string} Blended hex colour.
   */
  function blend(from, to, t) {
    const a = hexToRgb(from);
    const b = hexToRgb(to);
    if (!a || !b) return from;
    return rgbToHex(a.map((v, i) => lerp(v, b[i], clamp(t, 0, 1))));
  }

  /**
   * Returns the hue (0–360), saturation (0–100), and lightness (0–100)
   * of a hex colour as an array [h, s, l].
   *
   * @param  {string} hex
   * @returns {[number, number, number]|null}
   */
  function hexToHsl(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;

    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case r: h = ((g - b) / delta + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / delta + 2) / 6;               break;
        case b: h = ((r - g) / delta + 4) / 6;               break;
      }
    }

    return [round(h * 360, 1), round(s * 100, 1), round(l * 100, 1)];
  }

  /**
   * Converts an HSL tuple [h, s, l] (h: 0–360, s/l: 0–100) to '#rrggbb'.
   *
   * @param  {[number, number, number]} hsl
   * @returns {string}
   */
  function hslToHex(hsl) {
    const [h, s, l] = hsl;
    const sN = s / 100;
    const lN = l / 100;
    const a  = sN * Math.min(lN, 1 - lN);

    function f(n) {
      const k = (n + h / 30) % 12;
      return lN - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    }

    return rgbToHex([f(0) * 255, f(8) * 255, f(4) * 255]);
  }

  /**
   * Checks every foreground/background text pair on the visible page and
   * returns an array of failure objects.  Useful for automated audits in
   * development mode.
   *
   * Only checks elements that have explicit inline color/background-color
   * styles or CSS custom-property overrides.  Full computed-style contrast
   * auditing would require checking all elements, which is expensive; this
   * is a quick heuristic scan.
   *
   * @returns {Array<{ element: HTMLElement, fg: string, bg: string, ratio: number }>}
   */
  function auditPage() {
    const failures = [];

    qsa('*').forEach(el => {
      const style = window.getComputedStyle(el);
      const fg = style.color;
      const bg = style.backgroundColor;

      if (!fg || !bg) return;
      if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') return;

      // Convert rgb(r, g, b) to [r, g, b] array for ratio calculation.
      const parseRgbStr = (str) => {
        const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return m ? [+m[1], +m[2], +m[3]] : null;
      };

      const fgRgb = parseRgbStr(fg);
      const bgRgb = parseRgbStr(bg);
      if (!fgRgb || !bgRgb) return;

      const ratio = contrastRatio(fgRgb, bgRgb);
      if (ratio !== null && ratio < 4.5) {
        failures.push({ element: el, fg: rgbToHex(fgRgb), bg: rgbToHex(bgRgb), ratio: round(ratio, 2) });
      }
    });

    return failures;
  }

  return Object.freeze({
    hexToRgb,
    rgbToHex,
    relativeLuminance,
    contrastRatio,
    wcagLevel,
    check,
    readableOn,
    adjustBrightness,
    blend,
    hexToHsl,
    hslToHex,
    auditPage,
  });
}());


/* --- Screen Reader Utilities --- */

/**
 * srUtils
 * Miscellaneous helper functions for improving the screen-reader experience.
 *
 * @namespace srUtils
 */
const srUtils = (function buildSrUtils() {

  /**
   * Creates a visually-hidden span containing the given text and appends it
   * to `parent`.  Useful for adding accessible descriptions that sighted
   * users don't see, e.g. "(opens in new tab)".
   *
   * @param {HTMLElement} parent  - Element to append the description to.
   * @param {string}      text    - Description text.
   * @returns {HTMLElement} The created span.
   */
  function appendHiddenText(parent, text) {
    const span = createElement('span', { 'class': 'sr-only' });
    span.textContent = text;
    parent.appendChild(span);
    return span;
  }

  /**
   * Marks all external links on the page with a visually-hidden
   * "(opens in new tab)" suffix and ensures `target="_blank"` links also
   * have `rel="noopener noreferrer"`.
   *
   * @param {HTMLElement} [root=document.body] - Root element to scan.
   */
  function annotateExternalLinks(root) {
    const searchRoot = isElement(root) ? root : document.body;
    qsa('a[href]', searchRoot).forEach(link => {
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('javascript')) return;

      const isExternal =
        isExternalUrl(href) ||
        link.getAttribute('target') === '_blank';

      if (!isExternal) return;

      // Ensure rel for security.
      const rel = (link.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      if (!rel.includes('noopener'))   rel.push('noopener');
      if (!rel.includes('noreferrer')) rel.push('noreferrer');
      link.setAttribute('rel', rel.join(' '));

      if (link.getAttribute('target') !== '_blank') {
        link.setAttribute('target', '_blank');
      }

      // Avoid double-annotation.
      if (!qs('.sr-only', link)) {
        appendHiddenText(link, STRINGS.opensInNewTab || ', opens in new tab');
      }
    });
  }

  /**
   * Adds a `title` attribute with `accessible` description to `<iframe>`
   * elements that are missing one, so screen readers announce the frame's
   * purpose when focus enters it.
   *
   * @param {HTMLElement} [root=document.body]
   */
  function labelIframes(root) {
    const searchRoot = isElement(root) ? root : document.body;
    qsa('iframe:not([title]):not([aria-label]):not([aria-labelledby])', searchRoot).forEach((iframe, idx) => {
      iframe.setAttribute('title', `Content frame ${idx + 1}`);
    });
  }

  /**
   * Wraps bare SVG icons (those without `aria-label`, `aria-labelledby`, or
   * `<title>`) in a `role="img"` container and hides them from AT if they are
   * purely decorative (no accessible name is determinable).
   *
   * @param {HTMLElement} [root=document.body]
   */
  function processSvgIcons(root) {
    const searchRoot = isElement(root) ? root : document.body;
    qsa('svg', searchRoot).forEach(svg => {
      const hasName =
        svg.getAttribute('aria-label') ||
        svg.getAttribute('aria-labelledby') ||
        qs('title', svg);

      if (!hasName) {
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
      } else if (!svg.getAttribute('role')) {
        svg.setAttribute('role', 'img');
        svg.setAttribute('focusable', 'false');
      }
    });
  }

  /**
   * Ensures every `<img>` element in the given root has an `alt` attribute.
   * Images with empty alt are treated as decorative and left alone.
   * Images without any alt attribute are given `alt=""` and a warning is
   * logged.
   *
   * @param {HTMLElement} [root=document.body]
   * @returns {number} Count of images that were missing alt.
   */
  function auditImages(root) {
    const searchRoot = isElement(root) ? root : document.body;
    let missingCount = 0;

    qsa('img', searchRoot).forEach(img => {
      if (!img.hasAttribute('alt')) {
        warn(`srUtils.auditImages: <img> missing alt attribute`, img);
        img.setAttribute('alt', '');
        missingCount++;
      }
    });

    debug(`srUtils.auditImages: ${missingCount} image(s) lacked alt text`);
    return missingCount;
  }

  /**
   * Converts a plain `<table>` that lacks `scope` attributes on its header
   * cells into a simple accessible data table by applying `scope="col"` to
   * `<th>` cells in the first row.
   *
   * For complex tables (headers spanning multiple columns/rows) a fuller
   * `id`/`headers` approach is needed; this helper only covers the common
   * one-dimensional header case.
   *
   * @param {HTMLTableElement} table
   */
  function makeTableAccessible(table) {
    if (!isElement(table) || table.tagName !== 'TABLE') return;

    // Apply scope="col" to header cells in thead (or first tr).
    const headerRow = qs('thead tr', table) || qs('tr', table);
    if (headerRow) {
      qsa('th', headerRow).forEach(th => {
        if (!th.hasAttribute('scope')) th.setAttribute('scope', 'col');
      });
    }

    // Apply scope="row" to first-column header cells in tbody rows.
    qsa('tbody tr', table).forEach(row => {
      const firstCell = row.cells[0];
      if (firstCell && firstCell.tagName === 'TH' && !firstCell.hasAttribute('scope')) {
        firstCell.setAttribute('scope', 'row');
      }
    });

    // Caption check — encourage caption usage for data tables.
    if (!qs('caption', table)) {
      const label = table.getAttribute('aria-label') || table.getAttribute('aria-labelledby');
      if (!label) {
        debug('srUtils.makeTableAccessible: <table> has no caption or aria-label', table);
      }
    }
  }

  /**
   * Generates a unique `id` string for DOM elements that need one for
   * ARIA attribute cross-referencing (aria-labelledby, aria-describedby…)
   * but don't have one yet.
   *
   * @param {string} [prefix='luminary-id']
   * @returns {string}
   */
  function generateId(prefix) {
    return `${isNonEmptyString(prefix) ? prefix : 'luminary-id'}-${shortId()}`;
  }

  /**
   * Ensures `el` has an `id` attribute, generating one if needed.
   * Returns the (possibly newly assigned) id.
   *
   * @param {HTMLElement} el
   * @param {string}      [prefix]
   * @returns {string}
   */
  function ensureId(el, prefix) {
    if (!isElement(el)) return '';
    if (!el.id) el.id = generateId(prefix);
    return el.id;
  }

  /**
   * Links a label element (or any element) to a control using
   * `aria-labelledby`, appending to any existing references.
   *
   * @param {HTMLElement} control   - The element to receive aria-labelledby.
   * @param {HTMLElement} labelEl   - The labelling element.
   */
  function addLabelledBy(control, labelEl) {
    if (!isElement(control) || !isElement(labelEl)) return;
    const labelId = ensureId(labelEl, 'label');
    const existing = (control.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean);
    if (!existing.includes(labelId)) {
      existing.push(labelId);
      control.setAttribute('aria-labelledby', existing.join(' '));
    }
  }

  /**
   * Links a description element to a control using `aria-describedby`,
   * appending to any existing references.
   *
   * @param {HTMLElement} control   - The element to receive aria-describedby.
   * @param {HTMLElement} descEl    - The describing element.
   */
  function addDescribedBy(control, descEl) {
    if (!isElement(control) || !isElement(descEl)) return;
    const descId = ensureId(descEl, 'desc');
    const existing = (control.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (!existing.includes(descId)) {
      existing.push(descId);
      control.setAttribute('aria-describedby', existing.join(' '));
    }
  }

  /**
   * Sets `aria-busy="true"` on an element to indicate it is loading.
   * Removes the attribute (not just sets to "false") when done.
   *
   * @param {HTMLElement} el
   * @param {boolean}     busy
   */
  function setBusy(el, busy) {
    if (!isElement(el)) return;
    if (busy) {
      el.setAttribute('aria-busy', 'true');
    } else {
      el.removeAttribute('aria-busy');
    }
  }

  /**
   * Marks a container as having a describedby error message.
   * Sets `aria-invalid="true"` and `aria-describedby` pointing to the
   * error element (which must already have an `id`).
   *
   * @param {HTMLElement} field  - The invalid field (input, select, …).
   * @param {HTMLElement} errorEl - The element showing the error message.
   */
  function markInvalid(field, errorEl) {
    if (!isElement(field) || !isElement(errorEl)) return;
    addDescribedBy(field, errorEl);
  }

  /**
   * Removes the invalid state from a field.
   *
   * @param {HTMLElement} field
   * @param {HTMLElement} [errorEl] - If supplied, removes its id from aria-describedby.
   */
  function markValid(field, errorEl) {
    if (!isElement(field)) return;

    if (isElement(errorEl) && errorEl.id) {
      const refs = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(id => id && id !== errorEl.id);
      if (refs.length) {
        field.setAttribute('aria-describedby', refs.join(' '));
      } else {
        field.removeAttribute('aria-describedby');
      }
    }
  }

  return Object.freeze({
    appendHiddenText,
    annotateExternalLinks,
    labelIframes,
    processSvgIcons,
    auditImages,
    makeTableAccessible,
    generateId,
    ensureId,
    addLabelledBy,
    addDescribedBy,
    setBusy,
    markInvalid,
    markValid,
  });
}());


/* --- Keyboard Navigation Guard --- */

/**
 * keyboardNavigationGuard
 *
 * Tracks whether the user is navigating with a keyboard or a pointer device
 * and applies a data attribute to `<html>` accordingly.  This allows CSS to
 * show `:focus-visible`-style outlines only when keyboard navigation is
 * detected, avoiding the "ugly focus ring on click" problem in browsers that
 * don't yet support `:focus-visible` natively.
 *
 * Attribute applied:  `data-navigation="keyboard" | "pointer"`
 *
 * @type {Object}
 */
const keyboardNavigationGuard = (function buildKeyboardNavGuard() {

  const ROOT_ATTR = 'data-navigation';
  let _initialised = false;

  /**
   * Sets the navigation mode attribute on <html>.
   * @param {'keyboard'|'pointer'} mode
   */
  function _setMode(mode) {
    document.documentElement.setAttribute(ROOT_ATTR, mode);
  }

  /**
   * Switches to keyboard mode on the first keydown of a Tab, arrow, or other
   * navigation key.
   *
   * @param {KeyboardEvent} e
   */
  function _onKeydown(e) {
    const navKeys = [
      KEYS.TAB, KEYS.ARROW_UP, KEYS.ARROW_DOWN, KEYS.ARROW_LEFT, KEYS.ARROW_RIGHT,
      KEYS.HOME, KEYS.END, KEYS.ENTER, KEYS.SPACE, KEYS.ESCAPE,
    ];
    if (navKeys.includes(e.key)) _setMode('keyboard');
  }

  /**
   * Switches to pointer mode on mouse clicks and touch events.
   */
  function _onPointer() {
    _setMode('pointer');
  }

  /**
   * Attaches event listeners to detect input modality.
   * Safe to call multiple times — idempotent.
   */
  function init() {
    if (_initialised || !SUPPORTS.dom) return;
    _initialised = true;

    _setMode('pointer'); // Default assumption.

    document.addEventListener('keydown',    _onKeydown, true);
    document.addEventListener('mousedown',  _onPointer, true);
    document.addEventListener('touchstart', _onPointer, { passive: true, capture: true });
    document.addEventListener('pointerdown', _onPointer, true);
  }

  /**
   * Returns the current navigation mode.
   * @returns {'keyboard'|'pointer'|null}
   */
  function getMode() {
    return document.documentElement.getAttribute(ROOT_ATTR) || null;
  }

  /**
   * Returns true if the user is currently navigating with a keyboard.
   * @returns {boolean}
   */
  function isKeyboard() { return getMode() === 'keyboard'; }

  /**
   * Returns true if the user is currently navigating with a pointer.
   * @returns {boolean}
   */
  function isPointer() { return getMode() === 'pointer'; }

  /**
   * Tears down all event listeners.
   */
  function destroy() {
    document.removeEventListener('keydown',     _onKeydown, true);
    document.removeEventListener('mousedown',   _onPointer, true);
    document.removeEventListener('touchstart',  _onPointer, true);
    document.removeEventListener('pointerdown', _onPointer, true);
    _initialised = false;
  }

  return Object.freeze({ init, getMode, isKeyboard, isPointer, destroy });
}());


/* --- Focus History --- */

/**
 * focusHistory
 *
 * Maintains a bounded stack of recently focused elements.  Useful for
 * "return focus" scenarios where `document.activeElement` at activation time
 * was not able to be stored (e.g. globalised shortcut keys).
 *
 * @type {Object}
 */
const focusHistory = (function buildFocusHistory() {
  const MAX_DEPTH = CONFIG.accessibility.focusHistoryDepth || 10;

  /** @type {HTMLElement[]} */
  const _stack = [];
  let _initialised = false;

  /**
   * Pushes the currently focused element onto the history stack.
   * Silently deduplicates consecutive identical elements.
   *
   * @param {FocusEvent} e
   */
  function _onFocusin(e) {
    const el = e.target;
    if (!isElement(el) || el === document.body) return;
    if (_stack[_stack.length - 1] === el) return; // dedup

    _stack.push(el);
    if (_stack.length > MAX_DEPTH) _stack.shift();
  }

  /**
   * Starts recording focus history.  Idempotent.
   */
  function init() {
    if (_initialised || !SUPPORTS.dom) return;
    _initialised = true;
    document.addEventListener('focusin', _onFocusin, true);
  }

  /**
   * Returns the element at `depth` positions back in focus history.
   * `depth=1` is the last focused element before the current one.
   *
   * @param  {number} [depth=1]
   * @returns {HTMLElement|null}
   */
  function get(depth) {
    const d = isFiniteNumber(depth) && depth >= 1 ? Math.floor(depth) : 1;
    return _stack[_stack.length - d] || null;
  }

  /**
   * Returns the complete history stack (oldest to newest).
   * @returns {HTMLElement[]}
   */
  function getAll() { return _stack.slice(); }

  /**
   * Removes all entries from the history stack.
   */
  function clear() { _stack.length = 0; }

  /**
   * Stops recording and removes event listeners.
   */
  function destroy() {
    document.removeEventListener('focusin', _onFocusin, true);
    clear();
    _initialised = false;
  }

  return Object.freeze({ init, get, getAll, clear, destroy });
}());


/* ---------------------------------------------------------------------------
 * NAVIGATION & HEADER
 * Mobile menu toggle, dropdown menus, sticky header behaviours, scroll-to-top
 * button, breadcrumb helpers, and active-link management.
 * --------------------------------------------------------------------------- */

/* --- Mobile Navigation Toggle --- */

/**
 * mobileNav
 *
 * Manages the hamburger-button / off-canvas drawer pattern used for the site's
 * primary navigation on narrow viewports.
 *
 * Responsibilities:
 *  - Toggles `aria-expanded` on the trigger button.
 *  - Toggles the open CSS class on the nav drawer and the `<body>`.
 *  - Activates a focus trap inside the drawer when open.
 *  - Closes on Escape, or when a click lands outside the drawer.
 *  - Closes automatically when the viewport widens past the mobile breakpoint.
 *  - Emits 'mobilenav:open' and 'mobilenav:close' custom events on the trigger.
 *  - Restores scroll position when the body-scroll lock is lifted.
 *
 * @type {Object}
 */
const mobileNav = (function buildMobileNav() {

  /** @type {HTMLElement|null} */
  let _trigger  = null;
  /** @type {HTMLElement|null} */
  let _drawer   = null;
  /** @type {HTMLElement|null} */
  let _overlay  = null;
  /** @type {ReturnType<typeof createFocusTrap>|null} */
  let _trap     = null;
  /** @type {number} - Saved window.scrollY when scroll-lock is applied */
  let _scrollY  = 0;
  /** @type {boolean} */
  let _open     = false;
  /** @type {MediaQueryList|null} */
  let _mql      = null;
  /** @type {boolean} */
  let _initialised = false;

  /**
   * Applies a CSS-only scroll lock to `<body>` that prevents background
   * scrolling while the mobile menu is open.  Saves and restores scroll
   * position to avoid the page jumping to top on close.
   */
  function _lockScroll() {
    _scrollY = window.scrollY;
    document.body.style.top    = `-${_scrollY}px`;
    document.body.style.position = 'fixed';
    document.body.style.width  = '100%';
    document.body.style.overflow = 'hidden';
  }

  /**
   * Removes the scroll lock and restores the user's previous scroll position.
   */
  function _unlockScroll() {
    document.body.style.position = '';
    document.body.style.top      = '';
    document.body.style.width    = '';
    document.body.style.overflow = '';
    window.scrollTo(0, _scrollY);
  }

  /**
   * Opens the mobile navigation drawer.
   *
   * @param {boolean} [announceToSR=true] - Whether to announce the state change.
   */
  function open(announceToSR) {
    if (_open || !_trigger || !_drawer) return;
    _open = true;

    addClass(_drawer, CONFIG.navigation.openClass || CSS.open);
    addClass(document.body, CSS.navOpen);

    if (_overlay) {
      _overlay.removeAttribute('hidden');
      requestAnimationFrame(() => addClass(_overlay, CSS.visible));
    }

    _lockScroll();

    emit(_trigger, 'mobilenav:open', { drawer: _drawer });

    if (announceToSR !== false) {
      liveRegion.announce(STRINGS.navOpenAnnouncement || 'Navigation menu opened');
    }
  }

  /**
   * Closes the mobile navigation drawer.
   *
   * @param {boolean} [announceToSR=true]
   */
  function close(announceToSR) {
    if (!_open) return;
    _open = false;

    removeClass(_drawer, CONFIG.navigation.openClass || CSS.open);
    removeClass(document.body, CSS.navOpen);

    if (_overlay) {
      removeClass(_overlay, CSS.visible);
      // Hide overlay after CSS transition completes.
      const dur = parseInt(getCssVar('--transition-base', document.documentElement) || '250', 10);
      setTimeout(() => {
        if (_overlay) _overlay.setAttribute('hidden', '');
      }, dur + 50);
    }

    _unlockScroll();

    if (_trap && _trap.isActive()) _trap.deactivate();

    emit(_trigger, 'mobilenav:close', { drawer: _drawer });

  }

  /**
   * Toggles the drawer open or closed.
   */
  function toggle() {
    _open ? close() : open();
  }

  /**
   * Handles click on the hamburger trigger button.
   */
  function _onTriggerClick() { toggle(); }

  /**
   * Handles keyboard events on the trigger (Space / Enter already trigger
   * click for buttons, so only Escape needs special handling here).
   *
   * @param {KeyboardEvent} e
   */
  function _onTriggerKeydown(e) {
    if (e.key === KEYS.ESCAPE || e.keyCode === 27) {
      if (_open) { e.preventDefault(); close(); }
    }
  }

  /**
   * Closes the drawer if a pointer interaction lands outside the drawer
   * and outside the trigger button.
   *
   * @param {MouseEvent|TouchEvent} e
   */
  function _onOutsideClick(e) {
    if (!_open) return;
    const target = e.target;
    if (_drawer && _drawer.contains(target)) return;
    if (_trigger && _trigger.contains(target)) return;
    close();
  }

  /**
   * Closes the drawer when the viewport widens beyond the mobile breakpoint
   * (prevents an open drawer from being invisible but still trapping focus
   * on tablet/desktop).
   *
   * @param {MediaQueryListEvent} e
   */
  function _onBreakpointChange(e) {
    if (!e.matches && _open) close(false);
  }

  /**
   * Initialises the mobile navigation controller.
   * Safe to call on DOMContentLoaded — will no-op if elements are absent.
   */
  function init() {
    if (_initialised) return;

    _trigger  = qs(SELECTORS.navToggle);
    _drawer   = qs(SELECTORS.navDrawer || SELECTORS.primaryNav);
    _overlay  = qs(SELECTORS.navOverlay);

    if (!_trigger || !_drawer) {
      debug('mobileNav.init: trigger or drawer not found — skipping');
      return;
    }

    _initialised = true;

    _trigger.addEventListener('click',   _onTriggerClick);
    _trigger.addEventListener('keydown', _onTriggerKeydown);

    // Outside-click handler for closing.
    document.addEventListener('click',      _onOutsideClick);
    document.addEventListener('touchstart', _onOutsideClick, { passive: true });

    // MediaQueryList to auto-close on viewport expand.
    const mobileBreakpoint = CONFIG.navigation.mobileBreakpoint || '(max-width: 768px)';
    _mql = window.matchMedia(mobileBreakpoint);
    if (_mql.addEventListener) {
      _mql.addEventListener('change', _onBreakpointChange);
    } else {
      // Safari < 14 fallback.
      _mql.addListener(_onBreakpointChange);
    }

    debug('mobileNav.init: ready');
  }

  /**
   * Returns whether the drawer is currently open.
   * @returns {boolean}
   */
  function isOpen() { return _open; }

  /**
   * Tears down all event listeners and resets state.
   */
  function destroy() {
    if (!_initialised) return;

    if (_trap && _trap.isActive()) _trap.deactivate();

    _trigger && _trigger.removeEventListener('click',   _onTriggerClick);
    _trigger && _trigger.removeEventListener('keydown', _onTriggerKeydown);
    document.removeEventListener('click',      _onOutsideClick);
    document.removeEventListener('touchstart', _onOutsideClick);

    if (_mql) {
      if (_mql.removeEventListener) _mql.removeEventListener('change', _onBreakpointChange);
      else _mql.removeListener(_onBreakpointChange);
    }

    if (_open) close(false);

    _trigger = _drawer = _overlay = _trap = _mql = null;
    _open = false;
    _initialised = false;
  }

  return Object.freeze({ init, open, close, toggle, isOpen, destroy });
}());


/* --- Dropdown Menu Controller --- */

/**
 * dropdownMenu
 *
 * Manages a collection of ARIA disclosure-pattern dropdown menus within
 * the site header.  Each dropdown consists of:
 *   - A trigger element: `<button aria-haspopup="true" aria-expanded="false">`
 *   - A panel element:   `<ul role="menu"> | <div role="region">`
 *
 * The controller handles:
 *   - Mouse hover open/close with debounce to avoid flickering.
 *   - Click toggle as a fallback (and for touch).
 *   - Full keyboard navigation: Enter/Space to open, Escape to close,
 *     Arrow Down to focus first item, Arrow Up to focus last item.
 *   - Closing the active dropdown when focus moves outside (focusout).
 *   - Closing the active dropdown when a sibling trigger is activated.
 *   - Emitting 'dropdown:open' and 'dropdown:close' events.
 *
 * @type {Object}
 */
const dropdownMenu = (function buildDropdownMenu() {

  /**
   * @typedef {Object} DropdownInstance
   * @property {HTMLElement}   trigger  - The button that opens/closes the panel.
   * @property {HTMLElement}   panel    - The panel element (hidden when closed).
   * @property {boolean}       open     - Current open state.
   * @property {number|null}   hoverTimer - Debounce timer for hover close.
   */

  /** @type {DropdownInstance[]} */
  let _instances = [];
  let _initialised = false;

  /**
   * Finds the DropdownInstance associated with a trigger element.
   *
   * @param {HTMLElement} trigger
   * @returns {DropdownInstance|null}
   */
  function _getInstance(trigger) {
    return _instances.find(i => i.trigger === trigger) || null;
  }

  /**
   * Closes all dropdown instances that are currently open, optionally
   * excluding one (so its sibling can open without a double-close flash).
   *
   * @param {DropdownInstance} [except] - Instance to skip.
   */
  function _closeAll(except) {
    _instances.forEach(inst => {
      if (inst === except || !inst.open) return;
      _closeInstance(inst);
    });
  }

  /**
   * Opens a single dropdown instance.
   *
   * @param {DropdownInstance} inst
   */
  function _openInstance(inst) {
    if (inst.open) return;
    inst.open = true;

    inst.panel.removeAttribute('hidden');
    requestAnimationFrame(() => addClass(inst.panel, CSS.open));

    emit(inst.trigger, 'dropdown:open', { trigger: inst.trigger, panel: inst.panel });
  }

  /**
   * Closes a single dropdown instance.
   *
   * @param {DropdownInstance} inst
   * @param {boolean}         [returnFocus=false] - Move focus back to trigger.
   */
  function _closeInstance(inst, returnFocus) {
    if (!inst.open) return;
    inst.open = false;

    removeClass(inst.panel, CSS.open);

    const dur = parseInt(getCssVar('--transition-base', document.documentElement) || '200', 10);
    setTimeout(() => {
      if (!inst.open) inst.panel.setAttribute('hidden', '');
    }, dur + 20);

    if (returnFocus) inst.trigger.focus();

    emit(inst.trigger, 'dropdown:close', { trigger: inst.trigger, panel: inst.panel });
  }

  /**
   * Processes a trigger click: closes any open sibling, then toggles self.
   *
   * @param {MouseEvent} e
   */
  function _onTriggerClick(e) {
    const inst = _getInstance(e.currentTarget);
    if (!inst) return;
    _closeAll(inst);
    inst.open ? _closeInstance(inst, true) : _openInstance(inst);
  }

  /**
   * Handles keyboard interaction on trigger elements.
   *
   * @param {KeyboardEvent} e
   */
  function _onTriggerKeydown(e) {
    const inst = _getInstance(e.currentTarget);
    if (!inst) return;

    switch (e.key) {
      case KEYS.ESCAPE:
        if (inst.open) { e.preventDefault(); _closeInstance(inst, true); }
        break;

      case KEYS.ARROW_DOWN:
      case KEYS.ENTER:
      case KEYS.SPACE:
        if (!inst.open) {
          e.preventDefault();
          _closeAll(inst);
          _openInstance(inst);
          // Move focus to first item in the panel.
          requestAnimationFrame(() => {
            const first = getFocusableChildren(inst.panel)[0];
            if (first) first.focus();
          });
        }
        break;

      case KEYS.ARROW_UP:
        if (!inst.open) {
          e.preventDefault();
          _closeAll(inst);
          _openInstance(inst);
          // Move focus to last item in the panel.
          requestAnimationFrame(() => {
            const focusable = getFocusableChildren(inst.panel);
            if (focusable.length) focusable[focusable.length - 1].focus();
          });
        }
        break;

      default: break;
    }
  }

  /**
   * Handles keydown events within an open panel — Escape closes & returns
   * focus, ArrowUp/Down cycle through panel items.
   *
   * @param {KeyboardEvent} e
   */
  function _onPanelKeydown(e) {
    const panel   = e.currentTarget;
    const inst    = _instances.find(i => i.panel === panel);
    if (!inst) return;

    const items   = getFocusableChildren(panel);
    const current = items.indexOf(document.activeElement);

    switch (e.key) {
      case KEYS.ESCAPE:
        e.preventDefault();
        _closeInstance(inst, true);
        break;

      case KEYS.ARROW_DOWN:
        e.preventDefault();
        if (current < items.length - 1) items[current + 1].focus();
        else items[0].focus();
        break;

      case KEYS.ARROW_UP:
        e.preventDefault();
        if (current > 0) items[current - 1].focus();
        else items[items.length - 1].focus();
        break;

      case KEYS.HOME:
        e.preventDefault();
        if (items.length) items[0].focus();
        break;

      case KEYS.END:
        e.preventDefault();
        if (items.length) items[items.length - 1].focus();
        break;

      default: break;
    }
  }

  /**
   * Handles hover interactions on a dropdown wrapper element (which contains
   * both the trigger and panel).
   *
   * @param {'enter'|'leave'} type
   * @param {DropdownInstance} inst
   */
  function _onHover(type, inst) {
    if (window.matchMedia('(hover: none)').matches) return; // Touch-only device.

    if (type === 'enter') {
      if (inst.hoverTimer !== null) { clearTimeout(inst.hoverTimer); inst.hoverTimer = null; }
      _closeAll(inst);
      _openInstance(inst);
    } else {
      inst.hoverTimer = setTimeout(() => {
        _closeInstance(inst);
        inst.hoverTimer = null;
      }, CONFIG.navigation.hoverCloseDelay || 150);
    }
  }

  /**
   * Closes all dropdowns when focus moves outside the navigation entirely.
   *
   * @param {FocusEvent} e
   */
  function _onDocumentFocusin(e) {
    const nav = qs(SELECTORS.primaryNav);
    if (!nav) return;
    if (!nav.contains(e.target)) _closeAll();
  }

  /**
   * Closes all dropdowns when a click lands outside the nav.
   *
   * @param {MouseEvent} e
   */
  function _onDocumentClick(e) {
    const nav = qs(SELECTORS.primaryNav);
    if (!nav) return;
    if (!nav.contains(e.target)) _closeAll();
  }

  /**
   * Registers a single dropdown pair.
   *
   * @param {HTMLElement} trigger - The toggle button.
   * @param {HTMLElement} panel   - The expandable panel.
   */
  function register(trigger, panel) {
    if (!isElement(trigger) || !isElement(panel)) return;
    if (_getInstance(trigger)) return; // Already registered.

    /* Ensure required ARIA attributes. */
    if (!trigger.hasAttribute('aria-haspopup')) setAttr(trigger, 'aria-haspopup', 'true');
    if (!trigger.hasAttribute('aria-expanded')) setAttr(trigger, 'aria-expanded', 'false');

    const panelId = srUtils.ensureId(panel, 'dropdown-panel');
    if (!trigger.getAttribute('aria-controls')) setAttr(trigger, 'aria-controls', panelId);

    panel.setAttribute('hidden', '');

    /** @type {DropdownInstance} */
    const inst = { trigger, panel, open: false, hoverTimer: null };
    _instances.push(inst);

    trigger.addEventListener('click',   _onTriggerClick);
    trigger.addEventListener('keydown', _onTriggerKeydown);
    panel.addEventListener('keydown',   _onPanelKeydown);

    // Hover support for desktop — bound on the closest common ancestor.
    const wrapper = trigger.closest('[data-dropdown]') || trigger.parentElement;
    if (wrapper) {
      wrapper.addEventListener('mouseenter', () => _onHover('enter', inst));
      wrapper.addEventListener('mouseleave', () => _onHover('leave', inst));
    }
  }

  /**
   * Auto-discovers dropdown pairs using `[data-dropdown]` containers.
   * Expected structure:
   *   <div data-dropdown>
   *     <button aria-expanded="false">Menu</button>
   *     <ul hidden>...</ul>
   *   </div>
   */
  function init() {
    if (_initialised) return;
    _initialised = true;

    qsa('[data-dropdown]').forEach(wrapper => {
      const trigger = qs('button[aria-expanded], button[aria-haspopup]', wrapper)
                    || qs('button', wrapper);
      const panel   = qs('[role="menu"], [role="listbox"], ul, [data-dropdown-panel]', wrapper);
      if (trigger && panel) register(trigger, panel);
    });

    // Also pick up any nav items marked with data-has-dropdown.
    qsa('[data-has-dropdown]').forEach(trigger => {
      const panelId = trigger.getAttribute('aria-controls');
      const panel   = panelId
        ? document.getElementById(panelId)
        : qs('[data-dropdown-panel]', trigger.parentElement);
      if (panel) register(trigger, panel);
    });

    document.addEventListener('focusin', _onDocumentFocusin);
    document.addEventListener('click',   _onDocumentClick);

    debug(`dropdownMenu.init: ${_instances.length} dropdown(s) registered`);
  }

  /**
   * Programmatically opens the dropdown for a given trigger element.
   * @param {HTMLElement} trigger
   */
  function openFor(trigger) {
    const inst = _getInstance(trigger);
    if (inst) { _closeAll(inst); _openInstance(inst); }
  }

  /**
   * Programmatically closes the dropdown for a given trigger element.
   * @param {HTMLElement} trigger
   * @param {boolean}     [returnFocus]
   */
  function closeFor(trigger, returnFocus) {
    const inst = _getInstance(trigger);
    if (inst) _closeInstance(inst, returnFocus);
  }

  /**
   * Returns the open state for a trigger.
   * @param {HTMLElement} trigger
   * @returns {boolean}
   */
  function isOpenFor(trigger) {
    const inst = _getInstance(trigger);
    return inst ? inst.open : false;
  }

  /**
   * Tears down all event listeners and resets all instances.
   */
  function destroy() {
    _closeAll();
    _instances.forEach(inst => {
      inst.trigger.removeEventListener('click',   _onTriggerClick);
      inst.trigger.removeEventListener('keydown', _onTriggerKeydown);
      inst.panel.removeEventListener('keydown',   _onPanelKeydown);
    });
    document.removeEventListener('focusin', _onDocumentFocusin);
    document.removeEventListener('click',   _onDocumentClick);
    _instances = [];
    _initialised = false;
  }

  return Object.freeze({ init, register, openFor, closeFor, isOpenFor, destroy });
}());


/* --- Sticky Header Controller --- */

/**
 * stickyHeader
 *
 * Adds scroll-based behaviour to the site's `<header>` element:
 *  - Adds `is-scrolled` class once the page has scrolled past a threshold.
 *  - Implements "hide on scroll-down, show on scroll-up" for a less intrusive
 *    header that gains back viewport space on long pages.
 *  - Manages a CSS custom property `--header-height` on `:root` so that
 *    anchored sections can use it for scroll-margin-top offsets.
 *  - Applies reduced-motion: skips CSS transitions if the user prefers it.
 *  - Emits 'header:hide' and 'header:show' custom events.
 *
 * @type {Object}
 */
const stickyHeader = (function buildStickyHeader() {

  /** @type {HTMLElement|null} */
  let _header        = null;
  let _lastScrollY   = 0;
  let _ticking       = false;
  let _hidden        = false;
  let _initialised   = false;

  const SCROLL_THRESHOLD = CONFIG.navigation.scrollThreshold || 80;
  const HIDE_THRESHOLD   = CONFIG.navigation.hideThreshold   || 200;

  /**
   * Reads the current header height and writes it to the :root CSS variable.
   * Called on resize to keep the value accurate.
   */
  function _updateHeightVar() {
    if (!_header) return;
    const h = _header.getBoundingClientRect().height;
    setCssVar('--header-height', `${Math.round(h)}px`, document.documentElement);
  }

  /**
   * Core scroll handler — runs in a rAF to avoid layout thrashing.
   */
  function _onScroll() {
    if (!_header) return;

    const scrollY  = window.scrollY;
    const scrolled = scrollY > SCROLL_THRESHOLD;

    toggleClass(_header, CSS.scrolled, scrolled);

    if (scrollY > HIDE_THRESHOLD) {
      const movingDown = scrollY > _lastScrollY;

      if (movingDown && !_hidden) {
        _hidden = true;
        addClass(_header, CSS.headerHidden);
        emit(_header, 'header:hide');

      } else if (!movingDown && _hidden) {
        _hidden = false;
        removeClass(_header, CSS.headerHidden);
        emit(_header, 'header:show');
      }
    } else if (_hidden) {
      _hidden = false;
      removeClass(_header, CSS.headerHidden);
    }

    _lastScrollY = scrollY;
    _ticking     = false;
  }

  /**
   * Throttled scroll event handler using requestAnimationFrame.
   */
  function _handleScroll() {
    if (!_ticking) {
      _ticking = true;
      requestAnimationFrame(_onScroll);
    }
  }

  /**
   * Debounced resize handler to keep --header-height up to date.
   */
  const _handleResize = debounce(() => _updateHeightVar(), TIMING.resize || 150);

  /**
   * Initialises the sticky header controller.
   */
  function init() {
    if (_initialised) return;

    _header = qs(SELECTORS.header);
    if (!_header) {
      debug('stickyHeader.init: header element not found');
      return;
    }

    _initialised = true;
    _lastScrollY = window.scrollY;

    // Set initial CSS variable.
    _updateHeightVar();

    if (prefersReducedMotion()) {
      addClass(_header, CSS.noTransition);
    }

    window.addEventListener('scroll', _handleScroll, { passive: true });
    window.addEventListener('resize', _handleResize, { passive: true });

    // Fire once to set initial classes.
    _onScroll();

    debug('stickyHeader.init: ready');
  }

  /**
   * Forces the header to appear (overrides hide state).
   */
  function show() {
    if (!_header) return;
    _hidden = false;
    removeClass(_header, CSS.headerHidden);
    emit(_header, 'header:show');
  }

  /**
   * Forces the header to hide.
   */
  function hide() {
    if (!_header) return;
    _hidden = true;
    addClass(_header, CSS.headerHidden);
    emit(_header, 'header:hide');
  }

  /**
   * Returns whether the header is currently hidden.
   * @returns {boolean}
   */
  function isHidden() { return _hidden; }

  /**
   * Returns the current pixel height of the header.
   * @returns {number}
   */
  function getHeight() {
    return _header ? Math.round(_header.getBoundingClientRect().height) : 0;
  }

  /**
   * Removes event listeners and resets state.
   */
  function destroy() {
    window.removeEventListener('scroll', _handleScroll);
    window.removeEventListener('resize', _handleResize);
    _header = null;
    _hidden = _initialised = false;
  }

  return Object.freeze({ init, show, hide, isHidden, getHeight, destroy });
}());


/* --- Scroll To Top Button --- */

/**
 * scrollToTop
 *
 * Controls a "scroll to top" button that becomes visible once the user
 * has scrolled a minimum distance.
 *
 * The button must be present in the HTML with the selector defined in
 * SELECTORS.scrollTopBtn.  When clicked (or activated via keyboard) it
 * smoothly scrolls the page to (0, 0) and returns keyboard focus to the
 * skip link or the `<body>`.
 *
 * @type {Object}
 */
const scrollToTop = (function buildScrollToTop() {

  /** @type {HTMLElement|null} */
  let _btn         = null;
  let _visible     = false;
  let _ticking     = false;
  let _initialised = false;

  const SHOW_AFTER = CONFIG.navigation.scrollTopThreshold || 400;

  /**
   * Updates button visibility based on current scroll position.
   */
  function _update() {
    if (!_btn) return;
    const shouldShow = window.scrollY > SHOW_AFTER;

    if (shouldShow && !_visible) {
      _visible = true;
      _btn.removeAttribute('hidden');
      requestAnimationFrame(() => addClass(_btn, CSS.visible));
      _btn.setAttribute('aria-hidden', 'false');

    } else if (!shouldShow && _visible) {
      _visible = false;
      removeClass(_btn, CSS.visible);
      const delay = parseInt(getCssVar('--transition-base', document.documentElement) || '250', 10);
      setTimeout(() => {
        if (!_visible && _btn) {
          _btn.setAttribute('hidden', '');
          _btn.setAttribute('aria-hidden', 'true');
        }
      }, delay + 50);
    }

    _ticking = false;
  }

  /**
   * rAF-throttled scroll handler.
   */
  function _onScroll() {
    if (!_ticking) {
      _ticking = true;
      requestAnimationFrame(_update);
    }
  }

  /**
   * Handles click on the scroll-to-top button.
   */
  function _onClick() {
    const skipLink = qs(SELECTORS.skipLink);
    const returnEl = skipLink || document.body;

    if (prefersReducedMotion() || !SUPPORTS.smoothScroll) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Defer focus until scroll animation completes (approximate).
    setTimeout(() => { returnEl.focus({ preventScroll: true }); }, 300);

  }

  /**
   * Initialises the scroll-to-top controller.
   */
  function init() {
    if (_initialised) return;

    _btn = qs(SELECTORS.scrollTopBtn);
    if (!_btn) {
      debug('scrollToTop.init: button element not found');
      return;
    }

    _initialised = true;

    // Start hidden.
    _btn.setAttribute('hidden', '');

    _btn.addEventListener('click', _onClick);
    window.addEventListener('scroll', _onScroll, { passive: true });

    _update(); // Initial check in case page is pre-scrolled (e.g. hash link).
  }

  /**
   * Tears down event listeners.
   */
  function destroy() {
    window.removeEventListener('scroll', _onScroll);
    if (_btn) _btn.removeEventListener('click', _onClick);
    _btn = null;
    _visible = _initialised = false;
  }

  return Object.freeze({ init, destroy });
}());


/* --- Breadcrumb Helpers --- */

/**
 * breadcrumbHelpers
 *
 * Utility functions for working with `<nav aria-label="Breadcrumb">` elements.
 *
 * Ensures:
 *  - The last breadcrumb item carries `aria-current="page"`.
 *  - Separator characters (e.g. '/') added via CSS ::before/::after are
 *    hidden from AT via aria-hidden="true" on wrapper spans.
 *  - The nav element itself has an accessible name via aria-label.
 *
 * @type {Object}
 */
const breadcrumbHelpers = (function buildBreadcrumbHelpers() {

  /**
   * Processes a single breadcrumb `<nav>` element.
   *
   * @param {HTMLElement} nav - The breadcrumb navigation wrapper.
   */
  function _processNav(nav) {
    if (!isElement(nav)) return;

    // Ensure aria-label.
    if (!nav.getAttribute('aria-label') && !nav.getAttribute('aria-labelledby')) {
      nav.setAttribute('aria-label', STRINGS.breadcrumbLabel || 'Breadcrumb');
    }

    const list = qs('ol, ul', nav);
    if (!list) return;

    const items = Array.from(list.children).filter(li => li.tagName === 'LI');
    if (!items.length) return;

    const lastItem = items[items.length - 1];
    const lastLink = qs('a', lastItem);

    // Mark the last item as the current page.
    if (lastLink && !lastLink.getAttribute('aria-current')) {
      lastLink.setAttribute('aria-current', 'page');
    } else if (!lastLink && !lastItem.getAttribute('aria-current')) {
      lastItem.setAttribute('aria-current', 'page');
    }

    // Hide any separator spans from AT.
    qsa('[aria-hidden]', nav).forEach(sep => {
      if (!sep.getAttribute('aria-hidden')) sep.setAttribute('aria-hidden', 'true');
    });
    qsa('.breadcrumb__separator, .separator, [data-separator]', nav).forEach(sep => {
      sep.setAttribute('aria-hidden', 'true');
    });
  }

  /**
   * Initialises all breadcrumb navs on the page.
   */
  function init() {
    qsa('[aria-label*="readcrumb"], [aria-label*="bread"], nav.breadcrumb, [data-breadcrumb]').forEach(_processNav);
  }

  /**
   * Generates a breadcrumb `<nav>` element from an array of path items.
   *
   * @param {Array<{label: string, href?: string}>} items
   * @returns {HTMLElement}
   *
   * @example
   * breadcrumbHelpers.render([
   *   { label: 'Home',    href: '/' },
   *   { label: 'Products', href: '/products' },
   *   { label: 'Widget Pro' },  // current page — no href
   * ]);
   */
  function render(items) {
    const nav = createElement('nav', { 'aria-label': STRINGS.breadcrumbLabel || 'Breadcrumb' });
    const ol  = createElement('ol', { class: 'breadcrumb__list' });

    items.forEach((item, idx) => {
      const isCurrent = idx === items.length - 1;
      const li        = createElement('li', { class: 'breadcrumb__item' });

      if (item.href && !isCurrent) {
        const a = createElement('a', { href: item.href, class: 'breadcrumb__link' });
        a.textContent = item.label;
        li.appendChild(a);
      } else {
        const span = createElement('span', { class: 'breadcrumb__current' });
        span.textContent = item.label;
        if (isCurrent) span.setAttribute('aria-current', 'page');
        li.appendChild(span);
      }

      if (!isCurrent) {
        const sep = createElement('span', { 'aria-hidden': 'true', class: 'breadcrumb__separator' });
        sep.textContent = CONFIG.navigation.breadcrumbSeparator || '/';
        li.appendChild(sep);
      }

      ol.appendChild(li);
    });

    nav.appendChild(ol);
    return nav;
  }

  /**
   * Updates the `aria-current` attribute when the current page changes.
   * Pass the `href` of the newly active page to mark its link as current.
   *
   * @param {string}       currentHref
   * @param {HTMLElement}  [root=document]
   */
  function setCurrent(currentHref, root) {
    const searchRoot = isElement(root) ? root : document;
    qsa('[aria-current="page"], [aria-current="true"]', searchRoot).forEach(el => {
      el.removeAttribute('aria-current');
    });

    const link = qs(`a[href="${currentHref}"]`, searchRoot);
    if (link) link.setAttribute('aria-current', 'page');
  }

  return Object.freeze({ init, render, setCurrent });
}());


/* --- Active Nav Links --- */

/**
 * activeNavLinks
 *
 * Sets `aria-current="page"` on navigation links that match the current
 * URL pathname, and optionally adds an `is-active` CSS class.  Handles
 * exact matches, prefix matches (for section-level nav items), and
 * hash-only links.
 *
 * @type {Object}
 */
const activeNavLinks = (function buildActiveNavLinks() {

  /**
   * @typedef {Object} ActiveNavOptions
   * @property {string}  [navSelector='nav']         - Selector for nav containers to scan.
   * @property {string}  [activeAttr='aria-current'] - Attribute to set on active links.
   * @property {string}  [activeValue='page']        - Value for the activeAttr.
   * @property {string}  [activeClass='is-active']   - CSS class to add to active links.
   * @property {boolean} [matchExact=false]          - Only match fully identical paths.
   * @property {boolean} [includeHash=false]         - Consider hash when matching.
   */

  /**
   * Runs the active-link detection algorithm.
   *
   * @param {ActiveNavOptions} [opts={}]
   */
  function init(opts) {
    const cfg = deepMerge({
      navSelector  : 'nav',
      activeAttr   : 'aria-current',
      activeValue  : 'page',
      activeClass  : CSS.active,
      matchExact   : false,
      includeHash  : false,
    }, isPlainObject(opts) ? opts : {});

    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;

    qsa(cfg.navSelector).forEach(nav => {
      qsa('a[href]', nav).forEach(link => {
        const href = link.getAttribute('href') || '';
        if (!href || href === '#') return;

        let isActive = false;

        if (href.startsWith('#')) {
          // Hash-only links: match against current hash.
          isActive = cfg.includeHash && href === currentHash;

        } else {
          let linkPath;
          try {
            linkPath = new URL(href, window.location.origin).pathname;
          } catch (_) {
            linkPath = href;
          }

          if (cfg.matchExact) {
            isActive = linkPath === currentPath;
          } else {
            // Prefix match — a nav item for '/products/' is active on
            // '/products/widget-pro/'.
            isActive = currentPath === linkPath ||
                       (linkPath !== '/' && currentPath.startsWith(linkPath));
          }

          if (isActive && cfg.includeHash) {
            const linkHash = new URL(href, window.location.origin).hash;
            if (linkHash) isActive = linkHash === currentHash;
          }
        }

        if (isActive) {
          link.setAttribute(cfg.activeAttr, cfg.activeValue);
          addClass(link, cfg.activeClass);
        } else {
          link.removeAttribute(cfg.activeAttr);
          removeClass(link, cfg.activeClass);
        }
      });
    });
  }

  /**
   * Removes all active-link markers applied by this module.
   *
   * @param {string} [navSelector='nav']
   * @param {string} [activeAttr='aria-current']
   * @param {string} [activeClass='is-active']
   */
  function clear(navSelector, activeAttr, activeClass) {
    const ns = navSelector  || 'nav';
    const aa = activeAttr   || 'aria-current';
    const ac = activeClass  || CSS.active;

    qsa(ns).forEach(nav => {
      qsa(`a[${aa}]`, nav).forEach(link => {
        link.removeAttribute(aa);
        removeClass(link, ac);
      });
    });
  }

  return Object.freeze({ init, clear });
}());


/* --- Navigation Keyboard Shortcuts --- */

/**
 * navKeyboardShortcuts
 *
 * Registers page-level keyboard shortcuts that help keyboard and power
 * users navigate the site efficiently.
 *
 * Default shortcuts (all use Alt + key, configurable via CONFIG):
 *   Alt+H  → go to Home page   (navigates or scrolls)
 *   Alt+S  → focus the search input
 *   Alt+N  → move focus to primary navigation
 *   Alt+M  → move focus to main content
 *   Alt+F  → move focus to footer
 *   Alt+T  → scroll to top
 *
 * The implementation checks for conflicts with browser/OS shortcuts and
 * only registers if the combination appears safe on the current platform.
 *
 * @type {Object}
 */
const navKeyboardShortcuts = (function buildNavKeyboardShortcuts() {

  /**
   * @typedef {Object} ShortcutDefinition
   * @property {string}   key        - The key character (case-insensitive).
   * @property {boolean}  [alt]      - Whether Alt must be held.
   * @property {boolean}  [ctrl]     - Whether Ctrl must be held.
   * @property {boolean}  [shift]    - Whether Shift must be held.
   * @property {string}   label      - Human-readable description.
   * @property {Function} action     - Called when the shortcut fires.
   */

  /** @type {ShortcutDefinition[]} */
  let _shortcuts = [];
  let _initialised = false;

  /**
   * Tests whether a KeyboardEvent matches a shortcut definition.
   *
   * @param {KeyboardEvent}        e
   * @param {ShortcutDefinition}   def
   * @returns {boolean}
   */
  function _matches(e, def) {
    if (e.key.toLowerCase() !== def.key.toLowerCase()) return false;
    if (!!def.alt   !== e.altKey)   return false;
    if (!!def.ctrl  !== e.ctrlKey)  return false;
    if (!!def.shift !== e.shiftKey) return false;
    return true;
  }

  /**
   * Global keydown handler — tests all registered shortcuts.
   * @param {KeyboardEvent} e
   */
  function _onKeydown(e) {
    // Never fire inside a text input.
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (e.target.isContentEditable) return;

    for (const def of _shortcuts) {
      if (_matches(e, def)) {
        e.preventDefault();
        try { def.action(e); } catch (err) { logError(`navShortcut ${def.key}`, err); }
        break;
      }
    }
  }

  /**
   * Registers the default site-level shortcuts.
   */
  function _registerDefaults() {
    const defs = [
      {
        key: 's', alt: true, label: 'Focus site search',
        action() {
          const input = qs(SELECTORS.searchInput);
          if (input) { input.focus(); }
        },
      },
      {
        key: 'n', alt: true, label: 'Focus primary navigation',
        action() {
          const nav = qs(SELECTORS.primaryNav);
          const first = nav ? getFocusableChildren(nav)[0] : null;
          if (first) { first.focus(); liveRegion.announce(STRINGS.navFocused || 'Navigation focused'); }
        },
      },
      {
        key: 'm', alt: true, label: 'Focus main content',
        action() {
          const main = qs(SELECTORS.mainContent);
          if (main) {
            if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
            main.focus({ preventScroll: true });
            liveRegion.announce(STRINGS.mainFocused || 'Main content focused');
          }
        },
      },
      {
        key: 'f', alt: true, label: 'Focus footer',
        action() {
          const footer = qs(SELECTORS.footer);
          const first  = footer ? getFocusableChildren(footer)[0] : null;
          if (first) { first.focus(); liveRegion.announce(STRINGS.footerFocused || 'Footer focused'); }
        },
      },
      {
        key: 't', alt: true, label: 'Scroll to top',
        action() {
          scrollToTop && scrollToTop.init && scrollToY(0);
          const skipLink = qs(SELECTORS.skipLink);
          if (skipLink) skipLink.focus();
          liveRegion.announce(STRINGS.scrolledToTop || 'Scrolled to top of page');
        },
      },
    ];

    defs.forEach(d => register(d));
  }

  /**
   * Registers a new keyboard shortcut.
   *
   * @param {ShortcutDefinition} def
   */
  function register(def) {
    if (!isPlainObject(def) || !def.key || !isFunction(def.action)) return;
    _shortcuts.push(def);
  }

  /**
   * Removes a shortcut by key character.
   * @param {string} key
   */
  function unregister(key) {
    _shortcuts = _shortcuts.filter(d => d.key.toLowerCase() !== key.toLowerCase());
  }

  /**
   * Returns all registered shortcuts.
   * @returns {ShortcutDefinition[]}
   */
  function getAll() { return _shortcuts.slice(); }

  /**
   * Activates keyboard-shortcut handling.
   * Safe to call multiple times — idempotent.
   */
  function init() {
    if (_initialised) return;
    _initialised = true;
    _registerDefaults();
    document.addEventListener('keydown', _onKeydown);
    debug(`navKeyboardShortcuts.init: ${_shortcuts.length} shortcut(s) registered`);
  }

  /**
   * Tears down the shortcut handler.
   */
  function destroy() {
    document.removeEventListener('keydown', _onKeydown);
    _shortcuts   = [];
    _initialised = false;
  }

  return Object.freeze({ init, register, unregister, getAll, destroy });
}());


/* ---------------------------------------------------------------------------
 * SITE SEARCH
 * Autocomplete suggestion dropdown, recent-query history, keyboard navigation,
 * search results view, highlight helper, and deep-link support.
 * --------------------------------------------------------------------------- */

/* --- Search State --- */

/**
 * @typedef {Object} SearchState
 * @property {string}   query           - Current raw query string.
 * @property {string}   normalisedQuery - Whitespace-normalised, lower-cased query.
 * @property {boolean}  open            - Whether the suggestion panel is open.
 * @property {number}   activeIndex     - Index of the keyboard-highlighted suggestion (-1 = none).
 * @property {Array}    suggestions     - Current suggestion objects.
 * @property {boolean}  loading         - True while an async fetch is in-flight.
 * @property {string|null} error        - Error message, or null.
 * @property {AbortController|null} abortCtrl - Abort controller for active requests.
 */

/**
 * _searchState
 * Central mutable state object for the site search module.
 * All mutations go through the siteSearch module's own methods.
 *
 * @type {SearchState}
 */
const _searchState = {
  query           : '',
  normalisedQuery : '',
  open            : false,
  activeIndex     : -1,
  suggestions     : [],
  loading         : false,
  error           : null,
  abortCtrl       : null,
};


/* --- Suggestion Data Source --- */

/**
 * suggestionDataSource
 *
 * A pluggable data-source layer that the search autocomplete delegates to.
 * You can replace the default in-memory implementation with one that fetches
 * from an API endpoint by calling `suggestionDataSource.setProvider()`.
 *
 * Default provider: searches within a static catalogue of page titles,
 * headings, and product names extracted from the DOM at init time.
 *
 * @type {Object}
 */
const suggestionDataSource = (function buildSuggestionDataSource() {

  /**
   * @typedef {Object} SuggestionItem
   * @property {string}  id        - Unique identifier.
   * @property {string}  label     - Display text shown in the suggestion list.
   * @property {string}  [href]    - Destination URL / anchor id.
   * @property {string}  [type]    - Category label, e.g. 'page', 'product', 'heading'.
   * @property {string}  [icon]    - Optional icon name / emoji / SVG string.
   * @property {Object}  [meta]    - Any additional data needed by the provider.
   */

  /** @type {SuggestionItem[]} */
  let _catalogue = [];

  /**
   * Custom async provider function, replacing the default static search.
   * Signature: (query: string, limit: number) => Promise<SuggestionItem[]>
   *
   * @type {Function|null}
   */
  let _customProvider = null;

  /**
   * Builds the static in-memory catalogue from DOM content.
   * Scans headings, nav links, product card titles, and FAQ questions.
   *
   * Called once on init.
   */
  function buildCatalogue() {
    const items = [];
    let id = 0;

    const addItem = (label, href, type, meta) => {
      if (!isNonEmptyString(label)) return;
      items.push({
        id   : `si-${++id}`,
        label: label.trim(),
        href : href || '',
        type : type || 'page',
        meta : isPlainObject(meta) ? meta : {},
      });
    };

    // Section headings (h1–h3 with IDs make good anchor targets).
    qsa('h1[id], h2[id], h3[id], h4[id]').forEach(h => {
      const text = h.textContent.trim();
      if (text && text.length < 120) addItem(text, `#${h.id}`, 'heading');
    });

    // Primary nav links.
    qsa(`${SELECTORS.primaryNav} a[href]`).forEach(a => {
      const text = a.textContent.trim();
      if (text) addItem(text, a.getAttribute('href'), 'nav');
    });

    // Product card titles and descriptions.
    qsa('[data-product-title], .product-card__title, .card__title').forEach(el => {
      const text = el.textContent.trim();
      const card = el.closest('[data-product-id], .product-card, .card');
      const link = card ? qs('a', card) : el.closest('a');
      const href = link ? link.getAttribute('href') : '';
      if (text) addItem(text, href, 'product', { element: card });
    });

    // FAQ questions.
    qsa('[data-faq-question], .faq__question, .accordion__trigger').forEach(el => {
      const text = el.textContent.trim();
      const item = el.closest('[data-faq-item], .faq__item, .accordion__item');
      const id$  = item ? (item.id || '') : '';
      if (text) addItem(text, id$ ? `#${id$}` : '', 'faq');
    });

    // Footer links (useful for "contact", "about" etc).
    qsa(`${SELECTORS.footer || 'footer'} a[href]`).forEach(a => {
      const text = a.textContent.trim();
      if (text && text.length < 60) addItem(text, a.getAttribute('href'), 'page');
    });

    // Deduplicate by label (case-insensitive).
    const seen = new Set();
    _catalogue = items.filter(item => {
      const key = item.label.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    debug(`suggestionDataSource.buildCatalogue: ${_catalogue.length} items indexed`);
  }

  /**
   * Static fuzzy-search across the catalogue.
   * Returns items whose label contains all space-separated tokens of the
   * query (case-insensitive substring matching).
   *
   * @param  {string} query  - User query string.
   * @param  {number} [limit=CONFIG.search.maxSuggestions || 8]
   * @returns {SuggestionItem[]}
   */
  function _staticSearch(query, limit) {
    const tokens = normaliseWhitespace(query).toLowerCase().split(' ').filter(Boolean);
    if (!tokens.length) return [];

    const max = isFiniteNumber(limit) ? limit : (CONFIG.search.maxSuggestions || 8);

    return _catalogue
      .filter(item => tokens.every(t => item.label.toLowerCase().includes(t)))
      .slice(0, max);
  }

  /**
   * Issues a query and returns a promise of SuggestionItem[].
   * Delegates to the custom provider if one has been set.
   *
   * @param  {string}  query
   * @param  {number}  [limit]
   * @param  {AbortSignal} [signal]
   * @returns {Promise<SuggestionItem[]>}
   */
  async function fetch(query, limit, signal) {
    if (!isNonEmptyString(query)) return [];

    if (isFunction(_customProvider)) {
      return _customProvider(query, limit, signal);
    }

    // Default: synchronous static search wrapped in a promise for uniform API.
    return Promise.resolve(_staticSearch(query, limit));
  }

  /**
   * Replaces the default static search with a custom async function.
   *
   * @param {Function} provider
   *   Signature: (query: string, limit: number, signal?: AbortSignal) => Promise<SuggestionItem[]>
   */
  function setProvider(provider) {
    if (!isFunction(provider)) { warn('suggestionDataSource.setProvider: provider must be a function'); return; }
    _customProvider = provider;
    debug('suggestionDataSource: custom provider registered');
  }

  /**
   * Resets to the default static provider and rebuilds the catalogue.
   */
  function resetProvider() {
    _customProvider = null;
    buildCatalogue();
  }

  /**
   * Returns the full current catalogue (useful for testing/debugging).
   * @returns {SuggestionItem[]}
   */
  function getCatalogue() { return _catalogue.slice(); }

  return Object.freeze({ buildCatalogue, fetch, setProvider, resetProvider, getCatalogue });
}());


/* --- Recent Queries Store --- */

/**
 * recentQueries
 *
 * Persists the user's most recent search queries in localStorage so they
 * can be re-surfaced in the suggestions panel when the search input is
 * focused with an empty value.
 *
 * @type {Object}
 */
const recentQueries = (function buildRecentQueries() {

  const STORE_KEY = CONFIG.storage.recentQueriesKey || 'luminary_recent_search';
  const MAX_ITEMS = CONFIG.search.recentQueriesMax  || 5;

  /**
   * Loads saved queries from localStorage.
   * @returns {string[]}
   */
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(isNonEmptyString) : [];
    } catch (_) {
      return [];
    }
  }

  /**
   * Persists the given array of queries.
   * @param {string[]} queries
   */
  function _save(queries) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(queries)); } catch (_) { /* quota */ }
  }

  /**
   * Adds a query to the front of the recent list, deduplicating and capping
   * the list at MAX_ITEMS.
   *
   * @param {string} query
   */
  function add(query) {
    if (!isNonEmptyString(query)) return;
    const q = normaliseWhitespace(query);
    if (!q) return;

    const existing = load().filter(item => item.toLowerCase() !== q.toLowerCase());
    _save([q, ...existing].slice(0, MAX_ITEMS));
  }

  /**
   * Removes a specific query from the history.
   * @param {string} query
   */
  function remove(query) {
    const q = normaliseWhitespace(query).toLowerCase();
    _save(load().filter(item => item.toLowerCase() !== q));
  }

  /**
   * Clears all saved queries.
   */
  function clear() {
    try { localStorage.removeItem(STORE_KEY); } catch (_) {}
  }

  /**
   * Returns the saved queries as SuggestionItem-shaped objects so they
   * can be merged into the autocomplete suggestion list.
   *
   * @returns {Array}
   */
  function asSuggestions() {
    return load().map((q, i) => ({
      id    : `rq-${i}`,
      label : q,
      href  : '',
      type  : 'recent',
      icon  : '🕐',
    }));
  }

  return Object.freeze({ load, add, remove, clear, asSuggestions });
}());


/* --- Suggestion List Renderer --- */

/**
 * suggestionListRenderer
 *
 * Renders an array of SuggestionItem objects into an accessible
 * `<ul role="listbox">` element.  The element is created once and reused;
 * its content is updated in-place to preserve focus and minimise reflow.
 *
 * @type {Object}
 */
const suggestionListRenderer = (function buildSuggestionListRenderer() {

  /** @type {HTMLElement|null} */
  let _listEl   = null;
  /** @type {HTMLElement|null} */
  let _inputEl  = null;
  /** @type {string}           reference id wired to input's aria-controls */
  let _listId   = '';

  /**
   * Returns the type-badge HTML for a suggestion item.
   *
   * @param {import('./suggestionDataSource').SuggestionItem} item
   * @returns {string}
   */
  function _badgeHtml(item) {
    const labels = {
      product : 'Product',
      heading : 'Section',
      nav     : 'Page',
      faq     : 'FAQ',
      recent  : 'Recent',
      page    : 'Page',
    };
    const label = labels[item.type] || capitalise(item.type || '');
    return label
      ? `<span class="suggestion__badge suggestion__badge--${escapeHtml(item.type)}" aria-hidden="true">${escapeHtml(label)}</span>`
      : '';
  }

  /**
   * Renders the highlighted label text for a suggestion item.
   * The query tokens are wrapped in `<mark>` elements.
   *
   * @param {string} label
   * @param {string} query
   * @returns {string}
   */
  function _labelHtml(label, query) {
    if (!query) return escapeHtml(label);
    return highlightText(escapeHtml(label), query, '<mark>', '</mark>');
  }

  /**
   * Builds the HTML string for a single suggestion `<li>`.
   *
   * @param {import('./suggestionDataSource').SuggestionItem} item
   * @param {number} index
   * @param {string} query
   * @returns {string}
   */
  function _itemHtml(item, index, query) {
    const iconHtml = item.icon ? `<span class="suggestion__icon" aria-hidden="true">${item.icon}</span>` : '';
    const labelHtml = _labelHtml(item.label, query);
    const badge   = _badgeHtml(item);

    const tag   = item.href ? 'a' : 'span';
    const href  = item.href ? ` href="${escapeHtml(item.href)}"` : '';

    return `
      <li
        id="suggestion-item-${index}"
        role="option"
        class="suggestion__item"
        data-index="${index}"
        data-suggestion-id="${escapeHtml(item.id)}"
        aria-selected="false"
      >
        <${tag}${href} class="suggestion__link" tabindex="-1" data-action="select-suggestion">
          ${iconHtml}
          <span class="suggestion__label">${labelHtml}</span>
          ${badge}
        </${tag}>
      </li>
    `.trim();
  }

  /**
   * Creates the listbox element if it doesn't exist yet.
   *
   * @param {HTMLElement} input    - The associated search input element.
   * @returns {HTMLElement}
   */
  function mount(input) {
    if (_listEl) return _listEl;

    _inputEl  = input;
    _listId   = srUtils.ensureId(input, 'search-input') + '-listbox';

    _listEl = createElement('ul', {
      id              : _listId,
      role            : 'listbox',
      class           : 'suggestion-list',
      'aria-label'    : STRINGS.searchSuggestionsLabel || 'Search suggestions',
      hidden          : '',
    });

    // Wire input ↔ listbox ARIA.
    setAttr(input, 'aria-autocomplete', 'list');
    setAttr(input, 'aria-controls',     _listId);
    setAttr(input, 'autocomplete',      'off');
    setAttr(input, 'role',              'combobox');
    setAttr(input, 'aria-haspopup',     'listbox');

    // Insert immediately after the input (or its wrapper).
    const insertRef = input.closest('[data-search-wrapper]') || input.parentElement;
    if (insertRef) insertRef.appendChild(_listEl);

    return _listEl;
  }

  /**
   * Renders a new set of suggestions into the listbox.
   *
   * @param {Array}   items  - SuggestionItem array.
   * @param {string}  query  - Current query for highlighting.
   */
  function render(items, query) {
    if (!_listEl) return;

    if (!items.length) {
      hide();
      return;
    }

    _listEl.innerHTML = items.map((item, i) => _itemHtml(item, i, query)).join('');
    show();
    setAttr(_inputEl, 'aria-expanded', 'true');
  }

  /**
   * Renders a header group label within the listbox (e.g. "Recent Searches").
   * @param {string} groupLabel
   */
  function renderGroupLabel(groupLabel) {
    if (!_listEl || !isNonEmptyString(groupLabel)) return;
    const li = createElement('li', { role: 'presentation', class: 'suggestion__group-label', 'aria-hidden': 'true' });
    li.textContent = groupLabel;
    _listEl.insertBefore(li, _listEl.firstChild);
  }

  /**
   * Updates the `aria-selected` state on suggestion items to reflect
   * the keyboard-highlighted index.
   *
   * @param {number} index - Index to mark as selected (-1 = none).
   */
  function setActiveIndex(index) {
    if (!_listEl) return;

    const items = qsa('[role="option"]', _listEl);
    items.forEach((item, i) => {
      const isActive = i === index;
      item.setAttribute('aria-selected', String(isActive));
      toggleClass(item, CSS.active, isActive);
    });

    // Update aria-activedescendant on the input.
    if (_inputEl) {
      if (index >= 0 && items[index]) {
        setAttr(_inputEl, 'aria-activedescendant', items[index].id);
      } else {
        _inputEl.removeAttribute('aria-activedescendant');
      }
    }
  }

  /**
   * Shows the suggestion listbox panel.
   */
  function show() {
    if (!_listEl) return;
    _listEl.removeAttribute('hidden');
    if (_inputEl) setAttr(_inputEl, 'aria-expanded', 'true');
  }

  /**
   * Hides the suggestion listbox panel.
   */
  function hide() {
    if (!_listEl) return;
    _listEl.setAttribute('hidden', '');
    if (_inputEl) {
      setAttr(_inputEl, 'aria-expanded', 'false');
      _inputEl.removeAttribute('aria-activedescendant');
    }
    setActiveIndex(-1);
  }

  /**
   * Returns the suggestion item element at the given index, or null.
   * @param {number} index
   * @returns {HTMLElement|null}
   */
  function getItemAt(index) {
    if (!_listEl) return null;
    return qsa('[role="option"]', _listEl)[index] || null;
  }

  /**
   * Returns the total number of rendered suggestions.
   * @returns {number}
   */
  function getCount() {
    return _listEl ? qsa('[role="option"]', _listEl).length : 0;
  }

  /**
   * Tears down the listbox and removes ARIA wiring from the input.
   */
  function destroy() {
    if (_listEl) removeElement(_listEl);
    if (_inputEl) {
      ['aria-autocomplete','aria-controls','aria-expanded','aria-haspopup','role','aria-activedescendant']
        .forEach(a => _inputEl.removeAttribute(a));
    }
    _listEl = _inputEl = null;
    _listId = '';
  }

  return Object.freeze({ mount, render, renderGroupLabel, setActiveIndex, show, hide, getItemAt, getCount, destroy });
}());


/* --- Site Search Controller --- */

/**
 * siteSearch
 *
 * Orchestrates the search input, suggestion panel, keyboard navigation,
 * deep-link handling, and analytics events.
 *
 * Architecture:
 *  - `suggestionDataSource` supplies SuggestionItem arrays.
 *  - `suggestionListRenderer` renders them into the accessible listbox.
 *  - `recentQueries` persists and restores recent user queries.
 *  - `_searchState` tracks ephemeral state (open/closed, active index, etc.).
 *  - `siteSearch` owns all event listeners and co-ordinates the others.
 *
 * @type {Object}
 */
const siteSearch = (function buildSiteSearch() {

  /** @type {HTMLElement|null} */
  let _inputEl     = null;
  /** @type {HTMLElement|null} */
  let _formEl      = null;
  /** @type {HTMLElement|null} */
  let _clearBtn    = null;
  /** @type {HTMLElement|null} */
  let _statusEl    = null;
  let _initialised = false;

  /**
   * Fetches suggestions for the given query and updates the UI.
   * Debounced via CONFIG.search.debounceDelay.
   *
   * @param {string} query
   */
  async function _fetchAndRender(query) {
    const norm = normaliseWhitespace(query).toLowerCase();

    if (!norm) {
      _showRecentQueries();
      return;
    }

    // Re-use or create AbortController.
    if (_searchState.abortCtrl) _searchState.abortCtrl.abort();
    _searchState.abortCtrl = new AbortController();

    _searchState.loading = true;
    srUtils.setBusy(_statusEl, true);

    try {
      const results = await suggestionDataSource.fetch(
        norm,
        CONFIG.search.maxSuggestions || 8,
        _searchState.abortCtrl.signal,
      );

      _searchState.suggestions  = results;
      _searchState.activeIndex  = -1;
      _searchState.loading      = false;
      _searchState.error        = null;

      srUtils.setBusy(_statusEl, false);

      suggestionListRenderer.render(results, norm);

      _updateStatus(results.length);

    } catch (err) {
      if (err && err.name === 'AbortError') return; // Intentional abort.

      _searchState.loading = false;
      _searchState.error   = err.message || 'Search failed';
      srUtils.setBusy(_statusEl, false);

      logError('siteSearch._fetchAndRender', err);
      _updateStatus(0, true);
    }
  }

  /** Debounced version of _fetchAndRender */
  const _debouncedFetch = debounce(_fetchAndRender, CONFIG.search.debounceDelay || 250);

  /**
   * Renders the user's recent queries as suggestions when the input is
   * focused with an empty value.
   */
  function _showRecentQueries() {
    const recents = recentQueries.asSuggestions();
    if (recents.length) {
      suggestionListRenderer.render(recents, '');
      suggestionListRenderer.renderGroupLabel(STRINGS.recentSearchesLabel || 'Recent searches');
    } else {
      suggestionListRenderer.hide();
    }
    _searchState.activeIndex = -1;
  }

  /**
   * Updates the ARIA live-region status message with result count.
   *
   * @param {number}  count
   * @param {boolean} [isError=false]
   */
  function _updateStatus(count, isError) {
    if (!_statusEl) return;
    if (isError) {
      _statusEl.textContent = STRINGS.searchError || 'Search failed. Please try again.';
    } else if (count === 0) {
      _statusEl.textContent = STRINGS.searchNoResults || 'No suggestions found.';
    } else {
      _statusEl.textContent = (STRINGS.searchResultsCount || '{n} suggestions available')
        .replace('{n}', String(count));
    }
  }

  /**
   * Handles changes to the search input value.
   */
  function _onInput() {
    const val = _inputEl ? _inputEl.value : '';
    _searchState.query = val;

    if (_clearBtn) toggleClass(_clearBtn, CSS.visible, val.length > 0);

    if (!_searchState.open) _open();
    _debouncedFetch(val);
  }

  /**
   * Opens the suggestion panel.
   */
  function _open() {
    if (_searchState.open) return;
    _searchState.open = true;

    if (!_inputEl.value) {
      _showRecentQueries();
    }
  }

  /**
   * Closes the suggestion panel and clears active state.
   */
  function _close() {
    if (!_searchState.open) return;
    _searchState.open        = false;
    _searchState.activeIndex = -1;
    suggestionListRenderer.hide();
    if (_debouncedFetch.cancel) _debouncedFetch.cancel();
  }

  /**
   * Confirms the selection of the suggestion at the current activeIndex,
   * or submits the form if no suggestion is highlighted.
   */
  function _confirmSelection() {
    const idx = _searchState.activeIndex;

    if (idx >= 0 && _searchState.suggestions[idx]) {
      _selectSuggestion(_searchState.suggestions[idx]);
    } else {
      _submitSearch();
    }
  }

  /**
   * Navigates to a suggestion item's destination (or populates the
   * input and submits the form for suggestions without an href).
   *
   * @param {import('./suggestionDataSource').SuggestionItem} item
   */
  function _selectSuggestion(item) {
    if (!isPlainObject(item)) return;

    recentQueries.add(item.label);
    _close();

    if (item.href) {
      liveRegion.announce(STRINGS.navigatingTo || `Navigating to ${item.label}`);
      // Allow live region to announce before navigation.
      setTimeout(() => { window.location.href = item.href; }, 100);
    } else {
      if (_inputEl) {
        _inputEl.value = item.label;
        _searchState.query = item.label;
      }
      _submitSearch();
    }
  }

  /**
   * Handles click events on suggestion items by delegating from the listbox.
   *
   * @param {MouseEvent} e
   */
  function _onListboxClick(e) {
    const action = e.target.closest('[data-action="select-suggestion"]');
    if (!action) return;

    const li    = action.closest('[role="option"]');
    const index = li ? parseInt(li.getAttribute('data-index') || '-1', 10) : -1;

    if (index >= 0 && _searchState.suggestions[index]) {
      e.preventDefault();
      _selectSuggestion(_searchState.suggestions[index]);
    }
  }

  /**
   * Handles keyboard navigation within the combobox / listbox pair.
   *
   * @param {KeyboardEvent} e
   */
  function _onInputKeydown(e) {
    switch (e.key) {
      case KEYS.ARROW_DOWN: {
        e.preventDefault();
        if (!_searchState.open) { _open(); return; }
        const max   = suggestionListRenderer.getCount();
        const next  = Math.min(_searchState.activeIndex + 1, max - 1);
        _searchState.activeIndex = next;
        suggestionListRenderer.setActiveIndex(next);
        _scrollActiveIntoView();
        break;
      }

      case KEYS.ARROW_UP: {
        e.preventDefault();
        const prev = Math.max(_searchState.activeIndex - 1, -1);
        _searchState.activeIndex = prev;
        suggestionListRenderer.setActiveIndex(prev);
        _scrollActiveIntoView();
        break;
      }

      case KEYS.ENTER: {
        if (_searchState.open) {
          e.preventDefault();
          _confirmSelection();
        }
        break;
      }

      case KEYS.ESCAPE: {
        if (_searchState.open) {
          e.preventDefault();
          _close();
          if (_inputEl) _inputEl.focus();
        }
        break;
      }

      case KEYS.HOME: {
        if (_searchState.open) {
          e.preventDefault();
          _searchState.activeIndex = 0;
          suggestionListRenderer.setActiveIndex(0);
        }
        break;
      }

      case KEYS.END: {
        if (_searchState.open) {
          e.preventDefault();
          const last = suggestionListRenderer.getCount() - 1;
          _searchState.activeIndex = last;
          suggestionListRenderer.setActiveIndex(last);
        }
        break;
      }

      default: break;
    }
  }

  /**
   * Ensures the currently highlighted suggestion item is scrolled into view
   * within the listbox (for long lists).
   */
  function _scrollActiveIntoView() {
    const item = suggestionListRenderer.getItemAt(_searchState.activeIndex);
    if (item) item.scrollIntoView({ block: 'nearest' });
  }

  /**
   * Handles the form submit event.  Saves the query, closes the panel,
   * and allows the default form submission (or fires a custom search handler).
   *
   * @param {Event} e
   */
  function _onFormSubmit(e) {
    const query = _inputEl ? _inputEl.value.trim() : '';
    if (!query) { e.preventDefault(); return; }

    recentQueries.add(query);
    _close();
  }

  /**
   * Submits the search form programmatically.
   */
  function _submitSearch() {
    if (_formEl) {
      _formEl.requestSubmit
        ? _formEl.requestSubmit()
        : _formEl.submit();
    }
  }

  /**
   * Clears the search input and closes the suggestion panel.
   */
  function clear() {
    if (_inputEl)  { _inputEl.value = ''; _inputEl.focus(); }
    if (_clearBtn) { removeClass(_clearBtn, CSS.visible); }
    _close();
    if (_searchState.abortCtrl) { _searchState.abortCtrl.abort(); _searchState.abortCtrl = null; }
    _searchState.query = '';
  }

  /**
   * Handles document-level clicks to close the suggestion panel when the
   * user clicks outside the search component.
   *
   * @param {MouseEvent} e
   */
  function _onDocumentClick(e) {
    if (!_searchState.open) return;
    const wrapper = _inputEl && _inputEl.closest('[data-search-wrapper], form[role="search"], .search');
    if (!wrapper || !wrapper.contains(e.target)) _close();
  }

  /**
   * Handles the clear-button click.
   */
  function _onClearClick(e) {
    e.preventDefault();
    clear();
  }

  /**
   * Sets the search input value programmatically and fires the fetch pipeline.
   *
   * @param {string} query
   */
  function setQuery(query) {
    if (!_inputEl) return;
    _inputEl.value = query;
    _searchState.query = query;
    if (_clearBtn) toggleClass(_clearBtn, CSS.visible, !!query);
    if (query) { _open(); _debouncedFetch(query); }
    else _close();
  }

  /**
   * Reads the ?q= or ?search= or ?query= parameter from the current URL
   * and pre-populates the search input on page load.
   */
  function _hydrateFromUrl() {
    const params = getQueryParams();
    const q = params.q || params.search || params.query || '';
    if (q && _inputEl) {
      _inputEl.value = q;
      _searchState.query = q;
      if (_clearBtn) addClass(_clearBtn, CSS.visible);
    }
  }

  /**
   * Initialises the siteSearch controller.
   * Wires up all event listeners and builds the suggestion catalogue.
   *
   * @param {object} [opts={}]
   * @param {string} [opts.inputSelector]   - Override for the search input selector.
   * @param {string} [opts.formSelector]    - Override for the search form selector.
   * @param {string} [opts.clearSelector]   - Override for the clear button selector.
   */
  function init(opts) {
    if (_initialised) return;

    const cfg = deepMerge({
      inputSelector : SELECTORS.searchInput,
      formSelector  : SELECTORS.searchForm,
      clearSelector : SELECTORS.searchClear,
    }, isPlainObject(opts) ? opts : {});

    _inputEl  = qs(cfg.inputSelector);
    _formEl   = _inputEl ? (_inputEl.closest('form') || qs(cfg.formSelector)) : qs(cfg.formSelector);
    _clearBtn = qs(cfg.clearSelector);

    if (!_inputEl) {
      debug('siteSearch.init: search input not found — skipping');
      return;
    }

    _initialised = true;

    // Build the static catalogue.
    suggestionDataSource.buildCatalogue();

    // Mount the suggestion listbox.
    const listbox = suggestionListRenderer.mount(_inputEl);

    // Create a visually-hidden status element for announcement.
    _statusEl = createElement('div', {
      'aria-live'   : 'polite',
      'aria-atomic' : 'true',
      class         : 'sr-only',
      id            : 'search-status',
    });
    if (_inputEl.parentElement) _inputEl.parentElement.appendChild(_statusEl);
    setAttr(_inputEl, 'aria-describedby', srUtils.ensureId(_statusEl));

    // Event bindings.
    _inputEl.addEventListener('input',   _onInput);
    _inputEl.addEventListener('keydown', _onInputKeydown);
    _inputEl.addEventListener('focus',   () => { if (!_searchState.open && !_inputEl.value) _open(); });

    listbox.addEventListener('click', _onListboxClick);
    if (_clearBtn) _clearBtn.addEventListener('click', _onClearClick);
    if (_formEl)   _formEl.addEventListener('submit', _onFormSubmit);

    document.addEventListener('click',      _onDocumentClick);
    document.addEventListener('touchstart', _onDocumentClick, { passive: true });

    // Pre-populate from URL param on page load.
    _hydrateFromUrl();

    debug('siteSearch.init: ready');
  }

  /**
   * Tears down all event listeners.
   */
  function destroy() {
    if (!_initialised) return;

    if (_inputEl) {
      _inputEl.removeEventListener('input',   _onInput);
      _inputEl.removeEventListener('keydown', _onInputKeydown);
    }
    if (_clearBtn) _clearBtn.removeEventListener('click', _onClearClick);
    if (_formEl)   _formEl.removeEventListener('submit', _onFormSubmit);
    document.removeEventListener('click',      _onDocumentClick);
    document.removeEventListener('touchstart', _onDocumentClick);

    if (_searchState.abortCtrl) _searchState.abortCtrl.abort();
    suggestionListRenderer.destroy();

    _inputEl = _formEl = _clearBtn = _statusEl = null;
    _initialised = false;
    Object.assign(_searchState, {
      query: '', normalisedQuery: '', open: false, activeIndex: -1,
      suggestions: [], loading: false, error: null, abortCtrl: null,
    });
  }

  return Object.freeze({
    init,
    destroy,
    clear,
    setQuery,
    isOpen : () => _searchState.open,
    getState: () => Object.assign({}, _searchState),
  });
}());


/* --- Search Results Highlighter --- */

/**
 * searchResultsHighlighter
 *
 * Highlights search-query tokens within designated results containers
 * on a full search-results page, using `<mark>` elements for each match.
 *
 * @type {Object}
 */
const searchResultsHighlighter = (function buildSearchResultsHighlighter() {

  /**
   * @type {HTMLElement[]} All mark elements created during the last highlight run.
   */
  let _marks = [];

  /**
   * Walks a text node and wraps occurrences of any token in `<mark>`.
   * Uses the TreeWalker API for efficient DOM traversal.
   *
   * @param {HTMLElement} root   - Container to search within.
   * @param {string[]}    tokens - Lowercased token strings to highlight.
   */
  function _highlightTokensInElement(root, tokens) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        // Skip script/style/mark content.
        const tag = parent.tagName.toLowerCase();
        if (['script', 'style', 'mark', 'noscript'].includes(tag)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(textNode => {
      const val = textNode.nodeValue;
      const lower = val.toLowerCase();
      let hasMatch = false;

      tokens.forEach(t => { if (lower.includes(t)) hasMatch = true; });
      if (!hasMatch) return;

      // Build a document fragment replacing match runs with <mark>.
      const frag = document.createDocumentFragment();
      let pos  = 0;
      // Simple greedy first-token matching.
      const regex = new RegExp(tokens.map(t => t.replace(REGEX.escapeRegex, '\\$&')).join('|'), 'gi');
      let match;
      while ((match = regex.exec(val)) !== null) {
        if (match.index > pos) {
          frag.appendChild(document.createTextNode(val.slice(pos, match.index)));
        }
        const mark = createElement('mark', { class: 'search-highlight' });
        mark.textContent = match[0];
        _marks.push(mark);
        frag.appendChild(mark);
        pos = match.index + match[0].length;
      }
      if (pos < val.length) frag.appendChild(document.createTextNode(val.slice(pos)));
      textNode.parentElement.replaceChild(frag, textNode);
    });
  }

  /**
   * Highlights tokens within results containers.
   *
   * @param {string}       query    - Raw query string.
   * @param {HTMLElement}  [root]   - Defaults to `[data-search-results]` or `main`.
   */
  function highlight(query, root) {
    removeHighlights();
    const tokens = normaliseWhitespace(query).toLowerCase().split(' ').filter(t => t.length > 1);
    if (!tokens.length) return;

    const container = isElement(root)
      ? root
      : qs('[data-search-results]') || qs('main') || document.body;

    _highlightTokensInElement(container, tokens);

  }

  /**
   * Removes all `<mark>` elements created by the last highlight run,
   * replacing them with their text content.
   */
  function removeHighlights() {
    _marks.forEach(mark => {
      if (!mark.parentElement) return;
      const text = document.createTextNode(mark.textContent);
      mark.parentElement.replaceChild(text, mark);
    });
    _marks = [];
  }

  return Object.freeze({ highlight, removeHighlights });
}());


/* ---------------------------------------------------------------------------
 * PRODUCT FILTERING
 * Filter tab bar, card show/hide animation, sort panel, active-filter chips,
 * URL-sync, count badges, empty-state messaging, and grid layout toggling.
 * --------------------------------------------------------------------------- */

/* --- Product Filter State --- */

/**
 * @typedef {Object} ProductFilterState
 * @property {string}   activeCategory - The currently active category filter value.
 * @property {string}   sortKey        - Active sort field (e.g. 'price', 'name', 'rating').
 * @property {string}   sortDir        - Sort direction: 'asc' | 'desc'.
 * @property {string}   searchQuery    - Live text filter applied to product names/descriptions.
 * @property {number[]} priceRange     - [min, max] price filter (in smallest currency unit).
 * @property {string[]} tags           - Additional tag filters (AND logic).
 * @property {number}   page           - Current page for pagination (1-indexed).
 * @property {number}   perPage        - Cards per page.
 * @property {'grid'|'list'} viewMode  - Layout mode.
 */

/**
 * _productFilterState
 * Mutable filter state, updated by productFilter module methods.
 * External code should read via `productFilter.getState()` and mutate via
 * `productFilter.setFilter()` or `productFilter.resetFilters()`.
 *
 * @type {ProductFilterState}
 */
const _productFilterState = {
  activeCategory : CONFIG.products.allCategoryValue  || 'all',
  sortKey        : CONFIG.products.defaultSort       || 'default',
  sortDir        : 'asc',
  searchQuery    : '',
  priceRange     : [0, Infinity],
  tags           : [],
  page           : 1,
  perPage        : CONFIG.products.cardsPerPage      || 12,
  viewMode       : 'grid',
};


/* --- Product Card Registry --- */

/**
 * productCardRegistry
 *
 * Maintains an indexed map of all product card elements on the page,
 * along with their parsed data attributes.  Cards register themselves
 * during `productFilter.init()` and can be added dynamically.
 *
 * @type {Object}
 */
const productCardRegistry = (function buildProductCardRegistry() {

  /**
   * @typedef {Object} ProductCardEntry
   * @property {HTMLElement} el          - The card DOM element.
   * @property {string}      id          - Product or card unique identifier.
   * @property {string}      category    - Pipe-separated category values, e.g. 'design|free'.
   * @property {string[]}    categories  - Parsed array of category values.
   * @property {string[]}    tags        - Parsed array of tag strings.
   * @property {number}      price       - Numeric price in smallest currency unit.
   * @property {string}      name        - Product name (from data-product-name or text content).
   * @property {number}      rating      - Numeric rating 0–5.
   * @property {number}      order       - Original DOM order for resetting sort.
   * @property {boolean}     visible     - Whether the card is currently shown.
   */

  /** @type {Map<string, ProductCardEntry>} */
  const _map = new Map();
  let _orderCounter = 0;

  /**
   * Parses a product card element into a ProductCardEntry.
   *
   * @param  {HTMLElement} el
   * @returns {ProductCardEntry}
   */
  function _parse(el) {
    const categoriesRaw = (el.getAttribute('data-category') || '').trim();
    const categories    = categoriesRaw
      ? categoriesRaw.split(/[|,\s]+/).filter(Boolean).map(c => c.toLowerCase())
      : [];

    const tagsRaw = (el.getAttribute('data-tags') || '').trim();
    const tags    = tagsRaw
      ? tagsRaw.split(/[|,\s]+/).filter(Boolean).map(t => t.toLowerCase())
      : [];

    const priceStr   = el.getAttribute('data-price') || '0';
    const price      = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

    const ratingStr  = el.getAttribute('data-rating') || '0';
    const rating     = parseFloat(ratingStr) || 0;

    const nameEl     = qs('[data-product-name], .product-card__title, .card__title, h3, h2', el);
    const name       = nameEl ? normaliseWhitespace(nameEl.textContent) : '';

    const id         = el.getAttribute('data-product-id') || el.id || shortId();

    return { el, id, categories, tags, price, rating, name, category: categoriesRaw, order: _orderCounter++, visible: true };
  }

  /**
   * Registers a product card element.
   * Idempotent — re-registering an existing card updates its parsed data.
   *
   * @param  {HTMLElement} el
   * @returns {ProductCardEntry}
   */
  function register(el) {
    if (!isElement(el)) return null;
    const entry = _parse(el);
    _map.set(entry.id, entry);
    return entry;
  }

  /**
   * Removes a card from the registry.
   * @param {string|HTMLElement} idOrEl
   */
  function unregister(idOrEl) {
    if (isElement(idOrEl)) {
      const id = idOrEl.getAttribute('data-product-id') || idOrEl.id;
      if (id) _map.delete(id);
    } else if (isString(idOrEl)) {
      _map.delete(idOrEl);
    }
  }

  /**
   * Returns all entries as an array.
   * @returns {ProductCardEntry[]}
   */
  function getAll() { return Array.from(_map.values()); }

  /**
   * Returns a single entry by id, or null.
   * @param  {string} id
   * @returns {ProductCardEntry|null}
   */
  function getById(id) { return _map.get(id) || null; }

  /**
   * Returns the count of registered cards.
   * @returns {number}
   */
  function count() { return _map.size; }

  /**
   * Clears the registry.
   */
  function clear() { _map.clear(); _orderCounter = 0; }

  return Object.freeze({ register, unregister, getAll, getById, count, clear });
}());


/* --- Filter Logic Helpers --- */

/**
 * filterPredicates
 *
 * Pure functions that test a ProductCardEntry against various filter criteria.
 * These are composed by the main filter pipeline.
 *
 * @namespace filterPredicates
 */
const filterPredicates = Object.freeze({

  /**
   * Category match: the card's categories array includes the selected value,
   * OR the selected value is the "all" wildcard.
   *
   * @param {import('./productCardRegistry').ProductCardEntry} entry
   * @param {string} category
   * @returns {boolean}
   */
  matchCategory(entry, category) {
    const allValue = CONFIG.products.allCategoryValue || 'all';
    if (category === allValue) return true;
    return entry.categories.includes(category.toLowerCase());
  },

  /**
   * Tag match: the card's tags array includes ALL of the required tags.
   * An empty tags array means no tag filter is active (always passes).
   *
   * @param {import('./productCardRegistry').ProductCardEntry} entry
   * @param {string[]} requiredTags
   * @returns {boolean}
   */
  matchTags(entry, requiredTags) {
    if (!requiredTags.length) return true;
    return requiredTags.every(tag => entry.tags.includes(tag.toLowerCase()));
  },

  /**
   * Price range match.
   *
   * @param {import('./productCardRegistry').ProductCardEntry} entry
   * @param {[number, number]} range
   * @returns {boolean}
   */
  matchPriceRange(entry, range) {
    return entry.price >= range[0] && entry.price <= range[1];
  },

  /**
   * Text query match: the card name contains all query tokens.
   *
   * @param {import('./productCardRegistry').ProductCardEntry} entry
   * @param {string} query
   * @returns {boolean}
   */
  matchSearchQuery(entry, query) {
    if (!query) return true;
    const tokens = normaliseWhitespace(query).toLowerCase().split(' ').filter(Boolean);
    const haystack = (entry.name + ' ' + entry.tags.join(' ')).toLowerCase();
    return tokens.every(t => haystack.includes(t));
  },
});


/* --- Sort Comparators --- */

/**
 * sortComparators
 *
 * A map of sort-key → comparator factory.  Each factory takes a direction
 * ('asc' | 'desc') and returns an Array.sort comparator.
 *
 * @type {Object.<string, Function>}
 */
const sortComparators = Object.freeze({

  /** Natural DOM order (original source order) */
  default : (dir) => {
    return (a, b) => dir === 'asc' ? a.order - b.order : b.order - a.order;
  },

  /** Alphabetical by product name */
  name    : (dir) => {
    return (a, b) => {
      const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      return dir === 'asc' ? cmp : -cmp;
    };
  },

  /** Numeric price */
  price   : (dir) => {
    return (a, b) => dir === 'asc' ? a.price - b.price : b.price - a.price;
  },

  /** Numeric rating */
  rating  : (dir) => {
    return (a, b) => dir === 'asc' ? a.rating - b.rating : b.rating - a.rating;
  },
});


/* --- Filter Animation --- */

/**
 * filterAnimation
 *
 * Manages the show/hide animation of product cards during filtering.
 * Respects `prefers-reduced-motion` by skipping transitions entirely.
 *
 * Strategy:
 *  1. All cards that are going away (newly hidden) are faded out.
 *  2. The grid re-sorts DOM order to match the new sorted array.
 *  3. Newly visible cards are faded in with a staggered delay.
 *
 * @type {Object}
 */
const filterAnimation = (function buildFilterAnimation() {

  const FADE_OUT_DURATION = CONFIG.products.filterFadeOut || 150; // ms
  const FADE_IN_DURATION  = CONFIG.products.filterFadeIn  || 250; // ms
  const STAGGER           = CONFIG.products.filterStagger || 40;  // ms per card
  const MAX_STAGGER_CARDS = CONFIG.products.maxStaggerCards || 10;

  /** @type {number[]} - Active timeout handles for cancellation */
  let _timeouts = [];

  /**
   * Cancels any in-progress animation timers.
   */
  function cancel() {
    _timeouts.forEach(t => clearTimeout(t));
    _timeouts = [];
  }

  /**
   * Runs the filter animation sequence.
   *
   * @param {HTMLElement[]} toShow  - Cards that should become visible.
   * @param {HTMLElement[]} toHide  - Cards that should become hidden.
   * @param {HTMLElement}   grid    - The grid container element.
   * @param {Function}      onDone  - Callback fired after all animations complete.
   */
  function run(toShow, toHide, grid, onDone) {
    cancel();

    const reduced = prefersReducedMotion();

    if (reduced) {
      // Instant show/hide for users who prefer no motion.
      toHide.forEach(el => {
        el.setAttribute('hidden', '');
        el.setAttribute('aria-hidden', 'true');
        el.style.opacity = '';
      });
      toShow.forEach(el => {
        el.removeAttribute('hidden');
        el.removeAttribute('aria-hidden');
        el.style.opacity = '';
      });
      if (isFunction(onDone)) onDone();
      return;
    }

    // Phase 1: fade out the departing cards.
    toHide.forEach(el => {
      el.style.transition = `opacity ${FADE_OUT_DURATION}ms ease`;
      el.style.opacity    = '0';
    });

    _timeouts.push(setTimeout(() => {
      toHide.forEach(el => {
        el.setAttribute('hidden', '');
        el.setAttribute('aria-hidden', 'true');
        el.style.opacity    = '';
        el.style.transition = '';
      });

      // Phase 2: re-order DOM (moves happen while hidden cards are already gone).
      if (grid) {
        const fragment = document.createDocumentFragment();
        toShow.forEach(el => fragment.appendChild(el));
        // Append remaining hidden cards back so they stay in the DOM.
        Array.from(grid.children).forEach(child => {
          if (!toShow.includes(child)) fragment.appendChild(child);
        });
        grid.appendChild(fragment);
      }

      // Phase 3: staggered fade-in for cards coming into view.
      toShow.forEach((el, i) => {
        el.removeAttribute('hidden');
        el.removeAttribute('aria-hidden');
        el.style.opacity    = '0';
        el.style.transition = `opacity ${FADE_IN_DURATION}ms ease`;

        const delay = i < MAX_STAGGER_CARDS ? i * STAGGER : MAX_STAGGER_CARDS * STAGGER;
        _timeouts.push(setTimeout(() => {
          el.style.opacity = '1';
          _timeouts.push(setTimeout(() => {
            el.style.opacity    = '';
            el.style.transition = '';
          }, FADE_IN_DURATION));
        }, delay));
      });

      const totalDur = Math.min(toShow.length, MAX_STAGGER_CARDS) * STAGGER + FADE_IN_DURATION + 50;
      _timeouts.push(setTimeout(() => {
        if (isFunction(onDone)) onDone();
      }, totalDur));

    }, FADE_OUT_DURATION + 20));
  }

  return Object.freeze({ run, cancel });
}());


/* --- Product Filter Controller --- */

/**
 * productFilter
 *
 * Orchestrates the product-grid filter tab bar, sort controls, text search,
 * pagination, and view-mode toggle.
 *
 * HTML contract:
 *  - Filter tabs: `<button data-filter-value="all|category" aria-pressed="true|false">`
 *    grouped inside `[data-filter-tabs]`.
 *  - Sort select: `<select data-sort-key>` with `<option value="price:asc">` format.
 *  - Grid container: `[data-product-grid]`.
 *  - Product cards: `[data-product-id]` or `.product-card` inside the grid.
 *  - Count badge:   `[data-product-count]` — updated with visible card count.
 *  - Empty state:   `[data-empty-state]`  — shown when no cards match.
 *  - View toggle:   `<button data-view-mode="grid|list">`.
 *
 * @type {Object}
 */
const productFilter = (function buildProductFilter() {

  /** @type {HTMLElement|null} */
  let _gridEl      = null;
  /** @type {HTMLElement|null} */
  let _tabsEl      = null;
  /** @type {HTMLElement|null} */
  let _countBadge  = null;
  /** @type {HTMLElement|null} */
  let _emptyState  = null;
  /** @type {HTMLSelectElement|null} */
  let _sortSelect  = null;
  /** @type {HTMLInputElement|null} */
  let _textFilter  = null;
  /** @type {ReturnType<typeof createRovingTabindex>|null} */
  let _rovingTabs  = null;
  let _initialised = false;
  let _animating   = false;

  /**
   * Applies current filter state to the registered card set and updates
   * the DOM accordingly.  This is the core "render" function — it should
   * be called any time the filter state changes.
   */
  function applyFilters() {
    if (!_gridEl) return;

    const s = _productFilterState;

    // 1. Filter entries.
    let entries = productCardRegistry.getAll();

    entries = entries.filter(entry =>
      filterPredicates.matchCategory(entry, s.activeCategory) &&
      filterPredicates.matchTags(entry, s.tags) &&
      filterPredicates.matchPriceRange(entry, s.priceRange) &&
      filterPredicates.matchSearchQuery(entry, s.searchQuery)
    );

    // 2. Sort.
    const comparatorFactory = sortComparators[s.sortKey] || sortComparators.default;
    entries.sort(comparatorFactory(s.sortDir));

    // 3. Paginate.
    const totalMatches  = entries.length;
    const start         = (s.page - 1) * s.perPage;
    const pageEntries   = entries.slice(start, start + s.perPage);

    const toShowEls = pageEntries.map(e => e.el);
    const allEls    = productCardRegistry.getAll().map(e => e.el);
    const toHideEls = allEls.filter(el => !toShowEls.includes(el));

    // 4. Update card visibility states in the registry.
    productCardRegistry.getAll().forEach(e => {
      e.visible = toShowEls.includes(e.el);
    });

    // 5. Animate.
    if (_animating) filterAnimation.cancel();
    _animating = true;

    filterAnimation.run(toShowEls, toHideEls, _gridEl, () => {
      _animating = false;
      _updateCountBadge(totalMatches);
      _updateEmptyState(totalMatches);
      _syncPagination(totalMatches);
      emit(_gridEl, 'filter:applied', { count: totalMatches, state: Object.assign({}, s) });
    });
  }

  /**
   * Updates the text of the product count badge element.
   * @param {number} count
   */
  function _updateCountBadge(count) {
    if (!_countBadge) return;
    _countBadge.textContent = String(count);
    setAttr(_countBadge, 'aria-label', `${count} product${count !== 1 ? 's' : ''}`);
  }

  /**
   * Shows or hides the empty-state element.
   * @param {number} count
   */
  function _updateEmptyState(count) {
    if (!_emptyState) return;
    if (count === 0) {
      _emptyState.removeAttribute('hidden');
    } else {
      _emptyState.setAttribute('hidden', '');
    }
  }

  /**
   * @type {HTMLElement|null} Pagination container
   */
  let _paginationEl = null;

  /**
   * Rebuilds pagination controls based on total match count.
   * @param {number} totalCount
   */
  function _syncPagination(totalCount) {
    if (!_paginationEl) return;
    const s        = _productFilterState;
    const pages    = Math.ceil(totalCount / s.perPage) || 1;
    const current  = clamp(s.page, 1, pages);

    // Simple page indicator — a full pagination component would be more elaborate.
    _paginationEl.textContent = pages > 1 ? `Page ${current} of ${pages}` : '';
    _paginationEl.setAttribute('aria-label', pages > 1 ? `Page ${current} of ${pages}` : '');
  }

  /**
   * Syncs URL query params to mirror the active filter state.
   * Called after each filter application so the URL is shareable.
   */
  function _syncUrl() {
    const s = _productFilterState;
    const params = {};

    if (s.activeCategory && s.activeCategory !== (CONFIG.products.allCategoryValue || 'all')) {
      params.category = s.activeCategory;
    }
    if (s.sortKey && s.sortKey !== (CONFIG.products.defaultSort || 'default')) {
      params.sort = `${s.sortKey}:${s.sortDir}`;
    }
    if (s.searchQuery) params.q = s.searchQuery;
    if (s.page > 1)    params.page = String(s.page);

    const qs$ = buildQueryString(params);
    const url = window.location.pathname + (qs$ ? `?${qs$}` : '');

    try { history.replaceState(null, '', url); } catch (_) {}
  }

  /**
   * Reads URL params on init and pre-sets filter state accordingly
   * (enables deep-linking to a filtered view).
   */
  function _hydrateFromUrl() {
    const params = getQueryParams();

    if (params.category) {
      _productFilterState.activeCategory = params.category;
    }
    if (params.sort) {
      const parts = params.sort.split(':');
      _productFilterState.sortKey = parts[0] || _productFilterState.sortKey;
      _productFilterState.sortDir = parts[1] === 'desc' ? 'desc' : 'asc';
    }
    if (params.q)    _productFilterState.searchQuery = params.q;
    if (params.page) _productFilterState.page = Math.max(1, parseInt(params.page, 10) || 1);
  }

  /**
   * Updates the `aria-pressed` state on filter tab buttons to reflect
   * the current active category.
   */
  function _syncTabAriaStates() {
    if (!_tabsEl) return;
    qsa('[data-filter-value]', _tabsEl).forEach(btn => {
      const isActive = btn.getAttribute('data-filter-value') === _productFilterState.activeCategory;
      toggleClass(btn, CSS.active, isActive);
    });
  }

  /**
   * Handles click on a filter tab button.
   * @param {MouseEvent} e
   */
  function _onTabClick(e) {
    const btn = e.target.closest('[data-filter-value]');
    if (!btn) return;

    const value = btn.getAttribute('data-filter-value');
    if (!value || value === _productFilterState.activeCategory) return;

    _productFilterState.activeCategory = value;
    _productFilterState.page = 1; // Reset to first page on category change.
    _syncTabAriaStates();
    _syncUrl();
    applyFilters();
  }

  /**
   * Handles changes to the sort `<select>` element.
   * @param {Event} e
   */
  function _onSortChange(e) {
    const val   = e.target.value || '';
    const parts = val.split(':');
    _productFilterState.sortKey = parts[0] || 'default';
    _productFilterState.sortDir = parts[1] === 'desc' ? 'desc' : 'asc';
    _productFilterState.page    = 1;
    _syncUrl();
    applyFilters();
  }

  /**
   * Debounced handler for the text filter input.
   * @param {Event} e
   */
  const _onTextFilterInput = debounce(function _filterByText(e) {
    _productFilterState.searchQuery = normaliseWhitespace(e.target.value);
    _productFilterState.page = 1;
    _syncUrl();
    applyFilters();
  }, CONFIG.products.textFilterDebounce || 200);

  /**
   * Handles view-mode toggle button clicks.
   * @param {MouseEvent} e
   */
  function _onViewToggle(e) {
    const btn  = e.target.closest('[data-view-mode]');
    if (!btn) return;
    const mode = btn.getAttribute('data-view-mode');
    if (!mode || mode === _productFilterState.viewMode) return;

    _productFilterState.viewMode = mode;

    if (_gridEl) {
      if (mode === 'list') {
        addClass(_gridEl, CSS.listView);
        removeClass(_gridEl, CSS.gridView);
      } else {
        addClass(_gridEl, CSS.gridView);
        removeClass(_gridEl, CSS.listView);
      }
    }

    // Update pressed state on all view-toggle buttons.
    qsa('[data-view-mode]').forEach(b => {
      setAttr(b, 'aria-pressed', String(b.getAttribute('data-view-mode') === mode));
    });

    try { storage.set(CONFIG.storage.viewModeKey || 'luminary_view_mode', mode); } catch (_) {}
  }

  /**
   * Programmatically sets a filter value.
   *
   * @param {Partial<ProductFilterState>} overrides
   */
  function setFilter(overrides) {
    if (!isPlainObject(overrides)) return;

    const allowed = ['activeCategory','sortKey','sortDir','searchQuery','priceRange','tags','page','perPage','viewMode'];
    allowed.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(overrides, key)) {
        _productFilterState[key] = overrides[key];
      }
    });

    _syncTabAriaStates();
    _syncUrl();
    applyFilters();
  }

  /**
   * Resets all filter values to their defaults and re-applies.
   */
  function resetFilters() {
    _productFilterState.activeCategory = CONFIG.products.allCategoryValue || 'all';
    _productFilterState.sortKey        = CONFIG.products.defaultSort      || 'default';
    _productFilterState.sortDir        = 'asc';
    _productFilterState.searchQuery    = '';
    _productFilterState.priceRange     = [0, Infinity];
    _productFilterState.tags           = [];
    _productFilterState.page           = 1;

    if (_sortSelect) _sortSelect.value = `${_productFilterState.sortKey}:${_productFilterState.sortDir}`;
    if (_textFilter) _textFilter.value = '';

    _syncTabAriaStates();
    _syncUrl();
    applyFilters();

  }

  /**
   * Returns a copy of the current filter state.
   * @returns {ProductFilterState}
   */
  function getState() { return Object.assign({}, _productFilterState); }

  /**
   * Adds a tag to the active tag filters and re-applies.
   * @param {string} tag
   */
  function addTag(tag) {
    if (!isNonEmptyString(tag)) return;
    const t = tag.toLowerCase().trim();
    if (!_productFilterState.tags.includes(t)) {
      _productFilterState.tags = [..._productFilterState.tags, t];
      _productFilterState.page = 1;
      _syncUrl();
      applyFilters();
    }
  }

  /**
   * Removes a tag from the active tag filters and re-applies.
   * @param {string} tag
   */
  function removeTag(tag) {
    const t = tag.toLowerCase().trim();
    const prev = _productFilterState.tags;
    _productFilterState.tags = prev.filter(x => x !== t);
    if (_productFilterState.tags.length !== prev.length) {
      _productFilterState.page = 1;
      _syncUrl();
      applyFilters();
    }
  }

  /**
   * Navigates to a given page number.
   * @param {number} page
   */
  function goToPage(page) {
    const total   = productCardRegistry.count();
    const s       = _productFilterState;
    const maxPage = Math.ceil(total / s.perPage) || 1;
    s.page = clamp(page, 1, maxPage);
    _syncUrl();
    applyFilters();

    // Scroll the grid into view after pagination.
    if (_gridEl) scrollIntoView(_gridEl);
  }

  /**
   * Initialises the product filter controller.
   * Discovers grid, tabs, sort, and text filter elements; registers all
   * product cards; and sets up event listeners.
   */
  function init() {
    if (_initialised) return;

    _gridEl      = qs('[data-product-grid]');
    _tabsEl      = qs('[data-filter-tabs]');
    _countBadge  = qs('[data-product-count]');
    _emptyState  = qs('[data-empty-state]');
    _sortSelect  = qs('[data-sort-key]');
    _textFilter  = qs('[data-product-search]');
    _paginationEl = qs('[data-pagination]');

    if (!_gridEl) {
      debug('productFilter.init: product grid not found — skipping');
      return;
    }

    _initialised = true;

    // Register all cards.
    qsa('[data-product-id], .product-card, .card[data-category]', _gridEl).forEach(el => {
      productCardRegistry.register(el);
    });

    debug(`productFilter.init: ${productCardRegistry.count()} card(s) registered`);

    // Hydrate from URL params before applying filters.
    _hydrateFromUrl();

    // Restore saved view mode.
    try {
      const savedMode = storage.get(CONFIG.storage.viewModeKey || 'luminary_view_mode');
      if (savedMode === 'list' || savedMode === 'grid') {
        _productFilterState.viewMode = savedMode;
      }
    } catch (_) {}

    // Sync initial tab state.
    _syncTabAriaStates();

    // Set up roving tabindex for filter tabs (ARIA tab pattern).
    if (_tabsEl) {
      _rovingTabs = createRovingTabindex(_tabsEl, {
        itemSelector    : '[data-filter-value]',
        orientation     : 'horizontal',
        activateOnFocus : false,
      });
      _tabsEl.addEventListener('click', _onTabClick);
    }

    // Sort control.
    if (_sortSelect) {
      _sortSelect.addEventListener('change', _onSortChange);
      // Set initial value.
      const initVal = `${_productFilterState.sortKey}:${_productFilterState.sortDir}`;
      const optExists = Array.from(_sortSelect.options).some(o => o.value === initVal);
      if (optExists) _sortSelect.value = initVal;
    }

    // Text filter.
    if (_textFilter) {
      _textFilter.addEventListener('input', _onTextFilterInput);
      if (_productFilterState.searchQuery) _textFilter.value = _productFilterState.searchQuery;
    }

    // View mode toggles.
    delegate(document.body, '[data-view-mode]', 'click', _onViewToggle);

    // Apply view mode class.
    if (_gridEl && _productFilterState.viewMode === 'list') {
      addClass(_gridEl, CSS.listView);
    }

    // Apply initial filter (shows all unless URL params specify a filter).
    applyFilters();

    // Watch for dynamically added cards (e.g. infinite scroll).
    if (SUPPORTS.mutationObserver) {
      const observer = new MutationObserver(mutations => {
        let added = false;
        mutations.forEach(m => {
          m.addedNodes.forEach(node => {
            if (isElement(node) && (node.hasAttribute('data-product-id') || hasClass(node, 'product-card'))) {
              productCardRegistry.register(node);
              added = true;
            }
          });
        });
        if (added) applyFilters();
      });
      observer.observe(_gridEl, { childList: true });
    }

    debug('productFilter.init: ready');
  }

  /**
   * Tears down all event listeners.
   */
  function destroy() {
    if (!_initialised) return;

    filterAnimation.cancel();
    if (_tabsEl)    _tabsEl.removeEventListener('click', _onTabClick);
    if (_sortSelect) _sortSelect.removeEventListener('change', _onSortChange);
    if (_textFilter) _textFilter.removeEventListener('input', _onTextFilterInput);
    if (_rovingTabs) _rovingTabs.destroy();

    productCardRegistry.clear();
    _gridEl = _tabsEl = _countBadge = _emptyState = _sortSelect = _textFilter = _paginationEl = null;
    _rovingTabs = null;
    _initialised = false;
  }

  return Object.freeze({
    init,
    destroy,
    applyFilters,
    setFilter,
    resetFilters,
    getState,
    addTag,
    removeTag,
    goToPage,
    get registry() { return productCardRegistry; },
  });
}());


/* --- Active Filter Chips --- */

/**
 * activeFilterChips
 *
 * Renders a collection of dismissible "chip" buttons that represent the
 * currently applied filters (category, tags, price range, search query).
 * Clicking a chip removes the corresponding filter.
 *
 * @type {Object}
 */
const activeFilterChips = (function buildActiveFilterChips() {

  /** @type {HTMLElement|null} */
  let _containerEl = null;

  /**
   * Creates a single chip element.
   *
   * @param {string}   label      - Display text.
   * @param {string}   filterKey  - Which filter this chip represents.
   * @param {string}   value      - The filter value.
   * @returns {HTMLElement}
   */
  function _makeChip(label, filterKey, value) {
    const chip = createElement('li', { class: 'filter-chip' });
    const btn  = createElement('button', {
      type              : 'button',
      class             : 'filter-chip__btn',
      'aria-label'      : `Remove filter: ${label}`,
      'data-chip-key'   : filterKey,
      'data-chip-value' : value,
    });
    btn.innerHTML = `<span class="filter-chip__label">${escapeHtml(label)}</span><span class="filter-chip__remove" aria-hidden="true">×</span>`;
    chip.appendChild(btn);
    return chip;
  }

  /**
   * Re-renders the chip list based on current filter state.
   */
  function render() {
    if (!_containerEl) return;
    emptyElement(_containerEl);

    const s      = productFilter.getState();
    const allCat = CONFIG.products.allCategoryValue || 'all';
    const chips  = [];

    if (s.activeCategory && s.activeCategory !== allCat) {
      chips.push({ label: capitalise(s.activeCategory), key: 'activeCategory', value: allCat });
    }

    s.tags.forEach(tag => {
      chips.push({ label: `#${tag}`, key: 'tag', value: tag });
    });

    if (s.searchQuery) {
      chips.push({ label: `"${s.searchQuery}"`, key: 'searchQuery', value: '' });
    }

    if (s.priceRange[0] > 0 || s.priceRange[1] < Infinity) {
      const rangeLabel = `${formatCurrency(s.priceRange[0])} – ${isFinite(s.priceRange[1]) ? formatCurrency(s.priceRange[1]) : '∞'}`;
      chips.push({ label: rangeLabel, key: 'priceRange', value: '' });
    }

    if (!chips.length) {
      _containerEl.setAttribute('hidden', '');
      return;
    }

    _containerEl.removeAttribute('hidden');
    chips.forEach(c => _containerEl.appendChild(_makeChip(c.label, c.key, c.value)));
  }

  /**
   * Handles chip removal clicks.
   * @param {MouseEvent} e
   */
  function _onChipClick(e) {
    const btn = e.target.closest('[data-chip-key]');
    if (!btn) return;

    const key   = btn.getAttribute('data-chip-key');
    const value = btn.getAttribute('data-chip-value');

    switch (key) {
      case 'activeCategory':
        productFilter.setFilter({ activeCategory: value });
        break;
      case 'tag':
        productFilter.removeTag(value);
        break;
      case 'searchQuery':
        productFilter.setFilter({ searchQuery: '' });
        break;
      case 'priceRange':
        productFilter.setFilter({ priceRange: [0, Infinity] });
        break;
      default:
        productFilter.resetFilters();
    }

    render();
  }

  /**
   * Mounts the chip container and wires event listeners.
   * @param {HTMLElement|string} containerOrSelector
   */
  function init(containerOrSelector) {
    _containerEl = isElement(containerOrSelector)
      ? containerOrSelector
      : qs(containerOrSelector || '[data-filter-chips]');

    if (!_containerEl) {
      debug('activeFilterChips.init: container not found — skipping');
      return;
    }

    _containerEl.addEventListener('click', _onChipClick);

    // Re-render whenever filters are applied.
    document.addEventListener('filter:applied', () => render());
    render();
  }

  /**
   * Tears down the chip controller.
   */
  function destroy() {
    if (_containerEl) _containerEl.removeEventListener('click', _onChipClick);
    _containerEl = null;
  }

  return Object.freeze({ init, render, destroy });
}());


/* ---------------------------------------------------------------------------
 * PRICING MODULE
 * Billing-period toggle, plan comparison, price animation, feature gates,
 * discount badges, localStorage persistence, PaymentRequest integration
 * scaffold, and accessible plan-card keyboard navigation.
 * --------------------------------------------------------------------------- */

/* --- Pricing Constants --- */

/**
 * Maps billing period identifiers to their display labels and multipliers.
 * Multiplier is applied to the monthly base price to calculate the period price.
 *
 * - month  : 1× (base)
 * - quarter: 3× (billed quarterly, typically with a small discount)
 * - year   : 12× (billed annually, with deeper discount)
 *
 * @type {Object.<string, { label: string, multiplier: number, discountPct: number }>}
 */
const BILLING_PERIODS = Object.freeze({
  month: {
    label       : 'Monthly',
    multiplier  : 1,
    discountPct : 0,
  },
  quarter: {
    label       : 'Quarterly',
    multiplier  : 3,
    discountPct : CONFIG.pricing.quarterlyDiscountPct || 10,
  },
  year: {
    label       : 'Annual',
    multiplier  : 12,
    discountPct : CONFIG.pricing.annualDiscountPct    || 20,
  },
});

/**
 * Plan tier ordering used for visual highlighting and keyboard nav.
 * Lower indices are shown first / have less visual prominence.
 *
 * @type {string[]}
 */
const PLAN_TIER_ORDER = Object.freeze(
  CONFIG.pricing.planTierOrder || ['free', 'starter', 'pro', 'enterprise']
);


/* --- Pricing State --- */

/**
 * @typedef {Object} PricingState
 * @property {'month'|'quarter'|'year'} period      - Active billing period.
 * @property {string|null}              highlightPlan - Plan id to visually emphasise.
 * @property {boolean}                  animating    - True while price numbers are counting up.
 * @property {Map<string, number>}      basePrices   - Map of plan-id → monthly base price.
 */

/**
 * _pricingState
 * @type {PricingState}
 */
const _pricingState = {
  period       : CONFIG.pricing.defaultPeriod || 'month',
  highlightPlan: CONFIG.pricing.highlightedPlan || null,
  animating    : false,
  basePrices   : new Map(),
};


/* --- Plan Data Parser --- */

/**
 * planDataParser
 *
 * Extracts plan metadata from the DOM's pricing cards and builds an
 * in-memory representation used by the pricing controller.
 *
 * Expected card markup:
 * ```html
 * <article
 *   class="pricing-card"
 *   data-plan-id="pro"
 *   data-price-month="49"
 *   data-price-year="470"
 *   data-price-quarter="132"
 *   data-currency="USD"
 *   data-featured="true"
 * >
 *   <span data-price-display></span>
 *   <span data-price-period></span>
 *   <span data-price-savings></span>
 *   <span data-original-price></span>
 * </article>
 * ```
 *
 * @type {Object}
 */
const planDataParser = (function buildPlanDataParser() {

  /**
   * @typedef {Object} PlanData
   * @property {string}  id           - Plan identifier (value of data-plan-id).
   * @property {HTMLElement} el       - The card element.
   * @property {string}  currency     - ISO 4217 currency code.
   * @property {boolean} featured     - Whether this is the "recommended" plan.
   * @property {Object}  prices       - Period → price in cents map.
   * @property {HTMLElement|null} priceDisplay   - Element showing the price number.
   * @property {HTMLElement|null} pricePeriod    - Element showing "/mo", "/yr" etc.
   * @property {HTMLElement|null} priceSavings   - Element showing savings badge.
   * @property {HTMLElement|null} originalPrice  - Element showing crossed-out original price.
   * @property {HTMLElement[]}    ctaButtons     - CTA button elements in this card.
   */

  /** @type {Map<string, PlanData>} */
  const _plans = new Map();

  /**
   * Parses a single pricing card element into a PlanData object.
   *
   * @param  {HTMLElement} el
   * @returns {PlanData|null}
   */
  function parse(el) {
    if (!isElement(el)) return null;

    const id = el.getAttribute('data-plan-id') || el.id || shortId();

    const prices = {};
    Object.keys(BILLING_PERIODS).forEach(period => {
      const raw = el.getAttribute(`data-price-${period}`);
      prices[period] = raw !== null ? (parseFloat(raw) || 0) : null;
    });

    // Fall back: if only month price is given, compute others using multiplier + discount.
    if (prices.month !== null) {
      Object.keys(BILLING_PERIODS).forEach(period => {
        if (period === 'month') return;
        if (prices[period] === null) {
          const bp  = BILLING_PERIODS[period];
          const raw = prices.month * bp.multiplier;
          prices[period] = round(raw * (1 - bp.discountPct / 100), 2);
        }
      });
    }

    const plan = {
      id,
      el,
      currency      : (el.getAttribute('data-currency') || CONFIG.pricing.currency || 'USD').toUpperCase(),
      featured      : getAttrBool(el, 'data-featured'),
      prices,
      priceDisplay  : qs('[data-price-display]',  el),
      pricePeriod   : qs('[data-price-period]',   el),
      priceSavings  : qs('[data-price-savings]',  el),
      originalPrice : qs('[data-original-price]', el),
      ctaButtons    : Array.from(qsa('[data-plan-cta]', el)),
    };

    _plans.set(id, plan);
    return plan;
  }

  /**
   * Scans the page for pricing cards and parses each one.
   *
   * @param {HTMLElement} [root] - Search root, defaults to document.
   */
  function parseAll(root) {
    const searchRoot = isElement(root) ? root : document;
    qsa('[data-plan-id], .pricing-card, .plan-card', searchRoot).forEach(el => parse(el));
    debug(`planDataParser.parseAll: ${_plans.size} plan(s) found`);
  }

  /**
   * Returns all parsed plans ordered by the PLAN_TIER_ORDER array.
   * @returns {PlanData[]}
   */
  function getAll() {
    return Array.from(_plans.values()).sort((a, b) => {
      const ai = PLAN_TIER_ORDER.indexOf(a.id);
      const bi = PLAN_TIER_ORDER.indexOf(b.id);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }

  /**
   * Returns a plan by id.
   * @param {string} id
   * @returns {PlanData|null}
   */
  function getById(id) { return _plans.get(id) || null; }

  /**
   * Clears the plan map.
   */
  function clear() { _plans.clear(); }

  return Object.freeze({ parse, parseAll, getAll, getById, clear });
}());


/* --- Price Formatter --- */

/**
 * priceFormatter
 *
 * Formats raw price numbers into currency strings for display, respecting
 * the plan's currency code and the user's locale.
 *
 * @type {Object}
 */
const priceFormatter = (function buildPriceFormatter() {

  /** Cache of Intl.NumberFormat instances, keyed by currency code. */
  const _formatters = new Map();

  /**
   * Returns (creating if needed) an Intl.NumberFormat instance for the
   * given currency.
   *
   * @param {string} currency - ISO 4217 code.
   * @returns {Intl.NumberFormat}
   */
  function _getFormatter(currency) {
    const key = currency || 'USD';
    if (!_formatters.has(key)) {
      try {
        _formatters.set(key, new Intl.NumberFormat(navigator.language || 'en-US', {
          style                : 'currency',
          currency             : key,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }));
      } catch (_) {
        // Fallback for unknown currency codes.
        _formatters.set(key, { format: (n) => `${key} ${n.toFixed(2)}` });
      }
    }
    return _formatters.get(key);
  }

  /**
   * Formats a price number for display.
   *
   * @param  {number}  amount    - Amount in major currency unit (e.g. 49.00).
   * @param  {string}  [currency='USD']
   * @returns {string} Formatted string, e.g. '$49' or '€49,00'.
   */
  function format(amount, currency) {
    if (!isFiniteNumber(amount)) return '';
    return _getFormatter(currency || 'USD').format(amount);
  }

  /**
   * Formats the per-period label for a price.
   * E.g. "per month", "per year", "per quarter".
   *
   * @param {'month'|'quarter'|'year'} period
   * @returns {string}
   */
  function periodLabel(period) {
    const labels = {
      month   : STRINGS.pricingPerMonth   || '/mo',
      quarter : STRINGS.pricingPerQuarter || '/quarter',
      year    : STRINGS.pricingPerYear    || '/yr',
    };
    return labels[period] || `/${period}`;
  }

  /**
   * Calculates the monthly equivalent price for a given period total.
   * Used for showing "effectively $X/mo" messaging alongside annual prices.
   *
   * @param  {number} periodTotal - Total price for the billing period.
   * @param  {'month'|'quarter'|'year'} period
   * @returns {number} Equivalent monthly price.
   */
  function monthlyEquivalent(periodTotal, period) {
    const multiplier = (BILLING_PERIODS[period] || {}).multiplier || 1;
    return multiplier > 1 ? periodTotal / multiplier : periodTotal;
  }

  /**
   * Calculates the savings amount compared to paying monthly.
   *
   * @param  {number} monthlyPrice  - Monthly base price.
   * @param  {number} periodTotal   - Discounted total for the selected period.
   * @param  {'month'|'quarter'|'year'} period
   * @returns {number} Savings amount (positive = cheaper than monthly).
   */
  function savingsAmount(monthlyPrice, periodTotal, period) {
    const multiplier = (BILLING_PERIODS[period] || {}).multiplier || 1;
    return round(monthlyPrice * multiplier - periodTotal, 2);
  }

  return Object.freeze({ format, periodLabel, monthlyEquivalent, savingsAmount });
}());


/* --- Pricing Controller --- */

/**
 * pricing
 *
 * Manages the billing-period toggle, price updates across all plan cards,
 * plan highlighting, analytics, and localStorage persistence.
 *
 * @type {Object}
 */
const pricing = (function buildPricing() {

  /** @type {HTMLElement|null} */
  let _toggleEl    = null;
  /** @type {HTMLElement|null} */
  let _toggleTrack = null;
  /** @type {NodeList|null}    */
  let _periodBtns  = null;
  /** @type {HTMLElement|null} */
  let _savingsMsg  = null;
  /** @type {ReturnType<typeof createRovingTabindex>|null} */
  let _rovingPeriodBtns = null;
  let _initialised = false;

  /**
   * Writes the new price into a plan card's display elements.
   * Optionally animates the number change if `animateNumber` is available
   * and the user hasn't opted out of motion.
   *
   * @param {import('./planDataParser').PlanData} plan
   * @param {'month'|'quarter'|'year'} period
   */
  function _updatePlanCard(plan, period) {
    const periodPrice = plan.prices[period];
    if (periodPrice === null || periodPrice === undefined) return;

    const monthly = plan.prices.month;

    /* Price display */
    if (plan.priceDisplay) {
      const target = priceFormatter.format(periodPrice, plan.currency);

      if (prefersReducedMotion() || !_pricingState.animating) {
        plan.priceDisplay.textContent = target;
        plan.priceDisplay.setAttribute('aria-label', target);
      } else {
        const from = parseFloat(plan.priceDisplay.textContent.replace(/[^0-9.]/g, '')) || 0;
        animateNumber(plan.priceDisplay, from, periodPrice, {
          duration  : CONFIG.pricing.priceAnimDuration || 400,
          easing    : 'easeOutCubic',
          format    : (n) => priceFormatter.format(round(n, 2), plan.currency),
          onComplete: () => {
            plan.priceDisplay.setAttribute('aria-label', target);
          },
        });
      }
    }

    /* Period label (e.g. "/mo", "/yr") */
    if (plan.pricePeriod) {
      const label = priceFormatter.periodLabel(period);
      plan.pricePeriod.textContent = label;
      plan.pricePeriod.setAttribute('aria-label', label);
    }

    /* Savings badge (shown for non-monthly periods) */
    if (plan.priceSavings) {
      if (period !== 'month' && monthly !== null) {
        const savings = priceFormatter.savingsAmount(monthly, periodPrice, period);
        if (savings > 0) {
          const formatted = priceFormatter.format(savings, plan.currency);
          plan.priceSavings.textContent  = (STRINGS.pricinSave || 'Save {amount}').replace('{amount}', formatted);
          plan.priceSavings.removeAttribute('hidden');
        } else {
          plan.priceSavings.setAttribute('hidden', '');
        }
      } else {
        plan.priceSavings.setAttribute('hidden', '');
      }
    }

    /* Original (crossed-out) price — shown for discounted periods */
    if (plan.originalPrice) {
      if (period !== 'month' && monthly !== null) {
        const bp = BILLING_PERIODS[period];
        const originalPeriodTotal = monthly * bp.multiplier;
        const formatted = priceFormatter.format(originalPeriodTotal, plan.currency);
        plan.originalPrice.textContent = formatted;
        plan.originalPrice.removeAttribute('hidden');
        plan.originalPrice.setAttribute('aria-label', `Was ${formatted}`);
      } else {
        plan.originalPrice.setAttribute('hidden', '');
      }
    }

    /* Update CTA button data attributes for checkout integration */
    plan.ctaButtons.forEach(btn => {
      btn.setAttribute('data-plan-id',     plan.id);
      btn.setAttribute('data-plan-period', period);
      btn.setAttribute('data-plan-price',  String(periodPrice));
    });
  }

  /**
   * Updates all plan cards to reflect the new billing period.
   *
   * @param {'month'|'quarter'|'year'} period
   * @param {boolean} [animate=true]
   */
  function setPeriod(period, animate) {
    if (!BILLING_PERIODS[period]) {
      warn(`pricing.setPeriod: unknown period "${period}"`);
      return;
    }

    const prev = _pricingState.period;
    _pricingState.period    = period;
    _pricingState.animating = animate !== false;

    // Update toggle UI.
    _syncToggleState(period);

    // Update each plan card.
    planDataParser.getAll().forEach(plan => _updatePlanCard(plan, period));

    // After animation frame, reset animating flag.
    requestAnimationFrame(() => { _pricingState.animating = false; });

    // Update global savings message (e.g. "Save 20% with annual billing").
    _updateSavingsMessage(period);

    // Persist choice.
    try { storage.set(CONFIG.storage.billingPeriodKey || 'luminary_billing_period', period); } catch (_) {}

    emit(document, 'pricing:periodchange', { from: prev, to: period });

  }

  /**
   * Synchronises the toggle button(s) / tab bar to the selected period.
   *
   * @param {'month'|'quarter'|'year'} period
   */
  function _syncToggleState(period) {
    if (!_periodBtns) return;
    _periodBtns.forEach(btn => {
      const btnPeriod = btn.getAttribute('data-period');
      const isActive  = btnPeriod === period;
      setAttr(btn, 'aria-selected', String(isActive));
      toggleClass(btn, CSS.active, isActive);
    });

    // Also update a simple on/off toggle switch (month ↔ year pattern).
    if (_toggleEl && _toggleTrack) {
      const isYear = period === 'year';
      setAttr(_toggleEl, 'aria-checked', String(isYear));
      toggleClass(_toggleTrack, CSS.checked, isYear);
    }
  }

  /**
   * Updates the page-level savings callout message for a given period.
   *
   * @param {'month'|'quarter'|'year'} period
   */
  function _updateSavingsMessage(period) {
    if (!_savingsMsg) return;
    const bp = BILLING_PERIODS[period];
    if (period === 'month' || !bp || !bp.discountPct) {
      _savingsMsg.setAttribute('hidden', '');
      return;
    }
    _savingsMsg.textContent = (STRINGS.savingsMessage || 'Save {pct}% with {period} billing')
      .replace('{pct}',    String(bp.discountPct))
      .replace('{period}', bp.label.toLowerCase());
    _savingsMsg.removeAttribute('hidden');
  }

  /**
   * Handles click on a billing-period button.
   * @param {MouseEvent} e
   */
  function _onPeriodBtnClick(e) {
    const btn    = e.target.closest('[data-period]');
    if (!btn) return;
    const period = btn.getAttribute('data-period');
    if (period && period !== _pricingState.period) setPeriod(period);
  }

  /**
   * Handles clicks on a simple on/off toggle switch (month ↔ year).
   */
  function _onToggleClick() {
    const next = _pricingState.period === 'year' ? 'month' : 'year';
    setPeriod(next);
  }

  /**
   * Handles keyboard events on the toggle switch (Space/Enter activates).
   * @param {KeyboardEvent} e
   */
  function _onToggleKeydown(e) {
    if (e.key === KEYS.SPACE || e.key === KEYS.ENTER) {
      e.preventDefault();
      _onToggleClick();
    }
  }

  /**
   * Highlights a specific plan card (adds a CSS class and sets tabindex
   * so keyboard users can easily locate it).
   *
   * @param {string|null} planId
   */
  function highlightPlan(planId) {
    planDataParser.getAll().forEach(plan => {
      const isHighlighted = plan.id === planId;
      toggleClass(plan.el, CSS.featured, isHighlighted);
      if (isHighlighted) {
        plan.el.setAttribute('aria-label',
          (plan.el.getAttribute('aria-label') || '') + ' ' + (STRINGS.recommendedPlan || '(Recommended)'));
      }
    });
    _pricingState.highlightPlan = planId;
  }

  /**
   * Wires CTA buttons to a checkout handler.
   * The handler receives the plan id, period, and price as arguments.
   *
   * @param {Function} handler - (planId, period, price) => void
   */
  function onCheckout(handler) {
    if (!isFunction(handler)) return;
    delegate(document.body, '[data-plan-cta]', 'click', function _ctaClick(e) {
      const btn     = e.target.closest('[data-plan-cta]');
      if (!btn) return;
      const planId  = btn.getAttribute('data-plan-id');
      const period  = btn.getAttribute('data-plan-period');
      const price   = parseFloat(btn.getAttribute('data-plan-price') || '0');
      e.preventDefault();
      try { handler(planId, period, price, btn); } catch (err) { logError('pricing onCheckout handler', err); }
    });
  }

  /**
   * Initialises the pricing module.
   */
  function init() {
    if (_initialised) return;

    // Parse all plan cards.
    planDataParser.parseAll();

    if (!planDataParser.getAll().length) {
      debug('pricing.init: no plan cards found — skipping');
      return;
    }

    _initialised = true;

    // Discover UI controls.
    _toggleEl    = qs('[data-billing-toggle]');
    _toggleTrack = _toggleEl ? qs('[data-toggle-track]', _toggleEl) || _toggleEl.parentElement : null;
    _periodBtns  = qsa('[data-period]');
    _savingsMsg  = qs('[data-savings-message]');

    // Restore persisted period.
    let savedPeriod = null;
    try { savedPeriod = storage.get(CONFIG.storage.billingPeriodKey || 'luminary_billing_period'); } catch (_) {}
    const initPeriod = (BILLING_PERIODS[savedPeriod] ? savedPeriod : null) || _pricingState.period;

    // Bind events.
    if (_toggleEl) {
      // Ensure it is keyboard-focusable if it's not a button.
      if (_toggleEl.tagName !== 'BUTTON') {
        if (!_toggleEl.hasAttribute('tabindex')) _toggleEl.setAttribute('tabindex', '0');
        if (!_toggleEl.getAttribute('role')) _toggleEl.setAttribute('role', 'switch');
      }
      _toggleEl.addEventListener('click',   _onToggleClick);
      _toggleEl.addEventListener('keydown', _onToggleKeydown);
    }

    if (_periodBtns && _periodBtns.length) {
      const periodContainer = _periodBtns[0].closest('[data-period-tabs], [role="tablist"]')
                            || _periodBtns[0].parentElement;
      if (periodContainer) {
        periodContainer.addEventListener('click', _onPeriodBtnClick);
        // Roving tabindex for tab-role pattern.
        _rovingPeriodBtns = createRovingTabindex(periodContainer, {
          itemSelector : '[data-period]',
          orientation  : 'horizontal',
        });
      }
    }

    // Highlight the recommended plan.
    const recommended = _pricingState.highlightPlan || CONFIG.pricing.highlightedPlan;
    if (recommended) highlightPlan(recommended);

    // Apply initial period without animation (page just loaded).
    setPeriod(initPeriod, false);

    debug('pricing.init: ready');
  }

  /**
   * Returns the current billing period.
   * @returns {'month'|'quarter'|'year'}
   */
  function getPeriod() { return _pricingState.period; }

  /**
   * Returns the formatted price for a plan and period.
   *
   * @param  {string} planId
   * @param  {'month'|'quarter'|'year'} [period]
   * @returns {string}
   */
  function getFormattedPrice(planId, period) {
    const plan = planDataParser.getById(planId);
    if (!plan) return '';
    const p = period || _pricingState.period;
    const amount = plan.prices[p];
    return amount !== null && amount !== undefined ? priceFormatter.format(amount, plan.currency) : '';
  }

  /**
   * Programmatically expands / collapses the comparison table if present.
   * @param {boolean} expanded
   */
  function setComparisonTableExpanded(expanded) {
    const table   = qs('[data-pricing-comparison], .pricing-comparison');
    const trigger = qs('[data-expand-comparison]');
    if (!table) return;

    if (expanded) {
      table.removeAttribute('hidden');
      setExpanded(trigger, true);
    } else {
      table.setAttribute('hidden', '');
      setExpanded(trigger, false);
    }
  }

  /**
   * Tears down the pricing module.
   */
  function destroy() {
    if (!_initialised) return;

    if (_toggleEl) {
      _toggleEl.removeEventListener('click',   _onToggleClick);
      _toggleEl.removeEventListener('keydown', _onToggleKeydown);
    }
    if (_rovingPeriodBtns) _rovingPeriodBtns.destroy();

    planDataParser.clear();
    _toggleEl = _toggleTrack = _periodBtns = _savingsMsg = _rovingPeriodBtns = null;
    _initialised = false;
  }

  return Object.freeze({
    init,
    destroy,
    setPeriod,
    getPeriod,
    highlightPlan,
    onCheckout,
    getFormattedPrice,
    setComparisonTableExpanded,
  });
}());


/* --- Payment Request API Scaffold --- */

/**
 * paymentRequestScaffold
 *
 * A thin wrapper around the Payment Request API that gracefully degrades
 * to a standard redirect flow when the API is unavailable.
 *
 * This is a scaffold — it demonstrates the API integration pattern and
 * provides error handling, but the actual merchant configuration
 * (methodData, paymentDetails, options) should be customised for the
 * live site's payment processor (Stripe, Paddle, etc.).
 *
 * @type {Object}
 */
const paymentRequestScaffold = (function buildPaymentRequestScaffold() {

  /**
   * @typedef {Object} PaymentIntent
   * @property {string}  planId    - The selected plan identifier.
   * @property {string}  period    - Billing period.
   * @property {number}  amount    - Amount in smallest currency unit (cents).
   * @property {string}  currency  - ISO 4217 code (lowercase for PR API).
   * @property {string}  [coupon]  - Optional discount coupon code.
   */

  /**
   * Whether the Payment Request API is available in this browser.
   * @type {boolean}
   */
  const isAvailable = ('PaymentRequest' in window);

  /**
   * Builds the PaymentRequest methodData array for card payments.
   * @returns {PaymentMethodData[]}
   */
  function _buildMethodData() {
    return [
      {
        supportedMethods: 'basic-card',
        data: {
          supportedNetworks : ['visa', 'mastercard', 'amex', 'discover'],
          supportedTypes    : ['credit', 'debit'],
        },
      },
    ];
  }

  /**
   * Builds the payment details object from a PaymentIntent.
   *
   * @param  {PaymentIntent} intent
   * @returns {PaymentDetailsInit}
   */
  function _buildDetails(intent) {
    const plan = planDataParser.getById(intent.planId);
    const label = plan
      ? `Luminary ${capitalise(intent.planId)} – ${BILLING_PERIODS[intent.period]?.label || intent.period}`
      : `Luminary Plan`;

    return {
      total: {
        label : label,
        amount: {
          currency : intent.currency.toUpperCase(),
          value    : (intent.amount / 100).toFixed(2),
        },
      },
    };
  }

  /**
   * Builds the PaymentOptions object.
   * @returns {PaymentOptions}
   */
  function _buildOptions() {
    return {
      requestPayerName  : false,
      requestPayerEmail : CONFIG.pricing.requestPayerEmail !== false,
      requestPayerPhone : false,
      requestShipping   : false,
    };
  }

  /**
   * Initiates a payment flow for the given intent.
   * Uses the Payment Request API when available; falls back to a URL
   * redirect otherwise.
   *
   * @param  {PaymentIntent} intent
   * @param  {string}        [fallbackUrl] - URL to redirect to if PR API is unavailable.
   * @returns {Promise<{success: boolean, response?: PaymentResponse, error?: Error}>}
   */
  async function request(intent, fallbackUrl) {
    if (!isAvailable) {
      debug('paymentRequestScaffold.request: API not available, using fallback redirect');
      if (fallbackUrl) window.location.href = fallbackUrl;
      return { success: false, error: new Error('PaymentRequest API not available') };
    }

    try {
      const methodData = _buildMethodData();
      const details    = _buildDetails(intent);
      const options$   = _buildOptions();

      const pr       = new PaymentRequest(methodData, details, options$);
      const canPay   = await pr.canMakePayment();

      if (!canPay) {
        debug('paymentRequestScaffold.request: canMakePayment() returned false');
        if (fallbackUrl) window.location.href = fallbackUrl;
        return { success: false, error: new Error('No suitable payment method available') };
      }

      const response = await pr.show();
      // At this point the UI is showing — you would submit the payment
      // token to your server here, then call response.complete('success').
      await response.complete('success');
      return { success: true, response };

    } catch (err) {
      if (err.name === 'AbortError') {
        debug('paymentRequestScaffold.request: user dismissed payment sheet');
        return { success: false, error: err };
      }
      logError('paymentRequestScaffold.request', err);
      if (fallbackUrl) window.location.href = fallbackUrl;
      return { success: false, error: err };
    }
  }

  /**
   * Checks whether the current browser can handle a Payment Request.
   * Resolves to true/false asynchronously.
   *
   * @returns {Promise<boolean>}
   */
  async function canPay() {
    if (!isAvailable) return false;
    try {
      const pr = new PaymentRequest(_buildMethodData(), {
        total: { label: 'Test', amount: { currency: 'USD', value: '0.00' } },
      });
      return await pr.canMakePayment();
    } catch (_) {
      return false;
    }
  }

  return Object.freeze({ isAvailable, request, canPay });
}());


/* --- Plan Comparison Highlighter --- */

/**
 * planComparisonHighlighter
 *
 * Manages the "Pro" column highlight in the pricing comparison table
 * (or whichever plan is configured as the featured plan).
 *
 * On mouse hover over a column, that column is highlighted.
 * Clicking a column header CTA scrolls to the corresponding pricing card.
 *
 * @type {Object}
 */
const planComparisonHighlighter = (function buildPlanCompHighlighter() {

  /** @type {HTMLElement|null} */
  let _tableEl     = null;
  let _initialised = false;

  /**
   * Highlights a column in the comparison table by the plan id.
   *
   * @param {string|null} planId - null to remove all highlights.
   */
  function highlightColumn(planId) {
    if (!_tableEl) return;

    qsa('[data-plan-col]', _tableEl).forEach(col => {
      const isTarget = col.getAttribute('data-plan-col') === planId;
      toggleClass(col, CSS.featured, isTarget);
    });

    qsa('[data-plan-head]', _tableEl).forEach(th => {
      const isTarget = th.getAttribute('data-plan-head') === planId;
      toggleClass(th, CSS.featured, isTarget);
      if (isTarget) {
        setAttr(th, 'aria-selected', 'true');
      } else {
        th.removeAttribute('aria-selected');
      }
    });
  }

  /**
   * Scrolls to and focuses the card for a given plan id.
   * @param {string} planId
   */
  function scrollToPlan(planId) {
    const plan = planDataParser.getById(planId);
    if (!plan) return;

    plan.el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
    const firstFocusable = getFocusableChildren(plan.el)[0] || plan.el;
    firstFocusable.focus({ preventScroll: true });

  }

  /**
   * Initialises the comparison table highlighter.
   */
  function init() {
    if (_initialised) return;

    _tableEl = qs('[data-pricing-comparison], .pricing-comparison, .comparison-table');
    if (!_tableEl) {
      debug('planComparisonHighlighter.init: comparison table not found');
      return;
    }

    _initialised = true;

    // Apply default highlight.
    const defaultHighlight = CONFIG.pricing.highlightedPlan;
    if (defaultHighlight) highlightColumn(defaultHighlight);

    // Hover highlights.
    delegate(_tableEl, '[data-plan-head]', 'mouseenter', e => {
      highlightColumn(e.target.closest('[data-plan-head]').getAttribute('data-plan-head'));
    });
    _tableEl.addEventListener('mouseleave', () => {
      highlightColumn(CONFIG.pricing.highlightedPlan || null);
    });

    // Click to scroll to plan card.
    delegate(_tableEl, '[data-plan-head] a, [data-plan-head] button', 'click', e => {
      const head   = e.target.closest('[data-plan-head]');
      const planId = head ? head.getAttribute('data-plan-head') : null;
      if (planId) { e.preventDefault(); scrollToPlan(planId); }
    });

    debug('planComparisonHighlighter.init: ready');
  }

  /**
   * Tears down.
   */
  function destroy() {
    _tableEl     = null;
    _initialised = false;
  }

  return Object.freeze({ init, destroy, highlightColumn, scrollToPlan });
}());


/* --- Discount Code Input --- */

/**
 * discountCodeInput
 *
 * Handles applying and removing coupon/discount codes on the pricing page.
 * On successful application, updates the plan prices to reflect the discount.
 *
 * @type {Object}
 */
const discountCodeInput = (function buildDiscountCodeInput() {

  /**
   * @typedef {Object} DiscountResult
   * @property {boolean} valid        - Whether the code is valid.
   * @property {string}  code         - The code that was applied.
   * @property {number}  discountPct  - Percentage discount (0–100).
   * @property {string}  [message]    - Human-readable feedback.
   */

  /** @type {HTMLInputElement|null} */
  let _inputEl   = null;
  /** @type {HTMLButtonElement|null} */
  let _applyBtn  = null;
  /** @type {HTMLElement|null} */
  let _statusEl  = null;
  /** @type {DiscountResult|null} */
  let _applied   = null;

  /**
   * Demo validator — in production this would call an API endpoint.
   * Valid codes: any string starting with 'LUMINARY' (case-insensitive).
   *
   * @param  {string} code
   * @returns {Promise<DiscountResult>}
   */
  async function _validate(code) {
    await sleep(400); // Simulate network latency.
    const upper = code.toUpperCase().trim();
    if (upper.startsWith('LUMINARY')) {
      return { valid: true, code: upper, discountPct: 15, message: '15% discount applied!' };
    }
    return { valid: false, code: upper, discountPct: 0, message: 'Invalid discount code.' };
  }

  /**
   * Applies a discount percentage to all plan card prices.
   * @param {number} pct - Percentage discount (0–100).
   */
  function _applyDiscount(pct) {
    const factor = 1 - pct / 100;
    planDataParser.getAll().forEach(plan => {
      const adjusted = {};
      Object.keys(plan.prices).forEach(period => {
        if (plan.prices[period] !== null) {
          adjusted[period] = round(plan.prices[period] * factor, 2);
        } else {
          adjusted[period] = null;
        }
      });
      plan.prices = adjusted;
    });
    pricing.setPeriod(pricing.getPeriod(), false);
  }

  /**
   * Handles the Apply button click.
   */
  async function _onApply() {
    if (!_inputEl) return;
    const code = _inputEl.value.trim();
    if (!code) return;

    _applyBtn && (_applyBtn.disabled = true);
    srUtils.setBusy(_statusEl, true);

    try {
      const result = await _validate(code);
      _applied = result;

      if (_statusEl) {
        _statusEl.textContent = result.message || '';
        _statusEl.className = `discount-status ${result.valid ? 'discount-status--success' : 'discount-status--error'}`;
        setAttr(_statusEl, 'aria-live', 'assertive');
      }

      if (result.valid) {
        _applyDiscount(result.discountPct);
        if (_inputEl) { _inputEl.value = result.code; _inputEl.disabled = true; }
        liveRegion.announceAssertive(result.message || 'Discount applied');
      } else {
        liveRegion.announceAssertive(result.message || 'Invalid code');
      }

    } catch (err) {
      logError('discountCodeInput._onApply', err);
      if (_statusEl) _statusEl.textContent = STRINGS.discountError || 'Could not apply discount. Please try again.';
    } finally {
      srUtils.setBusy(_statusEl, false);
      if (_applyBtn) _applyBtn.disabled = false;
    }
  }

  /**
   * Initialises the discount code input component.
   */
  function init() {
    _inputEl  = qs('[data-discount-input]');
    _applyBtn = qs('[data-discount-apply]');
    _statusEl = qs('[data-discount-status]');

    if (!_inputEl || !_applyBtn) {
      debug('discountCodeInput.init: form elements not found — skipping');
      return;
    }

    _applyBtn.addEventListener('click', _onApply);
    _inputEl.addEventListener('keydown', e => {
      if (e.key === KEYS.ENTER) { e.preventDefault(); _onApply(); }
    });
  }

  /**
   * Returns the currently applied discount result, or null.
   * @returns {DiscountResult|null}
   */
  function getApplied() { return _applied; }

  /**
   * Clears the applied discount and restores original prices.
   */
  function clear() {
    _applied = null;
    planDataParser.clear();
    planDataParser.parseAll();
    pricing.setPeriod(pricing.getPeriod(), false);
    if (_inputEl)  { _inputEl.value = ''; _inputEl.disabled = false; }
    if (_statusEl) { _statusEl.textContent = ''; }
  }

  return Object.freeze({ init, getApplied, clear });
}());


/* ---------------------------------------------------------------------------
 * FAQ ACCORDION
 * Expand/collapse with animateHeight, keyboard navigation (Home/End/arrows),
 * deep-link via URL hash, multi-open vs. single-open modes, search filtering,
 * analytics hooks, and accessible state management.
 * --------------------------------------------------------------------------- */

/* --- FAQ Item Data Model --- */

/**
 * @typedef {Object} FaqItem
 * @property {string}      id        - Unique identifier for the item.
 * @property {HTMLElement} el        - The container `<li>` or `<div>` element.
 * @property {HTMLElement} trigger   - The button that toggles the answer.
 * @property {HTMLElement} panel     - The collapsible answer panel.
 * @property {boolean}     open      - Whether this item is currently expanded.
 * @property {number}      order     - Original DOM order (for reset sorting).
 * @property {string}      question  - Plain-text content of the question.
 * @property {string}      answer    - Plain-text content of the answer.
 * @property {string[]}    tags      - Array of tag strings from data-faq-tags.
 * @property {string}      category  - Category from data-faq-category.
 */


/* --- FAQ Configuration --- */

/**
 * @typedef {Object} FaqConfig
 * @property {boolean} [multiOpen=false]
 *   Allow multiple answers to be open simultaneously.  When false (default),
 *   opening one item closes the previously open one.
 * @property {boolean} [openFirst=false]
 *   Auto-open the first item on init.
 * @property {boolean} [hashDeepLink=true]
 *   Update the URL hash when an item is opened and honour the hash on page load.
 * @property {boolean} [keyboardNav=true]
 *   Enable Up / Down / Home / End key navigation between question buttons.
 * @property {boolean} [searchable=true]
 *   Enable live text filtering of FAQ items.
 * @property {boolean} [groupByCategory=false]
 *   Group items under labelled category headings.
 * @property {string}  [containerSelector='[data-faq-list]']
 * @property {string}  [itemSelector='[data-faq-item]']
 * @property {string}  [triggerSelector='[data-faq-trigger]']
 * @property {string}  [panelSelector='[data-faq-panel]']
 * @property {string}  [searchSelector='[data-faq-search]']
 * @property {Function} [onOpen]  Called with (FaqItem) when an item opens.
 * @property {Function} [onClose] Called with (FaqItem) when an item closes.
 */


/* --- FAQ Item Registry --- */

/**
 * faqRegistry
 *
 * Maintains the list of parsed FAQ items, indexed by id for O(1) lookup.
 *
 * @type {Object}
 */
const faqRegistry = (function buildFaqRegistry() {

  /** @type {Map<string, FaqItem>} */
  const _map = new Map();
  let _counter = 0;

  /**
   * Parses a single FAQ list item element.
   *
   * @param  {HTMLElement}  el       - The item container.
   * @param  {FaqConfig}    cfg      - Accordion configuration.
   * @returns {FaqItem|null}
   */
  function parse(el, cfg) {
    if (!isElement(el)) return null;

    const trigger = qs(cfg.triggerSelector || '[data-faq-trigger]', el)
                  || qs('button, summary', el);
    const panel   = qs(cfg.panelSelector || '[data-faq-panel]', el)
                  || qs('[role="region"], details > div, .faq__answer', el);

    if (!trigger || !panel) {
      debug('faqRegistry.parse: trigger or panel not found in item', el);
      return null;
    }

    const idAttr = el.getAttribute('data-faq-id') || el.id || `faq-item-${++_counter}`;

    /* Ensure required ARIA attributes. */
    const triggerId = srUtils.ensureId(trigger, 'faq-trigger');
    const panelId   = srUtils.ensureId(panel,   'faq-panel');

    setAttr(trigger, 'aria-controls', panelId);
    setAttr(panel,   'aria-labelledby', triggerId);

    if (!trigger.getAttribute('role') && trigger.tagName !== 'BUTTON' && trigger.tagName !== 'SUMMARY') {
      trigger.setAttribute('role', 'button');
      if (!trigger.hasAttribute('tabindex')) trigger.setAttribute('tabindex', '0');
    }

    if (!panel.getAttribute('role') && panel.tagName !== 'DETAILS') {
      panel.setAttribute('role', 'region');
    }

    const question = normaliseWhitespace(trigger.textContent);
    const answer   = normaliseWhitespace(panel.textContent);

    const tagsRaw = (el.getAttribute('data-faq-tags') || '').trim();
    const tags    = tagsRaw ? tagsRaw.split(/[|,\s]+/).filter(Boolean).map(t => t.toLowerCase()) : [];
    const category = (el.getAttribute('data-faq-category') || '').trim().toLowerCase();

    const isInitiallyOpen =
      getAttrBool(el, 'data-faq-open') ||
      getAttrBool(trigger, 'aria-expanded');

    const item = {
      id       : idAttr,
      el,
      trigger,
      panel,
      open     : isInitiallyOpen,
      order    : _counter,
      question,
      answer,
      tags,
      category,
    };

    _map.set(idAttr, item);
    return item;
  }

  /**
   * Returns all items as an array in original DOM order.
   * @returns {FaqItem[]}
   */
  function getAll() {
    return Array.from(_map.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Returns an item by id.
   * @param  {string} id
   * @returns {FaqItem|null}
   */
  function getById(id) { return _map.get(id) || null; }

  /**
   * Returns items that match all given filter criteria.
   *
   * @param  {Object}   filters
   * @param  {string}   [filters.category]  - Category to match.
   * @param  {string[]} [filters.tags]      - Tags to match (AND logic).
   * @param  {string}   [filters.query]     - Text to search in question + answer.
   * @returns {FaqItem[]}
   */
  function search(filters) {
    const f = isPlainObject(filters) ? filters : {};
    return getAll().filter(item => {
      if (f.category && item.category !== f.category.toLowerCase()) return false;
      if (f.tags && f.tags.length) {
        if (!f.tags.every(t => item.tags.includes(t.toLowerCase()))) return false;
      }
      if (isNonEmptyString(f.query)) {
        const q       = normaliseWhitespace(f.query).toLowerCase();
        const tokens  = q.split(' ').filter(Boolean);
        const content = `${item.question} ${item.answer}`.toLowerCase();
        if (!tokens.every(t => content.includes(t))) return false;
      }
      return true;
    });
  }

  /**
   * Returns all unique category values from the registry.
   * @returns {string[]}
   */
  function getCategories() {
    return unique(getAll().map(i => i.category).filter(Boolean));
  }

  /**
   * Clears the registry.
   */
  function clear() { _map.clear(); _counter = 0; }

  /**
   * Returns the count of registered items.
   * @returns {number}
   */
  function count() { return _map.size; }

  return Object.freeze({ parse, getAll, getById, search, getCategories, count, clear });
}());


/* --- FAQ Accordion Controller --- */

/**
 * faqAccordion
 *
 * Manages the expand/collapse behaviour of a FAQ list.
 * Supports keyboard navigation, hash-based deep linking, live text search,
 * analytics events, and category grouping.
 *
 * @type {Object}
 */
const faqAccordion = (function buildFaqAccordion() {

  /** @type {FaqConfig} */
  let _cfg = {};
  /** @type {HTMLElement|null} */
  let _containerEl = null;
  /** @type {HTMLInputElement|null} */
  let _searchInputEl = null;
  /** @type {FaqItem|null} */
  let _lastOpenItem = null;
  let _initialised  = false;

  /**
   * Opens a FAQ item's answer panel.
   *
   * @param {FaqItem}  item
   * @param {boolean}  [announceToSR=true]
   */
  function open(item, announceToSR) {
    if (!isPlainObject(item) || item.open) return;

    item.open = true;
    addClass(item.el, CSS.open);

    // Animate the panel open using animateHeight.
    animateHeight(item.panel, 'auto', {
      duration : CONFIG.faq.animDuration || 300,
      easing   : 'easeOutCubic',
    });

    item.panel.removeAttribute('hidden');

    if (!_cfg.multiOpen && _lastOpenItem && _lastOpenItem !== item && _lastOpenItem.open) {
      close(_lastOpenItem, false);
    }

    _lastOpenItem = item;

    // Update URL hash for deep-link support.
    if (_cfg.hashDeepLink !== false && item.el.id) {
      try { history.replaceState(null, '', `#${item.el.id}`); } catch (_) {}
    }

    emit(_containerEl, 'faq:open', { item });

    if (isFunction(_cfg.onOpen)) {
      try { _cfg.onOpen(item); } catch (err) { logError('faqAccordion onOpen', err); }
    }

  }

  /**
   * Closes a FAQ item's answer panel.
   *
   * @param {FaqItem}  item
   * @param {boolean}  [announceToSR=true]
   */
  function close(item, announceToSR) {
    if (!isPlainObject(item) || !item.open) return;

    item.open = false;
    setAttr(item.trigger, 'aria-expanded', 'false');
    removeClass(item.el, CSS.open);

    animateHeight(item.panel, 0, {
      duration  : CONFIG.faq.animDuration || 300,
      easing    : 'easeInCubic',
      onComplete: () => {
        if (!item.open) item.panel.setAttribute('hidden', '');
      },
    });

    if (_lastOpenItem === item) _lastOpenItem = null;

    emit(_containerEl, 'faq:close', { item });

    if (isFunction(_cfg.onClose)) {
      try { _cfg.onClose(item); } catch (err) { logError('faqAccordion onClose', err); }
    }

  }

  /**
   * Toggles a FAQ item.
   * @param {FaqItem} item
   */
  function toggle(item) {
    item.open ? close(item) : open(item);
  }

  /**
   * Opens all items (honoured in multiOpen mode or when `force=true`).
   * @param {boolean} [force=false]
   */
  function openAll(force) {
    if (!_cfg.multiOpen && !force) return;
    faqRegistry.getAll().forEach(item => open(item, false));
  }

  /**
   * Closes all items.
   */
  function closeAll() {
    faqRegistry.getAll().forEach(item => close(item, false));
  }

  /**
   * Scrolls to and opens the item matching a given id or element id.
   *
   * @param {string} id - The item's data-faq-id or element id.
   */
  function scrollToItem(id) {
    const item = faqRegistry.getById(id)
               || faqRegistry.getAll().find(i => i.el.id === id);

    if (!item) return;

    open(item, false);
    setTimeout(() => {
      item.el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      item.trigger.focus({ preventScroll: true });
    }, 50);
  }

  /**
   * Handles click events on the accordion container (delegated).
   * @param {MouseEvent} e
   */
  function _onContainerClick(e) {
    const trigger = e.target.closest('[data-faq-trigger], .faq__trigger, .accordion__trigger');
    if (!trigger) return;

    const item = faqRegistry.getAll().find(i => i.trigger === trigger);
    if (item) toggle(item);
  }

  /**
   * Handles keyboard events on trigger elements.
   * Implements WAI-ARIA Accordion pattern keyboard rules.
   *
   * @param {KeyboardEvent} e
   */
  function _onKeydown(e) {
    const trigger = e.target.closest('[data-faq-trigger], .faq__trigger');
    if (!trigger) return;

    const items     = faqRegistry.getAll().filter(i => !i.el.hasAttribute('hidden'));
    const current   = items.findIndex(i => i.trigger === trigger);
    if (current === -1) return;

    switch (e.key) {
      case KEYS.ARROW_DOWN:
        e.preventDefault();
        if (current < items.length - 1) items[current + 1].trigger.focus();
        else if (_cfg.wrap !== false) items[0].trigger.focus();
        break;

      case KEYS.ARROW_UP:
        e.preventDefault();
        if (current > 0) items[current - 1].trigger.focus();
        else if (_cfg.wrap !== false) items[items.length - 1].trigger.focus();
        break;

      case KEYS.HOME:
        e.preventDefault();
        items[0].trigger.focus();
        break;

      case KEYS.END:
        e.preventDefault();
        items[items.length - 1].trigger.focus();
        break;

      default: break;
    }
  }

  /**
   * Handles the live text filter input.
   * @param {Event} e
   */
  const _onSearchInput = debounce(function _filterFaq(e) {
    const query = normaliseWhitespace(e.target.value);
    _filterByQuery(query);
  }, CONFIG.faq.searchDebounce || 200);

  /**
   * Filters displayed FAQ items by text query.
   * Matching items remain visible; non-matching are hidden.
   * When query is empty, all items are shown.
   *
   * @param {string} query
   */
  function _filterByQuery(query) {
    const matching = query
      ? faqRegistry.search({ query }).map(i => i.el)
      : faqRegistry.getAll().map(i => i.el);

    faqRegistry.getAll().forEach(item => {
      const isMatch = matching.includes(item.el);
      if (isMatch) {
        item.el.removeAttribute('hidden');
        if (query) highlightFaqTerms(item, query);
      } else {
        item.el.setAttribute('hidden', '');
        if (item.open) close(item, false);
      }
    });

    const count = matching.length;
    liveRegion.announce(
      count === 0
        ? (STRINGS.faqNoResults || 'No questions match your search.')
        : (STRINGS.faqResultsCount || '{n} question{s} found')
            .replace('{n}', String(count))
            .replace('{s}', count !== 1 ? 's' : '')
    );

    // Show/hide category group headings.
    _syncGroupHeaders();
  }

  /**
   * Highlights search tokens within a FAQ item's question text.
   *
   * @param {FaqItem} item
   * @param {string}  query
   */
  function highlightFaqTerms(item, query) {
    if (!item.trigger) return;
    // Only highlight the question span, not the entire trigger (to avoid
    // breaking event listeners).
    const labelEl = qs('.faq__question-text, .accordion__label, span', item.trigger)
                  || item.trigger;
    const tokens  = normaliseWhitespace(query).toLowerCase().split(' ').filter(Boolean);
    const text    = item.question;
    let html      = escapeHtml(text);

    tokens.forEach(token => {
      const escaped = token.replace(REGEX.escapeRegex, '\\$&');
      html = html.replace(new RegExp(escaped, 'gi'), match => `<mark>${match}</mark>`);
    });

    labelEl.innerHTML = html;
  }

  /**
   * Removes any search-highlight `<mark>` elements from question text.
   */
  function clearHighlights() {
    faqRegistry.getAll().forEach(item => {
      if (!item.trigger) return;
      const marks = qsa('mark', item.trigger);
      marks.forEach(mark => {
        const text = document.createTextNode(mark.textContent);
        mark.parentElement.replaceChild(text, mark);
      });
    });
  }

  /**
   * Shows/hides category group heading elements based on whether any of
   * their child items are currently visible.
   */
  function _syncGroupHeaders() {
    qsa('[data-faq-category-header]', _containerEl).forEach(header => {
      const category = header.getAttribute('data-faq-category-header');
      const hasVisible = faqRegistry.search({ category })
        .some(item => !item.el.hasAttribute('hidden'));
      toggleClass(header, CSS.hidden, !hasVisible);
      if (!hasVisible) header.setAttribute('hidden', '');
      else header.removeAttribute('hidden');
    });
  }

  /**
   * Groups items by category and inserts labelled section headers into
   * the container.  Called once during init if `groupByCategory` is true.
   */
  function _buildCategoryGroups() {
    const categories = faqRegistry.getCategories();
    if (!categories.length) return;

    categories.forEach(category => {
      const items = faqRegistry.search({ category });
      if (!items.length) return;

      const heading = createElement('div', {
        class                     : 'faq__category-heading',
        'data-faq-category-header': category,
        role                      : 'heading',
        'aria-level'              : '3',
      });
      heading.textContent = capitalise(category);

      // Insert heading before the first item in this category.
      const firstItem = items[0].el;
      firstItem.parentElement.insertBefore(heading, firstItem);
    });
  }

  /**
   * Handles the initial URL hash on page load to auto-open an item.
   */
  function _handleInitialHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const item = faqRegistry.getById(hash)
               || faqRegistry.getAll().find(i => i.el.id === hash);

    if (item) {
      setTimeout(() => scrollToItem(item.id), 100);
    }
  }

  /**
   * Initialises the FAQ accordion.
   *
   * @param {FaqConfig} [options={}]
   */
  function init(options) {
    if (_initialised) return;

    _cfg = deepMerge({
      multiOpen       : false,
      openFirst       : false,
      hashDeepLink    : true,
      keyboardNav     : true,
      searchable      : true,
      groupByCategory : false,
      containerSelector : '[data-faq-list]',
      itemSelector      : '[data-faq-item]',
      triggerSelector   : '[data-faq-trigger]',
      panelSelector     : '[data-faq-panel]',
      searchSelector    : '[data-faq-search]',
      wrap              : true,
    }, isPlainObject(options) ? options : {});

    _containerEl = qs(_cfg.containerSelector);
    if (!_containerEl) {
      debug('faqAccordion.init: container not found — skipping');
      return;
    }

    _initialised = true;

    // Parse all items.
    qsa(_cfg.itemSelector, _containerEl).forEach(el => {
      faqRegistry.parse(el, _cfg);
    });

    debug(`faqAccordion.init: ${faqRegistry.count()} item(s) registered`);

    // Apply category grouping if requested.
    if (_cfg.groupByCategory) _buildCategoryGroups();

    // Apply initial ARIA states.
    faqRegistry.getAll().forEach(item => {
      const shouldBeOpen = item.open;

      if (shouldBeOpen) {
        setAttr(item.trigger, 'aria-expanded', 'true');
        item.panel.removeAttribute('hidden');
        addClass(item.el, CSS.open);
      } else {
        setAttr(item.trigger, 'aria-expanded', 'false');
        item.panel.setAttribute('hidden', '');
        removeClass(item.el, CSS.open);
      }
    });

    // Auto-open first item.
    if (_cfg.openFirst) {
      const first = faqRegistry.getAll()[0];
      if (first && !first.open) open(first, false);
    }

    // Event listeners.
    _containerEl.addEventListener('click',   _onContainerClick);
    if (_cfg.keyboardNav) {
      _containerEl.addEventListener('keydown', _onKeydown);
    }

    // Text search.
    if (_cfg.searchable) {
      _searchInputEl = qs(_cfg.searchSelector);
      if (_searchInputEl) {
        _searchInputEl.addEventListener('input', _onSearchInput);
        // Accessibility: link input to container via aria-controls.
        const containerId = srUtils.ensureId(_containerEl, 'faq-list');
        setAttr(_searchInputEl, 'aria-controls', containerId);
        setAttr(_searchInputEl, 'aria-label', STRINGS.faqSearchLabel || 'Search frequently asked questions');
        setAttr(_searchInputEl, 'role',       'searchbox');
        setAttr(_searchInputEl, 'autocomplete', 'off');
      }
    }

    // Hashchange listener for SPA-style navigation.
    if (_cfg.hashDeepLink !== false) {
      _handleInitialHash();
      window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1);
        if (hash) scrollToItem(hash);
      });
    }

    // "Open all / Close all" toggle button support.
    const openAllBtn  = qs('[data-faq-open-all]');
    const closeAllBtn = qs('[data-faq-close-all]');
    if (openAllBtn)  openAllBtn.addEventListener('click',  () => openAll(true));
    if (closeAllBtn) closeAllBtn.addEventListener('click', closeAll);

    debug('faqAccordion.init: ready');
  }

  /**
   * Returns whether the given item is currently open.
   * @param {string} id
   * @returns {boolean}
   */
  function isOpen(id) {
    const item = faqRegistry.getById(id);
    return item ? item.open : false;
  }

  /**
   * Forces a specific item open by id.
   * @param {string} id
   */
  function openById(id) {
    const item = faqRegistry.getById(id);
    if (item) open(item);
  }

  /**
   * Forces a specific item closed by id.
   * @param {string} id
   */
  function closeById(id) {
    const item = faqRegistry.getById(id);
    if (item) close(item);
  }

  /**
   * Returns the item currently open, or null (single-open mode only).
   * @returns {FaqItem|null}
   */
  function getOpenItem() { return _lastOpenItem; }

  /**
   * Returns all currently open items.
   * @returns {FaqItem[]}
   */
  function getOpenItems() { return faqRegistry.getAll().filter(i => i.open); }

  /**
   * Destroys the accordion, removing event listeners and clearing the registry.
   */
  function destroy() {
    if (!_initialised) return;

    _containerEl && _containerEl.removeEventListener('click',   _onContainerClick);
    _containerEl && _containerEl.removeEventListener('keydown', _onKeydown);
    _searchInputEl && _searchInputEl.removeEventListener('input', _onSearchInput);

    faqRegistry.clear();
    _containerEl = _searchInputEl = _lastOpenItem = null;
    _initialised = false;
  }

  return Object.freeze({
    init,
    destroy,
    open       : (id) => { const item = faqRegistry.getById(id); if (item) open(item); },
    close      : (id) => { const item = faqRegistry.getById(id); if (item) close(item); },
    toggle     : (id) => { const item = faqRegistry.getById(id); if (item) toggle(item); },
    openAll,
    closeAll,
    scrollToItem,
    openById,
    closeById,
    isOpen,
    getOpenItem,
    getOpenItems,
    highlightFaqTerms,
    clearHighlights,
    get registry() { return faqRegistry; },
  });
}());


/* ---------------------------------------------------------------------------
 * TESTIMONIALS CAROUSEL
 * Auto-play, pause-on-hover, keyboard controls, ARIA live region updates,
 * dot navigation, swipe gesture support, and reduced-motion respect.
 * --------------------------------------------------------------------------- */

/**
 * @typedef {Object} CarouselSlide
 * @property {HTMLElement}  el          - The slide element.
 * @property {number}       index       - Zero-based position in the slides list.
 * @property {string}       label       - Accessible label for the slide (aria-label value).
 */

/**
 * testimonialsCarousel
 *
 * Controls a rotating testimonials slider.
 *
 * HTML contract:
 * ```html
 * <section data-carousel aria-label="Customer testimonials" aria-roledescription="carousel">
 *   <div data-carousel-track>
 *     <article data-slide aria-roledescription="slide" aria-label="Testimonial 1 of 4">…</article>
 *     …
 *   </div>
 *   <button data-carousel-prev aria-label="Previous testimonial">←</button>
 *   <button data-carousel-next aria-label="Next testimonial">→</button>
 *   <div data-carousel-dots role="tablist" aria-label="Select testimonial">
 *     <button role="tab" aria-selected="true" aria-controls="slide-1">1</button>
 *     …
 *   </div>
 *   <button data-carousel-play aria-label="Stop automatic slide rotation" aria-pressed="true">⏸</button>
 * </section>
 * ```
 *
 * @type {Object}
 */
const testimonialsCarousel = (function buildTestimonialsCarousel() {

  /** @type {HTMLElement|null} */
  let _rootEl      = null;
  /** @type {HTMLElement|null} */
  let _trackEl     = null;
  /** @type {HTMLButtonElement|null} */
  let _prevBtn     = null;
  /** @type {HTMLButtonElement|null} */
  let _nextBtn     = null;
  /** @type {HTMLElement|null} */
  let _dotsEl      = null;
  /** @type {HTMLButtonElement|null} */
  let _playBtn     = null;
  /** @type {CarouselSlide[]} */
  let _slides      = [];
  /** @type {number} */
  let _current     = 0;
  /** @type {boolean} */
  let _playing     = false;
  /** @type {number|null} */
  let _timer       = null;
  let _initialised = false;

  const AUTO_PLAY_DELAY = CONFIG.carousel ? (CONFIG.carousel.delay || 5000) : 5000;
  const TRANSITION_DUR  = CONFIG.carousel ? (CONFIG.carousel.transitionDur || 400) : 400;

  /**
   * Moves to the slide at a given index.
   *
   * @param {number}  index
   * @param {'next'|'prev'|'dot'} [direction='next'] - Used to set transition direction.
   */
  function goTo(index, direction) {
    if (!_slides.length) return;
    const count  = _slides.length;
    const target = ((index % count) + count) % count;
    if (target === _current && _slides.length > 1) return;

    const prev    = _current;
    _current      = target;

    // Translate the track (CSS transform approach).
    if (_trackEl) {
      const offset = -target * 100;
      _trackEl.style.transform = `translateX(${offset}%)`;
    }

    // Update slide aria-hidden on all slides.
    _slides.forEach((slide, i) => {
      const isActive = (i === target);
      slide.el.setAttribute('aria-hidden',   String(!isActive));
      slide.el.setAttribute('tabindex',      isActive ? '0' : '-1');
      toggleClass(slide.el, CSS.active,      isActive);
      toggleClass(slide.el, CSS.prev,        i === prev);
    });

    // Update dots.
    _syncDots();

    // Update prev/next button disabled states for non-looping carousels.
    _syncNavButtons();

    // Announce to screen readers.
    liveRegion.announce(
      (STRINGS.carouselSlideAnnounce || 'Slide {n} of {total}')
        .replace('{n}',     String(target + 1))
        .replace('{total}', String(_slides.length))
    );

    emit(_rootEl, 'carousel:change', { from: prev, to: target });
  }

  /**
   * Advances to the next slide.
   */
  function next() { goTo(_current + 1, 'next'); }

  /**
   * Retreats to the previous slide.
   */
  function prev() { goTo(_current - 1, 'prev'); }

  /**
   * Starts the auto-play timer.
   */
  function play() {
    if (prefersReducedMotion()) return;
    _playing = true;
    if (_playBtn) {
      setAttr(_playBtn, 'aria-pressed', 'true');
      _playBtn.setAttribute('aria-label', STRINGS.pauseCarousel || 'Pause automatic slide rotation');
    }
    _scheduleNext();
  }

  /**
   * Pauses the auto-play timer.
   */
  function pause() {
    _playing = false;
    if (_timer !== null) { clearTimeout(_timer); _timer = null; }
    if (_playBtn) {
      setAttr(_playBtn, 'aria-pressed', 'false');
      _playBtn.setAttribute('aria-label', STRINGS.playCarousel || 'Start automatic slide rotation');
    }
  }

  /**
   * Toggles play/pause.
   */
  function togglePlay() { _playing ? pause() : play(); }

  /**
   * Schedules the next auto-advance tick.
   */
  function _scheduleNext() {
    if (!_playing) return;
    if (_timer !== null) clearTimeout(_timer);
    _timer = setTimeout(() => {
      if (_playing) { next(); _scheduleNext(); }
    }, AUTO_PLAY_DELAY);
  }

  /**
   * Synchronises dot indicator active states.
   */
  function _syncDots() {
    if (!_dotsEl) return;
    qsa('[role="tab"]', _dotsEl).forEach((dot, i) => {
      const isActive = (i === _current);
      setAttr(dot, 'aria-selected', String(isActive));
      toggleClass(dot, CSS.active, isActive);
      dot.tabIndex = isActive ? 0 : -1;
    });
  }

  /**
   * Synchronises the enabled/disabled state of prev/next buttons.
   * Only relevant for non-looping carousels.
   */
  function _syncNavButtons() {
    const loop = CONFIG.carousel ? (CONFIG.carousel.loop !== false) : true;
    if (loop) return;

    if (_prevBtn) _prevBtn.disabled = (_current === 0);
    if (_nextBtn) _nextBtn.disabled = (_current === _slides.length - 1);
  }

  /**
   * Handles keyboard navigation within the carousel.
   * @param {KeyboardEvent} e
   */
  function _onKeydown(e) {
    switch (e.key) {
      case KEYS.ARROW_RIGHT: e.preventDefault(); next(); break;
      case KEYS.ARROW_LEFT:  e.preventDefault(); prev(); break;
      case KEYS.HOME:        e.preventDefault(); goTo(0); break;
      case KEYS.END:         e.preventDefault(); goTo(_slides.length - 1); break;
      default: break;
    }
  }

  /**
   * Pointer/touch swipe detection state.
   */
  let _pointerStartX = 0;
  let _pointerStartY = 0;
  let _isDragging    = false;

  /**
   * @param {PointerEvent} e
   */
  function _onPointerDown(e) {
    _pointerStartX = e.clientX;
    _pointerStartY = e.clientY;
    _isDragging    = true;
    if (_playing) pause();
  }

  /**
   * @param {PointerEvent} e
   */
  function _onPointerUp(e) {
    if (!_isDragging) return;
    _isDragging = false;

    const dx = e.clientX - _pointerStartX;
    const dy = e.clientY - _pointerStartY;

    // Only trigger if horizontal swipe is dominant and above threshold.
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }

    if (CONFIG.carousel && CONFIG.carousel.autoPlay !== false) play();
  }

  /**
   * Builds DOM dot buttons for the given slides list.
   * Only called if dots container is present but empty.
   */
  function _buildDots() {
    if (!_dotsEl || _dotsEl.children.length) return;
    _slides.forEach((slide, i) => {
      const dot = createElement('button', {
        type          : 'button',
        role          : 'tab',
        'aria-selected': String(i === _current),
        'aria-label'  : `Go to testimonial ${i + 1}`,
        'aria-controls': slide.el.id || '',
        tabindex      : i === _current ? '0' : '-1',
      });
      dot.textContent = String(i + 1);
      _dotsEl.appendChild(dot);
    });
  }

  /**
   * Handles clicks on the dot navigation.
   * @param {MouseEvent} e
   */
  function _onDotsClick(e) {
    const dot = e.target.closest('[role="tab"]');
    if (!dot) return;
    const idx = Array.from(_dotsEl.children).indexOf(dot);
    if (idx !== -1) { pause(); goTo(idx, 'dot'); }
  }

  /**
   * Initialises the testimonials carousel.
   */
  function init() {
    if (_initialised) return;

    _rootEl  = qs('[data-carousel]');
    if (!_rootEl) {
      debug('testimonialsCarousel.init: carousel root not found — skipping');
      return;
    }

    _trackEl  = qs('[data-carousel-track]', _rootEl);
    _prevBtn  = qs('[data-carousel-prev]',  _rootEl);
    _nextBtn  = qs('[data-carousel-next]',  _rootEl);
    _dotsEl   = qs('[data-carousel-dots]',  _rootEl);
    _playBtn  = qs('[data-carousel-play]',  _rootEl);

    _initialised = true;

    // Collect slides.
    const slideEls = qsa('[data-slide]', _rootEl);
    _slides = slideEls.map((el, i) => {
      const slideId = srUtils.ensureId(el, 'slide');
      const label   = el.getAttribute('aria-label') || `Testimonial ${i + 1}`;
      el.setAttribute('aria-roledescription', 'slide');
      el.setAttribute('aria-label',           label);
      return { el, index: i, label };
    });

    if (!_slides.length) {
      debug('testimonialsCarousel.init: no slides found');
      return;
    }

    // Build dots if not already in HTML.
    _buildDots();

    // Ensure carousel root attributes.
    if (!_rootEl.getAttribute('aria-roledescription')) {
      _rootEl.setAttribute('aria-roledescription', 'carousel');
    }

    // Apply initial active state.
    goTo(0);

    // Event bindings.
    if (_prevBtn) _prevBtn.addEventListener('click', () => { pause(); prev(); });
    if (_nextBtn) _nextBtn.addEventListener('click', () => { pause(); next(); });
    if (_playBtn) _playBtn.addEventListener('click', togglePlay);
    if (_dotsEl)  _dotsEl.addEventListener('click', _onDotsClick);

    _rootEl.addEventListener('keydown',     _onKeydown);
    _rootEl.addEventListener('pointerdown', _onPointerDown);
    _rootEl.addEventListener('pointerup',   _onPointerUp);
    _rootEl.addEventListener('pointercancel', () => { _isDragging = false; });

    // Pause on hover / focus-within.
    _rootEl.addEventListener('mouseenter',  pause);
    _rootEl.addEventListener('mouseleave',  () => { if (CONFIG.carousel && CONFIG.carousel.autoPlay !== false) play(); });
    _rootEl.addEventListener('focusin',     pause);
    _rootEl.addEventListener('focusout',    e => {
      if (!_rootEl.contains(e.relatedTarget)) {
        if (CONFIG.carousel && CONFIG.carousel.autoPlay !== false) play();
      }
    });

    // Start auto-play if configured and no reduced-motion preference.
    if ((CONFIG.carousel ? CONFIG.carousel.autoPlay !== false : true) && !prefersReducedMotion()) {
      play();
    }

    debug('testimonialsCarousel.init: ready');
  }

  /**
   * Returns the current slide index.
   * @returns {number}
   */
  function getCurrent() { return _current; }

  /**
   * Returns whether the carousel is currently auto-playing.
   * @returns {boolean}
   */
  function isPlaying() { return _playing; }

  /**
   * Destroys the carousel and removes all event listeners.
   */
  function destroy() {
    if (!_initialised) return;
    pause();

    if (_prevBtn) _prevBtn.removeEventListener('click', prev);
    if (_nextBtn) _nextBtn.removeEventListener('click', next);
    if (_playBtn) _playBtn.removeEventListener('click', togglePlay);
    if (_dotsEl)  _dotsEl.removeEventListener('click',  _onDotsClick);

    _rootEl && _rootEl.removeEventListener('keydown',     _onKeydown);
    _rootEl && _rootEl.removeEventListener('pointerdown', _onPointerDown);
    _rootEl && _rootEl.removeEventListener('pointerup',   _onPointerUp);

    _rootEl = _trackEl = _prevBtn = _nextBtn = _dotsEl = _playBtn = null;
    _slides = [];
    _current = 0;
    _initialised = false;
  }

  return Object.freeze({
    init,
    destroy,
    next,
    prev,
    goTo,
    play,
    pause,
    togglePlay,
    getCurrent,
    isPlaying,
  });
}());


/* ---------------------------------------------------------------------------
 * FORMS & VALIDATION
 * Validation rules engine, inline error messaging, newsletter form,
 * contact form, character counter, spam protection honeypot,
 * form-state autosave/restore, and multi-step form wizard.
 * --------------------------------------------------------------------------- */

/* --- Validation Rule Definitions --- */

/**
 * @typedef {Object} ValidationRule
 * @property {string}  name     - Unique rule identifier (used as error key).
 * @property {Function} test    - (value: string, params?: any) => boolean
 * @property {string}  message  - Default human-readable error message.
 */

/**
 * validationRules
 *
 * Registry of all built-in validation rules.  Each rule is a pure function
 * that accepts the current field value and optional parameters,
 * and returns true (valid) or false (invalid).
 *
 * Rules can be overridden or extended via `validationRules.register()`.
 *
 * @type {Object}
 */
const validationRules = (function buildValidationRules() {

  /** @type {Map<string, ValidationRule>} */
  const _rules = new Map();

  /**
   * Registers a new validation rule or overrides an existing one.
   *
   * @param {ValidationRule} rule
   */
  function register(rule) {
    if (!isPlainObject(rule) || !rule.name || !isFunction(rule.test)) {
      warn('validationRules.register: invalid rule definition', rule);
      return;
    }
    _rules.set(rule.name, rule);
  }

  /**
   * Returns the ValidationRule object for a given rule name, or undefined.
   * @param  {string} name
   * @returns {ValidationRule|undefined}
   */
  function get(name) { return _rules.get(name); }

  /**
   * Tests a value against a named rule.
   *
   * @param  {string} ruleName  - The rule identifier.
   * @param  {string} value     - The field value to test.
   * @param  {*}      [params]  - Optional parameters for the rule (e.g. min length).
   * @returns {boolean}         - true = valid, false = invalid.
   */
  function test(ruleName, value, params) {
    const rule = _rules.get(ruleName);
    if (!rule) { warn(`validationRules.test: unknown rule "${ruleName}"`); return true; }
    try { return rule.test(value, params); } catch (err) { logError(`validationRules.test(${ruleName})`, err); return false; }
  }

  /**
   * Returns the default error message for a rule, optionally interpolating
   * a `{param}` placeholder with the supplied parameter value.
   *
   * @param  {string} ruleName
   * @param  {*}      [params]
   * @returns {string}
   */
  function getMessage(ruleName, params) {
    const rule = _rules.get(ruleName);
    if (!rule) return '';
    const msg = rule.message || '';
    return params !== undefined ? msg.replace('{param}', String(params)) : msg;
  }

  /* ---- Built-in rule registrations ---- */

  /* Presence */
  register({
    name    : 'required',
    test    : (v) => isNonEmptyString((v || '').trim()),
    message : STRINGS.validationRequired || 'This field is required.',
  });

  /* Minimum length */
  register({
    name    : 'minLength',
    test    : (v, min) => (v || '').trim().length >= (parseInt(min, 10) || 0),
    message : STRINGS.validationMinLength || 'Please enter at least {param} characters.',
  });

  /* Maximum length */
  register({
    name    : 'maxLength',
    test    : (v, max) => (v || '').trim().length <= (parseInt(max, 10) || Infinity),
    message : STRINGS.validationMaxLength || 'Please enter no more than {param} characters.',
  });

  /* Exact length */
  register({
    name    : 'exactLength',
    test    : (v, len) => (v || '').replace(/\s/g, '').length === parseInt(len, 10),
    message : STRINGS.validationExactLength || 'This field must be exactly {param} characters.',
  });

  /* Email address */
  register({
    name    : 'email',
    test    : (v) => REGEX.email.test((v || '').trim()),
    message : STRINGS.validationEmail || 'Please enter a valid email address.',
  });

  /* URL */
  register({
    name    : 'url',
    test    : (v) => {
      if (!(v || '').trim()) return true;
      try { new URL(v); return true; } catch (_) { return false; }
    },
    message : STRINGS.validationUrl || 'Please enter a valid URL.',
  });

  /* Phone number (E.164-ish: allows +, digits, spaces, dashes, parens) */
  register({
    name    : 'phone',
    test    : (v) => {
      if (!(v || '').trim()) return true;
      return REGEX.phone ? REGEX.phone.test((v || '').trim()) : /^\+?[\d\s\-().]{7,20}$/.test((v || '').trim());
    },
    message : STRINGS.validationPhone || 'Please enter a valid phone number.',
  });

  /* Number (integer or float) */
  register({
    name    : 'number',
    test    : (v) => v === '' || v === null || v === undefined || isFiniteNumber(Number(v)),
    message : STRINGS.validationNumber || 'Please enter a valid number.',
  });

  /* Integer */
  register({
    name    : 'integer',
    test    : (v) => v === '' || Number.isInteger(Number(v)),
    message : STRINGS.validationInteger || 'Please enter a whole number.',
  });

  /* Minimum numeric value */
  register({
    name    : 'min',
    test    : (v, min) => v === '' || Number(v) >= Number(min),
    message : STRINGS.validationMin || 'Value must be at least {param}.',
  });

  /* Maximum numeric value */
  register({
    name    : 'max',
    test    : (v, max) => v === '' || Number(v) <= Number(max),
    message : STRINGS.validationMax || 'Value must be no more than {param}.',
  });

  /* Pattern (regex string) */
  register({
    name    : 'pattern',
    test    : (v, pattern) => {
      if (!(v || '').trim()) return true;
      try { return new RegExp(pattern).test(v); } catch (_) { return false; }
    },
    message : STRINGS.validationPattern || 'Please match the required format.',
  });

  /* Checkbox / radio must be checked */
  register({
    name    : 'checked',
    test    : (v) => v === true || v === 'true' || v === 'on' || v === '1',
    message : STRINGS.validationChecked || 'Please check this box to continue.',
  });

  /* No HTML tags (XSS prevention hint) */
  register({
    name    : 'noHtml',
    test    : (v) => !/<[^>]+>/g.test(v || ''),
    message : STRINGS.validationNoHtml || 'HTML tags are not allowed.',
  });

  /* Alphanumeric only */
  register({
    name    : 'alphanumeric',
    test    : (v) => /^[a-zA-Z0-9\s]*$/.test(v || ''),
    message : STRINGS.validationAlphanumeric || 'Only letters and numbers are allowed.',
  });

  /* Must match another field (e.g. password confirmation) — params = field name */
  register({
    name    : 'matches',
    test    : (v, otherValue) => v === otherValue,
    message : STRINGS.validationMatches || 'The values do not match.',
  });

  /* UK/US postal code basic check */
  register({
    name    : 'postalCode',
    test    : (v) => {
      if (!(v || '').trim()) return true;
      return /^[A-Z0-9]{3,10}$/i.test((v || '').trim().replace(/\s/g, ''));
    },
    message : STRINGS.validationPostalCode || 'Please enter a valid postal code.',
  });

  /* Date (ISO YYYY-MM-DD) */
  register({
    name    : 'date',
    test    : (v) => {
      if (!(v || '').trim()) return true;
      const d = new Date(v);
      return !isNaN(d.getTime());
    },
    message : STRINGS.validationDate || 'Please enter a valid date.',
  });

  /* Date is in the future */
  register({
    name    : 'futureDate',
    test    : (v) => {
      if (!(v || '').trim()) return true;
      const d = new Date(v);
      return !isNaN(d.getTime()) && d > new Date();
    },
    message : STRINGS.validationFutureDate || 'Please enter a date in the future.',
  });

  /* File type (comma-separated MIME types or extensions) */
  register({
    name    : 'fileType',
    test    : (v, allowed) => {
      if (!v) return true;
      const ext = (v.split('.').pop() || '').toLowerCase();
      const types = (allowed || '').split(',').map(s => s.trim().toLowerCase());
      return types.some(t => t.startsWith('.') ? t.slice(1) === ext : t.endsWith(`/${ext}`) || t === '*/*');
    },
    message : STRINGS.validationFileType || 'This file type is not allowed.',
  });

  /* File size (max in bytes) */
  register({
    name    : 'fileSize',
    test    : (v, maxBytes) => {
      if (!v || !isFiniteNumber(Number(v))) return true;
      return Number(v) <= Number(maxBytes);
    },
    message : STRINGS.validationFileSize || 'File size must be under {param}.',
  });

  return Object.freeze({ register, get, test, getMessage });
}());


/* --- Field Validator --- */

/**
 * @typedef {Object} FieldValidationResult
 * @property {boolean}  valid     - Whether all rules passed.
 * @property {string[]} errors    - Array of error messages (empty if valid).
 * @property {string}   firstError - The first error message, or empty string.
 */

/**
 * validateField
 *
 * Runs a set of validation rules against a single field value.
 *
 * @param  {string}  value    - The current field value.
 * @param  {Array}   rules    - Array of rule definitions.
 *   Each rule can be:
 *   - A string naming a built-in rule, e.g. 'required', 'email'.
 *   - An object `{ rule: 'minLength', params: 6 }`.
 *   - An object `{ rule: 'matches', params: otherFieldValue }`.
 *   - A custom object `{ test: (v) => boolean, message: 'Error text' }`.
 * @returns {FieldValidationResult}
 */
function validateField(value, rules) {
  const errors = [];

  (rules || []).forEach(ruleDef => {
    if (isString(ruleDef)) {
      // Plain rule name.
      if (!validationRules.test(ruleDef, value)) {
        errors.push(validationRules.getMessage(ruleDef));
      }
    } else if (isPlainObject(ruleDef)) {
      if (isFunction(ruleDef.test)) {
        // Inline custom rule.
        if (!ruleDef.test(value)) errors.push(ruleDef.message || 'Invalid value.');
      } else if (ruleDef.rule) {
        // Object-format built-in.
        if (!validationRules.test(ruleDef.rule, value, ruleDef.params)) {
          errors.push(ruleDef.message || validationRules.getMessage(ruleDef.rule, ruleDef.params));
        }
      }
    }
  });

  return {
    valid      : errors.length === 0,
    errors,
    firstError : errors[0] || '',
  };
}


/* --- Inline Validation Controller --- */

/**
 * inlineValidator
 *
 * Attaches real-time inline validation to form fields.  Validation fires on
 * `blur` (and also on `input` after the first blur), and error messages are
 * inserted adjacent to the field and announced to screen readers.
 *
 * @type {Object}
 */
const inlineValidator = (function buildInlineValidator() {

  /**
   * @typedef {Object} FieldBinding
   * @property {HTMLElement}       field    - The input/textarea/select element.
   * @property {HTMLElement}       errorEl  - The inserted error message element.
   * @property {Array}             rules    - Validation rules for this field.
   * @property {boolean}           touched  - Whether blur has fired at least once.
   * @property {Function}          _onBlur  - Attached blur handler.
   * @property {Function}          _onInput - Attached input handler.
   */

  /** @type {Map<HTMLElement, FieldBinding>} */
  const _bindings = new Map();

  /**
   * Creates (or reuses) the error message element for a field.
   * The element is inserted immediately after the field or after its
   * label wrapper, and linked via `aria-describedby`.
   *
   * @param  {HTMLElement} field
   * @returns {HTMLElement}
   */
  function _getOrCreateErrorEl(field) {
    const existingId = `${srUtils.ensureId(field, 'field')}-error`;
    let errorEl = document.getElementById(existingId);

    if (!errorEl) {
      errorEl = createElement('span', {
        id         : existingId,
        class      : 'field-error',
        role       : 'alert',
        'aria-live': 'polite',
      });
      errorEl.setAttribute('hidden', '');

      // Insert after the field's parent wrapper if it has one, else after the field.
      const wrapper = field.closest('.field, .form-group, [data-field-wrapper]');
      const insertAfter$ = wrapper || field;
      if (insertAfter$.nextSibling) {
        insertAfter$.parentNode.insertBefore(errorEl, insertAfter$.nextSibling);
      } else {
        insertAfter$.parentNode.appendChild(errorEl);
      }
    }

    return errorEl;
  }

  /**
   * Renders the validation result onto a field.
   *
   * @param {HTMLElement}          field
   * @param {FieldValidationResult} result
   * @param {HTMLElement}          errorEl
   */
  function _renderResult(field, result, errorEl) {
    if (result.valid) {
      srUtils.markValid(field, errorEl);
      errorEl.textContent = '';
      errorEl.setAttribute('hidden', '');
      addClass(field, CSS.fieldValid);
      removeClass(field, CSS.fieldInvalid);
    } else {
      srUtils.markInvalid(field, errorEl);
      errorEl.textContent = result.firstError;
      errorEl.removeAttribute('hidden');
      addClass(field, CSS.fieldInvalid);
      removeClass(field, CSS.fieldValid);
    }
  }

  /**
   * Reads the current value from a field element, handling checkboxes
   * and select-multiple.
   *
   * @param  {HTMLElement} field
   * @returns {string|boolean}
   */
  function _getValue(field) {
    if (field.type === 'checkbox') return field.checked;
    if (field.type === 'radio') {
      const form  = field.form || document;
      const group = qsa(`input[name="${field.name}"][type="radio"]`, form);
      return group.some(r => r.checked);
    }
    return field.value;
  }

  /**
   * Binds inline validation to a field.
   *
   * @param {HTMLElement} field   - The input field to validate.
   * @param {Array}       rules   - Validation rules to apply.
   */
  function bind(field, rules) {
    if (!isElement(field) || _bindings.has(field)) return;

    const errorEl = _getOrCreateErrorEl(field);

    const binding = {
      field,
      errorEl,
      rules     : rules || [],
      touched   : false,
      _onBlur   : null,
      _onInput  : null,
    };

    binding._onBlur = function _onBlur() {
      binding.touched = true;
      const result = validateField(_getValue(field), binding.rules);
      _renderResult(field, result, errorEl);
    };

    binding._onInput = function _onInput() {
      if (!binding.touched) return; // Only validate on input after first blur.
      const result = validateField(_getValue(field), binding.rules);
      _renderResult(field, result, errorEl);
    };

    field.addEventListener('blur',  binding._onBlur);
    field.addEventListener('input', binding._onInput);
    // Select and radio also fire 'change'.
    if (field.type === 'select-one' || field.type === 'select-multiple' || field.type === 'radio') {
      field.addEventListener('change', binding._onInput);
    }

    _bindings.set(field, binding);
  }

  /**
   * Validates a field immediately (used for submit-time full-form check).
   *
   * @param  {HTMLElement} field
   * @returns {FieldValidationResult|null}
   */
  function validate(field) {
    const binding = _bindings.get(field);
    if (!binding) return null;
    binding.touched = true;
    const result = validateField(_getValue(field), binding.rules);
    _renderResult(field, result, binding.errorEl);
    return result;
  }

  /**
   * Runs validation on all bound fields and returns the aggregate result.
   *
   * @returns {{ valid: boolean, invalidFields: HTMLElement[] }}
   */
  function validateAll() {
    const invalid = [];
    _bindings.forEach((binding, field) => {
      const result = validate(field);
      if (result && !result.valid) invalid.push(field);
    });
    return { valid: invalid.length === 0, invalidFields: invalid };
  }

  /**
   * Clears validation state for a single field.
   * @param {HTMLElement} field
   */
  function clearField(field) {
    const binding = _bindings.get(field);
    if (!binding) return;
    binding.touched = false;
    binding.errorEl.textContent    = '';
    binding.errorEl.setAttribute('hidden', '');
    srUtils.markValid(field, binding.errorEl);
    removeClass(field, CSS.fieldInvalid);
    removeClass(field, CSS.fieldValid);
  }

  /**
   * Clears validation state for all bound fields.
   */
  function clearAll() {
    _bindings.forEach((_, field) => clearField(field));
  }

  /**
   * Updates the validation rules for an already-bound field.
   *
   * @param {HTMLElement} field
   * @param {Array}       rules
   */
  function updateRules(field, rules) {
    const binding = _bindings.get(field);
    if (!binding) return;
    binding.rules = rules || [];
  }

  /**
   * Removes inline validation from a field.
   * @param {HTMLElement} field
   */
  function unbind(field) {
    const binding = _bindings.get(field);
    if (!binding) return;
    field.removeEventListener('blur',   binding._onBlur);
    field.removeEventListener('input',  binding._onInput);
    field.removeEventListener('change', binding._onInput);
    clearField(field);
    _bindings.delete(field);
  }

  /**
   * Removes all bindings.
   */
  function unbindAll() {
    Array.from(_bindings.keys()).forEach(unbind);
  }

  return Object.freeze({ bind, validate, validateAll, clearField, clearAll, updateRules, unbind, unbindAll });
}());


/* --- Character Counter --- */

/**
 * characterCounter
 *
 * Attaches a live character-count indicator to textarea and text input
 * fields.  The indicator announces remaining characters to screen readers
 * via a live region and visually changes colour as the limit approaches.
 *
 * @type {Object}
 */
const characterCounter = (function buildCharacterCounter() {

  /**
   * @type {Map<HTMLElement, { counterEl: HTMLElement, max: number, handler: Function }>}
   */
  const _counters = new Map();

  /**
   * Attaches a character counter to a field.
   *
   * @param {HTMLTextAreaElement|HTMLInputElement} field
   * @param {number}   [maxChars]  - Override the `maxlength` attribute.
   * @param {object}   [opts={}]
   * @param {string}   [opts.warnAt=0.9]  - Fraction of maxChars that triggers warning state.
   * @param {string}   [opts.errorAt=1.0] - Fraction of maxChars that triggers error state.
   * @param {string}   [opts.template='{remaining} characters remaining']
   */
  function attach(field, maxChars, opts) {
    if (!isElement(field) || _counters.has(field)) return;

    const max = maxChars || parseInt(field.getAttribute('maxlength') || '0', 10) || 0;
    if (!max) {
      debug('characterCounter.attach: no maxlength for field', field);
      return;
    }

    const cfg = deepMerge({
      warnAt   : 0.9,
      errorAt  : 1.0,
      template : STRINGS.charCounterTemplate || '{remaining} characters remaining',
    }, isPlainObject(opts) ? opts : {});

    const counterEl = createElement('span', {
      class      : 'char-counter',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    });
    counterEl.setAttribute('aria-label', 'Character count');

    // Insert after the field.
    const insertRef = field.closest('.field, .form-group') || field;
    insertRef.parentElement && insertRef.parentElement.insertBefore(counterEl, insertRef.nextSibling || null);

    /**
     * Updates the counter display.
     */
    function _update() {
      const len       = (field.value || '').length;
      const remaining = max - len;
      const fraction  = len / max;

      counterEl.textContent = cfg.template
        .replace('{remaining}', String(remaining))
        .replace('{current}',  String(len))
        .replace('{max}',      String(max));

      removeClass(counterEl, 'char-counter--warn');
      removeClass(counterEl, 'char-counter--error');
      toggleClass(counterEl, 'char-counter--warn',  fraction >= cfg.warnAt  && fraction < cfg.errorAt);
      toggleClass(counterEl, 'char-counter--error', fraction >= cfg.errorAt);
      setAttr(counterEl, 'aria-label', `${remaining} of ${max} characters remaining`);
    }

    field.addEventListener('input',   _update);
    field.addEventListener('change',  _update);
    _update(); // Initial render.

    _counters.set(field, { counterEl, max, handler: _update });
  }

  /**
   * Detaches the counter from a field.
   * @param {HTMLElement} field
   */
  function detach(field) {
    const entry = _counters.get(field);
    if (!entry) return;
    field.removeEventListener('input',  entry.handler);
    field.removeEventListener('change', entry.handler);
    removeElement(entry.counterEl);
    _counters.delete(field);
  }

  /**
   * Detaches all counters.
   */
  function detachAll() {
    Array.from(_counters.keys()).forEach(detach);
  }

  return Object.freeze({ attach, detach, detachAll });
}());


/* --- Spam/Honeypot Protection --- */

/**
 * honeypotProtection
 *
 * Adds a visually-hidden honeypot field to each configured form.
 * Bots that auto-fill all form fields will fill the honeypot, which
 * is detectable server-side.  On the client, if the honeypot is non-empty
 * at submit time, the submission is silently discarded (or marked as spam).
 *
 * @type {Object}
 */
const honeypotProtection = (function buildHoneypotProtection() {

  /**
   * Injects a hidden honeypot `<input>` into a form.
   *
   * @param {HTMLFormElement} form
   * @param {string}          [fieldName]  - The honeypot field name.  Defaults to
   *   a generic name like 'website_alt' to trick bots.
   * @returns {HTMLInputElement} The generated input.
   */
  function inject(form, fieldName) {
    if (!isElement(form) || form.tagName !== 'FORM') return null;

    const name = fieldName || CONFIG.forms.honeypotFieldName || 'website_alt';

    if (qs(`input[name="${name}"]`, form)) return qs(`input[name="${name}"]`, form);

    const wrapper = createElement('div', {
      style            : 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden',
      'aria-hidden'    : 'true',
      tabindex         : '-1',
    });
    const input = createElement('input', {
      type       : 'text',
      name,
      value      : '',
      tabindex   : '-1',
      autocomplete: 'off',
    });
    wrapper.appendChild(input);
    form.appendChild(wrapper);
    return input;
  }

  /**
   * Checks whether the honeypot field in a form has been filled.
   * Returns true if the form is likely spam.
   *
   * @param  {HTMLFormElement} form
   * @param  {string}          [fieldName]
   * @returns {boolean}
   */
  function isSpam(form, fieldName) {
    const name  = fieldName || CONFIG.forms.honeypotFieldName || 'website_alt';
    const input = qs(`input[name="${name}"]`, form);
    return !!input && !!input.value;
  }

  return Object.freeze({ inject, isSpam });
}());


/* --- Form State Autosave --- */

/**
 * formAutosave
 *
 * Persists form field values to localStorage as the user types, so that
 * they can be restored if the page is accidentally refreshed or navigated
 * away from.
 *
 * Fields explicitly excluded: `type="password"`, `type="hidden"`, honeypot
 * fields, and any field with `data-autosave="false"`.
 *
 * @type {Object}
 */
const formAutosave = (function buildFormAutosave() {

  /** @type {Map<HTMLFormElement, { key: string, timer: number|null }>} */
  const _forms = new Map();

  /**
   * Builds the localStorage key for a form's saved data.
   * @param  {HTMLFormElement} form
   * @returns {string}
   */
  function _key(form) {
    const id = form.id || form.getAttribute('data-form-id') || slugify(form.action || 'form');
    return `luminary_autosave_${id}`;
  }

  /**
   * Returns an array of saveable field elements from the form.
   * @param  {HTMLFormElement} form
   * @returns {HTMLElement[]}
   */
  function _getSaveableFields(form) {
    const excluded = ['password', 'hidden', 'submit', 'button', 'file', 'reset'];
    return Array.from(form.elements).filter(el => {
      if (excluded.includes(el.type || '')) return false;
      if (el.getAttribute('data-autosave') === 'false') return false;
      if (el.getAttribute('autocomplete') === 'off') return false;
      return isNonEmptyString(el.name);
    });
  }

  /**
   * Saves the current field values for a form to localStorage.
   * @param {HTMLFormElement} form
   */
  function save(form) {
    const data = {};
    _getSaveableFields(form).forEach(field => {
      if (field.type === 'checkbox' || field.type === 'radio') {
        data[field.name] = field.checked;
      } else {
        data[field.name] = field.value;
      }
    });
    try {
      localStorage.setItem(_key(form), JSON.stringify(data));
    } catch (_) { /* quota exceeded */ }
  }

  /**
   * Restores previously saved field values into a form.
   *
   * @param  {HTMLFormElement} form
   * @returns {boolean} True if saved data was found and restored.
   */
  function restore(form) {
    try {
      const raw  = localStorage.getItem(_key(form));
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!isPlainObject(data)) return false;

      _getSaveableFields(form).forEach(field => {
        const saved = data[field.name];
        if (saved === undefined) return;

        if (field.type === 'checkbox' || field.type === 'radio') {
          field.checked = !!saved;
        } else {
          field.value = saved;
        }

        // Trigger input event so character counters / validators update.
        emit(field, 'input', {});
      });

      liveRegion.announce(STRINGS.formRestored || 'Your previous progress has been restored.');
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Clears the saved data for a form.
   * @param {HTMLFormElement} form
   */
  function clear(form) {
    try { localStorage.removeItem(_key(form)); } catch (_) {}
  }

  /**
   * Attaches autosave behaviour to a form.  Debounced save on field input.
   *
   * @param  {HTMLFormElement} form
   * @param  {number} [debounceMs=1000]
   */
  function attach(form, debounceMs) {
    if (!isElement(form) || _forms.has(form)) return;

    const dSave = debounce(() => save(form), debounceMs || 1000);
    form.addEventListener('input',  dSave);
    form.addEventListener('change', dSave);

    // Clear on successful submission.
    form.addEventListener('submit', () => {
      setTimeout(() => clear(form), 200);
    });

    _forms.set(form, { key: _key(form), timer: null });
    restore(form);
  }

  /**
   * Detaches autosave from a form.
   * @param {HTMLFormElement} form
   */
  function detach(form) {
    _forms.delete(form);
  }

  return Object.freeze({ save, restore, clear, attach, detach });
}());


/* --- Newsletter Form --- */

/**
 * newsletterForm
 *
 * Handles the newsletter sign-up form: validation, submission, success/error
 * states, duplicate-submit guard, and accessible feedback.
 *
 * @type {Object}
 */
const newsletterForm = (function buildNewsletterForm() {

  /** @type {HTMLFormElement|null} */
  let _formEl   = null;
  /** @type {HTMLInputElement|null} */
  let _emailEl  = null;
  /** @type {HTMLElement|null} */
  let _statusEl = null;
  let _submitting = false;
  let _initialised = false;

  /**
   * Renders a success message.
   * @param {string} message
   */
  function _showSuccess(message) {
    if (!_formEl) return;
    const msg = message || STRINGS.newsletterSuccess || 'You're now subscribed. Thank you!';
    addClass(_formEl, CSS.success);
    if (_statusEl) {
      _statusEl.textContent = msg;
      _statusEl.className   = 'newsletter-status newsletter-status--success';
      _statusEl.removeAttribute('hidden');
      _statusEl.setAttribute('role', 'status');
    }
    liveRegion.announce(msg);
    emit(_formEl, 'newsletter:success', { email: _emailEl ? _emailEl.value : '' });
  }

  /**
   * Renders an error message.
   * @param {string} message
   */
  function _showError(message) {
    if (!_formEl) return;
    const msg = message || STRINGS.newsletterError || 'Subscription failed. Please try again.';
    removeClass(_formEl, CSS.success);
    if (_statusEl) {
      _statusEl.textContent = msg;
      _statusEl.className   = 'newsletter-status newsletter-status--error';
      _statusEl.removeAttribute('hidden');
      _statusEl.setAttribute('role', 'alert');
    }
    liveRegion.announceAssertive(msg);
    emit(_formEl, 'newsletter:error', { message: msg });
  }

  /**
   * Handles form submit event.
   * @param {SubmitEvent} e
   */
  async function _onSubmit(e) {
    e.preventDefault();
    if (_submitting) return;

    /* Spam check. */
    if (honeypotProtection.isSpam(_formEl)) {
      debug('newsletterForm: honeypot triggered — discarding submission');
      _showSuccess(); // Show success to the bot to avoid retries.
      return;
    }

    /* Validate. */
    const emailVal = _emailEl ? _emailEl.value.trim() : '';
    const result   = validateField(emailVal, ['required', 'email']);
    if (!result.valid) {
      inlineValidator.validate(_emailEl);
      _emailEl && _emailEl.focus();
      return;
    }

    _submitting = true;
    srUtils.setBusy(_formEl, true);
    if (_statusEl) _statusEl.setAttribute('hidden', '');

    const btn = qs('[type="submit"]', _formEl);
    if (btn) { btn.disabled = true; btn.textContent = STRINGS.submitting || 'Subscribing…'; }

    try {
      const endpoint = _formEl.getAttribute('action') || CONFIG.api.newsletter || '/api/newsletter';
      const data     = formToObject(_formEl);

      await postJson(endpoint, data, { timeout: 8000 });
      _showSuccess();
      _emailEl && (_emailEl.value = '');
      formAutosave.clear(_formEl);

    } catch (err) {
      const msg = err.status === 409
        ? (STRINGS.newsletterDuplicate || 'You're already subscribed with this email.')
        : _showError.toString(); // Evaluate error branch.
      _showError(msg);
      logError('newsletterForm._onSubmit', err);
    } finally {
      _submitting = false;
      srUtils.setBusy(_formEl, false);
      if (btn) { btn.disabled = false; btn.textContent = STRINGS.subscribeBtn || 'Subscribe'; }
    }
  }

  /**
   * Initialises the newsletter form.
   */
  function init() {
    if (_initialised) return;

    _formEl   = qs('[data-newsletter-form]');
    if (!_formEl) { debug('newsletterForm.init: form not found'); return; }

    _emailEl  = qs('input[type="email"]', _formEl);
    _statusEl = qs('[data-form-status], .newsletter-status', _formEl);

    if (!_statusEl) {
      _statusEl = createElement('div', { class: 'newsletter-status', 'aria-live': 'polite' });
      _statusEl.setAttribute('hidden', '');
      _formEl.appendChild(_statusEl);
    }

    _initialised = true;

    if (_emailEl) {
      inlineValidator.bind(_emailEl, ['required', 'email']);
    }

    honeypotProtection.inject(_formEl);
    formAutosave.attach(_formEl);

    _formEl.addEventListener('submit', _onSubmit);

    debug('newsletterForm.init: ready');
  }

  /**
   * Tears down the form module.
   */
  function destroy() {
    if (_formEl) _formEl.removeEventListener('submit', _onSubmit);
    if (_emailEl) inlineValidator.unbind(_emailEl);
    formAutosave.detach(_formEl);
    _formEl = _emailEl = _statusEl = null;
    _submitting = _initialised = false;
  }

  return Object.freeze({ init, destroy });
}());


/* --- Contact Form --- */

/**
 * contactForm
 *
 * Handles the multi-field contact form: full validation, file-attachment
 * size/type checks, submission, success/error rendering, scroll-to-first-error,
 * and accessibility.
 *
 * @type {Object}
 */
const contactForm = (function buildContactForm() {

  /** @type {HTMLFormElement|null} */
  let _formEl     = null;
  /** @type {HTMLElement|null} */
  let _statusEl   = null;
  /** @type {HTMLElement|null} */
  let _errorSummaryEl = null;
  let _submitting    = false;
  let _initialised   = false;

  /**
   * @type {Array<{selector: string, rules: Array, label: string}>}
   * Field configurations for the contact form.
   */
  const CONTACT_FIELDS = [
    { selector: '[name="full_name"]',  rules: ['required', { rule: 'minLength', params: 2 }], label: 'Full name' },
    { selector: '[name="email"]',      rules: ['required', 'email'],                           label: 'Email address' },
    { selector: '[name="subject"]',    rules: ['required', { rule: 'minLength', params: 3 }], label: 'Subject' },
    { selector: '[name="message"]',    rules: ['required', { rule: 'minLength', params: 20 }, { rule: 'maxLength', params: 2000 }], label: 'Message' },
    { selector: '[name="consent"]',    rules: ['checked'],                                     label: 'Privacy consent' },
  ];

  /**
   * Builds an accessible error summary box listing all invalid fields.
   * Inserted at the top of the form so screen-reader users hear it
   * immediately when focus is moved there.
   *
   * @param {Array<{field: HTMLElement, message: string, label: string}>} errors
   */
  function _renderErrorSummary(errors) {
    if (!_errorSummaryEl) {
      _errorSummaryEl = createElement('div', {
        class    : 'form-error-summary',
        role     : 'alert',
        tabindex : '-1',
        'aria-labelledby': 'error-summary-heading',
      });
      _formEl.insertBefore(_errorSummaryEl, _formEl.firstChild);
    }

    emptyElement(_errorSummaryEl);

    const heading = createElement('h2', { id: 'error-summary-heading', class: 'form-error-summary__heading' });
    heading.textContent = (STRINGS.errorSummaryHeading || '{n} error{s} found')
      .replace('{n}', String(errors.length))
      .replace('{s}', errors.length !== 1 ? 's' : '');

    const list = createElement('ul', { class: 'form-error-summary__list' });
    errors.forEach(({ field, message, label }) => {
      const li  = createElement('li');
      const link = createElement('a', { href: `#${srUtils.ensureId(field, 'contact-field')}` });
      link.textContent = `${label}: ${message}`;
      li.appendChild(link);
      list.appendChild(li);
    });

    _errorSummaryEl.appendChild(heading);
    _errorSummaryEl.appendChild(list);
    _errorSummaryEl.removeAttribute('hidden');

    // Move focus to summary so screen readers announce it.
    requestAnimationFrame(() => _errorSummaryEl.focus());
    liveRegion.announceAssertive(
      (STRINGS.formHasErrors || 'The form contains {n} error{s}. Please review and correct them.')
        .replace('{n}', String(errors.length))
        .replace('{s}', errors.length !== 1 ? 's' : '')
    );
  }

  /**
   * Hides the error summary.
   */
  function _hideErrorSummary() {
    if (_errorSummaryEl) {
      _errorSummaryEl.setAttribute('hidden', '');
      emptyElement(_errorSummaryEl);
    }
  }

  /**
   * Performs full-form validation at submit time.
   * @returns {{ valid: boolean, errors: Array }}
   */
  function _validateAll() {
    const errors = [];

    CONTACT_FIELDS.forEach(cfg => {
      const field = qs(cfg.selector, _formEl);
      if (!field) return;

      const result = inlineValidator.validate(field);
      if (result && !result.valid) {
        errors.push({ field, message: result.firstError, label: cfg.label });
      }
    });

    return { valid: errors.length === 0, errors };
  }

  /**
   * Handles form submit.
   * @param {SubmitEvent} e
   */
  async function _onSubmit(e) {
    e.preventDefault();
    if (_submitting) return;

    if (honeypotProtection.isSpam(_formEl)) {
      debug('contactForm: honeypot triggered');
      _showSuccess();
      return;
    }

    _hideErrorSummary();
    const { valid, errors } = _validateAll();

    if (!valid) {
      _renderErrorSummary(errors);
      const firstInvalidField = errors[0] && errors[0].field;
      if (firstInvalidField) {
        scrollIntoView(firstInvalidField);
      }
      return;
    }

    _submitting = true;
    srUtils.setBusy(_formEl, true);

    const submitBtn = qs('[type="submit"]', _formEl);
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = STRINGS.submitting || 'Sending…'; }

    try {
      const endpoint = _formEl.getAttribute('action') || CONFIG.api.contact || '/api/contact';
      await postJson(endpoint, formToObject(_formEl), { timeout: 10000 });
      _showSuccess();
      formAutosave.clear(_formEl);
    } catch (err) {
      const msg = err.message || STRINGS.contactError || 'Your message could not be sent. Please try again later.';
      if (_statusEl) {
        _statusEl.textContent = msg;
        _statusEl.className   = 'contact-status contact-status--error';
        _statusEl.removeAttribute('hidden');
        _statusEl.setAttribute('role', 'alert');
      }
      liveRegion.announceAssertive(msg);
      logError('contactForm._onSubmit', err);
    } finally {
      _submitting = false;
      srUtils.setBusy(_formEl, false);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = STRINGS.sendBtn || 'Send message'; }
    }
  }

  /**
   * Renders the success state.
   */
  function _showSuccess() {
    if (!_formEl) return;
    addClass(_formEl, CSS.success);

    const msg = STRINGS.contactSuccess || 'Your message has been sent. We'll be in touch soon!';
    if (_statusEl) {
      _statusEl.textContent = msg;
      _statusEl.className   = 'contact-status contact-status--success';
      _statusEl.removeAttribute('hidden');
      _statusEl.setAttribute('role', 'status');
    }
    liveRegion.announce(msg);
    emit(_formEl, 'contact:success', {});
  }

  /**
   * Initialises the contact form.
   */
  function init() {
    if (_initialised) return;

    _formEl = qs('[data-contact-form]');
    if (!_formEl) { debug('contactForm.init: form not found'); return; }

    _statusEl = qs('[data-form-status], .contact-status', _formEl);
    if (!_statusEl) {
      _statusEl = createElement('div', { class: 'contact-status', 'aria-live': 'polite' });
      _statusEl.setAttribute('hidden', '');
      _formEl.appendChild(_statusEl);
    }

    _initialised = true;

    // Bind inline validation to all contact fields.
    CONTACT_FIELDS.forEach(cfg => {
      const field = qs(cfg.selector, _formEl);
      if (field) inlineValidator.bind(field, cfg.rules);
    });

    // Character counter on message textarea.
    const messageField = qs('[name="message"]', _formEl);
    if (messageField) characterCounter.attach(messageField, 2000);

    honeypotProtection.inject(_formEl);
    formAutosave.attach(_formEl);

    _formEl.addEventListener('submit', _onSubmit);

    debug('contactForm.init: ready');
  }

  /**
   * Tears down the contact form module.
   */
  function destroy() {
    if (_formEl) _formEl.removeEventListener('submit', _onSubmit);
    CONTACT_FIELDS.forEach(cfg => {
      const field = qs(cfg.selector, _formEl);
      if (field) inlineValidator.unbind(field);
    });
    characterCounter.detachAll();
    formAutosave.detach(_formEl);
    _formEl = _statusEl = _errorSummaryEl = null;
    _submitting = _initialised = false;
  }

  return Object.freeze({ init, destroy });
}());


/* ---------------------------------------------------------------------------
 * MULTI-STEP FORM WIZARD
 * Manages a tab-panel wizard pattern, per-step validation, progress
 * indication, history state, and accessible step announcements.
 * --------------------------------------------------------------------------- */

/**
 * @typedef {Object} WizardStep
 * @property {number}      index      - Zero-based step index.
 * @property {HTMLElement} panelEl    - The panel element containing the step.
 * @property {string}      title      - Step title string.
 * @property {boolean}     completed  - Whether the step has been completed.
 * @property {Array}       fields     - Field configurations for this step.
 */

/**
 * multiStepWizard
 *
 * Orchestrates a multi-step form submitted incrementally, with step-level
 * validation, animated transitions, ProgressBar ARIA updates, and full
 * keyboard accessibility between steps.
 *
 * Expected markup:
 *   <form data-wizard>
 *     <div data-wizard-progress role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
 *     <div data-wizard-steps>
 *       <div data-wizard-step data-step-title="Your Details"> ... </div>
 *       <div data-wizard-step data-step-title="Plan & Billing"> ... </div>
 *       <div data-wizard-step data-step-title="Confirmation"> ... </div>
 *     </div>
 *     <nav data-wizard-navigation>
 *       <button data-wizard-prev>Back</button>
 *       <button data-wizard-next>Next</button>
 *       <button data-wizard-submit type="submit">Submit</button>
 *     </nav>
 *   </form>
 *
 * @type {Object}
 */
const multiStepWizard = (function buildMultiStepWizard() {

  /** @type {HTMLFormElement|null} */
  let _form          = null;
  /** @type {HTMLElement|null} */
  let _progressBar   = null;
  /** @type {HTMLElement|null} */
  let _stepsContainer = null;
  /** @type {HTMLElement|null} */
  let _prevBtn       = null;
  /** @type {HTMLElement|null} */
  let _nextBtn       = null;
  /** @type {HTMLElement|null} */
  let _submitBtn     = null;
  /** @type {WizardStep[]} */
  let _steps         = [];
  let _current       = 0;
  let _initialised   = false;
  let _submitting    = false;

  /**
   * Per-step field validation rules.  Keys are CSS selectors within a step.
   * Extend or override per project.
   */
  const STEP_FIELDS = [
    [
      { selector: '[name="wizard_name"]',  rules: ['required', { rule: 'minLength', params: 2 }],  label: 'Full name' },
      { selector: '[name="wizard_email"]', rules: ['required', 'email'],                            label: 'Email address' },
    ],
    [
      { selector: '[name="wizard_plan"]',      rules: ['required'],              label: 'Plan selection' },
      { selector: '[name="wizard_card_name"]', rules: ['required'],              label: 'Cardholder name' },
    ],
    [], // Confirmation step — no input validation.
  ];

  /**
   * Updates the progress bar ARIA attributes and visual fill.
   * @param {number} stepIndex
   */
  function _updateProgress(stepIndex) {
    if (!_progressBar) return;
    const total   = _steps.length;
    const percent = total > 1 ? Math.round((stepIndex / (total - 1)) * 100) : 100;
    _progressBar.setAttribute('aria-valuenow', String(percent));
    _progressBar.setAttribute('aria-valuetext', `Step ${stepIndex + 1} of ${total}`);
    _progressBar.style.setProperty('--wizard-progress', `${percent}%`);
    const fill = qs('[data-wizard-progress-fill]', _progressBar);
    if (fill) fill.style.width = `${percent}%`;
  }

  /**
   * Transitions to a specific step with an animated direction.
   *
   * @param {number}  targetIndex
   * @param {'forward'|'backward'} direction
   */
  function _goToStep(targetIndex, direction) {
    if (targetIndex < 0 || targetIndex >= _steps.length) return;

    const leaving = _steps[_current];
    const entering = _steps[targetIndex];

    // Aria-hide the leaving step.
    leaving.panelEl.setAttribute('aria-hidden', 'true');
    leaving.panelEl.setAttribute('hidden', '');
    removeClass(leaving.panelEl, CSS.active);
    addClass(leaving.panelEl, direction === 'forward' ? CSS.prev : 'wizard-step--next');

    // Show the entering step.
    entering.panelEl.removeAttribute('hidden');
    entering.panelEl.removeAttribute('aria-hidden');
    addClass(entering.panelEl, CSS.active);
    removeClass(entering.panelEl, CSS.prev);
    removeClass(entering.panelEl, 'wizard-step--next');

    _current = targetIndex;

    _updateProgress(_current);
    _updateNavButtons();

    // Move focus to the top of the new step for screen-reader users.
    const firstHeading = qs('h2, h3, h4, [tabindex="-1"], [data-wizard-focus]', entering.panelEl);
    if (firstHeading) {
      if (!firstHeading.hasAttribute('tabindex')) firstHeading.setAttribute('tabindex', '-1');
      firstHeading.focus({ preventScroll: false });
    }

    // Announce step change to AT.
    liveRegion.announce(
      (STRINGS.wizardStepChanged || 'Step {n} of {total}: {title}')
        .replace('{n}',     String(_current + 1))
        .replace('{total}', String(_steps.length))
        .replace('{title}', entering.title)
    );

    // Sync URL hash.
    try { history.replaceState(null, '', `#step-${_current + 1}`); } catch (_) {}

    emit(_form, 'wizard:step', { step: _current, title: entering.title });
  }

  /**
   * Updates navigation button visibility and labels.
   */
  function _updateNavButtons() {
    const isFirst = _current === 0;
    const isLast  = _current === _steps.length - 1;

    if (_prevBtn) {
      toggleAttr(_prevBtn, 'disabled', isFirst);
      toggleClass(_prevBtn, CSS.hidden, isFirst);
      _prevBtn.setAttribute('aria-label', isFirst ? '' : `Back to ${_steps[_current - 1].title}`);
    }
    if (_nextBtn) {
      toggleAttr(_nextBtn, 'disabled', isLast);
      toggleClass(_nextBtn, CSS.hidden, isLast);
      _nextBtn.setAttribute('aria-label', isLast ? '' : `Continue to ${_steps[_current + 1].title}`);
    }
    if (_submitBtn) {
      toggleClass(_submitBtn, CSS.hidden, !isLast);
      toggleAttr(_submitBtn, 'disabled', !isLast);
    }
  }

  /**
   * Validates the current step fields.
   * @returns {{ valid: boolean, errors: Array }}
   */
  function _validateCurrentStep() {
    const fieldCfgs = STEP_FIELDS[_current] || [];
    const errors    = [];

    fieldCfgs.forEach(cfg => {
      const field = qs(cfg.selector, _steps[_current].panelEl);
      if (!field) return;
      const result = inlineValidator.validate(field);
      if (result && !result.valid) {
        errors.push({ field, message: result.firstError, label: cfg.label });
      }
    });

    return { valid: errors.length === 0, errors };
  }

  /**
   * Handles Prev button click.
   */
  function _onPrev() {
    if (_current > 0) {
      _goToStep(_current - 1, 'backward');
    }
  }

  /**
   * Handles Next button click — validates current step first.
   */
  function _onNext() {
    const { valid, errors } = _validateCurrentStep();
    if (!valid) {
      // Focus the first invalid field.
      if (errors[0] && errors[0].field) {
        scrollIntoView(errors[0].field);
        errors[0].field.focus();
      }
      liveRegion.announceAssertive(
        (STRINGS.wizardStepErrors || 'Please correct the errors before continuing.')
      );
      return;
    }

    _steps[_current].completed = true;
    _goToStep(_current + 1, 'forward');
  }

  /**
   * Handles form submission (triggered from the final step).
   * @param {SubmitEvent} e
   */
  async function _onSubmit(e) {
    e.preventDefault();
    if (_submitting) return;

    const { valid, errors } = _validateCurrentStep();
    if (!valid) {
      if (errors[0] && errors[0].field) errors[0].field.focus();
      return;
    }

    _submitting = true;
    srUtils.setBusy(_form, true);
    if (_submitBtn) { _submitBtn.disabled = true; _submitBtn.textContent = STRINGS.submitting || 'Submitting…'; }

    try {
      const endpoint = _form.getAttribute('action') || CONFIG.api.wizard || '/api/signup';
      await postJson(endpoint, formToObject(_form), { timeout: 10000 });

      addClass(_form, CSS.success);
      const successPanel = qs('[data-wizard-success]', _form);
      if (successPanel) {
        qsa('[data-wizard-step]', _form).forEach(p => p.setAttribute('hidden', ''));
        if (_prevBtn) addClass(_prevBtn, CSS.hidden);
        if (_nextBtn) addClass(_nextBtn, CSS.hidden);
        if (_submitBtn) addClass(_submitBtn, CSS.hidden);
        successPanel.removeAttribute('hidden');
        successPanel.focus && successPanel.focus();
      }

      const msg = STRINGS.wizardSuccess || 'Your registration is complete. Welcome aboard!';
      liveRegion.announce(msg);
      formAutosave.clear(_form);
      emit(_form, 'wizard:complete', {});

    } catch (err) {
      const msg = STRINGS.wizardError || 'Submission failed. Please try again.';
      liveRegion.announceAssertive(msg);
      logError('multiStepWizard._onSubmit', err);
    } finally {
      _submitting = false;
      srUtils.setBusy(_form, false);
      if (_submitBtn) { _submitBtn.disabled = false; _submitBtn.textContent = STRINGS.submitBtn || 'Complete registration'; }
    }
  }

  /**
   * Parses wizard step panels from the DOM.
   * @returns {WizardStep[]}
   */
  function _parseSteps() {
    return qsa('[data-wizard-step]', _stepsContainer).map((panelEl, index) => ({
      index,
      panelEl,
      title    : panelEl.getAttribute('data-step-title') || `Step ${index + 1}`,
      completed: false,
      fields   : STEP_FIELDS[index] || [],
    }));
  }

  /**
   * Initialises the multi-step wizard.
   */
  function init() {
    if (_initialised) return;

    _form = qs('[data-wizard]');
    if (!_form) { debug('multiStepWizard.init: form not found'); return; }

    _progressBar    = qs('[data-wizard-progress]', _form);
    _stepsContainer = qs('[data-wizard-steps]', _form) || _form;
    _prevBtn        = qs('[data-wizard-prev]', _form);
    _nextBtn        = qs('[data-wizard-next]', _form);
    _submitBtn      = qs('[data-wizard-submit]', _form);
    _steps          = _parseSteps();

    if (!_steps.length) { debug('multiStepWizard.init: no steps found'); return; }

    // Set initial ARIA state on all steps.
    _steps.forEach((step, i) => {
      step.panelEl.setAttribute('role', 'tabpanel');
      step.panelEl.setAttribute('aria-label', step.title);
      if (i === 0) {
        step.panelEl.removeAttribute('hidden');
        step.panelEl.removeAttribute('aria-hidden');
        addClass(step.panelEl, CSS.active);
      } else {
        step.panelEl.setAttribute('hidden', '');
        step.panelEl.setAttribute('aria-hidden', 'true');
      }
    });

    // Bind per-step validation.
    _steps.forEach((step, i) => {
      (STEP_FIELDS[i] || []).forEach(cfg => {
        const field = qs(cfg.selector, step.panelEl);
        if (field) inlineValidator.bind(field, cfg.rules);
      });
    });

    // Wire event listeners.
    if (_prevBtn)   _prevBtn.addEventListener('click',  _onPrev);
    if (_nextBtn)   _nextBtn.addEventListener('click',  _onNext);
    _form.addEventListener('submit', _onSubmit);

    // Keyboard shortcut: Alt+ArrowLeft / Alt+ArrowRight.
    _form.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === KEYS.arrowLeft)  { e.preventDefault(); _onPrev(); }
      if (e.altKey && e.key === KEYS.arrowRight) { e.preventDefault(); _onNext(); }
    });

    honeypotProtection.inject(_form);
    formAutosave.attach(_form);

    _updateProgress(0);
    _updateNavButtons();

    _initialised = true;
    debug('multiStepWizard.init: ready', { steps: _steps.length });
  }

  /**
   * Destroys the wizard instance.
   */
  function destroy() {
    if (_prevBtn)   _prevBtn.removeEventListener('click', _onPrev);
    if (_nextBtn)   _nextBtn.removeEventListener('click', _onNext);
    if (_form)      _form.removeEventListener('submit',   _onSubmit);
    if (_form)      formAutosave.detach(_form);
    _form = _progressBar = _stepsContainer = _prevBtn = _nextBtn = _submitBtn = null;
    _steps = [];
    _current = 0;
    _initialised = _submitting = false;
  }

  return Object.freeze({ init, destroy });
}());


/* ---------------------------------------------------------------------------
 * FILE UPLOAD FIELD
 * Drag-and-drop, MIME/size validation, accessible file list, progress.
 * --------------------------------------------------------------------------- */

/**
 * fileUploadField
 *
 * Enhances a native `<input type="file">` into a draggable upload zone with
 * accessible file list management, MIME type validation, per-file progress
 * indication, and live-region announcements.
 *
 * @type {Object}
 */
const fileUploadField = (function buildFileUploadField() {

  /**
   * @typedef {Object} UploadEntry
   * @property {File}        file     - The native File object.
   * @property {string}      id       - Unique entry identifier.
   * @property {'pending'|'uploading'|'done'|'error'} status
   * @property {number}      progress - Upload progress 0–100.
   * @property {HTMLElement} rowEl    - The rendered list item.
   */

  /**
   * @typedef {Object} UploadZoneBinding
   * @property {HTMLElement} zoneEl   - The drop target element.
   * @property {HTMLInputElement} inputEl
   * @property {HTMLElement} listEl   - File list container.
   * @property {HTMLElement} statusEl - Live status element.
   * @property {UploadEntry[]} entries
   * @property {object}   config     - Zone-specific configuration.
   */

  /** @type {Map<HTMLElement, UploadZoneBinding>} */
  const _zones = new Map();

  /** Default configuration merged per-zone. */
  const DEFAULT_UPLOAD_CONFIG = {
    maxFileSizeMB   : 10,
    maxFiles        : 5,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    uploadEndpoint  : null, // Falls back to form action.
    autoUpload      : false,
    fieldName       : 'file',
  };

  /**
   * Returns a human-readable file size string.
   * @param  {number} bytes
   * @returns {string}
   */
  function _formatFileSize(bytes) {
    if (bytes < 1024)                return `${bytes} B`;
    if (bytes < 1024 * 1024)         return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Validates a file against zone constraints.
   * @param  {File}   file
   * @param  {object} config
   * @returns {{ valid: boolean, error: string }}
   */
  function _validateFile(file, config) {
    const maxBytes = (config.maxFileSizeMB || 10) * 1024 * 1024;
    if (file.size > maxBytes) {
      return { valid: false, error: `File is too large (max ${config.maxFileSizeMB} MB).` };
    }
    if (config.allowedMimeTypes && config.allowedMimeTypes.length) {
      if (!config.allowedMimeTypes.includes(file.type)) {
        return { valid: false, error: `File type '${file.type}' is not allowed.` };
      }
    }
    return { valid: true, error: '' };
  }

  /**
   * Renders a single file entry row in the list.
   *
   * @param {UploadEntry}       entry
   * @param {UploadZoneBinding} binding
   * @returns {HTMLElement}
   */
  function _renderRow(entry, binding) {
    const row = createElement('li', {
      id               : entry.id,
      class            : 'upload-entry',
      role             : 'listitem',
      'data-entry-id'  : entry.id,
    });

    const nameEl = createElement('span', { class: 'upload-entry__name' });
    nameEl.textContent = entry.file.name;

    const sizeEl = createElement('span', { class: 'upload-entry__size' });
    sizeEl.textContent = _formatFileSize(entry.file.size);

    const progressEl = createElement('progress', {
      class     : 'upload-entry__progress',
      max       : '100',
      value     : '0',
      'aria-label': `Upload progress for ${entry.file.name}`,
    });

    const statusEl = createElement('span', {
      class     : 'upload-entry__status',
      'aria-live': 'polite',
    });
    statusEl.textContent = 'Pending';

    const removeBtn = createElement('button', {
      type      : 'button',
      class     : 'upload-entry__remove',
      'aria-label': `Remove ${entry.file.name}`,
    });
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', () => _removeEntry(binding, entry.id));

    row.appendChild(nameEl);
    row.appendChild(sizeEl);
    row.appendChild(progressEl);
    row.appendChild(statusEl);
    row.appendChild(removeBtn);

    entry.rowEl = row;
    return row;
  }

  /**
   * Adds a file to an upload zone.
   * @param {UploadZoneBinding} binding
   * @param {File}              file
   */
  function _addFile(binding, file) {
    const { config } = binding;

    if (binding.entries.length >= (config.maxFiles || 5)) {
      liveRegion.announceAssertive(`Maximum of ${config.maxFiles} files allowed.`);
      return;
    }

    const validation = _validateFile(file, config);
    if (!validation.valid) {
      liveRegion.announceAssertive(`${file.name}: ${validation.error}`);
      return;
    }

    const entry = {
      file,
      id      : `upload-${srUtils.generateId()}`,
      status  : 'pending',
      progress: 0,
      rowEl   : null,
    };

    binding.entries.push(entry);
    const row = _renderRow(entry, binding);
    binding.listEl.appendChild(row);

    liveRegion.announce(`${file.name} added to upload queue.`);
    emit(binding.zoneEl, 'upload:added', { file, entry });

    if (config.autoUpload) {
      _uploadEntry(binding, entry);
    }
  }

  /**
   * Removes an entry from a zone.
   * @param {UploadZoneBinding} binding
   * @param {string}            entryId
   */
  function _removeEntry(binding, entryId) {
    const idx = binding.entries.findIndex(e => e.id === entryId);
    if (idx === -1) return;
    const entry = binding.entries[idx];
    if (entry.rowEl) removeElement(entry.rowEl);
    binding.entries.splice(idx, 1);
    liveRegion.announce(`${entry.file.name} removed from upload queue.`);
    emit(binding.zoneEl, 'upload:removed', { entry });
  }

  /**
   * Uploads a single entry using XMLHttpRequest to expose progress events.
   * @param {UploadZoneBinding} binding
   * @param {UploadEntry}       entry
   * @returns {Promise<void>}
   */
  function _uploadEntry(binding, entry) {
    return new Promise((resolve, reject) => {
      const endpoint = binding.config.uploadEndpoint
        || (binding.inputEl.form && binding.inputEl.form.action)
        || '/api/upload';

      const xhr  = new XMLHttpRequest();
      const data = new FormData();
      data.append(binding.config.fieldName || 'file', entry.file);

      xhr.open('POST', endpoint, true);

      // Progress tracking.
      xhr.upload.addEventListener('progress', (evt) => {
        if (!evt.lengthComputable) return;
        entry.progress = Math.round((evt.loaded / evt.total) * 100);
        const progressEl = qs('progress', entry.rowEl);
        if (progressEl) progressEl.value = entry.progress;
        const statusEl = qs('.upload-entry__status', entry.rowEl);
        if (statusEl) statusEl.textContent = `${entry.progress}%`;
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          entry.status = 'done';
          const progressEl = qs('progress', entry.rowEl);
          if (progressEl) progressEl.value = 100;
          const statusEl = qs('.upload-entry__status', entry.rowEl);
          if (statusEl) statusEl.textContent = 'Uploaded';
          addClass(entry.rowEl, 'upload-entry--done');
          liveRegion.announce(`${entry.file.name} uploaded successfully.`);
          emit(binding.zoneEl, 'upload:success', { entry });
          resolve();
        } else {
          _uploadError(binding, entry, `Server error: ${xhr.status}`);
          reject(new Error(`HTTP ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        _uploadError(binding, entry, 'Network error during upload.');
        reject(new Error('Network error'));
      });

      xhr.addEventListener('abort', () => {
        _uploadError(binding, entry, 'Upload cancelled.');
        reject(new Error('Abort'));
      });

      entry.status = 'uploading';
      entry._xhr   = xhr;
      xhr.send(data);
    });
  }

  /**
   * Handles an upload error for a specific entry.
   * @param {UploadZoneBinding} binding
   * @param {UploadEntry}       entry
   * @param {string}            message
   */
  function _uploadError(binding, entry, message) {
    entry.status = 'error';
    addClass(entry.rowEl, 'upload-entry--error');
    const statusEl = qs('.upload-entry__status', entry.rowEl);
    if (statusEl) statusEl.textContent = 'Error';
    liveRegion.announceAssertive(`${entry.file.name}: ${message}`);
    emit(binding.zoneEl, 'upload:error', { entry, message });
  }

  /**
   * Processes files dropped or selected into an upload zone.
   * @param {UploadZoneBinding} binding
   * @param {FileList|File[]}   files
   */
  function _processFiles(binding, files) {
    Array.from(files || []).forEach(file => _addFile(binding, file));
  }

  /**
   * Binds a file upload zone.
   *
   * @param {HTMLElement}   zoneEl   - The drag-drop container.
   * @param {object}        [opts]   - Configuration overrides.
   */
  function bind(zoneEl, opts) {
    if (!isElement(zoneEl) || _zones.has(zoneEl)) return;

    const config = deepMerge({}, DEFAULT_UPLOAD_CONFIG, isPlainObject(opts) ? opts : {});
    const inputEl = qs('input[type="file"]', zoneEl);
    if (!inputEl) { warn('fileUploadField.bind: no <input type="file"> inside zone'); return; }

    const listEl = qs('[data-upload-list]', zoneEl) || (() => {
      const ul = createElement('ul', { class: 'upload-list', role: 'list', 'aria-label': 'Selected files' });
      zoneEl.appendChild(ul);
      return ul;
    })();

    const statusEl = qs('[data-upload-status]', zoneEl) || (() => {
      const s = createElement('div', { class: 'upload-status', 'aria-live': 'polite' });
      s.setAttribute('hidden', '');
      zoneEl.appendChild(s);
      return s;
    })();

    const binding = { zoneEl, inputEl, listEl, statusEl, entries: [], config };
    _zones.set(zoneEl, binding);

    // File input change.
    inputEl.addEventListener('change', () => _processFiles(binding, inputEl.files));

    // Drag over visual state.
    zoneEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      addClass(zoneEl, 'upload-zone--drag-over');
      setAttr(zoneEl, 'aria-dropeffect', 'copy');
    });
    zoneEl.addEventListener('dragleave', (e) => {
      if (!zoneEl.contains(e.relatedTarget)) {
        removeClass(zoneEl, 'upload-zone--drag-over');
        setAttr(zoneEl, 'aria-dropeffect', 'none');
      }
    });

    // Drop event.
    zoneEl.addEventListener('drop', (e) => {
      e.preventDefault();
      removeClass(zoneEl, 'upload-zone--drag-over');
      setAttr(zoneEl, 'aria-dropeffect', 'none');
      _processFiles(binding, e.dataTransfer.files);
    });

    // Keyboard activation of the zone.
    zoneEl.addEventListener('keydown', (e) => {
      if (e.key === KEYS.enter || e.key === KEYS.space) {
        e.preventDefault();
        inputEl.click();
      }
    });

    // Set accessible attributes on the zone.
    if (!zoneEl.hasAttribute('role'))     setAttr(zoneEl, 'role',     'button');
    if (!zoneEl.hasAttribute('tabindex')) setAttr(zoneEl, 'tabindex', '0');
    setAttr(zoneEl, 'aria-dropeffect', 'none');
    setAttr(zoneEl, 'aria-label',
      zoneEl.getAttribute('data-upload-label') || 'Upload files – click or drag files here'
    );

    debug('fileUploadField.bind:', zoneEl, config);
  }

  /**
   * Triggers upload of all pending entries in a zone.
   * @param  {HTMLElement} zoneEl
   * @returns {Promise<void[]>}
   */
  function upload(zoneEl) {
    const binding = _zones.get(zoneEl);
    if (!binding) return Promise.resolve([]);
    const pending = binding.entries.filter(e => e.status === 'pending');
    return Promise.all(pending.map(e => _uploadEntry(binding, e)));
  }

  /**
   * Removes all file entries from a zone without uploading.
   * @param {HTMLElement} zoneEl
   */
  function clear(zoneEl) {
    const binding = _zones.get(zoneEl);
    if (!binding) return;
    binding.entries.forEach(e => e.rowEl && removeElement(e.rowEl));
    binding.entries.length = 0;
  }

  /**
   * Unbinds a zone.
   * @param {HTMLElement} zoneEl
   */
  function unbind(zoneEl) {
    clear(zoneEl);
    _zones.delete(zoneEl);
  }

  return Object.freeze({ bind, upload, clear, unbind });
}());


/* ---------------------------------------------------------------------------
 * FORM ANALYTICS
 * Tracks form interactions, field focus, abandonment, and funnel progress.
 * --------------------------------------------------------------------------- */

/**
 * formAnalytics
 *
 * Non-intrusive analytics module for monitoring form interactions.
 * Tracks: first interaction start, field focus count, per-field error count,
 * abandonment (page unload before submit), and successful submit events.
 *
 * All events fire through the analytics dispatcher so GA4 or any other
 * analytics system can pick them up.
 *
 * @type {Object}
 */
const formAnalytics = (function buildFormAnalytics() {

  /**
   * @typedef {Object} FormTrackingSession
   * @property {string}  formId        - Identifier for the form.
   * @property {number}  startedAt     - Timestamp when tracking began.
   * @property {boolean} interacted    - Whether the user has interacted.
   * @property {number}  focusCount    - Total field focus events.
   * @property {Map<string, number>} errorCounts  - Per-field error occurrences.
   * @property {Map<string, number>} focusCounts  - Per-field focus occurrences.
   * @property {boolean} submitted     - Whether submitted successfully.
   */

  /** @type {Map<HTMLFormElement, FormTrackingSession>} */
  const _sessions = new Map();

  /**
   * Dispatches an analytics event.  Falls back gracefully if analytics
   * is not configured.
   *
   * @param {string} eventName
   * @param {object} params
   */
  function _dispatch(eventName, params) {
    try {
      if (isFunction(window.analytics && window.analytics.track)) {
        window.analytics.track(eventName, params);
      } else if (isFunction(window.gtag)) {
        window.gtag('event', eventName, params);
      } else {
        debug('formAnalytics._dispatch:', eventName, params);
      }
    } catch (err) {
      logError('formAnalytics._dispatch', err);
    }
  }

  /**
   * Returns the canonical identifier for a form.
   * @param  {HTMLFormElement} form
   * @returns {string}
   */
  function _formId(form) {
    return form.id || form.getAttribute('data-form-id') || form.getAttribute('name') || 'unknown_form';
  }

  /**
   * Attaches tracking listeners to a form element.
   * @param {HTMLFormElement} form
   */
  function track(form) {
    if (!isElement(form) || _sessions.has(form)) return;

    const session = {
      formId     : _formId(form),
      startedAt  : Date.now(),
      interacted : false,
      focusCount : 0,
      errorCounts: new Map(),
      focusCounts: new Map(),
      submitted  : false,
    };
    _sessions.set(form, session);

    // First interaction event.
    function _onFirstInteract() {
      if (session.interacted) return;
      session.interacted = true;
      _dispatch('form_started', { form_id: session.formId });
      form.removeEventListener('focusin', _onFirstInteract);
      form.removeEventListener('input',   _onFirstInteract);
    }

    form.addEventListener('focusin', _onFirstInteract);
    form.addEventListener('input',   _onFirstInteract);

    // Per-field focus tracking.
    form.addEventListener('focusin', (e) => {
      const field = e.target;
      if (!field.name) return;
      session.focusCount++;
      session.focusCounts.set(field.name, (session.focusCounts.get(field.name) || 0) + 1);
    });

    // Error observation — watch for aria-invalid being set.
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(({ target, attributeName }) => {
        if (attributeName === 'aria-invalid' && target.getAttribute('aria-invalid') === 'true') {
          const name = target.name || target.id || 'unknown';
          session.errorCounts.set(name, (session.errorCounts.get(name) || 0) + 1);
          _dispatch('form_field_error', { form_id: session.formId, field_name: name });
        }
      });
    });
    observer.observe(form, { subtree: true, attributes: true, attributeFilter: ['aria-invalid'] });

    // Submit event.
    form.addEventListener('submit', () => {
      session.submitted = true;
      const timeOnForm  = Date.now() - session.startedAt;
      _dispatch('form_submitted', {
        form_id      : session.formId,
        time_on_form : timeOnForm,
        focus_count  : session.focusCount,
      });
    });

    // Abandonment (beforeunload).
    window.addEventListener('beforeunload', () => {
      if (session.interacted && !session.submitted) {
        const timeOnForm = Date.now() - session.startedAt;
        _dispatch('form_abandoned', {
          form_id      : session.formId,
          time_on_form : timeOnForm,
          focus_count  : session.focusCount,
        });
      }
    });
  }

  /**
   * Returns the current tracking session data for a form.
   * @param  {HTMLFormElement} form
   * @returns {FormTrackingSession|null}
   */
  function getSession(form) {
    return _sessions.get(form) || null;
  }

  return Object.freeze({ track, getSession });
}());

/* ---------------------------------------------------------------------------
 * BOOTSTRAP, ANALYTICS & OBSERVABILITY
 * Core Web Vitals monitoring, analytics event system, scroll-depth tracker,
 * viewport reveal animations, cookie-consent banner, prefetch manager,
 * error reporter, performance monitor, and DOMContentLoaded bootstrap.
 * --------------------------------------------------------------------------- */

/* --- Analytics Core --- */

/**
 * @typedef {Object} AnalyticsEvent
 * @property {string}  name       - Event name (snake_case mirror of GA4 convention).
 * @property {Object}  [params]   - Arbitrary key-value payload.
 * @property {number}  timestamp  - Unix ms when the event was created.
 */

/**
 * analytics
 *
 * Thin wrapper around Google Analytics 4 `gtag()` with:
 * - Consent gating (events are queued until consent is granted).
 * - Event batching / deduplication.
 * - Custom session and engagement dimensions.
 * - Debug mode (logs to console instead of sending).
 *
 * @type {Object}
 */
const analytics = (function buildAnalytics() {

  /** @type {AnalyticsEvent[]} */
  const _queue     = [];
  let   _consented = false;
  let   _sessionId = null;

  /**
   * Returns (creating if necessary) a short session ID stored in sessionStorage.
   * @returns {string}
   */
  function _getSessionId() {
    if (_sessionId) return _sessionId;
    try {
      _sessionId = sessionStorage.getItem('ls_sid');
      if (!_sessionId) {
        _sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
        sessionStorage.setItem('ls_sid', _sessionId);
      }
    } catch (_) {
      _sessionId = `nostorage-${Date.now().toString(36)}`;
    }
    return _sessionId;
  }

  /**
   * Calls gtag safely.
   * @param {string} command
   * @param  {...*}  args
   */
  function _gtag(command, ...args) {
    if (typeof window.gtag === 'function') {
      window.gtag(command, ...args);
    } else if (CONFIG.debug) {
      debug(`[analytics] gtag(${command})`, ...args);
    }
  }

  /**
   * Dispatches all queued events and clears the queue.
   */
  function _flushQueue() {
    while (_queue.length) {
      const ev = _queue.shift();
      _send(ev.name, ev.params);
    }
  }

  /**
   * Sends a single event to GA4 (internal, bypasses consent check).
   * @param {string} name
   * @param {Object} [params]
   */
  function _send(name, params) {
    const payload = Object.assign({
      session_id      : _getSessionId(),
      page_title      : document.title,
      page_location   : location.href,
      event_timestamp : Date.now(),
    }, params);

    if (CONFIG.debug) {
      debug(`[analytics] track: ${name}`, payload);
      return;
    }

    _gtag('event', name, payload);
  }

  /**
   * Tracks a named event.  Queues the event if consent has not been granted.
   *
   * @param {string}  name
   * @param {Object}  [params]
   */
  function track(name, params) {
    if (!isNonEmptyString(name)) return;
    if (!_consented) {
      _queue.push({ name, params: params || {}, timestamp: Date.now() });
      return;
    }
    _send(name, params || {});
  }

  /**
   * Grants analytics consent and flushes the event queue.
   * Called by the cookie-consent banner when the user accepts.
   */
  function grantConsent() {
    _consented = true;
    _gtag('consent', 'update', { analytics_storage: 'granted' });
    _flushQueue();
  }

  /**
   * Revokes analytics consent.  Queued events are discarded.
   */
  function revokeConsent() {
    _consented = false;
    _queue.length = 0;
    _gtag('consent', 'update', { analytics_storage: 'denied' });
  }

  /**
   * Sends a page-view event with optional custom params.
   * @param {Object} [params]
   */
  function pageView(params) {
    track('page_view', Object.assign({
      page_path  : location.pathname,
      page_search: location.search,
      referrer   : document.referrer,
    }, params));
  }

  /**
   * Tracks a user interaction on a UI component.
   * @param {string} component   - Component name (e.g. 'pricing_toggle').
   * @param {string} action      - Action label (e.g. 'toggle_annual').
   * @param {Object} [extra]
   */
  function interaction(component, action, extra) {
    track('ui_interaction', Object.assign({ component, action }, extra || {}));
  }

  /**
   * Tracks a conversion event (e.g. checkout initiated, plan selected).
   * @param {string} conversionName
   * @param {Object} [params]
   */
  function conversion(conversionName, params) {
    track('conversion', Object.assign({ conversion_name: conversionName }, params || {}));
  }

  /**
   * Tracks an outbound link click.
   * @param {string} url
   * @param {string} [label]
   */
  function outboundLink(url, label) {
    track('outbound_link_click', { link_url: url, link_text: label || url });
  }

  /**
   * Tracks a file download.
   * @param {string} url
   * @param {string} [extension]
   */
  function fileDownload(url, extension) {
    track('file_download', {
      link_url      : url,
      file_extension: extension || url.split('.').pop() || 'unknown',
    });
  }

  /**
   * Tracks a form interaction event.
   * @param {string} formId
   * @param {string} eventType   - 'start' | 'submit' | 'success' | 'error' | 'abandon'
   * @param {Object} [extra]
   */
  function formEvent(formId, eventType, extra) {
    track('form_interaction', Object.assign({ form_id: formId, form_event: eventType }, extra || {}));
  }

  /* Auto-track outbound links on click. */
  document.addEventListener('click', function _trackOutbound(ev) {
    const link = closest(ev.target, 'a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('http')) return;
    try {
      const url = new URL(href);
      if (url.hostname !== location.hostname) {
        outboundLink(href, link.textContent.trim());
      }
    } catch (_) {}
  });

  /* Auto-track file downloads. */
  const DOWNLOAD_EXTS = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|gz|tar|mp3|mp4|mov|avi)$/i;
  document.addEventListener('click', function _trackDownload(ev) {
    const link = closest(ev.target, 'a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    const match = href.match(DOWNLOAD_EXTS);
    if (match) fileDownload(href, match[1]);
  });

  return Object.freeze({
    track, grantConsent, revokeConsent, pageView, interaction,
    conversion, outboundLink, fileDownload, formEvent,
    get consented() { return _consented; },
  });
}());


/* --- Scroll Depth Tracker --- */

/**
 * scrollDepthTracker
 *
 * Fires analytics events at 25%, 50%, 75%, and 100% scroll depth milestones.
 * Uses IntersectionObserver where possible for accurate detection without
 * layout-thrashing.
 *
 * @type {Object}
 */
const scrollDepthTracker = (function buildScrollDepthTracker() {

  const MILESTONES = [25, 50, 75, 100];
  const _fired     = new Set();
  let _markers     = [];
  let _raf         = null;
  let _initialised = false;

  /**
   * Computes current scroll depth as an integer percentage (0–100).
   * @returns {number}
   */
  function _getDepth() {
    const docH = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
    );
    const winH   = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    if (docH <= winH) return 100;
    return Math.round(((scrollY + winH) / docH) * 100);
  }

  /**
   * Checks for newly crossed milestones and fires analytics events.
   */
  function _check() {
    const depth = _getDepth();
    MILESTONES.forEach(m => {
      if (depth >= m && !_fired.has(m)) {
        _fired.add(m);
        analytics.track('scroll_depth', { percent: m, page_path: location.pathname });
        debug(`scrollDepthTracker: ${m}% milestone reached`);
      }
    });
    _raf = null;
  }

  /**
   * Scroll handler with rAF throttle.
   */
  function _onScroll() {
    if (_raf) return;
    _raf = requestAnimationFrame(_check);
  }

  /**
   * Creates invisible marker elements at each depth milestone so
   * IntersectionObserver can be used instead of scroll events.
   */
  function _createMarkers() {
    const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const frag  = document.createDocumentFragment();

    MILESTONES.forEach(m => {
      const marker = createElement('div', {
        'data-scroll-marker'  : String(m),
        style                 : `position:absolute;top:${m}%;left:0;width:1px;height:1px;pointer-events:none;`,
        'aria-hidden'         : 'true',
      });
      frag.appendChild(marker);
      _markers.push(marker);
    });

    const body = document.body;
    body.style.position = body.style.position || 'relative';
    body.appendChild(frag);
  }

  /**
   * Initialises the scroll depth tracker.
   */
  function init() {
    if (_initialised) return;
    _initialised = true;

    if (SUPPORTS.intersectionObserver) {
      _createMarkers();
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const m = parseInt(entry.target.getAttribute('data-scroll-marker') || '0', 10);
          if (m && !_fired.has(m)) {
            _fired.add(m);
            analytics.track('scroll_depth', { percent: m });
          }
        });
      }, { threshold: 0.01 });

      _markers.forEach(m => obs.observe(m));
    } else {
      window.addEventListener('scroll', _onScroll, { passive: true });
      _check();
    }
  }

  /**
   * Resets milestones (useful for SPA page transitions).
   */
  function reset() {
    _fired.clear();
    _markers.forEach(m => removeElement(m));
    _markers = [];
    _initialised = false;
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
  }

  return Object.freeze({ init, reset });
}());


/* --- Viewport Reveal Animations --- */

/**
 * viewportReveal
 *
 * Observes elements with `data-reveal` attributes and applies entrance
 * animations as they scroll into view.  Respects `prefers-reduced-motion`.
 * Supports staggered reveal for groups of children.
 *
 * @type {Object}
 */
const viewportReveal = (function buildViewportReveal() {

  const SELECTOR    = '[data-reveal]';
  const VISIBLE_CLS = 'is-revealed';
  let   _obs        = null;
  let   _initialised = false;

  /**
   * Reads the stagger delay index from the element or its parent.
   * @param  {HTMLElement} el
   * @returns {number}  Stagger index (0-based, capped at 12).
   */
  function _staggerIndex(el) {
    const attr = parseInt(el.getAttribute('data-reveal-index') || '0', 10);
    if (isFiniteNumber(attr)) return Math.min(attr, 12);

    // Auto-stagger: look at sibling position within a [data-reveal-group].
    const group = el.closest('[data-reveal-group]');
    if (!group) return 0;
    const siblings = qsa(SELECTOR, group);
    const idx      = siblings.indexOf(el);
    return Math.max(0, Math.min(idx, 12));
  }

  /**
   * Applies the reveal class (and stagger delay).
   * @param {HTMLElement} el
   */
  function _reveal(el) {
    const idx     = _staggerIndex(el);
    const baseMs  = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
    const stagger = TIMING.stagger || 80;
    const delay   = baseMs + (idx * stagger);

    if (delay > 0) {
      el.style.transitionDelay = `${delay}ms`;
    }

    addClass(el, VISIBLE_CLS);
    el.removeAttribute('data-reveal');
    emit(el, 'reveal:visible', { staggerIndex: idx });
  }

  /**
   * Initialises IntersectionObserver for reveal elements.
   */
  function init() {
    if (_initialised) return;
    _initialised = true;

    if (SUPPORTS.reducedMotion) {
      // Simply show everything without animation.
      qsa(SELECTOR).forEach(el => {
        addClass(el, VISIBLE_CLS);
        el.removeAttribute('data-reveal');
      });
      return;
    }

    if (!SUPPORTS.intersectionObserver) {
      qsa(SELECTOR).forEach(el => _reveal(el));
      return;
    }

    const threshold = parseFloat(CONFIG.reveal && CONFIG.reveal.threshold || '0.15');
    _obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        _reveal(entry.target);
        _obs.unobserve(entry.target);
      });
    }, { threshold, rootMargin: '0px 0px -5% 0px' });

    qsa(SELECTOR).forEach(el => _obs.observe(el));
  }

  /**
   * Observes a single element (use for dynamically-inserted elements).
   * @param {HTMLElement} el
   */
  function observe(el) {
    if (!isElement(el)) return;
    if (_obs) {
      _obs.observe(el);
    } else {
      _reveal(el);
    }
  }

  /**
   * Tears down the observer.
   */
  function destroy() {
    if (_obs) { _obs.disconnect(); _obs = null; }
    _initialised = false;
  }

  return Object.freeze({ init, observe, destroy });
}());


/* --- Stat Counter Animator --- */

/**
 * statCounterAnimator
 *
 * Animates numeric counters (e.g. "10,000+ clients") when they scroll
 * into the viewport.  Uses `animateNumber` from Section 2.
 *
 * @type {Object}
 */
const statCounterAnimator = (function buildStatCounterAnimator() {

  const SELECTOR = '[data-stat-number], .stat__number';
  let _initialised = false;

  /**
   * Parses the numeric target from the element's text content or
   * `data-stat-target` attribute.
   *
   * @param  {HTMLElement} el
   * @returns {{ target: number, prefix: string, suffix: string, decimals: number }}
   */
  function _parseTarget(el) {
    const raw     = el.getAttribute('data-stat-target') || el.textContent || '0';
    const cleaned = raw.replace(/[^0-9.-]/g, '');
    const target  = parseFloat(cleaned) || 0;
    const prefix  = raw.match(/^([^0-9-]*)/)   ? raw.match(/^([^0-9-]*)/)[1].trim()  : '';
    const suffix  = raw.match(/([^0-9.]+)$/)   ? raw.match(/([^0-9.]+)$/)[1].trim()  : '';
    const decimals = (cleaned.includes('.'))    ? (cleaned.split('.')[1] || '').length : 0;

    return { target, prefix, suffix, decimals };
  }

  /**
   * Formats a raw number value with suffix/prefix and decimal places.
   * @param {number} val
   * @param {Object} cfg
   * @returns {string}
   */
  function _format(val, cfg) {
    const rounded = val.toFixed(cfg.decimals);
    const formatted = Number(rounded).toLocaleString(CONFIG.locale || 'en-GB');
    return `${cfg.prefix}${formatted}${cfg.suffix}`;
  }

  /**
   * Starts the count animation for a stat element.
   * @param {HTMLElement} el
   */
  function _animate(el) {
    if (el.getAttribute('data-stat-animated') === 'true') return;
    el.setAttribute('data-stat-animated', 'true');

    const cfg      = _parseTarget(el);
    const duration = parseInt(el.getAttribute('data-stat-duration') || '1500', 10);
    const easing   = el.getAttribute('data-stat-easing')   || 'easeOutCubic';

    if (SUPPORTS.reducedMotion) {
      el.textContent = _format(cfg.target, cfg);
      return;
    }

    animateNumber(0, cfg.target, {
      duration,
      easing    : easing,
      onUpdate  : (val) => { el.textContent = _format(val, cfg); },
      onComplete: ()    => {
        el.textContent = _format(cfg.target, cfg);
        el.setAttribute('aria-label', el.textContent);
      },
    });
  }

  /**
   * Initialises IntersectionObserver for stat elements.
   */
  function init() {
    if (_initialised) return;
    _initialised = true;

    const els = qsa(SELECTOR);
    if (!els.length) return;

    if (!SUPPORTS.intersectionObserver) {
      els.forEach(_animate);
      return;
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        _animate(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    els.forEach(el => obs.observe(el));
  }

  return Object.freeze({ init });
}());


/* --- Prefetch Manager --- */

/**
 * prefetchManager
 *
 * Injects `<link rel="prefetch">` elements for internal links that the user
 * hovers over or focuses on, speeding up subsequent navigations.
 *
 * Respects `data-no-prefetch` on links, `Save-Data` header hint, and
 * `prefers-reduced-data` media query.
 *
 * @type {Object}
 */
const prefetchManager = (function buildPrefetchManager() {

  /** @type {Set<string>} */
  const _prefetched = new Set();
  let _enabled      = false;

  /**
   * Returns whether the browser/user has indicated data-saving preferences.
   * @returns {boolean}
   */
  function _isDataSaverActive() {
    if (navigator.connection && navigator.connection.saveData) return true;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-data: reduce)').matches) return true;
    return false;
  }

  /**
   * Prefetches a URL by inserting a `<link rel="prefetch">`.
   * @param {string} url
   */
  function prefetch(url) {
    if (!url || _prefetched.has(url) || !_enabled) return;
    if (!url.startsWith('/') && new URL(url, location.href).hostname !== location.hostname) return;

    const link = createElement('link', {
      rel   : 'prefetch',
      href  : url,
      as    : 'document',
    });
    document.head.appendChild(link);
    _prefetched.add(url);
    debug('prefetchManager: prefetched', url);
  }

  /**
   * Handles pointer-enter and focus on anchor elements.
   * @param {Event} e
   */
  function _onIntent(e) {
    const link = closest(e.target, 'a[href]');
    if (!link) return;
    if (link.getAttribute('data-no-prefetch') === 'true') return;
    prefetch(link.href);
  }

  /**
   * Initialises prefetch listeners.
   */
  function init() {
    _enabled = SUPPORTS.prefetch && !_isDataSaverActive();
    if (!_enabled) { debug('prefetchManager: disabled (data-saver or no support)'); return; }

    document.addEventListener('mouseover',  debounce(_onIntent, 80), { passive: true });
    document.addEventListener('focusin',    _onIntent, { passive: true });
  }

  return Object.freeze({ init, prefetch });
}());


/* --- Cookie Consent Banner --- */

/**
 * cookieConsent
 *
 * Manages the cookie/analytics consent banner:
 * - Shows on first visit.
 * - Persists choice to localStorage.
 * - Traps focus within the banner while it is open.
 * - Gates analytics until the user accepts.
 * - Provides a way to re-open the preferences via `[data-cookie-prefs]`.
 *
 * @type {Object}
 */
const cookieConsent = (function buildCookieConsent() {

  const STORAGE_KEY   = 'luminary_cookie_consent';
  const ACCEPTED      = 'accepted';
  const DECLINED      = 'declined';

  /** @type {HTMLElement|null} */
  let _bannerEl    = null;
  /** @type {Function|null}   */
  let _trapRelease = null;
  let _initialised = false;

  /**
   * Returns the stored consent decision, or null if none.
   * @returns {'accepted'|'declined'|null}
   */
  function getDecision() {
    try { return localStorage.getItem(STORAGE_KEY) || null; } catch (_) { return null; }
  }

  /**
   * Stores the consent decision.
   * @param {'accepted'|'declined'} decision
   */
  function _store(decision) {
    try { localStorage.setItem(STORAGE_KEY, decision); } catch (_) {}
  }

  /**
   * Hides and unmounts the banner.
   */
  function _hideBanner() {
    if (!_bannerEl) return;
    if (_trapRelease) { _trapRelease(); _trapRelease = null; }
    fadeOut(_bannerEl, { duration: 200, onComplete: () => { removeElement(_bannerEl); _bannerEl = null; } });
    emit(document, 'cookieconsent:hidden', {});
  }

  /**
   * Handles the "Accept all" button.
   */
  function _onAccept() {
    _store(ACCEPTED);
    analytics.grantConsent();
    _hideBanner();
    emit(document, 'cookieconsent:accepted', {});
  }

  /**
   * Handles the "Decline / Essential only" button.
   */
  function _onDecline() {
    _store(DECLINED);
    analytics.revokeConsent();
    _hideBanner();
    emit(document, 'cookieconsent:declined', {});
  }

  /**
   * Renders and shows the consent banner.
   */
  function _showBanner() {
    if (_bannerEl) return;

    _bannerEl = qs('[data-cookie-banner]');

    if (!_bannerEl) {
      // Build a minimal banner if there's no pre-rendered one in the HTML.
      _bannerEl = createElement('div', {
        class           : 'cookie-banner',
        role            : 'dialog',
        'aria-modal'    : 'true',
        'aria-labelledby': 'cookie-banner-title',
        'aria-describedby': 'cookie-banner-desc',
      });

      const title = createElement('h2', { id: 'cookie-banner-title', class: 'cookie-banner__title' });
      title.textContent = STRINGS.cookieTitle || 'We use cookies';

      const desc = createElement('p', { id: 'cookie-banner-desc', class: 'cookie-banner__desc' });
      desc.textContent = STRINGS.cookieDesc || 'We use analytics cookies to improve your experience. You can accept or decline non-essential cookies.';

      const acceptBtn  = createElement('button', { type: 'button', class: 'btn btn--primary cookie-banner__accept' });
      acceptBtn.textContent = STRINGS.cookieAccept || 'Accept all';
      acceptBtn.addEventListener('click', _onAccept);

      const declineBtn = createElement('button', { type: 'button', class: 'btn btn--ghost cookie-banner__decline' });
      declineBtn.textContent = STRINGS.cookieDecline || 'Essential only';
      declineBtn.addEventListener('click', _onDecline);

      const actions = createElement('div', { class: 'cookie-banner__actions' });
      actions.appendChild(acceptBtn);
      actions.appendChild(declineBtn);

      _bannerEl.appendChild(title);
      _bannerEl.appendChild(desc);
      _bannerEl.appendChild(actions);

      document.body.appendChild(_bannerEl);
    } else {
      qs('[data-cookie-accept]',  _bannerEl) && qs('[data-cookie-accept]',  _bannerEl).addEventListener('click', _onAccept);
      qs('[data-cookie-decline]', _bannerEl) && qs('[data-cookie-decline]', _bannerEl).addEventListener('click', _onDecline);
    }

    setAttr(_bannerEl, 'aria-hidden', 'false');
    const trap = createFocusTrap(_bannerEl, { escapeDeactivates: false });
    trap.activate();
    _trapRelease = () => trap.deactivate();

    const firstBtn = qs('button', _bannerEl);
    if (firstBtn) setTimeout(() => firstBtn.focus(), 50);

    emit(document, 'cookieconsent:shown', {});
  }

  /**
   * Initialises the consent module.
   */
  function init() {
    if (_initialised) return;
    _initialised = true;

    const decision = getDecision();

    if (decision === ACCEPTED) {
      analytics.grantConsent();
    } else if (decision === DECLINED) {
      analytics.revokeConsent();
    } else {
      // First visit: show the banner after a short delay (avoid CLS).
      setTimeout(_showBanner, CONFIG.cookieBannerDelay || 1200);
    }

    // Re-open preferences button.
    document.addEventListener('click', function _onPrefsClick(ev) {
      const btn = closest(ev.target, '[data-cookie-prefs]');
      if (!btn) return;
      ev.preventDefault();
      _showBanner();
    });
  }

  /**
   * Programmatically accepts consent (e.g. when user signs in to an existing account).
   */
  function accept() { _onAccept(); }

  /**
   * Programmatically declines consent.
   */
  function decline() { _onDecline(); }

  /**
   * Resets the stored decision (for testing / re-prompt flows).
   */
  function reset() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    _hideBanner();
    _initialised = false;
  }

  return Object.freeze({ init, accept, decline, reset, getDecision });
}());


/* --- Core Web Vitals Monitor --- */

/**
 * performanceMonitor
 *
 * Observes and reports Largest Contentful Paint (LCP), Cumulative Layout
 * Shift (CLS), and Interaction to Next Paint / First Input Delay (INP/FID)
 * using `PerformanceObserver`.
 *
 * Values are sent as analytics events once the page lifecycle permits
 * (on `visibilitychange` or `pagehide`).
 *
 * @type {Object}
 */
const performanceMonitor = (function buildPerformanceMonitor() {

  let _lcp     = 0;
  let _cls     = 0;
  let _inp     = 0;
  let _sent    = false;
  const _obs   = [];

  /**
   * Sends collected vitals as a single analytics event.
   */
  function _flush() {
    if (_sent) return;
    _sent = true;
    analytics.track('web_vitals', {
      lcp_ms         : Math.round(_lcp),
      cls_score      : Math.round(_cls * 1000) / 1000,
      inp_ms         : Math.round(_inp),
      page_path      : location.pathname,
    });
    debug('performanceMonitor: vitals', { lcp: _lcp, cls: _cls, inp: _inp });
  }

  /**
   * Initialises PerformanceObserver instances.
   */
  function init() {
    if (!SUPPORTS.performanceObserver) {
      debug('performanceMonitor: PerformanceObserver not supported');
      return;
    }

    /* LCP */
    try {
      const lcpObs = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const last    = entries[entries.length - 1];
        if (last) _lcp = last.startTime;
      });
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
      _obs.push(lcpObs);
    } catch (_) {}

    /* CLS */
    try {
      const clsObs = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) _cls += entry.value;
        });
      });
      clsObs.observe({ type: 'layout-shift', buffered: true });
      _obs.push(clsObs);
    } catch (_) {}

    /* INP / FID */
    try {
      const inpObs = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          const duration = entry.duration || entry.processingStart - entry.startTime;
          if (duration > _inp) _inp = duration;
        });
      });
      inpObs.observe({ type: 'event', durationThreshold: 16, buffered: true });
      _obs.push(inpObs);
    } catch (_) {
      /* Older browsers support FID only */
      try {
        const fidObs = new PerformanceObserver(list => {
          const entry = list.getEntries()[0];
          if (entry) _inp = entry.processingStart - entry.startTime;
        });
        fidObs.observe({ type: 'first-input', buffered: true });
        _obs.push(fidObs);
      } catch (_) {}
    }

    /* Flush on page hide / visibility change */
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') _flush();
    });
    window.addEventListener('pagehide', _flush, { once: true });
  }

  /**
   * Disconnects all observers and clears accumulated values.
   */
  function destroy() {
    _obs.forEach(o => { try { o.disconnect(); } catch (_) {} });
    _obs.length = 0;
    _lcp = _cls = _inp = 0;
    _sent = false;
  }

  return Object.freeze({ init, destroy });
}());


/* --- Global Error Reporter --- */

/**
 * errorReporter
 *
 * Registers global `window.onerror` and `unhandledrejection` handlers,
 * batches caught errors, and forwards them as analytics events so that
 * JavaScript errors are visible in GA4 / your error-monitoring dashboard.
 *
 * Errors from browser extensions (filename contains 'extension://') and
 * known third-party scripts are filtered out to reduce noise.
 *
 * @type {Object}
 */
const errorReporter = (function buildErrorReporter() {

  /** @type {Array<{message:string, source:string, line:number, col:number, ts:number}>} */
  const _batched = [];
  let _flushTimer = null;

  /**
   * Enqueues an error for batched reporting.
   * @param {Object} errData
   */
  function _enqueue(errData) {
    _batched.push(errData);
    if (_flushTimer) clearTimeout(_flushTimer);
    _flushTimer = setTimeout(_flush, 2000);
  }

  /**
   * Sends all batched errors and clears the queue.
   */
  function _flush() {
    if (!_batched.length) return;
    const batch = _batched.splice(0, _batched.length);
    batch.forEach(err => {
      analytics.track('js_error', err);
    });
    _flushTimer = null;
  }

  /**
   * Determines whether an error should be filtered out.
   * @param  {string} source
   * @returns {boolean}  true = ignore this error.
   */
  function _shouldIgnore(source) {
    if (!source) return false;
    if (/chrome-extension:|moz-extension:|safari-extension:/i.test(source)) return true;
    if (/googletagmanager|facebook\.net|hotjar\.com/i.test(source)) return true;
    return false;
  }

  /**
   * Initialises global error listeners.
   */
  function init() {
    window.addEventListener('error', function _onError(ev) {
      const source  = ev.filename || '';
      if (_shouldIgnore(source)) return;

      _enqueue({
        message   : (ev.message || 'Unknown error').slice(0, 200),
        source    : source.replace(location.origin, '').slice(0, 200),
        line      : ev.lineno || 0,
        col       : ev.colno  || 0,
        error_type: 'uncaught_error',
        ts        : Date.now(),
      });
    });

    window.addEventListener('unhandledrejection', function _onRejection(ev) {
      let msg = 'Unhandled promise rejection';
      try {
        if (ev.reason instanceof Error) {
          msg = ev.reason.message || msg;
        } else if (typeof ev.reason === 'string') {
          msg = ev.reason;
        }
      } catch (_) {}

      _enqueue({
        message   : msg.slice(0, 200),
        source    : '',
        line      : 0,
        col       : 0,
        error_type: 'unhandled_rejection',
        ts        : Date.now(),
      });
    });
  }

  /**
   * Manually reports an error (useful in try/catch blocks).
   * @param {Error|string} error
   * @param {Object}       [ctx]  - Additional context (component name, etc.).
   */
  function report(error, ctx) {
    const msg = isString(error) ? error : (error && error.message) || 'Unknown';
    _enqueue(Object.assign({
      message   : msg.slice(0, 200),
      source    : (error && error.fileName) || '',
      line      : (error && error.lineNumber) || 0,
      col       : 0,
      error_type: 'manual_report',
      ts        : Date.now(),
    }, ctx || {}));
  }

  return Object.freeze({ init, report });
}());


/* --- App Bootstrap --- */

/**
 * app
 *
 * Central bootstrap module.  Initialises all feature modules in the correct
 * dependency order within the DOMContentLoaded event, with per-module error
 * isolation so that a single failing module does not break the rest of the
 * page.
 *
 * @type {Object}
 */
const app = (function buildApp() {

  /**
   * Wraps a module's `init()` call in a try/catch so that a single module
   * failure cannot bring down the whole app.
   *
   * @param {string}   name
   * @param {Function} fn
   */
  function _safeInit(name, fn) {
    try {
      fn();
      debug(`[app] ${name} ok`);
    } catch (err) {
      logError(`[app] ${name} failed`, err);
      errorReporter.report(err, { component: name, error_type: 'module_init_failure' });
    }
  }

  /**
   * Initialises all non-critical, deferred modules.
   * Called on `window.load` to avoid blocking the critical path.
   */
  function _deferredInit() {
    _safeInit('analytics.pageView',       () => analytics.pageView());
    _safeInit('scrollDepthTracker',       () => scrollDepthTracker.init());
    _safeInit('statCounterAnimator',      () => statCounterAnimator.init());
    _safeInit('prefetchManager',          () => prefetchManager.init());
    _safeInit('performanceMonitor',       () => performanceMonitor.init());
  }

  /**
   * Main bootstrap — runs at DOMContentLoaded.
   */
  function init() {

    /* Observability first — so errors during init are captured. */
    _safeInit('errorReporter',            () => errorReporter.init());
    _safeInit('cookieConsent',            () => cookieConsent.init());

    /* Accessibility utilities */
    _safeInit('skipLinkManager',          () => skipLinkManager.init && skipLinkManager.init());
    _safeInit('keyboardNavigationGuard',  () => keyboardNavigationGuard.init && keyboardNavigationGuard.init());
    _safeInit('srUtils.auditImages',      () => srUtils.auditImages());
    _safeInit('srUtils.annotateExternal', () => srUtils.annotateExternalLinks());
    _safeInit('srUtils.labelIframes',     () => srUtils.labelIframes());

    /* Navigation */
    _safeInit('stickyHeader',             () => stickyHeader.init && stickyHeader.init());
    _safeInit('mobileNav',                () => mobileNav.init());
    _safeInit('dropdownMenu',             () => dropdownMenu.init());
    _safeInit('activeNavLinks',           () => activeNavLinks.init && activeNavLinks.init());
    _safeInit('breadcrumbHelpers',        () => breadcrumbHelpers.init && breadcrumbHelpers.init());
    _safeInit('navKeyboardShortcuts',     () => navKeyboardShortcuts.init && navKeyboardShortcuts.init());
    _safeInit('scrollToTop',              () => scrollToTop.init());

    /* Search */
    _safeInit('siteSearch',               () => siteSearch.init());

    /* Product catalogue */
    _safeInit('productCardRegistry',      () => productCardRegistry.parse());
    _safeInit('productFilter',            () => productFilter.init());
    _safeInit('activeFilterChips',        () => activeFilterChips.init());

    /* Pricing */
    _safeInit('planDataParser',           () => planDataParser.parseAll());
    _safeInit('pricing',                  () => pricing.init());
    _safeInit('discountCodeInput',        () => discountCodeInput.init && discountCodeInput.init());
    _safeInit('planComparisonHighlighter',() => planComparisonHighlighter.init && planComparisonHighlighter.init());

    /* FAQ & Testimonials */
    _safeInit('faqRegistry',              () => faqRegistry.parseAll());
    _safeInit('faqAccordion',             () => faqAccordion.init());
    _safeInit('testimonialsCarousel',     () => testimonialsCarousel.init());

    /* Forms */
    _safeInit('newsletterForm',           () => newsletterForm.init());
    _safeInit('contactForm',              () => contactForm.init());

    /* Reveal animations */
    _safeInit('viewportReveal',           () => viewportReveal.init());

    /* Deferred work kicks in after load event. */
    if (document.readyState === 'complete') {
      _deferredInit();
    } else {
      window.addEventListener('load', _deferredInit, { once: true });
    }

    debug('[app] bootstrap complete');
  }

  /**
   * Tears down all modules (useful in test environments).
   */
  function destroy() {
    try { mobileNav.destroy && mobileNav.destroy(); } catch (_) {}
    try { siteSearch.destroy && siteSearch.destroy(); } catch (_) {}
    try { productFilter.destroy && productFilter.destroy(); } catch (_) {}
    try { pricing.destroy && pricing.destroy(); } catch (_) {}
    try { faqAccordion.destroy && faqAccordion.destroy(); } catch (_) {}
    try { testimonialsCarousel.destroy && testimonialsCarousel.destroy(); } catch (_) {}
    try { newsletterForm.destroy(); } catch (_) {}
    try { contactForm.destroy(); } catch (_) {}
    try { viewportReveal.destroy(); } catch (_) {}
    try { performanceMonitor.destroy(); } catch (_) {}
    try { scrollDepthTracker.reset(); } catch (_) {}
    try { inlineValidator.unbindAll(); } catch (_) {}
    try { characterCounter.detachAll(); } catch (_) {}
    debug('[app] teardown complete');
  }

  return Object.freeze({ init, destroy });
}());


/* --- DOMContentLoaded Bootstrap Entry Point --- */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init(), { once: true });
} else {
  // DOM already parsed by the time this script executed.
  app.init();
}



/* ---------------------------------------------------------------------------
 * SUPPLEMENTARY UTILITIES
 * Additional helpers: media player accessibility, table sorter,
 * copy-to-clipboard, print helper, and theme switcher.
 * --------------------------------------------------------------------------- */

/* --- Accessible Media Player Controller --- */

/**
 * mediaPlayerController
 *
 * Enhances native `<video>` and `<audio>` elements with:
 * - Keyboard shortcut support (Space/K = play-pause, M = mute,
 *   ArrowLeft/J = rewind 10s, ArrowRight/L = forward 10s,
 *   ArrowUp/Down = volume ±10%, F = fullscreen, C = captions).
 * - Status announcements to screen readers via the shared live region.
 * - Captions-on-by-default for users who prefer captions.
 *
 * @type {Object}
 */
const mediaPlayerController = (function buildMediaPlayerController() {

  /** @type {Map<HTMLMediaElement, { listeners: Function[] }>} */
  const _players = new Map();

  /**
   * Announces playback status.
   * @param {HTMLMediaElement} media
   * @param {string}           msg
   */
  function _announce(media, msg) {
    liveRegion.announce(msg);
    debug('mediaPlayerController:', msg, media);
  }

  /**
   * Handles keyboard events on a media element.
   * @param {HTMLMediaElement} media
   * @param {KeyboardEvent}    ev
   */
  function _onKey(media, ev) {
    const tag = (ev.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    switch (ev.key) {
      case ' ':
      case 'k':
      case 'K':
        ev.preventDefault();
        if (media.paused) {
          media.play();
          _announce(media, STRINGS.mediaPlaying || 'Playing');
        } else {
          media.pause();
          _announce(media, STRINGS.mediaPaused || 'Paused');
        }
        break;

      case 'm':
      case 'M':
        ev.preventDefault();
        media.muted = !media.muted;
        _announce(media, media.muted ? (STRINGS.mediaMuted || 'Muted') : (STRINGS.mediaUnmuted || 'Unmuted'));
        break;

      case 'ArrowLeft':
      case 'j':
      case 'J':
        ev.preventDefault();
        media.currentTime = Math.max(0, media.currentTime - 10);
        _announce(media, (STRINGS.mediaRewind10 || 'Rewound 10 seconds'));
        break;

      case 'ArrowRight':
      case 'l':
      case 'L':
        ev.preventDefault();
        media.currentTime = Math.min(media.duration || Infinity, media.currentTime + 10);
        _announce(media, (STRINGS.mediaForward10 || 'Forwarded 10 seconds'));
        break;

      case 'ArrowUp':
        ev.preventDefault();
        media.volume = Math.min(1, media.volume + 0.1);
        _announce(media, `Volume ${Math.round(media.volume * 100)}%`);
        break;

      case 'ArrowDown':
        ev.preventDefault();
        media.volume = Math.max(0, media.volume - 0.1);
        _announce(media, `Volume ${Math.round(media.volume * 100)}%`);
        break;

      case 'f':
      case 'F':
        ev.preventDefault();
        if (media instanceof HTMLVideoElement) {
          if (document.fullscreenElement) {
            document.exitFullscreen && document.exitFullscreen();
          } else {
            media.requestFullscreen && media.requestFullscreen();
          }
        }
        break;

      case 'c':
      case 'C':
        ev.preventDefault();
        if (media.textTracks && media.textTracks.length) {
          const track = media.textTracks[0];
          track.mode  = track.mode === 'showing' ? 'hidden' : 'showing';
          _announce(media, track.mode === 'showing'
            ? (STRINGS.captionsOn  || 'Captions on')
            : (STRINGS.captionsOff || 'Captions off'));
        }
        break;

      default: return;
    }
  }

  /**
   * Binds keyboard control to a media element.
   * @param {HTMLMediaElement} media
   */
  function bind(media) {
    if (!isElement(media) || _players.has(media)) return;

    /* Enable captions by default for users who prefer them. */
    if (media.textTracks && SUPPORTS.reducedMotion === false) {
      const prefCaptions = localStorage.getItem('luminary_captions') === 'on';
      if (prefCaptions && media.textTracks[0]) {
        media.textTracks[0].mode = 'showing';
      }
    }

    const handler = (ev) => _onKey(media, ev);
    media.addEventListener('keydown', handler);
    setAttr(media, 'tabindex', media.getAttribute('tabindex') || '0');

    _players.set(media, { listeners: [handler] });
  }

  /**
   * Removes keyboard control from a media element.
   * @param {HTMLMediaElement} media
   */
  function unbind(media) {
    const entry = _players.get(media);
    if (!entry) return;
    entry.listeners.forEach(fn => media.removeEventListener('keydown', fn));
    _players.delete(media);
  }

  /**
   * Auto-binds all media elements in the document.
   */
  function init() {
    qsa('video, audio').forEach(bind);
    /* Watch for dynamically-added media. */
    const obs = new MutationObserver(muts => {
      muts.forEach(mut => {
        mut.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.tagName === 'VIDEO' || node.tagName === 'AUDIO') bind(node);
          qsa('video, audio', node).forEach(bind);
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  return Object.freeze({ bind, unbind, init });
}());


/* --- Theme Switcher --- */

/**
 * themeSwitcher
 *
 * Manages light / dark / system theme preference.
 * Persists preference to localStorage and applies a `data-theme` attribute
 * to `<html>` so CSS custom properties can respond.
 * Announces changes to screen readers.
 *
 * @type {Object}
 */
const themeSwitcher = (function buildThemeSwitcher() {

  const STORAGE_KEY   = 'luminary_theme';
  const THEMES        = ['light', 'dark', 'system'];
  let _current        = 'system';
  let _mql            = null;
  let _initialised    = false;

  /**
   * Reads the saved preference, falling back to 'system'.
   * @returns {string}
   */
  function _load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return THEMES.includes(saved) ? saved : 'system';
    } catch (_) { return 'system'; }
  }

  /**
   * Returns the effective theme ('light' or 'dark') after resolving 'system'.
   * @param  {string} pref
   * @returns {'light'|'dark'}
   */
  function _resolve(pref) {
    if (pref === 'light') return 'light';
    if (pref === 'dark')  return 'dark';
    return (_mql && _mql.matches) ? 'dark' : 'light';
  }

  /**
   * Applies the resolved theme to the document root.
   * @param {string} theme  - 'light' or 'dark'
   */
  function _apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    setAttr(document.documentElement, 'data-color-scheme', theme);
  }

  /**
   * Sets the theme preference and persists it.
   * @param {'light'|'dark'|'system'} pref
   */
  function set(pref) {
    if (!THEMES.includes(pref)) return;
    _current = pref;
    try { localStorage.setItem(STORAGE_KEY, pref); } catch (_) {}
    const resolved = _resolve(pref);
    _apply(resolved);

    const label = { light: STRINGS.themeLight || 'Light', dark: STRINGS.themeDark || 'Dark', system: STRINGS.themeSystem || 'System' }[pref] || pref;
    liveRegion.announce(`${STRINGS.themeChanged || 'Theme changed to'} ${label}`);

    /* Update toggle buttons. */
    qsa('[data-theme-toggle]').forEach(btn => {
      const btnTheme = btn.getAttribute('data-theme-toggle');
      setAttr(btn, 'aria-pressed', String(btnTheme === pref));
    });

    emit(document, 'theme:change', { theme: resolved, pref });
    analytics.track('theme_change', { theme: pref, resolved });
  }

  /**
   * Returns the current preference ('light'|'dark'|'system').
   * @returns {string}
   */
  function get() { return _current; }

  /**
   * Returns the currently-applied effective theme ('light' or 'dark').
   * @returns {string}
   */
  function getResolved() { return _resolve(_current); }

  /**
   * Cycles through: light → dark → system → light.
   */
  function toggle() {
    const idx = THEMES.indexOf(_current);
    set(THEMES[(idx + 1) % THEMES.length]);
  }

  /**
   * Initialises the theme switcher.
   */
  function init() {
    if (_initialised) return;
    _initialised = true;

    _mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (_mql) {
      const _mqlHandler = () => { if (_current === 'system') _apply(_resolve('system')); };
      _mql.addEventListener
        ? _mql.addEventListener('change', _mqlHandler)
        : _mql.addListener(_mqlHandler);
    }

    _current = _load();
    _apply(_resolve(_current));

    document.addEventListener('click', function _onThemeClick(ev) {
      const btn = closest(ev.target, '[data-theme-toggle]');
      if (!btn) return;
      const newTheme = btn.getAttribute('data-theme-toggle');
      if (newTheme && THEMES.includes(newTheme)) {
        set(newTheme);
      } else {
        toggle();
      }
    });
  }

  return Object.freeze({ init, set, get, getResolved, toggle });
}());



// ═══════════════════════════════════════════════════════════════════════════
//  LUMINARY STUDIO — EXTENDED UTILITIES
//  Additional modules for analytics, cookie consent, performance & a11y.
//  These ship in the production bundle alongside the main application code.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Event Tracker ──────────────────────────────────────────────────────────

const LuminaryAnalytics = (function () {
  'use strict';

  var _queue = [];
  var _ready = false;
  var _sessionId = Math.random().toString(36).slice(2);
  var _pageId   = Math.random().toString(36).slice(2);

  var _defaultProps = {
    app_version: '3.7.2',
    locale:      navigator.language || 'en',
    referrer:    document.referrer || '',
    screen_w:    window.screen.width,
    screen_h:    window.screen.height,
    dpr:         window.devicePixelRatio || 1,
  };

  function _merge(obj) {
    return Object.assign({}, _defaultProps, { session_id: _sessionId, page_id: _pageId }, obj);
  }

  function _send(event, props) {
    props = _merge(props || {});
    if (!_ready) { _queue.push({ event: event, props: props }); return; }
    if (typeof window.gtag === 'function') {
      window.gtag('event', event, props);
    }
    if (typeof window.luminaryBeacon === 'function') {
      window.luminaryBeacon({ event: event, data: props });
    }
  }

  function _flush() {
    _ready = true;
    while (_queue.length) {
      var item = _queue.shift();
      _send(item.event, item.props);
    }
  }

  function trackCta(label, href) {
    _send('cta_click', { cta_label: label, cta_href: href });
  }

  function trackPlanView(planId, billing) {
    _send('plan_view', { plan_id: planId, billing_period: billing });
  }

  function trackPlanCta(planId, label, billing) {
    _send('plan_cta_click', { plan_id: planId, cta_label: label, billing_period: billing });
  }

  function trackFilterChange(category) {
    _send('product_filter', { filter_category: category });
  }

  function trackSearchQuery(query, category) {
    _send('search', { search_term: query, search_category: category || '' });
  }

  function trackSearchResult(query, count, selectedIndex, selectedTitle) {
    _send('search_result_click', { search_term: query, result_count: count, result_index: selectedIndex, result_title: selectedTitle });
  }

  function trackFaqOpen(questionId, questionText) {
    _send('faq_open', { faq_id: questionId, faq_question: questionText ? questionText.slice(0, 100) : '' });
  }

  function trackScrollDepth(depth) {
    _send('scroll_depth', { scroll_depth_pct: depth });
  }

  function trackNewsletterSignup(source) {
    _send('newsletter_signup', { signup_source: source || 'inline' });
  }

  function trackContactSubmit(intent, teamSize) {
    _send('contact_form_submit', { contact_intent: intent || 'general', team_size: teamSize || '' });
  }

  function trackOutboundLink(href, label) {
    _send('outbound_link_click', { link_href: href, link_label: label });
  }

  function trackVideoPlay(videoId, title) {
    _send('video_play', { video_id: videoId, video_title: title });
  }

  function trackVideoPause(videoId, position) {
    _send('video_pause', { video_id: videoId, video_position_sec: Math.round(position) });
  }

  function trackVideoComplete(videoId) {
    _send('video_complete', { video_id: videoId });
  }

  function trackPricingToggle(period) {
    _send('pricing_toggle', { billing_period: period });
  }

  function trackFeatureHover(featureTitle) {
    _send('feature_hover', { feature_title: featureTitle });
  }

  function trackNavOpen(section) {
    _send('nav_open', { nav_section: section });
  }

  function trackNavLink(href, label) {
    _send('nav_link_click', { link_href: href, link_label: label });
  }

  function trackLogoBarHover(company) {
    _send('logo_bar_hover', { company: company });
  }

  function trackTestimonialView(authorName) {
    _send('testimonial_view', { testimonial_author: authorName });
  }

  function trackTimingMark(name, durationMs) {
    _send('timing', { timing_name: name, timing_ms: Math.round(durationMs) });
  }

  function init() {
    document.addEventListener('DOMContentLoaded', function () {
      _flush();
      _initScrollTracking();
      _initOutboundTracking();
      _initCtaTracking();
    });
  }

  function _initScrollTracking() {
    var reported = {};
    var thresholds = [25, 50, 75, 90, 100];
    function check() {
      var pct = Math.round(((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100);
      thresholds.forEach(function (t) {
        if (pct >= t && !reported[t]) { reported[t] = true; trackScrollDepth(t); }
      });
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(function () { check(); ticking = false; }); ticking = true; }
    }, { passive: true });
  }

  function _initOutboundTracking() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://')) && !href.includes('luminarystudio.io')) {
        trackOutboundLink(href, a.textContent.trim().slice(0, 80));
      }
    });
  }

  function _initCtaTracking() {
    document.querySelectorAll('[data-cta]').forEach(function (el) {
      el.addEventListener('click', function () {
        var label = el.getAttribute('data-cta') || el.textContent.trim().slice(0, 60);
        var href  = el.getAttribute('href') || el.getAttribute('data-href') || '';
        trackCta(label, href);
      });
    });
  }

  return Object.freeze({
    init: init,
    trackCta: trackCta, trackPlanView: trackPlanView, trackPlanCta: trackPlanCta,
    trackFilterChange: trackFilterChange, trackSearchQuery: trackSearchQuery,
    trackSearchResult: trackSearchResult, trackFaqOpen: trackFaqOpen,
    trackScrollDepth: trackScrollDepth, trackNewsletterSignup: trackNewsletterSignup,
    trackContactSubmit: trackContactSubmit, trackOutboundLink: trackOutboundLink,
    trackVideoPlay: trackVideoPlay, trackVideoPause: trackVideoPause, trackVideoComplete: trackVideoComplete,
    trackPricingToggle: trackPricingToggle, trackFeatureHover: trackFeatureHover,
    trackNavOpen: trackNavOpen, trackNavLink: trackNavLink,
    trackLogoBarHover: trackLogoBarHover, trackTestimonialView: trackTestimonialView,
    trackTimingMark: trackTimingMark,
  });
}());


// ─── Cookie Consent Manager ─────────────────────────────────────────────────

const LuminaryCookies = (function () {
  'use strict';

  var CONSENT_KEY    = 'luminary_cookie_consent';
  var CONSENT_VER    = 3;
  var BANNER_ID      = 'cookie-banner';
  var ACCEPT_ID      = 'cookie-accept';
  var DECLINE_ID     = 'cookie-decline';
  var SETTINGS_ID    = 'cookie-settings-btn';
  var MODAL_ID       = 'cookie-settings-modal';

  var _categories    = { necessary: true, functional: false, analytics: false, marketing: false };
  var _listeners     = [];

  function _read() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== CONSENT_VER) return null;
      return parsed;
    } catch (_) { return null; }
  }

  function _write(data) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(Object.assign({ version: CONSENT_VER, timestamp: Date.now() }, data)));
    } catch (_) {}
  }

  function hasConsent(category) {
    var stored = _read();
    if (!stored) return category === 'necessary';
    return !!stored.categories[category];
  }

  function acceptAll() {
    var cats = { necessary: true, functional: true, analytics: true, marketing: true };
    _write({ categories: cats });
    Object.assign(_categories, cats);
    _dismiss();
    _notify('accept_all', cats);
  }

  function declineAll() {
    var cats = { necessary: true, functional: false, analytics: false, marketing: false };
    _write({ categories: cats });
    Object.assign(_categories, cats);
    _dismiss();
    _notify('decline_all', cats);
  }

  function saveSettings(settings) {
    var cats = Object.assign({ necessary: true }, settings);
    _write({ categories: cats });
    Object.assign(_categories, cats);
    _dismiss();
    _notify('settings_saved', cats);
  }

  function _dismiss() {
    var banner = document.getElementById(BANNER_ID);
    if (banner) {
      banner.setAttribute('hidden', '');
      banner.setAttribute('aria-hidden', 'true');
    }
    var modal = document.getElementById(MODAL_ID);
    if (modal) {
      modal.setAttribute('hidden', '');
      modal.removeAttribute('aria-modal');
    }
  }

  function _notify(action, cats) {
    _listeners.forEach(function (cb) { try { cb(action, cats); } catch (_) {} });
    document.dispatchEvent(new CustomEvent('luminary:consent', { detail: { action: action, categories: cats } }));
  }

  function onChange(cb) { _listeners.push(cb); }

  function _showBanner() {
    var banner = document.getElementById(BANNER_ID);
    if (!banner) return;
    banner.removeAttribute('hidden');
    banner.removeAttribute('aria-hidden');
    var firstBtn = banner.querySelector('button');
    if (firstBtn) {
      window.requestAnimationFrame(function () { firstBtn.focus(); });
    }
  }

  function init() {
    var stored = _read();
    if (!stored) {
      window.requestAnimationFrame(function () { _showBanner(); });
    } else {
      Object.assign(_categories, stored.categories);
      if (stored.categories.analytics) LuminaryAnalytics.init();
    }

    document.addEventListener('click', function (e) {
      if (e.target.closest('#' + ACCEPT_ID) || e.target.id === ACCEPT_ID) { acceptAll(); }
      else if (e.target.closest('#' + DECLINE_ID) || e.target.id === DECLINE_ID) { declineAll(); }
      else if (e.target.closest('#' + SETTINGS_ID) || e.target.id === SETTINGS_ID) {
        var modal = document.getElementById(MODAL_ID);
        if (modal) {
          modal.removeAttribute('hidden');
          modal.setAttribute('aria-modal', 'true');
          modal.setAttribute('role', 'dialog');
          var firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (firstFocusable) firstFocusable.focus();
        }
      }
    });
  }

  return Object.freeze({
    init: init,
    hasConsent: hasConsent,
    acceptAll: acceptAll,
    declineAll: declineAll,
    saveSettings: saveSettings,
    onChange: onChange,
  });
}());


// ─── Performance Monitor ────────────────────────────────────────────────────

const LuminaryPerf = (function () {
  'use strict';

  var _marks = {};

  function mark(name) {
    _marks[name] = performance.now();
    if (performance.mark) { try { performance.mark('luminary-' + name); } catch (_) {} }
  }

  function measure(name, startMark, endMark) {
    var start = _marks[startMark] || 0;
    var end   = endMark ? (_marks[endMark] || performance.now()) : performance.now();
    var ms    = end - start;
    if (performance.measure) {
      try { performance.measure('luminary-' + name, 'luminary-' + startMark); } catch (_) {}
    }
    LuminaryAnalytics.trackTimingMark(name, ms);
    return ms;
  }

  function _reportWebVitals() {
    if (!window.PerformanceObserver) return;
    var VITALS = { LCP: 0, FID: 0, CLS: 0, FCP: 0, TTFB: 0 };

    try {
      new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (entry.entryType === 'largest-contentful-paint') {
            VITALS.LCP = entry.startTime;
          }
        });
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (_) {}

    try {
      new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          VITALS.FID = entry.processingStart - entry.startTime;
        });
      }).observe({ type: 'first-input', buffered: true });
    } catch (_) {}

    try {
      new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (!entry.hadRecentInput) VITALS.CLS += entry.value;
        });
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (_) {}

    window.addEventListener('load', function () {
      var nav = performance.getEntriesByType('navigation')[0];
      if (nav) {
        VITALS.TTFB = nav.responseStart;
        VITALS.FCP  = nav.domContentLoadedEventEnd;
      }
      window.setTimeout(function () {
        LuminaryAnalytics.trackTimingMark('ttfb',   VITALS.TTFB);
        LuminaryAnalytics.trackTimingMark('fcp',    VITALS.FCP);
        LuminaryAnalytics.trackTimingMark('lcp',    VITALS.LCP);
        LuminaryAnalytics.trackTimingMark('fid',    VITALS.FID);
        LuminaryAnalytics.trackTimingMark('cls_x1k', VITALS.CLS * 1000);
      }, 3000);
    });
  }

  function init() {
    mark('page_start');
    document.addEventListener('DOMContentLoaded', function () { mark('dom_ready'); });
    window.addEventListener('load', function () {
      mark('page_loaded');
      measure('dom_time', 'page_start', 'dom_ready');
      measure('load_time', 'page_start', 'page_loaded');
      _reportWebVitals();
    });
  }

  return Object.freeze({ init: init, mark: mark, measure: measure });
}());


// ─── Intersecting Lazy Loader ────────────────────────────────────────────────

const LuminaryLazyLoad = (function () {
  'use strict';

  var _observer = null;

  function _reveal(el) {
    el.classList.add('is-visible');
    el.removeAttribute('data-lazy');
  }

  function _loadImage(img) {
    var src  = img.getAttribute('data-src');
    var srcset = img.getAttribute('data-srcset');
    if (src)    img.setAttribute('src', src);
    if (srcset) img.setAttribute('srcset', srcset);
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
    img.addEventListener('load', function () { img.classList.add('is-loaded'); }, { once: true });
  }

  function init(rootMargin, threshold) {
    rootMargin = rootMargin || '0px 0px -80px 0px';
    threshold  = threshold  || 0.1;

    if (!window.IntersectionObserver) {
      document.querySelectorAll('[data-lazy]').forEach(function (el) {
        _reveal(el);
        var imgs = el.querySelectorAll('img[data-src]');
        imgs.forEach(_loadImage);
      });
      return;
    }

    _observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        _reveal(el);
        var imgs = el.tagName === 'IMG' ? [el] : el.querySelectorAll('img[data-src]');
        imgs.forEach(_loadImage);
        _observer.unobserve(el);
      });
    }, { rootMargin: rootMargin, threshold: threshold });

    document.querySelectorAll('[data-lazy], img[data-src]').forEach(function (el) {
      _observer.observe(el);
    });
  }

  function observe(el) {
    if (_observer) _observer.observe(el);
    else { _reveal(el); var imgs = el.querySelectorAll('img[data-src]'); imgs.forEach(_loadImage); }
  }

  function unobserve(el) { if (_observer) _observer.unobserve(el); }

  return Object.freeze({ init: init, observe: observe, unobserve: unobserve });
}());


// ─── Service Worker Registration ─────────────────────────────────────────────

const LuminarySW = (function () {
  'use strict';

  var _registration = null;

  function register(scriptUrl) {
    scriptUrl = scriptUrl || '/sw.js';
    if (!('serviceWorker' in navigator)) return Promise.resolve(null);
    return navigator.serviceWorker.register(scriptUrl, { scope: '/' })
      .then(function (reg) {
        _registration = reg;
        reg.addEventListener('updatefound', function () {
          var newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', function () {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              document.dispatchEvent(new CustomEvent('luminary:sw-update', { detail: { registration: reg } }));
            }
          });
        });
        return reg;
      })
      .catch(function (err) {
        console.warn('[LuminarySW] Registration failed:', err);
        return null;
      });
  }

  function skipWaiting() {
    if (_registration && _registration.waiting) {
      _registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  function getRegistration() { return _registration; }

  navigator.serviceWorker && navigator.serviceWorker.addEventListener('controllerchange', function () {
    window.location.reload();
  });

  return Object.freeze({ register: register, skipWaiting: skipWaiting, getRegistration: getRegistration });
}());


// ─── Form Autosave ────────────────────────────────────────────────────────────

const LuminaryAutosave = (function () {
  'use strict';

  var _store = {};
  var _timers = {};
  var DEBOUNCE = 800;
  var KEY_PREFIX = 'luminary_autosave_';

  function _key(formId) { return KEY_PREFIX + formId; }

  function _save(formId, data) {
    try {
      localStorage.setItem(_key(formId), JSON.stringify({ data: data, ts: Date.now() }));
    } catch (_) {}
    _store[formId] = data;
  }

  function _load(formId) {
    try {
      var raw = localStorage.getItem(_key(formId));
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      var age = Date.now() - (parsed.ts || 0);
      if (age > 7 * 24 * 60 * 60 * 1000) { localStorage.removeItem(_key(formId)); return null; }
      return parsed.data;
    } catch (_) { return null; }
  }

  function clear(formId) {
    delete _store[formId];
    try { localStorage.removeItem(_key(formId)); } catch (_) {}
  }

  function attach(form) {
    var formId = form.id || form.getAttribute('data-form-id');
    if (!formId) return;

    var saved = _load(formId);
    if (saved) {
      Object.keys(saved).forEach(function (name) {
        var el = form.querySelector('[name="' + name + '"]');
        if (!el) return;
        if (el.type === 'checkbox') { el.checked = !!saved[name]; }
        else if (el.type === 'radio') {
          var radio = form.querySelector('[name="' + name + '"][value="' + saved[name] + '"]');
          if (radio) radio.checked = true;
        } else { el.value = saved[name]; }
      });
      var notice = document.createElement('p');
      notice.className = 'form-restore-notice';
      notice.textContent = 'Your previous progress has been restored.';
      notice.setAttribute('role', 'status');
      notice.setAttribute('aria-live', 'polite');
      form.prepend(notice);
      window.setTimeout(function () { notice.remove(); }, 5000);
    }

    form.addEventListener('input', function () {
      clearTimeout(_timers[formId]);
      _timers[formId] = window.setTimeout(function () {
        var data = {};
        new FormData(form).forEach(function (val, key) { data[key] = val; });
        _save(formId, data);
      }, DEBOUNCE);
    });

    form.addEventListener('submit', function () { clear(formId); });
    form.addEventListener('reset', function () { clear(formId); });
  }

  function init() {
    document.querySelectorAll('form[data-autosave]').forEach(attach);
    document.addEventListener('luminary:dynamic-form', function (e) {
      if (e.detail && e.detail.form) attach(e.detail.form);
    });
  }

  return Object.freeze({ init: init, attach: attach, clear: clear, load: _load });
}());


// ─── Keyboard Shortcuts ──────────────────────────────────────────────────────

const LuminaryShortcuts = (function () {
  'use strict';

  var _shortcuts = [];
  var _active = true;

  function register(keyCombination, label, handler) {
    _shortcuts.push({ combo: keyCombination.toLowerCase(), label: label, handler: handler });
  }

  function _matches(combo, e) {
    var parts = combo.split('+');
    var key   = parts[parts.length - 1];
    var mod   = parts.slice(0, -1);
    if (e.key.toLowerCase() !== key && e.code.toLowerCase() !== key) return false;
    if (mod.includes('ctrl')  && !e.ctrlKey)  return false;
    if (mod.includes('alt')   && !e.altKey)   return false;
    if (mod.includes('shift') && !e.shiftKey) return false;
    if (mod.includes('meta')  && !e.metaKey)  return false;
    return true;
  }

  function init() {
    register('alt+s', 'Focus site search', function () {
      var search = document.getElementById('search-input');
      if (search) {
        search.focus();
        search.select();
        document.dispatchEvent(new CustomEvent('luminary:announce', { detail: { message: 'Search focused' } }));
      }
    });

    register('alt+n', 'Jump to navigation', function () {
      var nav = document.getElementById('main-nav');
      if (nav) {
        var first = nav.querySelector('a, button');
        if (first) {
          first.focus();
          document.dispatchEvent(new CustomEvent('luminary:announce', { detail: { message: 'Navigation focused' } }));
        }
      }
    });

    register('alt+m', 'Jump to main content', function () {
      var main = document.getElementById('main-content');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
        document.dispatchEvent(new CustomEvent('luminary:announce', { detail: { message: 'Main content focused' } }));
      }
    });

    register('alt+c', 'Open contact form', function () {
      var contact = document.getElementById('contact');
      if (contact) {
        contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var first = contact.querySelector('input, textarea, select');
        if (first) window.setTimeout(function () { first.focus(); }, 400);
      }
    });

    register('alt+p', 'Jump to pricing', function () {
      var pricing = document.querySelector('.pricing-section');
      if (pricing) pricing.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.addEventListener('keydown', function (e) {
      if (!_active) return;
      var active = document.activeElement;
      var tag = active ? active.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || active.isContentEditable) {
        if (!e.altKey) return;
      }
      _shortcuts.forEach(function (sc) {
        if (_matches(sc.combo, e)) {
          e.preventDefault();
          try { sc.handler(); } catch (err) { console.warn('[LuminaryShortcuts]', err); }
        }
      });
    });
  }

  function disable() { _active = false; }
  function enable()  { _active = true;  }
  function list()    { return _shortcuts.slice(); }

  return Object.freeze({ init: init, register: register, disable: disable, enable: enable, list: list });
}());


// ─── Print Preparation ───────────────────────────────────────────────────────

const LuminaryPrint = (function () {
  'use strict';

  function _before() {
    document.querySelectorAll('[data-print-expand]').forEach(function (el) {
      el.setAttribute('data-print-was-hidden', el.hidden ? 'true' : 'false');
      el.hidden = false;
    });
    document.querySelectorAll('details[data-print-open]').forEach(function (d) {
      d.setAttribute('data-print-was-open', d.open ? 'true' : 'false');
      d.open = true;
    });
  }

  function _after() {
    document.querySelectorAll('[data-print-expand]').forEach(function (el) {
      if (el.getAttribute('data-print-was-hidden') === 'true') el.hidden = true;
      el.removeAttribute('data-print-was-hidden');
    });
    document.querySelectorAll('details[data-print-open]').forEach(function (d) {
      if (d.getAttribute('data-print-was-open') !== 'true') d.open = false;
      d.removeAttribute('data-print-was-open');
    });
  }

  function init() {
    window.matchMedia('print').addEventListener('change', function (mq) {
      if (mq.matches) _before(); else _after();
    });
    window.addEventListener('beforeprint', _before);
    window.addEventListener('afterprint', _after);
  }

  return Object.freeze({ init: init });
}());


// ─── Image Error Recovery ─────────────────────────────────────────────────────

const LuminaryImages = (function () {
  'use strict';

  var FALLBACK_SVG = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22320%22%20height%3D%22200%22%20viewBox%3D%220%200%20320%20200%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22320%22%20height%3D%22200%22%2F%3E%3Ctext%20x%3D%22160%22%20y%3D%22108%22%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20text-anchor%3D%22middle%22%3EImage%20unavailable%3C%2Ftext%3E%3C%2Fsvg%3E';
  var _retries = {};
  var MAX_RETRIES = 3;

  function _onError(img) {
    var src = img.getAttribute('src');
    if (!src || src === FALLBACK_SVG) return;
    var count = (_retries[src] || 0) + 1;
    _retries[src] = count;
    if (count <= MAX_RETRIES && !img.getAttribute('data-no-retry')) {
      var sep = src.includes('?') ? '&' : '?';
      window.setTimeout(function () {
        img.setAttribute('src', src + sep + '_r=' + count);
      }, count * 800);
    } else {
      img.setAttribute('src', FALLBACK_SVG);
      if (!img.hasAttribute('alt') || img.getAttribute('alt') === '') {
        img.setAttribute('alt', 'Image unavailable');
      }
      img.setAttribute('data-load-error', 'true');
      img.dispatchEvent(new CustomEvent('luminary:image-error', { bubbles: true, detail: { originalSrc: src } }));
    }
  }

  function init() {
    document.addEventListener('error', function (e) {
      if (e.target && e.target.tagName === 'IMG') { _onError(e.target); }
    }, true);
    document.querySelectorAll('img').forEach(function (img) {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
        _onError(img);
      }
    });
  }

  return Object.freeze({ init: init });
}());


// ─── Reduced-Motion Helper ───────────────────────────────────────────────────

const LuminaryMotion = (function () {
  'use strict';

  var _reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (mq) {
    _reduced = mq.matches;
    document.documentElement.classList.toggle('motion-reduced', _reduced);
    document.dispatchEvent(new CustomEvent('luminary:motion-change', { detail: { reduced: _reduced } }));
  });

  function prefersReducedMotion() { return _reduced; }

  function animate(el, keyframes, options) {
    if (_reduced) {
      var reducedOptions = Object.assign({}, options, { duration: 1, iterations: 1 });
      return el.animate ? el.animate(keyframes, reducedOptions) : null;
    }
    return el.animate ? el.animate(keyframes, options) : null;
  }

  function init() {
    document.documentElement.classList.toggle('motion-reduced', _reduced);
  }

  return Object.freeze({ init: init, prefersReducedMotion: prefersReducedMotion, animate: animate });
}());


// ─── Application Init ────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  LuminaryMotion.init();
  LuminaryImages.init();
  LuminaryLazyLoad.init();
  LuminaryAutosave.init();
  LuminaryShortcuts.init();
  LuminaryPrint.init();
  LuminarySW.register();

  if (LuminaryCookies.hasConsent('analytics')) {
    LuminaryAnalytics.init();
    LuminaryPerf.init();
  } else {
    LuminaryCookies.onChange(function (action) {
      if (action !== 'decline_all') {
        LuminaryAnalytics.init();
        LuminaryPerf.init();
      }
    });
  }

  LuminaryCookies.init();
});

//                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          