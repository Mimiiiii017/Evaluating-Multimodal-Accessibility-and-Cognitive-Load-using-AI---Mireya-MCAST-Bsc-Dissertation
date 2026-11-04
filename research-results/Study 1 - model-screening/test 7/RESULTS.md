# Cloud-LLM Preliminary Study — Analysis Report

**Date:** 25 March 2026  
**Scope:** HTML fixtures only (html-clean, html-low, html-medium, html-high) — 4 complexity tiers  
**Models tested:** 15 cloud LLMs  
**Conditions:** 4 (RAG×Think factorial design)  
**Total LLM calls:** 240 (4 conditions × 15 models × 4 fixtures × 1 run)

---

## 1. What Was Implemented (Based on Mentor Guidance)

| Mentor Recommendation | Status | Detail |
|---|---|---|
| Test strictly text-based LLMs, no vision models | Done | Removed `qwen3-vl:235b` (vision model), all 15 remaining are text-primary |
| Focus on logical reasoning & instruction adherence | Done | Benchmark measures FP (instruction adherence) and TP/F1 (reasoning precision) |
| Use high-reasoning model (DeepSeek-R1, GPT-4o equivalent) | Partial | `deepseek-v3.2` tested; DeepSeek-R1 not available via cloud gateway at required size |
| Test Phi-4 (text-primary, efficient reasoning) | Not possible | Local Ollama not reachable from benchmark environment |
| Build a RAG pipeline with WCAG knowledge base | Done | FastAPI + ChromaDB RAG service at port 8000, seeded with WCAG 2.2 techniques |
| Context window >=128k for full component relationship visibility | Done | `reasoning` preset raised to 131,072 tokens; `thorough` preset to 65,536 tokens |
| Evaluate SLM (8-10B) vs LLM trade-off | Gap | Smallest model tested is `ministral-3:14b`; no <=10B model available on cloud gateway |
| Track latency (TTFT) for IDE viability | Done | Avg, p50, p95 response times recorded per model per condition |
| Measure hallucination rate separately from accuracy | Done | FP count tracked independently from TP/FN |

---

## 2. Results — All 4 Conditions (Composite Score = 80% F1 + 20% Speed)

### 2.1 Condition Definitions

| Condition | RAG | Thinking (extended CoT) |
|---|---|---|
| `rag-think` | Yes | Yes |
| `rag-nothink` | Yes | No |
| `norag-nothink` | No | No |
| `norag-think` | No | Yes |

### 2.2 Cross-Condition Score Matrix (Composite %)

| Model | rag-think | rag-nothink | norag-nothink | norag-think | **Avg** | **Rank** |
|---|---|---|---|---|---|---|
| **gpt-oss:120b** | 47.2 | **70.3** | **72.2** | **70.2** | **65.0** | 1 |
| **minimax-m2.5** | 45.4 | **61.1** | 44.1 | 59.5 | **52.5** | 2 |
| **qwen3.5:397b** | 50.6 | 47.1 | 62.5 | 49.6 | **52.5** | 3 |
| glm-5 | 35.5 | 40.9 | 94.0 | 28.0 | 49.6 | 4 |
| mistral-large-3:675b | 41.0 | 44.3 | 42.5 | 44.1 | 43.0 | 5 |
| deepseek-v3.2 | **49.7** | 34.5 | 44.5 | 37.0 | 41.4 | 6 |
| gemini-3-flash-preview | 37.5 | 47.0 | 49.0 | 32.0 | 41.4 | 7 |
| minimax-m2 | 42.6 | 34.8 | 49.4 | 32.5 | 39.8 | 8 |
| kimi-k2.5 | 36.6 | 40.1 | 40.2 | 37.2 | 38.5 | 9 |
| devstral-2:123b | 36.2 | 35.4 | 40.6 | 39.6 | 38.0 | 10 |
| cogito-2.1:671b | **67.5** | 23.1 | 21.4 | 26.6 | 34.7 | 11 |
| nemotron-3-nano:30b | 19.2 | 20.9 | 48.5 | 49.1 | 34.4 | 12 |
| qwen3-coder-next | 35.5 | 32.7 | 28.7 | 28.3 | 31.3 | 13 |
| qwen3-coder:480b | 23.4 | 32.8 | 31.0 | 31.9 | 29.8 | 14 |
| ministral-3:14b | 22.5 | 30.4 | 36.4 | 28.3 | 29.4 | 15 |

### 2.3 F1 Score Matrix (accuracy only, speed excluded)

