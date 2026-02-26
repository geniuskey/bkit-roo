# TRD: Roo Code 이식 가능 핵심 모듈 라이브러리 (bkit-roo)

## 1. 기술 아키텍처 개요

### 1.1 설계 원칙

1. **플랫폼 무관성**: VS Code API(`import * as vscode`)에 대한 참조를 완전히 제거
2. **인터페이스 추상화**: 파일 시스템, 터미널, UI 등 플랫폼 의존 기능은 인터페이스로 추상화
3. **최소 의존성**: 외부 의존성을 최소화하고 필수적인 SDK만 포함
4. **모듈 독립성**: 각 패키지는 독립적으로 사용 가능하되, 조합 시 시너지 제공
5. **원본 호환성**: 원본 Roo Code의 동작과 최대한 동일한 결과 보장

### 1.2 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    소비자(Consumers)                          │
│   CLI App │ Web Server │ JetBrains Plugin │ Electron App    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  @bkit-roo/core (오케스트레이터)               │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐   │
│  │  Agent   │  │  Task    │  │ Context  │  │  Message    │   │
│  │ Runner   │  │ Manager  │  │ Manager  │  │  Manager    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘   │
└───────┼──────────────┼────────────┼───────────────┼─────────┘
        │              │            │               │
        ▼              ▼            ▼               ▼
┌──────────────┐ ┌───────────┐ ┌──────────┐ ┌─────────────┐
│ @bkit-roo/   │ │ @bkit-roo/│ │@bkit-roo/│ │ @bkit-roo/  │
│ api-client   │ │ prompts   │ │ modes    │ │ mcp-client  │
│              │ │           │ │          │ │             │
│ - Anthropic  │ │ - System  │ │ - Built  │ │ - Server    │
│ - OpenAI     │ │   Prompt  │ │   -in    │ │   Manager   │
│ - Google     │ │ - Tool    │ │ - Custom │ │ - Tool      │
│ - OpenRouter │ │   Desc    │ │ - Perms  │ │   Invoker   │
│ - Ollama     │ │ - Custom  │ │ - Sticky │ │ - Resource  │
│ - 15+ more   │ │   Rules   │ │   Model  │ │   Access    │
└──────────────┘ └───────────┘ └──────────┘ └─────────────┘

┌──────────────┐ ┌───────────┐ ┌──────────┐ ┌─────────────┐
│ @bkit-roo/   │ │ @bkit-roo/│ │@bkit-roo/│ │ @bkit-roo/  │
│ parser       │ │ tools     │ │ cost     │ │ file-rules  │
│              │ │           │ │          │ │             │
│ - Assistant  │ │ - Schema  │ │ - Token  │ │ - Ignore    │
│   Message    │ │ - Groups  │ │   Price  │ │ - Protect   │
│ - XML Parse  │ │ - Approve │ │ - Calc   │ │ - Glob      │
│ - Streaming  │ │   Gate    │ │ - Metric │ │   Match     │
│ - Mentions   │ │ - Execute │ │          │ │             │
└──────────────┘ └───────────┘ └──────────┘ └─────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    @bkit-roo/shared                           │
│  Types │ Interfaces │ Constants │ Utilities                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 패키지 설계

### 2.1 모노레포 구조

