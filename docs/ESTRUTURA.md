# Nivva — estrutura do repositório

Este documento descreve **onde o código mora** e **como as pastas se relacionam**. O mapa do produto (o que a pessoa já consegue fazer, regras de domínio, o que ainda não existe) continua em [`PROJETO.md`](PROJETO.md).

---

## 1. Visão geral

O repositório é um **monorepo de produto**, não um monorepo de bibliotecas compartilhadas. Há três implementações e uma pasta de documentação. Elas convivem de propósito.

```text
Nivva/
├── README.md                 entrada curta; aponta para este mapa e para PROJETO.md
├── docs/                     estado do produto + ADRs + esta estrutura
├── nivva-mobile/             app ativo (React Native / Expo / TypeScript)
├── nivva-api/                API (Java 21 / Spring Boot / PostgreSQL)
├── app/                      referência visual Android (Kotlin / Compose)
├── gradle* / settings.gradle.kts / build.gradle.kts
└── .cursor/                  regras do repositório para o agente
```

| Pasta | Papel | Build |
| --- | --- | --- |
| `nivva-mobile/` | App que evolui. Expo Go. | `npm` |
| `nivva-api/` | Persistência e regras de Auth, Accounts, Transactions e Goals. | Maven Wrapper (`mvnw`) |
| `app/` | Protótipo visual 0.1.0. Não entra no fluxo ativo. | Gradle (`:app`) |
| `docs/` | Estado atual e decisões. | — |

Não há pacote npm compartilhado entre mobile e API. O contrato é HTTP + JSON. O domínio financeiro (centavos, sinal de receita/despesa, progresso de meta derivado) está **espelhado** nos dois lados, não extraído para uma lib.

O Gradle da raiz só inclui o módulo Android (`include(":app")`). A API **não** é um subprojeto Gradle. Mobile e API são pastas irmãs, cada uma com o próprio README.

---

## 2. Como as três implementações se encaixam

```text
                    ┌─────────────────────┐
                    │  app/  (Compose)    │
                    │  referência visual  │
                    └──────────┬──────────┘
                               │ identidade, copy, layout
                               ▼
┌──────────────┐   REST + JWT    ┌──────────────────┐
│ nivva-mobile │ ◄─────────────► │    nivva-api     │
│  Expo Go     │  se SOURCE=api  │  Spring Boot     │
└──────┬───────┘                 └────────┬─────────┘
       │ SOURCE=local                     │
       ▼                                  ▼
  AsyncStorage                       PostgreSQL 16
```

O interruptor do mobile é um único env:

```text
EXPO_PUBLIC_TRANSACTION_SOURCE=local | api
```

No modo `api`, o mesmo valor liga Accounts, Transactions e Goals ao PostgreSQL. Orçamento **não** vai para a API: continua no aparelho. Category na API é referência pública (`GET /api/v1/categories`).

Default do mobile: `local` (abre sem login, com semente de demonstração).

---

## 3. Documentação (`docs/`)

```text
docs/
├── PROJETO.md              mapa vivo do produto
├── ESTRUTURA.md            este arquivo
└── adr/
    ├── 0001-goal-progress-derived-from-contributions.md
    ├── 0002-monthly-budget-derived-from-transactions.md
    ├── 0003-backend-modular-monolith.md
    ├── 0004-mobile-transaction-api-adapter.md
    ├── 0005-api-authentication-and-transaction-ownership.md
    ├── 0006-user-owned-accounts.md
    └── 0007-server-backed-user-owned-goals.md
```

| Arquivo | Lê quando |
| --- | --- |
| `PROJETO.md` | precisa saber o que já funciona, regras de dinheiro, telas, limitações |
| `ESTRUTURA.md` | precisa achar uma pasta, um pacote ou um adapter |
| `adr/000N-…` | precisa o **porquê** de uma fronteira (ex.: contribution ≠ transaction) |

ADRs não substituem o código. Se o código e o ADR divergirem, o código e o `PROJETO.md` vencem depois da entrega que os atualizou.

---

## 4. App ativo — `nivva-mobile/`

