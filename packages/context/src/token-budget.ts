/**
 * Token budget management.
 * Ported from Roo Code's src/core/context-management/index.ts
 *
 * Calculates and manages token budgets to keep conversations
 * within the model's context window.
 */

import type { ModelInfo, Message, ContentBlock } from "@bkit-roo/shared"

/**
 * Token budget information.
 */
export interface TokenBudget {
  /** Maximum context window size */
  contextWindow: number
  /** Tokens used by the system prompt */
  systemPromptTokens: number
  /** Tokens used by conversation history */
  historyTokens: number
  /** Tokens reserved for the model's response */
  reservedForResponse: number
  /** Remaining tokens available */
  available: number
  /** Whether the budget is exceeded */
  isOverBudget: boolean
}

/**
 * Estimate token count for a string.
 * Simple estimation: ~4 characters per token (approximation).
 * For production use, consider using tiktoken or the provider's tokenizer.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Estimate token count for a message.
 */
export function estimateMessageTokens(message: Message): number {
  if (typeof message.content === "string") {
    return estimateTokens(message.content) + 4 // +4 for role overhead
  }

  let tokens = 4 // role overhead
  for (const block of message.content as ContentBlock[]) {
    switch (block.type) {
      case "text":
        tokens += estimateTokens(block.text)
        break
      case "image":
        tokens += 1000 // rough estimate for image tokens
        break
      case "tool_use":
        tokens += estimateTokens(block.name) + estimateTokens(JSON.stringify(block.input))
        break
      case "tool_result":
        tokens += typeof block.content === "string"
          ? estimateTokens(block.content)
          : estimateTokens(JSON.stringify(block.content))
        break
    }
  }

  return tokens
}

/**
 * Calculate the token budget for a conversation.
 */
export function calculateBudget(
  modelInfo: ModelInfo,
  systemPrompt: string,
  messages: Message[],
): TokenBudget {
  const contextWindow = modelInfo.contextWindow
  const systemPromptTokens = estimateTokens(systemPrompt)
  const historyTokens = messages.reduce((sum, msg) => sum + estimateMessageTokens(msg), 0)
  const reservedForResponse = modelInfo.maxTokens

  const available = contextWindow - systemPromptTokens - historyTokens - reservedForResponse

  return {
    contextWindow,
    systemPromptTokens,
    historyTokens,
    reservedForResponse,
    available,
    isOverBudget: available < 0,
  }
}

/**
 * Truncate message history to fit within the token budget.
 * Removes oldest messages first (keeping the most recent context).
 */
export function truncateHistory(
  messages: Message[],
  modelInfo: ModelInfo,
  systemPrompt: string,
): Message[] {
  const budget = calculateBudget(modelInfo, systemPrompt, messages)

  if (!budget.isOverBudget) {
    return messages
  }

  // Remove messages from the beginning (oldest) until we're under budget
  const result = [...messages]
  while (result.length > 2) { // Keep at least the last exchange
    const budget = calculateBudget(modelInfo, systemPrompt, result)
    if (!budget.isOverBudget) break
    result.shift()
  }

  return result
}
