# NASA-TLX: Comprehensive Guide for LLM-Based Cognitive Load Prediction

## Introduction
The NASA Task Load Index (NASA-TLX) is a gold-standard tool for measuring perceived cognitive workload. It is especially useful for evaluating user experience in tasks involving code, user interfaces, or images. This guide is designed to help a language model (LLM) understand, predict, and reason about cognitive load using NASA-TLX principles.

---

## 1. NASA-TLX Subscales
NASA-TLX evaluates workload using six dimensions:

| Subscale           | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| Mental Demand      | How much mental and perceptual activity was required?                        |
| Physical Demand    | How much physical activity was required?                                     |
| Temporal Demand    | How much time pressure did the user feel?                                    |
| Performance        | How successful was the user in accomplishing the task?                       |
| Effort             | How hard did the user have to work to accomplish their level of performance? |
| Frustration        | How insecure, discouraged, irritated, stressed, and annoyed was the user?    |

Each is rated from 0 (very low) to 100 (very high).

---

## 2. Predicting Cognitive Load from Code or Images

### For Code:
- **Mental Demand:** Complex logic, nested structures, or unfamiliar patterns increase demand.
- **Physical Demand:** Usually low, unless code requires repetitive or error-prone typing.
- **Temporal Demand:** Tight deadlines or real-time requirements increase pressure.
- **Performance:** Code that is hard to debug or test may lower perceived performance.
- **Effort:** Obfuscated, poorly documented, or lengthy code increases effort.
- **Frustration:** Ambiguous errors, unclear requirements, or frequent bugs increase frustration.

### For Images/UI:
- **Mental Demand:** Cluttered layouts, ambiguous icons, or dense information increase demand.
- **Physical Demand:** Small clickable areas or complex gestures increase demand.
- **Temporal Demand:** Time-limited tasks or animations increase pressure.
- **Performance:** If users struggle to complete tasks, perceived performance drops.
- **Effort:** Non-intuitive navigation or hidden features increase effort.
- **Frustration:** Inaccessible elements, poor contrast, or confusing feedback increase frustration.

---

## 3. LLM Reasoning Patterns

When analyzing code or images, the LLM should:
- Identify features that map to each NASA-TLX subscale.
- Assign a predicted score (0–100) for each subscale, with justification.
- Aggregate scores to estimate overall cognitive load.
- Suggest improvements to reduce load.

### Example (Code):
> **Code Sample:** Deeply nested for-loops with minimal comments.
> - Mental Demand: 80 (complex logic)
> - Physical Demand: 10 (typing only)
> - Temporal Demand: 60 (hard to debug quickly)
> - Performance: 50 (likely errors)
> - Effort: 75 (hard to follow)
> - Frustration: 70 (likely to cause confusion)

### Example (Image/UI):
> **UI Sample:** Dashboard with many widgets, small buttons, and no labels.
> - Mental Demand: 85 (information overload)
> - Physical Demand: 30 (precise mouse use)
> - Temporal Demand: 70 (hard to find info quickly)
> - Performance: 40 (users may miss key info)
> - Effort: 80 (navigation is hard)
> - Frustration: 75 (frustrating to use)

---

## 4. Visualizing NASA-TLX

A radar chart or bar graph can be used to visualize the subscale scores. Example:

```
Mental Demand:     80
Physical Demand:   10
Temporal Demand:   60
Performance:       50
Effort:            75
Frustration:       70
```

![NASA-TLX Radar Chart](https://upload.wikimedia.org/wikipedia/commons/3/3a/NASA-TLX-Radar-Chart.png)

---

## 5. LLM Prompt Template

> "Given the following code/image/UI, estimate the NASA-TLX subscale scores (0–100) for Mental Demand, Physical Demand, Temporal Demand, Performance, Effort, and Frustration. Justify each score. Suggest ways to reduce cognitive load."

---

## 6. References and Further Reading
- [NASA TLX Official Site](https://humansystems.arc.nasa.gov/groups/TLX/)
- [NASA TLX on Wikipedia](https://en.wikipedia.org/wiki/NASA_Task_Load_Index)
- NASA-TLX reference material used during the study (see the dissertation references).

---

**This document is designed to maximize LLM understanding and prediction of cognitive load using NASA-TLX, for both code and visual content.**
