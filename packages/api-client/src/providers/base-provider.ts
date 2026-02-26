/**
 * Base provider abstract class.
 * All API providers extend this to implement the unified ApiHandler interface.
 *
 * Ported from Roo Code's src/api/providers/base-provider.ts
 */

import type { ApiConfiguration, ModelInfo, Message } from "@bkit-roo/shared"
import type { ApiStream } from "../transform/stream.js"

/**
 * Metadata about a message creation request.
 */
export interface CreateMessageMetadata {
  taskId?: string
  mode?: string
}

/**
 * The unified API handler interface that all providers must implement.
 */
export interface ApiHandler {
  /**
   * Create a streaming message from the LLM.
   * @param systemPrompt - System prompt for the conversation
   * @param messages - Conversation message history
   * @param metadata - Optional metadata about the request
   */
  createMessage(
    systemPrompt: string,
    messages: Message[],
    metadata?: CreateMessageMetadata,
  ): ApiStream

  /**
   * Get the current model ID and its info.
   */
  getModel(): { id: string; info: ModelInfo }

  /**
   * Simple prompt completion (non-streaming, non-chat).
   * Not all providers support this.
   */
  completePrompt?(prompt: string): Promise<string>
}

/**
 * Abstract base class for API providers.
 */
export abstract class BaseProvider implements ApiHandler {
  protected config: ApiConfiguration

  constructor(config: ApiConfiguration) {
    this.config = config
  }

  abstract createMessage(
    systemPrompt: string,
    messages: Message[],
    metadata?: CreateMessageMetadata,
  ): ApiStream

  abstract getModel(): { id: string; info: ModelInfo }
}
