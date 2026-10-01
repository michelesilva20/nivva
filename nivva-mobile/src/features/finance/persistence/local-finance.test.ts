import assert from "node:assert/strict";
import { test } from "node:test";

import { createTransactionRepository } from "@/data/repositories/transaction-repository";
import { parseUserTransactions, serializeUserTransactions } from "@/data/repositories/stored-finance";
import { money, type Account, type Transaction } from "@/domain/models";

import { calculateAvailableBudget, calculateExpenses, calculateIncome } from "@/features/finance/calculations/calculations";

import {
  applyTransactionEdits,
  applyUserTransactionsToAccounts,
  mergeSeedAndUserTransactions,
  removeUserTransaction,
  replaceUserTransaction,
  toCreateExpenseInput,
  toCreateIncomeInput,
} from "./local-finance";

function incomeFromInput(input: Parameters<typeof toCreateIncomeInput>[0], id: string): Transaction {
  return { id, ...toCreateIncomeInput(input) };
}

const seedAccounts: Account[] = [
  {
    id: "main",
    name: "Conta principal",
    typeLabel: "Conta corrente",
    balance: money(862_050),
    maskedNumber: "•••• 1234",
  },
  {
    id: "reserve",
    name: "Reserva",
    typeLabel: "Conta digital",
    balance: money(383_030),
    maskedNumber: "•••• 7082",
  },
];

const seedTransactions: Transaction[] = [
  {
    id: "market",
    title: "Mercado",
    categoryId: "food",
    accountId: "main",
    amount: money(-12_990),
    occurredAt: "2026-09-12T14:21:00.000Z",
    type: "expense",
  },
];

const mercado: Transaction = {
  id: "expense-100",
  title: "Mercado",
  categoryId: "food",
  accountId: "main",
  amount: money(-10_000),
  occurredAt: "2026-09-25T17:30:00.000Z",
  type: "expense",
};

test("merge coloca transações do usuário na frente e não duplica a semente", () => {
  const merged = mergeSeedAndUserTransactions(seedTransactions, [mercado]);

  assert.equal(merged.length, 2);
  assert.equal(merged[0]?.id, "expense-100");
  assert.equal(merged[1]?.id, "market");
});

test("saldo efetivo usa semente + movimentos do usuário uma única vez", () => {
  const [main] = applyUserTransactionsToAccounts(seedAccounts, [mercado]);

  assert.equal(main?.balance.cents, 852_050);
});

test("segunda reconstrução a partir da semente não aplica o gasto de novo", () => {
  const first = applyUserTransactionsToAccounts(seedAccounts, [mercado]);
  const second = applyUserTransactionsToAccounts(seedAccounts, [mercado]);

  assert.equal(first[0]?.balance.cents, 852_050);
  assert.equal(second[0]?.balance.cents, 852_050);
  assert.equal(seedAccounts[0]?.balance.cents, 862_050);
});

test("cada conta reflete somente as próprias transações do usuário", () => {
  const reserva: Transaction = {
    ...mercado,
    id: "expense-200",
    accountId: "reserve",
    amount: money(-20_000),
  };
  const [main, reserve] = applyUserTransactionsToAccounts(seedAccounts, [mercado, reserva]);

  assert.equal(main?.balance.cents, 852_050);
  assert.equal(reserve?.balance.cents, 363_030);
});

test("várias despesas locais somam no total sem alterar a semente", () => {
  const extras: Transaction[] = [
    mercado,
    { ...mercado, id: "expense-50", title: "Transporte", amount: money(-5_000) },
    { ...mercado, id: "expense-30", title: "Assinatura", amount: money(-3_000) },
  ];
  const [main] = applyUserTransactionsToAccounts(seedAccounts, extras);
  const merged = mergeSeedAndUserTransactions(seedTransactions, extras);

  assert.equal(main?.balance.cents, 844_050);
  assert.equal(merged.length, 4);
});

