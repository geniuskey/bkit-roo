import { describe, it, expect } from "vitest"
import {
  AutoApprovalGate,
  InMemoryConfigStorage,
  InMemorySecretStorage,
  ConsoleLogger,
  NullLogger,
} from "../src/index.js"

describe("AutoApprovalGate", () => {
  it("should always approve", async () => {
    const gate = new AutoApprovalGate()
    const result = await gate.requestApproval({
      tool: "read_file",
      params: { path: "/test" },
    })
    expect(result.approved).toBe(true)
  })
})

describe("InMemoryConfigStorage", () => {
  it("should store and retrieve values", async () => {
    const storage = new InMemoryConfigStorage()

    await storage.set("key1", "value1")
    const result = await storage.get<string>("key1")
    expect(result).toBe("value1")
  })

  it("should return undefined for missing keys", async () => {
    const storage = new InMemoryConfigStorage()
    const result = await storage.get("nonexistent")
    expect(result).toBeUndefined()
  })

  it("should delete keys", async () => {
    const storage = new InMemoryConfigStorage()
    await storage.set("key", "value")
    await storage.delete("key")
    const result = await storage.get("key")
    expect(result).toBeUndefined()
  })

  it("should list all keys", async () => {
    const storage = new InMemoryConfigStorage()
    await storage.set("a", 1)
    await storage.set("b", 2)
    const keys = await storage.keys()
    expect(keys.sort()).toEqual(["a", "b"])
  })

  it("should handle complex objects", async () => {
    const storage = new InMemoryConfigStorage()
    const obj = { nested: { value: [1, 2, 3] } }
    await storage.set("complex", obj)
    const result = await storage.get<typeof obj>("complex")
    expect(result).toEqual(obj)
  })
})

describe("InMemorySecretStorage", () => {
  it("should store and retrieve secrets", async () => {
    const storage = new InMemorySecretStorage()
    await storage.setSecret("api_key", "sk-123")
    const result = await storage.getSecret("api_key")
    expect(result).toBe("sk-123")
  })

  it("should delete secrets", async () => {
    const storage = new InMemorySecretStorage()
    await storage.setSecret("api_key", "sk-123")
    await storage.deleteSecret("api_key")
    const result = await storage.getSecret("api_key")
    expect(result).toBeUndefined()
  })
})

describe("NullLogger", () => {
  it("should not throw on any log method", () => {
    const logger = new NullLogger()
    expect(() => logger.debug("test")).not.toThrow()
    expect(() => logger.info("test")).not.toThrow()
    expect(() => logger.warn("test")).not.toThrow()
    expect(() => logger.error("test")).not.toThrow()
  })
})

describe("ConsoleLogger", () => {
  it("should be constructable with prefix", () => {
    const logger = new ConsoleLogger("TestPrefix")
    expect(logger).toBeDefined()
  })
})
