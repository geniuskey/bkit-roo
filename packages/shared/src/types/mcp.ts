/**
 * MCP (Model Context Protocol) related types.
 * Ported from Roo Code's MCP integration.
 */

/**
 * Transport types for MCP server connections.
 */
export type McpTransportType = "stdio" | "sse" | "streamable-http"

/**
 * Configuration for an MCP server.
 */
export interface McpServerConfig {
  /** Server display name */
  name: string
  /** Transport type */
  transport: McpTransportType
  /** Command to execute (stdio transport) */
  command?: string
  /** Command arguments (stdio transport) */
  args?: string[]
  /** Server URL (sse, streamable-http) */
  url?: string
  /** Environment variables */
  env?: Record<string, string>
  /** Tool names that are always allowed without approval */
  alwaysAllow?: string[]
  /** Whether this server is disabled */
  disabled?: boolean
}

/**
 * Information about a tool provided by an MCP server.
 */
export interface McpToolInfo {
  /** Server this tool belongs to */
  serverName: string
  /** Tool name */
  name: string
  /** Tool description */
  description?: string
  /** Input schema (JSON Schema) */
  inputSchema?: Record<string, unknown>
}

/**
 * Information about a resource provided by an MCP server.
 */
export interface McpResourceInfo {
  /** Server this resource belongs to */
  serverName: string
  /** Resource URI */
  uri: string
  /** Resource name */
  name: string
  /** Resource description */
  description?: string
  /** MIME type */
  mimeType?: string
}

/**
 * Connection status for an MCP server.
 */
export type McpConnectionStatus = "connecting" | "connected" | "disconnected" | "error"

/**
 * State of an MCP server connection.
 */
export interface McpServerState {
  name: string
  config: McpServerConfig
  status: McpConnectionStatus
  error?: string
  tools: McpToolInfo[]
  resources: McpResourceInfo[]
}

/**
 * MCP settings file structure (mcp_settings.json).
 */
export interface McpSettings {
  mcpServers: Record<string, Omit<McpServerConfig, "name">>
}
