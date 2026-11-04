# Phase 6: Supplementary Tool Comparison

Study 6 compares the AI Accessibility Assistant against browser and source-code accessibility tools to assess tool alignment, identify high-confidence violations, and quantify potential recall gaps.

## Quick Start

```bash
# Install dependencies
npm install

# Run comparison on default fixture
npm run study6:compare

# Run on all fixtures
npm run study6:compare:all

# Run on specific fixture
npm run study6:compare:html
npm run study6:compare:css
npm run study6:compare:js
npm run study6:compare:tsx
```

## Fixtures

Four source fixtures with realistic sizes and empirically-justified error counts:

| Fixture | Source Type | Errors | Browser Audits | Notes |
|---------|-------------|--------|----------------|-------|
| study-6-html-medium | HTML | 30 | Yes | Full tool coverage |
| study-6-css-medium | CSS | 30 | Yes (via harness) | Includes stylelint-a11y |
| study-6-js-medium | JavaScript | 30 | Yes (via harness) | Includes eslint jsx-a11y |
| study-6-tsx-medium | TSX | 30 | No | Browser audits skipped for fairness |

## Tool Stack

### Core comparison tools

- AI Accessibility Assistant (Kimi 2.5 + Qwen with RAG-think)
- Google Lighthouse
- axe-core

### Supplementary source-code tools

- Axe Accessibility Linter (axe CLI)
- ESLint with `eslint-plugin-jsx-a11y`
- Webhint (`hint`)
- stylelint with `@double-great/stylelint-a11y`

## Coverage by Source Type

| Tool | HTML | CSS | JS | TSX |
|------|------|-----|----|-----|
| AI Accessibility Assistant | Yes | Yes | Yes | Yes |
| Lighthouse | Yes | Yes (harness) | Yes (harness) | No (fairness skip) |
| axe-core | Yes | Yes (harness) | Yes (harness) | No (fairness skip) |
| Axe Accessibility Linter | Yes | No | Yes (harness URL) | Yes (harness URL) |
| ESLint `jsx-a11y` | No | No | Yes | Yes |
| Webhint | Yes | Yes | Yes | Yes (harness URL) |
| stylelint-a11y | No | Yes | No | No |

## Files

- **study-6-run.ts** — Orchestrator; integrates core and supplementary tools
- **study-6-compare.ts** — Core alignment analysis (AI/Lighthouse/axe-core) + supplementary tool counts
- **study-6-fixtures.ts** — Fixture definitions with literature justification
- **IMPLEMENTATION_SUMMARY.md** — Full methodology & rationale
- **package.json** — Dependencies & scripts
- **tsconfig.json** — TypeScript config

## Output

Results are saved in `./results/study-6/`:

```
{fixture}-comparison.json  — Full alignment matrix & statistics
lighthouse-{fixture}.json  — Raw Lighthouse report
```

Each `{fixture}-comparison.json` includes:

- `toolOutputs` for core comparison tools
- `supplementaryToolOutputs` for axe-linter, jsx-a11y, webhint, stylelint-a11y
- `statistics.supplementaryCounts` for quick per-tool totals

## Key Metrics

- **Shared findings** — 2+ tools agree (high confidence)
- **AI-only findings** — AI detects semantic issues not evident in rendered DOM
- **Lighthouse/axe-only** — Potential AI recall gaps in core comparison
- **Agreement rate** — Percentage of issues detected by multiple tools
- **Supplementary tool counts** — Additional source-linter signal by tool

## References

[1] HTTP Archive Web Almanac 2024: Page sizes (32–33 kB HTML, 68–72 kB CSS, 461–509 kB JS)
[2] Martins & Duarte (2024): 30 = median errors per page (2.88M pages analyzed)
[3] Fernandes et al. (2019): 51 = median healthcare homepage errors (high-barrier baseline)