Regra de ouro: **`app/` define rotas; `src/` contém o produto.**

Alias de import: `@/` → `src/` (`tsconfig.json`).

```text
nivva-mobile/
├── app/                      Expo Router (arquivos = rotas)
├── src/
│   ├── core/design-system/   tokens e componentes visuais
│   ├── domain/models/        tipos de negócio (sem I/O)
│   ├── data/                 HTTP, auth, mock, repositórios
│   ├── features/             telas, providers, cálculos por domínio
│   └── shared/               formatação, aviso, hooks genéricos
├── assets/
├── package.json
├── app.json / expo config
├── tsconfig.json
├── .env.example
└── README.md
```

Não há Redux nem Zustand. Estado de sessão e de domínio vive em React Context por feature (`AuthProvider`, `AccountProvider`, `FinanceProvider`, `GoalProvider`, `BudgetProvider`).

### 4.1 Rotas (`app/`)

O Expo Router monta a URL a partir do caminho do arquivo.

```text
app/
├── _layout.tsx                 fontes, tema, escolha local/API, árvore de providers
├── login.tsx                   /login
├── register.tsx                /register
├── budget.tsx                  /budget          (acima das tabs)
├── (tabs)/
│   ├── _layout.tsx             barra inferior
│   ├── index.tsx               /                Início
│   ├── analytics.tsx           /analytics
│   ├── wallet.tsx              /wallet
│   ├── goals.tsx               /goals
│   └── profile.tsx             /profile
├── accounts/
│   ├── new.tsx                 /accounts/new
│   └── [id]/edit.tsx           /accounts/:id/edit
├── goals/
│   ├── new.tsx
│   └── [id]/
│       ├── index.tsx           detalhe
│       ├── contribute.tsx      registrar progresso
│       └── edit.tsx
└── transactions/
    ├── index.tsx               histórico completo
    ├── new-expense.tsx
    ├── new-income.tsx
    └── [id]/
        ├── index.tsx           detalhe
        └── edit.tsx
```

Os arquivos em `app/` são **finos**: importam a tela em `src/features/...` e reexportam. A lógica não mora na rota.

`(tabs)` agrupa as cinco abas. Histórico, formulários, orçamento e CRUD de conta/meta abrem **acima** das tabs, sem aba nova.

Em `_layout.tsx`:

- modo `local` → `AccountProvider` + `FinanceProvider` + `GoalProvider` + `BudgetProvider` (sem login);
- modo `api` → `AuthProvider` + `AuthSessionGate`, que só depois de autenticar monta a mesma árvore com adapters HTTP.

`AuthSessionGate` desmonta Account/Finance/Goal no logout. Por isso o User B não herda o estado do User A em memória.

### 4.2 Camada de domínio (`src/domain/models/`)

Tipos sem persistência e sem React.

| Arquivo | O que descreve |
| --- | --- |
| `money.ts` | `Money.cents` (inteiro) |
| `transaction.ts` | lançamento; `amount` positivo = receita, negativo = despesa |
| `account.ts` | conta; opening em centavos; tipos CHECKING / DIGITAL / CASH / … |
| `category.ts` | categorias de gasto + `income` |
| `goal.ts` | meta e contribuição; status `active` / `completed` |
| `budget.ts` | teto mensal configurado |
| `user.ts` | usuário autenticado |
| `wallet.ts`, `home.ts`, `analytics.ts`, `metric.ts`, `insight.ts` | shapes das telas |

`index.ts` reexporta o domínio. Telas e providers importam daqui, não de DTOs HTTP.

### 4.3 Camada de dados (`src/data/`)

```text
src/data/
├── api/                 cliente HTTP, DTOs, mappers, erros
├── auth/                login/register/me, sessão, SecureStore
├── mock/                semente de demonstração (só modo local)
└── repositories/        contratos + adapters local/API
```

**HTTP**

