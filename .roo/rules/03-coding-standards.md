# 코딩 표준

## TypeScript 설정

- Target: ES2022
- Module: ESNext
- Strict 모드 활성화
- 120자 줄 길이 제한 (Prettier)
- 탭 대신 스페이스 (2칸 들여쓰기)
- 세미콜론 없음 (Prettier 설정)

## 패키지 구조 규칙

각 패키지는 반드시 다음 구조를 따른다:
```
packages/<name>/
  ├── package.json          # @bkit-roo/<name> 네이밍
  ├── tsconfig.json         # tsconfig.base.json 상속
  ├── tsup.config.ts        # ESM + CJS 빌드 설정
  ├── src/
  │   ├── index.ts          # 단일 public export 진입점
  │   ├── __tests__/        # Vitest 테스트 파일
  │   └── ...               # 구현 파일
  └── dist/                 # 빌드 출력 (git 무시)
```

## Import 규칙

- 패키지 간 import는 패키지명으로: `import { ... } from "@bkit-roo/shared"`
- 패키지 내부 import는 상대 경로로: `import { ... } from "./utils"`
- `vscode` 모듈 import 절대 금지
- Node.js 내장 모듈은 허용 (fs, path, os 등)

## 의존성 방향 (순환 금지)

```
shared (기반)
  ├── cost
  ├── file-rules
  ├── parser
  ├── tools
  │     └── modes
  ├── api-client (← cost)
  ├── prompts (← tools, modes)
  ├── mcp-client (← tools)
  ├── context (← api-client, cost)
  └── core (← 모든 패키지)
```

## 네이밍 규칙

- 파일명: camelCase (예: `tokenBudget.ts`)
- 클래스/인터페이스: PascalCase (예: `AgentRunner`, `IFileSystem`)
- 함수/변수: camelCase (예: `calculateCost`, `buildApiHandler`)
- 상수: UPPER_SNAKE_CASE (예: `MAX_TOKENS`, `DEFAULT_MODEL_ID`)
- 인터페이스 접두사: `I` (예: `IFileSystem`, `IApprovalGate`)
