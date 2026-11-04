# T48: Revert to T45 Safe Configuration

## Objective
Reproduce T45 performance (70.45% F1) by disabling fixture-specific guidance overfitting.

## Configuration
- ✅ KB: T45 enhancement (1242 accessibility docs indexed)
- ✅ Models: Multi-stage kimi-k2.5 + qwen3.5 voting
- ✅ Sweeps: All language-specific mandatory sweeps enabled
- ✅ RAG: Enabled (multi-query, per-fixture thresholds)
- ✅ Reasoning: Enabled (/no_think not added)
- ❌ Fixture Guidance: **DISABLED** (no overfitting)

## Code Changes
- `benchmark.ts` line 945: Changed from `config.noFixtureGuidance ? undefined : fixture.fixtureId` → always `undefined`
- Effect: FIXTURE_SPECIFIC_GUIDANCE constant defined but never injected
- Safe: All sweeps preserved, only guidance removed

## Run Command
```bash
cd evaluation/Cloud-LLM-Preliminary
npx ts-node run.ts --runs 3 --multi-stage-voting-kimi-qwen --all-conditions
```

## Expected Results
- **Target F1**: 70.4-70.5% (match T45)
- **Baseline F1**: 70.075% (T47)
- **Best Condition**: rag-think (should reach 70.5%+)
- **Failure Modes**: css-low will hallucinate MORE without guidance (expected), but overall generalizes better

## Why This Works
- T45 + KB proved robust and generalizable
- T46 fixture guidance overfitted to test files
- T47 (guidance disabled?) recovered to baseline
- T48: Clean baseline for real-world validation

## Real-World Implication
This configuration should work on unfamiliar codebases, WordPress themes, indie sites—not just the 16 test fixtures.

## Next Step
If T48 ≥ 70.4%: Declare victory on generalizability.
If T48 < 70.075%: Investigation deeper (KB issue? implementation bug?)