| Arquivo | Papel |
| --- | --- |
| `api/api-client.ts` | `fetch` autenticado; 401 invalida sessão; não faz logout sozinho no repository |
| `api/api-error.ts` | `ApiError` com status/detail |
| `api/api-account.ts`, `api-transaction.ts`, `api-goal.ts` | tipos do JSON |
| `api/map-account.ts`, `map-transaction.ts`, `map-goal.ts` | JSON ↔ domínio (`amountCents` ↔ `Money`, `ACTIVE` ↔ `active`) |

**Auth**

| Arquivo | Papel |
| --- | --- |
| `auth/auth-repository.ts` | register, login, me |
| `auth/auth-session.ts` | token em memória + callback 401 |
| `auth/secure-token-store.ts` | `expo-secure-store` (`nivva.auth.access-token.v1`) |
| `auth/token-store.ts` | contrato (há implementação em memória para teste) |

**Repositórios** — a tela fala com a interface, não com o storage.

```text
contrato          adapter local                         adapter API
─────────────────────────────────────────────────────────────────────
AccountRepository     local-account-repository          api-account-repository
TransactionRepository async-storage-transaction-…       api-transaction-repository
GoalRepository        local-goal-repository             api-goal-repository
                      (via async-storage-goal-…)
BudgetRepository      async-storage-budget-repository   (não existe API)
```

O seletor `active-*-repository.ts` lê `EXPO_PUBLIC_TRANSACTION_SOURCE` e devolve um dos dois. Sem dual-write. Sem fallback silencioso. Sem migrar chave antiga de Goals (`@nivva/goals:user:<USER_ID>:v1`).

Semente (`data/mock/`): contas `main`/`reserve`, transações de demonstração, categorias, teto default de orçamento. **Só entra no modo local.** No modo API a Home começa zerada.

### 4.4 Features (`src/features/`)

Cada feature agrupa tela + contexto + cálculos daquele recorte. Não há pasta `components/` global de produto.

```text
src/features/
├── auth/           AuthProvider, AuthSessionGate, Login, Register
├── accounts/       AccountProvider, formulário, nova/editar conta
├── finance/        FinanceProvider, cálculos, snapshots, FinancialDataGate
├── transactions/   histórico, detalhe, formulário compartilhado gasto/receita
├── home/           HomeScreen + useHomeData
├── analytics/      AnalyticsScreen + useAnalyticsData
├── wallet/         WalletScreen + useWalletData
├── goals/          GoalProvider, telas de meta, cálculos, errors.ts
├── budget/         BudgetProvider, tela de teto, cálculos
└── profile/        tema + (no API) nome, email, Sair
```

Padrão interno de uma feature:

```text
features/<nome>/
├── screens/          UI de rota
├── components/       pedaços daquela feature
├── context/          Provider + reducer
├── calculations/     funções puras + testes
├── persistence/      mutações sobre o store local (quando existe)
├── hooks/            recorte de snapshot para a tela
└── index.ts          API pública da feature
```

**Quem bloqueia o quê**

| Provider | Bloqueia |
| --- | --- |
| `AuthProvider` / `AuthSessionGate` | o app autenticado (login, unreachable, 401) |
| `FinancialDataGate` | Home / Carteira / Análises enquanto Accounts ou Transactions hidratam |
| `GoalProvider` | **não** bloqueia o restante; a aba Metas tem loading/error/retry próprio |
| `BudgetProvider` | não bloqueia; teto efetivo cai no default se ainda não leu |

Totais (saldo, receita, despesa, disponível, progresso de meta) **não são gravados**. São recalculados em `calculations/` e expostos como snapshots.

### 4.5 Design system (`src/core/design-system/`)

```text
src/core/design-system/
├── theme/          cores, espaço, raio, tipo, motion, ThemeProvider
└── components/     NivvaCard, NivvaText, NivvaAmount, NivvaGoalCard, …
```

Componentes de feature não devem usar hex direto. Tokens vivem no tema. Dark/Light/Sistema ficam em `ThemeProvider` + AsyncStorage `@nivva/theme-preference`.

### 4.6 Shared

`src/shared/utils/format.ts` (moeda `pt-BR` / `BRL`), `NivvaNotice` (toast de “Gasto adicionado” etc.), hooks genéricos. Sem regra de negócio aqui.

