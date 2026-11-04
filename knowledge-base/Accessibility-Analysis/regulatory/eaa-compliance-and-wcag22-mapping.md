# EAA Compliance and WCAG 2.2 Mapping

## Tags
Tags: #eaa #en301549 #wcag #regulatory #compliance #html #css #js #tsx

This file documents the regulatory mapping from the European Accessibility Act (EAA) through EN 301 549 v3.2.1 to the operative WCAG 2.2 Level A and AA success criteria. When reporting accessibility violations, identify the specific WCAG SC AND the corresponding EAA/EN 301 549 obligation where applicable.

---

## EAA Regulatory Framework

### What the EAA is
The European Accessibility Act (Directive 2019/882/EU) is EU legislation that requires certain products and services placed on the EU market to be accessible. It came into force on 28 June 2019 and entered enforcement for new products and services from **28 June 2025**. Existing products and services already on the market before June 2025 have until **28 June 2030** to comply.

The EAA applies to:
- Websites and mobile applications of **private-sector** entities offering services covered by the Directive (e-commerce, banking, transport, e-books, consumer electronics, audio-visual services, passenger transport services)
- Note: Public-sector websites are covered separately by the Web Accessibility Directive (EU 2016/2102), not the EAA

### How EAA maps to technical standards
The EAA mandates accessibility requirements but does not itself define how they are satisfied at a code level. Instead, it references **EN 301 549 v3.2.1** (published by ETSI) as the harmonised European standard that, when satisfied, creates a presumption of EAA conformity. EN 301 549 in turn incorporates **WCAG 2.1 Level AA** as its web content criterion set (Section 9). Because **WCAG 2.2 is backward-compatible with WCAG 2.1** and adds further success criteria for current interfaces, WCAG 2.2 Level A and AA constitutes the operative technical specification for EAA compliance in practice.

Mapping chain:
```
EAA (Directive 2019/882)
  → EN 301 549 v3.2.1 Section 9 (web content)
    → WCAG 2.1 Level A and AA (incorporated by reference)
      → WCAG 2.2 Level A and AA (superset; backward-compatible)
```

---

## WCAG 2.2 Success Criteria Required by the EAA (via EN 301 549)

All WCAG 2.2 Level A and AA success criteria are required for EAA compliance for in-scope web services. The following table documents the most commonly violated SCs and their EN 301 549 clause references.

