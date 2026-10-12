import assert from "node:assert/strict";
import { test } from "node:test";

import { DEFAULT_MONTHLY_BUDGET_CENTS } from "@/data/mock/budget";
import { createBudgetRepository } from "@/data/repositories/budget-repository";
import { money, type Transaction } from "@/domain/models";
import {
  applyUserTransactionsToAccounts,
  removeUserTransaction,
  replaceUserTransaction,
  toCreateExpenseInput,
  toCreateIncomeInput,
} from "@/features/finance/persistence/local-finance";
import { accounts as seedAccounts } from "@/data/mock/accounts";

import {
  buildBudgetSummary,
  calculateBudgetExceeded,
  calculateBudgetProgressRatio,
  calculateBudgetRemaining,
  calculateBudgetSpent,
  calculateBudgetStatus,
  calculateBudgetUtilization,
  formatBudgetPeriod,
  getCurrentBudgetPeriod,
  resolveEffectiveLimit,
  validateBudgetLimit,
} from "./budget-calculations";
import { upsertMonthlyBudget } from "../persistence/budget-mutations";
import { parseBudgets } from "@/data/repositories/stored-budgets";

function expense(id: string, cents: number, occurredAt: string): Transaction {
  return {
    id,
    title: id,
    categoryId: "food",
    accountId: "main",
    amount: money(-cents),
    occurredAt,
    type: "expense",
  };
}

function income(id: string, cents: number, occurredAt: string): Transaction {
  return {
    id,
    title: id,
    categoryId: "income",
    accountId: "main",
    amount: money(cents),
    occurredAt,
    type: "income",
  };
}

const septemberExpenses: Transaction[] = [
  expense("seed-1", 200_000, "2026-09-05T12:00:00.000Z"),
  expense("seed-2", 232_000, "2026-09-12T12:00:00.000Z"),
];

test("sem override usa o teto de demonstração", () => {
  const period = "2026-09";
  const spent = calculateBudgetSpent(septemberExpenses, period);
  const limit = resolveEffectiveLimit([], period);
  const summary = buildBudgetSummary(limit, spent, period);

  assert.equal(limit.cents, DEFAULT_MONTHLY_BUDGET_CENTS);
  assert.equal(spent.cents, 432_000);
  assert.equal(summary.available.cents, 198_000);
  assert.equal(summary.status, "within");
});

test("override persistido substitui o default do mês", () => {
  const period = "2026-09";
  const budgets = upsertMonthlyBudget([], period, 700_000, new Date("2026-09-20T12:00:00.000Z"));
  const limit = resolveEffectiveLimit(budgets, period);
  const spent = calculateBudgetSpent(septemberExpenses, period);
  const summary = buildBudgetSummary(limit, spent, period);

  assert.equal(limit.cents, 700_000);
  assert.equal(spent.cents, 432_000);
  assert.equal(summary.available.cents, 268_000);
});

test("receita não altera gasto nem disponível do orçamento", () => {
  const period = "2026-09";
  const withIncome = [...septemberExpenses, income("salary", 500_000, "2026-09-01T12:00:00.000Z")];
  const spent = calculateBudgetSpent(withIncome, period);
  const summary = buildBudgetSummary(money(630_000), spent, period);

  assert.equal(spent.cents, 432_000);
  assert.equal(summary.available.cents, 198_000);
});

test("contribuição de meta não entra no orçamento", () => {
  const period = "2026-09";
  const spent = calculateBudgetSpent(septemberExpenses, period);
  const contribution = { amount: money(100_000), goalId: "goal-1" };
  const summary = buildBudgetSummary(money(630_000), spent, period);

  assert.equal(contribution.amount.cents, 100_000);
  assert.equal(spent.cents, 432_000);
  assert.equal(summary.available.cents, 198_000);
});

test("nova despesa reduz o disponível", () => {
  const period = "2026-09";
  const after = [...septemberExpenses, expense("extra", 10_000, "2026-09-20T12:00:00.000Z")];
  const spent = calculateBudgetSpent(after, period);
  const summary = buildBudgetSummary(money(630_000), spent, period);

  assert.equal(spent.cents, 442_000);
  assert.equal(summary.available.cents, 188_000);
});

test("editar despesa substitui o valor no orçamento", () => {
  const created = { id: "local-100", ...toCreateExpenseInput({
      title: "Mercado",
      amountInCents: 10_000,
      categoryId: "food",
      accountId: "main",
      occurredAt: "2026-09-20T12:00:00.000Z",
    }) };
  const edited = { ...created, amount: money(-20_000) };
  const replaced = replaceUserTransaction([created], edited);
  const period = "2026-09";
  const spent = calculateBudgetSpent([...septemberExpenses, ...(replaced ?? [])], period);

  assert.equal(spent.cents, 452_000);
  assert.equal(calculateBudgetRemaining(money(630_000), spent).cents, 178_000);
});

