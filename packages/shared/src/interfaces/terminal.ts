/**
 * Platform-agnostic terminal/command execution abstraction.
 * Consumers must provide their own implementation
 * (e.g., Node.js child_process, VS Code terminal, web-based shell).
 */

export interface TerminalResult {
  /** Exit code (0 = success) */
  exitCode: number
  /** Standard output */
  stdout: string
  /** Standard error */
  stderr: string
}

export interface ITerminalExecutor {
  /** Execute a command and wait for completion */
  execute(command: string, options?: TerminalExecuteOptions): Promise<TerminalResult>

  /** Execute a command with streaming output */
  executeStream(command: string, options?: TerminalExecuteOptions): AsyncIterable<TerminalStreamEvent>
}

export interface TerminalExecuteOptions {
  /** Working directory */
  cwd?: string
  /** Environment variables */
  env?: Record<string, string>
  /** Timeout in milliseconds */
  timeout?: number
}

export type TerminalStreamEvent =
  | { type: "stdout"; data: string }
  | { type: "stderr"; data: string }
  | { type: "exit"; exitCode: number }
