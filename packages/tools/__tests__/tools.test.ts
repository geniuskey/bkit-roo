import { describe, it, expect } from "vitest"
import {
  toolDefinitions,
  getToolDefinition,
  getToolsForGroups,
  isToolAllowed,
  createPermissions,
} from "../src/index.js"

describe("toolDefinitions", () => {
  it("should have all core tools defined", () => {
    const toolNames = toolDefinitions.map((t) => t.name)
    expect(toolNames).toContain("read_file")
    expect(toolNames).toContain("write_to_file")
    expect(toolNames).toContain("execute_command")
    expect(toolNames).toContain("use_mcp_tool")
    expect(toolNames).toContain("attempt_completion")
    expect(toolNames).toContain("ask_followup_question")
  })

  it("should have parameters for each tool", () => {
    for (const tool of toolDefinitions) {
      expect(tool.parameters.length).toBeGreaterThan(0)
    }
  })

  it("should have valid groups", () => {
    const validGroups = new Set(["read", "edit", "command", "mcp", "browser"])
    for (const tool of toolDefinitions) {
      expect(validGroups.has(tool.group)).toBe(true)
    }
  })
})

describe("getToolDefinition", () => {
  it("should return a tool by name", () => {
    const tool = getToolDefinition("read_file")
    expect(tool).toBeDefined()
    expect(tool!.name).toBe("read_file")
    expect(tool!.group).toBe("read")
  })

  it("should return undefined for unknown tools", () => {
    const tool = getToolDefinition("nonexistent_tool")
    expect(tool).toBeUndefined()
  })
})

describe("getToolsForGroups", () => {
  it("should return read tools for read group", () => {
    const tools = getToolsForGroups(["read"])
    const names = tools.map((t) => t.name)
    expect(names).toContain("read_file")
    expect(names).toContain("search_files")
    expect(names).not.toContain("write_to_file")
  })

  it("should always include meta tools", () => {
    const tools = getToolsForGroups(["read"])
    const names = tools.map((t) => t.name)
    expect(names).toContain("ask_followup_question")
    expect(names).toContain("attempt_completion")
  })

  it("should combine multiple groups", () => {
    const tools = getToolsForGroups(["read", "edit", "command"])
    const names = tools.map((t) => t.name)
    expect(names).toContain("read_file")
    expect(names).toContain("write_to_file")
    expect(names).toContain("execute_command")
  })
})

describe("isToolAllowed", () => {
  it("should allow tools in permitted groups", () => {
    const perms = createPermissions(["read", "edit"])
    expect(isToolAllowed("read_file", perms)).toBe(true)
    expect(isToolAllowed("write_to_file", perms)).toBe(true)
  })

  it("should deny tools in non-permitted groups", () => {
    const perms = createPermissions(["read"])
    expect(isToolAllowed("write_to_file", perms)).toBe(false)
    expect(isToolAllowed("execute_command", perms)).toBe(false)
  })

  it("should always allow meta tools", () => {
    const perms = createPermissions([])
    expect(isToolAllowed("ask_followup_question", perms)).toBe(true)
    expect(isToolAllowed("attempt_completion", perms)).toBe(true)
  })
})
