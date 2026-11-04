// ragQueryBuilder.ts — decides what to search for in the knowledge base
// Builds context-aware search queries for the RAG service based on the
// language and content of the file being analysed. Detects core frameworks
// (React, Vue, Angular) and maps code patterns to specific WCAG criteria
// so the most relevant knowledge chunks are retrieved.
// Supports: HTML, CSS/SCSS/Sass/Less, JavaScript, TypeScript, React, Vue, Angular.

// Build a smart query based on what's in the code (helps RAG find relevant docs)
export function buildRagQuery(languageId: string, code: string): string {
  const lower = code.toLowerCase();
  const hints: string[] = [];

  // Core web technologies - HTML
  if (languageId === "html") {
    hints.push("HTML accessibility WCAG guidelines semantic HTML");
    
    // Images & Media
    if (lower.includes("<img")) {
      hints.push("images alt text non-text content WCAG 1.1.1 SVG figures figcaption");
    }
    if (lower.includes("video") || lower.includes("audio") || lower.includes("<track")) {
      hints.push("media captions audio descriptions transcripts sign language audio control WCAG 1.2");
    }
    
    // Forms & Input
    if (lower.includes("<form") || lower.includes("<input") || lower.includes("<label")) {
      hints.push("forms labels accessible names input purpose autocomplete error messages validation required fields redundant entry accessible authentication WCAG 1.3.5 3.3");
    }
    
    // ARIA
    if (lower.includes("aria-")) {
      hints.push("ARIA best practices five rules widget patterns live regions status messages dynamic content WCAG 4.1.2");
    }
    
    // Keyboard & Focus
    if (lower.includes("button") || lower.includes("onclick") || lower.includes("tabindex") || lower.includes("autofocus")) {
      hints.push("keyboard navigation focus tab order focus indicators focus visible focus not obscured links versus buttons character key shortcuts WCAG 2.1 2.4.7");
    }
    
    // Navigation & Structure
    if (lower.includes("<nav") || lower.includes("menu") || lower.includes("<header") || lower.includes("<main")) {
      hints.push("navigation landmarks consistent navigation skip links breadcrumbs multiple ways page titles link purpose consistent identification WCAG 2.4 3.2");
    }
    if (lower.includes("<h1") || lower.includes("<h2") || lower.includes("heading")) {
      hints.push("headings logical hierarchy structure meaningful sequence WCAG 1.3.1 2.4.6");
    }
    
    // Tables
    if (lower.includes("<table")) {
      hints.push("tables headers scope caption data tables accessibility WCAG 1.3.1");
    }
    
    // Visual & Color
    if (lower.includes("color") || lower.includes("style") || lower.includes("background")) {
      hints.push("visual color contrast text spacing resize reflow dark mode high contrast non-text contrast images of text WCAG 1.4");
    }
    
    // Dialogs & Modals
    if (lower.includes("dialog") || lower.includes("modal") || lower.includes("popup") || lower.includes("aria-modal")) {
      hints.push("dialogs modal focus management focus trapping escape key dismissible WCAG 2.4.3");
    }
    
    // Gestures & Touch
    if (lower.includes("drag") || lower.includes("swipe") || lower.includes("gesture") || lower.includes("touch")) {
      hints.push("controls pointer gestures dragging movements motion actuation single-pointer alternatives target size WCAG 2.5");
    }
    
    // Timing & Animation
    if (lower.includes("timer") || lower.includes("timeout") || lower.includes("setinterval") || lower.includes("settimeout")) {
      hints.push("timing adjustable time limits auto-updating content pause stop hide WCAG 2.2");
    }
    if (lower.includes("animate") || lower.includes("transition") || lower.includes("@keyframes") || lower.includes("flash")) {
      hints.push("visual animation motion seizure prevention reduced motion parallax prefers-reduced-motion WCAG 2.3");
    }
    
    // Language & Internationalization
    if (lower.includes("lang=") || lower.includes("dir=") || lower.includes("rtl") || lower.includes("ltr")) {
      hints.push("structure language of page RTL bidirectional text internationalisation WCAG 3.1");
    }
    
    // Visibility & Hiding
    if (lower.includes("display:none") || lower.includes("visibility:hidden") || lower.includes("aria-hidden")) {
      hints.push("visual CSS visibility accessible hiding screen reader only content off-screen techniques");
    }
    
    // Hover & Focus States
    if (lower.includes("hover") || lower.includes(":hover") || lower.includes(":focus")) {
      hints.push("visual content on hover or focus dismissible hoverable persistent pointer focus WCAG 1.4.13");
    }
    
    // Testing & Documentation
    if (lower.includes("test") || lower.includes("axe") || lower.includes("validator")) {
      hints.push("testing automated testing manual testing accessibility evaluation tools");
    }
    
    hints.push("cognitive load readability predictable behavior assistive technology screen readers");
  }
  
  // CSS & Preprocessors
  else if (["css", "scss", "sass", "less"].includes(languageId)) {
    hints.push("CSS accessibility visual design WCAG");
    
    if (lower.includes("color") || lower.includes("background") || lower.includes("contrast")) {
      hints.push("color contrast text contrast non-text contrast WCAG 1.4.3 1.4.6 1.4.11");
    }
    if (lower.includes(":focus") || lower.includes("outline") || lower.includes("focus-visible")) {
      hints.push("focus indicators visible focus focus styles keyboard navigation WCAG 2.4.7 2.4.11");
    }
    if (lower.includes("animation") || lower.includes("transition") || lower.includes("@keyframes")) {
      hints.push("animation motion reduced motion prefers-reduced-motion seizure prevention WCAG 2.3");
    }
    if (lower.includes("font-size") || lower.includes("line-height") || lower.includes("letter-spacing")) {
      hints.push("text spacing resize reflow zoom WCAG 1.4.4 1.4.10 1.4.12");
    }
    if (lower.includes("prefers-color-scheme") || lower.includes("dark") || lower.includes("forced-colors")) {
      hints.push("dark mode high contrast forced colors WCAG 1.4.1");
    }
    if (lower.includes("@media")) {
      hints.push("responsive design orientation viewport media queries accessibility");
    }
    
    hints.push("visual accessibility CSS design patterns");
  }
  
  // React, Next.js, Gatsby
  else if (languageId.includes("react") || lower.includes("import react") || lower.includes("from 'react'") ||
           lower.includes("next/") || lower.includes("gatsby")) {
    hints.push("React accessibility JSX ARIA keyboard navigation focus management");
    
    if (lower.includes("onclick") || lower.includes("onkeydown") || lower.includes("tabindex")) {
      hints.push("keyboard events focus management interactive elements WCAG 2.1");
    }
    if (lower.includes("aria-")) {
      hints.push("ARIA in React live regions dynamic content widget patterns");
    }
    if (lower.includes("useref") || lower.includes("focus()")) {
      hints.push("focus management React refs modal dialogs WCAG 2.4.3");
    }
    if (lower.includes("<img") || lower.includes("<image") || lower.includes("alt=")) {
      hints.push("images alt text Next.js Image Gatsby Image optimization");
    }
    if (lower.includes("form") || lower.includes("input")) {
      hints.push("forms labels validation React forms accessible names");
    }
    if (lower.includes("modal") || lower.includes("dialog") || lower.includes("portal")) {
      hints.push("modal dialogs focus trapping portals accessibility");
    }
    if (lower.includes("useeffect") || lower.includes("usestate")) {
      hints.push("React hooks accessibility side effects dynamic content");
    }
    
    hints.push("component accessibility semantic HTML");
  }
  
  // Vue, Nuxt
  else if (languageId === "vue" || lower.includes("vue") || lower.includes("nuxt") || 
           lower.includes("v-model") || lower.includes("@click")) {
    hints.push("Vue accessibility directives ARIA keyboard navigation");
    
    if (lower.includes("@click") || lower.includes("@keydown") || lower.includes("tabindex")) {
      hints.push("keyboard events Vue event handling interactive elements WCAG 2.1");
    }
    if (lower.includes("aria-")) {
      hints.push("ARIA Vue components live regions accessibility");
    }
    if (lower.includes("$refs") || lower.includes("v-focus")) {
      hints.push("focus management Vue refs modal dialogs");
    }
    if (lower.includes("v-if") || lower.includes("v-show")) {
      hints.push("conditional rendering visibility screen readers");
    }
    if (lower.includes("transition") || lower.includes("v-enter") || lower.includes("v-leave")) {
      hints.push("Vue transitions animation accessibility reduced motion");
    }
    
    hints.push("Vue component patterns semantic HTML accessibility");
  }
  
  // Angular
  else if (lower.includes("@angular") || lower.includes("@component") || lower.includes("@ngmodule") ||
           lower.includes("*ngif") || lower.includes("[(ngmodel)]")) {
    hints.push("Angular accessibility CDK ARIA forms");
    
    if (lower.includes("(click)") || lower.includes("(keydown)") || lower.includes("tabindex")) {
      hints.push("keyboard events Angular event binding interactive elements WCAG 2.1");
    }
    if (lower.includes("aria-")) {
      hints.push("ARIA Angular components accessibility patterns");
    }
    if (lower.includes("cdkfocus") || lower.includes("focustrap") || lower.includes("viewchild")) {
      hints.push("Angular CDK focus management focus trapping modal accessibility");
    }
    if (lower.includes("matdialog") || lower.includes("mat-dialog")) {
      hints.push("Angular Material dialog modal accessibility");
    }
    if (lower.includes("formcontrol") || lower.includes("formgroup") || lower.includes("reactive forms")) {
      hints.push("Angular forms reactive forms validation accessibility");
    }
    
    hints.push("Angular accessibility Material CDK patterns");
  }
  
  // Plain JavaScript/TypeScript
  else if (["javascript", "typescript", "javascriptreact", "typescriptreact"].includes(languageId)) {
    hints.push("JavaScript accessibility ARIA DOM manipulation keyboard events");
    
    if (lower.includes("addeventlistener") || lower.includes("onclick")) {
      hints.push("event listeners keyboard accessibility mouse alternatives");
    }
    if (lower.includes("focus()") || lower.includes("blur()")) {
      hints.push("focus management JavaScript keyboard navigation");
    }
    if (lower.includes("queryselector")) {
      hints.push("DOM manipulation accessibility ARIA attributes");
    }
    if (lower.includes("modal") || lower.includes("dialog")) {
      hints.push("modal dialogs focus trapping JavaScript");
    }
    
    hints.push("JavaScript patterns WCAG interactive elements");
  }
  
  // Generic fallback
  else {
    hints.push(`${languageId} accessibility WCAG ARIA keyboard navigation semantic HTML`);
    hints.push("best practices assistive technology screen readers");
  }

  return hints.join(", ");
}

