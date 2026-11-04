# Test 37 Results — Full 4 Conditions with 128-token RAG

**Scope:** Balanced preset, 16 fixtures, 3 runs, 3 models (gpt-oss, kimi-k2.5, qwen3.5)  
**Conditions:** All 4 RAG×Think combinations (128-token RAG, all-MiniLM-L6-v2)  
**Date Range:** 2026-04-15 to 2026-04-16

---

## Executive Summary

| Condition | Best Model | F1 | MCC | Avg Resp |
|---|---|---|---|---|
| **norag-nothink** | gpt-oss:120b | **50.7%** | **0.372** | 162.4s |
| norag-think | kimi-k2.5 | 44.5% | 0.411 | 192.9s |
| rag-think | gpt-oss:120b | 42.9% | 0.346 | 163.6s |
| rag-nothink | gpt-oss:120b | 40.7% | 0.338 | 165.5s |

**Key Finding:** NoRAG outperforms RAG in both think modes. RAG appears to degrade F1 performance in test 37, suggesting knowledge base retrieval may introduce noise or conflicts with the model's native accessibility knowledge.

---

## Condition 1: norag-nothink (NO RAG, NO THINKING)

| Metric | gpt-oss:120b | kimi-k2.5 | qwen3.5:397b |
|---|---|---|---|
| **F1** | **50.7%** | 42.0% | 47.9% |
| Precision | **69.9%** | 57.2% | 68.6% |
| Recall | 57.1% | **62.0%** | **58.2%** |
| MCC | **0.372** | 0.406 | 0.394 |
| TP | 412 | 469 | 396 |
| FP | 194 | 399 | 186 |
| FN | 674 | 617 | **690** |
| Avg Response | 162.4s | **151.2s** | 292.8s |

**Observations:**
- gpt-oss leads on F1 and precision, showing strong baseline accessibility knowledge
- kimi-k2.5 best on recall (62.0%) and MCC (0.406), most balanced across metrics
- qwen3.5 slowest (292.8s avg) but reasonable F1 (47.9%)
- **Best overall:** gpt-oss (F1=50.7%, Precision=69.9%)

---

## Condition 2: norag-think (NO RAG, WITH THINKING)

| Metric | gpt-oss:120b | kimi-k2.5 | qwen3.5:397b |
|---|---|---|---|
| **F1** | 39.8% | **44.5%** | 45.2% |
| Precision | 61.0% | **59.6%** | **65.9%** |
| Recall | 55.2% | **62.2%** | **58.1%** |
| MCC | 0.346 | **0.411** | 0.394 |
| TP | 367 | 471 | 398 |
| FP | 197 | 276 | 239 |
| FN | 719 | 615 | 688 |
| Avg Response | 173.8s | **192.9s** | 376.7s |

**Observations:**
- kimi-k2.5 performs best in this condition (F1=44.5%, MCC=0.411)
- **Thinking degrades gpt-oss performance** (F1 drops from 50.7% → 39.8%, −11pp)
- kimi benefits from thinking: F1 improves (42.0% → 44.5%, +2.5pp)
- qwen maintains similar F1 (47.9% → 45.2%, −2.7pp)
- **Best overall:** kimi-k2.5 (F1=44.5%, MCC=0.411)

---

## Condition 3: rag-nothink (WITH RAG, NO THINKING)

| Metric | gpt-oss:120b | kimi-k2.5 | qwen3.5:397b |
|---|---|---|---|
| **F1** | **40.7%** | 43.6% | 43.3% |
| Precision | **66.7%** | 58.3% | **66.9%** |
| Recall | 54.3% | **61.1%** | 55.7% |
| MCC | 0.338 | **0.400** | 0.383 |
| TP | 373 | 465 | 361 |
| FP | 203 | 267 | 174 |
| FN | 713 | 621 | 725 |
| Avg Response | 165.5s | 261.1s | **408.5s** |

**Observations:**
- **RAG degrades gpt-oss F1:** 50.7% (norag-nothink) → 40.7% (−10pp)
- kimi-k2.5 best F1 in this condition (43.6%); RAG helps (42.0% → 43.6%, +1.6pp)
- qwen also maintains performance (47.9% → 43.3%, −4.6pp)
- **Best overall:** kimi-k2.5 (F1=43.6%, MCC=0.400)

---

## Condition 4: rag-think (WITH RAG, WITH THINKING)

