/**
 * ground-truth.ts  —  Fixture definitions
 *
 * Each FixtureGroundTruth describes one test file.
 * Clean fixtures have zero expected issues — every LLM-emitted issue is a FP.
 * Error fixtures declare IssueConcept entries for every injected accessibility
 * violation.  scoreRun() matches LLM output against these via keyword search.
 *
 * Error fixtures are cumulative within each language (low → medium → high).
 */

import * as path from 'path';

const F = (subfolder: string, name: string) =>
  path.join(__dirname, 'fixtures', subfolder, name);

const A = (name: string) =>
  path.join(__dirname, 'adversarial-fixtures', name);

// ─── Types ────────────────────────────────────────────────────────────────

export type IssueConcept = {
  /** Short unique id, used in miss/FP reporting */
  id: string;
  /** One or more lower-case substrings; a match on ANY of them = TP */
  keywords: string[];
  /** Human-readable description of what the issue is */
  description: string;
};

export type FixtureGroundTruth = {
  fixtureId: string;
  filePath: string;
  languageId: string;
  /** true → no issues expected; every LLM-emitted issue is a false positive */
  isClean: boolean;
  expectedIssues: IssueConcept[];
};

// ─────────────────────────────────────────────────────────────────────────────
// HTML
// ─────────────────────────────────────────────────────────────────────────────

const HTML_CLEAN: FixtureGroundTruth = {
  fixtureId:      'html-clean',
  filePath:       F('html', 'html-clean.html'),
  languageId:     'html',
  isClean:        true,
  expectedIssues: [],
};

/** Shared first 10 concepts reused in medium and high (cumulative set). */
const HTML_LOW_ISSUES: IssueConcept[] = [
  { id: 'html-lang-missing',       keywords: ['lang attribute', 'missing lang', 'html lang'],              description: '<html> missing lang attribute' },
  { id: 'search-btn-name',         keywords: ['submit button', 'search button', 'accessible name', 'type="submit"', 'submit control'],        description: 'Search submit button has no accessible name' },
  { id: 'click-here-link',         keywords: ['click here', 'link text', 'non-descriptive'],               description: 'CTA link uses non-descriptive "Click here" text' },
  { id: 'heading-level-skip-h5',   keywords: ['heading level', 'heading skip', 'skipped heading', 'hierarchy skipped', 'h3 to h5'],         description: '"Review and remediate" heading skips from h3 to h5' },
  { id: 'axe-runner-alt-missing',  keywords: ['axe runner', 'missing alt', 'image alt', 'alt text'],       description: 'axe Runner product image missing alt attribute' },
  { id: 'th-col-scope-missing',    keywords: ['scope attribute', 'table header', 'th scope', 'col scope'], description: 'Comparison table <th> elements missing scope="col"' },
  { id: 'faq-id-wrong-section',   keywords: ['faq', 'section id', 'skip link target', 'id attribute'],    description: 'FAQ section given id="contact" breaking skip-link target' },
  { id: 'newsletter-label-missing',keywords: ['newsletter email', 'newsletter-email', 'email label', 'label element', 'missing associated'],         description: 'Newsletter email input missing <label>' },
  { id: 'footer-logo-alt-missing', keywords: ['footer logo', 'luminary logo', 'logo alt', 'luminary-logo-white'],                 description: 'Footer logo image missing alt attribute' },
  { id: 'twitter-link-name',       keywords: ['twitter', 'social link name', 'aria-label', 'twitter.com', 'icon link'],                description: 'Twitter social link has no accessible name' },
];

/** Additional 20 concepts unique to medium (errors 11–30). */
const HTML_MEDIUM_EXTRA: IssueConcept[] = [
  { id: 'title-empty',             keywords: ['page title', 'empty title', 'title element'],               description: '<title> element is empty' },
  { id: 'search-label-missing',    keywords: ['search input label', 'search label', 'label for search', 'search-input', 'missing associated'],   description: 'Search input has no <label>' },
  { id: 'hero-img-alt-missing',    keywords: ['hero image', 'hero alt', 'dashboard screenshot', 'hero-dashboard'],           description: 'Hero dashboard screenshot image missing alt' },
  { id: 'logo-bar-aria-label',     keywords: ['logo bar', 'companies section', 'section label'],           description: 'Logo bar section missing aria-label' },
  { id: 'partner-logo-alt',        keywords: ['partner logo', 'nova health', 'logo image alt', 'nova-health'],            description: 'Partner logos missing alt attributes' },
  { id: 'features-heading-id',     keywords: ['features heading', 'h2 id', 'aria-labelledby target'],      description: 'Features <h2> missing id, breaking aria-labelledby' },
  { id: 'learn-more-link',         keywords: ['learn more', 'non-descriptive link', 'vague link'],         description: '"Learn more" link text is non-descriptive' },
  { id: 'step1-heading-skip',      keywords: ['connect your project', 'step heading', 'h5'],               description: '"Connect your project" step heading skips to h5' },
  { id: 'step1-img-alt-missing',   keywords: ['how it works', 'step image', 'cli connect', 'step-1-connect', 'step-1'],    description: 'How-it-works step 1 image missing alt attribute' },
  { id: 'filter-btn-aria-pressed', keywords: ['filter button', 'aria-pressed', 'filter tab'],              description: 'Product filter buttons missing aria-pressed state' },
  { id: 'contrast-studio-alt',     keywords: ['contrast studio', 'product image alt', 'missing alt', 'contrast-studio'],   description: 'Contrast Studio product image missing alt attribute' },
  { id: 'contrast-studio-link',    keywords: ['contrast studio', 'click here', 'product link'],            description: 'Contrast Studio link uses non-descriptive "Click here"' },
  { id: 'pricing-toggle-role',     keywords: ['pricing toggle', 'role group', 'billing toggle'],           description: 'Pricing toggle div missing role="group"' },
  { id: 'featured-plan-label',     keywords: ['featured plan', 'recommended plan', 'aria-label'],          description: 'Featured pricing plan list item missing aria-label' },
  { id: 'table-caption-missing',   keywords: ['table caption', 'caption element', 'table title', 'no caption', 'missing caption'],          description: 'Comparison table missing <caption>' },
  { id: 'th-row-scope-missing',    keywords: ['row header', 'scope row', 'th scope', 'scope="row"', 'missing scope'],                      description: 'Table row header missing scope="row"' },
  { id: 'td-icon-aria-label',      keywords: ['table cell', 'icon cell', 'aria-label', 'tick', 'dash'],   description: 'Icon table cells (✓/—) missing aria-label' },
  { id: 'testimonial-avatar-alt',  keywords: ['testimonial avatar', 'avatar image', 'priya', 'priya-k'],              description: 'Testimonial avatar image missing alt attribute' },
  { id: 'faq-aria-controls',       keywords: ['faq button', 'aria-controls', 'accordion trigger'],        description: 'FAQ accordion button missing aria-controls' },
  { id: 'faq-dd-region',           keywords: ['faq answer', 'role region', 'aria-labelledby'],             description: 'FAQ answer panel missing role="region" and aria-labelledby' },
  { id: 'contact-label-missing',   keywords: ['contact-email', 'contact email', 'contact input label', 'missing associated'],  description: 'Contact email input missing <label>' },
];

