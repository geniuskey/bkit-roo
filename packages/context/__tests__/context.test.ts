import { describe, it, expect } from "vitest"
import { InMemoryConfigStorage } from "@bkit-roo/shared"
import type { Message, ModelInfo } from "@bkit-roo/shared"
import {
  calculateBudget,
  truncateHistory,
  estimateTokens,
  estimateMessageTokens,
  MessageHistory,
} from "../src/index.js"

describe("estimateTokens", () => {
  it("should estimate tokens based on character count", () => {
    // ~4 chars per token
    expect(estimateTokens("hello")).toBe(2) // ceil(5/4) = 2
    expect(estimateTokens("a".repeat(100))).toBe(25) // ceil(100/4) = 25
    expect(estimateTokens("")).toBe(0)
  })
})

describe("estimateMessageTokens", () => {
  it("should estimate tokens for string content", () => {
    const msg: Message = { role: "user", content: "Hello world" }
    const tokens = estimateMessageTokens(msg)
    expect(tokens).toBeGreaterThan(0)
  })

  it("should estimate tokens for content blocks", () => {
    const msg: Message = {
      role: "assistant",
      content: [
        { type: "text", text: "Let me help" },
        { type: "text", text: "Here is the code" },
      ],
    }
    const tokens = estimateMessageTokens(msg)
    expect(tokens).toBeGreaterThan(0)
  })
})

describe("calculateBudget", () => {
  const modelInfo: ModelInfo = {
    maxTokens: 8192,
    contextWindow: 200_000,
  }

  it("should calculate budget correctly", () => {
    const messages: Message[] = [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
    ]

    const budget = calculateBudget(modelInfo, "System prompt", messages)
    expect(budget.contextWindow).toBe(200_000)
    expect(budget.reservedForResponse).toBe(8192)
    expect(budget.systemPromptTokens).toBeGreaterThan(0)
    expect(budget.historyTokens).toBeGreaterThan(0)
    expect(budget.available).toBeGreaterThan(0)
    expect(budget.isOverBudget).toBe(false)
  })

  it("should detect over-budget situations", () => {
    const tinyModel: ModelInfo = {
      maxTokens: 100,
      contextWindow: 200, // very small
    }
    const longMessage = "a".repeat(1000)
    const messages: Message[] = [{ role: "user", content: longMessage }]

    const budget = calculateBudget(tinyModel, "System prompt", messages)
    expect(budget.isOverBudget).toBe(true)
  })
})

describe("truncateHistory", () => {
  const modelInfo: ModelInfo = {
    maxTokens: 100,
    contextWindow: 500,
  }

  it("should not truncate when under budget", () => {
    const messages: Message[] = [
      { role: "user", content: "Hi" },
      { role: "assistant", content: "Hello" },
    ]
    const result = truncateHistory(messages, modelInfo, "System prompt")
    expect(result).toHaveLength(2)
  })

  it("should truncate oldest messages when over budget", () => {
    const messages: Message[] = Array.from({ length: 20 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: "a".repeat(100),
    }))

    const result = truncateHistory(messages, modelInfo, "System prompt")
    expect(result.length).toBeLessThan(messages.length)
  })
})

describe("MessageHistory", () => {
  it("should save and load messages", async () => {
    const storage = new InMemoryConfigStorage()
    const history = new MessageHistory(storage)

    const messages: Message[] = [
      { role: "user", content: "Hello", ts: 1000 },
      { role: "assistant", content: "Hi!", ts: 1001 },
    ]

    await history.save("task-1", messages)
    const loaded = await history.load("task-1")
    expect(loaded).toEqual(messages)
  })

  it("should return empty array for unknown tasks", async () => {
    const storage = new InMemoryConfigStorage()
    const history = new MessageHistory(storage)

    const loaded = await history.load("nonexistent")
    expect(loaded).toEqual([])
  })

  it("should list task IDs", async () => {
    const storage = new InMemoryConfigStorage()
    const history = new MessageHistory(storage)

    await history.save("task-1", [])
    await history.save("task-2", [])

    const tasks = await history.listTasks()
    expect(tasks.sort()).toEqual(["task-1", "task-2"])
  })

  it("should delete task history", async () => {
    const storage = new InMemoryConfigStorage()
    const history = new MessageHistory(storage)

    await history.save("task-1", [{ role: "user", content: "Hi" }])
    await history.delete("task-1")
    const loaded = await history.load("task-1")
    expect(loaded).toEqual([])
  })
})