test("excluir despesa devolve o disponível anterior", () => {
  const created = { id: "local-100", ...toCreateExpenseInput({
      title: "Mercado",
      amountInCents: 10_000,
      categoryId: "food",
      accountId: "main",
      occurredAt: "2026-09-20T12:00:00.000Z",
    }) };
  const afterDelete = removeUserTransaction([created], created.id);
  const period = "2026-09";
  const spent = calculateBudgetSpent([...septemberExpenses, ...(afterDelete ?? [])], period);

  assert.equal(spent.cents, 432_000);
  assert.equal(calculateBudgetRemaining(money(630_000), spent).cents, 198_000);
});

test("excesso zera o disponível e preserva a utilização real", () => {
  const spent = money(600_000);
  const limit = money(500_000);
  const summary = buildBudgetSummary(limit, spent, "2026-09");

  assert.equal(calculateBudgetRemaining(limit, spent).cents, 0);
  assert.equal(calculateBudgetExceeded(limit, spent).cents, 100_000);
  assert.equal(calculateBudgetUtilization(spent, limit), 1.2);
  assert.equal(calculateBudgetProgressRatio(spent, limit), 1);
  assert.equal(summary.status, "exceeded");
  assert.equal(calculateBudgetStatus(spent, limit), "exceeded");
});

test("orçamento menor que o gasto já realizado é válido", () => {
  const summary = buildBudgetSummary(money(300_000), money(432_000), "2026-09");

  assert.equal(validateBudgetLimit(300_000), null);
  assert.equal(summary.available.cents, 0);
  assert.equal(summary.exceeded.cents, 132_000);
  assert.equal(summary.utilization, 1.44);
});

test("não aceita orçamento zero ou negativo", () => {
  assert.equal(validateBudgetLimit(0), "Informe um valor maior que zero.");
  assert.equal(validateBudgetLimit(-100), "Informe um valor maior que zero.");
  assert.equal(validateBudgetLimit(1), null);
});

test("upsert do mesmo período atualiza um único registro", () => {
  const first = upsertMonthlyBudget([], "2026-09", 650_000, new Date("2026-09-10T12:00:00.000Z"));
  const second = upsertMonthlyBudget(first, "2026-09", 700_000, new Date("2026-09-11T12:00:00.000Z"));

  assert.equal(second.length, 1);
  assert.equal(second[0]?.limit.cents, 700_000);
  assert.equal(second[0]?.period, "2026-09");
});

test("períodos diferentes não se misturam", () => {
  const september = upsertMonthlyBudget([], "2026-09", 630_000, new Date("2026-09-01T12:00:00.000Z"));
  const both = upsertMonthlyBudget(september, "2026-10", 700_000, new Date("2026-10-01T12:00:00.000Z"));

  assert.equal(resolveEffectiveLimit(both, "2026-09").cents, 630_000);
  assert.equal(resolveEffectiveLimit(both, "2026-10").cents, 700_000);
  assert.equal(both.length, 2);
});

test("orçamento persistido sobrevive a um restart simulado", async () => {
  const memory = new Map<string, string>();
  const repository = createBudgetRepository({
    getItem: async (key) => memory.get(key) ?? null,
    setItem: async (key, value) => {
      memory.set(key, value);
    },
    removeItem: async (key) => {
      memory.delete(key);
    },
  });

  const saved = upsertMonthlyBudget([], "2026-09", 700_000, new Date("2026-09-20T12:00:00.000Z"));
  await repository.save({ budgets: saved });
  const reloaded = await repository.load();

  assert.equal(reloaded.budgets.length, 1);
  assert.equal(resolveEffectiveLimit(reloaded.budgets, "2026-09").cents, 700_000);
});

test("storage vazio ou inválido cai no default", () => {
  assert.equal(parseBudgets(null).budgets.length, 0);
  assert.equal(parseBudgets("{").budgets.length, 0);
  assert.equal(parseBudgets(JSON.stringify({ version: 2, budgets: [] })).budgets.length, 0);
  assert.equal(resolveEffectiveLimit(parseBudgets(null).budgets, "2026-09").cents, DEFAULT_MONTHLY_BUDGET_CENTS);
});

test("período usa o calendário local e formata em português", () => {
  assert.equal(getCurrentBudgetPeriod(new Date(2026, 8, 30, 23, 30)), "2026-09");
  assert.equal(formatBudgetPeriod("2026-09"), "Setembro de 2026");
});

test("configurar orçamento não altera saldo das contas", () => {
  const before = applyUserTransactionsToAccounts(seedAccounts, []);
  const afterIncome = applyUserTransactionsToAccounts(seedAccounts, [
    {
      id: "income-1000",
      ...toCreateIncomeInput({
        title: "Freelance",
        amountInCents: 100_000,
        accountId: "main",
        occurredAt: "2026-09-20T12:00:00.000Z",
      }),
    },
  ]);
  const budgets = upsertMonthlyBudget([], "2026-09", 700_000);

  assert.equal(before[0]?.balance.cents, seedAccounts[0]?.openingBalance.cents);
  assert.notEqual(afterIncome[0]?.balance.cents, before[0]?.balance.cents);
  assert.equal(resolveEffectiveLimit(budgets, "2026-09").cents, 700_000);
  assert.equal(applyUserTransactionsToAccounts(seedAccounts, [])[0]?.balance.cents, before[0]?.balance.cents);
});
