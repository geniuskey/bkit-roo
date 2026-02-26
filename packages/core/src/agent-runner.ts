/**
 * AgentRunner - The main agent execution loop.
 * Ported from Roo Code's Task class (src/core/task/Task.ts)
 *
 * Orchestrates the message → LLM → parse → tool execution → repeat cycle.
 * This is the central integration point combining all bkit-roo packages.
 */

import type {
  ApiConfiguration,
  Message,
  ModeConfig,
  IFileSystem,
  ITerminalExecutor,
  IApprovalGate,
  IConfigStorage,
  ILogger,
  McpToolInfo,
} from "@bkit-roo/shared"
import { ConsoleLogger, AutoApprovalGate } from "@bkit-roo/shared"
import { buildApiHandler, type ApiHandler } from "@bkit-roo/api-client"
import { parseAssistantMessage } from "@bkit-roo/parser"
import { generateSystemPrompt, type PromptGenerationContext } from "@bkit-roo/prompts"
import { toolDefinitions } from "@bkit-roo/tools"
import { CustomModesManager, DEFAULT_MODES } from "@bkit-roo/modes"
import { calculateBudget, truncateHistory } from "@bkit-roo/context"
import { calculateCost } from "@bkit-roo/cost"
import type { McpHub } from "@bkit-roo/mcp-client"

/**
 * Configuration for the AgentRunner.
 */
export interface AgentRunnerConfig {
  /** API provider configuration */
  apiConfig: ApiConfiguration
  /** File system implementation */
  fileSystem: IFileSystem
  /** Terminal executor implementation */
  terminal: ITerminalExecutor
  /** Approval gate for tool execution */
  approvalGate?: IApprovalGate
  /** Configuration storage */
  storage: IConfigStorage
  /** Current working directory */
  cwd: string
  /** Initial mode slug (default: "code") */
  mode?: string
  /** Custom instructions */
  customInstructions?: string
  /** Project rules */
  projectRules?: string[]
  /** MCP Hub instance */
  mcpHub?: McpHub
  /** Logger */
  logger?: ILogger
  /** Maximum consecutive API requests (safety limit) */
  maxRequests?: number
}

/**
 * Events emitted during agent execution.
 */
export type AgentEvent =
  | { type: "text_delta"; text: string }
  | { type: "reasoning_delta"; text: string }
  | { type: "tool_request"; tool: string; params: Record<string, string> }
  | { type: "tool_result"; tool: string; result: string; success: boolean }
  | { type: "task_complete"; result: string }
  | { type: "cost_update"; totalCost: number; inputTokens: number; outputTokens: number }
  | { type: "mode_switch"; from: string; to: string }
  | { type: "error"; error: Error }

/**
 * Result of a task execution.
 */
export interface TaskResult {
  /** Whether the task completed successfully */
  success: boolean
  /** The completion message (from attempt_completion) */
  result?: string
  /** Total cost of the task */
  totalCost: number
  /** Total input tokens used */
  totalInputTokens: number
  /** Total output tokens used */
  totalOutputTokens: number
  /** Number of API requests made */
  requestCount: number
  /** Conversation history */
  messages: Message[]
}

type EventHandler = (event: AgentEvent) => void

/**
 * The main agent execution engine.
 */
export class AgentRunner {
  private apiHandler: ApiHandler
  private modesManager: CustomModesManager
  private currentMode: ModeConfig
  private messages: Message[] = []
  private totalCost = 0
  private totalInputTokens = 0
  private totalOutputTokens = 0
  private requestCount = 0
  private logger: ILogger
  private eventHandlers: EventHandler[] = []
  private aborted = false

  constructor(private readonly config: AgentRunnerConfig) {
    this.apiHandler = buildApiHandler(config.apiConfig)
    this.modesManager = new CustomModesManager(config.storage)
    this.logger = config.logger ?? new ConsoleLogger("AgentRunner")

    // Resolve initial mode
    const modeSlug = config.mode ?? "code"
    this.currentMode = DEFAULT_MODES.find((m) => m.slug === modeSlug) ?? DEFAULT_MODES[0]!
  }

  /**
   * Register an event handler.
   */
  on(handler: EventHandler): void {
    this.eventHandlers.push(handler)
  }

