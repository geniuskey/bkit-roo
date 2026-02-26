# bkit-roo

**Backend Kit for Roo** — [Roo Code](https://github.com/RooCodeInc/Roo-Code) VS Code 확장에서 플랫폼 독립적인 핵심 모듈을 추출하는 프로젝트.

Roo Code의 핵심 로직을 CLI, 웹 서버, JetBrains 플러그인, Electron 앱 등 **어디서든** 재사용할 수 있는 패키지로 분리하는 것이 목표입니다.

> 현재는 **프로젝트 설계 및 AI 어시스턴트 설정 단계**이며, 실제 패키지 구현은 이 설정을 기반으로 진행됩니다.

## Roo Code AI 어시스턴트 설정

이 프로젝트는 VS Code [Roo Code](https://github.com/RooCodeInc/Roo-Code) 확장의 AI 어시스턴트 설정을 포함하고 있습니다. Roo Code가 프로젝트 구조, 코딩 표준, 워크플로를 자동으로 이해하고 PDCA 사이클에 따라 개발을 도와줍니다.

### 적용 방법

1. **VS Code에 Roo Code 설치**
   - VS Code 마켓플레이스에서 [Roo Code](https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline) 검색 후 설치
   - 또는: `code --install-extension RooVeterinaryInc.roo-cline`

2. **프로젝트 열기**
   - VS Code에서 이 프로젝트 루트(`bkit-roo/`)를 열면
   - Roo Code가 `.roomodes`, `.roo/`, `.rooignore`를 **자동으로 인식** (별도 설정 불필요)

3. **모드 전환**
   - Roo Code 패널에서 모드 선택 드롭다운을 클릭하면 커스텀 모드가 표시됨

### 파일 구조

```
.roomodes                            # 커스텀 모드 정의
.rooignore                           # AI 컨텍스트 제외 패턴
.gitignore                           # Git 제외 패턴

.roo/
├── rules/                           # 모든 모드에 적용되는 공통 규칙
│   ├── 01-project-overview.md       #   프로젝트 구조, 핵심 원칙
│   ├── 02-development-workflow.md   #   빌드/테스트 명령어, 검증 파이프라인
│   └── 03-coding-standards.md       #   TypeScript 설정, 네이밍, 의존성 규칙
│
├── rules-code/                      # Code 모드 전용
│   └── 01-implementation-rules.md   #   VS Code 의존성 대체 패턴, 금지 사항
│
├── rules-architect/                 # Architect 모드 전용
│   └── 01-architecture-rules.md     #   패키지 계층 그래프, 미완성 영역
│
├── rules-migrator/                  # Migrator 모드 전용
│   └── 01-migration-rules.md        #   원본-타겟 매핑, 이식 워크플로
│
├── rules-tester/                    # Tester 모드 전용
│   └── 01-testing-rules.md          #   Vitest 패턴, 모킹 전략
│
├── skills/                          # 모든 모드에서 사용 가능한 스킬
│   ├── new-package/SKILL.md         #   새 패키지 스캐폴딩
│   ├── migrate-module/SKILL.md      #   코드 이식 절차
│   └── verify-build/SKILL.md        #   빌드 검증 파이프라인
│
└── skills-migrator/                 # Migrator 모드 전용 스킬
    └── migrate-module/SKILL.md      #   이식 전용 상세 가이드
```

### PDCA 사이클

모드와 스킬이 PDCA 사이클을 따르도록 설계되어 있습니다:

| 단계 | 모드/스킬 | 역할 |
|------|----------|------|
| **Plan** | Architect 모드 + `rules-architect/` | 패키지 계층 설계, 의존성 방향 결정 |
| **Do** | Code / Migrator 모드 + `new-package`, `migrate-module` 스킬 | 구현, 코드 이식 |
| **Check** | Tester 모드 + `verify-build` 스킬 | build → typecheck → check-vscode → test |
| **Act** | 검증 결과 기반 피드백 반영 → 다시 Plan으로 | 수정 및 개선 순환 |

### 커스텀 모드

| 모드 | 용도 | 파일 권한 |
|------|------|----------|
| **Migrator** | Roo Code 원본에서 bkit-roo로 코드 이식 | `packages/**/*.ts`, `*.json` 편집 가능 |
| **Tester** | 테스트 작성 및 실행 | `*.test.ts`, `__tests__/` 편집 가능 |
| **Documenter** | TSDoc, README, 가이드 작성 | `*.md`, `*.ts` 편집 가능 |

기본 제공 모드(Code, Architect, Ask, Debug)에도 프로젝트 규칙이 자동 적용됩니다.

### 스킬 사용법

Roo Code 채팅에서 관련 작업을 요청하면 스킬이 자동 활성화됩니다:

- **"새 패키지 만들어줘"** → `new-package` 스킬
- **"원본 코드 이식해줘"** → `migrate-module` 스킬
- **"빌드 검증해줘"** → `verify-build` 스킬

### 규칙 동작 방식

- `.roo/rules/` — **모든 모드**에서 시스템 프롬프트에 자동 추가
- `.roo/rules-{mode}/` — **해당 모드에서만** 추가
- 파일명의 숫자 접두사(`01-`, `02-`, `03-`)가 로딩 순서를 결정
- `.rooignore`에 지정된 경로는 AI가 읽지 않음 (`dist/`, `node_modules/` 등)

### 커스터마이징

**새 규칙 추가:**
```bash
# 모든 모드에 적용
echo "# 새 규칙 내용" > .roo/rules/04-new-rule.md

# 특정 모드에만 적용
echo "# Code 모드 규칙" > .roo/rules-code/02-new-code-rule.md
```

**새 스킬 추가:**
```bash
mkdir -p .roo/skills/my-skill
cat > .roo/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: 스킬 설명
---

# 스킬 지침

1. 단계 1
2. 단계 2
EOF
```

## License

Apache-2.0 — Same as [Roo Code](https://github.com/RooCodeInc/Roo-Code).
