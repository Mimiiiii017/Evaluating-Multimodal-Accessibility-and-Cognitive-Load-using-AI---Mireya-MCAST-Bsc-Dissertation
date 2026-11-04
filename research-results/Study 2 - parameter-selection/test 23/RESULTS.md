# Test 23 — Results

## Changes from T22

Three targeted changes applied in this iteration:

1. **Rule [vi] recall-bias flip** — Replaced the symmetric "equal cost" confidence gate with a recall-biased framing: *"Failing to identify a real accessibility barrier is more harmful to users than reporting a debatable case — report every concern you can directly observe from your Phase 1 inventory, but always cite the specific selector, line number, or id from your Phase 1 scan."*
2. **Completion check added to all 4 sweep blocks** — A verification prompt added after each sweep block (HTML A–J, CSS A–H, JS A–E, TSX A–I) requiring models to confirm they have run every sweep before writing output.
3. **deepseek noThink temperature 0.0 → 0.1** — Raised from pure greedy decoding to slightly stochastic, targeting the nn/rn conditions where deepseek was suppressed vs its think mode.

---

## Accuracy (primary target — ≥80%)

Total pool: 1998 slots per condition (TP+TN+FP+FN).  
TN pool (all conditions except glm-5 nn†, mistral nt‡): 1797.

| Model | rn | rt | nn | nt | ≥80% |
|---|---|---|---|---|---|
| kimi-k2.5 | **81.7%** | **82.3%** | **80.7%** | **80.7%** | 4/4 ✅ |
| gpt-oss:120b | **80.9%** | **80.0%** | **80.9%** | **80.1%** | 4/4 ✅ |
| qwen3.5:397b | **80.6%** | 79.8% | **80.8%** | **80.9%** | 3/4 |
| glm-5 | 79.9% | **80.0%** | **81.4%**† | 79.7% | 2/4 |
| gemini-3-flash-preview | **80.1%** | 79.5% | 79.1% | 78.4% | 1/4 |
| deepseek-v3.2 | 79.2% | **80.0%** | 78.9% | 78.7% | 1/4 |
| mistral-large-3:675b | 77.9% | 78.1% | 77.1%‡ | 78.6%§ | 0/4 |

†glm-5 nn: 1 run error (TN=1647, not 1797).  
‡mistral nn: 116 FPs — recall bias caused catastrophic hallucination explosion.  
§mistral nt: 2 run errors (TN=1497).

**T22 → T23 accuracy delta:**

| Model | rn Δ | rt Δ | nn Δ | nt Δ | Notes |
|---|---|---|---|---|---|
| kimi-k2.5 | −0.1 | +0.9 | +0.2 | −1.3 | Stable |
| gpt-oss:120b | +0.5 | −0.7 | +1.1 | −0.2 | Crossed 80% nn/nt |
| qwen3.5:397b | +0.8 | −1.1 | +1.3 | 0.0 | rt slipped just below |
| glm-5 | **−2.0** | −1.4 | +0.7 | +0.3 | rn/rt regressed |
| gemini-3-flash-preview | **+1.2** | **+1.4** | −0.2 | −0.1 | rn now at 80.1% |
| deepseek-v3.2 | +0.2 | −0.4 | +0.8 | −0.7 | nn improving, not there yet |
| mistral-large-3:675b | −0.4 | −0.5 | **−1.4** | +0.6 | nn worsened severely |

---

## Composite Score (80% F1 + 20% speed)

| Model | rn | rt | nn | nt | Best |
|---|---|---|---|---|---|
| gemini-3-flash-preview | **49.3%** | 42.7% | 43.1% | 37.3% | 49.3% rn |
| gpt-oss:120b | 46.5% | **47.3%** | 46.2% | 45.2% | 47.3% rt |
| deepseek-v3.2 | 39.7% | **46.7%** | 40.4% | 41.6% | 46.7% rt |
| qwen3.5:397b | 38.3% | 35.8% | 38.6% | **42.1%** | 42.1% nt |
| kimi-k2.5 | 38.3% | 37.6% | 33.4% | 33.1% | 38.3% rn |
| glm-5 | 34.2% | 29.4% | **36.2%** | 32.7% | 36.2% nn |
| mistral-large-3:675b | **30.3%** | 22.2% | 25.8% | 36.1% | 36.1% nt |

