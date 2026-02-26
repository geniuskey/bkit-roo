/**
 * Google Gemini API provider.
 * Ported from Roo Code's src/api/providers/gemini.ts
 *
 * Features:
 * - Google AI Studio / Vertex AI support
 * - 1M+ context window models
 * - Thinking/reasoning support
 * - Streaming responses
 */

import type { ApiConfiguration, ModelInfo, Message } from "@bkit-roo/shared"
import { geminiModels, defaultModelIds } from "@bkit-roo/shared"
import { BaseProvider, type CreateMessageMetadata } from "./base-provider.js"
import type { ApiStream } from "../transform/stream.js"

export class GeminiProvider extends BaseProvider {
  constructor(config: ApiConfiguration) {
    super(config)
  }

  getModel(): { id: string; info: ModelInfo } {
    const modelId = this.config.apiModelId ?? defaultModelIds.gemini ?? "gemini-2.5-pro-preview-06-05"
    const info = geminiModels[modelId] ?? {
      maxTokens: 8192,
      contextWindow: 1_048_576,
      supportsImages: true,
      inputPrice: 1.25,
      outputPrice: 10.0,
    }
    return { id: modelId, info }
  }

  async *createMessage(
    systemPrompt: string,
    messages: Message[],
    _metadata?: CreateMessageMetadata,
  ): ApiStream {
    const { id: modelId } = this.getModel()
    const apiKey = this.config.geminiApiKey

    if (!apiKey) {
      throw new Error("Gemini API key is required. Set geminiApiKey in config.")
    }

    // Convert messages to Gemini format
    const geminiContents = convertToGeminiMessages(messages)

    const maxTokens = this.config.modelMaxTokens ?? this.getModel().info.maxTokens

    const requestBody: GeminiRequest = {
      contents: geminiContents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        maxOutputTokens: maxTokens,
      },
    }

    if (this.config.modelTemperature != null) {
      requestBody.generationConfig.temperature = this.config.modelTemperature
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?alt=sse&key=${apiKey}`

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error ${response.status}: ${errorText}`)
    }

    if (!response.body) {
      throw new Error("No response body from Gemini")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue
        const jsonStr = line.slice(6)
        if (!jsonStr.trim()) continue

        try {
          const data = JSON.parse(jsonStr) as GeminiStreamResponse
          const candidate = data.candidates?.[0]
          if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
              if (part.text) {
                yield { type: "text" as const, text: part.text }
              }
              if (part.thought) {
                yield { type: "reasoning" as const, text: part.thought }
              }
            }
          }

          if (data.usageMetadata) {
            yield {
              type: "usage" as const,
              inputTokens: data.usageMetadata.promptTokenCount ?? 0,
              outputTokens: data.usageMetadata.candidatesTokenCount ?? 0,
            }
          }
        } catch {
          // Skip malformed SSE data
        }
      }
    }
  }
}

// ---------- Gemini API types ----------

interface GeminiRequest {
  contents: GeminiContent[]
  systemInstruction: { parts: Array<{ text: string }> }
  generationConfig: {
    maxOutputTokens: number
    temperature?: number
  }
}

interface GeminiContent {
  role: "user" | "model"
  parts: GeminiPart[]
}

interface GeminiPart {
  text?: string
  thought?: string
  inlineData?: { mimeType: string; data: string }
}

interface GeminiStreamResponse {
  candidates?: Array<{
    content?: {
      role: string
      parts: GeminiPart[]
    }
  }>
  usageMetadata?: {
    promptTokenCount?: number
    candidatesTokenCount?: number
  }
}

function convertToGeminiMessages(messages: Message[]): GeminiContent[] {
  const result: GeminiContent[] = []

  for (const msg of messages) {
    const role = msg.role === "user" ? "user" : "model"
    const parts: GeminiPart[] = []

    if (typeof msg.content === "string") {
      parts.push({ text: msg.content })
    } else {
      for (const block of msg.content) {
        if (block.type === "text") {
          parts.push({ text: block.text })
        } else if (block.type === "image") {
          parts.push({
            inlineData: {
              mimeType: block.source.media_type,
              data: block.source.data,
            },
          })
        } else if (block.type === "tool_use") {
          parts.push({ text: `[Tool call: ${block.name}(${JSON.stringify(block.input)})]` })
        } else if (block.type === "tool_result") {
          const content = typeof block.content === "string"
            ? block.content
            : JSON.stringify(block.content)
          parts.push({ text: `[Tool result: ${content}]` })
        }
      }
    }

    // Gemini requires alternating user/model messages
    const lastResult = result[result.length - 1]
    if (lastResult && lastResult.role === role) {
      // Merge with previous message of same role
      lastResult.parts.push(...parts)
    } else {
      result.push({ role, parts })
    }
  }

  return result
}
