// rag.ts — fetches WCAG knowledge chunks from the knowledge base using a search query

type RagChunk = { id: string; source: string; text: string };
type RagRetrieveResponse = { chunks: RagChunk[] };

export const RAG_CONFIG = {
  topK: 10,                    // Number of knowledge base chunks to retrieve (top-10 most relevant)
  maxExcerptChars: 350000,     // Max characters to extract from code (~87K tokens; cloud models have 128K token context)
  cacheTimeMs: 60000,         // Cache RAG results for 60 seconds
};

// Cache RAG results to avoid redundant API calls within the same session
export const ragCache = new Map<string, { at: number; context: string }>();

export async function ragRetrieve(
  endpoint: string,
  query: string,
  topK: number,
  kbType: "accessibility" | "tlx" = "accessibility",
  distanceThreshold?: number
): Promise<RagRetrieveResponse> {
  const url = `${endpoint.replace(/\/$/, "")}/retrieve`;

  const body: Record<string, unknown> = { query, top_k: topK, kb_type: kbType };
  if (distanceThreshold !== undefined) {
    body.distance_threshold = distanceThreshold;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`RAG retrieve failed (HTTP ${res.status}): ${body || res.statusText}`);
  }

  return (await res.json()) as RagRetrieveResponse;
}

export function formatRagContext(chunks: RagChunk[]): string {
  if (!chunks.length) {
    return "(no context)";
  }
  // Truncate each chunk to 2000 chars for richer context
  return chunks.map((c, i) =>
    `[#${i + 1}] ${c.id}\n${c.text.slice(0, 2000)}${c.text.length > 2000 ? "…" : ""}`
  ).join("\n\n");
}