test("toCreateExpenseInput preserva occurredAt e gera despesa negativa sem id", () => {
  const expense = toCreateExpenseInput({
    title: " Mercado ",
    amountInCents: 10_000,
    categoryId: "food",
    accountId: "main",
    occurredAt: "2026-09-24T21:15:00.000Z",
    note: " cartão ",
  });

  assert.equal("id" in expense, false);
  assert.equal(expense.title, "Mercado");
  assert.equal(expense.amount.cents, -10_000);
  assert.equal(expense.occurredAt, "2026-09-24T21:15:00.000Z");
  assert.equal(expense.note, "cartão");
  assert.equal(expense.type, "expense");
});

test("serialização mantém id, occurredAt e Money em centavos", () => {
  const raw = serializeUserTransactions([mercado]);
  const restored = parseUserTransactions(raw);

  assert.equal(restored[0]?.id, "expense-100");
  assert.equal(restored[0]?.occurredAt, "2026-09-25T17:30:00.000Z");
  assert.equal(restored[0]?.amount.cents, -10_000);
});

test("storage vazio, JSON inválido e formato antigo caem no estado inicial", () => {
  assert.deepEqual(parseUserTransactions(null), []);
  assert.deepEqual(parseUserTransactions(""), []);
  assert.deepEqual(parseUserTransactions("{not-json"), []);
  assert.deepEqual(parseUserTransactions(JSON.stringify({ transactions: [mercado] })), []);
});

test("receita local aumenta receitas e saldo sem mudar despesas nem o disponível do orçamento", () => {
  const freelance = incomeFromInput(
    {
      title: "Freelance",
      amountInCents: 100_000,
      accountId: "main",
      occurredAt: "2026-09-25T17:30:00.000Z",
    },
    "income-1000",
  );
  const seedMonth: Transaction[] = [
    {
      id: "salary",
      title: "Salário",
      categoryId: "income",
      accountId: "main",
      amount: money(485_000),
      occurredAt: "2026-09-01T09:00:00.000Z",
      type: "income",
    },
    {
      id: "seed-freelance",
      title: "Freelance",
      categoryId: "income",
      accountId: "main",
      amount: money(338_000),
      occurredAt: "2026-09-05T10:30:00.000Z",
      type: "income",
    },
    {
      id: "seed-expenses",
      title: "Gastos do mês",
      categoryId: "other",
      accountId: "main",
      amount: money(-432_000),
      occurredAt: "2026-09-12T14:00:00.000Z",
      type: "expense",
    },
  ];
  const after = [...seedMonth, freelance];
  const spent = calculateExpenses(after);
  const [main] = applyUserTransactionsToAccounts(seedAccounts, [freelance]);

  assert.equal(freelance.type, "income");
  assert.equal(freelance.categoryId, "income");
  assert.equal(freelance.amount.cents, 100_000);
  assert.equal(calculateIncome(seedMonth).cents, 823_000);
  assert.equal(calculateIncome(after).cents, 923_000);
  assert.equal(calculateExpenses(seedMonth).cents, 432_000);
  assert.equal(spent.cents, 432_000);
  assert.equal(main?.balance.cents, 962_050);
  assert.equal(calculateAvailableBudget(spent, money(630_000)).cents, 198_000);
});

test("receita e despesa locais se combinam no saldo sem misturar totais", () => {
  const freelance = incomeFromInput(
    {
      title: "Freelance",
      amountInCents: 100_000,
      accountId: "main",
      occurredAt: "2026-09-25T10:00:00.000Z",
    },
    "income-1000",
  );
  const [main] = applyUserTransactionsToAccounts(seedAccounts, [freelance, mercado]);

  assert.equal(main?.balance.cents, 952_050);
  assert.equal(calculateIncome([freelance]).cents, 100_000);
  assert.equal(calculateExpenses([mercado]).cents, 10_000);
});

