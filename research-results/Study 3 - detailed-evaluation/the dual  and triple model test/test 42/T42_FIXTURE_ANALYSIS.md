# T42 Performance Analysis by Fixture Type

**Overall:** 69.6% F1 (rag-nothink condition)

## Grouped Performance

### 🏆 Strong Performers (>70% F1)
- **html-low:** 72.6% F1
- **html-medium:** 71.7% F1  
- **html-high:** 69.8% F1
- **js-low:** 71.6% F1
- **Clean fixtures:** 100% F1 (no issues expected)

**Average HTML/JS-Low:** 72.0% F1 ✅

### ⚠️ Medium Performers (55-70% F1)
- **css-medium:** 66.1% F1
- **tsx-medium:** 59.3% F1
- **css-low:** 53.5% F1
- **tsx-high:** 54.4% F1
- **css-high:** 54.9% F1

**Average Medium:** 57.6% F1 ⚠️

### 🔴 Weak Performers (<55% F1)
- **js-high:** 44.1% F1 ← **WORST**
- **tsx-low:** 46.7% F1
- **js-medium:** 49.1% F1

**Average JS/TSX Complex:** 46.3% F1 ❌

---

## Optimization Opportunity

The **-8pp gap** between HTML (72%) and JS/TSX (46%) could be closed with:

1. **JS/TSX-specific voting threshold** — These need more lenient Stage 1 (accept more consensus matches)
2. **Different model pair for JS fixtures?** — Maybe qwen handles HTML better, need different validator for JS
3. **Fixture-specific Stage 2 recovery** — JS rejected issues might need lower confidence bar to recover

**If we fix JS-High from 44% → 66%** → Overall would jump to 71-72% F1 ✅

---

## Recommendation

**Start with T43: Per-Fixture-Type Optimization**
- Test higher Stage 1 threshold on JS/TSX-High fixtures only
- Keep current kimi+qwen config for HTML (already working well)
- Expected: +2-3pp overall F1 (66-67% baseline → 69% new)

Would you like to implement T43?
