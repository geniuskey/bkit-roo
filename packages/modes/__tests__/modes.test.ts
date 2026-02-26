import { describe, it, expect, beforeEach } from "vitest"
import { InMemoryConfigStorage } from "@bkit-roo/shared"
import {
  CustomModesManager,
  DEFAULT_MODES,
  codeMode,
  architectMode,
  askMode,
  debugMode,
  orchestratorMode,
} from "../src/index.js"

describe("Built-in modes", () => {
  it("should have 5 built-in modes", () => {
    expect(DEFAULT_MODES).toHaveLength(5)
  })

  it("should have correct slugs", () => {
    expect(codeMode.slug).toBe("code")
    expect(architectMode.slug).toBe("architect")
    expect(askMode.slug).toBe("ask")
    expect(debugMode.slug).toBe("debug")
    expect(orchestratorMode.slug).toBe("orchestrator")
  })

  it("code mode should have all tool groups", () => {
    expect(codeMode.groups).toEqual(["read", "edit", "command", "mcp"])
  })

  it("architect mode should only have read group", () => {
    expect(architectMode.groups).toEqual(["read"])
  })

  it("ask mode should only have read group", () => {
    expect(askMode.groups).toEqual(["read"])
  })

  it("all modes should have role definitions", () => {
    for (const mode of DEFAULT_MODES) {
      expect(mode.roleDefinition.length).toBeGreaterThan(0)
    }
  })
})

describe("CustomModesManager", () => {
  let storage: InMemoryConfigStorage
  let manager: CustomModesManager

  beforeEach(() => {
    storage = new InMemoryConfigStorage()
    manager = new CustomModesManager(storage)
  })

  it("should return built-in modes", () => {
    const modes = manager.getBuiltinModes()
    expect(modes).toHaveLength(5)
  })

  it("should return empty custom modes initially", async () => {
    const modes = await manager.getCustomModes()
    expect(modes).toHaveLength(0)
  })

  it("should create a custom mode", async () => {
    await manager.createMode({
      slug: "security-reviewer",
      name: "Security Reviewer",
      roleDefinition: "You are a security expert who reviews code for vulnerabilities.",
      groups: ["read"],
    })

    const custom = await manager.getCustomModes()
    expect(custom).toHaveLength(1)
    expect(custom[0]!.slug).toBe("security-reviewer")
  })

  it("should get all modes including custom", async () => {
    await manager.createMode({
      slug: "custom1",
      name: "Custom",
      roleDefinition: "Test",
      groups: ["read"],
    })

    const all = await manager.getAllModes()
    expect(all).toHaveLength(6) // 5 built-in + 1 custom
  })

  it("should get a specific mode by slug", async () => {
    const mode = await manager.getMode("code")
    expect(mode).toBeDefined()
    expect(mode!.name).toBe("Code")
  })

  it("should delete a custom mode", async () => {
    await manager.createMode({
      slug: "temp",
      name: "Temporary",
      roleDefinition: "Temp",
      groups: ["read"],
    })

    await manager.deleteMode("temp")
    const custom = await manager.getCustomModes()
    expect(custom).toHaveLength(0)
  })

  it("should not allow deleting built-in modes", async () => {
    await expect(manager.deleteMode("code")).rejects.toThrow("Cannot delete built-in mode")
  })

  it("should not allow duplicate slugs", async () => {
    await manager.createMode({
      slug: "test",
      name: "Test",
      roleDefinition: "Test",
      groups: ["read"],
    })

    await expect(
      manager.createMode({
        slug: "test",
        name: "Test 2",
        roleDefinition: "Test 2",
        groups: ["read"],
      }),
    ).rejects.toThrow("already exists")
  })

  it("should update a custom mode", async () => {
    await manager.createMode({
      slug: "test",
      name: "Test",
      roleDefinition: "Original",
      groups: ["read"],
    })

    await manager.updateMode("test", { roleDefinition: "Updated" })
    const mode = await manager.getMode("test")
    expect(mode!.roleDefinition).toBe("Updated")
  })

  it("should override a built-in mode", async () => {
    await manager.updateMode("code", { roleDefinition: "Custom code role" })
    const mode = await manager.getMode("code")
    expect(mode!.roleDefinition).toBe("Custom code role")
  })
})
