/**
 * Ollama API provider for local models.
 * Ported from Roo Code's src/api/providers/native-ollama.ts
 *
 * Features:
 * - Local model execution
 * - Dynamic model discovery via /api/tags
 * - Streaming responses
 * - No API key required
 */

import type { ApiConfiguration, ModelInfo, Message } from "@bkit-roo/shared"
import { BaseProvider, type CreateMessageMetadata } from "./base-provider.js"
import type { ApiStream, ApiStreamChunk } from "../transform/stream.js"

const DEFAULT_OLLAMA_URL = "http://localhost:11434"

export class OllamaProvider extends BaseProvider {
  private baseUrl: string

  constructor(config: ApiConfiguration) {
    super(config)
    this.baseUrl = config.ollamaBaseUrl ?? DEFAULT_OLLAMA_URL
  }

  getModel(): { id: string; info: ModelInfo } {
    const modelId = this.config.ollamaModelId ?? "llama3.1"
    const info: ModelInfo = {
      maxTokens: 4096,
      contextWindow: 128_000,
      supportsImages: false,
      inputPrice: 0,
      outputPrice: 0,
    }
    return { id: modelId, info }
  }

  async *createMessage(
    systemPrompt: string,
    messages: Message[],
    _metadata?: CreateMessageMetadata,
  ): ApiStream {
    const { id: modelId } = this.getModel()

    const ollamaMessages = convertToOllamaMessages(systemPrompt, messages)

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelId,
        messages: ollamaMessages,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error("No response body from Ollama")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    let inputTokens = 0
    let outputTokens = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        if (!line.trim()) continue

        try {
          const data = JSON.parse(line) as OllamaChatResponse
          if (data.message?.content) {
            yield { type: "text", text: data.message.content }
          }
          if (data.done && data.eval_count !== undefined) {
            outputTokens = data.eval_count
            inputTokens = data.prompt_eval_count ?? 0
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }

    if (inputTokens > 0 || outputTokens > 0) {
      yield {
        type: "usage",
        inputTokens,
        outputTokens,
      }
    }
  }
}

interface OllamaChatResponse {
  message?: { role: string; content: string }
  done: boolean
  eval_count?: number
  prompt_eval_count?: number
}

function convertToOllamaMessages(
  systemPrompt: string,
  messages: Message[],
): Array<{ role: string; content: string }> {
  const result: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
  ]

  for (const msg of messages) {
    const content = typeof msg.content === "string"
      ? msg.content
      : msg.content
          .filter((b) => b.type === "text")
          .map((b) => (b as { text: string }).text)
          .join("")

    result.push({ role: msg.role, content })
  }

  return result
}
