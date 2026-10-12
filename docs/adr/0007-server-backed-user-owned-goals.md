# 0007 — Goals no servidor, pertencentes ao usuário

## Contexto

O progresso da meta já é derivado de contribuições ([ADR 0001](0001-goal-progress-derived-from-contributions.md)). Accounts e Transactions passaram a ser user-owned no PostgreSQL. Goals ainda viviam no AsyncStorage — no modo API, numa chave por User UUID.

## Problema

Dois usuários no mesmo aparelho não devem depender de storage local para o agregado Goal. O servidor precisa ser a fonte no modo API, sem misturar com Account/Transaction e sem migrar automaticamente dados de teste.

## Alternativas

**A.** Manter Goals só no aparelho.

Rejeitada: o isolamento A/B ficaria incompleto e o restart dependeria do dispositivo.

**B.** Dual-write (API + AsyncStorage) ou fallback para a chave user-scoped.

Rejeitada: duas fontes, sucesso falso e risco de duplicar metas.

**C.** PostgreSQL no modo API, AsyncStorage no modo local, uma source ativa.

## Decisão

C.

- Goal pertence ao User. `userId` vem do JWT, nunca do JSON.
- GoalContribution é filha da Goal. Sem `user_id` na contribution. Ownership herdado: o Service resolve a Goal com `id + userId` antes de listar ou criar aporte.
- `currentAmount`, `remainingAmount` e `status` são derivados. Não há coluna de progresso.
- Contribution não é Transaction: não altera Account, saldo, receita, despesa nem Budget.
- Delete da Goal faz cascade das contributions (`ON DELETE CASCADE`).
- Cross-user: 404, não 403.
- POST contribution devolve a contribution e a Goal já atualizada.
- Invariante `current <= target` é protegida com lock pessimista na Goal (`SELECT FOR UPDATE`) em `contribute` e em `update` de target.
- Deadline é data civil (`DATE` / `LocalDate`). “Hoje” usa `Clock` em `America/Sao_Paulo`.
- `icon_key` no banco e no JSON é lowercase (`home`, `travel`, …). JPA usa `AttributeConverter`, não `@Enumerated`.
- Modo API ignora `@nivva/goals:user:<USER_ID>:v1`. Não apaga. Não migra.
- Modo local continua em `@nivva/goals:v1`.
- `GoalProvider` não bloqueia Home/Wallet/Analytics. A aba Metas tem loading/error/retry próprio.

## Consequências positivas

- uma source por modo;
- isolamento de Goals no servidor;
- 0001 permanece válido no PostgreSQL;
- concorrência de aportes não ultrapassa o alvo.

## Consequências negativas

- a chave user-scoped antiga pode ficar órfã no aparelho;
- sem edit/delete de contribution nesta V1;
- sem sync offline;
- Budget continua local.

## Relação

Não substitui 0001. Complementa 0003 (package `goal`), 0004 (mesmo `EXPO_PUBLIC_TRANSACTION_SOURCE`) e 0005/0006 (JWT + ownership).
