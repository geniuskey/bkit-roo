# bkit-roo

**Backend Kit for Roo** — Platform-independent core modules extracted from [Roo Code](https://github.com/RooCodeInc/Roo-Code) VS Code extension.

Build AI coding agents for **any platform** — CLI, web servers, JetBrains plugins, Electron apps — using the same battle-tested core that powers Roo Code.

## Packages

| Package | Description |
|---------|-------------|
| `@bkit-roo/shared` | Shared types, platform abstraction interfaces, model constants |
| `@bkit-roo/api-client` | Multi-provider LLM client (Anthropic, OpenAI, Gemini, OpenRouter, Ollama, 15+ more) |
| `@bkit-roo/parser` | Assistant message XML parser + @-mention parser |
| `@bkit-roo/prompts` | Dynamic system prompt generation engine |
| `@bkit-roo/tools` | Tool definitions, group-based permissions, approval gate |
| `@bkit-roo/modes` | Built-in modes (Code, Architect, Ask, Debug, Orchestrator) + custom modes |
| `@bkit-roo/mcp-client` | Model Context Protocol (MCP) server hub |
| `@bkit-roo/context` | Token budgeting, conversation condensation, message history |
| `@bkit-roo/cost` | Token pricing and cost calculation |
| `@bkit-roo/file-rules` | .rooignore / .rooprotected file rule system |
| `@bkit-roo/core` | Integrated AgentRunner orchestrator |

## Quick Start

### Simple Chat

```typescript
import { buildApiHandler } from "@bkit-roo/api-client"

const handler = buildApiHandler({
  apiProvider: "anthropic",
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const stream = handler.createMessage(
  "You are a helpful assistant.",
  [{ role: "user", content: "Explain TypeScript generics in 3 sentences." }],
)

for await (const chunk of stream) {
  if (chunk.type === "text") process.stdout.write(chunk.text)
}
```

### Full AI Agent

```typescript
import { AgentRunner } from "@bkit-roo/core"
import { AutoApprovalGate, InMemoryConfigStorage } from "@bkit-roo/shared"

const agent = new AgentRunner({
  apiConfig: { apiProvider: "anthropic", apiKey: "sk-..." },
  fileSystem: myFileSystemImpl,    // implement IFileSystem
  terminal: myTerminalImpl,         // implement ITerminalExecutor
  approvalGate: new AutoApprovalGate(),
  storage: new InMemoryConfigStorage(),
  cwd: process.cwd(),
  mode: "code",
})

const result = await agent.runTask("Create a hello world Express server")
console.log(result.result) // completion message
console.log(result.totalCost) // $ spent
```

## Architecture

```
┌──────────────────────────────────────────┐
│           Your Application               │
│  (CLI / Web / IDE Plugin / Electron)     │
└─────────────────┬────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│           @bkit-roo/core                 │
│         AgentRunner                      │
│   message → LLM → parse → tool → repeat │
└──┬───┬───┬───┬───┬───┬───┬───┬───┬──────┘
   │   │   │   │   │   │   │   │   │
   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼
 api- pars- prom- tool  mod- mcp- cont- cost file-
 cli- er   pts   s    es   cli-  ext       rul-
 ent                      ent              es
```

## Platform Abstraction

bkit-roo has **zero dependency** on VS Code. All platform-specific operations are abstracted through interfaces:

| Interface | What it replaces |
|-----------|-----------------|
| `IFileSystem` | `vscode.workspace.fs` |
| `ITerminalExecutor` | `vscode.window.createTerminal` |
| `IApprovalGate` | VS Code webview approval dialogs |
| `IConfigStorage` | `vscode.ExtensionContext.globalState` |
| `ISecretStorage` | `vscode.SecretStorage` |
| `ILogger` | `vscode.OutputChannel` |

Provide your own implementations, or use the built-in defaults:
- `AutoApprovalGate` — always approves (for non-interactive use)
- `InMemoryConfigStorage` / `InMemorySecretStorage` — ephemeral storage
- `ConsoleLogger` / `NullLogger` — stdout or silent logging

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Verify no VS Code imports
pnpm check-vscode
```

## License

Apache-2.0 — Same as [Roo Code](https://github.com/RooCodeInc/Roo-Code).
