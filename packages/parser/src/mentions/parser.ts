/**
 * Mention parser - Parses @-mentions in user messages.
 *
 * Supports:
 *   @/path/to/file - File reference
 *   @/path/to/folder/ - Folder reference (trailing slash)
 *   @url:https://example.com - URL reference
 *   @problems - Workspace diagnostics
 *   @git-changes - Git diff
 *   @terminal - Last terminal output
 */

import type { MentionToken, MentionType, MentionContextBlock, IMentionResolver } from "./types.js"

/**
 * Parse all mentions from a text string.
 */
export function parseMentions(text: string): MentionToken[] {
  const tokens: MentionToken[] = []

  // Match @-mentions: @/path, @url:..., @problems, @git-changes, @terminal
  const mentionRegex = /@(\/[^\s]+|url:\S+|problems|git-changes|terminal)/g
  let match: RegExpExecArray | null

  while ((match = mentionRegex.exec(text)) !== null) {
    const raw = match[0]!
    const value = match[1]!
    const type = classifyMention(value)

    tokens.push({
      type,
      raw,
      value: extractMentionValue(type, value),
      startIndex: match.index,
      endIndex: match.index + raw.length,
    })
  }

  return tokens
}

/**
 * Replace mentions in text with their resolved content labels.
 */
export function stripMentions(text: string): string {
  return text.replace(/@(\/[^\s]+|url:\S+|problems|git-changes|terminal)/g, "").trim()
}

/**
 * Resolve mentions to context blocks using a platform-specific resolver.
 */
export async function resolveMentions(
  tokens: MentionToken[],
  resolver: IMentionResolver,
): Promise<MentionContextBlock[]> {
  const blocks: MentionContextBlock[] = []

  for (const token of tokens) {
    let content: string | undefined

    switch (token.type) {
      case "file":
        content = await resolver.resolveFile(token.value)
        break
      case "folder":
        content = await resolver.resolveFolder(token.value)
        break
      case "url":
        content = await resolver.resolveUrl(token.value)
        break
      case "problems":
        content = await resolver.resolveProblems()
        break
      case "git-changes":
        content = await resolver.resolveGitChanges()
        break
      case "terminal":
        content = await resolver.resolveTerminal()
        break
    }

    if (content !== undefined) {
      blocks.push({
        type: token.type,
        label: token.raw,
        content,
      })
    }
  }

  return blocks
}

function classifyMention(value: string): MentionType {
  if (value.startsWith("url:")) return "url"
  if (value === "problems") return "problems"
  if (value === "git-changes") return "git-changes"
  if (value === "terminal") return "terminal"
  if (value.endsWith("/")) return "folder"
  return "file"
}

function extractMentionValue(type: MentionType, rawValue: string): string {
  if (type === "url") return rawValue.slice(4) // Remove "url:" prefix
  return rawValue
}