```
bkit-roo/
├── docs/                          # 프로젝트 문서
│   ├── PRD.md
│   ├── TRD.md
│   └── TASKS.md
├── packages/
│   ├── shared/                    # @bkit-roo/shared
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── api.ts         # API 설정, 프로바이더 타입
│   │   │   │   ├── messages.ts    # 메시지 타입 (Anthropic 메시지 포맷)
│   │   │   │   ├── tools.ts       # 도구 정의 타입
│   │   │   │   ├── modes.ts       # 모드 정의 타입
│   │   │   │   ├── mcp.ts         # MCP 관련 타입
│   │   │   │   └── index.ts
│   │   │   ├── interfaces/
│   │   │   │   ├── file-system.ts # 파일 시스템 추상화 인터페이스
│   │   │   │   ├── terminal.ts    # 터미널 실행 추상화 인터페이스
│   │   │   │   ├── approval.ts    # 도구 승인 게이트 인터페이스
│   │   │   │   ├── storage.ts     # 설정 저장소 추상화 인터페이스
│   │   │   │   └── index.ts
│   │   │   ├── constants/
│   │   │   │   ├── models.ts      # 모델 ID, 컨텍스트 윈도우 크기
│   │   │   │   ├── tool-groups.ts # 도구 그룹 정의
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api-client/                # @bkit-roo/api-client
│   │   ├── src/
│   │   │   ├── index.ts           # buildApiHandler() 팩토리
│   │   │   ├── base-handler.ts    # 추상 기본 핸들러
│   │   │   ├── providers/
│   │   │   │   ├── anthropic.ts
│   │   │   │   ├── openai.ts
│   │   │   │   ├── google.ts
│   │   │   │   ├── openrouter.ts
│   │   │   │   ├── ollama.ts
│   │   │   │   ├── bedrock.ts
│   │   │   │   ├── vertex.ts
│   │   │   │   ├── mistral.ts
│   │   │   │   ├── deepseek.ts
│   │   │   │   └── ... (기타 프로바이더)
│   │   │   ├── fetchers/
│   │   │   │   ├── model-cache.ts # 모델 목록 캐시
│   │   │   │   └── provider-fetchers.ts
│   │   │   └── transform/
│   │   │       ├── message-transform.ts # 메시지 포맷 변환
│   │   │       └── stream-transform.ts  # 스트림 응답 변환
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── parser/                    # @bkit-roo/parser
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── assistant-message/
│   │   │   │   ├── parser.ts      # AssistantMessageParser
│   │   │   │   ├── types.ts       # 파싱 결과 타입
│   │   │   │   └── streaming.ts   # 스트리밍 파서
│   │   │   └── mentions/
│   │   │       ├── parser.ts      # 멘션 구문 분석기
│   │   │       ├── types.ts       # 멘션 타입 정의
│   │   │       └── resolver.ts    # 멘션 → 컨텍스트 블록 변환 (인터페이스)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── prompts/                   # @bkit-roo/prompts
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── system-prompt.ts   # generateSystemPrompt()
│   │   │   ├── sections/
│   │   │   │   ├── role.ts        # 역할 정의 섹션
│   │   │   │   ├── tools.ts       # 도구 설명 섹션
│   │   │   │   ├── capabilities.ts # 기능 목록 섹션
│   │   │   │   ├── rules.ts       # 규칙 섹션
│   │   │   │   └── custom.ts      # 커스텀 프롬프트 병합
│   │   │   └── templates/
│   │   │       └── default.ts     # 기본 프롬프트 템플릿
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── tools/                     # @bkit-roo/tools
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── schema/
│   │   │   │   ├── definitions.ts # 모든 도구 정의 (이름, 파라미터, 설명)
│   │   │   │   └── groups.ts      # 도구 그룹 (read, edit, command, mcp)
│   │   │   ├── approval/
│   │   │   │   └── gate.ts        # 승인 게이트 (인터페이스 기반)
│   │   │   └── executor/
│   │   │       ├── base.ts        # 도구 실행기 추상 클래스
│   │   │       └── types.ts       # 실행 결과 타입
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── modes/                     # @bkit-roo/modes
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── builtin/
│   │   │   │   ├── code.ts
│   │   │   │   ├── architect.ts
│   │   │   │   ├── ask.ts
│   │   │   │   ├── debug.ts
│   │   │   │   └── orchestrator.ts
│   │   │   ├── custom-modes-manager.ts
│   │   │   └── mode-permissions.ts # 모드별 도구 권한 로직
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── mcp-client/                # @bkit-roo/mcp-client
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── server-manager.ts  # McpServerManager
│   │   │   ├── hub.ts             # McpHub (서버 연결 조정)
│   │   │   ├── transports/
│   │   │   │   ├── stdio.ts
│   │   │   │   ├── sse.ts
│   │   │   │   └── streamable-http.ts
│   │   │   └── config/
│   │   │       └── settings-loader.ts # 설정 파일 로딩
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── context/                   # @bkit-roo/context
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── token-budget.ts    # 토큰 예산 계산
│   │   │   ├── window-tracker.ts  # 컨텍스트 윈도우 추적
│   │   │   ├── condenser.ts       # 대화 압축/요약
│   │   │   ├── file-tracker.ts    # 파일 컨텍스트 추적
│   │   │   └── message-history.ts # 메시지 이력 관리
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── cost/                      # @bkit-roo/cost
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── pricing.ts         # 프로바이더별 토큰 가격
│   │   │   ├── calculator.ts      # 비용 계산기
│   │   │   └── metrics.ts         # API 메트릭 집계
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── file-rules/                # @bkit-roo/file-rules
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── ignore.ts          # .rooignore 규칙 파서
│   │   │   ├── protect.ts         # .rooprotected 규칙 파서
│   │   │   └── glob-matcher.ts    # 경로 패턴 매칭
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── core/                      # @bkit-roo/core (통합 오케스트레이터)
│       ├── src/
│       │   ├── index.ts
│       │   ├── agent-runner.ts    # 에이전트 실행 루프
│       │   ├── task-manager.ts    # 태스크 상태 머신
│       │   ├── config-proxy.ts    # 설정 프록시 (3계층 저장소)
│       │   └── orchestrator.ts    # 전체 파이프라인 조정
│       ├── package.json
│       └── tsconfig.json
│
├── examples/                      # 사용 예제
│   ├── cli-agent/                 # CLI 에이전트 예제
│   └── simple-chat/               # 간단한 채팅 예제
│
├── package.json                   # 루트 패키지 (워크스페이스)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── turbo.json                     # Turborepo 설정
└── .github/
    └── workflows/
        └── ci.yml
```

