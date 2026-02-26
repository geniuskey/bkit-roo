# Migrator 모드 규칙

## 이식 워크플로

1. **원본 분석**: `reference/roo-code/src/`에서 대상 모듈의 코드를 읽고 VS Code 의존점을 파악한다.
2. **인터페이스 매핑**: VS Code API 호출을 `@bkit-roo/shared`의 추상 인터페이스로 대체할 계획을 수립한다.
3. **코드 이식**: 로직을 보존하면서 VS Code 의존성을 제거한 코드를 작성한다.
4. **검증**: `pnpm check-vscode && pnpm build && pnpm typecheck`로 이식 성공을 확인한다.

## 원본 소스 매핑

| 원본 경로 | bkit-roo 패키지 |
|-----------|----------------|
| `src/api/` | `@bkit-roo/api-client` |
| `src/core/prompts/` | `@bkit-roo/prompts` |
| `src/core/assistant-message/` | `@bkit-roo/parser` |
| `src/core/config/CustomModesManager.ts` | `@bkit-roo/modes` |
| `src/services/mcp/` | `@bkit-roo/mcp-client` |
| `src/core/context-management/` | `@bkit-roo/context` |
| `src/core/condense/` | `@bkit-roo/context` |
| `src/core/ignore/` | `@bkit-roo/file-rules` |
| `src/core/mentions/` | `@bkit-roo/parser` |
| `src/shared/` | `@bkit-roo/shared`, `@bkit-roo/cost` |

## 주의 사항

- 원본 코드의 라이선스(Apache-2.0)를 준수한다.
- 원본의 비즈니스 로직은 최대한 보존한다. 리팩토링은 이식 완료 후에 진행한다.
- 원본 테스트 케이스가 있으면 함께 이식한다.
- `vscode.workspace.fs.readFile` → `this.fileSystem.readFile` 같은 패턴으로 변환한다.
- `vscode.window.showInformationMessage` → `this.logger.info` 또는 제거한다.
