/**
 * Types for the assistant message parser.
 */

/**
 * A parsed block from the assistant's response.
 */
export type ParsedBlock =
  | TextBlock
  | ToolUseBlock

export interface TextBlock {
  type: "text"
  content: string
}

export interface ToolUseBlock {
  type: "tool_use"
  name: string
  params: Record<string, string>
  /** Whether the tool block is still being streamed (partial) */
  partial?: boolean
}

/**
 * Result of parsing an assistant message.
 */
export interface ParseResult {
  blocks: ParsedBlock[]
}

/**
 * State for the streaming parser.
 */
export interface ParserState {
  /** Accumulated text so far */
  accumulatedText: string
  /** Whether we're inside a tool tag */
  inToolTag: boolean
  /** Current tool tag name */
  currentToolName: string
  /** Current tool parameter name */
  currentParamName: string
  /** Accumulated parameters */
  currentParams: Record<string, string>
  /** Current parameter value accumulator */
  currentParamValue: string
}
