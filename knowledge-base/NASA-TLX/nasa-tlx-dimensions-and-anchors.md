# NASA-TLX: Dimensions and Anchors

## Tags
Tags: #nasa-tlx #workload-dimensions #accessibility

## Purpose
Define the six NASA-TLX dimensions with clear anchors so cognitive load predictions remain consistent and interpretable.

## Key points
NASA-TLX consists of six workload dimensions, each scored from 0–100.

### Mental Demand
- Low: Task is simple, clear, and easy to understand.
- High: Task requires sustained concentration, memory, or interpretation.

### Physical Demand
- Low: Minimal physical interaction.
- High: Repetitive actions, precise input, or sustained motor effort.

### Temporal Demand
- Low: No time pressure.
- High: User feels rushed or pressured to act quickly.

### Performance
- Low score: User feels unsuccessful or error-prone.
- High score: User feels successful and confident.
(Note: Performance is inversely related to workload interpretation.)

### Effort
- Low: Task feels easy and requires little energy.
- High: Task feels exhausting or mentally taxing.

### Frustration
- Low: User feels calm and satisfied.
- High: User feels stressed, annoyed, or discouraged.

## Developer checks
- Confirm score direction is respected for Performance.
- Avoid mixing objective metrics with subjective perception.
- Ensure each dimension is assessed independently.

## Fix patterns
- Use descriptive anchors when estimating scores.
- Avoid collapsing multiple dimensions into one.
- Document assumptions made during scoring.

## Examples
No examples provided in source text.