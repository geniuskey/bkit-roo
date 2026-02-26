/**
 * API provider identifiers supported by bkit-roo.
 * Ported from Roo Code's src/shared/api.ts
 */
export type ApiProvider =
  | "anthropic"
  | "openai"
  | "openai-native"
  | "openrouter"
  | "bedrock"
  | "vertex"
  | "gemini"
  | "deepseek"
  | "mistral"
  | "ollama"
  | "lmstudio"
  | "vscode-lm"
  | "litellm"
  | "requesty"
  | "together"
  | "fireworks"
  | "groq"
  | "chutes"
  | "xai"
  | "sambanova"
  | "cerebras"
  | "azure"
  | "glama"
  | "unbound"

/**
 * Configuration for connecting to an API provider.
 */
export interface ApiConfiguration {
  apiProvider?: ApiProvider

  // Anthropic
  apiKey?: string
  apiModelId?: string
  anthropicBaseUrl?: string

  // OpenAI-compatible
  openAiApiKey?: string
  openAiBaseUrl?: string
  openAiModelId?: string
  openAiNativeApiKey?: string

  // OpenRouter
  openRouterApiKey?: string
  openRouterModelId?: string
  openRouterBaseUrl?: string

  // AWS Bedrock
  awsRegion?: string
  awsAccessKey?: string
  awsSecretKey?: string
  awsSessionToken?: string
  awsProfile?: string
  awsUseCrossRegionInference?: boolean

  // GCP Vertex
  vertexProjectId?: string
  vertexRegion?: string

  // Google Gemini
  geminiApiKey?: string

  // Azure
  azureApiVersion?: string
  azureDeploymentName?: string

  // DeepSeek
  deepSeekApiKey?: string
  deepSeekBaseUrl?: string

  // Mistral
  mistralApiKey?: string

  // Ollama
  ollamaBaseUrl?: string
  ollamaModelId?: string

  // LM Studio
  lmStudioBaseUrl?: string
  lmStudioModelId?: string

  // Other providers
  litellmBaseUrl?: string
  litellmApiKey?: string
  litellmModelId?: string
  requestyApiKey?: string
  requestyModelId?: string
  togetherApiKey?: string
  togetherModelId?: string
  fireworksApiKey?: string
  fireworksModelId?: string
  groqApiKey?: string
  groqModelId?: string
  chutesApiKey?: string
  chutesModelId?: string
  xaiApiKey?: string
  xaiModelId?: string
  sambanovaApiKey?: string
  sambanovaModelId?: string
  cerebrasApiKey?: string
  cerebrasModelId?: string
  glamaApiKey?: string
  glamaModelId?: string
  unboundApiKey?: string
  unboundModelId?: string

  // Model parameters
  modelTemperature?: number | null
  modelMaxTokens?: number
  modelMaxThinkingTokens?: number
  includeMaxTokens?: boolean
}

/**
 * Metadata about an AI model.
 */
export interface ModelInfo {
  maxTokens: number
  contextWindow: number
  supportsImages?: boolean
  supportsComputerUse?: boolean
  supportsPromptCache?: boolean
  inputPrice?: number // per million tokens
  outputPrice?: number // per million tokens
  cacheWritesPrice?: number // per million tokens
  cacheReadsPrice?: number // per million tokens
  description?: string
  thinking?: boolean
  supportsStreaming?: boolean
}

/**
 * A stream event from an API provider.
 */
export type ApiStreamEvent =
  | { type: "text"; text: string }
  | { type: "reasoning"; text: string }
  | { type: "usage"; inputTokens: number; outputTokens: number; cacheReadTokens?: number; cacheWriteTokens?: number; totalCost?: number }

/**
 * An async generator that yields API stream events.
 */
export type ApiStream = AsyncGenerator<ApiStreamEvent>

/**
 * Token usage information for an API call.
 */
export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  cacheReadTokens?: number
  cacheWriteTokens?: number
}
