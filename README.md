# 자리톡 체크리스트

## 기술 스택

### Frontend
| 항목 | 기술 |
|------|------|
| 언어 | TypeScript |
| 프레임워크 | React 18 |
| 빌드 도구 | Vite |
| 라우팅 | React Router v6 |
| HTTP 클라이언트 | Axios |
| 스타일링 | Tailwind CSS |
| 테스트 | Vitest + React Testing Library |

> TanStack Query, Zustand 등 상태 라이브러리는 도입하지 않음.
> API 호출은 Axios + useState/useEffect, 로컬 상태는 useState + localStorage로 충분.

### Backend
| 항목 | 기술 |
|------|------|
| 언어 | Java 21 |
| 프레임워크 | Spring Boot 3.2.x |
| 빌드 도구 | Maven (단일 모듈) |
| ORM | Spring Data JPA |
| DB (운영) | MySQL 8 |
| DB (개발/테스트) | H2 in-memory |
| 테스트 | JUnit 5 + Mockito |
| 기타 | Lombok |

