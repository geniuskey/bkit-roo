/**
 * Anthropic (Claude) API provider.
 * Ported from Roo Code's src/api/providers/anthropic.ts
 *
 * Features:
 * - Native Anthropic SDK usage
 * - Prompt caching support
 * - Extended thinking for Claude 3.7+/4.x
 * - Streaming with fine-grained event handling
 */

import type { ApiConfiguration, ModelInfo, Message, ContentBlock } from "@bkit-roo/shared"
import { anthropicModels, defaultModelIds } from "@bkit-roo/shared"
import { BaseProvider, type CreateMessageMetadata } from "./base-provider.js"
import type { ApiStream, ApiStreamChunk } from "../transform/stream.js"

/**
 * Anthropic API provider using the official SDK.
 *
 * Note: This provider requires the `@anthropic-ai/sdk` package to be installed
 * by the consumer. It is a peer dependency.
 */
export class AnthropicProvider extends BaseProvider {
  private client: AnthropicClient | null = null

  constructor(config: ApiConfiguration) {
    super(config)
  }

  private getClient(): AnthropicClient {
    if (!this.client) {
      // Dynamic import to keep it as a peer dependency
      this.client = createAnthropicClient({
        apiKey: this.config.apiKey ?? "",
        baseURL: this.config.anthropicBaseUrl,
      })
    }
    return this.client
  }

  getModel(): { id: string; info: ModelInfo } {
    const modelId = this.config.apiModelId ?? defaultModelIds.anthropic ?? "claude-sonnet-4-20250514"
    const info = anthropicModels[modelId] ?? {
      maxTokens: 8192,
      contextWindow: 200_000,
      supportsImages: true,
      supportsPromptCache: true,
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
    const { id: modelId, info: modelInfo } = this.getModel()
    const client = this.getClient()

    const maxTokens = this.config.modelMaxTokens ?? modelInfo.maxTokens

    // Convert messages to Anthropic format
    const anthropicMessages = convertToAnthropicMessages(messages)

    // Build system prompt with cache control
    const systemContent: AnthropicSystemContent[] = [
      {
        type: "text",
        text: systemPrompt,
        cache_control: modelInfo.supportsPromptCache ? { type: "ephemeral" } : undefined,
      },
    ]

    // Build request params
    const requestParams: AnthropicCreateParams = {
      model: modelId,
      max_tokens: maxTokens,
      system: systemContent,
      messages: anthropicMessages,
      stream: true,
    }

    // Add temperature if specified
    if (this.config.modelTemperature != null) {
      requestParams.temperature = this.config.modelTemperature
    }

    // Add extended thinking for thinking models
    if (modelInfo.thinking && this.config.modelMaxThinkingTokens) {
      requestParams.thinking = {
        type: "enabled",
        budget_tokens: this.config.modelMaxThinkingTokens,
      }
      // Cannot use temperature with thinking
      delete requestParams.temperature
    }

    // Stream the response
    const stream = await client.messages.create(requestParams)

    for await (const event of stream) {
      const chunk = processAnthropicEvent(event)
      if (chunk) {
        yield chunk
      }
    }
  }
}

// ---------- Anthropic SDK types (minimal interface) ----------

interface AnthropicClient {
  messages: {
    create(params: AnthropicCreateParams): Promise<AsyncIterable<AnthropicStreamEvent>>
  }
}

interface AnthropicCreateParams {
  model: string
  max_tokens: number
  system: AnthropicSystemContent[]
  messages: AnthropicMessage[]
  stream: boolean
  temperature?: number
  thinking?: {
    type: "enabled"
    budget_tokens: number
  }
}

interface AnthropicSystemContent {
  type: "text"
  text: string
  cache_control?: { type: "ephemeral" }
}

interface AnthropicMessage {
  role: "user" | "assistant"
  content: string | AnthropicContentBlock[]
}

type AnthropicContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string }

type AnthropicStreamEvent =
  | { type: "message_start"; message: { usage: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number } } }
  | { type: "content_block_start"; content_block: { type: string; text?: string } }
  | { type: "content_block_delta"; delta: { type: string; text?: string; thinking?: string } }
  | { type: "content_block_stop" }
  | { type: "message_delta"; usage: { output_tokens: number } }
  | { type: "message_stop" }

function createAnthropicClient(options: { apiKey: string; baseURL?: string }): AnthropicClient {
  // In a real implementation, this would use the @anthropic-ai/sdk package
  // For now, provide a stub that consumers will override
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Anthropic = require("@anthropic-ai/sdk").default
    return new Anthropic(options)
  } catch {
    throw new Error(
      "@anthropic-ai/sdk is not installed. Install it with: npm install @anthropic-ai/sdk"
    )
  }
}

function processAnthropicEvent(event: AnthropicStreamEvent): ApiStreamChunk | null {
  switch (event.type) {
    case "message_start":
      return {
        type: "usage",
        inputTokens: event.message.usage.input_tokens,
        outputTokens: event.message.usage.output_tokens,
        cacheReadTokens: event.message.usage.cache_read_input_tokens,
        cacheWriteTokens: event.message.usage.cache_creation_input_tokens,
      }

    case "content_block_delta":
      if (event.delta.type === "text_delta" && event.delta.text) {
        return { type: "text", text: event.delta.text }
      }
      if (event.delta.type === "thinking_delta" && event.delta.thinking) {
        return { type: "reasoning", text: event.delta.thinking }
      }
      return null

    case "message_delta":
      return {
        type: "usage",
        inputTokens: 0,
        outputTokens: event.usage.output_tokens,
      }

    default:
      return null
  }
}

function convertToAnthropicMessages(messages: Message[]): AnthropicMessage[] {
  return messages.map((msg) => {
    if (typeof msg.content === "string") {
      return { role: msg.role, content: msg.content }
    }

    const blocks = (msg.content as ContentBlock[]).map((block): AnthropicContentBlock => {
      switch (block.type) {
        case "text":
          return { type: "text", text: block.text }
        case "image":
          return {
            type: "image",
            source: {
              type: "base64",
              media_type: block.source.media_type,
              data: block.source.data,
            },
          }
        case "tool_use":
          return {
            type: "tool_use",
            id: block.id,
            name: block.name,
            input: block.input,
          }
        case "tool_result":
          return {
            type: "tool_result",
            tool_use_id: block.tool_use_id,
            content: typeof block.content === "string"
              ? block.content
              : JSON.stringify(block.content),
          }
      }
    })

    return { role: msg.role, content: blocks }
  })
}