/** Additional 20 concepts unique to high (errors 31–50). */
const HTML_HIGH_EXTRA: IssueConcept[] = [
  { id: 'skip-links-removed',      keywords: ['skip link', 'skip navigation', 'skip to main', 'no skip', 'skip-link missing'],             description: 'Skip navigation links block removed entirely' },
  { id: 'main-nav-aria-label',     keywords: ['main navigation', 'nav aria-label', 'primary nav'],         description: 'Main nav element missing aria-label' },
  { id: 'mobile-toggle-aria',      keywords: ['mobile toggle', 'hamburger', 'aria-expanded'],              description: 'Mobile nav toggle missing aria-expanded, aria-controls, aria-label' },
  { id: 'subnav-btn-aria',         keywords: ['subnav', 'submenu button', 'aria-haspopup'],                description: 'Submenu trigger button missing aria-expanded/controls/haspopup' },
  { id: 'search-form-role',        keywords: ['search form', 'role search', 'form landmark'],              description: 'Search form missing role="search"' },
  { id: 'account-nav-label',       keywords: ['account navigation', 'account nav', 'nav label'],           description: 'Account nav missing aria-label' },
  { id: 'main-id-missing',         keywords: ['main element id', 'id main-content', 'skip target'],        description: '<main> missing id attribute, breaking skip-link target' },
  { id: 'live-region-removed',     keywords: ['live region', 'aria-live', 'status region'],                description: 'Page-level live region element removed' },
  { id: 'hero-section-label',      keywords: ['hero section', 'aria-labelledby', 'section label'],         description: 'Hero section missing aria-labelledby' },
  { id: 'filter-group-label',      keywords: ['filter group', 'aria-labelledby', 'role group'],            description: 'Product filter group div missing aria-labelledby' },
  { id: 'product-grid-label',      keywords: ['product grid', 'ul aria-label', 'grid label'],              description: 'Product grid <ul> missing aria-label' },
  { id: 'row-scope-scans',         keywords: ['component scans', 'row scope', 'table row header'],         description: '"Component scans" table row header missing scope="row"' },
  { id: 'marcus-avatar-alt',       keywords: ['marcus', 'testimonial avatar', 'avatar alt', 'marcus-t'],               description: 'Marcus Thornton testimonial avatar missing alt attribute' },
  { id: 'faq-q1-expanded',        keywords: ['faq item', 'aria-expanded', 'accordion button'],            description: 'First FAQ item button missing aria-expanded' },
  { id: 'faq-q2-expanded',        keywords: ['faq second', 'second question', 'aria-expanded'],           description: 'Second FAQ item button missing aria-expanded' },
  { id: 'contact-name-autocomplete',keywords:['autocomplete', 'given-name', 'name autocomplete'],          description: 'Contact name input missing autocomplete="given-name"' },
  { id: 'contact-aria-required',   keywords: ['aria-required', 'required attribute', 'contact form'],      description: 'Contact form inputs missing aria-required' },
  { id: 'contact-msg-describedby', keywords: ['aria-describedby', 'message hint', 'character count'],      description: 'Contact message textarea missing aria-describedby' },
  { id: 'products-nav-label',      keywords: ['products navigation', 'footer products nav', 'nav label'],  description: 'Products footer nav missing aria-label' },
  { id: 'linkedin-link-name',      keywords: ['linkedin', 'linkedin link', 'social link', 'linkedin.com', 'icon link'],                description: 'LinkedIn social link has no accessible name' },
];

const HTML_LOW: FixtureGroundTruth = {
  fixtureId:      'html-low',
  filePath:       F('html', 'html-low.html'),
  languageId:     'html',
  isClean:        false,
  expectedIssues: HTML_LOW_ISSUES,
};

const HTML_MEDIUM: FixtureGroundTruth = {
  fixtureId:      'html-medium',
  filePath:       F('html', 'html-medium.html'),
  languageId:     'html',
  isClean:        false,
  expectedIssues: [...HTML_LOW_ISSUES, ...HTML_MEDIUM_EXTRA],
};

const HTML_HIGH: FixtureGroundTruth = {
  fixtureId:      'html-high',
  filePath:       F('html', 'html-high.html'),
  languageId:     'html',
  isClean:        false,
  expectedIssues: [...HTML_LOW_ISSUES, ...HTML_MEDIUM_EXTRA, ...HTML_HIGH_EXTRA],
};

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────

const CSS_CLEAN: FixtureGroundTruth = {
  fixtureId:      'css-clean',
  filePath:       F('css', 'css-clean.css'),
  languageId:     'css',
  isClean:        true,
  expectedIssues: [],
};

const CSS_LOW_ISSUES: IssueConcept[] = [
  { id: 'secondary-text-contrast',  keywords: ['secondary text', 'colour-text-secondary', 'aaaaaa', 'contrast', '--colour-text-secondary'],       description: '--colour-text-secondary set to #aaaaaa — insufficient contrast' },
  { id: 'focus-ring-contrast',      keywords: ['focus ring colour', 'colour-focus-ring', 'focus color contrast', '--colour-focus-ring', 'aaaaaa'],       description: '--colour-focus-ring set to #aaaaaa — focus indicator low contrast' },
  { id: 'font-size-px',             keywords: ['font-size', '12px', 'fixed font', 'user preference', 'user browser preference'],                  description: 'Root font-size set to 12px, overriding user browser preference' },
  { id: 'line-height-tight',        keywords: ['line-height', 'line height', 'tight spacing', 'readability', 'set to 1'],          description: 'Root line-height set to 1, insufficient for readability' },
  { id: 'base-focus-outline-none',  keywords: ['focus-visible', 'outline none', 'focus indicator', 'focus outline'],   description: 'Base :focus-visible rule sets outline: none' },
  { id: 'sr-only-broken',           keywords: ['visually hidden', 'sr-only', 'screen reader', 'clip'],                 description: '.sr-only utility class broken — content no longer off-screen' },
  { id: 'reduced-motion-missing',   keywords: ['prefers-reduced-motion', 'motion', 'animation', 'transition'],         description: 'prefers-reduced-motion media query block removed' },
  { id: 'button-target-small',      keywords: ['min-height', 'touch target', 'button size', '32px'],                   description: 'Button min-height reduced from 44px to 32px' },
  { id: 'btn-primary-outline-none', keywords: ['btn-primary', 'primary button focus', 'button outline', 'outline none'],               description: 'Primary button :focus rule sets outline: none' },
  { id: 'skip-link-transform',      keywords: ['skip link', 'translatey', 'skip to content', 'translate'],             description: 'Skip link transform removed — link never enters viewport on focus' },
];

