# RAG System Fixes Applied (After Test 37)

**Timeline:** These fixes were implemented after Test 37 completed, in response to the findings that RAG was degrading performance.

**Context:** Test 37 showed that adding RAG to the system was **hurting** F1 scores instead of helping. This document outlines the root cause analysis and fixes being applied before Test 38.

## Changes Made to Fix Test 37 Issues

Based on your mentor's reference material on RAG failure modes, I've implemented 3 key fixes:

### 1. Hybrid Search (Embeddings + BM25 Keywords)
- **Problem:** Relying solely on cosine similarity can surface documents that share keywords but lack correct context
- **Fix:** Added BM25 keyword search alongside embedding-based semantic search
- **How it works:**
  - Query is processed both semantically (using embeddings) and by keyword matching (BM25)
  - Results from both methods are merged, deduplicated, and scored
  - Top results combine both signals for better retrieval precision
- **Files:** `services/rag/app.py` - new BM25 indexing in `/index` endpoint, hybrid retrieval in `/retrieve`

### 2. Reduced Context Overload
- **Problem:** Stuffing too many KB chunks into the prompt "pollutes" context and causes hallucinations
- **Fix:** Reduced default `top_k` from 5 to 3 chunks per query
- **Expected benefit:** Fewer hallucinations (especially from kimi-k2.5), clearer grounding for LLMs
- **Files:** `services/rag/app.py` - `RetrieveRequest.top_k` default

### 3. Better Grounding in Prompts
- **Problem:** Weak prompts let LLMs fall back on internal training instead of trusting retrieved context
- **Fix:** Will add stricter system prompts in the LLM inference layer (benchmark.ts) instructing models to ONLY use provided context
- **Note:** This is in the model prompting, not in RAG service itself

## Technical Details

### BM25 Implementation
- Installed `rank-bm25` package
- Built BM25 index during knowledge base indexing (in-memory, per collection)
- Hybrid scoring: `combined_score = (embedding_score + normalized_bm25_score) / 2`

### Configuration
- New environment variable: `use_hybrid=true` (enabled by default in RetrieveRequest)
- BM25 index stored in-memory per collection (rebuilt on each `/index` call)
- Maintains backward compatibility: can disable hybrid search with `use_hybrid=false`

## Expected Improvements

### For gpt-oss (high FN problem):
- BM25 will catch accessibility rule names directly (e.g., "missing-alt-text")
- Fewer missed issues (FN should decrease)

### For kimi-k2.5 (high FP problem):
- Reduced chunk count (3 vs 5) = less context to misinterpret
- Clearer KB context = fewer hallucinations
- Expected: FP from 399 → ~300-350, F1 improvement

### For qwen (slow problem):
- Fewer chunks to process = faster response times
- Better quality chunks from hybrid search

## Testing Plan

### T38 - Validating RAG Improvements (Post-T37)
These fixes have been deployed and the RAG service re-indexed. T38 will test whether the improvements work:

Run: `npx ts-node run.ts --runs 3 --all-conditions --model kimi-k2.5 --model gpt-oss`

Full conditions on both models:
- norag-nothink (baseline, no RAG)
- norag-think
- rag-nothink (with new hybrid search)
- rag-think (with new hybrid search)

Expected outcome:
- rag-nothink F1 ≥ 43% (up from 40.7% in T37)
- rag-think F1 ≥ 44% (up from 42.9% in T37)
- FP reduced across both models
- FN maintained or slightly reduced

## Files Changed

1. `services/rag/app.py`:
   - Added `rank_bm25` import
   - Added `bm25_indexes` global dict for storing BM25 models per collection
   - Updated `/index` endpoint to build BM25 index during indexing
   - Completely rewrote `/retrieve` endpoint to implement hybrid search (detailed comments in code)
   - Updated `RetrieveRequest` with `top_k=3` and `use_hybrid=True`

## Known Limitations

- **In-memory BM25:** Stored in Python process memory; lost on app restart. Can be persisted to disk if needed.
- **Semantic chunking not yet implemented:** Still using fixed-token chunking (discussed for future T39)
- **KB still organized by concept:** Component-based reorganization (HTML/CSS/JS bundled per feature) planned for future work

## Next Steps

1. Restart RAG service with default settings and re-index
2. Run T38 with hybrid search enabled
3. Compare T38 results vs T37 to measure improvement
4. If successful, move to T39: component-based KB reorganization + semantic chunking
