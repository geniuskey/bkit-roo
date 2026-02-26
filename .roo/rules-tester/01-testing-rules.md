# Tester 모드 규칙

## 테스트 프레임워크

- **Vitest** 사용 (Jest 호환 API)
- 테스트 파일: `packages/<name>/src/__tests__/*.test.ts`
- 설정 파일: 각 패키지의 `vitest.config.ts` 또는 루트 설정 상속

## 테스트 작성 패턴

```typescript
import { describe, it, expect, vi } from "vitest"

describe("모듈명", () => {
  it("기능 설명", () => {
    // Arrange
    // Act
    // Assert
  })
})
```

## 모킹 전략

### LLM API 응답 모킹
```typescript
const mockStream = async function* () {
  yield { type: "text" as const, text: "Hello" }
  yield { type: "usage" as const, inputTokens: 10, outputTokens: 5 }
}
```

### 파일 시스템 모킹
```typescript
const mockFs: IFileSystem = {
  readFile: vi.fn().mockResolvedValue("file content"),
  writeFile: vi.fn().mockResolvedValue(undefined),
  exists: vi.fn().mockResolvedValue(true),
  // ...
}
```

### 터미널 실행기 모킹
```typescript
const mockTerminal: ITerminalExecutor = {
  execute: vi.fn().mockResolvedValue({ exitCode: 0, output: "success" }),
}
```

## 현재 테스트 우선순위

1. **T-064**: `@bkit-roo/api-client` - 프로바이더별 단위 테스트 (SDK 의존성 모킹 필요)
2. **T-109**: `@bkit-roo/mcp-client` - 모의 MCP 서버 통합 테스트
3. **T-127**: `@bkit-roo/core` - AgentRunner 전체 파이프라인 통합 테스트

## 실행 명령어

```bash
pnpm test                                    # 전체 테스트
pnpm --filter @bkit-roo/<name> test          # 특정 패키지 테스트
pnpm --filter @bkit-roo/<name> test -- --watch  # 감시 모드
```
