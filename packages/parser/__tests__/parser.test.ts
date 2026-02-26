import { describe, it, expect } from "vitest"
import {
  parseAssistantMessage,
  parsePartialAssistantMessage,
  parseMentions,
  stripMentions,
} from "../src/index.js"

describe("parseAssistantMessage", () => {
  it("should parse text-only messages", () => {
    const result = parseAssistantMessage("Hello, how can I help?")
    expect(result.blocks).toHaveLength(1)
    expect(result.blocks[0]!.type).toBe("text")
    expect((result.blocks[0] as any).content).toBe("Hello, how can I help?")
  })

  it("should parse a single tool call", () => {
    const message = `I'll read that file for you.
<read_file>
<path>src/index.ts</path>
</read_file>`

    const result = parseAssistantMessage(message)
    expect(result.blocks).toHaveLength(2)

    expect(result.blocks[0]!.type).toBe("text")
    expect((result.blocks[0] as any).content).toBe("I'll read that file for you.\n")

    expect(result.blocks[1]!.type).toBe("tool_use")
    expect((result.blocks[1] as any).name).toBe("read_file")
    expect((result.blocks[1] as any).params.path).toBe("src/index.ts")
  })

  it("should parse multiple tool calls", () => {
    const message = `Let me search and then write.
<search_files>
<path>src</path>
<regex>TODO</regex>
</search_files>
Now writing:
<write_to_file>
<path>output.txt</path>
<content>Done</content>
</write_to_file>`

    const result = parseAssistantMessage(message)
    expect(result.blocks).toHaveLength(4)
    expect(result.blocks[0]!.type).toBe("text")
    expect(result.blocks[1]!.type).toBe("tool_use")
    expect((result.blocks[1] as any).name).toBe("search_files")
    expect(result.blocks[2]!.type).toBe("text")
    expect(result.blocks[3]!.type).toBe("tool_use")
    expect((result.blocks[3] as any).name).toBe("write_to_file")
  })

  it("should parse tool with multi-line content parameter", () => {
    const message = `<write_to_file>
<path>hello.ts</path>
<content>
function hello() {
  console.log("hello")
}
</content>
</write_to_file>`

    const result = parseAssistantMessage(message)
    expect(result.blocks).toHaveLength(1)
    expect(result.blocks[0]!.type).toBe("tool_use")
    const params = (result.blocks[0] as any).params
    expect(params.path).toBe("hello.ts")
    expect(params.content).toContain("function hello()")
  })

  it("should handle attempt_completion", () => {
    const message = `<attempt_completion>
<result>I have completed the task. The file has been created.</result>
</attempt_completion>`

    const result = parseAssistantMessage(message)
    expect(result.blocks).toHaveLength(1)
    expect((result.blocks[0] as any).name).toBe("attempt_completion")
    expect((result.blocks[0] as any).params.result).toContain("completed the task")
  })

  it("should mark partial tool calls when closing tag is missing", () => {
    const message = `<read_file>
<path>src/index.ts</path>`

    const result = parsePartialAssistantMessage(message)
    expect(result.blocks).toHaveLength(1)
    expect(result.blocks[0]!.type).toBe("tool_use")
    expect((result.blocks[0] as any).partial).toBe(true)
  })

  it("should handle empty messages", () => {
    const result = parseAssistantMessage("")
    expect(result.blocks).toHaveLength(0)
  })

  it("should ignore unknown XML tags", () => {
    const message = "<unknown_tag>some content</unknown_tag>"
    const result = parseAssistantMessage(message)
    expect(result.blocks).toHaveLength(1)
    expect(result.blocks[0]!.type).toBe("text")
  })
})

describe("parseMentions", () => {
  it("should parse file mentions", () => {
    const tokens = parseMentions("Look at @/src/index.ts for details")
    expect(tokens).toHaveLength(1)
    expect(tokens[0]!.type).toBe("file")
    expect(tokens[0]!.value).toBe("/src/index.ts")
  })

  it("should parse folder mentions", () => {
    const tokens = parseMentions("Check @/src/components/ directory")
    expect(tokens).toHaveLength(1)
    expect(tokens[0]!.type).toBe("folder")
    expect(tokens[0]!.value).toBe("/src/components/")
  })

  it("should parse url mentions", () => {
    const tokens = parseMentions("See @url:https://example.com for docs")
    expect(tokens).toHaveLength(1)
    expect(tokens[0]!.type).toBe("url")
    expect(tokens[0]!.value).toBe("https://example.com")
  })

  it("should parse special mentions", () => {
    const tokens = parseMentions("Check @problems and @git-changes and @terminal")
    expect(tokens).toHaveLength(3)
    expect(tokens.map((t) => t.type)).toEqual(["problems", "git-changes", "terminal"])
  })

  it("should parse multiple mentions", () => {
    const tokens = parseMentions("Compare @/file1.ts and @/file2.ts")
    expect(tokens).toHaveLength(2)
  })

  it("should handle text without mentions", () => {
    const tokens = parseMentions("No mentions here")
    expect(tokens).toHaveLength(0)
  })
})

describe("stripMentions", () => {
  it("should remove mentions from text", () => {
    const result = stripMentions("Look at @/src/index.ts please")
    expect(result).toBe("Look at  please")
  })

  it("should handle text without mentions", () => {
    const result = stripMentions("No mentions here")
    expect(result).toBe("No mentions here")
  })
})