### 2.2 패키지 의존 관계

```
@bkit-roo/shared          ← 모든 패키지의 기반
    ↑
    ├── @bkit-roo/cost     (shared)
    ├── @bkit-roo/file-rules (shared)
    ├── @bkit-roo/parser   (shared)
    ├── @bkit-roo/tools    (shared)
    ├── @bkit-roo/modes    (shared, tools)
    ├── @bkit-roo/api-client (shared, cost)
    ├── @bkit-roo/prompts  (shared, tools, modes)
    ├── @bkit-roo/mcp-client (shared, tools)
    ├── @bkit-roo/context  (shared, api-client, cost)
    └── @bkit-roo/core     (모든 패키지에 의존)
```

---

## 3. 모듈별 기술 설계

### 3.1 @bkit-roo/shared

**목적**: 모든 패키지가 공유하는 타입, 인터페이스, 상수 정의

**핵심 인터페이스 설계**:

```typescript
// interfaces/file-system.ts
export interface IFileSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  listFiles(dir: string, recursive?: boolean): Promise<string[]>;
  stat(path: string): Promise<FileStat>;
}

// interfaces/terminal.ts
export interface ITerminalExecutor {
  execute(command: string, cwd?: string): Promise<TerminalResult>;
  executeStream(command: string, cwd?: string): AsyncIterable<string>;
}

// interfaces/approval.ts
export interface IApprovalGate {
  requestApproval(tool: string, params: Record<string, unknown>): Promise<ApprovalResult>;
}
export type ApprovalResult = { approved: true } | { approved: false; reason: string };

// interfaces/storage.ts
export interface IConfigStorage {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  getSecret(key: string): Promise<string | undefined>;
  setSecret(key: string, value: string): Promise<void>;
}
```

**설계 근거**: VS Code의 `vscode.workspace.fs`, `vscode.window.createTerminal`, `vscode.SecretStorage` 등을 추상화된 인터페이스로 대체하여 소비자가 자체 구현을 주입할 수 있게 한다.

### 3.2 @bkit-roo/api-client

**목적**: 20+ LLM 프로바이더에 대한 통합 API 클라이언트

**핵심 설계**:

