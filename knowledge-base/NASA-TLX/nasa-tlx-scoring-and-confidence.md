# NASA-TLX: Scoring and Confidence

## Tags
Tags: #nasa-tlx #scoring #uncertainty #accessibility

## Purpose
Standardise how TLX scores are calculated and reported to avoid inconsistent or misleading predictions.

## Key points
Two scoring approaches exist:

### Raw TLX (Recommended)
- Arithmetic mean of all six dimensions.
- Used when pairwise weighting is not available.
- Best suited for LLM-based prediction.

### Weighted TLX
- Uses pairwise comparison weights.
- Requires user input.
- Not recommended for automated prediction.

## Confidence and Uncertainty
All predicted scores must include:
- Assumptions made (user type, assistive tech).
- Missing information that could affect accuracy.
- Confidence level: Low / Medium / High.

## Developer checks
- Confirm Raw TLX is used unless stated otherwise.
- Ensure confidence is reported alongside scores.
- Avoid presenting predictions as objective truth.

## Fix patterns
- Default to Raw TLX for prediction systems.
- Explicitly state uncertainty.
- Allow users to refine assumptions.

## Examples
No examples provided in source text.