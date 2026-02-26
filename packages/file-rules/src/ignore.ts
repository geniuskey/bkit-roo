/**
 * .rooignore file parser and matcher.
 * Compatible with .gitignore syntax.
 */

interface IgnoreRule {
  pattern: string
  negated: boolean
  regex: RegExp
  directoryOnly: boolean
}

/**
 * Parser and matcher for .rooignore rules.
 * Follows .gitignore syntax conventions.
 */
export class RooIgnore {
  private rules: IgnoreRule[]

  constructor(rules: IgnoreRule[]) {
    this.rules = rules
  }

  /**
   * Create a RooIgnore from file content (one rule per line).
   */
  static fromContent(content: string): RooIgnore {
    const lines = content.split("\n")
    const rules: IgnoreRule[] = []

    for (const rawLine of lines) {
      const line = rawLine.trim()
      // Skip empty lines and comments
      if (!line || line.startsWith("#")) continue

      const negated = line.startsWith("!")
      const pattern = negated ? line.slice(1) : line
      const directoryOnly = pattern.endsWith("/")
      const cleanPattern = directoryOnly ? pattern.slice(0, -1) : pattern

      rules.push({
        pattern: cleanPattern,
        negated,
        regex: globToRegex(cleanPattern),
        directoryOnly,
      })
    }

    return new RooIgnore(rules)
  }

  /**
   * Check if a file path should be ignored.
   * @param filePath - Relative path (forward slashes)
   * @param isDirectory - Whether the path is a directory
   */
  isIgnored(filePath: string, isDirectory = false): boolean {
    const normalizedPath = filePath.replace(/\\/g, "/").replace(/^\//, "")
    let ignored = false

    for (const rule of this.rules) {
      if (rule.directoryOnly && !isDirectory) continue

      const matches = this.matchesRule(normalizedPath, rule)
      if (matches) {
        ignored = !rule.negated
      }
    }

    return ignored
  }

  private matchesRule(filePath: string, rule: IgnoreRule): boolean {
    // If pattern has no slash, match against basename only
    if (!rule.pattern.includes("/")) {
      const basename = filePath.split("/").pop() ?? filePath
      return rule.regex.test(basename)
    }
    return rule.regex.test(filePath)
  }
}

/**
 * Convert a gitignore-style glob pattern to a RegExp.
 */
function globToRegex(pattern: string): RegExp {
  let regex = ""
  let i = 0

  while (i < pattern.length) {
    const char = pattern[i]!

    switch (char) {
      case "*":
        if (pattern[i + 1] === "*") {
          // ** matches everything including /
          if (pattern[i + 2] === "/") {
            regex += "(?:.*/)?";
            i += 3
          } else {
            regex += ".*"
            i += 2
          }
        } else {
          // * matches everything except /
          regex += "[^/]*"
          i++
        }
        break
      case "?":
        regex += "[^/]"
        i++
        break
      case ".":
        regex += "\\."
        i++
        break
      case "/":
        regex += "/"
        i++
        break
      case "[":
        // Character class
        regex += "["
        i++
        while (i < pattern.length && pattern[i] !== "]") {
          regex += pattern[i]
          i++
        }
        if (i < pattern.length) {
          regex += "]"
          i++
        }
        break
      default:
        // Escape special regex characters
        if ("(){}+^$|\\".includes(char)) {
          regex += "\\" + char
        } else {
          regex += char
        }
        i++
    }
  }

  return new RegExp(`^${regex}$`)
}
