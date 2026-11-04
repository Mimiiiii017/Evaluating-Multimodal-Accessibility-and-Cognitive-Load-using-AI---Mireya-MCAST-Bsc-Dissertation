# Phase 1 — Local vs Cloud LLM Comparison
## Fixture: `html-high` | 51 ground-truth violations

**Date:** 26–27 Apr. 2026  
**Conditions tested:** 4 (RAG/no-RAG × Think/no-Think)  
**Models evaluated:** 8 (4 local via Ollama, 4 cloud-hosted)

---

## 1. Model Availability

| Model | Deployment | Outcome |
|---|---|---|
| `devstral-small-2:24b` | Local (Ollama) | ❌ All 4 conditions failed — Ollama connection refused |
| `gpt-oss:20b` | Local (Ollama) | ❌ All 4 conditions failed — connection refused / timeout (1200s) |
| `phi4-reasoning:14b` | Local (Ollama) | ❌ All 4 conditions failed — Ollama connection refused |
| `qwen3-coder:30b` | Local (Ollama) | ❌ All 4 conditions failed — Ollama connection refused |
| `devstral-small-2:24b-cloud` | Cloud | ✅ All 4 conditions completed |
| `gpt-oss:120b-cloud` | Cloud | ✅ All 4 conditions completed |
| `kimi-k2.6:cloud` | Cloud | ⚠️ 3/4 conditions timed out (900 s); only `rag-think` returned results |
| `qwen3-coder:480b-cloud` | Cloud | ✅ All 4 conditions completed |

> **Conclusion:** All local models failed to connect during this test session (Ollama service unavailable). The local-vs-cloud comparison could not be performed as intended. Results below cover cloud models only.

---

## 2. Full Results — Cloud Models

Ground truth: **51 violations** in `html-high`. TN = 0 for all records (fixture contains only positive/violation examples, no clean-code controls).

| Model | Condition | TP | FP | FN | F1 | Precision | Recall | MCC | RT (s) |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `gpt-oss:120b-cloud` | rag-nothink | 20 | 1 | 31 | **0.5556** | 0.9524 | 0.3922 | −0.1701 | 203.6 |
| `gpt-oss:120b-cloud` | norag-nothink | 16 | 4 | 35 | 0.4507 | 0.8000 | 0.3137 | −0.3705 | 212.7 |
| `gpt-oss:120b-cloud` | rag-think | 12 | 1 | 39 | 0.3750 | 0.9231 | 0.2353 | −0.2425 | 202.0 |
| `kimi-k2.6:cloud` | rag-think | 11 | 0 | 40 | 0.3548 | 1.0000 | 0.2157 | 0.0000 | 718.0 |
| `gpt-oss:120b-cloud` | norag-think | 10 | 1 | 41 | 0.3226 | 0.9091 | 0.1961 | −0.2703 | 172.4 |
| `devstral-small-2:24b-cloud` | norag-nothink | 8 | 0 | 43 | 0.2712 | 1.0000 | 0.1569 | 0.0000 | 40.2 |
| `qwen3-coder:480b-cloud` | rag-think | 8 | 0 | 43 | 0.2712 | 1.0000 | 0.1569 | 0.0000 | 670.4 |
| `devstral-small-2:24b-cloud` | norag-think | 7 | 1 | 44 | 0.2373 | 0.8750 | 0.1373 | −0.3284 | 21.9 |
| `qwen3-coder:480b-cloud` | norag-think | 7 | 0 | 44 | 0.2414 | 1.0000 | 0.1373 | 0.0000 | 231.3 |
| `qwen3-coder:480b-cloud` | rag-nothink | 7 | 0 | 44 | 0.2414 | 1.0000 | 0.1373 | 0.0000 | 263.1 |
| `qwen3-coder:480b-cloud` | norag-nothink | 6 | 0 | 45 | 0.2105 | 1.0000 | 0.1176 | 0.0000 | 35.4 |
| `devstral-small-2:24b-cloud` | rag-nothink | 2 | 0 | 49 | 0.0755 | 1.0000 | 0.0392 | 0.0000 | 141.7 |
| `devstral-small-2:24b-cloud` | rag-think | 2 | 0 | 49 | 0.0755 | 1.0000 | 0.0392 | 0.0000 | 36.8 |
| `kimi-k2.6:cloud` | norag-nothink | 0 | 0 | 51 | 0.0000 | — | 0.0000 | 0.0000 | 477.3 |
| `kimi-k2.6:cloud` | norag-think | 0 | 0 | 51 | 0.0000 | — | 0.0000 | 0.0000 | 900.2 |
| `kimi-k2.6:cloud` | rag-nothink | 0 | 0 | 51 | 0.0000 | — | 0.0000 | 0.0000 | 900.3 |

