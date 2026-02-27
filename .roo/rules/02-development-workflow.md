# 개발 워크플로

<!-- TODO: 명령어를 자기 프로젝트의 것으로 교체하세요. -->

## 필수 명령어

| 명령어 | 용도 | 실행 시점 |
|--------|------|-----------|
| `npm install` | 의존성 설치 | 최초 또는 package.json 변경 시 |
| `npm run build` | 프로젝트 빌드 | 코드 변경 후 |
| `npm run typecheck` | TypeScript 타입 검사 | 커밋 전 |
| `npm test` | 테스트 실행 | 코드 변경 후 |
| `npm run lint` | ESLint 검사 | 커밋 전 |
| `npm run format` | Prettier 포매팅 | 커밋 전 |

<!-- 패키지 매니저를 pnpm, yarn 등으로 교체 가능 -->

## 검증 파이프라인

코드 변경 후 아래 순서로 검증한다:

1. `npm run build` — 빌드 성공 확인
2. `npm run typecheck` — 타입 오류 없음 확인
3. `npm run lint` — 린트 규칙 위반 없음 확인
4. `npm test` — 테스트 통과 확인

## 브랜치 전략

<!-- 프로젝트의 Git 브랜치 전략을 기술 -->

- `main` — 프로덕션 배포 브랜치
- `develop` — 개발 통합 브랜치
- `feature/*` — 기능 개발 브랜치
- `fix/*` — 버그 수정 브랜치

## 커밋 메시지 규칙

<!-- 프로젝트의 커밋 메시지 컨벤션을 기술 -->

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 따른다:

```
<type>(<scope>): <description>

feat: 새 기능 추가
fix: 버그 수정
docs: 문서 변경
test: 테스트 추가/수정
refactor: 리팩토링
chore: 빌드/도구 설정 변경
```
