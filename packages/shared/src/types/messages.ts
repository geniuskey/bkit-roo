/**
 * Message types compatible with Anthropic's message format.
 * Ported from Roo Code's message handling system.
 */

export type MessageRole = "user" | "assistant"

export interface TextContent {
  type: "text"
  text: string
}

export interface ImageContent {
  type: "image"
  source: {
    type: "base64"
    media_type: string
    data: string
  }
}

export interface ToolUseContent {
  type: "tool_use"
  id: string
  name: string
  input: Record<string, unknown>
}

export interface ToolResultContent {
  type: "tool_result"
  tool_use_id: string
  content: string | ContentBlock[]
  is_error?: boolean
}

export type ContentBlock = TextContent | ImageContent | ToolUseContent | ToolResultContent

export interface Message {
  role: MessageRole
  content: string | ContentBlock[]
  ts?: number
}

/**
 * A parsed block from an assistant message (XML-based tool protocol).
 */
export type AssistantMessageBlock =
  | { type: "text"; content: string }
  | { type: "tool_use"; name: string; params: Record<string, string>; partial?: boolean }

/**
 * Result of parsing an assistant message.
 */
export interface ParsedAssistantMessage {
  blocks: AssistantMessageBlock[]
}

/**
 * Conversation turn containing a user message and the assistant's response.
 */
export interface ConversationTurn {
  userMessage: Message
  assistantMessage: Message
  tokensUsed?: TokenUsageInfo
  cost?: number
  timestamp: number
}

export interface TokenUsageInfo {
  inputTokens: number
  outputTokens: number
  cacheReadTokens?: number
  cacheWriteTokens?: number
}
