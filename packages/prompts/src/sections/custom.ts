/**
 * Custom instructions section of the system prompt.
 */

/**
 * Generate the custom instructions section.
 */
export function buildCustomInstructionsSection(
  customInstructions?: string,
  projectRules?: string[],
): string {
  const parts: string[] = []

  if (projectRules && projectRules.length > 0) {
    parts.push("# Project Rules\n")
    for (const rule of projectRules) {
      parts.push(rule)
    }
    parts.push("")
  }

  if (customInstructions) {
    parts.push("# Custom Instructions\n")
    parts.push(customInstructions)
    parts.push("")
  }

  return parts.join("\n")
}
