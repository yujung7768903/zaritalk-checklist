# CLAUDE.md — zaritalk-checklist

## Project overview

Korean real estate helper app ("둥지트기 도우미").
- **Backend**: Spring Boot 3.2.5, Java 21, H2 (in-memory), JPA, JWT, Lombok
- **Frontend**: React + TypeScript + Vite + Tailwind v4

---

## Backend

> **When modifying any file under `backend/`, read @backend-dev-guide.md first.**

### Stack & versions
- Java 21 (`JAVA_HOME=/Users/User/Library/Java/JavaVirtualMachines/ms-21.0.11/Contents/Home`)
- Spring Boot 3.2.5
- Run: `JAVA_HOME=... ./mvnw spring-boot:run -pl backend`
- Package root: `com.zaritalk.checklist`

### Package layout
```
controller/   — REST endpoints (@RestController, @RequestMapping("/api/v1"))
service/      — business logic, external API calls
domain/       — JPA entities
dto/          — request/response records
dto/deserializer/ — custom Jackson deserializers
repository/   — Spring Data JPA interfaces
config/       — WebConfig, etc.
exception/    — GlobalExceptionHandler, ErrorResponse
```

### DTO rules
- Use Java `record` for all DTOs, never `Map<String, Object>`
- Use `@JsonProperty` for JSON field name mapping
- Return typed `ResponseEntity<T>` from controllers, never `ResponseEntity<?>`

```java
// Good
public record TransactionResponse(long avgPrice, int count, String source) {}
public ResponseEntity<TransactionResponse> getTransactions(...) { ... }

// Bad
public ResponseEntity<?> getTransactions(...) { return ResponseEntity.ok(Map.of(...)); }
```

### Dependency injection
- Always use `@RequiredArgsConstructor` + `private final` fields — never `@Autowired`

### Transactions
- `@Transactional` on individual service methods that write, not on the class

### Domain entities
- Static factory method `create(...)` instead of public constructors
- Manual getters only for fields accessed outside the class

```java
public static User create(Long kakaoId, String nickname) {
    User u = new User();
    u.kakaoId = kakaoId;
    ...
    return u;
}
```

### External API: data.go.kr service key
**Always URL-encode the service key.** Keys contain `+`, `/`, `=` characters that break unencoded query strings and cause 403 responses.

```java
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

"?serviceKey=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8)
```

This applies to every `data.go.kr` API: MOLIT real-estate (`MolitApiService`), building registry (`BldgLedgerService`), and any future integrations.

### data.go.kr APIs in use
| Service | Base URL | Key config |
|---|---|---|
| MOLIT apt trade | `apis.data.go.kr/1613000/RTMSDataSvcAptTrade/...` | `${MOLIT_API_KEY}` |
| MOLIT villa trade | `apis.data.go.kr/1613000/RTMSDataSvcRHTrade/...` | `${MOLIT_API_KEY}` |
| Building registry | `apis.data.go.kr/1613000/BldRgstHubService/getBrExposPubuseAreaInfo` | `${BUILDING_API_KEY}` |

### Jackson: single-object-or-array fields
Some data.go.kr APIs return `"item"` as a single object when count=1, or an array when count>1. Handle with a custom `StdDeserializer`:

```java
// Check token type before deserializing
if (p.currentToken() == JsonToken.START_ARRAY) {
    // loop: while (p.nextToken() != END_ARRAY) result.add(ctx.readValue(p, Dto.class))
} else if (p.currentToken() == JsonToken.START_OBJECT) {
    result.add(ctx.readValue(p, Dto.class));
}
```

Then wire it on the record field:
```java
@JsonDeserialize(using = MyItemListDeserializer.class)
@JsonProperty("item") List<MyItemDto> item
```

### Secrets & config
- `application.yml` — only `${ENV_VAR}` placeholders, never real values
- `application-local.yml` — real local values, **gitignored** (`backend/src/main/resources/application-local.yml`)
- `application-local.yml.example` — committed template showing variable names
- Activate local profile: `SPRING_PROFILES_ACTIVE=local`

Current env vars:
```
KAKAO_REST_API_KEY, KAKAO_CLIENT_SECRET, KAKAO_REDIRECT_URI
JWT_SECRET
MOLIT_API_KEY
BUILDING_API_KEY
```

### RestTemplate setup (for external API services)
```java
public MyService() {
    RestTemplate rt = new RestTemplate();
    rt.getMessageConverters().removeIf(c -> c instanceof MappingJackson2HttpMessageConverter);
    rt.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
    this.restTemplate = rt;
}
```

---

## Frontend

### Stack
- React 18 + TypeScript + Vite
- Tailwind v4 (CSS-first config via `@theme` in `src/index.css`)
- `src/` root: `pages/`, `components/`, `utils/`, `api/`, `types/`, `constants/`, `hooks/`, `context/`

### Color tokens
All colors are defined in `src/index.css` under `@theme`. Never hardcode hex values.

**In Tailwind classes** — use the token name directly:
```tsx
className="bg-primary text-white disabled:bg-border disabled:text-tertiary"
```

**In JS string values** (inline styles, object properties passed as props) — use `var(--color-*)`:
```tsx
style={{ color: risk.color }}   // where risk.color = 'var(--color-success)'
valueColor="var(--color-danger)"
```

**Adding a new color**: add `--color-name: #RRGGBB;` to the `@theme` block. Tailwind v4 auto-generates `bg-name`, `text-name`, `border-name`, etc.

Key token groups: `primary` / `success` / `warning` / `danger` / `info` / `note` / `kakao`, each with `-bg`, `-bg-light`, `-border`, `-text`, `-text-dark`, `-bar` variants as needed.