| WCAG SC | Title | Level | EN 301 549 Clause | Notes |
|---|---|---|---|---|
| 1.1.1 | Non-text Content | A | 9.1.1.1 | Applies to all images, SVGs, input type=image |
| 1.3.1 | Info and Relationships | A | 9.1.3.1 | Semantic HTML, table headers, form labels |
| 1.3.2 | Meaningful Sequence | A | 9.1.3.2 | Logical DOM reading order |
| 1.3.3 | Sensory Characteristics | A | 9.1.3.3 | No instruction relying on shape/colour alone |
| 1.3.4 | Orientation | AA | 9.1.3.4 | No locked orientation |
| 1.3.5 | Identify Input Purpose | AA | 9.1.3.5 | autocomplete attributes on personal data fields |
| 1.4.1 | Use of Colour | A | 9.1.4.1 | Colour not the only visual means of conveying information |
| 1.4.2 | Audio Control | A | 9.1.4.2 | Media controls for auto-playing audio |
| 1.4.3 | Contrast (Minimum) | AA | 9.1.4.3 | 4.5:1 normal text; 3:1 large text |
| 1.4.4 | Resize Text | AA | 9.1.4.4 | Text resizable to 200% without loss of content |
| 1.4.5 | Images of Text | AA | 9.1.4.5 | Avoid text in images |
| 1.4.10 | Reflow | AA | 9.1.4.10 | Content reflows at 320 CSS px without horizontal scroll |
| 1.4.11 | Non-text Contrast | AA | 9.1.4.11 | 3:1 for UI components and focus indicators |
| 1.4.12 | Text Spacing | AA | 9.1.4.12 | No loss of content when text spacing is overridden |
| 1.4.13 | Content on Hover or Focus | AA | 9.1.4.13 | Tooltip/popover dismissible, hoverable, persistent |
| 2.1.1 | Keyboard | A | 9.2.1.1 | All functionality operable by keyboard |
| 2.1.2 | No Keyboard Trap | A | 9.2.1.2 | Keyboard focus not locked inside a component |
| 2.1.4 | Character Key Shortcuts | A | 9.2.1.4 | Single-character shortcuts must be remappable/disableable |
| 2.4.1 | Bypass Blocks | A | 9.2.4.1 | Skip navigation link or landmark structure |
| 2.4.2 | Page Titled | A | 9.2.4.2 | Descriptive `<title>` element |
| 2.4.3 | Focus Order | A | 9.2.4.3 | Logical focus sequence |
| 2.4.4 | Link Purpose (in Context) | A | 9.2.4.4 | Descriptive link text |
| 2.4.5 | Multiple Ways | AA | 9.2.4.5 | Multiple navigation paths to pages |
| 2.4.6 | Headings and Labels | AA | 9.2.4.6 | Descriptive headings and form labels |
| 2.4.7 | Focus Visible | AA | 9.2.4.7 | Keyboard focus indicator visible |
| 2.4.11 | Focus Not Obscured (Minimum) | AA | 9.2.4.11 | Focus indicator not fully hidden by sticky elements |
| 2.5.1 | Pointer Gestures | A | 9.2.5.1 | Multi-point or path-based gestures have single-pointer alternative |
| 2.5.2 | Pointer Cancellation | A | 9.2.5.2 | Down-event not used to trigger final action |
| 2.5.3 | Label in Name | A | 9.2.5.3 | Visible button/link label contained in accessible name |
| 2.5.4 | Motion Actuation | A | 9.2.5.4 | Device motion alternatives; ability to disable |
| 2.5.7 | Dragging Movements | AA | 9.2.5.7 | Drag operations have single-pointer alternative |
| 2.5.8 | Target Size (Minimum) | AA | 9.2.5.8 | Target area at least 24×24 CSS px |
| 3.1.1 | Language of Page | A | 9.3.1.1 | `lang` attribute on `<html>` |
| 3.1.2 | Language of Parts | AA | 9.3.1.2 | `lang` attribute on elements in different language |
| 3.2.1 | On Focus | A | 9.3.2.1 | No context change on focus |
| 3.2.2 | On Input | A | 9.3.2.2 | No context change on input without notice |
| 3.2.3 | Consistent Navigation | AA | 9.3.2.3 | Navigation consistent across pages |
| 3.2.4 | Consistent Identification | AA | 9.3.2.4 | Components with same function identified consistently |
| 3.2.6 | Consistent Help | A | 9.3.2.6 | Help mechanisms in consistent location |
| 3.3.1 | Error Identification | A | 9.3.3.1 | Error described in text |
| 3.3.2 | Labels or Instructions | A | 9.3.3.2 | Instructions provided for user input |
| 3.3.3 | Error Suggestion | AA | 9.3.3.3 | Suggested correction provided where known |
| 3.3.4 | Error Prevention | AA | 9.3.3.4 | Legal/financial/data submissions reversible or confirmable |
| 3.3.7 | Redundant Entry | A | 9.3.3.7 | Previously entered information not re-requested in same session |
| 3.3.8 | Accessible Authentication (Minimum) | AA | 9.3.3.8 | No cognitive function test required to authenticate |
| 4.1.1 | Parsing | A | 9.4.1.1 | Valid HTML (obsolete in WCAG 2.2 — see 4.1.2) |
| 4.1.2 | Name, Role, Value | A | 9.4.1.2 | All UI components have accessible name, role, state |
| 4.1.3 | Status Messages | AA | 9.4.1.3 | Status messages exposed to AT via ARIA live regions |

---

## EAA Scope: Which Services Are In-Scope

When analysing web code, the EAA applies if the digital product or service falls into one of these sectors:
- **E-commerce** (online retail, ticket booking, marketplace platforms)
- **Banking and financial services** (online banking, insurance portals, payment services)
- **Transport services** (passenger transport booking for air, bus, rail, waterborne)
- **E-books and associated software** (digital publishing platforms)
- **Audio-visual media services** (streaming platforms, video-on-demand)
- **Consumer electronics** with interactive digital interfaces
- **Operating systems** (general purpose)

Static informational websites serving general content (e.g. a personal blog, small informational site) that are not providing a commercial service covered by the above list are not directly mandated under EAA, but are still subject to WCAG best practice.

---

## EAA Enforcement and Remediation Priority

When prioritising violation remediation for EAA compliance, apply this order:
1. **Level A violations** — constitute a fundamental access barrier; must be resolved first
2. **Level AA violations** — required by EN 301 549/EAA; resolve to achieve full compliance
3. **Level AAA violations** — not required by EAA; advisory only

Under the EAA, **failure to comply after June 2025** exposes the service provider to:
- Enforcement action by national market surveillance authorities
- Complaints procedures for end users
- Potential civil liability under national implementing legislation

---

## How to Reference EAA in Violation Reports

When reporting an accessibility violation in source code, cite both the WCAG SC and the EAA pathway:

**Pattern:** "This violates WCAG 2.2 SC [X.X.X] ([Level A/AA]), which is required for EAA compliance via EN 301 549 clause [9.X.X.X]."

**Examples:**
- "Missing `alt` attribute on `<img>`: violates WCAG 2.2 SC 1.1.1 (Level A), required for EAA compliance via EN 301 549 clause 9.1.1.1."
- "Outline removed on focus without replacement: violates WCAG 2.2 SC 2.4.7 (Level AA), required for EAA compliance via EN 301 549 clause 9.2.4.7."
- "Form input has no associated label: violates WCAG 2.2 SC 1.3.1 and SC 4.1.2 (Level A), required for EAA compliance via EN 301 549 clauses 9.1.3.1 and 9.4.1.2."
