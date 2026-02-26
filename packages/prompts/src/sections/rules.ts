/**
 * Rules section of the system prompt.
 * Ported from Roo Code's src/core/prompts/sections/rules.ts
 */

/**
 * Generate the rules section.
 */
export function buildRulesSection(): string {
  return `# Rules

- Your current working directory is always provided to you.
- You cannot \`cd\` into a different directory. You are stuck operating from the working directory.
- Do not use the ~ character or $HOME to refer to the home directory.
- Before using tools, think about what you need to do and which tool is best for the job.
- When creating or editing files, never output the content yourself. Always use the appropriate tool.
- When done with a task, use the attempt_completion tool to present the result.
- Do not ask for more information than necessary. Use the tools available to find information.
- NEVER end attempt_completion result with a question or request for further input.
- Only use attempt_completion when you are confident the task is complete.
- If you are unsure about something, use ask_followup_question instead.`
}
