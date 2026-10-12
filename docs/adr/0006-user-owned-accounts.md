# 0006 — Accounts pertencentes ao usuário

## Contexto

Transactions já pertencem ao User. Accounts ainda eram `main` / `reserve` globais. Uma Transaction autenticada podia apontar para uma Account que não era do dono.

## Problema

Um recurso privado não deve referenciar Account global ou de outro usuário. O saldo não deve ser um snapshot persistido.

## Alternativas

**A.** Manter `main` / `reserve` globais.

Rejeitada: o isolamento de Transaction fica incompleto.

**B.** Ownership só na aplicação.

Insuficiente: um insert JDBC ainda poderia cruzar donos.

**C.** Account user-owned + ownership no service + FK composta no PostgreSQL.

## Decisão

C.

- Account id é UUID. `userId` vem do JWT, nunca do JSON.
- Persistimos `openingBalanceCents` (≥ 0). Current balance é derivado.
- Register cria, na mesma transação, `Conta principal` / CHECKING / 0.
- Delete de Account com Transactions devolve 409. O banco usa `ON DELETE RESTRICT`.
- Transaction guarda `accountId` como coluna UUID, sem `@ManyToOne`. A defesa no banco é só a FK composta `(user_id, account_id) → accounts(user_id, id)`. Não há FK simples `account_id → accounts(id)`: o Hibernate `validate` não exige associação JPA para essa coluna.
- Category continua reference data global.
- Cartão não é Account.
- Seed financeira fica só no modo local. API mode usa somente dados reais do User.
- CRUD real de Account é capability do modo API. Local é read-only sobre a semente.
- V3 aborta se existir User ou Transaction legado. Reset local explícito, sem remap.

## Consequências positivas

- isolamento Account + Transaction;
- invariante de dono no PostgreSQL;
- saldo recalculável;
- modo API deixa de misturar demo com dado autenticado.

## Consequências negativas

- modo local não cria/edita contas;
- Goals/Budget continuam no aparelho (no API, chaves por User UUID);
- sem transferência entre contas.
