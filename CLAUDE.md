# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Korean real estate helper app ("둥지트기 도우미").
- **Backend**: Spring Boot 3.2.5, Java 21, Maven multi-module, JPA, JWT, Lombok
- **Frontend**: React 18 + TypeScript + Vite + Tailwind v4

---

## Commands

### Backend
```bash
# Local dev (H2 in-memory)
SPRING_PROFILES_ACTIVE=local \
JAVA_HOME=/Users/User/Library/Java/JavaVirtualMachines/ms-21.0.11/Contents/Home \
./mvnw spring-boot:run -pl api -am

# Build (from backend/)
JAVA_HOME=... ./mvnw clean package -pl api -am -DskipTests
```

> **Read `backend-dev-guide.md` before modifying any `backend/` file.**

### Frontend (from `frontend/`)
```bash
npm run dev      # dev server (Vite)
npm run build    # tsc + Vite build
npm run lint     # ESLint
```

---

## Backend

### Multi-module layout
```
backend/
├── api/    — executable module (com.zaritalk.api)
│   ├── controller/      HTTP 진입점
│   ├── config/          WebConfig (CORS, ArgumentResolvers)
│   ├── exception/       GlobalExceptionHandler, ErrorResponse
│   ├── infrastructure/  Port 구현체 (BldgLedgerAdapter, MolitTradeAdapter, MarketPriceAdapter)
│   └── service/         JwtService (인증)
└── core/   — domain module (com.zaritalk.core)
    ├── domain/          JPA 엔티티
    ├── port/            외부 시스템 계약 (interface)
    ├── repository/      Spring Data JPA
    └── service/         비즈니스 로직
```

### Architecture: Layered + selective Port/Adapter

**Ports are feature-based, not actor-based.**
`core/port/` declares what the domain needs; `api/infrastructure/` adapts external APIs to those ports.

```
core/port/BuildingRegistryPort   — "건물 등록 정보가 필요해"
core/port/TradeDataPort          — "거래 데이터가 필요해"
core/port/MarketPricePort        — "최근 실거래가 평균이 필요해"

api/infrastructure/BldgLedgerAdapter   — BuildingRegistryPort 구현 (건축물대장 API)
api/infrastructure/MolitTradeAdapter   — TradeDataPort 구현 (국토부 실거래가)
api/infrastructure/MarketPriceAdapter  — MarketPricePort 구현
```

Fallback 우선순위 정책(건축물대장 먼저 → MOLIT fallback)은 인프라가 아니라 `ExclusiveAreaService`(core)에 있다.

`DiagnosisController`는 정책 없는 단순 조회에 한해 `MarketPricePort`를 직접 참조한다. 정책이 생기면 `MarketPriceService`로 분리한다.

### DTO rules
- Java `record` 사용, 절대 `Map<String, Object>` 금지
- `@JsonProperty`로 JSON 필드명 매핑
- 컨트롤러는 `ResponseEntity<T>` 반환, `ResponseEntity<?>` 금지

### Dependency injection
`@RequiredArgsConstructor` + `private final` 필드. `@Autowired` 금지.

### Transactions
클래스가 아닌 개별 쓰기 서비스 메서드에 `@Transactional`.

### Domain entities
생성자 대신 `static create(...)` 팩토리 메서드. 클래스 외부에서 접근하는 필드에만 수동 getter.

### External API: data.go.kr service key
**항상 URL-encode.** `+`, `/`, `=`가 포함된 키를 인코딩 없이 쓰면 403 발생.

```java
"?serviceKey=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8)
```

MolitTradeAdapter, BldgLedgerAdapter, 신규 data.go.kr 통합 모두 동일하게 적용.

| Service | Base URL | Key config |
|---|---|---|
| MOLIT 아파트 | `apis.data.go.kr/1613000/RTMSDataSvcAptTrade/...` | `${MOLIT_API_KEY}` |
| MOLIT 연립다세대 | `apis.data.go.kr/1613000/RTMSDataSvcRHTrade/...` | `${MOLIT_API_KEY}` |
| 건축물대장 | `apis.data.go.kr/1613000/BldRgstHubService/getBrExposPubuseAreaInfo` | `${BUILDING_API_KEY}` |

### Jackson: single-object-or-array fields
data.go.kr API는 결과가 1건이면 `"item"`을 객체로, 2건 이상이면 배열로 반환한다. 커스텀 `StdDeserializer`로 처리:

```java
if (p.currentToken() == JsonToken.START_ARRAY) {
    while (p.nextToken() != JsonToken.END_ARRAY) result.add(ctx.readValue(p, Dto.class));
} else if (p.currentToken() == JsonToken.START_OBJECT) {
    result.add(ctx.readValue(p, Dto.class));
}
```

```java
@JsonDeserialize(using = MyItemListDeserializer.class)
@JsonProperty("item") List<MyItemDto> item
```

### RestTemplate (외부 API 서비스 공통 설정)
```java
RestTemplate rt = new RestTemplate();
rt.getMessageConverters().removeIf(c -> c instanceof MappingJackson2HttpMessageConverter);
rt.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
```

### Secrets & config
- `application.yml` — `${ENV_VAR}` 플레이스홀더만, 실값 없음
- `application-local.yml` — 로컬 실값, **gitignored** (H2 + 로컬 API 키)
- `application-local.yml.example` — 커밋된 템플릿 (변수명만)
- 로컬 프로파일 활성화: `SPRING_PROFILES_ACTIVE=local`

환경변수:
```
KAKAO_REST_API_KEY, KAKAO_CLIENT_SECRET, KAKAO_REDIRECT_URI
JWT_SECRET
MOLIT_API_KEY, BUILDING_API_KEY
MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD  (운영)
CORS_ALLOWED_ORIGINS  (운영, 기본값: localhost:5173,5174)
```

---

## Frontend

### Stack
- React 18 + TypeScript + Vite
- Tailwind v4 (CSS-first, `@theme` in `src/index.css`)
- `src/`: `pages/`, `components/`, `api/`, `utils/`, `types/`, `constants/`, `hooks/`, `context/`

### API base URL
`import.meta.env.VITE_API_URL`을 사용한다. 로컬 개발은 `frontend/.env.local`(gitignored)에 설정:
```
VITE_API_URL=http://localhost:8080
```

### Color tokens
모든 색상은 `src/index.css`의 `@theme`에 정의. 하드코딩 금지.

**Tailwind 클래스** — 토큰명 직접 사용:
```tsx
className="bg-primary text-white disabled:bg-border disabled:text-tertiary"
```

**JS 값** (인라인 스타일, props) — `var(--color-*)` 사용:
```tsx
style={{ color: 'var(--color-success)' }}
```

신규 색상 추가: `@theme`에 `--color-name: #RRGGBB;` 추가 시 Tailwind가 `bg-name`, `text-name` 등 자동 생성.

주요 토큰: `primary` / `success` / `warning` / `danger` / `info` / `note` / `kakao`, 각각 `-bg`, `-bg-light`, `-border`, `-text` 등 variants.
