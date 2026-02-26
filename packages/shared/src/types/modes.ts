/**
 * Mode system types.
 * Ported from Roo Code's custom modes system.
 */

import type { ToolGroup } from "./tools.js"

/**
 * Built-in mode slugs.
 */
export type BuiltinModeSlug = "code" | "architect" | "ask" | "debug" | "orchestrator"

/**
 * A mode slug can be a built-in or custom string.
 */
export type ModeSlug = BuiltinModeSlug | string

/**
 * Configuration for a mode.
 */
export interface ModeConfig {
  /** Unique slug identifier */
  slug: ModeSlug
  /** Display name */
  name: string
  /** Role definition/system prompt persona */
  roleDefinition: string
  /** Allowed tool groups */
  groups: ToolGroupEntry[]
  /** Optional custom instructions */
  customInstructions?: string
  /** Optional sticky model ID (different model per mode) */
  stickyModelId?: string
}

/**
 * A tool group entry with optional file restrictions.
 */
export type ToolGroupEntry =
  | ToolGroup
  | [ToolGroup, { fileRegex?: string; description?: string }]

/**
 * Mode-aware settings that persist per mode.
 */
export interface ModeSettings {
  slug: ModeSlug
  modelId?: string
  customInstructions?: string
}
