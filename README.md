# bkit-roo

[Roo Code](https://github.com/RooCodeInc/Roo-Code) AI 어시스턴트를 프로젝트에 효과적으로 결합하기 위한 **설정 템플릿**.

커스텀 모드, 규칙, 스킬 파일을 프로젝트 루트에 배치하면 Roo Code가 자동으로 인식하여 프로젝트 맥락에 맞는 AI 어시스턴트로 동작합니다.

## 빠른 시작

### 1. Roo Code 설치

VS Code 마켓플레이스에서 [Roo Code](https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline)를 설치합니다.

```bash
code --install-extension RooVeterinaryInc.roo-cline
```

### 2. 설정 파일 복사

이 레포의 설정 파일을 자신의 프로젝트 루트에 복사합니다.

```bash
# 이 레포를 클론
git clone https://github.com/geniuskey/bkit-roo.git

# 자기 프로젝트로 설정 파일 복사
cp -r bkit-roo/.roo       /path/to/your-project/
cp    bkit-roo/.roomodes   /path/to/your-project/
cp    bkit-roo/.rooignore  /path/to/your-project/
```

### 3. 프로젝트에 맞게 수정

복사한 파일을 자기 프로젝트에 맞게 수정합니다. 아래 [커스터마이징 가이드](#커스터마이징-가이드)를 참고하세요.

### 4. VS Code에서 프로젝트 열기

VS Code로 프로젝트를 열면 Roo Code가 `.roomodes`, `.roo/`, `.rooignore`를 **자동 인식**합니다. 별도 설정은 필요 없습니다.

## 파일 구조

```
.roomodes                            # 커스텀 모드 정의
.rooignore                           # AI 컨텍스트 제외 패턴
.gitignore                           # Git 제외 패턴

.roo/
├── rules/                           # 모든 모드 공통 규칙
│   ├── 01-project-overview.md       #   프로젝트 구조, 핵심 원칙
│   ├── 02-development-workflow.md   #   빌드/테스트 명령어
│   └── 03-coding-standards.md       #   코딩 컨벤션, 네이밍 규칙
│
├── rules-code/                      # Code 모드 전용 규칙
│   └── 01-implementation-rules.md
│
├── rules-architect/                 # Architect 모드 전용 규칙
│   └── 01-architecture-rules.md
│
├── rules-migrator/                  # Migrator 모드 전용 규칙
│   └── 01-migration-rules.md
│
├── rules-tester/                    # Tester 모드 전용 규칙
│   └── 01-testing-rules.md
│
├── skills/                          # 모든 모드에서 사용 가능한 스킬
│   ├── new-package/SKILL.md         #   새 패키지 스캐폴딩
│   ├── migrate-module/SKILL.md      #   코드 이식 절차
│   └── verify-build/SKILL.md        #   빌드 검증 파이프라인
│
└── skills-migrator/                 # Migrator 모드 전용 스킬
    └── migrate-module/SKILL.md
```

## Roo Code 핵심 개념

### 모드 (Modes)

모드는 AI의 **역할과 권한 범위**를 정의합니다. Roo Code에는 기본 모드(Code, Architect, Ask, Debug)가 있고, `.roomodes` 파일로 커스텀 모드를 추가할 수 있습니다.

이 템플릿에 포함된 커스텀 모드:

| 모드 | 용도 | 파일 권한 |
|------|------|----------|
| **Migrator** | 외부 코드베이스에서 코드 이식 | 특정 디렉터리의 `*.ts`, `*.json` 편집 |
| **Tester** | 테스트 작성 및 실행 | `*.test.ts`, `__tests__/` 편집 |
| **Documenter** | 문서 작성 | `*.md`, `*.ts` 편집 |

### 규칙 (Rules)

규칙은 AI에게 **프로젝트 맥락을 주입**하는 마크다운 파일입니다.

- `.roo/rules/` — **모든 모드**에 적용 (프로젝트 구조, 워크플로, 코딩 표준)
- `.roo/rules-{mode}/` — **해당 모드에서만** 적용
- 파일명 접두사(`01-`, `02-`, `03-`)로 **로딩 순서** 결정

### 스킬 (Skills)

스킬은 AI가 특정 작업 요청을 받았을 때 **자동 활성화되는 절차 가이드**입니다.

- `.roo/skills/` — 모든 모드에서 사용 가능
- `.roo/skills-{mode}/` — 해당 모드에서만 사용 가능
- 각 스킬은 `SKILL.md` 파일에 단계별 지침을 포함

### .rooignore

AI가 **읽지 않을 경로**를 지정합니다. `.gitignore`와 동일한 패턴 문법을 사용합니다.

## 커스터마이징 가이드

이 템플릿의 파일들은 TypeScript 모노레포(pnpm + Turborepo + tsup + Vitest) 프로젝트를 기준으로 작성되어 있습니다. 자신의 프로젝트에 맞게 수정하세요.

### 그대로 사용 가능

| 파일 | 설명 |
|------|------|
| `.rooignore` | `dist/`, `node_modules/` 등 일반적인 제외 패턴 |

### 구조는 유지하고 내용만 수정

| 파일 | 수정 포인트 |
|------|------------|
| `rules/02-development-workflow.md` | 빌드/테스트 명령어를 자기 프로젝트 것으로 교체 |
| `rules/03-coding-standards.md` | 패키지 스코프명, 의존성 그래프, 네이밍 규칙 수정 |
| `rules-architect/01-architecture-rules.md` | 아키텍처 원칙 유지, 패키지 계층/문서 경로 수정 |
| `rules-tester/01-testing-rules.md` | Vitest 패턴 유지, 인터페이스명/패키지 스코프 수정 |
| `skills/new-package/SKILL.md` | 패키지 스코프명, 기본 의존성, 라이선스 수정 |
| `skills/verify-build/SKILL.md` | 검증 파이프라인 단계를 자기 프로젝트에 맞게 수정 |

### 프로젝트에 맞게 새로 작성

| 파일 | 이유 |
|------|------|
| `.roomodes` | 커스텀 모드의 역할, 권한이 프로젝트마다 다름 |
| `rules/01-project-overview.md` | 프로젝트 설명, 구조, 핵심 원칙이 완전히 다름 |
| `rules-code/01-implementation-rules.md` | 구현 규칙이 프로젝트마다 다름 |
| `rules-migrator/01-migration-rules.md` | 이식 대상/방법이 프로젝트마다 다름 |
| `skills/migrate-module/SKILL.md` | 이식 절차가 프로젝트마다 다름 |
| `skills-migrator/migrate-module/SKILL.md` | 위와 동일 |

### 새 규칙 추가

```bash
# 모든 모드에 적용
echo "# 새 규칙" > .roo/rules/04-new-rule.md

# 특정 모드에만 적용
echo "# Code 전용 규칙" > .roo/rules-code/02-new-rule.md
```

### 새 스킬 추가

```bash
mkdir -p .roo/skills/my-skill
cat > .roo/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: 스킬 설명 (AI가 이 설명으로 스킬을 선택)
---

# 스킬 지침

1. 단계 1
2. 단계 2
EOF
```

### 새 커스텀 모드 추가

`.roomodes` 파일을 편집합니다:

```json
{
  "customModes": [
    {
      "slug": "my-mode",
      "name": "My Mode",
      "roleDefinition": "AI에게 부여할 역할 정의",
      "groups": [
        "read",
        ["edit", { "fileRegex": "\\.ts$" }],
        "command"
      ]
    }
  ]
}
```

## 참고 자료

- [Roo Code 공식 문서](https://docs.roocode.com/)
- [Roo Code GitHub](https://github.com/RooCodeInc/Roo-Code)
- [커스텀 모드 가이드](https://docs.roocode.com/features/custom-modes)
- [규칙 파일 가이드](https://docs.roocode.com/features/rules)

## License

Apache-2.0
