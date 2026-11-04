# Test 24 — Results

## Changes from T23

Four targeted changes applied in this iteration:

1. **deepseek temperature raised** — think: 0.0 → 0.1; noThink: 0.1 → 0.2. Rationale: pure greedy decoding was suppressing output in think+noRAG conditions; T23 0→0.1 gained +18 TP in nn, extending that same step.
2. **gemini temperature raised** — think: 0.15 → 0.2; noThink: 0.0 → 0.1. Rationale: gemini-nn had only 2 FPs in T23 with noThink temp=0.0 — large precision headroom to gain recall.
3. **HTML/CSS/TSX completion check threshold 8 → 12** — Forces an additional sweep pass when the model clears 8 issues per block. Rationale: gemini was producing 9–11 issues/run and passing the check without re-scanning.
4. **JS completion check unchanged at 8, runtime note added** — A note was added clarifying that JS dynamic aria-live issues require runtime execution and cannot all be found statically (8–12 is a realistic ceiling).

---

## Accuracy (primary target — ≥80%)

Total pool: 1998 slots per condition (TP+TN+FP+FN).  
TN pool: 1797 (all conditions).

| Model | rn | rt | nn | nt | ≥80% |
|---|---|---|---|---|---|
| qwen3.5:397b | **80.0%** | **81.0%** | **80.6%** | **80.8%** | 4/4 ✅ |
| kimi-k2.5 | 79.4% | **80.6%** | **81.2%** | **80.6%** | 3/4 |
| gpt-oss:120b | **81.6%** | **81.0%** | **80.1%** | 79.8% | 3/4 |
| gemini-3-flash-preview | 79.1% | 79.1% | 78.6% | 78.5% | 0/4 |
| deepseek-v3.2 | 77.3% | 78.1% | 79.0% | 77.2% | 0/4 |

**T23 → T24 accuracy delta (5 active models only):**

| Model | rn Δ | rt Δ | nn Δ | nt Δ | ≥80% Δ | Notes |
|---|---|---|---|---|---|---|
| qwen3.5:397b | −0.6 | **+1.2** | −0.2 | −0.1 | **3→4 +1** | rt crossed 80% ✅ |
| kimi-k2.5 | **−2.3** | **−1.7** | +0.5 | −0.1 | **4→3 −1** | rn/rt recall collapsed (completion threshold) |
| gpt-oss:120b | +0.7 | +1.0 | −0.8 | −0.3 | **4→3 −1** | nt slipped 3 pp below from FP excess |
| gemini-3-flash-preview | **−1.0** | −0.4 | −0.5 | +0.1 | **1→0 −1** | rn dropped below 80% |
| deepseek-v3.2 | **−1.9** | **−1.9** | +0.1 | **−1.5** | **1→0 −1** | Regressed across all conditions |

**Net: T23 13/20 → T24 10/20 (−3 conditions).** T24 is a net regression despite qwen gaining 1 condition. The completion threshold increase appears to have hurt kimi recall in rn/rt, and the temperature changes did not recover gemini or deepseek.

---

## Composite Score (80% F1 + 20% speed)

| Model | rn | rt | nn | nt | Best |
|---|---|---|---|---|---|
| gpt-oss:120b | **55.0%** | **55.2%** | 47.2% | 48.6% | 55.2% rt |
| qwen3.5:397b | 46.3% | 52.2% | **48.9%** | **52.2%** | 52.2% rt/nt |
| gemini-3-flash-preview | 44.1% | 44.1% | 40.8% | 40.3% | 44.1% rn/rt |
| kimi-k2.5 | 32.2% | 43.3% | 45.1% | 38.0% | 45.1% nn |
| deepseek-v3.2 | 13.1% | 17.7% | 22.8% | 13.3% | 22.8% nn |

---

## TP / FP / FN by Condition

### rn (rag-nothink)
| Model | TP | FN | FP |
|---|---|---|---|
| gpt-oss:120b | 202 | 401 | 51 |
| kimi-k2.5 | 129 | 474 | 24 |
| qwen3.5:397b | 137 | 466 | 17 |
| gemini-3-flash-preview | 111 | 492 | 12 |
| deepseek-v3.2 | 61 | 542 | 4 |

### rt (rag-think)
| Model | TP | FN | FP |
|---|---|---|---|
| gpt-oss:120b | 205 | 398 | 73 |
| kimi-k2.5 | 173 | 430 | 44 |
| qwen3.5:397b | 157 | 446 | 11 |
| gemini-3-flash-preview | 119 | 484 | 23 |
| deepseek-v3.2 | 82 | 521 | 7 |

### nn (norag-nothink)
| Model | TP | FN | FP |
|---|---|---|---|
| kimi-k2.5 | 183 | 420 | 38 |
| gpt-oss:120b | 156 | 447 | 38 |
| qwen3.5:397b | 153 | 450 | 19 |
| deepseek-v3.2 | 109 | 494 | 11 |
| gemini-3-flash-preview | 91 | 512 | 2 |

### nt (norag-think)
| Model | TP | FN | FP |
|---|---|---|---|
| qwen3.5:397b | 160 | 443 | 21 |
| kimi-k2.5 | 165 | 438 | 33 |
| gpt-oss:120b | 153 | 450 | 45 |
| gemini-3-flash-preview | 101 | 502 | 16 |
| deepseek-v3.2 | 60 | 543 | 6 |

---

## FP Totals (all 4 conditions summed)

