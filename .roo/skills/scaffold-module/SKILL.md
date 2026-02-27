---
name: scaffold-module
description: 프로젝트에 새 모듈(또는 패키지)을 생성한다. 디렉터리, 소스 파일, 테스트 파일, 설정 파일을 자동으로 만든다.
metadata:
  version: "1.0"
---

# 새 모듈 스캐폴딩 스킬

<!-- TODO: 프로젝트 구조에 맞게 디렉터리 경로와 파일 내용을 수정하세요. -->

## 절차

사용자가 새 모듈 이름과 설명을 제공하면 아래 단계를 따른다.

### Step 1: 디렉터리 구조 생성

```
src/<module-name>/
  ├── index.ts              # public export 진입점
  ├── <module-name>.ts      # 주요 구현
  └── __tests__/
      └── <module-name>.test.ts
```

<!-- 모노레포라면 packages/<name>/ 구조로 변경 -->

### Step 2: 진입점 파일 생성 (index.ts)

```typescript
export { /* public API */ } from "./<module-name>"
```

### Step 3: 구현 파일 생성

모듈의 주요 클래스/함수를 빈 구조로 생성하고, JSDoc 주석을 추가한다.

```typescript
/**
 * (모듈 설명)
 */
export class ModuleName {
  // TODO: 구현
}
```

### Step 4: 테스트 파일 생성

```typescript
import { describe, it, expect } from "vitest"
import { ModuleName } from "../<module-name>"

describe("ModuleName", () => {
  it("should be defined", () => {
    expect(ModuleName).toBeDefined()
  })
})
```

### Step 5: 빌드 확인

```bash
npm run build
npm run typecheck
```

빌드와 타입 체크가 통과하는지 확인한다.

## 주의 사항

- 모듈 이름은 소문자, camelCase 또는 kebab-case 사용
- 기존 모듈과 이름이 충돌하지 않는지 확인
- 의존성 방향 규칙을 위반하지 않도록 주의
