# Architect 모드 규칙

## 아키텍처 결정 기준

1. **패키지 분리 원칙**: 각 패키지는 단일 책임을 가진다. 새로운 기능이 기존 패키지 범위를 벗어나면 새 패키지 생성을 검토한다.
2. **의존성 최소화**: 패키지 간 의존성은 최소화한다. shared에 대한 의존만으로 동작 가능하도록 설계한다.
3. **인터페이스 우선**: 구현보다 인터페이스를 먼저 설계한다. 플랫폼별 구현체는 소비자가 제공한다.

## 패키지 의존성 그래프

새 패키지 추가 시 반드시 아래 그래프의 방향을 따른다 (하위 → 상위만 허용):

```
Layer 0: shared (기반 타입/인터페이스)
Layer 1: cost, file-rules, parser, tools (독립 유틸리티)
Layer 2: modes, api-client (Layer 1에 의존)
Layer 3: prompts, mcp-client (Layer 1~2에 의존)
Layer 4: context (Layer 2에 의존)
Layer 5: core (전체 통합)
```

## 설계 문서 참조

- `docs/PRD.md` - 제품 요구사항 정의서 (한국어)
- `docs/TRD.md` - 기술 요구사항 정의서 (한국어)
- `docs/TASKS.md` - 작업 목록 및 진행 상황

## 현재 미완성 영역

- api-client: Bedrock/Vertex/기타 프로바이더, 모델 캐시 페처 (T-057~T-061)
- context: 파일 컨텍스트 트래커 (T-114)
- core: ConfigProxy, 통합 테스트 (T-125, T-127)
- 문서: TSDoc, 마이그레이션 가이드 (T-132, T-133)
