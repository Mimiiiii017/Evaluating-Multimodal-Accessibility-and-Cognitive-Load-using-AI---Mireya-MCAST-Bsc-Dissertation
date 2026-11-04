# NASA-TLX: Accessibility Barrier Mapping

## Tags
Tags: #accessibility #cognitive-load #nasa-tlx

## Purpose
Map common accessibility barriers to specific NASA-TLX workload dimensions to support explainable cognitive load prediction.

## Key points
Accessibility issues increase workload by forcing users to compensate cognitively or physically.

## Barrier → Dimension Mapping

### Missing or unclear labels
- Mental Demand ↑
- Effort ↑
- Frustration ↑

### Keyboard traps or poor keyboard navigation
- Physical Demand ↑
- Effort ↑
- Frustration ↑

### Poor focus visibility
- Mental Demand ↑
- Frustration ↑

### Inadequate color contrast
- Mental Demand ↑
- Effort ↑

### Unclear error messages
- Frustration ↑
- Performance ↓
- Effort ↑

### Dense or cluttered layout
- Mental Demand ↑
- Effort ↑

### Unexpected dynamic updates
- Mental Demand ↑
- Frustration ↑
- Temporal Demand ↑

## Developer checks
- Identify which barriers are present during the task.
- Map each barrier explicitly to affected TLX dimensions.
- Avoid vague statements like “usability is poor”.

## Fix patterns
- Address barriers that affect multiple dimensions first.
- Prioritise barriers increasing Frustration and Effort.
- Use this mapping to justify score changes.

## Examples
No examples provided in source text.