---

## TP / FP / FN by Condition

### rn (rag-nothink)
| Model | TP | FN | FP |
|---|---|---|---|
| kimi-k2.5 | 218 | 385 | 68 |
| gpt-oss:120b | 167 | 436 | 29 |
| gemini-3-flash | 156 | 447 | 36 |
| qwen3.5:397b | 144 | 459 | 9 |
| glm-5 | 144 | 459 | 30 |
| deepseek-v3.2 | 108 | 495 | 4 |
| mistral-large-3 | 114 | 489 | 56 |

### rt (rag-think)
| Model | TP | FN | FP |
|---|---|---|---|
| kimi-k2.5 | 205 | 398 | 34 |
| gpt-oss:120b | 150 | 453 | 35 |
| glm-5 | 148 | 455 | 30 |
| deepseek-v3.2 | 135 | 468 | 16 |
| qwen3.5:397b | 139 | 464 | 27 |
| gemini-3-flash | 123 | 480 | 16 |
| mistral-large-3 | 89 | 514 | 16 |

### nn (norag-nothink)
| Model | TP | FN | FP | Note |
|---|---|---|---|---|
| kimi-k2.5 | 197 | 406 | 71 | |
| glm-5 | 167 | 386 | 29 | 1 error, TN=1647 |
| gpt-oss:120b | 170 | 433 | 30 | |
| qwen3.5:397b | 151 | 452 | 12 | |
| gemini-3-flash | 103 | 500 | 2 | |
| deepseek-v3.2 | 101 | 502 | 6 | |
| mistral-large-3 | 131 | 472 | **116** | Recall bias backfired badly |

### nt (norag-think)
| Model | TP | FN | FP | Note |
|---|---|---|---|---|
| kimi-k2.5 | 177 | 426 | 45 | |
| qwen3.5:397b | 156 | 447 | 13 | |
| gpt-oss:120b | 143 | 460 | 22 | |
| glm-5 | 127 | 476 | 13 | |
| deepseek-v3.2 | 100 | 503 | 11 | |
| mistral-large-3 | 82 | 421 | 8 | 2 errors, TN=1497 |
| gemini-3-flash | 91 | 512 | 8 | |

---

## FP Totals (all 4 conditions summed)

| Model | rn | rt | nn | nt | Total |
|---|---|---|---|---|---|
| kimi-k2.5 | 68 | 34 | 71 | 45 | **218** |
| gpt-oss:120b | 29 | 35 | 30 | 22 | **116** |
| mistral-large-3 | 56 | 16 | 116 | 8 | **196** |
| glm-5 | 30 | 30 | 29 | 13 | **102** |
| qwen3.5:397b | 9 | 27 | 12 | 13 | **61** |
| gemini-3-flash | 36 | 16 | 2 | 8 | **62** |
| deepseek-v3.2 | 4 | 16 | 6 | 11 | **37** |

---

## Per-Fixture F1

### rn
| Model | html | css | js | tsx |
|---|---|---|---|---|
| kimi-k2.5 | 51.0% | 53.2% | 33.9% | 53.5% |
| gpt-oss:120b | 41.5% | 42.0% | 28.1% | 51.5% |
| qwen3.5:397b | 41.1% | 33.8% | 33.9% | 42.3% |
| gemini-3-flash | 35.5% | **59.1%** | 20.3% | 31.5% |
| glm-5 | 34.4% | 48.3% | 18.3% | 41.1% |
| deepseek-v3.2 | 33.7% | 34.7% | 29.0% | 22.3% |
| mistral-large-3 | 31.7% | 37.4% | 24.7% | 19.8% |

