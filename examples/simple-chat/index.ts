/**
 * Simple Chat Example
 *
 * Demonstrates the most basic usage of @bkit-roo/api-client:
 * sending a message to an LLM and streaming the response.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx index.ts
 */

import { buildApiHandler } from "@bkit-roo/api-client"
import type { ApiConfiguration, Message } from "@bkit-roo/shared"

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error("Error: Set ANTHROPIC_API_KEY environment variable")
    process.exit(1)
  }

  // 1. Configure the API provider
  const config: ApiConfiguration = {
    apiProvider: "anthropic",
    apiKey,
    apiModelId: "claude-sonnet-4-20250514",
  }

  // 2. Create the API handler
  const handler = buildApiHandler(config)
  const { id, info } = handler.getModel()
  console.log(`Using model: ${id} (context: ${info.contextWindow} tokens)\n`)

  // 3. Define messages
  const messages: Message[] = [
    {
      role: "user",
      content: "Write a haiku about TypeScript.",
    },
  ]

  // 4. Stream the response
  console.log("Assistant: ")
  const stream = handler.createMessage(
    "You are a helpful assistant.",
    messages,
  )

  for await (const chunk of stream) {
    if (chunk.type === "text") {
      process.stdout.write(chunk.text)
    }
    if (chunk.type === "usage") {
      console.log(`\n\n[Tokens: ${chunk.inputTokens} input, ${chunk.outputTokens} output]`)
    }
  }
}

main().catch(console.error)