### 4.7 Testes mobile

`npm test` roda `node:test` via `tsx` nos arquivos listados em `package.json`. Não usa Jest. Typecheck: `npm run typecheck` (`tsc --noEmit`). Testes `*.test.ts` ficam ao lado do código que exercitam.

---

## 5. API — `nivva-api/`

Modular monolith, **package-by-feature**. Um jar, um Compose de Postgres, um contrato `/api/v1`. Decisão: [ADR 0003](adr/0003-backend-modular-monolith.md).

```text
nivva-api/
├── pom.xml
├── mvnw / mvnw.cmd
├── compose.yml                 PostgreSQL 16 em localhost:55432
├── .env.example                DB_* e NIVVA_JWT_SECRET_BASE64
├── README.md
└── src/
    ├── main/java/com/nivva/api/
    ├── main/resources/
    │   ├── application.yml
    │   └── db/migration/       Flyway V1…V4
    └── test/java/com/nivva/api/
```

Não há `controllers/` / `services/` globais. Cada domínio traz o próprio Controller, Service, Rules, Repository, Entity e `dto/`.

```text
com.nivva.api
├── NivvaApiApplication
├── auth/          register, login, JWT, SecurityConfig, /me
├── user/          entidade User, e-mail, UserRepository
├── account/       CRUD user-owned; openingBalance; default no register
├── category/      referência pública (ids estáveis: food, income, …)
├── transaction/   lançamentos; FK composta (user_id, account_id)
├── goal/          Goal + GoalContribution; lock pessimista; progresso derivado
└── common/        OpenAPI, Clock America/Sao_Paulo, ProblemDetail
```

Padrão de um pacote de domínio:

```text
Goal.java / GoalContribution.java     entidade JPA (só o que o banco guarda)
GoalRepository.java                   queries ownership-aware + FOR UPDATE
GoalRules.java                        invariantes (sem HTTP)
GoalService.java                      orquestra lock, SUM, persistência
GoalController.java                   /api/v1/goals
dto/                                  request/response; sem userId no body
```

Exceções de domínio ficam em `common/error/` (`GoalNotFoundException`, `InvalidGoalException`, …) e o `ApiExceptionHandler` traduz para Problem Details (400 / 401 / 404 / 409 / 422).

### 5.1 Migrations Flyway

Não se altera V1–V4 depois de aplicadas. Schema novo = `V5_…`.

| Arquivo | Cria / muda |
| --- | --- |
| `V1__create_reference_and_transaction_tables.sql` | accounts, categories, transactions (ainda sem user) |
| `V2__add_users_and_transaction_ownership.sql` | `users`, `transactions.user_id` |
| `V3__user_owned_accounts.sql` | accounts passam a pertencer ao User |
| `V4__user_owned_goals.sql` | `goals`, `goal_contributions` |

Hibernate só valida (`ddl-auto: validate`). Sem seed de movimentação no servidor.

### 5.2 Fronteiras que a pasta precisa respeitar

```text
User
├── Accounts
│    └── Transactions          (mesmo user_id da Account)
└── Goals
     └── Contributions         (sem user_id próprio; dono = Goal)

GoalContribution ≠ Transaction
```

Contribution não altera Account, saldo, receita, despesa nem Budget. `current` / `remaining` / `status` da Goal **não são colunas**.

O dono nunca vem do JSON: vem do `sub` do JWT (`AuthenticatedUser.requireId`). Cross-user devolve **404**, não 403.

Clock injetável (`NivvaClockConfig`) só para “hoje” de deadline, fuso `America/Sao_Paulo`. Timestamps de Account/Transaction continuam instante/`TIMESTAMPTZ`.

### 5.3 Testes da API

Surefire roda `*Test` e `*IT`. Integração sobe PostgreSQL 16 via Testcontainers — **não** reutiliza o Compose. Sem Docker, as classes `*IT` são ignoradas (`@EnabledIf`). Validação completa = `mvnw.cmd test` com Docker no ar.

Pasta `src/test/java/com/nivva/api/support/` concentra auth de teste e checagem de Docker.

---

