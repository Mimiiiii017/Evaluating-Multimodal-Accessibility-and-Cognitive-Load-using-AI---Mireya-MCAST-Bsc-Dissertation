// fileTypeContext.ts — decides which lines of code to extract from the active file
// Returns a list of accessibility-relevant keywords for the active file's
// language and framework. These keywords drive the excerpt builder — only
// lines containing them (plus surrounding context) are sent to the model,
// keeping prompts short and focused.
// Covers HTML, CSS, JavaScript/TypeScript, React, Vue, and Angular based on
// WCAG 2.2 (A, AA, AAA) and the European Accessibility Act (EAA).

import * as vscode from "vscode";

export interface FileTypeContext {
  keywords: string[];
}

// ---------------------------------------------------------------------------
// Shared ARIA keyword constants
// Spread these into each framework's keywords array to avoid repeating the
// same boilerplate attribute strings across 30+ sections.
// ---------------------------------------------------------------------------

/** The three universal label attributes present in every HTML-producing framework */
const ARIA_LABELS: readonly string[] = [
  "aria-label", "aria-labelledby", "aria-describedby",
];

/** Full ARIA widget-state set used in rich SPA frameworks */
const ARIA_WIDGET_STATES: readonly string[] = [
  "aria-expanded", "aria-pressed", "aria-checked", "aria-selected",
  "aria-current", "aria-disabled", "aria-invalid", "aria-required",
];