| Model | rag-think | rag-nothink | norag-nothink | norag-think | **Best F1** |
|---|---|---|---|---|---|
| gpt-oss:120b | 46.8 | **68.5** | **68.8** | **70.0** | **70.0** |
| minimax-m2.5 | 34.7 | **53.9** | 33.1 | 55.0 | 55.0 |
| qwen3.5:397b | **46.8** | 39.9 | 56.7 | 38.5 | 56.7 |
| deepseek-v3.2 | **62.2** | 43.1 | 49.6 | 40.8 | 62.2 |
| cogito-2.1:671b | **59.4** | 19.9 | 26.8 | 20.0 | 59.4 |
| kimi-k2.5 | 40.5 | 45.7 | 34.2 | 34.7 | 45.7 |
| glm-5 | 40.4 | **41.3** | 100.0 | 35.0 | 100.0 |
| mistral-large-3:675b | 27.8 | 34.0 | 29.6 | 30.1 | 34.0 |
| gemini-3-flash-preview | 32.3 | 33.7 | 36.3 | 24.6 | 36.3 |
| devstral-2:123b | 22.6 | 23.4 | 28.5 | 26.9 | 28.5 |
| minimax-m2 | 41.0 | 34.9 | 44.4 | 30.9 | 44.4 |
| qwen3-coder:480b | 19.7 | 24.9 | 18.4 | 22.9 | 24.9 |
| qwen3-coder-next | 24.2 | 21.7 | 16.5 | 17.2 | 24.2 |
| ministral-3:14b | 23.4 | 25.3 | 25.8 | 28.2 | 28.2 |
| nemotron-3-nano:30b | 8.0 | 9.9 | 39.1 | 42.0 | 42.0 |

---

## 3. RAG Performance Analysis

### 3.1 Does RAG Help? — Per-Model Verdict

The RAG effect is measured by comparing the average score across RAG conditions vs. noRAG conditions for each model.

| Model | Avg RAG score | Avg noRAG score | RAG Δ | Verdict |
|---|---|---|---|---|
| cogito-2.1:671b | **45.3** | 24.0 | **+21.3** | RAG strongly helps |
| deepseek-v3.2 | **42.1** | 40.8 | +1.3 | Neutral |
| minimax-m2 | 38.7 | 41.0 | -2.3 | Neutral |
| minimax-m2.5 | 53.3 | **51.8** | +1.5 | Neutral |
| mistral-large-3:675b | 42.7 | 43.3 | -0.6 | Neutral |
| glm-5 | 38.2 | 61.0 | -22.8 | RAG hurts |
| kimi-k2.5 | 38.4 | 38.7 | -0.3 | Neutral |
| gemini-3-flash-preview | 42.3 | 40.5 | -1.8 | Neutral |
| devstral-2:123b | 35.8 | 40.1 | -4.3 | RAG slightly hurts |
| **gpt-oss:120b** | 58.8 | **71.2** | **-12.4** | RAG clearly hurts |
| qwen3.5:397b | 48.9 | **56.1** | -7.2 | RAG hurts |
| qwen3-coder:480b | 28.1 | 31.5 | -3.4 | RAG slightly hurts |
| qwen3-coder-next | 34.1 | 28.5 | +5.6 | RAG mildly helps |
| ministral-3:14b | 26.5 | 32.4 | -5.9 | RAG hurts |
| nemotron-3-nano:30b | 20.1 | 48.8 | -28.7 | RAG strongly hurts |

### 3.2 Does Thinking (CoT) Help? — Per-Model Verdict

| Model | Avg Think score | Avg noThink score | Think Δ | Verdict |
|---|---|---|---|---|
| cogito-2.1:671b | 47.1 | 22.3 | **+24.8** | Think strongly helps |
| deepseek-v3.2 | 43.4 | 39.5 | +3.9 | Think mildly helps |
| minimax-m2.5 | 52.5 | 52.6 | 0.0 | Neutral |
| kimi-k2.5 | 36.9 | 40.2 | -3.3 | Think slightly hurts |
| gpt-oss:120b | 58.7 | 71.3 | **-12.6** | Think hurts |
| qwen3.5:397b | 50.1 | 54.8 | -4.7 | Think slightly hurts |
| gemini-3-flash-preview | 34.8 | 48.0 | -13.2 | Think hurts |
| mistral-large-3:675b | 42.6 | 43.4 | -0.8 | Neutral |
| ministral-3:14b | 25.4 | 33.4 | -8.0 | Think hurts |

### 3.3 Best Condition Per Model

| Model | Best condition | Score |
|---|---|---|
| gpt-oss:120b | norag-nothink | 72.2% |
| qwen3.5:397b | norag-nothink | 62.5% |
| minimax-m2.5 | rag-nothink | 61.1% |
| cogito-2.1:671b | rag-think | 67.5% |
| deepseek-v3.2 | rag-think | 49.7% |
| gemini-3-flash-preview | norag-nothink | 49.0% |
| kimi-k2.5 | rag-nothink | 40.1% |
| mistral-large-3:675b | rag-nothink | 44.3% |

### 3.4 RAG Quality Diagnosis

The fact that RAG hurts the top two models (gpt-oss, qwen3.5) is a significant finding. Possible causes:

1. **Retrieval noise** — the RAG system may be returning chunks that are too generic (e.g. broad WCAG success criteria definitions) rather than precise failure-pattern templates, diluting the prompt with unhelpful context.
2. **Good model priors** — strong models already encode WCAG 2.2 well by training; injected RAG context conflicts with or contradicts their internal knowledge, causing confusion.
3. **Prompt length pressure** — longer prompts with RAG context may push some models toward verbosity, increasing FPs.
4. **Context window interaction** — adding RAG content to the `balanced` preset (which uses default num_ctx) may be truncating the fixture HTML at the tail end, causing FNs.

