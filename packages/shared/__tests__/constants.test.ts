import { describe, it, expect } from "vitest"
import {
  anthropicModels,
  openAiModels,
  geminiModels,
  deepSeekModels,
  defaultModelIds,
  toolsByGroup,
  alwaysAvailableTools,
  getToolsForGroups,
} from "../src/index.js"

describe("Model constants", () => {
  it("should have anthropic models defined", () => {
    expect(Object.keys(anthropicModels).length).toBeGreaterThan(0)
    expect(anthropicModels["claude-sonnet-4-20250514"]).toBeDefined()
    expect(anthropicModels["claude-sonnet-4-20250514"]!.contextWindow).toBe(200_000)
  })

  it("should have openai models defined", () => {
    expect(Object.keys(openAiModels).length).toBeGreaterThan(0)
    expect(openAiModels["gpt-4o"]).toBeDefined()
  })

  it("should have gemini models defined", () => {
    expect(Object.keys(geminiModels).length).toBeGreaterThan(0)
  })

  it("should have deepseek models defined", () => {
    expect(Object.keys(deepSeekModels).length).toBeGreaterThan(0)
  })

  it("should have default model IDs for major providers", () => {
    expect(defaultModelIds.anthropic).toBeDefined()
    expect(defaultModelIds.openai).toBeDefined()
    expect(defaultModelIds.gemini).toBeDefined()
  })

  it("should have proper pricing for anthropic models", () => {
    const sonnet = anthropicModels["claude-sonnet-4-20250514"]!
    expect(sonnet.inputPrice).toBe(3.0)
    expect(sonnet.outputPrice).toBe(15.0)
    expect(sonnet.cacheWritesPrice).toBe(3.75)
    expect(sonnet.cacheReadsPrice).toBe(0.3)
  })
})

describe("Tool group constants", () => {
  it("should have all 5 tool groups", () => {
    expect(Object.keys(toolsByGroup)).toEqual(
      expect.arrayContaining(["read", "edit", "command", "mcp", "browser"])
    )
  })

  it("should have read tools", () => {
    expect(toolsByGroup.read).toContain("read_file")
    expect(toolsByGroup.read).toContain("search_files")
    expect(toolsByGroup.read).toContain("list_files")
  })

  it("should have edit tools", () => {
    expect(toolsByGroup.edit).toContain("write_to_file")
    expect(toolsByGroup.edit).toContain("apply_diff")
  })

  it("should have command tools", () => {
    expect(toolsByGroup.command).toContain("execute_command")
  })

  it("should have always-available tools", () => {
    expect(alwaysAvailableTools).toContain("ask_followup_question")
    expect(alwaysAvailableTools).toContain("attempt_completion")
  })

  it("getToolsForGroups should return tools for specified groups plus always-available", () => {
    const tools = getToolsForGroups(["read"])
    expect(tools).toContain("read_file")
    expect(tools).toContain("ask_followup_question")
    expect(tools).not.toContain("write_to_file")
    expect(tools).not.toContain("execute_command")
  })

  it("getToolsForGroups should combine multiple groups", () => {
    const tools = getToolsForGroups(["read", "edit"])
    expect(tools).toContain("read_file")
    expect(tools).toContain("write_to_file")
    expect(tools).not.toContain("execute_command")
  })
})