// Build a TLX-specific query focused on cognitive workload & task complexity
export function buildTlxRagQuery(languageId: string, code: string): string {
  const lower = code.toLowerCase();
  const hints: string[] = [];

  // Base TLX dimensions and factors
  hints.push("NASA TLX cognitive workload mental demand physical demand temporal demand performance effort frustration");
  hints.push("task complexity cognitive load decision-making problem-solving attention demands reasoning");
  hints.push("user interface complexity interaction patterns visual density information overload");

  // Complexity indicators by context
  if (languageId === "html" || languageId === "javascript" || languageId.includes("react") || languageId === "vue") {
    hints.push("UI/UX mental workload user input complexity interaction design cognitive friction");
    hints.push("form complexity validation feedback loops user error recovery interaction steps");
    hints.push("visual complexity navigation depth information scent sensemaking learnability");
    
    // Advanced interaction detection
    if (lower.includes("form") || lower.includes("input") || lower.includes("validation")) {
      hints.push("form design input fields error handling user confirmation steps completion rates user burden");
    }
    if (lower.includes("modal") || lower.includes("dialog") || lower.includes("popup")) {
      hints.push("modal interaction focus management dismissal clarity interruption cognitive load interruption cost");
    }
    if (lower.includes("table") || lower.includes("data") || lower.includes("list")) {
      hints.push("data presentation complexity information density scanning speed comprehension effort table navigation");
    }
    if (lower.includes("menu") || lower.includes("navigation") || lower.includes("nav")) {
      hints.push("navigation complexity menu depth wayfinding cognitive map mental model learning curve");
    }
  }

  // Code complexity by language
  if (["javascript", "typescript", "pythonreact", "typescriptreact"].includes(languageId) || 
      lower.includes("function") || lower.includes("class") || lower.includes("async")) {
    hints.push("code logic complexity algorithm decision trees branching cognitive difficulty learning effort");
    hints.push("asynchronous programming callback chains promise complexity error handling mental model");
    hints.push("state management data flow complexity debugging difficulty troubleshooting cognitive overhead");
  }

  if (lower.includes("css") || lower.includes("style") || lower.includes("layout")) {
    hints.push("visual complexity layout complexity color understanding contrast readability mental effort visual processing");
  }

  if (lower.includes("animation") || lower.includes("transition") || lower.includes("gesture")) {
    hints.push("animation cognitive load motion sickness distraction temporal demands user attention required");
  }

  if (lower.includes("api") || lower.includes("endpoint") || lower.includes("request")) {
    hints.push("API complexity integration effort documentation burden learning steep");
  }

  // Framework-specific cognitive load
  if (lower.includes("react")) {
    hints.push("React hooks state management complexity side effects mental model rendering understanding");
  }
  if (lower.includes("vue")) {
    hints.push("Vue reactivity complexity template syntax learning curve directive usage");
  }
  if (lower.includes("angular")) {
    hints.push("Angular complexity dependency injection decorators RxJS complexity steep learning curve");
  }

  // Performance affecting cognitive load
  hints.push("performance responsiveness feedback latency user perception task completion time");
  hints.push("user satisfaction efficiency ergonomic demands physical strain repetition burden");

  return hints.join(", ");
}
