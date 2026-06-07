# Backend Development Guide

## Architecture

Layered architecture with selected Hexagonal principles. The project is small, so a full Hexagonal approach is unnecessary — but external system coupling and testability matter.

### Abstract external systems behind a Port interface

```java
public interface AreaLookupPort {
    List<Double> fetchAreas(String bcode, String address);
}

@Service
public class DiagnosisService {
    private final AreaLookupPort areaLookup;
    // ...
}

@Component
public class BldgLedgerAdapter implements AreaLookupPort { ... }
```

### Split responsibility by feature, not just by layer

Prefer `PlanCommandService` / `PlanQueryService` over a single `PlanService` that grows unbounded.

### Repositories are NOT ports

JPA repositories stay as Spring Data interfaces. Wrapping them in ports hides useful built-in methods without benefit at this scale.

---

## Separation of Concerns

If two pieces of code change for different reasons or at different times, they belong in different classes. Don't mix HTTP handling, business logic, and data access in one place.

---

## No Magic Numbers

Replace numeric/string literals that carry meaning with named constants.

```java
// Bad
if (debtRatio > 90) { ... }

// Good
private static final double HUG_MAX_DEBT_RATIO = 90.0;
if (debtRatio > HUG_MAX_DEBT_RATIO) { ... }
```

---

## Law of Demeter

Only talk to immediate collaborators. Don't chain through another object's internals.

```java
// Bad
user.getAddress().getCity().getName()

// Good
user.getCityName()   // delegate inside User
```

---

## Object Creation Responsibility

Construction logic belongs inside the class (static factory) or a dedicated Factory — never scattered at call sites.

```java
// Bad
new Payment(orderId, currency, amount, exchangeRate, validUntil)

// Good
Payment.createPrepared(orderId, currency, amount, exchangeRate, validUntil)
```

---

## Null Handling

- Return `Optional<T>` when a value may be absent — only on return types, never on parameters or fields
- Return empty collections instead of `null`
- Never pass `null` as a method argument

```java
// Bad
return null;

// Good
return Optional.empty();
return Collections.emptyList();
```

---

## Early Return

Handle guard conditions first; keep the happy path at the bottom with minimal nesting.

```java
// Bad
if (user != null) {
    if (user.isActive()) {
        process(user);
    }
}

// Good
if (user == null) return;
if (!user.isActive()) return;
process(user);
```

---

## Prefer Immutability

- Use `final` for fields whenever possible
- DTOs as `record` (immutable by definition)
- Return unmodifiable collections from methods that expose internal state

```java
public record UserResponse(Long id, String name) {}
```

---

## Use Enums for Meaningful States

```java
// Bad
if ("ACTIVE".equals(status)) { ... }

// Good
if (UserStatus.ACTIVE == status) { ... }
```

---

## Business Rules Belong in Service or Domain

- **Controller**: request/response mapping only
- **Repository**: data access only
- **Service / Domain**: all business rules

```java
// Bad — logic in controller
@GetMapping
public ResponseEntity<?> create() {
    if (user.getAge() < 19) throw new Exception();
    ...
}

// Good
planService.createPlan(userId);  // validation inside service
```

---

## Never Expose Entities Directly

Controllers and external layers must use DTOs. Entities stay inside the persistence layer.

```java
// Bad
public User getUser() { ... }

// Good
public UserResponse getUser() { ... }
```

---

## Readability Over Premature Optimization

Optimize only when profiling identifies an actual bottleneck. Clear code first.

---

## Logging

| Level | When |
|---|---|
| `INFO` | Key business events (order created, diagnosis saved) |
| `WARN` | Expected failures, degraded fallback (API timeout, empty result) |
| `ERROR` | Unexpected exceptions that need investigation |
| `DEBUG` | Detailed internal state, only useful during development |

Rules:
- Include a traceable identifier in every log line (`orderId={}`, `userId={}`)
- Never log PII (names, phone numbers, addresses as entered by users)
- `WARN` for recoverable external API failures; `ERROR` only when the system cannot continue

```java
log.info("Diagnosis saved. userId={}, type={}", userId, type);
log.warn("MOLIT API returned empty result [sigunguCode={}, ym={}]", code, ym);
log.error("Unexpected failure saving diagnosis. userId={}", userId, e);
```

---

## Tests

### Principles
- Test **behavior**, not implementation — don't couple tests to private methods or internal state
- One test = one scenario
- Test both happy path and edge/error cases
- Tests must be independent of each other

### Naming
Test names must describe the scenario without reading the body:

```java
// Bad
@Test void test1() {}

// Good
@Test void 탈퇴한_회원은_플랜을_생성할_수_없다() {}
```

### Structure: Given / When / Then

```java
// given
User user = User.withdrawn();

// when & then
assertThatThrownBy(() -> planService.create(user))
    .isInstanceOf(WithdrawnUserException.class);
```

### Prefer a single assertion per behavior

```java
// Bad
assertThat(result.getValue()).isEqualTo("SUCCESS");
assertThat(result.getCode()).isEqualTo(200);
assertThat(result.getStatus()).isEqualTo("OK");

// Good
assertThat(result).isEqualTo(expectedResult);
```

---

## Testability

Abstract anything that is non-deterministic or external: clocks, HTTP clients, file systems.

```java
// Bad
LocalDateTime now = LocalDateTime.now();

// Good
private final Clock clock;
LocalDateTime now = LocalDateTime.now(clock);
```

Avoid `static` utility calls that can't be replaced in tests. Use constructor injection.

---

## Comments: Code Over Prose

Express intent through names. A comment that just restates the method name adds noise.

**Write a Javadoc comment on public methods when it adds information beyond the name:**
- Role and main policy
- Fallback behaviour
- External system constraints
- Non-obvious invariants

```java
/**
 * Fetches exclusive-use areas for the given address.
 * Tries building registry API first; falls back to MOLIT trade data if empty.
 */
public List<Double> fetchAreas(...) {}

// data.go.kr blocks >5 identical requests per minute — results are cached
```

**Do NOT comment:**
- What a single line does (`// fetch user`)
- Variable declarations
- Anything the method name already says

**Private methods**: no Javadoc unless the logic is genuinely non-obvious.

---

## TODO Comments

Every TODO needs a reason and an issue reference. No open-ended "fix later" notes.

```java
// Good
// TODO(#42): update DTO field names after MOLIT API v2 migration

// Bad
// TODO fix this later
```
