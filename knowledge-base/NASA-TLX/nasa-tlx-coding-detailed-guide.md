# NASA-TLX: Detailed LLM Coding Cognitive Load Prediction Guide

## Overview
This document is a highly detailed, step-by-step reference for using NASA-TLX to predict cognitive load from code. It is designed for LLMs to reason about code complexity, user experience, and accessibility with maximum accuracy and explainability.

---

## 1. NASA-TLX Subscales: Deep Dive for Code Analysis

| Subscale        | What to Look for in Code                                                                                                    | Example Indicators                                                                                 |
|-----------------|----------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| Mental Demand   | Complexity, abstraction, unfamiliar patterns, algorithmic depth, cognitive branching, recursion, concurrency, statefulness | Deeply nested logic, recursion, complex data flows, unfamiliar APIs, multiple interacting modules   |
| Physical Demand | Repetitive typing, error-prone syntax, manual refactoring, long code sessions                                              | Repetitive boilerplate, manual data entry, lack of automation, frequent context switching           |
| Temporal Demand | Time pressure, real-time constraints, deadlines, need for rapid debugging or comprehension                                 | Time-limited coding tasks, live coding, debugging under time pressure, real-time system requirements|
| Performance     | Code correctness, efficiency, maintainability, testability, clarity                                                        | Hard-to-debug code, lack of tests, unclear variable names, poor modularity, high bug risk           |
| Effort          | Amount of work to understand, modify, or extend code                                                                       | Sparse comments, poor documentation, long functions, unclear logic, high cognitive load per change  |
| Frustration     | Error frequency, ambiguous errors, unclear requirements, lack of feedback, repeated failures                               | Cryptic error messages, frequent bugs, unclear requirements, lack of support or documentation       |

---

## 2. LLM Step-by-Step Prediction Process

### Step 1: Parse and Analyze Code
- Identify code structure: functions, classes, modules, dependencies.
- Detect patterns: nesting, recursion, asynchronous flows, error handling.
- Assess documentation: inline comments, docstrings, external docs.
- Evaluate naming: variable, function, and class names for clarity.
- Check for accessibility: ARIA, semantic HTML, alt text, keyboard navigation (for web code).

### Step 2: Map Code Features to NASA-TLX Subscales
- For each subscale, list relevant code features and their likely impact.
- Use heuristics and examples (see below) to assign a score (0–100).
- Justify each score with evidence from the code.

### Step 3: Aggregate and Visualize
- Present subscale scores in a table and as a radar/bar chart.
- Provide a summary of overall cognitive load.
- Suggest specific improvements for each subscale.

---

## 3. Example: Annotated Code Analysis

### Code Sample
```python
def process_data(data):
    # No comments, deeply nested, unclear variable names
    for i in range(len(data)):
        for j in range(len(data[i])):
            if data[i][j] > 0:
                # ... more nested logic ...
                pass
```

### NASA-TLX Subscale Prediction
| Subscale        | Score | Justification                                                                 |
|-----------------|-------|------------------------------------------------------------------------------|
| Mental Demand   | 85    | Deep nesting, unclear logic, no comments                                      |
| Physical Demand | 15    | Typing is not excessive, but manual debugging likely                          |
| Temporal Demand | 70    | Hard to debug quickly, likely to take time to understand                      |
| Performance     | 40    | High risk of errors, hard to test, unclear intent                             |
| Effort          | 80    | Requires significant effort to follow and modify                              |
| Frustration     | 75    | Ambiguous logic, likely to cause confusion and errors                         |

### Visualization
- Radar chart or bar graph with above scores.

### Suggested Improvements
- Add comments and docstrings.
- Refactor to reduce nesting.
- Use descriptive variable names.
- Add tests and error handling.

---

## 4. Heuristics for LLMs: Code Feature–Subscale Mapping

### Mental Demand
- High: Deep nesting, recursion, concurrency, unfamiliar libraries, complex algorithms.
- Low: Flat structure, clear logic, familiar patterns, simple data flows.

### Physical Demand
- High: Manual repetitive edits, lack of automation, frequent context switching.
- Low: Automated tools, concise code, good IDE support.

### Temporal Demand
- High: Real-time requirements, time-limited tasks, urgent bug fixes.
- Low: No time pressure, asynchronous work, clear deadlines.

### Performance
- High: Well-tested, modular, clear code, easy to debug.
- Low: Hard to test, unclear logic, high bug risk.

### Effort
- High: Sparse documentation, long functions, unclear logic, high learning curve.
- Low: Well-documented, modular, clear code, easy onboarding.

### Frustration
- High: Frequent errors, ambiguous requirements, poor feedback, lack of support.
- Low: Clear requirements, helpful errors, good documentation, supportive tools.

---

## 5. LLM Prompt Engineering for Code

> "Given the following code, analyze and predict NASA-TLX subscale scores (0–100) for Mental Demand, Physical Demand, Temporal Demand, Performance, Effort, and Frustration. For each, provide a detailed justification based on code features. Suggest concrete improvements to reduce cognitive load."

---

## 6. Advanced: Accessibility-Specific Code Features
- For web code, check for ARIA roles, semantic HTML, alt text, keyboard navigation, focus management, color contrast, and error feedback.
- For UI code, check for logical tab order, accessible labels, and screen reader support.
- For all code, check for error handling, user feedback, and documentation.

---

## 7. References
- [NASA TLX Official Site](https://humansystems.arc.nasa.gov/groups/TLX/)
- [NASA TLX on Wikipedia](https://en.wikipedia.org/wiki/NASA_Task_Load_Index)
- NASA-TLX reference material used during the study (see the dissertation references).

---

**This guide is designed to maximize LLM prediction accuracy for cognitive load in code analysis, with detailed mappings, examples, and prompt templates.**
