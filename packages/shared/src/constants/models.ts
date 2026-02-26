/**
 * Known model IDs and their metadata.
 * Ported from Roo Code's model definitions.
 */

import type { ModelInfo } from "../types/api.js"

export const anthropicModels: Record<string, ModelInfo> = {
  "claude-sonnet-4-20250514": {
    maxTokens: 16384,
    contextWindow: 200_000,
    supportsImages: true,
    supportsPromptCache: true,
    inputPrice: 3.0,
    outputPrice: 15.0,
    cacheWritesPrice: 3.75,
    cacheReadsPrice: 0.3,
    thinking: true,
  },
  "claude-opus-4-20250514": {
    maxTokens: 32768,
    contextWindow: 200_000,
    supportsImages: true,
    supportsPromptCache: true,
    inputPrice: 15.0,
    outputPrice: 75.0,
    cacheWritesPrice: 18.75,
    cacheReadsPrice: 1.5,
    thinking: true,
  },
  "claude-3-7-sonnet-20250219": {
    maxTokens: 8192,
    contextWindow: 200_000,
    supportsImages: true,
    supportsPromptCache: true,
    inputPrice: 3.0,
    outputPrice: 15.0,
    cacheWritesPrice: 3.75,
    cacheReadsPrice: 0.3,
    thinking: true,
  },
  "claude-3-5-sonnet-20241022": {
    maxTokens: 8192,
    contextWindow: 200_000,
    supportsImages: true,
    supportsComputerUse: true,
    supportsPromptCache: true,
    inputPrice: 3.0,
    outputPrice: 15.0,
    cacheWritesPrice: 3.75,
    cacheReadsPrice: 0.3,
  },
  "claude-3-5-haiku-20241022": {
    maxTokens: 8192,
    contextWindow: 200_000,
    supportsImages: true,
    supportsPromptCache: true,
    inputPrice: 0.8,
    outputPrice: 4.0,
    cacheWritesPrice: 1.0,
    cacheReadsPrice: 0.08,
  },
  "claude-3-haiku-20240307": {
    maxTokens: 4096,
    contextWindow: 200_000,
    supportsImages: true,
    supportsPromptCache: true,
    inputPrice: 0.25,
    outputPrice: 1.25,
    cacheWritesPrice: 0.3,
    cacheReadsPrice: 0.03,
  },
}

export const openAiModels: Record<string, ModelInfo> = {
  "gpt-4o": {
    maxTokens: 16384,
    contextWindow: 128_000,
    supportsImages: true,
    inputPrice: 2.5,
    outputPrice: 10.0,
  },
  "gpt-4o-mini": {
    maxTokens: 16384,
    contextWindow: 128_000,
    supportsImages: true,
    inputPrice: 0.15,
    outputPrice: 0.6,
  },
  "o1": {
    maxTokens: 100_000,
    contextWindow: 200_000,
    supportsImages: true,
    inputPrice: 15.0,
    outputPrice: 60.0,
    thinking: true,
  },
  "o1-mini": {
    maxTokens: 65_536,
    contextWindow: 128_000,
    inputPrice: 1.1,
    outputPrice: 4.4,
    thinking: true,
  },
  "o3-mini": {
    maxTokens: 100_000,
    contextWindow: 200_000,
    inputPrice: 1.1,
    outputPrice: 4.4,
    thinking: true,
  },
}

export const geminiModels: Record<string, ModelInfo> = {
  "gemini-2.5-pro-preview-06-05": {
    maxTokens: 65_536,
    contextWindow: 1_048_576,
    supportsImages: true,
    inputPrice: 1.25,
    outputPrice: 10.0,
    thinking: true,
  },
  "gemini-2.5-flash-preview-05-20": {
    maxTokens: 65_536,
    contextWindow: 1_048_576,
    supportsImages: true,
    inputPrice: 0.15,
    outputPrice: 0.6,
    thinking: true,
  },
  "gemini-2.0-flash": {
    maxTokens: 8192,
    contextWindow: 1_048_576,
    supportsImages: true,
    inputPrice: 0.1,
    outputPrice: 0.4,
  },
}

export const deepSeekModels: Record<string, ModelInfo> = {
  "deepseek-chat": {
    maxTokens: 8192,
    contextWindow: 64_000,
    inputPrice: 0.14,
    outputPrice: 0.28,
    cacheReadsPrice: 0.014,
  },
  "deepseek-reasoner": {
    maxTokens: 8192,
    contextWindow: 64_000,
    inputPrice: 0.55,
    outputPrice: 2.19,
    cacheReadsPrice: 0.055,
    thinking: true,
  },
}

/**
 * Default model ID for each provider.
 */
export const defaultModelIds: Record<string, string> = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o",
  "openai-native": "gpt-4o",
  gemini: "gemini-2.5-pro-preview-06-05",
  deepseek: "deepseek-chat",
  mistral: "mistral-large-latest",
  groq: "llama-3.3-70b-versatile",
  ollama: "llama3.1",
}