## 6. Referência Android — `app/`

Protótipo Compose `com.nivva.app`, versão visual 0.1.0. Incluído pelo Gradle da raiz.

```text
app/src/main/java/com/nivva/app/
├── MainActivity.kt
├── core/designsystem/     NivvaTheme, componentes
├── feature/
│   ├── home/
│   ├── analytics/
│   ├── wallet/
│   └── placeholder/       Metas / Perfil ainda placeholder
├── mock/                  NivvaMockData (números fixos)
└── navigation/            NivvaApp (tabs)
```

Não há ViewModel, repositório nem API. Os números não mudam. Serve para comparar cor, copy e hierarquia com o Expo. **Não apagar** enquanto for a referência de identidade. Não misturar Kotlin com o fluxo ativo do `nivva-mobile/`.

---

## 7. Fluxo de uma ação no modo API

Exemplo: registrar progresso de meta.

```text
ContributeGoalScreen
    → GoalProvider.addContribution
        → ApiGoalRepository.contribute
            → apiClient POST /api/v1/goals/{id}/contributions
                → GoalController
                    → GoalService.contribute
                        → lock Goal (PESSIMISTIC_WRITE)
                        → SUM contributions
                        → GoalRules (completed / remaining)
                        → insert GoalContribution
                        → devolve { contribution, goal }
        → reducer atualiza só o snapshot da Goal
```

FinanceProvider e BudgetProvider **não participam**. Por isso a contribution não pode alterar saldo nem teto.

Exemplo simétrico de gasto:

```text
TransactionForm
    → FinanceProvider
        → ApiTransactionRepository.create
            → POST /api/v1/transactions
                → TransactionService (sinal, category.kind, Account do mesmo User)
        → snapshots de Home / Wallet / Analytics recalculam no cliente
```

---

## 8. Onde colocar código novo

| Precisa… | Coloque em |
| --- | --- |
| Uma tela nova | `src/features/<domínio>/screens/` + rota fina em `app/` |
| Um cálculo de totais | `features/<domínio>/calculations/` (função pura + teste) |
| Falar com o servidor | contrato em `data/repositories/` + mapper em `data/api/` |
| Uma regra de invariante no backend | `*Rules.java` do pacote, não no Controller |
| Uma coluna nova | nova migration `V5_…`; não editar V1–V4 |
| Uma decisão de fronteira | ADR em `docs/adr/` **e** atualizar `PROJETO.md` |
| Cor / componente visual | `src/core/design-system/` |

Não criar: pasta `services/` global no mobile, `utils` de domínio, dual-write, Budget API (ainda fora de escopo), Cartões, sync offline.

---

## 9. Ferramentas por pasta

| Onde | Comando | O que faz |
| --- | --- | --- |
| `nivva-mobile/` | `npx expo start --go` | Metro + QR do Expo Go |
| `nivva-mobile/` | `npm run typecheck` | TypeScript estrito |
| `nivva-mobile/` | `npm test` | `node:test` |
| `nivva-api/` | `docker compose up -d` | Postgres em `localhost:55432` |
| `nivva-api/` | `mvnw.cmd spring-boot:run` | API em `:8080` |
| `nivva-api/` | `mvnw.cmd test` | unitários + IT (Testcontainers) |
| raiz | `gradlew :app:…` | só o protótipo Compose |

Swagger: `http://localhost:8080/swagger-ui`. Health: `/actuator/health`. OpenAPI JSON: `/api-docs`.

`.env` de mobile e de API **não entram no Git**. IP LAN do PC fica só no `.env` local (`EXPO_PUBLIC_NIVVA_API_BASE_URL`).

---

## 10. O que esta estrutura deliberadamente não tem

- Budget no servidor
- pasta de Cartões / Investimentos / Transferências com domínio real
- refresh token
- sync offline / fila de mutação
- CI/CD
- módulo nativo fora do Expo Go
- shared kernel Java/TS

Esses ausentes são limite de fase, descritos em [`PROJETO.md`](PROJETO.md) seção 12. A estrutura acima é o que o código já organiza para crescer sem redesenhar as telas.
