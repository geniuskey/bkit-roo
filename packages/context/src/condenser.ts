/**
 * Context condenser - summarizes conversation history to save tokens.
 * Ported from Roo Code's src/core/condense/index.ts
 *
 * When the conversation grows too large for the context window,
 * older messages are summarized into a compact form.
 */

import type { Message } from "@bkit-roo/shared"
import type { ApiHandler } from "@bkit-roo/api-client"

/**
 * Result of a condensation operation.
 */
export interface CondenseResult {
  /** The condensed messages */
  messages: Message[]
  /** Summary of what was condensed */
  summary: string
  /** Token count before condensation */
  tokensBefore: number
  /** Token count after condensation */
  tokensAfter: number
}

/**
 * Condense older messages in the conversation into a summary.
 */
export async function condenseMessages(
  messages: Message[],
  apiHandler: ApiHandler,
  options?: {
    /** Number of recent messages to preserve without condensing */
    keepRecentCount?: number
    /** Custom condensation prompt */
    condensationPrompt?: string
  },
): Promise<CondenseResult> {
  const keepCount = options?.keepRecentCount ?? 4
  const prompt = options?.condensationPrompt ?? DEFAULT_CONDENSATION_PROMPT

  if (messages.length <= keepCount) {
    return {
      messages,
      summary: "No condensation needed",
      tokensBefore: 0,
      tokensAfter: 0,
    }
  }

  // Split messages: older ones to condense, recent ones to keep
  const toCondense = messages.slice(0, messages.length - keepCount)
  const toKeep = messages.slice(messages.length - keepCount)

  // Build the condensation text
  const condensationText = toCondense
    .map((msg) => {
      const content = typeof msg.content === "string"
        ? msg.content
        : msg.content
            .filter((b) => b.type === "text")
            .map((b) => (b as { text: string }).text)
            .join("\n")
      return `[${msg.role}]: ${content}`
    })
    .join("\n\n")

  // Use the API to generate a summary
  const summaryPrompt = `${prompt}\n\n---\n\n${condensationText}`

  let summary = ""
  const stream = apiHandler.createMessage(
    "You are a helpful assistant that summarizes conversations concisely.",
    [{ role: "user", content: summaryPrompt }],
  )

  for await (const chunk of stream) {
    if (chunk.type === "text") {
      summary += chunk.text
    }
  }

  // Create condensed message history
  const condensedMessages: Message[] = [
    {
      role: "user",
      content: `[Previous conversation summary]: ${summary}`,
      ts: toCondense[0]?.ts,
    },
    {
      role: "assistant",
      content: "I understand the context from our previous conversation. Let me continue from where we left off.",
      ts: toCondense[0]?.ts,
    },
    ...toKeep,
  ]

  return {
    messages: condensedMessages,
    summary,
    tokensBefore: condensationText.length / 4,
    tokensAfter: summary.length / 4,
  }
}

const DEFAULT_CONDENSATION_PROMPT = `Please provide a concise summary of the following conversation between a user and an AI assistant.
Focus on:
1. The main task or goal being worked on
2. Key decisions made
3. Important code changes or file modifications
4. Current state of progress
5. Any unresolved issues or next steps

Keep the summary compact but comprehensive enough to continue the conversation.`