  /**
   * Run a task with streaming events.
   */
  async *runTaskStream(userMessage: string): AsyncGenerator<AgentEvent> {
    this.aborted = false
    const maxRequests = this.config.maxRequests ?? 50

    // Add user message
    this.messages.push({
      role: "user",
      content: userMessage,
      ts: Date.now(),
    })

    while (this.requestCount < maxRequests && !this.aborted) {
      this.requestCount++

      // Generate system prompt
      const systemPrompt = this.buildSystemPrompt()

      // Get model info for budget calculation
      const { info: modelInfo } = this.apiHandler.getModel()

      // Truncate history if needed
      this.messages = truncateHistory(this.messages, modelInfo, systemPrompt)

      // Call the LLM
      let fullResponse = ""
      try {
        const stream = this.apiHandler.createMessage(systemPrompt, this.messages)

        for await (const chunk of stream) {
          switch (chunk.type) {
            case "text":
              fullResponse += chunk.text
              yield { type: "text_delta", text: chunk.text }
              break

            case "reasoning":
              yield { type: "reasoning_delta", text: chunk.text }
              break

            case "usage":
              this.totalInputTokens += chunk.inputTokens
              this.totalOutputTokens += chunk.outputTokens
              const cost = calculateCost(
                {
                  inputTokens: chunk.inputTokens,
                  outputTokens: chunk.outputTokens,
                  cacheReadTokens: chunk.cacheReadTokens,
                  cacheWriteTokens: chunk.cacheWriteTokens,
                },
                modelInfo,
              )
              this.totalCost += cost
              yield {
                type: "cost_update",
                totalCost: this.totalCost,
                inputTokens: this.totalInputTokens,
                outputTokens: this.totalOutputTokens,
              }
              break

            case "error":
              yield { type: "error", error: chunk.error }
              return
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        yield { type: "error", error: err }
        return
      }

      // Add assistant message to history
      this.messages.push({
        role: "assistant",
        content: fullResponse,
        ts: Date.now(),
      })

      // Parse the response for tool calls
      const parsed = parseAssistantMessage(fullResponse)

      // Check for tool calls
      const toolBlocks = parsed.blocks.filter((b) => b.type === "tool_use")

      if (toolBlocks.length === 0) {
        // No tool calls - task may be done (text-only response)
        break
      }

      // Execute tool calls
      const toolResults: string[] = []
      let taskCompleted = false

      for (const block of toolBlocks) {
        if (block.type !== "tool_use") continue

        yield { type: "tool_request", tool: block.name, params: block.params }

        // Handle special tools
        if (block.name === "attempt_completion") {
          const result = block.params.result ?? ""
          yield { type: "task_complete", result }
          taskCompleted = true
          break
        }

        if (block.name === "switch_mode") {
          const newSlug = block.params.mode_slug ?? "code"
          const oldSlug = this.currentMode.slug
          const newMode = await this.modesManager.getMode(newSlug)
          if (newMode) {
            this.currentMode = newMode
            yield { type: "mode_switch", from: oldSlug, to: newSlug }
          }
          toolResults.push(`Switched to ${newSlug} mode.`)
          continue
        }

        // Execute the tool through the approval gate
        const gate = this.config.approvalGate ?? new AutoApprovalGate()
        const approval = await gate.requestApproval({
          tool: block.name,
          params: block.params as Record<string, unknown>,
        })

        if (!approval.approved) {
          const reason = "reason" in approval ? approval.reason : "User denied"
          toolResults.push(`[Tool ${block.name} denied: ${reason}]`)
          yield { type: "tool_result", tool: block.name, result: reason, success: false }
          continue
        }

        // Execute the tool
        const result = await this.executeTool(block.name, block.params)
        toolResults.push(result)
        yield { type: "tool_result", tool: block.name, result, success: true }
      }

      if (taskCompleted) break

      // Add tool results as user message for next iteration
      if (toolResults.length > 0) {
        this.messages.push({
          role: "user",
          content: toolResults.join("\n\n"),
          ts: Date.now(),
        })
      }
    }
  }

  /**
   * Run a task and return the final result.
   */
  async runTask(userMessage: string): Promise<TaskResult> {
    let completionResult: string | undefined

    for await (const event of this.runTaskStream(userMessage)) {
      // Emit to registered handlers
      for (const handler of this.eventHandlers) {
        handler(event)
      }

      if (event.type === "task_complete") {
        completionResult = event.result
      }
      if (event.type === "error") {
        return {
          success: false,
          result: event.error.message,
          totalCost: this.totalCost,
          totalInputTokens: this.totalInputTokens,
          totalOutputTokens: this.totalOutputTokens,
          requestCount: this.requestCount,
          messages: this.messages,
        }
      }
    }

    return {
      success: !!completionResult,
      result: completionResult,
      totalCost: this.totalCost,
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
      requestCount: this.requestCount,
      messages: this.messages,
    }
  }

  /**
   * Abort the current task.
   */
  abort(): void {
    this.aborted = true
  }

  /**
   * Get the current conversation history.
   */
  getMessages(): Message[] {
    return [...this.messages]
  }

  /**
   * Get the current mode.
   */
  getCurrentMode(): ModeConfig {
    return this.currentMode
  }

  // ---- Private methods ----

  private buildSystemPrompt(): string {
    const mcpTools: McpToolInfo[] = this.config.mcpHub?.getAvailableTools() ?? []

    const ctx: PromptGenerationContext = {
      mode: this.currentMode,
      tools: toolDefinitions,
      mcpTools,
      customInstructions: this.config.customInstructions,
      projectRules: this.config.projectRules,
      cwd: this.config.cwd,
    }

    return generateSystemPrompt(ctx)
  }

  private async executeTool(name: string, params: Record<string, string>): Promise<string> {
    const fs = this.config.fileSystem
    const terminal = this.config.terminal

    try {
      switch (name) {
        case "read_file": {
          const content = await fs.readFile(params.path ?? "")
          return content
        }

        case "write_to_file": {
          await fs.writeFile(params.path ?? "", params.content ?? "")
          return `File written: ${params.path}`
        }

        case "list_files": {
          const files = await fs.listFiles(params.path ?? ".", {
            recursive: params.recursive === "true",
          })
          return files.join("\n")
        }

        case "search_files": {
          // Delegate to terminal for grep
          const result = await terminal.execute(
            `grep -rn "${params.regex}" "${params.path}"`,
            { cwd: this.config.cwd },
          )
          return result.stdout || result.stderr || "No results found."
        }

        case "execute_command": {
          const result = await terminal.execute(
            params.command ?? "",
            { cwd: params.cwd ?? this.config.cwd },
          )
          return result.stdout + (result.stderr ? `\nSTDERR: ${result.stderr}` : "")
        }

        case "apply_diff": {
          const filePath = params.path ?? ""
          const existing = await fs.readFile(filePath)
          // Simple diff application - in production, use a proper diff library
          await fs.writeFile(filePath, params.diff ?? existing)
          return `Diff applied to: ${filePath}`
        }

        case "search_and_replace": {
          const filePath = params.path ?? ""
          const content = await fs.readFile(filePath)
          const search = params.search ?? ""
          const replace = params.replace ?? ""
          const newContent = content.replace(
            params.use_regex === "true" ? new RegExp(search, "g") : search,
            replace,
          )
          await fs.writeFile(filePath, newContent)
          return `Search and replace completed in: ${filePath}`
        }

        case "insert_content": {
          const filePath = params.path ?? ""
          const content = await fs.readFile(filePath)
          const lines = content.split("\n")
          const lineNum = parseInt(params.line ?? "1", 10) - 1
          lines.splice(lineNum, 0, params.content ?? "")
          await fs.writeFile(filePath, lines.join("\n"))
          return `Content inserted at line ${params.line} in: ${filePath}`
        }

        case "ask_followup_question":
          return `[Follow-up question asked: ${params.question}]`

        case "use_mcp_tool": {
          if (!this.config.mcpHub) {
            return "Error: No MCP hub configured"
          }
          const result = await this.config.mcpHub.invokeTool(
            params.server_name ?? "",
            params.tool_name ?? "",
            JSON.parse(params.arguments ?? "{}"),
          )
          return JSON.stringify(result)
        }

        case "access_mcp_resource": {
          if (!this.config.mcpHub) {
            return "Error: No MCP hub configured"
          }
          const result = await this.config.mcpHub.accessResource(
            params.server_name ?? "",
            params.uri ?? "",
          )
          return JSON.stringify(result)
        }

        default:
          return `Unknown tool: ${name}`
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return `Error executing ${name}: ${message}`
    }
  }
}