const CSS_MEDIUM_EXTRA: IssueConcept[] = [
  { id: 'brand-primary-contrast',   keywords: ['brand primary', 'colour-brand-primary', 'primary colour contrast', '5588bb'],    description: '--colour-brand-primary changed to #5588bb — insufficient contrast' },
  { id: 'negative-word-spacing',    keywords: ['word-spacing', 'letter-spacing', 'text spacing'],                      description: 'Negative word-spacing and letter-spacing hinder readability' },
  { id: 'link-no-underline',        keywords: ['text-decoration', 'link underline', 'underline', 'a {'],               description: 'Global rule removes underline from all links' },
  { id: 'forced-colors-outline',    keywords: ['forced-color', 'high contrast', 'forced colors focus', 'forced colors'],                description: 'Focus outline removed inside forced-color context' },
  { id: 'mobile-trigger-small',     keywords: ['mobile trigger', 'nav trigger', 'mobile button size', 'mobile-trigger', 'nav-toggle', 'nav toggle'],                 description: 'Mobile nav trigger min-height below 44px' },
  { id: 'mobile-toggle-small',      keywords: ['mobile toggle', 'hamburger size', 'menu toggle size', 'mobile-toggle', 'nav-toggle', 'nav toggle'],                 description: 'Mobile nav toggle min-height below 44px' },
  { id: 'icon-btn-target-small',    keywords: ['icon button', 'icon btn size', 'icon button target', 'icon-btn', 'btn-icon', '.btn-icon', 'btn icon'],                  description: 'Icon button min-width/height reduced below 44px' },
  { id: 'close-btn-target-small',   keywords: ['close button', 'close btn size', 'dismiss button', 'close-btn', 'modal-close', 'btn-close', 'btn close', 'search-input', '#search-input'],                    description: 'Close/dismiss button min-width/height reduced below 44px' },
  { id: 'nav-item-outline-none',    keywords: ['nav item focus', 'nav link focus', 'navigation outline', 'nav-item', 'nav-menu', 'submenu', 'account navigation'],              description: 'Navigation item :focus rule sets outline: none' },
  { id: 'search-btn-target-small',  keywords: ['search button size', 'search btn height', 'submit size', 'search-btn', 'site-search', 'search-input', 'search input'],              description: 'Search submit button min-height below 44px' },
  { id: 'input-target-small',       keywords: ['input height', 'form input size', 'text input height', 'form-input', 'input control'],                description: 'Text input min-height reduced below 44px' },
  { id: 'card-btn-outline-none',    keywords: ['card button focus', 'product card focus', 'card outline', 'card-btn', 'product-body', 'product body', 'feature-card', ':focus-visible', 'focus outline', 'btn:focus'],              description: 'Product card button :focus rule sets outline: none' },
  { id: 'tab-outline-none',         keywords: ['filter tab focus', 'tab button focus', 'tab outline', 'filter-tab', 'tab-btn', 'filter-tabs button', 'filter tabs', ':focus-visible', 'focus outline'],              description: 'Filter tab button :focus rule sets outline: none' },
  { id: 'visually-hidden-display',  keywords: ['display none', 'visually-hidden', 'hidden from at', 'sr content', 'display: none'],    description: '.visually-hidden uses display:none — hides from assistive tech' },
  { id: 'skip-link-target-small',   keywords: ['skip link height', 'skip link size', 'skip button', 'skip-link', 'skip link'],                   description: 'Skip link min-height reduced below 44px' },
  { id: 'pricing-btn-outline-none', keywords: ['pricing button focus', 'billing toggle focus', 'toggle outline', 'pricing-btn', 'billing-toggle', 'pricing-toggle', 'pricing toggle', ':focus-visible', 'focus outline'],      description: 'Pricing toggle button :focus rule sets outline: none' },
  { id: 'faq-btn-target-small-m',   keywords: ['faq button height', 'accordion height', 'faq target', 'faq-accordion', 'faq-btn', 'faq-item', 'faq item', ':focus-visible', 'faq-item dt'],                description: 'FAQ accordion button min-height reduced below 44px (first)' },
  { id: 'form-btn-outline-none',    keywords: ['form button focus', 'submit focus', 'cta focus', 'form-btn', 'form-submit', 'form-group', 'newsletter-form', ':focus-visible', 'focus outline', 'btn:focus', 'focus visible'],                      description: 'Form submit button :focus rule sets outline: none' },
  { id: 'newsletter-input-small',   keywords: ['newsletter input', 'email input size', 'newsletter height', 'newsletter-email', 'newsletter-input', 'newsletter-form', 'newsletter section', 'newsletter-section', 'form-group input'],           description: 'Newsletter email input min-height reduced below 44px' },
  { id: 'contact-input-small',      keywords: ['contact input', 'contact form size', 'contact height', 'contact-input', 'contact-email', 'contact-form', 'contact-section', 'form-group select', 'form-group textarea'],               description: 'Contact form input min-height reduced below 44px' },
];

const CSS_HIGH_EXTRA: IssueConcept[] = [
  { id: 'brand-secondary-contrast', keywords: ['brand secondary', 'colour-brand-secondary', 'purple contrast', 'bb88ee'],        description: '--colour-brand-secondary changed to #bb88ee — insufficient contrast' },
  { id: 'neutral-900-contrast',     keywords: ['neutral-900', 'text colour', 'body text contrast', '555555'],          description: '--colour-neutral-900 changed to #555555 — body text insufficient contrast' },
  { id: 'error-colour-contrast',    keywords: ['error colour', 'colour-error', 'error text contrast', 'ee9999'],        description: '--colour-error changed to #ee9999 — error text insufficient contrast' },
  { id: 'forced-color-adjust',      keywords: ['forced-color-adjust', 'windows high contrast', 'high contrast mode', 'forced-color-adjust: none'],  description: 'forced-color-adjust: none removed — custom styles override system HC' },
  { id: 'hero-link-outline-none',   keywords: ['hero link focus', 'cta link focus', 'hero button focus', 'hero-link', 'cta-link', 'hero-cta'],   description: 'Hero CTA link/button :focus rule sets outline: none' },
  { id: 'badge-outline-none',       keywords: ['badge focus', 'trust badge focus', 'badge outline', 'badge'],                   description: 'Badge element :focus rule sets outline: none' },
  { id: 'stat-item-small',          keywords: ['stat item', 'stats button', 'stats height', 'stat-item', 'stats-bar'],           description: 'Stats bar item min-height reduced below 44px' },
  { id: 'testimonial-outline-none', keywords: ['testimonial focus', 'carousel button', 'testimonial outline', 'testimonial', 'carousel-btn'],         description: 'Testimonial carousel button :focus rule sets outline: none' },
  { id: 'pagination-small',         keywords: ['pagination', 'page button', 'pagination size', 'pagination-btn'],                        description: 'Pagination button min-height reduced below 44px' },
  { id: 'footer-text-contrast',     keywords: ['footer text colour', 'rgba 0.3', 'footer contrast', 'rgba(255,255,255,0.3)'],                   description: 'Footer body text colour changed to rgba(255,255,255,0.3) — very low contrast' },
  { id: 'social-icon-small',        keywords: ['social icon', 'social link height', 'social button', 'social-icon', 'social-link'],                  description: 'Social icon link min-height reduced below 44px' },
  { id: 'dropdown-outline-none',    keywords: ['dropdown focus', 'nav dropdown focus', 'dropdown outline', 'dropdown'],            description: 'Dropdown menu item :focus rule sets outline: none' },
  { id: 'modal-btn-outline-none',   keywords: ['modal focus', 'dialog focus', 'modal button outline', 'modal-btn', 'dialog-btn'],                description: 'Modal dialog button :focus rule sets outline: none' },
  { id: 'faq-dt-outline-none',      keywords: ['faq item focus', 'faq dt button focus', 'accordion focus', 'faq-accordion', 'faq-dt'],            description: 'FAQ accordion button focus-visible sets outline: none' },
  { id: 'form-input-outline-none',  keywords: ['form input focus', 'text input focus', 'input outline', 'form-input', 'input-text'],              description: 'Form inputs focus-visible sets outline: none' },
  { id: 'checkbox-outline-none',    keywords: ['checkbox focus', 'checkbox outline', 'input checkbox focus', 'checkbox'],          description: 'Checkbox focus-visible sets outline: none' },
  { id: 'footer-brand-outline',     keywords: ['footer brand focus', 'footer logo focus', 'footer link focus', 'footer-brand', 'footer-logo'],        description: 'Footer brand link focus-visible sets outline: none' },
  { id: 'footer-nav-outline',       keywords: ['footer nav focus', 'footer navigation focus', 'footer link outline', 'footer-nav'],  description: 'Footer nav links focus-visible sets outline: none' },
  { id: 'social-link-small-h',      keywords: ['social links min-height', 'social target', '28px social', 'social-link', 'social link'],             description: 'Social links min-height reduced below 44px' },
  { id: 'social-link-outline',      keywords: ['social link focus', 'social link outline', 'social a focus', 'social-a', 'social-link'],          description: 'Social links focus-visible sets outline: none' },
  { id: 'cookie-btn-focus',          keywords: ['cookie button', 'cookie outline', 'consent focus', 'cookie-banner-btn', 'cookie-btn', 'cookie banner'],  description: 'Cookie consent confirm button :focus-visible sets outline: none' },
];

