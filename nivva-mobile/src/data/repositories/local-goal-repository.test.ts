import assert from "node:assert/strict";
import { test } from "node:test";

import { money } from "@/domain/models";
import { applyUserTransactionsToAccounts } from "@/features/finance/persistence/local-finance";
import { calculateExpenses, calculateIncome } from "@/features/finance/calculations/calculations";
import { calculateBudgetRemaining, calculateBudgetSpent, getCurrentBudgetPeriod } from "@/features/budget/calculations/budget-calculations";

import { createLocalGoalRepository } from "./local-goal-repository";

function memoryStorage() {
  const values: Record<string, string> = {};
  return {
    async getItem(key: string) {
      return values[key] ?? null;
    },
    async setItem(key: string, value: string) {
      values[key] = value;
    },
    async removeItem(key: string) {
      delete values[key];
    },
  };
}

test("local create, contribute, complete, reopen e restart", async () => {
  const storage = memoryStorage();
  const repository = createLocalGoalRepository(storage);
  const created = await repository.create({ title: "Viagem", targetAmountInCents: 100_000, iconKey: "travel" });
  assert.match(created.goal.id, /^goal-/);
  assert.equal(created.status, "active");

  const contributed = await repository.contribute(created.goal.id, {
    amountInCents: 100_000,
    occurredAt: "2026-10-12T12:00:00.000Z",
  });
  assert.equal(contributed.snapshot.status, "completed");

  const reopened = await repository.update(created.goal.id, {
    title: "Viagem",
    targetAmountInCents: 150_000,
    iconKey: "travel",
  });
  assert.equal(reopened.status, "active");
  assert.equal(reopened.remainingAmount.cents, 50_000);

  const restored = createLocalGoalRepository(storage);
  const again = await restored.get(created.goal.id);
  assert.equal(again.goal.targetAmount.cents, 150_000);
  assert.equal(again.contributions.length, 1);
});

test("contribute local não altera Account, Transaction nem Budget", async () => {
  const accounts = [
    { id: "main", name: "Conta principal", type: "checking" as const, openingBalance: money(862_050) },
  ];
  const transactions: never[] = [];
  const beforeBalance = applyUserTransactionsToAccounts(accounts, transactions)[0]?.balance.cents;
  const beforeIncome = calculateIncome(transactions).cents;
  const beforeExpense = calculateExpenses(transactions).cents;
  const period = getCurrentBudgetPeriod();
  const beforeBudget = calculateBudgetRemaining(money(300_000), calculateBudgetSpent(transactions, period)).cents;

  const repository = createLocalGoalRepository(memoryStorage());
  const goal = await repository.create({ title: "Meta", targetAmountInCents: 50_000, iconKey: "other" });
  await repository.contribute(goal.goal.id, { amountInCents: 10_000, occurredAt: "2026-10-12T12:00:00.000Z" });

  assert.equal(applyUserTransactionsToAccounts(accounts, transactions)[0]?.balance.cents, beforeBalance);
  assert.equal(calculateIncome(transactions).cents, beforeIncome);
  assert.equal(calculateExpenses(transactions).cents, beforeExpense);
  assert.equal(calculateBudgetRemaining(money(300_000), calculateBudgetSpent(transactions, period)).cents, beforeBudget);
});
