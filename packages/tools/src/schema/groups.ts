/**
 * Tool group configuration and filtering.
 * Ported from Roo Code's tool group system.
 */

import type { ToolGroup, ToolName, ToolGroupPermissions } from "@bkit-roo/shared"
import { alwaysAvailableTools } from "@bkit-roo/shared"
import { toolDefinitions } from "./definitions.js"

/**
 * Get all tool definitions for a set of allowed groups.
 */
export function getToolsForGroups(groups: ToolGroup[]): typeof toolDefinitions {
  const allowedGroups = new Set(groups)
  const alwaysAvailable = new Set(alwaysAvailableTools)

  return toolDefinitions.filter((tool) => {
    if (alwaysAvailable.has(tool.name)) return true
    return allowedGroups.has(tool.group)
  })
}

/**
 * Check if a tool is allowed given a set of group permissions.
 */
export function isToolAllowed(toolName: ToolName, permissions: ToolGroupPermissions): boolean {
  if (alwaysAvailableTools.includes(toolName)) return true

  const tool = toolDefinitions.find((t) => t.name === toolName)
  if (!tool) return false

  return permissions[tool.group] ?? false
}

/**
 * Create ToolGroupPermissions from a list of allowed groups.
 */
export function createPermissions(allowedGroups: ToolGroup[]): ToolGroupPermissions {
  const set = new Set(allowedGroups)
  return {
    read: set.has("read"),
    edit: set.has("edit"),
    command: set.has("command"),
    mcp: set.has("mcp"),
    browser: set.has("browser"),
  }
}
