/**
 * @bkit-roo/api-client
 *
 * Multi-provider LLM API client with unified interface.
 * Supports 20+ providers through a factory pattern.
 */

import type { ApiConfiguration, ApiProvider } from "@bkit-roo/shared"
import type { ApiHandler } from "./providers/base-provider.js"
import { AnthropicProvider } from "./providers/anthropic.js"
import { OpenAiProvider } from "./providers/openai.js"
import { OpenRouterProvider } from "./providers/openrouter.js"
import { OllamaProvider } from "./providers/ollama.js"
import { GeminiProvider } from "./providers/gemini.js"

export type { ApiHandler, CreateMessageMetadata } from "./providers/base-provider.js"
export { BaseProvider } from "./providers/base-provider.js"
export { AnthropicProvider } from "./providers/anthropic.js"
export { OpenAiProvider } from "./providers/openai.js"
export { OpenRouterProvider } from "./providers/openrouter.js"
export { OllamaProvider } from "./providers/ollama.js"
export { GeminiProvider } from "./providers/gemini.js"
export * from "./transform/index.js"

/**
 * Factory function to create an API handler for the specified provider.
 * Ported from Roo Code's src/api/index.ts buildApiHandler()
 *
 * @param config - API configuration specifying provider and credentials
 * @returns An ApiHandler instance for the configured provider
 */
export function buildApiHandler(config: ApiConfiguration): ApiHandler {
  const provider = config.apiProvider ?? "anthropic"

  switch (provider) {
    case "anthropic":
      return new AnthropicProvider(config)

    case "openai":
    case "openai-native":
    case "azure":
      return new OpenAiProvider(config)

    case "openrouter":
      return new OpenRouterProvider(config)

    case "ollama":
    case "lmstudio":
      return new OllamaProvider(config)

    case "gemini":
    case "vertex":
      return new GeminiProvider(config)

    case "deepseek":
    case "mistral":
    case "groq":
    case "together":
    case "fireworks":
    case "xai":
    case "sambanova":
    case "cerebras":
    case "chutes":
    case "litellm":
    case "requesty":
    case "glama":
    case "unbound":
      // These providers use OpenAI-compatible API
      return new OpenAiProvider(config)

    case "bedrock":
      // Bedrock uses a specialized provider (TODO: implement)
      return new OpenAiProvider(config)

    default: {
      const _exhaustiveCheck: never = provider
      throw new Error(`Unknown API provider: ${provider}`)
    }
  }
}
