import { describe, it, expect } from "vitest"
import { RooIgnore, RooProtect } from "../src/index.js"

describe("RooIgnore", () => {
  it("should ignore files matching simple patterns", () => {
    const ignore = RooIgnore.fromContent("*.log\n*.tmp")
    expect(ignore.isIgnored("debug.log")).toBe(true)
    expect(ignore.isIgnored("temp.tmp")).toBe(true)
    expect(ignore.isIgnored("index.ts")).toBe(false)
  })

  it("should handle directory patterns", () => {
    const ignore = RooIgnore.fromContent("node_modules/\nbuild/")
    expect(ignore.isIgnored("node_modules", true)).toBe(true)
    expect(ignore.isIgnored("node_modules", false)).toBe(false) // file, not directory
    expect(ignore.isIgnored("build", true)).toBe(true)
  })

  it("should handle negation patterns", () => {
    const ignore = RooIgnore.fromContent("*.log\n!important.log")
    expect(ignore.isIgnored("debug.log")).toBe(true)
    expect(ignore.isIgnored("important.log")).toBe(false)
  })

  it("should handle ** glob patterns", () => {
    const ignore = RooIgnore.fromContent("**/test/**")
    expect(ignore.isIgnored("test/file.ts")).toBe(true)
    expect(ignore.isIgnored("src/test/file.ts")).toBe(true)
  })

  it("should skip comments and empty lines", () => {
    const ignore = RooIgnore.fromContent("# This is a comment\n\n*.log\n  # Another comment")
    expect(ignore.isIgnored("debug.log")).toBe(true)
    expect(ignore.isIgnored("# This is a comment")).toBe(false)
  })

  it("should normalize Windows paths", () => {
    const ignore = RooIgnore.fromContent("*.log")
    expect(ignore.isIgnored("path\\to\\debug.log")).toBe(true)
  })

  it("should handle path-based patterns", () => {
    const ignore = RooIgnore.fromContent("src/*.test.ts")
    expect(ignore.isIgnored("src/app.test.ts")).toBe(true)
    expect(ignore.isIgnored("lib/app.test.ts")).toBe(false)
  })
})

describe("RooProtect", () => {
  it("should protect files matching patterns", () => {
    const protect = RooProtect.fromContent("*.env\nsecrets/")
    expect(protect.isProtected(".env")).toBe(true)
    expect(protect.isProtected("production.env")).toBe(true)
    expect(protect.isProtected("index.ts")).toBe(false)
  })

  it("should handle complex protection rules", () => {
    const protect = RooProtect.fromContent("package-lock.json\nyarn.lock\n*.key\n*.pem")
    expect(protect.isProtected("package-lock.json")).toBe(true)
    expect(protect.isProtected("yarn.lock")).toBe(true)
    expect(protect.isProtected("server.key")).toBe(true)
    expect(protect.isProtected("cert.pem")).toBe(true)
    expect(protect.isProtected("index.js")).toBe(false)
  })
})
