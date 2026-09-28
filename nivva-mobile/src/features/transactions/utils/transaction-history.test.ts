import assert from "node:assert/strict";
import { test } from "node:test";

import { money, type Category, type Transaction } from "@/domain/models";

import {
  filterTransactionsByCategory,
  filterTransactionsByType,
  formatDaySectionTitle,
  queryTransactions,
  searchTransactions,
  sortTransactionsByDate,
} from "./transaction-history";

const categories: Category[] = [
  { id: "food", name: "Alimentação", kind: "food", icon: "local-dining" },
  { id: "transport", name: "Transporte", kind: "transport", icon: "directions-bus" },
  { id: "income", name: "Receita", kind: "income", icon: "payments" },
];

const mercado: Transaction = {
  id: "market",
  title: "Mercado",
  categoryId: "food",
  accountId: "main",
  amount: money(-10_000),
  occurredAt: "2026-09-01T12:00:00.000Z",
  type: "expense",
};

const salario: Transaction = {
  id: "salary",
  title: "Salário",
  categoryId: "income",
  accountId: "main",
  amount: money(485_000),
  occurredAt: "2026-09-03T12:00:00.000Z",
  type: "income",
};

const uber: Transaction = {
  id: "uber",
  title: "Uber",
  categoryId: "transport",
  accountId: "main",
  amount: money(-5_000),
  occurredAt: "2026-09-02T12:00:00.000Z",
  type: "expense",
};

test("ordena transações da mais recente para a mais antiga", () => {
  const sorted = sortTransactionsByDate([mercado, salario, uber]);

  assert.deepEqual(
    sorted.map((transaction) => transaction.id),
    ["salary", "uber", "market"],
  );
  assert.equal(mercado.occurredAt, "2026-09-01T12:00:00.000Z");
});

test("filtra despesas e deixa as receitas de fora", () => {
  const expenses = filterTransactionsByType([mercado, salario, uber], "expense");

  assert.equal(expenses.length, 2);
  assert.equal(
    expenses.every((transaction) => transaction.type === "expense"),
    true,
  );
});

test("filtra por categoria estruturada", () => {
  const food = filterTransactionsByCategory([mercado, salario, uber], "food");

  assert.equal(food.length, 1);
  assert.equal(food[0]?.id, "market");
});

test("busca por título sem diferenciar maiúsculas", () => {
  const found = searchTransactions([mercado, uber], "mercado", categories);

  assert.equal(found.length, 1);
  assert.equal(found[0]?.title, "Mercado");
});

test("busca por categoria ignora acento", () => {
  const found = searchTransactions([mercado, uber], "alimentacao", categories);

  assert.equal(found.length, 1);
  assert.equal(found[0]?.title, "Mercado");
});

test("filtro e busca de receitas encontram a entrada pela categoria", () => {
  const incomes = filterTransactionsByType([mercado, salario, uber], "income");
  const byCategory = searchTransactions([mercado, salario, uber], "receita", categories);

  assert.equal(incomes.length, 1);
  assert.equal(incomes[0]?.title, "Salário");
  assert.equal(byCategory.length, 1);
  assert.equal(byCategory[0]?.id, "salary");
});

test("combina busca, tipo e categoria", () => {
  const result = queryTransactions({
    transactions: [mercado, salario, uber],
    categories,
    searchQuery: "merc",
    typeFilter: "expense",
    categoryId: "food",
  });

  assert.equal(result.filteredCount, 1);
  assert.equal(result.sections[0]?.data[0]?.id, "market");
  assert.equal(result.hasActiveFilters, true);
});

test("agrupa hoje, ontem e data de outro ano", () => {
  const reference = new Date(2026, 8, 25, 15, 0, 0);
  const today = localIso(2026, 8, 25);
  const yesterday = localIso(2026, 8, 24);
  const lastYear = localIso(2025, 11, 28);

  assert.equal(formatDaySectionTitle(new Date(today), reference), "Hoje");
  assert.equal(formatDaySectionTitle(new Date(yesterday), reference), "Ontem");
  assert.equal(formatDaySectionTitle(new Date(lastYear), reference).includes("2025"), true);
});

function localIso(year: number, month: number, day: number): string {
  return new Date(year, month, day, 12, 0, 0).toISOString();
}
