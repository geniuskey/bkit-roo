---
name: new-package
description: bkit-roo 모노레포에 새로운 패키지를 생성한다. 패키지 스캐폴딩, package.json, tsconfig.json, tsup 설정, src/index.ts 진입점을 자동으로 만든다.
metadata:
  author: bkit-roo
  version: "1.0"
---

# 새 패키지 생성 스킬

## 절차

사용자가 새 패키지 이름을 제공하면 아래 단계를 따른다.

### Step 1: 디렉토리 구조 생성

```
packages/<name>/
  ├── package.json
  ├── tsconfig.json
  ├── tsup.config.ts
  └── src/
      ├── index.ts
      └── __tests__/
```

### Step 2: package.json 생성

```json
{
  "name": "@bkit-roo/<name>",
  "version": "0.1.0",
  "description": "<사용자 제공 설명>",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@bkit-roo/shared": "workspace:*"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "license": "Apache-2.0"
}
```

### Step 3: tsconfig.json 생성

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules", "src/__tests__"]
}
```

### Step 4: tsup.config.ts 생성

```typescript
import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
})
```

### Step 5: src/index.ts 생성

빈 export 파일을 생성하고, 패키지의 public API를 여기서 export할 것을 안내한다.

### Step 6: 의존성 설치 및 빌드 확인

```bash
pnpm install
pnpm --filter @bkit-roo/<name> build
```

### Step 7: pnpm-workspace.yaml 확인

`packages/*`가 이미 포함되어 있으므로 별도 수정 불필요.

## 주의 사항

- 패키지 이름은 소문자, 하이픈만 사용
- `@bkit-roo/shared`는 기본 의존성으로 포함
- 다른 bkit-roo 패키지에 의존할 경우 `workspace:*` 버전 사용
- 의존성 방향 그래프를 위반하지 않도록 주의
