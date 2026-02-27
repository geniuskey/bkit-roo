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

각 파일에 `<!-- TODO: ... -->` 마커가 있습니다. 이 부분을 자기 프로젝트에 맞게 수정하세요.

**필수 수정** (이 3개를 수정하면 AI가 프로젝트를 이해합니다):

| 파일 | 수정 내용 |
|------|----------|
| `rules/01-project-overview.md` | 프로젝트 설명, 구조, 기술 스택 |
| `rules/02-development-workflow.md` | 빌드/테스트/배포 명령어 |
| `rules/03-coding-standards.md` | 코딩 컨벤션, 네이밍 규칙 |

**선택 수정** (필요에 따라):

| 파일 | 설명 |
|------|------|
| `.roomodes` | 커스텀 모드의 역할/권한 조정 |
| `rules-code/*` | Code 모드 구현 규칙 |
| `rules-architect/*` | Architect 모드 설계 규칙 |
| `rules-reviewer/*` | Reviewer 모드 리뷰 기준 |
| `rules-tester/*` | Tester 모드 테스트 규칙 |
| `rules-documenter/*` | Documenter 모드 문서화 규칙 |
| `skills/*` | 스킬 절차의 명령어/구조 |

### 4. VS Code에서 프로젝트 열기

VS Code로 프로젝트를 열면 Roo Code가 `.roomodes`, `.roo/`, `.rooignore`를 **자동 인식**합니다. 별도 설정은 필요 없습니다.

## 파일 구조

```
.roomodes                            # 커스텀 모드 정의
.rooignore                           # AI 컨텍스트 제외 패턴
.gitignore                           # Git 제외 패턴

.roo/
├── rules/                           # 모든 모드 공통 규칙
│   ├── 01-project-overview.md       #   프로젝트 구조, 기술 스택
│   ├── 02-development-workflow.md   #   빌드/테스트 명령어
│   └── 03-coding-standards.md       #   코딩 컨벤션, 네이밍 규칙
│
├── rules-code/                      # Code 모드 전용 규칙
│   └── 01-implementation-rules.md
│
├── rules-architect/                 # Architect 모드 전용 규칙
│   └── 01-architecture-rules.md
│
├── rules-reviewer/                  # Reviewer 모드 전용 규칙 (커스텀)
│   └── 01-review-rules.md
│
├── rules-tester/                    # Tester 모드 전용 규칙 (커스텀)
│   └── 01-testing-rules.md
│
├── rules-documenter/                # Documenter 모드 전용 규칙 (커스텀)
│   └── 01-documentation-rules.md
│
└── skills/                          # 모든 모드에서 사용 가능한 스킬
    ├── verify-build/SKILL.md        #   빌드 검증 파이프라인
    ├── scaffold-module/SKILL.md     #   새 모듈 스캐폴딩
    └── code-review/SKILL.md         #   코드 리뷰 체크리스트
```

## Roo Code 핵심 개념

### 모드 (Modes)

모드는 AI의 **역할과 권한 범위**를 정의합니다. Roo Code에는 기본 모드(Code, Architect, Ask, Debug)가 있고, `.roomodes` 파일로 커스텀 모드를 추가할 수 있습니다.

이 템플릿에 포함된 커스텀 모드:

| 모드 | 용도 | 파일 권한 |
|------|------|----------|
| **Reviewer** | 코드 리뷰 및 품질 검사 | 읽기 전용 (코드 수정 불가) |
| **Tester** | 테스트 작성 및 실행 | `*.test.*`, `*.spec.*`, `__tests__/` 편집 |
| **Documenter** | 문서 작성 | `*.md`, `*.ts`, `*.js` 등 편집 |

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

`.roomodes` 파일에 새 모드를 추가합니다:

```yaml
customModes:
  # ... 기존 모드 ...
  - slug: my-mode
    name: My Mode
    description: 모드 설명
    roleDefinition: AI에게 부여할 역할 정의
    whenToUse: 이 모드를 사용할 상황
    groups:
      - read
      - - edit
        - fileRegex: "\\.ts$"
      - command
```

### 모드별 전용 스킬 추가

특정 모드에서만 사용할 스킬은 `skills-{mode}/` 디렉터리에 배치합니다:

```bash
mkdir -p .roo/skills-tester/generate-fixtures
# .roo/skills-tester/generate-fixtures/SKILL.md 작성
```

## 참고 자료

- [Roo Code 공식 문서](https://docs.roocode.com/)
- [Roo Code GitHub](https://github.com/RooCodeInc/Roo-Code)
- [커스텀 모드 가이드](https://docs.roocode.com/features/custom-modes)
- [규칙 파일 가이드](https://docs.roocode.com/features/rules)

## License

Apache-2.0
