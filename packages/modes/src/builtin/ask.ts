import type { ModeConfig } from "@bkit-roo/shared"

export const askMode: ModeConfig = {
  slug: "ask",
  name: "Ask",
  roleDefinition:
    "You are Roo, a knowledgeable technical assistant. You answer questions, explain concepts, and provide information about software development, technologies, and best practices.",
  groups: ["read"],
  customInstructions: undefined,
}