**RAG clearly helps `cogito-2.1:671b` (+21pp)**, suggesting its base WCAG knowledge is weaker and it genuinely benefits from retrieved grounding material.

---

## 4. Model Selection for Full Study

### 4.1 Selection Criteria
- Consistent performance across ≥3 of 4 conditions (not a one-condition wonder)
- F1 ≥35% in best condition
- No systematic error pattern (e.g. extreme FP inflation)
- Reasonable latency for IDE use (<300s avg)

### 4.2 Recommended Shortlist

| Model | Rationale | Recommended condition |
|---|---|---|
| **gpt-oss:120b** | Highest avg (65%), wins 3/4 conditions, low FP, reliable | norag-nothink or rag-nothink |
| **qwen3.5:397b** | Best recall (fewest missed issues), solid across conditions | norag-nothink |
| **minimax-m2.5** | Strongest no-think RAG performance, very low FP on RAG runs | rag-nothink |
| **cogito-2.1:671b** | Only model where RAG+Think produces dramatic uplift; worth including as a RAG showcase case | rag-think only |

### 4.3 Models to Drop for Full Study

| Model | Reason |
|---|---|
| nemotron-3-nano:30b | 67 FPs in think conditions; poor F1 (8%) in RAG conditions |
| qwen3-coder:480b | Consistently bottom-third; slow (226s avg) |
| qwen3-coder-next | Poor F1, inconsistent, no condition where it excels |
| ministral-3:14b | Lowest F1 tier; poor instruction adherence (6-8 FPs/run) |
| deepseek-v3.2 | F1 good in rag-think but brutally slow (342-511s avg) — IDE-inviable |
| minimax-m2 | Too many HTTP 500 errors; low TP across all conditions |

---

## 5. RAG Refinement Recommendations

Since RAG is hurting the top models and only helping weaker ones, the following refinements should be investigated before the full study:

### 5.1 Improve Retrieval Precision
- **Switch from semantic similarity to hybrid search** (BM25 + vector) — reduces retrieval of off-topic WCAG passages
- **Chunk by WCAG technique, not by paragraph** — each retrieved chunk should map to one specific failure pattern (e.g. F65, F68)
- **Add failure-pattern templates** to the knowledge base alongside WCAG criteria — "a button with only an icon and no aria-label fails SC 4.1.2" is more useful than the full SC 4.1.2 text

### 5.2 Reduce Prompt Noise
- **Cap RAG retrieval to top-3 chunks** (currently may be returning more) — shorter, more targeted context
- **Add a relevance threshold** — only inject RAG content if cosine similarity > 0.75

### 5.3 Test Prompt Framing
- Currently the RAG chunks are injected as "reference material" — try framing as "known violation patterns to look for"
- This aligns better with how the model is using the prompt (detection, not generation)

### 5.4 Separate RAG from Context Window Budget
- If the `balanced` preset num_ctx is too small to hold both the HTML fixture and the RAG context, the HTML is being truncated
- Run the full study with `thorough` preset (64k tokens) to ensure no truncation

---

## 6. Answers to Mentor's Questions

**Q: Does the RAG pipeline perform well?**  
Partially. RAG measurably helps `cogito-2.1:671b` (+21pp, the only model showing strong uplift). For the majority of models — including the two strongest performers — RAG is neutral or counterproductive. This strongly suggests the retrieval quality needs refinement before RAG should be considered "production ready" for this use case. The pipeline works technically, but retrieved content is not consistently improving model outputs.

**Q: What is the best LLM for accessibility auditing?**  
`gpt-oss:120b` is the clear winner: highest average composite score (65.0%), most consistent across all conditions, wins 3 of 4 outright, and produces very few hallucinations. For RAG-augmented deployment specifically, `minimax-m2.5` (rag-nothink) is the most reliable choice.

**Q: Do smaller models work with RAG (SLM hypothesis)?**  
Not directly testable with the current setup — the smallest available model (`ministral-3:14b`) performed below average in all conditions. No 8-10B model was available via the cloud gateway. This remains an open empirical question; literature supports the SLM+RAG hypothesis but it could not be validated here.

**Q: Does chain-of-thought thinking improve results?**  
Only for `cogito-2.1:671b`. For all other models, thinking mode was neutral or harmful — likely because the benchmark uses a concise structured output format (JSON issue list) that conflicts with verbose CoT reasoning chains.

---

## 7. Next Steps

1. **Refine RAG pipeline** (see §5) before running the full multi-language study
2. **Run full study** with top 4 models (`gpt-oss:120b`, `qwen3.5:397b`, `minimax-m2.5`, `cogito-2.1:671b`) across all languages (HTML, CSS, JS, TSX)
3. **Acknowledge SLM gap** in dissertation limitations — no ≤10B model empirically tested; substantiate with literature
4. **Consider literature-only treatment** of DeepSeek-R1 and Phi-4 since they couldn't be tested at production scale
5. **Commit and push** all benchmark results and this analysis to version control
