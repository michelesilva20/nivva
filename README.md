# Nivva

**Personal finance, with clearer numbers.** A React Native application backed by a Java API, built to organize accounts, income, expenses and financial goals.

**Status:** active development. Local and API modes are explicit. AI insights and Open Finance are future work; this version does not connect to banks or process payments.

## Engineering at a glance

| Area | Implementation |
| --- | --- |
| Backend | Java 21, Spring Boot 4.1.1, Spring Security, JPA, Flyway |
| Data | PostgreSQL 16; integer cents; user-owned accounts, transactions and goals |
| Mobile | React Native, Expo, TypeScript, Expo Router, SecureStore |
| Tests | JUnit, Testcontainers, TypeScript tests through node:test and tsx |
| Architecture | Modular monolith; mobile repository adapters for local storage or REST |

## What works today

| Capability | Local mode | API mode |
| --- | --- | --- |
| Identity | Demonstration session, no login | Register/login with JWT |
| Accounts | Demonstration accounts | User-owned accounts; create, edit and delete empty accounts |
| Income and expenses | Device persistence and read-only seed | PostgreSQL persistence, ownership checks and CRUD |
| Goals and contributions | Device persistence | User-owned goals and server-backed contributions |
| Monthly budget | Device persistence | Device persistence scoped by user; no Budget API |
| Insights | Demonstration text | Empty state; no AI analysis |

Switching modes does not synchronize or migrate data. API errors do not silently fall back to demonstration data. Goal contributions track progress independently of account transactions.

## Architecture and decisions

```text
Expo routes → feature providers → repository interfaces
                                  ├─ local adapters → AsyncStorage
                                  └─ API adapters → REST + JWT
                                                     ↓
                                       Spring Security → feature services
                                                     ↓
                                             JPA → PostgreSQL
```

- **Money in integer cents.** Transaction signs are checked in the application and database; balances and progress are derived.
- **Ownership from authenticated identity.** User-scoped queries protect financial resources. Cross-user lookups return not found.
- **Concurrency control.** Contributions lock the owned goal before reading the total and validating the next amount. See the [case study](docs/case-study-goal-consistency.md).
- **Replaceable persistence.** The UI consumes repository contracts, with adapters for local storage or HTTP.

Explore the existing [ADRs](docs/adr/), [project map in Portuguese](docs/PROJETO.md) and [directory map](docs/ESTRUTURA.md).

## Run locally

Requirements: JDK 21, Node.js/npm, Expo Go for the mobile experience, and Docker for PostgreSQL and integration tests. Follow the component guides for version-specific requirements.

### API

In `nivva-api/`, copy `.env.example` to `.env` for reference and **export the required variables in your shell**. Spring Boot does not automatically load this dotenv file. Generate `NIVVA_JWT_SECRET_BASE64` from at least 32 random bytes, for example with `openssl rand -base64 32`. Never commit the secret.

```sh
cd nivva-api
docker compose up -d
./mvnw spring-boot:run
```

On Windows, use `mvnw.cmd` instead of `./mvnw`. The Compose database uses development-only credentials and port `55432`. Health: `http://localhost:8080/actuator/health`. See the [API guide](nivva-api/README.md) for configuration, endpoints and OpenAPI.

### Mobile

In a separate terminal:

```sh
cd nivva-mobile
npm ci
npx expo start --go
```

The default source is `local`. For backend integration, copy `nivva-mobile/.env.example` to `.env`, set `EXPO_PUBLIC_TRANSACTION_SOURCE=api`, and set `EXPO_PUBLIC_NIVVA_API_BASE_URL` to a host reachable from the device. On a physical phone, localhost refers to the phone. Public Expo variables must never contain secrets. See the [mobile guide](nivva-mobile/README.md).

## Validate

```sh
# API, with Docker running for integration tests
cd nivva-api
./mvnw test

# Mobile, in a separate terminal
cd nivva-mobile
npm run typecheck
npm test
```

**A successful Maven run can include skipped integration tests when Docker is unavailable.** Check the skipped count before treating a run as integration evidence. This repository currently has no committed GitHub Actions workflow.

## Boundaries and next steps

- No refresh token or server-side session revocation; access tokens expire after one hour.
- No offline synchronization, cloud deployment, Budget API, transfers, card processing or bank integration.
- No pagination in the current API.
- AI-assisted development supports implementation and review; it is separate from future product AI.
- Priorities: reproducible CI with PostgreSQL tests, session lifecycle improvements, and server-backed budgets before intelligent insights.

## Em português

O Nivva organiza finanças com app React Native/Expo e API Java/Spring Boot. Contas, lançamentos e metas usam PostgreSQL no modo API; o orçamento ainda fica no aparelho. O modo local usa demonstração e persistência local. IA e Open Finance são planos futuros. Consulte o [mapa detalhado](docs/PROJETO.md).