test("repositório recupera as mesmas transações após um restart simulado", async () => {
  const memory = new Map<string, string>();
  const storage = {
    async getItem(key: string) {
      return memory.get(key) ?? null;
    },
    async setItem(key: string, value: string) {
      memory.set(key, value);
    },
    async removeItem(key: string) {
      memory.delete(key);
    },
  };

  const firstSession = createTransactionRepository(storage);
  const created = await firstSession.create({
    title: mercado.title,
    categoryId: mercado.categoryId,
    accountId: mercado.accountId,
    amount: mercado.amount,
    occurredAt: mercado.occurredAt,
    type: mercado.type,
  });

  const secondSession = createTransactionRepository(storage);
  const restored = await secondSession.list();
  const [main] = applyUserTransactionsToAccounts(seedAccounts, restored);

  assert.equal(restored[0]?.id, created.id);
  assert.equal(restored[0]?.occurredAt, mercado.occurredAt);
  assert.equal(main?.balance.cents, 852_050);

  const thirdSession = createTransactionRepository(storage);
  const again = await thirdSession.list();

  assert.equal(again.length, 1);
  assert.equal(applyUserTransactionsToAccounts(seedAccounts, again)[0]?.balance.cents, 852_050);
});

test("receita persistida mantém id, valor positivo e saldo após restart", async () => {
  const freelanceInput = toCreateIncomeInput({
    title: "Freelance",
    amountInCents: 100_000,
    accountId: "main",
    occurredAt: "2026-09-25T17:30:00.000Z",
  });
  const memory = new Map<string, string>();
  const storage = {
    async getItem(key: string) {
      return memory.get(key) ?? null;
    },
    async setItem(key: string, value: string) {
      memory.set(key, value);
    },
    async removeItem(key: string) {
      memory.delete(key);
    },
  };

  const created = await createTransactionRepository(storage).create(freelanceInput);
  const restored = await createTransactionRepository(storage).list();
  const again = await createTransactionRepository(storage).list();
  const [main] = applyUserTransactionsToAccounts(seedAccounts, restored);

  assert.match(created.id, /^income-/);
  assert.equal(restored[0]?.id, created.id);
  assert.equal(restored[0]?.type, "income");
  assert.equal(restored[0]?.amount.cents, 100_000);
  assert.equal(main?.balance.cents, 962_050);
  assert.equal(again.length, 1);
});

test("editar despesa substitui o valor e não soma o efeito duas vezes", () => {
  const updated = applyTransactionEdits(mercado, {
    title: "Mercado",
    amountInCents: 15_000,
    categoryId: "transport",
    accountId: "main",
    occurredAt: mercado.occurredAt,
  });
  const next = replaceUserTransaction([mercado], updated);
  const [main] = applyUserTransactionsToAccounts(seedAccounts, next ?? []);

  assert.equal(updated.id, "expense-100");
  assert.equal(updated.type, "expense");
  assert.equal(updated.amount.cents, -15_000);
  assert.equal(updated.categoryId, "transport");
  assert.equal(next?.length, 1);
  assert.equal(main?.balance.cents, 847_050);
});

test("editar receita aumenta o total só para o novo valor", () => {
  const freelance = incomeFromInput(
    {
      title: "Freelance",
      amountInCents: 100_000,
      accountId: "main",
      occurredAt: "2026-09-25T17:30:00.000Z",
    },
    "income-1000",
  );
  const updated = applyTransactionEdits(freelance, {
    title: "Freelance",
    amountInCents: 150_000,
    categoryId: "food",
    accountId: "main",
    occurredAt: freelance.occurredAt,
  });
  const next = replaceUserTransaction([freelance], updated);

  assert.equal(updated.id, "income-1000");
  assert.equal(updated.type, "income");
  assert.equal(updated.categoryId, "income");
  assert.equal(updated.amount.cents, 150_000);
  assert.equal(calculateIncome(next ?? []).cents, 150_000);
  assert.equal(applyUserTransactionsToAccounts(seedAccounts, next ?? [])[0]?.balance.cents, 1_012_050);
});

