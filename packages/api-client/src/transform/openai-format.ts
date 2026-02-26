/**
 * Message format conversion between Anthropic and OpenAI formats.
 * Ported from Roo Code's src/api/transform/openai-format.ts
 */

import type { Message, ContentBlock } from "@bkit-roo/shared"

/**
 * OpenAI chat completion message format.
 */
export interface OpenAiMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string | OpenAiContentPart[] | null
  tool_calls?: OpenAiToolCall[]
  tool_call_id?: string
  name?: string
}

export interface OpenAiContentPart {
  type: "text" | "image_url"
  text?: string
  image_url?: { url: string; detail?: string }
}

export interface OpenAiToolCall {
  id: string
  type: "function"
  function: {
    name: string
    arguments: string
  }
}

/**
 * Convert Anthropic-format messages to OpenAI chat completion format.
 */
export function convertToOpenAiMessages(messages: Message[]): OpenAiMessage[] {
  const result: OpenAiMessage[] = []

  for (const message of messages) {
    if (typeof message.content === "string") {
      result.push({
        role: message.role === "user" ? "user" : "assistant",
        content: message.content,
      })
      continue
    }

    // Handle content blocks
    const blocks = message.content as ContentBlock[]

    if (message.role === "assistant") {
      // Check for tool_use blocks
      const toolUseBlocks = blocks.filter((b) => b.type === "tool_use")
      const textBlocks = blocks.filter((b) => b.type === "text")

      const textContent = textBlocks
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("")

      if (toolUseBlocks.length > 0) {
        const toolCalls: OpenAiToolCall[] = toolUseBlocks.map((b) => {
          const tu = b as { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
          return {
            id: tu.id,
            type: "function" as const,
            function: {
              name: tu.name,
              arguments: JSON.stringify(tu.input),
            },
          }
        })

        result.push({
          role: "assistant",
          content: textContent || null,
          tool_calls: toolCalls,
        })
      } else {
        result.push({
          role: "assistant",
          content: textContent,
        })
      }
    } else {
      // User message
      const toolResultBlocks = blocks.filter((b) => b.type === "tool_result")

      if (toolResultBlocks.length > 0) {
        // Tool results become separate tool messages
        for (const block of toolResultBlocks) {
          const tr = block as { type: "tool_result"; tool_use_id: string; content: string | ContentBlock[] }
          const content = typeof tr.content === "string"
            ? tr.content
            : tr.content.map((c) => (c as { text: string }).text).join("")

          result.push({
            role: "tool",
            tool_call_id: tr.tool_use_id,
            content,
          })
        }
      }

      // Also add any text blocks
      const textBlocks = blocks.filter((b) => b.type === "text")
      if (textBlocks.length > 0) {
        const parts: OpenAiContentPart[] = []

        for (const block of blocks) {
          if (block.type === "text") {
            parts.push({ type: "text", text: block.text })
          } else if (block.type === "image") {
            const img = block as { type: "image"; source: { type: "base64"; media_type: string; data: string } }
            parts.push({
              type: "image_url",
              image_url: {
                url: `data:${img.source.media_type};base64,${img.source.data}`,
              },
            })
          }
        }

        if (parts.length > 0) {
          result.push({
            role: "user",
            content: parts,
          })
        }
      }
    }
  }

  return result
}

/**
 * Convert tool definitions to OpenAI function calling format.
 */
export interface OpenAiToolDefinition {
  type: "function"
  function: {
    name: string
    description: string
    parameters: {
      type: "object"
      properties: Record<string, { type: string; description: string }>
      required: string[]
    }
    strict?: boolean
  }
}
