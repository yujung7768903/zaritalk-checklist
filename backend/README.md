# Backend — 아키텍처 결정 기록

## 전체 구조

레이어드 아키텍처 + 선택적 헥사고날 원칙.  
외부 API처럼 구현이 바뀔 수 있는 지점에만 Port/Adapter 패턴을 적용하고, 나머지는 일반 레이어드 방식을 따른다.

```
core/                   도메인 + 비즈니스 규칙 (외부 의존 없음)
├── domain/
├── port/               core가 외부에 요구하는 계약 (interface)
├── repository/         Spring Data JPA (포트로 감싸지 않음)
└── service/            비즈니스 로직

api/                    실행 모듈
├── controller/         HTTP 진입점
├── infrastructure/     Port 구현체 (외부 API 어댑터)
│   ├── bldg/           건축물대장 HTTP 클라이언트
│   └── molit/          국토부 실거래가 HTTP 클라이언트
└── service/            인증 등 api 계층 전용 서비스
```

---

## 포트 설계 고민: Actor 기준 vs 기능 기준

### 문제

전용면적을 구하는 방법은 달라질 수 있다. 현재는 두 가지 소스를 사용한다.
1. 건축물대장 API (1순위)
2. 국토부 실거래가 API (2순위 fallback)

초기에는 이 fallback 로직을 하나의 어댑터(`ExclusiveAreaAdapter`)에 넣고 `ExclusiveAreaPort` 하나로 추상화했다.

### 문제점

"건축물대장을 먼저, 실거래가를 나중에"라는 우선순위 정책은 **비즈니스 결정**이다.  
그런데 이 정책이 인프라 계층인 어댑터 안에 있으면, 정책이 바뀔 때 어댑터를 건드려야 한다.  
어댑터는 "어떻게 API를 호출하는가"만 알아야 하지, "어디서 먼저 가져올 것인가"를 결정해서는 안 된다.

### Actor 기준 포트를 고려했지만 기각

```
// core가 외부 시스템 이름을 알게 됨
private final BldgLedgerPort bldgLedgerPort;  // BldgLedger가 뭔지 core가 알아야 함
private final MolitPort molitPort;
```

Actor(데이터 소스) 이름을 포트에 쓰면 BldgLedger를 다른 API로 교체할 때 포트 이름까지 바꿔야 한다.  
포트는 core(소비자)의 관점에서, "무엇이 필요한가"로 이름 짓는 것이 원칙이다.

### 채택한 방식: 기능 기준 포트 + fallback 로직을 서비스로

```
core/port/
├── BuildingRegistryPort   "건물 등록 정보가 필요해"  (BldgLedger 몰라도 됨)
└── TradeDataPort          "거래 데이터가 필요해"     (MOLIT 몰라도 됨)

core/service/
└── ExclusiveAreaService   fallback 우선순위 결정 (비즈니스 정책)

api/infrastructure/
├── BldgLedgerAdapter      BuildingRegistryPort 구현
└── MolitTradeAdapter      TradeDataPort 구현
```

BldgLedger를 다른 API로 교체해도 `BldgLedgerAdapter`만 바꾸면 된다.  
fallback 순서가 바뀌어도 `ExclusiveAreaService`만 바꾸면 된다.  
두 변경 이유가 분리됐다.