```typescript
// 팩토리 패턴
export function buildApiHandler(config: ApiConfiguration): ApiHandler {
  switch (config.apiProvider) {
    case "anthropic": return new AnthropicHandler(config);
    case "openai": return new OpenAiHandler(config);
    case "google": return new GoogleHandler(config);
    // ... 20+ providers
  }
}

// 통합 핸들러 인터페이스
export interface ApiHandler {
  createMessage(params: CreateMessageParams): ApiStream;
  getModel(): { id: string; info: ModelInfo };
  completePrompt?(prompt: string): Promise<string>;
}

// 스트리밍 응답 타입
export type ApiStream = AsyncGenerator<ApiStreamEvent>;
export type ApiStreamEvent =
  | { type: "text"; text: string }
  | { type: "usage"; inputTokens: number; outputTokens: number }
  | { type: "reasoning"; text: string };
```

**VS Code 의존성 제거 포인트**:
- 원본에서 `vscode.SecretStorage`로 API 키를 관리하는 부분 → `IConfigStorage` 인터페이스로 대체
- 원본에서 `vscode.window.showInformationMessage`로 오류 알림 → 이벤트 에미터 패턴으로 대체

### 3.3 @bkit-roo/parser

**목적**: AI 어시스턴트 응답 파싱 및 멘션 구문 분석

**핵심 설계**:

```typescript
// 어시스턴트 메시지 파서
export class AssistantMessageParser {
  static parseAssistantMessage(text: string): ParsedMessage;
  static parsePartial(text: string): PartialParsedMessage; // 스트리밍용
}

export interface ParsedMessage {
  blocks: MessageBlock[];
}

export type MessageBlock =
  | { type: "text"; content: string }
  | { type: "tool_use"; name: string; params: Record<string, string> };

// 멘션 파서
export class MentionParser {
  static parse(text: string): MentionToken[];
  static resolve(tokens: MentionToken[], resolver: IMentionResolver): Promise<ContextBlock[]>;
}
```

**이식 포인트**: 원본은 XML 태그 파싱 시 특별한 외부 의존성이 없는 순수 문자열 처리를 사용하므로, 거의 변경 없이 이식 가능하다.

### 3.4 @bkit-roo/prompts

**목적**: 동적 시스템 프롬프트 생성

**핵심 설계**:

```typescript
export interface PromptGenerationContext {
  mode: ModeConfig;
  tools: ToolDefinition[];
  mcpTools?: McpToolInfo[];
  customInstructions?: string;
  projectRules?: string[];
  capabilities: string[];
  cwd: string;
}

export function generateSystemPrompt(ctx: PromptGenerationContext): string;
```

**VS Code 의존성 제거 포인트**:
- 원본에서 `vscode.workspace.workspaceFolders`로 작업 디렉토리 획득 → `cwd` 파라미터로 직접 전달
- 원본에서 VS Code 설정으로 기능 토글 → `PromptGenerationContext`에 명시적 전달

### 3.5 @bkit-roo/tools

**목적**: 도구 정의, 분류, 승인 게이트 프레임워크

**핵심 설계**:

```typescript
export interface ToolDefinition {
  name: string;
  group: ToolGroup;
  description: string;
  parameters: ToolParameter[];
}

export type ToolGroup = "read" | "edit" | "command" | "mcp";

export interface ToolExecutor<TParams, TResult> {
  execute(params: TParams, gate: IApprovalGate): Promise<ToolExecutionResult<TResult>>;
}

export type ToolExecutionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
  | { denied: true; reason: string };
```

**설계 근거**: 도구의 **정의(schema)**와 **실행(execution)**을 분리한다. 정의는 완전히 이식 가능하고, 실행은 플랫폼에 따라 다른 구현체를 주입한다.

### 3.6 @bkit-roo/modes

**목적**: 빌트인 및 커스텀 모드 관리

**핵심 설계**:

```typescript
export interface ModeConfig {
  slug: string;
  name: string;
  roleDefinition: string;
  groups: ToolGroup[];
  customInstructions?: string;
  stickyModelId?: string;
}

export class CustomModesManager {
  constructor(storage: IConfigStorage);
  getBuiltinModes(): ModeConfig[];
  getCustomModes(): Promise<ModeConfig[]>;
  getAllModes(): Promise<ModeConfig[]>;
  createMode(config: ModeConfig): Promise<void>;
  updateMode(slug: string, updates: Partial<ModeConfig>): Promise<void>;
  deleteMode(slug: string): Promise<void>;
}
```

