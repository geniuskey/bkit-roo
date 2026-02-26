/**
 * Tool group definitions and their associated tools.
 * Ported from Roo Code's tool group system.
 */

import type { ToolGroup, ToolName } from "../types/tools.js"

/**
 * Mapping of tool groups to their tool names.
 */
export const toolsByGroup: Record<ToolGroup, ToolName[]> = {
  read: [
    "read_file",
    "search_files",
    "list_files",
    "list_code_definition_names",
  ],
  edit: [
    "write_to_file",
    "apply_diff",
    "insert_content",
    "search_and_replace",
  ],
  command: [
    "execute_command",
  ],
  mcp: [
    "use_mcp_tool",
    "access_mcp_resource",
  ],
  browser: [
    "browser_action",
  ],
}

/**
 * Tools available in every mode regardless of group permissions.
 * These are "meta" tools for conversation flow.
 */
export const alwaysAvailableTools: ToolName[] = [
  "ask_followup_question",
  "attempt_completion",
  "switch_mode",
  "new_task",
]

/**
 * Get all tool names allowed by a set of tool groups.
 */
export function getToolsForGroups(groups: ToolGroup[]): ToolName[] {
  const tools = new Set<ToolName>(alwaysAvailableTools)
  for (const group of groups) {
    const groupTools = toolsByGroup[group]
    if (groupTools) {
      for (const tool of groupTools) {
        tools.add(tool)
      }
    }
  }
  return [...tools]
}