const CSS_LOW: FixtureGroundTruth = {
  fixtureId:      'css-low',
  filePath:       F('css', 'css-low.css'),
  languageId:     'css',
  isClean:        false,
  expectedIssues: CSS_LOW_ISSUES,
};

const CSS_MEDIUM: FixtureGroundTruth = {
  fixtureId:      'css-medium',
  filePath:       F('css', 'css-medium.css'),
  languageId:     'css',
  isClean:        false,
  expectedIssues: [...CSS_LOW_ISSUES, ...CSS_MEDIUM_EXTRA],
};

const CSS_HIGH: FixtureGroundTruth = {
  fixtureId:      'css-high',
  filePath:       F('css', 'css-high.css'),
  languageId:     'css',
  isClean:        false,
  expectedIssues: [...CSS_LOW_ISSUES, ...CSS_MEDIUM_EXTRA, ...CSS_HIGH_EXTRA],
};

// ─────────────────────────────────────────────────────────────────────────────
// JavaScript
// ─────────────────────────────────────────────────────────────────────────────

const JS_CLEAN: FixtureGroundTruth = {
  fixtureId:      'js-clean',
  filePath:       F('js', 'js-clean.js'),
  languageId:     'javascript',
  isClean:        true,
  expectedIssues: [],
};

const JS_LOW_ISSUES: IssueConcept[] = [
  { id: 'mark-invalid-aria',        keywords: ['aria-invalid', 'markinvalid', 'invalid field', 'form validation'],     description: 'markInvalid() does not set aria-invalid="true" on field' },
  { id: 'nav-open-expanded',        keywords: ['aria-expanded', 'nav open', 'navigation trigger', 'mobile nav'],       description: 'Mobile nav open() does not set aria-expanded="true" on trigger' },
  { id: 'nav-focus-trap',           keywords: ['focus trap', 'createfocustrap', 'trap focus', 'modal focus'],          description: 'Mobile nav open() does not create/activate a focus trap' },
  { id: 'nav-close-announce',       keywords: ['nav close', 'navigation closed', 'announce', 'live region'],           description: 'Mobile nav close() does not announce closure to screen readers' },
  { id: 'dropdown-open-expanded',   keywords: ['dropdown', 'aria-expanded', 'dropdown trigger', 'open instance'],      description: 'Dropdown _openInstance() does not set aria-expanded="true"' },
  { id: 'search-highlight-announce',keywords: ['highlight', 'search highlight', 'matches highlighted', 'announce'],    description: 'Search highlight() does not announce result count to screen readers' },
  { id: 'filter-aria-pressed',      keywords: ['filter tab', 'aria-pressed', 'category filter', 'filter button'],      description: 'Product filter _syncTabAriaStates() does not set aria-pressed' },
  { id: 'pricing-aria-pressed',     keywords: ['billing period', 'pricing button', 'aria-pressed', 'toggle state'],    description: 'Pricing _syncToggleState() does not set aria-pressed on buttons' },
  { id: 'faq-open-expanded',        keywords: ['faq open', 'accordion open', 'aria-expanded', 'faq trigger'],          description: 'FAQ accordion open() does not set aria-expanded="true"' },
  { id: 'faq-close-announce',       keywords: ['faq close', 'accordion close', 'collapsed', 'announce'],               description: 'FAQ accordion close() does not announce collapse to screen readers' },
];

