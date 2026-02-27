# 코딩 표준

<!-- TODO: 자기 프로젝트의 코딩 컨벤션에 맞게 수정하세요.
     아래는 일반적인 TypeScript 프로젝트 기준입니다. -->

## TypeScript 설정

- Strict 모드 활성화
- 줄 길이 제한: 100자 (Prettier)
- 들여쓰기: 스페이스 2칸
- 세미콜론: 사용 (Prettier 설정에 따라 변경)

## 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일명 | camelCase 또는 kebab-case | `userService.ts`, `user-service.ts` |
| 클래스/인터페이스 | PascalCase | `UserService`, `IUserRepository` |
| 함수/변수 | camelCase | `getUser`, `isActive` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| 타입 파라미터 | 대문자 한 글자 또는 PascalCase | `T`, `TResult` |

## Import 규칙

- 외부 패키지 → 내부 모듈 → 상대 경로 순서로 정렬
- 타입 전용 import는 `import type { ... }`을 사용
- 순환 import 금지

```typescript
// 1. 외부 패키지
import express from "express"
import type { Request, Response } from "express"

// 2. 내부 모듈 (절대 경로 또는 별칭)
import { UserService } from "@/services/userService"

// 3. 상대 경로
import { validate } from "./utils"
```

## 에러 처리

- 예상 가능한 에러는 명시적으로 처리한다
- `any` 타입 catch는 지양하고, 타입 가드를 사용한다
- 비즈니스 로직 에러는 커스텀 에러 클래스를 사용한다

## 주석 규칙

- "무엇을 하는가"가 아니라 "왜 그렇게 하는가"를 주석으로 남긴다
- 자명한 코드에는 주석을 달지 않는다
- TODO/FIXME/HACK 주석에는 담당자 또는 이슈 번호를 함께 기록한다
