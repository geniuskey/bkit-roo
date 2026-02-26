---
name: verify-build
description: bkit-roo 프로젝트의 전체 검증 파이프라인을 실행한다. 빌드, 타입 체크, VS Code 독립성 검증, 테스트를 순서대로 수행하고 결과를 보고한다.
metadata:
  author: bkit-roo
  version: "1.0"
---

# 빌드 검증 스킬

## 절차

### Step 1: 의존성 확인

```bash
pnpm install
```

node_modules가 없거나 package.json이 변경된 경우에만 실행한다.

### Step 2: 빌드 (Turborepo)

```bash
pnpm build
```

모든 패키지가 의존성 순서대로 빌드된다. 실패 시 오류 메시지를 분석하고 원인을 보고한다.

### Step 3: 타입 체크

```bash
pnpm typecheck
```

TypeScript strict 모드 타입 검사. 타입 오류가 있으면 파일과 줄 번호를 포함하여 보고한다.

### Step 4: VS Code 독립성 검증

```bash
pnpm check-vscode
```

모든 패키지에서 `vscode` import가 없는지 확인한다. 위반 시 해당 파일과 import 구문을 보고한다.

### Step 5: 테스트

```bash
pnpm test
```

Vitest 테스트 실행. 실패한 테스트가 있으면 테스트명과 에러를 보고한다.

### Step 6: 결과 보고

모든 단계의 결과를 요약하여 보고한다:

```
검증 결과:
  빌드:        ✅ 통과 / ❌ 실패
  타입 체크:    ✅ 통과 / ❌ N개 오류
  VS Code 검증: ✅ 통과 / ❌ N개 위반
  테스트:       ✅ N개 통과 / ❌ N개 실패
```

## 특정 패키지만 검증

특정 패키지만 검증할 때:
```bash
pnpm --filter @bkit-roo/<name> build
pnpm --filter @bkit-roo/<name> typecheck
pnpm --filter @bkit-roo/<name> test
```
