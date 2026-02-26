/**
 * Token pricing data and lookup utilities.
 */

import type { ApiProvider, ModelInfo, TokenUsage } from "@bkit-roo/shared"
import {
  anthropicModels,
  openAiModels,
  geminiModels,
  deepSeekModels,
} from "@bkit-roo/shared"

/**
 * Get model info (including pricing) for a given provider and model ID.
 */
export function getModelInfo(provider: ApiProvider, modelId: string): ModelInfo | undefined {
  const registry = modelRegistries[provider]
  if (!registry) return undefined
  return registry[modelId]
}

const modelRegistries: Partial<Record<ApiProvider, Record<string, ModelInfo>>> = {
  anthropic: anthropicModels,
  openai: openAiModels,
  "openai-native": openAiModels,
  gemini: geminiModels,
  deepseek: deepSeekModels,
}

/**
 * Register additional models for a provider (extensibility).
 */
export function registerModels(provider: ApiProvider, models: Record<string, ModelInfo>): void {
  const existing = modelRegistries[provider] ?? {}
  modelRegistries[provider] = { ...existing, ...models }
}

/**
 * Calculate the cost of an API call based on token usage and model pricing.
 * Prices are per million tokens.
 */
export function calculateCost(usage: TokenUsage, modelInfo: ModelInfo): number {
  const inputPrice = modelInfo.inputPrice ?? 0
  const outputPrice = modelInfo.outputPrice ?? 0
  const cacheReadPrice = modelInfo.cacheReadsPrice ?? 0
  const cacheWritePrice = modelInfo.cacheWritesPrice ?? 0

  let cost = 0

  // Regular input tokens (non-cached)
  const regularInputTokens = usage.inputTokens - (usage.cacheReadTokens ?? 0) - (usage.cacheWriteTokens ?? 0)
  cost += Math.max(0, regularInputTokens) * (inputPrice / 1_000_000)

  // Output tokens
  cost += usage.outputTokens * (outputPrice / 1_000_000)

  // Cache read tokens
  if (usage.cacheReadTokens) {
    cost += usage.cacheReadTokens * (cacheReadPrice / 1_000_000)
  }

  // Cache write tokens
  if (usage.cacheWriteTokens) {
    cost += usage.cacheWriteTokens * (cacheWritePrice / 1_000_000)
  }

  return cost
}
