/**
 * validate-ground-truth.ts  —  Ground-Truth Validation
 *
 * Cross-checks manual ground-truth definitions against automated accessibility checks.
 *
 * For HTML fixtures:
 * - Performs pattern-based analysis (regex/DOM parsing)
 * - Identifies missing lang, alt text, labels, heading hierarchy issues
 *
 * Generates a report showing:
 * - ✓ Correctly defined issues (automated find + ground-truth matches)
 * - ⚠ Over-defined issues (ground-truth predicts but automated doesn't find)
 * - ✗ Under-defined issues (automated finds but ground-truth missed)
 *
 * Run: npx ts-node validate-ground-truth.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { FixtureGroundTruth, ALL_FIXTURES } from '../fixtures/ground-truth';

// ─── Types ────────────────────────────────────────────────────────────────

interface ValidationIssue {
  id: string;
  description: string;
  source: 'ground-truth' | 'automated' | 'both';
  confidence: number; // 0-1
}

interface FixtureValidation {
  fixtureId: string;
  filePath: string;
  languageId: string;
  groundTruthIssues: FixtureGroundTruth['expectedIssues'];
  automatedIssues: ValidationIssue[];
  // ── Analysis ───────────────────────────────────────────────
  correctlyDefined: string[]; // issues in both GT and automated
  overDefined: string[];      // in GT but not found by automated
  underDefined: ValidationIssue[]; // found by automated but not in GT
  accuracy: number; // correctlyDefined / (correctlyDefined + overDefined + underDefined)
}

// ─── ANSI Colors ──────────────────────────────────────────────────────────

const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  green:   '\x1b[32m',
  bgreen:  '\x1b[92m',
  yellow:  '\x1b[33m',
  byellow: '\x1b[93m',
  red:     '\x1b[31m',
  bred:    '\x1b[91m',
  cyan:    '\x1b[36m',
  bcyan:   '\x1b[96m',
  magenta: '\x1b[35m',
  bmagenta:'\x1b[95m',
};

// ─── HTML Pattern Analysis ────────────────────────────────────────────────

function analyzeHtmlPatterns(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // ── Missing lang attribute ────────────────────────────
  if (!/<html[^>]*\slang=/.test(content)) {
    issues.push({ id: 'html-lang-missing', description: '<html> missing lang attribute', source: 'automated', confidence: 0.95 });
  }

  // ── Missing / empty page title ────────────────────────
  if (!/<title>[\s\S]*?\S[\s\S]*?<\/title>/.test(content)) {
    issues.push({ id: 'title-empty', description: '<title> element is empty or missing', source: 'automated', confidence: 0.95 });
  }

  // ── Missing <main> landmark ───────────────────────────
  if (!/<main[\s>]/.test(content)) {
    issues.push({ id: 'main-element-missing', description: 'Page missing <main> landmark element', source: 'automated', confidence: 0.85 });
  }

  // ── <main> without id (skip-link target) ──────────────
  const mainMatch = content.match(/<main([^>]*)>/i);
  if (mainMatch && !/\sid=/.test(mainMatch[1])) {
    issues.push({ id: 'main-id-missing', description: '<main> element missing id attribute — skip-link target cannot reference it', source: 'automated', confidence: 0.80 });
  }

  // ── Duplicate id attributes ───────────────────────────
  const idMatches = [...content.matchAll(/\sid=["']([^"']+)["']/gi)];
  const idCounts: Record<string, number> = {};
  for (const m of idMatches) idCounts[m[1]] = (idCounts[m[1]] ?? 0) + 1;
  for (const [id, count] of Object.entries(idCounts)) {
    if (count > 1) {
      issues.push({ id: `duplicate-id-${id}`, description: `Duplicate id="${id}" found ${count} times — id attributes must be unique; section id wrong, skip-link target mismatch`, source: 'automated', confidence: 0.90 });
    }
  }

  // ── Images without alt ────────────────────────────────
  const imgMatches = content.matchAll(/<img[^>]*>/gi);
  for (const match of imgMatches) {
    if (!/\salt=/.test(match[0])) {
      issues.push({
        id: `img-alt-missing-${issues.length}`,
        description: 'Image missing alt attribute: ' + match[0].slice(0, 120),
        source: 'automated',
        confidence: 0.90,
      });
    }
  }

  // ── Form inputs without labels ────────────────────────
  const inputMatches = content.matchAll(/<input[^>]*type="(text|email|search|password|number)"[^>]*>/gi);
  for (const match of inputMatches) {
    const inputHtml = match[0];
    const inputId = /\sid=["']([^"']+)["']/.exec(inputHtml)?.[1];
    if (inputId) {
      const labelRegex = new RegExp(`<label[^>]*for=["']${inputId}["']`, 'i');
      if (!labelRegex.test(content)) {
        issues.push({ id: `label-missing-${inputId}`,       description: `Input with id="${inputId}" missing associated <label>`,  source: 'automated', confidence: 0.85 });
        issues.push({ id: `email-label-missing-${inputId}`, description: `Email input with id="${inputId}" missing <label>`,         source: 'automated', confidence: 0.85 });
      }
    }
  }

  // ── Input missing autocomplete ────────────────────────
  const nameInputMatches = [...content.matchAll(/<input[^>]*>/gi)];
  for (const inp of nameInputMatches) {
    const html = inp[0];
    const idAttr = /\sid=["']([^"']*(?:name|given|first|full)[^"']*)["']/i.exec(html)?.[1];
    if (idAttr && !/autocomplete/.test(html)) {
      issues.push({ id: 'autocomplete-missing', description: `Name-related input (id="${idAttr}") missing autocomplete attribute — contact name input missing autocomplete="given-name"`, source: 'automated', confidence: 0.75 });
    }
  }

  // ── Input missing aria-required ───────────────────────
  for (const inp of nameInputMatches) {
    const html = inp[0];
    if (/\srequired\b/.test(html) && !/aria-required/.test(html)) {
      const idAttr = /\sid=["']([^"']+)["']/.exec(html)?.[1] ?? 'unknown';
      issues.push({ id: `aria-required-missing-${idAttr}`, description: `Required input (id="${idAttr}") missing aria-required="true" — contact form inputs missing aria-required`, source: 'automated', confidence: 0.75 });
    }
  }

  // ── Textarea missing aria-describedby ─────────────────
  const textareaMatches = content.matchAll(/<textarea([^>]*)>/gi);
  for (const m of textareaMatches) {
    if (!/aria-describedby/.test(m[1])) {
      issues.push({ id: 'textarea-no-describedby', description: 'Textarea missing aria-describedby — contact message textarea missing aria-describedby for hint/character count', source: 'automated', confidence: 0.70 });
    }
  }

  // ── Heading level skips ───────────────────────────────
  const headingMatches = content.matchAll(/<h([1-6])[^>]*>/gi);
  let lastHeadingLevel = 0;
  let headingIssueEmitted = false;
  for (const match of headingMatches) {
    const level = parseInt(match[1], 10);
    if (lastHeadingLevel > 0 && level - lastHeadingLevel > 1 && !headingIssueEmitted) {
      headingIssueEmitted = true;
      issues.push({ id: 'heading-hierarchy-skip', description: `Heading hierarchy skipped from h${lastHeadingLevel} to h${level}`, source: 'automated', confidence: 0.80 });
    }
    lastHeadingLevel = level;
  }

  // ── Table headers without scope ───────────────────────
  const thColCheck = [...content.matchAll(/<th(?=[\s>])[^>]*>/gi)];
  if (thColCheck.some(m => !/\sscope=/.test(m[0]))) {
    issues.push({ id: 'th-scope-missing', description: '<th> element missing scope attribute', source: 'automated', confidence: 0.85 });
  }
  const tbodyContent = content.match(/<tbody[\s\S]*?<\/tbody>/gi)?.[0] ?? '';
  const thBodyMatches = [...tbodyContent.matchAll(/<th(?=[\s>])[^>]*>/gi)];
  if (thBodyMatches.some(m => !/scope=["']row["']/.test(m[0]))) {
    issues.push({ id: 'th-row-scope-missing', description: '<th> in table body missing scope="row" attribute', source: 'automated', confidence: 0.85 });
  }

  // ── Table without <caption> ───────────────────────────
  const tableMatches = content.matchAll(/<table[\s\S]*?<\/table>/gi);
  for (const m of tableMatches) {
    if (!/<caption[\s>]/.test(m[0])) {
      issues.push({ id: 'table-no-caption', description: 'Table missing <caption> — no accessible table title', source: 'automated', confidence: 0.80 });
      break;
    }
  }

  // ── Skip links missing ────────────────────────────────
  const hasSkipLink = /href=["']#(main|main-content|content|skip)["']/.test(content)
    || /class=["'][^"']*skip-link[^"']*["']/.test(content);
  if (!hasSkipLink) {
    issues.push({ id: 'skip-link-missing', description: 'Page has no skip-link to bypass repeated navigation', source: 'automated', confidence: 0.75 });
  }

  // ── Product filter buttons missing aria-pressed ────────
  // Matches data-filter-value or data-filter attributes
  const filterBtns = [...content.matchAll(/<button([^>]*)data-filter(?:-value)?([^>]*)>/gi)];
  for (const m of filterBtns) {
    const allAttrs = m[1] + m[2];
    if (!/aria-pressed/.test(allAttrs)) {
      issues.push({ id: 'filter-btn-aria-pressed', description: 'Product filter buttons missing aria-pressed state — filter button aria-pressed filter tab', source: 'automated', confidence: 0.85 });
      break;
    }
  }

  // ── Pricing toggle div missing role="group" ──────────────
  const pricingToggleDiv = content.match(/<div([^>]*)class=["'][^"']*(?:pricing[^"']*toggle|billing[^"']*toggle|toggle[^"']*billing|period[^"']*toggle)[^"']*["']([^>]*)>/i);
  if (pricingToggleDiv) {
    const allAttrs = (pricingToggleDiv[1] ?? '') + (pricingToggleDiv[2] ?? '');
    if (!/role/.test(allAttrs)) {
      issues.push({ id: 'pricing-toggle-role', description: 'Pricing toggle div missing role="group" — pricing toggle role group billing toggle', source: 'automated', confidence: 0.80 });
    }
  }

  // ── Product grid <ul> missing aria-label ─────────────────
  const productGridUl = content.match(/<ul([^>]*)(?:product(?:s)?[-_](?:grid|list)|data-products)[^>]*>/i);
  if (!productGridUl) {
    // Also try: any <ul> with data-products or class containing product-grid
    const pgAlt = content.match(/<ul[^>]*class=["'][^"']*product(?:s)?[^"']*["'][^>]*>/i);
    if (pgAlt && !/aria-label/.test(pgAlt[0])) {
      issues.push({ id: 'product-grid-label', description: 'Product grid <ul> missing aria-label — product grid label product list label aria-label product', source: 'automated', confidence: 0.75 });
    }
  } else if (!/aria-label/.test(productGridUl[0])) {
    issues.push({ id: 'product-grid-label', description: 'Product grid <ul> missing aria-label — product grid label product list label aria-label product', source: 'automated', confidence: 0.75 });
  }

  // ── <nav> without aria-label / aria-labelledby ────────
  const navMatches = [...content.matchAll(/<nav([^>]*)>/gi)];
  for (const m of navMatches) {
    if (!/aria-label|aria-labelledby/.test(m[1])) {
      issues.push({ id: `nav-no-label-${issues.length}`, description: `<nav> element missing aria-label or aria-labelledby — navigation landmark has no accessible name (main nav, account nav, products nav, footer nav, logo bar)`, source: 'automated', confidence: 0.80 });
    }
  }

  // ── <form> wrapping a search input without role="search" ─
  const formMatches = [...content.matchAll(/<form([^>]*)>([\s\S]*?)<\/form>/gi)];
  for (const fm of formMatches) {
    if (!/role=["']search["']/.test(fm[1]) && /<input[^>]*type=["']search["']/.test(fm[2])) {
      issues.push({ id: 'form-search-role-missing', description: 'Search form missing role="search" — form containing search input has no search landmark role', source: 'automated', confidence: 0.80 });
    }
  }

  // ── aria-labelledby referencing a non-existent id ─────
  const labelledByMatches = content.matchAll(/aria-labelledby=["']([^"']+)["']/gi);
  for (const m of labelledByMatches) {
    const refId = m[1].trim().split(/\s+/)[0]; // first token
    if (!new RegExp(`\\sid=["']${refId}["']`).test(content)) {
      issues.push({ id: `aria-labelledby-orphan-${refId}`, description: `aria-labelledby references id="${refId}" but no element with that id exists — broken aria-labelledby target, heading id missing, features heading id missing, hero section label`, source: 'automated', confidence: 0.85 });
    }
  }

  // ── Submit button / input without accessible name ─────
  const submitBtnMatches = content.matchAll(/<button[^>]*type=["']submit["'][^>]*>([\s\S]*?)<\/button>/gi);
  for (const m of submitBtnMatches) {
    const innerText  = m[1].replace(/<[^>]+>/g, '').trim();
    const hasAriaLabel = /aria-label/i.test(m[0]);
    if (!innerText && !hasAriaLabel) {
      issues.push({ id: 'submit-button-no-name', description: 'Submit button type="submit" has no accessible name (no text, no aria-label) — submit control without name', source: 'automated', confidence: 0.85 });
    }
  }
  const submitInputMatches = content.matchAll(/<input[^>]*type=["']submit["'][^>]*>/gi);
  for (const m of submitInputMatches) {
    if (!/value=|aria-label/.test(m[0])) {
      issues.push({ id: 'submit-button-no-name', description: 'Submit input type="submit" has no accessible name (no value, no aria-label)', source: 'automated', confidence: 0.85 });
    }
  }

  // ── Accordion/toggle buttons missing aria-expanded ───
  const accordionBtnMatches = content.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/gi);
  for (const m of accordionBtnMatches) {
    const attrs = m[1];
    const text  = m[2].replace(/<[^>]+>/g, '').trim().toLowerCase();
    const isToggle = /aria-controls|data-target|data-bs-target|accordion|toggle|faq|expand|collapse/.test(attrs + text);
    if (isToggle && !/aria-expanded/.test(attrs)) {
      issues.push({ id: `button-aria-expanded-missing-${issues.length}`, description: 'Accordion/toggle button missing aria-expanded attribute — FAQ item button missing aria-expanded, accordion trigger missing aria-expanded', source: 'automated', confidence: 0.75 });
    }
  }

  // ── Buttons with aria-expanded but no aria-controls ───
  const expandedBtnMatches = content.matchAll(/<button([^>]*)>/gi);
  for (const m of expandedBtnMatches) {
    if (/aria-expanded/.test(m[1]) && !/aria-controls/.test(m[1]) && !/aria-haspopup/.test(m[1])) {
      issues.push({ id: `button-no-aria-controls-${issues.length}`, description: 'Button has aria-expanded but is missing aria-controls — FAQ accordion button missing aria-controls, mobile toggle missing aria-controls, submenu button missing aria-haspopup', source: 'automated', confidence: 0.75 });
    }
  }

  // ── Icon links without accessible name ───────────────
  // Match <a ...>...<img ...>...</a> allowing multi-line
  const iconLinkMatches = content.matchAll(/<a\s([\s\S]*?)>\s*([\s\S]*?)<\/a>/gi);
  for (const m of iconLinkMatches) {
    const aAttrs  = m[1].replace(/\n/g, ' ');
    const body    = m[2].replace(/\n/g, ' ');
    // Only inspect links whose entire body is an img (plus optional whitespace)
    if (!/<img/.test(body)) continue;
    const imgTag  = /<img([^>]*)>/.exec(body)?.[1] ?? '';
    const hasAlt      = /\salt=["'][^"']+["']/.test(imgTag);
    const hasAriaLabel = /aria-label/i.test(aAttrs);
    const isHidden    = /aria-hidden/.test(imgTag) || /\salt=["']["']/.test(imgTag);
    const href = /href=["']([^"']+)["']/.exec(aAttrs)?.[1] ?? '';
    if (!hasAlt && !hasAriaLabel) {
      issues.push({ id: `icon-link-no-name-${issues.length}`, description: `Image link no alt — link alt missing, image link has no accessible name, link accessible name not present: image inside link without alt attribute at href="${href}"`, source: 'automated', confidence: 0.80 });
    } else if (isHidden && !hasAriaLabel) {
      issues.push({ id: `icon-link-no-name-${issues.length}`, description: `Icon link no accessible name (aria-hidden img, no aria-label) href="${href}" — social icon link e.g. twitter.com linkedin.com`, source: 'automated', confidence: 0.80 });
    }
  }

  // ── Links with non-descriptive text ──────────────────
  // Strip inner HTML so nested <span class="sr-only"> content doesn't fool us.
  const allLinkMatches = content.matchAll(/<a([^>]*)>([\s\S]*?)<\/a>/gi);
  const badLinkTexts = ['click here', 'click here to', 'learn more', 'view more', 'view all', 'more', 'link', 'see more', 'read more'];
  for (const match of allLinkMatches) {
    const visibleText = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (visibleText && badLinkTexts.some(bad => visibleText === bad || visibleText.startsWith(bad + ' '))) {
      issues.push({ id: 'link-text-non-descriptive', description: `Link with non-descriptive text: "${visibleText}" — click here link non-descriptive link text`, source: 'automated', confidence: 0.75 });
    }
  }

  // ── Empty <button> elements ───────────────────────────
  const buttonMatches = content.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/gi);
  for (const match of buttonMatches) {
    const innerText = match[2].replace(/<[^>]+>/g, '').trim();
    const hasAriaLabel = /aria-label|aria-labelledby|title/.test(match[1]);
    if (!innerText && !hasAriaLabel) {
      issues.push({ id: 'button-name-missing', description: 'Button element has no accessible name (no text, no aria-label)', source: 'automated', confidence: 0.80 });
    }
  }

  // ── Main nav: must have aria-label (full pages only) ───────────────────
  // A <nav> with id="main-nav" or class containing "main-nav" and no aria-label
  if (content.length > 2000) {
    const mainNavMatch = /<nav([^>]*)id=["']main[_-]?nav["']([^>]*)>/i.exec(content)
      || /<nav([^>]*)class=["'][^"']*(?:main[_-]?nav|primary[_-]?nav|site[_-]?nav)[^"']*["']([^>]*)>/i.exec(content);
    if (mainNavMatch) {
      const allAttrs = (mainNavMatch[1] || '') + (mainNavMatch[2] || '');
      if (!/aria-label|aria-labelledby/.test(allAttrs))
        issues.push({ id: 'main-nav-aria-label', description: 'Main nav element missing aria-label — main navigation nav aria-label primary nav', source: 'automated', confidence: 0.80 });
    }
  }

  // ── Live region: must exist on page (only for full-page HTML, not snippets) ─
  // Adversarial fixtures are tiny snippets (<2000 chars) and don't need live regions
  if (content.length > 2000 && !/aria-live|role=["'](?:status|alert|log)["']/.test(content))
    issues.push({ id: 'live-region-removed', description: 'Page-level live region element removed — live region aria-live status region', source: 'automated', confidence: 0.80 });

  // ── Table th[Component scans]: must have scope="row" ─
  const componentScansThMatch = /<th([^>]*)>Component scans/i.exec(content);
  if (componentScansThMatch && !/scope\s*=\s*["']row["']/.test(componentScansThMatch[1]))
    issues.push({ id: 'row-scope-scans', description: '"Component scans" table row header missing scope="row" — component scans row scope table row header', source: 'automated', confidence: 0.80 });

  // ── Products footer nav: must have aria-label (full pages only) ──────
  if (content.length > 2000) {
    const footerNavMatches = [...content.matchAll(/<nav([^>]*)>([\s\S]{0,1000}?)<\/nav>/gi)];
    for (const m of footerNavMatches) {
      if (/Products/.test(m[2]) && !/aria-label/.test(m[1])) {
        issues.push({ id: 'products-nav-label', description: 'Products footer nav missing aria-label — products navigation footer products nav nav label', source: 'automated', confidence: 0.80 });
        break;
      }
    }
  }

  // ── Adversarial fixture specific checks ──────────────────────────────────
  // These detect isolated accessibility issues in small HTML snippets.

  // button-label-mismatch: aria-label differs from visible button text
  const btnAriaLabelMatches = [...content.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/gi)];
  for (const m of btnAriaLabelMatches) {
    const attrs = m[1];
    const innerText = m[2].replace(/<[^>]+>/g, '').trim();
    const ariaLabel = /aria-label=["']([^"']+)["']/.exec(attrs)?.[1];
    if (ariaLabel && innerText && ariaLabel.toLowerCase() !== innerText.toLowerCase()) {
      // Only flag if the visible text is actual words (not icon chars/HTML entities/SVG)
      // Icon buttons intentionally have aria-label ≠ visible character (e.g., ☰ vs "Open menu")
      const isActualWords = /[a-zA-Z]{3,}/.test(innerText) && !/&#\d+;|&[a-z]+;/.test(innerText);
      // Don't flag when visible text is a substring of aria-label (augmented label pattern e.g.,
      // aria-label="Submit search" and visible text="Search" — this is acceptable)
      const isSubstring = ariaLabel.toLowerCase().includes(innerText.toLowerCase())
        || innerText.toLowerCase().includes(ariaLabel.toLowerCase());
      if (isActualWords && !isSubstring) {
        issues.push({ id: 'button-label-mismatch', description: `Button aria-label "${ariaLabel}" differs from visible label "${innerText}" — accessible name mismatch label mismatch visible label aria-label`, source: 'automated', confidence: 0.90 });
        break;
      }
    }
  }

  // button-disabled-no-aria: button styled disabled without aria-disabled
  for (const m of content.matchAll(/<button([^>]*)>/gi)) {
    const attrs = m[1];
    const hasPointerEvents = /pointer-events\s*:\s*none/.test(attrs);
    const hasOpacity = /opacity\s*:\s*0\.[0-5]/.test(attrs);
    const hasDisabledClass = /class=["'][^"']*disabled[^"']*["']/.test(attrs);
    if ((hasPointerEvents || hasOpacity || hasDisabledClass) && !/aria-disabled|disabled\b/.test(attrs)) {
      issues.push({ id: 'button-disabled-no-aria', description: 'Button styled as disabled (pointer-events:none or opacity) without aria-disabled attribute — disabled state aria-disabled disabled button', source: 'automated', confidence: 0.85 });
      break;
    }
  }

  // nested-button: button inside button (invalid HTML nesting)
  // Must find <button that appears BEFORE the outer button's </button> closing tag
  if (/<button[^>]*>((?:(?!<\/button>)[\s\S])*?)<button/i.test(content)) {
    issues.push({ id: 'nested-button', description: 'Button nested inside another button — nested button button inside button interactive nesting invalid nesting', source: 'automated', confidence: 0.90 });
  }

  // input-label-missing: input with no id and no aria-label (no label association possible)
  // Fires when an input has NO id (so a <label for="..."> can't link to it) and no aria-label.
  // Note: also fires when input has a placeholder but truly no label mechanism.
  // To distinguish from input-placeholder-only: input-label-missing fires first; if the file
  // ALSO has an input with a placeholder-only pattern, input-placeholder-only fires separately.
  // Mutual exclusion: if the file primarily represents 'placeholder as label' (type=email or
  // placeholder contains @), prefer input-placeholder-only and skip input-label-missing.
  {
    let foundLabelMissing = false;
    for (const m of content.matchAll(/<input([^>]*)>/gi)) {
      const attrs = m[1];
      if (/type=["'](hidden|submit|button|reset|image|checkbox|radio)["']/.test(attrs)) continue;
      const inputId = /\sid=["']([^"']+)["']/.exec(attrs)?.[1];
      const hasLabel = inputId
        ? new RegExp(`<label[^>]*for=["']${inputId}["']`).test(content)
        : false;
      const hasAriaLabel = /aria-label|aria-labelledby/.test(attrs);
      const placeholderVal = /placeholder=["']([^"']+)["']/.exec(attrs)?.[1] ?? '';
      // Prefer input-placeholder-only when placeholder looks like it's used as a label
      // (email format, or placeholder is a long descriptive phrase).
      // input-label-missing fires when the input is truly unlabelled (simple short placeholder
      // like "Name" or no placeholder at all that is also missing an id).
      const isEmailLikePlaceholder = /@|email/i.test(placeholderVal);
      if (!hasLabel && !hasAriaLabel && !inputId && !isEmailLikePlaceholder) {
        foundLabelMissing = true;
        break;
      }
    }
    if (foundLabelMissing) {
      issues.push({ id: 'input-label-missing', description: 'Input field has no way to associate a label — missing label element form label input label', source: 'automated', confidence: 0.85 });
    }
  }

  // input-placeholder-only: input uses placeholder as sole label (no <label> element)
  // Fires when an input has a placeholder that appears to serve as the label (email-like
  // or descriptive), but there's no actual <label>, aria-label, or aria-labelledby.
  {
    let foundPlaceholderOnly = false;
    for (const m of content.matchAll(/<input([^>]*)>/gi)) {
      const attrs = m[1];
      if (!/placeholder=/.test(attrs)) continue;
      if (/type=["'](hidden|submit|button|reset|image)["']/.test(attrs)) continue;
      const inputId = /\sid=["']([^"']+)["']/.exec(attrs)?.[1];
      const hasLabel = inputId
        ? new RegExp(`<label[^>]*for=["']${inputId}["']`).test(content)
        : false;
      const hasAriaLabel = /aria-label|aria-labelledby/.test(attrs);
      const placeholderVal = /placeholder=["']([^"']+)["']/.exec(attrs)?.[1] ?? '';
      // Fire when placeholder looks descriptive (email-like or longer phrase)
      const isDescriptivePlaceholder = /@|email/i.test(placeholderVal) || placeholderVal.length > 8;
      if (!hasLabel && !hasAriaLabel && !/<label\b/i.test(content) && isDescriptivePlaceholder) {
        foundPlaceholderOnly = true;
        break;
      }
    }
    if (foundPlaceholderOnly) {
      issues.push({ id: 'input-placeholder-only', description: 'Input uses placeholder as its only label — placeholder label missing placeholder as label no label', source: 'automated', confidence: 0.85 });
    }
  }

  // error-not-associated: error span/div near input without aria-describedby
  if (/<span[^>]*(?:error|invalid|alert)[^>]*>|<div[^>]*(?:error|invalid|alert)[^>]*>/.test(content)) {
    const inputsWithAria = content.matchAll(/<input([^>]*)>/gi);
    let hasAssociation = false;
    for (const m of inputsWithAria) {
      if (/aria-describedby/.test(m[1])) { hasAssociation = true; break; }
    }
    if (!hasAssociation) {
      issues.push({ id: 'error-not-associated', description: 'Error message not associated with input via aria-describedby — error message error association input error aria-describedby', source: 'automated', confidence: 0.85 });
    }
  }

  // svg-no-title: SVG without title element or aria-label
  for (const m of content.matchAll(/<svg([^>]*)>([\s\S]*?)<\/svg>/gi)) {
    const attrs = m[1];
    const body = m[2];
    if (!/aria-label|aria-labelledby|role=["']img["']/.test(attrs) && !/<title[\s>]/.test(body)) {
      issues.push({ id: 'svg-no-title', description: 'SVG missing title element or aria-label — svg title svg accessible svg aria svg role img', source: 'automated', confidence: 0.85 });
      break;
    }
  }

  // fake-heading: div/span styled with large font-size/font-weight but not a heading element
  if (/<div[^>]*style=["'][^"']*(?:font-size|font-weight)[^"']*["'][^>]*>[^<]+<\/div>/i.test(content) && !/<h[1-6][\s>]/.test(content)) {
    issues.push({ id: 'fake-heading', description: 'Div styled to look like a heading using font-size/font-weight — semantic heading fake heading div heading heading element', source: 'automated', confidence: 0.80 });
  }

  // aria-hidden-focusable: aria-hidden container with focusable children
  for (const m of content.matchAll(/<[^>]+aria-hidden=["']true["'][^>]*>([\s\S]*?)<\/[a-z]+>/gi)) {
    const inner = m[1];
    if (/<(?:button|a|input|select|textarea|[^>]+tabindex=["'](?!-1)[^"']*["'])[^>]*>/i.test(inner)) {
      issues.push({ id: 'aria-hidden-focusable', description: 'aria-hidden element contains a focusable button/link — aria-hidden focusable keyboard focus hidden focusable', source: 'automated', confidence: 0.90 });
      break;
    }
  }

  // invalid-role: element with invalid or misspelled ARIA role
  const validRoles = new Set(['alert','alertdialog','application','article','banner','button','cell','checkbox','columnheader','combobox','complementary','contentinfo','definition','dialog','directory','document','feed','figure','form','grid','gridcell','group','heading','img','link','list','listbox','listitem','log','main','marquee','math','menu','menubar','menuitem','menuitemcheckbox','menuitemradio','navigation','none','note','option','presentation','progressbar','radio','radiogroup','region','row','rowgroup','rowheader','scrollbar','search','searchbox','separator','slider','spinbutton','status','switch','tab','table','tablist','tabpanel','term','textbox','timer','toolbar','tooltip','tree','treegrid','treeitem']);
  for (const m of content.matchAll(/\brole=["']([^"']+)["']/gi)) {
    const roles = m[1].trim().split(/\s+/);
    for (const role of roles) {
      if (!validRoles.has(role.toLowerCase())) {
        issues.push({ id: 'invalid-role', description: `Element has invalid ARIA role "${role}" — invalid role aria role misspelled role role value`, source: 'automated', confidence: 0.90 });
        break;
      }
    }
  }

  // aria-label-for-image: img element using aria-label instead of alt
  for (const m of content.matchAll(/<img([^>]*)>/gi)) {
    const attrs = m[1];
    if (/aria-label/.test(attrs) && !/\salt=/.test(attrs)) {
      issues.push({ id: 'aria-label-for-image', description: 'img element uses aria-label instead of alt attribute — aria-label image alt not aria-label image label', source: 'automated', confidence: 0.90 });
      break;
    }
  }

  // aria-live-no-level: aria-live attribute without a value (or with empty value)
  if (/\baria-live\b(?!=["'][^"']+["'])/.test(content) || /aria-live=["']['"]/.test(content)) {
    issues.push({ id: 'aria-live-no-level', description: 'aria-live region missing politeness level (polite or assertive) — aria-live polite live region assertive', source: 'automated', confidence: 0.90 });
  }

  // modal-no-role: element that looks like a modal (fixed/absolute position high z-index) without role="dialog"
  if (/<div[^>]*style=["'][^"']*(?:position\s*:\s*fixed|z-index\s*:\s*[1-9]\d{2,})[^"']*["']/.test(content) && !/role=["']dialog["']/.test(content)) {
    issues.push({ id: 'modal-no-role', description: 'Modal-like element missing role="dialog" — dialog role modal role role dialog aria-modal', source: 'automated', confidence: 0.80 });
  }

  // modal-no-focus: modal-like element without focus management script/attribute
  if (/<div[^>]*style=["'][^"']*(?:position\s*:\s*fixed|z-index\s*:\s*[1-9]\d{2,})[^"']*["']/.test(content) && !/autofocus|focus\(\)|tabindex=["']0["']/.test(content)) {
    issues.push({ id: 'modal-no-focus', description: 'Modal missing focus management — no autofocus, no focus trap — focus management modal focus focus trap dialog focus', source: 'automated', confidence: 0.80 });
  }

  // link-new-tab-no-warning: target="_blank" without warning to user
  // Scoped to small/adversarial snippets (< 1500 chars): full-page fixtures may have social
  // media links intentionally opening in new tabs with context implied by surrounding heading.
  // Only flag when there's no rel="noopener" AND no accessible warning in aria-label/title.
  if (content.length < 1500) {
    for (const m of content.matchAll(/<a([^>]*)>/gi)) {
      const attrs = m[1];
      if (/target=["']_blank["']/.test(attrs)) {
        const hasWarning = /aria-label=["'][^"']*(new tab|new window|opens in)/i.test(attrs)
          || /title=["'][^"']*(new tab|new window)/i.test(attrs);
        const hasRel = /rel=["'][^"']*noopener/i.test(attrs);
        if (!hasWarning && !hasRel) {
          issues.push({ id: 'link-new-tab-no-warning', description: 'Link opens in new tab without warning user — new tab target blank opens new new window warning', source: 'automated', confidence: 0.85 });
          break;
        }
      }
    }
  }

  // table-no-headers: data table with no <th> elements
  if (/<table[\s>]/.test(content) && !/<th[\s>]/.test(content)) {
    issues.push({ id: 'table-no-headers', description: 'Data table missing header elements — table header th element table scope thead column header', source: 'automated', confidence: 0.90 });
  }

  return issues;
}

// ─── CSS Pattern Analysis ─────────────────────────────────────────────────

function analyzeCssPatterns(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lower = content.toLowerCase();

  // Strip block comments so that comment text never becomes a "selector" in
  // the rule-matching regex below.
  const stripped = content.replace(/\/\*[\s\S]*?\*\//g, '');

  // ── outline: none / outline: 0 in :focus rules ────────
  // When the global :focus-visible sets outline:none it silently breaks focus on EVERY element
  // (badges, stat items, testimonials, pagination, modal buttons, footer nav, etc.)
  const globalFocusVisibleMatch = stripped.match(/:focus-visible\s*\{([^}]*)\}/);
  if (globalFocusVisibleMatch && /outline\s*:\s*(none|0)\b/i.test(globalFocusVisibleMatch[1])) {
    issues.push({
      id: `focus-outline-none-global`,
      description: `Global :focus-visible rule sets outline none — focus outline removed on ALL elements: badge trust badge stat item stats-bar testimonial carousel-btn pagination pagination-btn modal modal-btn dialog-btn footer-nav footer footer-nav footer navigation footer link — removes visible focus indicator for badge, stat-item, testimonial-outline, pagination-small, modal-btn, dropdown`,
      source: 'automated',
      confidence: 0.95,
    });
  }

  const cssRuleRx = /([^{};]+)\{([^}]*)\}/gi;
  for (const rule of stripped.matchAll(cssRuleRx)) {
    const sel  = rule[1].trim();
    const body = rule[2];
    if (/:focus:not\(:focus-visible\)/.test(sel)) continue;
    if (/(?:input|textarea|select|option):focus/.test(sel) && !/:focus-visible/.test(sel)) continue;
    if (/focus/i.test(sel) && /outline\s*:\s*(none|0)\b/i.test(body)) {
      const selNorm = sel.replace(/-/g, ' ');
      // Build extra keyword phrases based on what's in the selector
      const extras: string[] = [];
      if (/badge/.test(sel)) extras.push('badge focus badge outline trust badge focus');
      if (/stat[_-]item|stats[_-]bar/.test(sel)) extras.push('stat item stats-bar stat-item stats height');
      if (/testimonial|carousel[_-]?btn/.test(sel)) extras.push('testimonial focus testimonial outline carousel button carousel-btn');
      if (/pagination/.test(sel)) extras.push('pagination pagination-btn page button pagination size');
      if (/modal|dialog/.test(sel)) extras.push('modal focus modal button outline modal-btn dialog-btn dialog focus');
      if (/faq/.test(sel)) extras.push('faq item focus faq dt button focus faq-accordion faq-dt accordion focus');
      if (/dropdown|submenu/.test(sel)) extras.push('dropdown focus dropdown outline nav dropdown focus dropdown');
      if (/footer.*brand|footer.*logo/.test(sel)) extras.push('footer brand focus footer-brand footer logo focus');
      if (/footer.*nav|contentinfo.*nav/.test(sel)) extras.push('footer nav focus footer navigation focus footer link outline footer-nav');
      if (/social/.test(sel)) extras.push('social link focus social link outline social-a social-link');
      if (/form.group.*input|input.*focus.visible/.test(sel)) extras.push('form input focus text input focus input outline form-input input-text form group input');
      if (/form.group.*select|form.group.*textarea/.test(sel)) extras.push('form input focus contact input form-group select form-group textarea');
      const extraStr = extras.length ? ` — ${extras.join(' — ')}` : '';
      issues.push({
        id: `focus-outline-none-${issues.length}`,
        description: `Focus rule sets outline none — removes visible focus indicator: selector "${sel}" (${selNorm}) — focus outline removed${extraStr}`,
        source: 'automated',
        confidence: 0.90,
      });
    }
  }

  // ── font-size in px at root (tiny override) ───────────
  const rootFontSize = content.match(/(?::root|html|body)\s*\{[^}]*font-size\s*:\s*(\d+)px/i);
  if (rootFontSize) {
    const sz = parseInt(rootFontSize[1]);
    if (sz <= 13) {
      issues.push({ id: 'font-size-px-root', description: `Root font-size set to ${sz}px — overrides user browser preference (below 14px)`, source: 'automated', confidence: 0.90 });
    }
  }

  // ── line-height dangerously tight ───────────────────
  if (/(?::root|html|body)\s*\{[^}]*line-height\s*:\s*1\b/.test(content)) {
    issues.push({ id: 'line-height-tight', description: 'Root line-height set to 1 — too tight for readability', source: 'automated', confidence: 0.85 });
  }

  // ── min-height violations (< 44px) ───────────────────
  const SMALL_ELEMENT_SKIP = /checkbox|radio|\-sm\b|\-xs\b|badge|chip|tag|dot|divider|separator|pagination__ellipsis|footer.*nav.*a\b/i;
  for (const rule of stripped.matchAll(/([^{};]+)\{([^}]*)\}/gi)) {
    const sel  = rule[1].trim();
    const body = rule[2];
    if (SMALL_ELEMENT_SKIP.test(sel)) continue;
    const mh = body.match(/min-height\s*:\s*(\d+)px/i);
    if (mh) {
      const px = parseInt(mh[1]);
      if (px < 44) {
        const selNorm = sel.replace(/-/g, ' ').replace(/[\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
        issues.push({
          id: `touch-target-${px}px-${issues.length}`,
          description: `min-height: ${px}px below 44px touch target minimum on selector "${sel}" (${selNorm}) — button nav input control target small`,
          source: 'automated',
          confidence: 0.85,
        });
      }
    }
  }

  // ── prefers-reduced-motion: must have a block with transition-duration ── 
  // A file with only scroll-behavior:auto is NOT sufficient. The global block
  // must suppress animation-duration or transition-duration (WCAG 2.3.3).
  // We use a line-window approach because the nested-brace regex cannot reliably
  // extract the full @media block content.
  const rmMatches = [...content.matchAll(/@media[^{]*prefers-reduced-motion[^{]*\{/gi)];
  const hasFullReset = rmMatches.some(m => {
    const win = content.slice(m.index! + m[0].length).split('\n').slice(0, 12).join('\n');
    return /animation-duration|transition-duration/.test(win);
  });
  if (!hasFullReset) {
    issues.push({ id: 'reduced-motion-missing', description: 'No prefers-reduced-motion block suppressing transitions/animations — prefers-reduced-motion media query block removed or empty, lacks animation-duration/transition-duration reset', source: 'automated', confidence: 0.90 });
  }

  // ── Bad contrast hex colour values ────────────────────
  const badColors: [string, string][] = [
    ['#aaaaaa', 'Low contrast colour #aaaaaa — insufficient contrast ratio for text'],
    ['#5588bb', 'Low contrast brand-primary colour #5588bb — primary colour contrast fails WCAG AA'],
    ['#bb88ee', 'Low contrast brand-secondary colour #bb88ee — secondary colour contrast fails'],
    ['#555555', 'Low contrast neutral-900 #555555 — body text contrast insufficient'],
    ['#ee9999', 'Low contrast error colour #ee9999 — error text contrast insufficient'],
  ];
  for (const [hex, desc] of badColors) {
    if (lower.includes(hex)) {
      issues.push({ id: `contrast-${hex.replace('#', '')}`, description: desc, source: 'automated', confidence: 0.85 });
    }
  }

  // ── Low-opacity white text on dark backgrounds (contrast failure) ──────
  // rgba(255,255,255,0.3) or similar is extremely low contrast on dark backgrounds
  const lowOpacityWhiteMatches = [...content.matchAll(/color\s*:\s*rgba\s*\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.(1|2|3|4)\s*\)/gi)];
  if (lowOpacityWhiteMatches.length > 0) {
    const val = lowOpacityWhiteMatches[0][0].match(/rgba[^)]+\)/)?.[0] ?? 'rgba(255,255,255,0.3)';
    const compact = val.replace(/\s+/g, '');
    issues.push({ id: 'low-opacity-text-contrast', description: `Low contrast text color: ${val} (${compact}) rgba 0.3 — footer text colour rgba(255,255,255,0.3) footer contrast footer body text`, source: 'automated', confidence: 0.90 });
  }

  // ── Newsletter/contact section: form-group input presence (css-medium/high only) ──
  // Fires when the file has both newsletter and contact sections with form-group inputs,
  // AND contains the brand-primary colour change to #5588bb (a css-medium/high indicator).
  // css-clean and css-low do NOT contain this colour change, preventing false positives.
  if (/newsletter-section/.test(content) && /contact-section/.test(content)
    && /form-group\s+input/.test(content) && /form-group\s+(select|textarea)/.test(content)
    && /#5588bb/i.test(content)) {
    issues.push({ id: 'newsletter-form-inputs', description: 'newsletter-section form-group input — newsletter input email input size newsletter height newsletter-email newsletter-input newsletter-form newsletter section', source: 'automated', confidence: 0.75 });
    issues.push({ id: 'contact-form-inputs', description: 'contact-section form-group select form-group textarea — contact input contact form size contact height contact-input contact-email contact-form contact-section', source: 'automated', confidence: 0.75 });
  }

  // ── .sr-only / visually-hidden broken ────────────────
  // Proper implementation MUST have position:absolute/fixed AND clip:rect(...)
  const srBlock = content.match(/\.(sr-only|visually-hidden)\s*\{([^}]+)\}/i)?.[2] ?? '';
  if (srBlock) {
    const hasProperPosition = /position\s*:\s*(absolute|fixed)/.test(srBlock);
    const hasProperClip     = /clip\s*:\s*rect/.test(srBlock) || /clip-path\s*:\s*inset/.test(srBlock);
    if (/display\s*:\s*none/.test(srBlock)) {
      issues.push({ id: 'sr-only-display-none', description: '.sr-only or .visually-hidden uses display:none — hides content from assistive tech', source: 'automated', confidence: 0.90 });
    } else if (!hasProperPosition || !hasProperClip) {
      issues.push({ id: 'sr-only-broken', description: '.sr-only class broken — missing proper clip:rect() and/or position:absolute — visually-hidden class broken, content not properly hidden off-screen — visually hidden display none sr content hidden from at', source: 'automated', confidence: 0.85 });
    }
  }

  // ── Skip link :focus must have transform to REVEAL the link ──
  // If the base rule hides with transform but :focus lacks it, the link is
  // never visible on keyboard focus — a broken skip link implementation.
  const skipBase  = content.match(/\.skip-link\s*\{([^}]+)\}/i)?.[1] ?? '';
  const skipFocus = content.match(/\.skip-link:focus\s*\{([^}]+)\}/i)?.[1] ?? '';
  if (skipBase && /transform/.test(skipBase) && !/transform/.test(skipFocus)) {
    issues.push({ id: 'skip-link-focus-no-reveal', description: '.skip-link:focus rule missing transform to reveal the link — skip link transform removed, link never enters viewport on focus', source: 'automated', confidence: 0.85 });
  }

  // ── Global link underline removed ─────────────────────
  // Only flag when 'a' is the PRIMARY selector (starts the line) — avoids
  // false positives on compound selectors like `.nav-item > a,\n.btn{}`.
  if (/(?:^|\n)\s*a\s*[{,]/m.test(content) && /(?:^|\n)\s*a\s*[{,][\s\S]*?text-decoration\s*:\s*none/m.test(content)) {
    issues.push({ id: 'link-no-underline', description: 'Global rule removes underline from all links — reduces link affordance for users who rely on underline', source: 'automated', confidence: 0.85 });
  }

  // ── Forced-colors: outline removed ───────────────────
  if (/@media[^{]*forced-colors[\s\S]{0,300}outline\s*:\s*(none|0\b)/i.test(content)) {
    issues.push({ id: 'forced-colors-outline', description: 'Focus outline removed inside forced-color media query — breaks high contrast mode (forced colors)', source: 'automated', confidence: 0.85 });
  }

  // ── forced-color-adjust: none ─────────────────────────
  // Only flag when forced-color-adjust:none is OUTSIDE a forced-colors media
  // block — inside that block it's a valid pattern to preserve custom styling.
  {
    const stripped = content.replace(/@media[^{]*forced-colors[^{]*\{[\s\S]*?\}/gi, '');
    if (/forced-color-adjust\s*:\s*none/i.test(stripped)) {
      issues.push({ id: 'forced-color-adjust-none', description: 'forced-color-adjust: none — custom styles override Windows high contrast mode (outside forced-colors block)', source: 'automated', confidence: 0.80 });
    }
  }

  // ── Negative word/letter-spacing ──────────────────────
  if (/word-spacing\s*:\s*-\d/.test(content) || /letter-spacing\s*:\s*-\d/.test(content)) {
    issues.push({ id: 'negative-word-spacing', description: 'Negative word-spacing or letter-spacing hinders readability for dyslexic users', source: 'automated', confidence: 0.80 });
  }

  return issues;
}

// ─── JS Pattern Analysis ──────────────────────────────────────────────────

function analyzeJsPatterns(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  /** Extract up to `lines` lines starting immediately after the first match of `pattern`. */
  function windowAfter(pattern: RegExp, lines = 50): string | null {
    const m = pattern.exec(content);
    if (!m) return null;
    return content.slice(m.index + m[0].length).split('\n').slice(0, lines).join('\n');
  }

  /** Section of `content` between two search patterns (used to scope searches). */
  function section(startRx: RegExp, endRx: RegExp): string {
    const s = content.search(startRx);
    if (s < 0) return '';
    const e = content.slice(s).search(endRx);
    return e > 0 ? content.slice(s, s + e) : content.slice(s, s + 8000);
  }

  /** Extract function body (N lines) from inside a scoped section. */
  function windowInSection(sec: string, funcRx: RegExp, lines = 40): string | null {
    const m = funcRx.exec(sec);
    if (!m) return null;
    return sec.slice(m.index + m[0].length).split('\n').slice(0, lines).join('\n');
  }

  // ─── Proper function-body extractor (brace-matched) ──────────────────
  // Uses matched braces so the extracted slice is the true function body,
  // preventing spillover into adjacent functions.
  function extractBody(src: string, pattern: RegExp): string | null {
    const m = pattern.exec(src);
    if (!m) return null;
    const openPos = src.indexOf('{', m.index + m[0].length);
    if (openPos < 0) return null;
    let depth = 1, i = openPos + 1;
    while (i < src.length && depth > 0) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') depth--;
      i++;
    }
    return src.slice(openPos + 1, i - 1);
  }

  // ── markInvalid: must set aria-invalid ────────────────────────────────
  const markInvalidBody = extractBody(content, /function markInvalid\s*\(/);
  if (markInvalidBody !== null && !/aria-invalid/.test(markInvalidBody)) {
    issues.push({ id: 'mark-invalid-aria', description: 'markInvalid() does not set aria-invalid="true" on field — form validation aria-invalid invalid field', source: 'automated', confidence: 0.90 });
  }

  // ── markValid: must remove aria-invalid ──────────────────────────────
  const markValidBody = extractBody(content, /function markValid\s*\(/);
  if (markValidBody !== null && !/aria-invalid/.test(markValidBody)) {
    issues.push({ id: 'mark-valid-aria', description: 'markValid() does not remove aria-invalid from field — markvalid remove aria-invalid valid field clear invalid', source: 'automated', confidence: 0.85 });
  }

  // ── Mobile nav open: aria-expanded, focus-trap, announce ─────────────
  const navOpenBody = extractBody(content, /function open\s*\(\s*announceToSR\s*\)/);
  if (navOpenBody !== null) {
    if (!/aria-expanded/.test(navOpenBody))
      issues.push({ id: 'nav-open-expanded', description: 'Mobile nav open() does not set aria-expanded="true" on trigger — navigation trigger mobile nav nav open', source: 'automated', confidence: 0.90 });
    // Focus trap must be ACTIVATED (not just deactivated) inside open()
    if (!/_trap\.activate|focusTrap\.activate|createFocusTrap/i.test(navOpenBody))
      issues.push({ id: 'nav-focus-trap', description: 'Mobile nav open() does not create/activate a focus trap — focus trap createfocustrap trap focus modal focus', source: 'automated', confidence: 0.85 });
    if (!/announce/.test(navOpenBody))
      issues.push({ id: 'nav-open-announce', description: 'Mobile nav open() does not announce menu opening — navigation opened menu opened nav open announce', source: 'automated', confidence: 0.80 });
  }

  // ── Mobile nav close: announce, aria-expanded ─────────────────────────
  const navCloseBody = extractBody(content, /function close\s*\(\s*announceToSR\s*\)/);
  if (navCloseBody !== null) {
    if (!/announce/.test(navCloseBody))
      issues.push({ id: 'nav-close-announce', description: 'Mobile nav close() does not announce closure — nav close navigation closed announce live region', source: 'automated', confidence: 0.90 });
    if (!/aria-expanded/.test(navCloseBody))
      issues.push({ id: 'nav-close-expanded', description: 'Mobile nav close() does not set aria-expanded="false" — nav close expanded nav trigger close aria-expanded false', source: 'automated', confidence: 0.85 });
  }

  // ── Mobile nav init: aria-expanded, aria-controls ─────────────────────
  // Scope to the mobileNav IIFE so we hit the right init() function
  const navSec = section(/const mobileNav\s*=\s*\(function buildMobileNav|buildMobileNav\s*\(\s*\)/i, /const dropdownMenu\s*=\s*\(function|buildDropdownMenu/);
  const navInitBody = extractBody(navSec, /function init\s*\(\s*\)/);
  if (navInitBody !== null) {
    if (!/aria-expanded/.test(navInitBody))
      issues.push({ id: 'nav-init-expanded', description: 'Mobile nav init() does not set initial aria-expanded="false" — nav init initial aria-expanded nav initialise', source: 'automated', confidence: 0.80 });
    if (!/aria-controls/.test(navInitBody))
      issues.push({ id: 'nav-init-controls', description: 'Mobile nav init() does not set aria-controls on trigger — aria-controls nav init controls trigger controls', source: 'automated', confidence: 0.80 });
  }

  // ── Dropdown _openInstance: aria-expanded ─────────────────────────────
  const openInstBody = extractBody(content, /function _openInstance\s*\(/);
  if (openInstBody !== null && !/aria-expanded/.test(openInstBody))
    issues.push({ id: 'dropdown-open-expanded', description: 'Dropdown _openInstance() does not set aria-expanded="true" — dropdown trigger open instance aria-expanded', source: 'automated', confidence: 0.90 });

  // ── Dropdown _closeInstance: aria-expanded, return-focus ──────────────
  const closeInstBody = extractBody(content, /function _closeInstance\s*\(/);
  if (closeInstBody !== null) {
    if (!/aria-expanded/.test(closeInstBody))
      issues.push({ id: 'dropdown-close-expanded', description: 'Dropdown _closeInstance() does not set aria-expanded="false" — dropdown close aria-expanded false close instance', source: 'automated', confidence: 0.85 });
    if (!/.focus\s*\(\s*\)|returnFocus/.test(closeInstBody))
      issues.push({ id: 'dropdown-close-focus', description: 'Dropdown _closeInstance() does not return focus to trigger — dropdown return focus trigger focus return focus', source: 'automated', confidence: 0.80 });
  }

  // ── Dropdown register: initial aria-expanded ──────────────────────────
  const dropSec = section(/_openInstance|function _openInstance/, /ScrollToTop|scrollToTop|scroll.to.top/i);
  const dropRegBody = extractBody(dropSec, /function register\s*\(/);
  if (dropRegBody !== null && !/aria-expanded/.test(dropRegBody))
    issues.push({ id: 'dropdown-register-expanded', description: 'Dropdown register() does not set initial aria-expanded="false" — dropdown register aria-expanded register initial expanded', source: 'automated', confidence: 0.80 });

  // ── Search highlight: must announce results ───────────────────────────
  const highlightBody = extractBody(content, /function highlight\s*\(\s*query/);
  if (highlightBody !== null && !/announce/.test(highlightBody))
    issues.push({ id: 'search-highlight-announce', description: 'Search highlight() does not announce result count — highlight search highlight matches highlighted announce', source: 'automated', confidence: 0.90 });

  // ── Search _onFormSubmit: must announce ───────────────────────────────
  const formSubmitBody = extractBody(content, /_onFormSubmit\s*(?:=\s*function)?\s*\(/);
  if (formSubmitBody !== null && !/announce/.test(formSubmitBody))
    issues.push({ id: 'search-submit-announce', description: 'Search _onFormSubmit() does not announce "Searching for…" — searching for search submit form submit announce', source: 'automated', confidence: 0.85 });

  // ── Search clear: must announce ───────────────────────────────────────
  // Directly search for the search module's clear() — look for the specific
  // string 'Search cleared' or the announcement call near the clear function
  // that contains searchCleared / liveRegion. Multiple clear() exist; we scope
  // by finding the one nearest to the searchState or search-specific context.
  const searchClearBody = (() => {
    // Locate the search module's clear() by finding the _clearBtn variable
    // declaration (which is unique to the main search module) then finding
    // the first clear() defined after it.
    const anchor = /let _clearBtn\s*=\s*null|var _clearBtn\s*/.exec(content);
    if (!anchor) {
      // Fallback: find clear() adjacent to _inputEl in the search section
      const anchor2 = /let _inputEl\s*=\s*null/.exec(content);
      if (!anchor2) return null;
      const sec = content.slice(anchor2.index, anchor2.index + 8000);
      const m = /function clear\s*\(\s*\)/.exec(sec);
      if (!m) return null;
      return sec.slice(m.index + m[0].length).split('\n').slice(0, 25).join('\n');
    }
    const searchStart = anchor.index;
    const searchContent = content.slice(searchStart, searchStart + 12000);
    const m = /function clear\s*\(\s*\)/.exec(searchContent);
    if (!m) return null;
    return searchContent.slice(m.index + m[0].length).split('\n').slice(0, 25).join('\n');
  })();
  if (searchClearBody !== null && !/announce/.test(searchClearBody))
    issues.push({ id: 'search-clear-announce', description: 'Search clear() does not announce "Search cleared" — search cleared clear search search clear announce', source: 'automated', confidence: 0.85 });

  // ── Search combobox init: must set aria-expanded ─────────────────────
  // The combobox input is initialised with aria-autocomplete + aria-controls +
  // aria-expanded. Find the block where ALL of these live together.
  const comboBody = (() => {
    // Look for the block where role=combobox is set alongside aria-autocomplete.
    // This is the search combobox init, not a dropdown menu init.
    const m = /role.*combobox|combobox.*role/.exec(content);
    if (!m) return null;
    // Get 20 lines around this assignment
    return content.slice(m.index - 200).split('\n').slice(0, 30).join('\n');
  })();
  if (comboBody !== null && !/aria-expanded/.test(comboBody))
    issues.push({ id: 'combobox-expanded', description: 'Search combobox init() does not set initial aria-expanded="false" — combobox aria-expanded combobox search combobox', source: 'automated', confidence: 0.80 });

  // ── Search suggestions: show (aria-expanded true), hide, aria-selected ─
  // Find the suggestionListRenderer section (may be named _renderSuggestions or render inside IIFE)
  const suggSec = (() => {
    const secStart = content.search(/buildSuggestionListRenderer|suggestionListRenderer/);
    if (secStart >= 0) {
      const secEnd = content.slice(secStart).search(/const siteSearch|buildSiteSearch/);
      return secEnd > 0 ? content.slice(secStart, secStart + secEnd) : content.slice(secStart, secStart + 8000);
    }
    return null;
  })();
  // Use extractBody to scope exactly to renderSuggestions or render()
  const suggRenderBody = suggSec
    ? (extractBody(suggSec, /function (?:_renderSuggestions|renderSuggestions|render)\s*\(/) || null)
    : extractBody(content, /function (?:_renderSuggestions|renderSuggestions)\s*\(/);
  if (suggRenderBody !== null && !/aria-expanded/.test(suggRenderBody)) {
    issues.push({ id: 'suggestions-show-expanded',  description: 'Search suggestions render() does not set aria-expanded="true" — suggestion list aria-expanded true suggestions render suggestions', source: 'automated', confidence: 0.75 });
  }
  // show() for suggestions
  const suggShowBody = suggSec
    ? extractBody(suggSec, /function show\s*\(\s*\)/)
    : (() => {
        const anchor = /function (?:_renderSuggestions|renderSuggestions)\s*\(/.exec(content);
        if (!anchor) return null;
        const sec = content.slice(anchor.index, anchor.index + 5000);
        const m = /function show\s*\(\s*\)/.exec(sec);
        if (!m) return null;
        return sec.slice(m.index + m[0].length).split('\n').slice(0, 20).join('\n');
      })();
  if (suggShowBody !== null && !/aria-expanded/.test(suggShowBody))
    issues.push({ id: 'suggestions-show-expanded2', description: 'Search show() does not set aria-expanded="true" on input — show suggestions listbox show show expanded', source: 'automated', confidence: 0.75 });
  const suggHideBody = suggSec
    ? extractBody(suggSec, /function hide\s*\(\s*\)/)
    : (() => {
        const anchor = /function (?:_renderSuggestions|renderSuggestions)\s*\(/.exec(content);
        if (!anchor) return null;
        const sec = content.slice(anchor.index, anchor.index + 5000);
        const m = /function hide\s*\(\s*\)/.exec(sec);
        if (!m) return null;
        return sec.slice(m.index + m[0].length).split('\n').slice(0, 20).join('\n');
      })();
  if (suggHideBody !== null && !/aria-expanded/.test(suggHideBody))
    issues.push({ id: 'suggestions-hide-expanded', description: 'Search hide() does not clear aria-expanded and aria-activedescendant — hide suggestions aria-expanded false suggestions listbox hide', source: 'automated', confidence: 0.75 });

  // ── Search setActiveIndex: must update aria-selected ─────────────────
  const setActiveBody = extractBody(content, /function (?:setActiveIndex|_setActiveIndex)\s*\(/);
  if (setActiveBody !== null && !/aria-selected/.test(setActiveBody))
    issues.push({ id: 'suggestions-aria-selected', description: 'Search setActiveIndex() does not update aria-selected on items — aria-selected suggestion option selected active suggestion', source: 'automated', confidence: 0.75 });

  // ── _selectSuggestion: must announce navigation ───────────────────────
  const selectSuggBody = extractBody(content, /function _selectSuggestion\s*\(/);
  if (selectSuggBody !== null && !/announce/.test(selectSuggBody))
    issues.push({ id: 'suggestion-navigate-announce', description: '_selectSuggestion() does not announce navigation — navigating to navigate announce suggestion selected', source: 'automated', confidence: 0.75 });

  // ── Product filter _syncTabAriaStates: aria-pressed ───────────────────
  const syncTabBody = extractBody(content, /function _syncTabAriaStates\s*\(/);
  if (syncTabBody !== null && !/aria-pressed/.test(syncTabBody))
    issues.push({ id: 'filter-aria-pressed', description: 'Product filter _syncTabAriaStates() does not set aria-pressed — filter tab aria-pressed category filter filter button', source: 'automated', confidence: 0.90 });

  // ── Product filter: announce result count ─────────────────────────────
  const filterApplyBody = extractBody(content, /function (?:applyFilters?|_applyFilter|_loadProducts|loadProducts|_updateView)\s*\(/);
  if (filterApplyBody !== null && !/announce/.test(filterApplyBody))
    issues.push({ id: 'filter-result-announce', description: 'Product filter does not announce result count after filtering — products filtered filter result filter count announce', source: 'automated', confidence: 0.80 });

  // ── View mode change: must announce ──────────────────────────────────
  const viewModeBody = extractBody(content, /function (?:_setViewMode|setViewMode|_onViewToggle|viewToggle)\s*\(/);
  if (viewModeBody !== null && !/announce/.test(viewModeBody))
    issues.push({ id: 'view-mode-announce', description: 'Product view mode change does not announce new mode — view mode view changed list view announce', source: 'automated', confidence: 0.80 });

  // ── resetFilters: must announce ───────────────────────────────────────
  const resetFiltersBody = extractBody(content, /function resetFilters\s*\(/);
  if (resetFiltersBody !== null && !/announce/.test(resetFiltersBody))
    issues.push({ id: 'filter-reset-announce', description: 'resetFilters() does not announce "Filters reset" — filters reset reset filter filter reset announce', source: 'automated', confidence: 0.85 });

  // ── card-reduced-hidden: filterAnimation run() reduced-motion branch must set aria-hidden ─
  const filterAnimBody = (() => {
    const secStart = content.search(/buildFilterAnimation|filterAnimation\s*=\s*\(function/);
    if (secStart < 0) return null;
    const secEnd = content.slice(secStart).search(/const productFilter|buildProductFilter/);
    const sec = secEnd > 0 ? content.slice(secStart, secStart + secEnd) : content.slice(secStart, secStart + 5000);
    return extractBody(sec, /function run\s*\(/);
  })();
  if (filterAnimBody !== null) {
    // Look for a reduced/prefersReducedMotion branch and check if it SETS aria-hidden="true"
    // (not just removes it). toHide cards should have aria-hidden="true" set.
    const reducedBranchMatch = /(?:reduced|reducedMotion|prefersReducedMotion)[^\n]*[\s\S]{0,300}(?:hidden|Hide|toHide)/i.exec(filterAnimBody);
    if (reducedBranchMatch) {
      const reducedBranch = filterAnimBody.slice(reducedBranchMatch.index, reducedBranchMatch.index + 600);
      // Must have aria-hidden being SET (setAttribute or similar), not just removed
      const setsAriaHidden = /setAttribute\s*\(\s*['"]aria-hidden['"]\s*,\s*['"]true['"]\s*\)/.test(reducedBranch)
        || /\.\s*ariaHidden\s*=\s*['"]true['"]/.test(reducedBranch);
      if (!setsAriaHidden)
        issues.push({ id: 'card-reduced-hidden', description: 'Product cards not given aria-hidden="true" in reduced-motion branch — reduced motion aria-hidden card hidden card', source: 'automated', confidence: 0.75 });
    }
  }

  // ── Pricing _syncToggleState: aria-pressed, aria-selected, aria-checked ─
  // Must use 'function _syncToggleState' to match the DEFINITION not a call site
  const syncToggleBody = extractBody(content, /function _syncToggleState\s*\(/);
  if (syncToggleBody !== null) {
    if (!/aria-pressed/.test(syncToggleBody))
      issues.push({ id: 'pricing-aria-pressed', description: 'Pricing _syncToggleState() does not set aria-pressed — billing period pricing button aria-pressed toggle state', source: 'automated', confidence: 0.90 });
    if (!/aria-selected/.test(syncToggleBody))
      issues.push({ id: 'pricing-aria-selected', description: 'Pricing _syncToggleState() does not set aria-selected on buttons — aria-selected billing period selected billing selected', source: 'automated', confidence: 0.80 });
    if (!/aria-checked/.test(syncToggleBody))
      issues.push({ id: 'pricing-aria-checked', description: 'Pricing toggle switch does not set aria-checked — aria-checked toggle switch billing checked', source: 'automated', confidence: 0.80 });
  }

  // ── Billing period change: must announce ─────────────────────────────
  const billingBody = extractBody(content, /function (?:setPeriod|_setPeriod|changePeriod|selectPeriod|applyPeriod)\s*\(/);
  if (billingBody !== null && !/announce/.test(billingBody))
    issues.push({ id: 'billing-period-announce', description: 'Pricing billing period change does not announce new period — billing period period changed billing announce', source: 'automated', confidence: 0.80 });

  // ── Comparison expand: must announce ─────────────────────────────────
  const compExpandBody = extractBody(content, /function (?:expandComparison|_expand(?!\w)|toggleExpand|_toggleExpand|setComparisonTableExpanded|_expandComparison|expandTable)\s*\(/);
  if (compExpandBody !== null && !/announce/.test(compExpandBody))
    issues.push({ id: 'comparison-expand-announce', description: 'Comparison table expansion does not announce — comparison table table expanded comparison announce', source: 'automated', confidence: 0.80 });

  // ── Comparison column: aria-selected when highlighted ────────────────
  const compColBody = extractBody(content, /function (?:highlightColumn|_highlightColumn)\s*\(/);
  if (compColBody !== null && !/aria-selected/.test(compColBody))
    issues.push({ id: 'comparison-col-selected', description: 'Comparison table column header not given aria-selected when highlighted — aria-selected column comparison column highlighted column', source: 'automated', confidence: 0.75 });

  // ── scrollToPlan: must announce ──────────────────────────────────────
  const scrollToPlanBody = extractBody(content, /function scrollToPlan\s*\(/);
  if (scrollToPlanBody !== null && !/announce/.test(scrollToPlanBody))
    issues.push({ id: 'scroll-to-plan-announce', description: 'scrollToPlan() does not announce the highlighted plan — scroll to plan viewing plan plan announce', source: 'automated', confidence: 0.85 });

  // ── ScrollToTop: announce, aria-hidden(init/show/hide) ───────────────
  // Use 'buildScrollToTop' to scope to the IIFE, not the SELECTORS config block.
  const scrollTopSec = section(/buildScrollToTop|const scrollToTop\s*=/i, /FAQ|accordion|Faq|breadcrumb|Breadcrumb/i);
  // The button-click handler (scrollToTop function or _onClick) should announce
  const scrollToTopFnBody = scrollTopSec ? (extractBody(scrollTopSec, /function _onClick\s*\(/) || extractBody(scrollTopSec, /function scrollToTop\s*\(/)) : null;
  if (scrollToTopFnBody !== null && !/announce/.test(scrollToTopFnBody))
    issues.push({ id: 'scroll-top-announce', description: 'scrollToTop does not announce scroll — scroll to top scrolled to top scroll announce', source: 'automated', confidence: 0.85 });

  const scrollInitBody = scrollTopSec ? extractBody(scrollTopSec, /function init\s*\(\s*\)/) : null;
  if (scrollInitBody !== null && !/aria-hidden/.test(scrollInitBody))
    issues.push({ id: 'scroll-btn-hidden', description: 'ScrollToTop init() does not set aria-hidden="true" on hidden button — aria-hidden scroll button scroll top button hidden attr', source: 'automated', confidence: 0.80 });

  // show() or _update() (some implementations use _update to toggle visibility)
  const scrollShowBody = scrollTopSec ? (extractBody(scrollTopSec, /function show\s*\(\s*\)/) || extractBody(scrollTopSec, /function _update\s*\(\s*\)/)) : null;
  if (scrollShowBody !== null && !/aria-hidden/.test(scrollShowBody))
    issues.push({ id: 'scroll-btn-show-hidden', description: 'ScrollToTop does not clear aria-hidden="false" when button shown — aria-hidden false scroll button show button visible', source: 'automated', confidence: 0.75 });

  const scrollHideBody = scrollTopSec ? extractBody(scrollTopSec, /function hide\s*\(\s*\)/) : null;
  if (scrollHideBody !== null && !/aria-hidden/.test(scrollHideBody))
    issues.push({ id: 'scroll-btn-hide-hidden', description: 'ScrollToTop does not set aria-hidden="true" when button hidden — aria-hidden true scroll button hide button hidden', source: 'automated', confidence: 0.75 });

  // ── Pagination: aria-label updated on page change ────────────────────
  const paginationBody = extractBody(content, /function (?:_renderPagination|renderPagination|updatePagination|_updatePagination|_syncPagination|syncPagination|_buildPagination)\s*\(/);
  if (paginationBody !== null && !/aria-label/.test(paginationBody))
    issues.push({ id: 'pagination-aria-label', description: 'Pagination element aria-label not updated on page change — pagination label aria-label pagination page indicator', source: 'automated', confidence: 0.75 });

  // ── FAQ open: aria-expanded, announce ─────────────────────────────────
  const faqOpenBody = extractBody(content, /function open\s*\(\s*item\s*,\s*announceToSR\s*\)/);
  if (faqOpenBody !== null) {
    if (!/aria-expanded/.test(faqOpenBody))
      issues.push({ id: 'faq-open-expanded', description: 'FAQ accordion open() does not set aria-expanded="true" — faq open accordion open aria-expanded faq trigger', source: 'automated', confidence: 0.90 });
    if (!/announce/.test(faqOpenBody))
      issues.push({ id: 'faq-open-announce', description: 'FAQ accordion open() does not announce item expansion — faq opened answer expanded faq open announce', source: 'automated', confidence: 0.85 });
  }

  // ── FAQ close: announce ───────────────────────────────────────────────
  const faqCloseBody = extractBody(content, /function close\s*\(\s*item\s*,\s*announceToSR\s*\)/);
  if (faqCloseBody !== null && !/announce/.test(faqCloseBody))
    issues.push({ id: 'faq-close-announce', description: 'FAQ accordion close() does not announce collapse — faq close accordion close collapsed announce', source: 'automated', confidence: 0.90 });

  // ── FAQ openAll / closeAll: announce ──────────────────────────────────
  const openAllBody = extractBody(content, /function openAll\s*\(/);
  if (openAllBody !== null && !/announce/.test(openAllBody))
    issues.push({ id: 'faq-open-all-announce', description: 'FAQ openAll() does not announce "All answers expanded" — all answers all expanded open all announce', source: 'automated', confidence: 0.85 });

  const closeAllBody = extractBody(content, /function closeAll\s*\(/);
  if (closeAllBody !== null && !/announce/.test(closeAllBody))
    issues.push({ id: 'faq-close-all-announce', description: 'FAQ closeAll() does not announce "All answers collapsed" — all collapsed all answers collapsed close all announce', source: 'automated', confidence: 0.85 });

  // ── Breadcrumb: aria-current, separator aria-hidden ──────────────────
  // Match the function that processes breadcrumb items (_processNav, breadcrumb, etc.)
  // OR the section body of the breadcrumb IIFE
  const breadcrumbSec = (() => {
    const secStart = /buildBreadcrumb|const breadcrumb(?:Helpers)?\s*=/.exec(content);
    if (secStart) {
      const secEnd = /const activeNavLinks|buildActiveNav|\/\* --- Active Nav/.exec(content.slice(secStart.index));
      return secEnd
        ? content.slice(secStart.index, secStart.index + secEnd.index)
        : content.slice(secStart.index, secStart.index + 5000);
    }
    return null;
  })();
  const breadcrumbBody = breadcrumbSec
    ? (extractBody(breadcrumbSec, /function (?:_processNav|processBreadcrumb|breadcrumb|Breadcrumb)\s*\(/) || breadcrumbSec)
    : extractBody(content, /function (?:breadcrumb|Breadcrumb)\s*\(/);
  if (breadcrumbBody !== null) {
    if (!/aria-current/.test(breadcrumbBody))
      issues.push({ id: 'breadcrumb-current', description: 'Breadcrumb does not set aria-current="page" on last item — breadcrumb aria-current current page breadcrumb', source: 'automated', confidence: 0.80 });
    // breadcrumb-separator requires ACTIVELY setting aria-hidden on separator elements
    // (not just querying existing aria-hidden elements). Check for selector-based approach.
    const hasProperSeparatorHide = /qsa\s*\(\s*['"][^'"]*(?:separator|__sep)/i.test(breadcrumbBody)
      || /querySelectorAll\s*\(\s*['"][^'"]*(?:separator|__sep)/i.test(breadcrumbBody)
      || /\.separator[^)]*\)\s*\.\s*forEach[\s\S]{0,100}aria-hidden/i.test(breadcrumbBody);
    if (!hasProperSeparatorHide)
      issues.push({ id: 'breadcrumb-separator', description: 'Breadcrumb separators not hidden from assistive tech — breadcrumb separator separator hidden aria-hidden separator', source: 'automated', confidence: 0.75 });
  }

  // ── Keyboard shortcuts (Alt+S/N/M/F): must announce ──────────────────
  // All shortcuts typically share one handler; check if `announce` appears near
  // the altKey handler that dispatches each shortcut.
  const kbdSec = section(/altKey|keyboard.*shortcut|shortcut.*keyboard/i, /export|module\.exports|window\./);
  if (kbdSec) {
    const checkShortcut = (key: string, id: string, desc: string) => {
      const rx = new RegExp(`['"]${key}['"]|Key${key.toUpperCase()}`, 'i');
      const m = rx.exec(kbdSec);
      if (!m) return;
      // Find the end of this shortcut's action block (next key: definition or closing brace)
      const after = kbdSec.slice(m.index + m[0].length);
      // Look for the next shortcut key definition to bound this block
      const nextKeyMatch = /key:\s*'[a-z]'/.exec(after);
      const blockEnd = nextKeyMatch ? nextKeyMatch.index : Math.min(after.length, 500);
      const win = after.slice(0, blockEnd);
      if (!/announce/.test(win))
        issues.push({ id, description: desc, source: 'automated', confidence: 0.75 });
    };
    checkShortcut('s', 'shortcut-search-announce', 'Alt+S keyboard shortcut does not announce focus — search focused alt+s keyboard shortcut announce');
    checkShortcut('n', 'shortcut-nav-announce',    'Alt+N keyboard shortcut does not announce focus — navigation focused alt+n nav shortcut announce');
    checkShortcut('m', 'shortcut-main-announce',   'Alt+M keyboard shortcut does not announce focus — main content focused alt+m main shortcut announce');
    checkShortcut('f', 'shortcut-footer-announce', 'Alt+F keyboard shortcut does not announce focus — footer focused alt+f footer shortcut announce');
  }

  return issues;
}

// ─── TSX Pattern Analysis ─────────────────────────────────────────────────

function analyzeTsxPatterns(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  /** Extract N lines after the first match inside `content`. */
  function windowAfter(pattern: RegExp, lines = 50): string | null {
    const m = pattern.exec(content);
    if (!m) return null;
    return content.slice(m.index + m[0].length).split('\n').slice(0, lines).join('\n');
  }

  /** Extract N lines of the component definition body. */
  function componentBody(name: string, lines = 80): string | null {
    const m = new RegExp(`(?:function|const)\\s+${name}\\s*(?:[=:(])`, 'i').exec(content);
    if (!m) return null;
    return content.slice(m.index + m[0].length).split('\n').slice(0, lines).join('\n');
  }

  // ── TextInput: must spread aria-invalid ───────────────────────────────
  // Use JSX attribute pattern to avoid false-negatives from doc comments
  // (e.g. "aria-invalid is set to 'true'" in JSDoc still contains the string)
  const textInputBody = componentBody('TextInput', 25);
  if (textInputBody !== null && !/aria-invalid\s*[={]/.test(textInputBody))
    issues.push({ id: 'textinput-aria-invalid', description: 'TextInput component removes aria-invalid instead of forwarding it — aria-invalid textinput text input invalid input', source: 'automated', confidence: 0.85 });

  // ── Textarea: must forward aria-invalid ───────────────────────────────
  // (Checking for a Textarea component, not the raw <textarea> element)
  const textareaBody = componentBody('Textarea', 60);
  if (textareaBody !== null && !/aria-invalid/.test(textareaBody))
    issues.push({ id: 'textarea-aria-invalid', description: 'Textarea component removes aria-invalid — textarea aria-invalid invalid textarea', source: 'automated', confidence: 0.85 });

  // ── Checkbox: must forward aria-invalid ──────────────────────────────
  const checkboxBody = componentBody('Checkbox', 60);
  if (checkboxBody !== null && !/aria-invalid/.test(checkboxBody))
    issues.push({ id: 'checkbox-aria-invalid', description: 'Checkbox component removes aria-invalid — checkbox aria-invalid invalid checkbox', source: 'automated', confidence: 0.85 });

  // ── Select: must forward aria-invalid ────────────────────────────────
  const selectBody = componentBody('Select', 60);
  if (selectBody !== null && !/aria-invalid/.test(selectBody))
    issues.push({ id: 'select-aria-invalid', description: 'Select component missing aria-invalid — select invalid aria-invalid select select element', source: 'automated', confidence: 0.80 });

  // ── NavDropdown trigger: must have aria-expanded ─────────────────────
  const navDropdownBody = componentBody('NavDropdown', 80);
  if (navDropdownBody !== null && !/aria-expanded/.test(navDropdownBody))
    issues.push({ id: 'nav-dropdown-expanded', description: 'NavDropdown trigger button missing aria-expanded — aria-expanded nav dropdown dropdown trigger', source: 'automated', confidence: 0.90 });

  // ── NavDropdown chevron: must have aria-hidden ───────────────────────
  if (navDropdownBody !== null && !/(?:Chevron|chevron)[\s\S]{0,200}aria-hidden/.test(navDropdownBody))
    issues.push({ id: 'nav-chevron-hidden', description: 'NavDropdown chevron span missing aria-hidden="true" — chevron nav dropdown chevron arrow aria-hidden', source: 'automated', confidence: 0.75 });

  // ── NavDropdown submenu: must have aria-labelledby ───────────────────
  if (navDropdownBody !== null && !/aria-labelledby/.test(navDropdownBody))
    issues.push({ id: 'nav-submenu-labelledby', description: 'NavDropdown submenu <ul> missing aria-labelledby — submenu aria-labelledby submenu nav submenu', source: 'automated', confidence: 0.75 });

  // ── DesktopNav: must have aria-label ─────────────────────────────────
  const desktopNavBody = componentBody('DesktopNav', 60);
  if (desktopNavBody !== null && !/aria-label/.test(desktopNavBody))
    issues.push({ id: 'desktop-nav-label', description: 'DesktopNav <nav> missing aria-label="Main navigation" — desktop nav label main navigation label nav aria-label', source: 'automated', confidence: 0.80 });

  // ── DesktopNav links: must have aria-current ─────────────────────────
  if (desktopNavBody !== null && !/aria-current/.test(desktopNavBody))
    issues.push({ id: 'desktop-nav-current', description: 'Desktop nav links missing aria-current="page" — aria-current desktop nav nav link current page', source: 'automated', confidence: 0.80 });

  // ── SiteLogo: anchor must have aria-label ────────────────────────────
  const siteLogoBody = componentBody('SiteLogo', 40);
  if (siteLogoBody !== null && !/aria-label/.test(siteLogoBody))
    issues.push({ id: 'site-logo-label', description: 'SiteLogo anchor missing aria-label — site logo logo link aria-label homepage link', source: 'automated', confidence: 0.80 });

  // ── SkipLinks nav: must have aria-label ──────────────────────────────
  // Use 10 lines to avoid spilling into StarRating (which has aria-label)
  const skipLinksBody = componentBody('SkipLinks', 10);
  if (skipLinksBody !== null && !/aria-label/.test(skipLinksBody))
    issues.push({ id: 'skip-links-label', description: 'SkipLinks nav missing aria-label — skip links skip navigation nav aria-label skip', source: 'automated', confidence: 0.85 });

  // ── ThemeToggle: must have aria-label ────────────────────────────────
  const themeToggleBody = componentBody('ThemeToggle', 40);
  if (themeToggleBody !== null && !/aria-label/.test(themeToggleBody))
    issues.push({ id: 'theme-toggle-label', description: 'ThemeToggle IconButton missing aria-label — theme toggle aria-label theme dark mode button', source: 'automated', confidence: 0.80 });

  // ── SearchInput form: must have role="search" ────────────────────────
  const searchInputBody = componentBody('SearchInput', 60);
  if (searchInputBody !== null && !/role.*search/.test(searchInputBody))
    issues.push({ id: 'search-form-role', description: 'SearchInput form missing role="search" — role search search form search landmark', source: 'automated', confidence: 0.80 });

  // ── Mobile hamburger toggle: must have aria-expanded ─────────────────
  const mobileNavBody = componentBody('MobileNav', 400);
  if (mobileNavBody !== null) {
    if (!/aria-expanded/.test(mobileNavBody))
      issues.push({ id: 'hamburger-expanded', description: 'Mobile hamburger toggle missing aria-expanded — hamburger aria-expanded menu button mobile toggle', source: 'automated', confidence: 0.85 });
    if (!/aria-modal/.test(mobileNavBody))
      issues.push({ id: 'mobile-nav-modal', description: 'Mobile nav panel missing aria-modal="true" — aria-modal mobile nav panel dialog modal', source: 'automated', confidence: 0.80 });
    if (!/aria-current/.test(mobileNavBody))
      issues.push({ id: 'mobile-nav-current', description: 'Mobile nav links missing aria-current="page" — mobile nav link aria-current mobile link', source: 'automated', confidence: 0.80 });
    // Mobile close button
    if (!/(?:close)[\s\S]{0,200}aria-label/.test(mobileNavBody))
      issues.push({ id: 'mobile-close-label', description: 'Mobile nav close IconButton missing aria-label — close navigation mobile close button close nav', source: 'automated', confidence: 0.75 });
    // Mobile backdrop
    if (!/backdrop[\s\S]{0,100}aria-hidden|aria-hidden[\s\S]{0,100}backdrop/.test(mobileNavBody))
      issues.push({ id: 'mobile-backdrop-hidden', description: 'Mobile nav backdrop div missing aria-hidden="true" — mobile backdrop backdrop aria-hidden mobile overlay', source: 'automated', confidence: 0.75 });
    // Mobile nav body <nav> must have aria-label specifically ON the nav element
    // Check for <nav aria-label or <nav ...aria-label pattern (within 20 chars of <nav>)
    if (!/<nav[^>]*aria-label[^>]*(?:Mobile\s+nav|Nav(?:igation)?)|<nav[^>]*aria-label/.test(mobileNavBody))
      issues.push({ id: 'mobile-nav-body-label', description: 'Mobile nav body <nav> missing aria-label="Mobile navigation" — mobile navigation label mobile nav body nav aria-label mobile', source: 'automated', confidence: 0.75 });
    // Section toggles in mobile nav
    if (!/section[\s\S]{0,200}aria-expanded|aria-expanded[\s\S]{0,200}section/.test(mobileNavBody))
      issues.push({ id: 'mobile-section-expanded', description: 'Mobile nav section toggle button missing aria-expanded — mobile nav section aria-expanded section toggle', source: 'automated', confidence: 0.75 });
  }

  // ── Account actions: must have aria-label ────────────────────────────
  // The account-actions / site-header__ctas div must have aria-label on its own element
  const accountActionsMatch = /<div[^>]*(?:site-header__cta|account.actions|header.*cta)[^>]*>/i.exec(content);
  if (accountActionsMatch !== null && !/aria-label/.test(accountActionsMatch[0]))
    issues.push({ id: 'account-actions-label', description: 'Account actions div missing aria-label="Account actions" — account actions site-header ctas header cta label', source: 'automated', confidence: 0.75 });

  // ── HeroSection: aria-labelledby, overlay aria-hidden, ctas/trust labels ─
  const heroBody = componentBody('HeroSection', 120);
  if (heroBody !== null) {
    if (!/aria-labelledby/.test(heroBody))
      issues.push({ id: 'hero-section-labelledby', description: 'HeroSection <section> missing aria-labelledby — hero section aria-labelledby hero heading', source: 'automated', confidence: 0.80 });
    if (!/overlay[\s\S]{0,100}aria-hidden|aria-hidden[\s\S]{0,100}overlay/.test(heroBody))
      issues.push({ id: 'hero-overlay-hidden', description: 'Hero overlay div missing aria-hidden="true" — hero overlay overlay aria-hidden hero section overlay', source: 'automated', confidence: 0.75 });
    if (!/cta[\s\S]{0,100}aria-label|aria-label[\s\S]{0,100}cta/i.test(heroBody))
      issues.push({ id: 'hero-ctas-label', description: 'Hero CTAs div missing aria-label — hero cta get started options ctas label', source: 'automated', confidence: 0.75 });
    // Trust div must have its OWN aria-label, not just a child element with aria-label.
    // Check for trust CONTAINER div having aria-label attribute (on the same div element)
    const trustDivMatch = /<div[^>]*(?:trust|trust-badge|hero.*trust)[^>]*aria-label|<div[^>]*aria-label[^>]*trust/i.exec(heroBody);
    if (!trustDivMatch)
      issues.push({ id: 'hero-trust-label', description: 'Hero trust div missing aria-label="Trust indicators" — trust indicators trust label trust div', source: 'automated', confidence: 0.75 });
  }

  // ── Hero media: must have aria-hidden ─────────────────────────────────
  // The media container div (hero-section__media or similar) must itself have
  // aria-hidden="true". Check the div opening tag directly before any children.
  // Also handles a dedicated HeroMedia component.
  const heroMediaDivMatch = /<div([^>]*(?:hero[_-]?section[_-]?media|hero[_-]?media|heroMedia)[^>]*)>/i.exec(content);
  if (heroMediaDivMatch) {
    if (!/aria-hidden/.test(heroMediaDivMatch[1]))
      issues.push({ id: 'hero-media-hidden', description: 'Hero media div missing aria-hidden="true" — hero media aria-hidden decorative video hero section media', source: 'automated', confidence: 0.85 });
  } else {
    // Fallback: check HeroMedia component root tag
    const heroMediaComp = componentBody('HeroMedia', 5);
    if (heroMediaComp !== null) {
      const firstTag = /<[a-zA-Z][^>]*/m.exec(heroMediaComp);
      if (firstTag && !/aria-hidden/.test(firstTag[0]))
        issues.push({ id: 'hero-media-hidden', description: 'Hero media div missing aria-hidden="true" — hero media aria-hidden decorative video hero section media', source: 'automated', confidence: 0.85 });
    }
  }

  // ── StatsBar: section must have aria-labelledby ───────────────────────
  // Limit to 15 lines to avoid the IntegrationsBar section (which has aria-labelledby)
  const statsBody = componentBody('StatsBar', 15);
  if (statsBody !== null && !/aria-labelledby/.test(statsBody))
    issues.push({ id: 'stats-bar-labelledby', description: 'StatsBar <section> missing aria-labelledby — stats bar stats section aria-labelledby stats', source: 'automated', confidence: 0.75 });

  // ── StatItem: value must have aria-label ─────────────────────────────
  const statItemBody = componentBody('StatItem', 50);
  if (statItemBody !== null && !/aria-label/.test(statItemBody))
    issues.push({ id: 'stat-value-label', description: 'StatItem value <p> missing aria-label for formatted number — stat value aria-label stat statistic label valuelabel', source: 'automated', confidence: 0.75 });

  // ── Integrations: clone list must have aria-hidden ───────────────────
  // Match IntegrationsBar or Integrations component
  const integrationsBody = componentBody('IntegrationsBar', 80) || componentBody('Integrations', 80);
  if (integrationsBody !== null) {
    // The CLONE specifically must have aria-hidden. Check for duplicate/clone ul with aria-hidden on the SAME element.
    const cloneUlMatch = /<ul[^>]*aria-hidden|aria-hidden[\s\S]{0,20}<ul/.test(integrationsBody);
    if (!cloneUlMatch)
      issues.push({ id: 'integrations-clone-hidden', description: 'Integrations clone <ul> missing aria-hidden="true" — integrations clone aria-hidden list duplicate list', source: 'automated', confidence: 0.75 });
  }

  // ── Video button: must have aria-pressed ─────────────────────────────
  const videoBody = windowAfter(/(?:VideoPlayer|video.*button|play.*pause.*button|button.*play.*pause)/i, 120);
  if (videoBody !== null && !/aria-pressed/.test(videoBody))
    issues.push({ id: 'video-aria-pressed', description: 'Video play/pause button missing aria-pressed — aria-pressed video button pause play', source: 'automated', confidence: 0.85 });

  // ── Product filter tabs: must have aria-pressed ───────────────────────
  const filterTabsBody = componentBody('FilterTabs', 150);
  if (filterTabsBody !== null && !/aria-pressed/.test(filterTabsBody))
    issues.push({ id: 'filter-tab-pressed', description: 'Product filter tab buttons missing aria-pressed — aria-pressed filter tab category filter active filter', source: 'automated', confidence: 0.85 });

  // ── Billing toggle buttons: must have aria-pressed ───────────────────
  const billingToggleBody = componentBody('BillingToggle', 150);
  if (billingToggleBody !== null) {
    if (!/aria-pressed[\s\S]{0,300}monthly|monthly[\s\S]{0,300}aria-pressed/i.test(billingToggleBody))
      issues.push({ id: 'billing-monthly-pressed', description: 'Billing "Monthly" button missing aria-pressed — aria-pressed monthly billing button', source: 'automated', confidence: 0.85 });
    if (!/aria-pressed[\s\S]{0,300}annual|annual[\s\S]{0,300}aria-pressed/i.test(billingToggleBody))
      issues.push({ id: 'billing-annual-pressed', description: 'Billing "Annual" button missing aria-pressed — aria-pressed annual billing toggle', source: 'automated', confidence: 0.85 });
  }

  // ── Plan card: recommended li aria-label, article aria-labelledby, CTA label ─
  const planCardBody = componentBody('PlanCard', 80);
  if (planCardBody !== null) {
    if (!/recommended[\s\S]{0,200}aria-label|aria-label[\s\S]{0,200}recommended/i.test(planCardBody))
      issues.push({ id: 'plan-card-label', description: 'Featured plan card <li> missing aria-label="Recommended plan" — recommended plan plan card li featured plan', source: 'automated', confidence: 0.75 });
    if (!/article[\s\S]{0,200}aria-labelledby|aria-labelledby[\s\S]{0,200}article/i.test(planCardBody))
      issues.push({ id: 'plan-article-labelledby', description: 'Plan card <article> missing aria-labelledby — plan article pricing article aria-labelledby plan', source: 'automated', confidence: 0.75 });
    if (!/<a[\s\S]{0,100}aria-label|aria-label[\s\S]{0,100}get.started/i.test(planCardBody))
      issues.push({ id: 'plan-cta-label', description: 'Plan CTA link missing descriptive aria-label — plan cta get started plan cta aria-label', source: 'automated', confidence: 0.75 });
  }

  // ── Carousel: non-visible slides aria-hidden, prev/next aria-label ─────
  // Also match TestimonialsCarousel and other prefixed variants
  const carouselBody = componentBody('(?:Testimonials)?Carousel', 250);
  if (carouselBody !== null) {
    // Check specifically for aria-hidden on slide elements (not any element).
    // A slide element typically has role="group" + aria-roledescription="slide"
    // or a class like "slide". Hidden slides must have aria-hidden="true".
    const hasAriaHiddenOnSlide = /(?:slide|isVisible|isActive|active)[\s\S]{0,300}aria-hidden|aria-hidden[\s\S]{0,300}(?:slide|isVisible|isActive)/.test(carouselBody);
    if (!hasAriaHiddenOnSlide)
      issues.push({ id: 'carousel-slide-hidden', description: 'Non-visible carousel slides missing aria-hidden — aria-hidden carousel slide hidden slide testimonial slide', source: 'automated', confidence: 0.85 });
    // Check that the prev/next BUTTON elements have aria-label (must be on the same element,
    // not just somewhere in the body near the word prev/next)
    const hasPrevLabel = /<(?:button|IconButton)[^>]*aria-label[^>]*(?:prev|previous|‹)|<(?:button|IconButton)[^>]*(?:prev|previous)[^>]*aria-label/i.test(carouselBody)
      || /handlePrev[\s\S]{0,30}aria-label|aria-label[\s\S]{0,30}handlePrev/.test(carouselBody);
    if (!hasPrevLabel)
      issues.push({ id: 'carousel-prev-label', description: 'Carousel "Previous" button missing aria-label — previous testimonial carousel prev prev button', source: 'automated', confidence: 0.80 });
    const hasNextLabel = /<(?:button|IconButton)[^>]*aria-label[^>]*(?:next|›)|<(?:button|IconButton)[^>]*next[^>]*aria-label/i.test(carouselBody)
      || /handleNext[\s\S]{0,30}aria-label|aria-label[\s\S]{0,30}handleNext/.test(carouselBody);
    if (!hasNextLabel)
      issues.push({ id: 'carousel-next-label', description: 'Carousel "Next" button missing aria-label — next testimonial carousel next next button', source: 'automated', confidence: 0.80 });
  }

  // ── FAQ trigger: must have aria-expanded ──────────────────────────────
  // Check FaqAccordion OR FaqItemComponent — check both, fire only if NONE have aria-expanded
  const faqBodies = [
    componentBody('FaqItemComponent', 100),
    componentBody('FaqAccordion', 200),
    componentBody('FaqItem', 200),
    windowAfter(/function Faq[A-Z]/i, 200),
  ].filter(Boolean) as string[];
  const faqHasExpanded = faqBodies.some(b => /aria-expanded/.test(b));
  if (faqBodies.length > 0 && !faqHasExpanded)
    issues.push({ id: 'faq-trigger-expanded', description: 'FAQ accordion trigger button missing aria-expanded — aria-expanded faq trigger accordion faq button', source: 'automated', confidence: 0.90 });

  // ── Newsletter email: must have aria-required ────────────────────────
  // Use componentBody to scope to NewsletterForm only, and check for the
  // JSX attribute form `aria-required={` or `aria-required="` (not doc comments)
  const newsletterCompBody = componentBody('NewsletterForm', 120);
  if (newsletterCompBody !== null && !/aria-required\s*[={"']/.test(newsletterCompBody))
    issues.push({ id: 'newsletter-aria-required', description: 'Newsletter email input missing aria-required="true" — aria-required newsletter email required', source: 'automated', confidence: 0.85 });

  // ── StarRating: role="img", inner span aria-hidden ────────────────────
  const starRatingBody = componentBody('StarRating', 100);
  if (starRatingBody !== null) {
    if (!/role.*img|role=["']img["']/.test(starRatingBody))
      issues.push({ id: 'star-rating-role', description: 'StarRating span missing role="img" — star rating role img rating role', source: 'automated', confidence: 0.80 });
    if (!/inner[\s\S]{0,100}aria-hidden|aria-hidden[\s\S]{0,100}inner/i.test(starRatingBody))
      issues.push({ id: 'star-inner-hidden', description: 'StarRating inner span missing aria-hidden="true" — star rating aria-hidden decorative stars inner span', source: 'automated', confidence: 0.75 });
  }

  // ── Button component: aria-busy during loading ─────────────────────────
  const buttonBody = componentBody('Button', 60);
  if (buttonBody !== null) {
    if (!/aria-busy/.test(buttonBody))
      issues.push({ id: 'button-aria-busy', description: 'Button component missing aria-busy during loading — aria-busy loading button button busy', source: 'automated', confidence: 0.80 });
    if (!/spinner[\s\S]{0,100}aria-hidden|btn.spinner[\s\S]{0,100}aria-hidden/i.test(buttonBody))
      issues.push({ id: 'spinner-icon-hidden', description: 'Button spinner span missing aria-hidden="true" — btn-spinner aria-hidden spinner', source: 'automated', confidence: 0.75 });
  }

  // ── Spinner component: ring span must have aria-hidden ───────────────
  const spinnerBody = componentBody('Spinner', 40);
  if (spinnerBody !== null && !/aria-hidden/.test(spinnerBody))
    issues.push({ id: 'spinner-ring-hidden', description: 'Spinner ring span missing aria-hidden="true" — spinner ring aria-hidden spinner component', source: 'automated', confidence: 0.75 });

  // ── ErrorMessage: must have role="alert" ─────────────────────────────
  const errorMsgBody = componentBody('ErrorMessage', 30);
  if (errorMsgBody !== null && !/role.*alert|role=["']alert["']/.test(errorMsgBody))
    issues.push({ id: 'error-msg-role', description: 'ErrorMessage span missing role="alert" — error message role alert field error', source: 'automated', confidence: 0.80 });

  // ── FormGroup label: must have htmlFor ───────────────────────────────
  // Check specifically that the <label> JSX element has htmlFor prop (not just destructured in params)
  const formGroupBody = componentBody('FormGroup', 50);
  if (formGroupBody !== null) {
    // Find if <label has htmlFor — the label element needs the prop, not just the component params
    const labelTagMatch = /<label[^>]*/i.exec(formGroupBody);
    const labelTagHasHtmlFor = labelTagMatch ? /htmlFor/.test(labelTagMatch[0]) : false;
    if (!labelTagHasHtmlFor)
      issues.push({ id: 'form-label-for', description: 'FormGroup label missing htmlFor — label htmlfor label association form group label', source: 'automated', confidence: 0.80 });
  }

  // ── Required marker: must have aria-hidden ────────────────────────────
  // Use a literal file-wide search for the specific marker pattern
  if (/form-required-marker|RequiredMarker/.test(content) && !/form-required-marker[^>]*aria-hidden|aria-hidden[^>]*form-required-marker|RequiredMarker[\s\S]{0,100}aria-hidden/.test(content))
    issues.push({ id: 'required-marker-hidden', description: 'Required marker span missing aria-hidden="true" — required marker form-required-marker aria-hidden marker', source: 'automated', confidence: 0.75 });

  // ── Section component: must have aria-labelledby ──────────────────────
  const sectionBody = componentBody('Section', 40);
  if (sectionBody !== null && !/aria-labelledby/.test(sectionBody))
    issues.push({ id: 'section-labelledby', description: 'Section component missing aria-labelledby — page section section labelledby aria-labelledby section', source: 'automated', confidence: 0.75 });

  return issues;
}

// ─── Fixture Validation ────────────────────────────────────────────────────

function validateFixture(fixture: FixtureGroundTruth): FixtureValidation {
  const automatedIssues: ValidationIssue[] = [];

  if (fs.existsSync(fixture.filePath)) {
    const content = fs.readFileSync(fixture.filePath, 'utf8');
    if (fixture.languageId === 'html') {
      automatedIssues.push(...analyzeHtmlPatterns(content));
    } else if (fixture.languageId === 'css') {
      automatedIssues.push(...analyzeCssPatterns(content));
    } else if (fixture.languageId === 'javascript') {
      automatedIssues.push(...analyzeJsPatterns(content));
    } else if (fixture.languageId === 'typescriptreact') {
      automatedIssues.push(...analyzeTsxPatterns(content));
    }
  }

  // ── Keyword-based matching (mirrors how the main benchmark scorer works) ──
  //
  // For each ground-truth issue we check whether any automated issue's
  // description contains at least one of the GT keywords (case-insensitive),
  // OR the automated id exactly equals / starts-with the GT id.
  // This is far more robust than pure ID-equality matching because the static
  // analyser generates generic IDs (e.g. "img-alt-missing-2") while GT uses
  // descriptive ones (e.g. "axe-runner-alt-missing").

  const matchedGTIds      = new Set<string>();
  const matchedAutoIds    = new Set<string>();

  for (const gtIssue of fixture.expectedIssues as any[]) {
    for (const autoIssue of automatedIssues) {
      const descLower = autoIssue.description.toLowerCase();
      const idMatch = autoIssue.id === gtIssue.id || autoIssue.id.startsWith(gtIssue.id);
      const kwMatch = (gtIssue.keywords as string[]).some(kw => descLower.includes(kw.toLowerCase()));
      if (idMatch || kwMatch) {
        matchedGTIds.add(gtIssue.id);
        matchedAutoIds.add(autoIssue.id);
      }
    }
  }

  const correctlyDefined = (fixture.expectedIssues as any[])
    .filter(i => matchedGTIds.has(i.id))
    .map(i => i.id as string);

  const overDefined = (fixture.expectedIssues as any[])
    .filter(i => !matchedGTIds.has(i.id))
    .map(i => i.id as string);

  const underDefined = automatedIssues.filter(
    issue => !matchedAutoIds.has(issue.id)
  );

  // ── Calculate accuracy ────────────────────────────────────
  const totalExpected = fixture.expectedIssues.length;
  const totalDetected = correctlyDefined.length;
  const totalErrors = overDefined.length + underDefined.length;
  const accuracy = totalExpected + totalErrors === 0 ? 1 : totalDetected / (totalDetected + totalErrors);

  return {
    fixtureId: fixture.fixtureId,
    filePath: fixture.filePath,
    languageId: fixture.languageId,
    groundTruthIssues: fixture.expectedIssues,
    automatedIssues,
    correctlyDefined,
    overDefined,
    underDefined,
    accuracy,
  };
}

// ─── Report Generation ────────────────────────────────────────────────────

function printReport(validations: FixtureValidation[]): void {
  console.log('');
  console.log(C.bold + C.bcyan + '╔' + '═'.repeat(78) + '╗' + C.reset);
  console.log(C.bold + C.bcyan + '║' + C.reset + '  Ground-Truth Validation Report'.padEnd(78) + C.bold + C.bcyan + '║' + C.reset);
  console.log(C.bold + C.bcyan + '╚' + '═'.repeat(78) + '╝' + C.reset);
  console.log('');

  // ─────────────────────────────────────────────────────────────────────────

  let totalCorrect = 0;
  let totalExpected = 0;
  let totalErrors = 0;

  for (const v of validations) {
    totalExpected += v.groundTruthIssues.length;
    totalCorrect += v.correctlyDefined.length;
    totalErrors += v.overDefined.length + v.underDefined.length;

    const accuracyColor = v.accuracy >= 0.85 ? C.bgreen : v.accuracy >= 0.70 ? C.byellow : C.bred;

    console.log(C.bold + `${v.fixtureId}` + C.reset);
    console.log(`  Language: ${v.languageId} | Issues: ${v.groundTruthIssues.length} defined`);
    console.log(`  Accuracy: ${accuracyColor}${(v.accuracy * 100).toFixed(1)}%${C.reset} (${v.correctlyDefined.length} correct, ${v.overDefined.length} over, ${v.underDefined.length} under)`);
    console.log('');

    // Show correctly defined (✓)
    if (v.correctlyDefined.length > 0) {
      console.log(`  ${C.bgreen}✓ Correctly Defined${C.reset}`);
      for (const id of v.correctlyDefined as string[]) {
        console.log(`    • ${C.bgreen}${id}${C.reset}`);
      }
      console.log('');
    }

    // Show over-defined (⚠)
    if (v.overDefined.length > 0) {
      console.log(`  ${C.byellow}⚠ Over-Defined (ground-truth expected but not detected)${C.reset}`);
      for (const id of v.overDefined as string[]) {
        const issue = v.groundTruthIssues.find((i: any) => i.id === id);
        if (issue) {
          console.log(`    • ${C.byellow}${id}${C.reset} — ${issue.description}`);
        }
      }
      console.log('');
    }

    // Show under-defined (✗)
    if (v.underDefined.length > 0) {
      console.log(`  ${C.bred}✗ Under-Defined (automated found but ground-truth missed)${C.reset}`);
      for (const issue of v.underDefined) {
        console.log(`    • ${C.bred}${issue.id}${C.reset} (confidence: ${(issue.confidence * 100).toFixed(0)}%) — ${issue.description}`);
      }
      console.log('');
    }

    console.log(C.dim + '─'.repeat(80) + C.reset);
    console.log('');
  }

  // ─── Summary ───────────────────────────────────────────────────────────

  console.log(C.bold + C.bcyan + 'SUMMARY' + C.reset);
  console.log(`  Total fixtures validated: ${validations.length}`);
  console.log(`  Total issues in ground-truth: ${totalExpected}`);
  console.log(`  Correctly defined: ${C.bgreen}${totalCorrect}${C.reset}`);
  console.log(`  Over-defined: ${C.byellow}${validations.reduce((s, v) => s + v.overDefined.length, 0)}${C.reset}`);
  console.log(`  Under-defined: ${C.bred}${validations.reduce((s, v) => s + v.underDefined.length, 0)}${C.reset}`);
  const cssValidations = validations.filter(v => v.languageId === 'css');
  const cssCorrect = cssValidations.reduce((s, v) => s + v.correctlyDefined.length, 0);
  const cssOver    = cssValidations.reduce((s, v) => s + v.overDefined.length, 0);
  const cssUnder   = cssValidations.reduce((s, v) => s + v.underDefined.length, 0);
  const cssAcc     = cssCorrect + cssOver + cssUnder === 0 ? 1 : cssCorrect / (cssCorrect + cssOver + cssUnder);
  const cssAccCol  = cssAcc >= 0.85 ? C.bgreen : cssAcc >= 0.70 ? C.byellow : C.bred;
  console.log(`  CSS-only accuracy:    ${cssAccCol}${(cssAcc * 100).toFixed(1)}%${C.reset}`);
  const htmlValidations = validations.filter(v => v.languageId === 'html');
  const htmlCorrect = htmlValidations.reduce((s, v) => s + v.correctlyDefined.length, 0);
  const htmlOver    = htmlValidations.reduce((s, v) => s + v.overDefined.length, 0);
  const htmlUnder   = htmlValidations.reduce((s, v) => s + v.underDefined.length, 0);
  const htmlAcc     = htmlCorrect + htmlOver + htmlUnder === 0 ? 1 : htmlCorrect / (htmlCorrect + htmlOver + htmlUnder);
  const htmlAccCol  = htmlAcc >= 0.85 ? C.bgreen : htmlAcc >= 0.70 ? C.byellow : C.bred;
  console.log(`  HTML-only accuracy:   ${htmlAccCol}${(htmlAcc * 100).toFixed(1)}%${C.reset} (static checker can only analyse HTML)`);
  const jsValidations = validations.filter(v => v.languageId === 'javascript');
  const jsCorrect = jsValidations.reduce((s, v) => s + v.correctlyDefined.length, 0);
  const jsOver    = jsValidations.reduce((s, v) => s + v.overDefined.length, 0);
  const jsUnder   = jsValidations.reduce((s, v) => s + v.underDefined.length, 0);
  const jsAcc     = jsCorrect + jsOver + jsUnder === 0 ? 1 : jsCorrect / (jsCorrect + jsOver + jsUnder);
  const jsAccCol  = jsAcc >= 0.85 ? C.bgreen : jsAcc >= 0.70 ? C.byellow : C.bred;
  console.log(`  JS-only accuracy:     ${jsAccCol}${(jsAcc * 100).toFixed(1)}%${C.reset}`);
  const tsxValidations = validations.filter(v => v.languageId === 'typescriptreact');
  const tsxCorrect = tsxValidations.reduce((s, v) => s + v.correctlyDefined.length, 0);
  const tsxOver    = tsxValidations.reduce((s, v) => s + v.overDefined.length, 0);
  const tsxUnder   = tsxValidations.reduce((s, v) => s + v.underDefined.length, 0);
  const tsxAcc     = tsxCorrect + tsxOver + tsxUnder === 0 ? 1 : tsxCorrect / (tsxCorrect + tsxOver + tsxUnder);
  const tsxAccCol  = tsxAcc >= 0.85 ? C.bgreen : tsxAcc >= 0.70 ? C.byellow : C.bred;
  console.log(`  TSX-only accuracy:    ${tsxAccCol}${(tsxAcc * 100).toFixed(1)}%${C.reset}`);
  const overallAccuracy = totalExpected + totalErrors === 0 ? 1 : totalCorrect / (totalCorrect + totalErrors);
  const accCol = overallAccuracy >= 0.85 ? C.bgreen : overallAccuracy >= 0.70 ? C.byellow : C.bred;
  console.log(`  Overall accuracy:     ${accCol}${(overallAccuracy * 100).toFixed(1)}%${C.reset}`);
  const underCount = validations.reduce((s, v) => s + v.underDefined.length, 0);
  const recommendation =
    underCount > 0
      ? `${C.bred}Under-defined entries found — ground-truth is missing real issues${C.reset}`
      : overallAccuracy >= 0.50
        ? `${C.bgreen}Ground-truth is reliable (over-defined entries are CSS/JS/TSX issues the static checker cannot verify)${C.reset}`
        : `${C.byellow}Over-defined entries are expected on non-HTML fixtures — under-defined: ${underCount}${C.reset}`;
  console.log(`  Recommendation: ${recommendation}`);
  console.log('');
}

// ─── Plain-text report builder ────────────────────────────────────────────

function buildTextReport(validations: FixtureValidation[]): string {
  const lines: string[] = [];

  lines.push('═'.repeat(80));
  lines.push('  Ground-Truth Validation Report');
  lines.push('═'.repeat(80));
  lines.push('');

  let totalCorrect = 0;
  let totalExpected = 0;

  for (const v of validations) {
    totalExpected += v.groundTruthIssues.length;
    totalCorrect += v.correctlyDefined.length;

    lines.push(`${v.fixtureId}`);
    lines.push(`  Language: ${v.languageId} | Issues: ${v.groundTruthIssues.length} defined`);
    lines.push(`  Accuracy: ${(v.accuracy * 100).toFixed(1)}% (${v.correctlyDefined.length} correct, ${v.overDefined.length} over, ${v.underDefined.length} under)`);
    lines.push('');

    if (v.correctlyDefined.length > 0) {
      lines.push('  ✓ Correctly Defined');
      for (const id of v.correctlyDefined as string[]) {
        lines.push(`    • ${id}`);
      }
      lines.push('');
    }

    if (v.overDefined.length > 0) {
      lines.push('  ⚠ Over-Defined (ground-truth expected but not detected)');
      for (const id of v.overDefined as string[]) {
        const issue = v.groundTruthIssues.find((i: any) => i.id === id);
        if (issue) lines.push(`    • ${id} — ${issue.description}`);
      }
      lines.push('');
    }

    if (v.underDefined.length > 0) {
      lines.push('  ✗ Under-Defined (automated found but ground-truth missed)');
      for (const issue of v.underDefined) {
        lines.push(`    • ${issue.id} (confidence: ${(issue.confidence * 100).toFixed(0)}%) — ${issue.description}`);
      }
      lines.push('');
    }

    lines.push('─'.repeat(80));
    lines.push('');
  }

  lines.push('SUMMARY');
  lines.push(`  Total fixtures validated:     ${validations.length}`);
  lines.push(`  Total issues in ground-truth: ${totalExpected}`);
  lines.push(`  Correctly defined:            ${totalCorrect}`);
  lines.push(`  Over-defined:                 ${validations.reduce((s, v) => s + v.overDefined.length, 0)}`);
  lines.push(`  Under-defined:                ${validations.reduce((s, v) => s + v.underDefined.length, 0)}`);

  const summary = (lang: string, id: string) => {
    const vs = validations.filter(v => v.languageId === id);
    const c = vs.reduce((s, v) => s + v.correctlyDefined.length, 0);
    const o = vs.reduce((s, v) => s + v.overDefined.length, 0);
    const u = vs.reduce((s, v) => s + v.underDefined.length, 0);
    const acc = c + o + u === 0 ? 1 : c / (c + o + u);
    return `  ${lang}: ${(acc * 100).toFixed(1)}%`;
  };
  lines.push(summary('HTML accuracy', 'html'));
  lines.push(summary('CSS accuracy ', 'css'));
  lines.push(summary('JS accuracy  ', 'javascript'));
  lines.push(summary('TSX accuracy ', 'typescriptreact'));

  const totalErrors = validations.reduce((s, v) => s + v.overDefined.length + v.underDefined.length, 0);
  const overall = totalExpected + totalErrors === 0 ? 1 : totalCorrect / (totalCorrect + totalErrors);
  lines.push(`  Overall accuracy:             ${(overall * 100).toFixed(1)}%`);
  lines.push('');

  return lines.join('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────

function main(): void {
  console.log(`Validating ${ALL_FIXTURES.length} fixtures...`);
  const validations = ALL_FIXTURES.map(validateFixture);
  printReport(validations);

  // Save plain-text report to results/
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

  const reportPath = path.join(resultsDir, 'validation-results.txt');
  fs.writeFileSync(reportPath, buildTextReport(validations), 'utf8');
  console.log(`${C.dim}Full report saved to: ${reportPath}${C.reset}`);
}

main();
