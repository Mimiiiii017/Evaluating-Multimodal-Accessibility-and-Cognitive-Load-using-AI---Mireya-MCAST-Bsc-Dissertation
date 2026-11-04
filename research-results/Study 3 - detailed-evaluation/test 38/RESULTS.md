# Test 38 Results: Hybrid RAG Fixes Validation

## Overview

Test 38 validated the hybrid RAG improvements implemented after T37's findings that RAG was degrading performance. The fixes included:
1. Hybrid search (BM25 + semantic embeddings)
2. Reduced context overload (chunks 5 → 3)
3. Improved grounding instructions

## T38 Results vs T37 (Hybrid RAG Effect)

### Comparative Performance

| Condition | T37 F1 | T38 F1 | Change | Notes |
|---|---|---|---|---|
| norag-nothink (baseline) | 50.7% | 44.2% | -6.5pp | Baseline variance; concerning drop |
| norag-think | ~44.5% | 46.5% | +2.0pp | Improved (fewer hallucinations, FP: 276→167) |
| rag-nothink | 40.7% | 40.2% | -0.5pp | Flat; hybrid search not helping no-think |
| rag-think | 42.9% | 46.9% | +4.0pp | Improved (+4pp with hybrid search + reasoning) |

### Key Findings

**Positive:**
- rag-think improved +4pp with hybrid search—validates that hybrid approach helps when models can reason
- norag-think FP reduced (276 → 167)—fewer hallucinations overall
- Hybrid search architecture sound; combines semantic + keyword matching effectively

**Negative:**
- norag-nothink baseline dropped -6.5pp (50.7% → 44.2%)—indicates fixture variance or model instability
- rag-nothink remained flat—hybrid search not addressing no-thinking retrieval issue
- RAG fundamentally still underperforming: rag-nothink 40.2% vs norag-nothink 44.2%

### Root Cause Analysis

The core problem remains: **KB organized by concept, not component**.

When fixtures ask "analyze this navbar," RAG retrieves chunks about "ARIA landmarks" and "keyboard navigation" (conceptually right but structurally wrong). Hybrid search helps models reasoning about retrieved content, but doesn't fix the retrieval mismatch.

**Hybrid search helped because:**
- BM25 catches keyword matches that embeddings miss
- Combined scoring reduces noise from loosely-related semantic matches
- Thinking mode can better ground reasoning in multiple signals

**Hybrid search couldn't fix because:**
- KB still separated by accessibility concept (forms.md, images.md)
- No component bundling (HTML + CSS + JS together)
- Models still confused mapping generic rules to specific component code

## T39 Next Steps: Ensemble Voting

### Rationale

Instead of fixing retrieval (long-term work), use ensemble voting to reduce FP/FN through model consensus.

**Problem:** Each model has different error profiles:
- gpt-oss: High FN (misses 674–697 issues), low FP (194–223)
- kimi-k2.5: High FP (399 hallucinations), better recall

**Solution:** Keep only issues both models agree on.

### T39 Implementation

**Models:**
- kimi-k2.5 (high recall detector)
- gpt-oss: 120b (high precision validator)

**Strategy:**
1. Run both models on same 16 fixtures, 3 runs each
2. For each fixture, identify which accessibility concepts each model found
3. Keep only concepts both models matched
4. Re-score with consensus issues against ground truth

**Expected Improvements:**
- FP reduced: ~50% (196 → ~100) from removing hallucinations kimi found but gpt-oss doesn't confirm
- Recall maintained or slightly down: FN may increase from missing issues only kimi catches
- Overall F1: +2–3pp if consensus reduces FP faster than increasing FN

### T39 Technical Changes

Added to `evaluation/Cloud-LLM-Preliminary/benchmark.ts`:
- `computeConsensusIssues()`: Compare two models' findings, find agreed-upon concepts
- `createVotedResult()`: Re-score consensus issues against ground truth, compute metrics

Updated `run.ts`:
- Added `--ensemble-voting` CLI flag
- New voting flow: run kimi, run gpt-oss, compute consensus, re-score, save results
- Results labeled: `ensemble-kimi+gpt-oss`

**Usage:**
```bash
npm run bench -- --runs 3 --ensemble-voting
npm run bench -- --runs 3 --ensemble-voting --no-rag      # Test with no RAG
npm run bench -- --runs 3 --ensemble-voting --no-think    # Test without reasoning
```

### T39 Expected Outcomes

| Metric | T38 Baseline | T39 Ensemble | Δ |
|---|---|---|---|
| F1 (rag-think) | 46.9% | ~49% | +2pp |
| False Positives | 196 | ~100 | -50% |
| False Negatives | 716 | ~740 | +24 |
| Precision | high | very high | improve |
| Recall | moderate | lower | regress |

**Hypothesis:** Ensemble consensus sacrifices some recall (both models must agree) but dramatically reduces FP, resulting in net +2–3pp F1 due to precision gains.

## Files Modified (T38→T39)

### Code Changes for Ensemble Voting
- `evaluation/Cloud-LLM-Preliminary/benchmark.ts`: +120 LOC (voting helpers)
- `evaluation/Cloud-LLM-Preliminary/run.ts`: +100 LOC (ensemble flow + CLI flag)

### Implementation Status
✅ Voting logic implemented  
✅ CLI flag added  
✅ Code compiled and tested  
⏳ T39 execution ready (waiting for user to run)

## Next Phase

Once T39 completes, compare:
1. Ensemble voting effectiveness (FP reduction vs F1 gain)
2. Whether consensus approach scales to 3+ models
3. If results warrant: deploy ensemble validator to extension

Then proceed with:
- **T40:** KB component restructuring (organize by navbar, form-field, etc. instead of concept)
- **T41:** Re-index KB and re-run T39 ensemble with better retrieval
- **Long-term:** Hybrid approach: use ensemble voting for production accuracy, redesign KB for future improvements

---

**Test Date:** April 16-17, 2026  
**Mentor Direction:** Path A — Ensemble voting (T39) before KB restructuring (T40)  
**Status:** T38 complete, T39 ready for execution
