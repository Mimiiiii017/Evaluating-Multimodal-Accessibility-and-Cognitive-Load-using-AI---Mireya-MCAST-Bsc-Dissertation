# T47 Key Findings & Next Steps

## Critical Discovery: T47 Configuration Mystery

**Observed Pattern:**
- T46: 69.125% F1 (with fixture-specific guidance enabled)
- T47: 70.075% F1 (code identical to T46, but improved by +0.95%)

**Hypothesis:** T47 was run with `--no-fixture-guidance` CLI flag, disabling the problematic fixture guidance that caused T46 regression.

**Evidence Supporting This:**
1. Performance recovered from T46 regression (-1.325% from T45) to near T42 baseline
2. CSS-low performance matches pattern when guidance is disabled (36.1% F1 hallucinations)
3. HTML-high reverted from T46 breakthrough (71.4%→59.9%), suggesting broad guidance re-enabled default patterns
4. No code changes made between T46 and T47 commits

**Critical Question:** Can you confirm T47 test configuration? Was `--no-fixture-guidance` used?

---

## Performance Summary

### Test Progression
```
T42 (baseline, multi-stage voting)     → 70.05% F1
T45 (+KB enhancement)                  → 70.45% F1 (+0.4%)
T46 (+fixture guidance)                → 69.125% F1 (-1.3% regression)
T47 (guidance disabled?)                → 70.075% F1 (+0.95% recovery)
```

### Core Problem Areas Identified

**1. CSS-Low Crisis (36.1% F1) — Unsalvageable with Current Guidance**
- Root cause: Model hallucinating 38-47 false positives per run on minimal issues
- Solution: Replace vague guidance with precise CSS rules (threshold-based detection)
- Impact: Could recover +10-15% F1 with precision rules

**2. JavaScript Pattern Gaps (42-68% F1 range)**
- js-low ✅ Good (68.6%)
- js-medium ❌ Weak (47.3%)
- js-high ❌ Critical (42.4%)
- Root cause: Complex annotation patterns beyond current sweep query sophistication
- Solution: Expand sweep queries with structured JS pattern detection
- Impact: Could recover +8-12% F1

**3. HTML-High Landmark Weakness (59.9% F1)**
- Missing: Navigation landmark labeling, live regions, complex ARIA chains
- Pattern success: Specific patterns (html-low 73.3%, html-medium 73.8%)
- Root cause: Generic guidance misses landmark architecture context
- Solution: Landmark-specific sweep queries + ARIA chain detection
- Impact: Could recover +5-8% F1

---

## Next Steps (Choose Your Path)

### Option A: Disable Fixture Guidance Permanently (Immediate Win)
**Command:** `npx ts-node run.ts --runs 3 --no-fixture-guidance --multi-stage-voting-kimi-qwen --all-conditions`

**Expected Result:**  
- T48 Performance: ~70.5-71% F1 (2nd best condition: rag-think)
- Confirmation that guidance was the T46 problem
- Clean baseline for future optimizations

**Time:** 2-3 hours for 4 conditions × 3 runs each

---

### Option B: Run Ablation Tests First (Isolate Issues)
**Test B1:** `--runs 3 --no-rag --multi-stage-voting-kimi-qwen --all-conditions`  
- Purpose: Measure CSS/JS performance WITHOUT RAG noise
- Expected: Clearer signal of guidance-only issues

**Test B2:** `--runs 3 --no-fixture-guidance --multi-stage-voting-kimi-qwen --all-conditions`  
- Purpose: Measure baseline without guidance
- Expected: Confirm fixture guidance causes regression

**Time:** 4-6 hours total

**Benefit:** Definitive answer to "Is guidance or RAG the problem?"

---

### Option C: Implement CSS Precision Rules for T48 (Recommended)
**Changes Required:**
1. Replace vague css-low guidance with threshold-based rules
2. Implement parser-ready CSS rules:
   ```sql
   focus-indicator: outline:none WITHOUT (box-shadow|border|outline-color|text-decoration) in SAME :focus block
   touch-target: explicit height:<44px OR width:<44px in SAME rule block  
   motion: @keyframes WITHOUT matching @media(prefers-reduced-motion:reduce) at component level
   ```
3. Add structured CSS sweep for these patterns
4. Test in isolation first

**Expected Performance:** 72%+ F1 (css-low recovery + no regression)

**Time:** 4-6 hours implementation + testing

---

## Recommendation

**Recommended Sequence:**
1. **Immediate (30 min):** Confirm T47 configuration (was --no-fixture-guidance used?)
2. **Short-term (Next test):** Disable guidance permanently and test T48 with clean baseline
3. **Medium-term (T48-T49):** Implement CSS precision rules
4. **Long-term (T50+):** Extend JavaScript sweep queries, add landmark detection

**Why This Path:**
- ✅ Removes known problematic guidance
- ✅ Establishes clean baseline (71% F1)
- ✅ Isolates CSS issue for targeted fix
- ✅ Maintains momentum toward 72%+ target

---

## Decision Point

**Can you confirm:**
1. Was T47 run with `--no-fixture-guidance` flag?
2. Should we proceed with Option A (disable guidance), Option B (ablation tests), or Option C (CSS precision rules)?
3. Are T46b/c ablation tests still desired for academic rigor?

Once confirmed, I can execute the next test immediately.