const JS_MEDIUM_EXTRA: IssueConcept[] = [
  { id: 'mark-valid-aria',          keywords: ['markvalid', 'remove aria-invalid', 'valid field', 'clear invalid'],    description: 'markValid() does not remove aria-invalid from field' },
  { id: 'nav-close-expanded',       keywords: ['nav close expanded', 'aria-expanded false', 'nav trigger close'],      description: 'Mobile nav close() does not set aria-expanded="false" on trigger' },
  { id: 'nav-init-expanded',        keywords: ['nav init', 'initial aria-expanded', 'nav initialise'],                 description: 'Mobile nav init() does not set initial aria-expanded="false"' },
  { id: 'nav-init-controls',        keywords: ['aria-controls', 'nav init controls', 'trigger controls'],              description: 'Mobile nav init() does not set aria-controls on trigger' },
  { id: 'dropdown-close-expanded',  keywords: ['dropdown close', 'aria-expanded false dropdown', 'close instance'],    description: 'Dropdown _closeInstance() does not set aria-expanded="false"' },
  { id: 'scroll-top-announce',      keywords: ['scroll to top', 'scrolled to top', 'scroll announce'],                 description: 'scrollToTop does not announce scroll to screen readers' },
  { id: 'scroll-btn-hidden',        keywords: ['aria-hidden', 'scroll button', 'scroll top button', 'hidden attr'],    description: 'ScrollToTop init() does not set aria-hidden="true" on hidden button' },
  { id: 'search-submit-announce',   keywords: ['searching for', 'search submit', 'form submit announce'],              description: 'Search _onFormSubmit() does not announce "Searching for…"' },
  { id: 'search-clear-announce',    keywords: ['search cleared', 'clear search', 'search clear announce'],             description: 'Search clear() does not announce "Search cleared"' },
  { id: 'filter-result-announce',   keywords: ['products filtered', 'filter result', 'filter count announce'],         description: 'Product filter does not announce result count after filtering' },
  { id: 'view-mode-announce',       keywords: ['view mode', 'view changed', 'list view announce'],                     description: 'Product view mode change does not announce new mode' },
  { id: 'filter-reset-announce',    keywords: ['filters reset', 'reset filter', 'filter reset announce'],              description: 'resetFilters() does not announce "Filters reset"' },
  { id: 'billing-period-announce',  keywords: ['billing period', 'period changed', 'billing announce'],                description: 'Pricing billing period change does not announce new period' },
  { id: 'comparison-expand-announce',keywords:['comparison table', 'table expanded', 'comparison announce'],           description: 'Comparison table expansion does not announce to screen readers' },
  { id: 'scroll-to-plan-announce',  keywords: ['scroll to plan', 'viewing plan', 'plan announce'],                     description: 'scrollToPlan() does not announce the highlighted plan' },
  { id: 'faq-open-announce',        keywords: ['faq opened', 'answer expanded', 'faq open announce'],                  description: 'FAQ accordion open() does not announce item expansion' },
  { id: 'faq-open-all-announce',    keywords: ['all answers', 'all expanded', 'open all announce'],                    description: 'FAQ openAll() does not announce "All answers expanded"' },
  { id: 'faq-close-all-announce',   keywords: ['all collapsed', 'all answers collapsed', 'close all announce'],        description: 'FAQ closeAll() does not announce "All answers collapsed"' },
  { id: 'shortcut-search-announce', keywords: ['search focused', 'alt+s', 'keyboard shortcut announce'],               description: 'Alt+S keyboard shortcut does not announce focus to screen readers' },
  { id: 'combobox-expanded',        keywords: ['combobox', 'aria-expanded combobox', 'search combobox'],               description: 'Search combobox init() does not set initial aria-expanded="false"' },
];

const JS_HIGH_EXTRA: IssueConcept[] = [
  { id: 'nav-open-announce',        keywords: ['navigation opened', 'menu opened', 'nav open announce'],               description: 'Mobile nav open() does not announce menu opening' },
  { id: 'dropdown-close-focus',     keywords: ['dropdown return focus', 'trigger focus', 'return focus'],              description: 'Dropdown _closeInstance() does not return focus to trigger' },
  { id: 'dropdown-register-expanded',keywords:['dropdown register', 'aria-expanded register', 'initial expanded'],     description: 'Dropdown register() does not set initial aria-expanded="false"' },
  { id: 'scroll-btn-show-hidden',   keywords: ['aria-hidden false', 'scroll button show', 'button visible'],           description: 'ScrollToTop does not clear aria-hidden="false" when button shown' },
  { id: 'scroll-btn-hide-hidden',   keywords: ['aria-hidden true', 'scroll button hide', 'button hidden'],             description: 'ScrollToTop does not set aria-hidden="true" when button hidden' },
  { id: 'breadcrumb-current',       keywords: ['breadcrumb', 'aria-current', 'current page breadcrumb'],               description: 'Breadcrumb does not set aria-current="page" on last item' },
  { id: 'breadcrumb-separator',     keywords: ['breadcrumb separator', 'separator hidden', 'aria-hidden separator'],   description: 'Breadcrumb separators not hidden from assistive tech' },
  { id: 'shortcut-nav-announce',    keywords: ['navigation focused', 'alt+n', 'nav shortcut announce'],                description: 'Alt+N keyboard shortcut does not announce focus' },
  { id: 'shortcut-main-announce',   keywords: ['main content focused', 'alt+m', 'main shortcut announce'],             description: 'Alt+M keyboard shortcut does not announce focus' },
  { id: 'shortcut-footer-announce', keywords: ['footer focused', 'alt+f', 'footer shortcut announce'],                 description: 'Alt+F keyboard shortcut does not announce focus' },
  { id: 'suggestions-show-expanded',keywords: ['suggestion list', 'aria-expanded true suggestions', 'render suggestions'], description: 'Search suggestions render() does not set aria-expanded="true"' },
  { id: 'suggestions-aria-selected',keywords: ['aria-selected suggestion', 'option selected', 'active suggestion'],    description: 'Search setActiveIndex() does not update aria-selected on items' },
  { id: 'suggestions-show-expanded2',keywords:['show suggestions', 'listbox show', 'show expanded'],                   description: 'Search show() does not set aria-expanded="true" on input' },
  { id: 'suggestions-hide-expanded',keywords: ['hide suggestions', 'aria-expanded false suggestions', 'listbox hide'], description: 'Search hide() does not clear aria-expanded and aria-activedescendant' },
  { id: 'suggestion-navigate-announce',keywords:['navigating to', 'navigate announce', 'suggestion selected'],        description: '_selectSuggestion() does not announce navigation to screen readers' },
  { id: 'card-reduced-hidden',      keywords: ['reduced motion', 'aria-hidden card', 'hidden card'],                   description: 'Product cards not given aria-hidden="true" in reduced-motion branch' },
  { id: 'pagination-aria-label',    keywords: ['pagination label', 'aria-label pagination', 'page indicator'],         description: 'Pagination element aria-label not updated on page change' },
  { id: 'pricing-aria-selected',    keywords: ['aria-selected billing', 'period selected', 'billing selected'],        description: 'Pricing _syncToggleState() does not set aria-selected on buttons' },
  { id: 'pricing-aria-checked',     keywords: ['aria-checked', 'toggle switch', 'billing checked'],                    description: 'Pricing toggle switch does not set aria-checked' },
  { id: 'comparison-col-selected',  keywords: ['aria-selected column', 'comparison column', 'highlighted column'],     description: 'Comparison table column header not given aria-selected when highlighted' },
  { id: 'toast-role-missing',        keywords: ['toast', 'toast container', 'role status', 'inittoastcontainer', 'live region toast'],             description: 'initToastContainer() sets aria-atomic but omits role="status" and aria-live="polite"' },
];

const JS_LOW: FixtureGroundTruth = {
  fixtureId:      'js-low',
  filePath:       F('js', 'js-low.js'),
  languageId:     'javascript',
  isClean:        false,
  expectedIssues: JS_LOW_ISSUES,
};

const JS_MEDIUM: FixtureGroundTruth = {
  fixtureId:      'js-medium',
  filePath:       F('js', 'js-medium.js'),
  languageId:     'javascript',
  isClean:        false,
  expectedIssues: [...JS_LOW_ISSUES, ...JS_MEDIUM_EXTRA],
};

const JS_HIGH: FixtureGroundTruth = {
  fixtureId:      'js-high',
  filePath:       F('js', 'js-high.js'),
  languageId:     'javascript',
  isClean:        false,
  expectedIssues: [...JS_LOW_ISSUES, ...JS_MEDIUM_EXTRA, ...JS_HIGH_EXTRA],
};

