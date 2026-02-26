/**
 * .rooprotected file parser and matcher.
 * Protects specified files from being modified by the AI agent.
 */

import { RooIgnore } from "./ignore.js"

/**
 * Parser and matcher for .rooprotected rules.
 * Uses the same syntax as .rooignore / .gitignore.
 * Protected files can be read but not written or modified.
 */
export class RooProtect {
  private matcher: RooIgnore

  private constructor(matcher: RooIgnore) {
    this.matcher = matcher
  }

  /**
   * Create a RooProtect from file content (one rule per line).
   */
  static fromContent(content: string): RooProtect {
    return new RooProtect(RooIgnore.fromContent(content))
  }

  /**
   * Check if a file path is protected.
   * @param filePath - Relative path (forward slashes)
   */
  isProtected(filePath: string): boolean {
    return this.matcher.isIgnored(filePath)
  }
}
