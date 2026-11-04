# NASA-TLX: LLM Prediction Protocol

## Tags
Tags: #llm #prediction #nasa-tlx #accessibility

## Purpose
Define a repeatable protocol for LLMs to predict cognitive load for users with accessibility needs.

## Required Inputs
- User impairment profile (e.g. screen reader, dyslexia).
- Assistive technology used.
- Task description.
- Identified accessibility barriers.

## Prediction Steps
1. Identify relevant accessibility barriers.
2. Map barriers to TLX dimensions.
3. Estimate each dimension using defined anchors.
4. Compute Raw TLX score.
5. Report confidence and assumptions.

## Output Requirements
- Per-dimension scores (0–100).
- Overall Raw TLX score.
- Explanation referencing barriers.
- Confidence level.

## Developer checks
- Ensure steps are followed in order.
- Reject predictions without stated assumptions.
- Avoid mixing developer and end-user workload.

## Fix patterns
- Request missing inputs before scoring.
- Separate analysis from scoring.
- Keep explanations grounded in observed barriers.

## Examples
No examples provided in source text.