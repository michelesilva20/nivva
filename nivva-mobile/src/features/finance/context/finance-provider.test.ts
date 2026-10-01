import assert from "node:assert/strict";
import { test } from "node:test";

import type { TransactionRepository } from "@/data/repositories/transaction-repository";
import { money, type Transaction } from "@/domain/models";

import { financeReducer, initialFinanceState } from "./finance-reducer";
import { toCreateExpenseInput } from "../persistence/local-finance";

const mercadoInput = {
  title: "Mercado",
  amountInCents: 10_000,
  categoryId: "food",
  accountId: "main",
  occurredAt: "2026-09-29T13:30:00-03:00",
};

function fakeRepository(overrides: Partial<TransactionRepository> = {}): TransactionRepository {
  return {
    list: async () => [],
    create: async (input) => ({ id: "server-uuid", ...input }),
    update: async (transaction) => transaction,
    remove: async () => undefined,
    ...overrides,
  };
}

test("create usa o id devolvido pelo repository", async () => {
  const repository = fakeRepository();
  const created = await repository.create(toCreateExpenseInput(mercadoInput));
  const state = financeReducer(initialFinanceState, { type: "add-user-transaction", transaction: created });

  assert.equal(created.id, "server-uuid");
  assert.equal(state.userTransactions[0]?.id, "server-uuid");
});

test("create rejeitado não adiciona Transaction", async () => {
  const repository = fakeRepository({
    create: async () => {
      throw new Error("Não foi possível conectar ao Nivva.");
    },
  });
  let state = { ...initialFinanceState, loadStatus: "ready" as const };

  await assert.rejects(() => repository.create(toCreateExpenseInput(mercadoInput)));
  assert.equal(state.userTransactions.length, 0);

  state = financeReducer(state, { type: "set-notice", notice: "Não foi possível conectar ao Nivva.", tone: "error" });
  assert.equal(state.userTransactions.length, 0);
  assert.equal(state.notice, "Não foi possível conectar ao Nivva.");
});

test("update rejeitado preserva a Transaction antiga", async () => {
  const current: Transaction = {
    id: "uuid-1",
    title: "Mercado",
    categoryId: "food",
    accountId: "main",
    amount: money(-10_000),
    occurredAt: "2026-09-29T16:30:00Z",
    type: "expense",
  };
  const repository = fakeRepository({
    update: async () => {
      throw new Error("Não foi possível concluir. Tente novamente.");
    },
  });
  let state = financeReducer(initialFinanceState, { type: "hydrate", transactions: [current] });

  await assert.rejects(() => repository.update({ ...current, amount: money(-15_000) }));
  assert.equal(state.userTransactions[0]?.amount.cents, -10_000);
});

test("delete rejeitado mantém a Transaction", async () => {
  const current: Transaction = {
    id: "uuid-1",
    title: "Mercado",
    categoryId: "food",
    accountId: "main",
    amount: money(-10_000),
    occurredAt: "2026-09-29T16:30:00Z",
    type: "expense",
  };
  const repository = fakeRepository({
    remove: async () => {
      throw new Error("Não foi possível conectar ao Nivva.");
    },
  });
  const state = financeReducer(initialFinanceState, { type: "hydrate", transactions: [current] });

  await assert.rejects(() => repository.remove(current.id));
  assert.equal(state.userTransactions.length, 1);
});

test("falha de hydration não vira ready com lista vazia", async () => {
  const repository = fakeRepository({
    list: async () => {
      throw new Error("Não foi possível conectar ao Nivva.");
    },
  });

  await assert.rejects(() => repository.list());
  const state = financeReducer(initialFinanceState, { type: "hydrate-failed" });

  assert.equal(state.loadStatus, "error");
  assert.equal(state.userTransactions.length, 0);
});

test("retry depois de erro deixa o estado ready", async () => {
  const failed = financeReducer(initialFinanceState, { type: "hydrate-failed" });
  const retrying = financeReducer(failed, { type: "reload" });
  const ready = financeReducer(retrying, {
    type: "hydrate",
    transactions: [
      {
        id: "uuid-1",
        title: "Mercado",
        categoryId: "food",
        accountId: "main",
        amount: money(-10_000),
        occurredAt: "2026-09-29T16:30:00Z",
        type: "expense",
      },
    ],
  });

  assert.equal(failed.loadStatus, "error");
  assert.equal(retrying.loadStatus, "loading");
  assert.equal(ready.loadStatus, "ready");
  assert.equal(ready.userTransactions[0]?.id, "uuid-1");
});
