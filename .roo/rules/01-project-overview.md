# bkit-roo 프로젝트 개요

## 프로젝트 정의

bkit-roo (Backend Kit for Roo)는 Roo Code VS Code 확장의 핵심 AI 에이전트 로직을 VS Code 의존성 없이 사용할 수 있도록 추출한 모듈러 TypeScript 모노레포이다.

## 핵심 원칙

1. **VS Code 독립성**: 어떤 패키지에서도 `vscode` 모듈을 import하면 안 된다. `pnpm check-vscode`로 항상 검증한다.
2. **플랫폼 추상화**: VS Code API 대신 `@bkit-roo/shared`의 인터페이스(IFileSystem, ITerminalExecutor, IApprovalGate 등)를 사용한다.
3. **의존성 방향**: 모든 패키지는 shared에 의존하고, 순환 의존은 허용하지 않는다.
4. **단일 진입점**: 각 패키지는 `src/index.ts`에서만 public API를 export한다.

## 모노레포 구조

```
packages/
  shared/       # 기본 타입, 인터페이스, 상수
  cost/         # 토큰 가격 및 비용 계산
  file-rules/   # .rooignore/.rooprotected 파싱
  parser/       # XML 메시지 파서, 멘션 파서
  tools/        # 도구 정의, 스키마, 승인 게이트
  modes/        # 빌트인 모드 + 커스텀 모드 관리
  api-client/   # 멀티 프로바이더 LLM 클라이언트
  prompts/      # 동적 시스템 프롬프트 생성
  mcp-client/   # MCP 서버 연결 허브
  context/      # 토큰 예산, 컨텍스트 압축
  core/         # 통합 AgentRunner 오케스트레이터
examples/
  simple-chat/  # 최소 LLM 채팅 예제
  cli-agent/    # 전체 AI 에이전트 CLI 예제
```

## 원본 참조

Roo Code 원본 소스는 `reference/roo-code/src/`에 있다. 이식 작업 시 반드시 원본과 비교한다.