// ─────────────────────────────────────────────────────────────────────────────
// TSX  (cumulative, same as HTML / CSS / JS)
// ─────────────────────────────────────────────────────────────────────────────

const TSX_CLEAN: FixtureGroundTruth = {
  fixtureId:      'tsx-clean',
  filePath:       F('tsx', 'tsx-clean.tsx'),
  languageId:     'typescriptreact',
  isClean:        true,
  expectedIssues: [],
};

const TSX_LOW_ISSUES: IssueConcept[] = [
  { id: 'textinput-aria-invalid',   keywords: ['aria-invalid', 'textinput', 'text input', 'invalid input'],            description: 'TextInput component removes aria-invalid' },
  { id: 'nav-dropdown-expanded',    keywords: ['aria-expanded', 'nav dropdown', 'dropdown trigger'],                   description: 'NavDropdown trigger button missing aria-expanded' },
  { id: 'hero-media-hidden',        keywords: ['hero media', 'aria-hidden', 'decorative video', 'hero section media'], description: 'Hero media div missing aria-hidden="true"' },
  { id: 'video-aria-pressed',       keywords: ['aria-pressed', 'video button', 'pause', 'play'],                       description: 'Video play/pause button missing aria-pressed' },
  { id: 'filter-tab-pressed',       keywords: ['aria-pressed', 'filter tab', 'category filter', 'active filter'],      description: 'Product filter tab buttons missing aria-pressed' },
  { id: 'billing-monthly-pressed',  keywords: ['aria-pressed', 'monthly', 'billing button'],                           description: 'Billing "Monthly" button missing aria-pressed' },
  { id: 'billing-annual-pressed',   keywords: ['aria-pressed', 'annual', 'billing toggle'],                            description: 'Billing "Annual" button missing aria-pressed' },
  { id: 'carousel-slide-hidden',    keywords: ['aria-hidden', 'carousel slide', 'hidden slide', 'testimonial slide'],  description: 'Non-visible carousel slides missing aria-hidden' },
  { id: 'faq-trigger-expanded',     keywords: ['aria-expanded', 'faq trigger', 'accordion', 'faq button'],             description: 'FAQ accordion trigger button missing aria-expanded' },
  { id: 'newsletter-aria-required', keywords: ['aria-required', 'newsletter', 'email required'],                       description: 'Newsletter email input missing aria-required="true"' },
];

const TSX_MEDIUM_EXTRA: IssueConcept[] = [
  { id: 'skip-links-label',         keywords: ['skip links', 'skip navigation', 'nav aria-label skip'],                description: 'SkipLinks nav missing aria-label' },
  { id: 'textarea-aria-invalid',    keywords: ['textarea', 'aria-invalid', 'invalid textarea'],                        description: 'Textarea component removes aria-invalid' },
  { id: 'checkbox-aria-invalid',    keywords: ['checkbox', 'aria-invalid', 'invalid checkbox'],                        description: 'Checkbox component removes aria-invalid' },
  { id: 'site-logo-label',          keywords: ['site logo', 'logo link', 'aria-label', 'homepage link'],               description: 'SiteLogo anchor missing aria-label' },
  { id: 'desktop-nav-current',      keywords: ['aria-current', 'desktop nav', 'nav link', 'current page'],             description: 'Desktop nav links missing aria-current="page"' },
  { id: 'mobile-nav-modal',         keywords: ['aria-modal', 'mobile nav panel', 'dialog modal'],                      description: 'Mobile nav panel missing aria-modal="true"' },
  { id: 'mobile-section-expanded',  keywords: ['mobile nav section', 'aria-expanded', 'section toggle'],               description: 'Mobile nav section toggle button missing aria-expanded' },
  { id: 'mobile-nav-current',       keywords: ['mobile nav link', 'aria-current', 'mobile link'],                      description: 'Mobile nav links missing aria-current="page"' },
  { id: 'hamburger-expanded',       keywords: ['hamburger', 'aria-expanded', 'menu button', 'mobile toggle'],          description: 'Mobile hamburger toggle missing aria-expanded' },
  { id: 'hero-section-labelledby',  keywords: ['hero section', 'aria-labelledby', 'hero heading'],                     description: 'HeroSection <section> missing aria-labelledby' },
  { id: 'hero-ctas-label',          keywords: ['hero cta', 'get started options', 'ctas label'],                       description: 'Hero CTAs div missing aria-label' },
  { id: 'hero-trust-label',         keywords: ['trust indicators', 'trust label', 'trust div'],                        description: 'Hero trust div missing aria-label="Trust indicators"' },
  { id: 'stat-value-label',         keywords: ['stat value', 'aria-label stat', 'statistic label', 'valuelabel'],      description: 'StatItem value <p> missing aria-label for formatted number' },
  { id: 'stats-bar-labelledby',     keywords: ['stats bar', 'stats section', 'aria-labelledby stats'],                 description: 'StatsBar <section> missing aria-labelledby' },
  { id: 'integrations-clone-hidden',keywords: ['integrations clone', 'aria-hidden list', 'duplicate list'],            description: 'Integrations clone <ul> missing aria-hidden="true"' },
  { id: 'plan-card-label',          keywords: ['recommended plan', 'plan card li', 'featured plan'],                   description: 'Featured plan card <li> missing aria-label="Recommended plan"' },
  { id: 'plan-article-labelledby',  keywords: ['plan article', 'pricing article', 'aria-labelledby plan'],             description: 'Plan card <article> missing aria-labelledby' },
  { id: 'plan-cta-label',           keywords: ['plan cta', 'get started plan', 'cta aria-label'],                      description: 'Plan CTA link missing descriptive aria-label' },
  { id: 'carousel-prev-label',      keywords: ['previous testimonial', 'carousel prev', 'prev button'],                description: 'Carousel "Previous" button missing aria-label' },
  { id: 'carousel-next-label',      keywords: ['next testimonial', 'carousel next', 'next button'],                    description: 'Carousel "Next" button missing aria-label' },
];

