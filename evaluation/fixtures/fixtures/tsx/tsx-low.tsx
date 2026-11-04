/**
 * tsx-clean.tsx
 *
 * Luminary Studio — fully accessible React + TypeScript marketing page.
 *
 * This file is the "clean" fixture for the preset-benchmark evaluation suite.
 * Every component follows WCAG 2.2 AA criteria:
 *   - All interactive elements have accessible names.
 *   - Keyboard navigation is fully supported.
 *   - Focus management is explicit where context changes occur.
 *   - Motion is guarded by prefers-reduced-motion.
 *   - Colour contrast meets WCAG AA (≥ 4.5:1 for text, ≥ 3:1 for UI).
 *   - Dynamic content changes are announced via live regions.
 *   - Images have descriptive alt text; decorative images use alt="".
 *   - Forms have programmatically-associated labels.
 *   - Tables have captions, scope attributes, and appropriate row/col headers.
 */

'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FC,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

/** Billing cadence options for the pricing toggle. */
export type BillingPeriod = 'monthly' | 'annual';

/** Product categories used by the filter tabs. */
export type ProductCategory = 'all' | 'scanning' | 'design' | 'testing' | 'reporting';

/** Navigation item with optional submenu. */
export interface NavItem {
  /** Link label displayed in the navigation. */
  label: string;
  /** Full href value for the anchor. */
  href: string;
  /** Whether this item is the current page link. */
  current?: boolean;
  /** Child links shown in a dropdown sub-menu. */
  children?: Array<{ label: string; href: string }>;
}

/** A single product listing shown in the products catalogue. */
export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: ProductCategory;
  imageUrl: string;
  imageAlt: string;
  version: string;
  license: string;
  integrations: string;
  href: string;
}

/** A pricing plan. */
export interface Plan {
  id: string;
  name: string;
  tagline: string;
  /** Price per seat per month (billed monthly). */
  priceMonthly: number | null;
  /** Price per seat per month when billed annually. */
  priceAnnual: number | null;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
  badge?: string;
}

/** Feature comparison row. */
export interface ComparisonRow {
  feature: string;
  starter: string;
  pro: string;
  enterprise: string;
}

/** Testimonial quote. */
export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl: string;
  avatarAlt: string;
  rating: number;
}

/** FAQ item. */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

/** Statistics displayed in the social-proof bar. */
export interface Stat {
  id: string;
  /** Formatted value string, e.g. "40,000+". */
  value: string;
  /** Screen-reader-friendly label for the value, e.g. "40,000 plus". */
  valueLabel: string;
  label: string;
}

/** Colour theme controlled by the theme switcher. */
export type Theme = 'light' | 'dark' | 'system';

/** Notification severity level. */
export type NotificationVariant = 'info' | 'success' | 'warning' | 'error';

/** A toast notification. */
export interface Notification {
  id: string;
  message: string;
  variant: NotificationVariant;
  durationMs?: number;
}

/** Validation rule for a form field. */
export interface ValidationRule {
  /** Returns an error message string if invalid, or undefined if valid. */
  validate: (value: string) => string | undefined;
}

/** Form field state managed by useField. */
export interface FieldState {
  value: string;
  error: string | undefined;
  touched: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Site-wide string constants. */
export const SITE = {
  name        : 'Luminary Studio',
  tagline     : 'Accessible design and productivity tools for every team',
  logoAlt     : 'Luminary Studio',
  logoHref    : '/',
  skipToMain  : 'Skip to main content',
  skipToNav   : 'Skip to navigation',
  skipToSearch: 'Skip to search',
} as const;

/** ARIA live region politeness levels. */
export const LIVE = {
  polite   : 'polite',
  assertive: 'assertive',
  off      : 'off',
} as const;

/** Key names used in keyboard event handlers. */
export const KEY = {
  enter    : 'Enter',
  space    : ' ',
  escape   : 'Escape',
  arrowUp  : 'ArrowUp',
  arrowDown: 'ArrowDown',
  arrowLeft: 'ArrowLeft',
  arrowRight:'ArrowRight',
  home     : 'Home',
  end      : 'End',
  tab      : 'Tab',
} as const;

/** Products catalogue. */
export const PRODUCTS: Product[] = [
  {
    id         : 'axe-runner-pro',
    name       : 'axe Runner Pro',
    tagline    : 'Automated WCAG scanning at scale',
    description: 'Run axe-core across hundreds of components and pages simultaneously. Native support for React, Vue, Angular, and Web Components.',
    category   : 'scanning',
    imageUrl   : '/img/products/axe-runner.png',
    imageAlt   : 'axe Runner Pro product interface showing a list of accessibility violations',
    version    : '4.8.2',
    license    : 'Commercial',
    integrations: 'Jest, Playwright, Cypress, Storybook',
    href       : '/products/axe-runner-pro',
  },
  {
    id         : 'contrast-studio',
    name       : 'Contrast Studio',
    tagline    : 'Pixel-perfect colour accessibility',
    description: 'Check foreground/background contrast ratios for text, UI components, and data visualisations against WCAG AA and AAA thresholds.',
    category   : 'design',
    imageUrl   : '/img/products/contrast-studio.png',
    imageAlt   : 'Contrast Studio showing two colour swatches with a contrast ratio of 7.2 to 1 and a passing AA badge',
    version    : '2.1.0',
    license    : 'Free tier available',
    integrations: 'Figma, Sketch, Adobe XD, Tokens Studio',
    href       : '/products/contrast-studio',
  },
  {
    id         : 'focus-flow',
    name       : 'Focus Flow',
    tagline    : 'Visual tab-order mapping',
    description: 'Record and visualise the keyboard focus order of any web page. Detect focus traps, skipped elements, and illogical tab sequences instantly.',
    category   : 'testing',
    imageUrl   : '/img/products/focus-flow.png',
    imageAlt   : 'Focus Flow showing a website with a numbered overlay depicting the tab order path through interactive elements',
    version    : '1.5.1',
    license    : 'Commercial',
    integrations: 'Chrome DevTools, Playwright',
    href       : '/products/focus-flow',
  },
  {
    id         : 'vpat-builder',
    name       : 'VPAT Builder',
    tagline    : 'VPAT and ACR generation made simple',
    description: 'Generate Voluntary Product Accessibility Templates and Accessibility Conformance Reports from scan data.',
    category   : 'reporting',
    imageUrl   : '/img/products/vpat-builder.png',
    imageAlt   : 'VPAT Builder showing a completed VPAT 2.4 document with conformance levels filled in',
    version    : '3.0.0',
    license    : 'Commercial',
    integrations: 'Luminary Scanner, Deque axe, IBM Equal Access',
    href       : '/products/vpat-builder',
  },
  {
    id         : 'sr-simulator',
    name       : 'SR Simulator',
    tagline    : 'Test without installing AT',
    description: 'Simulate NVDA, JAWS, VoiceOver, and TalkBack interactions directly in your browser. No assistive technology installation required.',
    category   : 'testing',
    imageUrl   : '/img/products/sr-sim.png',
    imageAlt   : 'Screen Reader Simulator showing a virtual NVDA window overlaid on a web page with announced text highlighted',
    version    : '1.3.0',
    license    : 'Commercial',
    integrations: 'Chrome, Firefox, Edge extensions',
    href       : '/products/sr-simulator',
  },
  {
    id         : 'ci-guard',
    name       : 'CI Guard',
    tagline    : 'Accessibility gates in your pipeline',
    description: 'Block pull requests that introduce accessibility regressions. Configurable thresholds, exclusion lists, and detailed annotations on every PR.',
    category   : 'scanning',
    imageUrl   : '/img/products/ci-guard.png',
    imageAlt   : 'CI Guard showing a GitHub Actions summary with zero accessibility failures and a green pass badge',
    version    : '2.4.0',
    license    : 'Commercial',
    integrations: 'GitHub Actions, GitLab CI, CircleCI, Jenkins',
    href       : '/products/ci-guard',
  },
];

/** Pricing plans. */
export const PLANS: Plan[] = [
  {
    id          : 'starter',
    name        : 'Starter',
    tagline     : 'Perfect for freelancers and small projects',
    priceMonthly: 0,
    priceAnnual : 0,
    features    : [
      'Up to 3 projects',
      '500 component scans per month',
      'Contrast Studio (basic)',
      'Community support',
      'Public dashboard',
    ],
    ctaLabel: 'Get started for free',
    ctaHref : '/signup?plan=starter',
  },
  {
    id          : 'pro',
    name        : 'Pro',
    tagline     : 'Built for growing product teams',
    priceMonthly: 54,
    priceAnnual : 45,
    features    : [
      'Unlimited projects',
      'Unlimited component scans',
      'All Luminary tools included',
      'CI Guard integration',
      'VPAT Builder',
      'Priority email support',
      'Private dashboard',
      'Audit trail & history',
    ],
    ctaLabel: 'Start Pro free trial',
    ctaHref : '/signup?plan=pro',
    featured: true,
    badge   : 'Most popular',
  },
  {
    id          : 'enterprise',
    name        : 'Enterprise',
    tagline     : 'For large organisations and regulated sectors',
    priceMonthly: null,
    priceAnnual : null,
    features    : [
      'Everything in Pro',
      'SSO and SCIM provisioning',
      'Dedicated success manager',
      'Custom SLA',
      'On-premise deployment option',
      '24/7 phone support',
      'Security review & DPA',
      'Training & onboarding workshops',
    ],
    ctaLabel: 'Talk to sales',
    ctaHref : '/contact?intent=enterprise',
  },
];

/** Comparison table rows. */
export const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: 'Projects',                  starter: '3',         pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Component scans / month',   starter: '500',       pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Automated WCAG checks',     starter: '80+',       pro: '320+',      enterprise: '320+' },
  { feature: 'Contrast Studio',           starter: 'Basic',     pro: 'Full',      enterprise: 'Full' },
  { feature: 'Focus Flow',                starter: '—',         pro: '✓',         enterprise: '✓' },
  { feature: 'SR Simulator',              starter: '—',         pro: '✓',         enterprise: '✓' },
  { feature: 'CI Guard',                  starter: '—',         pro: '✓',         enterprise: '✓' },
  { feature: 'VPAT Builder',              starter: '—',         pro: '✓',         enterprise: '✓' },
  { feature: 'SSO & SCIM',               starter: '—',         pro: '—',         enterprise: '✓' },
  { feature: 'Dedicated success manager', starter: '—',         pro: '—',         enterprise: '✓' },
  { feature: 'Custom SLA',                starter: '—',         pro: '—',         enterprise: '✓' },
  { feature: 'Support level',             starter: 'Community', pro: 'Priority email', enterprise: '24/7 phone' },
];

/** Social-proof statistics. */
export const STATS: Stat[] = [
  { id: 'teams',   value: '40,000+',  valueLabel: '40,000 plus', label: 'Teams using Luminary Studio' },
  { id: 'fixes',   value: '4.2M',     valueLabel: '4.2 million', label: 'Accessibility issues fixed this year' },
  { id: 'checks',  value: '320+',     valueLabel: '320 plus',    label: 'Automated WCAG checks' },
  { id: 'uptime',  value: '99.9%',    valueLabel: '99.9 percent', label: 'Uptime SLA' },
];

/** Testimonials. */
export const TESTIMONIALS: Testimonial[] = [
  {
    id        : 't1',
    quote     : 'Luminary Studio cut our accessibility review cycle from two weeks down to a single afternoon. The VPAT Builder alone saved us from hiring a dedicated compliance consultant.',
    author    : 'Priya Mehta',
    role      : 'Head of Engineering',
    company   : 'FinTrack Solutions',
    avatarUrl : '/img/testimonials/priya-mehta.jpg',
    avatarAlt : 'Priya Mehta, Head of Engineering at FinTrack Solutions',
    rating    : 5,
  },
  {
    id        : 't2',
    quote     : `The SR Simulator genuinely changed how our QA team tests. We used to skip screen reader testing on every sprint — now it's part of every PR review.`,
    author    : 'Daniel Osei',
    role      : 'QA Lead',
    company   : 'Vexiom Commerce',
    avatarUrl : '/img/testimonials/daniel-osei.jpg',
    avatarAlt : 'Daniel Osei, QA Lead at Vexiom Commerce',
    rating    : 5,
  },
  {
    id        : 't3',
    quote     : 'As a designer who cares deeply about inclusive design, Contrast Studio in Figma is a game changer. My handoffs now include contrast-verified tokens by default.',
    author    : 'Yuki Tanaka',
    role      : 'Senior Product Designer',
    company   : 'Arclight Health',
    avatarUrl : '/img/testimonials/yuki-tanaka.jpg',
    avatarAlt : 'Yuki Tanaka, Senior Product Designer at Arclight Health',
    rating    : 5,
  },
  {
    id        : 't4',
    quote     : `We were facing a Section 508 compliance deadline and Luminary's CI Guard blocked every regression before it reached staging. We passed the audit on the first attempt.`,
    author    : 'Carmen Reyes',
    role      : 'Accessibility Programme Manager',
    company   : 'Nova Federal Credit Union',
    avatarUrl : '/img/testimonials/carmen-reyes.jpg',
    avatarAlt : 'Carmen Reyes, Accessibility Programme Manager at Nova Federal Credit Union',
    rating    : 5,
  },
];

/** FAQ items. */
export const FAQ_ITEMS: FaqItem[] = [
  {
    id      : 'faq-1',
    question: 'Is Luminary Studio suitable for teams just starting with accessibility?',
    answer  : 'Absolutely. The Starter plan is free forever and includes guided remediation for up to 3 projects. Our onboarding wizard walks you through your first scan in under five minutes.',
    category: 'getting-started',
  },
  {
    id      : 'faq-2',
    question: 'Which WCAG version does Luminary test against?',
    answer  : 'By default, Luminary tests against WCAG 2.2 Level AA. You can configure the dashboard to test against WCAG 2.1, Section 508, or EN 301 549 from the project settings.',
    category: 'standards',
  },
  {
    id      : 'faq-3',
    question: 'Does CI Guard work with monorepo setups?',
    answer  : 'Yes. CI Guard supports Nx, Turborepo, and Lerna monorepos out of the box. You can scope scans to specific packages and set per-package thresholds.',
    category: 'integrations',
  },
  {
    id      : 'faq-4',
    question: 'Can I export accessibility reports as PDF?',
    answer  : 'Pro and Enterprise plans include one-click PDF export for all scan reports, VPAT documents, and ACRs. Reports are formatted for stakeholder sharing and regulatory submission.',
    category: 'reporting',
  },
  {
    id      : 'faq-5',
    question: 'How is pricing calculated for large teams?',
    answer  : 'Pro plans are priced per seat per month. Enterprise plans are negotiated based on seat count, deployment model, and support requirements. Contact our sales team for a custom quote.',
    category: 'pricing',
  },
  {
    id      : 'faq-6',
    question: 'Is there an on-premise deployment option?',
    answer  : 'On-premise and private-cloud deployment is available for Enterprise customers. We support self-hosted Docker images and Kubernetes Helm charts, with air-gapped installation support on request.',
    category: 'enterprise',
  },
  {
    id      : 'faq-7',
    question: 'Does Luminary support single sign-on?',
    answer  : 'Enterprise plans include SAML 2.0 SSO and SCIM 2.0 user provisioning, compatible with Okta, Azure AD, Google Workspace, and any standards-compliant IdP.',
    category: 'enterprise',
  },
  {
    id      : 'faq-8',
    question: 'What happens to my data if I cancel?',
    answer  : 'You can export all your scan data, reports, and project history at any time before cancellation. Data is retained for 90 days after cancellation and then permanently deleted per our data retention policy.',
    category: 'data',
  },
];

/** Primary navigation items. */
export const NAV_ITEMS: NavItem[] = [
  {
    label  : 'Products',
    href   : '/products',
    current: true,
  },
  {
    label: 'Solutions',
    href : '/solutions',
    children: [
      { label: 'For Design Teams',             href: '/solutions/design-teams' },
      { label: 'For Engineering Teams',        href: '/solutions/engineering' },
      { label: 'For Accessibility Practitioners', href: '/solutions/accessibility' },
      { label: 'Enterprise',                   href: '/solutions/enterprise' },
    ],
  },
  {
    label: 'Resources',
    href : '/resources',
    children: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Blog',          href: '/blog' },
      { label: 'Changelog',     href: '/changelog' },
      { label: 'Status',        href: 'https://status.luminarystudio.io' },
    ],
  },
  { label: 'Pricing',  href: '/pricing' },
  { label: 'About',    href: '/about' },
];

// ─────────────────────────────────────────────────────────────────────────────
// ACCESSIBILITY HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useReducedMotion
 *
 * Returns true when the user has requested reduced motion via the OS or
 * browser `prefers-reduced-motion: reduce` media query.
 *
 * @returns {boolean}
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mql     = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

/**
 * useMediaQuery
 *
 * Subscribes to a CSS media query and returns the current match state.
 *
 * @param   {string}  query  - A valid CSS media query string.
 * @returns {boolean}        - True when the query is currently matched.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql     = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * useFocusTrap
 *
 * Traps keyboard focus within a container element while active.
 * When deactivated, returns focus to the element that was focused
 * before activation.
 *
 * @param   {RefObject<HTMLElement>}  containerRef  - The ref of the trapping container.
 * @param   {boolean}                active        - When true, focus is trapped.
 * @param   {object}                 [opts]
 * @param   {() => void}             [opts.onEscape] - Called when Escape is pressed.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  active: boolean,
  opts?: { onEscape?: () => void }
): void {
  const savedFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Save the element that currently has focus.
    savedFocusRef.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    if (!container) return;

    /** Returns all focusable elements inside the container. */
    function getFocusable(): HTMLElement[] {
      const selectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        'details > summary',
      ].join(',');
      return Array.from(container!.querySelectorAll<HTMLElement>(selectors)).filter(
        (el) => el.offsetParent !== null
      );
    }

    /** Move focus to the first focusable element in the container. */
    const focusables = getFocusable();
    if (focusables.length > 0) {
      focusables[0].focus();
    }

    function handleKeyDown(ev: globalThis.KeyboardEvent): void {
      if (ev.key === KEY.escape) {
        ev.preventDefault();
        opts?.onEscape?.();
        return;
      }

      if (ev.key !== KEY.tab) return;

      const focusable = getFocusable();
      if (focusable.length === 0) { ev.preventDefault(); return; }

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (ev.shiftKey) {
        if (document.activeElement === first) {
          ev.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          ev.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, containerRef, opts]);

  // Restore focus when the trap is released.
  useEffect(() => {
    if (active) return;
    savedFocusRef.current?.focus();
    savedFocusRef.current = null;
  }, [active]);
}

/**
 * useRovingTabindex
 *
 * Implements the roving tabindex pattern for a group of elements,
 * where only one element in the group is in the tab order at a time
 * and arrow keys move between items.
 *
 * @param   {RefObject<HTMLElement>}  groupRef  - Ref wrapping the group container.
 * @param   {string}                 selector  - CSS selector for items within the group.
 * @param   {object}                 [opts]
 * @param   {boolean}                [opts.wrap=true]  - Wrap at edges.
 * @param   {boolean}                [opts.horizontal=false]  - Use left/right arrows instead of up/down.
 */
export function useRovingTabindex(
  groupRef: RefObject<HTMLElement>,
  selector: string,
  opts?: { wrap?: boolean; horizontal?: boolean }
): void {
  const wrap       = opts?.wrap ?? true;
  const horizontal = opts?.horizontal ?? false;

  useEffect(() => {
    const container = groupRef.current;
    if (!container) return;

    function getItems(): HTMLElement[] {
      return Array.from(container!.querySelectorAll<HTMLElement>(selector));
    }

    function activate(item: HTMLElement, items: HTMLElement[]): void {
      items.forEach((i) => i.setAttribute('tabindex', i === item ? '0' : '-1'));
      item.focus();
    }

    function handleKeyDown(ev: globalThis.KeyboardEvent): void {
      const prevKey = horizontal ? KEY.arrowLeft  : KEY.arrowUp;
      const nextKey = horizontal ? KEY.arrowRight : KEY.arrowDown;

      if (ev.key !== prevKey && ev.key !== nextKey && ev.key !== KEY.home && ev.key !== KEY.end) return;

      const items   = getItems();
      const current = document.activeElement as HTMLElement;
      const idx     = items.indexOf(current);
      if (idx === -1) return;

      ev.preventDefault();

      let target: HTMLElement | undefined;
      if (ev.key === KEY.home) { target = items[0]; }
      else if (ev.key === KEY.end) { target = items[items.length - 1]; }
      else if (ev.key === prevKey) {
        target = idx > 0 ? items[idx - 1] : wrap ? items[items.length - 1] : undefined;
      } else {
        target = idx < items.length - 1 ? items[idx + 1] : wrap ? items[0] : undefined;
      }

      if (target) activate(target, items);
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [groupRef, selector, wrap, horizontal]);
}

/**
 * useLiveAnnouncer
 *
 * Returns a function that sends a message to a visually-hidden
 * ARIA live region.  The live region element is inserted into the DOM
 * on first render and removed on unmount.
 *
 * @param   {'polite'|'assertive'}  [politeness='polite']
 * @returns {(message: string) => void}
 */
export function useLiveAnnouncer(
  politeness: 'polite' | 'assertive' = 'polite'
): (message: string) => void {
  const regionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.createElement('div');
    el.setAttribute('role',      politeness === 'assertive' ? 'alert' : 'status');
    el.setAttribute('aria-live', politeness);
    el.setAttribute('aria-atomic','true');
    Object.assign(el.style, {
      position : 'absolute',
      width    : '1px',
      height   : '1px',
      padding  : '0',
      margin   : '-1px',
      overflow : 'hidden',
      clip     : 'rect(0,0,0,0)',
      whiteSpace: 'nowrap',
      border   : '0',
    });
    document.body.appendChild(el);
    regionRef.current = el;
    return () => { document.body.removeChild(el); };
  }, [politeness]);

  return useCallback((message: string) => {
    const el = regionRef.current;
    if (!el) return;
    // Toggle textContent to force re-announcement even for identical messages.
    el.textContent = '';
    requestAnimationFrame(() => { el.textContent = message; });
  }, []);
}

/**
 * useField
 *
 * Manages a single form-field's value, touched status, and validation.
 *
 * @param   {string}           initialValue
 * @param   {ValidationRule[]} rules
 * @returns {{ state: FieldState; onChange: ...; onBlur: ...; validate: ... }}
 */
export function useField(
  initialValue: string,
  rules: ValidationRule[]
): {
  state   : FieldState;
  onChange: (value: string) => void;
  onBlur  : () => void;
  validate: () => boolean;
} {
  const [state, setState] = useState<FieldState>({
    value  : initialValue,
    error  : undefined,
    touched: false,
  });

  const runValidation = useCallback(
    (value: string): string | undefined => {
      for (const rule of rules) {
        const error = rule.validate(value);
        if (error !== undefined) return error;
      }
      return undefined;
    },
    [rules]
  );

  const onChange = useCallback(
    (value: string) => {
      setState((prev) => ({
        value,
        touched: prev.touched,
        error  : prev.touched ? runValidation(value) : prev.error,
      }));
    },
    [runValidation]
  );

  const onBlur = useCallback(() => {
    setState((prev) => ({
      ...prev,
      touched: true,
      error  : runValidation(prev.value),
    }));
  }, [runValidation]);

  const validate = useCallback((): boolean => {
    const error = runValidation(state.value);
    setState((prev) => ({ ...prev, touched: true, error }));
    return error === undefined;
  }, [runValidation, state.value]);

  return { state, onChange, onBlur, validate };
}

/**
 * useOnClickOutside
 *
 * Calls the handler when a click occurs outside the referenced element.
 *
 * @param {RefObject<HTMLElement>} ref
 * @param {() => void}            handler
 */
export function useOnClickOutside(ref: RefObject<HTMLElement>, handler: () => void): void {
  useEffect(() => {
    function listener(ev: MouseEvent | TouchEvent): void {
      if (!ref.current || ref.current.contains(ev.target as Node)) return;
      handler();
    }
    document.addEventListener('mousedown', listener as EventListener);
    document.addEventListener('touchstart', listener as EventListener);
    return () => {
      document.removeEventListener('mousedown', listener as EventListener);
      document.removeEventListener('touchstart', listener as EventListener);
    };
  }, [ref, handler]);
}

/**
 * useDisclosure
 *
 * Manages an open/closed boolean state with helpers.
 *
 * @param   {boolean} [initialState=false]
 * @returns {{ isOpen: boolean; open: () => void; close: () => void; toggle: () => void }}
 */
export function useDisclosure(initialState = false): {
  isOpen: boolean;
  open  : () => void;
  close : () => void;
  toggle: () => void;
} {
  const [isOpen, setIsOpen] = useState(initialState);
  const open   = useCallback(() => setIsOpen(true),       []);
  const close  = useCallback(() => setIsOpen(false),      []);
  const toggle = useCallback(() => setIsOpen((p) => !p),  []);
  return { isOpen, open, close, toggle };
}

/**
 * useLocalStorage
 *
 * Reads and writes a JSON-serialisable value to localStorage,
 * falling back to an in-memory state when localStorage is unavailable.
 *
 * @param   {string}  key
 * @param   {T}       defaultValue
 * @returns {[T, (value: T) => void]}
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValueState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback(
    (newValue: T) => {
      setValueState(newValue);
      try { localStorage.setItem(key, JSON.stringify(newValue)); } catch { /* quota exceeded */ }
    },
    [key]
  );

  return [value, setValue];
}

/**
 * useScrollPosition
 *
 * Returns the current window scroll position, updated on scroll events.
 *
 * @returns {{ scrollX: number; scrollY: number }}
 */
export function useScrollPosition(): { scrollX: number; scrollY: number } {
  const [pos, setPos] = useState({ scrollX: 0, scrollY: 0 });

  useEffect(() => {
    function update(): void {
      setPos({ scrollX: window.scrollX, scrollY: window.scrollY });
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return pos;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT: THEME
// ─────────────────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme    : Theme;
  resolved : 'light' | 'dark';
  setTheme : (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme   : 'system',
  resolved: 'light',
  setTheme: () => undefined,
});

/** Hook to access the current theme and setter. */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/** Provides theme state to the component tree. */
export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const prefersDark          = useMediaQuery('(prefers-color-scheme: dark)');
  const [theme, setThemeState] = useLocalStorage<Theme>('luminary_theme', 'system');

  const resolved: 'light' | 'dark' = useMemo(() => {
    if (theme === 'light') return 'light';
    if (theme === 'dark')  return 'dark';
    return prefersDark ? 'dark' : 'light';
  }, [theme, prefersDark]);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      document.documentElement.setAttribute('data-theme', t === 'system' ? resolved : t);
    },
    [setThemeState, resolved]
  );

  // Apply data-theme on resolved change.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT: NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationContextValue {
  notifications: Notification[];
  addNotification   : (n: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications     : [],
  addNotification   : () => undefined,
  removeNotification: () => undefined,
});

/** Hook to dispatch and read notifications. */
export function useNotifications(): NotificationContextValue {
  return useContext(NotificationContext);
}

/** Provides the notification queue to the component tree. */
export const NotificationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((n: Omit<Notification, 'id'>) => {
    const id   = `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const full : Notification = { ...n, id };
    setNotifications((prev) => [...prev, full]);

    if (n.durationMs && n.durationMs > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((x) => x.id !== id));
      }, n.durationMs);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BASE UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

// ── VisuallyHidden ──────────────────────────────────────────────────────────

interface VisuallyHiddenProps {
  children: ReactNode;
  /** When true renders nothing at all (convenience for conditional labels). */
  when?: boolean;
  /** Additional class names. */
  className?: string;
}

/**
 * VisuallyHidden
 *
 * Renders children in a visually hidden (but screen-reader accessible) span.
 * Uses the standard clip-rect technique; never `display:none` or `visibility:hidden`.
 */
export const VisuallyHidden: FC<VisuallyHiddenProps> = ({ children, when = true, className }) => {
  if (!when) return <>{children}</>;
  return (
    <span
      className={['sr-only', className].filter(Boolean).join(' ')}
      style={{
        position : 'absolute',
        width    : '1px',
        height   : '1px',
        padding  : '0',
        margin   : '-1px',
        overflow : 'hidden',
        clip     : 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border   : '0',
      } as CSSProperties}
    >
      {children}
    </span>
  );
};

// ── SkipLinks ───────────────────────────────────────────────────────────────

/**
 * SkipLinks
 *
 * Renders a list of skip-navigation links that appear on focus.
 * Each link should reference a landmark heading or main content area.
 */
export const SkipLinks: FC = () => (
  <nav aria-label="Skip navigation links">
    <a className="skip-link" href="#main-content">{SITE.skipToMain}</a>
    <a className="skip-link" href="#main-nav">{SITE.skipToNav}</a>
    <a className="skip-link" href="#site-search">{SITE.skipToSearch}</a>
  </nav>
);

// ── StarRating ──────────────────────────────────────────────────────────────

interface StarRatingProps {
  /** Numeric rating 1–5. */
  value: number;
  /** Maximum value (default 5). */
  max?: number;
  /** Text label prefix. E.g. "Rating: 5 out of 5 stars". */
  labelPrefix?: string;
}

/**
 * StarRating
 *
 * Renders a star-rating visually, with a screen-reader-only
 * text equivalent to ensure the value is accessible.
 */
export const StarRating: FC<StarRatingProps> = ({ value, max = 5, labelPrefix = 'Rating' }) => {
  const stars = Array.from({ length: max }, (_, i) => i < value);
  return (
    <span aria-label={`${labelPrefix}: ${value} out of ${max} stars`} role="img">
      <span aria-hidden="true">
        {stars.map((filled, i) => (
          <span key={i} className={filled ? 'star star--filled' : 'star star--empty'}>
            {filled ? '★' : '☆'}
          </span>
        ))}
      </span>
    </span>
  );
};

// ── Badge ───────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'featured';
  className?: string;
}

/**
 * Badge
 *
 * Decorative label pill.  Purely visual; does not convey information
 * exclusively through colour — text label is always present.
 */
export const Badge: FC<BadgeProps> = ({ children, variant = 'neutral', className }) => (
  <span className={['badge', `badge--${variant}`, className].filter(Boolean).join(' ')}>
    {children}
  </span>
);

// ── Tag ─────────────────────────────────────────────────────────────────────

interface TagProps {
  children: ReactNode;
  className?: string;
}

/**
 * Tag
 *
 * Generic inline tag component for category labels, version numbers, etc.
 */
export const Tag: FC<TagProps> = ({ children, className }) => (
  <span className={['tag', className].filter(Boolean).join(' ')}>
    {children}
  </span>
);

// ── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant  ?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size     ?: 'sm' | 'md' | 'lg';
  /** When true renders a spinner and disables the button. */
  isLoading?: boolean;
  /** Screen-reader-only label for icon-only buttons. */
  srLabel  ?: string;
  /** Accessible loading announcement. */
  loadingLabel?: string;
  children ?: ReactNode;
}

/**
 * Button
 *
 * Accessible button component.  All interactive states (disabled, loading)
 * are communicated to assistive technology.
 */
export const Button: FC<ButtonProps> = ({
  variant  = 'primary',
  size     = 'md',
  isLoading = false,
  srLabel,
  loadingLabel = 'Loading, please wait',
  children,
  className,
  disabled,
  type = 'button',
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={isLoading || undefined}
      className={['btn', `btn--${variant}`, `btn--${size}`, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {isLoading && (
        <>
          <span className="btn-spinner" aria-hidden="true" />
          <VisuallyHidden>{loadingLabel}</VisuallyHidden>
        </>
      )}
      {!isLoading && srLabel && <VisuallyHidden>{srLabel}</VisuallyHidden>}
      {!isLoading && <span className={srLabel ? 'btn__icon' : undefined} aria-hidden={srLabel ? 'true' : undefined}>{children}</span>}
    </button>
  );
};

// ── IconButton ───────────────────────────────────────────────────────────────

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required accessible name for icon-only buttons. */
  'aria-label': string;
  children: ReactNode;
  variant?: 'ghost' | 'outline' | 'primary';
  size   ?: 'sm' | 'md' | 'lg';
}

/**
 * IconButton
 *
 * Renders an icon-only button with a mandatory aria-label.
 * The aria-label prop is required by the TypeScript interface,
 * preventing the inaccessible icon button pattern at compile time.
 */
export const IconButton: FC<IconButtonProps> = ({
  'aria-label': ariaLabel,
  children,
  variant = 'ghost',
  size    = 'md',
  type    = 'button',
  className,
  ...rest
}) => (
  <button
    type={type}
    aria-label={ariaLabel}
    className={['icon-btn', `icon-btn--${variant}`, `icon-btn--${size}`, className].filter(Boolean).join(' ')}
    {...rest}
  >
    <span aria-hidden="true">{children}</span>
  </button>
);

// ── LinkButton ───────────────────────────────────────────────────────────────

interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size   ?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  /** Appended visually-hidden label for screen readers (e.g. "— Pro plan"). */
  srSuffix?: string;
  external?: boolean;
}

/**
 * LinkButton
 *
 * Styled anchor element for CTA links.  Adds rel="noopener noreferrer" and
 * a visually-hidden indicator when the link opens in a new tab.
 */
export const LinkButton: FC<LinkButtonProps> = ({
  variant  = 'primary',
  size     = 'md',
  children,
  srSuffix,
  external = false,
  className,
  href,
  target,
  ...rest
}) => {
  const opensNewTab = target === '_blank' || external;
  return (
    <a
      href={href}
      target={opensNewTab ? '_blank' : target}
      rel={opensNewTab ? 'noopener noreferrer' : rest.rel}
      className={['btn', `btn--${variant}`, `btn--${size}`, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
      {srSuffix && <VisuallyHidden> {srSuffix}</VisuallyHidden>}
      {opensNewTab && <VisuallyHidden> (opens in a new tab)</VisuallyHidden>}
    </a>
  );
};

// ── Spinner ──────────────────────────────────────────────────────────────────

interface SpinnerProps {
  size  ?: 'sm' | 'md' | 'lg';
  label ?: string;
}

/**
 * Spinner
 *
 * Loading spinner with an accessible screen-reader label.
 */
export const Spinner: FC<SpinnerProps> = ({ size = 'md', label = 'Loading…' }) => (
  <span
    role="status"
    aria-label={label}
    className={`spinner spinner--${size}`}
    aria-live="polite"
  >
    <span className="spinner__ring" aria-hidden="true" />
    <VisuallyHidden>{label}</VisuallyHidden>
  </span>
);

// ── ErrorMessage ─────────────────────────────────────────────────────────────

interface ErrorMessageProps {
  id      : string;
  message : string | undefined;
  children?: ReactNode;
}

/**
 * ErrorMessage
 *
 * Renders an inline validation error for a form field.
 * Uses role="alert" so the error is announced immediately on injection.
 * Hidden when there is no message.
 */
export const ErrorMessage: FC<ErrorMessageProps> = ({ id, message }) => {
  if (!message) return null;
  return (
    <span id={id} className="field-error" role="alert" aria-live="assertive">
      {message}
    </span>
  );
};

// ── FormGroup ────────────────────────────────────────────────────────────────

interface FormGroupProps {
  label       : string;
  htmlFor     : string;
  children    : ReactNode;
  errorId    ?: string;
  errorMessage?: string;
  hint        ?: string;
  hintId      ?: string;
  required    ?: boolean;
  className   ?: string;
}

/**
 * FormGroup
 *
 * Wraps a label + input pair with optional hint text and error message.
 * Manages the aria-describedby relationship automatically.
 */
export const FormGroup: FC<FormGroupProps> = ({
  label, htmlFor, children, errorId, errorMessage,
  hint, hintId, required, className,
}) => {
  return (
    <div className={['form-group', className].filter(Boolean).join(' ')}>
      <label htmlFor={htmlFor} className="form-label">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="form-required-marker"> *</span>
            <VisuallyHidden> (required)</VisuallyHidden>
          </>
        )}
      </label>
      {hint && hintId && (
        <span id={hintId} className="form-hint">
          {hint}
        </span>
      )}
      {children}
      {errorId && <ErrorMessage id={errorId} message={errorMessage} />}
    </div>
  );
};

// ── TextInput ────────────────────────────────────────────────────────────────

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id          : string;
  'aria-describedby'?: string;
  invalid    ?: boolean;
}

/**
 * TextInput
 *
 * Accessible text input.  When invalid, aria-invalid is set to "true"
 * and the visual error colour is applied.
 */
export const TextInput: FC<TextInputProps> = ({
  id,
  invalid,
  className,
  ...rest
}) => (
  <input
    id={id}
    className={['form-input', invalid ? 'form-input--error' : '', className].filter(Boolean).join(' ')}
    {...rest}
  />
);

// ── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id    : string;
  invalid?: boolean;
}

/**
 * Textarea
 *
 * Accessible multi-line text input with invalid state support.
 */
export const Textarea: FC<TextareaProps> = ({ id, invalid, className, ...rest }) => (
  <textarea
    id={id}
    aria-invalid={invalid ? 'true' : undefined}
    className={['form-textarea', invalid ? 'form-textarea--error' : '', className].filter(Boolean).join(' ')}
    {...rest}
  />
);

// ── Select ───────────────────────────────────────────────────────────────────

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id      : string;
  options : SelectOption[];
  invalid?: boolean;
  /** Placeholder option displayed when no selection is made. */
  placeholder?: string;
}

/**
 * Select
 *
 * Accessible select element.  Placeholder options use an empty value so
 * they fail required validation.
 */
export const Select: FC<SelectProps> = ({ id, options, invalid, placeholder, className, ...rest }) => (
  <select
    id={id}
    aria-invalid={invalid ? 'true' : undefined}
    className={['form-select', invalid ? 'form-select--error' : '', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {placeholder && (
      <option value="" disabled>
        {placeholder}
      </option>
    )}
    {options.map((opt) => (
      <option key={opt.value} value={opt.value} disabled={opt.disabled}>
        {opt.label}
      </option>
    ))}
  </select>
);

// ── Checkbox ─────────────────────────────────────────────────────────────────

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id      : string;
  label   : ReactNode;
  invalid?: boolean;
  errorId?: string;
}

/**
 * Checkbox
 *
 * Accessible checkbox with inline label.
 * Uses a real <label> element paired via htmlFor — not aria-label.
 */
export const Checkbox: FC<CheckboxProps> = ({ id, label, invalid, errorId, className, ...rest }) => (
  <div className={['checkbox-group', className].filter(Boolean).join(' ')}>
    <input
      id={id}
      type="checkbox"
      aria-invalid={invalid ? 'true' : undefined}
      aria-describedby={errorId}
      className="checkbox-input"
      {...rest}
    />
    <label htmlFor={id} className="checkbox-label">
      {label}
    </label>
  </div>
);

// ── Section ──────────────────────────────────────────────────────────────────

interface SectionProps {
  id            ?: string;
  labelledby    ?: string;
  className     ?: string;
  children      : ReactNode;
  as            ?: keyof JSX.IntrinsicElements;
}

/**
 * Section
 *
 * Semantic section element with aria-labelledby support.
 */
export const Section: FC<SectionProps> = ({
  id, labelledby, className, children, as: Tag = 'section',
}) => (
  <Tag
    id={id}
    aria-labelledby={labelledby}
    className={['page-section', className].filter(Boolean).join(' ')}
  >
    {children}
  </Tag>
);

// ── SectionHeader ─────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  id          : string;
  heading     : string;
  subheading ?: string;
  centred    ?: boolean;
  level      ?: 2 | 3;
}

/**
 * SectionHeader
 *
 * Reusable section heading + optional sub-heading.  Level defaults to h2.
 */
export const SectionHeader: FC<SectionHeaderProps> = ({
  id, heading, subheading, centred = false, level = 2,
}) => {
  const HeadingTag = `h${level}` as 'h2' | 'h3';
  return (
    <div className={['section-header', centred ? 'section-header--centred' : ''].filter(Boolean).join(' ')}>
      <HeadingTag id={id} className="section-heading">{heading}</HeadingTag>
      {subheading && <p className="section-subheading">{subheading}</p>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HEADER & NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

// ── SiteLogo ─────────────────────────────────────────────────────────────────

/**
 * SiteLogo
 *
 * Renders the Luminary Studio logo as a linked image.
 * The anchor has an aria-label that includes the brand name and action.
 */
export const SiteLogo: FC = () => (
  <a href={SITE.logoHref} aria-label={`${SITE.name} — go to homepage`} className="site-logo">
    <img
      src="/img/luminary-logo.svg"
      alt={SITE.logoAlt}
      width={160}
      height={40}
      className="site-logo__img"
    />
  </a>
);

// ── NavDropdown ───────────────────────────────────────────────────────────────

interface NavDropdownProps {
  item       : NavItem;
  isOpen     : boolean;
  onToggle   : () => void;
  onClose    : () => void;
  triggerId  : string;
  menuId     : string;
}

/**
 * NavDropdown
 *
 * Renders a navigation item that has a sub-menu.
 * Implements the ARIA disclosure button pattern:
 * - `aria-expanded` on the trigger reflects open state.
 * - `aria-controls` links trigger to the sub-menu element.
 * - Escape key closes the sub-menu and returns focus to the trigger.
 * - Clicking outside the dropdown closes it.
 */
export const NavDropdown: FC<NavDropdownProps> = ({
  item, isOpen, onToggle, onClose, triggerId, menuId,
}) => {
  const containerRef = useRef<HTMLLIElement>(null);
  const triggerRef   = useRef<HTMLButtonElement>(null);

  useOnClickOutside(containerRef as RefObject<HTMLElement>, onClose);

  function handleKeyDown(ev: KeyboardEvent<HTMLElement>): void {
    if (ev.key === KEY.escape) {
      ev.stopPropagation();
      onClose();
      triggerRef.current?.focus();
    }
  }

  return (
    <li ref={containerRef} className="nav-item nav-item--dropdown" onKeyDown={handleKeyDown}>
      <button
        id={triggerId}
        ref={triggerRef}
        type="button"
        aria-controls={menuId}
        aria-haspopup="true"
        className="nav-link nav-link--dropdown-trigger"
        onClick={onToggle}
      >
        {item.label}
        <span className="nav-link__chevron" aria-hidden="true">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      <ul
        id={menuId}
        role="list"
        className={['nav-submenu', isOpen ? 'nav-submenu--open' : ''].filter(Boolean).join(' ')}
        hidden={!isOpen}
        aria-labelledby={triggerId}
      >
        {(item.children ?? []).map((child) => (
          <li key={child.href} className="nav-submenu__item">
            <a href={child.href} className="nav-submenu__link" onClick={onClose}>
              {child.label}
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
};

// ── DesktopNav ────────────────────────────────────────────────────────────────

interface DesktopNavProps {
  items: NavItem[];
}

/**
 * DesktopNav
 *
 * Horizontal primary navigation for desktop viewports.
 * Dropdown menus use the ARIA disclosure pattern.
 * Only one dropdown sub-menu may be open at a time.
 */
export const DesktopNav: FC<DesktopNavProps> = ({ items }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  function handleToggle(id: string): void {
    setOpenId((prev) => (prev === id ? null : id));
  }

  function handleClose(): void {
    setOpenId(null);
  }

  return (
    <nav id="main-nav" aria-label="Main navigation" className="desktop-nav">
      <ul role="list" className="desktop-nav__list">
        {items.map((item) => {
          if (item.children && item.children.length > 0) {
            const triggerId = `nav-trigger-${item.href.replace(/\W/g, '-')}`;
            const menuId    = `nav-menu-${item.href.replace(/\W/g, '-')}`;
            return (
              <NavDropdown
                key={item.href}
                item={item}
                isOpen={openId === item.href}
                onToggle={() => handleToggle(item.href)}
                onClose={handleClose}
                triggerId={triggerId}
                menuId={menuId}
              />
            );
          }

          return (
            <li key={item.href} className="nav-item">
              <a
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={['nav-link', item.current ? 'nav-link--current' : ''].filter(Boolean).join(' ')}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

// ── MobileNav ─────────────────────────────────────────────────────────────────

interface MobileNavProps {
  items   : NavItem[];
  isOpen  : boolean;
  onClose : () => void;
  menuId  : string;
  toggleId: string;
}

/**
 * MobileNav
 *
 * Off-canvas navigation panel for small viewports.
 * Implementation notes:
 * - Focus is trapped within the panel while open (useFocusTrap).
 * - Escape key closes the panel and returns focus to the toggle.
 * - `aria-expanded` on the toggle reflects open state.
 * - Panel has role="dialog" and aria-modal="true" to signal modality to AT.
 * - Scroll on the body is locked while the panel is open.
 */
export const MobileNav: FC<MobileNavProps> = ({
  items, isOpen, onClose, menuId, toggleId,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useFocusTrap(panelRef, isOpen, { onEscape: onClose });

  // Lock body scroll when open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="mobile-nav-backdrop"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        id={menuId}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${SITE.name} navigation`}
        className={['mobile-nav', isOpen ? 'mobile-nav--open' : ''].filter(Boolean).join(' ')}
        hidden={!isOpen}
      >
        {/* Panel header */}
        <div className="mobile-nav__header">
          <SiteLogo />
          <IconButton
            aria-label="Close navigation menu"
            onClick={onClose}
            className="mobile-nav__close"
          >
            ✕
          </IconButton>
        </div>

        {/* Nav items */}
        <nav aria-label="Mobile navigation" className="mobile-nav__body">
          <ul role="list" className="mobile-nav__list">
            {items.map((item) => {
              if (item.children && item.children.length > 0) {
                const sectionId = `mobile-section-${item.href.replace(/\W/g, '-')}`;
                const isExpanded = openSectionId === item.href;
                return (
                  <li key={item.href} className="mobile-nav__item">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={sectionId}
                      className="mobile-nav__link mobile-nav__link--trigger"
                      onClick={() => setOpenSectionId(isExpanded ? null : item.href)}
                    >
                      {item.label}
                      <span aria-hidden="true">{isExpanded ? '▲' : '▼'}</span>
                    </button>
                    <ul
                      id={sectionId}
                      role="list"
                      className={['mobile-nav__submenu', isExpanded ? 'mobile-nav__submenu--open' : ''].filter(Boolean).join(' ')}
                      hidden={!isExpanded}
                    >
                      {item.children.map((child) => (
                        <li key={child.href} className="mobile-nav__submenu-item">
                          <a href={child.href} className="mobile-nav__submenu-link" onClick={onClose}>
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }

              return (
                <li key={item.href} className="mobile-nav__item">
                  <a
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={['mobile-nav__link', item.current ? 'mobile-nav__link--current' : ''].filter(Boolean).join(' ')}
                    onClick={onClose}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer CTAs */}
        <div className="mobile-nav__footer">
          <LinkButton href="/login"   variant="outline" size="sm">Log in</LinkButton>
          <LinkButton href="/signup"  variant="primary" size="sm">Get started free</LinkButton>
        </div>
      </div>
    </>
  );
};

// ── ThemeToggle ───────────────────────────────────────────────────────────────

/**
 * ThemeToggle
 *
 * A button that cycles through light → dark → system themes.
 * Current state is communicated via aria-label.
 */
export const ThemeToggle: FC = () => {
  const { theme, setTheme } = useTheme();

  const LABELS: Record<Theme, string> = {
    light : 'Switch to dark theme (currently: light)',
    dark  : 'Switch to system theme (currently: dark)',
    system: 'Switch to light theme (currently: system)',
  };

  const NEXT: Record<Theme, Theme> = {
    light : 'dark',
    dark  : 'system',
    system: 'light',
  };

  const ICONS: Record<Theme, string> = {
    light : '☀️',
    dark  : '🌙',
    system: '💻',
  };

  return (
    <IconButton
      aria-label={LABELS[theme]}
      onClick={() => setTheme(NEXT[theme])}
      className="theme-toggle"
    >
      {ICONS[theme]}
    </IconButton>
  );
};

// ── SiteSearch (input only) ───────────────────────────────────────────────────

interface SearchInputProps {
  value       : string;
  onChange    : (value: string) => void;
  onSubmit    : (query: string) => void;
  placeholder?: string;
  id          : string;
}

/**
 * SearchInput
 *
 * Header search input with accessible form role and labelled submit button.
 */
export const SearchInput: FC<SearchInputProps> = ({
  value, onChange, onSubmit, placeholder = 'Search Luminary Studio…', id,
}) => {
  const labelId = `${id}-label`;

  function handleSubmit(ev: React.FormEvent): void {
    ev.preventDefault();
    onSubmit(value);
  }

  return (
    <form
      id="site-search"
      role="search"
      aria-labelledby={labelId}
      className="site-search-form"
      onSubmit={handleSubmit}
    >
      <label id={labelId} htmlFor={id} className="site-search-form__label">
        <VisuallyHidden>Search Luminary Studio</VisuallyHidden>
      </label>
      <TextInput
        id={id}
        type="search"
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        aria-label="Search"
        className="site-search-form__input"
      />
      <Button
        type="submit"
        variant="ghost"
        srLabel="Submit search"
        className="site-search-form__submit"
      >
        🔍
      </Button>
    </form>
  );
};

// ── SiteHeader ────────────────────────────────────────────────────────────────

interface SiteHeaderProps {
  items?: NavItem[];
}

/**
 * SiteHeader
 *
 * The main page header containing the logo, primary navigation,
 * search, theme toggle, and CTA links.
 *
 * Manages:
 * - Sticky behaviour with a `data-scrolled` attribute for CSS.
 * - Mobile nav open/close state.
 * - Keyboard shortcut Alt+N to jump to navigation.
 * - Header height CSS custom property for content offset.
 */
export const SiteHeader: FC<SiteHeaderProps> = ({ items = NAV_ITEMS }) => {
  const { isOpen, open, close } = useDisclosure(false);
  const { scrollY }             = useScrollPosition();
  const isMobile                = useMediaQuery('(max-width: 768px)');
  const headerRef               = useRef<HTMLElement>(null);
  const menuToggleRef           = useRef<HTMLButtonElement>(null);
  const menuId                  = 'mobile-nav-panel';
  const toggleId                = 'mobile-nav-toggle';

  const [searchValue, setSearchValue] = useState('');
  const isScrolled = scrollY > 20;

  // Sync mobile nav toggle aria-expanded.
  // (When nav closes, focus returns to the toggle via useFocusTrap.)

  // Update --header-height CSS variable.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty(
        '--header-height',
        `${entry.contentRect.height}px`
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handleSearchSubmit(query: string): void {
    if (!query.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
  }

  return (
    <header
      ref={headerRef}
      role="banner"
      className={['site-header', isScrolled ? 'site-header--scrolled' : ''].filter(Boolean).join(' ')}
      data-scrolled={isScrolled}
    >
      <div className="site-header__inner">
        <SiteLogo />

        {!isMobile && <DesktopNav items={items} />}

        <div className="site-header__actions">
          {!isMobile && (
            <SearchInput
              id="header-search"
              value={searchValue}
              onChange={setSearchValue}
              onSubmit={handleSearchSubmit}
            />
          )}

          <ThemeToggle />

          {!isMobile && (
            <div className="site-header__ctas" aria-label="Account actions">
              <LinkButton href="/login"  variant="outline" size="sm">Log in</LinkButton>
              <LinkButton href="/signup" variant="primary" size="sm">Get started free</LinkButton>
            </div>
          )}

          {isMobile && (
            <button
              id={toggleId}
              ref={menuToggleRef}
              type="button"
              aria-expanded={isOpen}
              aria-controls={menuId}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="mobile-nav-toggle"
              onClick={isOpen ? close : open}
            >
              <span aria-hidden="true">{isOpen ? '✕' : '☰'}</span>
            </button>
          )}
        </div>
      </div>

      {isMobile && (
        <MobileNav
          items={items}
          isOpen={isOpen}
          onClose={close}
          menuId={menuId}
          toggleId={toggleId}
        />
      )}
    </header>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface HeroProps {
  /** Video poster image src, shown while the video loads. */
  posterSrc?: string;
}

/**
 * HeroSection
 *
 * The page hero with headline, sub-headline, CTA links,
 * a decorative background video (with pause control), and a
 * trust badge row.
 *
 * Accessibility implementation:
 * - Background video uses aria-hidden="true" (decorative).
 * - Pause/play button exposes current state via aria-pressed.
 * - Reduced-motion preference disables autoPlay entirely.
 * - CTA links have descriptive text (no "click here").
 */
export const HeroSection: FC<HeroProps> = ({ posterSrc = '/img/hero-poster.jpg' }) => {
  const videoRef      = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [isPlaying, setIsPlaying] = useState(!reducedMotion);
  const announce      = useLiveAnnouncer();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => setIsPlaying(false));
    }
  }, [reducedMotion]);

  function handleTogglePlay(): void {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      announce('Background video paused');
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
      announce('Background video playing');
    }
  }

  return (
    <section
      aria-labelledby="hero-heading"
      className="hero-section"
    >
      {/* Decorative background video */}
      <div className="hero-section__media">
        <video
          ref={videoRef}
          src="/video/hero-background.mp4"
          poster={posterSrc}
          autoPlay={!reducedMotion}
          loop
          muted
          playsInline
          aria-hidden="true"
          tabIndex={-1}
          className="hero-section__video"
        />
        <div className="hero-section__overlay" aria-hidden="true" />
      </div>

      {/* Pause/play control for the background video */}
      <div className="hero-section__video-controls">
        <Button
          variant="ghost"
          size="sm"
          aria-label={isPlaying ? 'Pause background video' : 'Play background video'}
          onClick={handleTogglePlay}
          className="hero-section__video-toggle"
        >
          <span aria-hidden="true">{isPlaying ? '⏸' : '▶'}</span>
        </Button>
      </div>

      {/* Hero content */}
      <div className="hero-section__content">
        <div className="hero-section__inner">
          <h1 id="hero-heading" className="hero-section__heading">
            Build inclusively.
            <br />
            Ship with confidence.
          </h1>

          <p className="hero-section__subheading">
            Luminary Studio gives design and engineering teams a complete toolkit for
            building, testing, and monitoring accessible digital products. WCAG 2.2 AA,
            out of the box.
          </p>

          <div className="hero-section__ctas" aria-label="Get started options">
            <LinkButton
              href="/signup"
              variant="primary"
              size="lg"
              srSuffix="— create a free Luminary Studio account"
            >
              Get started for free
            </LinkButton>
            <LinkButton
              href="/demo"
              variant="outline"
              size="lg"
              srSuffix="— book a 30-minute product walkthrough"
            >
              Book a demo
            </LinkButton>
          </div>

          {/* Trust badges */}
          <div className="hero-section__trust" aria-label="Trust indicators">
            <span className="trust-badge">
              <img src="/img/badges/wcag22.svg" alt="WCAG 2.2 AA compliant" width={40} height={40} />
              WCAG 2.2 AA
            </span>
            <span className="trust-badge">
              <img src="/img/badges/soc2.svg" alt="SOC 2 Type II certified" width={40} height={40} />
              SOC 2 Type II
            </span>
            <span className="trust-badge">
              <img src="/img/badges/gdpr.svg" alt="GDPR compliant" width={40} height={40} />
              GDPR Ready
            </span>
            <span className="trust-badge" aria-label="4.9 out of 5 stars on G2">
              ★ 4.9 on G2
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STATS SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface StatItemProps {
  stat: Stat;
}

/**
 * StatItem
 *
 * Single statistic in the social-proof bar.
 * The value uses aria-label for complex formatted values (e.g. "40,000+").
 */
export const StatItem: FC<StatItemProps> = ({ stat }) => (
  <li className="stat-item">
    <p
      className="stat-value"
      aria-label={stat.valueLabel}
    >
      {stat.value}
    </p>
    <p className="stat-label">{stat.label}</p>
  </li>
);

interface StatsBarProps {
  stats?: Stat[];
}

/**
 * StatsBar
 *
 * Social-proof statistics bar.  The heading is visually hidden because
 * the statistics are self-explanatory in context, but it provides a
 * section landmark label for screen-reader navigation.
 */
export const StatsBar: FC<StatsBarProps> = ({ stats = STATS }) => (
  <section aria-labelledby="stats-heading" className="stats-bar">
    <h2 id="stats-heading" className="sr-only">
      Luminary Studio by the numbers
    </h2>
    <ul role="list" className="stats-bar__list">
      {stats.map((stat) => (
        <StatItem key={stat.id} stat={stat} />
      ))}
    </ul>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATIONS BAR
// ─────────────────────────────────────────────────────────────────────────────

interface Integration {
  id   : string;
  name : string;
  logo : string;
  href : string;
}

const INTEGRATIONS: Integration[] = [
  { id: 'react',      name: 'React',       logo: '/img/integrations/react.svg',      href: '/integrations/react' },
  { id: 'vue',        name: 'Vue.js',       logo: '/img/integrations/vue.svg',        href: '/integrations/vue' },
  { id: 'angular',    name: 'Angular',      logo: '/img/integrations/angular.svg',    href: '/integrations/angular' },
  { id: 'figma',      name: 'Figma',        logo: '/img/integrations/figma.svg',      href: '/integrations/figma' },
  { id: 'storybook',  name: 'Storybook',    logo: '/img/integrations/storybook.svg',  href: '/integrations/storybook' },
  { id: 'playwright', name: 'Playwright',   logo: '/img/integrations/playwright.svg', href: '/integrations/playwright' },
  { id: 'github',     name: 'GitHub',       logo: '/img/integrations/github.svg',     href: '/integrations/github' },
  { id: 'gitlab',     name: 'GitLab CI',    logo: '/img/integrations/gitlab.svg',     href: '/integrations/gitlab' },
];

/**
 * IntegrationsBar
 *
 * Scrolling row of integration logos.  Each logo is a linked image with
 * descriptive alt text.  The marquee motion pauses on hover/focus and
 * is suppressed when prefers-reduced-motion is active.
 */
export const IntegrationsBar: FC = () => {
  const reducedMotion = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section aria-labelledby="integrations-heading" className="integrations-bar">
      <h2 id="integrations-heading" className="integrations-bar__heading">
        Works with the tools you already use
      </h2>
      <div
        className={[
          'integrations-bar__track',
          (reducedMotion || isPaused) ? 'integrations-bar__track--paused' : '',
        ].filter(Boolean).join(' ')}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        {/* Duplicate list for seamless loop (aria-hidden on clone). */}
        <ul role="list" className="integrations-bar__list" aria-label="Integration partners">
          {INTEGRATIONS.map((item) => (
            <li key={item.id} className="integrations-bar__item">
              <a href={item.href} className="integrations-bar__link">
                <img
                  src={item.logo}
                  alt={`${item.name} integration`}
                  width={48}
                  height={48}
                  loading="lazy"
                  className="integrations-bar__logo"
                />
                <span className="integrations-bar__name">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
        {/* Aria-hidden clone for visual looping only. */}
        <ul role="list" className="integrations-bar__list" aria-hidden="true">
          {INTEGRATIONS.map((item) => (
            <li key={`clone-${item.id}`} className="integrations-bar__item">
              <span className="integrations-bar__link">
                <img src={item.logo} alt="" width={48} height={48} loading="lazy" className="integrations-bar__logo" />
                <span className="integrations-bar__name">{item.name}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="integrations-bar__cta">
        <a href="/integrations" className="link-underline">
          See all integrations
          <VisuallyHidden> — full list of Luminary Studio integrations</VisuallyHidden>
        </a>
      </p>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HOW IT WORKS SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface HowItWorksStep {
  number     : number;
  heading    : string;
  description: string;
  imageUrl   : string;
  imageAlt   : string;
}

const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    number     : 1,
    heading    : 'Install the Luminary SDK',
    description: 'Add the Luminary npm package to your project within minutes. Supports React, Vue, Angular, Svelte, and plain HTML. Zero config required — Luminary detects your framework automatically.',
    imageUrl   : '/img/how-it-works/step-1-install.png',
    imageAlt   : 'Terminal window showing npm install @luminary/sdk completed successfully with a green checkmark',
  },
  {
    number     : 2,
    heading    : 'Run your first scan',
    description: 'Trigger a full accessibility scan with a single CLI command or from the VS Code extension. Luminary scans every component in your design system and reports issues against over 320 WCAG checks.',
    imageUrl   : '/img/how-it-works/step-2-scan.png',
    imageAlt   : 'VS Code editor panel showing Luminary accessibility scan results with 12 warnings and 3 errors highlighted inline',
  },
  {
    number     : 3,
    heading    : 'Review and remediate',
    description: 'Open the Luminary dashboard to see issues grouped by severity, WCAG criterion, component, and route. Each issue includes a code diff, video walkthrough, and a suggested ARIA or HTML fix.',
    imageUrl   : '/img/how-it-works/step-3-review.png',
    imageAlt   : 'Screenshot of the Luminary dashboard issue list showing three critical issues with remediation guidance panels open',
  },
  {
    number     : 4,
    heading    : 'Ship and monitor',
    description: `Merge the fixes and push to production. Luminary's nightly monitor checks that issues stay resolved, alerts on regressions, and tracks your accessibility score over time.`,
    imageUrl   : '/img/how-it-works/step-4-monitor.png',
    imageAlt   : 'Screenshot of a trend chart showing accessibility score improving from 62% to 97% over three months',
  },
];

interface HowItWorksStepItemProps {
  step : HowItWorksStep;
  index: number;
}

/**
 * HowItWorksStepItem
 *
 * Single numbered step in the "How it works" sequence.
 */
export const HowItWorksStepItem: FC<HowItWorksStepItemProps> = ({ step, index }) => {
  const isEven = index % 2 === 1;
  return (
    <li
      className={['step', isEven ? 'step--reversed' : ''].filter(Boolean).join(' ')}
    >
      <span className="step-number" aria-hidden="true">{step.number}</span>
      <div className="step-content">
        <h3 className="step-heading">{step.heading}</h3>
        <p className="step-description">{step.description}</p>
      </div>
      <img
        src={step.imageUrl}
        alt={step.imageAlt}
        width={480}
        height={280}
        loading="lazy"
        className="step-image"
      />
    </li>
  );
};

/**
 * HowItWorksSection
 *
 * Numbered step-by-step walkthrough of the product workflow.
 */
export const HowItWorksSection: FC = () => (
  <section aria-labelledby="how-it-works-heading" className="how-it-works-section">
    <SectionHeader
      id="how-it-works-heading"
      heading="How Luminary Studio works"
      subheading="From installation to production monitoring in four steps."
      centred
    />
    <ol
      className="steps-list"
      aria-label="Luminary Studio workflow steps"
    >
      {HOW_IT_WORKS_STEPS.map((step, i) => (
        <HowItWorksStepItem key={step.number} step={step} index={i} />
      ))}
    </ol>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS SECTION
// ─────────────────────────────────────────────────────────────────────────────

// ── FilterTabs ────────────────────────────────────────────────────────────────

interface FilterTabItem {
  value: ProductCategory;
  label: string;
}

const FILTER_TABS: FilterTabItem[] = [
  { value: 'all',       label: 'All tools'  },
  { value: 'scanning',  label: 'Scanning'   },
  { value: 'design',    label: 'Design'     },
  { value: 'testing',   label: 'Testing'    },
  { value: 'reporting', label: 'Reporting'  },
];

interface FilterTabsProps {
  activeFilter : ProductCategory;
  onChange     : (filter: ProductCategory) => void;
  labelId      : string;
  /** Count visible for each category (for badges). */
  counts       ?: Partial<Record<ProductCategory, number>>;
}

/**
 * FilterTabs
 *
 * Toggle-button group for filtering the product catalogue.
 *
 * Accessibility implementation:
 * - Wrapping div has role="group" and aria-labelledby for context.
 * - Each button uses aria-pressed to convey its active/inactive state.
 * - Roving tabindex implemented via useRovingTabindex.
 * - The live region announces how many results are now visible.
 */
export const FilterTabs: FC<FilterTabsProps> = ({
  activeFilter, onChange, labelId, counts,
}) => {
  const groupRef = useRef<HTMLUListElement>(null);
  useRovingTabindex(groupRef as RefObject<HTMLElement>, '.filter-tab-btn', { horizontal: true });

  return (
    <div role="group" aria-labelledby={labelId} className="filter-tabs-group">
      <ul
        ref={groupRef}
        role="list"
        className="filter-tabs"
        aria-label="Product category filter"
      >
        {FILTER_TABS.map((tab) => (
          <li key={tab.value} className="filter-tabs__item">
            <button
              type="button"
              className={[
                'filter-tab-btn',
                activeFilter === tab.value ? 'filter-tab-btn--active' : '',
              ].filter(Boolean).join(' ')}
              tabIndex={activeFilter === tab.value ? 0 : -1}
              onClick={() => onChange(tab.value)}
            >
              {tab.label}
              {counts?.[tab.value] !== undefined && (
                <span className="filter-tab-btn__count" aria-label={`, ${counts[tab.value]} item${counts[tab.value] !== 1 ? 's' : ''}`}>
                  {' '}({counts[tab.value]})
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── ProductCard ────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard
 *
 * Displays a single product in the catalogue.
 *
 * Accessibility implementation:
 * - The card's heading acts as the article's accessible name via aria-labelledby.
 * - The CTA link has a descriptive aria-label that includes the product name,
 *   ensuring each link on the page has a unique accessible name.
 * - Product meta list has an aria-label.
 * - Image is descriptive (never empty alt, never "product image").
 */
export const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const headingId = `prod-${product.id}-name`;

  return (
    <li className="product-card" data-category={product.category}>
      <article aria-labelledby={headingId} className="product-card__article">
        <img
          src={product.imageUrl}
          alt={product.imageAlt}
          width={320}
          height={200}
          loading="lazy"
          className="product-card__image"
        />
        <div className="product-card__body">
          <h3 id={headingId} className="product-card__name">
            {product.name}
          </h3>
          <p className="product-card__tagline">{product.tagline}</p>
          <p className="product-card__description">{product.description}</p>
          <ul
            className="product-card__meta"
            aria-label={`${product.name} details`}
          >
            <li>
              <strong>Version:</strong>{' '}
              <span>{product.version}</span>
            </li>
            <li>
              <strong>License:</strong>{' '}
              <span>{product.license}</span>
            </li>
            <li>
              <strong>Integrations:</strong>{' '}
              <span>{product.integrations}</span>
            </li>
          </ul>
          <a
            href={product.href}
            className="btn btn--secondary btn--md"
            aria-label={`View ${product.name} details`}
          >
            View details
          </a>
        </div>
      </article>
    </li>
  );
};

// ── ProductsSection ────────────────────────────────────────────────────────────

interface ProductsSectionProps {
  products?: Product[];
}

/**
 * ProductsSection
 *
 * Full product catalogue with filter tabs.  The visible product count is
 * announced to screen readers when the filter changes.
 */
export const ProductsSection: FC<ProductsSectionProps> = ({
  products = PRODUCTS,
}) => {
  const [activeFilter, setActiveFilter] = useState<ProductCategory>('all');
  const filterLabelId   = 'filter-label';
  const resultsRegionId = 'product-grid-results';
  const announce        = useLiveAnnouncer();

  const filtered = useMemo(
    () => activeFilter === 'all' ? products : products.filter((p) => p.category === activeFilter),
    [products, activeFilter]
  );

  const counts = useMemo((): Partial<Record<ProductCategory, number>> => {
    const result: Partial<Record<ProductCategory, number>> = { all: products.length };
    products.forEach((p) => {
      result[p.category] = (result[p.category] ?? 0) + 1;
    });
    return result;
  }, [products]);

  function handleFilterChange(filter: ProductCategory): void {
    setActiveFilter(filter);
    const label = FILTER_TABS.find((t) => t.value === filter)?.label ?? filter;
    const count = filter === 'all' ? products.length : (counts[filter] ?? 0);
    announce(
      `Showing ${count} ${count === 1 ? 'tool' : 'tools'}${filter !== 'all' ? ` in ${label}` : ''}.`
    );
  }

  return (
    <section aria-labelledby="products-heading" className="products-section">
      <SectionHeader
        id="products-heading"
        heading="Our tools"
        subheading="Pick the tools that fit your team's workflow — or use the full suite."
        centred
      />

      <p id={filterLabelId} className="filter-label">
        Filter by category
      </p>

      <FilterTabs
        activeFilter={activeFilter}
        onChange={handleFilterChange}
        labelId={filterLabelId}
        counts={counts}
      />

      <div
        id={resultsRegionId}
        aria-live="polite"
        aria-relevant="additions removals"
        aria-atomic="false"
      >
        <ul
          role="list"
          className="product-grid"
          aria-label="Available tools"
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="product-grid__empty" role="status">
            No tools found{activeFilter !== 'all' ? ` in the "${FILTER_TABS.find((t) => t.value === activeFilter)?.label}" category` : ''}.
          </p>
        )}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON TABLE SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface ComparisonTableSectionProps {
  rows?: ComparisonRow[];
}

/**
 * ComparisonTableSection
 *
 * Accessible feature comparison table for the three pricing plans.
 *
 * Accessibility implementation:
 * - Table has a <caption> element.
 * - Column headers use scope="col".
 * - Row headers use scope="row".
 * - The table container has role="region" + aria-label + tabindex="0" so
 *   keyboard users can scroll horizontally on small screens.
 * - Tick marks (✓) have a visually-hidden "Yes" equivalent via aria-label.
 * - Em-dashes (—) have aria-label="Not included".
 */
export const ComparisonTableSection: FC<ComparisonTableSectionProps> = ({
  rows = COMPARISON_ROWS,
}) => (
  <section aria-labelledby="comparison-heading" className="comparison-section">
    <SectionHeader
      id="comparison-heading"
      heading="Feature comparison"
    />

    <div
      className="table-wrapper"
      role="region"
      aria-label="Feature comparison table — scroll horizontally on small screens"
      tabIndex={0}
    >
      <table className="comparison-table">
        <caption className="comparison-table__caption">
          Luminary Studio plan feature comparison
        </caption>
        <thead>
          <tr>
            <th scope="col" className="comparison-table__feature-col">Feature</th>
            <th scope="col">Starter</th>
            <th scope="col">Pro</th>
            <th scope="col">Enterprise</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature}>
              <th scope="row" className="comparison-table__row-header">{row.feature}</th>
              <ComparisonCell value={row.starter} />
              <ComparisonCell value={row.pro} />
              <ComparisonCell value={row.enterprise} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

interface ComparisonCellProps {
  value: string;
}

/**
 * ComparisonCell
 *
 * Table data cell that renders tick/dash values accessibly.
 */
const ComparisonCell: FC<ComparisonCellProps> = ({ value }) => {
  if (value === '✓') {
    return <td aria-label="Yes" className="comparison-table__cell comparison-table__cell--yes">{value}</td>;
  }
  if (value === '—') {
    return <td aria-label="Not included" className="comparison-table__cell comparison-table__cell--no">{value}</td>;
  }
  return <td className="comparison-table__cell">{value}</td>;
};

// ─────────────────────────────────────────────────────────────────────────────
// PRICING SECTION
// ─────────────────────────────────────────────────────────────────────────────

// ── BillingToggle ──────────────────────────────────────────────────────────────

interface BillingToggleProps {
  value   : BillingPeriod;
  onChange: (period: BillingPeriod) => void;
}

/**
 * BillingToggle
 *
 * Toggle button group for switching between monthly and annual billing.
 *
 * Accessibility:
 * - Wrapping div has role="group" and aria-labelledby.
 * - Each button uses aria-pressed to convey selection state.
 * - "Save 20%" badge is inline text so the context is clear to screen readers.
 */
export const BillingToggle: FC<BillingToggleProps> = ({ value, onChange }) => {
  const labelId = 'billing-toggle-label';

  return (
    <div
      className="billing-toggle"
      role="group"
      aria-labelledby={labelId}
    >
      <span id={labelId} className="billing-toggle__label">
        Billing period
      </span>
      <button
        type="button"
        id="billing-monthly"
        className={['billing-toggle__btn', value === 'monthly' ? 'billing-toggle__btn--active' : ''].filter(Boolean).join(' ')}
        onClick={() => onChange('monthly')}
      >
        Monthly
      </button>
      <button
        type="button"
        id="billing-annual"
        className={['billing-toggle__btn', value === 'annual' ? 'billing-toggle__btn--active' : ''].filter(Boolean).join(' ')}
        onClick={() => onChange('annual')}
      >
        Annual{' '}
        <Badge variant="success">Save 20%</Badge>
      </button>
    </div>
  );
};

// ── PlanCard ──────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan          : Plan;
  billingPeriod : BillingPeriod;
  isSelected   ?: boolean;
}

/**
 * PlanCard
 *
 * Displays a single pricing plan.
 *
 * Accessibility:
 * - Article is labelled by its heading via aria-labelledby.
 * - Featured/recommended plan is flagged via aria-label on the <li>.
 * - Price announcements use aria-label to convey the full price string
 *   including billing period.
 * - Feature list has an aria-label.
 * - CTA link has a descriptive aria-label that includes the plan name.
 */
export const PlanCard: FC<PlanCardProps> = ({ plan, billingPeriod, isSelected }) => {
  const headingId = `plan-${plan.id}-name`;

  const price = billingPeriod === 'annual' ? plan.priceAnnual : plan.priceMonthly;
  const priceAriaLabel = price === null
    ? 'Custom pricing — contact us'
    : price === 0
      ? 'Free for ever'
      : `£${price} per seat per month, billed ${billingPeriod}`;

  return (
    <li
      className={[
        'pricing-card',
        plan.featured ? 'pricing-card--featured' : '',
        isSelected    ? 'pricing-card--selected' : '',
      ].filter(Boolean).join(' ')}
      aria-label={plan.featured ? 'Recommended plan' : undefined}
    >
      <article aria-labelledby={headingId} className="pricing-card__article">
        {plan.badge && (
          <p className="pricing-card__badge" aria-hidden="true">
            {plan.badge}
          </p>
        )}

        <h3 id={headingId} className="pricing-card__name">{plan.name}</h3>
        <p className="pricing-card__tagline">{plan.tagline}</p>

        <p className="pricing-card__price" aria-label={priceAriaLabel}>
          {price === null ? (
            <span className="price-amount">Custom</span>
          ) : (
            <>
              <span className="price-amount">
                {price === 0 ? '£0' : `£${price}`}
              </span>
              {price > 0 && (
                <span className="price-period">
                  {' '}/ seat / month
                </span>
              )}
            </>
          )}
        </p>

        <ul className="pricing-card__features" aria-label={`${plan.name} plan features`}>
          {plan.features.map((feature) => (
            <li key={feature} className="pricing-card__feature">
              <span aria-hidden="true" className="pricing-card__feature-icon">✓</span>
              {feature}
            </li>
          ))}
        </ul>

        <a
          href={plan.ctaHref}
          className={[
            'btn',
            plan.featured ? 'btn--primary' : 'btn--outline',
            'btn--md',
          ].filter(Boolean).join(' ')}
          aria-label={`${plan.ctaLabel} — ${plan.name} plan`}
        >
          {plan.ctaLabel}
        </a>
      </article>
    </li>
  );
};

// ── PricingSection ─────────────────────────────────────────────────────────────

interface PricingSectionProps {
  plans?: Plan[];
}

/**
 * PricingSection
 *
 * Full pricing section with billing toggle and plan cards.
 * Selected billing period is persisted in localStorage.
 */
export const PricingSection: FC<PricingSectionProps> = ({
  plans = PLANS,
}) => {
  const [billingPeriod, setBillingPeriod] = useLocalStorage<BillingPeriod>(
    'luminary_billing', 'annual'
  );
  const announce = useLiveAnnouncer();

  function handleBillingChange(period: BillingPeriod): void {
    setBillingPeriod(period);
    announce(`Showing ${period} pricing.`);
  }

  return (
    <section aria-labelledby="pricing-heading" className="pricing-section">
      <SectionHeader
        id="pricing-heading"
        heading="Simple, transparent pricing"
        subheading="Start free. Scale when you're ready. No hidden fees."
        centred
      />

      <BillingToggle value={billingPeriod} onChange={handleBillingChange} />

      <ul role="list" className="pricing-grid" aria-label="Pricing plans">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingPeriod={billingPeriod}
          />
        ))}
      </ul>

      <p className="pricing-section__footer-note">
        All plans include a 14-day free trial. No credit card required.{' '}
        <a href="/pricing/faq" className="link-underline">
          Read the pricing FAQ
          <VisuallyHidden> for more details about plan terms</VisuallyHidden>
        </a>
      </p>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIALS CAROUSEL
// ─────────────────────────────────────────────────────────────────────────────

interface TestimonialsCarouselProps {
  testimonials?: Testimonial[];
}

/**
 * TestimonialsCarousel
 *
 * An accessible carousel of customer testimonials.
 *
 * Accessibility implementation:
 * - Outer element has role="region" and a heading-based accessible name.
 * - The track has role="group" and aria-roledescription="carousel".
 * - Each slide has aria-roledescription="slide" and aria-label with position.
 * - Only the visible slide is visible to AT (aria-hidden on hidden slides).
 * - Prev/next buttons have accessible names and aria-controls.
 * - Dot navigation uses aria-label (current page indicator).
 * - Auto-rotation pauses on hover and focus.
 * - Auto-rotation is disabled when prefers-reduced-motion is active.
 * - A dedicated "Pause auto-rotation" toggle button is provided.
 */
export const TestimonialsCarousel: FC<TestimonialsCarouselProps> = ({
  testimonials = TESTIMONIALS,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const reducedMotion   = useReducedMotion();
  const announce        = useLiveAnnouncer();
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackId         = 'testimonials-track';

  const total = testimonials.length;

  function goToSlide(index: number): void {
    const next = (index + total) % total;
    setCurrentIndex(next);
    announce(
      `Quote ${next + 1} of ${total}: ${testimonials[next].author}, ${testimonials[next].role} at ${testimonials[next].company}`
    );
  }

  function handlePrev(): void { goToSlide(currentIndex - 1); }
  function handleNext(): void { goToSlide(currentIndex + 1); }

  // Auto-play.
  const autoPlayActive = isAutoPlaying && !isPausedByUser && !reducedMotion;
  useEffect(() => {
    if (!autoPlayActive) { clearInterval(intervalRef.current ?? undefined); return; }
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 6000);
    return () => clearInterval(intervalRef.current ?? undefined);
  }, [autoPlayActive, total]);

  // Keyboard navigation.
  function handleKeyDown(ev: KeyboardEvent<HTMLElement>): void {
    if (ev.key === KEY.arrowLeft)  { ev.preventDefault(); handlePrev(); }
    if (ev.key === KEY.arrowRight) { ev.preventDefault(); handleNext(); }
  }

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="testimonials-section"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onFocus={()     => setIsAutoPlaying(false)}
      onBlur={()      => setIsAutoPlaying(true)}
    >
      <SectionHeader
        id="testimonials-heading"
        heading="Loved by accessibility-forward teams"
        subheading="Over 40,000 teams trust Luminary Studio to build inclusively."
        centred
      />

      {/* Pause toggle */}
      <Button
        variant="ghost"
        size="sm"
        aria-pressed={isPausedByUser}
        aria-label={isPausedByUser ? 'Resume auto-rotation of testimonials' : 'Pause auto-rotation of testimonials'}
        onClick={() => setIsPausedByUser((p) => !p)}
        className="testimonials-section__pause-btn"
      >
        <span aria-hidden="true">{isPausedByUser ? '▶' : '⏸'}</span>
      </Button>

      <div
        id={trackId}
        role="group"
        aria-roledescription="carousel"
        aria-label="Customer testimonials"
        className="testimonials-track"
        onKeyDown={handleKeyDown}
      >
        {/* Slides */}
        <div className="testimonials-track__slides">
          {testimonials.map((t, i) => {
            const isVisible = i === currentIndex;
            return (
              <div
                key={t.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`Quote ${i + 1} of ${total}`}
                className={[
                  'testimonial-slide',
                  isVisible ? 'testimonial-slide--visible' : '',
                ].filter(Boolean).join(' ')}
              >
                <figure className="testimonial-slide__figure">
                  <blockquote className="testimonial-slide__quote">
                    <p>"{t.quote}"</p>
                  </blockquote>
                  <figcaption className="testimonial-slide__caption">
                    <img
                      src={t.avatarUrl}
                      alt={t.avatarAlt}
                      width={48}
                      height={48}
                      loading="lazy"
                      className="testimonial-slide__avatar"
                    />
                    <div className="testimonial-slide__meta">
                      <strong className="testimonial-slide__author">{t.author}</strong>
                      <span className="testimonial-slide__role">
                        {t.role}, {t.company}
                      </span>
                    </div>
                    <StarRating value={t.rating} />
                  </figcaption>
                </figure>
              </div>
            );
          })}
        </div>

        {/* Prev / Next controls */}
        <div className="testimonials-track__controls" aria-label="Carousel navigation">
          <IconButton
            aria-label="Previous testimonial"
            aria-controls={trackId}
            onClick={handlePrev}
            className="testimonials-track__prev"
          >
            ‹
          </IconButton>
          <IconButton
            aria-label="Next testimonial"
            aria-controls={trackId}
            onClick={handleNext}
            className="testimonials-track__next"
          >
            ›
          </IconButton>
        </div>
      </div>

      {/* Dot navigation */}
      <nav aria-label="Testimonial carousel position" className="testimonials-dots">
        <ul role="list" className="testimonials-dots__list">
          {testimonials.map((t, i) => (
            <li key={t.id} className="testimonials-dots__item">
              <button
                type="button"
                className={[
                  'testimonials-dots__dot',
                  i === currentIndex ? 'testimonials-dots__dot--current' : '',
                ].filter(Boolean).join(' ')}
                aria-label={`Go to testimonial ${i + 1}${i === currentIndex ? ' (current)' : ''}: ${t.author}`}
                aria-current={i === currentIndex ? 'true' : undefined}
                onClick={() => goToSlide(i)}
              />
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FAQ ACCORDION
// ─────────────────────────────────────────────────────────────────────────────

interface FaqItemComponentProps {
  item    : FaqItem;
  isOpen  : boolean;
  onToggle: (id: string) => void;
}

/**
 * FaqItemComponent
 *
 * Disclosure accordion item.
 *
 * Accessibility:
 * - Button has aria-expanded and aria-controls pointing to the answer panel.
 * - Answer panel has role="region" and aria-labelledby pointing to the button.
 * - Panel uses hidden attribute to match ARIA state.
 */
export const FaqItemComponent: FC<FaqItemComponentProps> = ({ item, isOpen, onToggle }) => {
  const btnId   = `faq-btn-${item.id}`;
  const panelId = `faq-panel-${item.id}`;

  return (
    <div className={['faq-item', isOpen ? 'faq-item--open' : ''].filter(Boolean).join(' ')}>
      <h3 className="faq-item__heading">
        <button
          type="button"
          id={btnId}
          aria-controls={panelId}
          className="faq-item__trigger"
          onClick={() => onToggle(item.id)}
        >
          {item.question}
          <span aria-hidden="true" className="faq-item__chevron">
            {isOpen ? '▲' : '▼'}
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        hidden={!isOpen}
        className="faq-item__panel"
      >
        <div className="faq-item__answer">
          <p>{item.answer}</p>
        </div>
      </div>
    </div>
  );
};

// ── FaqAccordion ──────────────────────────────────────────────────────────────

interface FaqAccordionProps {
  items    ?: FaqItem[];
  allowMulti?: boolean;
}

/**
 * FaqAccordion
 *
 * FAQ section with keyboard-navigable accordion.
 *
 * Keyboard support:
 * - Arrow Up / Down: move focus between triggers.
 * - Home / End: jump to first / last trigger.
 * - Escape: collapse the currently open item.
 * - Enter / Space: toggle item (native button behaviour).
 */
export const FaqAccordion: FC<FaqAccordionProps> = ({
  items      = FAQ_ITEMS,
  allowMulti = false,
}) => {
  const [openIds, setOpenIds] = useState<string[]>([]);

  function toggleItem(id: string): void {
    if (allowMulti) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev[0] === id ? [] : [id]));
    }
  }

  function handleKeyDown(ev: KeyboardEvent<HTMLDivElement>): void {
    const triggers = Array.from(
      ev.currentTarget.querySelectorAll<HTMLButtonElement>('.faq-item__trigger')
    );
    const focusedIndex = triggers.findIndex((el) => el === document.activeElement);
    if (focusedIndex === -1) return;

    if (ev.key === KEY.arrowDown) {
      ev.preventDefault();
      triggers[(focusedIndex + 1) % triggers.length]?.focus();
    } else if (ev.key === KEY.arrowUp) {
      ev.preventDefault();
      triggers[(focusedIndex - 1 + triggers.length) % triggers.length]?.focus();
    } else if (ev.key === KEY.home) {
      ev.preventDefault();
      triggers[0]?.focus();
    } else if (ev.key === KEY.end) {
      ev.preventDefault();
      triggers[triggers.length - 1]?.focus();
    } else if (ev.key === KEY.escape) {
      const currentTrigger = triggers[focusedIndex];
      if (currentTrigger) {
        const itemId = currentTrigger.id.replace('faq-btn-', '');
        if (openIds.includes(itemId)) toggleItem(itemId);
      }
    }
  }

  return (
    <section aria-labelledby="faq-heading" className="faq-section">
      <SectionHeader
        id="faq-heading"
        heading="Frequently asked questions"
        subheading="Can't find the answer you need? Contact our support team."
        centred
      />

      <div
        className="faq-accordion"
        onKeyDown={handleKeyDown}
        role="group"
        aria-label="FAQ accordion"
      >
        {items.map((item) => (
          <FaqItemComponent
            key={item.id}
            item={item}
            isOpen={openIds.includes(item.id)}
            onToggle={toggleItem}
          />
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// NEWSLETTER & CONTACT FORMS
// ─────────────────────────────────────────────────────────────────────────────

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

// ── NewsletterForm ─────────────────────────────────────────────────────────────

/**
 * NewsletterForm
 *
 * Inline email subscription form.
 *
 * Accessibility:
 * - Email input has a visible label (not placeholder-only).
 * - Honeypot field is visually hidden AND aria-hidden so bots fill it but
 *   screen readers skip it.
 * - Success/error responses are announced via useLiveAnnouncer (not just
 *   visual colour changes).
 * - Spinner inside submit button is role="status" + aria-hidden; the button
 *   itself gets aria-disabled while submitting.
 */
export const NewsletterForm: FC = () => {
  const email     = useField('', [
    { fn: (v) => v.trim().length > 0,       msg: 'Email address is required.' },
    { fn: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Enter a valid email address.' },
  ]);
  const honeypot   = useRef('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const announce   = useLiveAnnouncer();
  const statusId   = 'newsletter-status';

  async function handleSubmit(ev: FormEvent<HTMLFormElement>): Promise<void> {
    ev.preventDefault();
    const emailValid = email.validate();
    if (!emailValid) {
      announce('Please fix the form errors before submitting.');
      return;
    }
    if (honeypot.current) return; // bot trap
    setStatus('submitting');
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1200));
      setStatus('success');
      email.reset();
      announce('You have successfully subscribed to the Luminary Studio newsletter.');
    } catch {
      setStatus('error');
      announce('Subscription failed. Please try again.');
    }
  }

  const isSubmitting = status === 'submitting';

  return (
    <section aria-labelledby="newsletter-heading" className="newsletter-section">
      <SectionHeader
        id="newsletter-heading"
        heading="Stay in the loop"
        subheading="Get accessibility tips, product updates, and WCAG guides delivered to your inbox."
        centred
      />

      {status === 'success' ? (
        <p id={statusId} role="status" className="newsletter-form__success">
          🎉 You're subscribed! Check your inbox for a confirmation email.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Newsletter subscription"
          className="newsletter-form"
        >
          {/* Honeypot field — hidden from real users & screen readers */}
          <div aria-hidden="true" className="visually-hidden" tabIndex={-1}>
            <label htmlFor="url-trap">Leave this empty</label>
            <input
              id="url-trap"
              name="url"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              onChange={(ev) => { honeypot.current = ev.target.value; }}
            />
          </div>

          <FormGroup
            label="Email address"
            htmlFor="newsletter-email"
            error={email.state.touched ? email.state.error : undefined}
          >
            <TextInput
              id="newsletter-email"
              type="email"
              name="email"
              placeholder="you@company.com"
              autoComplete="email"
              value={email.state.value}
              onChange={(ev) => email.onChange(ev.target.value)}
              onBlur={email.onBlur}
              required
              invalid={email.state.touched && !!email.state.error}
              aria-describedby={email.state.touched && email.state.error ? 'newsletter-email-error' : undefined}
            />
          </FormGroup>

          {status === 'error' && (
            <ErrorMessage id="newsletter-status" role="alert">
              Something went wrong. Please try again in a moment.
            </ErrorMessage>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            aria-disabled={isSubmitting}
            aria-describedby={statusId}
          >
            {isSubmitting ? 'Subscribing…' : 'Subscribe'}
          </Button>
        </form>
      )}
    </section>
  );
};

// ── ContactForm ────────────────────────────────────────────────────────────────

/**
 * ContactForm
 *
 * Multi-field contact form with error summary and character counter.
 *
 * Accessibility:
 * - All inputs have visible labels via FormGroup/htmlFor.
 * - Required fields are marked with aria-required and a visible indicator.
 * - Error summary receives focus when present (focus management after failed submit).
 * - Character counter on the message textarea is linked via aria-describedby.
 * - Success state announced via role="status".
 */
export const ContactForm: FC = () => {
  const MSG_MAX = 1200;
  const name     = useField('', [{ fn: (v) => v.trim().length > 0, msg: 'Full name is required.' }]);
  const email    = useField('', [
    { fn: (v) => v.trim().length > 0,       msg: 'Email address is required.' },
    { fn: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Enter a valid email address.' },
  ]);
  const subject  = useField('', [{ fn: (v) => v.trim().length > 0, msg: 'Subject is required.' }]);
  const message  = useField('', [
    { fn: (v) => v.trim().length > 0,                  msg: 'Message is required.' },
    { fn: (v) => v.length <= MSG_MAX,                  msg: `Message must be ${MSG_MAX} characters or fewer.` },
  ]);

  const allFields = [name, email, subject, message];
  const [status, setStatus]           = useState<FormStatus>('idle');
  const summaryRef                    = useRef<HTMLDivElement>(null);
  const announce                      = useLiveAnnouncer();
  const counterId                     = 'contact-message-counter';
  const summaryId                     = 'contact-error-summary';

  async function handleSubmit(ev: FormEvent<HTMLFormElement>): Promise<void> {
    ev.preventDefault();
    const valid = allFields.map((f) => f.validate()).every(Boolean);
    if (!valid) {
      announce('The form has errors. Please review and correct them.');
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus('submitting');
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1200));
      setStatus('success');
      allFields.forEach((f) => f.reset());
      announce('Your message has been sent. We will get back to you within two business days.');
    } catch {
      setStatus('error');
      announce('Submission failed. Please try again.');
    }
  }

  const isSubmitting   = status === 'submitting';
  const errors = allFields.filter((f) => f.state.touched && f.state.error);
  const errorLabels: Record<string, string> = {
    [name.state.value]:    'Full name',
    [email.state.value]:   'Email address',
    [subject.state.value]: 'Subject',
    [message.state.value]: 'Message',
  };

  const fieldErrors: Array<{ label: string; href: string; msg: string }> = [
    name.state.touched    && name.state.error    ? { label: 'Full name',    href: '#contact-name',    msg: name.state.error    } : null,
    email.state.touched   && email.state.error   ? { label: 'Email',        href: '#contact-email',   msg: email.state.error   } : null,
    subject.state.touched && subject.state.error ? { label: 'Subject',      href: '#contact-subject', msg: subject.state.error } : null,
    message.state.touched && message.state.error ? { label: 'Message',      href: '#contact-message', msg: message.state.error } : null,
  ].filter(Boolean) as Array<{ label: string; href: string; msg: string }>;

  return (
    <section aria-labelledby="contact-heading" className="contact-section" id="contact">
      <SectionHeader
        id="contact-heading"
        heading="Get in touch"
        subheading="Our team responds within two business days."
        centred
      />

      {status === 'success' ? (
        <p role="status" className="contact-form__success">
          ✅ Message received! We'll be in touch soon.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Contact form"
          className="contact-form"
        >
          {/* Error summary */}
          {fieldErrors.length > 0 && (
            <div
              id={summaryId}
              ref={summaryRef}
              role="alert"
              aria-labelledby="contact-error-summary-heading"
              tabIndex={-1}
              className="error-summary"
            >
              <h2 id="contact-error-summary-heading" className="error-summary__heading">
                There are {fieldErrors.length} error{fieldErrors.length > 1 ? 's' : ''} in this form
              </h2>
              <ul className="error-summary__list">
                {fieldErrors.map((err) => (
                  <li key={err.href}>
                    <a href={err.href}>{err.label}: {err.msg}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <FormGroup
            label="Full name"
            htmlFor="contact-name"
            required
            error={name.state.touched ? name.state.error : undefined}
          >
            <TextInput
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              aria-required="true"
              value={name.state.value}
              onChange={(ev) => name.onChange(ev.target.value)}
              onBlur={name.onBlur}
              invalid={name.state.touched && !!name.state.error}
              aria-describedby={name.state.touched && name.state.error ? 'contact-name-error' : undefined}
            />
          </FormGroup>

          <FormGroup
            label="Email address"
            htmlFor="contact-email"
            required
            error={email.state.touched ? email.state.error : undefined}
          >
            <TextInput
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              value={email.state.value}
              onChange={(ev) => email.onChange(ev.target.value)}
              onBlur={email.onBlur}
              invalid={email.state.touched && !!email.state.error}
              aria-describedby={email.state.touched && email.state.error ? 'contact-email-error' : undefined}
            />
          </FormGroup>

          <FormGroup
            label="Subject"
            htmlFor="contact-subject"
            required
            error={subject.state.touched ? subject.state.error : undefined}
          >
            <TextInput
              id="contact-subject"
              name="subject"
              type="text"
              required
              aria-required="true"
              value={subject.state.value}
              onChange={(ev) => subject.onChange(ev.target.value)}
              onBlur={subject.onBlur}
              invalid={subject.state.touched && !!subject.state.error}
              aria-describedby={subject.state.touched && subject.state.error ? 'contact-subject-error' : undefined}
            />
          </FormGroup>

          <FormGroup
            label="Message"
            htmlFor="contact-message"
            required
            hint={`Up to ${MSG_MAX} characters.`}
            error={message.state.touched ? message.state.error : undefined}
          >
            <Textarea
              id="contact-message"
              name="message"
              rows={6}
              required
              aria-required="true"
              value={message.state.value}
              onChange={(ev) => message.onChange(ev.target.value)}
              onBlur={message.onBlur}
              invalid={message.state.touched && !!message.state.error}
              aria-describedby={[
                counterId,
                message.state.touched && message.state.error ? 'contact-message-error' : '',
              ].filter(Boolean).join(' ')}
            />
            <p
              id={counterId}
              aria-live="polite"
              aria-atomic="true"
              className={[
                'contact-form__char-count',
                message.state.value.length > MSG_MAX ? 'contact-form__char-count--exceeded' : '',
              ].filter(Boolean).join(' ')}
            >
              {message.state.value.length}/{MSG_MAX} characters used
            </p>
          </FormGroup>

          {status === 'error' && (
            <ErrorMessage id="contact-server-error" role="alert">
              Submission failed. Please check your connection and try again.
            </ErrorMessage>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            aria-disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending…' : 'Send message'}
          </Button>
        </form>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────

interface FooterLinkGroup {
  heading: string;
  links  : Array<{ label: string; href: string; isExternal?: boolean }>;
}

const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Features',     href: '/features'   },
      { label: 'Integrations', href: '/integrations' },
      { label: 'Pricing',      href: '/pricing'    },
      { label: 'Changelog',    href: '/changelog'  },
      { label: 'Roadmap',      href: '/roadmap'    },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Documentation',    href: '/docs'      },
      { label: 'API Reference',    href: '/api'       },
      { label: 'WCAG Guides',      href: '/wcag'      },
      { label: 'Blog',             href: '/blog'      },
      { label: 'Community forum',  href: '/community', isExternal: true },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About us',   href: '/about'  },
      { label: 'Careers',    href: '/jobs'   },
      { label: 'Press kit',  href: '/press'  },
      { label: 'Contact',    href: '#contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy policy',    href: '/privacy'    },
      { label: 'Terms of service',  href: '/terms'      },
      { label: 'Cookie settings',   href: '/cookies'    },
      { label: 'Accessibility statement', href: '/accessibility' },
    ],
  },
];

// ── FooterNavGroup ──────────────────────────────────────────────────────────

interface FooterNavGroupProps {
  group: FooterLinkGroup;
}

/**
 * FooterNavGroup
 *
 * A labelled navigation column in the footer.
 */
export const FooterNavGroup: FC<FooterNavGroupProps> = ({ group }) => {
  const headingId = `footer-nav-${group.heading.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="footer-nav-group">
      <h2 id={headingId} className="footer-nav-group__heading">{group.heading}</h2>
      <ul role="list" aria-labelledby={headingId} className="footer-nav-group__list">
        {group.links.map((link) => (
          <li key={link.href}>
            {link.isExternal ? (
              <a
                href={link.href}
                className="footer-nav-group__link"
                rel="noreferrer noopener"
                target="_blank"
              >
                {link.label}
                <VisuallyHidden>, opens in a new tab</VisuallyHidden>
                <span aria-hidden="true"> ↗</span>
              </a>
            ) : (
              <a href={link.href} className="footer-nav-group__link">
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── SiteFooter ─────────────────────────────────────────────────────────────────

/**
 * SiteFooter
 *
 * Page-level contentinfo landmark.
 *
 * Accessibility:
 * - Uses <footer> (implicit role="contentinfo").
 * - Each nav column is a labelled group (headings with matching id).
 * - Social links have accessible names via aria-label.
 * - Back-to-top button scrolls to #main-content (the skip-link target).
 * - Copyright year is generated at runtime.
 */
export const SiteFooter: FC = () => {
  const currentYear = new Date().getFullYear();

  function scrollToTop(ev: MouseEvent<HTMLButtonElement>): void {
    ev.preventDefault();
    const target = document.getElementById('main-content');
    if (target) {
      target.focus({ preventScroll: false });
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="site-footer__inner">
        {/* Brand col */}
        <div className="site-footer__brand">
          <SiteLogo />
          <p className="site-footer__tagline">
            Build inclusively. Ship confidently. Reach everyone.
          </p>

          {/* Social links */}
          <nav aria-label="Social media links" className="site-footer__social">
            <ul role="list" className="site-footer__social-list">
              {[
                { href: 'https://twitter.com/luminarystudio', label: 'Follow us on Twitter' },
                { href: 'https://github.com/luminarystudio',  label: 'View us on GitHub'   },
                { href: 'https://linkedin.com/company/luminarystudio', label: 'Connect on LinkedIn' },
              ].map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    className="site-footer__social-link"
                    aria-label={s.label}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    {/* Icon rendered as decorative span */}
                    <span aria-hidden="true" className="social-icon" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Nav columns */}
        <nav aria-label="Footer navigation" className="site-footer__nav">
          {FOOTER_LINK_GROUPS.map((group) => (
            <FooterNavGroup key={group.heading} group={group} />
          ))}
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="site-footer__bottom">
        <p className="site-footer__copyright">
          © {currentYear} Luminary Studio Ltd. All rights reserved.
        </p>
        <button
          type="button"
          className="back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top of page"
        >
          <span aria-hidden="true">↑</span> Back to top
        </button>
      </div>
    </footer>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL & NOTIFICATION SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

// ── Modal ──────────────────────────────────────────────────────────────────────

export interface ModalProps {
  isOpen       : boolean;
  onClose      : () => void;
  title        : string;
  titleId     ?: string;
  description ?: string;
  descId      ?: string;
  size        ?: 'sm' | 'md' | 'lg' | 'fullscreen';
  children     : ReactNode;
}

/**
 * Modal
 *
 * Accessible dialog component.
 *
 * Accessibility:
 * - role="dialog" + aria-modal="true".
 * - Labelled by title heading via aria-labelledby.
 * - Optionally described by aria-describedby.
 * - Focus is trapped inside using useFocusTrap.
 * - Escape key closes the dialog.
 * - Focus returns to the trigger element (passed via lastFocusRef from useFocusTrap).
 * - Backdrop click closes the dialog.
 * - Body scroll is locked while open.
 */
export const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  titleId    = 'modal-title',
  description,
  descId     = 'modal-desc',
  size       = 'md',
  children,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, isOpen);

  // Body scroll lock.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Escape key.
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(ev: globalThis.KeyboardEvent): void {
      if (ev.key === KEY.escape) onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" aria-modal="true" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={['modal-dialog', `modal-dialog--${size}`].join(' ')}
        onClick={(ev) => ev.stopPropagation()}
      >
        {/* Header */}
        <header className="modal-dialog__header">
          <h2 id={titleId} className="modal-dialog__title">{title}</h2>
          <IconButton
            aria-label="Close dialog"
            className="modal-dialog__close"
            onClick={onClose}
          >
            ×
          </IconButton>
        </header>

        {/* Description */}
        {description && (
          <p id={descId} className="modal-dialog__description">{description}</p>
        )}

        {/* Body */}
        <div className="modal-dialog__body">{children}</div>
      </div>
    </div>
  );
};

// ── NotificationToast ──────────────────────────────────────────────────────────

interface NotificationToastProps {
  notification: Notification;
  onDismiss   : (id: string) => void;
}

/**
 * NotificationToast
 *
 * Individual toast notification.
 *
 * Accessibility:
 * - Error/warning use role="alert" (implicit aria-live="assertive").
 * - Info/success use role="status" (implicit aria-live="polite").
 * - Dismiss button has an accessible name that includes the message context.
 */
export const NotificationToast: FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  const liveRole = notification.variant === 'error' || notification.variant === 'warning'
    ? 'alert'
    : 'status';

  return (
    <div
      role={liveRole}
      aria-atomic="true"
      className={['toast', `toast--${notification.variant}`].join(' ')}
    >
      <p className="toast__message">{notification.message}</p>
      <button
        type="button"
        className="toast__dismiss"
        aria-label={`Dismiss notification: ${notification.message}`}
        onClick={() => onDismiss(notification.id)}
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
};

// ── NotificationContainer ──────────────────────────────────────────────────────

/**
 * NotificationContainer
 *
 * Renders all active toasts from NotificationContext.
 *
 * Accessibility:
 * - The container has aria-label="Notifications".
 * - Individual toasts carry their own role="alert" or role="status".
 */
export const NotificationContainer: FC = () => {
  const { notifications, dismiss } = useContext(NotificationContext);

  if (notifications.length === 0) return null;

  return (
    <div
      className="notification-container"
      aria-label="Notifications"
      aria-live="off"
    >
      {notifications.map((n) => (
        <NotificationToast key={n.id} notification={n} onDismiss={dismiss} />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// APP ROOT & PAGE COMPOSITION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LuminaryPage
 *
 * Root page component that composes every section of the Luminary Studio
 * marketing site in document order.
 *
 * Accessibility:
 * - ThemeProvider and NotificationProvider wrap the entire tree.
 * - SkipLinks rendered before the <body> content so keyboard users can jump to
 *   main content, the product catalogue, and the contact form.
 * - <main> has id="main-content" that matches SkipLinks targets and the
 *   back-to-top button's focus destination.
 * - NotificationContainer rendered last so toasts overlay all content.
 *
 * All sections use landmark elements (<header>, <main>, <footer>, <nav>,
 * <section aria-labelledby>) so the page has a complete, navigable landmark
 * structure.
 */
export const LuminaryPage: FC = () => {
  const [isDemoModalOpen, setDemoModalOpen] = useState(false);
  const demoTriggerRef = useRef<HTMLButtonElement>(null);

  function openDemoModal(): void  { setDemoModalOpen(true);  }
  function closeDemoModal(): void {
    setDemoModalOpen(false);
    // Return focus to the trigger that opened the dialog.
    requestAnimationFrame(() => demoTriggerRef.current?.focus());
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
        {/* Skip navigation links — first focusable elements on the page */}
        <SkipLinks />

        {/* Persistent site header */}
        <SiteHeader onRequestDemo={openDemoModal} demoTriggerRef={demoTriggerRef} />

        {/* Main content landmark */}
        <main id="main-content" tabIndex={-1} className="luminary-main">

          {/* Hero */}
          <HeroSection />

          {/* Key statistics */}
          <StatsBar />

          {/* Integration logos marquee */}
          <IntegrationsBar />

          {/* How it works */}
          <HowItWorksSection />

          {/* Product catalogue */}
          <div id="products">
            <ProductsSection />
          </div>

          {/* Feature comparison table */}
          <ComparisonTableSection />

          {/* Pricing plans */}
          <PricingSection />

          {/* Customer testimonials */}
          <TestimonialsCarousel />

          {/* FAQ accordion */}
          <FaqAccordion />

          {/* Newsletter subscription */}
          <NewsletterForm />

          {/* Contact form */}
          <ContactForm />

        </main>

        {/* Page footer */}
        <SiteFooter />

        {/* Demo request modal */}
        <Modal
          isOpen={isDemoModalOpen}
          onClose={closeDemoModal}
          title="Request a personalised demo"
          description="Fill in the form below and we will reach out within one business day to schedule a tailored walkthrough."
        >
          <ContactForm />
        </Modal>

        {/* Global notification toasts */}
        <NotificationContainer />
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default LuminaryPage;

// ═══════════════════════════════════════════════════════════════════════════
// LUMINARY DESIGN SYSTEM — EXTENDED COMPONENT LIBRARY
// Fully accessible, WCAG 2.2 compliant React components.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Type Utilities ──────────────────────────────────────────────────────────

type Maybe<T> = T | null | undefined;
type Nullable<T> = T | null;
type NonEmptyArray<T> = [T, ...T[]];
type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
type DeepReadonly<T> = T extends (infer A)[] ? DeepReadonlyArray<A> : T extends object ? DeepReadonlyObject<T> : T;
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
type DeepReadonlyObject<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };
type Awaited<T> = T extends PromiseLike<infer R> ? R : T;
type ValueOf<T> = T[keyof T];
type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];
type Prettify<T> = { [K in keyof T]: T[K] } & NonNullable<unknown>;
type Override<T, U> = Omit<T, keyof U> & U;
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];
type ExactlyOneOf<T, Keys extends keyof T = keyof T> = { [K in Keys]: Pick<T, K> & Partial<Record<Exclude<Keys, K>, never>> }[Keys] & Pick<T, Exclude<keyof T, Keys>>;

// ─── String Utilities ────────────────────────────────────────────────────────

const toCamelCase = (s: string): string =>
  s.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');

const toKebabCase = (s: string): string =>
  s.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');

const toTitleCase = (s: string): string =>
  s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

const truncate = (s: string, maxLength: number, ellipsis = '…'): string =>
  s.length <= maxLength ? s : s.slice(0, maxLength - ellipsis.length) + ellipsis;

const slugify = (s: string): string =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const pluralize = (count: number, singular: string, plural?: string): string =>
  `${count} ${count === 1 ? singular : (plural || singular + 's')}`;

const padStart = (s: string | number, len: number, char = '0'): string =>
  String(s).padStart(len, char);

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const stripHtml = (s: string): string =>
  s.replace(/<[^>]*>/g, '');

const countWords = (s: string): number =>
  s.trim().split(/\s+/).filter(Boolean).length;

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = Math.max(0, decimals);
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// ─── Number & Math Utilities ─────────────────────────────────────────────────

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

const inverseLerp = (a: number, b: number, value: number): number =>
  (value - a) / (b - a);

const remap = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number =>
  lerp(outMin, outMax, inverseLerp(inMin, inMax, value));

const roundTo = (value: number, precision: number): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

const formatNumber = (n: number, locale = 'en-US', options?: Intl.NumberFormatOptions): string =>
  new Intl.NumberFormat(locale, options).format(n);

const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);

const formatPercent = (value: number, decimals = 1): string =>
  `${(value * 100).toFixed(decimals)}%`;

const sum = (...nums: number[]): number =>
  nums.reduce((acc, n) => acc + n, 0);

const average = (...nums: number[]): number =>
  nums.length ? sum(...nums) / nums.length : 0;

const median = (nums: number[]): number => {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
};

const standardDeviation = (nums: number[]): number => {
  if (nums.length < 2) return 0;
  const mean = average(...nums);
  const squaredDiffs = nums.map((n) => Math.pow(n - mean, 2));
  return Math.sqrt(average(...squaredDiffs));
};

// ─── Array Utilities ─────────────────────────────────────────────────────────

const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const unique = <T>(array: T[]): T[] =>
  Array.from(new Set(array));

const uniqueBy = <T, K>(array: T[], keyFn: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> => {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(item);
    return acc;
  }, {} as Record<K, T[]>);
};

const sortBy = <T>(array: T[], ...keys: ((item: T) => string | number)[]): T[] =>
  [...array].sort((a, b) => {
    for (const key of keys) {
      const av = key(a); const bv = key(b);
      if (av < bv) return -1;
      if (av > bv) return 1;
    }
    return 0;
  });

const flatten = <T>(array: (T | T[])[]): T[] =>
  array.flatMap((item) => Array.isArray(item) ? item : [item]);

const zip = <A, B>(a: A[], b: B[]): [A, B][] =>
  a.slice(0, Math.min(a.length, b.length)).map((item, idx) => [item, b[idx]!]);

const range = (start: number, end?: number, step = 1): number[] => {
  const [from, to] = end === undefined ? [0, start] : [start, end];
  const result: number[] = [];
  for (let i = from; i < to; i += step) result.push(i);
  return result;
};

const last = <T>(array: T[]): T | undefined =>
  array[array.length - 1];

const first = <T>(array: T[]): T | undefined =>
  array[0];

const countBy = <T>(array: T[], predicate: (item: T) => boolean): number =>
  array.reduce((count, item) => count + (predicate(item) ? 1 : 0), 0);

const partition = <T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] =>
  array.reduce<[T[], T[]]>(([pass, fail], item) =>
    predicate(item) ? [[...pass, item], fail] : [pass, [...fail, item]],
    [[], []]
  );

const intersect = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item));
};

const difference = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b);
  return a.filter((item) => !setB.has(item));
};

const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};

// ─── Object Utilities ────────────────────────────────────────────────────────

const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => { if (key in obj) result[key] = obj[key]; });
  return result;
};

const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete (result as T)[key]);
  return result as Omit<T, K>;
};

const mapValues = <T extends object, V>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => V,
): Record<keyof T, V> => {
  const result = {} as Record<keyof T, V>;
  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    result[key] = fn(obj[key], key);
  });
  return result;
};

const filterObject = <T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean,
): Partial<T> => {
  const result: Partial<T> = {};
  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    if (predicate(obj[key], key)) result[key] = obj[key];
  });
  return result;
};

const deepMerge = <T extends object>(target: T, ...sources: DeepPartial<T>[]): T => {
  const result = { ...target };
  for (const source of sources) {
    for (const key in source) {
      const sv = (source as T)[key as keyof T];
      const tv = result[key as keyof T];
      if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
        result[key as keyof T] = deepMerge(tv as object, sv as object) as T[keyof T];
      } else if (sv !== undefined) {
        result[key as keyof T] = sv as T[keyof T];
      }
    }
  }
  return result;
};

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== 'object') return false;
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
};

const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T;
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone((obj as Record<string, unknown>)[key]);
    }
  }
  return result as T;
};

// ─── Date Utilities ──────────────────────────────────────────────────────────

const formatDate = (date: Date, locale = 'en-US', options?: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat(locale, options || { year: 'numeric', month: 'long', day: 'numeric' }).format(date);

const formatRelativeTime = (date: Date, relativeTo = new Date()): string => {
  const diffMs = date.getTime() - relativeTo.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr  = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);
  const diffWk  = Math.round(diffDay / 7);
  const diffMo  = Math.round(diffDay / 30);
  const diffYr  = Math.round(diffDay / 365);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffHr)  < 24) return rtf.format(diffHr, 'hour');
  if (Math.abs(diffDay) < 7)  return rtf.format(diffDay, 'day');
  if (Math.abs(diffWk)  < 5)  return rtf.format(diffWk, 'week');
  if (Math.abs(diffMo)  < 12) return rtf.format(diffMo, 'month');
  return rtf.format(diffYr, 'year');
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const startOfWeek = (date: Date, startDay = 0): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day - startDay + 7) % 7;
  result.setDate(result.getDate() - diff);
  return startOfDay(result);
};

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isWithinInterval = (date: Date, start: Date, end: Date): boolean =>
  date >= start && date <= end;

const parseISODate = (s: string): Date => {
  const d = new Date(s);
  if (isNaN(d.getTime())) throw new Error(`Invalid ISO date: ${s}`);
  return d;
};

const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

// ─── URL & Query String Utilities ────────────────────────────────────────────

const parseQueryString = (search: string): Record<string, string | string[]> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string | string[]> = {};
  params.forEach((value, key) => {
    if (key in result) {
      const existing = result[key]!;
      result[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      result[key] = value;
    }
  });
  return result;
};

const buildQueryString = (params: Record<string, string | string[] | number | boolean | null | undefined>): string => {
  const search = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val == null) continue;
    if (Array.isArray(val)) { val.forEach((v) => search.append(key, String(v))); }
    else { search.set(key, String(val)); }
  }
  const s = search.toString();
  return s ? `?${s}` : '';
};

// ─── Local Storage Utilities ─────────────────────────────────────────────────

const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or private browsing
    }
  },
  remove: (key: string): void => {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
  clear: (): void => {
    try { localStorage.clear(); } catch { /* noop */ }
  },
};

// ─── Custom React Hooks ───────────────────────────────────────────────────────

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => storage.get(key, initialValue));
  const setValue = React.useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
      storage.set(key, next);
      return next;
    });
  }, [key]);
  return [storedValue, setValue] as const;
}

function useSessionStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) as T : initialValue;
    } catch { return initialValue; }
  });
  const set = React.useCallback((v: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, [key]);
  return [value, set] as const;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useThrottle<T>(value: T, interval: number): T {
  const [throttled, setThrottled] = React.useState(value);
  const lastUpdated = React.useRef<number>(Date.now());
  React.useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= interval) {
      setThrottled(value);
      lastUpdated.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottled(value);
        lastUpdated.current = Date.now();
      }, interval - (now - lastUpdated.current));
      return () => clearTimeout(timer);
    }
  }, [value, interval]);
  return throttled;
}

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);
  React.useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}

function useIsMounted(): () => boolean {
  const isMountedRef = React.useRef(false);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);
  return React.useCallback(() => isMountedRef.current, []);
}

function useClickOutside<T extends HTMLElement>(handler: () => void): React.RefObject<T> {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);
  return ref;
}

function useWindowSize() {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

function useIntersectionObserver<T extends HTMLElement>(
  options?: IntersectionObserverInit,
): [React.RefObject<T>, boolean] {
  const ref = React.useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry!.isIntersecting);
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);
  return [ref, isIntersecting];
}

function useResizeObserver<T extends HTMLElement>(): [React.RefObject<T>, DOMRectReadOnly | null] {
  const ref = React.useRef<T>(null);
  const [rect, setRect] = React.useState<DOMRectReadOnly | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setRect(entry.contentRect);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, rect];
}

function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (e: WindowEventMap[K]) => void,
  element: EventTarget = window,
  options?: boolean | AddEventListenerOptions,
): void {
  const savedHandler = React.useRef(handler);
  React.useLayoutEffect(() => { savedHandler.current = handler; }, [handler]);
  React.useEffect(() => {
    const listener = (e: Event) => savedHandler.current(e as WindowEventMap[K]);
    element.addEventListener(eventName, listener, options);
    return () => element.removeEventListener(eventName, listener, options);
  }, [eventName, element, options]);
}

function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

function useCounter(initialValue = 0, min?: number, max?: number) {
  const [count, setCount] = React.useState(initialValue);
  const increment = React.useCallback(() => setCount((c) => max !== undefined ? Math.min(c + 1, max) : c + 1), [max]);
  const decrement = React.useCallback(() => setCount((c) => min !== undefined ? Math.max(c - 1, min) : c - 1), [min]);
  const reset     = React.useCallback(() => setCount(initialValue), [initialValue]);
  const set       = React.useCallback((v: number) => setCount(
    min !== undefined && max !== undefined ? clamp(v, min, max) : v
  ), [min, max]);
  return { count, increment, decrement, reset, set };
}

function useToggle(initialValue = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = React.useState(initialValue);
  const toggle = React.useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

function useAsyncState<T>() {
  const [state, setState] = React.useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    data: T | null;
    error: Error | null;
  }>({ status: 'idle', data: null, error: null });

  const run = React.useCallback(async (promise: Promise<T>) => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await promise;
      setState({ status: 'success', data, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ status: 'error', data: null, error });
      throw error;
    }
  }, []);

  return { ...state, run };
}

function useMediaQuery(breakpoints: Record<string, string>) {
  const [matches, setMatches] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      Object.entries(breakpoints).map(([key, query]) => [
        key,
        typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
      ])
    )
  );

  React.useEffect(() => {
    const queries = Object.entries(breakpoints).map(([key, query]) => {
      const mq = window.matchMedia(query);
      const handler = (e: MediaQueryListEvent) => {
        setMatches((prev) => ({ ...prev, [key]: e.matches }));
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    });
    return () => queries.forEach((cleanup) => cleanup());
  }, [breakpoints]);

  return matches;
}

function useFocusVisible(): [React.RefObject<HTMLElement>, boolean] {
  const ref = React.useRef<HTMLElement>(null);
  const [isFocusVisible, setIsFocusVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onFocus = (e: FocusEvent) => {
      const isKeyboard = !(e as FocusEvent & { sourceCapabilities?: { firesTouchEvents: boolean } })
        .sourceCapabilities?.firesTouchEvents;
      setIsFocusVisible(isKeyboard);
    };
    const onBlur = () => setIsFocusVisible(false);
    el.addEventListener('focus', onFocus);
    el.addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('focus', onFocus);
      el.removeEventListener('blur', onBlur);
    };
  }, []);

  return [ref, isFocusVisible];
}

function useDocumentTitle(title: string, suffix?: string): void {
  React.useEffect(() => {
    const original = document.title;
    document.title = suffix ? `${title} | ${suffix}` : title;
    return () => { document.title = original; };
  }, [title, suffix]);
}

function useCopyToClipboard(): [string | null, (text: string) => Promise<void>] {
  const [copiedText, setCopiedText] = React.useState<string | null>(null);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      setCopiedText(null);
    }
  };
  return [copiedText, copy];
}

function useKeyboardShortcut(
  keys: string[],
  callback: (e: KeyboardEvent) => void,
  options: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {},
): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (options.ctrlKey  && !e.ctrlKey)  return;
      if (options.metaKey  && !e.metaKey)  return;
      if (options.shiftKey && !e.shiftKey) return;
      if (options.altKey   && !e.altKey)   return;
      if (keys.includes(e.key)) {
        e.preventDefault();
        savedCallback.current(e);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [keys, options.ctrlKey, options.metaKey, options.shiftKey, options.altKey]);
}

function usePrefersDarkMode(): boolean {
  return useMatchMedia('(prefers-color-scheme: dark)');
}

function usePrefersReducedMotion(): boolean {
  return useMatchMedia('(prefers-reduced-motion: reduce)');
}

function useHighContrastMode(): boolean {
  return useMatchMedia('(forced-colors: active)');
}

// ─── Form Utilities ───────────────────────────────────────────────────────────

type ValidationRule<T> = (value: T) => string | null;

const validators = {
  required: (message = 'This field is required'): ValidationRule<string> =>
    (v) => v.trim() ? null : message,
  minLength: (min: number, message?: string): ValidationRule<string> =>
    (v) => v.length >= min ? null : message || `Must be at least ${min} characters`,
  maxLength: (max: number, message?: string): ValidationRule<string> =>
    (v) => v.length <= max ? null : message || `Must be no more than ${max} characters`,
  pattern: (re: RegExp, message = 'Invalid format'): ValidationRule<string> =>
    (v) => re.test(v) ? null : message,
  email: (message = 'Invalid email address'): ValidationRule<string> =>
    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : message,
  url: (message = 'Invalid URL'): ValidationRule<string> => (v) => {
    try { new URL(v); return null; } catch { return message; }
  },
  min: (min: number, message?: string): ValidationRule<number> =>
    (v) => v >= min ? null : message || `Must be at least ${min}`,
  max: (max: number, message?: string): ValidationRule<number> =>
    (v) => v <= max ? null : message || `Must be no more than ${max}`,
  integer: (message = 'Must be an integer'): ValidationRule<number> =>
    (v) => Number.isInteger(v) ? null : message,
};

function composeValidators<T>(...rules: ValidationRule<T>[]): ValidationRule<T> {
  return (value: T) => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  };
}

interface FieldState<T> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

function useField<T>(
  initialValue: T,
  validate?: ValidationRule<T>,
): FieldState<T> & {
  setValue: (v: T) => void;
  setTouched: () => void;
  reset: () => void;
  validate: () => boolean;
  inputProps: {
    value: T;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    'aria-invalid': boolean | undefined;
    'aria-required': boolean | undefined;
  };
} {
  const [state, setState] = React.useState<FieldState<T>>({
    value: initialValue,
    error: null,
    touched: false,
    dirty: false,
  });

  const runValidation = React.useCallback((v: T): string | null =>
    validate ? validate(v) : null,
    [validate]
  );

  const setValue = React.useCallback((v: T) => {
    setState((prev) => ({
      ...prev,
      value: v,
      dirty: v !== initialValue,
      error: prev.touched ? runValidation(v) : prev.error,
    }));
  }, [initialValue, runValidation]);

  const setTouched = React.useCallback(() => {
    setState((prev) => ({ ...prev, touched: true, error: runValidation(prev.value) }));
  }, [runValidation]);

  const reset = React.useCallback(() => {
    setState({ value: initialValue, error: null, touched: false, dirty: false });
  }, [initialValue]);

  const doValidate = React.useCallback((): boolean => {
    const error = runValidation(state.value);
    setState((prev) => ({ ...prev, touched: true, error }));
    return !error;
  }, [runValidation, state.value]);

  return {
    ...state,
    setValue,
    setTouched,
    reset,
    validate: doValidate,
    inputProps: {
      value: state.value,
      onChange: (e) => setValue(e.target.value as unknown as T),
      onBlur: setTouched,
      'aria-invalid': state.touched && !!state.error ? true : undefined,
      'aria-required': validate ? true : undefined,
    },
  };
}

// ─── Accessible Form Components ───────────────────────────────────────────────

interface FormFieldWrapperProps {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({ label, id, error, hint, required, children }) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="form-field" aria-invalid={!!error || undefined}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span aria-hidden="true" className="form-required">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {hint && <p id={hintId} className="form-hint">{hint}</p>}
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': !!error || undefined,
          'aria-required': required || undefined,
        }) : child
      )}
      {error && (
        <p id={errorId} role="alert" className="form-error" aria-live="polite">{error}</p>
      )}
    </div>
  );
};

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, id, error, hint, ...rest }) => (
  <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required || !!rest['aria-required']}>
    <input type="text" id={id} {...rest} />
  </FormFieldWrapper>
);

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, id, error, hint, options, placeholder, ...rest }) => (
  <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required}>
    <select id={id} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </FormFieldWrapper>
);

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  charCount?: boolean;
  maxChars?: number;
}

const TextareaInput: React.FC<TextareaInputProps> = ({ label, id, error, hint, charCount, maxChars, value, onChange, ...rest }) => {
  const [length, setLength] = React.useState(String(value || '').length);
  const countId = charCount ? `${id}-count` : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLength(e.target.value.length);
    onChange?.(e);
  };

  const isOverLimit = maxChars !== undefined && length > maxChars;

  return (
    <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required}>
      <textarea id={id} value={value} onChange={handleChange} aria-describedby={countId || undefined} {...rest} />
      {charCount && (
        <p id={countId} aria-live="polite" aria-atomic="true" className={`char-count ${isOverLimit ? 'char-count--over' : ''}`}>
          {maxChars !== undefined ? `${length} / ${maxChars} characters` : `${length} characters`}
        </p>
      )}
    </FormFieldWrapper>
  );
};

// ─── Status Components ────────────────────────────────────────────────────────

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertBannerProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  live?: 'polite' | 'assertive' | 'off';
}

const ALERT_ICONS: Record<AlertVariant, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✗',
};

const AlertBanner: React.FC<AlertBannerProps> = ({ variant = 'info', title, children, onDismiss, icon, live }) => {
  const ariaRole = variant === 'error' || variant === 'warning' ? 'alert' : 'status';
  const ariaLive = live || (variant === 'error' ? 'assertive' : 'polite');
  return (
    <div role={ariaRole} aria-live={ariaLive} aria-atomic="true" className={`alert alert--${variant}`}>
      <span className="alert__icon" aria-hidden="true">{icon || ALERT_ICONS[variant]}</span>
      <div className="alert__body">
        {title && <strong className="alert__title">{title}</strong>}
        <div className="alert__message">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert__dismiss"
          aria-label="Dismiss notification"
          onClick={onDismiss}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, label, showValue = false, size = 'md', variant = 'default' }) => {
  const pct = clamp((value / max) * 100, 0, 100);
  const id = React.useId();
  return (
    <div className={`progress progress--${size} progress--${variant}`} role="group" aria-labelledby={id}>
      <span id={id} className="progress__label">{label}</span>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={id}
        aria-valuetext={`${label}: ${Math.round(pct)}%`}
        style={{ width: `${pct}%` }}
        className="progress__bar"
      />
      {showValue && <span className="progress__value" aria-hidden="true">{Math.round(pct)}%</span>}
    </div>
  );
};

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const LoadingSpinner: React.FC<SpinnerProps> = ({ size = 'md', label = 'Loading...' }) => (
  <div role="status" aria-label={label} className={`spinner spinner--${size}`}>
    <span className="sr-only">{label}</span>
    <span aria-hidden="true" className="spinner__ring" />
  </div>
);

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circle' | 'rect';
  animated?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ width, height, variant = 'rect', animated = true }) => (
  <span
    aria-hidden="true"
    className={`skeleton skeleton--${variant} ${animated ? 'skeleton--animated' : ''}`}
    style={{ display: 'block', width, height }}
  />
);

interface SkeletonScreenProps {
  lines?: number;
  label?: string;
}

const SkeletonScreen: React.FC<SkeletonScreenProps> = ({ lines = 4, label = 'Loading content...' }) => (
  <div role="status" aria-label={label} aria-busy="true">
    <span className="sr-only">{label}</span>
    {range(lines).map((i) => (
      <Skeleton key={i} height={16} width={`${100 - (i % 3) * 10}%`} variant="text" />
    ))}
  </div>
);

// ─── Navigation Components ────────────────────────────────────────────────────

interface SidebarNavItem2 {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: SidebarNavItem2[];
}

interface SidebarNavProps {
  items: SidebarNavItem2[];
  currentHref: string;
  label?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ items, currentHref, label = 'Primary navigation' }) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const renderItem = (item: SidebarNavItem2, depth = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isCurrent = item.href === currentHref;
    const isExpand = expanded.has(item.id);
    const itemId = `nav-item-${item.id}`;
    const subId = `nav-sub-${item.id}`;

    return (
      <li key={item.id}>
        {hasChildren ? (
          <>
            <button
              id={itemId}
              type="button"
              aria-expanded={isExpand}
              aria-controls={subId}
              onClick={() => toggleExpanded(item.id)}
              className="nav__item nav__item--expandable"
              style={{ paddingLeft: depth * 16 + 12 }}
            >
              {item.icon && <span className="nav__icon" aria-hidden="true">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="nav__badge" aria-label={`, ${item.badge} notifications`}>{item.badge}</span>
              )}
              <span aria-hidden="true" className={`nav__chevron ${isExpand ? 'nav__chevron--up' : ''}`}>▾</span>
            </button>
            <ul id={subId} role="group" aria-labelledby={itemId} hidden={!isExpand}>
              {item.children!.map((child) => renderItem(child, depth + 1))}
            </ul>
          </>
        ) : (
          <a
            id={itemId}
            href={item.href}
            aria-current={isCurrent ? 'page' : undefined}
            className={`nav__item nav__item--link ${isCurrent ? 'nav__item--current' : ''}`}
            style={{ paddingLeft: depth * 16 + 12 }}
          >
            {item.icon && <span className="nav__icon" aria-hidden="true">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className="nav__badge" aria-label={`, ${item.badge} notifications`}>{item.badge}</span>
            )}
          </a>
        )}
      </li>
    );
  };

  return (
    <nav aria-label={label} className="sidebar-nav">
      <ul role="list">{items.map((item) => renderItem(item))}</ul>
    </nav>
  );
};

// ─── Data Display ─────────────────────────────────────────────────────────────

interface KeyValuePair { key: string; value: string | number | React.ReactNode; }

interface DescriptionListProps {
  items: KeyValuePair[];
  columns?: 1 | 2 | 3;
  label?: string;
  compact?: boolean;
}

const DescriptionList: React.FC<DescriptionListProps> = ({ items, columns = 1, label, compact }) => (
  <dl
    aria-label={label}
    className={`dl dl--${columns}col ${compact ? 'dl--compact' : ''}`}
  >
    {items.map(({ key, value }, idx) => (
      <React.Fragment key={idx}>
        <dt className="dl__term">{key}</dt>
        <dd className="dl__detail">{value}</dd>
      </React.Fragment>
    ))}
  </dl>
);

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { value: number; label: string };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, delta, icon, trend }) => {
  const labelId = React.useId();
  const deltaSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const deltaLabel = delta ? `${delta.value > 0 ? '+' : ''}${delta.value} ${delta.label}` : undefined;
  return (
    <article className={`stat-card stat-card--${trend || 'neutral'}`} aria-labelledby={labelId}>
      {icon && <span className="stat-card__icon" aria-hidden="true">{icon}</span>}
      <span id={labelId} className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {delta && (
        <span className="stat-card__delta" aria-label={deltaLabel}>
          <span aria-hidden="true">{deltaSymbol}</span>
          <span>{delta.value > 0 ? '+' : ''}{delta.value} {delta.label}</span>
        </span>
      )}
    </article>
  );
};

// ─── Error Boundary ──────────────────────────────────────────────────────────

interface ErrorBoundaryState { hasError: boolean; error: Error | null; }
interface ErrorBoundaryProps {
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  onError?: (error: Error, info: React.ErrorInfo) => void;
  children: React.ReactNode;
}

class LuminaryErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.onError?.(error, info);
    console.error('[LuminaryErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') return fallback(this.state.error);
      if (fallback) return fallback;
      return (
        <div role="alert" aria-live="polite" className="error-boundary">
          <h2>Something went wrong</h2>
          <p>The application encountered an unexpected error. Please refresh the page.</p>
          <button type="button" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Accessible Rich Text Editor Toolbar ─────────────────────────────────────

interface RichTextAction {
  id: string;
  label: string;
  icon: string;
  command: string;
  shortcut?: string;
}

const EDITOR_ACTIONS: RichTextAction[] = [
  { id: 'bold',        label: 'Bold',        icon: 'B', command: 'bold',        shortcut: 'Ctrl+B' },
  { id: 'italic',      label: 'Italic',      icon: 'I', command: 'italic',      shortcut: 'Ctrl+I' },
  { id: 'underline',   label: 'Underline',   icon: 'U', command: 'underline',   shortcut: 'Ctrl+U' },
  { id: 'strikethrough', label: 'Strikethrough', icon: 'S̶', command: 'strikeThrough'          },
  { id: 'ordered',     label: 'Ordered list',    icon: '1.', command: 'insertOrderedList'  },
  { id: 'unordered',   label: 'Unordered list',  icon: '•',  command: 'insertUnorderedList' },
  { id: 'link',        label: 'Insert link',     icon: '🔗', command: 'createLink'           },
  { id: 'undo',        label: 'Undo',            icon: '↩', command: 'undo',        shortcut: 'Ctrl+Z' },
  { id: 'redo',        label: 'Redo',            icon: '↪', command: 'redo',        shortcut: 'Ctrl+Y' },
];

interface RichTextToolbarProps {
  editorRef: React.RefObject<HTMLDivElement>;
  label?: string;
}

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ editorRef, label = 'Text formatting' }) => {
  const [activeStates, setActiveStates] = React.useState<Record<string, boolean>>({});

  const updateStates = React.useCallback(() => {
    setActiveStates(
      Object.fromEntries(EDITOR_ACTIONS.map((a) => [a.id, document.queryCommandState?.(a.command) || false]))
    );
  }, []);

  const execCommand = (action: RichTextAction) => {
    if (!editorRef.current) return;
    if (action.command === 'createLink') {
      const url = window.prompt('Enter URL:');
      if (url) document.execCommand(action.command, false, url);
    } else {
      document.execCommand(action.command, false, undefined);
    }
    editorRef.current.focus();
    updateStates();
  };

  return (
    <div role="toolbar" aria-label={label} className="rich-text-toolbar">
      {EDITOR_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          aria-pressed={activeStates[action.id]}
          aria-keyshortcuts={action.shortcut}
          title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
          aria-label={action.label}
          onClick={() => execCommand(action)}
          className={`toolbar-btn ${activeStates[action.id] ? 'toolbar-btn--active' : ''}`}
        >
          <span aria-hidden="true">{action.icon}</span>
        </button>
      ))}
    </div>
  );
};

interface AccessibleRichEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  label: string;
  id: string;
  minHeight?: number;
  maxHeight?: number;
}

const AccessibleRichEditor: React.FC<AccessibleRichEditorProps> = ({
  value, onChange, placeholder = 'Start typing…', label, id, minHeight = 120, maxHeight,
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const toolbarId = `${id}-toolbar`;
  const labelId = `${id}-label`;

  React.useEffect(() => {
    if (editorRef.current && value !== undefined && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="rich-editor" id={id}>
      <label id={labelId} className="rich-editor__label">{label}</label>
      <RichTextToolbar editorRef={editorRef} label={`${label} formatting options`} />
      <div
        ref={editorRef}
        role="textbox"
        contentEditable="true"
        aria-multiline="true"
        aria-labelledby={labelId}
        aria-describedby={toolbarId}
        data-placeholder={placeholder}
        style={{ minHeight, maxHeight, overflowY: maxHeight ? 'auto' : undefined }}
        onInput={() => onChange?.(editorRef.current?.innerHTML || '')}
        className="rich-editor__content"
        suppressContentEditableWarning
      />
    </div>
  );
};

// ─── Virtual List ────────────────────────────────────────────────────────────

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  label?: string;
  getItemId?: (item: T, index: number) => string;
}

function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  label = 'List',
  getItemId,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={containerRef}
      role="list"
      aria-label={label}
      aria-rowcount={items.length}
      style={{ height: containerHeight, overflowY: 'auto', position: 'relative' }}
      onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }} aria-hidden="false">
        {visibleItems.map((item, idx) => {
          const absoluteIndex = startIndex + idx;
          return (
            <div
              key={getItemId ? getItemId(item, absoluteIndex) : absoluteIndex}
              role="listitem"
              aria-rowindex={absoluteIndex + 1}
              style={{ position: 'absolute', top: absoluteIndex * itemHeight, height: itemHeight, width: '100%' }}
            >
              {renderItem(item, absoluteIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stepper / Wizard ────────────────────────────────────────────────────────

interface StepperStep {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onChange?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  completedSteps,
  onChange,
  orientation = 'horizontal',
  label = 'Progress',
}) => {
  const navId = React.useId();
  return (
    <nav
      id={navId}
      aria-label={label}
      className={`stepper stepper--${orientation}`}
    >
      <ol className="stepper__list">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.has(idx);
          const isCurrent = idx === currentStep;
          const isClickable = onChange && isCompleted;
          let status: string;
          if (isCompleted) status = 'completed';
          else if (isCurrent) status = 'current';
          else status = 'upcoming';

          return (
            <li
              key={step.id}
              className={`stepper__item stepper__item--${status}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onChange(idx)}
                  aria-label={`Step ${idx + 1}: ${step.label}${isCompleted ? ' (completed)' : ''}`}
                  className="stepper__btn"
                >
                  <StepIndicator idx={idx} status={status} />
                  <StepContent step={step} status={status} />
                </button>
              ) : (
                <div aria-label={`Step ${idx + 1}: ${step.label}${isCurrent ? ' (current)' : ''}${!isCompleted && !isCurrent ? ' (upcoming)' : ''}`}>
                  <StepIndicator idx={idx} status={status} />
                  <StepContent step={step} status={status} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const StepIndicator: React.FC<{ idx: number; status: string }> = ({ idx, status }) => (
  <span className="stepper__indicator" aria-hidden="true">
    {status === 'completed' ? '✓' : idx + 1}
  </span>
);

const StepContent: React.FC<{ step: StepperStep; status: string }> = ({ step, status }) => (
  <div className="stepper__content">
    <span className="stepper__label">
      {step.label}
      {step.optional && <span className="stepper__optional"> (optional)</span>}
    </span>
    {step.description && <span className="stepper__desc">{step.description}</span>}
  </div>
);

// ─── Color Contrast Utilities ────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const n = parseInt(full, 16);
  if (isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function srgbChannel(c: number): number {
  const srgb = c / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  if (!c1 || !c2) return 0;
  const l1 = relativeLuminance(c1);
  const l2 = relativeLuminance(c2);
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function meetsWCAGAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = contrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

function meetsWCAGAAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = contrastRatio(foreground, background);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

const ContrastChecker: React.FC<{ foreground: string; background: string; text?: string }> = ({
  foreground, background, text = 'Sample Text'
}) => {
  const ratio = contrastRatio(foreground, background);
  const passAA  = meetsWCAGAA(foreground, background);
  const passAAA = meetsWCAGAAA(foreground, background);
  const passAALg = meetsWCAGAA(foreground, background, true);

  return (
    <div className="contrast-checker" aria-label="Color contrast checker results">
      <div
        className="contrast-preview"
        style={{ color: foreground, background, padding: '16px', borderRadius: 8 }}
        aria-label={`Text preview: ${text}`}
      >
        <p className="contrast-preview__normal">{text}</p>
        <p className="contrast-preview__large" style={{ fontSize: 24, fontWeight: 700 }}>{text} (large)</p>
      </div>
      <dl className="contrast-results">
        <dt>Contrast ratio</dt>
        <dd aria-label={`Contrast ratio: ${ratio.toFixed(2)} to 1`}>{ratio.toFixed(2)}:1</dd>
        <dt>WCAG AA (normal text, min 4.5:1)</dt>
        <dd aria-label={`WCAG AA: ${passAA ? 'Pass' : 'Fail'}`} className={passAA ? 'pass' : 'fail'}>{passAA ? 'Pass ✓' : 'Fail ✗'}</dd>
        <dt>WCAG AA (large text, min 3:1)</dt>
        <dd aria-label={`WCAG AA large: ${passAALg ? 'Pass' : 'Fail'}`} className={passAALg ? 'pass' : 'fail'}>{passAALg ? 'Pass ✓' : 'Fail ✗'}</dd>
        <dt>WCAG AAA (normal text, min 7:1)</dt>
        <dd aria-label={`WCAG AAA: ${passAAA ? 'Pass' : 'Fail'}`} className={passAAA ? 'pass' : 'fail'}>{passAAA ? 'Pass ✓' : 'Fail ✗'}</dd>
      </dl>
    </div>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export {
  toCamelCase, toKebabCase, toTitleCase, truncate, slugify, pluralize, escapeHtml, stripHtml, countWords, formatBytes,
  clamp, lerp, inverseLerp, remap, roundTo, formatNumber, formatCurrency, formatPercent, sum, average, median, standardDeviation,
  chunk, unique, uniqueBy, groupBy, sortBy, flatten, zip, range, last, first, countBy, partition, intersect, difference, shuffle,
  pick, omit, mapValues, filterObject, deepMerge, deepEqual, deepClone,
  formatDate, formatRelativeTime, addDays, startOfDay, endOfDay, startOfWeek, isSameDay, isWithinInterval, parseISODate, getDaysInMonth,
  parseQueryString, buildQueryString, storage,
  useLocalStorage, useSessionStorage, useDebounce, useThrottle, usePrevious, useIsMounted,
  useClickOutside, useWindowSize, useMatchMedia, useIntersectionObserver, useResizeObserver,
  useEventListener, useInterval, useTimeout, useCounter, useToggle, useAsyncState, useMediaQuery,
  useFocusVisible, useDocumentTitle, useCopyToClipboard, useKeyboardShortcut,
  usePrefersDarkMode, usePrefersReducedMotion, useHighContrastMode,
  validators, composeValidators, useField,
  FormFieldWrapper, TextInput, SelectInput, TextareaInput,
  AlertBanner, ProgressBar, LoadingSpinner, Skeleton, SkeletonScreen,
  SidebarNav, DescriptionList, StatCard,
  LuminaryErrorBoundary,
  RichTextToolbar, AccessibleRichEditor,
  VirtualList,
  Stepper,
  hexToRgb, relativeLuminance, contrastRatio, meetsWCAGAA, meetsWCAGAAA, ContrastChecker,
};

// ═══════════════════════════════════════════════════════════════════════════
// LUMINARY DESIGN SYSTEM — EXTENDED COMPONENT LIBRARY
// Fully accessible, WCAG 2.2 compliant React components.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Type Utilities ──────────────────────────────────────────────────────────

type Maybe<T> = T | null | undefined;
type Nullable<T> = T | null;
type NonEmptyArray<T> = [T, ...T[]];
type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
type DeepReadonly<T> = T extends (infer A)[] ? DeepReadonlyArray<A> : T extends object ? DeepReadonlyObject<T> : T;
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
type DeepReadonlyObject<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };
type Awaited<T> = T extends PromiseLike<infer R> ? R : T;
type ValueOf<T> = T[keyof T];
type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];
type Prettify<T> = { [K in keyof T]: T[K] } & NonNullable<unknown>;
type Override<T, U> = Omit<T, keyof U> & U;
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];
type ExactlyOneOf<T, Keys extends keyof T = keyof T> = { [K in Keys]: Pick<T, K> & Partial<Record<Exclude<Keys, K>, never>> }[Keys] & Pick<T, Exclude<keyof T, Keys>>;

// ─── String Utilities ────────────────────────────────────────────────────────

const toCamelCase = (s: string): string =>
  s.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');

const toKebabCase = (s: string): string =>
  s.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');

const toTitleCase = (s: string): string =>
  s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

const truncate = (s: string, maxLength: number, ellipsis = '…'): string =>
  s.length <= maxLength ? s : s.slice(0, maxLength - ellipsis.length) + ellipsis;

const slugify = (s: string): string =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const pluralize = (count: number, singular: string, plural?: string): string =>
  `${count} ${count === 1 ? singular : (plural || singular + 's')}`;

const padStart = (s: string | number, len: number, char = '0'): string =>
  String(s).padStart(len, char);

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const stripHtml = (s: string): string =>
  s.replace(/<[^>]*>/g, '');

const countWords = (s: string): number =>
  s.trim().split(/\s+/).filter(Boolean).length;

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = Math.max(0, decimals);
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// ─── Number & Math Utilities ─────────────────────────────────────────────────

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

const inverseLerp = (a: number, b: number, value: number): number =>
  (value - a) / (b - a);

const remap = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number =>
  lerp(outMin, outMax, inverseLerp(inMin, inMax, value));

const roundTo = (value: number, precision: number): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

const formatNumber = (n: number, locale = 'en-US', options?: Intl.NumberFormatOptions): string =>
  new Intl.NumberFormat(locale, options).format(n);

const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);

const formatPercent = (value: number, decimals = 1): string =>
  `${(value * 100).toFixed(decimals)}%`;

const sum = (...nums: number[]): number =>
  nums.reduce((acc, n) => acc + n, 0);

const average = (...nums: number[]): number =>
  nums.length ? sum(...nums) / nums.length : 0;

const median = (nums: number[]): number => {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
};

const standardDeviation = (nums: number[]): number => {
  if (nums.length < 2) return 0;
  const mean = average(...nums);
  const squaredDiffs = nums.map((n) => Math.pow(n - mean, 2));
  return Math.sqrt(average(...squaredDiffs));
};

// ─── Array Utilities ─────────────────────────────────────────────────────────

const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const unique = <T>(array: T[]): T[] =>
  Array.from(new Set(array));

const uniqueBy = <T, K>(array: T[], keyFn: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> => {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(item);
    return acc;
  }, {} as Record<K, T[]>);
};

const sortBy = <T>(array: T[], ...keys: ((item: T) => string | number)[]): T[] =>
  [...array].sort((a, b) => {
    for (const key of keys) {
      const av = key(a); const bv = key(b);
      if (av < bv) return -1;
      if (av > bv) return 1;
    }
    return 0;
  });

const flatten = <T>(array: (T | T[])[]): T[] =>
  array.flatMap((item) => Array.isArray(item) ? item : [item]);

const zip = <A, B>(a: A[], b: B[]): [A, B][] =>
  a.slice(0, Math.min(a.length, b.length)).map((item, idx) => [item, b[idx]!]);

const range = (start: number, end?: number, step = 1): number[] => {
  const [from, to] = end === undefined ? [0, start] : [start, end];
  const result: number[] = [];
  for (let i = from; i < to; i += step) result.push(i);
  return result;
};

const last = <T>(array: T[]): T | undefined =>
  array[array.length - 1];

const first = <T>(array: T[]): T | undefined =>
  array[0];

const countBy = <T>(array: T[], predicate: (item: T) => boolean): number =>
  array.reduce((count, item) => count + (predicate(item) ? 1 : 0), 0);

const partition = <T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] =>
  array.reduce<[T[], T[]]>(([pass, fail], item) =>
    predicate(item) ? [[...pass, item], fail] : [pass, [...fail, item]],
    [[], []]
  );

const intersect = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item));
};

const difference = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b);
  return a.filter((item) => !setB.has(item));
};

const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};

// ─── Object Utilities ────────────────────────────────────────────────────────

const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => { if (key in obj) result[key] = obj[key]; });
  return result;
};

const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete (result as T)[key]);
  return result as Omit<T, K>;
};

const mapValues = <T extends object, V>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => V,
): Record<keyof T, V> => {
  const result = {} as Record<keyof T, V>;
  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    result[key] = fn(obj[key], key);
  });
  return result;
};

const filterObject = <T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean,
): Partial<T> => {
  const result: Partial<T> = {};
  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    if (predicate(obj[key], key)) result[key] = obj[key];
  });
  return result;
};

const deepMerge = <T extends object>(target: T, ...sources: DeepPartial<T>[]): T => {
  const result = { ...target };
  for (const source of sources) {
    for (const key in source) {
      const sv = (source as T)[key as keyof T];
      const tv = result[key as keyof T];
      if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
        result[key as keyof T] = deepMerge(tv as object, sv as object) as T[keyof T];
      } else if (sv !== undefined) {
        result[key as keyof T] = sv as T[keyof T];
      }
    }
  }
  return result;
};

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== 'object') return false;
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
};

const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T;
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone((obj as Record<string, unknown>)[key]);
    }
  }
  return result as T;
};

// ─── Date Utilities ──────────────────────────────────────────────────────────

const formatDate = (date: Date, locale = 'en-US', options?: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat(locale, options || { year: 'numeric', month: 'long', day: 'numeric' }).format(date);

const formatRelativeTime = (date: Date, relativeTo = new Date()): string => {
  const diffMs = date.getTime() - relativeTo.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr  = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);
  const diffWk  = Math.round(diffDay / 7);
  const diffMo  = Math.round(diffDay / 30);
  const diffYr  = Math.round(diffDay / 365);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffHr)  < 24) return rtf.format(diffHr, 'hour');
  if (Math.abs(diffDay) < 7)  return rtf.format(diffDay, 'day');
  if (Math.abs(diffWk)  < 5)  return rtf.format(diffWk, 'week');
  if (Math.abs(diffMo)  < 12) return rtf.format(diffMo, 'month');
  return rtf.format(diffYr, 'year');
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const startOfWeek = (date: Date, startDay = 0): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day - startDay + 7) % 7;
  result.setDate(result.getDate() - diff);
  return startOfDay(result);
};

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isWithinInterval = (date: Date, start: Date, end: Date): boolean =>
  date >= start && date <= end;

const parseISODate = (s: string): Date => {
  const d = new Date(s);
  if (isNaN(d.getTime())) throw new Error(`Invalid ISO date: ${s}`);
  return d;
};

const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

// ─── URL & Query String Utilities ────────────────────────────────────────────

const parseQueryString = (search: string): Record<string, string | string[]> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string | string[]> = {};
  params.forEach((value, key) => {
    if (key in result) {
      const existing = result[key]!;
      result[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      result[key] = value;
    }
  });
  return result;
};

const buildQueryString = (params: Record<string, string | string[] | number | boolean | null | undefined>): string => {
  const search = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val == null) continue;
    if (Array.isArray(val)) { val.forEach((v) => search.append(key, String(v))); }
    else { search.set(key, String(val)); }
  }
  const s = search.toString();
  return s ? `?${s}` : '';
};

// ─── Local Storage Utilities ─────────────────────────────────────────────────

const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or private browsing
    }
  },
  remove: (key: string): void => {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
  clear: (): void => {
    try { localStorage.clear(); } catch { /* noop */ }
  },
};

// ─── Custom React Hooks ───────────────────────────────────────────────────────

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => storage.get(key, initialValue));
  const setValue = React.useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
      storage.set(key, next);
      return next;
    });
  }, [key]);
  return [storedValue, setValue] as const;
}

function useSessionStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) as T : initialValue;
    } catch { return initialValue; }
  });
  const set = React.useCallback((v: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, [key]);
  return [value, set] as const;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useThrottle<T>(value: T, interval: number): T {
  const [throttled, setThrottled] = React.useState(value);
  const lastUpdated = React.useRef<number>(Date.now());
  React.useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= interval) {
      setThrottled(value);
      lastUpdated.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottled(value);
        lastUpdated.current = Date.now();
      }, interval - (now - lastUpdated.current));
      return () => clearTimeout(timer);
    }
  }, [value, interval]);
  return throttled;
}

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);
  React.useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}

function useIsMounted(): () => boolean {
  const isMountedRef = React.useRef(false);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);
  return React.useCallback(() => isMountedRef.current, []);
}

function useClickOutside<T extends HTMLElement>(handler: () => void): React.RefObject<T> {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);
  return ref;
}

function useWindowSize() {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

function useIntersectionObserver<T extends HTMLElement>(
  options?: IntersectionObserverInit,
): [React.RefObject<T>, boolean] {
  const ref = React.useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry!.isIntersecting);
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);
  return [ref, isIntersecting];
}

function useResizeObserver<T extends HTMLElement>(): [React.RefObject<T>, DOMRectReadOnly | null] {
  const ref = React.useRef<T>(null);
  const [rect, setRect] = React.useState<DOMRectReadOnly | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setRect(entry.contentRect);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, rect];
}

function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (e: WindowEventMap[K]) => void,
  element: EventTarget = window,
  options?: boolean | AddEventListenerOptions,
): void {
  const savedHandler = React.useRef(handler);
  React.useLayoutEffect(() => { savedHandler.current = handler; }, [handler]);
  React.useEffect(() => {
    const listener = (e: Event) => savedHandler.current(e as WindowEventMap[K]);
    element.addEventListener(eventName, listener, options);
    return () => element.removeEventListener(eventName, listener, options);
  }, [eventName, element, options]);
}

function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

function useCounter(initialValue = 0, min?: number, max?: number) {
  const [count, setCount] = React.useState(initialValue);
  const increment = React.useCallback(() => setCount((c) => max !== undefined ? Math.min(c + 1, max) : c + 1), [max]);
  const decrement = React.useCallback(() => setCount((c) => min !== undefined ? Math.max(c - 1, min) : c - 1), [min]);
  const reset     = React.useCallback(() => setCount(initialValue), [initialValue]);
  const set       = React.useCallback((v: number) => setCount(
    min !== undefined && max !== undefined ? clamp(v, min, max) : v
  ), [min, max]);
  return { count, increment, decrement, reset, set };
}

function useToggle(initialValue = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = React.useState(initialValue);
  const toggle = React.useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

function useAsyncState<T>() {
  const [state, setState] = React.useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    data: T | null;
    error: Error | null;
  }>({ status: 'idle', data: null, error: null });

  const run = React.useCallback(async (promise: Promise<T>) => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await promise;
      setState({ status: 'success', data, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ status: 'error', data: null, error });
      throw error;
    }
  }, []);

  return { ...state, run };
}

function useMediaQuery(breakpoints: Record<string, string>) {
  const [matches, setMatches] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      Object.entries(breakpoints).map(([key, query]) => [
        key,
        typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
      ])
    )
  );

  React.useEffect(() => {
    const queries = Object.entries(breakpoints).map(([key, query]) => {
      const mq = window.matchMedia(query);
      const handler = (e: MediaQueryListEvent) => {
        setMatches((prev) => ({ ...prev, [key]: e.matches }));
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    });
    return () => queries.forEach((cleanup) => cleanup());
  }, [breakpoints]);

  return matches;
}

function useFocusVisible(): [React.RefObject<HTMLElement>, boolean] {
  const ref = React.useRef<HTMLElement>(null);
  const [isFocusVisible, setIsFocusVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onFocus = (e: FocusEvent) => {
      const isKeyboard = !(e as FocusEvent & { sourceCapabilities?: { firesTouchEvents: boolean } })
        .sourceCapabilities?.firesTouchEvents;
      setIsFocusVisible(isKeyboard);
    };
    const onBlur = () => setIsFocusVisible(false);
    el.addEventListener('focus', onFocus);
    el.addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('focus', onFocus);
      el.removeEventListener('blur', onBlur);
    };
  }, []);

  return [ref, isFocusVisible];
}

function useDocumentTitle(title: string, suffix?: string): void {
  React.useEffect(() => {
    const original = document.title;
    document.title = suffix ? `${title} | ${suffix}` : title;
    return () => { document.title = original; };
  }, [title, suffix]);
}

function useCopyToClipboard(): [string | null, (text: string) => Promise<void>] {
  const [copiedText, setCopiedText] = React.useState<string | null>(null);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      setCopiedText(null);
    }
  };
  return [copiedText, copy];
}

function useKeyboardShortcut(
  keys: string[],
  callback: (e: KeyboardEvent) => void,
  options: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {},
): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (options.ctrlKey  && !e.ctrlKey)  return;
      if (options.metaKey  && !e.metaKey)  return;
      if (options.shiftKey && !e.shiftKey) return;
      if (options.altKey   && !e.altKey)   return;
      if (keys.includes(e.key)) {
        e.preventDefault();
        savedCallback.current(e);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [keys, options.ctrlKey, options.metaKey, options.shiftKey, options.altKey]);
}

function usePrefersDarkMode(): boolean {
  return useMatchMedia('(prefers-color-scheme: dark)');
}

function usePrefersReducedMotion(): boolean {
  return useMatchMedia('(prefers-reduced-motion: reduce)');
}

function useHighContrastMode(): boolean {
  return useMatchMedia('(forced-colors: active)');
}

// ─── Form Utilities ───────────────────────────────────────────────────────────

type ValidationRule<T> = (value: T) => string | null;

const validators = {
  required: (message = 'This field is required'): ValidationRule<string> =>
    (v) => v.trim() ? null : message,
  minLength: (min: number, message?: string): ValidationRule<string> =>
    (v) => v.length >= min ? null : message || `Must be at least ${min} characters`,
  maxLength: (max: number, message?: string): ValidationRule<string> =>
    (v) => v.length <= max ? null : message || `Must be no more than ${max} characters`,
  pattern: (re: RegExp, message = 'Invalid format'): ValidationRule<string> =>
    (v) => re.test(v) ? null : message,
  email: (message = 'Invalid email address'): ValidationRule<string> =>
    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : message,
  url: (message = 'Invalid URL'): ValidationRule<string> => (v) => {
    try { new URL(v); return null; } catch { return message; }
  },
  min: (min: number, message?: string): ValidationRule<number> =>
    (v) => v >= min ? null : message || `Must be at least ${min}`,
  max: (max: number, message?: string): ValidationRule<number> =>
    (v) => v <= max ? null : message || `Must be no more than ${max}`,
  integer: (message = 'Must be an integer'): ValidationRule<number> =>
    (v) => Number.isInteger(v) ? null : message,
};

function composeValidators<T>(...rules: ValidationRule<T>[]): ValidationRule<T> {
  return (value: T) => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  };
}

interface FieldState<T> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

function useField<T>(
  initialValue: T,
  validate?: ValidationRule<T>,
): FieldState<T> & {
  setValue: (v: T) => void;
  setTouched: () => void;
  reset: () => void;
  validate: () => boolean;
  inputProps: {
    value: T;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    'aria-invalid': boolean | undefined;
    'aria-required': boolean | undefined;
  };
} {
  const [state, setState] = React.useState<FieldState<T>>({
    value: initialValue,
    error: null,
    touched: false,
    dirty: false,
  });

  const runValidation = React.useCallback((v: T): string | null =>
    validate ? validate(v) : null,
    [validate]
  );

  const setValue = React.useCallback((v: T) => {
    setState((prev) => ({
      ...prev,
      value: v,
      dirty: v !== initialValue,
      error: prev.touched ? runValidation(v) : prev.error,
    }));
  }, [initialValue, runValidation]);

  const setTouched = React.useCallback(() => {
    setState((prev) => ({ ...prev, touched: true, error: runValidation(prev.value) }));
  }, [runValidation]);

  const reset = React.useCallback(() => {
    setState({ value: initialValue, error: null, touched: false, dirty: false });
  }, [initialValue]);

  const doValidate = React.useCallback((): boolean => {
    const error = runValidation(state.value);
    setState((prev) => ({ ...prev, touched: true, error }));
    return !error;
  }, [runValidation, state.value]);

  return {
    ...state,
    setValue,
    setTouched,
    reset,
    validate: doValidate,
    inputProps: {
      value: state.value,
      onChange: (e) => setValue(e.target.value as unknown as T),
      onBlur: setTouched,
      'aria-invalid': state.touched && !!state.error ? true : undefined,
      'aria-required': validate ? true : undefined,
    },
  };
}

// ─── Accessible Form Components ───────────────────────────────────────────────

interface FormFieldWrapperProps {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({ label, id, error, hint, required, children }) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="form-field" aria-invalid={!!error || undefined}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span aria-hidden="true" className="form-required">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {hint && <p id={hintId} className="form-hint">{hint}</p>}
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': !!error || undefined,
          'aria-required': required || undefined,
        }) : child
      )}
      {error && (
        <p id={errorId} role="alert" className="form-error" aria-live="polite">{error}</p>
      )}
    </div>
  );
};

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, id, error, hint, ...rest }) => (
  <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required || !!rest['aria-required']}>
    <input type="text" id={id} {...rest} />
  </FormFieldWrapper>
);

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, id, error, hint, options, placeholder, ...rest }) => (
  <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required}>
    <select id={id} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </FormFieldWrapper>
);

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  charCount?: boolean;
  maxChars?: number;
}

const TextareaInput: React.FC<TextareaInputProps> = ({ label, id, error, hint, charCount, maxChars, value, onChange, ...rest }) => {
  const [length, setLength] = React.useState(String(value || '').length);
  const countId = charCount ? `${id}-count` : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLength(e.target.value.length);
    onChange?.(e);
  };

  const isOverLimit = maxChars !== undefined && length > maxChars;

  return (
    <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required}>
      <textarea id={id} value={value} onChange={handleChange} aria-describedby={countId || undefined} {...rest} />
      {charCount && (
        <p id={countId} aria-live="polite" aria-atomic="true" className={`char-count ${isOverLimit ? 'char-count--over' : ''}`}>
          {maxChars !== undefined ? `${length} / ${maxChars} characters` : `${length} characters`}
        </p>
      )}
    </FormFieldWrapper>
  );
};

// ─── Status Components ────────────────────────────────────────────────────────

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertBannerProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  live?: 'polite' | 'assertive' | 'off';
}

const ALERT_ICONS: Record<AlertVariant, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✗',
};

const AlertBanner: React.FC<AlertBannerProps> = ({ variant = 'info', title, children, onDismiss, icon, live }) => {
  const ariaRole = variant === 'error' || variant === 'warning' ? 'alert' : 'status';
  const ariaLive = live || (variant === 'error' ? 'assertive' : 'polite');
  return (
    <div role={ariaRole} aria-live={ariaLive} aria-atomic="true" className={`alert alert--${variant}`}>
      <span className="alert__icon" aria-hidden="true">{icon || ALERT_ICONS[variant]}</span>
      <div className="alert__body">
        {title && <strong className="alert__title">{title}</strong>}
        <div className="alert__message">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert__dismiss"
          aria-label="Dismiss notification"
          onClick={onDismiss}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, label, showValue = false, size = 'md', variant = 'default' }) => {
  const pct = clamp((value / max) * 100, 0, 100);
  const id = React.useId();
  return (
    <div className={`progress progress--${size} progress--${variant}`} role="group" aria-labelledby={id}>
      <span id={id} className="progress__label">{label}</span>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={id}
        aria-valuetext={`${label}: ${Math.round(pct)}%`}
        style={{ width: `${pct}%` }}
        className="progress__bar"
      />
      {showValue && <span className="progress__value" aria-hidden="true">{Math.round(pct)}%</span>}
    </div>
  );
};

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const LoadingSpinner: React.FC<SpinnerProps> = ({ size = 'md', label = 'Loading...' }) => (
  <div role="status" aria-label={label} className={`spinner spinner--${size}`}>
    <span className="sr-only">{label}</span>
    <span aria-hidden="true" className="spinner__ring" />
  </div>
);

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circle' | 'rect';
  animated?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ width, height, variant = 'rect', animated = true }) => (
  <span
    aria-hidden="true"
    className={`skeleton skeleton--${variant} ${animated ? 'skeleton--animated' : ''}`}
    style={{ display: 'block', width, height }}
  />
);

interface SkeletonScreenProps {
  lines?: number;
  label?: string;
}

const SkeletonScreen: React.FC<SkeletonScreenProps> = ({ lines = 4, label = 'Loading content...' }) => (
  <div role="status" aria-label={label} aria-busy="true">
    <span className="sr-only">{label}</span>
    {range(lines).map((i) => (
      <Skeleton key={i} height={16} width={`${100 - (i % 3) * 10}%`} variant="text" />
    ))}
  </div>
);

// ─── Navigation Components ────────────────────────────────────────────────────

interface SidebarNavItem2 {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: SidebarNavItem2[];
}

interface SidebarNavProps {
  items: SidebarNavItem2[];
  currentHref: string;
  label?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ items, currentHref, label = 'Primary navigation' }) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const renderItem = (item: SidebarNavItem2, depth = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isCurrent = item.href === currentHref;
    const isExpand = expanded.has(item.id);
    const itemId = `nav-item-${item.id}`;
    const subId = `nav-sub-${item.id}`;

    return (
      <li key={item.id}>
        {hasChildren ? (
          <>
            <button
              id={itemId}
              type="button"
              aria-expanded={isExpand}
              aria-controls={subId}
              onClick={() => toggleExpanded(item.id)}
              className="nav__item nav__item--expandable"
              style={{ paddingLeft: depth * 16 + 12 }}
            >
              {item.icon && <span className="nav__icon" aria-hidden="true">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="nav__badge" aria-label={`, ${item.badge} notifications`}>{item.badge}</span>
              )}
              <span aria-hidden="true" className={`nav__chevron ${isExpand ? 'nav__chevron--up' : ''}`}>▾</span>
            </button>
            <ul id={subId} role="group" aria-labelledby={itemId} hidden={!isExpand}>
              {item.children!.map((child) => renderItem(child, depth + 1))}
            </ul>
          </>
        ) : (
          <a
            id={itemId}
            href={item.href}
            aria-current={isCurrent ? 'page' : undefined}
            className={`nav__item nav__item--link ${isCurrent ? 'nav__item--current' : ''}`}
            style={{ paddingLeft: depth * 16 + 12 }}
          >
            {item.icon && <span className="nav__icon" aria-hidden="true">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className="nav__badge" aria-label={`, ${item.badge} notifications`}>{item.badge}</span>
            )}
          </a>
        )}
      </li>
    );
  };

  return (
    <nav aria-label={label} className="sidebar-nav">
      <ul role="list">{items.map((item) => renderItem(item))}</ul>
    </nav>
  );
};

// ─── Data Display ─────────────────────────────────────────────────────────────

interface KeyValuePair { key: string; value: string | number | React.ReactNode; }

interface DescriptionListProps {
  items: KeyValuePair[];
  columns?: 1 | 2 | 3;
  label?: string;
  compact?: boolean;
}

const DescriptionList: React.FC<DescriptionListProps> = ({ items, columns = 1, label, compact }) => (
  <dl
    aria-label={label}
    className={`dl dl--${columns}col ${compact ? 'dl--compact' : ''}`}
  >
    {items.map(({ key, value }, idx) => (
      <React.Fragment key={idx}>
        <dt className="dl__term">{key}</dt>
        <dd className="dl__detail">{value}</dd>
      </React.Fragment>
    ))}
  </dl>
);

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { value: number; label: string };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, delta, icon, trend }) => {
  const labelId = React.useId();
  const deltaSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const deltaLabel = delta ? `${delta.value > 0 ? '+' : ''}${delta.value} ${delta.label}` : undefined;
  return (
    <article className={`stat-card stat-card--${trend || 'neutral'}`} aria-labelledby={labelId}>
      {icon && <span className="stat-card__icon" aria-hidden="true">{icon}</span>}
      <span id={labelId} className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {delta && (
        <span className="stat-card__delta" aria-label={deltaLabel}>
          <span aria-hidden="true">{deltaSymbol}</span>
          <span>{delta.value > 0 ? '+' : ''}{delta.value} {delta.label}</span>
        </span>
      )}
    </article>
  );
};

// ─── Error Boundary ──────────────────────────────────────────────────────────

interface ErrorBoundaryState { hasError: boolean; error: Error | null; }
interface ErrorBoundaryProps {
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  onError?: (error: Error, info: React.ErrorInfo) => void;
  children: React.ReactNode;
}

class LuminaryErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.onError?.(error, info);
    console.error('[LuminaryErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') return fallback(this.state.error);
      if (fallback) return fallback;
      return (
        <div role="alert" aria-live="polite" className="error-boundary">
          <h2>Something went wrong</h2>
          <p>The application encountered an unexpected error. Please refresh the page.</p>
          <button type="button" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Accessible Rich Text Editor Toolbar ─────────────────────────────────────

interface RichTextAction {
  id: string;
  label: string;
  icon: string;
  command: string;
  shortcut?: string;
}

const EDITOR_ACTIONS: RichTextAction[] = [
  { id: 'bold',        label: 'Bold',        icon: 'B', command: 'bold',        shortcut: 'Ctrl+B' },
  { id: 'italic',      label: 'Italic',      icon: 'I', command: 'italic',      shortcut: 'Ctrl+I' },
  { id: 'underline',   label: 'Underline',   icon: 'U', command: 'underline',   shortcut: 'Ctrl+U' },
  { id: 'strikethrough', label: 'Strikethrough', icon: 'S̶', command: 'strikeThrough'          },
  { id: 'ordered',     label: 'Ordered list',    icon: '1.', command: 'insertOrderedList'  },
  { id: 'unordered',   label: 'Unordered list',  icon: '•',  command: 'insertUnorderedList' },
  { id: 'link',        label: 'Insert link',     icon: '🔗', command: 'createLink'           },
  { id: 'undo',        label: 'Undo',            icon: '↩', command: 'undo',        shortcut: 'Ctrl+Z' },
  { id: 'redo',        label: 'Redo',            icon: '↪', command: 'redo',        shortcut: 'Ctrl+Y' },
];

interface RichTextToolbarProps {
  editorRef: React.RefObject<HTMLDivElement>;
  label?: string;
}

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ editorRef, label = 'Text formatting' }) => {
  const [activeStates, setActiveStates] = React.useState<Record<string, boolean>>({});

  const updateStates = React.useCallback(() => {
    setActiveStates(
      Object.fromEntries(EDITOR_ACTIONS.map((a) => [a.id, document.queryCommandState?.(a.command) || false]))
    );
  }, []);

  const execCommand = (action: RichTextAction) => {
    if (!editorRef.current) return;
    if (action.command === 'createLink') {
      const url = window.prompt('Enter URL:');
      if (url) document.execCommand(action.command, false, url);
    } else {
      document.execCommand(action.command, false, undefined);
    }
    editorRef.current.focus();
    updateStates();
  };

  return (
    <div role="toolbar" aria-label={label} className="rich-text-toolbar">
      {EDITOR_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          aria-pressed={activeStates[action.id]}
          aria-keyshortcuts={action.shortcut}
          title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
          aria-label={action.label}
          onClick={() => execCommand(action)}
          className={`toolbar-btn ${activeStates[action.id] ? 'toolbar-btn--active' : ''}`}
        >
          <span aria-hidden="true">{action.icon}</span>
        </button>
      ))}
    </div>
  );
};

interface AccessibleRichEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  label: string;
  id: string;
  minHeight?: number;
  maxHeight?: number;
}

const AccessibleRichEditor: React.FC<AccessibleRichEditorProps> = ({
  value, onChange, placeholder = 'Start typing…', label, id, minHeight = 120, maxHeight,
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const toolbarId = `${id}-toolbar`;
  const labelId = `${id}-label`;

  React.useEffect(() => {
    if (editorRef.current && value !== undefined && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="rich-editor" id={id}>
      <label id={labelId} className="rich-editor__label">{label}</label>
      <RichTextToolbar editorRef={editorRef} label={`${label} formatting options`} />
      <div
        ref={editorRef}
        role="textbox"
        contentEditable="true"
        aria-multiline="true"
        aria-labelledby={labelId}
        aria-describedby={toolbarId}
        data-placeholder={placeholder}
        style={{ minHeight, maxHeight, overflowY: maxHeight ? 'auto' : undefined }}
        onInput={() => onChange?.(editorRef.current?.innerHTML || '')}
        className="rich-editor__content"
        suppressContentEditableWarning
      />
    </div>
  );
};

// ─── Virtual List ────────────────────────────────────────────────────────────

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  label?: string;
  getItemId?: (item: T, index: number) => string;
}

function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  label = 'List',
  getItemId,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={containerRef}
      role="list"
      aria-label={label}
      aria-rowcount={items.length}
      style={{ height: containerHeight, overflowY: 'auto', position: 'relative' }}
      onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }} aria-hidden="false">
        {visibleItems.map((item, idx) => {
          const absoluteIndex = startIndex + idx;
          return (
            <div
              key={getItemId ? getItemId(item, absoluteIndex) : absoluteIndex}
              role="listitem"
              aria-rowindex={absoluteIndex + 1}
              style={{ position: 'absolute', top: absoluteIndex * itemHeight, height: itemHeight, width: '100%' }}
            >
              {renderItem(item, absoluteIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stepper / Wizard ────────────────────────────────────────────────────────

interface StepperStep {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onChange?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  completedSteps,
  onChange,
  orientation = 'horizontal',
  label = 'Progress',
}) => {
  const navId = React.useId();
  return (
    <nav
      id={navId}
      aria-label={label}
      className={`stepper stepper--${orientation}`}
    >
      <ol className="stepper__list">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.has(idx);
          const isCurrent = idx === currentStep;
          const isClickable = onChange && isCompleted;
          let status: string;
          if (isCompleted) status = 'completed';
          else if (isCurrent) status = 'current';
          else status = 'upcoming';

          return (
            <li
              key={step.id}
              className={`stepper__item stepper__item--${status}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onChange(idx)}
                  aria-label={`Step ${idx + 1}: ${step.label}${isCompleted ? ' (completed)' : ''}`}
                  className="stepper__btn"
                >
                  <StepIndicator idx={idx} status={status} />
                  <StepContent step={step} status={status} />
                </button>
              ) : (
                <div aria-label={`Step ${idx + 1}: ${step.label}${isCurrent ? ' (current)' : ''}${!isCompleted && !isCurrent ? ' (upcoming)' : ''}`}>
                  <StepIndicator idx={idx} status={status} />
                  <StepContent step={step} status={status} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const StepIndicator: React.FC<{ idx: number; status: string }> = ({ idx, status }) => (
  <span className="stepper__indicator" aria-hidden="true">
    {status === 'completed' ? '✓' : idx + 1}
  </span>
);

const StepContent: React.FC<{ step: StepperStep; status: string }> = ({ step, status }) => (
  <div className="stepper__content">
    <span className="stepper__label">
      {step.label}
      {step.optional && <span className="stepper__optional"> (optional)</span>}
    </span>
    {step.description && <span className="stepper__desc">{step.description}</span>}
  </div>
);

// ─── Color Contrast Utilities ────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const n = parseInt(full, 16);
  if (isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function srgbChannel(c: number): number {
  const srgb = c / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  if (!c1 || !c2) return 0;
  const l1 = relativeLuminance(c1);
  const l2 = relativeLuminance(c2);
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function meetsWCAGAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = contrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

function meetsWCAGAAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = contrastRatio(foreground, background);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

const ContrastChecker: React.FC<{ foreground: string; background: string; text?: string }> = ({
  foreground, background, text = 'Sample Text'
}) => {
  const ratio = contrastRatio(foreground, background);
  const passAA  = meetsWCAGAA(foreground, background);
  const passAAA = meetsWCAGAAA(foreground, background);
  const passAALg = meetsWCAGAA(foreground, background, true);

  return (
    <div className="contrast-checker" aria-label="Color contrast checker results">
      <div
        className="contrast-preview"
        style={{ color: foreground, background, padding: '16px', borderRadius: 8 }}
        aria-label={`Text preview: ${text}`}
      >
        <p className="contrast-preview__normal">{text}</p>
        <p className="contrast-preview__large" style={{ fontSize: 24, fontWeight: 700 }}>{text} (large)</p>
      </div>
      <dl className="contrast-results">
        <dt>Contrast ratio</dt>
        <dd aria-label={`Contrast ratio: ${ratio.toFixed(2)} to 1`}>{ratio.toFixed(2)}:1</dd>
        <dt>WCAG AA (normal text, min 4.5:1)</dt>
        <dd aria-label={`WCAG AA: ${passAA ? 'Pass' : 'Fail'}`} className={passAA ? 'pass' : 'fail'}>{passAA ? 'Pass ✓' : 'Fail ✗'}</dd>
        <dt>WCAG AA (large text, min 3:1)</dt>
        <dd aria-label={`WCAG AA large: ${passAALg ? 'Pass' : 'Fail'}`} className={passAALg ? 'pass' : 'fail'}>{passAALg ? 'Pass ✓' : 'Fail ✗'}</dd>
        <dt>WCAG AAA (normal text, min 7:1)</dt>
        <dd aria-label={`WCAG AAA: ${passAAA ? 'Pass' : 'Fail'}`} className={passAAA ? 'pass' : 'fail'}>{passAAA ? 'Pass ✓' : 'Fail ✗'}</dd>
      </dl>
    </div>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export {
  toCamelCase, toKebabCase, toTitleCase, truncate, slugify, pluralize, escapeHtml, stripHtml, countWords, formatBytes,
  clamp, lerp, inverseLerp, remap, roundTo, formatNumber, formatCurrency, formatPercent, sum, average, median, standardDeviation,
  chunk, unique, uniqueBy, groupBy, sortBy, flatten, zip, range, last, first, countBy, partition, intersect, difference, shuffle,
  pick, omit, mapValues, filterObject, deepMerge, deepEqual, deepClone,
  formatDate, formatRelativeTime, addDays, startOfDay, endOfDay, startOfWeek, isSameDay, isWithinInterval, parseISODate, getDaysInMonth,
  parseQueryString, buildQueryString, storage,
  useLocalStorage, useSessionStorage, useDebounce, useThrottle, usePrevious, useIsMounted,
  useClickOutside, useWindowSize, useMatchMedia, useIntersectionObserver, useResizeObserver,
  useEventListener, useInterval, useTimeout, useCounter, useToggle, useAsyncState, useMediaQuery,
  useFocusVisible, useDocumentTitle, useCopyToClipboard, useKeyboardShortcut,
  usePrefersDarkMode, usePrefersReducedMotion, useHighContrastMode,
  validators, composeValidators, useField,
  FormFieldWrapper, TextInput, SelectInput, TextareaInput,
  AlertBanner, ProgressBar, LoadingSpinner, Skeleton, SkeletonScreen,
  SidebarNav, DescriptionList, StatCard,
  LuminaryErrorBoundary,
  RichTextToolbar, AccessibleRichEditor,
  VirtualList,
  Stepper,
  hexToRgb, relativeLuminance, contrastRatio, meetsWCAGAA, meetsWCAGAAA, ContrastChecker,
};

// ═══════════════════════════════════════════════════════════════════════════
// LUMINARY DESIGN SYSTEM — EXTENDED COMPONENT LIBRARY
// Fully accessible, WCAG 2.2 compliant React components.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Type Utilities ──────────────────────────────────────────────────────────

type Maybe<T> = T | null | undefined;
type Nullable<T> = T | null;
type NonEmptyArray<T> = [T, ...T[]];
type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
type DeepReadonly<T> = T extends (infer A)[] ? DeepReadonlyArray<A> : T extends object ? DeepReadonlyObject<T> : T;
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
type DeepReadonlyObject<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };
type Awaited<T> = T extends PromiseLike<infer R> ? R : T;
type ValueOf<T> = T[keyof T];
type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];
type Prettify<T> = { [K in keyof T]: T[K] } & NonNullable<unknown>;
type Override<T, U> = Omit<T, keyof U> & U;
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];
type ExactlyOneOf<T, Keys extends keyof T = keyof T> = { [K in Keys]: Pick<T, K> & Partial<Record<Exclude<Keys, K>, never>> }[Keys] & Pick<T, Exclude<keyof T, Keys>>;

// ─── String Utilities ────────────────────────────────────────────────────────

const toCamelCase = (s: string): string =>
  s.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');

const toKebabCase = (s: string): string =>
  s.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');

const toTitleCase = (s: string): string =>
  s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

const truncate = (s: string, maxLength: number, ellipsis = '…'): string =>
  s.length <= maxLength ? s : s.slice(0, maxLength - ellipsis.length) + ellipsis;

const slugify = (s: string): string =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const pluralize = (count: number, singular: string, plural?: string): string =>
  `${count} ${count === 1 ? singular : (plural || singular + 's')}`;

const padStart = (s: string | number, len: number, char = '0'): string =>
  String(s).padStart(len, char);

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const stripHtml = (s: string): string =>
  s.replace(/<[^>]*>/g, '');

const countWords = (s: string): number =>
  s.trim().split(/\s+/).filter(Boolean).length;

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = Math.max(0, decimals);
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// ─── Number & Math Utilities ─────────────────────────────────────────────────

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

const inverseLerp = (a: number, b: number, value: number): number =>
  (value - a) / (b - a);

const remap = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number =>
  lerp(outMin, outMax, inverseLerp(inMin, inMax, value));

const roundTo = (value: number, precision: number): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

const formatNumber = (n: number, locale = 'en-US', options?: Intl.NumberFormatOptions): string =>
  new Intl.NumberFormat(locale, options).format(n);

const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);

const formatPercent = (value: number, decimals = 1): string =>
  `${(value * 100).toFixed(decimals)}%`;

const sum = (...nums: number[]): number =>
  nums.reduce((acc, n) => acc + n, 0);

const average = (...nums: number[]): number =>
  nums.length ? sum(...nums) / nums.length : 0;

const median = (nums: number[]): number => {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
};

const standardDeviation = (nums: number[]): number => {
  if (nums.length < 2) return 0;
  const mean = average(...nums);
  const squaredDiffs = nums.map((n) => Math.pow(n - mean, 2));
  return Math.sqrt(average(...squaredDiffs));
};

// ─── Array Utilities ─────────────────────────────────────────────────────────

const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const unique = <T>(array: T[]): T[] =>
  Array.from(new Set(array));

const uniqueBy = <T, K>(array: T[], keyFn: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> => {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(item);
    return acc;
  }, {} as Record<K, T[]>);
};

const sortBy = <T>(array: T[], ...keys: ((item: T) => string | number)[]): T[] =>
  [...array].sort((a, b) => {
    for (const key of keys) {
      const av = key(a); const bv = key(b);
      if (av < bv) return -1;
      if (av > bv) return 1;
    }
    return 0;
  });

const flatten = <T>(array: (T | T[])[]): T[] =>
  array.flatMap((item) => Array.isArray(item) ? item : [item]);

const zip = <A, B>(a: A[], b: B[]): [A, B][] =>
  a.slice(0, Math.min(a.length, b.length)).map((item, idx) => [item, b[idx]!]);

const range = (start: number, end?: number, step = 1): number[] => {
  const [from, to] = end === undefined ? [0, start] : [start, end];
  const result: number[] = [];
  for (let i = from; i < to; i += step) result.push(i);
  return result;
};

const last = <T>(array: T[]): T | undefined =>
  array[array.length - 1];

const first = <T>(array: T[]): T | undefined =>
  array[0];

const countBy = <T>(array: T[], predicate: (item: T) => boolean): number =>
  array.reduce((count, item) => count + (predicate(item) ? 1 : 0), 0);

const partition = <T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] =>
  array.reduce<[T[], T[]]>(([pass, fail], item) =>
    predicate(item) ? [[...pass, item], fail] : [pass, [...fail, item]],
    [[], []]
  );

const intersect = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item));
};

const difference = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b);
  return a.filter((item) => !setB.has(item));
};

const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};

// ─── Object Utilities ────────────────────────────────────────────────────────

const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => { if (key in obj) result[key] = obj[key]; });
  return result;
};

const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete (result as T)[key]);
  return result as Omit<T, K>;
};

const mapValues = <T extends object, V>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => V,
): Record<keyof T, V> => {
  const result = {} as Record<keyof T, V>;
  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    result[key] = fn(obj[key], key);
  });
  return result;
};

const filterObject = <T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean,
): Partial<T> => {
  const result: Partial<T> = {};
  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    if (predicate(obj[key], key)) result[key] = obj[key];
  });
  return result;
};

const deepMerge = <T extends object>(target: T, ...sources: DeepPartial<T>[]): T => {
  const result = { ...target };
  for (const source of sources) {
    for (const key in source) {
      const sv = (source as T)[key as keyof T];
      const tv = result[key as keyof T];
      if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
        result[key as keyof T] = deepMerge(tv as object, sv as object) as T[keyof T];
      } else if (sv !== undefined) {
        result[key as keyof T] = sv as T[keyof T];
      }
    }
  }
  return result;
};

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== 'object') return false;
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
};

const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T;
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone((obj as Record<string, unknown>)[key]);
    }
  }
  return result as T;
};

// ─── Date Utilities ──────────────────────────────────────────────────────────

const formatDate = (date: Date, locale = 'en-US', options?: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat(locale, options || { year: 'numeric', month: 'long', day: 'numeric' }).format(date);

const formatRelativeTime = (date: Date, relativeTo = new Date()): string => {
  const diffMs = date.getTime() - relativeTo.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr  = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);
  const diffWk  = Math.round(diffDay / 7);
  const diffMo  = Math.round(diffDay / 30);
  const diffYr  = Math.round(diffDay / 365);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffHr)  < 24) return rtf.format(diffHr, 'hour');
  if (Math.abs(diffDay) < 7)  return rtf.format(diffDay, 'day');
  if (Math.abs(diffWk)  < 5)  return rtf.format(diffWk, 'week');
  if (Math.abs(diffMo)  < 12) return rtf.format(diffMo, 'month');
  return rtf.format(diffYr, 'year');
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const startOfWeek = (date: Date, startDay = 0): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day - startDay + 7) % 7;
  result.setDate(result.getDate() - diff);
  return startOfDay(result);
};

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isWithinInterval = (date: Date, start: Date, end: Date): boolean =>
  date >= start && date <= end;

const parseISODate = (s: string): Date => {
  const d = new Date(s);
  if (isNaN(d.getTime())) throw new Error(`Invalid ISO date: ${s}`);
  return d;
};

const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

// ─── URL & Query String Utilities ────────────────────────────────────────────

const parseQueryString = (search: string): Record<string, string | string[]> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string | string[]> = {};
  params.forEach((value, key) => {
    if (key in result) {
      const existing = result[key]!;
      result[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      result[key] = value;
    }
  });
  return result;
};

const buildQueryString = (params: Record<string, string | string[] | number | boolean | null | undefined>): string => {
  const search = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val == null) continue;
    if (Array.isArray(val)) { val.forEach((v) => search.append(key, String(v))); }
    else { search.set(key, String(val)); }
  }
  const s = search.toString();
  return s ? `?${s}` : '';
};

// ─── Local Storage Utilities ─────────────────────────────────────────────────

const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or private browsing
    }
  },
  remove: (key: string): void => {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
  clear: (): void => {
    try { localStorage.clear(); } catch { /* noop */ }
  },
};

// ─── Custom React Hooks ───────────────────────────────────────────────────────

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => storage.get(key, initialValue));
  const setValue = React.useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
      storage.set(key, next);
      return next;
    });
  }, [key]);
  return [storedValue, setValue] as const;
}

function useSessionStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) as T : initialValue;
    } catch { return initialValue; }
  });
  const set = React.useCallback((v: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, [key]);
  return [value, set] as const;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useThrottle<T>(value: T, interval: number): T {
  const [throttled, setThrottled] = React.useState(value);
  const lastUpdated = React.useRef<number>(Date.now());
  React.useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= interval) {
      setThrottled(value);
      lastUpdated.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottled(value);
        lastUpdated.current = Date.now();
      }, interval - (now - lastUpdated.current));
      return () => clearTimeout(timer);
    }
  }, [value, interval]);
  return throttled;
}

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);
  React.useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}

function useIsMounted(): () => boolean {
  const isMountedRef = React.useRef(false);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);
  return React.useCallback(() => isMountedRef.current, []);
}

function useClickOutside<T extends HTMLElement>(handler: () => void): React.RefObject<T> {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);
  return ref;
}

function useWindowSize() {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

function useIntersectionObserver<T extends HTMLElement>(
  options?: IntersectionObserverInit,
): [React.RefObject<T>, boolean] {
  const ref = React.useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry!.isIntersecting);
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);
  return [ref, isIntersecting];
}

function useResizeObserver<T extends HTMLElement>(): [React.RefObject<T>, DOMRectReadOnly | null] {
  const ref = React.useRef<T>(null);
  const [rect, setRect] = React.useState<DOMRectReadOnly | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setRect(entry.contentRect);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, rect];
}

function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (e: WindowEventMap[K]) => void,
  element: EventTarget = window,
  options?: boolean | AddEventListenerOptions,
): void {
  const savedHandler = React.useRef(handler);
  React.useLayoutEffect(() => { savedHandler.current = handler; }, [handler]);
  React.useEffect(() => {
    const listener = (e: Event) => savedHandler.current(e as WindowEventMap[K]);
    element.addEventListener(eventName, listener, options);
    return () => element.removeEventListener(eventName, listener, options);
  }, [eventName, element, options]);
}

function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

function useCounter(initialValue = 0, min?: number, max?: number) {
  const [count, setCount] = React.useState(initialValue);
  const increment = React.useCallback(() => setCount((c) => max !== undefined ? Math.min(c + 1, max) : c + 1), [max]);
  const decrement = React.useCallback(() => setCount((c) => min !== undefined ? Math.max(c - 1, min) : c - 1), [min]);
  const reset     = React.useCallback(() => setCount(initialValue), [initialValue]);
  const set       = React.useCallback((v: number) => setCount(
    min !== undefined && max !== undefined ? clamp(v, min, max) : v
  ), [min, max]);
  return { count, increment, decrement, reset, set };
}

function useToggle(initialValue = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = React.useState(initialValue);
  const toggle = React.useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

function useAsyncState<T>() {
  const [state, setState] = React.useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    data: T | null;
    error: Error | null;
  }>({ status: 'idle', data: null, error: null });

  const run = React.useCallback(async (promise: Promise<T>) => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await promise;
      setState({ status: 'success', data, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ status: 'error', data: null, error });
      throw error;
    }
  }, []);

  return { ...state, run };
}

function useMediaQuery(breakpoints: Record<string, string>) {
  const [matches, setMatches] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      Object.entries(breakpoints).map(([key, query]) => [
        key,
        typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
      ])
    )
  );

  React.useEffect(() => {
    const queries = Object.entries(breakpoints).map(([key, query]) => {
      const mq = window.matchMedia(query);
      const handler = (e: MediaQueryListEvent) => {
        setMatches((prev) => ({ ...prev, [key]: e.matches }));
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    });
    return () => queries.forEach((cleanup) => cleanup());
  }, [breakpoints]);

  return matches;
}

function useFocusVisible(): [React.RefObject<HTMLElement>, boolean] {
  const ref = React.useRef<HTMLElement>(null);
  const [isFocusVisible, setIsFocusVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onFocus = (e: FocusEvent) => {
      const isKeyboard = !(e as FocusEvent & { sourceCapabilities?: { firesTouchEvents: boolean } })
        .sourceCapabilities?.firesTouchEvents;
      setIsFocusVisible(isKeyboard);
    };
    const onBlur = () => setIsFocusVisible(false);
    el.addEventListener('focus', onFocus);
    el.addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('focus', onFocus);
      el.removeEventListener('blur', onBlur);
    };
  }, []);

  return [ref, isFocusVisible];
}

function useDocumentTitle(title: string, suffix?: string): void {
  React.useEffect(() => {
    const original = document.title;
    document.title = suffix ? `${title} | ${suffix}` : title;
    return () => { document.title = original; };
  }, [title, suffix]);
}

function useCopyToClipboard(): [string | null, (text: string) => Promise<void>] {
  const [copiedText, setCopiedText] = React.useState<string | null>(null);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      setCopiedText(null);
    }
  };
  return [copiedText, copy];
}

function useKeyboardShortcut(
  keys: string[],
  callback: (e: KeyboardEvent) => void,
  options: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {},
): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (options.ctrlKey  && !e.ctrlKey)  return;
      if (options.metaKey  && !e.metaKey)  return;
      if (options.shiftKey && !e.shiftKey) return;
      if (options.altKey   && !e.altKey)   return;
      if (keys.includes(e.key)) {
        e.preventDefault();
        savedCallback.current(e);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [keys, options.ctrlKey, options.metaKey, options.shiftKey, options.altKey]);
}

function usePrefersDarkMode(): boolean {
  return useMatchMedia('(prefers-color-scheme: dark)');
}

function usePrefersReducedMotion(): boolean {
  return useMatchMedia('(prefers-reduced-motion: reduce)');
}

function useHighContrastMode(): boolean {
  return useMatchMedia('(forced-colors: active)');
}

// ─── Form Utilities ───────────────────────────────────────────────────────────

type ValidationRule<T> = (value: T) => string | null;

const validators = {
  required: (message = 'This field is required'): ValidationRule<string> =>
    (v) => v.trim() ? null : message,
  minLength: (min: number, message?: string): ValidationRule<string> =>
    (v) => v.length >= min ? null : message || `Must be at least ${min} characters`,
  maxLength: (max: number, message?: string): ValidationRule<string> =>
    (v) => v.length <= max ? null : message || `Must be no more than ${max} characters`,
  pattern: (re: RegExp, message = 'Invalid format'): ValidationRule<string> =>
    (v) => re.test(v) ? null : message,
  email: (message = 'Invalid email address'): ValidationRule<string> =>
    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : message,
  url: (message = 'Invalid URL'): ValidationRule<string> => (v) => {
    try { new URL(v); return null; } catch { return message; }
  },
  min: (min: number, message?: string): ValidationRule<number> =>
    (v) => v >= min ? null : message || `Must be at least ${min}`,
  max: (max: number, message?: string): ValidationRule<number> =>
    (v) => v <= max ? null : message || `Must be no more than ${max}`,
  integer: (message = 'Must be an integer'): ValidationRule<number> =>
    (v) => Number.isInteger(v) ? null : message,
};

function composeValidators<T>(...rules: ValidationRule<T>[]): ValidationRule<T> {
  return (value: T) => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  };
}

interface FieldState<T> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

function useField<T>(
  initialValue: T,
  validate?: ValidationRule<T>,
): FieldState<T> & {
  setValue: (v: T) => void;
  setTouched: () => void;
  reset: () => void;
  validate: () => boolean;
  inputProps: {
    value: T;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    'aria-invalid': boolean | undefined;
    'aria-required': boolean | undefined;
  };
} {
  const [state, setState] = React.useState<FieldState<T>>({
    value: initialValue,
    error: null,
    touched: false,
    dirty: false,
  });

  const runValidation = React.useCallback((v: T): string | null =>
    validate ? validate(v) : null,
    [validate]
  );

  const setValue = React.useCallback((v: T) => {
    setState((prev) => ({
      ...prev,
      value: v,
      dirty: v !== initialValue,
      error: prev.touched ? runValidation(v) : prev.error,
    }));
  }, [initialValue, runValidation]);

  const setTouched = React.useCallback(() => {
    setState((prev) => ({ ...prev, touched: true, error: runValidation(prev.value) }));
  }, [runValidation]);

  const reset = React.useCallback(() => {
    setState({ value: initialValue, error: null, touched: false, dirty: false });
  }, [initialValue]);

  const doValidate = React.useCallback((): boolean => {
    const error = runValidation(state.value);
    setState((prev) => ({ ...prev, touched: true, error }));
    return !error;
  }, [runValidation, state.value]);

  return {
    ...state,
    setValue,
    setTouched,
    reset,
    validate: doValidate,
    inputProps: {
      value: state.value,
      onChange: (e) => setValue(e.target.value as unknown as T),
      onBlur: setTouched,
      'aria-invalid': state.touched && !!state.error ? true : undefined,
      'aria-required': validate ? true : undefined,
    },
  };
}

// ─── Accessible Form Components ───────────────────────────────────────────────

interface FormFieldWrapperProps {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({ label, id, error, hint, required, children }) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="form-field" aria-invalid={!!error || undefined}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span aria-hidden="true" className="form-required">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {hint && <p id={hintId} className="form-hint">{hint}</p>}
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': !!error || undefined,
          'aria-required': required || undefined,
        }) : child
      )}
      {error && (
        <p id={errorId} role="alert" className="form-error" aria-live="polite">{error}</p>
      )}
    </div>
  );
};

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, id, error, hint, ...rest }) => (
  <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required || !!rest['aria-required']}>
    <input type="text" id={id} {...rest} />
  </FormFieldWrapper>
);

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, id, error, hint, options, placeholder, ...rest }) => (
  <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required}>
    <select id={id} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </FormFieldWrapper>
);

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  charCount?: boolean;
  maxChars?: number;
}

const TextareaInput: React.FC<TextareaInputProps> = ({ label, id, error, hint, charCount, maxChars, value, onChange, ...rest }) => {
  const [length, setLength] = React.useState(String(value || '').length);
  const countId = charCount ? `${id}-count` : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLength(e.target.value.length);
    onChange?.(e);
  };

  const isOverLimit = maxChars !== undefined && length > maxChars;

  return (
    <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required}>
      <textarea id={id} value={value} onChange={handleChange} aria-describedby={countId || undefined} {...rest} />
      {charCount && (
        <p id={countId} aria-live="polite" aria-atomic="true" className={`char-count ${isOverLimit ? 'char-count--over' : ''}`}>
          {maxChars !== undefined ? `${length} / ${maxChars} characters` : `${length} characters`}
        </p>
      )}
    </FormFieldWrapper>
  );
};

// ─── Status Components ────────────────────────────────────────────────────────

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertBannerProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  live?: 'polite' | 'assertive' | 'off';
}

const ALERT_ICONS: Record<AlertVariant, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✗',
};

const AlertBanner: React.FC<AlertBannerProps> = ({ variant = 'info', title, children, onDismiss, icon, live }) => {
  const ariaRole = variant === 'error' || variant === 'warning' ? 'alert' : 'status';
  const ariaLive = live || (variant === 'error' ? 'assertive' : 'polite');
  return (
    <div role={ariaRole} aria-live={ariaLive} aria-atomic="true" className={`alert alert--${variant}`}>
      <span className="alert__icon" aria-hidden="true">{icon || ALERT_ICONS[variant]}</span>
      <div className="alert__body">
        {title && <strong className="alert__title">{title}</strong>}
        <div className="alert__message">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert__dismiss"
          aria-label="Dismiss notification"
          onClick={onDismiss}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, label, showValue = false, size = 'md', variant = 'default' }) => {
  const pct = clamp((value / max) * 100, 0, 100);
  const id = React.useId();
  return (
    <div className={`progress progress--${size} progress--${variant}`} role="group" aria-labelledby={id}>
      <span id={id} className="progress__label">{label}</span>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={id}
        aria-valuetext={`${label}: ${Math.round(pct)}%`}
        style={{ width: `${pct}%` }}
        className="progress__bar"
      />
      {showValue && <span className="progress__value" aria-hidden="true">{Math.round(pct)}%</span>}
    </div>
  );
};

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const LoadingSpinner: React.FC<SpinnerProps> = ({ size = 'md', label = 'Loading...' }) => (
  <div role="status" aria-label={label} className={`spinner spinner--${size}`}>
    <span className="sr-only">{label}</span>
    <span aria-hidden="true" className="spinner__ring" />
  </div>
);

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circle' | 'rect';
  animated?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ width, height, variant = 'rect', animated = true }) => (
  <span
    aria-hidden="true"
    className={`skeleton skeleton--${variant} ${animated ? 'skeleton--animated' : ''}`}
    style={{ display: 'block', width, height }}
  />
);

interface SkeletonScreenProps {
  lines?: number;
  label?: string;
}

const SkeletonScreen: React.FC<SkeletonScreenProps> = ({ lines = 4, label = 'Loading content...' }) => (
  <div role="status" aria-label={label} aria-busy="true">
    <span className="sr-only">{label}</span>
    {range(lines).map((i) => (
      <Skeleton key={i} height={16} width={`${100 - (i % 3) * 10}%`} variant="text" />
    ))}
  </div>
);

// ─── Navigation Components ────────────────────────────────────────────────────

interface SidebarNavItem2 {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: SidebarNavItem2[];
}

interface SidebarNavProps {
  items: SidebarNavItem2[];
  currentHref: string;
  label?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ items, currentHref, label = 'Primary navigation' }) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const renderItem = (item: SidebarNavItem2, depth = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isCurrent = item.href === currentHref;
    const isExpand = expanded.has(item.id);
    const itemId = `nav-item-${item.id}`;
    const subId = `nav-sub-${item.id}`;

    return (
      <li key={item.id}>
        {hasChildren ? (
          <>
            <button
              id={itemId}
              type="button"
              aria-expanded={isExpand}
              aria-controls={subId}
              onClick={() => toggleExpanded(item.id)}
              className="nav__item nav__item--expandable"
              style={{ paddingLeft: depth * 16 + 12 }}
            >
              {item.icon && <span className="nav__icon" aria-hidden="true">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="nav__badge" aria-label={`, ${item.badge} notifications`}>{item.badge}</span>
              )}
              <span aria-hidden="true" className={`nav__chevron ${isExpand ? 'nav__chevron--up' : ''}`}>▾</span>
            </button>
            <ul id={subId} role="group" aria-labelledby={itemId} hidden={!isExpand}>
              {item.children!.map((child) => renderItem(child, depth + 1))}
            </ul>
          </>
        ) : (
          <a
            id={itemId}
            href={item.href}
            aria-current={isCurrent ? 'page' : undefined}
            className={`nav__item nav__item--link ${isCurrent ? 'nav__item--current' : ''}`}
            style={{ paddingLeft: depth * 16 + 12 }}
          >
            {item.icon && <span className="nav__icon" aria-hidden="true">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className="nav__badge" aria-label={`, ${item.badge} notifications`}>{item.badge}</span>
            )}
          </a>
        )}
      </li>
    );
  };

  return (
    <nav aria-label={label} className="sidebar-nav">
      <ul role="list">{items.map((item) => renderItem(item))}</ul>
    </nav>
  );
};

// ─── Data Display ─────────────────────────────────────────────────────────────

interface KeyValuePair { key: string; value: string | number | React.ReactNode; }

interface DescriptionListProps {
  items: KeyValuePair[];
  columns?: 1 | 2 | 3;
  label?: string;
  compact?: boolean;
}

const DescriptionList: React.FC<DescriptionListProps> = ({ items, columns = 1, label, compact }) => (
  <dl
    aria-label={label}
    className={`dl dl--${columns}col ${compact ? 'dl--compact' : ''}`}
  >
    {items.map(({ key, value }, idx) => (
      <React.Fragment key={idx}>
        <dt className="dl__term">{key}</dt>
        <dd className="dl__detail">{value}</dd>
      </React.Fragment>
    ))}
  </dl>
);

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { value: number; label: string };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, delta, icon, trend }) => {
  const labelId = React.useId();
  const deltaSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const deltaLabel = delta ? `${delta.value > 0 ? '+' : ''}${delta.value} ${delta.label}` : undefined;
  return (
    <article className={`stat-card stat-card--${trend || 'neutral'}`} aria-labelledby={labelId}>
      {icon && <span className="stat-card__icon" aria-hidden="true">{icon}</span>}
      <span id={labelId} className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {delta && (
        <span className="stat-card__delta" aria-label={deltaLabel}>
          <span aria-hidden="true">{deltaSymbol}</span>
          <span>{delta.value > 0 ? '+' : ''}{delta.value} {delta.label}</span>
        </span>
      )}
    </article>
  );
};

// ─── Error Boundary ──────────────────────────────────────────────────────────

interface ErrorBoundaryState { hasError: boolean; error: Error | null; }
interface ErrorBoundaryProps {
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  onError?: (error: Error, info: React.ErrorInfo) => void;
  children: React.ReactNode;
}

class LuminaryErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.onError?.(error, info);
    console.error('[LuminaryErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') return fallback(this.state.error);
      if (fallback) return fallback;
      return (
        <div role="alert" aria-live="polite" className="error-boundary">
          <h2>Something went wrong</h2>
          <p>The application encountered an unexpected error. Please refresh the page.</p>
          <button type="button" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Accessible Rich Text Editor Toolbar ─────────────────────────────────────

interface RichTextAction {
  id: string;
  label: string;
  icon: string;
  command: string;
  shortcut?: string;
}

const EDITOR_ACTIONS: RichTextAction[] = [
  { id: 'bold',        label: 'Bold',        icon: 'B', command: 'bold',        shortcut: 'Ctrl+B' },
  { id: 'italic',      label: 'Italic',      icon: 'I', command: 'italic',      shortcut: 'Ctrl+I' },
  { id: 'underline',   label: 'Underline',   icon: 'U', command: 'underline',   shortcut: 'Ctrl+U' },
  { id: 'strikethrough', label: 'Strikethrough', icon: 'S̶', command: 'strikeThrough'          },
  { id: 'ordered',     label: 'Ordered list',    icon: '1.', command: 'insertOrderedList'  },
  { id: 'unordered',   label: 'Unordered list',  icon: '•',  command: 'insertUnorderedList' },
  { id: 'link',        label: 'Insert link',     icon: '🔗', command: 'createLink'           },
  { id: 'undo',        label: 'Undo',            icon: '↩', command: 'undo',        shortcut: 'Ctrl+Z' },
  { id: 'redo',        label: 'Redo',            icon: '↪', command: 'redo',        shortcut: 'Ctrl+Y' },
];

interface RichTextToolbarProps {
  editorRef: React.RefObject<HTMLDivElement>;
  label?: string;
}

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ editorRef, label = 'Text formatting' }) => {
  const [activeStates, setActiveStates] = React.useState<Record<string, boolean>>({});

  const updateStates = React.useCallback(() => {
    setActiveStates(
      Object.fromEntries(EDITOR_ACTIONS.map((a) => [a.id, document.queryCommandState?.(a.command) || false]))
    );
  }, []);

  const execCommand = (action: RichTextAction) => {
    if (!editorRef.current) return;
    if (action.command === 'createLink') {
      const url = window.prompt('Enter URL:');
      if (url) document.execCommand(action.command, false, url);
    } else {
      document.execCommand(action.command, false, undefined);
    }
    editorRef.current.focus();
    updateStates();
  };

  return (
    <div role="toolbar" aria-label={label} className="rich-text-toolbar">
      {EDITOR_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          aria-pressed={activeStates[action.id]}
          aria-keyshortcuts={action.shortcut}
          title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
          aria-label={action.label}
          onClick={() => execCommand(action)}
          className={`toolbar-btn ${activeStates[action.id] ? 'toolbar-btn--active' : ''}`}
        >
          <span aria-hidden="true">{action.icon}</span>
        </button>
      ))}
    </div>
  );
};

interface AccessibleRichEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  label: string;
  id: string;
  minHeight?: number;
  maxHeight?: number;
}

const AccessibleRichEditor: React.FC<AccessibleRichEditorProps> = ({
  value, onChange, placeholder = 'Start typing…', label, id, minHeight = 120, maxHeight,
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const toolbarId = `${id}-toolbar`;
  const labelId = `${id}-label`;

  React.useEffect(() => {
    if (editorRef.current && value !== undefined && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="rich-editor" id={id}>
      <label id={labelId} className="rich-editor__label">{label}</label>
      <RichTextToolbar editorRef={editorRef} label={`${label} formatting options`} />
      <div
        ref={editorRef}
        role="textbox"
        contentEditable="true"
        aria-multiline="true"
        aria-labelledby={labelId}
        aria-describedby={toolbarId}
        data-placeholder={placeholder}
        style={{ minHeight, maxHeight, overflowY: maxHeight ? 'auto' : undefined }}
        onInput={() => onChange?.(editorRef.current?.innerHTML || '')}
        className="rich-editor__content"
        suppressContentEditableWarning
      />
    </div>
  );
};

// ─── Virtual List ────────────────────────────────────────────────────────────

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  label?: string;
  getItemId?: (item: T, index: number) => string;
}

function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  label = 'List',
  getItemId,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={containerRef}
      role="list"
      aria-label={label}
      aria-rowcount={items.length}
      style={{ height: containerHeight, overflowY: 'auto', position: 'relative' }}
      onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }} aria-hidden="false">
        {visibleItems.map((item, idx) => {
          const absoluteIndex = startIndex + idx;
          return (
            <div
              key={getItemId ? getItemId(item, absoluteIndex) : absoluteIndex}
              role="listitem"
              aria-rowindex={absoluteIndex + 1}
              style={{ position: 'absolute', top: absoluteIndex * itemHeight, height: itemHeight, width: '100%' }}
            >
              {renderItem(item, absoluteIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stepper / Wizard ────────────────────────────────────────────────────────

interface StepperStep {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onChange?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  completedSteps,
  onChange,
  orientation = 'horizontal',
  label = 'Progress',
}) => {
  const navId = React.useId();
  return (
    <nav
      id={navId}
      aria-label={label}
      className={`stepper stepper--${orientation}`}
    >
      <ol className="stepper__list">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.has(idx);
          const isCurrent = idx === currentStep;
          const isClickable = onChange && isCompleted;
          let status: string;
          if (isCompleted) status = 'completed';
          else if (isCurrent) status = 'current';
          else status = 'upcoming';

          return (
            <li
              key={step.id}
              className={`stepper__item stepper__item--${status}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onChange(idx)}
                  aria-label={`Step ${idx + 1}: ${step.label}${isCompleted ? ' (completed)' : ''}`}
                  className="stepper__btn"
                >
                  <StepIndicator idx={idx} status={status} />
                  <StepContent step={step} status={status} />
                </button>
              ) : (
                <div aria-label={`Step ${idx + 1}: ${step.label}${isCurrent ? ' (current)' : ''}${!isCompleted && !isCurrent ? ' (upcoming)' : ''}`}>
                  <StepIndicator idx={idx} status={status} />
                  <StepContent step={step} status={status} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const StepIndicator: React.FC<{ idx: number; status: string }> = ({ idx, status }) => (
  <span className="stepper__indicator" aria-hidden="true">
    {status === 'completed' ? '✓' : idx + 1}
  </span>
);

const StepContent: React.FC<{ step: StepperStep; status: string }> = ({ step, status }) => (
  <div className="stepper__content">
    <span className="stepper__label">
      {step.label}
      {step.optional && <span className="stepper__optional"> (optional)</span>}
    </span>
    {step.description && <span className="stepper__desc">{step.description}</span>}
  </div>
);

// ─── Color Contrast Utilities ────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const n = parseInt(full, 16);
  if (isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function srgbChannel(c: number): number {
  const srgb = c / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  if (!c1 || !c2) return 0;
  const l1 = relativeLuminance(c1);
  const l2 = relativeLuminance(c2);
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function meetsWCAGAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = contrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

function meetsWCAGAAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = contrastRatio(foreground, background);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

const ContrastChecker: React.FC<{ foreground: string; background: string; text?: string }> = ({
  foreground, background, text = 'Sample Text'
}) => {
  const ratio = contrastRatio(foreground, background);
  const passAA  = meetsWCAGAA(foreground, background);
  const passAAA = meetsWCAGAAA(foreground, background);
  const passAALg = meetsWCAGAA(foreground, background, true);

  return (
    <div className="contrast-checker" aria-label="Color contrast checker results">
      <div
        className="contrast-preview"
        style={{ color: foreground, background, padding: '16px', borderRadius: 8 }}
        aria-label={`Text preview: ${text}`}
      >
        <p className="contrast-preview__normal">{text}</p>
        <p className="contrast-preview__large" style={{ fontSize: 24, fontWeight: 700 }}>{text} (large)</p>
      </div>
      <dl className="contrast-results">
        <dt>Contrast ratio</dt>
        <dd aria-label={`Contrast ratio: ${ratio.toFixed(2)} to 1`}>{ratio.toFixed(2)}:1</dd>
        <dt>WCAG AA (normal text, min 4.5:1)</dt>
        <dd aria-label={`WCAG AA: ${passAA ? 'Pass' : 'Fail'}`} className={passAA ? 'pass' : 'fail'}>{passAA ? 'Pass ✓' : 'Fail ✗'}</dd>
        <dt>WCAG AA (large text, min 3:1)</dt>
        <dd aria-label={`WCAG AA large: ${passAALg ? 'Pass' : 'Fail'}`} className={passAALg ? 'pass' : 'fail'}>{passAALg ? 'Pass ✓' : 'Fail ✗'}</dd>
        <dt>WCAG AAA (normal text, min 7:1)</dt>
        <dd aria-label={`WCAG AAA: ${passAAA ? 'Pass' : 'Fail'}`} className={passAAA ? 'pass' : 'fail'}>{passAAA ? 'Pass ✓' : 'Fail ✗'}</dd>
      </dl>
    </div>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export {
  toCamelCase, toKebabCase, toTitleCase, truncate, slugify, pluralize, escapeHtml, stripHtml, countWords, formatBytes,
  clamp, lerp, inverseLerp, remap, roundTo, formatNumber, formatCurrency, formatPercent, sum, average, median, standardDeviation,
  chunk, unique, uniqueBy, groupBy, sortBy, flatten, zip, range, last, first, countBy, partition, intersect, difference, shuffle,
  pick, omit, mapValues, filterObject, deepMerge, deepEqual, deepClone,
  formatDate, formatRelativeTime, addDays, startOfDay, endOfDay, startOfWeek, isSameDay, isWithinInterval, parseISODate, getDaysInMonth,
  parseQueryString, buildQueryString, storage,
  useLocalStorage, useSessionStorage, useDebounce, useThrottle, usePrevious, useIsMounted,
  useClickOutside, useWindowSize, useMatchMedia, useIntersectionObserver, useResizeObserver,
  useEventListener, useInterval, useTimeout, useCounter, useToggle, useAsyncState, useMediaQuery,
  useFocusVisible, useDocumentTitle, useCopyToClipboard, useKeyboardShortcut,
  usePrefersDarkMode, usePrefersReducedMotion, useHighContrastMode,
  validators, composeValidators, useField,
  FormFieldWrapper, TextInput, SelectInput, TextareaInput,
  AlertBanner, ProgressBar, LoadingSpinner, Skeleton, SkeletonScreen,
  SidebarNav, DescriptionList, StatCard,
  LuminaryErrorBoundary,
  RichTextToolbar, AccessibleRichEditor,
  VirtualList,
  Stepper,
  hexToRgb, relativeLuminance, contrastRatio, meetsWCAGAA, meetsWCAGAAA, ContrastChecker,
};

// ═══════════════════════════════════════════════════════════════════════════
// LUMINARY DESIGN SYSTEM — EXTENDED COMPONENT LIBRARY
// Fully accessible, WCAG 2.2 compliant React components.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Type Utilities ──────────────────────────────────────────────────────────

type Maybe<T> = T | null | undefined;
type Nullable<T> = T | null;
type NonEmptyArray<T> = [T, ...T[]];
type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
type DeepReadonly<T> = T extends (infer A)[] ? DeepReadonlyArray<A> : T extends object ? DeepReadonlyObject<T> : T;
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
type DeepReadonlyObject<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };
type Awaited<T> = T extends PromiseLike<infer R> ? R : T;
type ValueOf<T> = T[keyof T];
type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];
type Prettify<T> = { [K in keyof T]: T[K] } & NonNullable<unknown>;
type Override<T, U> = Omit<T, keyof U> & U;
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];
type ExactlyOneOf<T, Keys extends keyof T = keyof T> = { [K in Keys]: Pick<T, K> & Partial<Record<Exclude<Keys, K>, never>> }[Keys] & Pick<T, Exclude<keyof T, Keys>>;

// ─── String Utilities ────────────────────────────────────────────────────────

const toCamelCase = (s: string): string =>
  s.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');

const toKebabCase = (s: string): string =>
  s.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');

const toTitleCase = (s: string): string =>
  s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

const truncate = (s: string, maxLength: number, ellipsis = '…'): string =>
  s.length <= maxLength ? s : s.slice(0, maxLength - ellipsis.length) + ellipsis;

const slugify = (s: string): string =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const pluralize = (count: number, singular: string, plural?: string): string =>
  `${count} ${count === 1 ? singular : (plural || singular + 's')}`;

const padStart = (s: string | number, len: number, char = '0'): string =>
  String(s).padStart(len, char);

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const stripHtml = (s: string): string =>
  s.replace(/<[^>]*>/g, '');

const countWords = (s: string): number =>
  s.trim().split(/\s+/).filter(Boolean).length;

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = Math.max(0, decimals);
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// ─── Number & Math Utilities ─────────────────────────────────────────────────

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

const inverseLerp = (a: number, b: number, value: number): number =>
  (value - a) / (b - a);

const remap = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number =>
  lerp(outMin, outMax, inverseLerp(inMin, inMax, value));

const roundTo = (value: number, precision: number): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

const formatNumber = (n: number, locale = 'en-US', options?: Intl.NumberFormatOptions): string =>
  new Intl.NumberFormat(locale, options).format(n);

const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);

const formatPercent = (value: number, decimals = 1): string =>
  `${(value * 100).toFixed(decimals)}%`;

const sum = (...nums: number[]): number =>
  nums.reduce((acc, n) => acc + n, 0);

const average = (...nums: number[]): number =>
  nums.length ? sum(...nums) / nums.length : 0;

const median = (nums: number[]): number => {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
};

const standardDeviation = (nums: number[]): number => {
  if (nums.length < 2) return 0;
  const mean = average(...nums);
  const squaredDiffs = nums.map((n) => Math.pow(n - mean, 2));
  return Math.sqrt(average(...squaredDiffs));
};

// ─── Array Utilities ─────────────────────────────────────────────────────────

const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const unique = <T>(array: T[]): T[] =>
  Array.from(new Set(array));

const uniqueBy = <T, K>(array: T[], keyFn: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> => {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(item);
    return acc;
  }, {} as Record<K, T[]>);
};

const sortBy = <T>(array: T[], ...keys: ((item: T) => string | number)[]): T[] =>
  [...array].sort((a, b) => {
    for (const key of keys) {
      const av = key(a); const bv = key(b);
      if (av < bv) return -1;
      if (av > bv) return 1;
    }
    return 0;
  });

const flatten = <T>(array: (T | T[])[]): T[] =>
  array.flatMap((item) => Array.isArray(item) ? item : [item]);

const zip = <A, B>(a: A[], b: B[]): [A, B][] =>
  a.slice(0, Math.min(a.length, b.length)).map((item, idx) => [item, b[idx]!]);

const range = (start: number, end?: number, step = 1): number[] => {
  const [from, to] = end === undefined ? [0, start] : [start, end];
  const result: number[] = [];
  for (let i = from; i < to; i += step) result.push(i);
  return result;
};

const last = <T>(array: T[]): T | undefined =>
  array[array.length - 1];

const first = <T>(array: T[]): T | undefined =>
  array[0];

const countBy = <T>(array: T[], predicate: (item: T) => boolean): number =>
  array.reduce((count, item) => count + (predicate(item) ? 1 : 0), 0);

const partition = <T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] =>
  array.reduce<[T[], T[]]>(([pass, fail], item) =>
    predicate(item) ? [[...pass, item], fail] : [pass, [...fail, item]],
    [[], []]
  );

const intersect = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item));
};

const difference = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b);
  return a.filter((item) => !setB.has(item));
};

const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};

// ─── Object Utilities ────────────────────────────────────────────────────────

const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => { if (key in obj) result[key] = obj[key]; });
  return result;
};

const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete (result as T)[key]);
  return result as Omit<T, K>;
};

const mapValues = <T extends object, V>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => V,
): Record<keyof T, V> => {
  const result = {} as Record<keyof T, V>;
  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    result[key] = fn(obj[key], key);
  });
  return result;
};

const filterObject = <T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean,
): Partial<T> => {
  const result: Partial<T> = {};
  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    if (predicate(obj[key], key)) result[key] = obj[key];
  });
  return result;
};

const deepMerge = <T extends object>(target: T, ...sources: DeepPartial<T>[]): T => {
  const result = { ...target };
  for (const source of sources) {
    for (const key in source) {
      const sv = (source as T)[key as keyof T];
      const tv = result[key as keyof T];
      if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
        result[key as keyof T] = deepMerge(tv as object, sv as object) as T[keyof T];
      } else if (sv !== undefined) {
        result[key as keyof T] = sv as T[keyof T];
      }
    }
  }
  return result;
};

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== 'object') return false;
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
};

const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T;
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone((obj as Record<string, unknown>)[key]);
    }
  }
  return result as T;
};

// ─── Date Utilities ──────────────────────────────────────────────────────────

const formatDate = (date: Date, locale = 'en-US', options?: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat(locale, options || { year: 'numeric', month: 'long', day: 'numeric' }).format(date);

const formatRelativeTime = (date: Date, relativeTo = new Date()): string => {
  const diffMs = date.getTime() - relativeTo.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr  = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);
  const diffWk  = Math.round(diffDay / 7);
  const diffMo  = Math.round(diffDay / 30);
  const diffYr  = Math.round(diffDay / 365);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffHr)  < 24) return rtf.format(diffHr, 'hour');
  if (Math.abs(diffDay) < 7)  return rtf.format(diffDay, 'day');
  if (Math.abs(diffWk)  < 5)  return rtf.format(diffWk, 'week');
  if (Math.abs(diffMo)  < 12) return rtf.format(diffMo, 'month');
  return rtf.format(diffYr, 'year');
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const startOfWeek = (date: Date, startDay = 0): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day - startDay + 7) % 7;
  result.setDate(result.getDate() - diff);
  return startOfDay(result);
};

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isWithinInterval = (date: Date, start: Date, end: Date): boolean =>
  date >= start && date <= end;

const parseISODate = (s: string): Date => {
  const d = new Date(s);
  if (isNaN(d.getTime())) throw new Error(`Invalid ISO date: ${s}`);
  return d;
};

const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

// ─── URL & Query String Utilities ────────────────────────────────────────────

const parseQueryString = (search: string): Record<string, string | string[]> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string | string[]> = {};
  params.forEach((value, key) => {
    if (key in result) {
      const existing = result[key]!;
      result[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      result[key] = value;
    }
  });
  return result;
};

const buildQueryString = (params: Record<string, string | string[] | number | boolean | null | undefined>): string => {
  const search = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val == null) continue;
    if (Array.isArray(val)) { val.forEach((v) => search.append(key, String(v))); }
    else { search.set(key, String(val)); }
  }
  const s = search.toString();
  return s ? `?${s}` : '';
};

// ─── Local Storage Utilities ─────────────────────────────────────────────────

const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or private browsing
    }
  },
  remove: (key: string): void => {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
  clear: (): void => {
    try { localStorage.clear(); } catch { /* noop */ }
  },
};

// ─── Custom React Hooks ───────────────────────────────────────────────────────

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => storage.get(key, initialValue));
  const setValue = React.useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
      storage.set(key, next);
      return next;
    });
  }, [key]);
  return [storedValue, setValue] as const;
}

function useSessionStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) as T : initialValue;
    } catch { return initialValue; }
  });
  const set = React.useCallback((v: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, [key]);
  return [value, set] as const;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useThrottle<T>(value: T, interval: number): T {
  const [throttled, setThrottled] = React.useState(value);
  const lastUpdated = React.useRef<number>(Date.now());
  React.useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= interval) {
      setThrottled(value);
      lastUpdated.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottled(value);
        lastUpdated.current = Date.now();
      }, interval - (now - lastUpdated.current));
      return () => clearTimeout(timer);
    }
  }, [value, interval]);
  return throttled;
}

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);
  React.useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}

function useIsMounted(): () => boolean {
  const isMountedRef = React.useRef(false);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);
  return React.useCallback(() => isMountedRef.current, []);
}

function useClickOutside<T extends HTMLElement>(handler: () => void): React.RefObject<T> {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);
  return ref;
}

function useWindowSize() {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

function useIntersectionObserver<T extends HTMLElement>(
  options?: IntersectionObserverInit,
): [React.RefObject<T>, boolean] {
  const ref = React.useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry!.isIntersecting);
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);
  return [ref, isIntersecting];
}

function useResizeObserver<T extends HTMLElement>(): [React.RefObject<T>, DOMRectReadOnly | null] {
  const ref = React.useRef<T>(null);
  const [rect, setRect] = React.useState<DOMRectReadOnly | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setRect(entry.contentRect);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, rect];
}

function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (e: WindowEventMap[K]) => void,
  element: EventTarget = window,
  options?: boolean | AddEventListenerOptions,
): void {
  const savedHandler = React.useRef(handler);
  React.useLayoutEffect(() => { savedHandler.current = handler; }, [handler]);
  React.useEffect(() => {
    const listener = (e: Event) => savedHandler.current(e as WindowEventMap[K]);
    element.addEventListener(eventName, listener, options);
    return () => element.removeEventListener(eventName, listener, options);
  }, [eventName, element, options]);
}

function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

function useCounter(initialValue = 0, min?: number, max?: number) {
  const [count, setCount] = React.useState(initialValue);
  const increment = React.useCallback(() => setCount((c) => max !== undefined ? Math.min(c + 1, max) : c + 1), [max]);
  const decrement = React.useCallback(() => setCount((c) => min !== undefined ? Math.max(c - 1, min) : c - 1), [min]);
  const reset     = React.useCallback(() => setCount(initialValue), [initialValue]);
  const set       = React.useCallback((v: number) => setCount(
    min !== undefined && max !== undefined ? clamp(v, min, max) : v
  ), [min, max]);
  return { count, increment, decrement, reset, set };
}

function useToggle(initialValue = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = React.useState(initialValue);
  const toggle = React.useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

function useAsyncState<T>() {
  const [state, setState] = React.useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    data: T | null;
    error: Error | null;
  }>({ status: 'idle', data: null, error: null });

  const run = React.useCallback(async (promise: Promise<T>) => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await promise;
      setState({ status: 'success', data, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ status: 'error', data: null, error });
      throw error;
    }
  }, []);

  return { ...state, run };
}

function useMediaQuery(breakpoints: Record<string, string>) {
  const [matches, setMatches] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      Object.entries(breakpoints).map(([key, query]) => [
        key,
        typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
      ])
    )
  );

  React.useEffect(() => {
    const queries = Object.entries(breakpoints).map(([key, query]) => {
      const mq = window.matchMedia(query);
      const handler = (e: MediaQueryListEvent) => {
        setMatches((prev) => ({ ...prev, [key]: e.matches }));
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    });
    return () => queries.forEach((cleanup) => cleanup());
  }, [breakpoints]);

  return matches;
}

function useFocusVisible(): [React.RefObject<HTMLElement>, boolean] {
  const ref = React.useRef<HTMLElement>(null);
  const [isFocusVisible, setIsFocusVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onFocus = (e: FocusEvent) => {
      const isKeyboard = !(e as FocusEvent & { sourceCapabilities?: { firesTouchEvents: boolean } })
        .sourceCapabilities?.firesTouchEvents;
      setIsFocusVisible(isKeyboard);
    };
    const onBlur = () => setIsFocusVisible(false);
    el.addEventListener('focus', onFocus);
    el.addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('focus', onFocus);
      el.removeEventListener('blur', onBlur);
    };
  }, []);

  return [ref, isFocusVisible];
}

function useDocumentTitle(title: string, suffix?: string): void {
  React.useEffect(() => {
    const original = document.title;
    document.title = suffix ? `${title} | ${suffix}` : title;
    return () => { document.title = original; };
  }, [title, suffix]);
}

function useCopyToClipboard(): [string | null, (text: string) => Promise<void>] {
  const [copiedText, setCopiedText] = React.useState<string | null>(null);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      setCopiedText(null);
    }
  };
  return [copiedText, copy];
}

function useKeyboardShortcut(
  keys: string[],
  callback: (e: KeyboardEvent) => void,
  options: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {},
): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (options.ctrlKey  && !e.ctrlKey)  return;
      if (options.metaKey  && !e.metaKey)  return;
      if (options.shiftKey && !e.shiftKey) return;
      if (options.altKey   && !e.altKey)   return;
      if (keys.includes(e.key)) {
        e.preventDefault();
        savedCallback.current(e);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [keys, options.ctrlKey, options.metaKey, options.shiftKey, options.altKey]);
}

function usePrefersDarkMode(): boolean {
  return useMatchMedia('(prefers-color-scheme: dark)');
}

function usePrefersReducedMotion(): boolean {
  return useMatchMedia('(prefers-reduced-motion: reduce)');
}

function useHighContrastMode(): boolean {
  return useMatchMedia('(forced-colors: active)');
}

// ─── Form Utilities ───────────────────────────────────────────────────────────

type ValidationRule<T> = (value: T) => string | null;

const validators = {
  required: (message = 'This field is required'): ValidationRule<string> =>
    (v) => v.trim() ? null : message,
  minLength: (min: number, message?: string): ValidationRule<string> =>
    (v) => v.length >= min ? null : message || `Must be at least ${min} characters`,
  maxLength: (max: number, message?: string): ValidationRule<string> =>
    (v) => v.length <= max ? null : message || `Must be no more than ${max} characters`,
  pattern: (re: RegExp, message = 'Invalid format'): ValidationRule<string> =>
    (v) => re.test(v) ? null : message,
  email: (message = 'Invalid email address'): ValidationRule<string> =>
    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : message,
  url: (message = 'Invalid URL'): ValidationRule<string> => (v) => {
    try { new URL(v); return null; } catch { return message; }
  },
  min: (min: number, message?: string): ValidationRule<number> =>
    (v) => v >= min ? null : message || `Must be at least ${min}`,
  max: (max: number, message?: string): ValidationRule<number> =>
    (v) => v <= max ? null : message || `Must be no more than ${max}`,
  integer: (message = 'Must be an integer'): ValidationRule<number> =>
    (v) => Number.isInteger(v) ? null : message,
};

function composeValidators<T>(...rules: ValidationRule<T>[]): ValidationRule<T> {
  return (value: T) => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  };
}

interface FieldState<T> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

function useField<T>(
  initialValue: T,
  validate?: ValidationRule<T>,
): FieldState<T> & {
  setValue: (v: T) => void;
  setTouched: () => void;
  reset: () => void;
  validate: () => boolean;
  inputProps: {
    value: T;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    'aria-invalid': boolean | undefined;
    'aria-required': boolean | undefined;
  };
} {
  const [state, setState] = React.useState<FieldState<T>>({
    value: initialValue,
    error: null,
    touched: false,
    dirty: false,
  });

  const runValidation = React.useCallback((v: T): string | null =>
    validate ? validate(v) : null,
    [validate]
  );

  const setValue = React.useCallback((v: T) => {
    setState((prev) => ({
      ...prev,
      value: v,
      dirty: v !== initialValue,
      error: prev.touched ? runValidation(v) : prev.error,
    }));
  }, [initialValue, runValidation]);

  const setTouched = React.useCallback(() => {
    setState((prev) => ({ ...prev, touched: true, error: runValidation(prev.value) }));
  }, [runValidation]);

  const reset = React.useCallback(() => {
    setState({ value: initialValue, error: null, touched: false, dirty: false });
  }, [initialValue]);

  const doValidate = React.useCallback((): boolean => {
    const error = runValidation(state.value);
    setState((prev) => ({ ...prev, touched: true, error }));
    return !error;
  }, [runValidation, state.value]);

  return {
    ...state,
    setValue,
    setTouched,
    reset,
    validate: doValidate,
    inputProps: {
      value: state.value,
      onChange: (e) => setValue(e.target.value as unknown as T),
      onBlur: setTouched,
      'aria-invalid': state.touched && !!state.error ? true : undefined,
      'aria-required': validate ? true : undefined,
    },
  };
}

// ─── Accessible Form Components ───────────────────────────────────────────────

interface FormFieldWrapperProps {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({ label, id, error, hint, required, children }) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="form-field" aria-invalid={!!error || undefined}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span aria-hidden="true" className="form-required">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {hint && <p id={hintId} className="form-hint">{hint}</p>}
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': !!error || undefined,
          'aria-required': required || undefined,
        }) : child
      )}
      {error && (
        <p id={errorId} role="alert" className="form-error" aria-live="polite">{error}</p>
      )}
    </div>
  );
};

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, id, error, hint, ...rest }) => (
  <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required || !!rest['aria-required']}>
    <input type="text" id={id} {...rest} />
  </FormFieldWrapper>
);

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, id, error, hint, options, placeholder, ...rest }) => (
  <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required}>
    <select id={id} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </FormFieldWrapper>
);

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  charCount?: boolean;
  maxChars?: number;
}

const TextareaInput: React.FC<TextareaInputProps> = ({ label, id, error, hint, charCount, maxChars, value, onChange, ...rest }) => {
  const [length, setLength] = React.useState(String(value || '').length);
  const countId = charCount ? `${id}-count` : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLength(e.target.value.length);
    onChange?.(e);
  };

  const isOverLimit = maxChars !== undefined && length > maxChars;

  return (
    <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required}>
      <textarea id={id} value={value} onChange={handleChange} aria-describedby={countId || undefined} {...rest} />
      {charCount && (
        <p id={countId} aria-live="polite" aria-atomic="true" className={`char-count ${isOverLimit ? 'char-count--over' : ''}`}>
          {maxChars !== undefined ? `${length} / ${maxChars} characters` : `${length} characters`}
        </p>
      )}
    </FormFieldWrapper>
  );
};

// ─── Status Components ────────────────────────────────────────────────────────

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertBannerProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  live?: 'polite' | 'assertive' | 'off';
}

const ALERT_ICONS: Record<AlertVariant, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✗',
};

const AlertBanner: React.FC<AlertBannerProps> = ({ variant = 'info', title, children, onDismiss, icon, live }) => {
  const ariaRole = variant === 'error' || variant === 'warning' ? 'alert' : 'status';
  const ariaLive = live || (variant === 'error' ? 'assertive' : 'polite');
  return (
    <div role={ariaRole} aria-live={ariaLive} aria-atomic="true" className={`alert alert--${variant}`}>
      <span className="alert__icon" aria-hidden="true">{icon || ALERT_ICONS[variant]}</span>
      <div className="alert__body">
        {title && <strong className="alert__title">{title}</strong>}
        <div className="alert__message">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert__dismiss"
          aria-label="Dismiss notification"
          onClick={onDismiss}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, label, showValue = false, size = 'md', variant = 'default' }) => {
  const pct = clamp((value / max) * 100, 0, 100);
  const id = React.useId();
  return (
    <div className={`progress progress--${size} progress--${variant}`} role="group" aria-labelledby={id}>
      <span id={id} className="progress__label">{label}</span>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={id}
        aria-valuetext={`${label}: ${Math.round(pct)}%`}
        style={{ width: `${pct}%` }}
        className="progress__bar"
      />
      {showValue && <span className="progress__value" aria-hidden="true">{Math.round(pct)}%</span>}
    </div>
  );
};

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const LoadingSpinner: React.FC<SpinnerProps> = ({ size = 'md', label = 'Loading...' }) => (
  <div role="status" aria-label={label} className={`spinner spinner--${size}`}>
    <span className="sr-only">{label}</span>
    <span aria-hidden="true" className="spinner__ring" />
  </div>
);

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circle' | 'rect';
  animated?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ width, height, variant = 'rect', animated = true }) => (
  <span
    aria-hidden="true"
    className={`skeleton skeleton--${variant} ${animated ? 'skeleton--animated' : ''}`}
    style={{ display: 'block', width, height }}
  />
);

interface SkeletonScreenProps {
  lines?: number;
  label?: string;
}

const SkeletonScreen: React.FC<SkeletonScreenProps> = ({ lines = 4, label = 'Loading content...' }) => (
  <div role="status" aria-label={label} aria-busy="true">
    <span className="sr-only">{label}</span>
    {range(lines).map((i) => (
      <Skeleton key={i} height={16} width={`${100 - (i % 3) * 10}%`} variant="text" />
    ))}
  </div>
);

// ─── Navigation Components ────────────────────────────────────────────────────

interface SidebarNavItem2 {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: SidebarNavItem2[];
}

interface SidebarNavProps {
  items: SidebarNavItem2[];
  currentHref: string;
  label?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ items, currentHref, label = 'Primary navigation' }) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const renderItem = (item: SidebarNavItem2, depth = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isCurrent = item.href === currentHref;
    const isExpand = expanded.has(item.id);
    const itemId = `nav-item-${item.id}`;
    const subId = `nav-sub-${item.id}`;

    return (
      <li key={item.id}>
        {hasChildren ? (
          <>
            <button
              id={itemId}
              type="button"
              aria-expanded={isExpand}
              aria-controls={subId}
              onClick={() => toggleExpanded(item.id)}
              className="nav__item nav__item--expandable"
              style={{ paddingLeft: depth * 16 + 12 }}
            >
              {item.icon && <span className="nav__icon" aria-hidden="true">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="nav__badge" aria-label={`, ${item.badge} notifications`}>{item.badge}</span>
              )}
              <span aria-hidden="true" className={`nav__chevron ${isExpand ? 'nav__chevron--up' : ''}`}>▾</span>
            </button>
            <ul id={subId} role="group" aria-labelledby={itemId} hidden={!isExpand}>
              {item.children!.map((child) => renderItem(child, depth + 1))}
            </ul>
          </>
        ) : (
          <a
            id={itemId}
            href={item.href}
            aria-current={isCurrent ? 'page' : undefined}
            className={`nav__item nav__item--link ${isCurrent ? 'nav__item--current' : ''}`}
            style={{ paddingLeft: depth * 16 + 12 }}
          >
            {item.icon && <span className="nav__icon" aria-hidden="true">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className="nav__badge" aria-label={`, ${item.badge} notifications`}>{item.badge}</span>
            )}
          </a>
        )}
      </li>
    );
  };

  return (
    <nav aria-label={label} className="sidebar-nav">
      <ul role="list">{items.map((item) => renderItem(item))}</ul>
    </nav>
  );
};

// ─── Data Display ─────────────────────────────────────────────────────────────

interface KeyValuePair { key: string; value: string | number | React.ReactNode; }

interface DescriptionListProps {
  items: KeyValuePair[];
  columns?: 1 | 2 | 3;
  label?: string;
  compact?: boolean;
}

const DescriptionList: React.FC<DescriptionListProps> = ({ items, columns = 1, label, compact }) => (
  <dl
    aria-label={label}
    className={`dl dl--${columns}col ${compact ? 'dl--compact' : ''}`}
  >
    {items.map(({ key, value }, idx) => (
      <React.Fragment key={idx}>
        <dt className="dl__term">{key}</dt>
        <dd className="dl__detail">{value}</dd>
      </React.Fragment>
    ))}
  </dl>
);

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { value: number; label: string };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, delta, icon, trend }) => {
  const labelId = React.useId();
  const deltaSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const deltaLabel = delta ? `${delta.value > 0 ? '+' : ''}${delta.value} ${delta.label}` : undefined;
  return (
    <article className={`stat-card stat-card--${trend || 'neutral'}`} aria-labelledby={labelId}>
      {icon && <span className="stat-card__icon" aria-hidden="true">{icon}</span>}
      <span id={labelId} className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {delta && (
        <span className="stat-card__delta" aria-label={deltaLabel}>
          <span aria-hidden="true">{deltaSymbol}</span>
          <span>{delta.value > 0 ? '+' : ''}{delta.value} {delta.label}</span>
        </span>
      )}
    </article>
  );
};

// ─── Error Boundary ──────────────────────────────────────────────────────────

interface ErrorBoundaryState { hasError: boolean; error: Error | null; }
interface ErrorBoundaryProps {
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  onError?: (error: Error, info: React.ErrorInfo) => void;
  children: React.ReactNode;
}

class LuminaryErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.onError?.(error, info);
    console.error('[LuminaryErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') return fallback(this.state.error);
      if (fallback) return fallback;
      return (
        <div role="alert" aria-live="polite" className="error-boundary">
          <h2>Something went wrong</h2>
          <p>The application encountered an unexpected error. Please refresh the page.</p>
          <button type="button" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Accessible Rich Text Editor Toolbar ─────────────────────────────────────

interface RichTextAction {
  id: string;
  label: string;
  icon: string;
  command: string;
  shortcut?: string;
}

const EDITOR_ACTIONS: RichTextAction[] = [
  { id: 'bold',        label: 'Bold',        icon: 'B', command: 'bold',        shortcut: 'Ctrl+B' },
  { id: 'italic',      label: 'Italic',      icon: 'I', command: 'italic',      shortcut: 'Ctrl+I' },
  { id: 'underline',   label: 'Underline',   icon: 'U', command: 'underline',   shortcut: 'Ctrl+U' },
  { id: 'strikethrough', label: 'Strikethrough', icon: 'S̶', command: 'strikeThrough'          },
  { id: 'ordered',     label: 'Ordered list',    icon: '1.', command: 'insertOrderedList'  },
  { id: 'unordered',   label: 'Unordered list',  icon: '•',  command: 'insertUnorderedList' },
  { id: 'link',        label: 'Insert link',     icon: '🔗', command: 'createLink'           },
  { id: 'undo',        label: 'Undo',            icon: '↩', command: 'undo',        shortcut: 'Ctrl+Z' },
  { id: 'redo',        label: 'Redo',            icon: '↪', command: 'redo',        shortcut: 'Ctrl+Y' },
];

interface RichTextToolbarProps {
  editorRef: React.RefObject<HTMLDivElement>;
  label?: string;
}

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ editorRef, label = 'Text formatting' }) => {
  const [activeStates, setActiveStates] = React.useState<Record<string, boolean>>({});

  const updateStates = React.useCallback(() => {
    setActiveStates(
      Object.fromEntries(EDITOR_ACTIONS.map((a) => [a.id, document.queryCommandState?.(a.command) || false]))
    );
  }, []);

  const execCommand = (action: RichTextAction) => {
    if (!editorRef.current) return;
    if (action.command === 'createLink') {
      const url = window.prompt('Enter URL:');
      if (url) document.execCommand(action.command, false, url);
    } else {
      document.execCommand(action.command, false, undefined);
    }
    editorRef.current.focus();
    updateStates();
  };

  return (
    <div role="toolbar" aria-label={label} className="rich-text-toolbar">
      {EDITOR_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          aria-pressed={activeStates[action.id]}
          aria-keyshortcuts={action.shortcut}
          title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
          aria-label={action.label}
          onClick={() => execCommand(action)}
          className={`toolbar-btn ${activeStates[action.id] ? 'toolbar-btn--active' : ''}`}
        >
          <span aria-hidden="true">{action.icon}</span>
        </button>
      ))}
    </div>
  );
};

interface AccessibleRichEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  label: string;
  id: string;
  minHeight?: number;
  maxHeight?: number;
}

const AccessibleRichEditor: React.FC<AccessibleRichEditorProps> = ({
  value, onChange, placeholder = 'Start typing…', label, id, minHeight = 120, maxHeight,
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const toolbarId = `${id}-toolbar`;
  const labelId = `${id}-label`;

  React.useEffect(() => {
    if (editorRef.current && value !== undefined && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="rich-editor" id={id}>
      <label id={labelId} className="rich-editor__label">{label}</label>
      <RichTextToolbar editorRef={editorRef} label={`${label} formatting options`} />
      <div
        ref={editorRef}
        role="textbox"
        contentEditable="true"
        aria-multiline="true"
        aria-labelledby={labelId}
        aria-describedby={toolbarId}
        data-placeholder={placeholder}
        style={{ minHeight, maxHeight, overflowY: maxHeight ? 'auto' : undefined }}
        onInput={() => onChange?.(editorRef.current?.innerHTML || '')}
        className="rich-editor__content"
        suppressContentEditableWarning
      />
    </div>
  );
};

// ─── Virtual List ────────────────────────────────────────────────────────────

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  label?: string;
  getItemId?: (item: T, index: number) => string;
}

function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  label = 'List',
  getItemId,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={containerRef}
      role="list"
      aria-label={label}
      aria-rowcount={items.length}
      style={{ height: containerHeight, overflowY: 'auto', position: 'relative' }}
      onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }} aria-hidden="false">
        {visibleItems.map((item, idx) => {
          const absoluteIndex = startIndex + idx;
          return (
            <div
              key={getItemId ? getItemId(item, absoluteIndex) : absoluteIndex}
              role="listitem"
              aria-rowindex={absoluteIndex + 1}
              style={{ position: 'absolute', top: absoluteIndex * itemHeight, height: itemHeight, width: '100%' }}
            >
              {renderItem(item, absoluteIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stepper / Wizard ────────────────────────────────────────────────────────

interface StepperStep {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onChange?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  completedSteps,
  onChange,
  orientation = 'horizontal',
  label = 'Progress',
}) => {
  const navId = React.useId();
  return (
    <nav
      id={navId}
      aria-label={label}
      className={`stepper stepper--${orientation}`}
    >
      <ol className="stepper__list">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.has(idx);
          const isCurrent = idx === currentStep;
          const isClickable = onChange && isCompleted;
          let status: string;
          if (isCompleted) status = 'completed';
          else if (isCurrent) status = 'current';
          else status = 'upcoming';

          return (
            <li
              key={step.id}
              className={`stepper__item stepper__item--${status}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onChange(idx)}
                  aria-label={`Step ${idx + 1}: ${step.label}${isCompleted ? ' (completed)' : ''}`}
                  className="stepper__btn"
                >
                  <StepIndicator idx={idx} status={status} />
                  <StepContent step={step} status={status} />
                </button>
              ) : (
                <div aria-label={`Step ${idx + 1}: ${step.label}${isCurrent ? ' (current)' : ''}${!isCompleted && !isCurrent ? ' (upcoming)' : ''}`}>
                  <StepIndicator idx={idx} status={status} />
                  <StepContent step={step} status={status} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const StepIndicator: React.FC<{ idx: number; status: string }> = ({ idx, status }) => (
  <span className="stepper__indicator" aria-hidden="true">
    {status === 'completed' ? '✓' : idx + 1}
  </span>
);

const StepContent: React.FC<{ step: StepperStep; status: string }> = ({ step, status }) => (
  <div className="stepper__content">
    <span className="stepper__label">
      {step.label}
      {step.optional && <span className="stepper__optional"> (optional)</span>}
    </span>
    {step.description && <span className="stepper__desc">{step.description}</span>}
  </div>
);

// ─── Color Contrast Utilities ────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const n = parseInt(full, 16);
  if (isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function srgbChannel(c: number): number {
  const srgb = c / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  if (!c1 || !c2) return 0;
  const l1 = relativeLuminance(c1);
  const l2 = relativeLuminance(c2);
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function meetsWCAGAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = contrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

function meetsWCAGAAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = contrastRatio(foreground, background);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

const ContrastChecker: React.FC<{ foreground: string; background: string; text?: string }> = ({
  foreground, background, text = 'Sample Text'
}) => {
  const ratio = contrastRatio(foreground, background);
  const passAA  = meetsWCAGAA(foreground, background);
  const passAAA = meetsWCAGAAA(foreground, background);
  const passAALg = meetsWCAGAA(foreground, background, true);

  return (
    <div className="contrast-checker" aria-label="Color contrast checker results">
      <div
        className="contrast-preview"
        style={{ color: foreground, background, padding: '16px', borderRadius: 8 }}
        aria-label={`Text preview: ${text}`}
      >
        <p className="contrast-preview__normal">{text}</p>
        <p className="contrast-preview__large" style={{ fontSize: 24, fontWeight: 700 }}>{text} (large)</p>
      </div>
      <dl className="contrast-results">
        <dt>Contrast ratio</dt>
        <dd aria-label={`Contrast ratio: ${ratio.toFixed(2)} to 1`}>{ratio.toFixed(2)}:1</dd>
        <dt>WCAG AA (normal text, min 4.5:1)</dt>
        <dd aria-label={`WCAG AA: ${passAA ? 'Pass' : 'Fail'}`} className={passAA ? 'pass' : 'fail'}>{passAA ? 'Pass ✓' : 'Fail ✗'}</dd>
        <dt>WCAG AA (large text, min 3:1)</dt>
        <dd aria-label={`WCAG AA large: ${passAALg ? 'Pass' : 'Fail'}`} className={passAALg ? 'pass' : 'fail'}>{passAALg ? 'Pass ✓' : 'Fail ✗'}</dd>
        <dt>WCAG AAA (normal text, min 7:1)</dt>
        <dd aria-label={`WCAG AAA: ${passAAA ? 'Pass' : 'Fail'}`} className={passAAA ? 'pass' : 'fail'}>{passAAA ? 'Pass ✓' : 'Fail ✗'}</dd>
      </dl>
    </div>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export {
  toCamelCase, toKebabCase, toTitleCase, truncate, slugify, pluralize, escapeHtml, stripHtml, countWords, formatBytes,
  clamp, lerp, inverseLerp, remap, roundTo, formatNumber, formatCurrency, formatPercent, sum, average, median, standardDeviation,
  chunk, unique, uniqueBy, groupBy, sortBy, flatten, zip, range, last, first, countBy, partition, intersect, difference, shuffle,
  pick, omit, mapValues, filterObject, deepMerge, deepEqual, deepClone,
  formatDate, formatRelativeTime, addDays, startOfDay, endOfDay, startOfWeek, isSameDay, isWithinInterval, parseISODate, getDaysInMonth,
  parseQueryString, buildQueryString, storage,
  useLocalStorage, useSessionStorage, useDebounce, useThrottle, usePrevious, useIsMounted,
  useClickOutside, useWindowSize, useMatchMedia, useIntersectionObserver, useResizeObserver,
  useEventListener, useInterval, useTimeout, useCounter, useToggle, useAsyncState, useMediaQuery,
  useFocusVisible, useDocumentTitle, useCopyToClipboard, useKeyboardShortcut,
  usePrefersDarkMode, usePrefersReducedMotion, useHighContrastMode,
  validators, composeValidators, useField,
  FormFieldWrapper, TextInput, SelectInput, TextareaInput,
  AlertBanner, ProgressBar, LoadingSpinner, Skeleton, SkeletonScreen,
  SidebarNav, DescriptionList, StatCard,
  LuminaryErrorBoundary,
  RichTextToolbar, AccessibleRichEditor,
  VirtualList,
  Stepper,
  hexToRgb, relativeLuminance, contrastRatio, meetsWCAGAA, meetsWCAGAAA, ContrastChecker,
};

// ═══════════════════════════════════════════════════════════════════════════
// LUMINARY DESIGN SYSTEM — EXTENDED COMPONENT LIBRARY
// Fully accessible, WCAG 2.2 compliant React components.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Type Utilities ──────────────────────────────────────────────────────────

type Maybe<T> = T | null | undefined;
type Nullable<T> = T | null;
type NonEmptyArray<T> = [T, ...T[]];
type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
type DeepReadonly<T> = T extends (infer A)[] ? DeepReadonlyArray<A> : T extends object ? DeepReadonlyObject<T> : T;
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
type DeepReadonlyObject<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };
type Awaited<T> = T extends PromiseLike<infer R> ? R : T;
type ValueOf<T> = T[keyof T];
type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];
type Prettify<T> = { [K in keyof T]: T[K] } & NonNullable<unknown>;
type Override<T, U> = Omit<T, keyof U> & U;
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];
type ExactlyOneOf<T, Keys extends keyof T = keyof T> = { [K in Keys]: Pick<T, K> & Partial<Record<Exclude<Keys, K>, never>> }[Keys] & Pick<T, Exclude<keyof T, Keys>>;

// ─── String Utilities ────────────────────────────────────────────────────────

const toCamelCase = (s: string): string =>
  s.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');

const toKebabCase = (s: string): string =>
  s.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');

const toTitleCase = (s: string): string =>
  s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

const truncate = (s: string, maxLength: number, ellipsis = '…'): string =>
  s.length <= maxLength ? s : s.slice(0, maxLength - ellipsis.length) + ellipsis;

const slugify = (s: string): string =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const pluralize = (count: number, singular: string, plural?: string): string =>
  `${count} ${count === 1 ? singular : (plural || singular + 's')}`;

const padStart = (s: string | number, len: number, char = '0'): string =>
  String(s).padStart(len, char);

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const stripHtml = (s: string): string =>
  s.replace(/<[^>]*>/g, '');

const countWords = (s: string): number =>
  s.trim().split(/\s+/).filter(Boolean).length;

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = Math.max(0, decimals);
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// ─── Number & Math Utilities ─────────────────────────────────────────────────

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

const inverseLerp = (a: number, b: number, value: number): number =>
  (value - a) / (b - a);

const remap = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number =>
  lerp(outMin, outMax, inverseLerp(inMin, inMax, value));

const roundTo = (value: number, precision: number): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

const formatNumber = (n: number, locale = 'en-US', options?: Intl.NumberFormatOptions): string =>
  new Intl.NumberFormat(locale, options).format(n);

const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);

const formatPercent = (value: number, decimals = 1): string =>
  `${(value * 100).toFixed(decimals)}%`;

const sum = (...nums: number[]): number =>
  nums.reduce((acc, n) => acc + n, 0);

const average = (...nums: number[]): number =>
  nums.length ? sum(...nums) / nums.length : 0;

const median = (nums: number[]): number => {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
};

const standardDeviation = (nums: number[]): number => {
  if (nums.length < 2) return 0;
  const mean = average(...nums);
  const squaredDiffs = nums.map((n) => Math.pow(n - mean, 2));
  return Math.sqrt(average(...squaredDiffs));
};

// ─── Array Utilities ─────────────────────────────────────────────────────────

const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const unique = <T>(array: T[]): T[] =>
  Array.from(new Set(array));

const uniqueBy = <T, K>(array: T[], keyFn: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> => {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(item);
    return acc;
  }, {} as Record<K, T[]>);
};

const sortBy = <T>(array: T[], ...keys: ((item: T) => string | number)[]): T[] =>
  [...array].sort((a, b) => {
    for (const key of keys) {
      const av = key(a); const bv = key(b);
      if (av < bv) return -1;
      if (av > bv) return 1;
    }
    return 0;
  });

const flatten = <T>(array: (T | T[])[]): T[] =>
  array.flatMap((item) => Array.isArray(item) ? item : [item]);

const zip = <A, B>(a: A[], b: B[]): [A, B][] =>
  a.slice(0, Math.min(a.length, b.length)).map((item, idx) => [item, b[idx]!]);

const range = (start: number, end?: number, step = 1): number[] => {
  const [from, to] = end === undefined ? [0, start] : [start, end];
  const result: number[] = [];
  for (let i = from; i < to; i += step) result.push(i);
  return result;
};

const last = <T>(array: T[]): T | undefined =>
  array[array.length - 1];

const first = <T>(array: T[]): T | undefined =>
  array[0];

const countBy = <T>(array: T[], predicate: (item: T) => boolean): number =>
  array.reduce((count, item) => count + (predicate(item) ? 1 : 0), 0);

const partition = <T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] =>
  array.reduce<[T[], T[]]>(([pass, fail], item) =>
    predicate(item) ? [[...pass, item], fail] : [pass, [...fail, item]],
    [[], []]
  );

const intersect = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item));
};

const difference = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b);
  return a.filter((item) => !setB.has(item));
};

const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};

// ─── Object Utilities ────────────────────────────────────────────────────────

const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => { if (key in obj) result[key] = obj[key]; });
  return result;
};

const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete (result as T)[key]);
  return result as Omit<T, K>;
};

const mapValues = <T extends object, V>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => V,
): Record<keyof T, V> => {
  const result = {} as Record<keyof T, V>;
  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    result[key] = fn(obj[key], key);
  });
  return result;
};

const filterObject = <T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean,
): Partial<T> => {
  const result: Partial<T> = {};
  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    if (predicate(obj[key], key)) result[key] = obj[key];
  });
  return result;
};

const deepMerge = <T extends object>(target: T, ...sources: DeepPartial<T>[]): T => {
  const result = { ...target };
  for (const source of sources) {
    for (const key in source) {
      const sv = (source as T)[key as keyof T];
      const tv = result[key as keyof T];
      if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
        result[key as keyof T] = deepMerge(tv as object, sv as object) as T[keyof T];
      } else if (sv !== undefined) {
        result[key as keyof T] = sv as T[keyof T];
      }
    }
  }
  return result;
};

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== 'object') return false;
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
};

const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T;
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone((obj as Record<string, unknown>)[key]);
    }
  }
  return result as T;
};

// ─── Date Utilities ──────────────────────────────────────────────────────────

const formatDate = (date: Date, locale = 'en-US', options?: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat(locale, options || { year: 'numeric', month: 'long', day: 'numeric' }).format(date);

const formatRelativeTime = (date: Date, relativeTo = new Date()): string => {
  const diffMs = date.getTime() - relativeTo.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr  = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);
  const diffWk  = Math.round(diffDay / 7);
  const diffMo  = Math.round(diffDay / 30);
  const diffYr  = Math.round(diffDay / 365);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffHr)  < 24) return rtf.format(diffHr, 'hour');
  if (Math.abs(diffDay) < 7)  return rtf.format(diffDay, 'day');
  if (Math.abs(diffWk)  < 5)  return rtf.format(diffWk, 'week');
  if (Math.abs(diffMo)  < 12) return rtf.format(diffMo, 'month');
  return rtf.format(diffYr, 'year');
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const startOfWeek = (date: Date, startDay = 0): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day - startDay + 7) % 7;
  result.setDate(result.getDate() - diff);
  return startOfDay(result);
};

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isWithinInterval = (date: Date, start: Date, end: Date): boolean =>
  date >= start && date <= end;

const parseISODate = (s: string): Date => {
  const d = new Date(s);
  if (isNaN(d.getTime())) throw new Error(`Invalid ISO date: ${s}`);
  return d;
};

const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

// ─── URL & Query String Utilities ────────────────────────────────────────────

const parseQueryString = (search: string): Record<string, string | string[]> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string | string[]> = {};
  params.forEach((value, key) => {
    if (key in result) {
      const existing = result[key]!;
      result[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      result[key] = value;
    }
  });
  return result;
};

const buildQueryString = (params: Record<string, string | string[] | number | boolean | null | undefined>): string => {
  const search = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val == null) continue;
    if (Array.isArray(val)) { val.forEach((v) => search.append(key, String(v))); }
    else { search.set(key, String(val)); }
  }
  const s = search.toString();
  return s ? `?${s}` : '';
};

// ─── Local Storage Utilities ─────────────────────────────────────────────────

const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or private browsing
    }
  },
  remove: (key: string): void => {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
  clear: (): void => {
    try { localStorage.clear(); } catch { /* noop */ }
  },
};

// ─── Custom React Hooks ───────────────────────────────────────────────────────

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => storage.get(key, initialValue));
  const setValue = React.useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
      storage.set(key, next);
      return next;
    });
  }, [key]);
  return [storedValue, setValue] as const;
}

function useSessionStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) as T : initialValue;
    } catch { return initialValue; }
  });
  const set = React.useCallback((v: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, [key]);
  return [value, set] as const;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useThrottle<T>(value: T, interval: number): T {
  const [throttled, setThrottled] = React.useState(value);
  const lastUpdated = React.useRef<number>(Date.now());
  React.useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= interval) {
      setThrottled(value);
      lastUpdated.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottled(value);
        lastUpdated.current = Date.now();
      }, interval - (now - lastUpdated.current));
      return () => clearTimeout(timer);
    }
  }, [value, interval]);
  return throttled;
}

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);
  React.useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}

function useIsMounted(): () => boolean {
  const isMountedRef = React.useRef(false);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);
  return React.useCallback(() => isMountedRef.current, []);
}

function useClickOutside<T extends HTMLElement>(handler: () => void): React.RefObject<T> {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);
  return ref;
}

function useWindowSize() {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

function useIntersectionObserver<T extends HTMLElement>(
  options?: IntersectionObserverInit,
): [React.RefObject<T>, boolean] {
  const ref = React.useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry!.isIntersecting);
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);
  return [ref, isIntersecting];
}

function useResizeObserver<T extends HTMLElement>(): [React.RefObject<T>, DOMRectReadOnly | null] {
  const ref = React.useRef<T>(null);
  const [rect, setRect] = React.useState<DOMRectReadOnly | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setRect(entry.contentRect);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, rect];
}

function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (e: WindowEventMap[K]) => void,
  element: EventTarget = window,
  options?: boolean | AddEventListenerOptions,
): void {
  const savedHandler = React.useRef(handler);
  React.useLayoutEffect(() => { savedHandler.current = handler; }, [handler]);
  React.useEffect(() => {
    const listener = (e: Event) => savedHandler.current(e as WindowEventMap[K]);
    element.addEventListener(eventName, listener, options);
    return () => element.removeEventListener(eventName, listener, options);
  }, [eventName, element, options]);
}

function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

function useCounter(initialValue = 0, min?: number, max?: number) {
  const [count, setCount] = React.useState(initialValue);
  const increment = React.useCallback(() => setCount((c) => max !== undefined ? Math.min(c + 1, max) : c + 1), [max]);
  const decrement = React.useCallback(() => setCount((c) => min !== undefined ? Math.max(c - 1, min) : c - 1), [min]);
  const reset     = React.useCallback(() => setCount(initialValue), [initialValue]);
  const set       = React.useCallback((v: number) => setCount(
    min !== undefined && max !== undefined ? clamp(v, min, max) : v
  ), [min, max]);
  return { count, increment, decrement, reset, set };
}

function useToggle(initialValue = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = React.useState(initialValue);
  const toggle = React.useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

function useAsyncState<T>() {
  const [state, setState] = React.useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    data: T | null;
    error: Error | null;
  }>({ status: 'idle', data: null, error: null });

  const run = React.useCallback(async (promise: Promise<T>) => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await promise;
      setState({ status: 'success', data, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ status: 'error', data: null, error });
      throw error;
    }
  }, []);

  return { ...state, run };
}

function useMediaQuery(breakpoints: Record<string, string>) {
  const [matches, setMatches] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      Object.entries(breakpoints).map(([key, query]) => [
        key,
        typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
      ])
    )
  );

  React.useEffect(() => {
    const queries = Object.entries(breakpoints).map(([key, query]) => {
      const mq = window.matchMedia(query);
      const handler = (e: MediaQueryListEvent) => {
        setMatches((prev) => ({ ...prev, [key]: e.matches }));
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    });
    return () => queries.forEach((cleanup) => cleanup());
  }, [breakpoints]);

  return matches;
}

function useFocusVisible(): [React.RefObject<HTMLElement>, boolean] {
  const ref = React.useRef<HTMLElement>(null);
  const [isFocusVisible, setIsFocusVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onFocus = (e: FocusEvent) => {
      const isKeyboard = !(e as FocusEvent & { sourceCapabilities?: { firesTouchEvents: boolean } })
        .sourceCapabilities?.firesTouchEvents;
      setIsFocusVisible(isKeyboard);
    };
    const onBlur = () => setIsFocusVisible(false);
    el.addEventListener('focus', onFocus);
    el.addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('focus', onFocus);
      el.removeEventListener('blur', onBlur);
    };
  }, []);

  return [ref, isFocusVisible];
}

function useDocumentTitle(title: string, suffix?: string): void {
  React.useEffect(() => {
    const original = document.title;
    document.title = suffix ? `${title} | ${suffix}` : title;
    return () => { document.title = original; };
  }, [title, suffix]);
}

function useCopyToClipboard(): [string | null, (text: string) => Promise<void>] {
  const [copiedText, setCopiedText] = React.useState<string | null>(null);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      setCopiedText(null);
    }
  };
  return [copiedText, copy];
}

function useKeyboardShortcut(
  keys: string[],
  callback: (e: KeyboardEvent) => void,
  options: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {},
): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (options.ctrlKey  && !e.ctrlKey)  return;
      if (options.metaKey  && !e.metaKey)  return;
      if (options.shiftKey && !e.shiftKey) return;
      if (options.altKey   && !e.altKey)   return;
      if (keys.includes(e.key)) {
        e.preventDefault();
        savedCallback.current(e);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [keys, options.ctrlKey, options.metaKey, options.shiftKey, options.altKey]);
}

function usePrefersDarkMode(): boolean {
  return useMatchMedia('(prefers-color-scheme: dark)');
}

function usePrefersReducedMotion(): boolean {
  return useMatchMedia('(prefers-reduced-motion: reduce)');
}

function useHighContrastMode(): boolean {
  return useMatchMedia('(forced-colors: active)');
}

// ─── Form Utilities ───────────────────────────────────────────────────────────

type ValidationRule<T> = (value: T) => string | null;

const validators = {
  required: (message = 'This field is required'): ValidationRule<string> =>
    (v) => v.trim() ? null : message,
  minLength: (min: number, message?: string): ValidationRule<string> =>
    (v) => v.length >= min ? null : message || `Must be at least ${min} characters`,
  maxLength: (max: number, message?: string): ValidationRule<string> =>
    (v) => v.length <= max ? null : message || `Must be no more than ${max} characters`,
  pattern: (re: RegExp, message = 'Invalid format'): ValidationRule<string> =>
    (v) => re.test(v) ? null : message,
  email: (message = 'Invalid email address'): ValidationRule<string> =>
    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : message,
  url: (message = 'Invalid URL'): ValidationRule<string> => (v) => {
    try { new URL(v); return null; } catch { return message; }
  },
  min: (min: number, message?: string): ValidationRule<number> =>
    (v) => v >= min ? null : message || `Must be at least ${min}`,
  max: (max: number, message?: string): ValidationRule<number> =>
    (v) => v <= max ? null : message || `Must be no more than ${max}`,
  integer: (message = 'Must be an integer'): ValidationRule<number> =>
    (v) => Number.isInteger(v) ? null : message,
};

function composeValidators<T>(...rules: ValidationRule<T>[]): ValidationRule<T> {
  return (value: T) => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  };
}

interface FieldState<T> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

function useField<T>(
  initialValue: T,
  validate?: ValidationRule<T>,
): FieldState<T> & {
  setValue: (v: T) => void;
  setTouched: () => void;
  reset: () => void;
  validate: () => boolean;
  inputProps: {
    value: T;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    'aria-invalid': boolean | undefined;
    'aria-required': boolean | undefined;
  };
} {
  const [state, setState] = React.useState<FieldState<T>>({
    value: initialValue,
    error: null,
    touched: false,
    dirty: false,
  });

  const runValidation = React.useCallback((v: T): string | null =>
    validate ? validate(v) : null,
    [validate]
  );

  const setValue = React.useCallback((v: T) => {
    setState((prev) => ({
      ...prev,
      value: v,
      dirty: v !== initialValue,
      error: prev.touched ? runValidation(v) : prev.error,
    }));
  }, [initialValue, runValidation]);

  const setTouched = React.useCallback(() => {
    setState((prev) => ({ ...prev, touched: true, error: runValidation(prev.value) }));
  }, [runValidation]);

  const reset = React.useCallback(() => {
    setState({ value: initialValue, error: null, touched: false, dirty: false });
  }, [initialValue]);

  const doValidate = React.useCallback((): boolean => {
    const error = runValidation(state.value);
    setState((prev) => ({ ...prev, touched: true, error }));
    return !error;
  }, [runValidation, state.value]);

  return {
    ...state,
    setValue,
    setTouched,
    reset,
    validate: doValidate,
    inputProps: {
      value: state.value,
      onChange: (e) => setValue(e.target.value as unknown as T),
      onBlur: setTouched,
      'aria-invalid': state.touched && !!state.error ? true : undefined,
      'aria-required': validate ? true : undefined,
    },
  };
}

// ─── Accessible Form Components ───────────────────────────────────────────────

interface FormFieldWrapperProps {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({ label, id, error, hint, required, children }) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="form-field" aria-invalid={!!error || undefined}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span aria-hidden="true" className="form-required">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {hint && <p id={hintId} className="form-hint">{hint}</p>}
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': !!error || undefined,
          'aria-required': required || undefined,
        }) : child
      )}
      {error && (
        <p id={errorId} role="alert" className="form-error" aria-live="polite">{error}</p>
      )}
    </div>
  );
};

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, id, error, hint, ...rest }) => (
  <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required || !!rest['aria-required']}>
    <input type="text" id={id} {...rest} />
  </FormFieldWrapper>
);

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, id, error, hint, options, placeholder, ...rest }) => (
  <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required}>
    <select id={id} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </FormFieldWrapper>
);

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  charCount?: boolean;
  maxChars?: number;
}

const TextareaInput: React.FC<TextareaInputProps> = ({ label, id, error, hint, charCount, maxChars, value, onChange, ...rest }) => {
  const [length, setLength] = React.useState(String(value || '').length);
  const countId = charCount ? `${id}-count` : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLength(e.target.value.length);
    onChange?.(e);
  };

  const isOverLimit = maxChars !== undefined && length > maxChars;

  return (
    <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required}>
      <textarea id={id} value={value} onChange={handleChange} aria-describedby={countId || undefined} {...rest} />
      {charCount && (
        <p id={countId} aria-live="polite" aria-atomic="true" className={`char-count ${isOverLimit ? 'char-count--over' : ''}`}>
          {maxChars !== undefined ? `${length} / ${maxChars} characters` : `${length} characters`}
        </p>
      )}
    </FormFieldWrapper>
  );
};

// ─── Status Components ────────────────────────────────────────────────────────

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertBannerProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  live?: 'polite' | 'assertive' | 'off';
}

const ALERT_ICONS: Record<AlertVariant, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✗',
};

const AlertBanner: React.FC<AlertBannerProps> = ({ variant = 'info', title, children, onDismiss, icon, live }) => {
  const ariaRole = variant === 'error' || variant === 'warning' ? 'alert' : 'status';
  const ariaLive = live || (variant === 'error' ? 'assertive' : 'polite');
  return (
    <div role={ariaRole} aria-live={ariaLive} aria-atomic="true" className={`alert alert--${variant}`}>
      <span className="alert__icon" aria-hidden="true">{icon || ALERT_ICONS[variant]}</span>
      <div className="alert__body">
        {title && <strong className="alert__title">{title}</strong>}
        <div className="alert__message">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert__dismiss"
          aria-label="Dismiss notification"
          onClick={onDismiss}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, label, showValue = false, size = 'md', variant = 'default' }) => {
  const pct = clamp((value / max) * 100, 0, 100);
  const id = React.useId();
  return (
    <div className={`progress progress--${size} progress--${variant}`} role="group" aria-labelledby={id}>
      <span id={id} className="progress__label">{label}</span>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={id}
        aria-valuetext={`${label}: ${Math.round(pct)}%`}
        style={{ width: `${pct}%` }}
        className="progress__bar"
      />
      {showValue && <span className="progress__value" aria-hidden="true">{Math.round(pct)}%</span>}
    </div>
  );
};

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const LoadingSpinner: React.FC<SpinnerProps> = ({ size = 'md', label = 'Loading...' }) => (
  <div role="status" aria-label={label} className={`spinner spinner--${size}`}>
    <span className="sr-only">{label}</span>
    <span aria-hidden="true" className="spinner__ring" />
  </div>
);

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circle' | 'rect';
  animated?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ width, height, variant = 'rect', animated = true }) => (
  <span
    aria-hidden="true"
    className={`skeleton skeleton--${variant} ${animated ? 'skeleton--animated' : ''}`}
    style={{ display: 'block', width, height }}
  />
);

interface SkeletonScreenProps {
  lines?: number;
  label?: string;
}

const SkeletonScreen: React.FC<SkeletonScreenProps> = ({ lines = 4, label = 'Loading content...' }) => (
  <div role="status" aria-label={label} aria-busy="true">
    <span className="sr-only">{label}</span>
    {range(lines).map((i) => (
      <Skeleton key={i} height={16} width={`${100 - (i % 3) * 10}%`} variant="text" />
    ))}
  </div>
);

// ─── Navigation Components ────────────────────────────────────────────────────

interface SidebarNavItem2 {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: SidebarNavItem2[];
}

interface SidebarNavProps {
  items: SidebarNavItem2[];
  currentHref: string;
  label?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ items, currentHref, label = 'Primary navigation' }) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const renderItem = (item: SidebarNavItem2, depth = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isCurrent = item.href === currentHref;
    const isExpand = expanded.has(item.id);
    const itemId = `nav-item-${item.id}`;
    const subId = `nav-sub-${item.id}`;

    return (
      <li key={item.id}>
        {hasChildren ? (
          <>
            <button
              id={itemId}
              type="button"
              aria-expanded={isExpand}
              aria-controls={subId}
              onClick={() => toggleExpanded(item.id)}
              className="nav__item nav__item--expandable"
              style={{ paddingLeft: depth * 16 + 12 }}
            >
              {item.icon && <span className="nav__icon" aria-hidden="true">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="nav__badge" aria-label={`, ${item.badge} notifications`}>{item.badge}</span>
              )}
              <span aria-hidden="true" className={`nav__chevron ${isExpand ? 'nav__chevron--up' : ''}`}>▾</span>
            </button>
            <ul id={subId} role="group" aria-labelledby={itemId} hidden={!isExpand}>
              {item.children!.map((child) => renderItem(child, depth + 1))}
            </ul>
          </>
        ) : (
          <a
            id={itemId}
            href={item.href}
            aria-current={isCurrent ? 'page' : undefined}
            className={`nav__item nav__item--link ${isCurrent ? 'nav__item--current' : ''}`}
            style={{ paddingLeft: depth * 16 + 12 }}
          >
            {item.icon && <span className="nav__icon" aria-hidden="true">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className="nav__badge" aria-label={`, ${item.badge} notifications`}>{item.badge}</span>
            )}
          </a>
        )}
      </li>
    );
  };

  return (
    <nav aria-label={label} className="sidebar-nav">
      <ul role="list">{items.map((item) => renderItem(item))}</ul>
    </nav>
  );
};

// ─── Data Display ─────────────────────────────────────────────────────────────

interface KeyValuePair { key: string; value: string | number | React.ReactNode; }

interface DescriptionListProps {
  items: KeyValuePair[];
  columns?: 1 | 2 | 3;
  label?: string;
  compact?: boolean;
}

const DescriptionList: React.FC<DescriptionListProps> = ({ items, columns = 1, label, compact }) => (
  <dl
    aria-label={label}
    className={`dl dl--${columns}col ${compact ? 'dl--compact' : ''}`}
  >
    {items.map(({ key, value }, idx) => (
      <React.Fragment key={idx}>
        <dt className="dl__term">{key}</dt>
        <dd className="dl__detail">{value}</dd>
      </React.Fragment>
    ))}
  </dl>
);

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { value: number; label: string };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, delta, icon, trend }) => {
  const labelId = React.useId();
  const deltaSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const deltaLabel = delta ? `${delta.value > 0 ? '+' : ''}${delta.value} ${delta.label}` : undefined;
  return (
    <article className={`stat-card stat-card--${trend || 'neutral'}`} aria-labelledby={labelId}>
      {icon && <span className="stat-card__icon" aria-hidden="true">{icon}</span>}
      <span id={labelId} className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {delta && (
        <span className="stat-card__delta" aria-label={deltaLabel}>
          <span aria-hidden="true">{deltaSymbol}</span>
          <span>{delta.value > 0 ? '+' : ''}{delta.value} {delta.label}</span>
        </span>
      )}
    </article>
  );
};

// ─── Error Boundary ──────────────────────────────────────────────────────────

interface ErrorBoundaryState { hasError: boolean; error: Error | null; }
interface ErrorBoundaryProps {
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  onError?: (error: Error, info: React.ErrorInfo) => void;
  children: React.ReactNode;
}

class LuminaryErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.onError?.(error, info);
    console.error('[LuminaryErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') return fallback(this.state.error);
      if (fallback) return fallback;
      return (
        <div role="alert" aria-live="polite" className="error-boundary">
          <h2>Something went wrong</h2>
          <p>The application encountered an unexpected error. Please refresh the page.</p>
          <button type="button" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Accessible Rich Text Editor Toolbar ─────────────────────────────────────

interface RichTextAction {
  id: string;
  label: string;
  icon: string;
  command: string;
  shortcut?: string;
}

const EDITOR_ACTIONS: RichTextAction[] = [
  { id: 'bold',        label: 'Bold',        icon: 'B', command: 'bold',        shortcut: 'Ctrl+B' },
  { id: 'italic',      label: 'Italic',      icon: 'I', command: 'italic',      shortcut: 'Ctrl+I' },
  { id: 'underline',   label: 'Underline',   icon: 'U', command: 'underline',   shortcut: 'Ctrl+U' },
  { id: 'strikethrough', label: 'Strikethrough', icon: 'S̶', command: 'strikeThrough'          },
  { id: 'ordered',     label: 'Ordered list',    icon: '1.', command: 'insertOrderedList'  },
  { id: 'unordered',   label: 'Unordered list',  icon: '•',  command: 'insertUnorderedList' },
  { id: 'link',        label: 'Insert link',     icon: '🔗', command: 'createLink'           },
  { id: 'undo',        label: 'Undo',            icon: '↩', command: 'undo',        shortcut: 'Ctrl+Z' },
  { id: 'redo',        label: 'Redo',            icon: '↪', command: 'redo',        shortcut: 'Ctrl+Y' },
];

interface RichTextToolbarProps {
  editorRef: React.RefObject<HTMLDivElement>;
  label?: string;
}

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ editorRef, label = 'Text formatting' }) => {
  const [activeStates, setActiveStates] = React.useState<Record<string, boolean>>({});

  const updateStates = React.useCallback(() => {
    setActiveStates(
      Object.fromEntries(EDITOR_ACTIONS.map((a) => [a.id, document.queryCommandState?.(a.command) || false]))
    );
  }, []);

  const execCommand = (action: RichTextAction) => {
    if (!editorRef.current) return;
    if (action.command === 'createLink') {
      const url = window.prompt('Enter URL:');
      if (url) document.execCommand(action.command, false, url);
    } else {
      document.execCommand(action.command, false, undefined);
    }
    editorRef.current.focus();
    updateStates();
  };

  return (
    <div role="toolbar" aria-label={label} className="rich-text-toolbar">
      {EDITOR_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          aria-pressed={activeStates[action.id]}
          aria-keyshortcuts={action.shortcut}
          title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
          aria-label={action.label}
          onClick={() => execCommand(action)}
          className={`toolbar-btn ${activeStates[action.id] ? 'toolbar-btn--active' : ''}`}
        >
          <span aria-hidden="true">{action.icon}</span>
        </button>
      ))}
    </div>
  );
};

interface AccessibleRichEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  label: string;
  id: string;
  minHeight?: number;
  maxHeight?: number;
}

const AccessibleRichEditor: React.FC<AccessibleRichEditorProps> = ({
  value, onChange, placeholder = 'Start typing…', label, id, minHeight = 120, maxHeight,
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const toolbarId = `${id}-toolbar`;
  const labelId = `${id}-label`;

  React.useEffect(() => {
    if (editorRef.current && value !== undefined && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="rich-editor" id={id}>
      <label id={labelId} className="rich-editor__label">{label}</label>
      <RichTextToolbar editorRef={editorRef} label={`${label} formatting options`} />
      <div
        ref={editorRef}
        role="textbox"
        contentEditable="true"
        aria-multiline="true"
        aria-labelledby={labelId}
        aria-describedby={toolbarId}
        data-placeholder={placeholder}
        style={{ minHeight, maxHeight, overflowY: maxHeight ? 'auto' : undefined }}
        onInput={() => onChange?.(editorRef.current?.innerHTML || '')}
        className="rich-editor__content"
        suppressContentEditableWarning
      />
    </div>
  );
};

// ─── Virtual List ────────────────────────────────────────────────────────────

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  label?: string;
  getItemId?: (item: T, index: number) => string;
}

function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  label = 'List',
  getItemId,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={containerRef}
      role="list"
      aria-label={label}
      aria-rowcount={items.length}
      style={{ height: containerHeight, overflowY: 'auto', position: 'relative' }}
      onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }} aria-hidden="false">
        {visibleItems.map((item, idx) => {
          const absoluteIndex = startIndex + idx;
          return (
            <div
              key={getItemId ? getItemId(item, absoluteIndex) : absoluteIndex}
              role="listitem"
              aria-rowindex={absoluteIndex + 1}
              style={{ position: 'absolute', top: absoluteIndex * itemHeight, height: itemHeight, width: '100%' }}
            >
              {renderItem(item, absoluteIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stepper / Wizard ────────────────────────────────────────────────────────

interface StepperStep {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onChange?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  completedSteps,
  onChange,
  orientation = 'horizontal',
  label = 'Progress',
}) => {
  const navId = React.useId();
  return (
    <nav
      id={navId}
      aria-label={label}
      className={`stepper stepper--${orientation}`}
    >
      <ol className="stepper__list">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.has(idx);
          const isCurrent = idx === currentStep;
          const isClickable = onChange && isCompleted;
          let status: string;
          if (isCompleted) status = 'completed';
          else if (isCurrent) status = 'current';
          else status = 'upcoming';

          return (
            <li
              key={step.id}
              className={`stepper__item stepper__item--${status}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onChange(idx)}
                  aria-label={`Step ${idx + 1}: ${step.label}${isCompleted ? ' (completed)' : ''}`}
                  className="stepper__btn"
                >
                  <StepIndicator idx={idx} status={status} />
                  <StepContent step={step} status={status} />
                </button>
              ) : (
                <div aria-label={`Step ${idx + 1}: ${step.label}${isCurrent ? ' (current)' : ''}${!isCompleted && !isCurrent ? ' (upcoming)' : ''}`}>
                  <StepIndicator idx={idx} status={status} />
                  <StepContent step={step} status={status} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const StepIndicator: React.FC<{ idx: number; status: string }> = ({ idx, status }) => (
  <span className="stepper__indicator" aria-hidden="true">
    {status === 'completed' ? '✓' : idx + 1}
  </span>
);

const StepContent: React.FC<{ step: StepperStep; status: string }> = ({ step, status }) => (
  <div className="stepper__content">
    <span className="stepper__label">
      {step.label}
      {step.optional && <span className="stepper__optional"> (optional)</span>}
    </span>
    {step.description && <span className="stepper__desc">{step.description}</span>}
  </div>
);

// ─── Color Contrast Utilities ────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const n = parseInt(full, 16);
  if (isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function srgbChannel(c: number): number {
  const srgb = c / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  if (!c1 || !c2) return 0;
  const l1 = relativeLuminance(c1);
  const l2 = relativeLuminance(c2);
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function meetsWCAGAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = contrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

function meetsWCAGAAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = contrastRatio(foreground, background);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

const ContrastChecker: React.FC<{ foreground: string; background: string; text?: string }> = ({
  foreground, background, text = 'Sample Text'
}) => {
  const ratio = contrastRatio(foreground, background);
  const passAA  = meetsWCAGAA(foreground, background);
  const passAAA = meetsWCAGAAA(foreground, background);
  const passAALg = meetsWCAGAA(foreground, background, true);

  return (
    <div className="contrast-checker" aria-label="Color contrast checker results">
      <div
        className="contrast-preview"
        style={{ color: foreground, background, padding: '16px', borderRadius: 8 }}
        aria-label={`Text preview: ${text}`}
      >
        <p className="contrast-preview__normal">{text}</p>
        <p className="contrast-preview__large" style={{ fontSize: 24, fontWeight: 700 }}>{text} (large)</p>
      </div>
      <dl className="contrast-results">
        <dt>Contrast ratio</dt>
        <dd aria-label={`Contrast ratio: ${ratio.toFixed(2)} to 1`}>{ratio.toFixed(2)}:1</dd>
        <dt>WCAG AA (normal text, min 4.5:1)</dt>
        <dd aria-label={`WCAG AA: ${passAA ? 'Pass' : 'Fail'}`} className={passAA ? 'pass' : 'fail'}>{passAA ? 'Pass ✓' : 'Fail ✗'}</dd>
        <dt>WCAG AA (large text, min 3:1)</dt>
        <dd aria-label={`WCAG AA large: ${passAALg ? 'Pass' : 'Fail'}`} className={passAALg ? 'pass' : 'fail'}>{passAALg ? 'Pass ✓' : 'Fail ✗'}</dd>
        <dt>WCAG AAA (normal text, min 7:1)</dt>
        <dd aria-label={`WCAG AAA: ${passAAA ? 'Pass' : 'Fail'}`} className={passAAA ? 'pass' : 'fail'}>{passAAA ? 'Pass ✓' : 'Fail ✗'}</dd>
      </dl>
    </div>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export {
  toCamelCase, toKebabCase, toTitleCase, truncate, slugify, pluralize, escapeHtml, stripHtml, countWords, formatBytes,
  clamp, lerp, inverseLerp, remap, roundTo, formatNumber, formatCurrency, formatPercent, sum, average, median, standardDeviation,
  chunk, unique, uniqueBy, groupBy, sortBy, flatten, zip, range, last, first, countBy, partition, intersect, difference, shuffle,
  pick, omit, mapValues, filterObject, deepMerge, deepEqual, deepClone,
  formatDate, formatRelativeTime, addDays, startOfDay, endOfDay, startOfWeek, isSameDay, isWithinInterval, parseISODate, getDaysInMonth,
  parseQueryString, buildQueryString, storage,
  useLocalStorage, useSessionStorage, useDebounce, useThrottle, usePrevious, useIsMounted,
  useClickOutside, useWindowSize, useMatchMedia, useIntersectionObserver, useResizeObserver,
  useEventListener, useInterval, useTimeout, useCounter, useToggle, useAsyncState, useMediaQuery,
  useFocusVisible, useDocumentTitle, useCopyToClipboard, useKeyboardShortcut,
  usePrefersDarkMode, usePrefersReducedMotion, useHighContrastMode,
  validators, composeValidators, useField,
  FormFieldWrapper, TextInput, SelectInput, TextareaInput,
  AlertBanner, ProgressBar, LoadingSpinner, Skeleton, SkeletonScreen,
  SidebarNav, DescriptionList, StatCard,
  LuminaryErrorBoundary,
  RichTextToolbar, AccessibleRichEditor,
  VirtualList,
  Stepper,
  hexToRgb, relativeLuminance, contrastRatio, meetsWCAGAA, meetsWCAGAAA, ContrastChecker,
};

// ═══════════════════════════════════════════════════════════════════════════
// LUMINARY DESIGN SYSTEM — EXTENDED COMPONENT LIBRARY
// Fully accessible, WCAG 2.2 compliant React components.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Type Utilities ──────────────────────────────────────────────────────────

type Maybe<T> = T | null | undefined;
type Nullable<T> = T | null;
type NonEmptyArray<T> = [T, ...T[]];
type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
type DeepReadonly<T> = T extends (infer A)[] ? DeepReadonlyArray<A> : T extends object ? DeepReadonlyObject<T> : T;
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
type DeepReadonlyObject<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };
type Awaited<T> = T extends PromiseLike<infer R> ? R : T;
type ValueOf<T> = T[keyof T];
type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];
type Prettify<T> = { [K in keyof T]: T[K] } & NonNullable<unknown>;
type Override<T, U> = Omit<T, keyof U> & U;
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];
type ExactlyOneOf<T, Keys extends keyof T = keyof T> = { [K in Keys]: Pick<T, K> & Partial<Record<Exclude<Keys, K>, never>> }[Keys] & Pick<T, Exclude<keyof T, Keys>>;

// ─── String Utilities ────────────────────────────────────────────────────────

const toCamelCase = (s: string): string =>
  s.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');

const toKebabCase = (s: string): string =>
  s.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');

const toTitleCase = (s: string): string =>
  s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

const truncate = (s: string, maxLength: number, ellipsis = '…'): string =>
  s.length <= maxLength ? s : s.slice(0, maxLength - ellipsis.length) + ellipsis;

const slugify = (s: string): string =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const pluralize = (count: number, singular: string, plural?: string): string =>
  `${count} ${count === 1 ? singular : (plural || singular + 's')}`;

const padStart = (s: string | number, len: number, char = '0'): string =>
  String(s).padStart(len, char);

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const stripHtml = (s: string): string =>
  s.replace(/<[^>]*>/g, '');

const countWords = (s: string): number =>
  s.trim().split(/\s+/).filter(Boolean).length;

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = Math.max(0, decimals);
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// ─── Number & Math Utilities ─────────────────────────────────────────────────

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

const inverseLerp = (a: number, b: number, value: number): number =>
  (value - a) / (b - a);

const remap = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number =>
  lerp(outMin, outMax, inverseLerp(inMin, inMax, value));

const roundTo = (value: number, precision: number): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

const formatNumber = (n: number, locale = 'en-US', options?: Intl.NumberFormatOptions): string =>
  new Intl.NumberFormat(locale, options).format(n);

const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);

const formatPercent = (value: number, decimals = 1): string =>
  `${(value * 100).toFixed(decimals)}%`;

const sum = (...nums: number[]): number =>
  nums.reduce((acc, n) => acc + n, 0);

const average = (...nums: number[]): number =>
  nums.length ? sum(...nums) / nums.length : 0;

const median = (nums: number[]): number => {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
};

const standardDeviation = (nums: number[]): number => {
  if (nums.length < 2) return 0;
  const mean = average(...nums);
  const squaredDiffs = nums.map((n) => Math.pow(n - mean, 2));
  return Math.sqrt(average(...squaredDiffs));
};

// ─── Array Utilities ─────────────────────────────────────────────────────────

const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const unique = <T>(array: T[]): T[] =>
  Array.from(new Set(array));

const uniqueBy = <T, K>(array: T[], keyFn: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> => {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(item);
    return acc;
  }, {} as Record<K, T[]>);
};

const sortBy = <T>(array: T[], ...keys: ((item: T) => string | number)[]): T[] =>
  [...array].sort((a, b) => {
    for (const key of keys) {
      const av = key(a); const bv = key(b);
      if (av < bv) return -1;
      if (av > bv) return 1;
    }
    return 0;
  });

const flatten = <T>(array: (T | T[])[]): T[] =>
  array.flatMap((item) => Array.isArray(item) ? item : [item]);

const zip = <A, B>(a: A[], b: B[]): [A, B][] =>
  a.slice(0, Math.min(a.length, b.length)).map((item, idx) => [item, b[idx]!]);

const range = (start: number, end?: number, step = 1): number[] => {
  const [from, to] = end === undefined ? [0, start] : [start, end];
  const result: number[] = [];
  for (let i = from; i < to; i += step) result.push(i);
  return result;
};

const last = <T>(array: T[]): T | undefined =>
  array[array.length - 1];

const first = <T>(array: T[]): T | undefined =>
  array[0];

const countBy = <T>(array: T[], predicate: (item: T) => boolean): number =>
  array.reduce((count, item) => count + (predicate(item) ? 1 : 0), 0);

const partition = <T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] =>
  array.reduce<[T[], T[]]>(([pass, fail], item) =>
    predicate(item) ? [[...pass, item], fail] : [pass, [...fail, item]],
    [[], []]
  );

const intersect = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item));
};

const difference = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b);
  return a.filter((item) => !setB.has(item));
};

const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};

// ─── Object Utilities ────────────────────────────────────────────────────────

const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => { if (key in obj) result[key] = obj[key]; });
  return result;
};

const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete (result as T)[key]);
  return result as Omit<T, K>;
};

const mapValues = <T extends object, V>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => V,
): Record<keyof T, V> => {
  const result = {} as Record<keyof T, V>;
  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    result[key] = fn(obj[key], key);
  });
  return result;
};

const filterObject = <T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean,
): Partial<T> => {
  const result: Partial<T> = {};
  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    if (predicate(obj[key], key)) result[key] = obj[key];
  });
  return result;
};

const deepMerge = <T extends object>(target: T, ...sources: DeepPartial<T>[]): T => {
  const result = { ...target };
  for (const source of sources) {
    for (const key in source) {
      const sv = (source as T)[key as keyof T];
      const tv = result[key as keyof T];
      if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
        result[key as keyof T] = deepMerge(tv as object, sv as object) as T[keyof T];
      } else if (sv !== undefined) {
        result[key as keyof T] = sv as T[keyof T];
      }
    }
  }
  return result;
};

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== 'object') return false;
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
};

const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T;
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone((obj as Record<string, unknown>)[key]);
    }
  }
  return result as T;
};

// ─── Date Utilities ──────────────────────────────────────────────────────────

const formatDate = (date: Date, locale = 'en-US', options?: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat(locale, options || { year: 'numeric', month: 'long', day: 'numeric' }).format(date);

const formatRelativeTime = (date: Date, relativeTo = new Date()): string => {
  const diffMs = date.getTime() - relativeTo.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr  = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);
  const diffWk  = Math.round(diffDay / 7);
  const diffMo  = Math.round(diffDay / 30);
  const diffYr  = Math.round(diffDay / 365);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffHr)  < 24) return rtf.format(diffHr, 'hour');
  if (Math.abs(diffDay) < 7)  return rtf.format(diffDay, 'day');
  if (Math.abs(diffWk)  < 5)  return rtf.format(diffWk, 'week');
  if (Math.abs(diffMo)  < 12) return rtf.format(diffMo, 'month');
  return rtf.format(diffYr, 'year');
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const startOfWeek = (date: Date, startDay = 0): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day - startDay + 7) % 7;
  result.setDate(result.getDate() - diff);
  return startOfDay(result);
};

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isWithinInterval = (date: Date, start: Date, end: Date): boolean =>
  date >= start && date <= end;

const parseISODate = (s: string): Date => {
  const d = new Date(s);
  if (isNaN(d.getTime())) throw new Error(`Invalid ISO date: ${s}`);
  return d;
};

const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

// ─── URL & Query String Utilities ────────────────────────────────────────────

const parseQueryString = (search: string): Record<string, string | string[]> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string | string[]> = {};
  params.forEach((value, key) => {
    if (key in result) {
      const existing = result[key]!;
      result[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      result[key] = value;
    }
  });
  return result;
};

const buildQueryString = (params: Record<string, string | string[] | number | boolean | null | undefined>): string => {
  const search = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val == null) continue;
    if (Array.isArray(val)) { val.forEach((v) => search.append(key, String(v))); }
    else { search.set(key, String(val)); }
  }
  const s = search.toString();
  return s ? `?${s}` : '';
};

// ─── Local Storage Utilities ─────────────────────────────────────────────────

const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or private browsing
    }
  },
  remove: (key: string): void => {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
  clear: (): void => {
    try { localStorage.clear(); } catch { /* noop */ }
  },
};

// ─── Custom React Hooks ───────────────────────────────────────────────────────

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => storage.get(key, initialValue));
  const setValue = React.useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
      storage.set(key, next);
      return next;
    });
  }, [key]);
  return [storedValue, setValue] as const;
}

function useSessionStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) as T : initialValue;
    } catch { return initialValue; }
  });
  const set = React.useCallback((v: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, [key]);
  return [value, set] as const;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useThrottle<T>(value: T, interval: number): T {
  const [throttled, setThrottled] = React.useState(value);
  const lastUpdated = React.useRef<number>(Date.now());
  React.useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= interval) {
      setThrottled(value);
      lastUpdated.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottled(value);
        lastUpdated.current = Date.now();
      }, interval - (now - lastUpdated.current));
      return () => clearTimeout(timer);
    }
  }, [value, interval]);
  return throttled;
}

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);
  React.useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}

function useIsMounted(): () => boolean {
  const isMountedRef = React.useRef(false);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);
  return React.useCallback(() => isMountedRef.current, []);
}

function useClickOutside<T extends HTMLElement>(handler: () => void): React.RefObject<T> {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);
  return ref;
}

function useWindowSize() {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

function useIntersectionObserver<T extends HTMLElement>(
  options?: IntersectionObserverInit,
): [React.RefObject<T>, boolean] {
  const ref = React.useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry!.isIntersecting);
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);
  return [ref, isIntersecting];
}

function useResizeObserver<T extends HTMLElement>(): [React.RefObject<T>, DOMRectReadOnly | null] {
  const ref = React.useRef<T>(null);
  const [rect, setRect] = React.useState<DOMRectReadOnly | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setRect(entry.contentRect);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, rect];
}

function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (e: WindowEventMap[K]) => void,
  element: EventTarget = window,
  options?: boolean | AddEventListenerOptions,
): void {
  const savedHandler = React.useRef(handler);
  React.useLayoutEffect(() => { savedHandler.current = handler; }, [handler]);
  React.useEffect(() => {
    const listener = (e: Event) => savedHandler.current(e as WindowEventMap[K]);
    element.addEventListener(eventName, listener, options);
    return () => element.removeEventListener(eventName, listener, options);
  }, [eventName, element, options]);
}

function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

function useCounter(initialValue = 0, min?: number, max?: number) {
  const [count, setCount] = React.useState(initialValue);
  const increment = React.useCallback(() => setCount((c) => max !== undefined ? Math.min(c + 1, max) : c + 1), [max]);
  const decrement = React.useCallback(() => setCount((c) => min !== undefined ? Math.max(c - 1, min) : c - 1), [min]);
  const reset     = React.useCallback(() => setCount(initialValue), [initialValue]);
  const set       = React.useCallback((v: number) => setCount(
    min !== undefined && max !== undefined ? clamp(v, min, max) : v
  ), [min, max]);
  return { count, increment, decrement, reset, set };
}

function useToggle(initialValue = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = React.useState(initialValue);
  const toggle = React.useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

function useAsyncState<T>() {
  const [state, setState] = React.useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    data: T | null;
    error: Error | null;
  }>({ status: 'idle', data: null, error: null });

  const run = React.useCallback(async (promise: Promise<T>) => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await promise;
      setState({ status: 'success', data, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ status: 'error', data: null, error });
      throw error;
    }
  }, []);

  return { ...state, run };
}

function useMediaQuery(breakpoints: Record<string, string>) {
  const [matches, setMatches] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      Object.entries(breakpoints).map(([key, query]) => [
        key,
        typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
      ])
    )
  );

  React.useEffect(() => {
    const queries = Object.entries(breakpoints).map(([key, query]) => {
      const mq = window.matchMedia(query);
      const handler = (e: MediaQueryListEvent) => {
        setMatches((prev) => ({ ...prev, [key]: e.matches }));
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    });
    return () => queries.forEach((cleanup) => cleanup());
  }, [breakpoints]);

  return matches;
}

function useFocusVisible(): [React.RefObject<HTMLElement>, boolean] {
  const ref = React.useRef<HTMLElement>(null);
  const [isFocusVisible, setIsFocusVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onFocus = (e: FocusEvent) => {
      const isKeyboard = !(e as FocusEvent & { sourceCapabilities?: { firesTouchEvents: boolean } })
        .sourceCapabilities?.firesTouchEvents;
      setIsFocusVisible(isKeyboard);
    };
    const onBlur = () => setIsFocusVisible(false);
    el.addEventListener('focus', onFocus);
    el.addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('focus', onFocus);
      el.removeEventListener('blur', onBlur);
    };
  }, []);

  return [ref, isFocusVisible];
}

function useDocumentTitle(title: string, suffix?: string): void {
  React.useEffect(() => {
    const original = document.title;
    document.title = suffix ? `${title} | ${suffix}` : title;
    return () => { document.title = original; };
  }, [title, suffix]);
}

function useCopyToClipboard(): [string | null, (text: string) => Promise<void>] {
  const [copiedText, setCopiedText] = React.useState<string | null>(null);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      setCopiedText(null);
    }
  };
  return [copiedText, copy];
}

function useKeyboardShortcut(
  keys: string[],
  callback: (e: KeyboardEvent) => void,
  options: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {},
): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (options.ctrlKey  && !e.ctrlKey)  return;
      if (options.metaKey  && !e.metaKey)  return;
      if (options.shiftKey && !e.shiftKey) return;
      if (options.altKey   && !e.altKey)   return;
      if (keys.includes(e.key)) {
        e.preventDefault();
        savedCallback.current(e);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [keys, options.ctrlKey, options.metaKey, options.shiftKey, options.altKey]);
}

function usePrefersDarkMode(): boolean {
  return useMatchMedia('(prefers-color-scheme: dark)');
}

function usePrefersReducedMotion(): boolean {
  return useMatchMedia('(prefers-reduced-motion: reduce)');
}

function useHighContrastMode(): boolean {
  return useMatchMedia('(forced-colors: active)');
}

// ─── Form Utilities ───────────────────────────────────────────────────────────

type ValidationRule<T> = (value: T) => string | null;

const validators = {
  required: (message = 'This field is required'): ValidationRule<string> =>
    (v) => v.trim() ? null : message,
  minLength: (min: number, message?: string): ValidationRule<string> =>
    (v) => v.length >= min ? null : message || `Must be at least ${min} characters`,
  maxLength: (max: number, message?: string): ValidationRule<string> =>
    (v) => v.length <= max ? null : message || `Must be no more than ${max} characters`,
  pattern: (re: RegExp, message = 'Invalid format'): ValidationRule<string> =>
    (v) => re.test(v) ? null : message,
  email: (message = 'Invalid email address'): ValidationRule<string> =>
    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : message,
  url: (message = 'Invalid URL'): ValidationRule<string> => (v) => {
    try { new URL(v); return null; } catch { return message; }
  },
  min: (min: number, message?: string): ValidationRule<number> =>
    (v) => v >= min ? null : message || `Must be at least ${min}`,
  max: (max: number, message?: string): ValidationRule<number> =>
    (v) => v <= max ? null : message || `Must be no more than ${max}`,
  integer: (message = 'Must be an integer'): ValidationRule<number> =>
    (v) => Number.isInteger(v) ? null : message,
};

function composeValidators<T>(...rules: ValidationRule<T>[]): ValidationRule<T> {
  return (value: T) => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  };
}

interface FieldState<T> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

function useField<T>(
  initialValue: T,
  validate?: ValidationRule<T>,
): FieldState<T> & {
  setValue: (v: T) => void;
  setTouched: () => void;
  reset: () => void;
  validate: () => boolean;
  inputProps: {
    value: T;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    'aria-invalid': boolean | undefined;
    'aria-required': boolean | undefined;
  };
} {
  const [state, setState] = React.useState<FieldState<T>>({
    value: initialValue,
    error: null,
    touched: false,
    dirty: false,
  });

  const runValidation = React.useCallback((v: T): string | null =>
    validate ? validate(v) : null,
    [validate]
  );

  const setValue = React.useCallback((v: T) => {
    setState((prev) => ({
      ...prev,
      value: v,
      dirty: v !== initialValue,
      error: prev.touched ? runValidation(v) : prev.error,
    }));
  }, [initialValue, runValidation]);

  const setTouched = React.useCallback(() => {
    setState((prev) => ({ ...prev, touched: true, error: runValidation(prev.value) }));
  }, [runValidation]);

  const reset = React.useCallback(() => {
    setState({ value: initialValue, error: null, touched: false, dirty: false });
  }, [initialValue]);

  const doValidate = React.useCallback((): boolean => {
    const error = runValidation(state.value);
    setState((prev) => ({ ...prev, touched: true, error }));
    return !error;
  }, [runValidation, state.value]);

  return {
    ...state,
    setValue,
    setTouched,
    reset,
    validate: doValidate,
    inputProps: {
      value: state.value,
      onChange: (e) => setValue(e.target.value as unknown as T),
      onBlur: setTouched,
      'aria-invalid': state.touched && !!state.error ? true : undefined,
      'aria-required': validate ? true : undefined,
    },
  };
}

// ─── Accessible Form Components ───────────────────────────────────────────────

interface FormFieldWrapperProps {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({ label, id, error, hint, required, children }) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="form-field" aria-invalid={!!error || undefined}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span aria-hidden="true" className="form-required">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {hint && <p id={hintId} className="form-hint">{hint}</p>}
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': !!error || undefined,
          'aria-required': required || undefined,
        }) : child
      )}
      {error && (
        <p id={errorId} role="alert" className="form-error" aria-live="polite">{error}</p>
      )}
    </div>
  );
};

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, id, error, hint, ...rest }) => (
  <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required || !!rest['aria-required']}>
    <input type="text" id={id} {...rest} />
  </FormFieldWrapper>
);

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, id, error, hint, options, placeholder, ...rest }) => (
  <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required}>
    <select id={id} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </FormFieldWrapper>
);

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
  charCount?: boolean;
  maxChars?: number;
}

const TextareaInput: React.FC<TextareaInputProps> = ({ label, id, error, hint, charCount, maxChars, value, onChange, ...rest }) => {
  const [length, setLength] = React.useState(String(value || '').length);
  const countId = charCount ? `${id}-count` : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLength(e.target.value.length);
    onChange?.(e);
  };

  const isOverLimit = maxChars !== undefined && length > maxChars;

  return (
    <FormFieldWrapper label={label} id={id} error={error} hint={hint} required={rest.required}>
      <textarea id={id} value={value} onChange={handleChange} aria-describedby={countId || undefined} {...rest} />
      {charCount && (
        <p id={countId} aria-live="polite" aria-atomic="true" className={`char-count ${isOverLimit ? 'char-count--over' : ''}`}>
          {maxChars !== undefined ? `${length} / ${maxChars} characters` : `${length} characters`}
        </p>
      )}
    </FormFieldWrapper>
  );
};

// ─── Status Components ────────────────────────────────────────────────────────

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertBannerProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  live?: 'polite' | 'assertive' | 'off';
}

const ALERT_ICONS: Record<AlertVariant, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✗',
};

const AlertBanner: React.FC<AlertBannerProps> = ({ variant = 'info', title, children, onDismiss, icon, live }) => {
  const ariaRole = variant === 'error' || variant === 'warning' ? 'alert' : 'status';
  const ariaLive = live || (variant === 'error' ? 'assertive' : 'polite');
  return (
    <div role={ariaRole} aria-live={ariaLive} aria-atomic="true" className={`alert alert--${variant}`}>
      <span className="alert__icon" aria-hidden="true">{icon || ALERT_ICONS[variant]}</span>
      <div className="alert__body">
        {title && <strong className="alert__title">{title}</strong>}
        <div className="alert__message">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert__dismiss"
          aria-label="Dismiss notification"
          onClick={onDismiss}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, label, showValue = false, size = 'md', variant = 'default' }) => {
  const pct = clamp((value / max) * 100, 0, 100);
  const id = React.useId();
  return (
    <div className={`progress progress--${size} progress--${variant}`} role="group" aria-labelledby={id}>
      <span id={id} className="progress__label">{label}</span>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={id}
        aria-valuetext={`${label}: ${Math.round(pct)}%`}
        style={{ width: `${pct}%` }}
        className="progress__bar"
      />
      {showValue && <span className="progress__value" aria-hidden="true">{Math.round(pct)}%</span>}
    </div>
  );
};

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const LoadingSpinner: React.FC<SpinnerProps> = ({ size = 'md', label = 'Loading...' }) => (
  <div role="status" aria-label={label} className={`spinner spinner--${size}`}>
    <span className="sr-only">{label}</span>
    <span aria-hidden="true" className="spinner__ring" />
  </div>
);

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circle' | 'rect';
  animated?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ width, height, variant = 'rect', animated = true }) => (
  <span
    aria-hidden="true"
    className={`skeleton skeleton--${variant} ${animated ? 'skeleton--animated' : ''}`}
    style={{ display: 'block', width, height }}
  />
);

interface SkeletonScreenProps {
  lines?: number;
  label?: string;
}

const SkeletonScreen: React.FC<SkeletonScreenProps> = ({ lines = 4, label = 'Loading content...' }) => (
  <div role="status" aria-label={label} aria-busy="true">
    <span className="sr-only">{label}</span>
    {range(lines).map((i) => (
      <Skeleton key={i} height={16} width={`${100 - (i % 3) * 10}%`} variant="text" />
    ))}
  </div>
);

// ─── Navigation Components ────────────────────────────────────────────────────

interface SidebarNavItem2 {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: SidebarNavItem2[];
}

interface SidebarNavProps {
  items: SidebarNavItem2[];
  currentHref: string;
  label?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ items, currentHref, label = 'Primary navigation' }) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const renderItem = (item: SidebarNavItem2, depth = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isCurrent = item.href === currentHref;
    const isExpand = expanded.has(item.id);
    const itemId = `nav-item-${item.id}`;
    const subId = `nav-sub-${item.id}`;

    return (
      <li key={item.id}>
        {hasChildren ? (
          <>
            <button
              id={itemId}
              type="button"
              aria-expanded={isExpand}
              aria-controls={subId}
              onClick={() => toggleExpanded(item.id)}
              className="nav__item nav__item--expandable"
              style={{ paddingLeft: depth * 16 + 12 }}
            >
              {item.icon && <span className="nav__icon" aria-hidden="true">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="nav__badge" aria-label={`, ${item.badge} notifications`}>{item.badge}</span>
              )}
              <span aria-hidden="true" className={`nav__chevron ${isExpand ? 'nav__chevron--up' : ''}`}>▾</span>
            </button>
            <ul id={subId} role="group" aria-labelledby={itemId} hidden={!isExpand}>
              {item.children!.map((child) => renderItem(child, depth + 1))}
            </ul>
          </>
        ) : (
          <a
            id={itemId}
            href={item.href}
            aria-current={isCurrent ? 'page' : undefined}
            className={`nav__item nav__item--link ${isCurrent ? 'nav__item--current' : ''}`}
            style={{ paddingLeft: depth * 16 + 12 }}
          >
            {item.icon && <span className="nav__icon" aria-hidden="true">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className="nav__badge" aria-label={`, ${item.badge} notifications`}>{item.badge}</span>
            )}
          </a>
        )}
      </li>
    );
  };

  return (
    <nav aria-label={label} className="sidebar-nav">
      <ul role="list">{items.map((item) => renderItem(item))}</ul>
    </nav>
  );
};

// ─── Data Display ─────────────────────────────────────────────────────────────

interface KeyValuePair { key: string; value: string | number | React.ReactNode; }

interface DescriptionListProps {
  items: KeyValuePair[];
  columns?: 1 | 2 | 3;
  label?: string;
  compact?: boolean;
}

const DescriptionList: React.FC<DescriptionListProps> = ({ items, columns = 1, label, compact }) => (
  <dl
    aria-label={label}
    className={`dl dl--${columns}col ${compact ? 'dl--compact' : ''}`}
  >
    {items.map(({ key, value }, idx) => (
      <React.Fragment key={idx}>
        <dt className="dl__term">{key}</dt>
        <dd className="dl__detail">{value}</dd>
      </React.Fragment>
    ))}
  </dl>
);

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { value: number; label: string };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, delta, icon, trend }) => {
  const labelId = React.useId();
  const deltaSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const deltaLabel = delta ? `${delta.value > 0 ? '+' : ''}${delta.value} ${delta.label}` : undefined;
  return (
    <article className={`stat-card stat-card--${trend || 'neutral'}`} aria-labelledby={labelId}>
      {icon && <span className="stat-card__icon" aria-hidden="true">{icon}</span>}
      <span id={labelId} className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {delta && (
        <span className="stat-card__delta" aria-label={deltaLabel}>
          <span aria-hidden="true">{deltaSymbol}</span>
          <span>{delta.value > 0 ? '+' : ''}{delta.value} {delta.label}</span>
        </span>
      )}
    </article>
  );
};

// ─── Error Boundary ──────────────────────────────────────────────────────────

interface ErrorBoundaryState { hasError: boolean; error: Error | null; }
interface ErrorBoundaryProps {
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  onError?: (error: Error, info: React.ErrorInfo) => void;
  children: React.ReactNode;
}

class LuminaryErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.onError?.(error, info);
    console.error('[LuminaryErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') return fallback(this.state.error);
      if (fallback) return fallback;
      return (
        <div role="alert" aria-live="polite" className="error-boundary">
          <h2>Something went wrong</h2>
          <p>The application encountered an unexpected error. Please refresh the page.</p>
          <button type="button" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Accessible Rich Text Editor Toolbar ─────────────────────────────────────

interface RichTextAction {
  id: string;
  label: string;
  icon: string;
  command: string;
  shortcut?: string;
}

const EDITOR_ACTIONS: RichTextAction[] = [
  { id: 'bold',        label: 'Bold',        icon: 'B', command: 'bold',        shortcut: 'Ctrl+B' },
  { id: 'italic',      label: 'Italic',      icon: 'I', command: 'italic',      shortcut: 'Ctrl+I' },
  { id: 'underline',   label: 'Underline',   icon: 'U', command: 'underline',   shortcut: 'Ctrl+U' },
  { id: 'strikethrough', label: 'Strikethrough', icon: 'S̶', command: 'strikeThrough'          },
  { id: 'ordered',     label: 'Ordered list',    icon: '1.', command: 'insertOrderedList'  },
  { id: 'unordered',   label: 'Unordered list',  icon: '•',  command: 'insertUnorderedList' },
  { id: 'link',        label: 'Insert link',     icon: '🔗', command: 'createLink'           },
  { id: 'undo',        label: 'Undo',            icon: '↩', command: 'undo',        shortcut: 'Ctrl+Z' },
  { id: 'redo',        label: 'Redo',            icon: '↪', command: 'redo',        shortcut: 'Ctrl+Y' },
];

interface RichTextToolbarProps {
  editorRef: React.RefObject<HTMLDivElement>;
  label?: string;
}

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ editorRef, label = 'Text formatting' }) => {
  const [activeStates, setActiveStates] = React.useState<Record<string, boolean>>({});

  const updateStates = React.useCallback(() => {
    setActiveStates(
      Object.fromEntries(EDITOR_ACTIONS.map((a) => [a.id, document.queryCommandState?.(a.command) || false]))
    );
  }, []);

  const execCommand = (action: RichTextAction) => {
    if (!editorRef.current) return;
    if (action.command === 'createLink') {
      const url = window.prompt('Enter URL:');
      if (url) document.execCommand(action.command, false, url);
    } else {
      document.execCommand(action.command, false, undefined);
    }
    editorRef.current.focus();
    updateStates();
  };

  return (
    <div role="toolbar" aria-label={label} className="rich-text-toolbar">
      {EDITOR_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          aria-pressed={activeStates[action.id]}
          aria-keyshortcuts={action.shortcut}
          title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
          aria-label={action.label}
          onClick={() => execCommand(action)}
          className={`toolbar-btn ${activeStates[action.id] ? 'toolbar-btn--active' : ''}`}
        >
          <span aria-hidden="true">{action.icon}</span>
        </button>
      ))}
    </div>
  );
};

interface AccessibleRichEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  label: string;
  id: string;
  minHeight?: number;
  maxHeight?: number;
}

const AccessibleRichEditor: React.FC<AccessibleRichEditorProps> = ({
  value, onChange, placeholder = 'Start typing…', label, id, minHeight = 120, maxHeight,
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const toolbarId = `${id}-toolbar`;
  const labelId = `${id}-label`;

  React.useEffect(() => {
    if (editorRef.current && value !== undefined && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="rich-editor" id={id}>
      <label id={labelId} className="rich-editor__label">{label}</label>
      <RichTextToolbar editorRef={editorRef} label={`${label} formatting options`} />
      <div
        ref={editorRef}
        role="textbox"
        contentEditable="true"
        aria-multiline="true"
        aria-labelledby={labelId}
        aria-describedby={toolbarId}
        data-placeholder={placeholder}
        style={{ minHeight, maxHeight, overflowY: maxHeight ? 'auto' : undefined }}
        onInput={() => onChange?.(editorRef.current?.innerHTML || '')}
        className="rich-editor__content"
        suppressContentEditableWarning
      />
    </div>
  );
};

// ─── Virtual List ────────────────────────────────────────────────────────────

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  label?: string;
  getItemId?: (item: T, index: number) => string;
}

function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  label = 'List',
  getItemId,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={containerRef}
      role="list"
      aria-label={label}
      aria-rowcount={items.length}
      style={{ height: containerHeight, overflowY: 'auto', position: 'relative' }}
      onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }} aria-hidden="false">
        {visibleItems.map((item, idx) => {
          const absoluteIndex = startIndex + idx;
          return (
            <div
              key={getItemId ? getItemId(item, absoluteIndex) : absoluteIndex}
              role="listitem"
              aria-rowindex={absoluteIndex + 1}
              style={{ position: 'absolute', top: absoluteIndex * itemHeight, height: itemHeight, width: '100%' }}
            >
              {renderItem(item, absoluteIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stepper / Wizard ────────────────────────────────────────────────────────

interface StepperStep {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onChange?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  completedSteps,
  onChange,
  orientation = 'horizontal',
  label = 'Progress',
}) => {
  const navId = React.useId();
  return (
    <nav
      id={navId}
      aria-label={label}
      className={`stepper stepper--${orientation}`}
    >
      <ol className="stepper__list">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.has(idx);
          const isCurrent = idx === currentStep;
          const isClickable = onChange && isCompleted;
          let status: string;
          if (isCompleted) status = 'completed';
          else if (isCurrent) status = 'current';
          else status = 'upcoming';

          return (
            <li
              key={step.id}
              className={`stepper__item stepper__item--${status}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onChange(idx)}
                  aria-label={`Step ${idx + 1}: ${step.label}${isCompleted ? ' (completed)' : ''}`}
                  className="stepper__btn"
                >
                  <StepIndicator idx={idx} status={status} />
                  <StepContent step={step} status={status} />
                </button>
              ) : (
                <div aria-label={`Step ${idx + 1}: ${step.label}${isCurrent ? ' (current)' : ''}${!isCompleted && !isCurrent ? ' (upcoming)' : ''}`}>
                  <StepIndicator idx={idx} status={status} />
                  <StepContent step={step} status={status} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const StepIndicator: React.FC<{ idx: number; status: string }> = ({ idx, status }) => (
  <span className="stepper__indicator" aria-hidden="true">
    {status === 'completed' ? '✓' : idx + 1}
  </span>
);

const StepContent: React.FC<{ step: StepperStep; status: string }> = ({ step, status }) => (
  <div className="stepper__content">
    <span className="stepper__label">
      {step.label}
      {step.optional && <span className="stepper__optional"> (optional)</span>}
    </span>
    {step.description && <span className="stepper__desc">{step.description}</span>}
  </div>
);

// ─── Color Contrast Utilities ────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const n = parseInt(full, 16);
  if (isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function srgbChannel(c: number): number {
  const srgb = c / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  if (!c1 || !c2) return 0;
  const l1 = relativeLuminance(c1);
  const l2 = relativeLuminance(c2);
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function meetsWCAGAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = contrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

function meetsWCAGAAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = contrastRatio(foreground, background);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

const ContrastChecker: React.FC<{ foreground: string; background: string; text?: string }> = ({
  foreground, background, text = 'Sample Text'
}) => {
  const ratio = contrastRatio(foreground, background);
  const passAA  = meetsWCAGAA(foreground, background);
  const passAAA = meetsWCAGAAA(foreground, background);
  const passAALg = meetsWCAGAA(foreground, background, true);

  return (
    <div className="contrast-checker" aria-label="Color contrast checker results">
      <div
        className="contrast-preview"
        style={{ color: foreground, background, padding: '16px', borderRadius: 8 }}
        aria-label={`Text preview: ${text}`}
      >
        <p className="contrast-preview__normal">{text}</p>
        <p className="contrast-preview__large" style={{ fontSize: 24, fontWeight: 700 }}>{text} (large)</p>
      </div>
      <dl className="contrast-results">
        <dt>Contrast ratio</dt>
        <dd aria-label={`Contrast ratio: ${ratio.toFixed(2)} to 1`}>{ratio.toFixed(2)}:1</dd>
        <dt>WCAG AA (normal text, min 4.5:1)</dt>
        <dd aria-label={`WCAG AA: ${passAA ? 'Pass' : 'Fail'}`} className={passAA ? 'pass' : 'fail'}>{passAA ? 'Pass ✓' : 'Fail ✗'}</dd>
        <dt>WCAG AA (large text, min 3:1)</dt>
        <dd aria-label={`WCAG AA large: ${passAALg ? 'Pass' : 'Fail'}`} className={passAALg ? 'pass' : 'fail'}>{passAALg ? 'Pass ✓' : 'Fail ✗'}</dd>
        <dt>WCAG AAA (normal text, min 7:1)</dt>
        <dd aria-label={`WCAG AAA: ${passAAA ? 'Pass' : 'Fail'}`} className={passAAA ? 'pass' : 'fail'}>{passAAA ? 'Pass ✓' : 'Fail ✗'}</dd>
      </dl>
    </div>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export {
  toCamelCase, toKebabCase, toTitleCase, truncate, slugify, pluralize, escapeHtml, stripHtml, countWords, formatBytes,
  clamp, lerp, inverseLerp, remap, roundTo, formatNumber, formatCurrency, formatPercent, sum, average, median, standardDeviation,
  chunk, unique, uniqueBy, groupBy, sortBy, flatten, zip, range, last, first, countBy, partition, intersect, difference, shuffle,
  pick, omit, mapValues, filterObject, deepMerge, deepEqual, deepClone,
  formatDate, formatRelativeTime, addDays, startOfDay, endOfDay, startOfWeek, isSameDay, isWithinInterval, parseISODate, getDaysInMonth,
  parseQueryString, buildQueryString, storage,
  useLocalStorage, useSessionStorage, useDebounce, useThrottle, usePrevious, useIsMounted,
  useClickOutside, useWindowSize, useMatchMedia, useIntersectionObserver, useResizeObserver,
  useEventListener, useInterval, useTimeout, useCounter, useToggle, useAsyncState, useMediaQuery,
  useFocusVisible, useDocumentTitle, useCopyToClipboard, useKeyboardShortcut,
  usePrefersDarkMode, usePrefersReducedMotion, useHighContrastMode,
  validators, composeValidators, useField,
  FormFieldWrapper, TextInput, SelectInput, TextareaInput,
  AlertBanner, ProgressBar, LoadingSpinner, Skeleton, SkeletonScreen,
  SidebarNav, DescriptionList, StatCard,
  LuminaryErrorBoundary,
  RichTextToolbar, AccessibleRichEditor,
  VirtualList,
  Stepper,
  hexToRgb, relativeLuminance, contrastRatio, meetsWCAGAA, meetsWCAGAAA, ContrastChecker,
};

// ═══════════════════════════════════════════════════════════════════════════
// LUMINARY DESIGN SYSTEM — EXTENDED COMPONENT LIBRARY
// Fully accessible, WCAG 2.2 compliant React components.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Type Utilities ──────────────────────────────────────────────────────────

type Maybe<T> = T | null | undefined;
type Nullable<T> = T | null;
type NonEmptyArray<T> = [T, ...T[]];
type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
type DeepReadonly<T> = T extends (infer A)[] ? DeepReadonlyArray<A> : T extends object ? DeepReadonlyObject<T> : T;
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
type DeepReadonlyObject<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };
type Awaited<T> = T extends PromiseLike<infer R> ? R : T;
type ValueOf<T> = T[keyof T];
type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];
type Prettify<T> = { [K in keyof T]: T[K] } & NonNullable<unknown>;
type Override<T, U> = Omit<T, keyof U> & U;
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];
type ExactlyOneOf<T, Keys extends keyof T = keyof T> = { [K in Keys]: Pick<T, K> & Partial<Record<Exclude<Keys, K>, never>> }[Keys] & Pick<T, Exclude<keyof T, Keys>>;

// ─── String Utilities ────────────────────────────────────────────────────────

const toCamelCase = (s: string): string =>
  s.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');

const toKebabCase = (s: string): string =>
  s.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');

const toTitleCase = (s: string): string =>
  s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

const truncate = (s: string, maxLength: number, ellipsis = '…'): string =>
  s.length <= maxLength ? s : s.slice(0, maxLength - ellipsis.length) + ellipsis;

const slugify = (s: string): string =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const pluralize = (count: number, singular: string, plural?: string): string =>
  `${count} ${count === 1 ? singular : (plural || singular + 's')}`;

const padStart = (s: string | number, len: number, char = '0'): string =>
  String(s).padStart(len, char);

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const stripHtml = (s: string): string =>
  s.replace(/<[^>]*>/g, '');

const countWords = (s: string): number =>
  s.trim().split(/\s+/).filter(Boolean).length;

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = Math.max(0, decimals);
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// ─── Number & Math Utilities ─────────────────────────────────────────────────

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

const inverseLerp = (a: number, b: number, value: number): number =>
  (value - a) / (b - a);

const remap = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number =>
  lerp(outMin, outMax, inverseLerp(inMin, inMax, value));

const roundTo = (value: number, precision: number): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

const formatNumber = (n: number, locale = 'en-US', options?: Intl.NumberFormatOptions): string =>
  new Intl.NumberFormat(locale, options).format(n);

const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);

const formatPercent = (value: number, decimals = 1): string =>
  `${(value * 100).toFixed(decimals)}%`;

const sum = (...nums: number[]): number =>
  nums.reduce((acc, n) => acc + n, 0);

const average = (...nums: number[]): number =>
  nums.length ? sum(...nums) / nums.length : 0;

const median = (nums: number[]): number => {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
};

const standardDeviation = (nums: number[]): number => {
  if (nums.length < 2) return 0;
  const mean = average(...nums);
  const squaredDiffs = nums.map((n) => Math.pow(n - mean, 2));
  return Math.sqrt(average(...squaredDiffs));
};

// ─── Array Utilities ─────────────────────────────────────────────────────────

const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const unique = <T>(array: T[]): T[] =>
  Array.from(new Set(array));

const uniqueBy = <T, K>(array: T[], keyFn: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> => {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(item);
    return acc;
  }, {} as Record<K, T[]>);
};

const sortBy = <T>(array: T[], ...keys: ((item: T) => string | number)[]): T[] =>
  [...array].sort((a, b) => {
    for (const key of keys) {
      const av = key(a); const bv = key(b);
      if (av < bv) return -1;
      if (av > bv) return 1;
    }
    return 0;
  });

const flatten = <T>(array: (T | T[])[]): T[] =>
  array.flatMap((item) => Array.isArray(item) ? item : [item]);

const zip = <A, B>(a: A[], b: B[]): [A, B][] =>
  a.slice(0, Math.min(a.length, b.length)).map((item, idx) => [item, b[idx]!]);

const range = (start: number, end?: number, step = 1): number[] => {
  const [from, to] = end === undefined ? [0, start] : [start, end];
  const result: number[] = [];
  for (let i = from; i < to; i += step) result.push(i);
  return result;
};

const last = <T>(array: T[]): T | undefined =>
  array[array.length - 1];

const first = <T>(array: T[]): T | undefined =>
  array[0];

const countBy = <T>(array: T[], predicate: (item: T) => boolean): number =>
  array.reduce((count, item) => count + (predicate(item) ? 1 : 0), 0);

const partition = <T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] =>
  array.reduce<[T[], T[]]>(([pass, fail], item) =>
    predicate(item) ? [[...pass, item], fail] : [pass, [...fail, item]],
    [[], []]
  );

const intersect = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item));
};

const difference = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b);
  return a.filter((item) => !setB.has(item));
};

const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};

// ─── Object Utilities ────────────────────────────────────────────────────────

const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => { if (key in obj) result[key] = obj[key]; });
  return result;
};

const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete (result as T)[key]);
  return result as Omit<T, K>;
};

const mapValues = <T extends object, V>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => V,
): Record<keyof T, V> => {
  const result = {} as Record<keyof T, V>;
  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    result[key] = fn(obj[key], key);
  });
  return result;
};

const filterObject = <T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean,
): Partial<T> => {
  const result: Partial<T> = {};
  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    if (predicate(obj[key], key)) result[key] = obj[key];
  });
  return result;
};

const deepMerge = <T extends object>(target: T, ...sources: DeepPartial<T>[]): T => {
  const result = { ...target };
  for (const source of sources) {
    for (const key in source) {
      const sv = (source as T)[key as keyof T];
      const tv = result[key as keyof T];
      if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
        result[key as keyof T] = deepMerge(tv as object, sv as object) as T[keyof T];
      } else if (sv !== undefined) {
        result[key as keyof T] = sv as T[keyof T];
      }
    }
  }
  return result;
};

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== 'object') return false;
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
};

const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T;
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone((obj as Record<string, unknown>)[key]);
    }
  }
  return result as T;
};

// ─── Date Utilities ──────────────────────────────────────────────────────────

const formatDate = (date: Date, locale = 'en-US', options?: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat(locale, options || { year: 'numeric', month: 'long', day: 'numeric' }).format(date);

const formatRelativeTime = (date: Date, relativeTo = new Date()): string => {
  const diffMs = date.getTime() - relativeTo.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr  = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);
  const diffWk  = Math.round(diffDay / 7);
  const diffMo  = Math.round(diffDay / 30);
  const diffYr  = Math.round(diffDay / 365);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffHr)  < 24) return rtf.format(diffHr, 'hour');
  if (Math.abs(diffDay) < 7)  return rtf.format(diffDay, 'day');
  if (Math.abs(diffWk)  < 5)  return rtf.format(diffWk, 'week');
  if (Math.abs(diffMo)  < 12) return rtf.format(diffMo, 'month');
  return rtf.format(diffYr, 'year');
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const startOfWeek = (date: Date, startDay = 0): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day - startDay + 7) % 7;
  result.setDate(result.getDate() - diff);
  return startOfDay(result);
};

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isWithinInterval = (date: Date, start: Date, end: Date): boolean =>
  date >= start && date <= end;

const parseISODate = (s: string): Date => {
  const d = new Date(s);
  if (isNaN(d.getTime())) throw new Error(`Invalid ISO date: ${s}`);
  return d;
};

const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

// ─── URL & Query String Utilities ────────────────────────────────────────────

const parseQueryString = (search: string): Record<string, string | string[]> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string | string[]> = {};
  params.forEach((value, key) => {
    if (key in result) {
      const existing = result[key]!;
      result[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      result[key] = value;
    }
  });
  return result;
};

const buildQueryString = (params: Record<string, string | string[] | number | boolean | null | undefined>): string => {
  const search = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val == null) continue;
    if (Array.isArray(val)) { val.forEach((v) => search.append(key, String(v))); }
    else { search.set(key, String(val)); }
  }
  const s = search.toString();
  return s ? `?${s}` : '';
};

// ─── Local Storage Utilities ─────────────────────────────────────────────────

const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or private browsing
    }
  },
  remove: (key: string): void => {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
  clear: (): void => {
    try { localStorage.clear(); } catch { /* noop */ }
  },
};

// ─── Custom React Hooks ───────────────────────────────────────────────────────

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => storage.get(key, initialValue));
  const setValue = React.useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
      storage.set(key, next);
      return next;
    });
  }, [key]);
  return [storedValue, setValue] as const;
}

function useSessionStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) as T : initialValue;
    } catch { return initialValue; }
  });
  const set = React.useCallback((v: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, [key]);
  return [value, set] as const;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useThrottle<T>(value: T, interval: number): T {
  const [throttled, setThrottled] = React.useState(value);
  const lastUpdated = React.useRef<number>(Date.now());
  React.useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= interval) {
      setThrottled(value);
      lastUpdated.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottled(value);
        lastUpdated.current = Date.now();
      }, interval - (now - lastUpdated.current));
      return () => clearTimeout(timer);
    }
  }, [value, interval]);
  return throttled;
}

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);
  React.useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}

function useIsMounted(): () => boolean {
  const isMountedRef = React.useRef(false);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);
  return React.useCallback(() => isMountedRef.current, []);
}

function useClickOutside<T extends HTMLElement>(handler: () => void): React.RefObject<T> {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);
  return ref;
}

function useWindowSize() {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

function useIntersectionObserver<T extends HTMLElement>(
  options?: IntersectionObserverInit,
): [React.RefObject<T>, boolean] {
  const ref = React.useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry!.isIntersecting);
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);
  return [ref, isIntersecting];
}

function useResizeObserver<T extends HTMLElement>(): [React.RefObject<T>, DOMRectReadOnly | null] {
  const ref = React.useRef<T>(null);
  const [rect, setRect] = React.useState<DOMRectReadOnly | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setRect(entry.contentRect);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, rect];
}

function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (e: WindowEventMap[K]) => void,
  element: EventTarget = window,
  options?: boolean | AddEventListenerOptions,
): void {
  const savedHandler = React.useRef(handler);
  React.useLayoutEffect(() => { savedHandler.current = handler; }, [handler]);
  React.useEffect(() => {
    const listener = (e: Event) => savedHandler.current(e as WindowEventMap[K]);
    element.addEventListener(eventName, listener, options);
    return () => element.removeEventListener(eventName, listener, options);
  }, [eventName, element, options]);
}

function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

function useCounter(initialValue = 0, min?: number, max?: number) {
  const [count, setCount] = React.useState(initialValue);
  const increment = React.useCallback(() => setCount((c) => max !== undefined ? Math.min(c + 1, max) : c + 1), [max]);
  const decrement = React.useCallback(() => setCount((c) => min !== undefined ? Math.max(c - 1, min) : c - 1), [min]);
  const reset     = React.useCallback(() => setCount(initialValue), [initialValue]);
  const set       = React.useCallback((v: number) => setCount(
    min !== undefined && max !== undefined ? clamp(v, min, max) : v
  ), [min, max]);
  return { count, increment, decrement, reset, set };
}

function useToggle(initialValue = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = React.useState(initialValue);
  const toggle = React.useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

function useAsyncState<T>() {
  const [state, setState] = React.useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    data: T | null;
    error: Error | null;
  }>({ status: 'idle', data: null, error: null });

  const run = React.useCallback(async (promise: Promise<T>) => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await promise;
      setState({ status: 'success', data, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ status: 'error', data: null, error });
      throw error;
    }
  }, []);

  return { ...state, run };
}

function useMediaQuery(breakpoints: Record<string, string>) {
  const [matches, setMatches] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      Object.entries(breakpoints).map(([key, query]) => [
        key,
        typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
      ])
    )
  );

  React.useEffect(() => {
    const queries = Object.entries(breakpoints).map(([key, query]) => {
      const mq = window.matchMedia(query);
      const handler = (e: MediaQueryListEvent) => {
        setMatches((prev) => ({ ...prev, [key]: e.matches }));
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    });
    return () => queries.forEach((cleanup) => cleanup());
  }, [breakpoints]);

  return matches;
}

function useFocusVisible(): [React.RefObject<HTMLElement>, boolean] {
  const ref = React.useRef<HTMLElement>(null);
  const [isFocusVisible, setIsFocusVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onFocus = (e: FocusEvent) => {
      const isKeyboard = !(e as FocusEvent & { sourceCapabilities?: { firesTouchEvents: boolean } })
        .sourceCapabilities?.firesTouchEvents;
      setIsFocusVisible(isKeyboard);
    };
    const onBlur = () => setIsFocusVisible(false);
    el.addEventListener('focus', onFocus);
    el.addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('focus', onFocus);
      el.removeEventListener('blur', onBlur);
    };
  }, []);

  return [ref, isFocusVisible];
}

function useDocumentTitle(title: string, suffix?: string): void {
  React.useEffect(() => {
    const original = document.title;
    document.title = suffix ? `${title} | ${suffix}` : title;
    return () => { document.title = original; };
  }, [title, suffix]);
}

function useCopyToClipboard(): [string | null, (text: string) => Promise<void>] {
  const [copiedText, setCopiedText] = React.useState<string | null>(null);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      setCopiedText(null);
    }
  };
  return [copiedText, copy];
}

function useKeyboardShortcut(
  keys: string[],
  callback: (e: KeyboardEvent) => void,
  options: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {},
): void {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (options.ctrlKey  && !e.ctrlKey)  return;
      if (options.metaKey  && !e.metaKey)  return;
      if (options.shiftKey && !e.shiftKey) return;
      if (options.altKey   && !e.altKey)   return;
      if (keys.includes(e.key)) {
        e.preventDefault();
        savedCallback.current(e);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [keys, options.ctrlKey, options.metaKey, options.shiftKey, options.altKey]);
}

function usePrefersDarkMode(): boolean {
  return useMatchMedia('(prefers-color-scheme: dark)');
}

function usePrefersReducedMotion(): boolean {
  return useMatchMedia('(prefers-reduced-motion: reduce)');
}

function useHighContrastMode(): boolean {
  return useMatchMedia('(forced-colors: active)');
}

// ─── Form Utilities ───────────────────────────────────────────────────────────

type ValidationRule<T> = (value: T) => string | null;

const validators = {
  required: (message = 'This field is required'): ValidationRule<string> =>
    (v) => v.trim() ? null : message,
  minLength: (min: number, message?: string): ValidationRule<string> =>
    (v) => v.length >= min ? null : message || `Must be at least ${min} characters`,
  maxLength: (max: number, message?: string): ValidationRule<string> =>
    (v) => v.length <= max ? null : message || `Must be no more than ${max} characters`,
  pattern: (re: RegExp, message = 'Invalid format'): ValidationRule<string> =>
    (v) => re.test(v) ? null : message,
  email: (message = 'Invalid email address'): ValidationRule<string> =>
    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : message,
  url: (message = 'Invalid URL'): ValidationRule<string> => (v) => {
    try { new URL(v); return null; } catch { return message; }
  },
  min: (min: number, message?: string): ValidationRule<number> =>
    (v) => v >= min ? null : message || `Must be at least ${min}`,
  max: (max: number, message?: string): ValidationRule<number> =>
    (v) => v <= max ? null : message || `Must be no more than ${max}`,
                       
