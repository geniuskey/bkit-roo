/**
 * API stream types and utilities.
 * Ported from Roo Code's src/api/transform/stream.ts
 */

/**
 * Unified stream chunk types from any LLM provider.
 */
export type ApiStreamChunk =
  | { type: "text"; text: string }
  | { type: "reasoning"; text: string }
  | { type: "usage"; inputTokens: number; outputTokens: number; cacheReadTokens?: number; cacheWriteTokens?: number; totalCost?: number }
  | { type: "error"; error: Error; code?: string }
  | { type: "tool_call"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_call_partial"; id: string; name: string; inputDelta: string }

/**
 * An async generator that yields stream chunks.
 */
export type ApiStream = AsyncGenerator<ApiStreamChunk>

/**
 * Collect all text from a stream into a single string.
 */
export async function collectStreamText(stream: ApiStream): Promise<string> {
  let result = ""
  for await (const chunk of stream) {
    if (chunk.type === "text") {
      result += chunk.text
    }
  }
  return result
}

/**
 * Collect all chunks from a stream.
 */
export async function collectStream(stream: ApiStream): Promise<ApiStreamChunk[]> {
  const chunks: ApiStreamChunk[] = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return chunks
}