### 3.7 @bkit-roo/mcp-client

**목적**: MCP 서버 연결 및 도구/리소스 접근

**핵심 설계**:

```typescript
export class McpHub {
  constructor(options: McpHubOptions);
  connectServer(config: McpServerConfig): Promise<void>;
  disconnectServer(name: string): Promise<void>;
  getAvailableTools(): McpToolInfo[];
  getAvailableResources(): McpResourceInfo[];
  invokeTool(serverName: string, toolName: string, args: unknown): Promise<unknown>;
  accessResource(serverName: string, uri: string): Promise<unknown>;
}

export interface McpServerConfig {
  name: string;
  transport: "stdio" | "sse" | "streamable-http";
  command?: string;      // stdio
  args?: string[];       // stdio
  url?: string;          // sse, streamable-http
  env?: Record<string, string>;
  alwaysAllow?: string[];
  disabled?: boolean;
}
```

**VS Code 의존성 제거 포인트**:
- 원본에서 `vscode.workspace.getConfiguration`으로 설정 로딩 → 설정 파일 경로를 직접 전달
- 원본에서 VS Code 출력 채널로 로깅 → 표준 로깅 인터페이스로 대체

### 3.8 @bkit-roo/context

**목적**: 토큰 예산, 컨텍스트 윈도우, 대화 압축 관리

**핵심 설계**:

```typescript
export class TokenBudgetManager {
  constructor(modelInfo: ModelInfo);
  calculateBudget(systemPrompt: string, messages: Message[]): TokenBudget;
  isOverBudget(budget: TokenBudget): boolean;
}

export class ContextCondenser {
  constructor(apiHandler: ApiHandler);
  condense(messages: Message[], budget: TokenBudget): Promise<Message[]>;
}

export class MessageHistory {
  constructor(storage: IConfigStorage);
  save(taskId: string, messages: Message[]): Promise<void>;
  load(taskId: string): Promise<Message[]>;
  list(): Promise<TaskSummary[]>;
}
```

### 3.9 @bkit-roo/cost

**목적**: 토큰 가격 및 비용 계산

**핵심 설계**:

```typescript
export interface TokenPricing {
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  cacheReadPricePerMillion?: number;
  cacheWritePricePerMillion?: number;
}

export function calculateCost(
  usage: TokenUsage,
  pricing: TokenPricing
): number;

export function getApiMetrics(
  history: ApiCallRecord[]
): ApiMetrics;
```

### 3.10 @bkit-roo/file-rules

**목적**: .rooignore / .rooprotected 파일 규칙 시스템

**핵심 설계**:

```typescript
export class RooIgnore {
  constructor(rules: string[]);
  static fromFile(content: string): RooIgnore;
  isIgnored(filePath: string): boolean;
}

export class RooProtect {
  constructor(rules: string[]);
  static fromFile(content: string): RooProtect;
  isProtected(filePath: string): boolean;
}
```

### 3.11 @bkit-roo/core

**목적**: 전체 에이전트 파이프라인 통합 오케스트레이터

**핵심 설계**:

```typescript
export interface BkitRooConfig {
  apiConfig: ApiConfiguration;
  fileSystem: IFileSystem;
  terminal: ITerminalExecutor;
  approvalGate: IApprovalGate;
  storage: IConfigStorage;
  cwd: string;
  mode?: string;
}

export class AgentRunner {
  constructor(config: BkitRooConfig);

  // 태스크 실행
  async runTask(userMessage: string): Promise<TaskResult>;

  // 스트리밍 실행
  runTaskStream(userMessage: string): AsyncIterable<AgentEvent>;

  // 이벤트
  on(event: "tool_use", handler: ToolUseHandler): void;
  on(event: "message", handler: MessageHandler): void;
  on(event: "error", handler: ErrorHandler): void;
}

export type AgentEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_request"; tool: string; params: Record<string, unknown> }
  | { type: "tool_result"; tool: string; result: unknown }
  | { type: "task_complete"; result: string }
  | { type: "cost_update"; cost: CostInfo }
  | { type: "error"; error: Error };
```

---

## 4. 빌드 및 도구 체인

