/**
 * @bkit-roo/core
 *
 * Integrated agent orchestrator combining all bkit-roo packages
 * into a unified, platform-independent AI coding agent engine.
 */

export {
  AgentRunner,
  type AgentRunnerConfig,
  type AgentEvent,
  type TaskResult,
} from "./agent-runner.js"

// Re-export key types from sub-packages for convenience
export type { ApiHandler } from "@bkit-roo/api-client"
export { buildApiHandler } from "@bkit-roo/api-client"
export { parseAssistantMessage } from "@bkit-roo/parser"
export { generateSystemPrompt } from "@bkit-roo/prompts"
export { CustomModesManager, DEFAULT_MODES } from "@bkit-roo/modes"
export { McpHub } from "@bkit-roo/mcp-client"
export { calculateCost } from "@bkit-roo/cost"
export { RooIgnore, RooProtect } from "@bkit-roo/file-rules"
export { calculateBudget, truncateHistory, MessageHistory } from "@bkit-roo/context"
