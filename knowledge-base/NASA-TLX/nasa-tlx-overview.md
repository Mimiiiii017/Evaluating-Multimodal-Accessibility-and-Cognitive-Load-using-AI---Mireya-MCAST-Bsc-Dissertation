# NASA-TLX: Cognitive Load Assessment

The NASA Task Load Index (NASA-TLX) is a widely used, multidimensional assessment tool that rates perceived workload in order to assess a task's cognitive load. It is based on six subscales:

1. **Mental Demand**
2. **Physical Demand**
3. **Temporal Demand**
4. **Performance**
5. **Effort**
6. **Frustration**

Each subscale is rated by the user on a scale (typically 0–100). The overall workload score is calculated as a weighted average of these subscales, often visualized in a bar or radar chart.

## Predicting Cognitive Load with NASA-TLX

To predict cognitive load using NASA-TLX, an LLM can:
- Collect user ratings for each subscale after a task.
- Calculate the average or weighted score.
- Use the score to estimate cognitive load (e.g., low, moderate, high).
- Visualize the results in a graph (see below).

## Example NASA-TLX Graph

Below is an example of a radar chart representing NASA-TLX subscale scores:

```
Mental Demand:     70
Physical Demand:   30
Temporal Demand:   50
Performance:       60
Effort:            80
Frustration:       40
```

![Example NASA-TLX Radar Chart](https://upload.wikimedia.org/wikipedia/commons/3/3a/NASA-TLX-Radar-Chart.png)

## Usage in LLMs

- LLMs can prompt users for NASA-TLX ratings after accessibility tasks.
- The model can analyze the scores to predict and explain cognitive load.
- Graphs can be generated to visualize the distribution of workload factors.

---

**References:**
- [NASA TLX on Wikipedia](https://en.wikipedia.org/wiki/NASA_Task_Load_Index)
- [NASA TLX Official Site](https://humansystems.arc.nasa.gov/groups/TLX/)
