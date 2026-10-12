import assert from "node:assert/strict";
import { test } from "node:test";

import { money, type Account, type Transaction } from "@/domain/models";

import {
  calculateAvailableBudget,
  calculateBudgetProgress,
  calculateExpenses,
  calculateExpensesByCategory,
  calculateIncome,
  calculateNetBalance,
  deriveAccountViews,
} from "./calculations";

const sample: Transaction[] = [
  {
    id: "income-1",
    title: "Salário",
    categoryId: "income",
    accountId: "main",
    amount: money(500_000),
    occurredAt: "2026-06-01T09:00:00",
    type: "income",
  },
  {
    id: "food-1",
    title: "Mercado",
    categoryId: "food",
    accountId: "main",
    amount: money(-20_000),
    occurredAt: "2026-06-12T14:00:00",
    type: "expense",
  },
  {
    id: "transport-1",
    title: "Transporte",
    categoryId: "transport",
    accountId: "main",
    amount: money(-10_000),
    occurredAt: "2026-06-11T08:00:00",
    type: "expense",
  },
];

test("total de receitas", () => {
  assert.equal(calculateIncome(sample).cents, 500_000);
});

test("total de despesas", () => {
  assert.equal(calculateExpenses(sample).cents, 30_000);
});

test("saldo líquido", () => {
  assert.equal(calculateNetBalance(sample).cents, 470_000);
});

test("progresso do orçamento", () => {
  const spent = calculateExpenses(sample);
  const total = money(100_000);

  assert.equal(calculateBudgetProgress(spent, total), 0.3);
  assert.equal(calculateAvailableBudget(spent, total).cents, 70_000);
});

test("current balance deriva opening + lançamentos e não persiste snapshot", () => {
  const account: Account = {
    id: "acc-1",
    name: "Nubank",
    type: "digital",
    openingBalance: money(100_000),
  };
  const views = deriveAccountViews([account], [
    { ...sample[0], accountId: "acc-1", amount: money(50_000), type: "income" },
    { ...sample[1], accountId: "acc-1", amount: money(-30_000) },
  ]);

  assert.equal(views[0]?.balance.cents, 120_000);
  assert.equal(account.openingBalance.cents, 100_000);

  const afterOpeningEdit = deriveAccountViews([{ ...account, openingBalance: money(200_000) }], [
    { ...sample[0], accountId: "acc-1", amount: money(50_000), type: "income" },
    { ...sample[1], accountId: "acc-1", amount: money(-30_000) },
  ]);
  assert.equal(afterOpeningEdit[0]?.balance.cents, 220_000);
});

test("gastos por categoria", () => {
  const grouped = calculateExpensesByCategory(sample, [
    { id: "food", name: "Alimentação", kind: "food", icon: "local-dining" },
    { id: "transport", name: "Transporte", kind: "transport", icon: "directions-bus" },
    { id: "home", name: "Moradia", kind: "home", icon: "home" },
  ]);

  assert.equal(grouped[0]?.name, "Alimentação");
  assert.equal(grouped[0]?.amount.cents, 20_000);
  assert.equal(grouped[0]?.percentage, 67);
  assert.equal(grouped[1]?.name, "Transporte");
  assert.equal(grouped[1]?.percentage, 33);
  assert.equal(grouped.some((item) => item.id === "home"), false);
});
