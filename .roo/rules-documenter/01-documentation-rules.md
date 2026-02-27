# Documenter 모드 규칙

## 문서화 원칙

1. **정확성**: 문서는 항상 현재 코드와 일치해야 한다.
2. **간결성**: 필요한 정보만 포함한다. 장황한 설명보다 코드 예제가 낫다.
3. **대상 독자**: 문서를 읽는 사람이 누구인지(개발자, 사용자, 운영자) 고려한다.

## 문서 유형별 가이드

### README.md
- 프로젝트 소개 (한 줄 설명)
- 빠른 시작 (설치 → 실행까지 최소 단계)
- 주요 기능 목록
- 설정 방법
- 기여 가이드 (해당 시)

### API 문서
- 모든 public 함수/클래스에 JSDoc/TSDoc 작성
- 파라미터 타입과 설명
- 반환값 설명
- 사용 예제 (복사해서 바로 실행 가능하도록)

### 인라인 주석
- "왜"를 설명하는 주석만 작성
- 자명한 코드에는 주석 불필요
- TODO/FIXME에는 맥락 정보 포함

## JSDoc/TSDoc 작성 예시

```typescript
/**
 * 사용자 ID로 사용자 정보를 조회한다.
 *
 * @param id - 조회할 사용자의 고유 ID
 * @returns 사용자 객체. 존재하지 않으면 null 반환
 * @throws {DatabaseError} DB 연결 실패 시
 *
 * @example
 * ```typescript
 * const user = await getUser(123)
 * if (user) {
 *   console.log(user.name)
 * }
 * ```
 */
export async function getUser(id: number): Promise<User | null> {
  // ...
}
```

## 문서 작성 언어

<!-- 프로젝트의 문서 언어 정책에 맞게 수정 -->

- 코드 주석: 영어
- README: 영어 (또는 프로젝트 주 사용 언어)
- 내부 기획 문서: 팀 공용어