### rt
| Model | html | css | js | tsx |
|---|---|---|---|---|
| kimi-k2.5 | **60.2%** | 47.3% | 34.6% | 45.8% |
| deepseek-v3.2 | 42.2% | 26.4% | 22.1% | **43.0%** |
| gpt-oss:120b | 39.6% | 38.5% | 27.3% | 44.9% |
| qwen3.5:397b | 36.3% | 36.3% | 30.5% | 40.9% |
| glm-5 | 35.7% | **48.4%** | 26.0% | 34.0% |
| gemini-3-flash | 26.9% | 45.9% | 22.8% | 29.5% |
| mistral-large-3 | 25.9% | 29.6% | 26.2% | 14.3% |

### nn
| Model | html | css | js | tsx |
|---|---|---|---|---|
| gpt-oss:120b | **52.1%** | 27.1% | 26.2% | **54.3%** |
| kimi-k2.5 | 51.3% | 55.5% | 24.1% | 36.1% |
| glm-5 | 49.0% | **57.2%** | 22.0% | 42.4% |
| qwen3.5:397b | 47.1% | 35.8% | 30.9% | 40.5% |
| deepseek-v3.2 | 36.0% | 29.2% | 25.3% | 22.0% |
| gemini-3-flash | 34.6% | 29.2% | 18.2% | 33.3% |
| mistral-large-3 | 27.9% | 39.9% | 23.8% | 30.1% |

### nt
| Model | html | css | js | tsx |
|---|---|---|---|---|
| kimi-k2.5 | 37.2% | **54.3%** | 24.4% | **49.5%** |
| gpt-oss:120b | **40.1%** | 27.3% | 21.3% | 48.7% |
| qwen3.5:397b | 40.1% | 44.3% | 30.9% | 43.4% |
| glm-5 | 31.7% | 33.3% | 16.2% | 46.5% |
| deepseek-v3.2 | 38.3% | 27.0% | 24.2% | 18.2% |
| gemini-3-flash | 29.0% | 34.6% | 21.9% | 16.9% |
| mistral-large-3 | 34.6% | 26.2% | 16.2% | 36.1% |

---

## Consistency (F1 σ across conditions)

| Model | rn | rt | nn | nt |
|---|---|---|---|---|
| gemini-3-flash | 0.142 | 0.148 | 0.065 | 0.072 |
| deepseek-v3.2 | 0.069 | 0.179 | 0.076 | 0.114 |
| qwen3.5:397b | 0.070 | 0.066 | 0.096 | 0.106 |
| gpt-oss:120b | 0.108 | 0.083 | 0.181 | 0.204 |
| kimi-k2.5 | 0.112 | 0.144 | 0.196 | 0.132 |
| mistral-large-3 | 0.119 | 0.118 | 0.095 | 0.118 |
| glm-5 | 0.133 | 0.141 | 0.148 | 0.178 |

---

## Analysis

### What worked

**gpt-oss:120b now 4/4.** T22 had gpt just missing nn (79.8%) and nt (80.3%). T23 gpt crossed 80% in all four conditions (80.9%, 80.0%, 80.9%, 80.1%), making it the second fully-compliant model alongside kimi.

**gemini-rn hit 80.1%.** The completion check improved gemini's rn condition from 78.9% to 80.1%. Recall and composite score both improved in rn/rt conditions. However, gemini remains below 80% in three conditions.

**kimi-k2.5 stable at 4/4.** Maintained all conditions ≥80%.

**qwen moved to 3/4.** rn and nn both now ≥80%; rt dipped slightly to 79.8% (−1.1pp from T22's 80.9%), one FP more (27 vs T22's 20).

### What did not work

**Recall-bias catastrophically backfired for mistral-nn.** T22's mistral-nt had 82 FPs which prompted the T22>T23 recall bias fix. T23's recall bias indeed brought mistral-nt down to 8 FPs (nt accuracy improved from 78.0% to 78.6%). However, mistral-nn generated 116 FPs — a new record — dropping nn accuracy from 78.5% to 77.1%. The recall-bias prompt alone is not model-agnostic: mistral without RAG context in noThink mode interprets "report every concern" as a license to hallucinate high-volume pattern lists.

