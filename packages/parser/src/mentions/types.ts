/**
 * Types for the mention parser.
 */

/**
 * Types of mentions that can appear in user messages.
 */
export type MentionType =
  | "file"
  | "folder"
  | "url"
  | "problems"
  | "git-changes"
  | "terminal"

/**
 * A parsed mention token.
 */
export interface MentionToken {
  type: MentionType
  /** The raw text of the mention (e.g., "@/src/index.ts") */
  raw: string
  /** The value extracted from the mention (e.g., "/src/index.ts") */
  value: string
  /** Start index in the original text */
  startIndex: number
  /** End index in the original text */
  endIndex: number
}

/**
 * A resolved context block from a mention.
 */
export interface MentionContextBlock {
  type: MentionType
  label: string
  content: string
}

/**
 * Interface for resolving mentions to their content.
 * Consumers must provide platform-specific implementations.
 */
export interface IMentionResolver {
  resolveFile(path: string): Promise<string | undefined>
  resolveFolder(path: string): Promise<string | undefined>
  resolveUrl(url: string): Promise<string | undefined>
  resolveProblems(): Promise<string | undefined>
  resolveGitChanges(): Promise<string | undefined>
  resolveTerminal(): Promise<string | undefined>
}
