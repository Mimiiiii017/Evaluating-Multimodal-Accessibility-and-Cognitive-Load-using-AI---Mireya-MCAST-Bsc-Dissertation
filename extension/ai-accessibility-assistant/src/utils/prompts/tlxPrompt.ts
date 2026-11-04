// tlxPrompt.ts — builds prompts for NASA TLX cognitive workload analysis
// Uses the NASA Task Load Index standard to evaluate interface cognitive load
// Exposes:
//   TLX_SYSTEM_PROMPT — defines the TLX analysis role and output format
//   buildTlxPrompt — assembles the full TLX analysis prompt
// Used by: commands/tlxPanel.ts

export const TLX_SYSTEM_PROMPT = `You are an expert NASA Task Load Index (NASA-TLX) evaluator. Your job is to analyze the provided code/interface and assess its cognitive workload using the six NASA-TLX dimensions. You respond ONLY in the exact format shown below.

CRITICAL RULES:
- You MUST rate all six dimensions (Mental Demand, Physical Demand, Temporal Demand, Performance, Effort, Frustration).
- You MUST provide a confidence score (0–100) for each rating.
- You MUST explain your reasoning briefly for each dimension.
- You ONLY output the TLX assessment. No prose, summaries, or commentary outside the format.
- You NEVER write markdown, JSON, or prose outside the specified blocks.
- You NEVER pad or invent dimensions.`;

export function buildTlxPrompt(languageId: string, code: string, contextBlock: string): string {
  return `Analyze the cognitive workload of this ${languageId} code/interface using the NASA Task Load Index (NASA-TLX) framework. Rate all six dimensions on a scale of 0–100 where:
- 0 = Very Low (dimension has minimal cognitive impact)
- 100 = Very High (dimension creates maximum cognitive burden)

OUTPUT FORMAT — provide exactly one rating per dimension:

Dimension: Mental Demand
Rating: <0–100>
Confidence: <0–100>
Reasoning: <1–2 sentences explaining why>

Dimension: Physical Demand
Rating: <0–100>
Confidence: <0–100>
Reasoning: <1–2 sentences explaining why>

Dimension: Temporal Demand
Rating: <0–100>
Confidence: <0–100>
Reasoning: <1–2 sentences explaining why>

Dimension: Performance
Rating: <0–100>
Confidence: <0–100>
Reasoning: <1–2 sentences explaining why>

Dimension: Effort
Rating: <0–100>
Confidence: <0–100>
Reasoning: <1–2 sentences explaining why>

Dimension: Frustration
Rating: <0–100>
Confidence: <0–100>
Reasoning: <1–2 sentences explaining why>

DIMENSION DEFINITIONS:
- Mental Demand: How much mental processing, attention, and decision-making is required?
- Physical Demand: How much physical interaction or Motor control is required (clicks, gestures, typing)?
- Temporal Demand: Is the interface responsive? Is the user rushed or waiting? Are there time-critical operations?
- Performance: How well can a user accomplish the task? Are there barriers to success?
- Effort: How hard must the user work (both mentally and physically) to accomplish the task?
- Frustration: How annoying, irritating, or discouraging is the interface? Does it create negative user emotion?

WCAG & ACCESSIBILITY CONTEXT (retrieved from knowledge base):
${contextBlock}

CODE/INTERFACE TO EVALUATE (${languageId}):
${code}`;
}