**glm-5 regressed in rn/rt.** rn dropped from 81.9% to 79.9% (−2.0pp), rt from 81.4% to 80.0% — still borderline. The recall bias appears to have introduced additional FPs for glm in the RAG conditions (rn: 30 FPs vs T22's 24; rt: 30 FPs vs T22's 29 — modest but enough to push rn just below).

**deepseek-nn still below 80%.** The temperature increase from 0.0 → 0.1 nudged nn from 78.1% to 78.9% (+0.8pp) but the +15 TP threshold to cross 80% was not reached. TP went from 83 (T22-nn) to 101 (+18 TP), but FPs also increased from 7 to 6 (minimal). The gap is recall-limited, not precision-limited: deepseek-nn still produces only ~8.9 issues per run.

**deepseek-nt worsened slightly.** 79.4% → 78.7%. deeper temperature had minimal effect in the think conditions since think mode already generates more output.

### Residual gap analysis

Models with ≥1 condition still below 80%:

| Model | Worst condition | Acc | TP gap to 80% | FP level |
|---|---|---|---|---|
| qwen3.5:397b | rt | 79.8% | +3 TP needed | 27 FPs |
| glm-5 | nt | 79.7% | +5 TP needed | 13 FPs |
| gemini-3-flash | nt | 78.4% | +29 TP needed | 8 FPs |
| deepseek-v3.2 | nt | 78.7% | +24 TP needed | 11 FPs |
| mistral-large-3 | nn | 77.1% | −116 FP needed | 116 FPs |

For **qwen** and **glm**, the gap is marginal (3–5 TP). Their FP levels are already low; small recall gains would push both to 4/4.

For **gemini and deepseek**, the recall ceiling is structural: both produce only 8–10 issues per run (vs 50 ground-truth issues per fixture), and the JS fixture's ~30 `*-announce` issues require dynamic runtime execution that static analysis cannot observe. The completion check did not substantively raise per-run output for these models in noThink conditions.

For **mistral**, the problem is FP explosion from the recall bias prompt. Mistral requires a precision-preserving intervention, not more recall encouragement.

### JS fixture ceiling

All models plateau at ~18–34% F1 on js-high. Approximately 30/50 js-high issues are `*-announce` issues that require dynamic ARIA live-region observation — inaccessible to static analysis regardless of prompt strategy. This is a fundamental fixture-design constraint, not a model capability gap. JS accuracy is sustained by the large TN pool (150 TN per fixture run).

---

## Hypothesis Verification

| Hypothesis | Prediction | Outcome |
|---|---|---|
| Recall bias fixes mistral-nt FPs (82→~7) | ✅ accuracy crosses 80% | Partial ✅: FPs dropped to 8, but accuracy only 78.6% — not enough TP gain |
| Recall bias safe for think-mode models | ✅ no new FP explosions | ❌: mistral-nn exploded to 116 FPs; glm-rn regressed −2pp |
| Completion check nudges gemini ≥8 issues | ✅ → passes 80% | Partial ✅: gemini-rn crossed 80.1%, but other conditions still below |
| deepseek noThink temp 0.1 → +TP in nn/rn | ✅ deepseek-nn crosses 80% | ❌: +0.8pp (78.1%→78.9%), not enough |

---

## Summary

**Models at 4/4 ≥80% accuracy:** kimi-k2.5, gpt-oss:120b (new in T23)  
**Models at 3/4:** qwen3.5:397b (rt=79.8%)  
**Models at 2/4:** glm-5 (rn=79.9%, nt=79.7%)  
**Models at 1/4:** gemini-3-flash-preview (rn only), deepseek-v3.2 (rt only)  
**Models at 0/4:** mistral-large-3:675b  

T23 net progress: +1 model to 4/4 (gpt). T22 had 1 model at 4/4; T23 has 2. The recall-bias change produced a mixed outcome — it improved gpt/qwen/gemini-rn while damaging mistral-nn severely and glm-rn slightly.
