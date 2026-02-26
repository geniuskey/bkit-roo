/**
 * CLI Agent Example
 *
 * Demonstrates using @bkit-roo/core AgentRunner to create
 * a full AI coding agent with tool execution in the terminal.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx index.ts "List the files in the current directory"
 */

import { AgentRunner, type AgentRunnerConfig } from "@bkit-roo/core"
import { AutoApprovalGate, InMemoryConfigStorage, ConsoleLogger } from "@bkit-roo/shared"
import type { IFileSystem, ITerminalExecutor, FileStat, TerminalResult } from "@bkit-roo/shared"
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync, mkdirSync, unlinkSync } from "node:fs"
import { execSync } from "node:child_process"
import { join } from "node:path"

// ---- Platform implementations ----

/** Node.js file system adapter */
const nodeFs: IFileSystem = {
  async readFile(path: string): Promise<string> {
    return readFileSync(path, "utf-8")
  },
  async writeFile(path: string, content: string): Promise<void> {
    writeFileSync(path, content, "utf-8")
  },
  async exists(path: string): Promise<boolean> {
    return existsSync(path)
  },
  async readDirectory(dirPath: string): Promise<string[]> {
    return readdirSync(dirPath)
  },
  async listFiles(dirPath: string, options?: { recursive?: boolean }): Promise<string[]> {
    const entries = readdirSync(dirPath, { withFileTypes: true, recursive: options?.recursive })
    return entries.map((e) => (typeof e === "string" ? e : join(e.parentPath || dirPath, e.name)))
  },
  async stat(path: string): Promise<FileStat> {
    const s = statSync(path)
    return { isFile: s.isFile(), isDirectory: s.isDirectory(), size: s.size, mtime: s.mtimeMs }
  },
  async mkdir(path: string): Promise<void> {
    mkdirSync(path, { recursive: true })
  },
  async unlink(path: string): Promise<void> {
    unlinkSync(path)
  },
}

/** Node.js terminal executor adapter */
const nodeTerminal: ITerminalExecutor = {
  async execute(command: string, options?: { cwd?: string }): Promise<TerminalResult> {
    try {
      const stdout = execSync(command, {
        cwd: options?.cwd,
        encoding: "utf-8",
        timeout: 30_000,
      })
      return { exitCode: 0, stdout, stderr: "" }
    } catch (error: any) {
      return {
        exitCode: error.status ?? 1,
        stdout: error.stdout ?? "",
        stderr: error.stderr ?? error.message,
      }
    }
  },
  async *executeStream(command: string, options?: { cwd?: string }) {
    const result = await nodeTerminal.execute(command, options)
    if (result.stdout) yield { type: "stdout" as const, data: result.stdout }
    if (result.stderr) yield { type: "stderr" as const, data: result.stderr }
    yield { type: "exit" as const, exitCode: result.exitCode }
  },
}

// ---- Main ----

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error("Error: Set ANTHROPIC_API_KEY environment variable")
    process.exit(1)
  }

  const userMessage = process.argv[2]
  if (!userMessage) {
    console.error('Usage: npx tsx index.ts "Your task description"')
    process.exit(1)
  }

  const config: AgentRunnerConfig = {
    apiConfig: {
      apiProvider: "anthropic",
      apiKey,
      apiModelId: "claude-sonnet-4-20250514",
    },
    fileSystem: nodeFs,
    terminal: nodeTerminal,
    approvalGate: new AutoApprovalGate(),
    storage: new InMemoryConfigStorage(),
    cwd: process.cwd(),
    mode: "code",
    logger: new ConsoleLogger("Agent"),
    maxRequests: 10,
  }

  console.log(`\n🤖 Starting agent in "${config.mode}" mode...\n`)
  console.log(`📝 Task: ${userMessage}\n`)
  console.log("─".repeat(60))

  const agent = new AgentRunner(config)

  for await (const event of agent.runTaskStream(userMessage)) {
    switch (event.type) {
      case "text_delta":
        process.stdout.write(event.text)
        break
      case "reasoning_delta":
        // Skip reasoning output for cleaner display
        break
      case "tool_request":
        console.log(`\n\n🔧 Tool: ${event.tool}`)
        console.log(`   Params: ${JSON.stringify(event.params).slice(0, 200)}`)
        break
      case "tool_result":
        console.log(`   Result: ${event.result.slice(0, 200)}${event.result.length > 200 ? "..." : ""}`)
        break
      case "task_complete":
        console.log("\n\n" + "─".repeat(60))
        console.log(`✅ Task completed: ${event.result}`)
        break
      case "cost_update":
        // Silent cost tracking
        break
      case "mode_switch":
        console.log(`\n🔄 Mode: ${event.from} → ${event.to}`)
        break
      case "error":
        console.error(`\n❌ Error: ${event.error.message}`)
        break
    }
  }

  console.log("\n")
}

main().catch(console.error)