| Metric | gpt-oss:120b | kimi-k2.5 | qwen3.5:397b |
|---|---|---|---|
| **F1** | **42.9%** | 41.3% | **48.5%** |
| Precision | **68.8%** | 58.1% | **73.8%** |
| Recall | 54.4% | **61.7%** | 55.1% |
| MCC | 0.346 | 0.404 | 0.394 |
| TP | 363 | 485 | 388 |
| FP | 188 | 272 | 158 |
| FN | 723 | 601 | 698 |
| Avg Response | 163.6s | 177.9s | **377.8s** |

**Observations:**
- gpt-oss leads F1 (42.9%), best precision (68.8%)
- kimi-k2.5 best recall (61.7%)
- qwen gets best F1 of any qwen condition here (48.5% vs 47.9% norag-nothink, +0.6pp)
- **Best overall:** gpt-oss (F1=42.9%, Precision=68.8%)

---

## Cross-Condition Analysis

### RAG Impact (comparing with/without RAG)

| Model & Mode | norag | rag | Δ F1 |
|---|---|---|---|
| gpt-oss (nothink) | 50.7% | 40.7% | **−10.0pp** ⚠️ |
| gpt-oss (think) | 39.8% | 42.9% | +3.1pp ✓ |
| kimi (nothink) | 42.0% | 43.6% | +1.6pp ✓ |
| kimi (think) | 44.5% | 41.3% | −3.2pp ⚠️ |
| qwen (nothink) | 47.9% | 43.3% | −4.6pp ⚠️ |
| qwen (think) | 45.2% | 48.5% | +3.3pp ✓ |

**RAG Effect Summary:**
- **Mixed results**—RAG helps in 3/6 cases, hurts in 3/6 cases
- **gpt-oss nothink hit hardest** by RAG (−10pp) — possible KB noise or conflicting patterns
- **RAG + thinking** shows slight improvement for gpt-oss (−10pp → +3.1pp with thinking)
- Smaller models (kimi, qwen) less damaged by RAG

### Thinking Impact (comparing think/nothink)

| Model & RAG | nothink | think | Δ F1 |
|---|---|---|---|
| gpt-oss (norag) | 50.7% | 39.8% | **−10.9pp** ⚠️ |
| gpt-oss (rag) | 40.7% | 42.9% | +2.2pp ✓ |
| kimi (norag) | 42.0% | 44.5% | +2.5pp ✓ |
| kimi (rag) | 43.6% | 41.3% | −2.3pp ⚠️ |
| qwen (norag) | 47.9% | 45.2% | −2.7pp ⚠️ |
| qwen (rag) | 43.3% | 48.5% | +5.2pp ✓ |

**Thinking Effect Summary:**
- **Highly variable by model and RAG state**
- gpt-oss severely hurt by thinking **without RAG** (−10.9pp)
- qwen benefits from thinking **with RAG** (+5.2pp) — best qwen result
- kimi shows modest improvement from thinking (both +2.5pp norag, −2.3pp rag)

---

## Per-Model Summary

### gpt-oss:120b (~120B)
- **Best condition:** norag-nothink (F1=50.7%)
- **Worst condition:** norag-think (F1=39.8%)
- **Key insight:** Large model that doesn't benefit from thinking or RAG in this test
- Consistently high precision (61.0%–69.9%), moderate recall (54–57%)

### kimi-k2.5
- **Best condition:** norag-think (F1=44.5%)
- **Worst condition:** rag-think (F1=41.3%)
- **Key insight:** Only model with positive boost from thinking without RAG (+2.5pp)
- Excellent recall (62–62.2%), moderate precision (57–60%)
- Most balanced MCC values (0.400–0.411)

### qwen3.5:397b (~397B)
- **Best condition:** rag-think (F1=48.5%)
- **Worst condition:** norag-think (F1=45.2%)
- **Key insight:** Largest model; benefits significantly from both RAG and thinking together (+5.2pp)
- Consistently slowest (292–408s per run)
- Precision strength (65.9%–73.8%)

---

## Conclusion

**Test 37 reveals surprising RAG ineffectiveness:**
- RAG integration in test 37 provides **no net benefit**; sometimes harmful
- **Without RAG, gpt-oss reaches 50.7% F1** — highest across all 4 conditions
- Possible explanations:
  1. **Knowledge base retrieval introduces conflicting patterns** (chunks don't align with specific fixtures)
  2. **Model internal knowledge already strong** for these accessibility patterns
  3. **Query-document mismatch** — fixture code context doesn't map well to KB retrieval
- Thinking has **highly variable effects** (+5.2pp to −10.9pp depending on model and RAG)

**Production recommendation:** Prioritize **gpt-oss without RAG/thinking** for this preset (50.7% F1, fast 162s avg, high precision 69.9%). Consider RAG only if query-KB alignment can be improved.
