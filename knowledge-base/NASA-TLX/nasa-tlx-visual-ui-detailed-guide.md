# NASA-TLX: Visual/UI Cognitive Load Prediction Guide

## Overview
This guide provides detailed instructions for LLMs to predict NASA-TLX cognitive load scores from images, user interfaces, and visual content. It includes annotated examples, heuristics, prompt templates, and accessibility-specific checks.

---

## 1. NASA-TLX Subscales: Deep Dive for Visual/UI Analysis

| Subscale        | What to Look for in Visual/UI                                                                                              | Example Indicators                                                                                 |
|-----------------|----------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| Mental Demand   | Information density, ambiguous icons, clutter, color overload, cognitive branching, unfamiliar layouts                     | Crowded dashboards, dense charts, unclear icons, multiple navigation paths                         |
| Physical Demand | Small clickable areas, complex gestures, repetitive actions, need for precise motor control                                 | Tiny buttons, drag-and-drop, multi-step forms, frequent scrolling                                  |
| Temporal Demand | Time-limited tasks, animations, rapid feedback, need for quick navigation                                                  | Timed quizzes, auto-refreshing dashboards, fast-paced games                                        |
| Performance     | Task completion success, ease of use, error rates, clarity of feedback                                                     | Users missing key info, unclear feedback, hard-to-complete tasks                                   |
| Effort          | Work required to find, interpret, or use information                                                                       | Hidden features, deep navigation, unclear instructions, multiple steps                             |
| Frustration     | Confusing feedback, inaccessible elements, poor contrast, repeated failures                                                | Low contrast, missing alt text, ambiguous errors, inaccessible widgets                             |

---

## 2. LLM Step-by-Step Prediction Process

### Step 1: Parse and Analyze Visual/UI Content
- Identify layout structure: navigation, widgets, forms, images, icons.
- Detect patterns: clutter, ambiguous elements, accessibility issues.
- Assess feedback: error messages, success indicators, loading states.
- Evaluate accessibility: alt text, ARIA, keyboard navigation, color contrast.

### Step 2: Map Features to NASA-TLX Subscales
- For each subscale, list relevant features and their likely impact.
- Assign a score (0–100) with justification.

### Step 3: Aggregate and Visualize
- Present scores in a table and as a radar/bar chart.
- Summarize overall cognitive load.
- Suggest improvements for each subscale.

---

## 3. Example: Annotated UI Analysis

### UI Sample
![Sample Dashboard](https://upload.wikimedia.org/wikipedia/commons/3/3a/NASA-TLX-Radar-Chart.png)

### NASA-TLX Subscale Prediction
| Subscale        | Score | Justification                                                                 |
|-----------------|-------|------------------------------------------------------------------------------|
| Mental Demand   | 80    | Crowded layout, ambiguous icons                                               |
| Physical Demand | 30    | Small clickable areas, frequent scrolling                                    |
| Temporal Demand | 70    | Hard to find info quickly, auto-refreshing                                   |
| Performance     | 40    | Users may miss key info, unclear feedback                                    |
| Effort          | 75    | Navigation is hard, hidden features                                          |
| Frustration     | 70    | Frustrating to use, inaccessible elements                                    |

### Visualization
- Radar chart or bar graph with above scores.

### Suggested Improvements
- Simplify layout, clarify icons, increase button size, improve feedback, enhance accessibility.

---

## 4. Heuristics for LLMs: Visual/UI Feature–Subscale Mapping

### Mental Demand
- High: Dense info, ambiguous icons, unfamiliar layouts.
- Low: Clear, simple, familiar layouts.

### Physical Demand
- High: Tiny buttons, complex gestures, repetitive actions.
- Low: Large targets, simple gestures, minimal repetition.

### Temporal Demand
- High: Timed tasks, rapid feedback, urgent navigation.
- Low: No time pressure, slow-paced, clear deadlines.

### Performance
- High: Easy task completion, clear feedback, low error rates.
- Low: Hard tasks, unclear feedback, frequent errors.

### Effort
- High: Deep navigation, hidden features, unclear instructions.
- Low: Shallow navigation, visible features, clear instructions.

### Frustration
- High: Poor contrast, inaccessible elements, ambiguous errors.
- Low: Good contrast, accessible elements, clear errors.

---

## 5. LLM Prompt Engineering for Visual/UI

> "Given the following image/UI, analyze and predict NASA-TLX subscale scores (0–100) for Mental Demand, Physical Demand, Temporal Demand, Performance, Effort, and Frustration. For each, provide a detailed justification based on features. Suggest concrete improvements to reduce cognitive load."

---

## 6. Advanced: Accessibility-Specific Visual/UI Features
- Check for alt text, ARIA, keyboard navigation, logical tab order, accessible labels, screen reader support, color contrast, error feedback.

---

## 7. References
- [NASA TLX Official Site](https://humansystems.arc.nasa.gov/groups/TLX/)
- [NASA TLX on Wikipedia](https://en.wikipedia.org/wiki/NASA_Task_Load_Index)
- NASA-TLX reference material used during the study (see the dissertation references).

---

**This guide is designed to maximize LLM prediction accuracy for cognitive load in visual/UI analysis, with detailed mappings, examples, and prompt templates.**
