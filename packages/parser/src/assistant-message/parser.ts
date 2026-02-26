/**
 * AssistantMessageParser - Parses XML-based tool calls from assistant messages.
 *
 * Roo Code uses an XML-based protocol where the assistant includes tool calls
 * as XML tags within its response text. This parser extracts both text and tool
 * call blocks from the message.
 *
 * Example assistant message:
 *   I'll read that file for you.
 *   <read_file>
 *   <path>src/index.ts</path>
 *   </read_file>
 *
 * Parses to:
 *   [
 *     { type: "text", content: "I'll read that file for you.\n" },
 *     { type: "tool_use", name: "read_file", params: { path: "src/index.ts" } }
 *   ]
 */

import type { ParsedBlock, ParseResult, TextBlock, ToolUseBlock } from "./types.js"

/** All known tool tag names */
const TOOL_NAMES = new Set([
  "execute_command",
  "read_file",
  "write_to_file",
  "apply_diff",
  "insert_content",
  "search_and_replace",
  "search_files",
  "list_files",
  "list_code_definition_names",
  "browser_action",
  "use_mcp_tool",
  "access_mcp_resource",
  "ask_followup_question",
  "attempt_completion",
  "switch_mode",
  "new_task",
])

/**
 * Parse a complete assistant message into blocks.
 */
export function parseAssistantMessage(text: string): ParseResult {
  const blocks: ParsedBlock[] = []
  let remaining = text
  let textAccumulator = ""

  while (remaining.length > 0) {
    // Look for opening tool tag
    const toolMatch = findToolTag(remaining)

    if (!toolMatch) {
      // No more tool tags - rest is text
      textAccumulator += remaining
      remaining = ""
      break
    }

    // Add text before the tool tag
    textAccumulator += remaining.slice(0, toolMatch.startIndex)

    if (textAccumulator.length > 0) {
      blocks.push({ type: "text", content: textAccumulator })
      textAccumulator = ""
    }

    // Find closing tag
    const closingTag = `</${toolMatch.name}>`
    const closingIndex = remaining.indexOf(closingTag, toolMatch.contentStart)

    if (closingIndex === -1) {
      // No closing tag found - partial tool call
      const partialContent = remaining.slice(toolMatch.contentStart)
      const params = parseToolParams(partialContent, true)
      blocks.push({
        type: "tool_use",
        name: toolMatch.name,
        params,
        partial: true,
      })
      remaining = ""
    } else {
      // Complete tool call
      const content = remaining.slice(toolMatch.contentStart, closingIndex)
      const params = parseToolParams(content, false)
      blocks.push({
        type: "tool_use",
        name: toolMatch.name,
        params,
      })
      remaining = remaining.slice(closingIndex + closingTag.length)
    }
  }

  if (textAccumulator.length > 0) {
    blocks.push({ type: "text", content: textAccumulator })
  }

  return { blocks }
}

/**
 * Parse a partial (streaming) assistant message.
 * The last tool block may be marked as partial if the closing tag hasn't arrived.
 */
export function parsePartialAssistantMessage(text: string): ParseResult {
  return parseAssistantMessage(text)
}

interface ToolTagMatch {
  name: string
  startIndex: number
  contentStart: number
}

function findToolTag(text: string): ToolTagMatch | null {
  // Look for <tool_name> pattern
  const tagRegex = /<([a-z_]+)>/g
  let match: RegExpExecArray | null

  while ((match = tagRegex.exec(text)) !== null) {
    const name = match[1]!
    if (TOOL_NAMES.has(name)) {
      return {
        name,
        startIndex: match.index,
        contentStart: match.index + match[0].length,
      }
    }
  }

  return null
}

/**
 * Parse the inner content of a tool tag into key-value parameters.
 *
 * Tool parameters are encoded as XML tags:
 *   <path>src/index.ts</path>
 *   <content>hello world</content>
 */
function parseToolParams(content: string, _partial: boolean): Record<string, string> {
  const params: Record<string, string> = {}
  const paramRegex = /<([a-z_]+)>([\s\S]*?)(?:<\/\1>|$)/g
  let match: RegExpExecArray | null

  while ((match = paramRegex.exec(content)) !== null) {
    const key = match[1]!
    let value = match[2]!

    // Trim leading/trailing whitespace from param values
    value = value.replace(/^\n/, "").replace(/\n$/, "")

    params[key] = value
  }

  return params
}

export type { ParsedBlock, ParseResult, TextBlock, ToolUseBlock }
