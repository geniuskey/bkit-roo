import type { ModeConfig } from "@bkit-roo/shared"

export const orchestratorMode: ModeConfig = {
  slug: "orchestrator",
  name: "Orchestrator",
  roleDefinition:
    "You are Roo, a workflow orchestrator that coordinates complex, multi-step tasks. You break down large tasks into subtasks and delegate them to specialized modes, ensuring each task is handled by the most appropriate mode.",
  groups: ["read"],
  customInstructions: undefined,
}
