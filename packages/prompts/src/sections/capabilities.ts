/**
 * Capabilities section of the system prompt.
 */

import type { ToolGroup } from "@bkit-roo/shared"

/**
 * Generate the capabilities section based on active tool groups.
 */
export function buildCapabilitiesSection(activeGroups: ToolGroup[]): string {
  const groupSet = new Set(activeGroups)
  const capabilities: string[] = []

  capabilities.push("# Capabilities\n")

  if (groupSet.has("read")) {
    capabilities.push("- Read files, search code, and explore the project structure")
  }
  if (groupSet.has("edit")) {
    capabilities.push("- Create and modify files with precise diffs")
  }
  if (groupSet.has("command")) {
    capabilities.push("- Execute terminal commands to build, test, and run code")
  }
  if (groupSet.has("mcp")) {
    capabilities.push("- Use MCP server tools and access MCP resources")
  }
  if (groupSet.has("browser")) {
    capabilities.push("- Interact with web browsers to test and verify changes")
  }

  capabilities.push("- Ask follow-up questions to gather more context")
  capabilities.push("- Switch between modes for different types of tasks")

  return capabilities.join("\n")
}
