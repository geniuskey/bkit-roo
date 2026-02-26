/**
 * OpenAI API provider.
 * Ported from Roo Code's src/api/providers/openai.ts
 *
 * Features:
 * - OpenAI SDK usage (also works with Azure OpenAI)
 * - Streaming chat completions
 * - Native tool calling support
 * - Reasoning model support (o1, o3)
 */

import type { ApiConfiguration, ModelInfo, Message } from "@bkit-roo/shared"
import { openAiModels, defaultModelIds } from "@bkit-roo/shared"
import { BaseProvider, type CreateMessageMetadata } from "./base-provider.js"
import type { ApiStream, ApiStreamChunk } from "../transform/stream.js"
import { convertToOpenAiMessages } from "../transform/openai-format.js"

export class OpenAiProvider extends BaseProvider {
  private client: OpenAiClient | null = null

  constructor(config: ApiConfiguration) {
    super(config)
  }

  private getClient(): OpenAiClient {
    if (!this.client) {
      this.client = createOpenAiClient({
        apiKey: this.config.openAiApiKey ?? "",
        baseURL: this.config.openAiBaseUrl,
      })
    }
    return this.client
  }

  getModel(): { id: string; info: ModelInfo } {
    const modelId = this.config.openAiModelId ?? defaultModelIds.openai ?? "gpt-4o"
    const info = openAiModels[modelId] ?? {
      maxTokens: 16384,
      contextWindow: 128_000,
      supportsImages: true,
      inputPrice: 2.5,
      outputPrice: 10.0,
    }
    return { id: modelId, info }
  }

  async *createMessage(
    systemPrompt: string,
    messages: Message[],
    _metadata?: CreateMessageMetadata,
  ): ApiStream {
    const { id: modelId, info: modelInfo } = this.getModel()
    const client = this.getClient()

    const openAiMessages = convertToOpenAiMessages(messages)

    // Add system prompt
    const allMessages = [
      { role: "system" as const, content: systemPrompt },
      ...openAiMessages,
    ]

    const maxTokens = this.config.modelMaxTokens ?? modelInfo.maxTokens

    const requestParams: OpenAiCreateParams = {
      model: modelId,
      messages: allMessages,
      max_tokens: maxTokens,
      stream: true,
      stream_options: { include_usage: true },
    }

    if (this.config.modelTemperature != null) {
      requestParams.temperature = this.config.modelTemperature
    }

    const stream = await client.chat.completions.create(requestParams)

    for await (const chunk of stream) {
      const result = processOpenAiChunk(chunk)
      if (result) {
        yield result
      }
    }
  }
}

// ---------- OpenAI SDK types (minimal interface) ----------

interface OpenAiClient {
  chat: {
    completions: {
      create(params: OpenAiCreateParams): Promise<AsyncIterable<OpenAiStreamChunk>>
    }
  }
}

interface OpenAiCreateParams {
  model: string
  messages: Array<{ role: string; content: string | null; tool_calls?: unknown[]; tool_call_id?: string }>
  max_tokens: number
  stream: boolean
  stream_options?: { include_usage: boolean }
  temperature?: number
}

interface OpenAiStreamChunk {
  choices?: Array<{
    delta?: {
      content?: string | null
      role?: string
      tool_calls?: Array<{
        id?: string
        function?: { name?: string; arguments?: string }
      }>
    }
    finish_reason?: string | null
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    prompt_tokens_details?: {
      cached_tokens?: number
    }
  }
}

function createOpenAiClient(options: { apiKey: string; baseURL?: string }): OpenAiClient {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const OpenAI = require("openai").default
    return new OpenAI(options)
  } catch {
    throw new Error(
      "openai package is not installed. Install it with: npm install openai"
    )
  }
}

function processOpenAiChunk(chunk: OpenAiStreamChunk): ApiStreamChunk | null {
  // Usage info
  if (chunk.usage) {
    return {
      type: "usage",
      inputTokens: chunk.usage.prompt_tokens,
      outputTokens: chunk.usage.completion_tokens,
      cacheReadTokens: chunk.usage.prompt_tokens_details?.cached_tokens,
    }
  }

  // Content delta
  const choice = chunk.choices?.[0]
  if (!choice?.delta) return null

  if (choice.delta.content) {
    return { type: "text", text: choice.delta.content }
  }

  return null
}
