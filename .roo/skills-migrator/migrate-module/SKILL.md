---
name: migrate-module
description: Roo Code 원본 소스(reference/roo-code/src/)에서 bkit-roo 패키지로 코드를 이식한다. VS Code 의존성을 제거하고 플랫폼 추상화 인터페이스로 대체한다.
metadata:
  author: bkit-roo
  version: "1.0"
---

# 모듈 이식 스킬 (Migrator 모드 전용)

## 절차

사용자가 이식할 원본 파일/모듈을 지정하면 아래 단계를 따른다.

### Step 1: 원본 분석

1. `reference/roo-code/src/` 에서 대상 파일을 읽는다.
2. VS Code 의존성을 파악한다 (`import * as vscode`, `vscode.workspace`, `vscode.window` 등).
3. 외부 의존성을 목록화한다.
4. 핵심 비즈니스 로직과 플랫폼 종속 코드를 분리한다.

### Step 2: VS Code 의존성 대체 매핑

| VS Code API | bkit-roo 인터페이스 | import |
|-------------|-------------------|--------|
| `vscode.workspace.fs.readFile` | `fileSystem.readFile()` | `IFileSystem` from `@bkit-roo/shared` |
| `vscode.workspace.fs.writeFile` | `fileSystem.writeFile()` | `IFileSystem` from `@bkit-roo/shared` |
| `vscode.workspace.fs.stat` | `fileSystem.stat()` | `IFileSystem` from `@bkit-roo/shared` |
| `vscode.window.createTerminal` | `terminal.execute()` | `ITerminalExecutor` from `@bkit-roo/shared` |
| `vscode.SecretStorage` | `secretStorage.get/set()` | `ISecretStorage` from `@bkit-roo/shared` |
| `vscode.workspace.getConfiguration` | `configStorage.get/set()` | `IConfigStorage` from `@bkit-roo/shared` |
| `vscode.window.showInformationMessage` | `logger.info()` 또는 제거 | `ILogger` from `@bkit-roo/shared` |
| `vscode.window.showErrorMessage` | `logger.error()` 또는 throw | `ILogger` from `@bkit-roo/shared` |
| `vscode.Uri` | `string` (경로 문자열) | - |
| `vscode.ExtensionContext` | 생성자 파라미터 주입 | - |
| `vscode.Disposable` | 자체 cleanup 패턴 | - |
| `vscode.EventEmitter` | Node.js `EventEmitter` 또는 콜백 | - |
| `vscode.workspace.workspaceFolders` | `cwd: string` 파라미터 | - |

### Step 3: 코드 이식

1. 원본의 비즈니스 로직을 보존하면서 타겟 패키지에 코드를 작성한다.
2. VS Code API 호출을 위의 인터페이스로 교체한다.
3. 생성자에서 인터페이스를 주입받도록 설계한다 (의존성 주입 패턴).

### Step 4: 검증

```bash
pnpm check-vscode && pnpm build && pnpm typecheck && pnpm test
```

## 원본-타겟 매핑

| 원본 경로 | 타겟 패키지 |
|-----------|------------|
| `src/api/` | `@bkit-roo/api-client` |
| `src/core/prompts/` | `@bkit-roo/prompts` |
| `src/core/assistant-message/` | `@bkit-roo/parser` |
| `src/core/config/` | `@bkit-roo/modes` |
| `src/services/mcp/` | `@bkit-roo/mcp-client` |
| `src/core/context-management/` | `@bkit-roo/context` |
| `src/core/condense/` | `@bkit-roo/context` |
| `src/core/ignore/` | `@bkit-roo/file-rules` |
| `src/core/mentions/` | `@bkit-roo/parser` |
| `src/shared/` | `@bkit-roo/shared`, `@bkit-roo/cost` |
