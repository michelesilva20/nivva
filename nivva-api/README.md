# Nivva API

Backend isolado do Nivva. Nesta fase só existe o vertical de **Transactions**, com contas e categorias de referência.

O app Expo em `nivva-mobile/` **não consome esta API**. Os dois projetos convivem; a persistência do celular continua no AsyncStorage.

## Stack

| Item | Versão |
| --- | --- |
| Java | 21 |
| Spring Boot | 4.1.1 |
| Maven | Wrapper 3.9.16 |
| PostgreSQL | 16 |
| Flyway | via starter |
| springdoc-openapi | 3.1.1 |
| Testcontainers | via Spring Boot |

## Pré-requisitos

- JDK 21
- Docker, para Postgres local e para os testes de integração

## Arquitetura

Modular monolith, package-by-feature. Um único deployable.

```text
HTTP
 ↓
TransactionController
 ↓
CreateTransactionRequest  (Bean Validation)
 ↓
TransactionService        (invariantes)
 ↓
TransactionRepository
 ↓
PostgreSQL
```

Account e Category são dados de referência. Transaction aponta para os dois.

## Datas e fuso

- A API aceita ISO-8601 com offset (`2026-09-29T13:30:00-03:00`).
- O Java interpreta o **instante**.
- O PostgreSQL guarda `TIMESTAMPTZ`.
- O requisito é preservar o instante, não o offset textual original.
- A resposta pode vir normalizada em UTC/Z (`2026-09-29T16:30:00Z`).
- Horário local é responsabilidade do cliente.

Isso se aproxima do mobile, que hoje usa `toISOString()` (UTC/Z).

## Como subir o PostgreSQL

Na pasta `nivva-api`:

```bash
docker compose up -d
```

Credenciais de desenvolvimento (não são segredo de produção): banco `nivva`, usuário `nivva`, senha `nivva`, porta `5432`. Copie `.env.example` se quiser sobrescrever com `DB_URL`, `DB_USERNAME` e `DB_PASSWORD`. Não commite `.env`.

## Como iniciar a API

Windows:

```bash
mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
./mvnw spring-boot:run
```

## Testes

Windows: `mvnw.cmd test`  
Linux/macOS: `./mvnw test`

Testes unitários não precisam de Docker. Testes de integração (`*IT` e o context load) sobem PostgreSQL via Testcontainers e são ignorados se o Docker não estiver no ar.

## Variáveis de ambiente

| Variável | Default local |
| --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/nivva` |
| `DB_USERNAME` | `nivva` |
| `DB_PASSWORD` | `nivva` |

## Migrations

Flyway em `src/main/resources/db/migration/`.  
`V1__create_reference_and_transaction_tables.sql` cria `accounts`, `categories`, `transactions` e semeia as referências. Hibernate só valida (`ddl-auto: validate`). Não há transações de demonstração no banco.

## OpenAPI e health

- Swagger UI: http://localhost:8080/swagger-ui
- OpenAPI JSON: http://localhost:8080/api-docs
- Health: http://localhost:8080/actuator/health

Só o endpoint `health` está exposto no Actuator.

## Endpoints

```text
GET    /api/v1/accounts
GET    /api/v1/categories
POST   /api/v1/transactions
GET    /api/v1/transactions
GET    /api/v1/transactions/{id}
PUT    /api/v1/transactions/{id}
DELETE /api/v1/transactions/{id}
```

Sem paginação nesta V1. Sem busca. `PUT` não troca o `type`.

### Invariantes de Transaction

- `INCOME` → `amountCents > 0`
- `EXPENSE` → `amountCents < 0`
- `amountCents != 0`
- account existe
- category existe
- `category.kind` compatível com `type`
- title trimado, 1–120 caracteres
- note trimada ou `null`, até 500 caracteres

A regra de sinal também existe como `CHECK` no PostgreSQL.

Erros: `400` validação/JSON, `404` transação inexistente, `422` regra semântica. Corpo em Problem Details.

## Exemplos curl

Substitua o host se a API não estiver em `localhost:8080`.

```bash
curl http://localhost:8080/actuator/health

curl http://localhost:8080/api/v1/accounts

curl http://localhost:8080/api/v1/categories

curl -X POST http://localhost:8080/api/v1/transactions ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"EXPENSE\",\"title\":\"Mercado\",\"categoryId\":\"food\",\"accountId\":\"main\",\"amountCents\":-10000,\"occurredAt\":\"2026-09-29T13:30:00-03:00\"}"
```

Linux/macOS:

```bash
curl -X POST http://localhost:8080/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{"type":"EXPENSE","title":"Mercado","categoryId":"food","accountId":"main","amountCents":-10000,"occurredAt":"2026-09-29T13:30:00-03:00"}'
```

```bash
curl http://localhost:8080/api/v1/transactions
curl http://localhost:8080/api/v1/transactions/{id}

curl -X PUT http://localhost:8080/api/v1/transactions/{id} \
  -H "Content-Type: application/json" \
  -d '{"type":"EXPENSE","title":"Mercado","categoryId":"transport","accountId":"reserve","amountCents":-15000,"occurredAt":"2026-09-29T13:30:00-03:00"}'

curl -X DELETE http://localhost:8080/api/v1/transactions/{id}
```

Os exemplos de `GET`/`DELETE`/`PUT` por id dependem do UUID devolvido no `POST`. Estes curls descrevem o contrato; nesta máquina o Docker não estava no ar, então a API local e o Swagger não foram exercitados de ponta a ponta.

## Limitações atuais

- Mobile não está integrado.
- Sem auth, users, JWT.
- Sem Goals, Budgets, saldo, analytics.
- Sem seed de movimentações (o cenário visual continua só no app).
- Sem paginação, filtros ou CORS.

## Próximo passo

Validar esta API isolada. Só depois trocar o adapter do `TransactionRepository` no Expo.