const TSX_HIGH_EXTRA: IssueConcept[] = [
  { id: 'star-rating-role',         keywords: ['star rating', 'role img', 'rating role'],                              description: 'StarRating span missing role="img"' },
  { id: 'star-inner-hidden',        keywords: ['star rating', 'aria-hidden', 'decorative stars', 'inner span'],        description: 'StarRating inner span missing aria-hidden="true"' },
  { id: 'button-aria-busy',         keywords: ['aria-busy', 'loading button', 'button busy'],                          description: 'Button component missing aria-busy during loading' },
  { id: 'spinner-icon-hidden',      keywords: ['btn-spinner', 'aria-hidden', 'spinner'],                               description: 'Button spinner span missing aria-hidden="true"' },
  { id: 'spinner-ring-hidden',      keywords: ['spinner ring', 'aria-hidden', 'spinner component'],                    description: 'Spinner ring span missing aria-hidden="true"' },
  { id: 'error-msg-role',           keywords: ['error message', 'role alert', 'field error'],                          description: 'ErrorMessage span missing role="alert"' },
  { id: 'form-label-for',           keywords: ['label htmlfor', 'label association', 'form group label'],              description: 'FormGroup label missing htmlFor — not programmatically associated' },
  { id: 'required-marker-hidden',   keywords: ['required marker', 'form-required-marker', 'aria-hidden marker'],       description: 'Required marker span missing aria-hidden="true"' },
  { id: 'select-aria-invalid',      keywords: ['select invalid', 'aria-invalid select', 'select element'],             description: 'Select component missing aria-invalid' },
  { id: 'section-labelledby',       keywords: ['page section', 'section labelledby', 'aria-labelledby section'],       description: 'Section component missing aria-labelledby' },
  { id: 'nav-chevron-hidden',       keywords: ['chevron', 'nav dropdown chevron', 'arrow aria-hidden'],                description: 'NavDropdown chevron span missing aria-hidden="true"' },
  { id: 'nav-submenu-labelledby',   keywords: ['submenu', 'aria-labelledby submenu', 'nav submenu'],                   description: 'NavDropdown submenu <ul> missing aria-labelledby' },
  { id: 'desktop-nav-label',        keywords: ['desktop nav label', 'main navigation label', 'nav aria-label'],        description: 'DesktopNav <nav> missing aria-label="Main navigation"' },
  { id: 'mobile-backdrop-hidden',   keywords: ['mobile backdrop', 'backdrop aria-hidden', 'mobile overlay'],           description: 'Mobile nav backdrop div missing aria-hidden="true"' },
  { id: 'mobile-close-label',       keywords: ['close navigation', 'mobile close button', 'close nav'],                description: 'Mobile nav close IconButton missing aria-label' },
  { id: 'mobile-nav-body-label',    keywords: ['mobile navigation label', 'mobile nav body', 'nav aria-label mobile'], description: 'Mobile nav body <nav> missing aria-label="Mobile navigation"' },
  { id: 'theme-toggle-label',       keywords: ['theme toggle', 'aria-label theme', 'dark mode button'],                description: 'ThemeToggle IconButton missing aria-label' },
  { id: 'search-form-role',         keywords: ['role search', 'search form', 'search landmark'],                       description: 'SearchInput form missing role="search"' },
  { id: 'account-actions-label',    keywords: ['account actions', 'site-header ctas', 'header cta label'],             description: 'Account actions div missing aria-label="Account actions"' },
  { id: 'hero-overlay-hidden',      keywords: ['hero overlay', 'overlay aria-hidden', 'hero section overlay'],         description: 'Hero overlay div missing aria-hidden="true"' },
  { id: 'notification-live',         keywords: ['notificationcontainer', 'notification container', 'aria-live notification', 'toast live', 'aria-live polite'], description: 'NotificationContainer missing aria-live="polite" attribute' },
];

const TSX_LOW: FixtureGroundTruth = {
  fixtureId:      'tsx-low',
  filePath:       F('tsx', 'tsx-low.tsx'),
  languageId:     'typescriptreact',
  isClean:        false,
  expectedIssues: TSX_LOW_ISSUES,
};

const TSX_MEDIUM: FixtureGroundTruth = {
  fixtureId:      'tsx-medium',
  filePath:       F('tsx', 'tsx-medium.tsx'),
  languageId:     'typescriptreact',
  isClean:        false,
  expectedIssues: [...TSX_LOW_ISSUES, ...TSX_MEDIUM_EXTRA],
};

const TSX_HIGH: FixtureGroundTruth = {
  fixtureId:      'tsx-high',
  filePath:       F('tsx', 'tsx-high.tsx'),
  languageId:     'typescriptreact',
  isClean:        false,
  expectedIssues: [...TSX_LOW_ISSUES, ...TSX_MEDIUM_EXTRA, ...TSX_HIGH_EXTRA],
};

// ─────────────────────────────────────────────────────────────────────────────
// Adversarial Edge-Case Fixtures  (Step 6 — Vulnerability Analysis)
// Each fixture isolates a single accessibility violation.
//
// ADVERSARIAL_BOILERPLATE: issues present in every minimal HTML snippet
// (no <html lang>, no <title>, no <main>) — every adversarial fixture is a
// bare code snippet so these are genuinely missing in each file.
// ─────────────────────────────────────────────────────────────────────────────

const ADVERSARIAL_BOILERPLATE: IssueConcept[] = [
  { id: 'html-lang-missing',    keywords: ['lang attribute', 'missing lang', 'html lang'],              description: '<html> missing lang attribute' },
  { id: 'title-empty',          keywords: ['page title', 'empty title', 'title element'],               description: '<title> element is empty or missing' },
  { id: 'main-element-missing', keywords: ['main element', 'main landmark', 'main role', 'landmark'],  description: 'Page missing <main> landmark element' },
  { id: 'skip-link-absent',     keywords: ['skip link', 'skip navigation', 'no skip', 'skip-link missing', 'bypass navigation'], description: 'Page has no skip link — keyboard users cannot bypass navigation' },
];

