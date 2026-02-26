# PRD: Roo Code 이식 가능 핵심 모듈 라이브러리 (bkit-roo)

## 1. 개요

### 1.1 프로젝트 비전

[Roo Code](https://github.com/RooCodeInc/Roo-Code)는 VS Code 확장 프로그램 형태의 AI 코딩 에이전트이다. 이 프로젝트(`bkit-roo`)는 Roo Code의 핵심 로직 중 **VS Code에 의존하지 않는 이식 가능한(portable) 모듈**들을 추출하여 독립적인 TypeScript 라이브러리로 재구성하는 것을 목표로 한다.

이를 통해 CLI 도구, 웹 애플리케이션, JetBrains 플러그인, Electron 앱 등 다양한 플랫폼에서 Roo Code의 핵심 AI 에이전트 기능을 재사용할 수 있다.

### 1.2 프로젝트 명

**bkit-roo** — "Backend Kit for Roo" — Roo Code의 플랫폼 독립적 백엔드 핵심 킷

### 1.3 배경

Roo Code(구 Roo Cline)는 Apache 2.0 라이선스의 오픈소스 프로젝트로, 22,000+ GitHub 스타와 300+ 기여자를 보유한 대표적인 AI 코딩 에이전트이다. 그러나 현재 아키텍처는 VS Code API에 강하게 결합되어 있어 다른 환경에서의 활용이 제한적이다.

Roo Code의 핵심 가치는 VS Code UI가 아닌, 그 아래의 **AI 에이전트 오케스트레이션 로직**에 있다. 이를 분리하면 다양한 프론트엔드에서 동일한 AI 에이전트 능력을 활용할 수 있다.

---

## 2. 이식 가능성 분석

### 2.1 이식 가능한 모듈 (대상)

| # | 모듈 | 원본 경로 | 이식 가능 사유 |
|---|------|-----------|---------------|
| 1 | **LLM API 프로바이더 추상화** | `src/api/` | 순수 HTTP/SDK 호출, VS Code 무관 |
| 2 | **시스템 프롬프트 생성** | `src/core/prompts/` | 문자열 조합 로직, 플랫폼 무관 |
| 3 | **어시스턴트 메시지 파서** | `src/core/assistant-message/` | XML/텍스트 파싱, 순수 로직 |
| 4 | **도구(Tool) 정의 및 스키마** | `src/core/prompts/sections/tools.ts` | 도구 설명 생성, 순수 로직 |
| 5 | **MCP 클라이언트** | `src/services/mcp/` | 표준 프로토콜 기반, 플랫폼 무관 |
| 6 | **커스텀 모드 시스템** | `src/core/config/CustomModesManager.ts` | 모드 정의/권한, 순수 데이터 구조 |
| 7 | **컨텍스트 관리** | `src/core/context-management/` | 토큰 예산 계산, 순수 로직 |
| 8 | **컨텍스트 압축(Condensation)** | `src/core/condense/` | 메시지 요약, LLM 호출 기반 |
| 9 | **메시지 관리** | `src/core/message-manager/` | 메시지 이력 직렬화, 순수 데이터 |
| 10 | **비용 계산** | `src/shared/cost.ts`, `api.ts` | 산술 계산, 플랫폼 무관 |
| 11 | **파일 무시/보호 규칙** | `src/core/ignore/`, `src/core/protect/` | 규칙 파싱 로직 (파일 I/O 추상화 필요) |
| 12 | **공유 타입** | `src/shared/` | TypeScript 인터페이스/타입 정의 |
| 13 | **멘션(@) 파싱** | `src/core/mentions/` | 구문 분석 로직, 순수 파싱 |

### 2.2 이식 불가능한 모듈 (제외)

| 모듈 | 원본 경로 | 제외 사유 |
|------|-----------|-----------|
| ClineProvider (WebviewProvider) | `src/core/webview/` | VS Code Webview API 의존 |
| Webview UI (React) | `webview-ui/` | VS Code Webview 패널 의존 |
| 터미널 통합 | `src/integrations/terminal/` | VS Code Terminal API 의존 |
| 진단(Diagnostics) 통합 | `src/integrations/diagnostics/` | VS Code Diagnostics API 의존 |
| 확장 라이프사이클 | `src/extension.ts` | VS Code Extension Host 의존 |
| 브라우저 액션 | browser_action 도구 | VS Code 내 headless 브라우저 의존 |
| 에디터 통합 | 데코레이션, 선택 등 | VS Code Editor API 의존 |

---

## 3. 제품 요구사항

### 3.1 핵심 기능 요구사항

#### FR-01: 멀티 프로바이더 LLM API 클라이언트
- 20+ AI 프로바이더 지원 (Anthropic, OpenAI, Google, OpenRouter, Ollama 등)
- 팩토리 패턴 기반 프로바이더 인스턴스 생성
- 스트리밍 응답 처리
- 모델 메타데이터 캐시 및 조회
- 통합된 에러 핸들링 및 재시도 로직

#### FR-02: 시스템 프롬프트 엔진
- 모드 기반 동적 프롬프트 생성
- 도구 설명 자동 포함 (모드별 허용 도구만)
- 커스텀 시스템 프롬프트 병합
- MCP 도구/리소스 설명 자동 포함
- 프로젝트 컨텍스트(규칙 파일) 로딩

#### FR-03: 어시스턴트 메시지 파서
- XML 태그 기반 도구 호출 파싱
- 스트리밍 파싱 (부분 메시지 지원)
- 텍스트 블록과 도구 블록 분리
- 네이티브 function calling 프로토콜 지원

#### FR-04: 도구 시스템 프레임워크
- 도구 정의 스키마 (이름, 파라미터, 설명)
- 모드별 도구 접근 권한 관리
- 도구 실행 결과 타입 정의
- 승인(Approval) 인터페이스 추상화
- 도구 그룹 분류: `read`, `edit`, `command`, `mcp`

#### FR-05: MCP 클라이언트
- MCP 서버 연결 관리 (stdio, SSE, streamable-http)
- 도구 발견 및 호출
- 리소스 접근
- 서버 설정 로딩 (글로벌 + 프로젝트 수준)
- 연결 상태 모니터링

#### FR-06: 모드 시스템
- 빌트인 모드 정의 (Code, Architect, Ask, Debug, Orchestrator)
- 커스텀 모드 생성/수정/삭제
- 모드별 도구 권한 설정
- 모드별 스티키 모델 바인딩
- 모드별 커스텀 인스트럭션

#### FR-07: 컨텍스트 관리
- 토큰 예산 계산 및 관리
- 컨텍스트 윈도우 추적
- 메시지 이력 직렬화/역직렬화
- 컨텍스트 압축 (대화 요약)
- 파일 컨텍스트 추적

#### FR-08: 비용 추적
- 프로바이더별 토큰 가격 정보
- 요청별 입력/출력 토큰 카운트
- 세션/태스크별 누적 비용 계산
- API 메트릭 집계

#### FR-09: 파일 규칙 시스템
- `.rooignore` 규칙 파싱 (gitignore 호환)
- `.rooprotected` 파일 보호 규칙
- 파일 경로 매칭 엔진
- 파일 시스템 추상화 인터페이스

#### FR-10: 멘션 시스템
- `@file`, `@folder`, `@url`, `@problems` 등 멘션 구문 파싱
- 멘션 → 컨텍스트 블록 변환
- 확장 가능한 멘션 타입 레지스트리

### 3.2 비기능 요구사항

#### NFR-01: 플랫폼 독립성
- Node.js 18+ 환경에서 동작
- VS Code API에 대한 **zero dependency**
- 브라우저 환경 호환 고려 (향후)

#### NFR-02: 패키지 구조
- 모노레포 구조 (`packages/` 하위)
- 각 모듈은 독립적으로 npm publish 가능
- 트리 쉐이킹 지원 (ESM + CJS 빌드)

#### NFR-03: 타입 안전성
- 100% TypeScript
- 엄격한 타입 검사 (`strict: true`)
- 모듈 간 공유 타입 패키지

#### NFR-04: 테스트
- 단위 테스트 커버리지 80% 이상
- 통합 테스트 (모의 LLM 서버)
- 원본 Roo Code 테스트와의 호환성 검증

#### NFR-05: 문서화
- 각 패키지별 API 문서 (TSDoc)
- 사용 예제 코드
- 마이그레이션 가이드 (Roo Code → bkit-roo)

---

## 4. 사용자 시나리오

### 시나리오 1: CLI AI 코딩 에이전트
```
개발자가 bkit-roo를 사용하여 터미널 기반 AI 코딩 에이전트를 구축한다.
LLM API 클라이언트, 시스템 프롬프트 엔진, 메시지 파서를 조합하여
VS Code 없이도 AI 에이전트와 대화하고 코드를 생성할 수 있다.
```

### 시나리오 2: 웹 기반 AI 코딩 플랫폼
```
스타트업이 bkit-roo의 코어 모듈을 웹 서버에 통합하여
브라우저 기반 AI 코딩 어시스턴트를 구축한다.
MCP 클라이언트를 통해 외부 도구를 연결하고,
모드 시스템으로 사용자별 커스텀 워크플로를 제공한다.
```

### 시나리오 3: JetBrains IDE 플러그인
```
JetBrains 플러그인 개발자가 bkit-roo를 의존성으로 추가하여
IntelliJ, WebStorm 등에서 Roo Code와 동일한 AI 에이전트 기능을 제공한다.
도구 실행만 JetBrains API로 구현하고, 나머지 로직은 bkit-roo를 재사용한다.
```

---

## 5. 성공 기준

| 기준 | 지표 |
|------|------|
| 이식 완료 | 13개 이식 대상 모듈 중 13개 완료 |
| 테스트 통과 | 원본 Roo Code의 해당 모듈 테스트 90% 이상 통과 |
| 독립 실행 | VS Code 없이 Node.js 환경에서 전체 기능 동작 |
| 패키지 빌드 | 모든 패키지 정상 빌드 및 타입 검사 통과 |
| 문서화 | 각 패키지별 README 및 API 문서 완비 |

---

## 6. 범위 외 (Out of Scope)

- VS Code 확장 프로그램 개발
- Webview UI 구현
- 특정 IDE 플러그인 개발 (라이브러리만 제공)
- Roo Code Cloud 기능
- 브라우저 자동화 (browser_action)
- 인증/인가 시스템

---

## 7. 리스크 및 의존성

### 7.1 리스크

| 리스크 | 영향 | 완화 방안 |
|--------|------|-----------|
| 원본 코드의 VS Code 암묵적 의존 | 예상보다 이식 범위 축소 | 모듈별 의존성 사전 분석 |
| 원본 코드 업스트림 변경 | 동기화 부담 | 주요 버전 기준 스냅샷 |
| MCP 프로토콜 변경 | 호환성 문제 | 공식 MCP SDK 사용 |
| 20+ 프로바이더 유지보수 | 관리 비용 증가 | 우선순위 프로바이더 선별 |

### 7.2 외부 의존성

- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [OpenAI SDK](https://github.com/openai/openai-node)
- [Google AI SDK](https://github.com/google/generative-ai-js)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- tree-sitter WASM (코드 분석용)

---

## 8. 참고 자료

- [Roo Code GitHub](https://github.com/RooCodeInc/Roo-Code)
- [Roo Code 공식 문서](https://docs.roocode.com/)
- [Roo Code 도구 사용법](https://docs.roocode.com/basic-usage/how-tools-work)
- [MCP 프로토콜 명세](https://docs.roocode.com/features/mcp/what-is-mcp)
- [Roo Code 모드 시스템](https://docs.roocode.com/basic-usage/using-modes)