// Get comprehensive file type context for multimodal accessibility analysis
export function getFileTypeContext(doc: vscode.TextDocument): FileTypeContext {
  const languageId = doc.languageId.toLowerCase();
  const content = doc.getText();
  
  // HTML files - comprehensive multimodal coverage
  if (languageId === "html") {
    return {
      keywords: [
        // VISUAL: Color & Contrast
        "color", "background", "style=", "bgcolor", "contrast", "opacity", "filter",
        
        // VISUAL: Animation & Motion (seizure prevention, vestibular)
        "animation", "transition", "@keyframes", "transform", "scroll", "parallax",
        
        // MOTOR/KEYBOARD: Navigation & Focus
        "tabindex", "autofocus", ":focus", "focus(", "blur(", "accesskey",
        
        // MOTOR/KEYBOARD: Interactive Elements
        "<button", "<a ", "<input", "onclick", "onkeydown", "onkeyup", "onkeypress",
        
        // MOTOR: Target Size & Touch
        "width", "height", "padding", "margin", "min-width", "min-height",
        
        // AUDITORY: Media Elements
        "<audio", "<video", "<track", "captions", "subtitles", "transcript",
        "autoplay", "controls", "muted", "<source",
        
        // COGNITIVE: Language & Readability
        "lang=", "xml:lang", "dir=", "translate",
        
        // COGNITIVE: Timing & Auto-Update
        "setTimeout", "setInterval", "meta refresh", "autoplay", "autoupdate",
        
        // STRUCTURE: Landmarks & Regions
        "<nav", "<main", "<header", "<footer", "<aside", "<section", "<article",
        "role=", "banner", "navigation", "complementary", "contentinfo",
        
        // STRUCTURE: Headings
        "<h1", "<h2", "<h3", "<h4", "<h5", "<h6",
        
        // FORMS: Labels & Input
        "<form", "<label", "for=", "<input", "<select", "<textarea", "<fieldset",
        "<legend", "required", "aria-required",
        
        // FORMS: Validation & Error
        "required", "pattern", "aria-invalid", "aria-errormessage", "novalidate",
        
        // FORMS: Autocomplete & Input Purpose
        "autocomplete", "name=", "type=", "inputmode",
        
        // IMAGES: Alternative Text
        "<img", "alt=", "<svg", "<figure", "<figcaption", "aria-describedby",
        
        // TABLES: Structure & Headers
        "<table", "<th", "<td", "scope=", "<caption", "headers=", "<thead", "<tbody",
        
        // ARIA: Roles & Properties
        ...ARIA_LABELS, "aria-hidden",
        
        // ARIA: Live Regions & Dynamic Content
        "aria-live", "aria-atomic", "aria-busy", "role=\"alert", "role=\"status",
        
        // ARIA: Widget States
        "aria-expanded", "aria-pressed", "aria-checked", "aria-selected",
        "aria-current", "aria-disabled",
        
        // ARIA: Modal & Dialog
        "aria-modal", "role=\"dialog", "role=\"alertdialog",
        
        // COGNITIVE: Skip Links & Help
        "skip", "href=\"#", "title=", "placeholder",
        
        // VISUAL: Text & Content Adaptation
        "font-size", "line-height", "letter-spacing", "word-spacing",
        
        // VISUAL: Images of Text
        "<canvas", "text-rendering",
        
        // Generic containers (check for proper semantic usage)
        "<div", "<span"
      ]
    };
  }
  
  // CSS/SCSS/Less files - comprehensive styling accessibility
  if (["css", "scss", "sass", "less"].includes(languageId)) {
    return {
      keywords: [
        // VISUAL: Color & Contrast
        "color:", "background-color:", "background:", "border-color:",
        "fill:", "stroke:", "text-shadow:", "box-shadow:",
        
        // VISUAL: High Contrast & Dark Mode
        "prefers-contrast", "prefers-color-scheme", "forced-colors",
        "@media", "contrast(", "brightness(", "filter:",
        
        // VISUAL: Animation & Motion (seizure/vestibular)
        "animation:", "animation-duration:", "transition:", "@keyframes",
        "transform:", "prefers-reduced-motion", "scroll-behavior:",
        "will-change:", "perspective:",
        
        // VISUAL: Text Spacing & Reflow
        "line-height:", "letter-spacing:", "word-spacing:", "text-spacing:",
        "white-space:", "overflow:", "text-overflow:",
        
        // VISUAL: Resize & Zoom
        "font-size:", "zoom:", "min-width:", "max-width:", "viewport",
        "rem", "em", "%", "vw", "vh",
        
        // MOTOR: Focus Indicators
        ":focus", ":focus-visible", ":focus-within", "outline:", "outline-offset:",
        "box-shadow:", "border:",
        
        // MOTOR: Interactive States
        ":hover", ":active", ":visited", ":disabled", ":enabled",
        
        // MOTOR: Target Size
        "width:", "height:", "min-width:", "min-height:", "padding:",
        "margin:", "touch-action:", "pointer-events:",
        
        // MOTOR: Pointer & Cursor
        "cursor:", "pointer-events:", "user-select:",
        
        // VISUAL: Content on Hover/Focus
        ":hover:after", ":focus:before", "::before", "::after",
        "content:", "position: absolute", "position: fixed",
        
        // VISUAL: Visibility & Hiding
        "display:", "visibility:", "opacity:", "clip:", "clip-path:",
        "position: absolute", "left: -", "top: -",
        
        // COGNITIVE: Orientation
        "orientation:", "@media (orientation",
        
        // VISUAL: Non-text Contrast (UI components, graphics)
        "border:", "border-radius:", "outline:", "fill:", "stroke:",
        
        // VISUAL: Images of Text
        "background-image:", "content: url(",
        
        // TIMING: Auto-scrolling & Parallax
        "scroll-behavior:", "overflow-x:", "overflow-y:", "scroll-snap-"
      ]
    };
  }
  
  // React (JSX/TSX) - comprehensive component accessibility
  if (["javascript", "typescript", "javascriptreact", "typescriptreact"].includes(languageId)) {
    const isReact = /import.*react|from ['"]react['"]|<[A-Z][a-zA-Z]*|jsx|tsx/i.test(content);
    const isVue = /\.vue$/.test(doc.fileName) || /<template>|<script>|export default \{/i.test(content);
    const isAngular = /@Component|@NgModule|\.component\.ts$/.test(content);
    
    if (isReact || languageId.includes("react")) {
      return {
        keywords: [
          // ARIA: Roles & Labels
          ...ARIA_LABELS, "role=",
          "aria-hidden", "aria-live", "aria-atomic", "aria-busy",
          
          // ARIA: Widget States
          ...ARIA_WIDGET_STATES,
          
          // MOTOR: Keyboard Events
          "onKeyDown", "onKeyUp", "onKeyPress", "onKeyboardEvent",
          "tabIndex", "autoFocus", "onFocus", "onBlur",
          
          // MOTOR: Mouse/Pointer Events
          "onClick", "onTouchStart", "onTouchEnd", "onMouseDown", "onMouseUp",
          
          // STRUCTURE & SEMANTICS
          "<header", "<nav", "<main", "<footer", "<article", "<section", "<aside",
          
          // FORMS & INPUT
          "<form", "<input", "<label", "<select", "<textarea", "<button",
          "type=", "aria-required", "required",
          
          // IMAGES & MEDIA
          "<img", "alt=", "src=", "<svg", "<picture",
          
          // DYNAMIC CONTENT
          "aria-live", "aria-atomic", "aria-busy", "role=\"alert",
          
          // FOCUS & KEYBOARD
          "ref=", "useRef", "focus()", "tabIndex",
          
          // SCREEN READER CONTENT
          "sr-only", "screen-reader-only", "aria-hidden",
          
          // SEMANTIC HTML
          "<strong", "<em", "<h1", "<h2", "<h3", "<h4", "<h5", "<h6",
        ]
      };
    }
    
    // Vue-specific
    if (isVue) {
      return {
        keywords: [
          "v-bind", "v-model", "v-on", "@click", "@keydown", "@focus", "@blur",
          "v-if", "v-show", "v-for",
          "aria-", "role=", "ref=",
          "<template", "<div", "<button", "<input", "<label", "<form",
          ":class", ":style", "disabled", "tabindex",
        ]
      };
    }
    
    // Angular-specific
    if (isAngular) {
      return {
        keywords: [
          "@Component", "@Input", "@Output", "@ViewChild",
          "(click)", "(keydown)", "(focus)", "(blur)",
          "[disabled]", "[attr.aria", "[tabindex]",
          "<button", "<input", "<label", "<form", "<mat-",
          "ngFor", "ngIf", "formControl", "formGroup",
          "aria-", "role=", "cdkFocus", "role=\""
        ]
      };
    }
    
    // Fallback for generic JavaScript/TypeScript
    return {
      keywords: [
        "addEventListener", "onclick", "onkeydown", "onkeyup", "onfocus", "onblur",
        "querySelectorAll", "querySelector", "getElementById", "getElementsByClassName",
        "setAttribute", "removeAttribute", "setAttribute('aria", "textContent", "innerHTML",
        "focus(", "blur(", "role=", "aria-",
      ]
    };
  }

  // Generic fallback for all other languages
  return {
    keywords: [
      "accessibility", "aria-", "role=", "alt=",
      "keyboard", "focus", "screen reader", "WCAG",
      "label", "form", "button", "input",
    ]
  };
}
