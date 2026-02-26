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

## Roo Code AI 어시스턴트 설정

이 프로젝트에는 VS Code [Roo Code](https://github.com/RooCodeInc/Roo-Code) 확장을 위한 AI 어시스턴트 설정이 포함되어 있습니다. Roo Code가 프로젝트 구조, 코딩 표준, 워크플로를 자동으로 이해하고 적절한 도움을 제공합니다.

### 적용 방법

1. **VS Code에 Roo Code 설치**
   - VS Code 마켓플레이스에서 [Roo Code](https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline) 검색 후 설치
   - 또는 터미널에서: `code --install-extension RooVeterinaryInc.roo-cline`

2. **프로젝트 열기**
   - VS Code에서 이 프로젝트 루트(`bkit-roo/`)를 연다
   - Roo Code가 `.roomodes`, `.roo/`, `.rooignore`를 **자동으로 인식**한다 (별도 설정 불필요)

3. **모드 전환**
   - Roo Code 패널에서 모드 선택 드롭다운을 클릭하면 커스텀 모드가 표시된다

### 설정 파일 구조

```
.roomodes                            # 커스텀 모드 정의 (YAML)
.rooignore                           # AI 컨텍스트 제외 패턴

.roo/
├── rules/                           # 모든 모드에 적용되는 공통 규칙
│   ├── 01-project-overview.md       #   프로젝트 구조, 핵심 원칙
│   ├── 02-development-workflow.md   #   빌드/테스트 명령어, 검증 파이프라인
│   └── 03-coding-standards.md       #   TypeScript 설정, 네이밍, 의존성 규칙
│
├── rules-code/                      # Code 모드 전용
│   └── 01-implementation-rules.md   #   VS Code 의존성 대체 패턴, 금지 사항
│
├── rules-architect/                 # Architect 모드 전용
│   └── 01-architecture-rules.md     #   패키지 계층 그래프, 미완성 영역
│
├── rules-migrator/                  # Migrator 모드 전용
│   └── 01-migration-rules.md        #   원본-타겟 매핑, 이식 워크플로
│
├── rules-tester/                    # Tester 모드 전용
│   └── 01-testing-rules.md          #   Vitest 패턴, 모킹 전략
│
├── skills/                          # 모든 모드에서 사용 가능한 스킬
│   ├── new-package/SKILL.md         #   새 패키지 스캐폴딩
│   ├── migrate-module/SKILL.md      #   코드 이식 절차
│   └── verify-build/SKILL.md        #   빌드 검증 파이프라인
│
└── skills-migrator/                 # Migrator 모드 전용 스킬
    └── migrate-module/SKILL.md      #   이식 전용 상세 가이드
```

### 커스텀 모드

| 모드 | 용도 | 파일 권한 |
|------|------|----------|
| **Migrator** | `reference/roo-code/src/`에서 bkit-roo로 코드 이식 | `packages/**/*.ts`, `*.json` 편집 가능 |
| **Tester** | 테스트 작성 및 실행 | `*.test.ts`, `__tests__/` 편집 가능 |
| **Documenter** | TSDoc, README, 가이드 작성 | `*.md`, `*.ts` 편집 가능 |

기본 제공 모드(Code, Architect, Ask, Debug)도 프로젝트 규칙이 자동 적용됩니다.

### 스킬 사용법

Roo Code 채팅에서 관련 작업을 요청하면 스킬이 자동으로 활성화됩니다:

- **"새 패키지 만들어줘"** → `new-package` 스킬: 패키지 스캐폴딩 자동 생성
- **"원본 코드 이식해줘"** → `migrate-module` 스킬: VS Code 의존성 제거 가이드 제공
- **"빌드 검증해줘"** → `verify-build` 스킬: build → typecheck → check-vscode → test 순서 실행

### 규칙 동작 방식

- `.roo/rules/` 파일들은 **모든 모드**에서 시스템 프롬프트에 자동 추가된다
- `.roo/rules-{mode}/` 파일들은 **해당 모드에서만** 추가된다
- 파일명의 숫자 접두사(`01-`, `02-`, `03-`)가 로딩 순서를 결정한다
- `.rooignore`에 지정된 경로는 AI가 읽지 않는다 (`dist/`, `node_modules/` 등)

### 커스터마이징

**새 규칙 추가:**
```bash
# 모든 모드에 적용
echo "# 새 규칙 내용" > .roo/rules/04-new-rule.md

# 특정 모드에만 적용
echo "# Code 모드 규칙" > .roo/rules-code/02-new-code-rule.md
```

**새 스킬 추가:**
```bash
mkdir -p .roo/skills/my-skill
cat > .roo/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: 스킬 설명 (AI가 이 설명을 보고 스킬을 선택한다)
---

# 스킬 지침

1. 단계 1
2. 단계 2
EOF
```

**새 커스텀 모드 추가** (`.roomodes` 편집):
```yaml
customModes:
  - slug: my-mode
    name: My Mode
    description: 모드 설명
    roleDefinition: AI에게 부여할 역할 정의
    groups:
      - read              # 읽기 도구 전체 허용
      - - edit             # 편집 도구를 fileRegex로 제한
        - fileRegex: "\\.ts$"
      - command            # 명령어 실행 허용
```

## License

Apache-2.0 — Same as [Roo Code](https://github.com/RooCodeInc/Roo-Code).