test("trocar a conta da despesa move o efeito entre as contas", () => {
  const moved = applyTransactionEdits(mercado, {
    title: "Mercado",
    amountInCents: 10_000,
    categoryId: "food",
    accountId: "reserve",
    occurredAt: mercado.occurredAt,
  });
  const [main, reserve] = applyUserTransactionsToAccounts(seedAccounts, [moved]);

  assert.equal(main?.balance.cents, 862_050);
  assert.equal(reserve?.balance.cents, 373_030);
});

test("edição persistida continua depois do restart", async () => {
  const updated = applyTransactionEdits(mercado, {
    title: "Mercado",
    amountInCents: 15_000,
    categoryId: "transport",
    accountId: "reserve",
    occurredAt: mercado.occurredAt,
  });
  const memory = new Map<string, string>();
  const storage = {
    async getItem(key: string) {
      return memory.get(key) ?? null;
    },
    async setItem(key: string, value: string) {
      memory.set(key, value);
    },
    async removeItem(key: string) {
      memory.delete(key);
    },
  };

  const repository = createTransactionRepository(storage);
  const created = await repository.create({
    title: mercado.title,
    categoryId: mercado.categoryId,
    accountId: mercado.accountId,
    amount: mercado.amount,
    occurredAt: mercado.occurredAt,
    type: mercado.type,
  });
  await repository.update({ ...updated, id: created.id });
  const restored = await createTransactionRepository(storage).list();

  assert.equal(restored[0]?.id, created.id);
  assert.equal(restored[0]?.amount.cents, -15_000);
  assert.equal(restored[0]?.accountId, "reserve");
  assert.equal(restored[0]?.categoryId, "transport");
});

test("excluir despesa local restaura o saldo da semente", () => {
  const next = removeUserTransaction([mercado], mercado.id);

  assert.equal(next?.length, 0);
  assert.equal(applyUserTransactionsToAccounts(seedAccounts, next ?? [])[0]?.balance.cents, 862_050);
});

test("exclusão persistida não reaparece depois do restart", async () => {
  const memory = new Map<string, string>();
  const storage = {
    async getItem(key: string) {
      return memory.get(key) ?? null;
    },
    async setItem(key: string, value: string) {
      memory.set(key, value);
    },
    async removeItem(key: string) {
      memory.delete(key);
    },
  };

  const repository = createTransactionRepository(storage);
  const created = await repository.create({
    title: mercado.title,
    categoryId: mercado.categoryId,
    accountId: mercado.accountId,
    amount: mercado.amount,
    occurredAt: mercado.occurredAt,
    type: mercado.type,
  });
  await repository.remove(created.id);
  const restored = await createTransactionRepository(storage).list();

  assert.deepEqual(restored, []);
});

test("create do adapter local gera id e não usa a lista montada pelo chamador", async () => {
  const memory = new Map<string, string>();
  const storage = {
    async getItem(key: string) {
      return memory.get(key) ?? null;
    },
    async setItem(key: string, value: string) {
      memory.set(key, value);
    },
    async removeItem(key: string) {
      memory.delete(key);
    },
  };
  const repository = createTransactionRepository(storage);
  const created = await repository.create(toCreateExpenseInput({
    title: "Mercado",
    amountInCents: 10_000,
    categoryId: "food",
    accountId: "main",
    occurredAt: mercado.occurredAt,
  }));

  assert.match(created.id, /^expense-/);
  assert.equal(created.amount.cents, -10_000);
  assert.equal((await repository.list()).length, 1);
});

test("semente não pode ser editada nem excluída da lista local", () => {
  assert.equal(replaceUserTransaction([mercado], { ...mercado, id: "market", amount: money(-15_000) }), null);
  assert.equal(removeUserTransaction([mercado], "market"), null);
});
