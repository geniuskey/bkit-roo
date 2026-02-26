import { describe, it, expect } from "vitest"
import { calculateCost, getModelInfo, getApiMetrics, type ApiCallRecord } from "../src/index.js"

describe("calculateCost", () => {
  it("should calculate basic input/output cost", () => {
    const cost = calculateCost(
      { inputTokens: 1000, outputTokens: 500 },
      { maxTokens: 8192, contextWindow: 200_000, inputPrice: 3.0, outputPrice: 15.0 },
    )
    // (1000 * 3.0 / 1_000_000) + (500 * 15.0 / 1_000_000)
    expect(cost).toBeCloseTo(0.003 + 0.0075)
  })

  it("should handle cache read/write tokens", () => {
    const cost = calculateCost(
      { inputTokens: 1000, outputTokens: 500, cacheReadTokens: 200, cacheWriteTokens: 100 },
      {
        maxTokens: 8192,
        contextWindow: 200_000,
        inputPrice: 3.0,
        outputPrice: 15.0,
        cacheReadsPrice: 0.3,
        cacheWritesPrice: 3.75,
      },
    )
    // Regular input = 1000 - 200 - 100 = 700
    // 700 * 3.0/1M + 500 * 15.0/1M + 200 * 0.3/1M + 100 * 3.75/1M
    const expected = (700 * 3.0 + 500 * 15.0 + 200 * 0.3 + 100 * 3.75) / 1_000_000
    expect(cost).toBeCloseTo(expected)
  })

  it("should handle zero tokens", () => {
    const cost = calculateCost(
      { inputTokens: 0, outputTokens: 0 },
      { maxTokens: 8192, contextWindow: 200_000, inputPrice: 3.0, outputPrice: 15.0 },
    )
    expect(cost).toBe(0)
  })

  it("should handle models with no pricing", () => {
    const cost = calculateCost(
      { inputTokens: 1000, outputTokens: 500 },
      { maxTokens: 4096, contextWindow: 128_000 },
    )
    expect(cost).toBe(0)
  })
})

describe("getModelInfo", () => {
  it("should return info for known anthropic models", () => {
    const info = getModelInfo("anthropic", "claude-sonnet-4-20250514")
    expect(info).toBeDefined()
    expect(info!.contextWindow).toBe(200_000)
  })

  it("should return undefined for unknown models", () => {
    const info = getModelInfo("anthropic", "nonexistent-model")
    expect(info).toBeUndefined()
  })

  it("should return undefined for unknown providers", () => {
    const info = getModelInfo("unknown" as any, "model")
    expect(info).toBeUndefined()
  })
})

describe("getApiMetrics", () => {
  it("should aggregate metrics from records", () => {
    const records: ApiCallRecord[] = [
      { timestamp: 1000, provider: "anthropic", modelId: "claude", usage: { inputTokens: 100, outputTokens: 50 }, cost: 0.01, durationMs: 500 },
      { timestamp: 2000, provider: "anthropic", modelId: "claude", usage: { inputTokens: 200, outputTokens: 100 }, cost: 0.02, durationMs: 1000 },
      { timestamp: 3000, provider: "openai", modelId: "gpt-4o", usage: { inputTokens: 300, outputTokens: 150 }, cost: 0.03, durationMs: 750 },
    ]

    const metrics = getApiMetrics(records)

    expect(metrics.totalRequests).toBe(3)
    expect(metrics.totalCost).toBeCloseTo(0.06)
    expect(metrics.totalInputTokens).toBe(600)
    expect(metrics.totalOutputTokens).toBe(300)
    expect(metrics.averageDurationMs).toBeCloseTo(750)
    expect(metrics.costByProvider["anthropic"]).toBeCloseTo(0.03)
    expect(metrics.costByProvider["openai"]).toBeCloseTo(0.03)
  })

  it("should handle empty records", () => {
    const metrics = getApiMetrics([])
    expect(metrics.totalRequests).toBe(0)
    expect(metrics.totalCost).toBe(0)
    expect(metrics.averageDurationMs).toBe(0)
  })
})
