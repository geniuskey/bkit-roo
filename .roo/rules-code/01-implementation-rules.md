# Code 모드 규칙

## 구현 가이드라인

1. **변경 전 원본 확인**: 이식 대상 모듈의 원본 코드를 `reference/roo-code/src/`에서 먼저 읽고 이해한다.
2. **점진적 변경**: 한 번에 여러 패키지를 수정하지 않는다. 의존성 순서대로 작업한다.
3. **빌드 검증**: 코드 수정 후 `pnpm build`로 빌드가 통과하는지 확인한다.
4. **타입 안전성**: `any` 타입 사용을 최소화한다. 필요시 `unknown`과 타입 가드를 사용한다.

## VS Code 의존성 제거 패턴

원본 코드에서 VS Code API를 만나면 다음과 같이 대체한다:

| VS Code API | bkit-roo 대체 | 패키지 |
|-------------|-------------|--------|
| `vscode.workspace.fs` | `IFileSystem` | shared |
| `vscode.window.createTerminal` | `ITerminalExecutor` | shared |
| `vscode.SecretStorage` | `ISecretStorage` | shared |
| `vscode.workspace.getConfiguration` | `IConfigStorage` | shared |
| Webview dialogs | `IApprovalGate` | shared |
| `vscode.OutputChannel` | `ILogger` | shared |
| `vscode.Uri` | 표준 `string` 경로 | - |
| `vscode.ExtensionContext` | 생성자 파라미터 주입 | - |

## 기존 인터페이스 구현체

- `AutoApprovalGate` - 항상 승인 (비대화형)
- `InMemoryConfigStorage` / `InMemorySecretStorage` - 임시 저장소
- `ConsoleLogger` / `NullLogger` - stdout 또는 무출력

## 금지 사항

- `import * as vscode from "vscode"` 절대 금지
- `require("vscode")` 절대 금지
- VS Code 확장 컨텍스트에 의존하는 코드 작성 금지
- 패키지 간 순환 의존 생성 금지