| Model | rn | rt | nn | nt | Total |
|---|---|---|---|---|---|
| gpt-oss:120b | 51 | **73** | 38 | 45 | **207** |
| kimi-k2.5 | 24 | 44 | 38 | 33 | **139** |
| qwen3.5:397b | 17 | 11 | 19 | 21 | **68** |
| gemini-3-flash-preview | 12 | 23 | 2 | 16 | **53** |
| deepseek-v3.2 | 4 | 7 | 11 | 6 | **28** |

gpt's rt condition had 73 FPs — its highest across all tests. The think+RAG combination combined with raised temperature appears to amplify hallucination output.

---

## Hypothesis Verification

| Hypothesis | Outcome |
|---|---|
| deepseek-nn crosses 80% (temp 0.1→0.2, needs ~20 TP) | ❌ 79.0% — gained only +0.1pp from T23 |
| deepseek-nt improves (think temp 0.0→0.1) | ❌ Regressed: 78.7% → 77.2% (−1.5pp) |
| gemini-nt/nn improve (noThink 0.0→0.1, needs +29 TP in nt) | ❌ gemini-nt: +0.1pp only; gemini-nn: −0.5pp |
| qwen-rt crosses 80% (~3 TP away, minimal intervention needed) | ✅ 79.8% → 81.0% (+1.2pp) |
| Completion threshold 8→12 does not cause FP explosion in well-performing models | ❌ gpt-rt: 35→73 FPs; kimi-rn TP collapsed 218→129 |

---

## Root Cause Analysis

### Completion threshold 8→12 backfired
The threshold change was intended to force gemini to do an extra sweep pass. Instead:
- **kimi-rn**: TP collapsed from 218 → 129 (−89 TP). kimi was apparently iterating until it hit the 12-issue ceiling rather than reporting everything it found, causing it to drop many valid detections to stay under the constraint.
- **gpt-rt**: FPs exploded from 35 → 73. Extra scan passes generated duplicate or speculative reports on clean files.
- **gemini**: no significant recovery — gemini-css consistently finds 9–15 issues per run and appears to report until it clears the check regardless.

The completion check threshold is counter-productive for high-recall models. It should revert to 8 or be removed entirely.

### Temperature increases did not help deepseek or gemini
- **deepseek**: Both think (0.0→0.1) and noThink (0.1→0.2) temperatures regressed all but nn. The model appears at its performance ceiling for static analysis within the current prompt structure.
- **gemini**: The noThink 0.0→0.1 change produced no meaningful recall gain. gemini is consistently finding ~10 issues/run (CSS) and ~8–10 (HTML) regardless of temperature.

### qwen continues to improve
qwen-rt was the only successful hypothesis: it crossed 80% as predicted (only ~3 TP away in T23). qwen remains the most stable model with lowest hallucination rate (68 total FPs across 4 conditions).

---

## T25 Changes Applied

### `benchmark-params.ts` — parameter reverts

| Model | Param | T24 value | T25 value | Reason |
|---|---|---|---|---|
| deepseek | think temp | 0.1 | **0.0** | rt TP collapsed 135→82; greedy 0.0 was best (T23 rt: 80.0%) |
| deepseek | noThink temp | 0.2 | **0.1** | T23 beneficial change retained; T24 0.2 added no TP and regressed nt |
| gemini | think temp | 0.2 | **0.15** | T21 optimum restored; further raise caused no recall gain |
| gemini | noThink temp | 0.1 | **0.0** | Reverted to best-precision value (2 FPs in T23 nn) |

### `benchmark-prompt.ts` — threshold reverts

| Sweep block | T24 threshold | T25 threshold | Reason |
|---|---|---|---|
| HTML A–J completion check | 12 | **8** | kimi-rn TP collapsed 218→129; caused extra hallucination passes |
| CSS A–H completion check | 12 | **8** | same root cause |
| TSX A–I completion check | 12 | **8** | same root cause |
| JS A–E completion check | 8 (unchanged) | 8 | no change |

### `benchmark-prompt.ts` — prompt improvements (new)

1. **CSS Phase 1 outline inventory** — added explicit note that base component rules (`.btn { outline: none }`, `.tab { outline: 0 }`) count toward the inventory, not just `:focus`/`:focus-visible` rules. Each is a separate entry. Targets the bulk of missed `*-outline-none` FNs for gemini/qwen.
2. **CSS Phase 1 height/width inventory** — expanded to explicitly include class-based selectors for button-like components (`.btn`, `.tab`, `.badge`, `.pill`, `.icon-btn`, `.social-link`, `.pagination-btn`) alongside element selectors. Targets missed touch-target FNs.
3. **CSS completion check note** — added: *"each distinct selector in your Phase 1 outline inventory (CSS-A) and each distinct selector below the size threshold (CSS-B) is a separate Issue block."* Prevents models from stopping after the first outline:none match.
4. **TSX Phase 1 article/card inventory** — added bullet: *"Every `<article>` element used in a repeated card or grid context (pricing plans, feature cards): does each have `aria-labelledby` referencing a heading inside it?"* Targets `plan-card-label`, `plan-article-labelledby` FNs.
5. **TSX-F sweep extended** — Sweep now covers `<article>` in repeated card/grid contexts in addition to `<section>/<nav>/<aside>`, reporting `"card article missing accessible name via aria-labelledby"` when no `aria-labelledby` is present.

### Expected T25 outcome

- **kimi**: rn/rt recall should recover (218→129 was threshold-driven). Should return to 4/4.
- **gpt**: nt should recover (threshold was causing FP inflation on clean TSX). Should return to 4/4.
- **qwen**: already at 4/4; CSS outline improvements may add further TP, improving F1.
- **gemini/deepseek**: temperature reverts prevent further regression; CSS sweep improvements the main lever for recall gain.
