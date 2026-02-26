/**
 * MCP Hub - Central coordinator for multiple MCP server connections.
 * Ported from Roo Code's src/services/mcp/McpHub.ts
 *
 * Manages connections to MCP servers and provides unified access
 * to tools and resources across all connected servers.
 */

import type {
  McpServerConfig,
  McpServerState,
  McpToolInfo,
  McpResourceInfo,
  McpConnectionStatus,
  ILogger,
} from "@bkit-roo/shared"
import { ConsoleLogger } from "@bkit-roo/shared"

/**
 * Options for initializing the MCP Hub.
 */
export interface McpHubOptions {
  logger?: ILogger
}

/**
 * MCP Hub manages connections to multiple MCP servers.
 */
export class McpHub {
  private servers = new Map<string, McpServerState>()
  private logger: ILogger

  constructor(options?: McpHubOptions) {
    this.logger = options?.logger ?? new ConsoleLogger("McpHub")
  }

  /**
   * Connect to an MCP server.
   */
  async connectServer(config: McpServerConfig): Promise<void> {
    if (config.disabled) {
      this.logger.info(`Server "${config.name}" is disabled, skipping`)
      return
    }

    this.logger.info(`Connecting to MCP server "${config.name}" via ${config.transport}...`)

    const state: McpServerState = {
      name: config.name,
      config,
      status: "connecting",
      tools: [],
      resources: [],
    }
    this.servers.set(config.name, state)

    try {
      // Transport-specific connection logic
      switch (config.transport) {
        case "stdio":
          await this.connectStdio(config, state)
          break
        case "sse":
          await this.connectSse(config, state)
          break
        case "streamable-http":
          await this.connectStreamableHttp(config, state)
          break
        default:
          throw new Error(`Unknown transport: ${config.transport}`)
      }

      state.status = "connected"
      this.logger.info(`Connected to "${config.name}" - ${state.tools.length} tools, ${state.resources.length} resources`)
    } catch (error) {
      state.status = "error"
      state.error = error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to connect to "${config.name}": ${state.error}`)
    }
  }

  /**
   * Disconnect from an MCP server.
   */
  async disconnectServer(name: string): Promise<void> {
    const state = this.servers.get(name)
    if (!state) return

    this.logger.info(`Disconnecting from "${name}"...`)
    state.status = "disconnected"
    this.servers.delete(name)
  }

  /**
   * Get all available tools across all connected servers.
   */
  getAvailableTools(): McpToolInfo[] {
    const tools: McpToolInfo[] = []
    for (const state of this.servers.values()) {
      if (state.status === "connected") {
        tools.push(...state.tools)
      }
    }
    return tools
  }

  /**
   * Get all available resources across all connected servers.
   */
  getAvailableResources(): McpResourceInfo[] {
    const resources: McpResourceInfo[] = []
    for (const state of this.servers.values()) {
      if (state.status === "connected") {
        resources.push(...state.resources)
      }
    }
    return resources
  }

  /**
   * Get server states for all servers.
   */
  getServerStates(): McpServerState[] {
    return [...this.servers.values()]
  }

  /**
   * Get a specific server state.
   */
  getServerState(name: string): McpServerState | undefined {
    return this.servers.get(name)
  }

  /**
   * Invoke a tool on a specific MCP server.
   */
  async invokeTool(serverName: string, toolName: string, args: unknown): Promise<unknown> {
    const state = this.servers.get(serverName)
    if (!state) {
      throw new Error(`MCP server "${serverName}" not found`)
    }
    if (state.status !== "connected") {
      throw new Error(`MCP server "${serverName}" is not connected (status: ${state.status})`)
    }

    this.logger.info(`Invoking tool "${toolName}" on server "${serverName}"`)

    // In a real implementation, this would use the MCP SDK to call the tool
    // For now, this is a placeholder that consumers will implement
    throw new Error(
      "MCP tool invocation requires the @modelcontextprotocol/sdk package. " +
      "Install it and provide a proper transport implementation."
    )
  }

  /**
   * Access a resource on a specific MCP server.
   */
  async accessResource(serverName: string, uri: string): Promise<unknown> {
    const state = this.servers.get(serverName)
    if (!state) {
      throw new Error(`MCP server "${serverName}" not found`)
    }
    if (state.status !== "connected") {
      throw new Error(`MCP server "${serverName}" is not connected (status: ${state.status})`)
    }

    this.logger.info(`Accessing resource "${uri}" on server "${serverName}"`)

    throw new Error(
      "MCP resource access requires the @modelcontextprotocol/sdk package. " +
      "Install it and provide a proper transport implementation."
    )
  }

  /**
   * Disconnect from all servers.
   */
  async disconnectAll(): Promise<void> {
    const names = [...this.servers.keys()]
    for (const name of names) {
      await this.disconnectServer(name)
    }
  }

  // ---- Transport implementations (stubs) ----

  private async connectStdio(config: McpServerConfig, state: McpServerState): Promise<void> {
    if (!config.command) {
      throw new Error("stdio transport requires a 'command' field")
    }
    // Placeholder: In a real implementation, this would spawn a child process
    // and communicate via stdin/stdout using the MCP protocol
    this.logger.warn(`stdio transport for "${config.name}" is a placeholder - install @modelcontextprotocol/sdk for full support`)
  }

  private async connectSse(config: McpServerConfig, state: McpServerState): Promise<void> {
    if (!config.url) {
      throw new Error("sse transport requires a 'url' field")
    }
    this.logger.warn(`sse transport for "${config.name}" is a placeholder - install @modelcontextprotocol/sdk for full support`)
  }

  private async connectStreamableHttp(config: McpServerConfig, state: McpServerState): Promise<void> {
    if (!config.url) {
      throw new Error("streamable-http transport requires a 'url' field")
    }
    this.logger.warn(`streamable-http transport for "${config.name}" is a placeholder - install @modelcontextprotocol/sdk for full support`)
  }
}
