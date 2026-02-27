# Tester 모드 규칙

<!-- TODO: 프로젝트의 테스트 프레임워크와 패턴에 맞게 수정하세요. -->

## 테스트 프레임워크

<!-- 사용하는 테스트 프레임워크로 교체 -->

- 프레임워크: Vitest (또는 Jest, Mocha 등)
- 테스트 파일 위치: `src/__tests__/*.test.ts` 또는 `*.spec.ts`
- 설정 파일: `vitest.config.ts` (또는 `jest.config.ts`)

## 테스트 작성 패턴

Arrange-Act-Assert (AAA) 패턴을 따른다:

```typescript
import { describe, it, expect } from "vitest"

describe("UserService", () => {
  it("should return user by ID when user exists", () => {
    // Arrange — 테스트 데이터와 의존성 준비
    const mockRepo = { findById: vi.fn().mockResolvedValue({ id: 1, name: "Alice" }) }
    const service = new UserService(mockRepo)

    // Act — 테스트 대상 실행
    const result = await service.getUser(1)

    // Assert — 결과 검증
    expect(result).toEqual({ id: 1, name: "Alice" })
    expect(mockRepo.findById).toHaveBeenCalledWith(1)
  })
})
```

## 테스트 네이밍

테스트 이름은 **행동**을 설명한다:

- `"should return empty array when no items found"`
- `"should throw ValidationError when email is invalid"`
- `"should call notification service after order is placed"`

## 모킹 전략

- 외부 서비스(DB, API, 파일 시스템)는 모킹한다
- 내부 유틸리티 함수는 가급적 실제 구현을 사용한다
- 모킹은 테스트 격리가 필요할 때만 사용한다

## 커버리지 가이드라인

- 핵심 비즈니스 로직: 높은 커버리지 목표
- 유틸리티 함수: 엣지 케이스 포함
- 에러 경로: 반드시 테스트

## 실행 명령어

```bash
npm test                      # 전체 테스트
npm test -- --watch           # 감시 모드
npm test -- --coverage        # 커버리지 리포트
```
