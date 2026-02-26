/**
 * Tool definitions - schema for all available tools.
 * Ported from Roo Code's tool definition system.
 */

import type { ToolDefinition, ToolParameter } from "@bkit-roo/shared"

function param(name: string, description: string, required = true, type: "string" | "number" | "boolean" = "string"): ToolParameter {
  return { name, type, description, required }
}

export const toolDefinitions: ToolDefinition[] = [
  // ---- Read Group ----
  {
    name: "read_file",
    group: "read",
    description: "Read the contents of a file at the specified path.",
    parameters: [
      param("path", "The path of the file to read (relative to the working directory)"),
      param("start_line", "The starting line number to read from (1-based, inclusive)", false, "number"),
      param("end_line", "The ending line number to read to (1-based, inclusive)", false, "number"),
    ],
  },
  {
    name: "search_files",
    group: "read",
    description: "Search for a regex pattern across files in a specified directory.",
    parameters: [
      param("path", "The directory path to search in (relative to the working directory)"),
      param("regex", "The regular expression pattern to search for"),
      param("file_pattern", "Optional glob pattern to filter files (e.g., '*.ts')", false),
    ],
  },
  {
    name: "list_files",
    group: "read",
    description: "List files and directories at the specified path.",
    parameters: [
      param("path", "The directory path to list (relative to the working directory)"),
      param("recursive", "Whether to list recursively (default: false)", false, "boolean"),
    ],
  },
  {
    name: "list_code_definition_names",
    group: "read",
    description: "List definition names (classes, functions, methods, etc.) in a source file or directory.",
    parameters: [
      param("path", "The file or directory path to list definitions from"),
    ],
  },

  // ---- Edit Group ----
  {
    name: "write_to_file",
    group: "edit",
    description: "Write content to a file, creating it if it doesn't exist or overwriting if it does.",
    parameters: [
      param("path", "The path of the file to write to"),
      param("content", "The content to write to the file"),
    ],
  },
  {
    name: "apply_diff",
    group: "edit",
    description: "Apply a unified diff to modify a file. Supports multi-hunk diffs for precise changes.",
    parameters: [
      param("path", "The path of the file to modify"),
      param("diff", "The unified diff content to apply"),
    ],
  },
  {
    name: "insert_content",
    group: "edit",
    description: "Insert content at a specific line in a file.",
    parameters: [
      param("path", "The path of the file to insert content into"),
      param("line", "The line number to insert at (1-based)", true, "number"),
      param("content", "The content to insert"),
    ],
  },
  {
    name: "search_and_replace",
    group: "edit",
    description: "Search for a pattern and replace it in a file.",
    parameters: [
      param("path", "The path of the file to modify"),
      param("search", "The exact text or regex pattern to search for"),
      param("replace", "The replacement text"),
      param("use_regex", "Whether to treat search as a regex (default: false)", false, "boolean"),
    ],
  },

  // ---- Command Group ----
  {
    name: "execute_command",
    group: "command",
    description: "Execute a shell command in the terminal.",
    parameters: [
      param("command", "The command to execute"),
      param("cwd", "The working directory (optional)", false),
    ],
  },

  // ---- MCP Group ----
  {
    name: "use_mcp_tool",
    group: "mcp",
    description: "Use a tool provided by a connected MCP server.",
    parameters: [
      param("server_name", "The name of the MCP server"),
      param("tool_name", "The name of the tool to use"),
      param("arguments", "JSON arguments to pass to the tool"),
    ],
  },
  {
    name: "access_mcp_resource",
    group: "mcp",
    description: "Access a resource provided by a connected MCP server.",
    parameters: [
      param("server_name", "The name of the MCP server"),
      param("uri", "The URI of the resource to access"),
    ],
  },

  // ---- Browser Group ----
  {
    name: "browser_action",
    group: "browser",
    description: "Perform a browser action (click, type, scroll, screenshot).",
    parameters: [
      param("action", "The action to perform: launch, click, type, scroll_down, scroll_up, close"),
      param("url", "URL to navigate to (for launch action)", false),
      param("coordinate", "x,y coordinate for click action", false),
      param("text", "Text to type for type action", false),
    ],
  },

  // ---- Always Available Tools (no group) ----
  {
    name: "ask_followup_question",
    group: "read", // meta-tool, always available
    description: "Ask the user a follow-up question to gather additional information.",
    parameters: [
      param("question", "The question to ask the user"),
      param("follow_up", "A list of 2-4 suggested answers", false),
    ],
  },
  {
    name: "attempt_completion",
    group: "read", // meta-tool, always available
    description: "Present the result of the task to the user.",
    parameters: [
      param("result", "A description of what was accomplished"),
      param("command", "An optional CLI command for the user to verify", false),
    ],
  },
  {
    name: "switch_mode",
    group: "read", // meta-tool, always available
    description: "Switch to a different mode.",
    parameters: [
      param("mode_slug", "The slug of the mode to switch to"),
      param("reason", "The reason for switching modes", false),
    ],
  },
  {
    name: "new_task",
    group: "read", // meta-tool, always available
    description: "Create a new task with a specific mode and message.",
    parameters: [
      param("mode", "The mode slug for the new task"),
      param("message", "The message/instructions for the new task"),
    ],
  },
]

/**
 * Get a tool definition by name.
 */
export function getToolDefinition(name: string): ToolDefinition | undefined {
  return toolDefinitions.find((t) => t.name === name)
}