---

## 3. Best Result per Model

| Model | Best Condition | F1 | Precision | Recall | TP / FP |
|---|---|:---:|:---:|:---:|:---:|
| `gpt-oss:120b-cloud` | rag-nothink | **0.5556** | 0.9524 | 0.3922 | 20 / 1 |
| `kimi-k2.6:cloud` | rag-think | 0.3548 | 1.0000 | 0.2157 | 11 / 0 |
| `devstral-small-2:24b-cloud` | norag-nothink | 0.2712 | 1.0000 | 0.1569 | 8 / 0 |
| `qwen3-coder:480b-cloud` | rag-think | 0.2712 | 1.0000 | 0.1569 | 8 / 0 |

---

## 4. Ablation: Effect of RAG and Chain-of-Thought (gpt-oss:120b-cloud only)

> Only `gpt-oss:120b-cloud` produced results across all four conditions without timeout, making it the only model suitable for a full 2×2 ablation analysis.

|  | No-Think | Think | Think vs No-Think Δ |
|---|:---:|:---:|:---:|
| **No-RAG** | F1 = 0.4507 | F1 = 0.3226 | **−0.1281** |
| **RAG** | F1 = 0.5556 | F1 = 0.3750 | **−0.1806** |
| **RAG vs No-RAG Δ** | **+0.1049** | **+0.0524** | |

- **RAG improves F1** in both conditions (+0.1049 without thinking, +0.0524 with thinking).
- **Chain-of-thought (think) reduces F1** in both conditions for this model, contrary to the expectation from general CoT literature. Enabling thinking improves precision slightly (0.9524 → 0.9231) but substantially reduces recall (0.3922 → 0.2353), suggesting the model becomes more conservative when given extended reasoning time.
- **Best configuration: RAG + No-Think** (F1 = 0.5556). This is the highest F1 of any run in this test.

---

## 5. MCC Note

All records show **TN = 0** because the `html-high` fixture is composed entirely of violation examples (no clean-code controls). In a violation-only fixture, any false positive has no true negative to cancel it against, so:

- **MCC = 0** when FP = 0 (indeterminate in the strict sense — formula collapses to 0/0, reported as 0).
- **MCC < 0** when FP > 0 (confusion matrix correlation is driven negative by the false-positive count against a zero-TN background).

The negative MCC scores seen in `gpt-oss:120b-cloud` are therefore a fixture-design artefact rather than a sign of sub-random performance. They do, however, correctly indicate that the model's false positives are penalising its classification agreement. A mixed-content fixture (violations + clean code) is required for MCC to be interpretable here.

---

## 6. Latency

| Model | Min RT (s) | Max RT (s) | Notes |
|---|:---:|:---:|---|
| `devstral-small-2:24b-cloud` | 21.9 | 141.7 | Fastest cloud model; RAG adds latency |
| `qwen3-coder:480b-cloud` | 35.4 | 670.4 | 480B params; rag-think is very slow |
| `gpt-oss:120b-cloud` | 172.4 | 212.7 | Consistent ~200s across all conditions |
| `kimi-k2.6:cloud` | 477.3 | 900.3 | Hit 900s ceiling on 3/4 conditions |

---

## 7. Key Findings

1. **Local deployment is not viable** under current infrastructure: all four local Ollama models failed with connection errors. Cloud deployment is the only working path for this phase.
2. **`gpt-oss:120b-cloud` is the clear leader** — the only model achieving F1 > 0.40, and the only one with meaningful recall (>0.30) across multiple conditions.
3. **RAG consistently improves detection** for the best-performing model, adding ~10 F1 points in the no-think condition.
4. **Chain-of-thought did not help** on this fixture: enabling thinking reduced recall substantially for `gpt-oss:120b-cloud` and `kimi-k2.6:cloud`'s only successful run still required rag-think to return *any* violations at all.
5. **Precision is near-perfect** for most models when they do produce findings (FP counts are 0 or 1), but **recall is universally low** — the dominant failure mode is missed violations (false negatives), not spurious violations.
6. **`qwen3-coder:480b-cloud`** produces zero false positives across all conditions but achieves only modest recall (max 0.1569), significantly underperforming the much smaller `gpt-oss:120b-cloud`.
7. **`kimi-k2.6:cloud`** has a latency problem: 3/4 conditions hit the 900s timeout ceiling before generating output. Its one successful run (rag-think, F1 = 0.3548) shows it can detect violations but it is not deployable at IDE-interactive latency for this fixture.
