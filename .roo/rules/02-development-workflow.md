# 개발 워크플로

## 필수 명령어

| 명령어 | 용도 | 실행 시점 |
|--------|------|-----------|
| `pnpm install` | 의존성 설치 | 최초 또는 package.json 변경 시 |
| `pnpm build` | 전체 빌드 (Turborepo) | 코드 변경 후 |
| `pnpm typecheck` | TypeScript 타입 검사 | 커밋 전 |
| `pnpm test` | Vitest 테스트 실행 | 코드 변경 후 |
| `pnpm check-vscode` | VS Code import 검증 | 이식 작업 후 반드시 |
| `pnpm lint` | ESLint 검사 | 커밋 전 |
| `pnpm format` | Prettier 포매팅 | 커밋 전 |
| `pnpm clean` | dist/ 폴더 제거 | 빌드 문제 시 |

## 패키지별 명령어

특정 패키지만 빌드/테스트할 때:
```bash
pnpm --filter @bkit-roo/<패키지명> build
pnpm --filter @bkit-roo/<패키지명> test
```

## 검증 파이프라인

코드 변경 후 아래 순서로 검증한다:
1. `pnpm build` - 빌드 성공 확인
2. `pnpm typecheck` - 타입 오류 없음 확인
3. `pnpm check-vscode` - VS Code 의존성 없음 확인
4. `pnpm test` - 테스트 통과 확인

## 패키지 빌드 출력

각 패키지는 tsup을 사용하여 다음을 생성한다:
- `dist/index.js` (ESM)
- `dist/index.cjs` (CommonJS)
- `dist/index.d.ts` (TypeScript 선언)
