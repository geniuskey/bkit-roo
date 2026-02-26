/**
 * Message history persistence.
 */

import type { Message, IConfigStorage } from "@bkit-roo/shared"

const HISTORY_PREFIX = "task_history_"

/**
 * Manages saving and loading conversation history.
 */
export class MessageHistory {
  constructor(private readonly storage: IConfigStorage) {}

  /**
   * Save messages for a task.
   */
  async save(taskId: string, messages: Message[]): Promise<void> {
    await this.storage.set(`${HISTORY_PREFIX}${taskId}`, messages)
  }

  /**
   * Load messages for a task.
   */
  async load(taskId: string): Promise<Message[]> {
    const messages = await this.storage.get<Message[]>(`${HISTORY_PREFIX}${taskId}`)
    return messages ?? []
  }

  /**
   * Delete messages for a task.
   */
  async delete(taskId: string): Promise<void> {
    await this.storage.delete(`${HISTORY_PREFIX}${taskId}`)
  }

  /**
   * List all task IDs that have saved history.
   */
  async listTasks(): Promise<string[]> {
    const keys = await this.storage.keys()
    return keys
      .filter((k) => k.startsWith(HISTORY_PREFIX))
      .map((k) => k.slice(HISTORY_PREFIX.length))
  }
}