const ADVERSARIAL_FIXTURES: FixtureGroundTruth[] = [
  // ── Buttons ──────────────────────────────────────────────────────────────
  {
    fixtureId: 'button-no-name',
    filePath:  A('button-no-name.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'button-name-missing', keywords: ['button name', 'accessible name', 'empty button', 'no text'], description: 'Button has no accessible name' },
    ],
  },
  {
    fixtureId: 'button-icon-only',
    filePath:  A('button-icon-only.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'button-icon-no-label', keywords: ['icon button', 'svg button', 'aria-label', 'accessible name'], description: 'Icon-only button with no aria-label' },
    ],
  },
  {
    fixtureId: 'button-aria-label-mismatch',
    filePath:  A('button-aria-label-mismatch.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'button-label-mismatch', keywords: ['label mismatch', 'visible label', 'aria-label', 'accessible name mismatch'], description: 'aria-label differs from visible button text' },
    ],
  },
  {
    fixtureId: 'button-disabled-no-state',
    filePath:  A('button-disabled-no-state.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'button-disabled-no-aria', keywords: ['aria-disabled', 'disabled state', 'disabled button', 'pointer-events'], description: 'Button styled disabled but aria-disabled not set' },
    ],
  },
  {
    fixtureId: 'complex-nested-buttons',
    filePath:  A('complex-nested-buttons.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'nested-button', keywords: ['nested button', 'button inside button', 'interactive nesting', 'invalid nesting'], description: 'Button nested inside another button' },
    ],
  },

  // ── Forms ─────────────────────────────────────────────────────────────────
  {
    fixtureId: 'input-no-label',
    filePath:  A('input-no-label.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'input-label-missing', keywords: ['input label', 'missing label', 'label element', 'form label'], description: 'Input field with no label element' },
    ],
  },
  {
    fixtureId: 'input-placeholder-as-label',
    filePath:  A('input-placeholder-as-label.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'input-placeholder-only', keywords: ['placeholder', 'label missing', 'placeholder as label', 'no label'], description: 'Input uses only placeholder instead of a label' },
    ],
  },
  {
    fixtureId: 'form-no-submit-label',
    filePath:  A('form-no-submit-label.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'submit-button-no-name', keywords: ['submit button', 'button name', 'accessible name', 'icon submit'], description: 'Submit button has no accessible name' },
    ],
  },
  {
    fixtureId: 'form-error-no-aria',
    filePath:  A('form-error-no-aria.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'error-not-associated', keywords: ['aria-describedby', 'error message', 'error association', 'input error'], description: 'Error message not associated with input via aria-describedby' },
      { id: 'input-label-missing',  keywords: ['input label', 'missing label', 'label element', 'label for email', 'missing associated', 'id="email"'], description: 'Email input has no associated <label> element' },
    ],
  },

  // ── Images ────────────────────────────────────────────────────────────────
  {
    fixtureId: 'image-no-alt',
    filePath:  A('image-no-alt.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'image-alt-missing', keywords: ['alt text', 'missing alt', 'image alt', 'alt attribute'], description: 'Image with no alt attribute' },
    ],
  },
  {
    // image-empty-alt: alt="" with role="presentation" is correct for decorative
    // images — the specific image pattern IS accessible. However the bare snippet
    // still lacks lang, title and main, so it is not a fully clean page.
    fixtureId: 'image-empty-alt',
    filePath:  A('image-empty-alt.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
    ],
  },
  {
    fixtureId: 'image-link-no-alt',
    filePath:  A('image-link-no-alt.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'image-link-no-name', keywords: ['image link', 'link alt', 'link accessible name', 'image alt', 'missing alt'], description: 'Image inside link with no alt makes link inaccessible' },
    ],
  },
  {
    fixtureId: 'svg-no-title',
    filePath:  A('svg-no-title.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'svg-no-title', keywords: ['svg title', 'svg accessible', 'svg aria', 'svg role img'], description: 'SVG missing title or aria-label' },
    ],
  },

  // ── Headings ──────────────────────────────────────────────────────────────
  {
    fixtureId: 'heading-skip-level',
    filePath:  A('heading-skip-level.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'heading-skip', keywords: ['heading level', 'heading skip', 'skipped heading', 'h4'], description: 'Heading jumps from h2 to h4, skipping h3' },
    ],
  },
  {
    fixtureId: 'heading-styled-as-div',
    filePath:  A('heading-styled-as-div.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'fake-heading', keywords: ['semantic heading', 'fake heading', 'div heading', 'heading element'], description: 'Div styled to look like heading but not semantic' },
    ],
  },
  {
    fixtureId: 'missing-page-title',
    filePath:  A('missing-page-title.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'no-page-title',        keywords: ['page title', 'title element', 'empty title', 'missing title', 'is empty or missing'], description: 'Page title is empty' },
      { id: 'empty-title',          keywords: ['empty title', 'title empty', 'blank title', 'title element', 'is empty or missing'], description: '<title> element has no content' },
    ],
  },

  // ── ARIA ──────────────────────────────────────────────────────────────────
  {
    fixtureId: 'aria-hidden-focusable',
    filePath:  A('aria-hidden-focusable.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'aria-hidden-focusable', keywords: ['aria-hidden', 'focusable', 'keyboard focus', 'hidden focusable'], description: 'aria-hidden element contains a focusable button' },
    ],
  },
  {
    fixtureId: 'invalid-aria-role',
    filePath:  A('invalid-aria-role.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'invalid-role', keywords: ['invalid role', 'aria role', 'misspelled role', 'role value'], description: 'Element has invalid or misspelled ARIA role' },
    ],
  },
  {
    fixtureId: 'aria-label-with-image',
    filePath:  A('aria-label-with-image.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'image-alt-missing',    keywords: ['alt text', 'missing alt', 'alt attribute'],              description: 'Image missing alt attribute' },
      { id: 'aria-label-for-image', keywords: ['aria-label image', 'alt not aria-label', 'image label'], description: 'aria-label used instead of alt on img element' },
    ],
  },
  {
    fixtureId: 'aria-live-no-polite',
    filePath:  A('aria-live-no-polite.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'aria-live-no-level', keywords: ['aria-live', 'polite', 'live region', 'assertive'], description: 'aria-live region missing politeness level' },
    ],
  },
  {
    fixtureId: 'complex-aria-modal',
    filePath:  A('complex-aria-modal.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'modal-no-role',  keywords: ['dialog role', 'modal role', 'role dialog', 'aria-modal'], description: 'Modal missing role="dialog"' },
      { id: 'modal-no-focus', keywords: ['focus management', 'modal focus', 'focus trap', 'dialog focus'], description: 'Modal missing focus management' },
    ],
  },

  // ── Links ─────────────────────────────────────────────────────────────────
  {
    fixtureId: 'link-non-descriptive',
    filePath:  A('link-non-descriptive.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'link-text-generic', keywords: ['click here', 'link text', 'non-descriptive link', 'vague link'], description: 'Link uses non-descriptive "click here" text' },
    ],
  },
  {
    // link-icon-only: the link itself is accessible (has aria-label) but the
    // bare snippet still lacks lang, title and main.
    fixtureId: 'link-icon-only',
    filePath:  A('link-icon-only.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
    ],
  },
  {
    fixtureId: 'link-opens-new-window',
    filePath:  A('link-opens-new-window.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'link-new-tab-no-warning', keywords: ['new tab', 'target blank', 'opens new', 'new window warning'], description: 'Link opens in new tab without warning user' },
    ],
  },

  // ── Tables ────────────────────────────────────────────────────────────────
  {
    fixtureId: 'complex-table-no-headers',
    filePath:  A('complex-table-no-headers.html'),
    languageId: 'html',
    isClean:   false,
    expectedIssues: [
      ...ADVERSARIAL_BOILERPLATE,
      { id: 'table-no-headers',       keywords: ['table header', 'th element', 'table scope', 'thead', 'column header'], description: 'Data table missing header elements' },
      { id: 'table-caption-missing2', keywords: ['table caption', 'caption element', 'table title', 'no caption', 'missing caption', 'no accessible table'], description: 'Data table also missing <caption>' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const CORE_FIXTURES: FixtureGroundTruth[] = [
  HTML_CLEAN,
  HTML_LOW,
  HTML_MEDIUM,
  HTML_HIGH,
  CSS_CLEAN,
  CSS_LOW,
  CSS_MEDIUM,
  CSS_HIGH,
  JS_CLEAN,
  JS_LOW,
  JS_MEDIUM,
  JS_HIGH,
  TSX_CLEAN,
  TSX_LOW,
  TSX_MEDIUM,
  TSX_HIGH,
];

export const ALL_FIXTURES: FixtureGroundTruth[] = [
  ...CORE_FIXTURES,
  ...ADVERSARIAL_FIXTURES,
];

export { ADVERSARIAL_FIXTURES };

export const FIXTURE_MAP = new Map<string, FixtureGroundTruth>(
  ALL_FIXTURES.map(f => [f.fixtureId, f])
);
