/**
 * API metrics aggregation.
 */

import type { TokenUsage } from "@bkit-roo/shared"

/**
 * Record of a single API call for metrics tracking.
 */
export interface ApiCallRecord {
  timestamp: number
  provider: string
  modelId: string
  usage: TokenUsage
  cost: number
  durationMs: number
}

/**
 * Aggregated API metrics.
 */
export interface ApiMetrics {
  totalCost: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCacheReadTokens: number
  totalCacheWriteTokens: number
  totalRequests: number
  averageDurationMs: number
  costByProvider: Record<string, number>
  costByModel: Record<string, number>
}

/**
 * Aggregate API call records into metrics.
 */
export function getApiMetrics(records: ApiCallRecord[]): ApiMetrics {
  const metrics: ApiMetrics = {
    totalCost: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCacheReadTokens: 0,
    totalCacheWriteTokens: 0,
    totalRequests: records.length,
    averageDurationMs: 0,
    costByProvider: {},
    costByModel: {},
  }

  let totalDuration = 0

  for (const record of records) {
    metrics.totalCost += record.cost
    metrics.totalInputTokens += record.usage.inputTokens
    metrics.totalOutputTokens += record.usage.outputTokens
    metrics.totalCacheReadTokens += record.usage.cacheReadTokens ?? 0
    metrics.totalCacheWriteTokens += record.usage.cacheWriteTokens ?? 0
    totalDuration += record.durationMs

    metrics.costByProvider[record.provider] = (metrics.costByProvider[record.provider] ?? 0) + record.cost
    metrics.costByModel[record.modelId] = (metrics.costByModel[record.modelId] ?? 0) + record.cost
  }

  metrics.averageDurationMs = records.length > 0 ? totalDuration / records.length : 0

  return metrics
}
