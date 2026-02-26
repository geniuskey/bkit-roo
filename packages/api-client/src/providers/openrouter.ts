/**
 * OpenRouter API provider.
 * Ported from Roo Code's src/api/providers/openrouter.ts
 *
 * Features:
 * - Access to 100+ models through a single API
 * - Dynamic model discovery and pricing
 * - Automatic routing to best provider
 * - Uses OpenAI-compatible format
 */

import type { ApiConfiguration, ModelInfo, Message } from "@bkit-roo/shared"
import { BaseProvider, type CreateMessageMetadata } from "./base-provider.js"
import type { ApiStream, ApiStreamChunk } from "../transform/stream.js"
import { convertToOpenAiMessages } from "../transform/openai-format.js"

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

export class OpenRouterProvider extends BaseProvider {
  private client: OpenRouterClient | null = null

  constructor(config: ApiConfiguration) {
    super(config)
  }

  private getClient(): OpenRouterClient {
    if (!this.client) {
      this.client = createOpenRouterClient({
        apiKey: this.config.openRouterApiKey ?? "",
        baseURL: this.config.openRouterBaseUrl ?? OPENROUTER_BASE_URL,
      })
    }
    return this.client
  }

  getModel(): { id: string; info: ModelInfo } {
    const modelId = this.config.openRouterModelId ?? "anthropic/claude-sonnet-4-20250514"
    // OpenRouter model info is fetched dynamically; provide reasonable defaults
    const info: ModelInfo = {
      maxTokens: 8192,
      contextWindow: 200_000,
      supportsImages: true,
      inputPrice: 3.0,
      outputPrice: 15.0,
    }
    return { id: modelId, info }
  }

  async *createMessage(
    systemPrompt: string,
    messages: Message[],
    _metadata?: CreateMessageMetadata,
  ): ApiStream {
    const { id: modelId } = this.getModel()
    const client = this.getClient()

    const openAiMessages = convertToOpenAiMessages(messages)
    const allMessages = [
      { role: "system" as const, content: systemPrompt },
      ...openAiMessages,
    ]

    const stream = await client.createStream({
      model: modelId,
      messages: allMessages,
    })

    for await (const chunk of stream) {
      const result = processOpenRouterChunk(chunk)
      if (result) {
        yield result
      }
    }
  }
}

// ---------- OpenRouter types ----------

interface OpenRouterClient {
  createStream(params: {
    model: string
    messages: Array<{ role: string; content: string | null }>
  }): Promise<AsyncIterable<OpenRouterStreamChunk>>
}

interface OpenRouterStreamChunk {
  choices?: Array<{
    delta?: { content?: string | null }
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
  }
}

function createOpenRouterClient(options: { apiKey: string; baseURL: string }): OpenRouterClient {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const OpenAI = require("openai").default
    const client = new OpenAI({
      apiKey: options.apiKey,
      baseURL: options.baseURL,
      defaultHeaders: {
        "HTTP-Referer": "https://github.com/bkit-roo",
        "X-Title": "bkit-roo",
      },
    })
    return {
      createStream: async (params) => {
        return client.chat.completions.create({
          ...params,
          stream: true,
          stream_options: { include_usage: true },
        })
      },
    }
  } catch {
    throw new Error(
      "openai package is not installed. Install it with: npm install openai"
    )
  }
}

function processOpenRouterChunk(chunk: OpenRouterStreamChunk): ApiStreamChunk | null {
  if (chunk.usage) {
    return {
      type: "usage",
      inputTokens: chunk.usage.prompt_tokens,
      outputTokens: chunk.usage.completion_tokens,
    }
  }

  const choice = chunk.choices?.[0]
  if (choice?.delta?.content) {
    return { type: "text", text: choice.delta.content }
  }

  return null
}
