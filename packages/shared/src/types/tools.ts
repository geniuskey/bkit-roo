/**
 * Tool definition types for the bkit-roo tool system.
 * Ported from Roo Code's tool definitions.
 */

/**
 * Tool group categories.
 * - read: File reading, listing, searching
 * - edit: File modification and creation
 * - command: Terminal command execution
 * - mcp: Model Context Protocol server interactions
 * - browser: Browser-based actions (optional, platform-dependent)
 */
export type ToolGroup = "read" | "edit" | "command" | "mcp" | "browser"

/**
 * All available tool names.
 */
export type ToolName =
  | "execute_command"
  | "read_file"
  | "write_to_file"
  | "apply_diff"
  | "insert_content"
  | "search_and_replace"
  | "search_files"
  | "list_files"
  | "list_code_definition_names"
  | "browser_action"
  | "use_mcp_tool"
  | "access_mcp_resource"
  | "ask_followup_question"
  | "attempt_completion"
  | "switch_mode"
  | "new_task"

/**
 * A parameter for a tool.
 */
export interface ToolParameter {
  name: string
  type: "string" | "number" | "boolean"
  description: string
  required: boolean
}

/**
 * A complete tool definition.
 */
export interface ToolDefinition {
  name: ToolName
  group: ToolGroup
  description: string
  parameters: ToolParameter[]
}

/**
 * Result of a tool execution.
 */
export type ToolExecutionResult =
  | { success: true; output: string; images?: string[] }
  | { success: false; error: string }
  | { denied: true; reason: string }

/**
 * Mapping of tool groups to their allowed tool names.
 */
export type ToolGroupPermissions = Record<ToolGroup, boolean>