### 4.1 빌드 시스템

| 도구 | 용도 |
|------|------|
| **pnpm** | 패키지 관리자 (워크스페이스) |
| **Turborepo** | 모노레포 빌드 오케스트레이션 |
| **tsup** | TypeScript 번들링 (ESM + CJS) |
| **TypeScript 5.x** | 타입 검사 및 컴파일 |
| **Vitest** | 단위 및 통합 테스트 |
| **ESLint** | 코드 린팅 |
| **Prettier** | 코드 포매팅 |
| **Changesets** | 버전 관리 및 체인지로그 |

### 4.2 TypeScript 설정

```jsonc
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 4.3 패키지 빌드 출력

각 패키지는 다음 형태로 빌드됨:

```
packages/<name>/
├── dist/
│   ├── index.mjs          # ESM
│   ├── index.cjs           # CJS
│   └── index.d.ts          # 타입 선언
```

---

## 5. VS Code 의존성 제거 전략

### 5.1 직접 의존성 교체 목록

| 원본 VS Code API | bkit-roo 대체 | 위치 |
|------------------|--------------|------|
| `vscode.SecretStorage` | `IConfigStorage.getSecret/setSecret` | api-client, core |
| `vscode.workspace.fs` | `IFileSystem` | file-rules, prompts, context |
| `vscode.window.createTerminal` | `ITerminalExecutor` | tools (execute_command) |
| `vscode.workspace.getConfiguration` | `IConfigStorage.get/set` | modes, mcp-client |
| `vscode.workspace.workspaceFolders` | `config.cwd` (직접 전달) | prompts, core |
| `vscode.window.showInformationMessage` | `EventEmitter` 또는 콜백 | api-client, core |
| `vscode.Uri` | 표준 `URL` 또는 문자열 경로 | 전체 |
| `vscode.Disposable` | 자체 `Disposable` 인터페이스 | mcp-client, core |
| `vscode.OutputChannel` | 표준 `console` 또는 로거 인터페이스 | 전체 |
| `vscode.ExtensionContext` | `BkitRooConfig` | core |

### 5.2 단계별 제거 절차

1. **1단계**: 원본 소스 복사 후 `import * as vscode` 구문 전체 식별
2. **2단계**: 각 `vscode.*` 사용처를 위 테이블에 따라 인터페이스로 교체
3. **3단계**: 컴파일 시 `vscode` 모듈이 없어도 빌드 성공하는지 확인
4. **4단계**: 인터페이스에 대한 Mock 구현으로 테스트 작성

---

## 6. 테스트 전략

### 6.1 테스트 계층

```
┌─────────────────────────────────┐
│      E2E 테스트 (examples/)      │  모의 LLM 서버 + 전체 파이프라인
├─────────────────────────────────┤
│      통합 테스트                  │  복수 패키지 조합 동작 검증
├─────────────────────────────────┤
│      단위 테스트                  │  각 패키지 내 함수/클래스 단위
└─────────────────────────────────┘
```

### 6.2 모의(Mock) 전략

- **LLM 응답**: 녹화된 응답 JSON 파일 사용
- **파일 시스템**: 인메모리 `IFileSystem` 구현
- **터미널**: 사전 정의된 결과를 반환하는 `ITerminalExecutor` 구현
- **MCP 서버**: 로컬 모의 MCP 서버 (stdio 기반)

---

## 7. 성능 고려사항

- **트리 쉐이킹**: ESM 빌드로 불필요한 프로바이더 제외 가능
- **지연 로딩**: 프로바이더별 SDK는 사용 시점에 동적 import
- **스트리밍**: 모든 LLM 응답은 AsyncGenerator 기반 스트리밍
- **메모리**: 대화 이력 압축으로 메모리 사용량 제어

---

## 8. 보안 고려사항

- API 키는 반드시 `IConfigStorage` 인터페이스를 통해 관리 (평문 저장 금지)
- 도구 실행 전 반드시 `IApprovalGate`를 통한 승인 흐름 적용
- MCP 서버 연결 시 URL/커맨드 검증
- `.rooignore` / `.rooprotected` 규칙으로 민감 파일 보호
