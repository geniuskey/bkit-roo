import { describe, it, expect } from "vitest"
import { generateSystemPrompt, type PromptGenerationContext } from "../src/index.js"
import { toolDefinitions } from "@bkit-roo/tools"
import { codeMode, architectMode } from "@bkit-roo/modes"

describe("generateSystemPrompt", () => {
  it("should generate a prompt for code mode", () => {
    const ctx: PromptGenerationContext = {
      mode: codeMode,
      tools: toolDefinitions,
      cwd: "/home/user/project",
    }

    const prompt = generateSystemPrompt(ctx)

    expect(prompt).toContain(codeMode.roleDefinition)
    expect(prompt).toContain("/home/user/project")
    expect(prompt).toContain("read_file")
    expect(prompt).toContain("write_to_file")
    expect(prompt).toContain("execute_command")
    expect(prompt).toContain("attempt_completion")
  })

  it("should generate a restricted prompt for architect mode", () => {
    const ctx: PromptGenerationContext = {
      mode: architectMode,
      tools: toolDefinitions,
      cwd: "/home/user/project",
    }

    const prompt = generateSystemPrompt(ctx)

    expect(prompt).toContain(architectMode.roleDefinition)
    expect(prompt).toContain("read_file")
    // Architect mode is read-only - should not have edit/command tools
    expect(prompt).not.toContain("## write_to_file")
    expect(prompt).not.toContain("## execute_command")
  })

  it("should include custom instructions when provided", () => {
    const ctx: PromptGenerationContext = {
      mode: codeMode,
      tools: toolDefinitions,
      cwd: "/home/user/project",
      customInstructions: "Always use TypeScript. Never use any.",
    }

    const prompt = generateSystemPrompt(ctx)
    expect(prompt).toContain("Always use TypeScript")
  })

  it("should include project rules when provided", () => {
    const ctx: PromptGenerationContext = {
      mode: codeMode,
      tools: toolDefinitions,
      cwd: "/home/user/project",
      projectRules: ["Use ESLint", "Follow conventional commits"],
    }

    const prompt = generateSystemPrompt(ctx)
    expect(prompt).toContain("Use ESLint")
    expect(prompt).toContain("Follow conventional commits")
  })

  it("should include MCP tools when provided", () => {
    const ctx: PromptGenerationContext = {
      mode: codeMode,
      tools: toolDefinitions,
      cwd: "/home/user/project",
      mcpTools: [
        {
          serverName: "postgres",
          name: "query",
          description: "Execute a SQL query",
          inputSchema: { type: "object", properties: { sql: { type: "string" } } },
        },
      ],
    }

    const prompt = generateSystemPrompt(ctx)
    expect(prompt).toContain("MCP Server Tools")
    expect(prompt).toContain("postgres")
    expect(prompt).toContain("Execute a SQL query")
  })

  it("should include system info section", () => {
    const ctx: PromptGenerationContext = {
      mode: codeMode,
      tools: toolDefinitions,
      cwd: "/home/user/project",
      osInfo: "Linux",
      shellInfo: "bash",
    }

    const prompt = generateSystemPrompt(ctx)
    expect(prompt).toContain("Linux")
    expect(prompt).toContain("bash")
  })

  it("should include rules section", () => {
    const ctx: PromptGenerationContext = {
      mode: codeMode,
      tools: toolDefinitions,
      cwd: "/home/user/project",
    }

    const prompt = generateSystemPrompt(ctx)
    expect(prompt).toContain("# Rules")
    expect(prompt).toContain("attempt_completion")
  })

  it("should include mode-specific custom instructions", () => {
    const customMode = {
      ...codeMode,
      customInstructions: "Always write tests first (TDD).",
    }

    const ctx: PromptGenerationContext = {
      mode: customMode,
      tools: toolDefinitions,
      cwd: "/home/user/project",
    }

    const prompt = generateSystemPrompt(ctx)
    expect(prompt).toContain("Always write tests first")
  })
})
