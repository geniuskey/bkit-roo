/**
 * Main system prompt generator.
 * Ported from Roo Code's src/core/prompts/system.ts (GENERATE_SYSTEM_PROMPT)
 *
 * Assembles the complete system prompt from sections.
 */

import type { ModeConfig, ToolGroup, McpToolInfo } from "@bkit-roo/shared"
import type { ToolDefinition } from "@bkit-roo/shared"
import { buildRoleSection } from "./sections/role.js"
import { getToolDescriptionsForGroups } from "./sections/tools.js"
import { buildCapabilitiesSection } from "./sections/capabilities.js"
import { buildRulesSection } from "./sections/rules.js"
import { buildCustomInstructionsSection } from "./sections/custom.js"

/**
 * Context for generating a system prompt.
 */
export interface PromptGenerationContext {
  /** Current mode configuration */
  mode: ModeConfig
  /** All available tool definitions */
  tools: ToolDefinition[]
  /** MCP tools available from connected servers */
  mcpTools?: McpToolInfo[]
  /** User-provided custom instructions */
  customInstructions?: string
  /** Project-level rules (from .roo/rules files) */
  projectRules?: string[]
  /** Current working directory */
  cwd: string
  /** Operating system info */
  osInfo?: string
  /** Shell info */
  shellInfo?: string
}

/**
 * Generate a complete system prompt for the LLM.
 */
export function generateSystemPrompt(ctx: PromptGenerationContext): string {
  const sections: string[] = []

  // 1. Role definition
  sections.push(buildRoleSection(ctx.mode))

  // 2. System information
  sections.push(buildSystemInfoSection(ctx))

  // 3. Capabilities
  const activeGroups = extractGroups(ctx.mode)
  sections.push(buildCapabilitiesSection(activeGroups))

  // 4. Tool descriptions (filtered by mode)
  sections.push(getToolDescriptionsForGroups(ctx.tools, activeGroups, ctx.mcpTools))

  // 5. Rules
  sections.push(buildRulesSection())

  // 6. Custom instructions and project rules
  const customSection = buildCustomInstructionsSection(ctx.customInstructions, ctx.projectRules)
  if (customSection.trim()) {
    sections.push(customSection)
  }

  // 7. Mode-specific custom instructions
  if (ctx.mode.customInstructions) {
    sections.push(`# Mode-Specific Instructions\n\n${ctx.mode.customInstructions}`)
  }

  return sections.join("\n\n")
}

function buildSystemInfoSection(ctx: PromptGenerationContext): string {
  const lines = ["# System Information\n"]
  lines.push(`- Working Directory: ${ctx.cwd}`)
  if (ctx.osInfo) {
    lines.push(`- Operating System: ${ctx.osInfo}`)
  }
  if (ctx.shellInfo) {
    lines.push(`- Shell: ${ctx.shellInfo}`)
  }
  return lines.join("\n")
}

function extractGroups(mode: ModeConfig): ToolGroup[] {
  return mode.groups.map((g) => {
    if (typeof g === "string") return g
    return g[0]
  })
}
