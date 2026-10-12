import assert from "node:assert/strict";
import { test } from "node:test";

import { money, type AccountView, type Category, type Transaction } from "@/domain/models";

import { buildAnalyticsSnapshot, buildHomeSnapshot } from "./snapshots";

const account: AccountView = {
  id: "acc-1",
  name: "Conta principal",
  type: "checking",
  typeLabel: "Corrente",
  openingBalance: money(0),
  balance: money(0),
};

const food: Category = {
  id: "food",
  name: "Alimentação",
  kind: "expense",
  icon: "restaurant",
};

function snapshotInput(transactions: Transaction[], copyMode: "demo" | "live") {
  return {
    transactions,
    accounts: [account],
    categories: [food],
    budgetLimitCents: 630_000,
    referenceDate: new Date(2026, 9, 12),
    copyMode,
  };
}

test("API sem lançamentos não inventa comparação nem insight", () => {
  const home = buildHomeSnapshot({ ...snapshotInput([], "live"), budgetLimitCents: null });

  assert.equal(home.balance.cents, 0);
  assert.equal(home.metrics[0]?.amount.cents, 0);
  assert.equal(home.metrics[1]?.amount.cents, 0);
  assert.equal(home.metrics.some((metric) => metric.kind === "available"), false);
  assert.equal(home.balanceVariationLabel, null);
  assert.equal(home.insight.kind, "empty");
  assert.equal(home.transactions.length, 0);
  assert.equal("profileInitials" in home, false);
});

test("modo demo preserva copy de demonstração", () => {
  const home = buildHomeSnapshot(snapshotInput([], "demo"));

  assert.equal(home.balanceVariationLabel, "2,4% este mês");
  assert.equal(home.insight.kind, "demo");
  assert.match(home.insight.message, /alimentação/);
});

test("Analytics sem mês anterior usa sem base anterior", () => {
  const analytics = buildAnalyticsSnapshot({ ...snapshotInput([], "live"), budgetLimitCents: null }, "month");

  assert.equal(analytics.totalExpenses.cents, 0);
  assert.equal(analytics.comparisonLabel, "sem base anterior");
  assert.equal(analytics.budget, null);
  assert.equal(analytics.categories.length, 0);
  assert.equal(analytics.chart.every((bar) => bar.ratio === 0), true);
});
