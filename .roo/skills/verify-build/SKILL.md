---
name: verify-build
description: 프로젝트의 전체 검증 파이프라인을 실행한다. 빌드, 타입 체크, 린트, 테스트를 순서대로 수행하고 결과를 보고한다.
metadata:
  version: "1.0"
---

# 빌드 검증 스킬

<!-- TODO: 명령어를 자기 프로젝트의 것으로 교체하세요. -->

## 절차

### Step 1: 의존성 확인

```bash
npm install
```

node_modules가 없거나 package.json이 변경된 경우에만 실행한다.

### Step 2: 빌드

```bash
npm run build
```

빌드 실패 시 오류 메시지를 분석하고 원인을 보고한다.

### Step 3: 타입 체크

```bash
npm run typecheck
```

타입 오류가 있으면 파일과 줄 번호를 포함하여 보고한다.

### Step 4: 린트

```bash
npm run lint
```

린트 오류가 있으면 규칙명과 파일 위치를 보고한다.

### Step 5: 테스트

```bash
npm test
```

실패한 테스트가 있으면 테스트명과 에러를 보고한다.

### Step 6: 결과 보고

모든 단계의 결과를 요약하여 보고한다:

```
검증 결과:
  빌드:      PASS / FAIL
  타입 체크:  PASS / FAIL (N개 오류)
  린트:      PASS / FAIL (N개 오류)
  테스트:    PASS / FAIL (N개 통과, N개 실패)
```
