/**
 * Role definition section of the system prompt.
 */

import type { ModeConfig } from "@bkit-roo/shared"

/**
 * Generate the role definition section based on the current mode.
 */
export function buildRoleSection(mode: ModeConfig): string {
  return mode.roleDefinition
}
