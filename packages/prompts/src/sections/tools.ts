/**
 * Tool description section of the system prompt.
 * Generates XML-formatted tool descriptions for the LLM.
 *
 * Ported from Roo Code's src/core/prompts/sections/tools.ts
 */

import type { ToolDefinition, ToolGroup, McpToolInfo } from "@bkit-roo/shared"

/**
 * Generate the tool use section with XML tool descriptions.
 */
export function buildToolDescriptions(
  tools: ToolDefinition[],
  mcpTools?: McpToolInfo[],
): string {
  const parts: string[] = []

  parts.push("# Tools\n")
  parts.push("You have access to a set of tools you can use to accomplish tasks. Use the appropriate tool based on the task at hand.\n")
  parts.push("## Tool Use Formatting\n")
  parts.push("Tool use is formatted using XML-style tags. The tool name is enclosed in opening and closing tags, and each parameter is similarly enclosed within its own tags.\n")
  parts.push("Here's the structure:\n\n")
  parts.push("<tool_name>\n<parameter1_name>value1</parameter1_name>\n<parameter2_name>value2</parameter2_name>\n</tool_name>\n\n")
  parts.push("Always adhere to this format for all tool use to ensure proper parsing and execution.\n\n")

  // Built-in tools
  for (const tool of tools) {
    parts.push(formatToolDescription(tool))
  }

  // MCP tools
  if (mcpTools && mcpTools.length > 0) {
    parts.push("## MCP Server Tools\n\n")
    parts.push("The following tools are provided by connected MCP servers:\n\n")
    for (const mcpTool of mcpTools) {
      parts.push(formatMcpToolDescription(mcpTool))
    }
  }

  return parts.join("")
}

function formatToolDescription(tool: ToolDefinition): string {
  const lines: string[] = []
  lines.push(`## ${tool.name}\n`)
  lines.push(`Description: ${tool.description}\n`)
  lines.push("Parameters:\n")

  for (const param of tool.parameters) {
    const required = param.required ? "(required)" : "(optional)"
    lines.push(`- ${param.name} ${required}: ${param.description}\n`)
  }

  lines.push(`\nUsage:\n<${tool.name}>\n`)
  for (const param of tool.parameters) {
    lines.push(`<${param.name}>value</${param.name}>\n`)
  }
  lines.push(`</${tool.name}>\n\n`)

  return lines.join("")
}

function formatMcpToolDescription(tool: McpToolInfo): string {
  const lines: string[] = []
  lines.push(`### ${tool.name} (from ${tool.serverName})\n`)
  if (tool.description) {
    lines.push(`${tool.description}\n`)
  }
  if (tool.inputSchema) {
    lines.push(`Input Schema: ${JSON.stringify(tool.inputSchema)}\n`)
  }
  lines.push("\n")
  return lines.join("")
}

/**
 * Get tool descriptions filtered for a specific set of groups.
 */
export function getToolDescriptionsForGroups(
  allTools: ToolDefinition[],
  allowedGroups: ToolGroup[],
  mcpTools?: McpToolInfo[],
): string {
  const groupSet = new Set(allowedGroups)
  const alwaysAvailable = new Set(["ask_followup_question", "attempt_completion", "switch_mode", "new_task"])

  const filteredTools = allTools.filter((tool) => {
    if (alwaysAvailable.has(tool.name)) return true
    return groupSet.has(tool.group)
  })

  return buildToolDescriptions(filteredTools, mcpTools)
}
