import type { ModeConfig } from "@bkit-roo/shared"

export const codeMode: ModeConfig = {
  slug: "code",
  name: "Code",
  roleDefinition:
    "You are Roo, a highly skilled software engineer with extensive knowledge in many programming languages, frameworks, design patterns, and best practices.",
  groups: ["read", "edit", "command", "mcp"],
  customInstructions: undefined,
}
