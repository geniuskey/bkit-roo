/**
 * Custom modes manager.
 * Ported from Roo Code's src/core/config/CustomModesManager.ts
 *
 * Manages built-in and custom mode configurations with persistence.
 */

import type { ModeConfig, ModeSlug, ToolGroupEntry, IConfigStorage } from "@bkit-roo/shared"
import { codeMode } from "./builtin/code.js"
import { architectMode } from "./builtin/architect.js"
import { askMode } from "./builtin/ask.js"
import { debugMode } from "./builtin/debug.js"
import { orchestratorMode } from "./builtin/orchestrator.js"

const CUSTOM_MODES_KEY = "customModes"

/**
 * Default built-in modes ordered by priority.
 */
export const DEFAULT_MODES: readonly ModeConfig[] = [
  codeMode,
  architectMode,
  askMode,
  debugMode,
  orchestratorMode,
]

export class CustomModesManager {
  constructor(private readonly storage: IConfigStorage) {}

  /**
   * Get all built-in modes.
   */
  getBuiltinModes(): ModeConfig[] {
    return [...DEFAULT_MODES]
  }

  /**
   * Get all custom modes from storage.
   */
  async getCustomModes(): Promise<ModeConfig[]> {
    const modes = await this.storage.get<ModeConfig[]>(CUSTOM_MODES_KEY)
    return modes ?? []
  }

  /**
   * Get all modes (built-in + custom), with custom modes overriding built-in ones.
   */
  async getAllModes(): Promise<ModeConfig[]> {
    const customModes = await this.getCustomModes()
    const allModes = [...DEFAULT_MODES]

    for (const customMode of customModes) {
      const index = allModes.findIndex((m) => m.slug === customMode.slug)
      if (index !== -1) {
        allModes[index] = customMode
      } else {
        allModes.push(customMode)
      }
    }

    return allModes
  }

  /**
   * Get a specific mode by slug.
   */
  async getMode(slug: ModeSlug): Promise<ModeConfig | undefined> {
    const customModes = await this.getCustomModes()
    const customMode = customModes.find((m) => m.slug === slug)
    if (customMode) return customMode
    return DEFAULT_MODES.find((m) => m.slug === slug)
  }

  /**
   * Create a new custom mode.
   */
  async createMode(config: ModeConfig): Promise<void> {
    const customModes = await this.getCustomModes()

    if (customModes.some((m) => m.slug === config.slug)) {
      throw new Error(`Mode with slug "${config.slug}" already exists`)
    }

    customModes.push(config)
    await this.storage.set(CUSTOM_MODES_KEY, customModes)
  }

  /**
   * Update an existing custom mode.
   */
  async updateMode(slug: ModeSlug, updates: Partial<ModeConfig>): Promise<void> {
    const customModes = await this.getCustomModes()
    const index = customModes.findIndex((m) => m.slug === slug)

    if (index === -1) {
      // If it's a built-in mode, create a custom override
      const builtinMode = DEFAULT_MODES.find((m) => m.slug === slug)
      if (!builtinMode) {
        throw new Error(`Mode "${slug}" not found`)
      }
      customModes.push({ ...builtinMode, ...updates })
    } else {
      customModes[index] = { ...customModes[index]!, ...updates }
    }

    await this.storage.set(CUSTOM_MODES_KEY, customModes)
  }

  /**
   * Delete a custom mode. Cannot delete built-in modes.
   */
  async deleteMode(slug: ModeSlug): Promise<void> {
    const isBuiltin = DEFAULT_MODES.some((m) => m.slug === slug)
    if (isBuiltin) {
      throw new Error(`Cannot delete built-in mode "${slug}"`)
    }

    const customModes = await this.getCustomModes()
    const filtered = customModes.filter((m) => m.slug !== slug)
    await this.storage.set(CUSTOM_MODES_KEY, filtered)
  }

  /**
   * Check if a mode is a custom mode or custom override.
   */
  async isCustomMode(slug: ModeSlug): Promise<boolean> {
    const customModes = await this.getCustomModes()
    return customModes.some((m) => m.slug === slug)
  }

  /**
   * Get the tool groups for a specific mode.
   */
  async getModeGroups(slug: ModeSlug): Promise<ToolGroupEntry[]> {
    const mode = await this.getMode(slug)
    return mode?.groups ?? []
  }
}
